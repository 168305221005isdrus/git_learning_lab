/**
 * Git Learning Lab — small HTTP helpers shared by every P2 route (Worker-only).
 *
 * ADR-015 (Pages Function reverse-proxy, docs/ARCHITECTURE_DECISIONS.md):
 * every authenticated route is only ever reached via the same-origin Pages
 * Function proxy at https://git-learning-lab.pages.dev/api/*, never directly
 * cross-origin from a browser — so these routes deliberately do NOT set any
 * Access-Control-Allow-Origin header (Engineering skill §17: never "*" with
 * credentialed routes; the correct answer here is "no CORS at all needed").
 * The one exception, GET /api/health, is handled separately in index.js and
 * keeps its existing public wildcard CORS (safe: public, read-only, no
 * session/user data — see the comment there).
 */

export const ALLOWED_ORIGIN = "https://git-learning-lab.pages.dev";

export function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extraHeaders },
  });
}

/** Safe, generic error responses — never a raw stack trace/SQL error (SEC-005). */
export function safeError(status, message) {
  return json({ ok: false, error: message }, status);
}

/**
 * AUTH-006 / CSRF mitigation for the cookie-based session design: every
 * state-changing (non-GET) request must carry an Origin or Referer that
 * matches this application's own production origin. A request missing both
 * headers is rejected too — a genuine same-origin browser fetch always sends
 * at least one of them for a state-changing method.
 */
export function originIsAllowed(request) {
  const origin = request.headers.get("Origin");
  if (origin) return origin === ALLOWED_ORIGIN;
  const referer = request.headers.get("Referer");
  if (referer) return referer.startsWith(ALLOWED_ORIGIN + "/") || referer === ALLOWED_ORIGIN;
  return false;
}
