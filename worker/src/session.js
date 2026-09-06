/**
 * Git Learning Lab — session resolution (Worker-only, P2).
 *
 * AUTH-004: every route that reads/writes user-specific data validates the
 * session token against D1 before acting — an invalid/expired/missing token
 * results in a rejection, never a default/anonymous identity. ROLE-005: role
 * is resolved here, server-side, from the stored session — never accepted
 * from any client-supplied field.
 */
import { parseCookies, SESSION_COOKIE_NAME } from "./cookies.js";
import { sha256Hex } from "./crypto.js";
import { getSessionWithUser } from "./db.js";

/**
 * Returns the authenticated user (safe fields only) for this request, or
 * `null` if there is no valid, unexpired session.
 */
export async function resolveSessionUser(request, env) {
  const cookies = parseCookies(request);
  const rawToken = cookies[SESSION_COOKIE_NAME];
  if (!rawToken) return null;

  const tokenHash = await sha256Hex(rawToken);
  const row = await getSessionWithUser(env, tokenHash);
  if (!row) return null;

  if (new Date(row.expires_at).getTime() <= Date.now()) return null;

  // A recovery credential that has expired must not authenticate, even if
  // the session row itself is still technically valid (RECOV-004).
  if (row.must_change_password && row.recovery_expires_at) {
    if (new Date(row.recovery_expires_at).getTime() <= Date.now()) return null;
  }

  return {
    id: row.id,
    identifier: row.identifier,
    role: row.role,
    mustChangePassword: !!row.must_change_password,
  };
}
