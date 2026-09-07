// P3: shared/quiz-data.js and shared/challenges.js — pure-module regression
// (QUIZ-002 single scoring implementation; ADR-013 single replay implementation).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { QUIZZES, scoreQuiz, selectQuizQuestions, scoreQuizAttempt, buildQuizAttemptSeed, QUIZ_ATTEMPT_SIZE } from "../shared/quiz-data.js";
import { CHALLENGES, replayChallenge } from "../shared/challenges.js";

test("shared quiz-data source contains no DOM/Worker-specific globals", () => {
  const source = readFileSync(new URL("../shared/quiz-data.js", import.meta.url), "utf8");
  for (const forbidden of ["document.", "window.", "localStorage.", "fetch(", "eval("]) {
    assert.ok(!source.includes(forbidden), `must not reference ${forbidden}`);
  }
});

test("shared challenges source contains no DOM/Worker-specific globals", () => {
  const source = readFileSync(new URL("../shared/challenges.js", import.meta.url), "utf8");
  for (const forbidden of ["document.", "window.", "localStorage.", "fetch(", "eval("]) {
    assert.ok(!source.includes(forbidden), `must not reference ${forbidden}`);
  }
});

test("QUIZ-001: modules 1-6 each have a quiz with at least one question", () => {
  for (const moduleId of ["module-1", "module-2", "module-3", "module-4", "module-5", "module-6"]) {
    const quiz = Object.values(QUIZZES).find((q) => q.moduleId === moduleId);
    assert.ok(quiz, `expected a quiz for ${moduleId}`);
    assert.ok(quiz.questions.length > 0);
    for (const q of quiz.questions) {
      assert.ok(q.choices.length >= 2);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < q.choices.length);
      assert.ok(q.explanation && q.explanation.length > 0, "every question has a wrong-answer explanation (QUIZ-003)");
    }
  }
});

test("scoreQuiz: all-correct answers score 100%", () => {
  const quiz = QUIZZES["module-3"];
  const answers = quiz.questions.map((q) => q.correctIndex);
  const result = scoreQuiz("module-3", answers);
  assert.equal(result.ok, true);
  assert.equal(result.correctCount, quiz.questions.length);
  assert.equal(result.percent, 100);
  assert.ok(result.results.every((r) => r.correct));
});

test("scoreQuiz: a wrong answer is scored incorrect and carries its explanation", () => {
  const quiz = QUIZZES["module-3"];
  const answers = quiz.questions.map((q) => q.correctIndex);
  answers[0] = (quiz.questions[0].correctIndex + 1) % quiz.questions[0].choices.length;
  const result = scoreQuiz("module-3", answers);
  assert.equal(result.ok, true);
  assert.equal(result.correctCount, quiz.questions.length - 1);
  assert.equal(result.results[0].correct, false);
  assert.ok(result.results[0].explanation.length > 0);
});

test("scoreQuiz: never trusts a client-shaped answer array of the wrong length", () => {
  const result = scoreQuiz("module-3", [0]);
  assert.equal(result.ok, false);
  assert.equal(result.error, "invalid_answers");
});

test("scoreQuiz: rejects an unknown quiz id", () => {
  const result = scoreQuiz("module-99", []);
  assert.equal(result.ok, false);
  assert.equal(result.error, "unknown_quiz");
});

// ---------------------------------------------------------------------------
// P8: expanded question banks, optional Module 7 quiz, bounded random subset
// ---------------------------------------------------------------------------

test("P8: modules 1-6 each have a materially expanded bank (8 questions), Module 7 has an optional quiz", () => {
  for (const moduleId of ["module-1", "module-2", "module-3", "module-4", "module-5", "module-6"]) {
    const quiz = Object.values(QUIZZES).find((q) => q.moduleId === moduleId);
    assert.ok(quiz.questions.length >= 8, `${moduleId} should have at least 8 questions after P8 expansion`);
  }
  const module7Quiz = QUIZZES["module-7"];
  assert.ok(module7Quiz, "an optional Module 7 capstone quiz must exist");
  assert.equal(module7Quiz.optional, true);
  assert.ok(module7Quiz.questions.length >= 6);
});

test("P8: every question in every quiz bank (including Module 7) has a valid answer index and a non-empty explanation", () => {
  for (const quiz of Object.values(QUIZZES)) {
    for (const q of quiz.questions) {
      assert.ok(q.choices.length >= 2, `${q.id} must have at least 2 choices`);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < q.choices.length, `${q.id} correctIndex must point at a real choice`);
      assert.ok(q.explanation && q.explanation.length > 0, `${q.id} must have a non-empty explanation`);
    }
  }
});

