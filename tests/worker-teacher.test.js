// Automated coverage for the P6 Teacher classroom routes
// (worker/src/routes/teacher.js): summary, roster, student detail, and CSV
// export. Runs the REAL Worker route handlers unmodified against an
// in-memory fake D1, exactly like tests/worker-certificate.test.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/src/index.js";
import { createFakeD1 } from "./helpers/fake-d1.js";
import { derivePasswordHash } from "../worker/src/crypto.js";
import { selectQuizQuestions, buildQuizAttemptSeed } from "../shared/quiz-data.js";
import { CHALLENGES } from "../shared/challenges.js";
import { CURRICULUM_MODULES } from "../shared/curriculum.js";

const ORIGIN = "https://git-learning-lab.pages.dev";

async function seedUser(env, { identifier, role, password, fullName, studentId }) {
  const { hash, salt, iterations } = await derivePasswordHash(password);
  env._inspect.users.push({
    id: env._inspect.users.length + 1,
    identifier,
    role,
    password_hash: hash,
    password_salt: salt,
    password_iterations: iterations,
    must_change_password: 0,
    recovery_expires_at: null,
    full_name: fullName || null,
    student_id: studentId || null,
    email: null,
    created_at: new Date().toISOString(),
  });
  return env._inspect.users[env._inspect.users.length - 1];
}

