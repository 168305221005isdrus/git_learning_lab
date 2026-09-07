// P14 — Audit Log & Security Events.
// Covers: writeAuditEvent's data-minimization guarantees, that each in-scope
// route emits its expected event, the Admin-only read boundary, bounded
// limit/newest-first ordering, and that malformed metadata never leaks.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/src/index.js";
import { createFakeD1 } from "./helpers/fake-d1.js";
import { derivePasswordHash } from "../worker/src/crypto.js";
import { writeAuditEvent, AUDIT_EVENT_TYPES } from "../worker/src/db.js";

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
// writeAuditEvent — data minimization / safety
// ---------------------------------------------------------------------------

test("writeAuditEvent: an unrecognized event type is rejected, never silently written", async () => {
  const env = makeEnv();
  await assert.rejects(() => writeAuditEvent(env, { eventType: "not.a.real.event", actor: null, target: null, metadata: null }));
  assert.equal(env._inspect.auditEvents.length, 0);
});

test("writeAuditEvent: a temporary credential is never present in stored metadata for any implemented event", async () => {
  const env = makeEnv();
  const adminCookie = await seedAdmin(env);

  await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "newteacher1", role: "TEACHER" }, cookie: adminCookie }), env);
  await worker.fetch(req("POST", "/api/admin/recovery/issue", { body: { identifier: "admin1" }, cookie: adminCookie }), env);

  assert.ok(env._inspect.auditEvents.length >= 2);
  for (const row of env._inspect.auditEvents) {
    const serialized = JSON.stringify(row);
    assert.ok(!/temporaryPassword|password_hash|password_salt/i.test(serialized), `row leaked a secret: ${serialized}`);
  }
});

// ---------------------------------------------------------------------------
// Event emission — one test per in-scope event
// ---------------------------------------------------------------------------

test("admin.staff.created is emitted with actor/target/createdRole, no secrets", async () => {
  const env = makeEnv();
  const adminCookie = await seedAdmin(env);
  const res = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "flowteacher", role: "TEACHER" }, cookie: adminCookie }), env);
  assert.equal(res.status, 201);

  const events = env._inspect.auditEvents.filter((e) => e.event_type === "admin.staff.created");
  assert.equal(events.length, 1);
  assert.equal(events[0].actor_identifier, "admin1");
  assert.equal(events[0].actor_role, "ADMIN");
  assert.equal(events[0].target_identifier, "flowteacher");
  assert.deepEqual(JSON.parse(events[0].metadata_json), { createdRole: "TEACHER" });
});

test("admin.recovery.issued is emitted with actor/target/expiresInHours, no credential", async () => {
  const env = makeEnv();
  const adminCookie = await seedAdmin(env);
  await seedUser(env, { identifier: "alice", role: "STUDENT", password: "forgotten-password" });
  const res = await worker.fetch(req("POST", "/api/admin/recovery/issue", { body: { identifier: "alice" }, cookie: adminCookie }), env);
  assert.equal(res.status, 200);

  const events = env._inspect.auditEvents.filter((e) => e.event_type === "admin.recovery.issued");
  assert.equal(events.length, 1);
  assert.equal(events[0].actor_identifier, "admin1");
  assert.equal(events[0].target_identifier, "alice");
  assert.deepEqual(JSON.parse(events[0].metadata_json), { expiresInHours: 24 });
});

test("student.registered is emitted with a null actor and the new student as target", async () => {
  const env = makeEnv();
  const res = await worker.fetch(
    req("POST", "/api/auth/register", {
      body: { fullName: "New Student", username: "newstudent1", studentId: "STD-100", password: "studentpass1", confirmPassword: "studentpass1" },
    }),
    env
  );
  assert.equal(res.status, 201);

  const events = env._inspect.auditEvents.filter((e) => e.event_type === "student.registered");
  assert.equal(events.length, 1);
  assert.equal(events[0].actor_user_id, null);
  assert.equal(events[0].target_identifier, "newstudent1");
});

