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
