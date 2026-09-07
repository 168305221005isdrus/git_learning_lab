// Git Learning Lab — P13: registration/role-boundary runtime proof (REG-002,
// ROLE-004/005, P11's Admin-created staff accounts).
import { describe, it, expect } from "vitest";
import { apiRequest, registerStudent, seedStaffUser, login } from "./helpers.js";

describe("registration: REG-002 (real Worker runtime)", () => {
  it("public registration always creates a STUDENT, even when the request forges a role field", async () => {
    const { body } = await registerStudent({ role: "ADMIN" });
    expect(body.ok).toBe(true);
    expect(body.user.role).toBe("STUDENT");
  });
});

describe("Admin staff creation is Admin-only (P11, real Worker runtime)", () => {
  it("a STUDENT session cannot create staff accounts", async () => {
    const { cookie } = await registerStudent();
    const res = await apiRequest("/api/admin/staff/create", {
      method: "POST",
      cookie,
      body: { identifier: "sneaky_teacher", role: "TEACHER" },
    });
    expect(res.status).toBe(403);
  });

  it("a TEACHER session cannot create staff accounts", async () => {
    await seedStaffUser({ identifier: "rt_teacher_1", role: "TEACHER", password: "teacher-pass-1" });
    const cookie = await login("rt_teacher_1", "teacher-pass-1");

    const res = await apiRequest("/api/admin/staff/create", {
      method: "POST",
      cookie,
      body: { identifier: "sneaky_admin", role: "ADMIN" },
    });
    expect(res.status).toBe(403);
  });

  it("an ADMIN session can create a TEACHER, and the new TEACHER cannot reach Admin-only routes", async () => {
    await seedStaffUser({ identifier: "rt_admin_1", role: "ADMIN", password: "admin-pass-1" });
    const adminCookie = await login("rt_admin_1", "admin-pass-1");

    const createRes = await apiRequest("/api/admin/staff/create", {
      method: "POST",
      cookie: adminCookie,
      body: { identifier: "rt_new_teacher", role: "TEACHER" },
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.role).toBe("TEACHER");
    expect(created.temporaryPassword).toBeTruthy();

    // The freshly-created TEACHER must change their temporary password before
    // anything else is reachable (RECOV-003) — change it, then confirm the
    // resulting real session still cannot reach an Admin-only route.
    const teacherLoginRes = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { identifier: "rt_new_teacher", password: created.temporaryPassword },
    });
    expect(teacherLoginRes.status).toBe(200);
    const teacherCookie = teacherLoginRes.headers.get("set-cookie").match(/gll_session=[^;]+/)[0];

    const changeRes = await apiRequest("/api/auth/change-password", {
      method: "POST",
      cookie: teacherCookie,
      body: { newPassword: "a-real-new-password-1" },
    });
    expect(changeRes.status).toBe(200);
    const rotatedCookie = changeRes.headers.get("set-cookie").match(/gll_session=[^;]+/)[0];

    const adminRoute = await apiRequest("/api/admin/users", { cookie: rotatedCookie });
    expect(adminRoute.status).toBe(403);
  });
});

describe("Teacher classroom routes are Teacher-only, not Admin (P6/P11 boundary, real Worker runtime)", () => {
  it("a STUDENT session is rejected on a Teacher route", async () => {
    const { cookie } = await registerStudent();
    const res = await apiRequest("/api/teacher/roster", { cookie });
    expect(res.status).toBe(403);
  });

  it("an ADMIN session does not silently inherit Teacher classroom access", async () => {
    await seedStaffUser({ identifier: "rt_admin_2", role: "ADMIN", password: "admin-pass-2" });
    const cookie = await login("rt_admin_2", "admin-pass-2");
    const res = await apiRequest("/api/teacher/roster", { cookie });
    expect(res.status).toBe(403);
  });

  it("a TEACHER session can use its own classroom route", async () => {
    await seedStaffUser({ identifier: "rt_teacher_2", role: "TEACHER", password: "teacher-pass-2" });
    const cookie = await login("rt_teacher_2", "teacher-pass-2");
    const res = await apiRequest("/api/teacher/roster", { cookie });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
