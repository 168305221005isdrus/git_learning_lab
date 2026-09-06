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
  register: (payload) => request("POST", "/api/auth/register", payload),
  logout: () => request("POST", "/api/auth/logout"),
  session: () => request("GET", "/api/auth/session"),
  changePassword: (newPassword) => request("POST", "/api/auth/change-password", { newPassword }),
  getProgress: () => request("GET", "/api/progress"),
  postProgress: (moduleId, status) => request("POST", "/api/progress", { moduleId, status }),
  adminListUsers: () => request("GET", "/api/admin/users"),
  adminIssueRecovery: (identifier) => request("POST", "/api/admin/recovery/issue", { identifier }),
  getQuizResults: () => request("GET", "/api/quiz-results"),
  submitQuiz: (quizId, answers) => request("POST", "/api/quiz/submit", { quizId, answers }),
  getChallengeResults: () => request("GET", "/api/challenge-results"),
  submitChallenge: (challengeId, transcript) => request("POST", "/api/challenge/submit", { challengeId, transcript }),
  getCompletion: () => request("GET", "/api/completion"),
  getMyCertificate: () => request("GET", "/api/certificate/me"),
  issueCertificate: () => request("POST", "/api/certificate/issue", {}),
  // Public verification: deliberately NOT relative-through-session — still
  // same-origin (works logged out too, see docs/ARCHITECTURE_DECISIONS.md
  // ADR-015's proxy, which forwards this route with no session required).
  verifyCertificate: (verificationId) =>
    request("GET", `/api/certificate/verify?id=${encodeURIComponent(verificationId)}`),
  // P6: Teacher classroom routes — TEACHER-only, enforced server-side.
  teacherSummary: () => request("GET", "/api/teacher/summary"),
  teacherRoster: () => request("GET", "/api/teacher/roster"),
  teacherStudentDetail: (id) => request("GET", `/api/teacher/student?id=${encodeURIComponent(id)}`),
};
