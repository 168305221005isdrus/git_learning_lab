/**
 * Git Learning Lab — certificate issuance and public verification (P5).
 *
 * Threat model this file is specifically written against (P5 spec §6):
 *   - unauthenticated issuance: POST /api/certificate/issue requires a
 *     resolved session (enforced in worker/src/index.js, same as every
 *     other non-GET data route) before this handler is even reached.
 *   - a STUDENT not yet complete tries to issue: handleIssueCertificate
 *     recomputes completion server-side via computeCompletionForUser
 *     (shared/completion.js, fed only by this user's own D1 rows) and
 *     rejects with 403 if `isComplete` is false.
 *   - forged completed=true / forged final state: this handler never reads
 *     ANY field from the request body — there is nothing for a learner to
 *     forge. Issuance takes no input at all beyond the authenticated
 *     session.
 *   - forged user id / issuing for another user: every DB read/write here
 *     is keyed by sessionUser.id, resolved server-side from the session
 *     (AUTH-004/ROLE-005) — there is no userId parameter this API accepts.
 *   - repeated issue requests / a race between two concurrent requests:
 *     idempotent by construction — UNIQUE(user_id, course_id) in
 *     migrations/0005_p5_certificates.sql, checked-then-inserted, with the
 *     insert's own UNIQUE-index violation as the race's true guarantee (the
 *     pre-check is just the friendly non-racing path, same pattern as
 *     register.js).
 *   - certificate ID guessing/enumeration: the public verification id is
 *     128 bits of CSPRNG output (worker/src/crypto.js randomHex, the same
 *     helper already used for session tokens under ADR-011) — not derived
 *     from the row's auto-increment id or the user's id, and never
 *     sequential.
 *   - verification of invalid/nonexistent ids: handleVerifyCertificate
 *     always returns the same shape/200 status for "malformed", "well
 *     formed but unknown", and "known but not active" — {ok:true,
 *     valid:false} — so there is no distinguishing oracle to probe.
 *   - privilege escalation: only sessionUser.role === "STUDENT" may issue
 *     or read their own certificate (P5 spec §3: "certificates issued only
 *     to authenticated STUDENT users") — a Teacher/Admin session gets a
 *     clear 403, never a certificate.
 */
import { json, safeError } from "../http.js";
import { randomHex } from "../crypto.js";
import { getUserById, getCertificateForUser, createCertificate, getCertificateByVerificationId } from "../db.js";
import { computeCompletionForUser } from "./completion.js";

export const COURSE_ID = "git-learning-lab";
export const COURSE_NAME = "Git Learning Lab";

function toOwnerView(cert) {
  return {
    verificationId: cert.verification_id,
    learnerName: cert.learner_name,
    courseName: COURSE_NAME,
    issuedAt: cert.issued_at,
    status: cert.status,
  };
}

export async function handleGetMyCertificate(request, env, sessionUser) {
  if (sessionUser.role !== "STUDENT") return json({ ok: true, certificate: null });
  const cert = await getCertificateForUser(env, sessionUser.id, COURSE_ID);
  return json({ ok: true, certificate: cert ? toOwnerView(cert) : null });
}

export async function handleIssueCertificate(request, env, sessionUser) {
  // P5 spec §3: STUDENT only. A Teacher/Admin session is rejected before any
  // completion check runs — there is no "complete the course as Teacher"
  // concept in this product (ROLE-003's Teacher-uses-student-experience
  // clause does not extend to certificate eligibility).
  if (sessionUser.role !== "STUDENT") return safeError(403, "certificates_student_only");

  // Idempotency: a repeat request (deliberate retry, double-click, or a
  // genuine race with another concurrent request from the same account)
  // returns the SAME certificate rather than erroring or duplicating.
  const existing = await getCertificateForUser(env, sessionUser.id, COURSE_ID);
  if (existing) return json({ ok: true, certificate: toOwnerView(existing) });

  // Deliberately no read of request.json() anywhere in this function — there
  // is no `completed`/`passed`/name field a client could forge, because
  // none is ever accepted. Completion is derived fresh, here, from this
  // user's own persisted D1 rows only.
  const completion = await computeCompletionForUser(env, sessionUser.id);
  if (!completion.isComplete) return safeError(403, "course_not_complete");

  const user = await getUserById(env, sessionUser.id);
  const learnerName = (user && user.full_name) || sessionUser.identifier;
  const verificationId = randomHex(16); // 128 bits, CSPRNG (ADR-011's own helper)

  try {
    await createCertificate(env, { userId: sessionUser.id, courseId: COURSE_ID, verificationId, learnerName });
  } catch {
    // UNIQUE(user_id, course_id) fired — a concurrent request already
    // created it between our pre-check and this insert. Re-fetch and return
    // that row instead of failing the learner's request.
    const raced = await getCertificateForUser(env, sessionUser.id, COURSE_ID);
    if (raced) return json({ ok: true, certificate: toOwnerView(raced) });
    return safeError(500, "internal_error");
  }

  const created = await getCertificateForUser(env, sessionUser.id, COURSE_ID);
  return json({ ok: true, certificate: toOwnerView(created) }, 201);
}

const VERIFICATION_ID_RE = /^[a-f0-9]{32}$/;

export async function handleVerifyCertificate(request, env) {
  const url = new URL(request.url);
  const verificationId = (url.searchParams.get("id") || "").trim().toLowerCase();

  // Same generic {valid:false} shape for "malformed", "well-formed but
  // unknown", and "known but revoked" — no response-shape oracle for an
  // enumeration attempt to exploit (P5 spec §5/§6).
  if (!VERIFICATION_ID_RE.test(verificationId)) return json({ ok: true, valid: false });

  const cert = await getCertificateByVerificationId(env, verificationId);
  if (!cert || cert.status !== "active") return json({ ok: true, valid: false });

  // Public view is deliberately minimal (P5 spec §5): learner name, course
  // name, issue date, certificate id, valid status. No username, email,
  // student id, internal user/row id, progress, quiz scores, or challenge
  // transcripts — those simply never enter this object.
  return json({
    ok: true,
    valid: true,
    certificate: {
      learnerName: cert.learner_name,
      courseName: COURSE_NAME,
      issuedAt: cert.issued_at,
      verificationId: cert.verification_id,
    },
  });
}
