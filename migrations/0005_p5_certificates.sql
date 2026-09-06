-- Git Learning Lab — D1 migration 0005: P5 certificate issuance/verification.
--
-- Adds exactly what P5's certificate system needs (Engineering skill §21 /
-- DATA-002 minimal-collection discipline) — no audit log, no revocation
-- history, no per-issuance-attempt tracking beyond the one row a learner is
-- ever entitled to per course.
--
--   certificates: one row per (user_id, course_id) — UNIQUE(user_id,
--     course_id) is what makes issuance idempotent (worker/src/routes/
--     certificate.js re-fetches and returns the existing row instead of
--     erroring or creating a duplicate on a repeated issue request or a
--     concurrent double-submit race).
--
--   verification_id: a separate, unpredictable public identifier (128 bits
--     from the Worker's existing CSPRNG helper, worker/src/crypto.js's
--     randomHex — the same helper already used for session tokens, ADR-011)
--     used ONLY for public lookup (GET /api/certificate/verify?id=...).
--     UNIQUE and never derived from user_id/course_id/row id, so it cannot
--     be guessed or enumerated from those values, and the internal
--     auto-increment `id`/`user_id` are never returned by the public
--     verification endpoint.
--
--   learner_name: a snapshot of the user's display name AT ISSUANCE TIME
--     (users.full_name, falling back to the login identifier for the P1-P3
--     bootstrap accounts that predate full_name) — deliberately copied
--     rather than joined live, so a certificate's stated name stays fixed
--     even if the account's profile data changes later (a certificate is a
--     point-in-time record, not a live view).
--
--   status: 'active' | 'revoked'. No revocation UI exists yet in P5 (out of
--     scope — see docs/SCOPE.md's P5 boundaries), but the column exists so
--     public verification can already treat a non-'active' row as invalid
--     without a further schema change if revocation is ever added.

CREATE TABLE certificates (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  course_id        TEXT NOT NULL DEFAULT 'git-learning-lab',
  verification_id  TEXT NOT NULL,
  learner_name     TEXT NOT NULL,
  issued_at        TEXT NOT NULL DEFAULT (datetime('now')),
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  UNIQUE(user_id, course_id),
  UNIQUE(verification_id)
);

CREATE INDEX idx_certificates_user_id ON certificates(user_id);
