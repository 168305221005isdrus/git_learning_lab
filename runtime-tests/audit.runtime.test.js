// Git Learning Lab — P14: audit log high-value coverage against the real
// Worker/D1 runtime (not the fake-D1 unit tests). Mirrors roles.runtime.test.js's
// pattern of exercising real routes end-to-end.
import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import { apiRequest, registerStudent, seedStaffUser, login } from "./helpers.js";

async function auditRowsFor(eventType) {
  const { results } = await env.DB.prepare("SELECT * FROM audit_events WHERE event_type = ? ORDER BY id DESC").bind(eventType).all();
  return results;
}

describe("P14 audit log (real Worker runtime)", () => {
  it("Admin creates a Teacher -> an admin.staff.created row exists with no credential in it", async () => {
    await seedStaffUser({ identifier: "rt_audit_admin_1", role: "ADMIN", password: "admin-audit-pass-1" });
    const adminCookie = await login("rt_audit_admin_1", "admin-audit-pass-1");

    const res = await apiRequest("/api/admin/staff/create", {
      method: "POST",
      cookie: adminCookie,
      body: { identifier: "rt_audit_teacher_1", role: "TEACHER" },
    });
    expect(res.status).toBe(201);
    const created = await res.json();

    const rows = await auditRowsFor("admin.staff.created");
    const row = rows.find((r) => r.target_identifier === "rt_audit_teacher_1");
    expect(row).toBeTruthy();
    expect(row.actor_identifier).toBe("rt_audit_admin_1");
    expect(JSON.parse(row.metadata_json)).toEqual({ createdRole: "TEACHER" });
    expect(JSON.stringify(row)).not.toContain(created.temporaryPassword);
  });

  it("Admin issues recovery -> an admin.recovery.issued row exists and the temporary credential is absent", async () => {
    await seedStaffUser({ identifier: "rt_audit_admin_2", role: "ADMIN", password: "admin-audit-pass-2" });
    const adminCookie = await login("rt_audit_admin_2", "admin-audit-pass-2");
    const { body: studentBody } = await registerStudent();

    const res = await apiRequest("/api/admin/recovery/issue", {
      method: "POST",
      cookie: adminCookie,
      body: { identifier: studentBody.user.identifier },
    });
    expect(res.status).toBe(200);
    const issued = await res.json();

    const rows = await auditRowsFor("admin.recovery.issued");
    const row = rows.find((r) => r.target_identifier === studentBody.user.identifier);
    expect(row).toBeTruthy();
    expect(row.actor_identifier).toBe("rt_audit_admin_2");
    expect(JSON.stringify(row)).not.toContain(issued.temporaryPassword);
  });

  it("a failed login writes an auth.login.failure row with no actor and only the attempted identifier", async () => {
    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { identifier: "rt_audit_unknown_user", password: "whatever-password-1" },
    });
    expect(res.status).toBe(401);

    const rows = await auditRowsFor("auth.login.failure");
    const row = rows.find((r) => JSON.parse(r.metadata_json).attemptedIdentifier === "rt_audit_unknown_user");
    expect(row).toBeTruthy();
    expect(row.actor_user_id).toBeNull();
  });

  it("a successful login writes an auth.login.success row with the real user as actor and target", async () => {
    const { cookie, body } = await registerStudent();
    expect(cookie).toBeTruthy();

    const rows = await auditRowsFor("auth.login.success");
    const row = rows.find((r) => r.actor_identifier === body.user.identifier);
    // Registration itself creates a session but does not go through
    // handleLogin — this proves a REAL subsequent /api/auth/login also logs.
    const loginRes = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { identifier: body.user.identifier, password: "correct-horse-battery" },
    });
    expect(loginRes.status).toBe(200);
    const rowsAfter = await auditRowsFor("auth.login.success");
    const afterRow = rowsAfter.find((r) => r.actor_identifier === body.user.identifier);
    expect(afterRow).toBeTruthy();
    expect(afterRow.target_identifier).toBe(body.user.identifier);
  });

  it("a TEACHER is denied read access to the audit log", async () => {
    await seedStaffUser({ identifier: "rt_audit_teacher_denied", role: "TEACHER", password: "teacher-audit-pass-1" });
    const cookie = await login("rt_audit_teacher_denied", "teacher-audit-pass-1");
    const res = await apiRequest("/api/admin/audit", { cookie });
    expect(res.status).toBe(403);
  });

  it("a STUDENT is denied read access to the audit log", async () => {
    const { cookie } = await registerStudent();
    const res = await apiRequest("/api/admin/audit", { cookie });
    expect(res.status).toBe(403);
  });

  it("an ADMIN can read the audit log, newest first, with normalized fields and no secrets", async () => {
    await seedStaffUser({ identifier: "rt_audit_admin_3", role: "ADMIN", password: "admin-audit-pass-3" });
    const adminCookie = await login("rt_audit_admin_3", "admin-audit-pass-3");

    const res = await apiRequest("/api/admin/audit", { cookie: adminCookie });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.events)).toBe(true);
    expect(body.events.length).toBeGreaterThan(0);
    for (let i = 1; i < body.events.length; i++) {
      expect(body.events[i - 1].id).toBeGreaterThanOrEqual(body.events[i].id);
    }
    const bodyText = JSON.stringify(body);
    expect(bodyText).not.toMatch(/password_hash|password_salt|temporaryPassword/i);
  });
});
