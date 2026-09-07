// Git Learning Lab — Teacher Dashboard / Classroom Roster / Student Detail (P6).
//
// TEACHER-only screen (nav wiring in main.js hides it for STUDENT/ADMIN).
// Read-only: nothing here writes progress/quiz/challenge/certificate data or
// touches account state — every number shown comes straight from
// GET /api/teacher/summary, /api/teacher/roster, /api/teacher/student, all of
// which reuse the same authoritative shared/completion.js evaluator the
// Student-facing Dashboard/Certificate screens use (P6 spec §6: Teacher and
// Student views must never disagree about what "complete" means).
import { MODULES, moduleTitle } from "./modules-meta.js";
import { t } from "./i18n.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function td(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function statusBadgeFor(status) {
  const key = status === "completed" ? "statusCompleted" : status === "started" || status === "in_progress" ? "statusStarted" : "statusNotStarted";
  const modifier = status === "completed" ? "completed" : status === "started" || status === "in_progress" ? "started" : "not-started";
  return el("span", `status-badge status-badge--${modifier}`, t(key));
}

function moduleTitleById(moduleId) {
  const mod = MODULES.find((m) => m.id === moduleId);
  return mod ? moduleTitle(mod) : moduleId;
}

export async function renderTeacherPanel(container, { api }) {
  await renderRosterView(container, { api });
}

async function renderRosterView(container, { api }) {
  container.innerHTML = "";
  container.appendChild(el("h2", null, t("teacherDashboardHeading")));

  const loading = el("p", "teacher-loading", t("teacherLoading"));
  container.appendChild(loading);

  const [summaryRes, rosterRes] = await Promise.all([api.teacherSummary(), api.teacherRoster()]);
  loading.remove();

  if (!summaryRes.ok || !rosterRes.ok) {
    container.appendChild(el("p", "field-error", t("teacherLoadError")));
    return;
  }

  const summary = summaryRes.data.summary;
  const roster = rosterRes.data.roster;

  const cardsGrid = el("div", "teacher-summary-grid");
  [
    [t("teacherTotalStudents"), summary.totalStudents],
    [t("teacherStarted"), summary.startedCount],
    [t("teacherCompleted"), summary.completedCount],
    [t("teacherAverageProgress"), `${summary.averagePercent}%`],
  ].forEach(([label, value]) => {
    const card = el("div", "dashboard-card teacher-summary-card");
    card.appendChild(el("p", "teacher-summary-value", String(value)));
    card.appendChild(el("p", "teacher-summary-label", label));
    cardsGrid.appendChild(card);
  });
  container.appendChild(cardsGrid);

  if (summary.needingAttention.length > 0) {
    const attention = el("div", "dashboard-card teacher-card");
    attention.appendChild(el("h3", null, t("teacherNeedingAttention")));
    const list = el("ul", "teacher-list");
    summary.needingAttention.forEach((s) => {
      list.appendChild(el("li", null, s.studentIdCode ? `${s.fullName} (${s.studentIdCode})` : s.fullName));
    });
    attention.appendChild(list);
    container.appendChild(attention);
  }

  if (summary.recentActivity.length > 0) {
    const recent = el("div", "dashboard-card teacher-card");
    recent.appendChild(el("h3", null, t("teacherRecentActivity")));
    const list = el("ul", "teacher-list");
    summary.recentActivity.forEach((a) => {
      list.appendChild(el("li", null, `${a.fullName} — ${a.lastActivity} (${a.overallPercent}%)`));
    });
    recent.appendChild(list);
    container.appendChild(recent);
  }

  container.appendChild(el("h3", "teacher-roster-heading", t("teacherRosterHeading")));

  const controls = el("div", "teacher-roster-controls");
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.className = "teacher-search-input";
  searchInput.placeholder = t("teacherSearchPlaceholder");
  searchInput.setAttribute("aria-label", t("teacherSearchPlaceholder"));
  controls.appendChild(searchInput);

  const filterSelect = document.createElement("select");
  filterSelect.className = "teacher-filter-select";
  filterSelect.setAttribute("aria-label", t("teacherFilterLabel"));
  [
    ["all", t("teacherFilterAll")],
    ["not_started", t("teacherFilterNotStarted")],
    ["in_progress", t("teacherFilterInProgress")],
    ["completed", t("teacherFilterCompleted")],
  ].forEach(([value, label]) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    filterSelect.appendChild(opt);
  });
  controls.appendChild(filterSelect);

  const exportLink = document.createElement("a");
  exportLink.className = "btn btn-secondary teacher-export-btn";
  exportLink.textContent = t("teacherExportCsv");
  exportLink.href = "/api/teacher/export";
  controls.appendChild(exportLink);

  container.appendChild(controls);

  const tableWrap = el("div", "teacher-roster-table-wrap");
  container.appendChild(tableWrap);

  function matchesQuery(student, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      student.fullName.toLowerCase().includes(q) ||
      student.username.toLowerCase().includes(q) ||
      (student.studentId || "").toLowerCase().includes(q)
    );
  }

  function renderTable() {
    tableWrap.innerHTML = "";
    const query = searchInput.value.trim();
    const filter = filterSelect.value;
    const filtered = roster.filter((s) => (filter === "all" || s.status === filter) && matchesQuery(s, query));

    if (filtered.length === 0) {
      tableWrap.appendChild(el("p", "teacher-roster-empty", t("teacherRosterEmpty")));
      return;
    }

    const table = document.createElement("table");
    table.className = "progress-table teacher-roster-table";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    [
      t("teacherColName"),
      t("teacherColStudentId"),
      t("teacherColProgress"),
      t("teacherColQuizzes"),
      t("teacherColChallenges"),
      t("teacherColStatus"),
      t("teacherColCertificate"),
      t("teacherColAction"),
    ].forEach((h) => {
      const th = document.createElement("th");
      th.textContent = h;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    filtered
      .slice()
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "th"))
      .forEach((s) => {
        const tr = document.createElement("tr");
        tr.appendChild(td(s.fullName));
        tr.appendChild(td(s.studentId || "—"));
        tr.appendChild(td(`${s.overallPercent}%`));
        tr.appendChild(td(`${s.quizzesCompleted}/${s.totalQuizzes}`));
        tr.appendChild(td(`${s.challengesPassed}/${s.totalChallenges}`));

        const statusTd = document.createElement("td");
        statusTd.appendChild(statusBadgeFor(s.status));
        tr.appendChild(statusTd);

        tr.appendChild(td(s.certificateIssued ? t("teacherCertIssued") : t("teacherCertNotIssued")));

        const actionTd = document.createElement("td");
        const viewBtn = el("button", "btn btn-secondary teacher-view-btn", t("teacherViewDetail"));
        viewBtn.type = "button";
        viewBtn.addEventListener("click", () => renderDetailView(container, { api, studentId: s.id }));
        actionTd.appendChild(viewBtn);
        tr.appendChild(actionTd);

        tbody.appendChild(tr);
      });
    table.appendChild(tbody);
    tableWrap.appendChild(table);
  }

  searchInput.addEventListener("input", renderTable);
  filterSelect.addEventListener("change", renderTable);
  renderTable();
}

