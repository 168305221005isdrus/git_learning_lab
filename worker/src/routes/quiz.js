/**
 * Git Learning Lab — Quiz routes (P3): QUIZ-001..003.
 *
 * Scoring is computed here, server-side, from shared/quiz-data.js's trusted
 * answer key (scoreQuiz) — never from a client-reported score. Every
 * read/write is scoped to sessionUser.id, resolved server-side from the
 * session (ROLE-002/PROG-004 applied to quiz results).
 */
import { json, safeError } from "../http.js";
import { scoreQuiz } from "../../../shared/quiz-data.js";
import { upsertQuizResult, getQuizResultsForUser } from "../db.js";

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

  const scored = scoreQuiz(quizId, answers);
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
