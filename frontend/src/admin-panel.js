// Git Learning Lab — Admin panel (P2): ADMIN-001, ADMIN-002/003.
// Minimal, utilitarian (UX skill §1) — not a design priority. Never exposes
// another user's actual password (Engineering skill §17/§18).
import { t } from "./i18n.js";

export async function renderAdminPanel(container, { api }) {
  container.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent = t("adminHeading");
  container.appendChild(heading);

  const usersHeading = document.createElement("h3");
  usersHeading.textContent = t("adminAccountsHeading");
  container.appendChild(usersHeading);

  const usersList = document.createElement("ul");
  usersList.className = "admin-user-list";
  container.appendChild(usersList);

  async function loadUsers() {
    usersList.innerHTML = "";
    const res = await api.adminListUsers();
    if (!res.ok) {
      usersList.appendChild(Object.assign(document.createElement("li"), { textContent: t("adminLoadError") }));
      return;
    }
    res.data.users.forEach((u) => {
      const li = document.createElement("li");
      li.textContent = `${u.identifier} — ${u.role}`;
      usersList.appendChild(li);
    });
  }
  await loadUsers();

  const recoveryHeading = document.createElement("h3");
  recoveryHeading.textContent = t("adminIssueHeading");
  container.appendChild(recoveryHeading);

  const form = document.createElement("form");
  form.className = "admin-recovery-form";
  const label = document.createElement("label");
  label.setAttribute("for", "recovery-identifier");
  label.textContent = t("username");
  const input = document.createElement("input");
  input.type = "text";
  input.id = "recovery-identifier";
  input.required = true;
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = t("adminIssueButton");
  form.append(label, input, submitBtn);
  container.appendChild(form);

  const result = document.createElement("p");
  result.className = "admin-recovery-result";
  result.setAttribute("role", "status");
  container.appendChild(result);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = input.value.trim();
    if (!identifier) return;
    const res = await api.adminIssueRecovery(identifier);
    if (!res.ok) {
      result.textContent = res.data?.error === "user_not_found" ? t("adminUserNotFound") : t("adminIssueError");
      return;
    }
    result.textContent = `${res.data.identifier}: ${res.data.temporaryPassword} (${res.data.expiresAt} หมดอายุ) — แจ้งให้ผู้ใช้ทราบตอนนี้เลย จะไม่แสดงซ้ำอีก`;
    input.value = "";
  });

  await renderStaffCreateSection(container, { api, loadUsers });
  await renderAuditLogSection(container, { api });
}

// P11 — Admin-only staff (TEACHER/ADMIN) account creation. Owner Decision,
// dated 2026-09-07: STUDENT is never selectable here (public Register stays
// the only STUDENT path); a Teacher/Admin created this way must set their
// own password on first login (reuses RECOV-002..006's existing mechanism).
async function renderStaffCreateSection(container, { api, loadUsers }) {
  const heading = document.createElement("h3");
  heading.textContent = t("staffCreateHeading");
  container.appendChild(heading);

  const intro = document.createElement("p");
  intro.className = "screen-intro";
  intro.textContent = t("staffCreateIntro");
  container.appendChild(intro);

  const form = document.createElement("form");
  form.className = "staff-create-form";

  function field(labelText, inputEl, helpText) {
    const wrap = document.createElement("div");
    wrap.className = "staff-create-field";
    const label = document.createElement("label");
    label.setAttribute("for", inputEl.id);
    label.textContent = labelText;
    wrap.append(label, inputEl);
    if (helpText) {
      const help = document.createElement("p");
      help.className = "field-help";
      help.textContent = helpText;
      wrap.appendChild(help);
    }
    form.appendChild(wrap);
    return wrap;
  }

  const fullNameInput = document.createElement("input");
  fullNameInput.type = "text";
  fullNameInput.id = "staff-full-name";
  fullNameInput.maxLength = 100;
  field(t("staffCreateFullNameLabel"), fullNameInput);

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.id = "staff-username";
  usernameInput.required = true;
  usernameInput.minLength = 3;
  usernameInput.maxLength = 32;
  field(t("staffCreateUsernameLabel"), usernameInput, t("staffCreateUsernameHelp"));

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.id = "staff-email";
  field(t("staffCreateEmailLabel"), emailInput, t("staffCreateEmailHelp"));

  const roleSelect = document.createElement("select");
  roleSelect.id = "staff-role";
  roleSelect.required = true;
  const teacherOption = document.createElement("option");
  teacherOption.value = "TEACHER";
  teacherOption.textContent = t("staffCreateRoleTeacher");
  const adminOption = document.createElement("option");
  adminOption.value = "ADMIN";
  adminOption.textContent = t("staffCreateRoleAdmin");
  // Deliberately no STUDENT <option> here — REG-002/P11 §11: staff creation
  // never offers Student as a choice, public Register remains the only path.
  roleSelect.append(teacherOption, adminOption);
  field(t("staffCreateRoleLabel"), roleSelect);

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "btn btn-primary";
  submitBtn.textContent = t("staffCreateSubmit");
  form.appendChild(submitBtn);

  container.appendChild(form);

  const errorEl = document.createElement("p");
  errorEl.className = "field-error";
  errorEl.setAttribute("role", "alert");
  container.appendChild(errorEl);

  const resultBox = document.createElement("div");
  resultBox.className = "staff-create-result";
  resultBox.hidden = true;
  resultBox.setAttribute("role", "status");
  container.appendChild(resultBox);

  const STAFF_ERROR_KEYS = {
    invalid_role: "staffErrInvalidRole",
    invalid_username: "staffErrInvalidUsername",
    username_taken: "staffErrUsernameTaken",
    invalid_email_domain: "staffErrInvalidEmailDomain",
    email_taken: "staffErrEmailTaken",
    registration_conflict: "staffErrUsernameTaken",
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    resultBox.hidden = true;
    resultBox.innerHTML = "";

    const payload = {
      identifier: usernameInput.value.trim(),
      fullName: fullNameInput.value.trim(),
      email: emailInput.value.trim(),
      role: roleSelect.value,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = t("staffCreateSubmitting");
    const res = await api.adminCreateStaff(payload);
    submitBtn.disabled = false;
    submitBtn.textContent = t("staffCreateSubmit");

    if (!res.ok) {
      errorEl.textContent = t(STAFF_ERROR_KEYS[res.data?.error] || "staffErrGeneric");
      return;
    }

    renderStaffCreateResult(resultBox, res.data);
    form.reset();
    await loadUsers();
  });
}