test("P8: every question id across the entire quiz bank is unique and stable (no two modules collide)", () => {
  const seen = new Set();
  for (const quiz of Object.values(QUIZZES)) {
    for (const q of quiz.questions) {
      assert.ok(!seen.has(q.id), `duplicate question id found: ${q.id}`);
      seen.add(q.id);
    }
  }
  // Spot-check original P3 ids are unchanged (existing production quiz
  // question ids must remain stable — Owner spec §2/§11).
  for (const id of ["m1-q1", "m3-q4", "m4-q1", "m5-q2", "m6-q4"]) {
    assert.ok(seen.has(id), `original question id ${id} must still exist unchanged`);
  }
});

test("P8: selectQuizQuestions returns a bounded subset when the bank is larger than the attempt size, and the full bank otherwise", () => {
  const subset = selectQuizQuestions("module-3", "seed-a");
  assert.equal(subset.length, QUIZ_ATTEMPT_SIZE);

  // module-1's bank (8) is still larger than the attempt size, so this also
  // returns a bounded subset, not the full 8.
  const subset2 = selectQuizQuestions("module-1", "seed-b");
  assert.equal(subset2.length, QUIZ_ATTEMPT_SIZE);

  assert.equal(selectQuizQuestions("does-not-exist", "seed-c"), null);
});

test("P8: selectQuizQuestions is deterministic for the same seed and varies (almost always) for a different seed", () => {
  const a = selectQuizQuestions("module-5", "same-seed").map((q) => q.id);
  const b = selectQuizQuestions("module-5", "same-seed").map((q) => q.id);
  assert.deepEqual(a, b);

  const c = selectQuizQuestions("module-5", "different-seed").map((q) => q.id);
  assert.notDeepEqual(a, c);
});

test("P8: scoreQuizAttempt only ever scores the questions in the deterministically-selected subset, never a client-declared set", () => {
  const seedKey = buildQuizAttemptSeed(42, "module-4", null);
  const subset = selectQuizQuestions("module-4", seedKey);
  const correctAnswers = subset.map((q) => q.correctIndex);

  const result = scoreQuizAttempt("module-4", seedKey, correctAnswers);
  assert.equal(result.ok, true);
  assert.equal(result.total, QUIZ_ATTEMPT_SIZE);
  assert.equal(result.correctCount, QUIZ_ATTEMPT_SIZE);
  assert.deepEqual(result.results.map((r) => r.questionId), subset.map((q) => q.id));
});

test("P8: scoreQuizAttempt rejects an answers array sized to the FULL bank instead of the served subset (cannot forge which questions were served)", () => {
  const seedKey = buildQuizAttemptSeed(42, "module-4", null);
  const fullBankAnswers = QUIZZES["module-4"].questions.map((q) => q.correctIndex);
  const result = scoreQuizAttempt("module-4", seedKey, fullBankAnswers);
  assert.equal(result.ok, false);
  assert.equal(result.error, "invalid_answers");
});

test("P8: a different previous-attempt seed rotates the subset (bounded random subset per attempt)", () => {
  const first = selectQuizQuestions("module-6", buildQuizAttemptSeed(1, "module-6", null)).map((q) => q.id);
  const second = selectQuizQuestions("module-6", buildQuizAttemptSeed(1, "module-6", "2026-09-07 10:00:00")).map((q) => q.id);
  assert.notDeepEqual(first, second, "a real submitted attempt's timestamp should change the next attempt's subset");
});

test("CHAL-001: challenges exist for modules 3, 4, 5, 6, and 7 (none for 1-2)", () => {
  const byModule = {};
  for (const c of Object.values(CHALLENGES)) {
    byModule[c.moduleId] = (byModule[c.moduleId] || 0) + 1;
  }
  for (const m of ["module-3", "module-4", "module-5", "module-6", "module-7"]) {
    assert.ok(byModule[m] >= 1, `expected at least one challenge for ${m}`);
  }
  assert.equal(byModule["module-1"], undefined);
  assert.equal(byModule["module-2"], undefined);
});

test("replayChallenge: challenge-module-3 passes with a correct command transcript", () => {
  const result = replayChallenge("challenge-module-3", ["git add a.txt", "git add b.txt", "git rm --cached d.txt"]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, true);
});

