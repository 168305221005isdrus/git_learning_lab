// Git Learning Lab — Onboarding / "วิธีใช้งาน" panel (P3, Part B).
// Short, concise — deliberately not a long manual (P3 brief: "do not
// overwhelm beginners with a long manual").
import { t } from "./i18n.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderOnboarding(container) {
  container.innerHTML = "";
  container.appendChild(el("h2", null, t("onboardingHeading")));
  container.appendChild(el("p", null, t("onboardingIntro")));

  const stepsHeading = el("h3", null, t("stagePractice") + " → " + t("stageFeedback"));
  container.appendChild(stepsHeading);
  const stepsList = el("ol", "onboarding-steps");
  t("onboardingSteps").forEach((step) => stepsList.appendChild(el("li", null, step)));
  container.appendChild(stepsList);

  const notices = [t("onboardingSimulatorNotice"), t("onboardingEditorNotice"), t("onboardingOneCommandNotice"), t("onboardingEnglishNotice")];
  const noticeList = el("ul", "onboarding-notices");
  notices.forEach((n) => noticeList.appendChild(el("li", null, n)));
  container.appendChild(noticeList);
}
