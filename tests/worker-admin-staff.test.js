// P11 — Admin-only staff (TEACHER/ADMIN) account creation.
// Covers the authorization boundary, the fixed role allowlist, staff-specific
// validation (optional name/email, @rmutsb.ac.th domain when present), the
// temporary-credential/forced-password-change flow (reusing RECOV-002..006's
// existing mechanism), and regressions proving public registration and the
// existing recovery/Teacher-boundary behavior are untouched.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/src/index.js";
import { createFakeD1 } from "./helpers/fake-d1.js";
import { derivePasswordHash } from "../worker/src/crypto.js";

const ORIGIN = "https://git-learning-lab.pages.dev";

async function seedUser(env, { identifier, role, password, mustChangePassword = false, recoveryExpiresAt = null }) {
  const { hash, salt, iterations } = await derivePasswordHash(password);
  env._inspect.users.push({
    id: env._inspect.users.length + 1,
    identifier,
    role,
    password_hash: hash,
    password_salt: salt,
    password_iterations: iterations,
    must_change_password: mustChangePassword ? 1 : 0,
    recovery_expires_at: recoveryExpiresAt,
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

function makeEnv() {
  return createFakeD1();
}

async function loginAs(env, identifier, password) {
  const res = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier, password } }), env);
  return extractCookie(res);
}

async function seedAdmin(env) {
  await seedUser(env, { identifier: "admin1", role: "ADMIN", password: "adminpw123456" });
  return loginAs(env, "admin1", "adminpw123456");
}

// ---------------------------------------------------------------------------
// AUTHORIZATION
// ---------------------------------------------------------------------------

test("staff create: unauthenticated request is rejected", async () => {
  const env = makeEnv();
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "newteacher", role: "TEACHER" }, origin: ORIGIN }), env);
  assert.equal(res.status, 401);
});

test("staff create: a STUDENT session is rejected", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = await loginAs(env, "alice", "pw12345678");
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "newteacher", role: "TEACHER" }, cookie }), env);
  assert.equal(res.status, 403);
});

test("staff create: a TEACHER session is rejected — a Teacher cannot create staff accounts", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "teacher1", role: "TEACHER", password: "teacherpw123" });
  const cookie = await loginAs(env, "teacher1", "teacherpw123");
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "newadmin", role: "ADMIN" }, cookie }), env);
  assert.equal(res.status, 403);
});

test("staff create: an ADMIN session can create a TEACHER account", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "newteacher1", role: "TEACHER" }, cookie }), env);
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.role, "TEACHER");
  assert.equal(body.identifier, "newteacher1");
  assert.ok(body.temporaryPassword);
  assert.ok(body.expiresAt);
});

test("staff create: an ADMIN session can create another ADMIN account", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "newadmin1", role: "ADMIN" }, cookie }), env);
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.role, "ADMIN");
});

// ---------------------------------------------------------------------------
// ROLE VALIDATION (fixed allowlist)
// ---------------------------------------------------------------------------

test("staff create: role STUDENT is rejected — public registration remains the only STUDENT path", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "sneaky", role: "STUDENT" }, cookie }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_role");
});

test("staff create: an unknown/invalid role string is rejected, not silently let through", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "sneaky2", role: "SUPERADMIN" }, cookie }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_role");
});

test("staff create: a missing role is rejected", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "norole" }, cookie }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_role");
});

// ---------------------------------------------------------------------------
// VALIDATION
// ---------------------------------------------------------------------------

test("staff create: an invalid identifier shape is rejected", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "a", role: "TEACHER" }, cookie }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_username");
});

test("staff create: a staff email outside @rmutsb.ac.th is rejected", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  const res = await worker.fetch(
    req("POST", "/api/admin/staff/create", { body: { identifier: "newteacher2", role: "TEACHER", email: "person@gmail.com" }, cookie }),
    env
  );
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_email_domain");
});

test("staff create: duplicate identifier is rejected", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "dupteacher", role: "TEACHER" }, cookie }), env);
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "dupteacher", role: "ADMIN" }, cookie }), env);
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, "username_taken");
});

test("staff create: duplicate email is rejected", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  await worker.fetch(
    req("POST", "/api/admin/staff/create", { body: { identifier: "teacherA", role: "TEACHER", email: "shared@rmutsb.ac.th" }, cookie }),
    env
  );
  const res = await worker.fetch(
    req("POST", "/api/admin/staff/create", { body: { identifier: "teacherB", role: "TEACHER", email: "SHARED@RMUTSB.AC.TH" }, cookie }),
    env
  );
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, "email_taken");
});

test("staff create: email is optional — omitting it entirely succeeds", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "noemailteacher", role: "TEACHER" }, cookie }), env);
  assert.equal(res.status, 201);
});

test("staff create: fullName is optional — omitting it entirely succeeds", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "nonameteacher", role: "TEACHER" }, cookie }), env);
  assert.equal(res.status, 201);
  const created = env._inspect.users.find((u) => u.identifier === "nonameteacher");
  assert.equal(created.full_name, null);
  assert.equal(created.student_id, null);
});

// ---------------------------------------------------------------------------
// ACCOUNT STATE
// ---------------------------------------------------------------------------