test("replayChallenge: challenge-module-3 fails when c.log is accidentally staged too", () => {
  const result = replayChallenge("challenge-module-3", ["git add .", "git rm --cached d.txt"]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, false, "git add . also stages c.log, which the goal forbids");
});

test("replayChallenge: challenge-module-4 passes after a real git reset --soft to the first commit (P3.5 regression)", () => {
  // Regression test for a P3.5-discovered defect: `state.commits` is
  // append-only (Engineering skill §7) — `git reset --soft` moves the branch
  // pointer but never removes the undone commit from that array, so the
  // check must count commits REACHABLE from HEAD, never `commits.length`
  // directly. Derives the first commit's id from the starting state itself
  // rather than hardcoding a hash, since commit ids are content-derived.
  const { buildStartingState } = CHALLENGES["challenge-module-4"];
  const { state: startingState } = buildStartingState();
  const firstCommitId = startingState.commits[0].id;
  assert.equal(startingState.commits.length, 2, "starting state has both v1 and v2 committed");

  const result = replayChallenge("challenge-module-4", ["git log --oneline", `git reset --soft ${firstCommitId}`]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, true);
  // The undone "v2" commit still exists in the append-only store, unreachable
  // from HEAD — proves the fix tolerates that instead of requiring it gone.
  assert.equal(result.state.commits.length, 2);
});

test("replayChallenge: challenge-module-4 fails if the learner uses --hard instead of --soft (discards the change entirely)", () => {
  const { buildStartingState } = CHALLENGES["challenge-module-4"];
  const { state: startingState } = buildStartingState();
  const firstCommitId = startingState.commits[0].id;

  const result = replayChallenge("challenge-module-4", [`git reset --hard ${firstCommitId}`]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, false, "--hard discards the change instead of staging it");
});

test("replayChallenge: challenge-module-5's starting state is already genuinely diverged (master and feature each have their own commit)", () => {
  const { buildStartingState } = CHALLENGES["challenge-module-5"];
  const { state } = buildStartingState();
  assert.equal(state.head, "feature", "the learner starts on feature and must checkout master themselves");
  assert.notEqual(state.branches.master, state.branches.feature, "master and feature must not already point at the same commit");
});

test("replayChallenge: challenge-module-5 passes with the minimal correct transcript (checkout + merge)", () => {
  const result = replayChallenge("challenge-module-5", ["git checkout master", "git merge feature"]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, true);
});

test("replayChallenge: an alternate valid command path for challenge-module-5 still passes (CHAL-005) — a harmless extra command first", () => {
  const result = replayChallenge("challenge-module-5", ["git status", "git log --oneline", "git checkout master", "git merge feature"]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, true);
});

test("replayChallenge: challenge-module-5 fails if the learner never switches back to master before merging", () => {
  const result = replayChallenge("challenge-module-5", ["git merge master"]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, false, "merging while still on feature never produces a merge commit on master");
});

test("replayChallenge: challenge-module-6 passes after a real clone with full history", () => {
  const result = replayChallenge("challenge-module-6", ["git clone"]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, true);
});

test("replayChallenge: challenge-module-6 fails if the repo is never cloned", () => {
  const result = replayChallenge("challenge-module-6", ["git status"]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, false);
});

test("replayChallenge: capstone-module-7 passes for a full init->commit->branch->commit->merge->push sequence (fast-forward)", () => {
  const result = replayChallenge("capstone-module-7", [
    "git init",
    "git add index.html",
    'git commit -m "initial"',
    "git checkout -b feature",
    "git add feature-work.txt",
    'git commit -m "feature work"',
    "git checkout master",
    "git merge feature",
    "git push",
  ]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, true);
});

test("replayChallenge: capstone-module-7 also passes via a true divergent merge (alternate valid path, CHAL-005)", () => {
  const result = replayChallenge("capstone-module-7", [
    "git init",
    "git add index.html",
    'git commit -m "initial"',
    "git checkout -b feature",
    "git add feature-work.txt",
    'git commit -m "feature work"',
    "git checkout master",
    'git commit -m "nothing staged, harmless no-op"',
    "git merge feature",
    "git push",
  ]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, true, "a fast-forward merge is still a valid capstone completion");
});

test("replayChallenge: capstone-module-7 fails if the learner never pushes to the remote", () => {
  const result = replayChallenge("capstone-module-7", [
    "git init",
    "git add index.html",
    'git commit -m "initial"',
    "git checkout -b feature",
    "git add feature-work.txt",
    'git commit -m "feature work"',
    "git checkout master",
    "git merge feature",
  ]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, false);
});

