// Git Learning Lab — Dashboard / home panel (P4).
//
// The learner's landing screen after login: welcome, overall completion,
// per-module status cards, and a single "continue learning" action per
// module. Reuses the exact same progress/quiz/challenge data the Progress
// panel already fetches (Engineering skill §21: no new backend, no new
// analytics beyond what's already persisted).
import { MODULES, moduleTitle } from "./modules-meta.js";
import { t } from "./i18n.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export async function renderDashboardPanel(container, { api, user, onContinue }) {
  container.innerHTML = "";
  container.appendChild(el("h2", "dashboard-welcome", t("dashboardWelcome", user.identifier)));
  container.appendChild(el("p", "dashboard-subtitle", t("dashboardSubtitle")));

  const [progressRes, quizRes, challengeRes] = await Promise.all([api.getProgress(), api.getQuizResults(), api.getChallengeResults()]);

  const progressByModule = {};
  if (progressRes.ok) progressRes.data.progress.forEach((p) => (progressByModule[p.module_id] = p));
  const quizByModule = {};
  if (quizRes.ok) quizRes.data.results.forEach((q) => (quizByModule[q.quiz_id] = q));
  const challengeByModule = {};
  if (challengeRes.ok) challengeRes.data.results.forEach((c) => (challengeByModule[c.challenge_id] = c));

  const implementedModules = MODULES.filter((m) => m.implemented);
  const completedCount = implementedModules.filter((m) => progressByModule[m.id]?.status === "completed").length;
  const overallPercent = implementedModules.length ? Math.round((completedCount / implementedModules.length) * 100) : 0;

  const overallCard = el("div", "dashboard-card dashboard-overall");
  overallCard.appendChild(el("p", "dashboard-overall-label", t("dashboardOverallLabel")));
  const barOuter = el("div", "progress-bar-outer");
  barOuter.setAttribute("role", "progressbar");
  barOuter.setAttribute("aria-valuenow", String(overallPercent));
  barOuter.setAttribute("aria-valuemin", "0");
  barOuter.setAttribute("aria-valuemax", "100");
  barOuter.setAttribute("aria-label", t("dashboardOverallLabel"));
  const barInner = el("div", "progress-bar-inner");
  barInner.style.width = `${overallPercent}%`;
  barOuter.appendChild(barInner);
  overallCard.appendChild(barOuter);
  overallCard.appendChild(el("p", "dashboard-overall-summary", `${t("dashboardOverallSummary", completedCount, implementedModules.length)} — ${overallPercent}%`));
  container.appendChild(overallCard);

  const hasAnyProgress = Object.keys(progressByModule).length > 0;
  if (!hasAnyProgress) {
    const empty = el("div", "dashboard-card dashboard-empty");
    empty.appendChild(el("p", "dashboard-empty-title", t("dashboardEmptyTitle")));
    empty.appendChild(el("p", null, t("dashboardEmptyBody")));
    const cta = el("button", "btn btn-primary", t("dashboardEmptyCta"));
    cta.type = "button";
    cta.addEventListener("click", () => onContinue(MODULES[0].id));
    empty.appendChild(cta);
    container.appendChild(empty);
  }

  container.appendChild(el("h3", "dashboard-modules-heading", t("dashboardModulesHeading")));
  const grid = el("div", "module-card-grid");
  MODULES.forEach((mod) => {
    const card = el("div", "module-card");
    card.appendChild(el("h4", "module-card-title", moduleTitle(mod)));

    const badges = el("div", "module-card-badges");
    const p = progressByModule[mod.id];
    const statusBadge = el("span", "status-badge");
    if (!mod.implemented) {
      statusBadge.classList.add("status-badge--disabled");
      statusBadge.textContent = t("dashboardComingLater");
    } else if (p?.status === "completed") {
      statusBadge.classList.add("status-badge--completed");
      statusBadge.textContent = t("statusCompleted");
    } else if (p?.status === "started") {
      statusBadge.classList.add("status-badge--started");
      statusBadge.textContent = t("statusStarted");
    } else {
      statusBadge.classList.add("status-badge--not-started");
      statusBadge.textContent = t("statusNotStarted");
    }
    badges.appendChild(statusBadge);

    const quizResult = mod.quizId ? quizByModule[mod.quizId] : null;
    if (quizResult) {
      badges.appendChild(el("span", "status-badge status-badge--info", t("dashboardQuizBadge", quizResult.percent)));
    }

    const challengeResult = mod.challengeId ? challengeByModule[mod.challengeId] : null;
    if (challengeResult) {
      badges.appendChild(
        el(
          "span",
          `status-badge ${challengeResult.passed ? "status-badge--completed" : "status-badge--not-started"}`,
          challengeResult.passed ? t("dashboardChallengePassedBadge") : t("dashboardChallengeNotPassedBadge")
        )
      );
    }
    card.appendChild(badges);

    if (mod.implemented) {
      const label = p?.status === "completed" ? t("dashboardReview") : p?.status === "started" ? t("dashboardContinue") : t("dashboardStart");
      const btn = el("button", "btn btn-secondary module-card-action", label);
      btn.type = "button";
      btn.addEventListener("click", () => onContinue(mod.id));
      card.appendChild(btn);
    }

    grid.appendChild(card);
  });
  container.appendChild(grid);
}
