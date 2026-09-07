/**
 * Git Learning Lab — student self-registration (P4).
 *
 * REG-002 (locked rule): every account created through this route is
 * STUDENT, unconditionally — the literal string 'STUDENT' is hard-coded into
 * db.js's createStudentUser SQL text, and nothing in this handler ever reads
 * a `role` field from the request body, even to reject it. A forged
 * `role: "ADMIN"` in the request is simply never looked at (verified by
 * tests/worker-register.test.js's privilege-escalation test).
 *
 * All validation here is server-side (the frontend's own validation is a UX
 * convenience only, never trusted) — matching this project's existing
 * pattern in auth.js/admin.js. Every rejection is a generic error CODE (never
 * a raw D1/SQL error — SEC-005), translated to Thai by the frontend's i18n
 * table, same as every other auth screen in this app.
 */
import { json, safeError } from "../http.js";
import { derivePasswordHash, generateSessionToken, sha256Hex } from "../crypto.js";
import { getUserByIdentifier, getUserByStudentId, getUserByEmail, createStudentUser, createSession, writeAuditEvent } from "../db.js";
import { serializeSessionCookie, SESSION_MAX_AGE_SECONDS } from "../cookies.js";

// P14: audit writes are best-effort and must never block registration
// (docs/PROJECT_CONTEXT.md P14 report §7).
async function auditBestEffort(env, params) {
  try {
    await writeAuditEvent(env, params);
  } catch (err) {
    console.error("audit event write failed", params.eventType, err);
  }
}

// Exported: reused as-is by admin.js's staff-creation route (P11) so the
// identifier/email/name validation rules never drift between the two
// account-creation paths.
export const USERNAME_RE = /^[A-Za-z0-9_.-]{3,32}$/;
const STUDENT_ID_RE = /^[A-Za-z0-9-]{3,30}$/;
export const EMAIL_RE = /^[^\s@]+@rmutsb\.ac\.th$/i;
export const MAX_NAME_LENGTH = 100;

export async function handleRegister(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return safeError(400, "invalid_request");
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
  const studentId = typeof body.studentId === "string" ? body.studentId.trim() : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const email = emailRaw ? emailRaw.toLowerCase() : "";

  // Deliberately no read of body.role anywhere in this file — REG-002.

  if (!fullName || fullName.length > MAX_NAME_LENGTH) return safeError(400, "full_name_required");
  if (!USERNAME_RE.test(username)) return safeError(400, "invalid_username");
  if (!STUDENT_ID_RE.test(studentId)) return safeError(400, "invalid_student_id");
  if (password.length < 8) return safeError(400, "password_too_short");
  if (password !== confirmPassword) return safeError(400, "passwords_do_not_match");
  if (email && !EMAIL_RE.test(email)) return safeError(400, "invalid_email_domain");

  if (await getUserByIdentifier(env, username)) return safeError(409, "username_taken");
  if (await getUserByStudentId(env, studentId)) return safeError(409, "student_id_taken");
  if (email && (await getUserByEmail(env, email))) return safeError(409, "email_taken");

  const { hash, salt, iterations } = await derivePasswordHash(password);

  try {
    await createStudentUser(env, { identifier: username, fullName, studentId, email: email || null, hash, salt, iterations });
  } catch {
    // Two concurrent registrations raced past the checks above onto the same
    // unique column — D1/SQLite's own UNIQUE index is the real guarantee;
    // the pre-checks above just give a specific, friendly error in the
    // common (non-racing) case.
    return safeError(409, "registration_conflict");
  }

  const user = await getUserByIdentifier(env, username);

  // P14: self-registration has no separate "actor" distinct from the new
  // account itself — actor is deliberately null (a self-service action, not
  // an action performed BY someone ON someone else), and the new user is
  // recorded only as the target. This is the opposite convention from
  // admin.staff.created/admin.recovery.issued, where actor/target are always
  // two different people.
  await auditBestEffort(env, {
    eventType: "student.registered",
    actor: null,
    target: { id: user.id, identifier: user.identifier },
    metadata: null,
  });

  const token = generateSessionToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  await createSession(env, { tokenHash, userId: user.id, expiresAt });

  return json(
    { ok: true, user: { id: user.id, identifier: user.identifier, role: user.role, mustChangePassword: false } },
    201,
    { "Set-Cookie": serializeSessionCookie(token) }
  );
}
