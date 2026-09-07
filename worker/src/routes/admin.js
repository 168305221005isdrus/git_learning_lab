/**
 * Git Learning Lab — Admin routes (P2): ADMIN-001..003, RECOV-002, RECOV-006.
 *
 * ROLE-004/ROLE-005: restricted to the ADMIN role, resolved server-side from
 * the session — never from a client-supplied field. Every handler here
 * assumes the caller (worker/src/index.js) already verified sessionUser.role
 * === 'ADMIN' before dispatching.
 */
import { json, safeError } from "../http.js";
import { derivePasswordHash, randomHex } from "../crypto.js";
import { listUsers, getUserByIdentifier, getUserByEmail, setUserPassword, deleteAllSessionsForUser, createStaffUser } from "../db.js";
import { USERNAME_RE, EMAIL_RE, MAX_NAME_LENGTH } from "./register.js";

const RECOVERY_CREDENTIAL_TTL_HOURS = 24; // RECOV-004: bounded, documented duration

// P11: fixed allowlist for Admin-created staff accounts. Deliberately NOT
// "anything except STUDENT" — an unrecognized future role string must be
// rejected, not silently let through.
const STAFF_ROLES = new Set(["TEACHER", "ADMIN"]);

export async function handleListUsers(request, env) {
  // ADMIN-001: identifier + role only — never password/hash fields.
  const users = await listUsers(env);
  return json({ ok: true, users });
}

export async function handleIssueRecovery(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return safeError(400, "invalid_request");
  }
  const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
  if (!identifier) return safeError(400, "invalid_request");

  const user = await getUserByIdentifier(env, identifier);
  if (!user) return safeError(404, "user_not_found");

  // RECOV-002/RECOV-006: issuing a temporary credential never requires or
  // reveals the user's current password — a fresh random one is generated.
  const temporaryPassword = randomHex(6); // 12 hex characters, reasonably typeable
  const { hash, salt, iterations } = await derivePasswordHash(temporaryPassword);
  const expiresAt = new Date(Date.now() + RECOVERY_CREDENTIAL_TTL_HOURS * 3600 * 1000).toISOString();

  await setUserPassword(env, user.id, { hash, salt, iterations, mustChangePassword: true, recoveryExpiresAt: expiresAt });
  await deleteAllSessionsForUser(env, user.id); // any existing session is invalidated immediately

  return json({
    ok: true,
    identifier: user.identifier,
    temporaryPassword,
    expiresAt,
    note: "Relay this credential to the user out-of-band. It is shown once and is not recoverable after this response.",
  });
}

/**
 * P11 — Admin creates a TEACHER or ADMIN account (Owner Decision, dated
 * 2026-09-07). Public registration (register.js) always stays STUDENT-only —
 * this is a wholly separate route with its own fixed role allowlist, never a
 * generic "create any role" endpoint. The new account is issued a
 * Worker-generated temporary credential and reuses the exact same
 * must-change-password / recovery-expiry mechanism as Admin-issued password
 * recovery (RECOV-002..006) — first login forces a real password before any
 * other route is reachable (see worker/src/index.js's
 * ALLOWED_DURING_FORCED_CHANGE gate, unchanged by this route).
 */
export async function handleCreateStaff(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return safeError(400, "invalid_request");
  }

  const role = typeof body.role === "string" ? body.role : "";
  if (!STAFF_ROLES.has(role)) return safeError(400, "invalid_role");

  const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
  if (!USERNAME_RE.test(identifier)) return safeError(400, "invalid_username");

  const fullNameRaw = typeof body.fullName === "string" ? body.fullName.trim() : "";
  if (fullNameRaw.length > MAX_NAME_LENGTH) return safeError(400, "invalid_request");
  const fullName = fullNameRaw || null; // staff fullName is optional (unlike Student registration)

  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const email = emailRaw ? emailRaw.toLowerCase() : ""; // staff email is optional (P11 §13)
  if (email && !EMAIL_RE.test(email)) return safeError(400, "invalid_email_domain");

  if (await getUserByIdentifier(env, identifier)) return safeError(409, "username_taken");
  if (email && (await getUserByEmail(env, email))) return safeError(409, "email_taken");

  // Same Worker-generated random credential + PBKDF2 hashing pattern as
  // RECOV-002 above — no second password policy, no plaintext persistence.
  const temporaryPassword = randomHex(6);
  const { hash, salt, iterations } = await derivePasswordHash(temporaryPassword);
  const expiresAt = new Date(Date.now() + RECOVERY_CREDENTIAL_TTL_HOURS * 3600 * 1000).toISOString();

  try {
    await createStaffUser(env, { identifier, role, fullName, email: email || null, hash, salt, iterations, recoveryExpiresAt: expiresAt });
  } catch {
    // Two concurrent staff-creation requests racing onto the same unique
    // column — same pattern as register.js's own UNIQUE-index race handling.
    return safeError(409, "registration_conflict");
  }

  return json(
    { ok: true, identifier, role, temporaryPassword, expiresAt },
    201
  );
}
