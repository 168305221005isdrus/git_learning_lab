// Automated coverage for the P5 course-completion evaluator
// (shared/completion.js via GET /api/completion) and certificate
// issuance/verification (worker/src/routes/certificate.js). Runs the REAL
// Worker route handlers unmodified against an in-memory fake D1, exactly
// like tests/worker-quiz-challenge.test.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/src/index.js";
import { createFakeD1 } from "./helpers/fake-d1.js";
import { derivePasswordHash } from "../worker/src/crypto.js";
import { QUIZZES } from "../shared/quiz-data.js";
import { CHALLENGES } from "../shared/challenges.js";
import { CURRICULUM_MODULES } from "../shared/curriculum.js";

const ORIGIN = "https://git-learning-lab.pages.dev";

async function seedUser(env, { identifier, role, password, fullName }) {
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
    student_id: null,
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

// Correct command transcripts for every P3 challenge, taken from this
// project's own already-verified regression coverage
// (tests/quiz-challenge-core.test.js) — reused here rather than re-derived,
// since the point of this file is testing the P5 completion/certificate
// layer on top, not re-proving the simulator/challenge engine itself.
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

/** Completes every module (lesson + quiz where required + challenge where
 * required) for the given cookie's user, using the real routes — exactly
 * what a real learner's browser would send, never a shortcut into D1. */
async function completeEntireCourse(env, cookie) {
  for (const mod of CURRICULUM_MODULES) {
    await worker.fetch(req("POST", "/api/progress", { body: { moduleId: mod.id, status: "completed" }, cookie }), env);

    if (mod.quizId) {
      const quiz = QUIZZES[mod.quizId];
      const answers = quiz.questions.map((q) => q.correctIndex);
      const res = await worker.fetch(req("POST", "/api/quiz/submit", { body: { quizId: mod.quizId, answers }, cookie }), env);
      assert.equal(res.status, 200, `quiz submit for ${mod.quizId} must succeed in the test fixture itself`);
    }

    if (mod.challengeId) {
      const res = await worker.fetch(
        req("POST", "/api/challenge/submit", { body: { challengeId: mod.challengeId, transcript: transcriptFor(mod.challengeId) }, cookie }),
        env
      );
      const body = await res.json();
      assert.equal(body.passed, true, `challenge ${mod.challengeId} must actually pass in the test fixture itself`);
    }
  }
}

async function getCompletion(env, cookie) {
  const res = await worker.fetch(req("GET", "/api/completion", { cookie }), env);
  return { status: res.status, body: await res.json() };
}

// ---------------------------------------------------------------------------
// Completion evaluator (P5 §1)
// ---------------------------------------------------------------------------

test("completion: a learner who has done nothing is not complete", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const { status, body } = await getCompletion(env, cookie);
  assert.equal(status, 200);
  assert.equal(body.completion.isComplete, false);
  assert.equal(body.completion.completedModules, 0);
});

test("completion: a learner missing only one module's challenge is not complete", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");
  await completeEntireCourse(env, cookie);

  // Undo module-3's challenge result directly (simulating "never passed it").
  // Mutates the array IN PLACE (splice, not reassignment) — env._inspect just
  // exposes references into fake-d1's own closured arrays, so reassigning
  // env._inspect.challengeResults would only rebind this local variable, not
  // the array the route handlers actually query against.
  const idx = env._inspect.challengeResults.findIndex((c) => c.challenge_id === "challenge-module-3");
  env._inspect.challengeResults.splice(idx, 1);

  const { body } = await getCompletion(env, cookie);
  assert.equal(body.completion.isComplete, false);
  const mod3 = body.completion.modules.find((m) => m.moduleId === "module-3");
  assert.equal(mod3.challengeDone, false);
  assert.ok(mod3.missing.some((m) => m.type === "challenge"));
});

