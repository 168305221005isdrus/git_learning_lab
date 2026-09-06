// Automated coverage for worker/src/index.js's auth/session/recovery/
// progress/admin routes (docs/REQUIREMENTS.md AUTH-xxx, ROLE-xxx, RECOV-xxx,
// PROG-xxx, SEC-xxx). Runs the REAL Worker route handlers unmodified against
// an in-memory fake D1 (tests/helpers/fake-d1.js) — no Jest/Vitest/
// vitest-pool-workers dependency (ADR-014), just node:test + the Workers
// runtime's own global Request/Response/crypto (all available in Node 24).
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

// ---------------------------------------------------------------------------
// AUTH-001, AUTH-003
// ---------------------------------------------------------------------------

test("login: correct credentials succeed and issue an httpOnly session cookie", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "correct horse battery" });

  const res = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: "correct horse battery" } }), env);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.user.identifier, "alice");
  assert.equal(body.user.role, "STUDENT");
  assert.ok(!("password_hash" in body.user), "password hash must never be returned");

  const setCookie = res.headers.get("Set-Cookie");
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /Secure/);
  assert.match(setCookie, /SameSite=Lax/);
});

test("AUTH-001: wrong password and unknown identifier return the identical generic response", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "correct horse battery" });

  const wrongPassword = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: "nope" } }), env);
  const unknownUser = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "ghost", password: "nope" } }), env);

  assert.equal(wrongPassword.status, 401);
  assert.equal(unknownUser.status, 401);
  assert.deepEqual(await wrongPassword.json(), await unknownUser.json());
});

// ---------------------------------------------------------------------------
// AUTH-004, AUTH-005
// ---------------------------------------------------------------------------

test("session check: no cookie is unauthenticated, valid cookie returns identity", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });

  const noCookie = await worker.fetch(req("GET", "/api/auth/session"), env);
  assert.equal(noCookie.status, 401);

  const login = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: "pw12345678" } }), env);
  const cookie = extractCookie(login);

  const checked = await worker.fetch(req("GET", "/api/auth/session", { cookie }), env);
  assert.equal(checked.status, 200);
  const body = await checked.json();
  assert.equal(body.user.identifier, "alice");
});

test("AUTH-005: logout invalidates the session server-side, not just client-side", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const login = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: "pw12345678" } }), env);
  const cookie = extractCookie(login);

  const logout = await worker.fetch(req("POST", "/api/auth/logout", { cookie }), env);
  assert.equal(logout.status, 200);

  const afterLogout = await worker.fetch(req("GET", "/api/auth/session", { cookie }), env);
  assert.equal(afterLogout.status, 401, "the same cookie must no longer authenticate");
});

// ---------------------------------------------------------------------------
// AUTH-006 / CSRF
// ---------------------------------------------------------------------------

test("AUTH-006: a state-changing request with no matching Origin/Referer is rejected", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });

  const forged = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: "pw12345678" }, origin: "https://evil.example" }), env);
  assert.equal(forged.status, 403);

  const missing = await worker.fetch(
    new Request("https://worker.test/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identifier: "alice", password: "pw12345678" }),
    }),
    env
  );
  assert.equal(missing.status, 403);
});

// ---------------------------------------------------------------------------
// ROLE-002, ROLE-004, ROLE-005, PROG-004, TEST-003
// ---------------------------------------------------------------------------

test("TEST-003 / PROG-004: one user's progress is never visible via another user's session", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  await seedUser(env, { identifier: "bob", role: "STUDENT", password: "pw87654321" });

  const aliceCookie = extractCookie(await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: "pw12345678" } }), env));
  const bobCookie = extractCookie(await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "bob", password: "pw87654321" } }), env));

  await worker.fetch(req("POST", "/api/progress", { body: { moduleId: "module-3", status: "completed" }, cookie: aliceCookie }), env);

  const bobProgress = await worker.fetch(req("GET", "/api/progress", { cookie: bobCookie }), env);
  const bobBody = await bobProgress.json();
  assert.deepEqual(bobBody.progress, [], "bob must not see alice's progress");

  const aliceProgress = await worker.fetch(req("GET", "/api/progress", { cookie: aliceCookie }), env);
  const aliceBody = await aliceProgress.json();
  assert.equal(aliceBody.progress[0].module_id, "module-3");
});

test("ROLE-002/PROG-004: a client-supplied userId in the request body is ignored (no cross-user write is possible)", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  await seedUser(env, { identifier: "bob", role: "STUDENT", password: "pw87654321" });
  const aliceCookie = extractCookie(await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: "pw12345678" } }), env));

  // Alice attempts to forge a write to bob's progress by naming his id.
  await worker.fetch(req("POST", "/api/progress", { body: { moduleId: "module-3", status: "completed", userId: 2 }, cookie: aliceCookie }), env);

  assert.equal(env._inspect.progress.filter((p) => p.user_id === 2).length, 0, "bob's progress must be untouched");
  assert.equal(env._inspect.progress.filter((p) => p.user_id === 1).length, 1, "the write must land on alice's own row");
});

