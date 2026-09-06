/**
 * Git Learning Lab — Cloudflare Worker API skeleton (P1).
 *
 * P1 implements only the health check and the routing skeleton. Auth,
 * password recovery, progress, and challenge-validation endpoints
 * (docs/REQUIREMENTS.md AUTH-xxx / RECOV-xxx / PROG-xxx / CHAL-xxx) are P2 work
 * and are listed below as comments only — do not implement their logic yet.
 *
 * No secrets are read or referenced in this file. Cloudflare bindings (D1,
 * etc.) are declared in wrangler.toml and passed in as `env`, never
 * hardcoded here.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, service: "git-learning-lab-api" });
    }

    // --- Future routes (P2+, not implemented yet) ---
    // POST /api/auth/login          -> AUTH-001..AUTH-006
    // POST /api/auth/logout         -> AUTH-005
    // POST /api/recovery/issue      -> RECOV-002 (Admin only)
    // POST /api/recovery/redeem     -> RECOV-003..RECOV-005
    // GET  /api/progress            -> PROG-001, PROG-003
    // POST /api/challenges/:id/submit -> CHAL-002 (shared-core replay validation, ADR-013)
    // GET  /api/admin/users         -> ADMIN-001 (Admin only)

    return json({ ok: false, error: "not_found" }, 404);
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
