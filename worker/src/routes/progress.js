/**
 * Git Learning Lab — Progress routes (P2): PROG-001, PROG-002, PROG-004.
 *
 * Every read/write here is scoped to `sessionUser.id`, resolved server-side
 * from the session — the request body's own fields are never trusted for
 * whose data is being read or written (ROLE-002/PROG-004: there is no
 * client-suppliable "userId" this API will honor).
 */
import { json, safeError } from "../http.js";
import { upsertProgress, getProgressForUser } from "../db.js";

const VALID_STATUSES = ["started", "completed"];

export async function handleGetProgress(request, env, sessionUser) {
  const progress = await getProgressForUser(env, sessionUser.id);
  return json({ ok: true, progress });
}

export async function handlePostProgress(request, env, sessionUser) {
  let body;
  try {
    body = await request.json();
  } catch {
    return safeError(400, "invalid_request");
  }
  const moduleId = typeof body.moduleId === "string" ? body.moduleId.trim() : "";
  const status = typeof body.status === "string" ? body.status : "";
  if (!moduleId || !VALID_STATUSES.includes(status)) return safeError(400, "invalid_request");

  // Idempotent upsert (PROG-002): retrying this exact call never duplicates
  // a row or corrupts prior progress, and never downgrades 'completed' back
  // to 'started' on a stale retry (see the ON CONFLICT guard in db.js).
  await upsertProgress(env, sessionUser.id, moduleId, status);
  return json({ ok: true });
}