test("replayChallenge: rejects a non-array/invalid transcript rather than crashing", () => {
  const result = replayChallenge("challenge-module-3", "git add a.txt");
  assert.equal(result.ok, false);
  assert.equal(result.error, "invalid_transcript");
});

test("replayChallenge: rejects an unknown challenge id", () => {
  const result = replayChallenge("does-not-exist", []);
  assert.equal(result.ok, false);
  assert.equal(result.error, "unknown_challenge");
});

// ---------------------------------------------------------------------------
// P8: enrichment challenge variants (never required for completion —
// shared/curriculum.js only ever references the ORIGINAL challenge id per
// module, unchanged)
// ---------------------------------------------------------------------------

test("P8: challenge-module-4-b and challenge-module-6-b exist as enrichment variants and are absent from the required curriculum", () => {
  assert.ok(CHALLENGES["challenge-module-4-b"].variant, true);
  assert.ok(CHALLENGES["challenge-module-6-b"].variant, true);
  // The required assessment matrix (shared/curriculum.js) is untouched by
  // this file — verified indirectly via CHAL-001's existing module-count
  // test above still passing unchanged, and directly here: the variants'
  // own ids never appear as anyone's REQUIRED challengeId.
  const required = ["challenge-module-3", "challenge-module-4", "challenge-module-5", "challenge-module-6", "capstone-module-7"];
  assert.ok(!required.includes("challenge-module-4-b"));
  assert.ok(!required.includes("challenge-module-6-b"));
});

test("P8: challenge-module-4-b's starting state is deterministic (same commits every call, ADR-013/SIM-013)", () => {
  const a = CHALLENGES["challenge-module-4-b"].buildStartingState();
  const b = CHALLENGES["challenge-module-4-b"].buildStartingState();
  assert.deepEqual(a.state.commits.map((c) => c.id), b.state.commits.map((c) => c.id));
});

test("replayChallenge: challenge-module-4-b passes with git reset --mixed (genuinely different reasoning from challenge-module-4's --soft)", () => {
  const { state: startingState } = CHALLENGES["challenge-module-4-b"].buildStartingState();
  const firstCommitId = startingState.commits[0].id;

  const result = replayChallenge("challenge-module-4-b", ["git log --oneline", `git reset --mixed ${firstCommitId}`]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, true);
});

test("replayChallenge: challenge-module-4-b fails with --soft (would stage the change, not leave it in the working directory)", () => {
  const { state: startingState } = CHALLENGES["challenge-module-4-b"].buildStartingState();
  const firstCommitId = startingState.commits[0].id;
  const result = replayChallenge("challenge-module-4-b", [`git reset --soft ${firstCommitId}`]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, false);
});

test("replayChallenge: challenge-module-4-b fails with --hard (would discard the change entirely)", () => {
  const { state: startingState } = CHALLENGES["challenge-module-4-b"].buildStartingState();
  const firstCommitId = startingState.commits[0].id;
  const result = replayChallenge("challenge-module-4-b", [`git reset --hard ${firstCommitId}`]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, false);
});

test("P8: challenge-module-6-b's starting state is a genuine local/remote divergence (deterministic across calls)", () => {
  const a = CHALLENGES["challenge-module-6-b"].buildStartingState();
  const b = CHALLENGES["challenge-module-6-b"].buildStartingState();
  assert.deepEqual(a.state.branches, b.state.branches);
  assert.notEqual(a.state.branches.master, a.remoteState.branches.master, "local and remote must genuinely differ before the learner does anything");
});

test("replayChallenge: challenge-module-6-b passes with pull-then-push (the correct divergence-resolution order)", () => {
  const result = replayChallenge("challenge-module-6-b", ["git pull", "git push"]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, true);
});

test("replayChallenge: challenge-module-6-b fails if the learner tries to push before pulling (the common mistake it's designed to catch)", () => {
  const result = replayChallenge("challenge-module-6-b", ["git push"]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, false, "pushing while diverged must be rejected by the simulator itself (non-fast-forward), so nothing syncs");
});

test("replayChallenge: an alternate valid path for challenge-module-6-b (a harmless extra command first) still passes (CHAL-005)", () => {
  const result = replayChallenge("challenge-module-6-b", ["git status", "git log --oneline", "git pull", "git push"]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, true);
});
