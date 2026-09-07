// Git Learning Lab — Challenges hub (P3, Part H): direct top-level access to
// every module's challenge, without first opening its lesson. Reuses the
// same renderChallenge component the lesson pages embed (ADR-013: one
// replay implementation, server-authoritative).
//
// P8: also lists each module's enrichment challenge VARIANTS (shared/
// challenges.js's "variant: true" entries), clearly labeled as such —
// completion only ever requires the module's original REQUIRED challenge id
// (shared/curriculum.js is unchanged), never a variant.
import { MODULES, moduleTitle } from "./modules-meta.js";
import { renderChallenge } from "./challenge-component.js";
import { listChallengesForModule } from "../../shared/challenges.js";
import { t } from "./i18n.js";

function renderChallengeSection(container, mod, challengeId, { api, optional }) {
  const section = document.createElement("section");
  section.className = "hub-item";
  const heading = document.createElement("h3");
  heading.textContent = moduleTitle(mod) + (optional ? ` (${t("challengeVariantLabel")})` : "");
  section.appendChild(heading);
  const challengeHost = document.createElement("div");
  renderChallenge(challengeHost, challengeId, {
    api,
    onResult: ({ passed }) => {
      // Only the module's REQUIRED challenge id ever marks the lesson
      // "completed" — an enrichment variant passing never touches progress,
      // matching Owner spec §10/§17's required-vs-optional separation.
      if (passed && challengeId === mod.challengeId) api.postProgress(mod.id, "completed").catch(() => {});
    },
  });
  section.appendChild(challengeHost);
  container.appendChild(section);
}

export function renderChallengesHub(container, { api }) {
  container.innerHTML = "";
  container.appendChild(Object.assign(document.createElement("h2"), { textContent: t("navChallenges") }));

  MODULES.filter((m) => m.challengeId).forEach((mod) => {
    renderChallengeSection(container, mod, mod.challengeId, { api, optional: false });
    listChallengesForModule(mod.id)
      .filter((c) => c.variant && c.id !== mod.challengeId)
      .forEach((variant) => renderChallengeSection(container, mod, variant.id, { api, optional: true }));
  });
}
