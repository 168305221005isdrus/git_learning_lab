// Git Learning Lab — frontend entry (P1 skeleton).
// Imports the SAME shared simulator core the Worker uses (ADR-013) — this is
// not a separate/duplicated implementation, just a different runtime for the
// one shared module.
import { createInitialState, applyCommand } from "../../shared/simulator-core.js";

function wireNav() {
  const buttons = Array.from(document.querySelectorAll(".nav-btn"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;

      buttons.forEach((b) => b.setAttribute("aria-current", String(b === btn)));
      panels.forEach((p) => {
        p.hidden = p.id !== target;
      });
    });
  });
}

function proveSharedCoreWiring() {
  const statusEl = document.getElementById("simulator-core-status");
  if (!statusEl) return;

  const state = createInitialState();
  const { state: afterInit, output } = applyCommand(state, "git init");

  statusEl.textContent = afterInit.initialized
    ? `Shared simulator core loaded and working (proof: "${output}"). Full Git semantics land in P2.`
    : "Shared simulator core failed to respond as expected.";
}

async function checkApiHealth() {
  const statusEl = document.getElementById("api-health-status");
  if (!statusEl) return;

  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    statusEl.textContent = body.ok ? "reachable ✓" : "responded, but not ok";
  } catch (err) {
    statusEl.textContent = "not reachable yet (Worker may not be deployed/routed here)";
  }
}

wireNav();
proveSharedCoreWiring();
checkApiHealth();
