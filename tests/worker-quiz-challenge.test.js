// Automated coverage for worker/src/routes/quiz.js and
// worker/src/routes/challenge.js (docs/REQUIREMENTS.md QUIZ-xxx, CHAL-xxx,
// TEST-006, ADR-013). Runs the REAL Worker route handlers unmodified against
// an in-memory fake D1, exactly like tests/worker-auth.test.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/src/index.js";
import { createFakeD1 } from "./helpers/fake-d1.js";
import { derivePasswordHash } from "../worker/src/crypto.js";

const ORIGIN = "https://git-learning-lab.pages.dev";

async function seedUser(env, { identifier, role, password }) {
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

// ---------------------------------------------------------------------------
// Quiz: QUIZ-002/003
// ---------------------------------------------------------------------------

test("quiz submit: score is computed server-side from the answer key, not trusted from the client", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  // 4 wrong answers on purpose, plus a forged "correctCount"/"percent" the
  // handler must never even look at.
  const res = await worker.fetch(
    req("POST", "/api/quiz/submit", {
      body: { quizId: "module-3", answers: [9, 9, 9, 9], correctCount: 4, percent: 100 },
      cookie,
    }),
    env
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.correctCount, 0, "the forged correctCount must be ignored; real answers were all wrong");
  assert.notEqual(body.percent, 100);
  assert.ok(body.results.every((r) => r.correct === false));
  assert.ok(body.results.every((r) => r.explanation && r.explanation.length > 0));
});

test("quiz submit: rejects an unknown quiz id", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const res = await worker.fetch(req("POST", "/api/quiz/submit", { body: { quizId: "not-a-quiz", answers: [] }, cookie }), env);
  assert.equal(res.status, 400);
});

test("quiz results: retaking a quiz overwrites the prior result idempotently (no duplicate rows)", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  await worker.fetch(req("POST", "/api/quiz/submit", { body: { quizId: "module-3", answers: [1, 1, 1, 1] }, cookie }), env);
  await worker.fetch(req("POST", "/api/quiz/submit", { body: { quizId: "module-3", answers: [1, 1, 1, 1] }, cookie }), env);

  const rows = env._inspect.quizResults.filter((r) => r.user_id === 1 && r.quiz_id === "module-3");
  assert.equal(rows.length, 1, "retrying/retaking must not create a duplicate row");
});

test("quiz results: one user's quiz results are never visible via another user's session", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  await seedUser(env, { identifier: "bob", role: "STUDENT", password: "pw87654321" });
  const aliceCookie = await loginAs(env, "alice", "pw12345678");
  const bobCookie = await loginAs(env, "bob", "pw87654321");

  await worker.fetch(req("POST", "/api/quiz/submit", { body: { quizId: "module-3", answers: [1, 1, 1, 1] }, cookie: aliceCookie }), env);

  const bobResults = await (await worker.fetch(req("GET", "/api/quiz-results", { cookie: bobCookie }), env)).json();
  assert.deepEqual(bobResults.results, []);
});

// ---------------------------------------------------------------------------
// Challenge: CHAL-002, ADR-013, TEST-006
// ---------------------------------------------------------------------------

test("challenge submit: a valid transcript is replayed server-side and passes", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const res = await worker.fetch(
    req("POST", "/api/challenge/submit", {
      body: { challengeId: "challenge-module-3", transcript: ["git add a.txt", "git add b.txt", "git rm --cached d.txt"] },
      cookie,
    }),
    env
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.passed, true);
  assert.equal(env._inspect.challengeResults.find((c) => c.user_id === 1).passed, 1);
});

test("TEST-006: a forged passed=true with no transcript is rejected, not silently accepted", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const res = await worker.fetch(
    req("POST", "/api/challenge/submit", { body: { challengeId: "challenge-module-3", passed: true }, cookie }),
    env
  );
  assert.equal(res.status, 400, "missing transcript must be rejected outright");
  assert.equal(env._inspect.challengeResults.length, 0, "no result may be persisted from a forged/incomplete request");
});

test("TEST-006: an arbitrary client-claimed final-state payload (no transcript) is rejected", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const res = await worker.fetch(
    req("POST", "/api/challenge/submit", {
      body: { challengeId: "challenge-module-3", completed: true, finalState: { stagingArea: { "a.txt": "1", "b.txt": "1" } } },
      cookie,
    }),
    env
  );
  assert.equal(res.status, 400);
  assert.equal(env._inspect.challengeResults.length, 0);
});

test("TEST-006: a transcript that does not actually reach the goal fails, even though it names real commands", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const res = await worker.fetch(
    req("POST", "/api/challenge/submit", {
      body: { challengeId: "challenge-module-3", transcript: ["git status"] },
      cookie,
    }),
    env
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.passed, false);
});

test("TEST-006: an alternate valid command path (git add . not attempted; individual adds used) still passes — replay uses the real shared simulator core, not a second implementation", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const res = await worker.fetch(
    req("POST", "/api/challenge/submit", {
      body: { challengeId: "challenge-module-6", transcript: ["git clone"] },
      cookie,
    }),
    env
  );
  assert.equal(res.status, 200);
  assert.equal((await res.json()).passed, true);
});

test("TEST-006: an invalid transcript (not an array) is rejected before any replay is attempted", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const res = await worker.fetch(
    req("POST", "/api/challenge/submit", { body: { challengeId: "challenge-module-3", transcript: "git add a.txt" }, cookie }),
    env
  );
  assert.equal(res.status, 400);
});

test("challenge results: a Student cannot submit or read a challenge result for another user's account", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  await seedUser(env, { identifier: "bob", role: "STUDENT", password: "pw87654321" });
  const aliceCookie = await loginAs(env, "alice", "pw12345678");
  const bobCookie = await loginAs(env, "bob", "pw87654321");

  // Alice passes a challenge; also tries to forge a userId in the body.
  await worker.fetch(
    req("POST", "/api/challenge/submit", {
      body: { challengeId: "challenge-module-6", transcript: ["git clone"], userId: 2 },
      cookie: aliceCookie,
    }),
    env
  );

  assert.equal(env._inspect.challengeResults.filter((c) => c.user_id === 2).length, 0, "bob's account must be untouched");
  assert.equal(env._inspect.challengeResults.filter((c) => c.user_id === 1).length, 1, "the result lands on alice's own account only");

  const bobResults = await (await worker.fetch(req("GET", "/api/challenge-results", { cookie: bobCookie }), env)).json();
  assert.deepEqual(bobResults.results, [], "bob must not see alice's challenge result");
});

test("challenge results: a later failing retry never downgrades an already-earned pass", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  await worker.fetch(req("POST", "/api/challenge/submit", { body: { challengeId: "challenge-module-6", transcript: ["git clone"] }, cookie }), env);
  await worker.fetch(req("POST", "/api/challenge/submit", { body: { challengeId: "challenge-module-6", transcript: ["git status"] }, cookie }), env);

  const row = env._inspect.challengeResults.find((c) => c.user_id === 1 && c.challenge_id === "challenge-module-6");
  assert.equal(row.passed, 1, "a stale failing retry must not undo an earlier pass");
});

test("challenge submit: rejects an unknown challenge id", async () => {
  const env = createFakeD1();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");

  const res = await worker.fetch(
    req("POST", "/api/challenge/submit", { body: { challengeId: "does-not-exist", transcript: [] }, cookie }),
    env
  );
  assert.equal(res.status, 400);
});
