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
}
