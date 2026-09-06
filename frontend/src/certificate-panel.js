// Git Learning Lab — Certificate panel (P5).
//
// Shows the learner's server-authoritative completion state (never a
// client-side recomputation — GET /api/completion IS the shared
// shared/completion.js evaluator, run by the Worker against this user's own
// persisted D1 rows) and, once complete, lets them issue/view/print their
// certificate. The "issue" button only ever appears when the Worker's own
// response says the course is complete — there is no client-side bypass,
// because the Worker re-checks completion itself on every issue request
// regardless of what the UI shows (worker/src/routes/certificate.js).
import { MODULES, moduleTitle } from "./modules-meta.js";
import { t } from "./i18n.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function moduleTitleById(moduleId) {
  const mod = MODULES.find((m) => m.id === moduleId);
  return mod ? moduleTitle(mod) : moduleId;
}

const ISSUE_ERROR_KEYS = {
  certificates_student_only: "certErrStudentOnly",
  course_not_complete: "certErrNotComplete",
};

function verifyUrlFor(verificationId) {
  return `${location.origin}${location.pathname}#verify?id=${encodeURIComponent(verificationId)}`;
}

function renderRemaining(container, completion) {
  const incompleteModules = completion.modules.filter((m) => !m.complete);
  if (incompleteModules.length === 0) return;

  container.appendChild(el("h3", null, t("certificateRemainingHeading")));
  const list = el("ul", "certificate-remaining-list");
  incompleteModules.forEach((m) => {
    const parts = [];
    if (!m.lessonDone) parts.push(t("certificateMissingLesson"));
    if (!m.quizDone) parts.push(t("certificateMissingQuiz"));
    if (!m.challengeDone) parts.push(t("certificateMissingChallenge"));
    list.appendChild(el("li", null, t("certificateMissingModuleLine", moduleTitleById(m.moduleId), parts.join("、"))));
  });
  container.appendChild(list);
}

function renderCertificateCard(container, certificate) {
  const card = el("div", "certificate-print-area certificate-card");

  card.appendChild(el("p", "certificate-kicker", t("certificateKicker")));
  card.appendChild(el("h2", "certificate-course-name", certificate.courseName));
  card.appendChild(el("p", "certificate-statement-intro", t("certificateStatementIntro")));
  card.appendChild(el("p", "certificate-learner-name", certificate.learnerName));
  card.appendChild(el("p", "certificate-statement", t("certificateStatement")));

  const meta = el("div", "certificate-meta");
  const issuedRow = el("p", "certificate-meta-row");
  issuedRow.appendChild(el("span", "certificate-meta-label", t("certificateIssuedDateLabel")));
  issuedRow.appendChild(el("span", "certificate-meta-value", certificate.issuedAt));
  meta.appendChild(issuedRow);

  const idRow = el("p", "certificate-meta-row");
  idRow.appendChild(el("span", "certificate-meta-label", t("certificateIdLabel")));
  idRow.appendChild(el("span", "certificate-meta-value certificate-id-value", certificate.verificationId));
  meta.appendChild(idRow);

  const urlRow = el("p", "certificate-meta-row");
  urlRow.appendChild(el("span", "certificate-meta-label", t("certificateVerifyUrlLabel")));
  urlRow.appendChild(el("span", "certificate-meta-value certificate-verify-url", verifyUrlFor(certificate.verificationId)));
  meta.appendChild(urlRow);

  card.appendChild(meta);
  container.appendChild(card);

  const actions = el("div", "certificate-actions no-print");
  const printBtn = el("button", "btn btn-primary", t("certificatePrintButton"));
  printBtn.type = "button";
  printBtn.addEventListener("click", () => window.print());
  actions.appendChild(printBtn);

  const copyBtn = el("button", "btn btn-secondary", t("certificateCopyLinkButton"));
  copyBtn.type = "button";
  copyBtn.addEventListener("click", async () => {
    const url = verifyUrlFor(certificate.verificationId);
    try {
      await navigator.clipboard.writeText(url);
      copyBtn.textContent = t("certificateCopyLinkSuccess");
    } catch {
      copyBtn.textContent = url;
    }
    setTimeout(() => {
      copyBtn.textContent = t("certificateCopyLinkButton");
    }, 2500);
  });
  actions.appendChild(copyBtn);

  const verifyLink = el("a", "btn btn-secondary", t("certificateViewVerifyButton"));
  verifyLink.href = verifyUrlFor(certificate.verificationId);
  actions.appendChild(verifyLink);

  container.appendChild(actions);
}

export async function renderCertificatePanel(container, { api }) {
  container.innerHTML = "";
  container.appendChild(el("h2", null, t("certificateHeading")));
  container.appendChild(el("p", "certificate-intro", t("certificateIntro")));

  const [completionRes, certRes] = await Promise.all([api.getCompletion(), api.getMyCertificate()]);

  if (!completionRes.ok) {
    container.appendChild(el("p", "field-error", t("certificateLoadError")));
    return;
  }

  const completion = completionRes.data.completion;
  const existingCertificate = certRes.ok ? certRes.data.certificate : null;

  if (existingCertificate) {
    renderCertificateCard(container, existingCertificate);
    return;
  }

  const summary = el("div", "dashboard-card certificate-summary-card");
  const barOuter = el("div", "progress-bar-outer");
  barOuter.setAttribute("role", "progressbar");
  barOuter.setAttribute("aria-valuenow", String(completion.percent));
  barOuter.setAttribute("aria-valuemin", "0");
  barOuter.setAttribute("aria-valuemax", "100");
  barOuter.setAttribute("aria-label", t("certificateProgressLabel"));
  const barInner = el("div", "progress-bar-inner");
  barInner.style.width = `${completion.percent}%`;
  barOuter.appendChild(barInner);
  summary.appendChild(el("p", "dashboard-overall-label", t("certificateProgressLabel")));
  summary.appendChild(barOuter);
  summary.appendChild(el("p", "dashboard-overall-summary", `${completion.completedModules}/${completion.totalModules} — ${completion.percent}%`));
  container.appendChild(summary);

  if (completion.isComplete) {
    const banner = el("div", "dashboard-card certificate-complete-banner");
    banner.appendChild(el("p", "certificate-complete-title", t("certificateCompleteBanner")));
    const issueBtn = el("button", "btn btn-primary", t("certificateIssueButton"));
    issueBtn.type = "button";
    const errorEl = el("p", "field-error");
    issueBtn.addEventListener("click", async () => {
      issueBtn.disabled = true;
      issueBtn.textContent = t("certificateIssuing");
      errorEl.textContent = "";
      const res = await api.issueCertificate();
      if (!res.ok) {
        issueBtn.disabled = false;
        issueBtn.textContent = t("certificateIssueButton");
        errorEl.textContent = t(ISSUE_ERROR_KEYS[res.data?.error] || "certificateIssueError");
        return;
      }
      await renderCertificatePanel(container, { api });
    });
    banner.appendChild(issueBtn);
    banner.appendChild(errorEl);
    container.appendChild(banner);
  } else {
    container.appendChild(el("p", "certificate-not-eligible-notice", t("certificateNotEligibleNotice")));
    renderRemaining(container, completion);
  }
}