function renderStaffCreateResult(resultBox, data) {
  resultBox.hidden = false;

  const heading = document.createElement("h4");
  heading.textContent = t("staffCreateResultHeading");
  resultBox.appendChild(heading);

  const roleLabel = data.role === "ADMIN" ? t("staffCreateRoleAdmin") : t("staffCreateRoleTeacher");

  const lines = [
    [t("staffCreateResultUsernameLabel"), data.identifier],
    [t("staffCreateResultRoleLabel"), roleLabel],
  ];
  lines.forEach(([label, value]) => {
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = label;
    p.append(strong, document.createTextNode(value));
    resultBox.appendChild(p);
  });

  const credentialRow = document.createElement("p");
  const credentialLabel = document.createElement("strong");
  credentialLabel.textContent = t("staffCreateResultPasswordLabel");
  const credentialValue = document.createElement("code");
  credentialValue.className = "staff-create-credential";
  credentialValue.textContent = data.temporaryPassword;
  credentialValue.tabIndex = 0;
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "btn btn-secondary staff-copy-btn";
  copyBtn.textContent = t("staffCreateCopyButton");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(data.temporaryPassword);
      copyBtn.textContent = t("staffCreateCopySuccess");
      setTimeout(() => {
        copyBtn.textContent = t("staffCreateCopyButton");
      }, 2000);
    } catch {
      // Clipboard API unavailable/denied — the credential is still visible
      // and selectable as plain text, so this is a soft failure only.
    }
  });
  credentialRow.append(credentialLabel, credentialValue, copyBtn);
  resultBox.appendChild(credentialRow);

  const expiryP = document.createElement("p");
  expiryP.textContent = t("staffCreateResultExpiryLabel", data.expiresAt);
  resultBox.appendChild(expiryP);

  const warning = document.createElement("p");
  warning.className = "staff-create-warning";
  warning.textContent = t("staffCreateCopyNowWarning");
  resultBox.appendChild(warning);

  const explanation = document.createElement("p");
  explanation.className = "field-help";
  explanation.textContent = t("staffCreateForcedChangeExplanation");
  resultBox.appendChild(explanation);
}

// P14 — Admin-only audit log view (bounded, newest-first). Utilitarian, no
// raw JSON dump, no analytics chart — a plain table with Thai-labeled event
// types, matching this panel's own minimal-design convention.
function formatAuditActor(ev) {
  if (ev.actorIdentifier) return ev.actorIdentifier;
  return ev.eventType === "student.registered" ? t("auditLogSystemActor") : t("auditLogUnknownActor");
}

function formatAuditDetails(ev) {
  const metadata = ev.metadata || {};
  switch (ev.eventType) {
    case "admin.staff.created":
      return t("auditLogDetailCreatedRole", metadata.createdRole);
    case "admin.recovery.issued":
      return t("auditLogDetailExpiresInHours", metadata.expiresInHours);
    case "auth.password.changed":
      return metadata.forced ? t("auditLogDetailForced") : t("auditLogDetailVoluntary");
    case "auth.login.failure":
      return t("auditLogDetailAttemptedIdentifier", metadata.attemptedIdentifier);
    default:
      return t("auditLogNone");
  }
}

async function renderAuditLogSection(container, { api }) {
  const heading = document.createElement("h3");
  heading.textContent = t("auditLogHeading");
  container.appendChild(heading);

  const intro = document.createElement("p");
  intro.className = "screen-intro";
  intro.textContent = t("auditLogIntro");
  container.appendChild(intro);

  const status = document.createElement("p");
  status.className = "admin-audit-status";
  status.setAttribute("role", "status");
  status.textContent = t("auditLogLoading");
  container.appendChild(status);

  const tableWrap = document.createElement("div");
  tableWrap.className = "admin-audit-table-wrap";
  container.appendChild(tableWrap);

  const res = await api.adminListAuditEvents();
  if (!res.ok) {
    status.textContent = t("auditLogLoadError");
    return;
  }

  const events = res.data.events;
  if (events.length === 0) {
    status.textContent = t("auditLogEmpty");
    return;
  }
  status.textContent = "";

  const table = document.createElement("table");
  table.className = "progress-table admin-audit-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  [t("auditLogColTime"), t("auditLogColEvent"), t("auditLogColActor"), t("auditLogColTarget"), t("auditLogColDetails")].forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  events.forEach((ev) => {
    const tr = document.createElement("tr");
    [ev.createdAt, t("auditLogEventLabel", ev.eventType), formatAuditActor(ev), ev.targetIdentifier || t("auditLogNone"), formatAuditDetails(ev)].forEach(
      (text) => {
        const td = document.createElement("td");
        td.textContent = text;
        tr.appendChild(td);
      }
    );
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableWrap.appendChild(table);
}
