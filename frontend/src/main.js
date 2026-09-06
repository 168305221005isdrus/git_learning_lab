// Git Learning Lab — frontend entry (P2).
import { api } from "./api.js";
import { createSimulatorWorkspace } from "./simulator-workspace.js";
import { renderLessonsPanel } from "./lessons-panel.js";
import { renderProgressPanel } from "./progress-panel.js";
import { renderCheatsheet } from "./cheatsheet.js";
import { renderAdminPanel } from "./admin-panel.js";

const loginScreen = document.getElementById("login-screen");
const forceChangeScreen = document.getElementById("force-change-screen");
const appShell = document.getElementById("app-shell");
const identityBar = document.getElementById("identity-bar");
const identityText = document.getElementById("identity-text");
const adminNavBtn = document.getElementById("admin-nav-btn");

const panelRendered = new Set();

async function renderPanelIfNeeded(targetId, user) {
  if (panelRendered.has(targetId)) return;
  panelRendered.add(targetId);

  const container = document.getElementById(targetId);
  if (targetId === "lessons") await renderLessonsPanel(container, { api });
  else if (targetId === "simulator") createSimulatorWorkspace(container);
  else if (targetId === "progress") await renderProgressPanel(container, { api });
  else if (targetId === "cheatsheet") renderCheatsheet(container);
  else if (targetId === "admin" && user.role === "ADMIN") await renderAdminPanel(container, { api });
}

function wireNav(user) {
  const buttons = Array.from(document.querySelectorAll(".nav-btn"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  buttons.forEach((btn) => {
    if (btn.hidden) return;
    btn.addEventListener("click", async () => {
      const target = btn.dataset.target;
      buttons.forEach((b) => b.setAttribute("aria-current", String(b === btn)));
      panels.forEach((p) => {
        p.hidden = p.id !== target;
      });
      await renderPanelIfNeeded(target, user);
    });
  });
}

async function showAuthenticatedApp(user) {
  loginScreen.hidden = true;
  forceChangeScreen.hidden = true;
  appShell.hidden = false;
  identityBar.hidden = false;
  identityText.textContent = `Signed in as ${user.identifier} (${user.role})`;
  adminNavBtn.hidden = user.role !== "ADMIN";

  wireNav(user);
  await renderPanelIfNeeded("lessons", user);
}

function showLoginScreen() {
  loginScreen.hidden = false;
  forceChangeScreen.hidden = true;
  appShell.hidden = true;
  identityBar.hidden = true;
}

function showForceChangeScreen() {
  loginScreen.hidden = true;
  forceChangeScreen.hidden = false;
  appShell.hidden = true;
  identityBar.hidden = true;
}

async function bootstrap() {
  const res = await api.session();
  if (!res.ok) {
    showLoginScreen();
    return;
  }
  if (res.data.user.mustChangePassword) {
    showForceChangeScreen();
    return;
  }
  await showAuthenticatedApp(res.data.user);
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const identifier = document.getElementById("login-identifier").value.trim();
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";

  const res = await api.login(identifier, password);
  if (!res.ok) {
    errorEl.textContent =
      res.data?.error === "recovery_credential_expired"
        ? "Your temporary credential has expired. Contact your Admin for a new one."
        : "Invalid username or password.";
    return;
  }
  document.getElementById("login-password").value = "";
  if (res.data.user.mustChangePassword) showForceChangeScreen();
  else await showAuthenticatedApp(res.data.user);
});

document.getElementById("change-password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById("new-password").value;
  const errorEl = document.getElementById("change-password-error");
  errorEl.textContent = "";

  const res = await api.changePassword(newPassword);
  if (!res.ok) {
    errorEl.textContent = res.data?.error === "password_too_short" ? "Password must be at least 8 characters." : "Could not set new password.";
    return;
  }
  document.getElementById("new-password").value = "";
  await showAuthenticatedApp(res.data.user);
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await api.logout();
  panelRendered.clear();
  document.querySelectorAll("[data-panel]").forEach((p) => {
    p.innerHTML = "";
  });
  showLoginScreen();
});

// P1 wiring proof, kept as-is: a direct, unauthenticated, cross-origin health
// check against the Worker (docs/ARCHITECTURE_DECISIONS.md ADR-015 — this is
// the one route deliberately NOT routed through the same-origin proxy).
const WORKER_HEALTH_URL = "https://git-learning-lab-api.git-learning-lab.workers.dev/api/health";
async function checkApiHealth() {
  const statusEl = document.getElementById("api-health-status");
  if (!statusEl) return;
  try {
    const res = await fetch(WORKER_HEALTH_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    statusEl.textContent = body.ok ? "reachable ✓" : "responded, but not ok";
  } catch {
    statusEl.textContent = "not reachable";
  }
}

bootstrap();
checkApiHealth();
