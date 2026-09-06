/**
 * Git Learning Lab — Cloudflare Pages Function: same-origin API reverse proxy.
 *
 * ADR-015 (docs/ARCHITECTURE_DECISIONS.md): Pages (git-learning-lab.pages.dev)
 * and the Worker (git-learning-lab-api.git-learning-lab.workers.dev) are
 * different registrable domains, so a direct browser fetch() from the
 * frontend to the Worker is cross-site — and the locked ADR-011 session
 * cookie (SameSite=Lax) is never sent on a cross-site fetch()/XHR, only on
 * top-level navigation. This function makes every authenticated API call
 * same-origin from the browser's point of view: the browser only ever talks
 * to git-learning-lab.pages.dev/api/*, and THIS function (running
 * server-side on Cloudflare, not subject to browser same-origin policy)
 * forwards the request to the real Worker and relays its response —
 * including Set-Cookie — back untouched. The Worker remains the actual
 * backend (ADR-002 unchanged); this is a transport detail, not a new
 * implementation of anything.
 *
 * GET /api/health is NOT routed through here — the frontend still calls it
 * directly cross-origin (P1, unauthenticated, harmless, already verified
 * working) — this proxy exists only because authenticated routes need a
 * real same-origin cookie path.
 */

const WORKER_ORIGIN = "https://git-learning-lab-api.git-learning-lab.workers.dev";

export async function onRequest(context) {
  const { request } = context;
  const incomingUrl = new URL(request.url);
  const upstreamUrl = WORKER_ORIGIN + incomingUrl.pathname + incomingUrl.search;

  const upstreamRequest = new Request(upstreamUrl, {
    method: request.method,
    headers: request.headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
  });

  const upstreamResponse = await fetch(upstreamRequest);

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: upstreamResponse.headers,
  });
}
