// Git Learning Lab — module metadata (P3, refactored P5): the single place
// that associates each curriculum module (docs/LEARNING_OBJECTIVES.md) with
// its display title, so lessons-panel.js and progress-panel.js don't each
// hand-roll their own copy (Engineering skill §6 applied to frontend
// wiring, not just simulator state). The quiz/challenge id association
// itself now lives in shared/curriculum.js (P5) — the same authoritative
// list the Worker's course-completion evaluator uses — so this file only
// adds the frontend-only titleKey/implemented fields on top of it.
import { t } from "./i18n.js";
import { CURRICULUM_MODULES } from "../../shared/curriculum.js";

const TITLE_KEYS = {
  "module-1": "moduleTitle1",
  "module-2": "moduleTitle2",
  "module-3": "moduleTitle3",
  "module-4": "moduleTitle4",
  "module-5": "moduleTitle5",
  "module-6": "moduleTitle6",
  "module-7": "moduleTitle7",
};

// P8: optional/enrichment quizzes that exist in shared/quiz-data.js but are
// deliberately NOT part of shared/curriculum.js's completion-authoritative
// quizId — display-layer only, so adding one here can never change what
// shared/completion.js requires (Owner spec §1/§10: "Module 7 quiz remains
// OPTIONAL for course completion").
const OPTIONAL_QUIZ_IDS = { "module-7": "module-7" };

export const MODULES = CURRICULUM_MODULES.map((mod) => ({
  ...mod,
  titleKey: TITLE_KEYS[mod.id],
  implemented: true,
  optionalQuizId: OPTIONAL_QUIZ_IDS[mod.id] || null,
}));

export function moduleTitle(mod) {
  return t(mod.titleKey);
}
