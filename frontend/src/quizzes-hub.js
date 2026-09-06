// Git Learning Lab — Quizzes hub (P3, Part H): direct top-level access to
// every module's quiz, without first opening its lesson. Reuses the same
// renderQuiz component the lesson pages embed (QUIZ-002: one implementation).
import { MODULES, moduleTitle } from "./modules-meta.js";
import { renderQuiz } from "./quiz-component.js";
import { t } from "./i18n.js";

export function renderQuizzesHub(container, { api }) {
  container.innerHTML = "";
  container.appendChild(Object.assign(document.createElement("h2"), { textContent: t("navQuizzes") }));

  MODULES.filter((m) => m.quizId).forEach((mod) => {
    const section = document.createElement("section");
    section.className = "hub-item";
    section.appendChild(Object.assign(document.createElement("h3"), { textContent: moduleTitle(mod) }));
    const quizHost = document.createElement("div");
    renderQuiz(quizHost, mod.quizId, { api });
    section.appendChild(quizHost);
    container.appendChild(section);
  });
}