async function renderDetailView(container, { api, studentId }) {
  container.innerHTML = "";

  const backBtn = el("button", "btn btn-secondary teacher-back-btn", t("teacherBack"));
  backBtn.type = "button";
  backBtn.addEventListener("click", () => renderRosterView(container, { api }));
  container.appendChild(backBtn);

  const loading = el("p", "teacher-loading", t("teacherLoading"));
  container.appendChild(loading);

  const res = await api.teacherStudentDetail(studentId);
  loading.remove();

  if (!res.ok) {
    container.appendChild(el("p", "field-error", t("teacherLoadError")));
    return;
  }

  const student = res.data.student;
  container.appendChild(el("h2", null, student.fullName));
  const meta = student.studentId ? `${t("registerStudentId")}: ${student.studentId} — ${t("username")}: ${student.username}` : `${t("username")}: ${student.username}`;
  container.appendChild(el("p", "teacher-detail-meta", meta));
  container.appendChild(el("p", "teacher-detail-overall", `${t("teacherOverallProgress")}: ${student.overallPercent}%`));
  container.appendChild(
    el(
      "p",
      "teacher-detail-cert",
      student.certificateIssued
        ? t("teacherCertIssuedOn", student.certificateIssuedAt)
        : `${t("teacherColCertificate")}: ${t("teacherCertNotIssued")}`
    )
  );

  const list = el("div", "teacher-module-list");
  student.modules.forEach((m) => {
    const row = el("div", "teacher-module-row");
    row.appendChild(el("span", "teacher-module-name", moduleTitleById(m.moduleId)));
    row.appendChild(statusBadgeFor(m.lessonStatus));
    if (m.quizId) {
      row.appendChild(
        el(
          "span",
          `status-badge ${m.quizAttempted ? "status-badge--info" : "status-badge--not-started"}`,
          m.quizAttempted ? t("dashboardQuizBadge", m.quizPercent) : t("teacherQuizNotAttempted")
        )
      );
    }
    if (m.challengeId) {
      row.appendChild(
        el(
          "span",
          `status-badge ${m.challengePassed ? "status-badge--completed" : "status-badge--not-started"}`,
          m.challengePassed ? t("dashboardChallengePassedBadge") : t("dashboardChallengeNotPassedBadge")
        )
      );
    }
    list.appendChild(row);
  });
  container.appendChild(list);
}
