/**
 * Git Learning Lab — curriculum completion requirements (P5).
 *
 * PURE, environment-agnostic module (no DOM/Worker APIs) — the single place
 * that says which quiz/challenge a module needs before it counts as done.
 * Imported unmodified by the frontend (module list metadata,
 * frontend/src/modules-meta.js) and the Cloudflare Worker
 * (shared/completion.js's course-completion evaluator), so there is exactly
 * one definition of the assessment matrix — never a second, independently
 * maintained copy that could drift (same discipline as ADR-013 applies to
 * the simulator core).
 *
 * Matches docs/LEARNING_OBJECTIVES.md's locked assessment matrix: Modules
 * 1-2 are quiz-only (no challenge — nothing to simulate yet); Modules 3-6
 * require both a quiz and a challenge; Module 7 requires only its capstone
 * challenge (its quiz is Should-Have/optional per QUIZ-001b and therefore
 * has no quizId here, so it never blocks completion).
 */

export const CURRICULUM_MODULES = [
  { id: "module-1", quizId: "module-1", challengeId: null },
  { id: "module-2", quizId: "module-2", challengeId: null },
  { id: "module-3", quizId: "module-3", challengeId: "challenge-module-3" },
  { id: "module-4", quizId: "module-4", challengeId: "challenge-module-4" },
  { id: "module-5", quizId: "module-5", challengeId: "challenge-module-5" },
  { id: "module-6", quizId: "module-6", challengeId: "challenge-module-6" },
  { id: "module-7", quizId: null, challengeId: "capstone-module-7" },
];

export function getCurriculumModule(id) {
  return CURRICULUM_MODULES.find((m) => m.id === id) || null;
}