test("completion: a fully completed learner is complete (all 7 modules)", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");
  await completeEntireCourse(env, cookie);

  const { body } = await getCompletion(env, cookie);
  assert.equal(body.completion.isComplete, true);
  assert.equal(body.completion.percent, 100);
  assert.equal(body.completion.completedModules, 7);
  assert.equal(body.completion.remaining.length, 0);
});

test("completion: Module 7's optional quiz never blocks completion (QUIZ-001b)", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");
  await completeEntireCourse(env, cookie); // never submits a module-7 quiz — none exists

  const { body } = await getCompletion(env, cookie);
  const mod7 = body.completion.modules.find((m) => m.moduleId === "module-7");
  assert.equal(mod7.quizDone, true, "module-7 has no required quiz, so quizDone must be vacuously true");
  assert.equal(mod7.complete, true);
  assert.equal(body.completion.isComplete, true);
  assert.equal(env._inspect.quizResults.some((q) => q.quiz_id === "module-7"), false, "no module-7 quiz result was ever submitted");
});

// ---------------------------------------------------------------------------
// Certificate issuance security (P5 §6)
// ---------------------------------------------------------------------------

test("certificate issuance: unauthenticated request is rejected", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("POST", "/api/certificate/issue", {}), env);
  assert.equal(res.status, 401);
  assert.equal(env._inspect.certificates.length, 0);
});

test("certificate issuance: an incomplete STUDENT cannot issue, even with a forged completed=true body", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const res = await worker.fetch(
    req("POST", "/api/certificate/issue", { body: { completed: true, isComplete: true, passed: true }, cookie }),
    env
  );
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error, "course_not_complete");
  assert.equal(env._inspect.certificates.length, 0);
});

test("certificate issuance: a forged userId in the request body cannot issue a certificate for someone else", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" }); // id 1, complete
  await seedUser(env, { identifier: "bob", role: "STUDENT", password: "pw87654321" }); // id 2, incomplete
  const aliceCookie = await loginAs(env, "alice", "pw12345678");
  const bobCookie = await loginAs(env, "bob", "pw87654321");
  await completeEntireCourse(env, aliceCookie);

  // Bob (incomplete) tries to issue while naming alice's user id in the body.
  const res = await worker.fetch(req("POST", "/api/certificate/issue", { body: { userId: 1 }, cookie: bobCookie }), env);
  assert.equal(res.status, 403, "issuance is always scoped to the caller's own session, never a body field");
  assert.equal(env._inspect.certificates.filter((c) => c.user_id === 2).length, 0);
});

test("certificate issuance: TEACHER/ADMIN roles are rejected even if their own progress rows are complete", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "pw12345678" });
  const cookie = await loginAs(env, "teacher1", "pw12345678");
  await completeEntireCourse(env, cookie);

  const res = await worker.fetch(req("POST", "/api/certificate/issue", { cookie }), env);
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error, "certificates_student_only");
  assert.equal(env._inspect.certificates.length, 0);
});

test("certificate issuance: an eligible, fully-completed STUDENT can issue a certificate", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678", fullName: "Alice Somchai" });
  const cookie = await loginAs(env, "alice", "pw12345678");
  await completeEntireCourse(env, cookie);

  const res = await worker.fetch(req("POST", "/api/certificate/issue", { cookie }), env);
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.certificate.learnerName, "Alice Somchai");
  assert.equal(body.certificate.courseName, "Git Learning Lab");
  assert.equal(body.certificate.status, "active");
  assert.match(body.certificate.verificationId, /^[a-f0-9]{32}$/);
  assert.ok(body.certificate.issuedAt);
});

test("certificate issuance: falls back to the login identifier when full_name is absent (pre-P4 bootstrap-style account)", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "student1", role: "STUDENT", password: "pw12345678" }); // no fullName
  const cookie = await loginAs(env, "student1", "pw12345678");
  await completeEntireCourse(env, cookie);

  const res = await worker.fetch(req("POST", "/api/certificate/issue", { cookie }), env);
  const body = await res.json();
  assert.equal(body.certificate.learnerName, "student1");
});

