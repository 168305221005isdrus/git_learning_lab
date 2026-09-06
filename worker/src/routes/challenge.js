/**
 * Git Learning Lab — Challenge routes (P3): CHAL-002, ADR-013, TEST-006.
 *
 * This is the ONLY place a challenge's pass/fail outcome is decided. It
 * NEVER reads a `passed`/`completed` field from the request body, and it
 * NEVER accepts a client-reported final state — it accepts ONLY a challenge
 * id and an ordered array of command strings (the transcript), reconstructs
 * the challenge's authoritative starting state, and replays the transcript
 * through the exact same shared/simulator-core.js the browser used
 * (shared/challenges.js's `replayChallenge`) to derive the result itself.
 */
import { json, safeError } from "../http.js";
import { replayChallenge } from "../../../shared/challenges.js";
import { upsertChallengeResult, getChallengeResultsForUser } from "../db.js";

export async function handleGetChallengeResults(request, env, sessionUser) {
  const results = await getChallengeResultsForUser(env, sessionUser.id);
  return json({ ok: true, results });
}

export async function handleSubmitChallenge(request, env, sessionUser) {
  let body;
  try {
    body = await request.json();
  } catch {
    return safeError(400, "invalid_request");
  }

  const challengeId = typeof body.challengeId === "string" ? body.challengeId.trim() : "";
  const transcript = body.transcript;
  if (!challengeId || !Array.isArray(transcript)) return safeError(400, "invalid_request");

  // Deliberately no code path anywhere in this handler reads body.passed or
  // body.completed or body.finalState — TEST-006/CHAL-002. Only the
  // challenge id and the transcript are ever used to derive the result.
  const result = replayChallenge(challengeId, transcript);
  if (!result.ok) return safeError(400, result.error);

  await upsertChallengeResult(env, sessionUser.id, challengeId, result.passed);

  return json({ ok: true, passed: result.passed });
}
