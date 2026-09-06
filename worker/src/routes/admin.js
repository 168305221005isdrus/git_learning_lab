/**
 * Git Learning Lab — Admin routes (P2): ADMIN-001..003, RECOV-002, RECOV-006.
 *
 * ROLE-004/ROLE-005: restricted to the ADMIN role, resolved server-side from
 * the session — never from a client-supplied field. Every handler here
 * assumes the caller (worker/src/index.js) already verified sessionUser.role
 * === 'ADMIN' before dispatching.
 */
import { json, safeError } from "../http.js";
import { derivePasswordHash, randomHex } from "../crypto.js";
import { listUsers, getUserByIdentifier, setUserPassword, deleteAllSessionsForUser } from "../db.js";

const RECOVERY_CREDENTIAL_TTL_HOURS = 24; // RECOV-004: bounded, documented duration

export async function handleListUsers(request, env) {
  // ADMIN-001: identifier + role only — never password/hash fields.
  const users = await listUsers(env);
  return json({ ok: true, users });
}

export async function handleIssueRecovery(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return safeError(400, "invalid_request");
  }
  const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
  if (!identifier) return safeError(400, "invalid_request");

  const user = await getUserByIdentifier(env, identifier);
  if (!user) return safeError(404, "user_not_found");

  // RECOV-002/RECOV-006: issuing a temporary credential never requires or
  // reveals the user's current password — a fresh random one is generated.
  const temporaryPassword = randomHex(6); // 12 hex characters, reasonably typeable
  const { hash, salt, iterations } = await derivePasswordHash(temporaryPassword);
  const expiresAt = new Date(Date.now() + RECOVERY_CREDENTIAL_TTL_HOURS * 3600 * 1000).toISOString();

  await setUserPassword(env, user.id, { hash, salt, iterations, mustChangePassword: true, recoveryExpiresAt: expiresAt });
  await deleteAllSessionsForUser(env, user.id); // any existing session is invalidated immediately

  return json({
    ok: true,
    identifier: user.identifier,
    temporaryPassword,
    expiresAt,
    note: "Relay this credential to the user out-of-band. It is shown once and is not recoverable after this response.",
  });
}
