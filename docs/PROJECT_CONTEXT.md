# Project Context — Git Learning Lab

**This is the primary handoff/recovery document.** A future session (human or AI) that has no
memory of prior conversations should be able to read this file and know exactly what the project
is, what's locked, what exists, and what to do next.

---

## 1. Project Identity

- **Name**: Git Learning Lab
- **Mission**: an interactive, web-based platform that teaches Git and GitHub to absolute beginners
  through structured lessons, a safe simulated terminal, a live Git-state visualizer, practice
  challenges, quizzes, and persisted learner progress — for self-study, as a classroom teaching aid,
  and for real use by an actual class.
- **Current phase**: **P0 — Project Foundation** (this document is a P0 deliverable). No application
  code, Cloudflare resources, or Git repository exist yet — see §7.
- **Classroom MVP deadline**: **Saturday, September 12, 2026** (hard).

---

## 2. Primary Curriculum Source

- **`docs/Git & GitHub.pdf`** is authoritative for course scope, terminology, and teaching sequence.
- Do not silently modernize, replace, or "improve" its terminology.
- Any Git/GitHub concept the PDF does not cover (e.g., `git switch`, `git restore`, `git rebase`,
  `.gitignore`, Pull Request workflows) is **supplemental material** and requires a fresh, explicit
  Owner Decision before it appears anywhere learner-facing.
- See `docs/LEARNING_OBJECTIVES.md` for the curriculum derived from this PDF.

## 3. Approved Skills (Owner-approved, v1.1)

- `skills/git_learning_lab/engineering/SKILL.md` — engineering operating model (risk classification,
  simulator architecture, cloud architecture, security baseline, testing, scope discipline).
- `skills/git_learning_lab/ux_ui/SKILL.md` — UX/UI operating model (lesson flow, terminal/visualizer
  design, accessibility, responsive behavior, anti-gamification rule).
- `skills/study_archive/**` exists in this repo as **reference material only**, from an unrelated
  prior project. It does not govern Git Learning Lab and must not be treated as authoritative for
  this project.

Both skills should be read by any session doing implementation work; this document does not restate
their content, only the facts that matter for picking up the project cold.

## 4. Locked Product Scope

**MVP core** (must ship by Sept 12, 2026): structured lessons, Git workflow visualizer, simulated
terminal, Git semantic state machine, challenges, quizzes, learner progress persistence, cheat
sheet, responsive behavior, practical accessibility baseline, security baseline, deployment, testing.

**Explicitly deferred** (not release-blocking, not to be built "while we're in there"): full Teacher
Dashboard, complex analytics, social features, leaderboard, extensive gamification, self-service
email password reset, any email provider, paid hosting, paid domain, any Git command/workflow
outside the PDF without a fresh Owner Decision, real shell execution (permanently prohibited, not
merely deferred).

Full detail: `docs/SCOPE.md`.

## 5. User / Role Model (v0.9, Locked)

Three roles, no RBAC/tenant hierarchy:

| Role | Count | Capabilities |
|---|---|---|
| **STUDENT** | 29 | Lessons, simulator, challenges, quizzes, view own progress only |
| **TEACHER** | 1 | Exists as a distinct account in v0.9; uses the same learning experience as a Student; full Teacher Dashboard is deferred |
| **ADMIN** | 1 | Project Owner; minimal account administration; issues Admin-mediated password recovery |

**Total expected initial accounts: 31.**

## 6. Password Recovery Policy (v0.9, Locked)

No email integration in v0.9. Flow: user forgets password → contacts Admin → Admin issues a
temporary credential → user signs in with it → system forces an immediate password change → the
temporary recovery state is invalidated. The Admin can never view or recover a user's actual
password (passwords are always hashed — see `docs/ARCHITECTURE_DECISIONS.md` ADR-012).

## 7. Cloud Architecture (Locked)

| Concern | Choice |
|---|---|
| Canonical source repository | GitHub |
| Frontend hosting | Cloudflare Pages |
| Backend / API | Cloudflare Workers |
| Persistent database | Cloudflare D1 |
| Git simulator | Deterministic JavaScript state machine, runs primarily in the browser; the same shared, environment-agnostic core is reused by the Worker to replay-validate challenges (ADR-013) |
| Initial public URL | Cloudflare-provided `*.pages.dev` domain |
| Cost target | **0 THB** — stay within free-tier limits for Pages/Workers/D1; no paid domain or hosting for v0.9 |

Full rationale: `docs/ARCHITECTURE_DECISIONS.md` (ADR-001 through ADR-013).

**Local development**: `C:\xampp\htdocs\git_learning_lab` (XAMPP) is local development only and is
**never** the production target. Production is not architected around PHP, Apache, production
MySQL/MariaDB, local filesystem persistence, or the Owner's PC being online.

## 8. Key Non-Negotiable Invariants

(Full list lives in the Engineering skill §5; the ones most likely to be violated by a rushed
implementation are repeated here.)

- No learner-typed terminal input ever reaches a real shell, `eval`, or filesystem-executing API —
  ever, in any environment.