test("PROG-002: retrying a progress write is idempotent and cannot downgrade completed back to started", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = extractCookie(await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: "pw12345678" } }), env));

  await worker.fetch(req("POST", "/api/progress", { body: { moduleId: "module-3", status: "started" }, cookie }), env);
  await worker.fetch(req("POST", "/api/progress", { body: { moduleId: "module-3", status: "completed" }, cookie }), env);
  // A dropped-connection retry resubmitting the earlier "started" write must not undo completion.
  await worker.fetch(req("POST", "/api/progress", { body: { moduleId: "module-3", status: "started" }, cookie }), env);
  await worker.fetch(req("POST", "/api/progress", { body: { moduleId: "module-3", status: "completed" }, cookie }), env);

  const rows = env._inspect.progress.filter((p) => p.user_id === 1 && p.module_id === "module-3");
  assert.equal(rows.length, 1, "no duplicate row from retried writes");
  assert.equal(rows[0].status, "completed", "a stale retry must never downgrade a completed result");
});

test("ROLE-004/ROLE-005: a Student is blocked from the Admin endpoint, even with a forged role field", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = extractCookie(await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: "pw12345678" } }), env));

  const res = await worker.fetch(req("GET", "/api/admin/users", { cookie }), env);
  assert.equal(res.status, 403);

  const forged = await worker.fetch(req("POST", "/api/admin/recovery/issue", { body: { identifier: "alice", role: "ADMIN" }, cookie }), env);
  assert.equal(forged.status, 403, "a role field in the request body must never grant admin access");
});

test("ADMIN-001: the admin user list never includes password hash/salt", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "admin1", role: "ADMIN", password: "adminpw123456" });
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "pw12345678" });
  const cookie = extractCookie(await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "admin1", password: "adminpw123456" } }), env));

  const res = await worker.fetch(req("GET", "/api/admin/users", { cookie }), env);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.users.length, 2);
  for (const u of body.users) {
    assert.ok(!("password_hash" in u));
    assert.ok(!("password_salt" in u));
  }
});

// ---------------------------------------------------------------------------
// RECOV-002..006, TEST-004
// ---------------------------------------------------------------------------

test("RECOV: admin-issued temporary credential forces a password change, then TEST-004 it cannot be reused", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "admin1", role: "ADMIN", password: "adminpw123456" });
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "forgotten-password" });
  const adminCookie = extractCookie(await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "admin1", password: "adminpw123456" } }), env));

  const issue = await worker.fetch(req("POST", "/api/admin/recovery/issue", { body: { identifier: "alice" }, cookie: adminCookie }), env);
  assert.equal(issue.status, 200);
  const issueBody = await issue.json();
  assert.ok(issueBody.temporaryPassword);
  assert.ok(!("password_hash" in issueBody), "RECOV-006: admin response never contains a password hash");

  // Old password no longer works.
  const oldLogin = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: "forgotten-password" } }), env);
  assert.equal(oldLogin.status, 401);

  // Temp credential logs in but is force-gated.
  const tempLogin = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: issueBody.temporaryPassword } }), env);
  assert.equal(tempLogin.status, 200);
  const tempCookie = extractCookie(tempLogin);
  const tempBody = await tempLogin.json();
  assert.equal(tempBody.user.mustChangePassword, true);

  const blocked = await worker.fetch(req("GET", "/api/progress", { cookie: tempCookie }), env);
  assert.equal(blocked.status, 403);
  assert.equal((await blocked.json()).error, "password_change_required");

  // Forced change succeeds.
  const changed = await worker.fetch(req("POST", "/api/auth/change-password", { body: { newPassword: "brand-new-password" }, cookie: tempCookie }), env);
  assert.equal(changed.status, 200);
  const newCookie = extractCookie(changed);

  // Now normal routes work again.
  const afterChange = await worker.fetch(req("GET", "/api/progress", { cookie: newCookie }), env);
  assert.equal(afterChange.status, 200);

  // TEST-004: the temporary credential cannot be reused after the change.
  const reuseAttempt = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: issueBody.temporaryPassword } }), env);
  assert.equal(reuseAttempt.status, 401);
});

test("RECOV-004: an expired temporary credential is rejected even with the correct password", async () => {
  const env = makeEnv();
  const expired = new Date(Date.now() - 1000).toISOString();
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "temp-pass-123", mustChangePassword: true, recoveryExpiresAt: expired });

  const res = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "alice", password: "temp-pass-123" } }), env);
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error, "recovery_credential_expired");
});

test("RECOV-006: issuing a recovery credential never requires or exposes the user's current password", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "admin1", role: "ADMIN", password: "adminpw123456" });
  const alice = await seedUser(env, { identifier: "alice", role: "STUDENT", password: "super-secret" });
  const originalHash = alice.password_hash;
  const adminCookie = extractCookie(await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "admin1", password: "adminpw123456" } }), env));

  const issue = await worker.fetch(req("POST", "/api/admin/recovery/issue", { body: { identifier: "alice" }, cookie: adminCookie }), env);
  const body = await issue.json();
  assert.notEqual(body.temporaryPassword, "super-secret");
  assert.notEqual(alice.password_hash, originalHash, "the stored hash is replaced, never merely read");
});

// ---------------------------------------------------------------------------
// SEC-005 (generic error responses)
// ---------------------------------------------------------------------------

test("SEC-005: malformed JSON never leaks an internal error detail", async () => {
  const env = makeEnv();
  const res = await worker.fetch(
    new Request("https://worker.test/api/auth/login", { method: "POST", headers: { "content-type": "application/json", Origin: ORIGIN }, body: "{not json" }),
    env
  );
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, "invalid_request");
});
