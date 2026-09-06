// Git Learning Lab — public certificate verification screen (P5, §5).
//
// Deliberately reachable with NO login/session (main.js routes here whenever
// location.hash starts with "#verify", BEFORE the normal
// login/session bootstrap runs) — a shared verification link must work for
// a logged-out visitor. Calls GET /api/certificate/verify?id=... directly,
// which the Worker also serves without a session (worker/src/index.js).
// Renders ONLY the public-safe fields the Worker returns — this screen has
// no access to, and never requests, anything else about the certificate's
// owner.
import { t } from "./i18n.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderResult(resultContainer, data) {
  resultContainer.innerHTML = "";
  if (!data.valid) {
    resultContainer.appendChild(el("p", "verify-result verify-result--invalid", t("verifyResultInvalidHeading")));
    return;
  }
  const card = el("div", "dashboard-card verify-result verify-result--valid");
  card.appendChild(el("p", "verify-result-title", t("verifyResultValidHeading")));

  const row = (labelKey, value) => {
    const p = el("p", "certificate-meta-row");
    p.appendChild(el("span", "certificate-meta-label", t(labelKey)));
    p.appendChild(el("span", "certificate-meta-value", value));
    return p;
  };
  card.appendChild(row("verifyLearnerNameLabel", data.certificate.learnerName));
  card.appendChild(row("verifyCourseNameLabel", data.certificate.courseName));
  card.appendChild(row("verifyIssuedDateLabel", data.certificate.issuedAt));
  card.appendChild(row("certificateIdLabel", data.certificate.verificationId));
  resultContainer.appendChild(card);
}

export function renderVerifyScreen(container, { api, initialId, onBack }) {
  container.innerHTML = "";
  container.appendChild(el("h2", null, t("verifyHeading")));
  container.appendChild(el("p", "verify-intro", t("verifyIntro")));

  const form = el("form", "verify-form");
  const label = el("label", null, t("verifyInputLabel"));
  label.htmlFor = "verify-id-input";
  const input = document.createElement("input");
  input.type = "text";
  input.id = "verify-id-input";
  input.autocomplete = "off";
  input.value = initialId || "";
  const submitBtn = el("button", "btn btn-primary", t("verifyButton"));
  submitBtn.type = "submit";

  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(submitBtn);
  container.appendChild(form);

  const resultContainer = el("div", "verify-result-container");
  container.appendChild(resultContainer);

  const backBtn = el("button", "btn btn-secondary link-btn", t("verifyBackToLogin"));
  backBtn.type = "button";
  backBtn.addEventListener("click", () => onBack());
  container.appendChild(backBtn);

  async function runVerify(id) {
    const trimmed = (id || "").trim();
    if (!trimmed) return;
    resultContainer.innerHTML = "";
    resultContainer.appendChild(el("p", "verify-checking", t("verifyCheckingLabel")));
    const res = await api.verifyCertificate(trimmed);
    if (!res.ok) {
      renderResult(resultContainer, { valid: false });
      return;
    }
    renderResult(resultContainer, res.data);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runVerify(input.value);
  });

  if (initialId) runVerify(initialId);
}
