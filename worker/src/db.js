/**
 * Git Learning Lab — D1 query helpers (P2).
 *
 * Every read/write to D1 goes through this file — never inline SQL scattered
 * across route handlers — so the schema's invariants (Engineering skill §14)
 * are enforced in one place. All queries are parameterized; no learner/admin
 * input is ever interpolated into SQL text (SQL-injection prevention, in
 * addition to the OWASP baseline in Engineering skill §17).
 */

export async function getUserByIdentifier(env, identifier) {
  return env.DB.prepare("SELECT * FROM users WHERE identifier = ?").bind(identifier).first();
}

export async function getUserById(env, id) {
  return env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
}

export async function getUserByStudentId(env, studentId) {
  return env.DB.prepare("SELECT * FROM users WHERE student_id = ?").bind(studentId).first();
}

export async function getUserByEmail(env, email) {
  return env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
}

export async function listUsers(env) {
  const { results } = await env.DB.prepare("SELECT id, identifier, role, created_at FROM users ORDER BY id").all();
  return results;
}

export async function createUser(env, { identifier, role, hash, salt, iterations, mustChangePassword = 0 }) {
  return env.DB.prepare(
    "INSERT INTO users (identifier, role, password_hash, password_salt, password_iterations, must_change_password) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(identifier, role, hash, salt, iterations, mustChangePassword)
    .run();
}

// P4: self-registration always creates a STUDENT (REG-002) — role is not a
// parameter here on purpose, so no caller of this specific function can ever
// create a privileged account by accident.
export async function createStudentUser(env, { identifier, fullName, studentId, email, hash, salt, iterations }) {
  return env.DB.prepare(
    `INSERT INTO users
       (identifier, role, password_hash, password_salt, password_iterations, must_change_password, full_name, student_id, email)
     VALUES (?, 'STUDENT', ?, ?, ?, 0, ?, ?, ?)`
  )
    .bind(identifier, hash, salt, iterations, fullName, studentId, email || null)
    .run();
}

export async function setUserPassword(env, userId, { hash, salt, iterations, mustChangePassword, recoveryExpiresAt }) {
  return env.DB.prepare(
    "UPDATE users SET password_hash = ?, password_salt = ?, password_iterations = ?, must_change_password = ?, recovery_expires_at = ? WHERE id = ?"
  )
    .bind(hash, salt, iterations, mustChangePassword ? 1 : 0, recoveryExpiresAt || null, userId)
    .run();
}

export async function createSession(env, { tokenHash, userId, expiresAt }) {
  return env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(tokenHash, userId, expiresAt)
    .run();
}

export async function getSessionWithUser(env, tokenHash) {
  return env.DB.prepare(
    `SELECT s.token_hash, s.expires_at, u.*
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?`
  )
    .bind(tokenHash)
    .first();
}

export async function deleteSession(env, tokenHash) {
  return env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}

export async function deleteAllSessionsForUser(env, userId) {
  return env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
}

export async function upsertProgress(env, userId, moduleId, status) {
  return env.DB.prepare(
    `INSERT INTO progress (user_id, module_id, status, updated_at) VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, module_id) DO UPDATE SET
       status = excluded.status,
       updated_at = excluded.updated_at
     WHERE excluded.status = 'completed' OR progress.status != 'completed'`
  )
    .bind(userId, moduleId, status)
    .run();
}

export async function getProgressForUser(env, userId) {
  const { results } = await env.DB.prepare("SELECT module_id, status, updated_at FROM progress WHERE user_id = ?")
    .bind(userId)
    .all();
  return results;
}

// ---- P3: quiz results (QUIZ-002/003) --------------------------------------

export async function upsertQuizResult(env, userId, quizId, { correctCount, total, percent }) {
  return env.DB.prepare(
    `INSERT INTO quiz_results (user_id, quiz_id, correct_count, total, percent, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, quiz_id) DO UPDATE SET
       correct_count = excluded.correct_count,
       total = excluded.total,
       percent = excluded.percent,
       updated_at = excluded.updated_at`
  )
    .bind(userId, quizId, correctCount, total, percent)
    .run();
}

export async function getQuizResultsForUser(env, userId) {
  const { results } = await env.DB.prepare(
    "SELECT quiz_id, correct_count, total, percent, updated_at FROM quiz_results WHERE user_id = ?"
  )
    .bind(userId)
    .all();
  return results;
}

// ---- P3: challenge results (CHAL-002, ADR-013) -----------------------------

export async function upsertChallengeResult(env, userId, challengeId, passed) {
  // Idempotent upsert that never downgrades an already-earned pass back to a
  // fail on a later retry (same pattern as progress's 0002 upsert).
  return env.DB.prepare(
    `INSERT INTO challenge_results (user_id, challenge_id, passed, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, challenge_id) DO UPDATE SET
       passed = excluded.passed,
       updated_at = excluded.updated_at
     WHERE excluded.passed = 1 OR challenge_results.passed != 1`
  )
    .bind(userId, challengeId, passed ? 1 : 0)
    .run();
}

export async function getChallengeResultsForUser(env, userId) {
  const { results } = await env.DB.prepare(
    "SELECT challenge_id, passed, updated_at FROM challenge_results WHERE user_id = ?"
  )
    .bind(userId)
    .all();
  return results;
}

// ---- P5: certificates (course completion / issuance / public verification) --

export async function getCertificateForUser(env, userId, courseId) {
  return env.DB.prepare("SELECT * FROM certificates WHERE user_id = ? AND course_id = ?")
    .bind(userId, courseId)
    .first();
}

export async function getCertificateByVerificationId(env, verificationId) {
  return env.DB.prepare("SELECT * FROM certificates WHERE verification_id = ?").bind(verificationId).first();
}

// Idempotent issuance relies on the UNIQUE(user_id, course_id) index in
// migrations/0005_p5_certificates.sql — a concurrent double-submit races
// onto that same row and the second INSERT throws, which the caller
// (worker/src/routes/certificate.js) handles by re-fetching the existing
// row rather than creating a duplicate (same pattern as register.js's own
// UNIQUE-index race handling).
export async function createCertificate(env, { userId, courseId, verificationId, learnerName }) {
  return env.DB.prepare(
    "INSERT INTO certificates (user_id, course_id, verification_id, learner_name) VALUES (?, ?, ?, ?)"
  )
    .bind(userId, courseId, verificationId, learnerName)
    .run();
}
