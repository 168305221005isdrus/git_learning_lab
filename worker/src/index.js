/**
 * Git Learning Lab — Cloudflare Worker API (P2).
 *
 * Every authenticated route here is reached ONLY via the same-origin Pages
 * Function proxy (docs/ARCHITECTURE_DECISIONS.md ADR-015) at
 * https://git-learning-lab.pages.dev/api/* — never called directly
 * cross-origin from a browser. That is what lets the ADR-011 session cookie
 * (SameSite=Lax) work at all across the Pages/Workers hostname split, and
 * why these routes carry no CORS headers of their own (Engineering skill
 * §17: never "*" with credentialed routes — the correct fix here is no
 * cross-origin browser traffic at all, not a permissive CORS policy).
 *
 * GET /api/health remains the one exception: public, read-only, no
 * session/user data, still fetched directly cross-origin by the frontend's
 * P1 wiring proof — its wildcard CORS is unchanged from P1 and stays safe
 * for exactly that reason.
 */
import { json, safeError, originIsAllowed } from "./http.js";
import { resolveSessionUser } from "./session.js";
import { handleLogin, handleLogout, handleSessionCheck, handleChangePassword } from "./routes/auth.js";
import { handleListUsers, handleIssueRecovery } from "./routes/admin.js";
import { handleGetProgress, handlePostProgress } from "./routes/progress.js";

// Routes reachable while a forced password change is pending (RECOV-003):
// everything else is blocked until the user completes it.
const ALLOWED_DURING_FORCED_CHANGE = new Set(["GET /api/auth/session", "POST /api/auth/change-password", "POST /api/auth/logout"]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const routeKey = `${request.method} ${url.pathname}`;

    if (routeKey === "GET /api/health") {
      return json(
        { ok: true, service: "git-learning-lab-api" },
        200,
        { "access-control-allow-origin": "*" }
      );
    }

    if (!url.pathname.startsWith("/api/")) return safeError(404, "not_found");

    // AUTH-006: verify Origin/Referer on every state-changing request.
    if (request.method !== "GET" && !originIsAllowed(request)) {
      return safeError(403, "origin_not_allowed");
    }

    try {
      if (routeKey === "POST /api/auth/login") return await handleLogin(request, env);

      // Every remaining route needs a resolved session.
      const sessionUser = await resolveSessionUser(request, env);

      if (routeKey === "GET /api/auth/session") return await handleSessionCheck(sessionUser);
      if (routeKey === "POST /api/auth/logout") return await handleLogout(request, env);
      if (routeKey === "POST /api/auth/change-password") return await handleChangePassword(request, env, sessionUser);

      if (!sessionUser) return safeError(401, "not_authenticated");

      if (sessionUser.mustChangePassword && !ALLOWED_DURING_FORCED_CHANGE.has(routeKey)) {
        return safeError(403, "password_change_required");
      }

      if (routeKey === "GET /api/progress") return await handleGetProgress(request, env, sessionUser);
      if (routeKey === "POST /api/progress") return await handlePostProgress(request, env, sessionUser);

      if (routeKey === "GET /api/admin/users" || routeKey === "POST /api/admin/recovery/issue") {
        if (sessionUser.role !== "ADMIN") return safeError(403, "forbidden"); // ROLE-004/ROLE-005
        if (routeKey === "GET /api/admin/users") return await handleListUsers(request, env);
        return await handleIssueRecovery(request, env);
      }

      return safeError(404, "not_found");
    } catch (err) {
      // SEC-005: never leak a raw stack trace / D1 error to the client.
      return safeError(500, "internal_error");
    }
  },
};