test("certificate issuance: repeated requests are idempotent (same certificate, no duplicate rows)", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");
  await completeEntireCourse(env, cookie);

  const first = await (await worker.fetch(req("POST", "/api/certificate/issue", { cookie }), env)).json();
  const secondRes = await worker.fetch(req("POST", "/api/certificate/issue", { cookie }), env);
  const second = await secondRes.json();

  assert.equal(secondRes.status, 200, "a repeat issue request is not treated as creating a new resource");
  assert.equal(second.certificate.verificationId, first.certificate.verificationId);
  assert.equal(env._inspect.certificates.filter((c) => c.user_id === 1).length, 1, "exactly one row, never duplicated");
});

test("GET /api/certificate/me: null before issuance, the real certificate after", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const before = await (await worker.fetch(req("GET", "/api/certificate/me", { cookie }), env)).json();
  assert.equal(before.certificate, null);

  await completeEntireCourse(env, cookie);
  await worker.fetch(req("POST", "/api/certificate/issue", { cookie }), env);

  const after = await (await worker.fetch(req("GET", "/api/certificate/me", { cookie }), env)).json();
  assert.ok(after.certificate);
  assert.match(after.certificate.verificationId, /^[a-f0-9]{32}$/);
});

// ---------------------------------------------------------------------------
// Public verification (P5 §5/§6) — no session required
// ---------------------------------------------------------------------------

test("public verification: succeeds for a real certificate with NO session/cookie at all", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678", fullName: "Alice Somchai" });
  const cookie = await loginAs(env, "alice", "pw12345678");
  await completeEntireCourse(env, cookie);
  const issued = await (await worker.fetch(req("POST", "/api/certificate/issue", { cookie }), env)).json();

  const res = await worker.fetch(req("GET", `/api/certificate/verify?id=${issued.certificate.verificationId}`, {}), env);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.valid, true);
  assert.equal(body.certificate.learnerName, "Alice Somchai");
  assert.equal(body.certificate.courseName, "Git Learning Lab");
  assert.equal(body.certificate.verificationId, issued.certificate.verificationId);
});

test("public verification: does not leak any private/internal field", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678", fullName: "Alice Somchai" });
  const cookie = await loginAs(env, "alice", "pw12345678");
  await completeEntireCourse(env, cookie);
  const issued = await (await worker.fetch(req("POST", "/api/certificate/issue", { cookie }), env)).json();

  const res = await worker.fetch(req("GET", `/api/certificate/verify?id=${issued.certificate.verificationId}`, {}), env);
  const body = await res.json();
  const forbiddenKeys = ["username", "identifier", "email", "student_id", "studentid", "user_id", "userid", "password", "progress", "quiz", "challenge", "session"];
  const serialized = JSON.stringify(body).toLowerCase();
  for (const key of forbiddenKeys) {
    assert.ok(!serialized.includes(key.toLowerCase()), `verification response must not mention "${key}"`);
  }
});

test("public verification: an unknown but well-formed id returns a safe generic failure, not a 404/500", async () => {
  const env = createFakeD1();
  const unknownButWellFormedId = "0".repeat(32);
  const res = await worker.fetch(req("GET", `/api/certificate/verify?id=${unknownButWellFormedId}`, {}), env);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).valid, false);
});

test("public verification: a malformed id (wrong shape) returns the same safe generic failure", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("GET", "/api/certificate/verify?id=not-a-real-id", {}), env);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).valid, false);
});

test("public verification: a missing id param fails safely instead of throwing", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("GET", "/api/certificate/verify", {}), env);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).valid, false);
});

test("regression: existing quiz/challenge/progress routes are untouched by the P5 routing changes", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const progressRes = await worker.fetch(req("POST", "/api/progress", { body: { moduleId: "module-1", status: "started" }, cookie }), env);
  assert.equal(progressRes.status, 200);

  const quizRes = await worker.fetch(req("POST", "/api/quiz/submit", { body: { quizId: "module-1", answers: [0, 0, 0, 0] }, cookie }), env);
  assert.equal(quizRes.status, 200);
});
