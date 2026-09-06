// Minimal in-memory fake of the subset of Cloudflare D1's API that
// worker/src/db.js actually uses (.prepare().bind().first()/.all()/.run()).
// Test-only — never shipped, never imported by production code. This lets
// the P2 auth/session/recovery/progress route logic run under plain
// `node:test` (ADR-014: no Jest/Vitest/vitest-pool-workers dependency) while
// still exercising the real worker/src/*.js files unmodified.
//
// Matches queries by a distinctive substring rather than exact text, so
// db.js's SQL formatting can change without this fake needing a rewrite.

export function createFakeD1() {
  let nextUserId = 1;
  let nextSessionId = 1;
  let nextProgressId = 1;
  let nextQuizResultId = 1;
  let nextChallengeResultId = 1;
  const users = [];
  const sessions = [];
  const progress = [];
  const quizResults = [];
  const challengeResults = [];

  function statement(sql, params) {
    return {
      bind(...boundParams) {
        return statement(sql, boundParams);
      },
      async first() {
        return execFirst(sql, params);
      },
      async all() {
        return { results: execAll(sql, params) };
      },
      async run() {
        return execRun(sql, params);
      },
    };
  }

  function prepare(sql) {
    return statement(sql, []); // D1 allows calling first()/all()/run() with no .bind() at all
  }

  function execFirst(sql, params) {
    if (sql.includes("FROM users WHERE identifier")) {
      return users.find((u) => u.identifier === params[0]) || null;
    }
    if (sql.includes("FROM users WHERE id")) {
      return users.find((u) => u.id === params[0]) || null;
    }
    if (sql.includes("FROM sessions s JOIN users u")) {
      const session = sessions.find((s) => s.token_hash === params[0]);
      if (!session) return null;
      const user = users.find((u) => u.id === session.user_id);
      if (!user) return null;
      return { token_hash: session.token_hash, expires_at: session.expires_at, ...user };
    }
    throw new Error(`fake-d1: unhandled first() query: ${sql}`);
  }

  function execAll(sql, params) {
    if (sql.includes("SELECT id, identifier, role, created_at FROM users")) {
      return users
        .slice()
        .sort((a, b) => a.id - b.id)
        .map((u) => ({ id: u.id, identifier: u.identifier, role: u.role, created_at: u.created_at }));
    }
    if (sql.includes("FROM progress WHERE user_id")) {
      return progress
        .filter((p) => p.user_id === params[0])
        .map((p) => ({ module_id: p.module_id, status: p.status, updated_at: p.updated_at }));
    }
    if (sql.includes("FROM quiz_results WHERE user_id")) {
      return quizResults
        .filter((q) => q.user_id === params[0])
        .map((q) => ({ quiz_id: q.quiz_id, correct_count: q.correct_count, total: q.total, percent: q.percent, updated_at: q.updated_at }));
    }
    if (sql.includes("FROM challenge_results WHERE user_id")) {
      return challengeResults
        .filter((c) => c.user_id === params[0])
        .map((c) => ({ challenge_id: c.challenge_id, passed: c.passed, updated_at: c.updated_at }));
    }
    throw new Error(`fake-d1: unhandled all() query: ${sql}`);
  }

  function execRun(sql, params) {
    if (sql.includes("INSERT INTO users")) {
      const [identifier, role, password_hash, password_salt, password_iterations, must_change_password] = params;
      if (users.some((u) => u.identifier === identifier)) {
        throw new Error("UNIQUE constraint failed: users.identifier");
      }
      users.push({
        id: nextUserId++,
        identifier,
        role,
        password_hash,
        password_salt,
        password_iterations,
        must_change_password: must_change_password ? 1 : 0,
        recovery_expires_at: null,
        created_at: new Date().toISOString(),
      });
      return { success: true, meta: { last_row_id: nextUserId - 1 } };
    }
    if (sql.includes("UPDATE users SET password_hash")) {
      const [hash, salt, iterations, mustChange, recoveryExpiresAt, userId] = params;
      const user = users.find((u) => u.id === userId);
      if (user) {
        user.password_hash = hash;
        user.password_salt = salt;
        user.password_iterations = iterations;
        user.must_change_password = mustChange ? 1 : 0;
        user.recovery_expires_at = recoveryExpiresAt;
      }
      return { success: true };
    }
    if (sql.includes("INSERT INTO sessions")) {
      const [token_hash, user_id, expires_at] = params;
      sessions.push({ id: nextSessionId++, token_hash, user_id, expires_at });
      return { success: true };
    }
    if (sql.includes("DELETE FROM sessions WHERE token_hash")) {
      const idx = sessions.findIndex((s) => s.token_hash === params[0]);
      if (idx !== -1) sessions.splice(idx, 1);
      return { success: true };
    }
    if (sql.includes("DELETE FROM sessions WHERE user_id")) {
      for (let i = sessions.length - 1; i >= 0; i--) {
        if (sessions[i].user_id === params[0]) sessions.splice(i, 1);
      }
      return { success: true };
    }
    if (sql.includes("INSERT INTO progress")) {
      const [user_id, module_id, status] = params;
      const existing = progress.find((p) => p.user_id === user_id && p.module_id === module_id);
      const now = new Date().toISOString();
      if (!existing) {
        progress.push({ id: nextProgressId++, user_id, module_id, status, updated_at: now });
      } else if (status === "completed" || existing.status !== "completed") {
        existing.status = status;
        existing.updated_at = now;
      }
      return { success: true };
    }
    if (sql.includes("INSERT INTO quiz_results")) {
      const [user_id, quiz_id, correct_count, total, percent] = params;
      const existing = quizResults.find((q) => q.user_id === user_id && q.quiz_id === quiz_id);
      const now = new Date().toISOString();
      if (!existing) {
        quizResults.push({ id: nextQuizResultId++, user_id, quiz_id, correct_count, total, percent, updated_at: now });
      } else {
        existing.correct_count = correct_count;
        existing.total = total;
        existing.percent = percent;
        existing.updated_at = now;
      }
      return { success: true };
    }
    if (sql.includes("INSERT INTO challenge_results")) {
      const [user_id, challenge_id, passed] = params;
      const existing = challengeResults.find((c) => c.user_id === user_id && c.challenge_id === challenge_id);
      const now = new Date().toISOString();
      if (!existing) {
        challengeResults.push({ id: nextChallengeResultId++, user_id, challenge_id, passed, updated_at: now });
      } else if (passed === 1 || existing.passed !== 1) {
        existing.passed = passed;
        existing.updated_at = now;
      }
      return { success: true };
    }
    throw new Error(`fake-d1: unhandled run() query: ${sql}`);
  }

  return {
    DB: { prepare },
    _inspect: { users, sessions, progress, quizResults, challengeResults },
  };
}
