/**
 * Standalone benchmark probe for ADR-012 (PBKDF2-HMAC-SHA256 iteration count).
 *
 * NOT part of the production API worker (worker/src/index.js) — kept
 * completely separate so a benchmark endpoint can never accidentally ship to
 * production. Run locally via `npm run bench:pbkdf2`, which starts this as
 * its own local `wrangler dev` worker (no Cloudflare login required for
 * local dev mode) using the exact Web Crypto primitives Workers ships in
 * production.
 *
 * Usage: GET /?iterations=100000
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const iterations = Number(url.searchParams.get("iterations") || "100000");

    if (!Number.isInteger(iterations) || iterations <= 0) {
      return json({ error: "iterations must be a positive integer" }, 400);
    }

    const password = "benchmark-password-not-a-real-credential";
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const t0 = performance.now();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      keyMaterial,
      256
    );
    const t1 = performance.now();

    return json({
      iterations,
      elapsedMs: Number((t1 - t0).toFixed(3)),
      derivedBits: bits.byteLength * 8,
      note: "elapsedMs is local workerd wall-clock time, a proxy for Cloudflare's production CPU-time billing metric, not an identical measurement. See ARCHITECTURE_DECISIONS.md ADR-012.",
    });
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
