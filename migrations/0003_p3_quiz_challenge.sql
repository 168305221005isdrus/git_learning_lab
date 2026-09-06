-- Git Learning Lab — D1 migration 0003: P3 quiz/challenge result persistence.
--
-- Adds exactly what P3's quiz and challenge systems need (Engineering skill
-- §21 / DATA-002 minimal-collection discipline) — no per-question answer
-- history, no per-attempt audit log, no analytics beyond what PROG-003-style
-- "what's my status" views need.
--
--   quiz_results: one row per (user, quiz), holding only the LATEST scored
--     attempt (correct_count/total/percent) — a retake overwrites the prior
--     result (QUIZ system explicitly supports retaking; there is no
--     "keep best score" requirement in docs/REQUIREMENTS.md). Always
--     server-computed by worker/src/routes/quiz.js from shared/quiz-data.js's
--     answer key — never a client-reported score (QUIZ-002).
--
--   challenge_results: one row per (user, challenge), holding only the
--     latest pass/fail outcome. Mirrors progress's idempotent-upsert pattern
--     (0002's ON CONFLICT guard): a later attempt can never downgrade an
--     already-earned pass back to a fail, matching PROG-002's "cannot
--     downgrade completed" rule applied to challenges. Always computed by
--     worker/src/routes/challenge.js by replaying the submitted transcript
--     through shared/simulator-core.js against shared/challenges.js's
--     authoritative starting state (ADR-013) — never a client-reported
--     passed/completed flag (CHAL-002).

CREATE TABLE quiz_results (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  quiz_id       TEXT NOT NULL,
  correct_count INTEGER NOT NULL,
  total         INTEGER NOT NULL,
  percent       INTEGER NOT NULL,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, quiz_id)
);

CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);

CREATE TABLE challenge_results (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  challenge_id  TEXT NOT NULL,
  passed        INTEGER NOT NULL CHECK (passed IN (0, 1)),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_challenge_results_user_id ON challenge_results(user_id);
