-- Git Learning Lab — D1 migration 0006: P14 application audit log & security
-- events.
--
-- A BOUNDED APPLICATION audit log for operational/security traceability of
-- privileged/security-relevant events (Admin staff creation, Admin recovery
-- issuance, student registration, login success/failure, password change,
-- logout). This is NOT a generic analytics/event-tracking system, NOT an
-- HTTP access-log replacement, NOT a full observability platform, NOT a
-- SIEM, and NOT a substitute for any statutory computer-traffic-data
-- retention requirement — see docs/PROJECT_CONTEXT.md's P14 report for the
-- full disclaimer. Do not treat this table as legal-compliance evidence
-- without separate, official legal research.
--
-- DATA-002 minimal-collection discipline applies, same as every prior
-- migration: this table NEVER stores a plaintext password, temporary
-- credential, password hash/salt, session token, raw cookie, recovery
-- credential, full request body, or IP address. `metadata_json` holds only a
-- small, fixed-shape, server-generated object per event type (see
-- worker/src/db.js's AUDIT_EVENT_TYPES/writeAuditEvent) — never a raw
-- client-supplied body.
--
--   event_type: one of a small fixed allowlist enforced in worker/src/db.js,
--     not a CHECK constraint here — the allowlist may grow in a later phase
--     without a schema migration, but every write is still validated
--     server-side before the INSERT.
--   actor_user_id / actor_identifier / actor_role: who performed the
--     action. All nullable — a failed login with an unknown identifier, or a
--     self-service student registration, has no resolved acting user.
--     actor_identifier/actor_role are SNAPSHOTS taken at write time (not a
--     live join to users), so a later identifier/role change never rewrites
--     history — same "snapshot, not live view" rationale as
--     certificates.learner_name in migration 0005.
--   target_user_id / target_identifier: who/what the action was performed
--     on, same snapshot-not-live-join rationale. Nullable for events with no
--     meaningful target (e.g. a plain logout).
--   metadata_json: small, bounded, server-generated JSON only. Nullable.
--   created_at: append-only, indexed for the admin-only newest-first list.
--
-- No retention/deletion automation is added here (a future Owner Decision is
-- required before any is built) — events accumulate indefinitely at
-- classroom scale. No historical events are backfilled — the table begins
-- empty; audit logging starts from this migration's deployment onward.

CREATE TABLE audit_events (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type        TEXT NOT NULL,
  actor_user_id     INTEGER REFERENCES users(id),
  actor_identifier  TEXT,
  actor_role        TEXT,
  target_user_id    INTEGER REFERENCES users(id),
  target_identifier TEXT,
  metadata_json     TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_events_created_at ON audit_events(created_at);
CREATE INDEX idx_audit_events_event_type ON audit_events(event_type);
