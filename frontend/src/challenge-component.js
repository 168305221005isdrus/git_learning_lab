// Git Learning Lab — reusable Challenge component (P3, CHAL-001..005, ADR-013).
//
// This component NEVER decides pass/fail itself (UX skill §5 Tier D — the
// terminal/visualizer UI must never decide challenge pass/fail or trust a
// client-side-only completion signal). It only:
//   1. loads the challenge's authoritative starting state (from
//      shared/challenges.js, the SAME definition the Worker uses) into a
//      simulator workspace,
//   2. records the learner's command transcript as they type,
//   3. sends {challengeId, transcript} to the Worker on submit,
//   4. renders whatever the Worker's response says — nothing else counts.
import { getChallenge } from "../../shared/challenges.js";
import { createSimulatorWorkspace } from "./simulator-workspace.js";
import { t } from "./i18n.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderChallenge(container, challengeId, { api, onResult } = {}) {
  const challenge = getChallenge(challengeId);
  container.innerHTML = "";
  if (!challenge) {
    container.appendChild(el("p", "field-error", t("challengeLoadError")));
    return;
  }

  container.appendChild(el("h3", null, challenge.title));

  const goalBlock = el("p", "challenge-goal");
  const goalLabel = el("strong", null, `${t("challengeGoalLabel")}: `);
  goalBlock.appendChild(goalLabel);
  goalBlock.appendChild(document.createTextNode(challenge.goal));
  container.appendChild(goalBlock);

  let hintLevel = 0;
  const hintsBox = el("div", "challenge-hints");
  const hintBtn = el("button", "challenge-hint-btn", t("challengeShowHint"));
  hintBtn.type = "button";
  hintBtn.addEventListener("click", () => {
    if (hintLevel >= challenge.hints.length) return;
    const hintLine = el("p", "challenge-hint-line");
    hintLine.appendChild(el("strong", null, `${t("challengeHintLabel")} ${hintLevel + 1}: `));
    hintLine.appendChild(document.createTextNode(challenge.hints[hintLevel]));
    hintsBox.appendChild(hintLine);
    hintLevel += 1;
    if (hintLevel >= challenge.hints.length) hintBtn.disabled = true;
  });
  container.appendChild(hintBtn);
  container.appendChild(hintsBox);

  const workspaceHost = document.createElement("div");
  container.appendChild(workspaceHost);

  const resultBox = el("p", "challenge-result");
  resultBox.setAttribute("role", "status");
  container.appendChild(resultBox);

  const actions = el("div", "challenge-actions");
  const submitBtn = el("button", null, t("challengeSubmit"));
  submitBtn.type = "button";
  const resetBtn = el("button", "challenge-reset-btn", t("challengeReset"));
  resetBtn.type = "button";
  actions.append(submitBtn, resetBtn);
  container.appendChild(actions);

  let workspace;
  function mountWorkspace() {
    const { state, remoteState } = challenge.buildStartingState();
    workspace = createSimulatorWorkspace(workspaceHost, { initialState: state, initialRemoteState: remoteState });
  }
  mountWorkspace();

  resetBtn.addEventListener("click", () => {
    resultBox.textContent = "";
    resultBox.className = "challenge-result";
    mountWorkspace();
  });

  submitBtn.addEventListener("click", async () => {
    submitBtn.disabled = true;
    resultBox.textContent = t("challengeSubmitting");
    resultBox.className = "challenge-result";

    const transcript = workspace.getTranscript();
    const res = await api.submitChallenge(challengeId, transcript);
    submitBtn.disabled = false;

    if (!res.ok) {
      resultBox.textContent = t("challengeNetworkError");
      resultBox.className = "challenge-result challenge-result--error";
      return;
    }

    const passed = !!res.data.passed;
    resultBox.textContent = passed ? t("challengePassed") : t("challengeFailed");
    resultBox.className = "challenge-result " + (passed ? "challenge-result--passed" : "challenge-result--failed");

    if (onResult) onResult({ challengeId, passed });
  });
}