- The simulator's internal Git-state object is the single source of truth; the terminal display and
  visualizer both read from it — none maintains an independent copy.
- Every simulator command transition is deterministic, and the state model/command engine is one
  shared, environment-agnostic module reused unmodified by both the browser and the Worker — never
  two independently-implemented Git engines that could drift (ADR-013).
- Challenge results are computed by the Cloudflare Worker replaying the learner's submitted command
  transcript through that shared engine, from a Worker-reconstructed authoritative starting state —
  never accepted as a client-reported final state or `completed`/`passed` boolean (ADR-013).
- A user's data is never readable by another user, and never accessible via a role capability the
  requester doesn't hold.
- No curriculum content contradicts `docs/Git & GitHub.pdf`; no out-of-PDF command/concept appears
  learner-facing without a dated Owner Decision.
- Passwords are always hashed (never reversible); a temporary recovery credential is never valid
  indefinitely and is invalidated the moment it's used.

## 9. Current Project Directory Structure

As of this document's authoring (verified by live inspection, not assumed):

```
C:\xampp\htdocs\git_learning_lab\
├── docs\
│   ├── Git & GitHub.pdf                  (primary curriculum source)
│   ├── PROJECT_CONTEXT.md                (this file)
│   ├── SCOPE.md
│   ├── REQUIREMENTS.md
│   ├── LEARNING_OBJECTIVES.md
│   └── ARCHITECTURE_DECISIONS.md
└── skills\
    ├── git_learning_lab\
    │   ├── engineering\SKILL.md           (v1.1, Owner-approved)
    │   └── ux_ui\SKILL.md                 (v1.1, Owner-approved)
    └── study_archive\                     (reference material only, unrelated prior project)
        ├── engineering\SKILL.md (+ archive\)
        └── ux_ui\SKILL.md (+ archive\)
```

No application source directories (frontend, worker, migrations, etc.) exist yet.

## 10. Current Known External Services / Accounts

- Git is installed locally on the Owner's machine.
- A GitHub account is available.
- A GitHub repository has already been created: **`git_learning_lab`**.
- A Cloudflare account has already been created.
- **Important — verified by live inspection at the time of this document**: the local directory
  `C:\xampp\htdocs\git_learning_lab` has **not** been initialized as a Git repository yet (no `.git`
  directory present; `git status` returns "not a git repository"), and has therefore **not** been
  pushed to the GitHub repository. A future session must re-verify this with `git status` before
  assuming otherwise — this is a fact about the state at authoring time, not a permanent guarantee.
- No Cloudflare Pages project, Worker, or D1 database has been created or connected yet.
- No GitHub↔Cloudflare deployment integration has been configured yet.

## 11. What Has NOT Been Built Yet

Everything application-level. Explicitly, none of the following exist yet:

- Frontend code/components (lessons, terminal UI, visualizer, quiz/challenge UI)
- The Git simulator state machine (§6–§8 of the Engineering skill)
- Any Cloudflare Worker or API route
- Any D1 schema, table, or migration
- Any authentication/session implementation
- Any deployment or GitHub↔Cloudflare wiring
- Any test suite

This document and its four companions (`SCOPE.md`, `REQUIREMENTS.md`, `LEARNING_OBJECTIVES.md`,
`ARCHITECTURE_DECISIONS.md`) are the only project artifacts beyond the two approved skills and the
source PDF.

## 12. Explicit Deferred Scope

See §4 above and `docs/SCOPE.md`'s "Out of Scope / Deferred" section for the full, current list.

## 13. Immediate Next Phase After P0

**P1 — Environment & Repository Setup**, expected to cover (not yet planned in detail — this is a
pointer, not a plan): initializing the local Git repository, connecting it to the existing GitHub
repository, standing up the initial Cloudflare Pages/Workers/D1 resources per
`ARCHITECTURE_DECISIONS.md`, and scaffolding the minimum project structure needed to start
implementing the simulator and lessons. P1 has not started; do not assume any of it is done.

## 14. Recovery Instructions — What to Read First

A future session picking this project up cold should read, in this order:

1. **This file** — current state, what's locked, what exists.
2. **`skills/git_learning_lab/engineering/SKILL.md`** and **`skills/git_learning_lab/ux_ui/SKILL.md`**
   — the operating methodology for any implementation work.
3. **`docs/SCOPE.md`** — what's actually in v0.9 vs. deferred.
4. **`docs/REQUIREMENTS.md`** — concrete, testable requirements by capability.
5. **`docs/LEARNING_OBJECTIVES.md`** — the curriculum structure, derived from the PDF.
6. **`docs/ARCHITECTURE_DECISIONS.md`** — locked technical decisions and their rationale.
7. **`docs/Git & GitHub.pdf`** — the curriculum ground truth itself; re-check it directly whenever a
   curriculum question arises rather than trusting a summary.
8. **Live inspection** — run `git status` in the project root and check for any Cloudflare
   resources/config before assuming §9/§10 above are still accurate; this document reflects state at
   authoring time and can go stale.

Do not begin implementation from memory of a prior conversation alone — verify against the live
repository state first.
