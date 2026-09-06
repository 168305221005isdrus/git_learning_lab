// Git Learning Lab — Progress panel (P2, expanded P3): PROG-003.
// Shows lesson/quiz/challenge status per module at a glance (Part F/H) —
// no analytics beyond this (Engineering skill §21 scope discipline). P5
// adds one authoritative completion summary line at the top, sourced from
// GET /api/completion (shared/completion.js) — the same evaluator that
// gates certificate issuance, never a separately-computed percentage.
import { MODULES, moduleTitle } from "./modules-meta.js";
import { t } from "./i18n.js";

function statusText(status) {
  if (status === "completed") return t("statusCompleted");
  if (status === "started") return t("statusStarted");
  return t("statusNotStarted");
}

export async function renderProgressPanel(container, { api }) {
  container.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent = t("progressHeading");
  container.appendChild(heading);

  const [progressRes, quizRes, challengeRes, completionRes] = await Promise.all([
    api.getProgress(),
    api.getQuizResults(),
    api.getChallengeResults(),
    api.getCompletion(),
  ]);

  if (!progressRes.ok) {
    container.appendChild(Object.assign(document.createElement("p"), { textContent: t("progressLoadError") }));
    return;
  }

  if (completionRes.ok) {
    const completion = completionRes.data.completion;
    const summary = document.createElement("p");
    summary.className = "progress-completion-summary";
    summary.textContent = completion.isComplete
      ? t("progressCompletionDone")
      : t("progressCompletionSummary", completion.completedModules, completion.totalModules, completion.percent);
    container.appendChild(summary);
  }

  const progressByModule = {};
  progressRes.data.progress.forEach((p) => (progressByModule[p.module_id] = p));

  const quizByModule = {};
  if (quizRes.ok) quizRes.data.results.forEach((q) => (quizByModule[q.quiz_id] = q));

  const challengeByModule = {};
  if (challengeRes.ok) challengeRes.data.results.forEach((c) => (challengeByModule[c.challenge_id] = c));

  const table = document.createElement("table");
  table.className = "progress-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  [t("progressModuleCol"), t("progressLessonCol"), t("progressQuizCol"), t("progressChallengeCol")].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  MODULES.forEach((mod) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = moduleTitle(mod);
    row.appendChild(nameCell);

    const lessonCell = document.createElement("td");
    const p = progressByModule[mod.id];
    lessonCell.textContent = p ? `${statusText(p.status)} (${t("progressUpdated", p.updated_at)})` : t("statusNotStarted");
    row.appendChild(lessonCell);

    const quizCell = document.createElement("td");
    const q = mod.quizId ? quizByModule[mod.quizId] : null;
    quizCell.textContent = q ? `${q.correct_count}/${q.total} (${q.percent}%)` : t("progressNoQuiz");
    row.appendChild(quizCell);

    const challengeCell = document.createElement("td");
    const c = mod.challengeId ? challengeByModule[mod.challengeId] : null;
    challengeCell.textContent = c ? (c.passed ? t("challengePassed") : t("challengeFailed")) : t("progressNoChallenge");
    row.appendChild(challengeCell);

    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}
