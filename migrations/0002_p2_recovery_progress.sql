-- Git Learning Lab — D1 migration 0002: P2 auth/recovery/progress additions.
--
-- Adds exactly what P2's implemented features need (Engineering skill §21
-- / DATA-002 minimal-collection discipline) — no speculative columns.
--
--   users.recovery_expires_at: bounds how long an Admin-issued temporary
--     credential remains valid (RECOV-004). NULL for a normal password.
--     Checked at login time alongside must_change_password (already present
--     in 0001_init.sql). The temporary credential is also invalidated the
--     moment the forced password change succeeds (RECOV-005) — see
--     worker/src/routes/auth.js's change-password handler, which clears
--     both must_change_password and recovery_expires_at together.
--
--   progress: the minimal persistence P2 needs to prove one real learning
--     event survives sign-out/sign-in (PROG-001). One row per user per
--     module, upserted (never a blind insert) so a retried write cannot
--     duplicate or corrupt a result (PROG-002).

ALTER TABLE users ADD COLUMN recovery_expires_at TEXT;

CREATE TABLE progress (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  module_id   TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('started', 'completed')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, module_id)
);

CREATE INDEX idx_progress_user_id ON progress(user_id);
