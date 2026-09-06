-- Git Learning Lab — D1 migration 0004: P4 student self-registration columns.
--
-- Adds exactly what the Register flow (docs/REQUIREMENTS.md-style P4 scope)
-- needs — no speculative columns (Engineering skill §21 minimal-collection
-- discipline). All three are nullable because existing P1-P3 bootstrap
-- accounts (admin1/teacher1/student1) predate this column set and are never
-- backfilled.
--
--   users.full_name: display name collected at registration. Never used for
--     authentication (identifier remains the login key, unchanged).
--   users.student_id: unique per student, collected at registration
--     (REG-001). NULL for the pre-existing ADMIN/TEACHER bootstrap accounts.
--   users.email: optional at registration; when present it is restricted to
--     the @rmutsb.ac.th domain (enforced in worker/src/routes/register.js,
--     not here — SQLite CHECK constraints on ALTER TABLE ADD COLUMN cannot
--     reference the column being added in older SQLite versions, so domain
--     validation stays application-side alongside the rest of REG-xxx
--     validation).
--
-- Both new UNIQUE indexes rely on standard SQLite semantics: each NULL is
-- distinct from every other NULL for uniqueness purposes, so existing rows
-- with no student_id/email do not collide with each other or with future
-- registrations that also happen to omit email.

ALTER TABLE users ADD COLUMN full_name TEXT;
ALTER TABLE users ADD COLUMN student_id TEXT;
ALTER TABLE users ADD COLUMN email TEXT;

CREATE UNIQUE INDEX idx_users_student_id ON users(student_id);
CREATE UNIQUE INDEX idx_users_email ON users(email);