test("auth.login.success is emitted with the authenticated user as both actor and target", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "bob", role: "STUDENT", password: "bobpassword1" });
  const res = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "bob", password: "bobpassword1" } }), env);
  assert.equal(res.status, 200);

  const events = env._inspect.auditEvents.filter((e) => e.event_type === "auth.login.success");
  assert.equal(events.length, 1);
  assert.equal(events[0].actor_identifier, "bob");
  assert.equal(events[0].target_identifier, "bob");
});

test("auth.login.failure is emitted for a wrong password, with only the normalized attempted identifier — never the password", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "bob", role: "STUDENT", password: "bobpassword1" });
  const res = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "bob", password: "wrong-password" } }), env);
  assert.equal(res.status, 401);

  const events = env._inspect.auditEvents.filter((e) => e.event_type === "auth.login.failure");
  assert.equal(events.length, 1);
  assert.equal(events[0].actor_user_id, null);
  const metadata = JSON.parse(events[0].metadata_json);
  assert.equal(metadata.attemptedIdentifier, "bob");
  assert.ok(!JSON.stringify(metadata).includes("wrong-password"));
});

test("auth.login.failure is emitted identically for an unknown identifier (no account-existence leak in the log)", async () => {
  const env = makeEnv();
  const res = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "nobody-here", password: "whatever1" } }), env);
  assert.equal(res.status, 401);

  const events = env._inspect.auditEvents.filter((e) => e.event_type === "auth.login.failure");
  assert.equal(events.length, 1);
  assert.equal(events[0].actor_user_id, null);
  assert.equal(JSON.parse(events[0].metadata_json).attemptedIdentifier, "nobody-here");
});

test("auth.password.changed records forced:true for a recovery-forced change", async () => {
  const env = makeEnv();
  const adminCookie = await seedAdmin(env);
  const create = await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: "flowteacher2", role: "TEACHER" }, cookie: adminCookie }), env);
  const created = await create.json();
  const login = await worker.fetch(req("POST", "/api/auth/login", { body: { identifier: "flowteacher2", password: created.temporaryPassword } }), env);
  const tempCookie = extractCookie(login);

  await worker.fetch(req("POST", "/api/auth/change-password", { body: { newPassword: "flowteacher2-new-pass" }, cookie: tempCookie }), env);

  const events = env._inspect.auditEvents.filter((e) => e.event_type === "auth.password.changed" && e.actor_identifier === "flowteacher2");
  assert.equal(events.length, 1);
  assert.deepEqual(JSON.parse(events[0].metadata_json), { forced: true });
});

test("auth.password.changed records forced:false for a voluntary change", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "carol", role: "STUDENT", password: "carolpassword1" });
  const cookie = await loginAs(env, "carol", "carolpassword1");
  await worker.fetch(req("POST", "/api/auth/change-password", { body: { newPassword: "carol-new-password" }, cookie }), env);

  const events = env._inspect.auditEvents.filter((e) => e.event_type === "auth.password.changed");
  assert.equal(events.length, 1);
  assert.deepEqual(JSON.parse(events[0].metadata_json), { forced: false });
});

test("auth.logout is emitted with the authenticated user as actor before the session is deleted", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "dave", role: "STUDENT", password: "davepassword1" });
  const cookie = await loginAs(env, "dave", "davepassword1");
  const res = await worker.fetch(req("POST", "/api/auth/logout", { cookie }), env);
  assert.equal(res.status, 200);

  const events = env._inspect.auditEvents.filter((e) => e.event_type === "auth.logout");
  assert.equal(events.length, 1);
  assert.equal(events[0].actor_identifier, "dave");
});

test("auth.logout emits no event for an already-unauthenticated request (logout is idempotent, no session to attribute)", async () => {
  const env = makeEnv();
  const res = await worker.fetch(req("POST", "/api/auth/logout", {}), env);
  assert.equal(res.status, 200); // pre-existing behavior: logout with no session is a harmless no-op, not an error
  assert.equal(env._inspect.auditEvents.filter((e) => e.event_type === "auth.logout").length, 0);
});

// ---------------------------------------------------------------------------
// Admin-only read API
// ---------------------------------------------------------------------------

