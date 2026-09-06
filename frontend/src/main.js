// Git Learning Lab — frontend entry (P2).
import { api } from "./api.js";
import { createSimulatorWorkspace } from "./simulator-workspace.js";
import { renderLessonsPanel, openModuleFromOutside } from "./lessons-panel.js";
import { renderProgressPanel } from "./progress-panel.js";
import { renderDashboardPanel } from "./dashboard-panel.js";
import { renderLearningHistoryPanel } from "./learning-history-panel.js";
import { renderCertificatePanel } from "./certificate-panel.js";
import { renderVerifyScreen } from "./verify-panel.js";
import { renderCheatsheet } from "./cheatsheet.js";
import { renderAdminPanel } from "./admin-panel.js";
import { renderQuizzesHub } from "./quizzes-hub.js";
import { renderChallengesHub } from "./challenges-hub.js";
import { renderOnboarding } from "./onboarding.js";
import { t } from "./i18n.js";

const loginScreen = document.getElementById("login-screen");
const registerScreen = document.getElementById("register-screen");
const forceChangeScreen = document.getElementById("force-change-screen");
const verifyScreen = document.getElementById("verify-screen");
const appShell = document.getElementById("app-shell");
const identityBar = document.getElementById("identity-bar");
const identityText = document.getElementById("identity-text");
const adminNavBtn = document.getElementById("admin-nav-btn");
const certificateNavBtn = document.getElementById("certificate-nav-btn");

const panelRendered = new Set();
let pendingModuleId = null;

// Progress/Dashboard/History are read-only views with no in-progress
// interactive state to lose (unlike Lessons/Simulator/Quizzes/Challenges,
// which hold a live terminal or an in-progress quiz form that a re-render
// would destroy) — so they always refresh on nav, instead of only once per
// session (P3.5 fix, extended in P4 to the two new panels for the same
// reason: a learner who completes a quiz/challenge after already having
// opened one of these must see the up-to-date status without a full reload).
const ALWAYS_REFRESH = new Set(["progress", "dashboard", "history", "certificate"]);

function goToModule(moduleId) {
  pendingModuleId = moduleId;
  const lessonsBtn = document.querySelector('.nav-btn[data-target="lessons"]');
  if (lessonsBtn) lessonsBtn.click();
}

function goToCertificate() {
  const certificateBtn = document.querySelector('.nav-btn[data-target="certificate"]');
  if (certificateBtn) certificateBtn.click();
}

async function renderPanelIfNeeded(targetId, user) {
  if (panelRendered.has(targetId) && !ALWAYS_REFRESH.has(targetId)) return;
  panelRendered.add(targetId);

  const container = document.getElementById(targetId);
  if (targetId === "dashboard") await renderDashboardPanel(container, { api, user, onContinue: goToModule, onGoToCertificate: goToCertificate });
  else if (targetId === "lessons") await renderLessonsPanel(container, { api });
  else if (targetId === "simulator") createSimulatorWorkspace(container);
  else if (targetId === "challenges") renderChallengesHub(container, { api });
  else if (targetId === "quizzes") renderQuizzesHub(container, { api });
  else if (targetId === "progress") await renderProgressPanel(container, { api });
  else if (targetId === "history") await renderLearningHistoryPanel(container, { api });
  else if (targetId === "certificate" && user.role === "STUDENT") await renderCertificatePanel(container, { api });
  else if (targetId === "cheatsheet") renderCheatsheet(container);
  else if (targetId === "howto") renderOnboarding(container);
  else if (targetId === "admin" && user.role === "ADMIN") await renderAdminPanel(container, { api });
}

