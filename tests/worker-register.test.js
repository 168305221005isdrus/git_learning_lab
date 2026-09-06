// Automated coverage for worker/src/routes/register.js (P4 student
// self-registration): REG-001/002/003, duplicate username/student-id/email,
// role-forging/privilege-escalation attempts, CSRF/origin protection, and
// invalid input. Same harness pattern as tests/worker-auth.test.js — runs the
// real worker/src/index.js route handlers against an in-memory fake D1.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/src/index.js";
import { createFakeD1 } from "./helpers/fake-d1.js";

const ORIGIN = "https://git-learning-lab.pages.dev";

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

function validPayload(overrides = {}) {
  return {
    fullName: "สมชาย ใจดี",
    username: "somchai01",
    password: "correct-horse-battery",
    confirmPassword: "correct-horse-battery",
    studentId: "168305221099",
    email: "168305221099@rmutsb.ac.th",
    ...overrides,
  };
}

test("register: a valid submission creates a STUDENT account and signs the user in", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("POST", "/api/auth/register", { body: validPayload() }), env);
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.user.role, "STUDENT");
  assert.equal(body.user.identifier, "somchai01");
  assert.ok(!("password_hash" in body.user));

  const setCookie = res.headers.get("Set-Cookie");
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /Secure/);
  assert.match(setCookie, /SameSite=Lax/);

  // The new session actually authenticates (REG-001: usable immediately, no
  // email verification step in P4).
  const cookie = extractCookie(res);
  const session = await worker.fetch(req("GET", "/api/auth/session", { cookie }), env);
  assert.equal(session.status, 200);
});

test("REG-002: a forged role field is silently ignored — the account is always STUDENT", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("POST", "/api/auth/register", { body: validPayload({ role: "ADMIN", username: "wannabe-admin" }) }), env);
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.user.role, "STUDENT", "role must never be honored from the request body");
  assert.equal(env._inspect.users.find((u) => u.identifier === "wannabe-admin").role, "STUDENT");
});

test("register: duplicate username is rejected", async () => {
  const env = createFakeD1();
  await worker.fetch(req("POST", "/api/auth/register", { body: validPayload() }), env);
  const res = await worker.fetch(
    req("POST", "/api/auth/register", { body: validPayload({ studentId: "168305221100", email: "168305221100@rmutsb.ac.th" }) }),
    env
  );
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, "username_taken");
});

test("register: duplicate student ID is rejected even with a different username/email", async () => {
  const env = createFakeD1();
  await worker.fetch(req("POST", "/api/auth/register", { body: validPayload() }), env);
  const res = await worker.fetch(
    req("POST", "/api/auth/register", { body: validPayload({ username: "somchai02", email: "somchai02@rmutsb.ac.th" }) }),
    env
  );
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, "student_id_taken");
});

test("register: duplicate email is rejected even with a different username/student ID", async () => {
  const env = createFakeD1();
  await worker.fetch(req("POST", "/api/auth/register", { body: validPayload() }), env);
  const res = await worker.fetch(
    req("POST", "/api/auth/register", { body: validPayload({ username: "somchai03", studentId: "168305221101" }) }),
    env
  );
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, "email_taken");
});

test("register: email outside the @rmutsb.ac.th domain is rejected", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("POST", "/api/auth/register", { body: validPayload({ email: "somchai@gmail.com" }) }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_email_domain");
});

test("register: email is optional — omitting it entirely succeeds", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("POST", "/api/auth/register", { body: validPayload({ email: "" }) }), env);
  assert.equal(res.status, 201);
});

test("register: password/confirmPassword mismatch is rejected", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("POST", "/api/auth/register", { body: validPayload({ confirmPassword: "different-password" }) }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "passwords_do_not_match");
});

test("register: a too-short password is rejected server-side, not only client-side", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("POST", "/api/auth/register", { body: validPayload({ password: "short", confirmPassword: "short" }) }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "password_too_short");
});

test("register: missing full name is rejected", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("POST", "/api/auth/register", { body: validPayload({ fullName: "  " }) }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "full_name_required");
});

test("register: an invalid username shape is rejected", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("POST", "/api/auth/register", { body: validPayload({ username: "a" }) }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_username");
});

test("register: an invalid student ID shape is rejected", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("POST", "/api/auth/register", { body: validPayload({ studentId: "!!" }) }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_student_id");
});

test("register: malformed JSON never leaks an internal error detail (SEC-005)", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(
    new Request("https://worker.test/api/auth/register", { method: "POST", headers: { "content-type": "application/json", Origin: ORIGIN }, body: "{not json" }),
    env
  );
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_request");
});

test("AUTH-006/CSRF: registration with no matching Origin/Referer is rejected", async () => {
  const env = createFakeD1();
  const res = await worker.fetch(req("POST", "/api/auth/register", { body: validPayload(), origin: "https://evil.example" }), env);
  assert.equal(res.status, 403);
  assert.equal(env._inspect.users.length, 0, "no account may be created by a cross-origin forged request");
});

test("register: a freshly registered student cannot see another student's progress (history isolation)", async () => {
  const env = createFakeD1();
  const aliceRes = await worker.fetch(req("POST", "/api/auth/register", { body: validPayload() }), env);
  const aliceCookie = extractCookie(aliceRes);
  const bobRes = await worker.fetch(
    req("POST", "/api/auth/register", { body: validPayload({ username: "bobby02", studentId: "168305221102", email: "bobby02@rmutsb.ac.th" }) }),
    env
  );
  const bobCookie = extractCookie(bobRes);

  await worker.fetch(req("POST", "/api/progress", { body: { moduleId: "module-1", status: "completed" }, cookie: aliceCookie }), env);

  const bobProgress = await worker.fetch(req("GET", "/api/progress", { cookie: bobCookie }), env);
  assert.deepEqual((await bobProgress.json()).progress, []);
});
