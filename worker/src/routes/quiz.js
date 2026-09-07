/**
 * Git Learning Lab — Quiz routes (P3): QUIZ-001..003. P8: bounded random
 * subset per attempt (see shared/quiz-data.js's design note).
 *
 * Scoring is computed here, server-side, from shared/quiz-data.js's trusted
 * answer key (scoreQuizAttempt) — never from a client-reported score. Every
 * read/write is scoped to sessionUser.id, resolved server-side from the
 * session (ROLE-002/PROG-004 applied to quiz results).
 *
 * The subset of questions actually served for this submission is computed
 * HERE, independently of anything the client claims — the Worker never
 * accepts a client-declared list of question ids/order (see
 * buildQuizAttemptSeed's doc comment in shared/quiz-data.js for why this is
 * secure without a new D1 table or session-token mechanism).
 */
import { json, safeError } from "../http.js";
import { scoreQuizAttempt, buildQuizAttemptSeed } from "../../../shared/quiz-data.js";
import { upsertQuizResult, getQuizResultsForUser, getQuizResultForUser } from "../db.js";

export async function handleGetQuizResults(request, env, sessionUser) {
  const results = await getQuizResultsForUser(env, sessionUser.id);
  return json({ ok: true, results });
}

export async function handleSubmitQuiz(request, env, sessionUser) {
  let body;
  try {
    body = await request.json();
  } catch {
    return safeError(400, "invalid_request");
  }
  const quizId = typeof body.quizId === "string" ? body.quizId.trim() : "";
  const answers = body.answers;
  if (!quizId || !Array.isArray(answers)) return safeError(400, "invalid_request");

  // Read the PREVIOUS attempt (if any) BEFORE upserting the new one, so the
  // seed always reflects "the attempt before this one" — this is what the
  // frontend also read moments earlier to decide which subset to render.
  const previous = await getQuizResultForUser(env, sessionUser.id, quizId);
  const seedKey = buildQuizAttemptSeed(sessionUser.id, quizId, previous?.updated_at);

  const scored = scoreQuizAttempt(quizId, seedKey, answers);
  if (!scored.ok) return safeError(400, scored.error);

  await upsertQuizResult(env, sessionUser.id, quizId, {
    correctCount: scored.correctCount,
    total: scored.total,
    percent: scored.percent,
  });

  return json({
    ok: true,
    correctCount: scored.correctCount,
    total: scored.total,
    percent: scored.percent,
    results: scored.results,
  });
}
