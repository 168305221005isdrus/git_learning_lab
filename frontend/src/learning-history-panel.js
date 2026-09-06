// Git Learning Lab — Learning History panel (P4).
//
// Deliberately NOT a new audit/compliance subsystem: this reuses the exact
// same three already-persisted, already-user-scoped endpoints the Progress
// panel uses (GET /api/progress, /api/quiz-results, /api/challenge-results —
// each already isolated per-user server-side, see PROG-004/TEST-003-style
// tests) and simply renders them as a chronological timeline. No new table,
// no new column, no new Worker route.
import { MODULES, moduleTitle } from "./modules-meta.js";
import { t } from "./i18n.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function moduleTitleById(moduleId) {
  const mod = MODULES.find((m) => m.id === moduleId);
  return mod ? moduleTitle(mod) : moduleId;
}

function moduleTitleByQuizId(quizId) {
  const mod = MODULES.find((m) => m.quizId === quizId);
  return mod ? moduleTitle(mod) : quizId;
}

function moduleTitleByChallengeId(challengeId) {
  const mod = MODULES.find((m) => m.challengeId === challengeId);
  return mod ? moduleTitle(mod) : challengeId;
}

export async function renderLearningHistoryPanel(container, { api }) {
  container.innerHTML = "";
  container.appendChild(el("h2", null, t("historyHeading")));
  container.appendChild(el("p", "history-intro", t("historyIntro")));

  const [progressRes, quizRes, challengeRes] = await Promise.all([api.getProgress(), api.getQuizResults(), api.getChallengeResults()]);

  if (!progressRes.ok && !quizRes.ok && !challengeRes.ok) {
    container.appendChild(el("p", "field-error", t("historyLoadError")));
    return;
  }

  const events = [];
  if (progressRes.ok) {
    progressRes.data.progress.forEach((p) => {
      events.push({
        ts: p.updated_at,
        kind: p.status === "completed" ? "completed" : "started",
        text: p.status === "completed" ? t("historyEventModuleCompleted", moduleTitleById(p.module_id)) : t("historyEventModuleStarted", moduleTitleById(p.module_id)),
      });
    });
  }
  if (quizRes.ok) {
    quizRes.data.results.forEach((q) => {
      events.push({
        ts: q.updated_at,
        kind: "quiz",
        text: t("historyEventQuiz", moduleTitleByQuizId(q.quiz_id), q.correct_count, q.total, q.percent),
      });
    });
  }
  if (challengeRes.ok) {
    challengeRes.data.results.forEach((c) => {
      events.push({
        ts: c.updated_at,
        kind: c.passed ? "completed" : "failed",
        text: c.passed ? t("historyEventChallengePassed", moduleTitleByChallengeId(c.challenge_id)) : t("historyEventChallengeFailed", moduleTitleByChallengeId(c.challenge_id)),
      });
    });
  }

  if (events.length === 0) {
    container.appendChild(el("p", "history-empty", t("historyEmpty")));
    return;
  }

  events.sort((a, b) => new Date(b.ts) - new Date(a.ts));

  container.appendChild(el("p", "history-last-activity", t("historyLastActivity", events[0].ts)));

  const list = el("ul", "history-list");
  events.forEach((ev) => {
    const li = el("li", `history-item history-item--${ev.kind}`);
    li.appendChild(el("span", "history-item-text", ev.text));
    li.appendChild(el("span", "history-item-time", ev.ts));
    list.appendChild(li);
  });
  container.appendChild(list);
}