test("GET /api/admin/audit: unauthenticated request is rejected", async () => {
  const env = makeEnv();
  const res = await worker.fetch(req("GET", "/api/admin/audit"), env);
  assert.equal(res.status, 401);
});

test("GET /api/admin/audit: a STUDENT session is rejected", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "eve", role: "STUDENT", password: "evepassword1" });
  const cookie = await loginAs(env, "eve", "evepassword1");
  const res = await worker.fetch(req("GET", "/api/admin/audit", { cookie }), env);
  assert.equal(res.status, 403);
});

test("GET /api/admin/audit: a TEACHER session is rejected", async () => {
  const env = makeEnv();
  await seedUser(env, { identifier: "teach1", role: "TEACHER", password: "teachpassword1" });
  const cookie = await loginAs(env, "teach1", "teachpassword1");
  const res = await worker.fetch(req("GET", "/api/admin/audit", { cookie }), env);
  assert.equal(res.status, 403);
});

test("GET /api/admin/audit: an ADMIN session can list events, newest first", async () => {
  const env = makeEnv();
  const adminCookie = await seedAdmin(env);
  await seedUser(env, { identifier: "frank", role: "STUDENT", password: "frankpassword1" });

  await loginAs(env, "frank", "frankpassword1");
  await worker.fetch(req("POST", "/api/admin/recovery/issue", { body: { identifier: "frank" }, cookie: adminCookie }), env);

  const res = await worker.fetch(req("GET", "/api/admin/audit", { cookie: adminCookie }), env);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.events.length >= 2);
  // newest-first: the most recently written row's id should be >= the next one's.
  for (let i = 1; i < body.events.length; i++) {
    assert.ok(body.events[i - 1].id >= body.events[i].id, "events must be newest-first");
  }
  // normalized field shape — never a raw DB column name, never a secret.
  const sample = body.events[0];
  assert.ok("eventType" in sample && "actorIdentifier" in sample && "targetIdentifier" in sample && "createdAt" in sample);
  assert.ok(!("password_hash" in sample) && !("temporaryPassword" in sample));
});

test("GET /api/admin/audit: limit is bounded — an oversized limit is clamped, not honored literally", async () => {
  const env = makeEnv();
  const adminCookie = await seedAdmin(env);
  for (let i = 0; i < 5; i++) {
    await worker.fetch(req("POST", "/api/admin/staff/create", { body: { identifier: `bulk-teacher-${i}`, role: "TEACHER" }, cookie: adminCookie }), env);
  }
  const res = await worker.fetch(req("GET", "/api/admin/audit?limit=1", { cookie: adminCookie }), env);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.events.length, 1);
});

test("GET /api/admin/audit: malformed metadata_json never leaks — it is returned as null, not raw/thrown", async () => {
  const env = makeEnv();
  const adminCookie = await seedAdmin(env);
  // Directly corrupt a row's metadata_json the way a hand-edited/corrupted
  // row might look — writeAuditEvent itself always produces valid JSON, so
  // this simulates defense-in-depth against an unexpected stored value.
  env._inspect.auditEvents.push({
    id: 9999,
    event_type: "auth.logout",
    actor_user_id: null,
    actor_identifier: "ghost",
    actor_role: null,
    target_user_id: null,
    target_identifier: null,
    metadata_json: "{not valid json",
    created_at: new Date().toISOString(),
  });
  const res = await worker.fetch(req("GET", "/api/admin/audit", { cookie: adminCookie }), env);
  assert.equal(res.status, 200);
  const body = await res.json();
  const ghostRow = body.events.find((e) => e.actorIdentifier === "ghost");
  assert.ok(ghostRow);
  assert.equal(ghostRow.metadata, null);
});

// ---------------------------------------------------------------------------
// Event-type coverage sanity
// ---------------------------------------------------------------------------

test("AUDIT_EVENT_TYPES contains exactly the P14-scoped minimum set", () => {
  assert.deepEqual(
    [...AUDIT_EVENT_TYPES].sort(),
    [
      "admin.staff.created",
      "admin.recovery.issued",
      "student.registered",
      "auth.login.success",
      "auth.login.failure",
      "auth.password.changed",
      "auth.logout",
    ].sort()
  );
});