async function activatePanel(target, user) {
  const buttons = Array.from(document.querySelectorAll(".nav-btn"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  buttons.forEach((b) => b.setAttribute("aria-current", String(b.dataset.target === target)));
  panels.forEach((p) => {
    p.hidden = p.id !== target;
  });
  await renderPanelIfNeeded(target, user);
  if (target === "lessons" && pendingModuleId) {
    openModuleFromOutside(pendingModuleId);
    pendingModuleId = null;
  }
}

function wireNav(user) {
  const buttons = Array.from(document.querySelectorAll(".nav-btn"));
  buttons.forEach((btn) => {
    if (btn.hidden) return;
    btn.addEventListener("click", () => activatePanel(btn.dataset.target, user));
  });
}

async function showAuthenticatedApp(user) {
  loginScreen.hidden = true;
  registerScreen.hidden = true;
  forceChangeScreen.hidden = true;
  verifyScreen.hidden = true;
  appShell.hidden = false;
  identityBar.hidden = false;
  identityText.textContent = t("signedInAs", user.identifier, user.role);
  adminNavBtn.hidden = user.role !== "ADMIN";
  certificateNavBtn.hidden = user.role !== "STUDENT";

  wireNav(user);
  await renderPanelIfNeeded("dashboard", user);
}

function showLoginScreen() {
  loginScreen.hidden = false;
  registerScreen.hidden = true;
  forceChangeScreen.hidden = true;
  verifyScreen.hidden = true;
  appShell.hidden = true;
  identityBar.hidden = true;
}

function showRegisterScreen() {
  loginScreen.hidden = true;
  registerScreen.hidden = false;
  forceChangeScreen.hidden = true;
  verifyScreen.hidden = true;
  appShell.hidden = true;
  identityBar.hidden = true;
}

function showForceChangeScreen() {
  loginScreen.hidden = true;
  registerScreen.hidden = true;
  forceChangeScreen.hidden = false;
  verifyScreen.hidden = true;
  appShell.hidden = true;
  identityBar.hidden = true;
}

// P5: public certificate verification, routed purely by location.hash — this
// is a static single-page app with no server-side router (Cloudflare Pages
// serves only frontend/public/index.html), so a shareable "check this
// certificate" link that must work for a logged-out visitor is expressed as
// a hash fragment (never sent to any server) rather than a real path.
function parseVerifyHash() {
  const hash = location.hash;
  if (!hash.startsWith("#verify")) return null;
  const queryIndex = hash.indexOf("?");
  const params = new URLSearchParams(queryIndex === -1 ? "" : hash.slice(queryIndex + 1));
  return { id: params.get("id") || "" };
}

function showVerifyScreen(parsed) {
  loginScreen.hidden = true;
  registerScreen.hidden = true;
  forceChangeScreen.hidden = true;
  appShell.hidden = true;
  identityBar.hidden = true;
  verifyScreen.hidden = false;
  renderVerifyScreen(verifyScreen, {
    api,
    initialId: parsed.id,
    onBack: () => {
      location.hash = "";
      routeFromHash();
    },
  });
}

async function routeFromHash() {
  const parsed = parseVerifyHash();
  if (parsed) {
    showVerifyScreen(parsed);
    return;
  }
  await bootstrap();
}

window.addEventListener("hashchange", routeFromHash);

// Password visibility toggle (P4): a plain type="password"/"text" swap, no
// library. Applies to every password field across Login/Register.
function wirePasswordToggle(inputId, toggleBtnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(toggleBtnId);
  if (!input || !btn) return;
  btn.addEventListener("click", () => {
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    btn.textContent = showing ? t("showPassword") : t("hidePassword");
    btn.setAttribute("aria-pressed", String(!showing));
    input.focus();
  });
}
wirePasswordToggle("login-password", "login-password-toggle");
wirePasswordToggle("reg-password", "reg-password-toggle");
wirePasswordToggle("reg-confirm-password", "reg-confirm-password-toggle");

document.getElementById("go-to-register-btn").addEventListener("click", () => {
  document.getElementById("register-error").textContent = "";
  document.getElementById("register-success").textContent = "";
  showRegisterScreen();
});

document.getElementById("go-to-login-btn").addEventListener("click", () => {
  document.getElementById("login-error").textContent = "";
  showLoginScreen();
});

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
    errorEl.textContent = res.data?.error === "recovery_credential_expired" ? t("recoveryExpired") : t("invalidCredentials");
    return;
  }
  document.getElementById("login-password").value = "";
  if (res.data.user.mustChangePassword) showForceChangeScreen();
  else await showAuthenticatedApp(res.data.user);
});

const REGISTER_ERROR_KEYS = {
  full_name_required: "regErrFullNameRequired",
  invalid_username: "regErrInvalidUsername",
  username_taken: "regErrUsernameTaken",
  invalid_student_id: "regErrInvalidStudentId",
  student_id_taken: "regErrStudentIdTaken",
  password_too_short: "regErrPasswordTooShort",
  passwords_do_not_match: "regErrPasswordsDoNotMatch",
  invalid_email_domain: "regErrInvalidEmailDomain",
  email_taken: "regErrEmailTaken",
  registration_conflict: "regErrConflict",
};

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("register-error");
  const successEl = document.getElementById("register-success");
  errorEl.textContent = "";
  successEl.textContent = "";

  const payload = {
    fullName: document.getElementById("reg-full-name").value.trim(),
    username: document.getElementById("reg-username").value.trim(),
    studentId: document.getElementById("reg-student-id").value.trim(),
    email: document.getElementById("reg-email").value.trim(),
    password: document.getElementById("reg-password").value,
    confirmPassword: document.getElementById("reg-confirm-password").value,
  };

  const submitBtn = document.getElementById("register-submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = t("registerSubmitting");

  const res = await api.register(payload);

  submitBtn.disabled = false;
  submitBtn.textContent = t("registerSubmit");

  if (!res.ok) {
    errorEl.textContent = t(REGISTER_ERROR_KEYS[res.data?.error] || "regErrGeneric");
    return;
  }

  successEl.textContent = t("registerSuccess");
  ["reg-full-name", "reg-username", "reg-student-id", "reg-email", "reg-password", "reg-confirm-password"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  await showAuthenticatedApp(res.data.user);
});

document.getElementById("change-password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById("new-password").value;
  const errorEl = document.getElementById("change-password-error");
  errorEl.textContent = "";

  const res = await api.changePassword(newPassword);
  if (!res.ok) {
    errorEl.textContent = res.data?.error === "password_too_short" ? t("passwordTooShort") : t("couldNotSetPassword");
    return;
  }
  document.getElementById("new-password").value = "";
  await showAuthenticatedApp(res.data.user);
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await api.logout();
  panelRendered.clear();
  pendingModuleId = null;
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
    statusEl.textContent = body.ok ? t("apiHealthReachable") : t("apiHealthNotOk");
  } catch {
    statusEl.textContent = t("apiHealthUnreachable");
  }
}

routeFromHash();
checkApiHealth();
