/**
 * Git Learning Lab — cookie helpers (P2).
 *
 * Session cookie is httpOnly, Secure, SameSite=Lax (ADR-011, AUTH-003) — the
 * raw token is never readable by page JavaScript. No `Domain` attribute is
 * ever set, so the cookie is host-only for whatever origin issues it; the
 * Pages Function proxy (docs/ARCHITECTURE_DECISIONS.md ADR-015) relies on
 * this so the browser binds the cookie to git-learning-lab.pages.dev, not
 * the Worker's own hostname.
 */

export const SESSION_COOKIE_NAME = "gll_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days — classroom MVP default

export function parseCookies(request) {
  const header = request.headers.get("Cookie") || "";
  const out = {};
  header.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  });
  return out;
}

export function serializeSessionCookie(token, maxAgeSeconds = SESSION_MAX_AGE_SECONDS) {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}

export function serializeClearCookie() {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
