// Git Learning Lab — API client (P2).
//
// Every authenticated call is a RELATIVE /api/* path, so it is same-origin
// on git-learning-lab.pages.dev — this is what makes the ADR-011 session
// cookie work at all (see docs/ARCHITECTURE_DECISIONS.md ADR-015, the Pages
// Function reverse proxy). Never call the Worker's own hostname directly for
// anything authenticated; only the public P1 health check does that.

async function request(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { "content-type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

export const api = {
  login: (identifier, password) => request("POST", "/api/auth/login", { identifier, password }),
  logout: () => request("POST", "/api/auth/logout"),
  session: () => request("GET", "/api/auth/session"),
  changePassword: (newPassword) => request("POST", "/api/auth/change-password", { newPassword }),
  getProgress: () => request("GET", "/api/progress"),
  postProgress: (moduleId, status) => request("POST", "/api/progress", { moduleId, status }),
  adminListUsers: () => request("GET", "/api/admin/users"),
  adminIssueRecovery: (identifier) => request("POST", "/api/admin/recovery/issue", { identifier }),
};
