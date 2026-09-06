-- Git Learning Lab — D1 migration 0001: minimal foundation schema.
--
-- P1 scope only: proves the migration mechanism is real and reproducible
-- (docs/REQUIREMENTS.md DATA-003). This is deliberately NOT the full schema —
-- lesson/quiz/challenge-result tables are added in P2 once those features are
-- implemented (Engineering skill §21 scope discipline: don't build ahead of
-- need).
--
-- Design choices trace directly to locked ADRs:
--   - users.role is a plain TEXT check constraint (ADR-007: three roles only,
--     no general RBAC table).
--   - password_hash/salt/iterations are stored per-user for upgradeable KDF
--     tuning (ADR-012).
--   - sessions stores a HASH of the session token, never the raw token
--     (ADR-011) — deleting a row is how invalidation (AUTH-005, RECOV-005)
--     is implemented.

CREATE TABLE users (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier          TEXT NOT NULL UNIQUE,
  role                TEXT NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')),
  password_hash       TEXT NOT NULL,
  password_salt       TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  must_change_password INTEGER NOT NULL DEFAULT 0, -- set by RECOV-002/003
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash  TEXT NOT NULL UNIQUE,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
