/**
 * Git Learning Lab — Teacher classroom routes (P6).
 *
 * TEACHER-only (enforced in worker/src/index.js, mirroring the ADMIN-role
 * dispatch pattern in routes/admin.js — role is resolved server-side from
 * the session, ROLE-005, never from a client-supplied field). Every route
 * here is read-only: nothing in this file writes to progress/quiz/
 * challenge/certificate data or to a user's role/password/account state
 * (P6 scope boundary — a Teacher cannot change roles, disable/delete
 * accounts, reset passwords, issue certificates, or alter results).
 *
 * Reuses the exact same authoritative evaluator the Student-facing
 * GET /api/completion and certificate issuance already use
 * (shared/completion.js) — so the Teacher roster/detail views can never
 * disagree with what a Student sees as "complete" (P6 spec §6, no second
 * completion formula).
 *
 * All classroom data is fetched in bulk — one query per table via
 * worker/src/db.js's P6 helpers, never one query per student — and
 * aggregated in memory. Proportionate to the ~29-student class size
 * (P6 spec §5); this is not built to scale beyond one classroom.
 *
 * Privacy (P6 spec §10): the roster/detail responses never include a
 * password hash/salt, session/recovery state, email, or a certificate's
 * public verification token — only what a teacher needs for classroom use
 * (name, student ID, username, learning status, scores, last activity).
 */
import { json, safeError } from "../http.js";
import {
  listStudentAccounts,
  getAllProgressRows,
  getAllQuizResultRows,
  getAllChallengeResultRows,
  getAllCertificateRows,
  getUserById,
} from "../db.js";
import { evaluateCompletion } from "../../../shared/completion.js";
import { CURRICULUM_MODULES } from "../../../shared/curriculum.js";

const TOTAL_QUIZZES = CURRICULUM_MODULES.filter((m) => m.quizId).length;
const TOTAL_CHALLENGES = CURRICULUM_MODULES.filter((m) => m.challengeId).length;

function groupByUser(rows) {
  const map = new Map();
  for (const row of rows || []) {
    if (!map.has(row.user_id)) map.set(row.user_id, []);
    map.get(row.user_id).push(row);
  }
  return map;
}

function latestTimestamp(...lists) {
  let max = null;
  for (const list of lists) {
    for (const row of list || []) {
      if (row.updated_at && (!max || row.updated_at > max)) max = row.updated_at;
    }
  }
  return max;
}

/**
 * Loads every student account plus every progress/quiz/challenge/certificate
 * row in the system (5 bulk queries total) and returns both the per-student
 * roster summary and the grouped-by-user maps a detail lookup needs, so
 * callers never issue a second round of per-student queries.
 */
async function loadClassroomData(env) {
  const [students, progressRows, quizRows, challengeRows, certRows] = await Promise.all([
    listStudentAccounts(env),
    getAllProgressRows(env),
    getAllQuizResultRows(env),
    getAllChallengeResultRows(env),
    getAllCertificateRows(env),
  ]);

  const progressByUser = groupByUser(progressRows);
  const quizByUser = groupByUser(quizRows);
  const challengeByUser = groupByUser(challengeRows);
  const certByUser = new Map();
  for (const row of certRows || []) {
    if (row.status === "active") certByUser.set(row.user_id, row);
  }

  const roster = students.map((student) => {
    const progress = progressByUser.get(student.id) || [];
    const quizResults = quizByUser.get(student.id) || [];
    const challengeResults = challengeByUser.get(student.id) || [];
    const completion = evaluateCompletion({ progress, quizResults, challengeResults });
    const hasStarted = progress.length > 0 || quizResults.length > 0 || challengeResults.length > 0;
    const passedChallenges = challengeResults.filter((c) => Number(c.passed) === 1).length;
    const status = completion.isComplete ? "completed" : hasStarted ? "in_progress" : "not_started";

    return {
      id: student.id,
      fullName: student.full_name || student.identifier,
      studentId: student.student_id || null,
      username: student.identifier,
      overallPercent: completion.percent,
      completedModules: completion.completedModules,
      totalModules: completion.totalModules,
      quizzesCompleted: quizResults.length,
      totalQuizzes: TOTAL_QUIZZES,
      challengesPassed: passedChallenges,
      totalChallenges: TOTAL_CHALLENGES,
      isComplete: completion.isComplete,
      status,
      certificateIssued: certByUser.has(student.id),
      lastActivity: latestTimestamp(progress, quizResults, challengeResults),
    };
  });

  return { roster, progressByUser, quizByUser, challengeByUser, certByUser };
}

