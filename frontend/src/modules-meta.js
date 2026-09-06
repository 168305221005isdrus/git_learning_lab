// Git Learning Lab — module metadata (P3): the single place that associates
// each curriculum module (docs/LEARNING_OBJECTIVES.md) with its quiz id
// (shared/quiz-data.js) and challenge id (shared/challenges.js), so
// lessons-panel.js and progress-panel.js don't each hand-roll their own copy
// (Engineering skill §6 applied to frontend wiring, not just simulator state).
import { t } from "./i18n.js";

export const MODULES = [
  { id: "module-1", titleKey: "moduleTitle1", implemented: true, quizId: "module-1", challengeId: null },
  { id: "module-2", titleKey: "moduleTitle2", implemented: true, quizId: "module-2", challengeId: null },
  { id: "module-3", titleKey: "moduleTitle3", implemented: true, quizId: "module-3", challengeId: "challenge-module-3" },
  { id: "module-4", titleKey: "moduleTitle4", implemented: true, quizId: "module-4", challengeId: "challenge-module-4" },
  { id: "module-5", titleKey: "moduleTitle5", implemented: true, quizId: "module-5", challengeId: "challenge-module-5" },
  { id: "module-6", titleKey: "moduleTitle6", implemented: true, quizId: "module-6", challengeId: "challenge-module-6" },
  { id: "module-7", titleKey: "moduleTitle7", implemented: true, quizId: null, challengeId: "capstone-module-7" },
];

export function moduleTitle(mod) {
  return t(mod.titleKey);
}
