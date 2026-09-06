// Git Learning Lab — Admin panel (P2): ADMIN-001, ADMIN-002/003.
// Minimal, utilitarian (UX skill §1) — not a design priority. Never exposes
// another user's actual password (Engineering skill §17/§18).
export async function renderAdminPanel(container, { api }) {
  container.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent = "Admin";
  container.appendChild(heading);

  const usersHeading = document.createElement("h3");
  usersHeading.textContent = "Accounts";
  container.appendChild(usersHeading);

  const usersList = document.createElement("ul");
  usersList.className = "admin-user-list";
  container.appendChild(usersList);

  async function loadUsers() {
    usersList.innerHTML = "";
    const res = await api.adminListUsers();
    if (!res.ok) {
      usersList.appendChild(Object.assign(document.createElement("li"), { textContent: "Could not load accounts." }));
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
  recoveryHeading.textContent = "Issue a temporary password";
  container.appendChild(recoveryHeading);

  const form = document.createElement("form");
  form.className = "admin-recovery-form";
  const label = document.createElement("label");
  label.setAttribute("for", "recovery-identifier");
  label.textContent = "Username";
  const input = document.createElement("input");
  input.type = "text";
  input.id = "recovery-identifier";
  input.required = true;
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Issue temporary password";
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
      result.textContent = res.data?.error === "user_not_found" ? "No account with that username." : "Could not issue a temporary password.";
      return;
    }
    result.textContent = `Temporary password for ${res.data.identifier}: ${res.data.temporaryPassword} (expires ${res.data.expiresAt}). Relay this to them now — it will not be shown again.`;
    input.value = "";
  });
}