export async function handleTeacherSummary(request, env) {
  const { roster } = await loadClassroomData(env);
  const totalStudents = roster.length;
  const completedCount = roster.filter((s) => s.status === "completed").length;
  const startedCount = roster.filter((s) => s.status !== "not_started").length;
  const notStartedCount = totalStudents - startedCount;
  const averagePercent = totalStudents ? Math.round(roster.reduce((sum, s) => sum + s.overallPercent, 0) / totalStudents) : 0;

  const recentActivity = roster
    .filter((s) => s.lastActivity)
    .sort((a, b) => (a.lastActivity < b.lastActivity ? 1 : a.lastActivity > b.lastActivity ? -1 : 0))
    .slice(0, 10)
    .map((s) => ({ studentId: s.id, fullName: s.fullName, lastActivity: s.lastActivity, overallPercent: s.overallPercent }));

  const needingAttention = roster
    .filter((s) => s.status === "not_started")
    .slice(0, 30)
    .map((s) => ({ studentId: s.id, fullName: s.fullName, studentIdCode: s.studentId }));

  return json({
    ok: true,
    summary: { totalStudents, startedCount, completedCount, notStartedCount, averagePercent, recentActivity, needingAttention },
  });
}

export async function handleTeacherRoster(request, env) {
  const { roster } = await loadClassroomData(env);
  return json({ ok: true, roster });
}

export async function handleTeacherStudentDetail(request, env) {
  const url = new URL(request.url);
  const idParam = url.searchParams.get("id");
  const id = Number(idParam);
  if (!idParam || !Number.isInteger(id) || id <= 0) return safeError(400, "invalid_request");

  // Only a STUDENT account's detail is ever reachable here — this also
  // guards against using this route to look up a Teacher/Admin profile.
  const student = await getUserById(env, id);
  if (!student || student.role !== "STUDENT") return safeError(404, "student_not_found");

  const { progressByUser, quizByUser, challengeByUser, certByUser } = await loadClassroomData(env);
  const progress = progressByUser.get(id) || [];
  const quizResults = quizByUser.get(id) || [];
  const challengeResults = challengeByUser.get(id) || [];
  const completion = evaluateCompletion({ progress, quizResults, challengeResults });
  const cert = certByUser.get(id) || null;

  const progressByModule = Object.fromEntries(progress.map((p) => [p.module_id, p]));
  const quizByModule = Object.fromEntries(quizResults.map((q) => [q.quiz_id, q]));
  const challengeByModule = Object.fromEntries(challengeResults.map((c) => [c.challenge_id, c]));

  const modules = CURRICULUM_MODULES.map((mod) => {
    const lessonRow = progressByModule[mod.id] || null;
    const quizRow = mod.quizId ? quizByModule[mod.quizId] || null : null;
    const challengeRow = mod.challengeId ? challengeByModule[mod.challengeId] || null : null;
    const evaluated = completion.modules.find((m) => m.moduleId === mod.id);
    return {
      moduleId: mod.id,
      lessonStatus: lessonRow?.status || "not_started",
      quizId: mod.quizId,
      quizAttempted: Boolean(quizRow),
      quizPercent: quizRow ? quizRow.percent : null,
      challengeId: mod.challengeId,
      challengePassed: challengeRow ? Number(challengeRow.passed) === 1 : false,
      complete: evaluated ? evaluated.complete : false,
    };
  });

  return json({
    ok: true,
    student: {
      id: student.id,
      fullName: student.full_name || student.identifier,
      studentId: student.student_id || null,
      username: student.identifier,
      overallPercent: completion.percent,
      isComplete: completion.isComplete,
      modules,
      certificateIssued: Boolean(cert),
      certificateIssuedAt: cert ? cert.issued_at : null,
    },
  });
}

// ---- CSV export (P6 §7) ----------------------------------------------------

// OWASP CSV-injection mitigation: a cell whose first character would be
// interpreted as a formula by Excel/Sheets/LibreOffice (=, +, -, @) is
// neutralized with a leading apostrophe before quoting. `full_name` is
// learner-supplied at registration (P4), so this is not a hypothetical case.
function csvCell(value) {
  let str = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(str)) str = "'" + str;
  if (/[",\n\r]/.test(str)) str = `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(headerRow, rows) {
  const lines = [headerRow.map(csvCell).join(",")];
  for (const row of rows) lines.push(row.map(csvCell).join(","));
  return lines.join("\r\n");
}

export async function handleTeacherExport(request, env) {
  const { roster } = await loadClassroomData(env);
  const headers = [
    "Full Name",
    "Student ID",
    "Username",
    "Overall Progress (%)",
    "Completed Modules",
    "Quizzes Completed",
    "Challenges Passed",
    "Course Completion",
    "Certificate Status",
    "Last Activity",
  ];
  const rows = roster.map((s) => [
    s.fullName,
    s.studentId || "",
    s.username,
    s.overallPercent,
    `${s.completedModules}/${s.totalModules}`,
    `${s.quizzesCompleted}/${s.totalQuizzes}`,
    `${s.challengesPassed}/${s.totalChallenges}`,
    s.isComplete ? "Completed" : "In Progress",
    s.certificateIssued ? "Issued" : "Not Issued",
    s.lastActivity || "",
  ]);
  // Leading BOM so Excel opens the UTF-8 file with Thai names rendering
  // correctly instead of guessing a legacy codepage.
  const csv = "﻿" + toCsv(headers, rows);
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="classroom-roster.csv"',
    },
  });
}
