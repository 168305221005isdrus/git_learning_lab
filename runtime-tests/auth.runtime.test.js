// Git Learning Lab — P13: auth/session/CSRF runtime proof (ADR-011, AUTH-001/004/005/006).
import { describe, it, expect } from "vitest";
import { apiRequest, registerStudent, sessionCookieFrom } from "./helpers.js";

describe("auth: login/session/logout (real Worker runtime)", () => {
  it("an unknown identifier returns the identical generic invalid_credentials as a wrong password", async () => {
    const { body: reg } = await registerStudent();
    expect(reg.ok).toBe(true);

    const unknown = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { identifier: "no-such-user", password: "whatever123" },
    });
    const wrongPassword = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { identifier: reg.user.identifier, password: "definitely-wrong" },
    });

    expect(unknown.status).toBe(401);
    expect(wrongPassword.status).toBe(401);
    expect(await unknown.json()).toEqual(await wrongPassword.json());
  });

  it("valid login issues an httpOnly session cookie that then authenticates GET /api/auth/session", async () => {
    const { cookie } = await registerStudent(); // registration itself logs in
    expect(cookie).toMatch(/^gll_session=/);

    const res = await apiRequest("/api/auth/session", { cookie });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.user.role).toBe("STUDENT");
  });

  it("a request with no session cookie at all is rejected as not_authenticated", async () => {
    const res = await apiRequest("/api/auth/session");
    expect(res.status).toBe(401);
  });

  it("logout invalidates the session server-side — the same cookie no longer authenticates", async () => {
    const { cookie } = await registerStudent();

    const logoutRes = await apiRequest("/api/auth/logout", { method: "POST", cookie });
    expect(logoutRes.status).toBe(200);

    const after = await apiRequest("/api/auth/session", { cookie });
    expect(after.status).toBe(401);
  });
});

describe("AUTH-006 / CSRF: Origin allowlist on state-changing requests (real Worker runtime)", () => {
  it("rejects a state-changing request with a non-matching Origin, even with valid credentials", async () => {
    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      origin: "https://evil.example.com",
      body: { identifier: "irrelevant", password: "irrelevant" },
    });
    expect(res.status).toBe(403);
  });

  it("rejects a state-changing request with no Origin/Referer at all", async () => {
    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      origin: null,
      body: { identifier: "irrelevant", password: "irrelevant" },
    });
    expect(res.status).toBe(403);
  });

  it("accepts a state-changing request from the real production origin", async () => {
    const { res } = await registerStudent(); // uses the default ALLOWED_ORIGIN
    expect(res.status).not.toBe(403);
  });
});
