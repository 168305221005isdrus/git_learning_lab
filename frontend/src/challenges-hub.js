// Git Learning Lab — Challenges hub (P3, Part H): direct top-level access to
// every module's challenge, without first opening its lesson. Reuses the
// same renderChallenge component the lesson pages embed (ADR-013: one
// replay implementation, server-authoritative).
import { MODULES, moduleTitle } from "./modules-meta.js";
import { renderChallenge } from "./challenge-component.js";
import { t } from "./i18n.js";

export function renderChallengesHub(container, { api }) {
  container.innerHTML = "";
  container.appendChild(Object.assign(document.createElement("h2"), { textContent: t("navChallenges") }));

  MODULES.filter((m) => m.challengeId).forEach((mod) => {
    const section = document.createElement("section");
    section.className = "hub-item";
    section.appendChild(Object.assign(document.createElement("h3"), { textContent: moduleTitle(mod) }));
    const challengeHost = document.createElement("div");
    renderChallenge(challengeHost, mod.challengeId, {
      api,
      onResult: ({ passed }) => {
        if (passed) api.postProgress(mod.id, "completed").catch(() => {});
      },
    });
    section.appendChild(challengeHost);
    container.appendChild(section);
  });
}
