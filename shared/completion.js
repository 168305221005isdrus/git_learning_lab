/**
 * Git Learning Lab — authoritative course-completion evaluator (P5).
 *
 * PURE, environment-agnostic module (no DOM/Worker APIs, no `fetch`) —
 * imported unmodified by the frontend (Dashboard/Progress display) and the
 * Cloudflare Worker (`GET /api/completion`, certificate issuance
 * authorization). This is the ONE place course-completion is decided, so
 * Dashboard, certificate issuance, and public verification never implement
 * competing logic (P5 spec §1).
 *
 * Takes ONLY already-persisted D1 rows (progress/quiz_results/
 * challenge_results, exactly as `worker/src/db.js` returns them for one
 * user) — never a client-supplied percentage, `completed`/`passed` flag, or
 * any other unverified claim. The Worker is the only caller that may use
 * this function's result to authorize an action (e.g. issuing a
 * certificate); the frontend's own call is display-only, fed by the
 * Worker's `GET /api/completion` response, not recomputed from anything the
 * client could forge.
 *
 * A module counts as complete when:
 *   - its lesson progress row has status "completed", AND
 *   - if the curriculum requires a quiz for it (shared/curriculum.js), a
 *     quiz_results row exists for that quiz (QUIZ-001/1b: no passing-score
 *     threshold is defined anywhere in this project's requirements, so
 *     "required quiz" means "attempted", matching the existing product's
 *     quiz-as-formative-assessment design — scores are shown, never gated),
 *   - if the curriculum requires a challenge for it, its challenge_results
 *     row has passed = 1.
 * Module 7's quiz is intentionally absent from shared/curriculum.js
 * (QUIZ-001b, Should-Have/optional) so it can never block completion.
 */
import { CURRICULUM_MODULES } from "./curriculum.js";

function indexBy(rows, key) {
  const out = {};
  for (const row of rows || []) out[row[key]] = row;
  return out;
}

export function evaluateCompletion({ progress, quizResults, challengeResults }) {
  const progressByModule = indexBy(progress, "module_id");
  const quizByModule = indexBy(quizResults, "quiz_id");
  const challengeByModule = indexBy(challengeResults, "challenge_id");

  const modules = CURRICULUM_MODULES.map((mod) => {
    const lessonDone = progressByModule[mod.id]?.status === "completed";
    const quizDone = !mod.quizId || Boolean(quizByModule[mod.quizId]);
    const challengeDone = !mod.challengeId || Number(challengeByModule[mod.challengeId]?.passed) === 1;

    const missing = [];
    if (!lessonDone) missing.push({ type: "lesson", moduleId: mod.id });
    if (mod.quizId && !quizDone) missing.push({ type: "quiz", moduleId: mod.id, quizId: mod.quizId });
    if (mod.challengeId && !challengeDone) missing.push({ type: "challenge", moduleId: mod.id, challengeId: mod.challengeId });

    return {
      moduleId: mod.id,
      lessonDone,
      quizDone,
      challengeDone,
      complete: lessonDone && quizDone && challengeDone,
      missing,
    };
  });

  const totalModules = modules.length;
  const completedModules = modules.filter((m) => m.complete).length;
  const percent = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;
  const isComplete = modules.every((m) => m.complete);
  const remaining = modules.flatMap((m) => m.missing);

  return { isComplete, percent, completedModules, totalModules, modules, remaining };
}
