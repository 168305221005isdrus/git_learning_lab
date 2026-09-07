// Git Learning Lab — Quizzes hub (P3, Part H): direct top-level access to
// every module's quiz, without first opening its lesson. Reuses the same
// renderQuiz component the lesson pages embed (QUIZ-002: one implementation).
//
// P8: also lists each module's OPTIONAL/enrichment quiz (currently only
// Module 7's capstone quiz), clearly labeled as such, plus a "review this
// lesson" link back into the Lessons panel (Learning Reinforcement).
import { MODULES, moduleTitle } from "./modules-meta.js";
import { openModuleFromOutside } from "./lessons-panel.js";
import { renderQuiz } from "./quiz-component.js";
import { t } from "./i18n.js";

function renderQuizSection(container, mod, quizId, { api, user, optional }) {
  const section = document.createElement("section");
  section.className = "hub-item";
  const heading = document.createElement("h3");
  heading.textContent = moduleTitle(mod) + (optional ? ` (${t("quizOptionalLabel")})` : "");
  section.appendChild(heading);
  const quizHost = document.createElement("div");
  renderQuiz(quizHost, quizId, {
    api,
    user,
    onReviewLesson: () => openModuleFromOutside(mod.id),
  });
  section.appendChild(quizHost);
  container.appendChild(section);
}

export function renderQuizzesHub(container, { api, user }) {
  container.innerHTML = "";
  container.appendChild(Object.assign(document.createElement("h2"), { textContent: t("navQuizzes") }));

  MODULES.forEach((mod) => {
    if (mod.quizId) renderQuizSection(container, mod, mod.quizId, { api, user, optional: false });
    if (mod.optionalQuizId) renderQuizSection(container, mod, mod.optionalQuizId, { api, user, optional: true });
  });
}
