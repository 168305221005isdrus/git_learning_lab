/**
 * Git Learning Lab — course-completion status route (P5).
 *
 * The ONLY thing this route does is fetch this user's own persisted
 * progress/quiz/challenge rows and run them through the shared, authoritative
 * evaluator (shared/completion.js) — never a client-supplied percentage or
 * completion claim. Scoped to sessionUser.id exactly like every other P2/P3
 * results route (ROLE-002/PROG-004).
 */
import { json } from "../http.js";
import { getProgressForUser, getQuizResultsForUser, getChallengeResultsForUser } from "../db.js";
import { evaluateCompletion } from "../../../shared/completion.js";

export async function computeCompletionForUser(env, userId) {
  const [progress, quizResults, challengeResults] = await Promise.all([
    getProgressForUser(env, userId),
    getQuizResultsForUser(env, userId),
    getChallengeResultsForUser(env, userId),
  ]);
  return evaluateCompletion({ progress, quizResults, challengeResults });
}

export async function handleGetCompletion(request, env, sessionUser) {
  const completion = await computeCompletionForUser(env, sessionUser.id);
  return json({ ok: true, completion });
}
