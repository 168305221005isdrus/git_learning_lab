// Git Learning Lab — P13: shared helpers for the Worker-runtime test suite.
//
// These run INSIDE the real Worker/Miniflare runtime (this is what
// @cloudflare/vitest-plugin's pool provides), so they can use env.DB and the
// Worker's own crypto helpers directly — no fake-D1, no mocked Web Crypto.
import { env } from "cloudflare:workers";
import { SELF } from "cloudflare:test";
import { derivePasswordHash } from "../worker/src/crypto.js";

// Matches worker/src/http.js's ALLOWED_ORIGIN exactly — every state-changing
// request in real production traffic only ever arrives via the same-origin
// Pages Function proxy (ADR-015) from this exact origin, so runtime tests
// that want to get PAST the CSRF/Origin check (AUTH-006) must send it too.
export const ALLOWED_ORIGIN = "https://git-learning-lab.pages.dev";

/** Base URL for SELF.fetch() calls — host is arbitrary, only path/method/headers/body matter. */
export const BASE_URL = "https://runtime-test.invalid";

export function apiRequest(path, { method = "GET", body, cookie, origin = ALLOWED_ORIGIN } = {}) {
  const headers = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers["cookie"] = cookie;
  if (method !== "GET" && origin) headers["origin"] = origin;
  return SELF.fetch(BASE_URL + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/** Extracts `gll_session=...` (name=value only, no attributes) from a Set-Cookie response header. */
export function sessionCookieFrom(response) {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) return null;
  const match = setCookie.match(/gll_session=[^;]+/);
  return match ? match[0] : null;
}

let nextTestUserSuffix = 1;

/** Registers a fresh STUDENT via the real public registration route. Returns { cookie, body }. */
export async function registerStudent(overrides = {}) {
  const n = nextTestUserSuffix++;
  const res = await apiRequest("/api/auth/register", {
    method: "POST",
    body: {
      fullName: `Runtime Test Student ${n}`,
      username: `rt_student_${n}`,
      password: "correct-horse-battery",
      confirmPassword: "correct-horse-battery",
      studentId: `RT-STU-${n}`,
      ...overrides,
    },
  });
  const cookie = sessionCookieFrom(res);
  const body = await res.json();
  return { res, cookie, body };
}

/**
 * Seeds a TEACHER/ADMIN account directly into the isolated test D1 (there is
 * no public route that creates the first Admin — production bootstraps this
 * out-of-band via tools/bootstrap-accounts, see docs/PROJECT_CONTEXT.md §17.4).
 * Uses the Worker's REAL PBKDF2 helper (worker/src/crypto.js), not a mock.
 */
export async function seedStaffUser({ identifier, role, password = "seed-password-1" }) {
  const { hash, salt, iterations } = await derivePasswordHash(password);
  await env.DB.prepare(
    `INSERT INTO users (identifier, role, password_hash, password_salt, password_iterations, must_change_password)
     VALUES (?, ?, ?, ?, ?, 0)`
  )
    .bind(identifier, role, hash, salt, iterations)
    .run();
  return { identifier, password };
}

/** Logs in via the real /api/auth/login route. Returns the session cookie string. */
export async function login(identifier, password) {
  const res = await apiRequest("/api/auth/login", { method: "POST", body: { identifier, password } });
  if (res.status !== 200) {
    throw new Error(`login() failed for ${identifier}: ${res.status} ${await res.text()}`);
  }
  return sessionCookieFrom(res);
}