test("staff create: created account state — correct role, forced change, recovery expiry, hashed password, student_id null", async () => {
  const env = makeEnv();
  const cookie = await seedAdmin(env);
  const res = await worker.fetch(
    req("POST", "/api/admin/staff/create", { body: { identifier: "stateteacher", role: "TEACHER", fullName: "Somchai Test", email: "somchai@rmutsb.ac.th" }, cookie }),
    env
  );
  assert.equal(res.status, 201);
  const body = await res.json();

  const created = env._inspect.users.find((u) => u.identifier === "stateteacher");
  assert.equal(created.role, "TEACHER");
  assert.equal(created.must_change_password, 1);
  assert.ok(created.recovery_expires_at);
  assert.equal(created.student_id, null);
  assert.equal(created.full_name, "Somchai Test");
  assert.equal(created.email, "somchai@rmutsb.ac.th");
  assert.notEqual(created.password_hash, body.temporaryPassword, "plaintext temp credential must never be stored");
  assert.ok(!("password_hash" in body), "response must never include the stored hash");
  assert.ok(!("password_salt" in body), "response must never include the stored salt");
});

// ---------------------------------------------------------------------------
// FIRST LOGIN FLOW
// ---------------------------------------------------------------------------

test("staff create: the returned temporary password authenticates, forces password change, then the old temp credential stops working", async () => {
  const env = makeEnv();
  const adminCookie = await seedAdmin(env);
  const create = await worker.fetch(
    req("POST", "/api/admin/staff/create", { body: { identifier: "flowteacher", role: "TEACHER" }, cookie: adminCookie }),
    env
  );
  const created = await create.json();

  const login = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "flowteacher", password: created.temporaryPassword } }), env);
  assert.equal(login.status, 200);
  const loginBody = await login.json();
  assert.equal(loginBody.user.mustChangePassword, true);
  const tempCookie = extractCookie(login);

  // Protected routes blocked before the forced password change.
  const blocked = await worker.fetch(req("GET", "/api/progress", { cookie: tempCookie }), env);
  assert.equal(blocked.status, 403);
  assert.equal((await blocked.json()).error, "password_change_required");

  // Forced change succeeds.
  const changed = await worker.fetch(req("POST", "/api/auth/change-password", { body: { newPassword: "flowteacher-new-pass" }, cookie: tempCookie }), env);
  assert.equal(changed.status, 200);
  const newCookie = extractCookie(changed);

  // Normal access begins.
  const afterChange = await worker.fetch(req("GET", "/api/progress", { cookie: newCookie }), env);
  assert.equal(afterChange.status, 200);

  // Old temporary password no longer authenticates.
  const reuseAttempt = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "flowteacher", password: created.temporaryPassword } }), env);
  assert.equal(reuseAttempt.status, 401);

  // New permanent password works.
  const relogin = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "flowteacher", password: "flowteacher-new-pass" } }), env);
  assert.equal(relogin.status, 200);
});

// ---------------------------------------------------------------------------
// REGRESSIONS
// ---------------------------------------------------------------------------

test("regression: public registration still creates STUDENT only, even with a forged role/staff-shaped body", async () => {
  const env = makeEnv();
  const res = await worker.fetch(
    req("POST", "/api/auth/register", {
      body: {
        fullName: "Forger",
        username: "forger1",
        studentId: "STD-999",
        password: "forgerpassword1",
        confirmPassword: "forgerpassword1",
        role: "ADMIN",
      },
    }),
    env
  );
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.user.role, "STUDENT");
});

test("regression: existing Admin recovery-issuance route still works unmodified", async () => {
  const env = makeEnv();
  const adminCookie = await seedAdmin(env);
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "forgotten-password" });
  const res = await worker.fetch(req("POST", "/api/admin/recovery/issue", { body: { identifier: "alice" }, cookie: adminCookie }), env);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.temporaryPassword);
});

test("regression: Teacher classroom routes still reject a Teacher created via this new staff route no differently than any other Teacher", async () => {
  const env = makeEnv();
  const adminCookie = await seedAdmin(env);
  const create = await worker.fetch(
    req("POST", "/api/admin/staff/create", { body: { identifier: "regteacher", role: "TEACHER" }, cookie: adminCookie }),
    env
  );
  const created = await create.json();
  const login = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "regteacher", password: created.temporaryPassword } }), env);
  const tempCookie = extractCookie(login);
  await worker.fetch(req("POST", "/api/auth/change-password", { body: { newPassword: "regteacher-new-pass" }, cookie: tempCookie }), env);
  const relogin = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "regteacher", password: "regteacher-new-pass" } }), env);
  const cookie = extractCookie(relogin);

  const adminUsersAttempt = await worker.fetch(req("GET", "/api/admin/users", { cookie }), env);
  assert.equal(adminUsersAttempt.status, 403, "a Teacher must never inherit Admin capability, regardless of how the account was created");

  const teacherRoster = await worker.fetch(req("GET", "/api/teacher/roster", { cookie }), env);
  assert.equal(teacherRoster.status, 200, "Teacher classroom routes must still work normally for this account");
});