function req(method, path, { body, cookie, origin = ORIGIN } = {}) {
  const headers = { "content-type": "application/json" };
  if (cookie) headers["Cookie"] = cookie;
  if (origin && method !== "GET") headers["Origin"] = origin;
  return new Request(`https://worker.test${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function extractCookie(response) {
  const setCookie = response.headers.get("Set-Cookie") || "";
  return setCookie.split(";")[0];
}

async function loginAs(env, identifier, password) {
  const res = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier, password } }), env);
  return extractCookie(res);
}

// Same known-correct transcripts already relied on by
// tests/worker-certificate.test.js — reused here rather than re-derived.
function transcriptFor(challengeId) {
  if (challengeId === "challenge-module-3") return ["git add a.txt", "git add b.txt", "git rm --cached d.txt"];
  if (challengeId === "challenge-module-4") {
    const { state } = CHALLENGES[challengeId].buildStartingState();
    const firstCommitId = state.commits[0].id;
    return ["git log --oneline", `git reset --soft ${firstCommitId}`];
  }
  if (challengeId === "challenge-module-5") return ["git checkout master", "git merge feature"];
  if (challengeId === "challenge-module-6") return ["git clone"];
  if (challengeId === "capstone-module-7") {
    return [
      "git init",
      "git add index.html",
      'git commit -m "initial"',
      "git checkout -b feature",
      "git add feature-work.txt",
      'git commit -m "feature work"',
      "git checkout master",
      "git merge feature",
      "git push",
    ];
  }
  throw new Error(`no known transcript for ${challengeId}`);
}

// P8: quiz submission now scores a bounded random subset per attempt (see
// shared/quiz-data.js) — the answers array must match the length/order of
// the SAME subset the Worker will independently recompute (userId + quizId +
// this user's own previous attempt, if any). Mirrors exactly what a real
// frontend does (fetch previous results, then submit the matching-length
// answers), never a shortcut into D1.
async function submitCorrectQuiz(env, cookie, userId, quizId) {
  const resultsRes = await worker.fetch(req("GET", "/api/quiz-results", { cookie }), env);
  const { results } = await resultsRes.json();
  const previous = results.find((r) => r.quiz_id === quizId);
  const seedKey = buildQuizAttemptSeed(userId, quizId, previous?.updated_at);
  const subset = selectQuizQuestions(quizId, seedKey);
  const answers = subset.map((q) => q.correctIndex);
  return worker.fetch(req("POST", "/api/quiz/submit", { body: { quizId, answers }, cookie }), env);
}

async function completeEntireCourse(env, cookie) {
  const sessionRes = await worker.fetch(req("GET", "/api/auth/session", { cookie }), env);
  const { user } = await sessionRes.json();
  for (const mod of CURRICULUM_MODULES) {
    await worker.fetch(req("POST", "/api/progress", { body: { moduleId: mod.id, status: "completed" }, cookie }), env);
    if (mod.quizId) {
      await submitCorrectQuiz(env, cookie, user.id, mod.quizId);
    }
    if (mod.challengeId) {
      await worker.fetch(
        req("POST", "/api/challenge/submit", { body: { challengeId: mod.challengeId, transcript: transcriptFor(mod.challengeId) }, cookie }),
        env
      );
    }
  }
}

async function completeOneModule(env, cookie, moduleId) {
  await worker.fetch(req("POST", "/api/progress", { body: { moduleId, status: "completed" }, cookie }), env);
}

// ---------------------------------------------------------------------------
// Authorization
// ---------------------------------------------------------------------------

test("teacher routes: unauthenticated access is rejected on every endpoint", async () => {
  const env = createFakeD1();
  for (const path of ["/api/teacher/summary", "/api/teacher/roster", "/api/teacher/student?id=1", "/api/teacher/export"]) {
    const res = await worker.fetch(req("GET", path), env);
    assert.equal(res.status, 401, `${path} must require authentication`);
  }
});

test("teacher routes: a STUDENT session is rejected on every endpoint", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  for (const path of ["/api/teacher/summary", "/api/teacher/roster", "/api/teacher/student?id=1", "/api/teacher/export"]) {
    const res = await worker.fetch(req("GET", path, { cookie }), env);
    assert.equal(res.status, 403, `${path} must reject a STUDENT session`);
  }
});

test("teacher routes: an ADMIN session does not silently inherit Teacher classroom access", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "admin1", role: "ADMIN", password: "pw12345678" });
  const cookie = await loginAs(env, "admin1", "pw12345678");

  const res = await worker.fetch(req("GET", "/api/teacher/roster", { cookie }), env);
  assert.equal(res.status, 403);
});

test("teacher routes: a TEACHER session can access every classroom endpoint", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678", fullName: "Alice A" });
  const teacherCookie = await loginAs(env, "teacher1", "pw12345678");

  const summaryRes = await worker.fetch(req("GET", "/api/teacher/summary", { cookie: teacherCookie }), env);
  assert.equal(summaryRes.status, 200);
  const rosterRes = await worker.fetch(req("GET", "/api/teacher/roster", { cookie: teacherCookie }), env);
  assert.equal(rosterRes.status, 200);
  const exportRes = await worker.fetch(req("GET", "/api/teacher/export", { cookie: teacherCookie }), env);
  assert.equal(exportRes.status, 200);
});

test("teacher routes: TEACHER cannot reach Admin-only account endpoints", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  const cookie = await loginAs(env, "teacher1", "pw12345678");

  const usersRes = await worker.fetch(req("GET", "/api/admin/users", { cookie }), env);
  assert.equal(usersRes.status, 403);
  const recoveryRes = await worker.fetch(
    req("POST", "/api/admin/recovery/issue", { body: { identifier: "alice" }, cookie }),
    env
  );
  assert.equal(recoveryRes.status, 403);
});

// ---------------------------------------------------------------------------
// Roster / summary content and privacy
// ---------------------------------------------------------------------------

test("roster: reflects real progress and never includes password/session/recovery fields", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678", fullName: "Alice A", studentId: "S001" });
  const teacherCookie = await loginAs(env, "teacher1", "pw12345678");
  const aliceCookie = await loginAs(env, "alice", "pw12345678");

  await completeOneModule(env, aliceCookie, "module-1");

  const res = await worker.fetch(req("GET", "/api/teacher/roster", { cookie: teacherCookie }), env);
  const body = await res.json();
  const alice = body.roster.find((s) => s.username === "alice");
  assert.ok(alice, "alice must appear in the roster");
  assert.equal(alice.fullName, "Alice A");
  assert.equal(alice.studentId, "S001");
  assert.equal(alice.status, "in_progress");
  assert.ok(alice.lastActivity, "an active student must have a last-activity timestamp");

  const serialized = JSON.stringify(body);
  for (const forbidden of ["password_hash", "password_salt", "password_iterations", "token_hash", "recovery_expires_at", "must_change_password"]) {
    assert.ok(!serialized.includes(forbidden), `roster response must never contain "${forbidden}"`);
  }
});

test("roster: a student with no activity at all is classified not_started; a teacher account itself never appears in the roster", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  await seedUser(env, { identifier: "bob", role: "STUDENT", password: "pw12345678", fullName: "Bob B" });
  const teacherCookie = await loginAs(env, "teacher1", "pw12345678");

  const res = await worker.fetch(req("GET", "/api/teacher/roster", { cookie: teacherCookie }), env);
  const body = await res.json();
  const bob = body.roster.find((s) => s.username === "bob");
  assert.equal(bob.status, "not_started");
  assert.equal(bob.lastActivity, null);
  assert.ok(!body.roster.some((s) => s.username === "teacher1"), "the Teacher's own account must never appear in the student roster");
});

test("summary: totals/average/needingAttention match the roster's own per-student data", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678", fullName: "Alice A" });
  await seedUser(env, { identifier: "bob", role: "STUDENT", password: "pw12345678", fullName: "Bob B" });
  const teacherCookie = await loginAs(env, "teacher1", "pw12345678");
  const aliceCookie = await loginAs(env, "alice", "pw12345678");
  await completeEntireCourse(env, aliceCookie);
  // bob does nothing — stays not_started

  const summaryRes = await worker.fetch(req("GET", "/api/teacher/summary", { cookie: teacherCookie }), env);
  const summary = (await summaryRes.json()).summary;
  assert.equal(summary.totalStudents, 2);
  assert.equal(summary.completedCount, 1);
  assert.equal(summary.startedCount, 1);
  assert.equal(summary.notStartedCount, 1);
  assert.equal(summary.needingAttention.length, 1);
  assert.equal(summary.needingAttention[0].fullName, "Bob B");
  assert.ok(summary.recentActivity.some((a) => a.fullName === "Alice A"));
});

// ---------------------------------------------------------------------------
// Completion consistency (P6 §6): Teacher view must never disagree with the
// Student-facing GET /api/completion / certificate-eligibility evaluator.
// ---------------------------------------------------------------------------

test("completion consistency: roster/detail isComplete matches this student's own GET /api/completion", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678", fullName: "Alice A" });
  const teacherCookie = await loginAs(env, "teacher1", "pw12345678");
  const aliceCookie = await loginAs(env, "alice", "pw12345678");
  await completeEntireCourse(env, aliceCookie);

  const completionRes = await worker.fetch(req("GET", "/api/completion", { cookie: aliceCookie }), env);
  const studentCompletion = (await completionRes.json()).completion;
  assert.equal(studentCompletion.isComplete, true);

  const aliceId = env._inspect.users.find((u) => u.identifier === "alice").id;
  const detailRes = await worker.fetch(req("GET", `/api/teacher/student?id=${aliceId}`, { cookie: teacherCookie }), env);
  const detail = (await detailRes.json()).student;
  assert.equal(detail.isComplete, studentCompletion.isComplete);
  assert.equal(detail.overallPercent, studentCompletion.percent);

  const rosterRes = await worker.fetch(req("GET", "/api/teacher/roster", { cookie: teacherCookie }), env);
  const rosterAlice = (await rosterRes.json()).roster.find((s) => s.id === aliceId);
  assert.equal(rosterAlice.isComplete, studentCompletion.isComplete);
  assert.equal(rosterAlice.status, "completed");
});

// ---------------------------------------------------------------------------
// Student detail view — isolation and privacy
// ---------------------------------------------------------------------------

test("student detail: shows per-module status, quiz score, challenge pass, and certificate state", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678", fullName: "Alice A", studentId: "S001" });
  const teacherCookie = await loginAs(env, "teacher1", "pw12345678");
  const aliceCookie = await loginAs(env, "alice", "pw12345678");

  await completeOneModule(env, aliceCookie, "module-1");
  const aliceId = env._inspect.users.find((u) => u.identifier === "alice").id;
  await submitCorrectQuiz(env, aliceCookie, aliceId, "module-1");
  const res = await worker.fetch(req("GET", `/api/teacher/student?id=${aliceId}`, { cookie: teacherCookie }), env);
  assert.equal(res.status, 200);
  const student = (await res.json()).student;
  assert.equal(student.fullName, "Alice A");
  assert.equal(student.studentId, "S001");
  assert.equal(student.certificateIssued, false);

  const module1 = student.modules.find((m) => m.moduleId === "module-1");
  assert.equal(module1.lessonStatus, "completed");
  assert.equal(module1.quizAttempted, true);
  assert.equal(typeof module1.quizPercent, "number");
});

test("student detail: TEACHER cannot look up a TEACHER/ADMIN account through this route", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  const otherTeacher = await seedUser(env, { identifier: "teacher2", role: "TEACHER", password: "pw12345678" });
  const admin = await seedUser(env, { identifier: "admin1", role: "ADMIN", password: "pw12345678" });
  const teacherCookie = await loginAs(env, "teacher1", "pw12345678");

  const res1 = await worker.fetch(req("GET", `/api/teacher/student?id=${otherTeacher.id}`, { cookie: teacherCookie }), env);
  assert.equal(res1.status, 404);
  const res2 = await worker.fetch(req("GET", `/api/teacher/student?id=${admin.id}`, { cookie: teacherCookie }), env);
  assert.equal(res2.status, 404);
});

test("student detail: an unknown id and a malformed id both fail safely, not with a 500", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  const cookie = await loginAs(env, "teacher1", "pw12345678");

  const unknown = await worker.fetch(req("GET", "/api/teacher/student?id=999999", { cookie }), env);
  assert.equal(unknown.status, 404);

  const malformed = await worker.fetch(req("GET", "/api/teacher/student?id=not-a-number", { cookie }), env);
  assert.equal(malformed.status, 400);

  const missing = await worker.fetch(req("GET", "/api/teacher/student", { cookie }), env);
  assert.equal(missing.status, 400);
});

test("student detail: no password/session/recovery field ever appears in the response", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678", fullName: "Alice A" });
  const teacherCookie = await loginAs(env, "teacher1", "pw12345678");
  const aliceId = env._inspect.users.find((u) => u.identifier === "alice").id;

  const res = await worker.fetch(req("GET", `/api/teacher/student?id=${aliceId}`, { cookie: teacherCookie }), env);
  const serialized = JSON.stringify(await res.json());
  for (const forbidden of ["password_hash", "password_salt", "token_hash", "recovery_expires_at", "must_change_password"]) {
    assert.ok(!serialized.includes(forbidden), `student detail response must never contain "${forbidden}"`);
  }
});

// ---------------------------------------------------------------------------
// CSV export (P6 §7): auth, escaping, formula-injection mitigation
// ---------------------------------------------------------------------------

test("CSV export: STUDENT is rejected", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");
  const res = await worker.fetch(req("GET", "/api/teacher/export", { cookie }), env);
  assert.equal(res.status, 403);
});

test("CSV export: correct headers, UTF-8 BOM, and expected row shape for a TEACHER", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678", fullName: "Alice A", studentId: "S001" });
  const cookie = await loginAs(env, "teacher1", "pw12345678");

  const res = await worker.fetch(req("GET", "/api/teacher/export", { cookie }), env);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/csv/);
  assert.match(res.headers.get("content-disposition"), /attachment/);

  // Response.text()'s UTF-8 decode step strips a leading BOM per the Fetch
  // spec (that's a client-side decode detail, not something the actual
  // bytes-on-the-wire lack) — check the raw bytes instead to prove the CSV
  // body itself really starts with EF BB BF.
  const bytes = new Uint8Array(await res.clone().arrayBuffer());
  assert.deepEqual([bytes[0], bytes[1], bytes[2]], [0xef, 0xbb, 0xbf], "CSV bytes must start with a UTF-8 BOM for Thai/Excel compatibility");

  const text = await res.text();
  const lines = text.split("\r\n");
  assert.equal(lines[0], "Full Name,Student ID,Username,Overall Progress (%),Completed Modules,Quizzes Completed,Challenges Passed,Course Completion,Certificate Status,Last Activity");
  assert.ok(lines.some((l) => l.startsWith("Alice A,S001,alice,")));
});

test("CSV export: a learner-supplied full name starting with a formula character is neutralized, not executed as a formula", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  // full_name is learner-supplied at registration (P4) — a hostile value here
  // is a realistic input, not a hypothetical.
  await seedUser(env, { identifier: "eve", role: "STUDENT", password: "pw12345678", fullName: "=2+2" });
  await seedUser(env, { identifier: "mallory", role: "STUDENT", password: "pw12345678", fullName: '+SUM(1,2)' });
  const cookie = await loginAs(env, "teacher1", "pw12345678");

  const res = await worker.fetch(req("GET", "/api/teacher/export", { cookie }), env);
  const text = await res.text();
  assert.ok(text.includes("'=2+2"), "a cell starting with '=' must be prefixed with a leading apostrophe");
  assert.ok(text.includes("'+SUM(1,2)"), "a cell starting with '+' must be prefixed with a leading apostrophe");
  assert.ok(!text.includes(",=2+2,"), "the raw, unescaped formula must never appear as its own CSV cell");
});

test("CSV export: a full name containing a comma is safely quoted", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  await seedUser(env, { identifier: "carol", role: "STUDENT", password: "pw12345678", fullName: "Carol, C." });
  const cookie = await loginAs(env, "teacher1", "pw12345678");

  const res = await worker.fetch(req("GET", "/api/teacher/export", { cookie }), env);
  const text = await res.text();
  assert.ok(text.includes('"Carol, C."'), "a name containing a comma must be quoted so it stays one CSV field");
});

// ---------------------------------------------------------------------------
// Regression: existing routes untouched
// ---------------------------------------------------------------------------

test("regression: existing Student flow (progress/quiz/challenge/completion) is unaffected by the P6 teacher routes", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");
  await completeEntireCourse(env, cookie);
  const res = await worker.fetch(req("GET", "/api/completion", { cookie }), env);
  const body = await res.json();
  assert.equal(body.completion.isComplete, true);
});
