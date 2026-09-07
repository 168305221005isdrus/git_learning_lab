/**
 * Git Learning Lab — Admin-only audit log read route (P14).
 *
 * ROLE-004/ROLE-005: restricted to the ADMIN role, resolved server-side from
 * the session — never from a client-supplied field. This handler assumes the
 * caller (worker/src/index.js) already verified sessionUser.role === 'ADMIN'
 * before dispatching (same convention as worker/src/routes/admin.js).
 *
 * TEACHER and STUDENT never reach this route (P14 §23: Teacher audit
 * visibility is explicitly deferred, not built here).
 */
import { json, safeError } from "../http.js";
import { listAuditEvents } from "../db.js";

const DEFAULT_LIMIT = 50;

function parseMetadata(metadataJson) {
  if (!metadataJson) return null;
  try {
    return JSON.parse(metadataJson);
  } catch {
    // metadata_json is always server-generated (see db.js's writeAuditEvent)
    // so this should never happen — but a malformed row must never leak a
    // raw parse error or the unparsed string to the client (SEC-005).
    return null;
  }
}

export async function handleListAuditEvents(request, env) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : DEFAULT_LIMIT;
  if (limitParam !== null && !Number.isFinite(limit)) return safeError(400, "invalid_request");

  const rows = await listAuditEvents(env, { limit });

  const events = rows.map((row) => ({
    id: row.id,
    eventType: row.event_type,
    actorUserId: row.actor_user_id,
    actorIdentifier: row.actor_identifier,
    actorRole: row.actor_role,
    targetUserId: row.target_user_id,
    targetIdentifier: row.target_identifier,
    metadata: parseMetadata(row.metadata_json),
    createdAt: row.created_at,
  }));

  return json({ ok: true, events });
}
