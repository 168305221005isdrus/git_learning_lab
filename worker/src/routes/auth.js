/**
 * Git Learning Lab — auth routes (P2): AUTH-001..006, RECOV-003, RECOV-005.
 */
import { json, safeError } from "../http.js";
import { serializeSessionCookie, serializeClearCookie, SESSION_MAX_AGE_SECONDS, parseCookies, SESSION_COOKIE_NAME } from "../cookies.js";
import { derivePasswordHash, verifyPassword, generateSessionToken, sha256Hex } from "../crypto.js";
import { getUserByIdentifier, createSession, deleteSession, setUserPassword } from "../db.js";

// A fixed dummy hash/salt used only to keep the login path's timing profile
// similar whether or not the identifier exists (defense-in-depth against
// account-enumeration-by-timing; AUTH-001's actual guarantee is the identical
// response body/status for both cases, this is a secondary hardening).
const DUMMY_SALT = "00112233445566778899aabbccddeeff";
const DUMMY_HASH = "0".repeat(64);

function safeUser(user) {
  return { id: user.id, identifier: user.identifier, role: user.role, mustChangePassword: !!user.mustChangePassword };
}

export async function handleLogin(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return safeError(400, "invalid_request");
  }
  const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!identifier || !password) return safeError(400, "invalid_request");

  const user = await getUserByIdentifier(env, identifier);

  // AUTH-001: identical generic response whether the identifier exists or
  // the password is wrong — never reveals which one failed.
  const valid = user
    ? await verifyPassword(password, user.password_hash, user.password_salt, user.password_iterations)
    : await verifyPassword(password, DUMMY_HASH, DUMMY_SALT, 10000).then(() => false);

  if (!user || !valid) return safeError(401, "invalid_credentials");

  if (user.must_change_password && user.recovery_expires_at) {
    if (new Date(user.recovery_expires_at).getTime() <= Date.now()) {
      return safeError(403, "recovery_credential_expired");
    }
  }

  const token = generateSessionToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  await createSession(env, { tokenHash, userId: user.id, expiresAt });

  return json(
    { ok: true, user: safeUser({ ...user, mustChangePassword: !!user.must_change_password }) },
    200,
    { "Set-Cookie": serializeSessionCookie(token) }
  );
}

export async function handleLogout(request, env) {
  const cookies = parseCookies(request);
  const rawToken = cookies[SESSION_COOKIE_NAME];
  if (rawToken) {
    const tokenHash = await sha256Hex(rawToken);
    await deleteSession(env, tokenHash); // AUTH-005: server-side invalidation, not just clearing the client cookie
  }
  return json({ ok: true }, 200, { "Set-Cookie": serializeClearCookie() });
}

export async function handleSessionCheck(sessionUser) {
  if (!sessionUser) return safeError(401, "not_authenticated");
  return json({ ok: true, user: safeUser(sessionUser) });
}

export async function handleChangePassword(request, env, sessionUser) {
  if (!sessionUser) return safeError(401, "not_authenticated");
  let body;
  try {
    body = await request.json();
  } catch {
    return safeError(400, "invalid_request");
  }
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  if (newPassword.length < 8) return safeError(400, "password_too_short");

  const { hash, salt, iterations } = await derivePasswordHash(newPassword);
  await setUserPassword(env, sessionUser.id, { hash, salt, iterations, mustChangePassword: false, recoveryExpiresAt: null });

  // Rotate the session token (good hygiene after a credential change) and
  // invalidate the one that was used to authenticate this request.
  const cookies = parseCookies(request);
  const oldRawToken = cookies[SESSION_COOKIE_NAME];
  if (oldRawToken) await deleteSession(env, await sha256Hex(oldRawToken));

  const newToken = generateSessionToken();
  const newTokenHash = await sha256Hex(newToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  await createSession(env, { tokenHash: newTokenHash, userId: sessionUser.id, expiresAt });

  return json(
    { ok: true, user: safeUser({ ...sessionUser, mustChangePassword: false }) },
    200,
    { "Set-Cookie": serializeSessionCookie(newToken) }
  );
}
