/**
 * Git Learning Lab — Worker-only crypto helpers (P2).
 *
 * Implements ADR-011 (opaque D1-backed session tokens) and ADR-012
 * (PBKDF2-HMAC-SHA256, 10,000 iterations, confirmed via real production
 * cpuTime telemetry — see docs/ARCHITECTURE_DECISIONS.md). Uses ONLY the
 * Web Crypto API already available in the Workers runtime — no external
 * library, no WASM (Engineering skill §17).
 *
 * This file is Worker-only: it is never imported by shared/simulator-core.js
 * or the frontend, and it never touches the simulator state model.
 */

export const PBKDF2_ITERATIONS = 10000; // ADR-012, confirmed value

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

/** Cryptographically random hex string of `byteLength` bytes. */
export function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

/**
 * Derives a PBKDF2-HMAC-SHA256 hash for `password`. Generates a fresh random
 * salt unless one is supplied (only ever supplied when re-verifying against
 * a stored hash — never reused across different passwords/users).
 */
export async function derivePasswordHash(password, salt = randomHex(16), iterations = PBKDF2_ITERATIONS) {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromHex(salt), iterations },
    keyMaterial,
    256
  );
  return { hash: toHex(bits), salt, iterations };
}

/** Constant-time-ish string comparison (avoids short-circuiting on length/content). */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verifies `password` against a stored PBKDF2 hash+salt+iterations. */
export async function verifyPassword(password, storedHash, storedSalt, storedIterations) {
  const { hash } = await derivePasswordHash(password, storedSalt, storedIterations);
  return timingSafeEqual(hash, storedHash);
}

/** A fresh, random, high-entropy session token (raw value, sent to the browser only via cookie). */
export function generateSessionToken() {
  return randomHex(32); // 256 bits, per ADR-011
}

/** SHA-256 hex digest — used to store session tokens hashed, never raw (ADR-011). */
export async function sha256Hex(input) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return toHex(digest);
}
