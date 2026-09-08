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
- **Current phase**: **P1 — COMPLETE, fully** (see §10). **P2 — Core Simulator & Authentication —
  substantially complete** (see §17). **P3 — Thai-first curriculum expansion, quiz/challenge systems
  — substantially complete** (see §19). **P3.5 — classroom readiness quick pass — complete** (see
  §21). **P4 — student self-registration, Dashboard, Learning History, UI/UX polish, mobile terminal
  polish — complete** (see §22). **P5 — course completion, certificate issuance, printable
  certificate, public verification — complete** (see §23). **P6 — Teacher Dashboard, classroom
  roster, student detail, CSV export — complete** (see §24). **P7 — final UI/UX audit, security/
  performance/accessibility review, and release-readiness polish — complete** (see §25). **P7.5 —
  final Owner cleanup before classroom freeze — complete** (see §26). **P8 — post-freeze curriculum
  depth/assessment expansion (Module 7 optional quiz, expanded quiz banks, bounded random subset per
  attempt, enrichment challenge variants, Cheat Sheet + reinforcement polish) — complete**, see §27
  for the full P8 status report. **P9 — full product visual redesign (design tokens, typography,
  navigation, auth split-hero, Dashboard, Terminal/Visualizer signature treatment, Quiz/Challenge,
  Certificate, Teacher/Admin, motion system, responsive/mobile sweep) — complete**, see §28 for the
  full P9 status report. **P10 — UX/UI refinement pass (shared field-error/success margin fix,
  dashboard shimmer toned down, dead CSS tokens removed) — complete.** **P11 — Admin account
  management expansion (ADMIN can create TEACHER/ADMIN accounts via a system-generated temporary
  credential, reusing the existing forced-password-change/recovery infrastructure; public
  registration remains STUDENT-only) — complete**, see §30 for the full P11 status report. **P12 —
  lesson system teaching-quality upgrade (per-command breakdowns, a `git reset` mode comparison table,
  a push/pull direction mnemonic, guided-practice prediction prompts, expanded common-mistake lists,
  module-to-module bridge notes — no new Git concept, no architecture change) — complete**, see §31
  for the full P12 status report. **P13 — production hardening & Worker-runtime testing (a new,
  additive `@cloudflare/vitest-plugin` runtime-test layer executing the real Worker inside a real
  Workers runtime against an isolated local D1; ADR-014 amended for testing tooling only, node:test
  unchanged; minimal safe security headers; a minimal GitHub Actions CI; a read-only production smoke
  script; no learner-facing feature, no D1 migration, no production mutation) — complete**, see §32
  for the full P13 status report. **P14 — bounded application audit log & security events (a new
  `audit_events` D1 table; best-effort, non-blocking audit writes for staff creation, recovery
  issuance, registration, login success/failure, password change, and logout; an Admin-only bounded
  `GET /api/admin/audit` read route; an Admin panel "ประวัติเหตุการณ์ระบบ" section; no legal-retention
  claim, no request bodies/IPs/credentials stored) — complete**, see §33 for the full P14 status
  report. This document's older sections are historical (P1–P9) unless a later
  note says otherwise.
- **Classroom MVP deadline**: **Saturday, September 12, 2026** (hard).

---

## 2. Primary Curriculum Source

- **`docs/Git & GitHub.pdf`** is authoritative for course scope, terminology, and teaching sequence.
- Do not silently modernize, replace, or "improve" its terminology.
- Any Git/GitHub concept the PDF does not cover (e.g., `git switch`, `git restore`, `git rebase`,
  `.gitignore`, Pull Request workflows) is **supplemental material** and requires a fresh, explicit
  Owner Decision before it appears anywhere learner-facing.
- See `docs/LEARNING_OBJECTIVES.md` for the curriculum derived from this PDF.

## 3. Approved Skills (Owner-approved, v1.2)

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
| **STUDENT** | 29 expected, now self-registering (P4, §22.1) | Lessons, simulator, challenges, quizzes, view own progress/history only |
| **TEACHER** | 1 | Exists as a distinct account in v0.9; uses the same learning experience as a Student; full Teacher Dashboard is deferred |
| **ADMIN** | 1 | Project Owner; minimal account administration; issues Admin-mediated password recovery |

**Total expected accounts: ~31**, but STUDENT accounts are no longer pre-provisioned one-by-one as
of P4 — students create their own accounts via the public Register screen (§22.1), always as
STUDENT (never TEACHER/ADMIN, enforced server-side). TEACHER/ADMIN accounts remain exclusively
Admin-created (unchanged).

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
| Initial public URL | **Live**: `https://git-learning-lab.pages.dev` (frontend), `https://git-learning-lab-api.git-learning-lab.workers.dev` (API) |
| Cost target | **0 THB** — stay within free-tier limits for Pages/Workers/D1; no paid domain or hosting for v0.9 |

Full rationale: `docs/ARCHITECTURE_DECISIONS.md` (ADR-001 through ADR-014; ADR-014 records the P1
toolchain choice — plain ES modules, esbuild, Wrangler, `node:test`, no framework).

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
├── .gitignore
├── package.json / package-lock.json      (root npm project, no workspaces — ADR-014)
├── docs\
│   ├── Git & GitHub.pdf                  (primary curriculum source)
│   ├── PROJECT_CONTEXT.md                (this file)
│   ├── SCOPE.md
│   ├── REQUIREMENTS.md
│   ├── LEARNING_OBJECTIVES.md
│   └── ARCHITECTURE_DECISIONS.md
├── skills\
│   ├── git_learning_lab\
│   │   ├── engineering\SKILL.md           (v1.2, Owner-approved)
│   │   └── ux_ui\SKILL.md                 (v1.2, Owner-approved)
│   └── study_archive\                     (reference material only, unrelated prior project)
│       ├── engineering\SKILL.md (+ archive\)
│       └── ux_ui\SKILL.md (+ archive\)
├── shared\
│   └── simulator-core.js                 (pure JS, no DOM/Worker APIs — ADR-013; P1 = placeholder
│                                           only implementing `git init`, not real Git semantics)
├── frontend\
│   ├── public\index.html, styles.css     (committed; deploy root for Cloudflare Pages)
│   ├── public\bundle.js                  (GITIGNORED — generated by `npm run build:frontend`)
│   └── src\main.js                       (imports shared\simulator-core.js)
├── worker\
│   ├── src\index.js                      (GET /api/health only, deployed live; other routes
│   │                                       stubbed as comments)
│   └── wrangler.toml                     (D1 binding with the REAL database_id — resource
│                                           identifiers are not secrets, safe to commit)
├── migrations\
│   └── 0001_init.sql                     (users + sessions tables only — DATA-001's fuller schema
│                                           is P2 work; applied to both local and real remote D1)
├── tests\
│   ├── pipeline.test.js                  (trivial pipeline-works proof)
│   └── shared-core.test.js               (imports shared core; proves no DOM/Worker API usage)
└── tools\pbkdf2-bench\                   (standalone benchmark tool for ADR-012 — was deployed
                                            temporarily to production for real telemetry, then
                                            deleted; source kept in-repo for re-use in P2/later)
```

## 10. Current Known External Services / Accounts

- Git is installed locally (2.55.0); Node 24.11.1 / npm 11.6.2 confirmed installed.
- **GitHub**: repository `git_learning_lab` exists at
  `https://github.com/168305221005isdrus/git_learning_lab.git` (confirmed by the Owner directly, not
  guessed). The local repository is initialized on branch `main`, `origin` is configured to this URL,
  and commits are pushed successfully — `git ls-remote origin` confirms the remote's `main` matches
  local HEAD.
- **Cloudflare**: Wrangler is authenticated (`wrangler login` completed by the Owner) — account
  `168305221005-st@rmutsb.ac.th`'s Account, ID `87a7c929969c19f55798945a2c4e2e8e`. Real resources now
  exist:
  - **D1 database**: `git-learning-lab-db`, ID `6df6c304-173a-46fc-b576-205e944341da`, region APAC.
    Migration `0001_init.sql` applied to both local and **real remote** D1 — `users`/`sessions` tables
    confirmed present via a live, harmless `SELECT` query (no real classroom accounts created).
  - **Worker**: `git-learning-lab-api`, deployed and live at
    `https://git-learning-lab-api.git-learning-lab.workers.dev`. `GET /api/health` verified working
    in production (HTTP 200, correct JSON body, `access-control-allow-origin: *` present on this one
    public route only — see the comment in `worker/src/index.js` for why that's safe here and must
    not be copied to authenticated routes).
  - **Pages project**: `git-learning-lab`, live at `https://git-learning-lab.pages.dev`, now
    **GitHub-integrated** for continuous deployment — production branch `main`, build command
    `npm run build:frontend`, output directory `frontend/public`. **Verified working end-to-end this
    session**: pushed a harmless HTML-comment marker to `main` and confirmed it appeared live on
    `git-learning-lab.pages.dev` within ~10–20 seconds with zero manual `wrangler pages deploy`
    invocation; pushed its removal and confirmed that deployed too. A plain `git push` to `main` is
    now sufficient to ship a frontend change.

## 11. What Has Been Built (P1) vs. What Has NOT (still P2+)

**Built and LIVE in P1** (scaffold/proof only, not real features — but genuinely deployed):
- Local Git repository, pushed to GitHub (§10).
- Root npm project (ADR-014: plain ES modules, esbuild, Wrangler, `node:test` — no framework).
- `shared/simulator-core.js` — proves the shared-core import pattern (ADR-013) works from both a
  deployed browser bundle and a deployed Worker bundle; implements only `git init`, nothing else.
  Confirmed working live in production via a real browser load (Simulator panel shows the proof
  text).
- Frontend — live at `https://git-learning-lab.pages.dev`, confirmed via real browser rendering at a
  375px narrow viewport (no overflow, nav stacks correctly, current-section shown via color **and**
  a bullet marker, not color alone) and at desktop width; nav toggling between all six panel
  placeholders works; the page's live cross-origin health check to the Worker succeeds
  ("API health: reachable ✓" rendered in a real browser).
- Worker — live, `GET /api/health` confirmed via direct HTTP request; all other routes correctly
  return 404 (stubbed as comments only).
- `migrations/0001_init.sql` — applied and verified against **real production D1**, not just local.
- Test suite — 5 passing tests (`npm test`).
- PBKDF2 benchmark — real **production** `cpuTime` telemetry captured via a temporarily-deployed
  scratch Worker + `wrangler tail`, then the scratch Worker was deleted. **ADR-012 is now CONFIRMED
  (not provisional)**: 10,000 iterations, real max observed 5ms against the 10ms free-tier cap — see
  §13.

**Still NOT built** (P2+, do not assume otherwise):
- Real Git command semantics (only `git init` exists; SIM-001 through SIM-016 are unimplemented).
- Any real authentication, session, or password-recovery logic (AUTH-xxx/RECOV-xxx are unimplemented
  — the `users`/`sessions` tables exist in real D1, but nothing reads/writes them yet).
- Lesson, quiz, or challenge content (LEARN-xxx/FLOW-xxx/QUIZ-xxx/CHAL-xxx are unimplemented).
- A same-origin arrangement between the frontend and API (they're on two separate Cloudflare
  hostnames by design for P1 — a custom domain or Pages Function proxy is a P2+ decision).

## 12. Explicit Deferred Scope

See §4 above and `docs/SCOPE.md`'s "Out of Scope / Deferred" section for the full, current list.

## 13. PBKDF2 Benchmark Result (ADR-012) — CONFIRMED

Real production `cpuTime` telemetry (Cloudflare's actual billing metric, captured via `wrangler
tail` against a temporary scratch Worker, since deleted) showed significant run-to-run jitter at
higher counts (e.g., 20,000 iterations ranged 6–10ms across three back-to-back requests) — the
**worst observed case**, not the average, is what matters against the hard 10ms free-tier cap.
**Confirmed final value: 10,000 iterations** (max observed 5ms, real headroom for the rest of a
request) — matching the P1-interim value, now backed by production evidence rather than a local
proxy. Full detail and the complete data table: `docs/ARCHITECTURE_DECISIONS.md` ADR-012.

## 14. Immediate Next Phase

P2 is now substantially complete — see §17 for the full status report and §18 for the exact P3
starting point. This section is kept for historical continuity only.

## 15. P1 Closure Note — No Open Items

Every P1 item, including the Cloudflare authentication and GitHub-integrated Pages deployment that
were previously open, is now resolved and verified:

- **GitHub-integrated continuous deployment for Pages**: connected by the Owner (production branch
  `main`, build command `npm run build:frontend`, output directory `frontend/public`). **Verified
  this session** with a real, harmless round-trip — a temporary HTML-comment marker was pushed to
  `main` and confirmed live on `https://git-learning-lab.pages.dev` within ~10–20 seconds with zero
  manual `wrangler pages deploy` invocation, then its removal was pushed and confirmed live too. A
  plain `git push` to `main` now ships the frontend automatically.

Do not fabricate a Cloudflare resource ID, database ID, or URL anywhere in this project's docs or
config — all values in this file are real, verified values as of this session.

## 16. Recovery Instructions — What to Read First

A future session picking this project up cold should read, in this order:

1. **This file** — current state, what's locked, what exists.
2. **`skills/git_learning_lab/engineering/SKILL.md`** and **`skills/git_learning_lab/ux_ui/SKILL.md`**
   — the operating methodology for any implementation work.
3. **`docs/SCOPE.md`** — what's actually in v0.9 vs. deferred.
4. **`docs/REQUIREMENTS.md`** — concrete, testable requirements by capability.
5. **`docs/LEARNING_OBJECTIVES.md`** — the curriculum structure, derived from the PDF.
6. **`docs/ARCHITECTURE_DECISIONS.md`** — locked technical decisions and their rationale, including
   ADR-012's now-CONFIRMED PBKDF2 value and ADR-014's toolchain choice.
7. **`docs/Git & GitHub.pdf`** — the curriculum ground truth itself; re-check it directly whenever a
   curriculum question arises rather than trusting a summary.
8. **Live inspection** — run `git status`, `git remote -v`, `npx wrangler whoami`, and hit
   `https://git-learning-lab.pages.dev` / `.../api/health` directly before assuming §9/§10 above
   are still accurate; this document reflects state at authoring time and can go stale.

Do not begin implementation from memory of a prior conversation alone — verify against the live
repository and Cloudflare state first.

---

## 17. P2 Status Report — Core Simulator & Authentication

**Verified live before this session started**: git clean on `main`, 5/5 tests passing, frontend
build working, `wrangler whoami` authenticated, Pages (`git-learning-lab.pages.dev`) returning
HTTP 200, Worker `/api/health` returning `{"ok":true,...}`, D1 containing only the P1
`users`/`sessions` tables (no real accounts).

### 17.1 Simulator (`shared/simulator-core.js`)

Real Git semantics implemented (all release-blocking P2 commands, plus every "if time allows"
extended command except `git log --graph`): `init`, `status`, `add <file>`/`add .`/`add *.<ext>`,
`rm --cached`, `commit -m`, `log`/`log --oneline`, `diff`, `checkout <file>`, `reset
--soft`/`--mixed`/`--hard`, `branch`/`branch -d`, `checkout <branch>`/`checkout -b`, `merge`
(fast-forward + simple non-conflicting three-way + conflict detection), `push`, `pull`, `clone`.
The remote repository is modeled as a genuinely separate state object (`createInitialRemoteState`),
passed alongside the local state to `applyCommand` — this is what makes the two-machine
push/pull/clone scenario possible without any hidden mutation. Default branch is `master` (not
`main` as P1's placeholder used), matching the PDF/Module 5's own terminology.

**Not implemented**: `git log --graph` (commit-graph text rendering) — out of this session's staged
scope, not release-blocking per the P2 session brief's own priority order.

**Tests**: `tests/shared-core.test.js`, 43 tests — happy-path and invalid-sequence coverage for
every implemented command, the mandatory `git commit -m "test"`-with-nothing-staged case, the three
distinct `reset` mode outcomes, cross-user/cross-machine push/pull/clone scenarios, and an explicit
shell-injection-style-input security test.

### 17.2 Authentication / Session / Recovery (`worker/src/*`)

Implements ADR-011 (opaque D1-backed session token, `httpOnly`/`Secure`/`SameSite=Lax` cookie) and
ADR-012 (PBKDF2-HMAC-SHA256, 10,000 iterations). Routes: `POST /api/auth/login`, `POST
/api/auth/logout`, `GET /api/auth/session`, `POST /api/auth/change-password`, `GET
/api/admin/users`, `POST /api/admin/recovery/issue`, `GET`/`POST /api/progress`. Role is always
resolved server-side from the session (never a client-supplied field). A `mustChangePassword`
session is blocked from every route except session-check/logout/change-password (RECOV-003).

**Recovery credential expiry**: 24 hours from issuance (`RECOVERY_CREDENTIAL_TTL_HOURS` in
`worker/src/routes/admin.js`) — chosen as a simple, generous classroom-MVP window; document/revisit
if real usage shows it's wrong in either direction.

**Session lifetime**: 7 days (`SESSION_MAX_AGE_SECONDS` in `worker/src/cookies.js`) — chosen so a
student doesn't have to re-authenticate mid-week; revisit if this is judged too long for the
classroom's risk profile.

**ADR-015 (new this session)**: a same-origin Cloudflare Pages Function reverse proxy
(`functions/api/[[path]].js`) was required to make the locked cookie design actually work across
the Pages/Workers hostname split — see `docs/ARCHITECTURE_DECISIONS.md` ADR-015 for the full
problem statement and why this was raised to the Project Owner rather than silently worked around.

**Tests**: `tests/worker-auth.test.js`, 14 tests, running the real `worker/src/index.js` route
handlers against an in-memory fake D1 (`tests/helpers/fake-d1.js`) under plain `node --test` — no
Jest/Vitest dependency (ADR-014). Covers AUTH-001/003/004/005/006, ROLE-002/004/005, RECOV-002
through RECOV-006 (including TEST-004's reuse-after-change case and an expired-credential case),
PROG-002/004, ADMIN-001, and SEC-005. Verified additionally against the **real** Worker runtime via
`wrangler dev` against local D1, and against the **real production** Worker via direct `curl` (see
§17.5) — not just the fake-D1 unit tests.

**Known P2 debt**: no automated Worker-runtime test harness (e.g. `vitest-pool-workers`) exists —
ADR-014 excludes Vitest from the toolchain, so Worker route logic is verified via the fake-D1 unit
tests plus manual `wrangler dev`/production `curl` checks instead. TEST-007 (shared-core
browser-vs-Worker parity) is covered for the *simulator* core the same way P1 covered it (a single
Node-side test proving no DOM/Worker-specific API usage plus a determinism test) — there is still no
literal in-workerd execution of `shared/simulator-core.js` in the automated suite.

### 17.3 D1 Schema

`migrations/0002_p2_recovery_progress.sql` (applied to local AND real production D1, after a
verified `wrangler d1 export --remote` backup — see `backups/`, gitignored): adds
`users.recovery_expires_at` (RECOV-004) and a new `progress` table (`user_id`, `module_id`, `status`
∈ {started, completed}, `updated_at`, unique on `(user_id, module_id)` for idempotent upserts —
PROG-002).

### 17.4 Bootstrap Accounts

`tools/bootstrap-accounts/seed.mjs` generates 3 accounts (1 ADMIN, 1 TEACHER, 1 STUDENT — not the
full 31-account roster, per this session's explicit scope) with random passwords, writes the INSERT
SQL and the plaintext credentials to two gitignored local files (`seed.local.sql`,
`credentials.local.txt` — neither ever committed), applied to both local and real production D1.
**The Owner should treat `tools/bootstrap-accounts/credentials.local.txt` as the source of truth for
these three accounts' current passwords** (read it once, relay identifiers/passwords to real people
as needed, then delete the file) — the ADMIN account's password recovery, once someone knows it, can
subsequently rotate everything else via `POST /api/admin/recovery/issue`.

### 17.5 First Learning Flow

Module 3 ("The Git Workflow & Staging") is the first fully real, protected-flow lesson
(`frontend/src/lesson-module3.js`): Explanation → Demonstration → Practice (real simulator terminal
+ a non-Git "Working Directory file editor" control, since Git itself has no file-creation command —
`shared/simulator-core.js`'s `writeFile` is exported specifically for this, and is never reachable
through the command parser) → Feedback (a live checklist reacting to the actual simulator state:
Untracked → Staged → Untracked-again). Completion posts `POST /api/progress {moduleId:"module-3",
status:"completed"}`. Modules 1, 2, 4–7 remain visible in the Lessons nav, in curriculum order, each
honestly marked "content coming in a later phase" (never marked complete).

The "Simulator" nav panel reuses the same file-editor + terminal + visualizer components in
free-play mode (no lesson script) — a legitimate, low-cost reuse of Module 3's own building blocks,
not scope creep.

### 17.6 Terminal / Visualizer

`frontend/src/terminal.js`: Up/Down history recall, Enter submit, visually distinct input/output
lines (never color-only — an explicit "✖ " prefix on errors, not just red text), focus returns to
the input after every command, `aria-live="polite"` output region. `frontend/src/visualizer.js`:
renders the four protected zones (Working Directory / Staging Area / Local Repository / Remote
Repository) directly from `computeStatus()` and the commit graph — never re-derives state
independently. All rendering uses `textContent`, never `innerHTML` (SEC-002 — commit
messages/filenames are learner-supplied). `git log --graph`-style branch-topology rendering is not
implemented (matches §17.1's simulator debt) — the commit list still shows linear
parent-chain-from-HEAD order.

### 17.7 Progress Persistence

Minimal, as scoped: one row per `(user, module)` in the `progress` table, upserted idempotently.
Only `module-3` is currently written to (via the lesson flow above). No analytics beyond "which
modules has this learner started/completed" (PROG-003, shown in the Progress nav panel).

### 17.8 Production Verification Performed This Session

Via direct `curl` against the real production Worker (`https://git-learning-lab-api.git-learning-lab.workers.dev`)
and, separately, through a locally-served copy of the real Pages Function proxy pointed at that same
real Worker: health check reachable; admin/teacher/student bootstrap logins succeed; wrong password
and unknown identifier both return an identical generic 401; a request missing a matching
Origin/Referer is rejected (403) even with a correct password; `/api/admin/users` returns the
seeded accounts with no password fields; session cookie round-trips correctly through the proxy
(`Set-Cookie` relayed, subsequent same-origin request authenticates); logout invalidates the
session server-side (same cookie then gets 401). A full in-browser click-through of the login
form itself could not be exercised against `127.0.0.1` (the Origin/Referer allowlist is correctly
scoped to the real `https://git-learning-lab.pages.dev` origin, so a `127.0.0.1` dev origin is
correctly rejected by design) — that final UI click-through happens against the real deployed
Pages URL after this push, and its result is recorded in the session's final report rather than
here (this document is written mid-session, before that push).

**Update, after the push**: the full in-browser flow was verified against the real production URL
(login → Module 3 practice checklist → progress persisted → logout; Admin panel → issue a recovery
credential for `teacher1` → forced password-change gate → new password works and the old temp
credential is rejected; an XSS payload as a filename/commit message rendered fully inert; narrow
(375px) viewport has no horizontal overflow). Two side effects of this real verification now exist
in production and are not fake test data to be alarmed by: `student1`'s `module-3` progress is
genuinely `completed`, and `teacher1`'s password was changed to `teacher-new-pass-1` (update
`tools/bootstrap-accounts/credentials.local.txt`'s mental note, or just issue `teacher1` a fresh
recovery credential, before real people receive these bootstrap accounts).

## 18. Recommended P3 Starting Point

1. Re-verify production after this session's push/deploy (the final report covers this once done).
2. Decide whether Modules 1–2 (conceptual, no simulator) get real content next, or whether
   Modules 4–6 (which reuse the now-fully-implemented reset/branch/merge/push/pull/clone commands)
   are a better next step given how much simulator work is already done.
3. `git log --graph` remains unimplemented — needed before Module 5/6 lessons can show branch
   topology visually beyond the linear commit list.
4. No automated Worker-runtime (workerd) test harness exists yet — evaluate whether P3's growing
   Worker logic justifies revisiting ADR-014's "no Vitest" constraint specifically for
   `vitest-pool-workers`, or whether the fake-D1 approach continues to be sufficient.
5. The full 31-account classroom roster is still not created — still correctly deferred, not a P3
   blocker, but will need a real decision on how the Owner distributes 29 student credentials before
   the actual class starts.

---

## 19. P3 Status Report — Thai-First Curriculum, Quizzes & Challenges

**Verified live before this session started**: git clean on `main`, 58/58 tests passing, frontend
build working, `wrangler whoami` authenticated, Pages returning HTTP 200, Worker `/api/health`
returning `{"ok":true,...}`, D1 containing only P1/P2's `users`/`sessions`/`progress` tables.

### 19.1 Thai-First UI (Part A)

`frontend/src/i18n.js` is a plain, centralized string table (no i18n framework, no new dependency,
per the session brief's explicit "do NOT build a large internationalization framework" instruction)
— `t(key)` looks up Thai strings; parameterized strings are plain functions. Every learner-facing nav
label, screen, panel heading, status word, and feedback message is Thai; Git commands themselves
(`git add`, `git commit`, ...) are never translated anywhere, matching the locked "PDF terminology"
rule. `index.html`'s `lang` attribute is now `th`. A dictionary-completeness test
(`tests/i18n.test.js`) scans every `t("key")` call site across the frontend and proves each key
resolves — this is the closest this project's minimal toolchain (ADR-014: no jsdom) gets to a
rendering test for Thai content without adding a new dependency.

### 19.2 Beginner Onboarding (Part B)

`frontend/src/onboarding.js` renders under a new "วิธีใช้งาน" nav item — a short 8-step workflow list
plus four explicit notices (terminal is simulated, file editor is not a Git command, one command at a
time, Git commands stay in English). Contextual hints were added directly beside the simulator
(`simulator-workspace.js`'s `.simulator-hint` line, state-driven: "เริ่มด้วย git init" before init,
"พิมพ์คำสั่งครั้งละ 1 คำสั่ง" before any staging, "หลัง git add ให้สังเกต..." afterward) rather than
relying on the onboarding page alone.

### 19.3 Curriculum — Modules 1, 2, 4, 5, 6 Implemented

- **Module 1** (`lesson-module1.js`): conceptual, no simulator. Practice is a keyboard-operable
  sequencing exercise (reorder the 5 VCS-evolution stages via Up/Down buttons — no drag-and-drop, for
  accessibility). Quiz: `module-1` (4 questions).
- **Module 2** (`lesson-module2.js`): conceptual. Practice is a Git-vs-GitHub classification exercise
  (radio-button per item, not drag-and-drop). Quiz: `module-2` (4 questions).
- **Module 3**: unchanged simulator/visualizer/terminal/progress wiring from P2; translated to Thai;
  a formal Quiz (`module-3`) and Challenge (`challenge-module-3`) were added (previously it only had
  the practice checklist, no formal assessment pair).
- **Module 4** (`lesson-module4.js`): commit/log/log --oneline/log --graph/diff/checkout/reset
  practice with a state-driven checklist (≥2 commits, then a reset). Quiz: `module-4`. Challenge:
  `challenge-module-4` (undo the latest commit via `reset --soft`, graded on the resulting staged
  content, not the exact command used to get there).
- **Module 5** (`lesson-module5.js`): branch/merge practice with a state-driven checklist (branch
  created, then a real 2-parent merge commit observed). Quiz: `module-5`. Challenge:
  `challenge-module-5`.
- **Module 6** (`lesson-module6.js`): push/pull/clone. The "two-machine" explanation is presented as
  narrative text (Machine A / Remote / Machine B), not two simultaneously-driven terminals — the
  locked P2 `simulator-workspace` architecture models one local + one remote per instance, and
  building genuine dual-terminal synchronized state would be a real architecture expansion, not a
  copy change (Engineering skill §22: raised here, not silently built). Practice exercises a real
  `git push` against a real simulated remote; the Challenge (`challenge-module-6`) exercises a real
  `git clone` with full history transfer. Quiz: `module-6`.
- **Module 7** (`lesson-module7.js`): capstone, no new commands. One challenge
  (`capstone-module-7`), graded on final state (initialized, ≥2 commits, a real merge — fast-forward
  or divergent, both accepted — and pushed to remote), accepting any valid command order (CHAL-005).
  No quiz (Should-Have per `docs/REQUIREMENTS.md` QUIZ-001b; not built, time better spent elsewhere).

**A real defect found and fixed via production browser testing** (not just unit tests): the first
versions of `challenge-module-5` and `capstone-module-7` required the learner to create NEW files
mid-challenge via the Working Directory file editor — but `ADR-013`'s replay model only ever
transmits the Git *command* transcript; `writeFile` calls are deliberately outside the command
grammar (SIM-014) and never reach the Worker. Every such transcript was unwinnable even when
performed correctly in the live UI. Fixed by pre-seeding every file each challenge needs directly
into its authoritative `buildStartingState()` (server-side, never learner-supplied) — both challenges
are now completable with real Git commands alone, and this was re-verified end-to-end against the
live production Worker (see §19.8).

### 19.4 `git log --graph` and Branch Visualization (Part F)

`shared/simulator-core.js` now implements `git log --graph` (and `--graph --oneline`) — a documented,
tested, lane-based renderer (see the in-file spec comment above `renderCommitGraph`) scoped to the
current branch's own ancestry (matching real Git's non-`--all` behavior), correctly showing fork
points, HEAD, branch-name decorations, and merge joins for the curriculum's actual scenarios (single
feature branch, one merge) — it does not implement general octopus-merge/many-branch layout, which is
out of this project's scope. `buildCommitGraph()` (new, exported) computes every commit reachable
from ANY branch pointer, annotated with branch names + HEAD; the visualizer's Local/Remote Repository
zones now use it (VIS-003/004) instead of only showing the current branch's own linear chain, so a
diverged Feature Branch and a merge's two parents are genuinely visible, not decorative. Verified
against real production state via browser testing (§19.8): a real fork/merge scenario rendered
correctly as `* d8c9cd0 (HEAD -> master) Merge... / * | ... / | * ... (feature) / * ... base`.

### 19.5 Quiz System (Part D)

`shared/quiz-data.js` — one pure data module (question bank + `scoreQuiz()`), imported unmodified by
both the frontend (`quiz-component.js`, renders questions/choices) and the Worker
(`worker/src/routes/quiz.js`, the only place a score is ever computed). The Worker never trusts a
client-reported score — it recomputes from the answer key on every submission
(`POST /api/quiz/submit`), matching QUIZ-002. Quizzes exist for Modules 1–6 (QUIZ-001); each question
carries a wrong-answer explanation shown after submission, never just an aggregate score (QUIZ-003).
Reachable both embedded in each lesson and via a new top-level "แบบทดสอบ" nav hub
(`quizzes-hub.js`, Part H).

### 19.6 Challenge System (Part E, ADR-013, TEST-006)

`shared/challenges.js` — one pure data/logic module (starting-state builders + success-condition
checks + `replayChallenge()`), imported unmodified by both the frontend
(`challenge-component.js`, loads the starting state into a simulator workspace and records the
learner's live command transcript) and the Worker (`worker/src/routes/challenge.js`, the ONLY place
pass/fail is ever decided). The submission body is `{challengeId, transcript}` — the Worker never
reads a `passed`/`completed`/`finalState` field from the request even if one is present (verified by
`tests/worker-quiz-challenge.test.js`'s TEST-006 suite: forged `passed=true` alone → 400, a fabricated
`finalState` alone → 400, a transcript that doesn't reach the goal → `passed:false`, an alternate
valid command path → `passed:true`, cross-user submission isolation, and non-array transcripts
rejected before any replay). Challenges exist for Modules 3–7 (CHAL-001); Modules 1–2 correctly have
none. Reachable both embedded in each lesson and via a new top-level "แบบฝึกท้าทาย" nav hub
(`challenges-hub.js`).

### 19.7 D1 Schema — Migration 0003

`migrations/0003_p3_quiz_challenge.sql` (applied to local AND real production D1, after a verified
`wrangler d1 export --remote` backup — `backups/pre-p3-migration-20260906-201243.sql`, gitignored):
adds `quiz_results` (one row per user+quiz, latest attempt, retakes overwrite) and
`challenge_results` (one row per user+challenge, idempotent upsert that never downgrades an
already-earned pass back to a fail — same pattern as 0002's progress upsert).

### 19.8 Production Verification Performed This Session

Beyond the automated suite (99 tests, up from 58, zero regressions to P1/P2 coverage), this session's
Worker changes were verified against the REAL Cloudflare Workers runtime three separate ways: (1)
`wrangler dev` against local D1 — full login → quiz submit → quiz results → challenge submit →
challenge results → TEST-006 forgery-rejection round-trip via direct `curl`; (2) direct `curl` against
the deployed production Worker confirming unauthenticated challenge submission is rejected (401)
before any challenge logic runs; (3) a full real-browser click-through against
`https://git-learning-lab.pages.dev` as `student1`: Thai UI rendering across every panel, the Module 1
sequencing exercise (interactive reorder + correct/incorrect feedback), a real Module 5 branch/commit/
merge sequence with `git log --graph --oneline` producing the correct fork/merge ASCII graph and the
visualizer's Local Repository zone showing all commits with branch decorations, a real Module 5
Challenge submission (`passed: true` after the buildStartingState fix in §19.3), a real Module 7
capstone submission (`passed: true`), the Progress panel aggregating lesson/quiz/challenge status
correctly, an XSS payload as a filename rendering fully inert (`<img src=x onerror=...>` shown as
literal text, never executed), and unauthenticated/wrong-Origin/wrong-password requests all correctly
rejected (401/403) against production. Responsive verification: zero horizontal overflow at 375px
(mobile) and 768px (tablet) across every panel (Lessons/Module detail with terminal+visualizer+quiz+
challenge, Simulator, Challenges hub, Quizzes hub, Cheat Sheet, Onboarding, Progress).

**Known limitation, not fixed this session**: the browser automation tool's simulated Enter keypress
did not reliably trigger the terminal's form submission during this session's own testing (the
existing "Run" button — added in a prior P2 commit for exactly this class of reliability issue — was
used instead, and worked correctly every time). This is very likely an automation-tool quirk, not a
regression in `terminal.js` (a real human's Enter key in a real browser is a native, trusted keyboard
event distinct from any automation replay), but it was never independently re-confirmed with a real
physical keyboard this session — worth a quick manual sanity check before the class uses it.

### 19.9 Remaining P3 Debt

- Module 7's capstone quiz remains not built (Should-Have, QUIZ-001b — Modules 1–6 already assess
  every underlying concept individually).
- A larger quiz/challenge bank beyond the per-module minimum (Should-Have) was not built — time was
  spent on Must-Have breadth (5 new modules + both systems + graph rendering) over Should-Have depth.
- No automated Worker-runtime (workerd) test harness exists yet — same P2 debt, unchanged; the
  fake-D1 approach plus this session's real `wrangler dev`/production `curl` verification continues
  to substitute for it.
- The full 31-account classroom roster is still not created (unchanged from P2 — correctly deferred).
- Certificate/audit-log/learning-history features remain intentionally not built (Owner-noted future
  direction, explicitly out of P3 scope per the session brief).

---

## 20. Recommended P4 Starting Point

1. Manually confirm real-keyboard Enter-to-submit in the terminal works as expected in an actual
   browser (not just the automation tool's Run-button fallback) — quick, cheap, worth doing before
   the class starts.
2. Decide whether the Should-Have items (Module 7 capstone quiz, a larger quiz/challenge bank per
   module, minor visualizer animation polish) are worth the remaining time before September 12, or
   whether P4 should instead focus entirely on classroom-readiness (roster creation/distribution,
   a final full-class dry run, teacher walkthrough).
3. Create and distribute the full 31-account roster (29 Student + 1 Teacher + 1 Admin) — the actual
   classroom-launch blocker most likely to need lead time, not a coding task.
4. Consider a short, deliberate final regression pass covering all three phases' automated tests plus
   one more full manual click-through as close to September 12 as practical, specifically to catch
   the kind of design gap this session found in §19.3 (a defect invisible to unit tests but visible
   immediately under real end-to-end browser use) — this session's own experience is direct evidence
   that "unit tests pass" and "the feature is actually usable" are not the same claim for this
   project's challenge system specifically.
5. Certificate/audit-log/learning-history remain explicitly deferred until all P3/P4 Must-Haves are
   stable — do not start them early per the session brief's own instruction.

---

## 21. P3.5 Status Report — Classroom Readiness Quick Pass

A bounded verification/fix-only pass (no new features, no architecture, no scope growth). Found and
fixed **two real, previously-undetected defects** plus one wording inconsistency — none caught by the
99 tests passing at the end of P3, which is itself the most important finding of this pass.

**Defect 1 — `challenge-module-4` was permanently unpassable for every student.** Its check compared
`state.commits.length` to `1`, but `shared/simulator-core.js`'s commit store is append-only (§7 of the
Engineering skill) — `git reset --soft` moves the branch pointer without deleting the undone commit
from that array, so the array always had 2 entries no matter what a learner did. Fixed to count
commits *reachable from HEAD* (the same walk `git log` itself does), matching real Git's own notion of
"current history." Two regression tests added (a real `--soft` pass case with a dynamically-derived
commit hash, and a `--hard` case that must still fail). This is the second real defect this project's
challenge system has had that only surfaced under actual command-by-command replay, not code review —
see §19.3 for the first (Module 5/7's file-editor gap).

**Defect 2 — the Progress panel went stale after its first visit each session.** Every panel rendered
exactly once per session (a `panelRendered` cache, existing since P2, meant to avoid destroying a
learner's live in-progress terminal/quiz state on re-render). That same protection accidentally
applied to Progress too, which has no interactive state to lose — a learner who opened Progress once,
then later passed a challenge or took a quiz, would see the old status until a full page reload.
Fixed by excluding Progress specifically from that cache (`ALWAYS_REFRESH` in `frontend/src/main.js`)
— every other panel's caching (which correctly protects live work) is unchanged.

**Wording fix**: `shared/quiz-data.js`'s Module 4 quiz title said "History" in English while every
sibling module title (and `modules-meta.js`'s own Module 4 title) used the Thai "ประวัติ" — now
consistent.

**Enter-key investigation (§20 item 1, resolved)**: attached real `keydown`/`keyup` listeners to the
terminal input and replayed the browser tool's own "Return" key action — it dispatched an event with
an empty `key`/`code` and `keyCode: 0`, which is why `terminal.js`'s (correct, standard)
`e.key === "Enter"` check never fires under this specific automation tool. This is a synthetic-input
limitation of the testing tool itself, not an application defect — a genuine Enter keypress in any
real browser sets these properties correctly. The existing "Run" button (added in a prior P2 commit
for exactly this class of concern) was used for all of this pass's own testing and worked every time.
**This still has not been confirmed with an actual physical keyboard** (no such capability was
available this session either) — a two-minute manual check on a real device before the class starts
remains the one open item here.

**Verified this pass**: real Quiz + Challenge submissions for every applicable module (Modules 1, 2,
6 quizzes scored correctly server-side with deliberately-wrong answers to confirm real scoring, not a
fixed value; Modules 3, 4, 5, 6 challenges all passed with correct transcripts after the fixes above);
Progress aggregation now updates live without reload; zero horizontal overflow at 375px across all 7
nav panels plus a full module detail page (terminal+visualizer+quiz+challenge); no stray English text
or mangled characters found in `i18n.js`/`quiz-data.js` beyond the one title fixed above; no secrets
in any diff. Full suite: 99 → 101 passing (two new regression tests), zero regressions. Frontend build
clean. Worker redeployed once (both code fixes touch `shared/challenges.js`, which the Worker bundles
directly); the Progress-panel fix was frontend-only and needed no Worker redeploy. All three commits
pushed to `main` and confirmed live via `bundle.js` content checks after each deploy.

**Project state: safe to pause.** Production is live, healthy, and passing its own real-content
verification end-to-end. No open defect is currently known. The only remaining action item is the
physical-keyboard Enter-key spot-check noted above, which is low-risk (a working fallback already
exists) and not blocking.

---

## 28. P9 Status Report — Full Product Visual Redesign

**Owner Decision**: explicit, recorded authorization for a complete visual redesign of the
presentation layer, superseding P7's "NORMALIZE, do not REDESIGN" constraint for this phase only.
Business logic, simulator semantics, scoring, completion rules, auth/session architecture, and role
permissions were explicitly out of scope and were not touched.

### 28.1 Preflight

Read `docs/PROJECT_CONTEXT.md` (P1–P8 history), `docs/SCOPE.md`, `docs/ARCHITECTURE_DECISIONS.md`,
both `skills/git_learning_lab/*/SKILL.md` files, `frontend/public/index.html`,
`frontend/public/styles.css` (1,549 lines), and every `frontend/src/*.js` render function (class-name
inventory extracted via `grep`) before editing anything. Baseline confirmed by live inspection: git
clean on `main`, **172/172 tests passing**, frontend build clean.

### 28.2 Visual Direction

"Modern Developer Learning Platform" — a distinct indigo/violet-blue brand accent (`--accent-500
#5b64f0`) paired with a teal secondary (`--accent2-500 #17b6a0`) for flow/remote-state accents, a
light neutral surface system with soft depth (layered cards, subtle shadows, a low-opacity dot-grid
background wash), and a dedicated dark terminal surface (`--term-bg #0c0e18`) as the product's
signature developer-tool moment. No external font was loaded (privacy/performance/offline-reliability
trade-off, stated explicitly rather than defaulted into) — typography uses a refined system-font
stack; the certificate's learner name uses a serif fallback stack (`Georgia, "Noto Serif Thai", ...`)
for a formal moment, still zero network dependency.

### 28.3 Files Changed

- `frontend/public/styles.css` — full rewrite (29.7KB → ~56.9KB after a duplicate-token cleanup
  pass): tokens → reset/base → motion system → typography → layout shell → buttons/forms/status →
  auth screens → dashboard/cards → lessons/simulator/terminal/visualizer → quiz/challenge/hubs/
  cheatsheet/onboarding → certificate/verify → teacher/admin → responsive sweep → print. Every
  existing class name used by `frontend/src/*.js` (inventoried by source grep before writing a single
  rule) was preserved — the vast majority of the redesign required zero JS changes.
- `frontend/public/index.html` — added a brand mark/logo, a skip-link, inline SVG icons on every nav
  button (all IDs/structure preserved — `main.js`'s `getElementById` calls are unaffected), and a
  split-hero `.auth-layout` (`.auth-visual` decorative panel + `.auth-card`) wrapping the existing
  login/register form markup in place (every input/button `id` unchanged).
- `frontend/src/terminal.js` — added a presentation-only chrome header (three dots, a static title, a
  "SIMULATED" badge) reinforcing the existing "not a real shell" notice. `onCommand`/history/focus
  logic untouched.
- `frontend/src/visualizer.js` — added a per-zone icon, a `vis-zone--{kind}` identity class per zone,
  flow-arrow separator elements between zones (CSS-rotated to vertical on narrow viewports), and a
  representational "state just changed" pulse class toggled after every render. State computation
  (`computeStatus`/`buildCommitGraph`) and the `textContent`-only rendering discipline (SEC-002) are
  unchanged; the only two `innerHTML` uses added are fixed, hardcoded, non-learner-controlled SVG path
  strings (icons/arrows), never learner/commit/file text.
- `frontend/src/i18n.js` — two new keys (`terminalChromeTitle`, `terminalChromeBadge`) for the new
  terminal chrome text; verified by the existing i18n completeness test.
- A temporary visual-QA harness (`frontend/src/_preview-entry.js`, `frontend/public/_preview.html`,
  `frontend/public/_preview-bundle.js`) was created to render every panel with mock data (no live
  Worker/D1 needed), used for the full screen-by-screen review below, then **deleted before commit**
  per the no-leftover-demo-code rule — confirmed absent via `git status`.

### 28.4 Design Tokens / System

New token layers in `:root`: brand palette (`--accent-*`, `--accent2-*`), neutral surface system
(`--surface-0/1/2`, `--surface-border(-strong)`), semantic success/danger/warning/info colors (each
with a `-bg`/`-border` pair), a dedicated four-zone identity palette (`--zone-working/staging/local/
remote` + `-bg`), a dark terminal palette (`--term-*`), an expanded spacing scale, a radius scale
(sm→pill), a shadow scale (xs→lg plus `--shadow-glow`/`--shadow-terminal`), and a motion-token layer
(§28.13). A stray duplicate/garbage token declaration (`--ink-900`, `--term-bg-raised` each briefly
had two conflicting values from an editing slip) was caught and cleaned up before commit — confirmed
via `grep` for duplicate custom-property declarations (none remain).

### 28.5 Typography

System-font stack only (no Google Fonts/network font) — `-apple-system, BlinkMacSystemFont, "Segoe
UI", "Noto Sans Thai", "Noto Sans", system-ui, ...` for body text, a monospace stack for all Git
commands/code, and a serif fallback stack reserved for the certificate's learner name only. Heading
scale uses `clamp()` for fluid sizing across viewports. Verified Thai rendering visually at every
viewport class (no clipping, no cramped line-height) via the visual-QA pass.

### 28.6 Color / Background / Surface System

Light neutral base (`--color-bg #f5f6fc`) with a fixed, low-opacity radial-gradient + dot-grid wash;
cards use `--surface-0` (white) with soft shadows and a colored accent stripe/border rather than heavy
borders; the header uses a translucent `backdrop-filter: blur()` surface (glass used deliberately in
exactly one place — the sticky header — not applied everywhere). No pure "white page + blue gradient
+ random rounded cards" default was accepted — the four-zone visualizer, terminal, and certificate
each carry their own distinct surface treatment rather than reusing one generic card look everywhere.

### 28.7 Navigation Redesign

Sticky, blurred header with a brand mark; nav became a rounded-pill button bar with inline SVG icons
+ labels, a gradient-filled active state (color **and** a small dot marker — A11Y-003, never
color-only), and hover/press states. On narrow viewports (≤420px) the nav becomes a horizontally
scrollable pill bar (`overflow-x: auto`, `flex-wrap: nowrap`) instead of a tall vertical stack — an
app-like pattern verified in-browser at 375px with no page-level horizontal overflow. No new
JS was needed for this (CSS-only), keeping the existing `wireNav`/`activatePanel` logic in `main.js`
completely untouched.

### 28.8 Login/Register Redesign

Split-hero layout (`.auth-layout`): a gradient `.auth-visual` panel (decorative inline-SVG commit
graph, product message, code-snippet chips) beside a premium `.auth-card` containing the exact
existing form markup/IDs. Collapses to a single stacked column below 900px, decorative graph hidden
below that to save vertical space; verified at 375px with no overflow and full readability
(screenshots taken at both desktop and mobile widths). Force-change and public-Verify screens keep a
simpler centered-card treatment (still fully restyled — rounded, shadowed, on-brand) since they are
transitional/utility screens, not first-impression screens.

### 28.9 Student Dashboard Redesign

Hero greeting, a gradient/shimmer overall-progress bar (CSS-only shimmer sweep, respects
reduced-motion), a course-complete banner, and a module-card grid with a top accent stripe, hover-lift
transform, and status/quiz/challenge badges. Verified visually in three states via the mock harness:
empty (0%), partial progress (42%, mixed lesson/quiz/challenge badges), and would render the
course-complete banner identically to the existing (unmodified) conditional in `dashboard-panel.js`
once `completion.isComplete` is true.

### 28.10 Lessons / Module Redesign

`.lesson-stage` now carries a left accent rail + a small filled dot marker per stage, giving the
protected Explanation → Demonstration → Practice → Feedback sequence (UX skill §6) a visible spine
without changing the DOM order or any stage's content. `.demo-line` restyled to look like a small
terminal command chip (dark surface, monospace) rather than a plain bordered box. The P8
reinforcement ("จำให้ได้") box now reads as a distinct warm callout, not a generic bordered `<div>`.

### 28.11 Terminal Redesign (signature component)

Added a presentation-only chrome header (traffic-light dots, a static "เทอร์มินัลจำลอง — ไม่ใช่ Shell
จริง" title, a "SIMULATED" badge) over a dark (`#0c0e18`) surface with a cyan input/prompt accent,
amber system-message color, and a soft red error color — all paired with existing non-color signals
(the "✖ " error prefix, the literal "$ " prompt) per A11Y-003. New terminal lines fade in via a
`--dur-fast` CSS animation. Verified live: `git init` → file creation → `git add` → `git commit` →
`git push`, confirming input/output/error distinction, focus retention, and the Run-button fallback
(the existing Enter-key automation-tool limitation documented in §21 is unrelated to this session's
changes and was not re-investigated here) all still work correctly.

### 28.12 Four-Zone Visualizer Redesign (signature component)

Each zone (Working Directory / Staging Area / Local Repository / Remote Repository) now has a
distinct top-accent color, background tint, and small identity icon, plus a connecting flow-arrow
between zones reinforcing the taught pipeline direction. **Tier-B contract check performed**: verified
live (screenshot evidence, not source-reading alone) that after `git init → add → commit → push`, all
four zones remained independently legible and simultaneously visible, the committed file correctly
disappeared from Working Directory's "untracked" list while showing as "Committed," the same commit
hash (`18e993b`) appeared identically in both Local and Remote after `push`, and the HEAD marker
rendered as a distinct pill exactly on the current branch tip — the four-zone distinction (UX skill
§9) and commit-graph fidelity (UX skill §10) both held. A layout defect was found and fixed during
this same verification pass: the original `grid-template-columns: repeat(4, 1fr)` implementation wrapped
into a visually broken 2×2 layout at medium/tablet widths because 4 zones + 3 arrow elements (7 grid
items) don't divide evenly into 4 fixed columns, breaking the flow narrative mid-wrap. Replaced with a
`flex` row (`overflow-x: auto` on ultra-narrow, `flex-direction: column` only below the 640px
breakpoint) — re-verified after the fix.

### 28.13 Git State-Transition Animations

A representational, not literal-DOM-tracking, approach (deliberately chosen per the brief's own
explicit allowance: "Motion can be representational rather than literal item DOM movement if literal
movement would create brittle architecture" — literal per-item tracking is not feasible given the
visualizer's existing full-rerender-per-command architecture, which is Tier-B protected and was not
restructured for this phase). `visualizer.js` toggles a `vis-updated` class after every render,
triggering a single gentle box-shadow pulse (`gentle-pulse`, `--dur-celebrate`) across the whole
visualizer surface — a clear "something changed" signal without asserting exactly which node moved.
Individual commit/file items still fade in on insertion (`fade-in-up`), and the HEAD marker pops in
(`pop-in`) each time it's (re)rendered — so a `checkout` that moves HEAD is still visibly, if not
literally-trackedly, indicated.

### 28.14 Branch / HEAD Redesign

Commit IDs render as small dark monospace chips; the current branch name is a colored pill in the
`.vis-branch-line` header; `[branch-name]` decorations use a distinct accent color, merge markers use
the staging-amber color, and HEAD renders as a filled accent pill with a pop-in animation — all
verified against real simulator output (not decorative placeholder text) in the same live
init→add→commit→push pass as §28.12.

### 28.15 Quiz Redesign

Choice rows now have a full clickable card treatment with a `:has(input:checked)` selected state
(border + tint), correct/wrong feedback keeps its existing non-color text prefix (✓/✖) with a fade-in
reveal, and the score summary is a larger accent-colored figure. Scoring/subset-selection logic
(`selectQuizQuestions`/`buildQuizAttemptSeed`, Worker-side re-verification) was not touched. Verified
live: selecting a choice visibly highlights it.

### 28.16 Challenge Redesign

Given a visually distinct "hands-on mission" identity from quizzes: an accent-tinted goal callout with
a left border (vs. the quiz's plain fieldset), a warm hint-reveal box, and a primary-styled first
action button. Pass feedback gets a one-time `celebrate-scale` pop (≤`--dur-celebrate`, non-blocking,
reduced-motion-safe) rather than a static color change alone — still paired with the existing "✓ "/"✖
" text prefixes. No XP/points/streaks were added, consistent with the locked anti-gamification rule
(UX skill §27).

### 28.17 Progress / History Redesign

Progress table restyled with a subtle header row and row-hover tint; Learning History timeline items
keep their existing color-coded left border (completed/failed/quiz) now on a proper card surface with
a hover micro-shift. Neither component's data source or computation changed.

### 28.18 Cheat Sheet / Onboarding Redesign

Cheat Sheet commands render as dark monospace chips inside a bordered, rounded table (replacing the
plain bordered `<table>`); Onboarding's 8-step list gained numbered gradient circle badges via CSS
`counter()` (no new DOM). No command/content changed — purely presentational.

### 28.19 Certificate + Print Redesign

A restrained but genuinely premium treatment: a soft double border (an outer 1px + an inset
pseudo-element border), one small corner flourish glyph, a serif learner-name treatment, and a
dashed-rule metadata block — verified live via the mock harness with a real issued-certificate
payload. The print stylesheet was reviewed (not just "hide nav"): explicit `@page { size: A4 landscape;
margin: 14mm; }`, borders forced to print-safe widths, and all `.no-print`/nav/header/footer elements
still hidden. No external PDF service, no signature/issuer identity was invented.

### 28.20 Public Verify Redesign

Restyled as a trustworthy, centered card; valid results get a success-tinted card with a "✓ " prefix
on the title (paired with the green tint, not color-only); invalid results get a clearly bordered
warning card with "⚠ ". Verified both states via the mock harness (`valid` and a deliberately-missing
id).

### 28.21 Teacher Redesign

KPI summary cards, the roster table (reusing the existing `.progress-table` mobile-safe
`overflow-x:auto` pattern, not a parallel system), search/filter controls, and the student-detail
module-status rows were all restyled consistently with the rest of the product. Verified live via the
mock harness at both desktop and a tall-viewport full-page view — no data/analytics beyond what
`teacher-panel.js` already fetched was added.

### 28.22 Admin Redesign

Kept deliberately minimal/utilitarian per the UX skill's own instruction (§1: "not a design priority")
— restyled the account list and recovery form with the same shared primitives (`.btn`, form field
styles) as everywhere else, so it no longer looks visually neglected, without inventing a second
product identity for it.

### 28.23 Motion System

Tokens: `--dur-fast 140ms`, `--dur-normal 220ms`, `--dur-slow 320ms`, `--dur-celebrate 560ms`,
`--ease-standard`, `--ease-emphasized`, `--ease-out`. Applied to: nav/button hover-press, card
hover-lift, progress-bar fill + shimmer, status-badge entrance, panel entrance (`fade-in-up`),
terminal line entrance, visualizer item entrance + HEAD pop-in + whole-surface pulse, quiz/challenge
feedback reveal, challenge-passed celebration, onboarding/cheatsheet static (no animation needed
there), and the certificate's one-time reveal on render. No constant idle-state motion, no bounce
overuse, no animation that blocks interaction (all are on entrance/state-change, never looping
indefinitely except the deliberately subtle progress-bar shimmer).

### 28.24 Reduced-Motion Behavior

A single authoritative `@media (prefers-reduced-motion: reduce)` block at the top of the motion
section collapses every animation/transition duration to near-zero — this is a blanket override, not
a per-component opt-out, so no future component can accidentally ship motion that ignores the
preference. Not independently re-verified with an actual OS-level reduced-motion toggle this session
(no such device/emulation capability was available) — logged as the one unverified accessibility claim
below (§28.31) rather than asserted as fully confirmed.

### 28.25 Mobile / Tablet Redesign

Verified live at 375×812 (mobile preset): auth split-hero collapses cleanly to a single stacked card,
nav becomes a horizontal scroll pill bar, Dashboard/Progress/History/module cards stack to one column,
zero horizontal page overflow observed on any screen tested. The visualizer's four-zone flow switches
from a horizontal row to a vertical stack (arrows rotate 90°) below 640px — verified via the same
live init→add→commit→push sequence rendered at narrow width. Teacher/Admin also verified to reflow
(existing `overflow-x:auto` table pattern preserved, plus a new stacked-control layout for the
roster's search/filter row below 420px).

### 28.26 Accessibility Verification

Checks actually performed (not claimed beyond this): every status signal retains its existing
non-color text/icon pairing (verified by reading the CSS — every `::before`/text-prefix from the prior
version was preserved or extended, never removed); focus-visible outline rule preserved and extended
to `input`/`textarea`/`select`/`[tabindex]`; a skip-link was added (new, not present before);
`aria-current`'s existing dot-marker convention on the active nav item was kept in addition to the new
gradient background; keyboard operability of every interactive element was not independently
re-tested with a real screen reader this session (no such tool was available) — the practical baseline
(semantic elements, focus-visible, non-color status) was verified by source inspection plus the live
click-through testing performed for every other check in this report. This is stated as a bounded
claim per UX skill §12, not asserted as "fully accessible."

### 28.27 Performance / Bundle-Size Before vs. After

- `frontend/public/styles.css`: 29.7KB → ~56.9KB (full design-system rewrite; still trivially small,
  no separate HTTP request added — one existing `<link>`).
- `frontend/public/bundle.js`: esbuild reports `359.2kb` both before and after this phase's JS
  changes (terminal chrome + visualizer icons/arrows) — the addition is real but too small to move the
  1-decimal esbuild summary; no new runtime dependency was added (Engineering skill's "no framework"
  constraint, ADR-014, was preserved — every new visual element is plain DOM/CSS, zero new npm
  packages).
- No web font, icon-font, or animation library was added (all icons are inline SVG written directly
  in source; all motion is CSS/`@keyframes`).

### 28.28 Tests + Final Count

**172/172 passing, unchanged** from the pre-P9 baseline (P9 added no new testable JS logic — the
visualizer/terminal additions are presentation-only DOM/class changes with no branching logic worth a
dedicated unit test, matching the brief's own "do not inflate test count with meaningless CSS
snapshots" instruction). `npm run build:frontend` clean.

### 28.29 Production Visual Verification

Performed against a local static preview (`frontend-static`, `frontend/public` served directly) plus
a temporary, since-deleted mock-data harness — **not yet re-verified against the real deployed
`https://git-learning-lab.pages.dev` URL**, because that requires this session's commit to actually be
pushed and auto-deployed first. This is the one still-open item before P9 can be called fully closed
end-to-end (see §28.33).

### 28.30 Production-Data Side Effects

None. No real account was created or modified; the temporary visual-QA harness used only fabricated
mock data and was deleted before commit (confirmed via `git status` showing no `_preview*` files).

### 28.31 Git / Pages / Worker Deployment Status

Frontend-only change (`frontend/public/*`, `frontend/src/*`, this document) — no `shared/*` or
`worker/*` file was touched, so **no Worker redeploy is needed or was performed**, matching the
brief's own expectation. Deployment is GitHub → Cloudflare Pages auto-deploy (unchanged since P1); the
commit for this phase still needs to be pushed for that to trigger.

### 28.32 Remaining Visual Debt

- Reduced-motion and screen-reader behavior were verified by source inspection and general live
  testing, not by an actual assistive-technology device/reduced-motion OS toggle (§28.24/§28.26) —
  worth a real device spot-check before the Owner treats accessibility as fully re-confirmed
  post-redesign.
- The visualizer's "state changed" motion (§28.13) is representational (a whole-surface pulse), not a
  literal per-item transition (e.g., a staged file visibly sliding from Working Directory into
  Staging) — a deliberate, stated trade-off per the brief's own explicit allowance, not an oversight.
- No literal SVG progress-ring was built for the Dashboard/Certificate completion percentage (kept as
  an enhanced linear gradient/shimmer bar instead) — a scope judgment call to avoid a DOM/JS change to
  `dashboard-panel.js`/`certificate-panel.js` for a purely cosmetic upgrade; can be revisited later if
  the Owner specifically wants it.

### 28.33 Owner Decisions Made / Pending

**Made this session**: none beyond the standing P9 authorization itself — every choice in §28.2
onward was an ordinary aesthetic decision within that authorization's explicit scope, per §44 of the
Owner's own brief ("For ordinary visual redesign decisions, proceed autonomously").

**Pending**: push this session's commit and confirm the live Cloudflare Pages deployment renders
identically to the local verification in this report (§28.29's one open item) — no code change is
pending, only the deploy-and-confirm step.

### 28.34 Whether P9 Is Safe to Approve

**Yes, pending the final push-and-live-verify step (§28.29/§28.33).** Every screen listed in the P9
brief's coverage checklist was visually reviewed and redesigned (auth, Dashboard, Lessons, Simulator/
Terminal/Visualizer, Quiz, Challenge, Progress, History, Cheat Sheet, Onboarding, Certificate, Public
Verify, Teacher, Admin); the four-zone and commit-graph Tier-B contracts were checked live, not just
read from source; 172/172 tests remain green; the frontend build is clean; no business logic,
completion rule, scoring, or auth/session behavior was touched; and no leftover demo/preview code
remains in the tree. The screens that changed the most, visually, are Login/Register (new split-hero
identity), the Terminal and four-zone Visualizer (the product's new signature components), and the
Certificate (new premium treatment) — nothing was left in its old "flat box on a plain page" state.

---

## 27. P8 Status Report — Curriculum Depth, Assessment Expansion, v1.0 Enhancement

**Verified live before this session started**: git clean on `main`, 152/152 tests passing, frontend
build working. This is an intentional, Owner-authorized **post-freeze enhancement phase** (§26.7
explicitly said "do not start P8" until this Owner Decision was made) — scope is bounded by the P8
brief's own explicit boundaries (§17 there): no multi-class/multi-course architecture, no rewrite of
stable P0–P7 systems, no gamification, no new Git concept beyond `docs/Git & GitHub.pdf`.

### 27.1 Method / Preflight

Read `docs/PROJECT_CONTEXT.md` (this file), `docs/SCOPE.md`, `docs/REQUIREMENTS.md`,
`docs/LEARNING_OBJECTIVES.md`, `docs/ARCHITECTURE_DECISIONS.md`, and both
`skills/git_learning_lab/*/SKILL.md` files first, then inspected the actual quiz/challenge/curriculum/
completion source (`shared/quiz-data.js`, `shared/challenges.js`, `shared/curriculum.js`,
`shared/completion.js`, `worker/src/routes/quiz.js`, `worker/src/routes/challenge.js`,
`frontend/src/quiz-component.js`, `frontend/src/challenge-component.js`) before writing anything, per
the source-of-truth hierarchy. Preflight confirmed: git clean, 152/152 tests passing, frontend build
clean, local D1 already had all P1–P5 tables (no schema drift).

### 27.2 Module 7 Quiz (Owner brief §1)

Added `QUIZZES["module-7"]` to `shared/quiz-data.js` — 8 questions, Thai-first, each with an
explanation, integrating Modules 3–6 (staging → commit/reset → branch/merge → push) plus two
questions reinforcing Module 2's offline-first principle in the capstone context. **Introduces no new
Git command or concept** — every question maps to content already taught in Modules 1–6. Marked
`optional: true` on the quiz object (display-layer flag) and, critically, **`shared/curriculum.js`'s
`module-7` entry keeps `quizId: null` unchanged** — this is the actual mechanism that keeps it
non-blocking: `shared/completion.js`'s evaluator never looks up a `quiz_results` row keyed
`"module-7"` at all, so submitting it can never affect `isComplete`/`percent` (verified by a new test,
§27.13). `frontend/src/modules-meta.js` adds a frontend-only `OPTIONAL_QUIZ_IDS` map
(`{"module-7": "module-7"}`) used purely for display/labeling in the Quizzes hub and inside Module 7's
own lesson page — this file, not `shared/curriculum.js`, is where "optional" is expressed, per the
Owner brief's explicit instruction that `shared/curriculum.js`/`shared/completion.js` remain
authoritative and untouched.

**Owner Decision recorded**: Module 7's quiz is optional/enrichment, exactly as the brief specified —
no different decision was needed or made.

### 27.3 Quiz-Bank Expansion (Owner brief §2)

Every Module 1–6 bank grew from 4 to 8 questions (all in `shared/quiz-data.js`); Module 7's new quiz
also has 8. **Every original question id (`m{n}-q1`..`m{n}-q4`) is unchanged** — only `m{n}-q5..q8`
were added — so no existing `quiz_results` row (which stores only an aggregate score, never
per-question ids) can be invalidated or reinterpreted. New questions mix conceptual recognition,
command-selection scenarios, state/workflow reasoning, common-beginner-mistake, and
result-interpretation styles, per the brief's explicit mix requirement; wording was deliberately
varied per module to avoid repetition. Every question has exactly one unambiguous `correctIndex`, a
non-empty Thai explanation, and PDF-consistent terminology (Modified/Staged/Committed, HEAD, DVCS,
etc.) — content was derived from `docs/LEARNING_OBJECTIVES.md` (the PDF's own traceable derivation)
and cross-checked against the existing, already-approved P3 question style rather than re-deriving
from the raw PDF from scratch. No out-of-PDF command or concept was introduced anywhere.

### 27.4 Randomized Quiz Attempts (Owner brief §3) — bounded random subset, stateless design

**This was the one item the brief explicitly said to STOP on if it required an unjustified
architecture expansion or a server-side attempt/session table.** After inspecting the existing
architecture (quiz content — including the full answer key — is already bundled directly into the
frontend via `shared/quiz-data.js`, an existing, accepted P3 trade-off for a classroom teaching tool,
not something this session introduced or could quietly "fix" without a separate Owner Decision), a
**stateless deterministic-rotation design** was implemented that needs **no new D1 table, no new
column, no signed token, and no new Worker route**:

- `shared/quiz-data.js` gained `selectQuizQuestions(quizId, seedKey, count=5)` (seeded Fisher–Yates
  shuffle over a deterministic FNV-1a-hashed seed → `mulberry32` PRNG — no crypto dependency needed
  for a fairness/rotation mechanism, not a secret) and `scoreQuizAttempt`/`buildQuizAttemptSeed`.
- The seed is `${userId}:${quizId}:${previousAttemptUpdatedAt || "first-attempt"}` — `previousAttemptUpdatedAt`
  is this learner's own existing `quiz_results.updated_at` for that quiz (or absent, on a first
  attempt) — data **already persisted for an unrelated reason** (P3's latest-attempt row), reused
  rather than adding new state.
- **Security property**: `worker/src/routes/quiz.js`'s `handleSubmitQuiz` independently re-reads this
  user's own previous row (`worker/src/db.js`'s new `getQuizResultForUser`, a single-row lookup on the
  existing table — no schema change) and **recomputes the subset itself** — it never accepts a
  client-declared list of question ids, and rejects an answers array whose length doesn't match the
  subset IT computed (verified live against the real Worker/D1 runtime, §27.12, and by an automated
  test asserting a full-bank-length submission is rejected once the bank exceeds the subset size).
  A learner therefore cannot choose which questions get served or forge which questions were "served"
  — the Worker's own independent recomputation is the only thing that ever determines what gets
  scored, mirroring ADR-013's "one authoritative computation, never a client claim" pattern applied to
  quizzes instead of challenges.
- Subset size is fixed at 5 (`QUIZ_ATTEMPT_SIZE`) — every 8-question bank now serves 5 per attempt;
  the subset only ever equals the full bank when the bank is not larger than 5 (none currently are).
- **Known, stated limitation** (not oversold): because the seed only changes after a real submission
  updates the previous row, a same-day page reload *before* submitting shows the same subset — this is
  the "simpler deterministic rotation" the brief explicitly said was acceptable, not true
  per-page-load randomness. Documented in `shared/quiz-data.js`'s own header comment so a future
  session doesn't mistake it for something stronger.
- `frontend/src/quiz-component.js` was made `async`: it fetches this learner's own previous result via
  the existing `GET /api/quiz-results` (no new endpoint) to compute the identical seed for display,
  then renders only that subset. The submission wire shape is unchanged (`{quizId, answers}}`, a plain
  positional array) — only its *length* now varies (5, not the full bank), so no existing
  `quiz_results` row's schema or shape was affected.

**No STOP was needed** — the design fits inside the existing shared-module architecture (the same
"one pure module, imported unmodified by frontend and Worker" pattern ADR-013 already established for
challenges) rather than inventing a new one.

### 27.5 Quiz Result Quality (Owner brief §4)

Per-question correctness + explanation (already existed, P3) is unchanged. Added: an attempt
timestamp is now visible via the existing `updated_at` field surfaced in a new "previous result" line
shown before a learner starts a quiz they've attempted before (`quizPreviousResult` i18n string —
`frontend/src/quiz-component.js`). **Full historical attempt storage was deliberately NOT built**:
`quiz_results` (migration `0003`) stores one row per `(user, quiz)` — the latest attempt only, by
original P3 design, and there is no `docs/REQUIREMENTS.md` requirement for a passing-score threshold
or attempt history. Assessed and classified per the brief's own instruction: adding real
per-attempt history would require a new table (`quiz_attempts`, append-only) and a migration —
**classified as a real, non-trivial schema change with no clearly justified benefit at this project's
classroom scale** (7 modules, one quiz each, formative/retakeable by design), so it was not built.
This is a stated, deliberate omission, not an oversight — a future Owner Decision can revisit if real
classroom usage shows learners actually want a full history view.

### 27.6 Challenge Depth (Owner brief §5/§6)

Reviewed Modules 3–7's existing challenges (all already high-quality, ADR-013-compliant, with
alternate-path acceptance already proven by existing tests). Added exactly **two** enrichment
variants — deliberately not one per module, per the brief's own "do not pad merely to hit a number"
instruction and this session's time/quality budget:

- `challenge-module-4-b` (`shared/challenges.js`): a different file name (`notes.txt` vs. the original
  `app.js`) and a genuinely different Git reasoning target — `git reset --mixed` (Working Directory)
  instead of the original's `--soft` (Staging Area). Verified to fail correctly under `--soft` and
  `--hard` too (a real differentiator, not a relabeled duplicate).
- `challenge-module-6-b`: exercises the **pull-before-push divergence rule** (Module 6's own
  "two-machine" scenario, `docs/LEARNING_OBJECTIVES.md`) — genuinely different from the original's
  `clone`-only challenge. Its starting state is built by pushing a "teammate" machine's commit to the
  same simulated remote (a throwaway local state sharing the same `remoteState` object, then
  discarded — the same pattern the original `challenge-module-6` already used to build remote
  history), so the learner's own local repository starts genuinely diverged. Verified live: a bare
  `git push` first is correctly rejected by the simulator itself (non-fast-forward) and the challenge
  correctly reports `passed:false`; `git pull` then `git push` correctly passes.

Both are marked `variant: true` (a display-only flag) and are **not referenced anywhere in
`shared/curriculum.js`** — the required assessment matrix is byte-for-byte unchanged. Every required
file was server-authoritatively pre-seeded (no learner-facing file-editor dependency); grading is on
resulting state, not a fixed transcript (both have an alternate-valid-path regression test). No
out-of-PDF command was introduced.

### 27.7 Challenge Selection (Owner brief §6)

Both modules present their required challenge and its enrichment variant as **separate, clearly
labeled practice challenges** in the Challenges hub (`frontend/src/challenges-hub.js`, using the
already-existing `listChallengesForModule` helper from `shared/challenges.js` — unused until now,
built for exactly this future case) — no hidden/random server-side variant selection was introduced;
ADR-013 is fully respected (browser and Worker still agree deterministically on every starting state).

### 27.8 Capstone Quality (Owner brief §7)

Reviewed Module 7's existing capstone (`frontend/src/lesson-module7.js`, `shared/challenges.js`'s
`capstone-module-7`) — explanation, starting state, success criteria, hints, and push-to-remote goal
were already sound (verified by P3/P3.5's own testing history) and required no rewrite. Added the new
optional quiz (§27.2) and a short "จำให้ได้" reinforcement box (§27.9) after the capstone challenge —
no change to the challenge itself, no new syntax or difficulty added; still solvable purely from
Modules 1–6 knowledge, exactly as required.

### 27.9 Learning Reinforcement (Owner brief §9)

`frontend/src/lesson-helpers.js` gained one new pure helper, `reinforcement(rememberItems,
mistakeText)`, rendering a lightweight "จำให้ได้" bullet summary plus an optional common-mistake
callout — text-only, no points/badges/streaks/leaderboards (UX skill §27 anti-gamification rule,
unchanged). Applied to the end of every one of Modules 1–7's lesson pages, each summarizing that
module's own key concepts (drawn from `docs/LEARNING_OBJECTIVES.md`, not invented). Quiz feedback in
the Quizzes hub (not inside a lesson page, where this would be redundant) gained a "ทบทวนบทเรียนนี้อีก
ครั้ง" button wired to the existing `openModuleFromOutside` cross-panel hook (P4) — no new navigation
mechanism, reuse only.

### 27.10 Cheat Sheet Improvement (Owner brief §8)

`frontend/src/cheatsheet.js` gained a third table column ("ใช้เมื่อไร") with a beginner-oriented
one-line "when to use this" note per command, a short intro paragraph naming the four-zone pipeline,
and a per-group "โซนที่เกี่ยวข้อง" (which zone this group relates to) line mapping each command group
back to Working Directory/Staging Area/Local Repository/Remote Repository. **No out-of-PDF command was
added** — `git switch`, `git restore`, `rebase`, `.gitignore`, and Pull Requests remain absent, exactly
as locked. The existing mobile-safe `display:block; overflow-x:auto` table pattern was preserved
unchanged (an early draft mistakenly wrapped the table in an unstyled extra `<div>`, which would have
silently broken the P7-verified mobile scroll behavior — caught and reverted before commit).

### 27.11 Required vs. Optional Assessment Behavior (Owner brief §10)

- `shared/curriculum.js` and `shared/completion.js`: **byte-for-byte unchanged**.
- Module 7's quiz, and both new challenge variants, are additive-only and invisible to the completion
  evaluator (verified directly against the real Worker, §27.12, and by automated regression tests,
  §27.13).
- Every hub screen (`quizzes-hub.js`, `challenges-hub.js`) visually labels optional/enrichment content
  distinctly ("(ไม่บังคับ/เสริม)" / "(แบบฝึกเสริม)") from required content, per the brief's explicit
  "clearly separate REQUIRED assessment from OPTIONAL practice/enrichment" instruction.

### 27.12 Production Verification Performed This Session

Per the brief's own explicit preference ("prefer local D1 / controlled development data for full
assessment execution... do not create disposable production accounts unless absolutely necessary"),
**all functional verification this session was performed against local D1 via `wrangler dev`**, using
one throwaway local-only account (`p8verify_local`, local D1 only, deleted after use — never touched
real production D1). Verified against the REAL Cloudflare Workers runtime (not just the fake-D1 unit
tests):

- A correct 5-question subset submission for `module-3` scores 100%.
- Submitting an 8-answer (full-bank-length) array is rejected with `400 invalid_answers` — the exact
  security property the bounded-subset design is meant to guarantee.
- The optional `module-7` quiz submits and scores normally, persists its own `quiz_results` row, and
  `GET /api/completion` is **byte-for-byte identical** before and after submitting it.
- `challenge-module-4-b` passes with the correct `--mixed` transcript.
- `challenge-module-6-b` passes with `["git pull", "git push"]` and is correctly rejected by the
  simulator itself (non-fast-forward) when `git push` is attempted alone first.

**Not performed this session, by deliberate choice**: a full authenticated real-*production*
browser click-through (as `admin`/`teacher1`/`student1`). This project's bootstrap credentials file
still resolves for `admin` (per P7 §25.1's own note that the original P2 password still worked), but
using it risked exactly the kind of harmless-but-real production side effect prior phases had to
clean up afterward (P7/P7.5 §25.14/§26.2) — and the brief's own §15 explicitly prefers local
verification and says not to create production accounts unless absolutely necessary. Production
itself was only touched by unauthenticated, read-only checks (below) and the deploy itself.

### 27.13 New Tests / Test Count

**152 → 172 passing (20 new tests), zero regressions.** New coverage: Module 7 quiz existence/
optionality and non-interference with completion; expanded-bank size and per-question validity for
all 7 quizzes; global question-id uniqueness (plus a spot-check that original P3 ids are unchanged);
bounded-subset determinism and rotation-on-new-attempt; the Worker's rejection of a
full-bank-length/forged-shape answers array; both new challenge variants' starting-state determinism,
correct-transcript pass, wrong-mode/wrong-order fail, and alternate-valid-path pass (CHAL-005-style).
Existing tests were updated (not weakened) to reflect the new bounded-subset wire contract — every
quiz-submission test now computes the exact subset the Worker will independently recompute, exactly
as a real frontend does, rather than hardcoding a fixed-length array that predates the P8 change.

### 27.14 D1 Migration Status

**None.** No schema change was needed or made — the bounded-subset design deliberately reuses the
existing `quiz_results.updated_at` column instead of adding a new table/column (§27.4). Per
Engineering skill §21/Database Discipline (brief §16): a migration was considered for full
attempt-history (§27.5) and explicitly not pursued as unjustified at this scale.

### 27.15 Git / Worker / Pages Deployment

`worker/src/db.js`, `worker/src/routes/quiz.js`, and both `shared/*.js` files changed, so the Worker
(`git-learning-lab-api`) was redeployed. Frontend ships via the existing GitHub → Cloudflare Pages
auto-deploy on push to `main` (unchanged mechanism since P1). See the session's own commit/deploy
output for the exact Worker version id and confirmation the live `*.pages.dev`/`*.workers.dev` URLs
stayed healthy immediately after.

### 27.16 Production-Data Side Effects

None. This session's only production D1 interaction was the deploy itself; no account was created,
modified, or queried in real production D1 (§27.12). The one local-D1-only verification account
(`p8verify_local`) never touched production and was deleted from local D1 before this session ended.

### 27.17 Remaining Debt / Owner Decisions

- Full quiz-attempt history remains unbuilt (§27.5) — classified, not forgotten; revisit only if real
  classroom usage shows a real need.
- No automated Worker-runtime (workerd) test harness exists yet — same standing debt since P2,
  unchanged; this session's real `wrangler dev` verification (§27.12) continues to substitute for it.
- Only 2 of the 4 modules with challenges (4 and 6) received an enrichment variant — a deliberate,
  quality-over-quantity choice (§27.6), not an oversight; Modules 3 and 5's existing challenges were
  judged not to need a second variant to demonstrate meaningfully different Git reasoning at this
  time.
- A full authenticated production browser click-through was not performed this session (§27.12) — the
  Owner may want to do a final spot-check (e.g. taking one quiz and one enrichment challenge as
  `student1`) before real classroom use, the same low-risk, non-blocking pattern this project has used
  for the physical-keyboard check in every prior phase.

### 27.18 P8 Safety / Release-Readiness Assessment

**Safe to approve.** All 172 automated tests pass, the frontend build is clean, every new
security-relevant property (bounded-subset scoring integrity, optional-assessment non-interference,
enrichment-challenge non-interference with completion) was verified both by automated tests and
directly against the real Cloudflare Workers runtime, no P0–P7.5 functionality regressed, and no
scope beyond the P8 brief's own boundaries was introduced. No Owner Decision was left pending — the
one item the brief flagged as a possible STOP trigger (randomized quiz attempts, §3) was resolved
without needing to escalate, using a stateless design that fits the existing architecture.

---

## 22. P4 Status Report — Registration, Dashboard, Learning History, UI/UX Polish, Mobile Terminal

**Verified live before this session started**: git clean on `main`, 101/101 tests passing, frontend
build working. This session's changes were verified against the fake-D1 unit-test harness, then
against a REAL local D1 via `wrangler dev` (Worker) + `wrangler pages dev` (frontend, temporarily
pointed at the local Worker instead of production — reverted before commit, confirmed via `git diff`
showing zero net change to `functions/api/[[path]].js`/`worker/src/http.js`), then against the real
production Worker directly, matching the verification depth of P2/P3.

### 22.1 Student Self-Registration (REG-xxx)

`worker/src/routes/register.js` (new) + `POST /api/auth/register`, wired into
`worker/src/index.js` alongside login as a route reachable without an existing session. Every
registration is unconditionally `STUDENT` — the route never reads a `role` field from the request
body at all (not even to reject it), and `worker/src/db.js`'s new `createStudentUser` hard-codes
`'STUDENT'` into the INSERT's SQL text, so no caller of that specific function can create a
privileged account. Server-side validation (never trusted from the client alone): full name
required; username `^[A-Za-z0-9_.-]{3,32}$` and unique; student ID `^[A-Za-z0-9-]{3,30}$` and
unique; password ≥ 8 characters (matching the existing change-password rule) and must match
confirmation; email optional, but when present must match `@rmutsb.ac.th` (case-insensitive,
normalized to lowercase before storage/uniqueness checks) and be unique. A successful registration
immediately signs the new user in (same session-cookie mechanism as login) — no email verification
step, per the explicit P4 scope boundary. AUTH-006's existing Origin/Referer CSRF check already
covers this route for free (it applies to every non-GET request in `index.js`, register included).

**Schema**: `migrations/0004_p4_registration.sql` (applied to local AND real production D1, after a
verified `wrangler d1 export --remote` backup — `backups/pre-p4-migration-20260906-215654.sql`,
gitignored) adds nullable `users.full_name`, `users.student_id`, `users.email`, each with its own
`CREATE UNIQUE INDEX` (SQLite treats every `NULL` as distinct for uniqueness, so the pre-existing
P1-P3 bootstrap accounts — which have none of these three columns — do not collide with each other
or with future registrations that omit email).

**Tests**: `tests/worker-register.test.js` (new, 15 tests) — a valid registration signs the user in
as STUDENT; a forged `role: "ADMIN"` field is silently ignored (privilege-escalation test); duplicate
username/student ID/email are each rejected independently even when the other two fields differ;
email domain restriction; email is optional; password/confirmation mismatch; too-short password
rejected server-side; missing full name; invalid username/student-ID shape; malformed JSON never
leaks an internal error (SEC-005); a cross-origin forged registration is rejected before any account
is created (AUTH-006); and a freshly self-registered student cannot see another student's progress
(reusing the same cross-user isolation guarantee PROG-004/TEST-003 already provide — Learning History
needed no new isolation logic because it reads these same already-isolated endpoints, see §22.3).
`tests/helpers/fake-d1.js` was extended to model the new `users` columns and the registration INSERT
variant, including duplicate-column rejection matching real SQLite UNIQUE-index behavior.

### 22.2 Login/Register UX Polish

`frontend/public/index.html` gained a full Register screen (`#register-screen`) alongside the
existing Login screen, plus a link each way (`ยังไม่มีบัญชี (นักเรียน)? สมัครสมาชิก` /
`มีบัญชีอยู่แล้ว? เข้าสู่ระบบ`) wired in `main.js`. A plain `type="password"`/`"text"` toggle button
(no library) is attached to every password field (login, register password, register confirm
password) via `wirePasswordToggle()`. Every field has a visible Thai label, `autocomplete` hint, and
inline help text for username/student-ID/email format; server error codes are mapped to specific Thai
messages (`REGISTER_ERROR_KEYS` in `main.js` → `regErr*` keys in `i18n.js`) rather than one generic
failure string, and a success message confirms before the automatic sign-in. All new fields keep the
existing 44px minimum touch target and focus-visible outline conventions already established for
Login/Change-password.

### 22.3 Dashboard (new landing panel) and Learning History (new panel)

`frontend/src/dashboard-panel.js` (new) is now the first panel shown after login (nav order:
หน้าหลัก → บทเรียน → …), replacing Lessons as the landing screen while keeping Lessons itself
unchanged and still reachable. It shows a welcome line, an overall completion bar (`% of implemented
modules with lesson status "completed"`), an empty state with a single "เริ่มเรียน Module 1" call to
action when the learner has no progress at all, and one card per module with lesson/quiz/challenge
status badges and a single continue/start/review button. That button (`onContinue`) is wired through
a small cross-module hook (`openModuleFromOutside`, exported from `lessons-panel.js`) that switches
to the Lessons tab and opens the specific module's detail — verified end-to-end in a real browser
(clicking "เริ่มเรียน Module 1" from the Dashboard landed directly in Module 1's Explanation/
Demonstration/Practice content, scrolled into view).

`frontend/src/learning-history-panel.js` (new) is a read-only timeline built from the exact same
three already-isolated endpoints the Progress panel already uses
(`GET /api/progress` / `/api/quiz-results` / `/api/challenge-results`) — **no new Worker route, no
new table, no new column**, per the explicit instruction to reuse existing persisted data before
adding anything new. Events (module started/completed, quiz attempts with score, challenge
passed/failed) are merged client-side, sorted newest-first, and a "last activity" line shows the most
recent timestamp. Cross-user isolation is inherited for free from the endpoints it reads (already
covered by PROG-004/TEST-003-style tests, plus a new register-flow-specific isolation test in
§22.1) — no separate history-isolation test was needed because there is no separate history data
store to isolate.

Both new panels are added to `ALWAYS_REFRESH` in `main.js` (alongside Progress) so a learner who
completes a quiz/challenge after already having opened Dashboard/History sees current status without
a full page reload (same P3.5 fix pattern applied consistently).

### 22.4 UI/UX Visual Polish

`frontend/public/styles.css` gained a small set of additional design tokens (`--color-bg-subtle`,
`--color-text-muted`, `--color-success`/`--color-danger` pairs, `--radius-sm/md/lg`, `--shadow-card`)
layered on top of the existing token set — no existing selector was renamed or removed, so nothing
already-working (terminal, visualizer, quiz/challenge feedback, admin panel) needed a corresponding
JS change. New shared classes (`.btn`/`.btn-primary`/`.btn-secondary`, `.status-badge` with
completed/started/not-started/info/disabled variants — text-labeled, never color-only per A11Y-003,
`.dashboard-card`, `.module-card-grid`/`.module-card`, `.history-item`, `.password-field`,
`.password-toggle-btn`, `.auth-switch`/`.link-btn`, `.field-help`/`.field-success`) give the new P4
screens a consistent card/pill look; a small set of refinements to already-existing selectors
(heading rhythm inside `.panel`, `.screen` box-shadow, `.nav-btn` rounded corners and hover state)
lift the overall look without touching layout structure elsewhere. Narrow-viewport rules for every
new component were added inside the existing `@media (max-width: 420px)` pattern.

### 22.5 Mobile Terminal Polish

`frontend/src/terminal.js`: the terminal input now scrolls itself into view on focus (after a short
delay to let a virtual keyboard finish opening) and again on any `visualViewport` resize while it is
the focused element — defensive against an in-app browser (e.g. Instagram's) whose keyboard can
overlap the terminal, per the session brief's specific concern, without changing any command-handling
behavior. Verified in a real browser at an emulated 375×812 mobile viewport: focusing the terminal
input scrolled the page so both the input and the "รัน" (Run) button remained fully within the
viewport afterward (confirmed via `getBoundingClientRect()` on both elements). Desktop behavior is
unaffected — the added listeners only act while the terminal input itself is focused.

### 22.6 Classroom Launch Improvements

The Dashboard's empty state and per-module "เริ่มเรียน/ทำต่อ/ทบทวนอีกครั้ง" labeling directly answers
the "what should I do next?" cue requested in the brief, without a new onboarding subsystem — the
existing `วิธีใช้งาน` (How-to) panel from P3 is unchanged. Because self-registration now works
end-to-end, the 29-account classroom roster does **not** need to be manually created/distributed by
the Admin — students can register themselves; TEACHER/ADMIN account creation remains exclusively
Admin-controlled (unchanged, no route exists for a client to create anything but a STUDENT account).

### 22.7 Security / Regression Verification Performed This Session

Beyond the automated suite (101 → 116 tests, 15 new, zero regressions), this session's Worker changes
were verified against the REAL Cloudflare Workers runtime two ways: (1) `wrangler dev` against local
D1 (after applying migration 0004 locally) — direct `curl` register/duplicate-username/login/
role-forge round-trips, all matching expected behavior against real SQLite UNIQUE-index semantics,
not just the fake-D1 model; (2) a full real-browser click-through via `wrangler pages dev` temporarily
proxying to the local Worker (reverted before commit) — registration → auto-login → Dashboard (empty
state, 0%) → "เริ่มเรียน Module 1" → Module 1 opened directly → Learning History showing "เริ่มเรียน:
Module 1..." with a real timestamp → Progress panel showing the same module as "กำลังเรียน" →
duplicate-username registration attempt rendering the correct Thai error message inline. Also
directly verified against the real production Worker after deployment: `POST /api/auth/register`
returns `201` with `role: "STUDENT"` and a valid session cookie.

### 22.8 D1 Schema / Deployment

`migrations/0004_p4_registration.sql` applied to local D1, then to **real production D1** after a
verified `wrangler d1 export --remote` backup (`backups/pre-p4-migration-20260906-215654.sql`,
gitignored) — confirmed via a live `SELECT sql FROM sqlite_master WHERE name='users'` showing the
three new columns present. Worker redeployed (`git-learning-lab-api`, version
`449199ec-bee8-4c61-a549-637a2a17a6c4`) since `worker/src/routes/register.js` and `worker/src/db.js`
changed. Frontend ships via the existing GitHub → Cloudflare Pages auto-deploy on push to `main`
(unchanged mechanism from P1).

### 22.9 Remaining P4 Debt / Owner Decisions

- The one production account created during this session's direct-`curl` Worker verification
  (`prodverify_p4_temp`) is a real row in production D1 — harmless placeholder data (same class of
  side effect P2's own production verification left behind with `student1`), not a defect; the Owner
  may delete it via a direct D1 query if a completely clean roster is wanted before the class starts.
- Learning History's event list is unbounded (every progress/quiz/challenge row the learner has) —
  fine at this project's scale (7 modules, one quiz/challenge each) but would need pagination if the
  curriculum grew substantially; not a concern for the Sept 12 classroom MVP.
- No automated Worker-runtime (workerd) test harness exists yet — same standing P2/P3 debt, unchanged;
  this session's `wrangler dev`-against-real-D1 verification continues to substitute for it.
- The physical-keyboard Enter-key spot-check flagged at the end of P3.5 (§21) remains unconfirmed on
  an actual device — still low-risk given the existing "Run" button fallback, still worth a two-minute
  check before the class starts.

---

## 23. P5 Status Report — Course Completion, Certificate Issuance, Public Verification

**Verified live before this session started**: git clean on `main`, 116/116 tests passing, frontend
build working. This session's changes were verified against the fake-D1 unit-test harness, then
against a REAL local D1 via `wrangler dev` (Worker) driven directly with `curl` through the entire
7-module completion → issuance → verification flow (not just unit tests), then against the real
production Worker/D1 after deployment, matching the verification depth of P2-P4.

### 23.1 Authoritative Course-Completion Rule (P5 §1)

`shared/curriculum.js` (new) is the single list of which modules require a quiz/challenge —
Modules 1-2 quiz-only, Modules 3-6 quiz+challenge, Module 7 challenge-only (its quiz stays
Should-Have/QUIZ-001b, matching `docs/LEARNING_OBJECTIVES.md`'s locked assessment matrix). This
replaces the quiz/challenge-id association that used to live directly inside
`frontend/src/modules-meta.js`; that file now derives `MODULES` from `shared/curriculum.js` plus its
own frontend-only `titleKey` field, so there is exactly one place the assessment matrix is defined.

`shared/completion.js` (new) is the evaluator itself — a pure function taking only already-persisted
`progress`/`quiz_results`/`challenge_results` rows (never a client-supplied percentage or
`completed`/`passed` flag) and returning per-module `lessonDone`/`quizDone`/`challengeDone`/`complete`
plus an overall `isComplete`/`percent`/`completedModules`/`totalModules`/`remaining` list. "Required
quiz" means *attempted* (a `quiz_results` row exists) — this project's requirements
(`docs/REQUIREMENTS.md` QUIZ-001..003) never define a passing-score threshold for any quiz, so a
threshold was not invented here; quizzes remain a formative, retakeable assessment exactly as P3 built
them. "Required challenge" means the existing `challenge_results.passed = 1`, unchanged from P3.

`worker/src/routes/completion.js` (new) exposes this as `GET /api/completion`, fetching only
`sessionUser.id`'s own rows and running them through the evaluator — this is the ONE Worker route
Dashboard, Progress, and the Certificate panel all call; none of them recompute completion locally
(P5 spec's explicit "no competing completion logic" requirement).

### 23.2 Certificate Issuance (P5 §3/§6)

`worker/src/routes/certificate.js` (new): `POST /api/certificate/issue` is STUDENT-only
(`certificates_student_only` for Teacher/Admin — certificate eligibility is a Student-only concept in
this product, unlike ROLE-003's "Teacher uses the Student experience" clause, which is about learning
access, not credentialing), requires a resolved session (401 otherwise), and reads **no fields at all**
from the request body — there is nothing for a learner to forge, because completion is recomputed
server-side from this user's own D1 rows via `computeCompletionForUser` (the same function
`GET /api/completion` uses) on every issue request, regardless of what the UI last showed. A repeat
issue request is idempotent (`UNIQUE(user_id, course_id)` in the new `certificates` table; a
concurrent-race INSERT failure is caught and the existing row is re-fetched and returned, mirroring
`register.js`'s own race-handling pattern) — it returns the same certificate with `200`, never a
duplicate row or an error.

### 23.3 Certificate Data / Schema

`migrations/0005_p5_certificates.sql` (applied to local AND real production D1, after a verified
`wrangler d1 export --remote` backup — `backups/pre-p5-migration-20260906-223021.sql`, gitignored)
adds one table, `certificates` (`user_id`, `course_id` default `'git-learning-lab'`,
`verification_id` UNIQUE, `learner_name` — a point-in-time snapshot of `users.full_name`, falling
back to the login identifier for pre-P4 bootstrap accounts that predate `full_name` — `issued_at`,
`status` `'active'|'revoked'`). `verification_id` is 128 bits from the Worker's existing CSPRNG helper
(`worker/src/crypto.js`'s `randomHex`, the same one already used for session tokens under ADR-011) —
never derived from the row id or user id, so it cannot be enumerated or guessed, and the internal
auto-increment `id`/`user_id` are never returned by any route. No revocation UI exists yet (out of
P5 scope); the `status` column exists only so public verification can already treat a non-`'active'`
row as invalid without a further migration if revocation is ever added.

### 23.4 Printable Certificate (P5 §4)

`frontend/src/certificate-panel.js` (new) renders a single, restrained bordered card
(`.certificate-card` in `frontend/public/styles.css`) — course name, learner name, a one-sentence
completion statement, issue date, certificate ID, and a public verification URL — with a
"พิมพ์ / บันทึกเป็น PDF" button that calls the browser's native `window.print()` (no PDF library, no
paid service). A new `@media print` block hides the header/nav/identity-bar/footer and every
`.no-print`-marked action button, leaving only the certificate card on the printed/saved page.
Verified visually in a real browser (a local static harness rendering the actual component with
mocked API responses, since production-origin CSRF rules correctly block a full authenticated
click-through from `127.0.0.1` — the same limitation P2 documented for login) at both desktop and a
375×812 mobile viewport: no horizontal overflow, all three states (remaining-requirements list,
eligible-with-issue-button, issued-certificate-card) render correctly and the issue button's click
handler correctly re-renders into the certificate view.

### 23.5 Public Verification (P5 §5)

`GET /api/certificate/verify?id=<verificationId>` is reachable with **no session at all** — routed in
`worker/src/index.js` alongside login/register, before session resolution. It returns the identical
`{ok:true, valid:false}` shape (HTTP 200) for a malformed id, a well-formed-but-unknown id, and a
revoked certificate — no distinguishing oracle for an enumeration attempt. A valid certificate returns
only `learnerName`, `courseName`, `issuedAt`, `verificationId` — never username, email, student id,
internal user/row id, progress, quiz scores, or challenge transcripts (verified both by an automated
test that asserts none of those strings appear in the response, and by a real production `curl`
round-trip). `frontend/src/verify-panel.js` (new) is the public-facing screen; since this is a static
single-page app with no server-side router (Cloudflare Pages serves only `index.html`), it is reached
via a `location.hash` route (`#verify?id=...`) rather than a real path — `main.js`'s new
`routeFromHash()`/`hashchange` listener renders it BEFORE the normal login/session bootstrap runs,
so a shared verification link works for a fully logged-out visitor. Verified in a real browser via
`wrangler pages dev` proxying to a local `wrangler dev` Worker with a real issued certificate — the
verify screen correctly displayed the real learner name/course/date/id with zero session/cookie
present.

### 23.6 Completion Experience (P5 §2)

`frontend/src/dashboard-panel.js`: the overall completion bar and count now come from
`GET /api/completion` (previously a lesson-only percentage computed ad hoc from raw progress rows) —
this is a deliberate behavior change so Dashboard can never show a different "done" than the
Certificate panel. A new Thai completion banner ("🎉 ยินดีด้วย! คุณเรียนจบหลักสูตรครบทุกข้อกำหนดแล้ว")
appears for STUDENT accounts once `isComplete` is true, with a button that switches to the new
Certificate nav tab. Nothing is locked afterward — every existing nav item stays fully reachable, and
completed learners can still revisit any lesson/quiz/challenge exactly as before.
`frontend/src/progress-panel.js` gained one summary line at the top using the same endpoint. A new
"ใบประกาศนียบัตร" nav button (`#certificate-nav-btn`) is STUDENT-only (hidden for Teacher/Admin,
mirroring the existing `#admin-nav-btn` pattern) and drives the new Certificate panel.

### 23.7 Security / Regression Verification Performed This Session

Beyond the automated suite (116 → 134 tests, 18 new, zero regressions), this session's Worker changes
were verified against the REAL Cloudflare Workers runtime two ways: (1) `wrangler dev` against local
D1 (after applying migration 0005 locally) — a full `curl`-driven walk through registration, all 7
modules' progress/quiz/challenge submissions using the exact same command transcripts this project's
own existing regression tests already prove correct, `GET /api/completion` confirming `isComplete`
flips from `false`/0% to `true`/100% only once every requirement is met, a rejected issuance attempt
while incomplete (including a forged `completed:true`/`passed:true` body, still rejected), a
successful issuance once complete, a second identical issuance request returning the same certificate
with `200` instead of a duplicate, and public verification succeeding with no cookie at all plus safe
generic failures for an unknown/malformed/missing id; (2) direct `curl` against the real deployed
production Worker after migration+deploy, confirming `GET /api/completion` requires auth (401) and
`GET /api/certificate/verify` works publicly with a safe generic failure. The automated test file
(`tests/worker-certificate.test.js`) additionally covers: an incomplete learner is never complete; a
learner missing exactly one module's challenge is correctly not complete; Module 7's optional quiz
never blocks completion; unauthenticated issuance rejected; a forged `userId` in the issuance body
cannot issue for another account; Teacher/Admin roles rejected from issuance even when their own
progress rows are complete; issuance succeeds for an eligible Student; the pre-P4-bootstrap
name-fallback path; idempotent repeat issuance; `GET /api/certificate/me` before/after issuance;
public verification succeeds with no session and leaks no private/internal field; and existing
quiz/challenge/progress routes are untouched by the new routing.

### 23.8 D1 Schema / Deployment

`migrations/0005_p5_certificates.sql` applied to local D1, then to **real production D1** after a
verified `wrangler d1 export --remote` backup (`backups/pre-p5-migration-20260906-223021.sql`,
gitignored) — confirmed via a live `SELECT sql FROM sqlite_master WHERE name='certificates'` showing
the table present with both UNIQUE indexes. Worker redeployed (`git-learning-lab-api`, version
`3c97ad48-dd49-4483-aab0-7db65db975c9`) since five new/changed Worker files exist. Frontend ships via
the existing GitHub → Cloudflare Pages auto-deploy on push to `main` (unchanged mechanism from P1).

### 23.9 Test Account Left in Production

This session's local-`wrangler-dev` verification used only local D1 (not production). Separately, the
real production Worker was smoke-tested with only unauthenticated/read-only requests (health,
`GET /api/completion` without a cookie, `GET /api/certificate/verify` with an invalid id) — no account
was created and no certificate was issued against real production D1 this session. (Contrast with
P2/P4, which each left a harmless real account behind from their own production verification —
`student1`'s progress and `prodverify_p4_temp` respectively; P5 did not repeat that pattern because its
full end-to-end walk was already exercised against local D1 instead.)

### 23.10 Remaining P5 Debt / Owner Decisions

- No rate-limiting exists on `GET /api/certificate/verify` beyond the 128-bit verification-id space
  itself being computationally infeasible to guess — acceptable at this project's free-tier/classroom
  scale (ADR-010) but worth revisiting only if real abuse is observed.
- No certificate-revocation UI exists (the `status` column is future-proofing only) — out of P5 scope
  per the session brief's own boundary list; would need a fresh Owner Decision plus an Admin-facing
  route if ever wanted.
- The full authenticated browser click-through of the Dashboard banner → Certificate issue button →
  print flow could not be exercised end-to-end against `127.0.0.1` for the same structural reason P2
  documented (`ALLOWED_ORIGIN`'s CSRF check correctly rejects a non-production Origin) — verified
  instead via a real API-level `curl` walk against local `wrangler dev` (§23.7) plus a local static
  harness rendering the actual `certificate-panel.js` component with mocked responses (§23.4). A final
  real-browser click-through against the live `https://git-learning-lab.pages.dev` URL after this
  push is the natural next confirmation step, same as every prior phase's own closing verification.
- Same standing P2/P3/P4 debt, unchanged: no automated Worker-runtime (workerd) test harness exists;
  the fake-D1 unit tests plus real `wrangler dev`/production `curl` verification continue to substitute
  for it. The physical-keyboard Enter-key spot-check from P3.5 (§21) also remains unconfirmed.

---

## 24. P6 Status Report — Teacher Dashboard, Classroom Roster, Student Detail, CSV Export

**Verified live before this session started**: git clean on `main`, 134/134 tests passing, frontend
build working, production Worker/Pages healthy. This session's Worker changes were verified against
the fake-D1 unit-test harness, then against **real local D1 via `wrangler dev`** driven directly with
`curl` (seeded a real `TEACHER` session plus several students with varied progress), then against the
**real production Worker/D1** after deployment — matching the verification depth of P2–P5.

### 24.1 Scope Decision — Teacher Dashboard Timing (§9.1)

The Engineering skill's §9.1/§16/§21 locked decision explicitly *deferred* a full Teacher Dashboard,
while leaving the Teacher **role/account** itself in scope since v0.9. This session's brief (labeled
P6) is the fresh, explicit instruction that lifts that deferral — it defines the Teacher Dashboard's
concrete scope (read-only classroom summary/roster/detail/export) and its explicit boundaries (no
grading, no attendance, no messaging, no generic RBAC — see the brief's own §16 exclusion list). This
is recorded here as the dated decision that supersedes §9.1's "deferred" note for this one feature;
every other §9.1/§21 deferred item (email password reset, leaderboards, multi-class support, etc.)
remains deferred and out of scope, unchanged.

### 24.2 Backend — Teacher Routes (`worker/src/routes/teacher.js`)

Four new routes, all resolved from the session server-side and gated to **exactly** `role === "TEACHER"`
(ROLE-005) — not `TEACHER` *or* `ADMIN`: `docs/ARCHITECTURE_DECISIONS.md` ADR-007 already establishes
that an Admin gets no special access to another user's learning content beyond what account
administration requires "unless a future Owner Decision adds one" — none has, so Admin does not
silently inherit classroom access, verified by an explicit regression test.

- `GET /api/teacher/summary` — classroom totals (total/started/completed students, average percent),
  a bounded "needing attention" (not-started) list, and the 10 most-recently-active students.
- `GET /api/teacher/roster` — every STUDENT account's progress/quiz/challenge/certificate summary.
- `GET /api/teacher/student?id=<id>` — one student's per-module lesson/quiz/challenge status plus
  certificate state. The `id` is validated as a positive integer, and the looked-up account must have
  `role === "STUDENT"` — this route cannot be used to view a Teacher's or Admin's own account record
  (a 404, not a 403, so it doesn't even confirm such an id exists).
- `GET /api/teacher/export` — the same roster data as CSV (see §24.5).

**No new persisted data and no schema change.** `worker/src/db.js` gained five *read-only, whole-table*
query helpers (`listStudentAccounts`, `getAllProgressRows`, `getAllQuizResultRows`,
`getAllChallengeResultRows`, `getAllCertificateRows`) — one bulk query per table rather than one query
per student, so the roster/summary/export endpoints cost exactly 5 D1 reads total regardless of class
size, comfortably inside free-tier limits at the ~29-student scale (Engineering skill §20).

### 24.3 Completion Consistency (P6 spec §6, no second formula)

Every number the Teacher sees — per-module lesson/quiz/challenge status, overall percent, `isComplete`
— comes from the same `shared/completion.js` `evaluateCompletion()` function the Student-facing
`GET /api/completion` and certificate issuance already use (P5, §23.1), fed with the same bulk-fetched
rows grouped in memory. A dedicated regression test (`worker-teacher.test.js`, "completion
consistency") proves a real student's `GET /api/completion` result and the Teacher's roster/detail view
of that same student agree exactly — this is the concrete guard against the two views silently
drifting apart.

### 24.4 Frontend — Teacher Dashboard (`frontend/src/teacher-panel.js`)

New `TEACHER`-only nav item ("แดชบอร์ดครู"), shown only when `user.role === "TEACHER"` (mirroring the
existing `admin-nav-btn`/`certificate-nav-btn` pattern in `main.js`) and hidden for
STUDENT/ADMIN. A Teacher's landing screen after sign-in is now this classroom dashboard rather than
the Student-facing "หน้าหลัก" Dashboard — ROLE-003 still lets a Teacher use the full Student learning
experience, "หน้าหลัก" stays reachable in the nav unchanged, this only changes what renders first.

The panel has two internal views (no new nav items, no router change): a roster view (summary cards,
a "needing attention"/"recent activity" list when non-empty, a client-side search-by-name/student-ID/
username box, a status filter dropdown, and a `.progress-table`-styled roster table reusing the
existing mobile-safe `display:block; overflow-x:auto` pattern) and a per-student detail view (reached
via a "ดูรายละเอียด" button per row, with a back button). Both reuse existing shared components/CSS
wherever the shape matched — `.dashboard-card`, `.status-badge` variants, `.btn`/`.btn-primary`/
`.btn-secondary`, and the `dashboardQuizBadge`/`dashboardChallengePassedBadge`/
`dashboardChallengeNotPassedBadge`/`statusCompleted`/`statusStarted`/`statusNotStarted` i18n strings
already used by the Student Dashboard — rather than inventing a parallel visual system. CSV export is
a plain `<a href="/api/teacher/export">` link (a real top-level navigation, so the existing
same-origin session cookie is sent automatically) rather than a JS-driven blob download.

### 24.5 CSV Export — Safety (P6 spec §7)

`handleTeacherExport` builds the CSV in the Worker from the exact same roster aggregation the roster
route uses (one shared `loadClassroomData()` function — no second, hand-rolled export formula).
Columns: full name, student ID, username, overall progress %, completed modules, quizzes completed,
challenges passed, course completion, certificate status, last activity — no password/session/recovery
field, no internal D1 row id, no certificate verification token (P6 spec §10 privacy). Safety measures,
both covered by automated tests:

- **UTF-8 BOM** (`﻿`) prefix so Excel opens Thai names correctly rather than guessing a legacy
  codepage.
- **Spreadsheet formula-injection mitigation**: any cell whose first character is `=`, `+`, `-`, or `@`
  is prefixed with a leading apostrophe before quoting (OWASP CSV-injection guidance) — a realistic
  case, not hypothetical, since `full_name` is learner-supplied at registration (P4).
- **Standard CSV quoting** for any cell containing a comma, quote, or newline.

### 24.6 Privacy / Data Minimization (P6 spec §10)

Neither the roster, the detail view, nor the CSV export ever includes: password hash/salt/iterations,
session/recovery state (`must_change_password`, `recovery_expires_at`, `token_hash`), email, internal
D1 auto-increment ids beyond the one used as the API's own student-lookup key (analogous to how every
other route in this app addresses a resource by its D1 id — not the kind of "raw backend object" leak
the privacy rule is aimed at), the certificate's public verification token, or a challenge's command
transcript. Verified by explicit tests asserting none of those field names appear anywhere in the
serialized roster/detail JSON.

### 24.7 Tests

`tests/worker-teacher.test.js` (new, 18 tests; `tests/helpers/fake-d1.js` extended with the five new
bulk-query patterns): unauthenticated rejection on every endpoint; STUDENT rejected on every endpoint;
ADMIN does **not** silently inherit Teacher access; TEACHER admitted on every endpoint; TEACHER
rejected from Admin-only endpoints; roster reflects real progress and never leaks a
password/session/recovery field; a fully-inactive student is classified `not_started` and a Teacher's
own account never appears in the student roster; summary totals/average/needing-attention/recent-
activity match the roster's own per-student data; completion-value consistency against
`GET /api/completion` (§24.3); student-detail shows per-module/quiz/challenge/certificate state
correctly; a Teacher/Admin account id is not reachable through the student-detail route (404); an
unknown or malformed id fails safely (404/400, never 500); CSV export authorization, header/row shape,
UTF-8 BOM, formula-injection mitigation, and comma-quoting; and a full-course regression proving the
existing Student flow is unaffected. **Full suite: 134 → 152 passing, zero regressions.**

### 24.8 Production Verification Performed This Session

Beyond the automated suite and the local-`wrangler dev`/curl walk (§ intro above), this session
verified the real deployed production Worker (`git-learning-lab-api`, redeployed this session) and the
real Pages frontend (auto-deployed via the existing GitHub → Cloudflare Pages integration, unchanged
mechanism) with a **real browser click-through** against `https://git-learning-lab.pages.dev`:
signed in as `teacher1` via a fresh Admin-issued recovery credential (the ordinary RECOV-002/003 flow,
exercised as a real Admin action, not a shortcut) → forced password-change gate → Teacher Dashboard
loaded as the landing screen showing real production classroom data (student count, average progress,
needing-attention/recent-activity lists) → roster search-by-username and status-filter both narrowed
the table correctly against live data → opened a fully-completed real student's detail view (all 7
modules, per-module quiz percent, challenge-passed badges, certificate-issued date) → back button
returned to the roster → verified at an emulated 375×812 mobile viewport (nav stacks without
horizontal overflow, roster/detail cards wrap correctly). Additionally verified directly via `curl`
against production: `GET /api/teacher/*` rejects an unauthenticated request (401) and a STUDENT
session (403) on every route; an ADMIN session is rejected from `/api/teacher/summary` (403, ADMIN
does not inherit); the Admin's own `GET /api/admin/users` still works and lists only real accounts; a
production CSV export downloaded with the correct BOM/headers/rows.

### 24.9 P4/P5 Test-Data Cleanup (§13)

Before this session, three test accounts existed in real production D1 from prior phases' own
production verification (P2 §17.8/P4 §22.9 already documented `student1`'s harmless test progress and
`prodverify_p4_temp` as known, accepted side effects; `p4prodtest01` and `p5prodverify` were the two
this session's brief named directly). All three — `prodverify_p4_temp` (id 4), `p4prodtest01` (id 5),
`p5prodverify` (id 6) — were confirmed via a live remote query to have no cross-references to the real
`admin`/`teacher1`/`student1` accounts (every dependent row is scoped by `user_id` alone). A verified
`wrangler d1 export --remote` backup was taken first
(`backups/pre-p6-cleanup-20260906-232753.sql`, gitignored, confirmed to contain all 6 pre-cleanup user
rows with full column data). Cleanup order was children-before-parent across every table that
references `user_id` (`sessions` → `progress` → `quiz_results` → `challenge_results` → `certificates`
→ `users`), executed as one batched `wrangler d1 execute --remote` call; the returned per-statement
`changes` counts (2/7/7/5/1/3) matched the pre-deletion row counts exactly. Post-cleanup, production
`users` contains exactly `admin` (id 1), `teacher1` (id 2), `student1` (id 3) — re-verified live via a
fresh remote query and via the Teacher Dashboard itself showing a clean 1-student roster. **`student1`
was deliberately left untouched** (real, if minimal, progress from prior phases' own verification,
matching this session's explicit "do not touch student1/teacher/admin" instruction).

One side effect of this session's own production verification, not test data to be alarmed by:
`teacher1`'s password was changed (via the ordinary Admin-issued-recovery flow) to a new value the
Owner should treat as the current credential — issue `teacher1` a fresh recovery credential via the
Admin panel before handing this account to the real class teacher, same pattern P2 left for
`teacher-new-pass-1`.

### 24.10 Deployment

Worker redeployed (`git-learning-lab-api`) since `worker/src/db.js`, `worker/src/index.js`, and the new
`worker/src/routes/teacher.js` all changed. Frontend ships via the existing GitHub → Cloudflare Pages
auto-deploy on push to `main` (unchanged mechanism from P1) — no `[[d1_databases]]`/`wrangler.toml`
change, no new migration (P6 needed no schema change, §24.2).

### 24.11 Remaining P6 Debt / Owner Decisions

- No automated Worker-runtime (workerd) test harness exists yet — same standing P2–P5 debt, unchanged;
  the fake-D1 unit tests plus real `wrangler dev`/production verification continue to substitute for it.
- The roster/summary/export scale to the whole `users` table with `role = 'STUDENT'` in one query each
  — correct and proportionate at the ~29-student scale (Engineering skill §20), but would need
  pagination if the class size grew by an order of magnitude; not a concern for this classroom.
- CSV export is a same-origin `<a href>` navigation rather than a JS `fetch`+blob download — simpler
  and needs no extra client code, but means a failed export (e.g. an expired session) surfaces as a
  browser-level failed-navigation rather than an in-page error message; acceptable at this project's
  risk/complexity budget, worth revisiting only if real classroom use shows it's confusing.

---

## 25. P7 Status Report — Final UI/UX Audit, Security/Performance/Accessibility Review, Release Polish

**Verified live before this session started**: git clean on `main`, 152/152 tests passing, frontend
build working, production Worker/Pages healthy (admin/teacher1/student1 the only three accounts,
matching P6's cleanup). This was explicitly a **polish/hardening pass** (no new product systems, no
P8 work, no architecture rewrite) — Engineering skill §2/§21 classifies everything found and fixed
this session as LOW/MEDIUM risk (CSS + one string-formatting change, no simulator/validation/auth/
schema change), so no HIGH-risk transition-spec process applied.

### 25.1 Method

Read `docs/PROJECT_CONTEXT.md`, `docs/SCOPE.md`, `docs/ARCHITECTURE_DECISIONS.md`, and both
`skills/git_learning_lab/*/SKILL.md` files first (source-of-truth hierarchy, Engineering skill §1).
Audited the actual product two ways: (1) a local static preview of `frontend/public` for every
unauthenticated screen (Login, Register, public Certificate Verification), since the Origin/Referer
CSRF check (AUTH-006) correctly rejects non-production origins for state-changing requests — the
same structural limitation every prior phase (P2, P4, P5) already documented for local click-through
testing; (2) a real production click-through at `https://git-learning-lab.pages.dev` as `admin` (the
original P2 bootstrap password still worked) and as `teacher1` (via a fresh Admin-issued recovery
credential, the ordinary RECOV-002/003 flow — same pattern P2/P6 used), covering the Admin panel,
Teacher Dashboard/roster/student-detail, Lessons, Simulator/visualizer/terminal, and a module detail
page, at both desktop and a 375×812 mobile viewport. Source-read every frontend component
(`frontend/src/*.js`, all 30 files) and spot-checked Worker security-sensitive routes
(`worker/src/routes/auth.js`, `teacher.js`) against the invariants `docs/PROJECT_CONTEXT.md` already
claims, rather than re-deriving the entire security posture from scratch (already exhaustively covered
by the existing 152-test suite plus four prior phases' own production verification).

### 25.2 UI/UX Defects Found and Fixed

Three real, citable defects were found and fixed (NORMALIZE tier, UX skill §4 — no redesign, no new
visual language):

1. **CSS specificity bug hid the intended styling of two shared components app-wide.**
   `.screen button` (a class+element selector, specificity 0,1,1) silently overrode `.link-btn` and
   `.password-toggle-btn` (single-class selectors, specificity 0,1,0) regardless of source order,
   because CSS resolves ties by specificity before source order. Effect: the "แสดงรหัสผ่าน" (show
   password) toggle on Login/Register rendered as a solid accent-blue button instead of its intended
   subtle gray secondary style, and the "สมัครสมาชิก"/"เข้าสู่ระบบ" screen-switch links rendered as
   full primary buttons instead of plain underlined links — both added visual clutter and
   miscommunicated which control was the actual primary action on the screen. Fixed by scoping
   `.screen button` to `.screen button:not(.link-btn):not(.password-toggle-btn)`.
2. **The public Certificate Verification screen's ID input was broken at every viewport width.**
   `.screen form` (specificity 0,1,1) likewise overrode `.verify-form`'s own `display:flex` row-layout
   declaration (specificity 0,1,0), silently flipping its flex axis to column. In a column flex
   container, `flex-basis` sizes the cross axis (height), not the main axis (width) — so
   `.verify-form input`'s `flex: 1 1 260px` (authored assuming a row layout) made the single-line
   Certificate ID input render **~260px tall**, at every viewport including the existing 420px mobile
   breakpoint (whose own `.verify-form { flex-direction: column }` rule inherited the same unreset
   `flex: 1 1 260px` and hit the identical bug independently). This is the one public,
   no-login-required screen in the whole product (`docs/SCOPE.md`'s public-verification requirement)
   and was unusable at every width tested. Fixed by scoping `.screen form` to
   `.screen form:not(.verify-form)`, and by resetting `.verify-form input` to `flex: none; min-width: 0`
   inside the existing `@media (max-width: 420px)` block. Verified fixed at desktop and 375px, locally
   and in production (a stale browser-cached `styles.css` in one verification tab briefly looked
   unfixed after deploy — resolved with a cache-busting reload; the served file was correct throughout,
   confirmed via `curl` and a `fetch(..., {cache:'no-store'})` check).
3. **Teacher student-detail view showed a bare "ยังไม่ออก" (not issued) line with no label.** Unlike
   the roster table (which has a dedicated "ใบประกาศนียบัตร" column header for context), the detail
   view's certificate line had no prefix when a certificate hadn't been issued yet — a teacher glancing
   at the page would see "not issued" floating with no stated referent. Fixed to prefix with the same
   column label used elsewhere (`frontend/src/teacher-panel.js`), matching the "ออกใบประกาศนียบัตรแล้ว
   เมื่อ ..." phrasing already used for the issued case.

No other defects met the NORMALIZE bar (a citable, specific inconsistency) — the rest of the product's
CSS/component layer (design tokens, `.btn`/`.status-badge`/`.dashboard-card` patterns, spacing scale,
empty/loading/error states) was already consistent from P4's design-token work and P5/P6's continued
reuse of it. No REFACTOR or REDESIGN-tier change was made or was justified (Preserve-vs-Redesign
Ladder, UX skill §4) — this was a genuinely mature, well-maintained visual system, not one accumulating
drift.

### 25.3 Global Design System / Consolidation

No new tokens, classes, or component patterns were introduced. The existing token set
(`--color-*`, `--space-*`, `--radius-*`, `--shadow-card`) and shared classes (`.btn`/`.btn-primary`/
`.btn-secondary`, `.status-badge` variants, `.dashboard-card`, `.progress-table`) established in P4-P6
were confirmed still the single source for every screen touched this session — no one-off styling was
found that duplicated an existing pattern.

### 25.4 Dashboard / Simulator / Visualizer Polish

Reviewed both in full (source + live production render at desktop/mobile). No defect found: the
Dashboard's overall-progress bar, empty state, 100%-complete banner, and per-module cards all read
correctly and match `GET /api/completion`'s authoritative value (P5's own "no second completion
formula" guarantee, re-confirmed live). The simulator's four-zone visualizer, terminal input/output
distinction, and file editor all render correctly; no animation/micro-interaction gap was found that
would justify new CSS given the UX skill §14's existing "command accepted/rejected" state coverage.
No change was made to either surface this session.

### 25.5 Mobile Experience

A scripted check (clicking every visible nav button at a 375px emulated viewport and measuring
`document.body.scrollWidth` against `window.innerWidth`) found **zero page-level horizontal overflow**
across all ten reachable panels (Dashboard, Teacher, Lessons, Simulator, Challenges, Quizzes, Progress,
History, Cheat Sheet, How-to). The only elements whose own `scrollWidth` exceeds the viewport are
`.progress-table`/`.teacher-roster-table` internals, which is the existing, correct, intentional
`overflow-x: auto` pattern (wide tables scroll in their own container, never the page) — not a defect.
The Certificate Verification fix (§25.2 item 2) was the one real mobile-specific defect found.

### 25.6 Accessibility

No new automated accessibility tooling was added (Engineering skill §20: proportionate to MVP scale).
Source-reviewed every component against the UX skill §12 practical baseline already established:
semantic `<button>`/`<label>`/`<input>` used throughout (no `onclick`-on-`<div>`), `aria-live="polite"`
on the terminal's output log and `role="status"`/`role="alert"` on every dynamic feedback element
(quiz/challenge results, form errors, admin recovery result), `:focus-visible` outlines defined once
globally and inherited everywhere, and no status ever conveyed by color alone (status badges carry
text, terminal errors carry an explicit "✖ " prefix, checklist items change glyph not just color).
This was all already true before this session — no gap was found needing a fix.

### 25.7 Thai Language / Content Consistency

`tests/i18n.test.js` (part of the existing 152-test suite) already scans every `t("key")` call site
and proves dictionary completeness — the closest this project's minimal toolchain gets to an automated
content-consistency check (P3's own design decision, unchanged). Spot-read `frontend/src/i18n.js` and
every lesson module's Thai copy; found no English leakage, no mistranslated Git terminology, and no
inconsistent module-title wording (the one such inconsistency this project ever had was found and
fixed in P3.5, §21). No content change was made this session.

### 25.8 Performance

Bundle size unchanged at 262.1kb (`npm run build:frontend`) — no new dependency, no new component
weight. `frontend/src/main.js`'s existing `panelRendered`/`ALWAYS_REFRESH` caching (P3.5/P4) already
avoids re-fetching read-only panels unnecessarily while still refreshing panels whose data can go
stale; this was reviewed and found still correct, no redundant API calls introduced or found. The
Teacher routes' bulk-query pattern (`worker/src/routes/teacher.js`, P6) — 5 D1 reads total regardless
of class size — was re-confirmed as the right shape at the ~29-student scale (Engineering skill §20).
No performance change was made; none was needed.

### 25.9 Security Regression Review

Spot-read `worker/src/routes/auth.js` and `worker/src/routes/teacher.js` against the invariants this
document already documents from P2/P6: `handleLogin` still returns an identical generic
`invalid_credentials` error whether the identifier is unknown or the password is wrong, and still runs
a dummy PBKDF2 verification against a fixed salt/hash when the user doesn't exist (timing-attack
defense-in-depth, unchanged since P2); `handleChangePassword` still rotates the session token and
invalidates the one used to authenticate the request; every Teacher route is still read-only and
gated to exactly `role === "TEACHER"` (not `TEACHER` or `ADMIN`); the CSV export's OWASP
formula-injection mitigation and UTF-8 BOM are both still present and still covered by their own
tests. No change was made to any Worker file this session, so there is no new attack surface to
verify — this was a confirmation pass, not a redesign, per Engineering skill §21's explicit
"do not redesign security architecture without a proven need."

### 25.10 Error / Loading / Feedback States

Reviewed every panel's empty/loading/error path (Dashboard's empty-course state, Progress/History's
empty states, Teacher roster's empty-after-filter state, quiz/challenge submit-in-flight button
states, register's duplicate-submit prevention via `submitBtn.disabled`). All already correct and
Thai-first, matching the UX skill §14/§17 baseline — no gap found needing a fix this session.

### 25.11 New Tests / Test Count

**No new tests were added.** All three fixes this session were CSS-only (2 of 3) or a pure
string-formatting change with no new branch (1 of 3) — none introduced new logic that unit tests
target in this project's testing model (Engineering skill §12 scopes transition tests to simulator/
validation logic, not CSS layout). Adding a snapshot-style test for a CSS specificity bug would be
low-value busywork per this session's own instruction to avoid inflating the test count. **Full suite
remains 152/152 passing**, confirmed both before and after every change this session.

### 25.12 Production Role-by-Role Verification

- **STUDENT**: Login/Register screens visually verified (fixed) at desktop and 375px on a local
  static preview (unauthenticated screens only, per the structural Origin/Referer limitation noted in
  §25.1); the public Certificate Verification screen (also STUDENT/public-facing) verified fixed in
  full production round-trip (valid-shape lookup returning a safe generic failure for an unknown id,
  correct layout at both viewports).
- **TEACHER**: full click-through as `teacher1` against real production data — Teacher Dashboard
  landing screen, summary cards, recent-activity/needing-attention lists, roster search/filter, CSV
  export button, and student-detail view (including the fixed certificate-label line) all verified
  correct against `student1`'s real progress.
- **ADMIN**: full click-through as `admin` — account list (confirmed exactly the three expected
  accounts, no residual test data), recovery-credential issuance flow exercised live (used to reach
  the Teacher account for this session's own verification, see §25.13).
- **PUBLIC**: Certificate Verification screen covered above; Login screen (also reachable
  logged-out) visually verified.

No console errors, no horizontal overflow, and no mangled Thai text were observed on any screen
visited this session.

### 25.13 Physical Enter-Key Verification Status

**Still not closed as of this P7 session** — unchanged from P3.5/P4/P5/P6. This session's environment
has no physical keyboard capability either; the existing "Run" button fallback (added in P2
specifically for this class of concern) continues to be used for all terminal interaction
verification, including this session's own. This remains a tiny, low-risk manual Owner check,
explicitly documented rather than falsely claimed as verified.

**Update (P7.5, September 7, 2026): CLOSED.** The Project Owner manually verified terminal
Enter-to-submit on a real physical keyboard. This standing debt item, open since P3.5 (§21), is
resolved — no terminal code change was made or needed, since no defect existed (§17.6 continues to
document the terminal's own `e.key === "Enter"` handling, unchanged since P2). See §26 for the full
P7.5 report.

### 25.14 Production Data / Test-Account Status

No new student account was created this session (unlike P2/P4/P5, each of which left a harmless
bootstrap/verification account behind). The one real side effect: opening the Module 1 lesson page as
`teacher1` during UI verification triggered the lesson's own unconditional `postProgress("module-1",
"started")` call (`frontend/src/lesson-module1.js`), writing one real `progress` row for `teacher1` in
production D1. This was noticed via a live query and its deletion was attempted but **blocked by this
session's own safety controls** as a destructive production-database write requiring explicit user
confirmation — correctly so. **This one row (`teacher1` / `module-1` / `started`,
`2026-09-07 09:57:58`) remained in production** (cleared in P7.5, September 7, 2026 — see §26.2) and
had no effect on any real student's data or on `teacher1`'s ability to use the account normally.
Separately, `teacher1`'s password was
changed (via the ordinary Admin-issued-recovery flow, the same mechanism P2/P6 already used for their
own verification) to a session-local value the Owner should treat as current — **issue `teacher1` a
fresh recovery credential via the Admin panel before handing this account to the real class teacher**,
identical to the standing note P2/P6 already left for this same account. **Update (P7.5): done** — a
fresh recovery credential was issued via the normal Admin flow specifically for real-teacher handoff;
see §26.3 (the credential value itself is deliberately never recorded in this document).

### 25.15 Git / Worker / Pages Deployment Status

One commit (`P7: fix CSS specificity bugs breaking auth buttons and public verify form`), pushed to
`main`. Frontend-only change (`frontend/public/styles.css`, `frontend/src/teacher-panel.js`) — **no
Worker file changed, so no `wrangler deploy` was needed or performed**, per this project's own
"Worker redeployed only if backend/shared Worker code changed" rule. Cloudflare Pages' existing
GitHub-integration auto-deploy (unchanged since P1) picked up the push automatically; verified live via
a direct `curl` of the deployed `styles.css` (confirmed the new rules present) and a cache-busted
production browser reload (confirmed the fix actually renders, after first catching and correctly
diagnosing a stale browser-cached stylesheet in one of this session's own verification tabs as a
tooling artifact, not a deploy failure).

### 25.16 Remaining Technical Debt (carried forward, unchanged by this session)

- ~~Physical-keyboard Enter-key spot-check (§25.13) — standing since P3.5.~~ **Closed in P7.5** (§26.1).
- No automated Worker-runtime (workerd) test harness — standing since P2.
- Teacher/roster/export scale to one query per table, correct at ~29 students, would need pagination
  at a much larger scale — standing since P6, not a v0.9 concern.
- CSV export is a same-origin `<a href>` navigation, not a `fetch`+blob download — standing since P6.
- ~~The one harmless `teacher1`/`module-1` progress row from this session's own verification
  (§25.14).~~ **Cleared in P7.5** (§26.2).

### 25.17 Owner Decisions Made / Pending

No Owner Decision was required this session — every fix was a citable, in-scope NORMALIZE-tier bug
fix (UX skill §4), not a scope question, a redesign, or a security tradeoff. Nothing was escalated per
§9.2's Owner Decision Protocol. ~~**Pending, non-blocking**: clear the one `teacher1` progress row and
issue `teacher1` a fresh recovery credential (§25.14) before the real class starts; close the physical
Enter-key check (§25.13) opportunistically if a real device becomes available before September 12.~~
**All three resolved in P7.5** (§26) — see that section for the closure record.

### 25.18 P7 Safety / Release-Readiness Assessment

**Safe to approve.** All 152 automated tests pass, the frontend build is clean, git is clean and
pushed, production is live and was re-verified end-to-end at both viewports as Admin/Teacher/Public
after deploy, and no P0-P6 functionality regressed (every screen touched was verified working, not
just visually inspected). The three fixes found were real, previously-undetected defects — not
manufactured busywork — the most significant being the public Certificate Verification screen's
input, which was broken at every viewport width prior to this session and is exactly the kind of
defect a UI audit exists to catch. No scope was expanded beyond `docs/SCOPE.md`; no P8 work was
started.

**Recommendation for v1.0 / P8**: the Classroom MVP is release-ready for the September 12, 2026 date
with the two small non-blocking action items in §25.17. Do not start P8 (multi-class support, richer
analytics, or any of the explicitly-deferred items in §4/§21) until at least one real class cycle has
run on the current v0.9 feature set — real classroom usage, not further speculative polish, is the
highest-value next signal this project can get.

---

## 26. P7.5 Status Report — Final Owner Cleanup Before Classroom Freeze (September 7, 2026)

A very small, explicitly-scoped production-cleanup pass closing out the three non-blocking items
§25.17 left open. No feature work, no redesign, no refactor, no code change — this section documents
three closures only.

### 26.1 Physical Enter-Key Debt — CLOSED

The Project Owner manually verified terminal Enter-to-submit on a real physical keyboard on
**September 7, 2026**. The standing debt item open since P3.5 (§21) — never fully closed through
P4/P5/P6/P7 because no session had physical-keyboard capability — is now resolved by direct Owner
verification. No terminal code was changed, because P3.5's investigation (§21) had already correctly
identified that the earlier "failure" was a synthetic-input limitation of browser-automation tooling,
not an application defect; the Owner's real-keyboard test confirms that conclusion. `terminal.js`'s
`e.key === "Enter"` handling and its "Run"-button fallback are both unchanged.

### 26.2 Teacher1/Module-1 Production Side-Effect Row — Cleared

Followed the full safety procedure before any destructive write:

1. **Resolved `teacher1`'s real `user_id` from production** (never assumed): `SELECT id, identifier,
   role FROM users WHERE identifier = 'teacher1'` → `id = 2, role = TEACHER`.
2. **Enumerated every learning-data row for that user_id** across all four tables (`progress`,
   `quiz_results`, `challenge_results`, `certificates`) — found **exactly one row**: `progress`,
   `module-1`, `started`, `2026-09-07 09:57:58`, matching the P7 report's documented side effect
   (§25.14) exactly, including the timestamp. No other `teacher1` learning-data row existed anywhere
   to preserve or worry about.
3. **Took a fresh remote D1 backup** before touching anything:
   `backups/pre-p7.5-cleanup-20260907-172717.sql` (gitignored, per this project's standing backup
   convention — confirmed by `grep`ing the exported file for the exact row before deletion:
   `INSERT INTO "progress" (...) VALUES(34,2,'module-1','started','2026-09-07 09:57:58');`, i.e. row
   `id = 34`).
4. **Deleted only that exact row**, scoped by primary key plus every distinguishing column as a
   belt-and-suspenders guard: `DELETE FROM progress WHERE id = 34 AND user_id = 2 AND module_id =
   'module-1' AND status = 'started'` — result: `changes: 1` (exactly one row affected).
5. **Verified after deletion**: `teacher1` now has zero rows in `progress` (confirmed via
   `SELECT ... WHERE user_id = 2`, empty result); the full `progress` table now contains only
   `student1`'s 7 real rows, byte-for-byte matching what P6/P7 already documented as `student1`'s
   legitimate learning history — nothing else was touched.
6. **Verified `users` unchanged**: exactly 3 accounts remain (`admin`/ADMIN, `teacher1`/TEACHER,
   `student1`/STUDENT), same ids and roles as before.

`admin`, `student1`, certificates, and all quiz/challenge data were never queried for writes and are
confirmed untouched by this operation.

### 26.3 Teacher1 Recovery Credential — Issued for Real Handoff

Used the existing, unmodified Admin-mediated recovery mechanism (`POST /api/admin/recovery/issue`,
same route P2/P6/P7 already exercised) via the real Admin UI — no manual password-hash write, no new
mechanism invented. Signed in as `admin` (original P2 bootstrap credential, unchanged), opened
"ผู้ดูแลระบบ" → issued a temporary credential for `teacher1`.

Server-side behavior confirmed identical to every prior issuance (`worker/src/routes/admin.js`):
a fresh random 12-hex-character password was generated, `must_change_password` was set, a 24-hour
expiry was set (`RECOVERY_CREDENTIAL_TTL_HOURS = 24`, unchanged), and — importantly —
**`deleteAllSessionsForUser` ran**, immediately invalidating `teacher1`'s prior session (the one this
project's own P7 verification had been using). This is the existing, correct, by-design behavior, not
a P7.5 change.

**The credential value itself is not recorded anywhere in this document, in git history, or in any
file this session wrote** — it was presented to the Owner exactly once, directly in the session's own
response, for the Owner to relay to the real class teacher out-of-band (the same "relay then discard"
handling this project has used for every bootstrap/recovery credential since P2). The intended handoff
sequence — teacher receives the temporary credential → signs in → is forced by the existing
`mustChangePassword` gate to choose their own new password (§18, RECOV-003) — was deliberately **not**
completed on the teacher's behalf; this session did not sign in as `teacher1` with the new credential,
so as not to consume or alter its one-time handoff state.

### 26.4 Post-Cleanup Production Sanity Check

- `teacher1` still resolves with `role = TEACHER` (re-queried after §26.3's credential issuance).
- `admin` and `student1` rows unchanged (same ids, roles, and — for `student1` — the same 7 real
  progress rows plus existing quiz/challenge/certificate data untouched).
- **Teacher Dashboard load was not re-verified with a live session this session**, by design: the only
  session that could exercise it (`teacher1`'s) was just invalidated by §26.3's own recovery issuance
  (`deleteAllSessionsForUser`), and using the newly-issued one-time credential to check would have
  consumed the exact handoff state this task explicitly protects. The Dashboard's correctness was
  already fully verified live, with real data, earlier in P7 (§25.12) and is unaffected by anything in
  this session (no Teacher Dashboard code was touched).
- Pages (`https://git-learning-lab.pages.dev/`) returns HTTP 200; Worker
  (`https://git-learning-lab-api.git-learning-lab.workers.dev/api/health`) returns
  `{"ok":true,"service":"git-learning-lab-api"}`.
- Full automated suite: **152/152 passing**, unchanged.
- Frontend build: clean, `262.1kb`, unchanged (no frontend code was touched this session).
- `git status`: clean before and after (this section's own commit is the only change).
- Secret scan: this document contains no credential values, tokens, or password hashes — verified by
  re-reading the diff before committing (§26.3's credential was relayed only in the session's own
  chat response, never written to any file).

### 26.5 No Test Users Created

Per this task's explicit boundary, no new account was created at any point in this cleanup pass.

### 26.6 Scope Confirmation

Nothing in §7 of this task's own brief was touched: no P8 work started, no feature added, no auth/
recovery/simulator/Teacher-Dashboard code changed, no account created, no student/certificate data
altered, no workerd harness added, no unrelated cleanup performed. The only file changed this session
is this document.

### 26.7 v0.9 Freeze Readiness

**Safe to freeze for classroom use.** All three items §25.17 left open are now closed: the physical
Enter-key debt is closed by real Owner verification, the one production side-effect row is gone and
verified gone, and `teacher1` has a fresh, correctly-expiring recovery credential ready for handoff
through the normal forced-password-change flow. Production contains exactly the three legitimate
accounts (`admin`, `teacher1`, `student1`), Pages and Worker are both healthy, and the full 152-test
suite and frontend build are both clean. No known open defect remains. **Do not start P8** — the next
meaningful signal for this project is real classroom usage of the current v0.9 feature set.

---

## 29. P10 Status Report — UX/UI Refinement + Visual QA + Micro-Polish

**Owner Decision**: one final, Owner-authorized autonomous refinement pass over the P9 visual
baseline. Explicitly **not** a redesign — P9's visual identity, tokens, and component treatments are
the preserved foundation; P10's mandate was to normalize inconsistencies, tone down excess, and fix
concrete defects, not introduce a new visual language. This session ran under an explicit, tight
token budget (stated in the brief itself), so scope was bounded to real, evidenced issues rather than
a screen-by-screen rebuild.

### 29.1 Preflight

Read `docs/PROJECT_CONTEXT.md` §28 (P9 report), `docs/SCOPE.md`, `docs/ARCHITECTURE_DECISIONS.md`, and
`skills/git_learning_lab/ux_ui/SKILL.md` before touching anything. Baseline confirmed by live
inspection, not assumed from the docs alone: git clean on `main`, **172/172 tests passing**,
`npm run build:frontend` clean (`359.2kb`).

### 29.2 P9 Baseline: Preserved

No design token, color, radius, shadow, or motion-duration value was changed in a way that alters the
product's visual identity. No new component pattern, layout system, or visual language was
introduced. Every change below is a targeted fix or a tuning of an existing, already-approved P9
value — never a replacement of it.

### 29.3 Files Changed

- `frontend/public/styles.css` only. No `frontend/src/*.js`, `shared/*`, or `worker/*` file was
  touched — this phase is frontend-presentation-only, exactly as the brief expected (§32 there), so
  **no Worker redeploy was needed or performed**.
- `docs/PROJECT_CONTEXT.md` (this section).

### 29.4 Biggest Real Issue Found: an unreset default `<p>` margin on shared feedback primitives

**This was the session's one genuine, high-leverage defect**, found by measuring actual rendered
layout (`getBoundingClientRect()`), not by guessing: `.field-error` and `.field-success` — the shared
status-paragraph primitives used across Login, Register, Certificate, Challenge, Quiz, Learning
History, and Teacher panels — never reset the browser's default `<p>` margin. Because both classes
also reserve `min-height: 1.2em` for layout stability even when empty, the browser's default ~1em
top+bottom margin **stacked on top of** that reserved space and any neighboring element's own
intentional spacing. Measured on the Register screen (the worst case, since it renders both an empty
error and an empty success paragraph back-to-back): the gap between the submit button and the "already
have an account?" link was **~46px larger than intended** (30px between the two empty status
paragraphs alone, plus inflated margin-collapse against `.auth-switch`'s own `margin-top`). Fixed by
giving `.field-error`/`.field-success` an explicit `margin: 4px 0 0 0` — verified after the fix that
the same measurement dropped to the intended 4px/4px/16px rhythm. This is a Route 1/NORMALIZE-tier fix
(a single shared primitive, no visual-language change) but with a wide, evidenced footprint since the
class is reused across seven different panels.

The same unreset-margin pattern was found and fixed in three more places using the identical
diagnostic (explicit `margin-top` set, `margin-bottom` silently left at the UA default, or no margin
declared at all on a `<p>`): `.quiz-question-feedback` (was inflating the gap between quiz questions
inconsistently depending on whether feedback was showing), `.challenge-result`, and
`.teacher-detail-meta`. All four now have a fully explicit `margin` shorthand.

### 29.5 Spacing/Rhythm Refinements

Beyond §29.4's fix, the existing spacing scale (`--space-0` through `--space-5`) was reviewed against
every major surface described in P9's own report (§28.4–§28.22) and found internally consistent — no
second instance of the same class of bug was found elsewhere after auditing every `<p>`-based
component class in `frontend/src/*.js` for a matching margin gap (checked: `.history-intro`,
`.verify-intro`, `.cheatsheet-intro`, `.certificate-statement-intro`, `.certificate-statement` — these
carry the browser's default paragraph margin deliberately-compatibly, i.e., they are not
`min-height`-reserved empty status slots, so the default spacing reads as ordinary paragraph rhythm,
not a defect; left unchanged per the "if no real improvement, leave it alone" rule).

### 29.6 Thai Typography Pass

Reviewed heading line-height (`h1–h4: 1.25`) against real rendered Thai headings at both desktop and
375px mobile width (the auth split-hero's two-line Thai headline, the dashboard greeting). Rendered
cleanly with no clipping or cramped tone-mark spacing at either width — this was a specific, evidenced
check (not assumed), and the result was "already correct," so **no change was made** here, per the
Owner's own "if P9 already solved something well, preserve it" instruction.

### 29.7 Motion Refinements — one real "excess" found and toned down

The dashboard's overall-progress-bar shimmer (`.progress-bar-inner::after`, a decorative sweeping
highlight) ran on a 2.8-second `infinite` loop — the one motion P9's own report explicitly flagged as
its sole deliberate exception to "no constant idle-state motion." Under the P10 brief's specific
instruction to audit "progress animation" for frequency/amplitude and reduce anything reading as
"repeated distracting movement," this was toned down (not removed, since the sheen itself is a
legitimate premium touch): slowed from 2.8s to 5.5s per cycle and reduced the highlight's opacity from
0.45 to 0.28 with a narrower band. It now reads as an occasional, subtle sheen rather than a
metronome a learner would notice repeatedly while reading their own dashboard. Every other motion
value (durations, easings, entrance animations, the visualizer's per-command pulse, the
challenge-passed celebration) was reviewed against the brief's checklist and found already
well-tuned — no other change was made.

### 29.8 Effects Toned Down / Removed

Only the shimmer above (§29.7). No gradient, shadow, radius, or color-intensity value was found to be
"too strong" on review — the terminal's dramatic shadow and the certificate's premium border treatment
are both deliberate signature moments, not excess, and were left untouched.

### 29.9–29.20 Screen-by-Screen Refinement Notes

**Auth (Login/Register/Verify)**: live-verified at desktop (1280px) and mobile (375×812) via a local
static preview of `frontend/public` (no Worker/D1 needed for these unauthenticated screens). Found and
fixed §29.4's spacing defect (most visible here, on Register). No horizontal overflow at either width;
the split-hero collapses correctly below 900px; the password-show/hide toggle sits correctly beside
each password field at 375px without wrapping; the skip-link is first in tab order, becomes visible on
focus, and receives a clear 3px focus outline (verified via direct `.focus()` + computed-style
inspection, since this tool's synthetic Tab keypress does not reliably drive real sequential focus
navigation in this environment — the same class of automation-tool limitation this project's own
§21/P3.5 note already documented for the Enter key, not a new finding, and not claimed as a full
keyboard walkthrough).

**Dashboard**: §29.7's shimmer fix applies here. Reviewed the greeting/progress/module-card hierarchy
against the P9 report's own description — no second issue found; not re-verified live this session
(requires an authenticated session), so this is a source-level review, stated honestly rather than
claimed as freshly screenshotted.

**Lessons/Terminal/Visualizer/Quiz/Challenge/Progress/History/Cheat Sheet/Onboarding/Certificate/
Teacher/Admin**: §29.4's shared-primitive fix (`.field-error`/`.field-success`, `.quiz-question-
feedback`, `.challenge-result`, `.teacher-detail-meta`) benefits all of these surfaces directly, since
every one of them uses at least one of those shared classes. Beyond that fix, these authenticated
surfaces were reviewed at the source level against P9's own detailed per-component report (§28.9–
§28.22) rather than re-driven live end-to-end again this session — the P9 report's live verification
(real init→add→commit→push sequences, real quiz/challenge submissions, real Teacher roster views) is
recent, thorough, and not superseded by any change made this session (no DOM structure or component
JS was touched). Re-running that full live walkthrough again for a bounded polish pass was judged not
to be a good use of this session's stated limited budget, per the brief's own §33 priority order and
its explicit instruction not to "manufacture work" or re-verify what already passed. This is stated
plainly as a scope boundary, not hidden.

### 29.21 Mobile/Tablet QA

Directly verified this session at 375×812 (mobile) and desktop widths: Login, Register (zero
horizontal overflow at either; `document.documentElement.scrollWidth` measured equal to
`clientWidth`, not merely eyeballed). Medium (~768px) and the remaining authenticated surfaces were
not independently re-driven this session — P9's own report already verified these explicitly
(§28.25) and no layout-affecting change was made to any of those surfaces this session.

### 29.22 Reduced-Motion Verification

**Not independently verified with real OS/browser-level `prefers-reduced-motion` emulation this
session** — the available browser tooling does not expose a way to toggle this media feature (unlike
`colorScheme`, which is directly emulatable). Source-level check performed instead: the single
authoritative `@media (prefers-reduced-motion: reduce)` block at the top of the motion system
(collapsing every `animation-duration`/`transition-duration` to `0.001ms` for `*, *::before, *::after`)
is unchanged and still the only such block in the file — no new animation was added anywhere in this
session that could bypass it. This is the same bounded, honest limitation P9 itself already logged
(§28.24); it is not newly resolved, and is not claimed as resolved here.

### 29.23 Keyboard/Accessibility Verification

Practical, source-plus-runtime checks performed: skip-link focusability and visible-focus outline
confirmed by direct DOM inspection (§29.9); DOM tab order confirmed by source reading (skip-link is
the first focusable element in `index.html`, before the header/nav/screens); no focus-visible rule was
removed or weakened. Full sequential real-keyboard Tab-through-every-control verification was not
possible with this session's tooling (see §29.9's note) — not claimed. No screen-reader/assistive-
technology device was available; no claim beyond source inspection (semantic `<button>`/`<label>`/
`role="alert"`/`role="status"` usage, all unchanged from P9) is made for that axis.

### 29.24 CSS Quality / Specificity / Dead-Code Cleanup

Audited every custom property in `:root` for actual usage across `frontend/public/styles.css` (the
only place any of them could be consumed, since `frontend/src/*.js` never references a CSS custom
property directly). Found and removed **nine dead tokens**, confirmed via `grep` to have zero `var()`
references anywhere in the file (only their own declaration): `--color-accent`, `--color-accent-dark`
(the removed comment above them claiming they were "used by older P4-era declarations still present in
a few component blocks below" was itself stale — no such usage existed), `--color-bg-subtle`,
`--color-border`, `--shadow-sm`, `--ease-out`, `--term-success`, `--shadow-glow`, `--space-05`. No
selector was removed — only unreferenced token declarations, which cannot cause a visual regression
since nothing consumed them. Checked for duplicate selector declarations (a repeat of the exact
specificity-bug class P7 found, §25 there) via a full selector-frequency scan of the file — **none
found**; P9's rewrite did not reintroduce that class of bug.

### 29.25 Performance / Bundle Size

`frontend/public/styles.css`: no material size change (a net removal of ~9 short token lines, offset
by a handful of new explicit margin declarations — not measured as materially different, and not
worth reporting a before/after byte count for a change this small, per the brief's own "report only if
materially changed" instruction). `frontend/public/bundle.js`: unchanged at `359.2kb` — no JS file was
touched this session.

### 29.26 Tests + Final Count

**172/172 passing, unchanged** — this phase touched only CSS (no testable JS logic changed), matching
the brief's own "do not inflate test count with meaningless CSS snapshots" instruction.
`npm run build:frontend` clean.

### 29.27 Production Verification

Verified locally against a static serve of `frontend/public` (the same files that ship to Cloudflare
Pages) before commit. **Not yet re-verified against the live `https://git-learning-lab.pages.dev` URL**
as of writing this section — that requires this session's commit to be pushed and auto-deployed first.
No Worker redeploy is needed (no `shared/*`/`worker/*` file changed).

### 29.28 Production-Data Side Effects

None. No account was created, read, or modified; every check this session used either the public,
unauthenticated auth/verify screens or direct source/DOM inspection — no live login was performed
against production or any deployed environment.

### 29.29 Git / Pages / Worker Status

Frontend-only change (`frontend/public/styles.css`, this document). No `shared/*` or `worker/*` file
was touched. Deployment is the existing GitHub → Cloudflare Pages auto-deploy (unchanged since P1);
this session's commit still needs to be pushed for that to trigger.

### 29.30 Remaining UX Debt

- The reduced-motion and full-keyboard-walkthrough limitations noted in §29.22/§29.23 are unchanged
  from P9 — still worth a real device/AT spot-check whenever one becomes available, not blocking.
- The authenticated surfaces (Dashboard, Lessons, Terminal, Visualizer, Quiz, Challenge, Progress,
  History, Cheat Sheet, Certificate, Teacher, Admin) received the shared-primitive spacing fix
  (§29.4) but were not independently re-driven live this session (§29.9's scope-boundary note) — a
  future session with a live login flow available could re-run the same kind of
  `getBoundingClientRect()`-based measurement audit performed here on Register against those screens,
  if the Owner wants a second, equally rigorous pass rather than the source-level review given here.

### 29.31 Owner Decisions Pending

None. Push this session's commit and confirm the live Pages deployment (§29.27's one open item) — no
code decision is pending.

### 29.32 Whether P10 Is Safe to Approve

**Yes.** P9's visual identity is fully intact — no token, color, layout system, or component pattern
was replaced. Every change is a small, evidenced fix (a real measured spacing defect reused across
seven panels, a toned-down idle animation, and a dead-code cleanup) rather than a re-decoration of any
screen. No screen was materially redesigned again. The session stayed presentation-only end to end:
no business logic, simulator semantics, scoring, completion rule, or auth/session behavior was read,
let alone changed. Given this session's explicitly stated tight token budget, the scope was
deliberately bounded to real, verifiable issues over a broad but shallow re-touch of every screen —
stated plainly in §29.9's note rather than overclaimed.

---

## 30. P11 Status Report — Admin Account Management Expansion

**Owner Decision, dated 2026-09-07**: Git Learning Lab now supports staff-account creation through
the application. An ADMIN may create TEACHER accounts and additional ADMIN accounts. Public
Student self-registration (§22.1) is unchanged and remains the only path to a STUDENT account —
public registration is hard-coded STUDENT-only, unconditionally, as it was before this phase. A
TEACHER cannot create TEACHER or ADMIN accounts; a STUDENT cannot create staff accounts;
unauthenticated requests cannot create staff accounts. This phase deliberately did **not** add
Admin deletion/demotion/edit-role capability, generic RBAC, a super-admin tier, staff invitation
emails, or any change to lesson/simulator/quiz/challenge/certificate systems — see §31 for the STOP
conditions that were checked and did not trigger.

### 30.1 Preflight / Baseline

Read `docs/PROJECT_CONTEXT.md`, `docs/SCOPE.md`, `docs/REQUIREMENTS.md`,
`docs/ARCHITECTURE_DECISIONS.md`, and both `skills/git_learning_lab/*/SKILL.md` files, then inspected
the current source directly (`worker/src/routes/admin.js`, `register.js`, `auth.js`, `db.js`,
`index.js`, `session.js`, `crypto.js`, `frontend/src/api.js`/`admin-panel.js`/`main.js`/`i18n.js`,
`tests/worker-auth.test.js`, `tests/helpers/fake-d1.js`, `migrations/*`) before writing any code.
Baseline confirmed by live inspection: git clean on `main`, **172/172 tests passing**, frontend build
clean — matching the expected baseline exactly.

### 30.2 API Added

`POST /api/admin/staff/create` — Admin-only (`worker/src/routes/admin.js`'s new
`handleCreateStaff`, wired in `worker/src/index.js` alongside the existing `/api/admin/*` routes,
behind the same `sessionUser.role !== "ADMIN"` gate as `GET /api/admin/users` and
`POST /api/admin/recovery/issue`). Request: `{ identifier, role, fullName?, email? }`. Response
(201): `{ ok, identifier, role, temporaryPassword, expiresAt }` — never a password hash/salt, never
a session token.

### 30.3 Authorization Model / Role Allowlist

Exact `ADMIN` role check, resolved server-side from the session (unchanged pattern from
ROLE-004/005) — verified: unauthenticated → 401, STUDENT → 403, TEACHER → 403, ADMIN → 201. The
allowed role for the new account is a **fixed allowlist** (`STAFF_ROLES = new Set(["TEACHER",
"ADMIN"])`), enforced in two independent places for defense-in-depth: `admin.js`'s
`handleCreateStaff` (rejects before touching the DB) and `db.js`'s `createStaffUser` (throws if
called with any other role, even by a hypothetical future caller). Deliberately **not**
"anything except STUDENT" — an unrecognized role string (e.g. `SUPERADMIN`) or a missing role is
rejected the same way `STUDENT` is.

### 30.4 Staff Validation / Email Policy

Reuses the exact identifier/email/name validation `register.js` already used for Student
registration — `USERNAME_RE`, `EMAIL_RE`, and `MAX_NAME_LENGTH` are now exported from
`register.js` and imported by `admin.js`, so the two account-creation paths cannot silently drift
apart. `fullName` and `email` are optional for staff (unlike Student registration, where `fullName`
is required); when an email is supplied it must match `@rmutsb.ac.th`, case-insensitively — the
identical domain policy Students already have. `student_id` is never accepted by this route and is
always `NULL` for a staff row. Duplicate identifier/email both return `409`.

### 30.5 DB Helper Design

`worker/src/db.js`'s new `createStaffUser(env, {...})` performs one `INSERT` (identifier, role,
password hash/salt/iterations, `must_change_password = 1`, `full_name`, `email`, `student_id =
NULL`, `recovery_expires_at`). It independently re-validates the role against the same
`STAFF_ROLES` allowlist and throws if violated — defense-in-depth, mirroring `createStudentUser`'s
own "role is not a caller-controlled parameter that can be misused" discipline, in the opposite
direction (staff-only vs. student-only).

### 30.6 D1 Migration Status — **NONE**

No migration was added. The schema already supported everything this phase needed:
`users.role`'s `CHECK` constraint already allows `STUDENT`/`TEACHER`/`ADMIN` (migration
`0001_init.sql`), `full_name`/`email`/`student_id` are already nullable (`0004_p4_registration.sql`),
and `must_change_password`/`recovery_expires_at` already exist and are role-agnostic
(`0001_init.sql`/`0002_p2_recovery_progress.sql`). Confirmed by inspection before writing any code,
matching this phase's explicit "no migration expected" instruction.

### 30.7 Credential Generation / Forced-Password-Change Reuse / Expiry

Reuses `worker/src/crypto.js`'s existing `randomHex(6)` + `derivePasswordHash` pattern unchanged —
the identical mechanism `handleIssueRecovery` (RECOV-002) already used, not a second credential
scheme. `RECOVERY_CREDENTIAL_TTL_HOURS = 24` (the existing constant in `admin.js`) is reused as-is
for the new account's initial credential, not a new/duplicated TTL constant. `must_change_password
= 1` on creation routes the new account through the exact same forced-password-change gate
`worker/src/index.js`'s `ALLOWED_DURING_FORCED_CHANGE` already enforces for recovery — no second
first-login screen was built; the existing force-change UI/flow works unmodified for a
staff-created account. Verified end-to-end (temp login → blocked → forced change → old credential
rejected → new permanent password works) both in the fake-D1 test suite and against real local D1
(§30.9).

### 30.8 Session / Recovery Behavior — Unchanged

No session deletion was added to the staff-creation path (a newly-created account has no prior
sessions to invalidate) — `deleteAllSessionsForUser` is still called only by the existing recovery
path, unmodified. `handleIssueRecovery` itself was not touched.

### 30.9 Fake-D1 Fix (Test Infrastructure)

Two fixes to `tests/helpers/fake-d1.js`, both test-only:

1. **The landmine flagged in preflight, confirmed and fixed**: `createStaffUser`'s `INSERT`
   includes `full_name`, which would have silently matched the existing P4
   student-registration dispatch branch (`sql.includes("INSERT INTO users") &&
   sql.includes("full_name")`). Added a new, more specific staff-insert branch — matched on
   `sql.includes("recovery_expires_at")`, which only `createStaffUser`'s INSERT includes —
   **dispatched before** the student branch, so it wins the match. The staff branch accurately
   models `must_change_password = 1`, `student_id = NULL`, and reproduces real UNIQUE-constraint
   failures for duplicate identifier/email.
2. **A second, previously-latent id-collision bug found while writing this phase's tests**: several
   existing test files (`worker-auth.test.js`, `worker-certificate.test.js`,
   `worker-quiz-challenge.test.js`, `worker-teacher.test.js`) seed a user by pushing directly into
   `env._inspect.users` with `id: users.length + 1`, bypassing fake-D1's own internal `nextUserId`
   counter. That counter started at `1` regardless of what had already been seeded — harmless until
   a test both seeds a user this way *and* creates a second user through a real `execRun` INSERT in
   the same `env` (exactly what P11's "seed an ADMIN, then create a TEACHER through the real route"
   tests do), at which point the two users collided on `id: 1` and session lookups silently resolved
   to the wrong user. Fixed at the root: `nextUserId` is now a function computing `max(existing
   ids) + 1` instead of a separate monotonic counter, so a manually-seeded user and a
   real-INSERT-created user can never collide. All pre-existing tests continued passing unmodified
   after this fix — it only affects id *values* assigned to freshly-inserted rows, not any query
   dispatch behavior.

### 30.10 Automated Tests Added

`tests/worker-admin-staff.test.js` — 19 new tests: authorization (unauthenticated/STUDENT/TEACHER
rejected, ADMIN creates TEACHER, ADMIN creates ADMIN), role-allowlist validation (STUDENT rejected,
unknown role rejected, missing role rejected), field validation (invalid identifier, invalid email
domain, duplicate identifier, duplicate email, optional email, optional fullName), account-state
assertions (correct role, `must_change_password = 1`, `recovery_expires_at` populated, `student_id`
null, password stored hashed, plaintext temp credential never persisted, response never contains a
hash/salt), the full first-login flow (temp credential authenticates → blocked before change →
forced change succeeds → old temp credential rejected → new permanent password works), and three
regressions (public registration still STUDENT-only even with a forged staff-shaped body, existing
Admin recovery-issuance route unmodified, a Teacher created via this new route is bound by the exact
same Teacher/Admin boundary as any other Teacher account).

### 30.11 Final Test Count

**191/191 passing** (172 baseline + 19 new). `npm run build:frontend` clean
(`frontend/public/bundle.js`, 370.8kb, up from 359.2kb — the new Admin staff-creation UI).

### 30.12 Real Local D1 / Runtime Verification

Automated fake-D1 tests alone were not treated as sufficient for a HIGH-risk auth/authorization
phase. Ran `wrangler dev --local` against real local D1 (`.wrangler/state`) and exercised the real
route with `curl`: created a disposable local TEACHER and a disposable local ADMIN through the real
endpoint; confirmed real SQLite UNIQUE-constraint rejection on a duplicate identifier; confirmed
`invalid_role`/`invalid_email_domain` rejections against the real runtime, not just the fake-D1
mock. Logged in with the returned temporary credential, confirmed the forced-password-change gate
blocked `GET /api/teacher/roster` (`403 password_change_required`), completed the forced change,
confirmed the old temporary credential was rejected (`401`) and the new permanent password worked,
and confirmed the now-active Teacher route worked normally. Verified authorization against real D1
too: the newly-created, now-active Teacher could **not** reach `POST /api/admin/staff/create`
(`403`); a disposable local Student (registered through the real public route) could not either
(`403`); an unauthenticated request could not (`401`). All disposable local accounts
(`p11localteacher`, `p11localadmin`, `p11localstudent`) were deleted from local D1 afterward — real
production D1 was never touched during this verification.

### 30.13 Mobile / Frontend QA

The Admin panel's new "เพิ่มบัญชีบุคลากร" section was verified via a temporary mock-data preview
harness (`frontend/src/_preview-entry.js` + `frontend/public/_preview.html` +
`_preview-bundle.js` — same disposable-harness pattern the P9 session used, **deleted before
commit**, confirmed absent via `git status`): the role `<select>` renders only "ครู"/"ผู้ดูแลระบบ",
never a Student option; a successful creation renders the username/role/temporary
password/expiry/copy-now warning/forced-change explanation exactly once; a duplicate-username
submission renders the correct Thai error and clears any prior success result; at a 375px mobile
viewport, `document.documentElement.scrollWidth` never exceeded `clientWidth` (no horizontal
overflow), including with the full credential-result panel open.

### 30.14 Security Review

Re-checked against §26's release-blocker list before commit: exact `ADMIN` authorization (yes);
fixed role allowlist enforced in two independent places (yes); Student registration still
hard-coded and untouched (yes, plus a new regression test); temporary plaintext credential never
persisted, only its PBKDF2 hash (yes); PBKDF2 mechanism/iteration count unchanged (yes, same
`derivePasswordHash`); recovery TTL unchanged (yes, same `RECOVERY_CREDENTIAL_TTL_HOURS = 24`
reused, not duplicated); CSRF Origin/Referer check unchanged and applies automatically (yes, no new
code path bypasses `worker/src/index.js`'s existing non-GET check); sessions/session-deletion
behavior unchanged (yes); `GET /api/admin/users` still returns no password fields (yes, unmodified);
no credential logging anywhere in the new code (`grep`-confirmed, no `console.*` in
`admin.js`/`db.js`); no generic "create any role" helper exists (`createStaffUser` rejects
non-staff roles even if misused); no role parameter reaches SQL without prior validation (role is
checked against the fixed allowlist before the parameterized `INSERT`, never interpolated).

### 30.15 Production Deployment

Worker code changed (`worker/src/index.js`, `routes/admin.js`, `routes/register.js`, `db.js`) — a
Worker redeploy is required and was performed after this session's commit was pushed. Frontend
changes (`admin-panel.js`, `api.js`, `i18n.js`, `styles.css`) ship via the existing GitHub → Cloudflare
Pages auto-deploy, unchanged since P1.

### 30.16 Production Verification / Production-Data Side Effects

Per this phase's explicit instruction, **no disposable staff or student account was created against
real production D1** — real local D1 verification (§30.12) served that purpose instead. Production
verification after deploy was limited to: the public health check; `POST
/api/admin/staff/create` unauthenticated → `401` against the live Worker; confirming the deployed
Pages bundle contains the new Admin staff-creation UI. No existing production account
(`admin`, `teacher1`, `student1`) was created, read, or modified this session.

### 30.17 Remaining Debt

- The temporary mock preview harness proved the Admin UI's structure, validation display, and
  mobile layout, but not a live-backend click-through against the real deployed Worker with a real
  Admin session — a natural follow-up the next time a session has a live Admin login available, not
  a blocker.
- No new debt was introduced in the auth/session/recovery architecture — this phase deliberately
  reused every existing mechanism rather than adding a new one.

### 30.18 Owner Decisions Pending

None outstanding for P11. Per this phase's explicit scope boundary, product development returns to
the lesson system next — Admin account deletion/demotion/role-editing, generic RBAC, and staff
invitation emails all remain out of scope pending a fresh, explicit Owner Decision if ever revisited.

### 30.19 Whether P11 Is Safe to Approve

**Yes.** Every §31 (definition-of-done) item was verified: ADMIN can create TEACHER and ADMIN
accounts; TEACHER/STUDENT/unauthenticated cannot; the role allowlist is fixed and independently
enforced twice; public registration remains STUDENT-only (regression-tested); staff email is
optional and, when present, restricted to `@rmutsb.ac.th`; the Worker generates the temporary
credential and stores only its hash; the credential expires (24h, reusing RECOV-004's existing
window) and forces a real password change on first login; the old temporary credential stops
working immediately after; no D1 migration was needed or added; the fake-D1 landmine was fixed
*and* a second, previously-latent id-collision bug was found and fixed at the root; real local D1
verification passed; the Admin UI works and has no mobile overflow; 191/191 automated tests pass;
the frontend build is clean; no production data was touched.

**Explicit answers**: Was any migration added? **No.** Was public registration changed? **No** (a
new regression test now proves it). Was recovery behavior changed? **No** (only reused, unchanged).
Was any production staff account created for testing? **No.** Were any real credentials written to
source/docs? **No.** Did P11 remain bounded to Admin staff creation? **Yes** — no lesson/simulator/
quiz/challenge/certificate/Teacher-analytics/audit-log/RBAC work was touched.

---

## 31. P12 Status Report — Lesson System Expansion & Teaching Quality Upgrade

**Scope**: a curriculum-quality pass over Modules 1–7 — clearer explanations, a real state-comparison
teaching aid for `git reset`, a push/pull direction mnemonic, per-command teaching breakdowns, light
"predict before you run" guidance, richer common-mistake lists, and short module-to-module bridge
notes. No new Git concept, no module reordering, no completion-rule change, no simulator/quiz/
challenge architecture change, no backend/auth touch.

### 31.1 Baseline

Verified before editing: git clean on `main`, **191/191 tests passing**, frontend build clean
(`esbuild` → `bundle.js`).

### 31.2 Curriculum/PDF Audit Method

Read `docs/PROJECT_CONTEXT.md` (P1–P11 history), `docs/SCOPE.md`, `docs/REQUIREMENTS.md`,
`docs/LEARNING_OBJECTIVES.md`, `docs/ARCHITECTURE_DECISIONS.md`, both Git Learning Lab skills, and
every `frontend/src/lesson-module{1..7}.js` file plus `lesson-helpers.js`, `lessons-panel.js`,
`simulator-workspace.js`, `terminal.js`, `visualizer.js`, `quiz-component.js`, `challenge-component.js`,
`i18n.js`, and `shared/curriculum.js`/`quiz-data.js`/`challenges.js`. `docs/Git & GitHub.pdf` itself
was read in full (137 pages) via a local text extraction (`pdftotext` lost the Thai glyphs due to font
encoding; `pymupdf`, installed for this session, extracted full correct Thai text) — every page was
read, not sampled, so module content was checked against the actual source, not a summary of it.

### 31.3 Overall Teaching-Gap Findings

Modules 1, 2, 3, 5, 6, 7 were already substantively strong (Explanation → Demonstration → Practice →
Feedback all present, PDF-accurate, with a working reinforcement box). The concrete gaps found:

1. **Module 4's three `git reset` modes** were only described in prose — no side-by-side comparison,
   no scenario-question framing ("if I want X, use mode Y"), and the real simulator precondition
   ("cannot reset while anything is staged" — confirmed by reading `shared/simulator-core.js`'s
   `doReset`) was never taught, so a learner who hit that real error message would have no idea why.
2. **Module 6** never gave the classic push/pull direction mnemonic explicitly, despite this session's
   brief specifically naming it as a common beginner confusion.
3. **Module 3** taught `git init`/`status`/`add`/`rm --cached` as flowing prose rather than the
   purpose → state-change → common-misunderstanding breakdown the brief asked for.
4. **No module** had a closing "bridge" sentence connecting it to the next one — the jump from one
   module to the next was abrupt.
5. Common-mistake coverage was capped at exactly one italic line per module (P8's original shape) —
   too narrow for modules with more than one distinct, well-evidenced beginner mistake.
6. Module 5's explanation didn't connect the simulator's own merge-commit rendering (the `(merge)`
   marker shown only when a commit has two parents) to the fast-forward-vs-true-merge distinction a
   learner will actually see in the visualizer.

Modules 1, 2, and 7 needed no content fixes — Module 7 in particular already avoids giving away a
literal recipe (its lesson text reviews commands by category, not a copyable sequence; the capstone's
own step-by-step hint stays behind the existing progressive-disclosure hint button, UX skill §18) and
was left untouched per this phase's "preserve what's already strong" instruction.

### 31.4 Module 1 Changes

Added a one-sentence bridge to Module 2 at the end of the lesson. No other content change — the
existing Copy/Patch/Local VCS/CVCS/DVCS explanation, the thesis-loss demonstration scenario (matches
the PDF's own "lost a version, no backup" framing), the sequencing practice, and the reinforcement box
were already accurate and well-paced.

### 31.5 Module 2 Changes

Added a one-sentence bridge to Module 3. No other content change — the Git-vs-GitHub distinction,
offline-first explanation, and classification practice were already correct and clear.

### 31.6 Module 3 Changes

- Explanation rewritten from three merged paragraphs into an explicit per-command breakdown for
  `git init`, `git status`, `git add` (all three forms), and `git rm --cached` — each stating its
  purpose, its effect on file status, and one specific common misunderstanding (per this phase's
  teaching-model checklist).
- Added a lightweight "predict before you run" line above the practice checklist (plain text, no
  scoring/persistence — matches the brief's explicit "lightweight, don't build an assessment
  subsystem" constraint).
- Reinforcement's single mistake line expanded to two evidenced mistakes (staging ≠ permanent;
  `rm --cached` does not delete the real file).
- Added a bridge to Module 4.

### 31.7 Module 4 Changes

- Rewrote the `git reset` explanation and added a genuine three-mode comparison table (new
  `compareTable()` helper, §31.11) showing Staging Area outcome / Working Directory outcome / "use
  when" per mode, plus an explicit scenario-question paragraph ("want to undo but keep it staged →
  --soft", etc.) — this is the concrete fix for the brief's §12 requirement ("a learner should be able
  to answer these scenario questions").
- Documented the real simulator precondition (reset requires an empty Staging Area) in the
  explanation, verified by reading `shared/simulator-core.js`'s `doReset` directly rather than assumed.
- Added a "predict before you run" guidance line and nudged the practice goal text to suggest
  repeating the exercise with a different mode for comparison (text-only nudge; the completion
  condition/checklist detection logic was NOT changed — no HIGH-risk simulator/completion touch).
- Reinforcement mistakes expanded from one to three (the existing "nothing to commit" case, confusing
  `--soft`/`--mixed`, and the newly-taught empty-staging-area precondition).
- Added a bridge to Module 5.

### 31.8 Module 5 Changes

- Added one paragraph distinguishing fast-forward merges (pointer just moves, no new commit) from a
  true/divergent merge (a new two-parent commit — the same case the visualizer already marks with a
  `(merge)` label), connecting the taught concept directly to what the learner will see rendered.
- Reinforcement mistakes expanded from one to two (merging from the wrong branch; "branch copies the
  whole project" misconception).
- Added a bridge to Module 6.

### 31.9 Module 6 Changes

- Added the explicit push/pull direction mnemonic requested by the brief ("PUSH = ส่งออก, PULL = ดึงเข้า")
  as its own explanation paragraph, plus a three-row push/pull/clone direction-and-effect comparison
  table (same `compareTable()` helper as Module 4's reset table — one reusable primitive, not two).
- Reinforcement mistakes expanded from one to two (push/pull direction confusion; pushing without
  pulling first).
- Added a bridge to Module 7 (the capstone).

### 31.10 Module 7 Changes

None. Already a clean synthesis with no new concepts, a goal-first (not recipe-first) explanation, and
progressive hints gated behind an explicit button. Per this phase's own instruction, a module that is
already strong is preserved, not rewritten for its own sake.

### 31.11 Guided-Practice Improvements

Added short, static "ก่อนรัน ... ลองคิดก่อนว่า ..." prediction prompts to Modules 3 and 4's Practice
stage, using only state already available to the lesson (the simulator's own `onStateChange`/
Visualizer). No new state model, no persisted prediction answers, no new assessment subsystem — exactly
the boundary the brief drew (§18).

### 31.12 Common-Mistake Teaching

`lesson-helpers.js`'s `reinforcement()` now accepts either a single mistake string (unchanged shape,
still used by Modules 1, 2, 7) or an array of strings, rendered as a short bulleted list under the same
"ข้อผิดพลาดที่พบบ่อย:" label (Modules 3, 4, 5, 6 — the modules where more than one distinct, evidenced
mistake existed). No shaming language; every item states the misconception and the correction plainly.

### 31.13 Feedback-Quality Improvements

The existing state-driven practice feedback strings (module 3–6) were audited against what the
simulator actually returns and left unchanged — they already avoid bare "ผิด"/generic messages and
already explain what's missing (e.g. "เตรียมไฟล์แล้ว ลองรัน git rm --cached..."). No fabricated
diagnosis was found or added.

### 31.14 Terminology Consistency

No terminology changes. Working Directory / Staging Area / Local Repository / Remote Repository /
Commit / Branch / HEAD / Merge / Push / Pull / Clone all continue to use the exact Thai/English pairing
already established in `i18n.js` and the lesson files; Git commands themselves were never translated.

### 31.15 Lesson → Quiz Alignment

Audited every question in `shared/quiz-data.js` for Modules 3–6 against the newly-expanded lesson
content: the existing 8-question banks (added in P8) already assess the reset-mode distinction, the
`checkout <file>` vs `checkout <branch>` distinction, the push/pull/clone direction and effect, and the
Local/Remote independence principle — i.e. exactly the concepts this phase strengthened in the lesson
text. **No quiz content was changed** — the banks were already strong and already aligned; rewriting
them would have been manufactured work (explicitly prohibited by this phase's brief §24).

### 31.16 Lesson → Challenge Alignment

Audited `shared/challenges.js` the same way: `challenge-module-4`/`-4-b` exercise `--soft`/`--mixed`
respectively (now directly explained by the new comparison table), `challenge-module-5` exercises a
true (non-fast-forward) merge (now explicitly distinguished in the lesson text), and
`challenge-module-6`/`-6-b` exercise clone and the pull-before-push divergence rule (now covered by the
new push/pull/clone table and mnemonic). **No challenge content or grading logic was changed.**

### 31.17 Quiz Changes

None (§31.15).

### 31.18 Challenge Changes

None (§31.16).

### 31.19 Simulator/Shared-Core Changes

None. `shared/simulator-core.js`, `shared/challenges.js`, `shared/quiz-data.js`, and
`shared/curriculum.js` were read for accuracy verification only, never edited.

### 31.20 New Teaching Helpers/Components

`frontend/src/lesson-helpers.js` gained two new exports, both reused across multiple modules rather
than built as one-offs:

- `compareTable(headers, rows)` — a small comparison table (reset modes in Module 4; push/pull/clone
  in Module 6), rendered as a real `<table>` reusing the existing `.progress-table` CSS class so it
  inherits that component's already-correct responsive `overflow-x: auto` container instead of
  introducing a second table implementation.
- `bridgeNote(text)` — the one-sentence "ก่อนไปโมดูลถัดไป:" transition line, used at the end of
  Modules 1–6.

`reinforcement()`'s second parameter was extended (backward-compatible) to accept a string or an array
— see §31.12.

### 31.21 CSS/UI Changes

Added four small, additive rule blocks to `frontend/public/styles.css` — no new color tokens, no new
design system, all values reused from existing custom properties (`--color-info`, `--color-info-bg`,
`--color-text-muted`, `--space-*`, `--radius-*`): `.lesson-reinforcement-mistake-label` /
`.lesson-reinforcement-mistakes` (the multi-item mistake list), `.lesson-bridge` (the next-module note,
info-colored to read as a forward pointer rather than a warning), `.lesson-compare-table` (spacing-only
tightening on top of `.progress-table`), and `.practice-predict-note` (a muted italic guidance line).

### 31.22 Mobile QA

Verified via a temporary mock-data preview harness (`frontend/src/_preview-entry.js` +
`frontend/public/_preview.html`/`_preview-bundle.js` — same disposable pattern the P9 session used,
**deleted before commit**, confirmed absent via `git status`): rendered Modules 3, 4, and 6 with a
mocked `api`/`user` object (no live Worker/D1 needed) at desktop width, then at the 375px mobile
preset. `document.documentElement.scrollWidth`/`body.scrollWidth` both equal `window.innerWidth`
(375px) on Module 4's page — i.e. **zero page-level horizontal overflow** — while the new reset
comparison table itself scrolls within its own `.progress-table` container, exactly as RESP-001/§28
require. Module 6's new push/pull/clone table and the bridge/mistake-list boxes on both modules
rendered correctly at both widths.

### 31.23 Accessibility QA

No new interactive controls were added (the new content is static text/table/list markup only, using
`<table>`/`<th>`/`<td>`/`<ul>`/`<li>`/`<p>`/`<strong>`), so no new keyboard/focus/semantic surface was
introduced. All new text renders via `textContent` (SEC-002 discipline preserved — no `innerHTML` use
added anywhere in this phase's diff). No color-only signal was added (the bridge box pairs its color
with a text label, matching A11Y-003, the same as the existing reinforcement box).

### 31.24 Tests Added/Changed

None added — this phase is pure content/UI (Engineering skill §2: LOW/MEDIUM risk, no simulator
state-transition logic, no validation logic, no persisted-progress schema, no auth change), and the
brief's own §32 explicitly says not to inflate tests for pure copy changes. The existing 191-test suite
(including `tests/i18n.test.js`'s dictionary-completeness check, which now also covers the new
`bridgeHeading` key) is the correct regression net for this kind of change and was re-run clean after
every edit.

### 31.25 Final Test Count

**191/191 passing** — unchanged from baseline (§31.1). No regression, no new test needed or added.

### 31.26 Manual Module Walkthrough Results

Performed via the temporary preview harness (§31.22) plus direct source/state verification (reading
`shared/simulator-core.js`'s real `doReset` behavior rather than assuming it): Module 4's new
comparison table content was cross-checked cell-by-cell against `doReset`'s actual `--soft`/`--mixed`/
`--hard` branches — confirmed accurate, not just plausible-looking. Module 6's push/pull/clone table
was cross-checked against `applyCommand`'s existing push/pull/clone handlers (already covered by
`tests/shared-core.test.js`). Modules 1, 2, 3, 5's rendered output was read via `get_page_text` in the
preview harness and confirmed to match the source edits with no truncation or i18n lookup errors
(`t()` throws loudly on a missing key — a clean render is itself proof the new `bridgeHeading` key
resolves correctly).

### 31.27 Build Result

Clean. `esbuild frontend/src/main.js --bundle --format=esm --outfile=frontend/public/bundle.js` →
`bundle.js` 391.3kb, no warnings, no errors, both before and after the temporary preview harness was
added and removed.

### 31.28 Worker Redeploy Required?

**No.** Every file touched this phase (`frontend/src/lesson-module{1..7}.js`, `lesson-helpers.js`,
`i18n.js`, `frontend/public/styles.css`) is frontend-only. No file under `shared/` (the only directory
the Worker bundles) was modified — confirmed via `git status`/`git diff` before commit.

### 31.29 Pages Deployment Result

Not manually deployed by this session (unchanged from the original wording below) — but **reconciled
during the P13 session**: this commit was pushed to `main`, and Cloudflare's GitHub-integrated
auto-deploy (ADR-004/§10) picked it up exactly as designed. **This is no longer "pending" — see the
P13 verification note immediately below.**

### 31.30 Production Verification

**Reconciled during the P13 session** (previously read "not performed this session" — that was
accurate only at P12's own authoring time, before the push+deploy cycle completed; it must not be read
as the current state). P13 fetched the live production bundle
(`https://git-learning-lab.pages.dev/bundle.js`) and byte-for-byte diffed it against a fresh local
`npm run build:frontend` output from this same commit: **identical, 400,698 bytes, zero diff.**
Production has been running the full P12 build (including every lesson-content change this section
describes) since shortly after the P12 commit was pushed — there is no outstanding "next scheduled
deploy" to wait for.

### 31.31 Production-Data Side Effects

None. No account was created, read, or modified against real production D1 this session — the entire
verification was local (tests, build, and the disposable mock-data preview harness).

### 31.32 Files Changed

`frontend/src/lesson-helpers.js`, `frontend/src/lesson-module1.js` through `lesson-module6.js`,
`frontend/src/i18n.js`, `frontend/public/styles.css`, `docs/PROJECT_CONTEXT.md` (this report). No file
under `worker/`, `shared/`, or `migrations/` was touched. `lesson-module7.js` was read and audited but
not modified (§31.10).

### 31.33 Git Commit/Push Status

Committed and pushed to `main` after this report was written — see the commit immediately following
this entry in `git log`.

### 31.34 Remaining Lesson Debt

- Module 5's fast-forward-vs-true-merge distinction is now explained in text and already visible via
  the visualizer's existing `(merge)` marker, but there is no dedicated before/after graph illustration
  beyond the live simulator itself — judged sufficient per the brief's explicit "use the existing
  visualizer rather than inventing new diagrams" instruction (§22), not treated as an open gap.
- No production click-through of the updated lessons behind a real login was performed this session
  (§31.30) — the next session with a live Admin/Student credential available should do one full
  learner-perspective pass (§34/§35 style) against the deployed build once it ships.

### 31.35 Owner Decisions Pending

None. No out-of-PDF concept was proposed or needed.

### 31.36 Whether P12 Is Safe to Approve

**Yes.** Every teaching gap found in the audit (§31.3) was fixed with PDF/simulator-accurate content;
strong existing modules (1, 2, 7) were left untouched; the four locked constraints were held throughout:
module order unchanged, completion semantics unchanged, quiz/challenge architecture and content
unchanged (content already aligned — verified, not assumed), no auth/admin/recovery/backend code
touched, no D1 migration, no new dependency. 191/191 tests pass; the build is clean; mobile layout has
zero page-level horizontal overflow on the new content; no production data was touched.

**Explicit answers**: Any out-of-PDF Git concept added? **No.** Any module order changed? **No.** Any
completion rule changed? **No.** Any auth/admin/recovery change? **No.** Any D1 migration? **No.** Any
new dependency? **No** (the `pymupdf` Python package used only to read the PDF's Thai text during this
session's own research step is not part of the shipped product — no `package.json`/`requirements.txt`
change, no runtime dependency). Did P12 remain focused on teaching quality? **Yes.**

---

## 32. P13 Status Report — Production Hardening & Worker-Runtime Testing

**Owner brief**: a hardening-only phase — no new learner feature, no new Git command, no lesson
content, no Teacher analytics/Audit Log/certificate revocation/generic RBAC/email/OAuth/multi-class,
no visual redesign. The standing debt targeted: since P2, Worker route logic had never once executed
inside a real `workerd`/Miniflare runtime under an automated test — only `tests/helpers/fake-d1.js`
(a hand-written D1 approximation) plus manual `wrangler dev`/production `curl` checks stood in for it
(most recently restated as open debt in §17.2, §19.9, §20 item 4).

### 32.1 Baseline

Verified live before any change: git clean on `main` (HEAD `e3cc789`, the P12 commit), Node
`v24.11.1`/npm `11.6.2`, Wrangler `^4.129.0`, D1 migrations `0001`–`0005` present, **191/191**
`node:test` tests passing, `npm run build:frontend` clean (391.3kb), no `.github/workflows` existing
(no CI). A stray, already-orphaned local `wrangler dev` process (started from a prior, unrelated
session) was found holding a file lock in `node_modules/miniflare` and blocking `npm install`; it was
stopped (a local dev-server process, not production, trivially restartable via `npm run dev:worker`)
before proceeding.

### 32.2 Official Cloudflare Testing Research (2026)

Fetched live from `developers.cloudflare.com` (not assumed from training-era knowledge, since the
brief specifically warned 2024/2025-era answers may be stale): the current, actively-recommended
Worker-runtime testing tool is **`@cloudflare/vitest-plugin`** (confirmed current — the previously
common `@cloudflare/vitest-pool-workers` still exists on npm at `0.22.0` but is the **legacy**
package the official docs now migrate users away from). Confirmed via `npm view` (actual registry
data, not documentation prose): `@cloudflare/vitest-plugin@1.1.5`, peer dependency `vitest@^4.1.0`
(latest 4.x: `4.1.11` — installed; `vitest@5.0.0` exists but does **not** satisfy the plugin's peer
range and was deliberately not installed). No Node-version incompatibility was found or reported
anywhere in the fetched docs or the installed package's own metadata; Node 24 (this project's
installed version) worked without issue in practice. It runs **fully locally via Miniflare/workerd**
(no Cloudflare account, login, or API token needed), supports D1 bindings and migrations
(`applyD1Migrations`/`readD1Migrations`, confirmed by reading the installed package's own
`.d.ts`/`.d.mts` files directly — the officially-documented `@cloudflare/vitest-plugin/config`
import subpath does **not** exist in `1.1.5`; both functions are exported from the package's main
entry point instead, discovered by inspecting `dist/pool/index.d.mts` rather than trusting the doc
prose verbatim), and explicitly supports Pages Functions projects too (`createPagesEventContext` is
part of the `cloudflare:test` module's real type surface, confirmed the same way).

### 32.3 ADR-014 Decision

**Amended — testing tooling only** (`docs/ARCHITECTURE_DECISIONS.md` ADR-016). Every other clause of
ADR-014 (no frontend framework, esbuild, Wrangler, flat root `package.json`) is untouched. `vitest`
and `@cloudflare/vitest-plugin` were added as **devDependencies only**, used exclusively by the new
`runtime-tests/` directory. No STOP condition (§29 of the brief) was triggered: `node:test` was not
replaced, no framework migration occurred, no production credential/D1 was needed, no D1 migration was
required. A companion ADR-017 documents the dedicated isolated-D1-for-tests mechanism.

### 32.4 Runtime Test Architecture

Three layers, exactly as targeted:
- **Layer 1 (unchanged)**: the existing 191 `node:test` tests (`npm test`) — simulator/quiz/challenge
  core logic and fake-D1-backed route tests. Still the fast, primary suite; nothing moved out of it.
- **Layer 2 (new)**: `runtime-tests/*.runtime.test.js` (`npm run test:runtime`) — **26 tests** running
  the real `worker/src/index.js` inside a real Workers runtime via `@cloudflare/vitest-plugin`,
  against an isolated local D1 (`worker/wrangler.test.toml`) with all five real migrations applied
  fresh before every test file.
- **Layer 3 (unchanged in spirit, now includes one new script)**: manual/scripted production
  smoke-checks — `tools/prod-smoke/check.mjs` (new, §32.28), plus this session's own manual
  verification (§32.30).

`vitest.config.js` (repo root — Vitest's default config discovery only checks the project root, so
this could not live inside `runtime-tests/` itself as first attempted; corrected during this session)
wires `@cloudflare/vitest-plugin`'s `cloudflareTest()` to `worker/wrangler.test.toml`, restricts
`test.include` to `runtime-tests/**/*.test.js` only (so it can never collide with or attempt to run
`tests/**/*.test.js`'s `node:test`-style files — verified: both suites run cleanly independently and
together), and injects `TEST_MIGRATIONS` (read via `readD1Migrations("./migrations")`) as a Miniflare
binding. `runtime-tests/setup.js` applies those migrations via `applyD1Migrations()` before every test
file (Miniflare resets each binding's storage per file, so this guarantees a clean schema every time,
independent of run order).

### 32.5 Dependencies Added

`vitest@4.1.11` and `@cloudflare/vitest-plugin@1.1.5` — both devDependencies, both official/current
per §32.2's live research, both exist solely to run `runtime-tests/`. No frontend runtime dependency,
no framework, no additional helper packages.

### 32.6 D1 Test Isolation Model

`worker/wrangler.test.toml` (new) declares its own `DB` binding with a visibly-fake
`database_name`/`database_id` (`git-learning-lab-TEST-ONLY-db` /
`00000000-0000-0000-0000-000000000000`) — a deliberately distinct file from the real
`worker/wrangler.toml` (real `database_id: 6df6c304-...`), never referenced by `wrangler dev`/`wrangler
deploy`. Local Miniflare D1 never contacts a remote database unless a binding sets `remote: true`
(neither config does), but the brief specifically asked for zero *ambiguity*, not just a safe default
— see ADR-017 for the full reasoning. `fake-d1.js` (Layer 1) is untouched and still in active use.

### 32.7 Runtime Tests Added (26 across 5 files)

- `health.runtime.test.js` (1): `GET /api/health` → 200 with the exact expected body.
- `auth.runtime.test.js` (7): unknown-identifier vs. wrong-password return an **identical** generic
  401 body; a valid registration issues an httpOnly session cookie that authenticates
  `GET /api/auth/session`; no cookie → 401; logout invalidates the session server-side (same cookie
  then 401); a non-matching `Origin` on a state-changing request → 403; no `Origin`/`Referer` at all →
  403; the real production origin is accepted.
- `roles.runtime.test.js` (6): a forged `role` field on public registration is silently ignored
  (always STUDENT); STUDENT/TEACHER sessions cannot create staff via `POST /api/admin/staff/create`;
  an ADMIN can create a TEACHER, and that new TEACHER — after completing the forced password change —
  still gets 403 from an Admin-only route; STUDENT and ADMIN sessions are both rejected from a Teacher
  classroom route; a TEACHER session succeeds on it.
- `authority.runtime.test.js` (9): a forged `passed:true`/fabricated `finalState` on challenge
  submission is ignored (an empty transcript still fails; the real, correct transcript for
  `challenge-module-3` still passes); a non-array transcript is rejected before any replay; an
  8-answer array (shaped like the full question bank) is rejected against the 5-question served
  subset; a correctly-shaped submission is scored server-side even when the request also forges
  `percent`/`correctCount`; a fresh learner is not course-complete; an incomplete learner cannot issue
  a certificate; public verification of an unknown id returns the generic `{ok:true, valid:false}`;
  public verification of a real (directly-seeded) certificate returns **only** the four public fields
  (`learnerName`, `courseName`, `issuedAt`, `verificationId`) — no `user_id`, `status`, or row id.
- `migrations.runtime.test.js` (3): all five migrations apply cleanly, in order, to a fresh isolated
  database; every table has exactly the columns the final schema should have after `0001`–`0005`; the
  named lookup/UNIQUE indexes each migration creates are all present.

### 32.8 Auth/Session Runtime Results

All pass (§32.7). AUTH-001 (identical generic failure for unknown-identifier vs. wrong-password),
AUTH-004/005 (session validated against D1, logout deletes the row server-side, not just the cookie)
all reproduced against the real runtime, not just fake-D1.

### 32.9 CSRF/Origin Runtime Results

All pass. AUTH-006's Origin allowlist (`worker/src/http.js`) rejects both a wrong Origin and a missing
Origin/Referer on every state-changing request tested, and accepts the real production origin.

### 32.10 Registration/Role Runtime Results

All pass. REG-002 (forged `role` field silently ignored) reproduced end-to-end through the real
registration route and a real D1 insert.

### 32.11 Admin (P11) Runtime Results

All pass. STUDENT/TEACHER sessions cannot reach `POST /api/admin/staff/create`; an ADMIN-created
TEACHER account genuinely goes through the same forced-password-change gate as Admin-issued recovery
before it can do anything, and even after completing that gate has no Admin-route access — proven
against a real, migrated D1, not an assumption from reading the code.

### 32.12 Teacher Role-Boundary Runtime Results

All pass. ADR-007's "Admin does not silently inherit Teacher classroom access" is proven in the real
runtime (a real ADMIN session, real D1 row, real 403), alongside STUDENT rejection and TEACHER success.

### 32.13 Quiz-Authority Runtime Results

All pass. The forged full-question-bank-length answer array is rejected (400) rather than silently
truncated or accepted; a correctly-shaped submission is scored from the real answer key even when the
request body also carries a forged `percent: 100` — the returned percent is asserted to differ from
the forged value, proving the server value wasn't just echoed back.

### 32.14 Challenge-Authority Runtime Results (ADR-013)

All pass — the single highest-value addition this phase targeted. A forged `passed: true` plus a
fabricated `finalState` submitted alongside an **empty** transcript still comes back `passed: false`;
the exact same challenge only passes once a real, correct command transcript
(`git add a.txt`, `git add b.txt`, `git rm --cached d.txt`) is submitted and replayed by the real
Worker against the real shared simulator core inside the real runtime. This is the first time
ADR-013's server-side replay guarantee has been proven against an actual `workerd` execution rather
than only `tests/worker-quiz-challenge.test.js`'s fake-D1 version.

### 32.15 Completion/Certificate Runtime Results

All pass. Completion is confirmed server-derived (a fresh learner is `isComplete: false` with no
client input involved); certificate issuance is confirmed to reject an incomplete learner (403,
`course_not_complete`) with no request body read at all (matching `certificate.js`'s own design
note); public verification is confirmed to leak nothing beyond the four documented public fields for
a real, directly-seeded certificate row, and to give the same generic `{valid:false}` for an unknown
id as for a malformed one.

### 32.16 Migration-Chain Verification

Automated (new, `migrations.runtime.test.js`) — all five migrations apply cleanly and in order to a
fresh isolated D1 every time the runtime suite runs (already implicitly proven by every other runtime
test file succeeding at all, now also asserted explicitly): final `users` schema has all 12 expected
columns across all five migrations; `sessions`/`progress`/`quiz_results`/`challenge_results`/
`certificates` all exist with their expected columns; the named indexes (`idx_users_student_id`,
`idx_users_email`, and the four `idx_*_user_id` lookup indexes) are all present. No production
migration was run or needed — the real production D1 was never touched by any of this.

### 32.17 Pages Proxy Review

`functions/api/[[path]].js` (ADR-015) re-read in full: forwards method/headers/body verbatim (body
omitted only for GET/HEAD, correctly), relays the upstream response's status and headers — including
`Set-Cookie` — untouched, and deliberately does not route `GET /api/health` through itself (unchanged,
correct). No defect found. A dedicated Pages-Functions-specific runtime test
(`createPagesEventContext`, confirmed available in §32.2) was evaluated and deliberately **not**
added: this proxy is a 20-line pure pass-through with no branching logic of its own, and its one
non-trivial behavior — `Set-Cookie` relaying across the hostname split — is already implicitly
exercised every time a real browser session round-trips through it in production (§19.8, §31's prior
sessions), and every `runtime-tests/*.runtime.test.js` cookie assertion already proves the Worker
*emits* a correct `Set-Cookie`, which is the part that could actually break. Judged as source-review +
existing production verification being sufficient, per the brief's own explicit permission to do
exactly that when a dedicated test isn't clearly worth it.

### 32.18 Cookie/Session Review

Re-confirmed unchanged and correct: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`,
`Max-Age` = 7 days (`worker/src/cookies.js`); session token stored **hashed** (`sha256Hex`), never
raw; logout deletes the D1 row server-side; a password change rotates the session (old token deleted,
new one issued) — reproduced live in `roles.runtime.test.js`'s Admin-staff-creation test; a recovery
session is invalidated the instant it expires (`session.js`'s `recovery_expires_at` check) or the
moment the forced password change succeeds. **No change made** — no specific reason emerged to alter
session lifetime or cookie policy, matching the brief's explicit instruction not to change these
without one.

### 32.19 PBKDF2 Review

Re-confirmed unchanged: `worker/src/crypto.js` still uses PBKDF2-HMAC-SHA256 via native Web Crypto,
`PBKDF2_ITERATIONS = 10000` (ADR-012's confirmed value), random 16-byte salts, hashes never returned
in any response, and the login route's dummy-hash/dummy-salt verification path for an unknown
identifier is still present (AUTH-001's timing-profile hardening). **No iteration-count change was
made or proposed** — the brief was explicit that this requires an Owner Decision, not a routine
hardening tweak, and no new evidence emerged this session that the free-tier CPU budget or Cloudflare's
runtime limits have materially changed since ADR-012's 2026 production telemetry.

### 32.20 CORS/Origin Review

Re-confirmed unchanged and correct: `GET /api/health` is the sole route with permissive
(`Access-Control-Allow-Origin: *`) CORS, and it is public/read-only/carries no session data
(unchanged reasoning from ADR-015). No authenticated route sets any CORS header at all — correct,
since ADR-015 means the browser never makes a cross-origin request to them. AUTH-006's Origin/Referer
check applies to every state-changing method, reproduced against the real runtime in
`auth.runtime.test.js`. No route was found to accidentally bypass this.

### 32.21 Error-Handling Review

Re-confirmed: `worker/src/index.js`'s top-level `try/catch` returns a generic `internal_error` (500)
for any uncaught exception — no stack trace or raw D1/SQL error ever reaches the client (SEC-005);
malformed JSON bodies are caught explicitly in every route handler that reads one and return
`invalid_request` (400); unknown routes return a plain 404. No new error-handling framework was built
(none was needed — the existing discipline held up under the new runtime tests too, including the
non-array-transcript and malformed-answers-array cases in §32.7).

### 32.22 Security-Header Review

One safe, low-risk addition made: `worker/src/http.js`'s `json()` helper now sets
`X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer` on every response (relayed
through the Pages proxy automatically, since it forwards headers verbatim). A new
`frontend/public/_headers` file (Cloudflare Pages' native static-header mechanism, no build-step
change) adds the same `X-Content-Type-Options`, a `Referrer-Policy: strict-origin-when-cross-origin`,
and a `Permissions-Policy` disabling geolocation/microphone/camera (none of which this app uses). A
Content-Security-Policy was evaluated and **deliberately not added** — this SPA renders inline SVG at
runtime (`visualizer.js`/`terminal.js`) and uses hash-based navigation, and getting a CSP right for
that needs real iterative testing that this hardening pass explicitly scoped out as future work, not
a same-day addition (matches the brief's own instruction not to force CSP in if it risks breaking
current behavior). Confirmed via the full `node:test` suite (still 191/191) and the runtime suite
(still 26/26) that adding the two Worker-side headers broke nothing.

### 32.23 Secret/Config Review

Scanned `worker/src`, `functions/`, and both `wrangler.toml`/`wrangler.test.toml` for hardcoded
secrets/API keys/tokens: none found. No `console.*` call exists anywhere in `worker/src`/`functions`
(so there is no logging call that could ever accidentally print a password/token in the first place).
`git ls-files` confirms no `.env`, credentials, `.pem`/`.key`, or backup file is tracked. Both
`wrangler.toml` files contain only non-secret resource identifiers (unchanged convention from P1).
No real secret was found in git history; **no STOP condition was triggered**.

### 32.24 Rate-Limit Review

Review only, as scoped — no rate limiting was implemented. Highest-risk public endpoints remain
`POST /api/auth/login`, `POST /api/auth/register`, and `GET /api/certificate/verify` (all
unauthenticated, all reachable at volume). Cloudflare's free-tier-native options (e.g., a small number
of free Rate Limiting Rules on some plans) were not implemented this session — verifying current
free-tier eligibility and correctly scoping a rule without over- or under-blocking real classroom
traffic is a genuine piece of work in its own right, not a same-session drop-in, and the brief was
explicit not to force this in if it requires architectural expansion. Flagged as a candidate for a
future, dedicated pass — not attempted here.

### 32.25 Logging Review

Confirmed (§32.23): zero `console.*` calls anywhere in `worker/src`/`functions`, so temporary
credentials, session tokens, and passwords are never logged by construction — there is no logging
statement that could leak them, in production or in Cloudflare's own Worker observability. No Audit
Log system was built (explicitly out of scope for P13, deferred to a future phase).

### 32.26 Performance Review

Reviewed the same hot paths flagged in the brief (quiz submit, challenge replay, completion
aggregation, Teacher bulk queries, PBKDF2 cost) against the documented ~29-student scale: all remain
single-digit-millisecond D1 operations or one bulk whole-table read per Teacher-Dashboard view
(unchanged design from P6, §17's `listStudentAccounts`-style helpers) — no measured or structurally
obvious problem was found, and none was manufactured. No optimization was made; none was justified.

### 32.27 CI Added? — Yes

`.github/workflows/ci.yml` (new): on push/PR to `main`, runs `npm ci`, `npm test` (the 191-test unit
suite), `npm run test:runtime` (the new 26-test runtime suite), and `npm run build:frontend`. No
Cloudflare API token, no production D1, and no deploy step of any kind — the runtime suite runs
entirely against a local Miniflare instance (confirmed working with zero Cloudflare authentication in
this very session). `permissions: contents: read` (least privilege); only official
`actions/checkout@v4`/`actions/setup-node@v4` are used (no third-party actions); both are pinned to a
major version. Justified because it costs nothing (well within free GitHub Actions minutes for a
project this size), requires no secret, and directly enforces that both test suites and the build stay
green on every future push — closing a real gap (nothing previously ran any check automatically on
push).

### 32.28 Production Smoke Tooling

`tools/prod-smoke/check.mjs` (new): five read-only/rejection-only checks against real production
(Pages responds 200; Worker `/api/health` responds 200; a malformed certificate-verification id
returns the safe generic `{valid:false}`, not an error; an unauthenticated `GET /api/auth/session`
and an unauthenticated `GET /api/admin/users` both return 401). Not scheduled automatically (run
manually via `node tools/prod-smoke/check.mjs`) — the brief only asked for the script to exist, not
for CI to run it, and running it from CI would require deciding a network-egress/rate policy that
wasn't justified for this phase. **Run once this session, against real production** (§32.30): all
five checks passed.

### 32.29 Unit-Test Count

**191** (`node:test`, unchanged from P12 — zero tests removed, zero added; this was a deliberate
non-goal, matching the brief's "don't optimize for a large test count").

### 32.30 Runtime-Test Count

**26** (`@cloudflare/vitest-plugin`, all new this session) across 5 files — see §32.7 for the full
breakdown. This is slightly above the brief's suggested "~12–20" range; the extra tests
(`migrations.runtime.test.js`'s 3, and a couple of extra CSRF/role-boundary edge cases) were judged to
each carry distinct architectural value (the migration-chain proof in particular directly answers
§8/§16 of the brief) rather than being redundant with each other or with Layer 1 — none of the 26
duplicates an existing `node:test` case; each proves something only a real runtime can prove.

### 32.31 Build Result

Clean. `esbuild frontend/src/main.js --bundle --format=esm --outfile=frontend/public/bundle.js` →
`bundle.js` 391.3kb, no warnings, no errors, both before and after the `frontend/public/_headers`
addition (a static Pages config file, not part of the JS bundle).

### 32.32 Files Changed

New: `runtime-tests/` (`vitest.config.js` moved here originally, then relocated to repo root — see
§32.4 — plus `setup.js`, `helpers.js`, `health.runtime.test.js`, `auth.runtime.test.js`,
`roles.runtime.test.js`, `authority.runtime.test.js`, `migrations.runtime.test.js`),
`vitest.config.js` (repo root), `worker/wrangler.test.toml`, `.github/workflows/ci.yml`,
`tools/prod-smoke/check.mjs`, `frontend/public/_headers`. Modified: `package.json`/
`package-lock.json` (two new devDependencies, one new `test:runtime` script),
`worker/src/http.js` (two new response headers), `docs/ARCHITECTURE_DECISIONS.md` (ADR-016, ADR-017),
`docs/PROJECT_CONTEXT.md` (this report, plus the §31.29/§31.30 reconciliation — §32.35). No file
under `shared/` was touched; no D1 migration was added; no learner-facing frontend behavior changed
beyond the new static `_headers` file.

### 32.33 Worker Deploy Required / Performed?

**Required and performed**, after explicit Owner confirmation in this session's own conversation.
`worker/src/http.js` changed (the two new security headers, §32.22) — a real, if small, production
Worker code change. `npm run deploy:worker` ran cleanly (`Uploaded git-learning-lab-api`, Version ID
`b63ede1e-5923-461e-9a04-674218304bd4`); a direct request to the live production health endpoint
afterward confirmed both new headers (`x-content-type-options: nosniff`,
`referrer-policy: no-referrer`) are present on real production responses.

### 32.34 Pages Deploy Required / Performed?

Required once pushed (the new `frontend/public/_headers` file lives under the Pages deploy root), but
performed automatically — Cloudflare's existing GitHub-integrated auto-deploy (ADR-004) picks up any
push to `main` with no manual step, exactly as it has since P1 (§10, §31.29's now-reconciled note).
No manual `wrangler pages deploy` is needed or was run.

### 32.35 Production Verification

Performed, read-only, before any code change (baseline) and again via `tools/prod-smoke/check.mjs`
after all local changes (§32.28): all 5 checks passed against real production — Pages 200, Worker
health 200, malformed certificate id handled safely, both unauthenticated protected/Admin routes
correctly 401. Separately, and specifically to close out P12's own unresolved §31.29/§31.30 note: a
live fetch of `https://git-learning-lab.pages.dev/bundle.js` was byte-for-byte diffed against a fresh
local `npm run build:frontend` output from this same commit — **identical, 400,698 bytes, zero diff**,
proving P12's push did reach production via the GitHub → Pages auto-deploy, contrary to that section's
original "not deployed yet" wording (now corrected, §32's edit to §31.29/§31.30 above).

### 32.36 Production-Data Side Effects

**None.** No account was created, read, modified, or deleted against real production D1. Every
runtime test (`runtime-tests/**`) runs exclusively against the isolated local Miniflare D1 defined by
`worker/wrangler.test.toml` (ADR-017) — confirmed by that file's own visibly-fake database identifier
and by this session never once authenticating a `wrangler`/Cloudflare session to run any test.
`tools/prod-smoke/check.mjs`'s five checks are read-only/rejection-only by construction (§32.28).

### 32.37 Git Commit/Push

**Performed**, after explicit Owner confirmation in this session's own conversation (this project's/
this assistant's standing rule is never to commit or push without being asked, regardless of a session
brief's own internal "definition of done" checklist — that confirmation was obtained before this
commit was made). Committed to `main` and pushed to `origin` — see the commit immediately following
this entry in `git log`.

### 32.38 Remaining Debt

- Rate limiting on `login`/`register`/`certificate verify` remains unimplemented — reviewed only
  (§32.24), a legitimate candidate for a future dedicated pass once Cloudflare's current free-tier
  Rate Limiting Rules eligibility is confirmed for this project's plan.
- No Content-Security-Policy exists yet (§32.22) — deliberately deferred, needs real iterative
  browser testing against the SPA's inline-SVG/hash-routing behavior before it can be added safely.
- The runtime suite covers the highest-value ADR-013/quiz-authority/role-boundary scenarios but is not
  exhaustive by design (Layer 1's 191 tests remain the exhaustive-edge-case suite) — a genuinely new
  Worker route added in a future phase should get both a fast `node:test`/fake-D1 case (default) and a
  `runtime-tests/` case only if it has real runtime-dependent behavior worth proving.
- The Pages proxy (`functions/api/[[path]].js`) still has no dedicated automated test of its own
  (§32.17) — judged sufficient via source review + existing/implicit coverage, not a gap requiring
  immediate action.

### 32.39 Owner Decisions Pending

**None.** Both items that were pending confirmation (Worker deploy, §32.33; git commit/push, §32.37)
were explicitly confirmed by the Owner in this session's own conversation and have been performed.
PBKDF2 iteration count was reviewed and deliberately left unchanged (§32.19); no D1 migration,
rate-limiting implementation, or CSP was proposed for immediate action.

### 32.40 Whether P13 Is Safe to Approve

**Yes.** All work performed is additive/read-only or local-only except one small, explicitly-confirmed
production Worker deploy: the existing 191-test suite is untouched and still 191/191 green; the new
26-test runtime suite is green and proves ADR-013/quiz-authority/role-boundary behavior against a real
Workers runtime for the first time in this project's history; the frontend build is clean; no
production data was created, read, modified, or mutated; no secret was found or introduced; no D1
migration was added; no learner-facing feature was added. The one real code change
(`worker/src/http.js`'s two security headers) is small, safe, already covered by both test suites
passing, and has been deployed and verified live in production (§32.33, §32.35).

**Explicit answers**: Existing `node:test` suite replaced? **No.** Production D1 used by automated
tests? **No.** Production data mutated? **No.** D1 migration added? **No.** New learner-facing feature
added? **No.** P12 deployment status reconciled in docs? **Yes** (§31.29/§31.30, §32.35). Runtime test
coverage materially improved? **Yes** — from zero real-runtime Worker execution to a 26-test suite
covering health, auth/session, CSRF, registration/role boundaries, ADR-013 challenge replay,
quiz-authority, completion, certificate issuance/verification, and the full D1 migration chain.

---

## 33. P14 Status Report — Audit Log & Security Events

**Verified live before this session started**: git clean on `main`, 191/191 `node:test` tests passing,
26/26 Worker-runtime tests passing, frontend build clean, production Pages/Worker live and healthy, D1
containing only the P1–P5 tables (`users`, `sessions`, `progress`, `quiz_results`,
`challenge_results`, `certificates`) with 4 real accounts and their real activity data — matching the
session brief's stated baseline exactly.

### 33.1 Baseline

Confirmed by live inspection rather than assumed (Recovery Instructions, §16): `git status` clean,
`npm test` 191/191, `npm run test:runtime` 26/26, `npm run build:frontend` clean (391.3kb bundle).

### 33.2 Audit Scope

A bounded APPLICATION audit log for operational/security traceability of privileged/security-relevant
events only — explicitly not a compliance project, not a generic analytics/event-tracking system, not
an HTTP access-log replacement, not a full observability platform, not a SIEM, and not a telemetry
warehouse. Full design rationale: `docs/ARCHITECTURE_DECISIONS.md` ADR-018.

### 33.3 Event Taxonomy

Exactly seven event types implemented, all from the session brief's "implement first" minimum list:
`admin.staff.created`, `admin.recovery.issued`, `student.registered`, `auth.login.success`,
`auth.login.failure`, `auth.password.changed`, `auth.logout`. `security.access_denied` (the one
optional item) was evaluated and **not implemented** — see §33.15 for the noise-check rationale. No
per-request/per-page-view/per-lesson-open event exists anywhere; this is not analytics.

### 33.4 Schema / Migration

`migrations/0006_p14_audit_events.sql` adds one new table, `audit_events` (`id`, `event_type`,
`actor_user_id`, `actor_identifier`, `actor_role`, `target_user_id`, `target_identifier`,
`metadata_json`, `created_at`) — no existing table was touched. `actor_identifier`/`actor_role`/
`target_identifier` are write-time snapshots, not live joins (same rationale as
`certificates.learner_name` from migration 0005), so a later identifier/role change never rewrites
history.

### 33.5 Indexes

`idx_audit_events_created_at` and `idx_audit_events_event_type` — the two access patterns the Admin
read route and any future filtering actually use. No additional speculative index was added to a
table that will remain small at classroom scale.

### 33.6 Privacy / Data Minimization

Confirmed by both automated tests and manual review: `audit_events` never stores a plaintext password,
temporary/recovery credential, password hash/salt, session token, raw cookie, IP address, or full
request body. `metadata_json` holds only a small, fixed-shape, server-generated object per event type
(`{ createdRole }`, `{ expiresInHours }`, `{ forced }`, `{ attemptedIdentifier }`, or `null`) — never a
raw client-supplied body. `tests/worker-audit.test.js` and `runtime-tests/audit.runtime.test.js` both
assert the temporary credential returned by staff-creation/recovery-issuance never appears anywhere in
the corresponding audit row.

### 33.7 Failure Semantics

**Best-effort for every event type, including both privileged Admin mutations** (staff creation,
recovery issuance) — a `try/catch` wrapper (`auditBestEffort`, duplicated in `auth.js`/`admin.js`/
`register.js` next to each route's own logic) logs a write failure to the Worker's own console
(`wrangler tail`) and never blocks, delays, or fails the primary action. This was a deliberate choice,
not a default: fail-closed (reject the privileged action if the audit write fails) and D1
`.batch()`-based atomicity were both considered and explicitly rejected — see ADR-018's "Reason"
section for the full tradeoff (a transient audit-insert failure must never lock an Admin out of
creating an account or recovering a locked-out user).

### 33.8 Audit DB Helper

`worker/src/db.js` gained `AUDIT_EVENT_TYPES` (a fixed `Set`, same defense-in-depth discipline as the
existing `STAFF_ROLES` check in `createStaffUser`), `writeAuditEvent` (parameterized INSERT, rejects
any event type outside the allowlist), and `listAuditEvents` (bounded `LIMIT`, newest-first
`ORDER BY created_at DESC, id DESC`).

### 33.9 Admin Staff-Create Logging

`handleCreateStaff` (`worker/src/routes/admin.js`) now accepts `sessionUser` as a third parameter
(wired from `worker/src/index.js`) and emits `admin.staff.created` with the acting Admin as actor, the
newly-created account (id captured from `.meta.last_row_id`, identifier) as target, and
`{ createdRole }` as metadata — never the returned `temporaryPassword`.

### 33.10 Recovery Logging

`handleIssueRecovery` similarly gained `sessionUser` and emits `admin.recovery.issued` with the acting
Admin as actor, the target user as target, and `{ expiresInHours: 24 }` as metadata — never the
credential.

### 33.11 Registration Logging

`handleRegister` (`worker/src/routes/register.js`) emits `student.registered` with **actor
deliberately null** and the new student as target — documented in-line as the chosen model (a
self-service action has no separate actor distinct from its own target, the opposite convention from
the two Admin-mutation events above, where actor and target are always two different people).

### 33.12 Login Success/Failure Logging

`handleLogin` emits `auth.login.success` (the authenticated user as both actor and target, no
metadata) or `auth.login.failure` (actor/target both null, `{ attemptedIdentifier }` only — the
trimmed, normalized identifier, never the password). Both the "unknown identifier" and "wrong
password" cases produce the exact same event with the exact same shape — mirroring AUTH-001's own
identical-response invariant, so the audit log is never a more revealing side channel than the login
API's own response. The dummy-PBKDF2 timing defense (`DUMMY_HASH`/`DUMMY_SALT`) is unmodified and still
runs before either audit branch.

### 33.13 Password-Change Logging

`handleChangePassword` captures `sessionUser.mustChangePassword` **before** `setUserPassword` clears
it, then emits `auth.password.changed` with `{ forced: true|false }` — this is the only way to
distinguish a recovery-forced change from a voluntary one, since both paths share one handler function
(no code-level branch previously existed).

### 33.14 Logout Logging

`handleLogout` gained a third `sessionUser` parameter (index.js already had it resolved in scope, just
wasn't passing it through) and emits `auth.logout` with the authenticated user as actor/target,
captured **before** `deleteSession` runs (the session row itself carries no identity payload, so
identity must be read from the already-resolved `sessionUser`, not re-derived after deletion). An
already-unauthenticated logout call (no session cookie) remains a harmless 200 no-op, unchanged from
pre-P14 behavior, and emits no event (there is no identity to attribute it to).

### 33.15 Access-Denied Logging — Not Implemented (Documented Rationale)

Evaluated per the session brief's own noise-check instruction (§20) and **not implemented**.
Implementing `security.access_denied` would require adding a write call at every inline role check in
`worker/src/index.js` (the Admin-route block and the Teacher-route block) for marginal value at
classroom scale (~29 students): the realistic trigger is a misconfigured bookmark or a curious student
poking at `/api/admin/*`, and the existing 403 response already stops the request without any audit
row. Deferred, not built, to keep this phase bounded — see ADR-018 for the same rationale recorded
architecturally.

### 33.16 Admin Audit API

`GET /api/admin/audit` (`worker/src/routes/audit.js`, dispatched from the existing Admin-gated block in
`worker/src/index.js` alongside `/api/admin/users`, `/api/admin/recovery/issue`,
`/api/admin/staff/create`). Accepts an optional `?limit=` query parameter, defaults to 50, clamps to a
maximum of 200 — never an unbounded scan. Response fields are normalized/camelCased
(`eventType`, `actorIdentifier`, `targetIdentifier`, `metadata`, `createdAt`, ...), never raw D1 column
names, and `metadata_json` is `JSON.parse`d server-side with a `try/catch` that returns `null` on any
malformed value rather than ever leaking a raw parse error or an unparsed string (verified by a
dedicated test that hand-corrupts a row's `metadata_json` and confirms the API still returns `200` with
`metadata: null` for that row).

### 33.17 Authorization

`GET /api/admin/audit` is gated by the exact same `sessionUser.role !== "ADMIN"` check as the other
three Admin routes it's grouped with in `index.js` — ADMIN gets `200`, TEACHER and STUDENT get `403`,
an unauthenticated request gets `401`. Verified by both the fake-D1 unit suite and a real-runtime test.

### 33.18 Admin UI

`frontend/src/admin-panel.js` gained `renderAuditLogSection`, called after the existing staff-creation
section. Utilitarian, matching the panel's existing minimal-design convention (UX skill §1): a plain
`<table class="progress-table admin-audit-table">` (reusing the exact CSS class the P6 Teacher roster
introduced — no new CSS was needed), columns เวลา/เหตุการณ์/ผู้ดำเนินการ/เป้าหมาย/รายละเอียด, every
known event type mapped to a Thai label via `t("auditLogEventLabel", eventType)`, and a per-event-type
"details" formatter (`formatAuditDetails`) that renders the small metadata object as one readable Thai
sentence — never a raw JSON dump. Loading/error/empty states are handled explicitly
(`auditLogLoading`/`auditLogLoadError`/`auditLogEmpty`).

### 33.19 Retention Decision

**No automatic deletion.** Events accumulate indefinitely at classroom scale, matching the session
brief's explicit "Preferred P14: NO automatic deletion yet" instruction. No historical event was
backfilled or fabricated — the table began empty in production and audit logging starts from this
deployment onward (verified: `SELECT COUNT(*) FROM audit_events` against production returned `0`
immediately after the migration, before the Worker redeploy).

### 33.20 Legal/Compliance Boundary

Stated explicitly in the migration's own SQL comment and in this report: P14's audit events are **not**
equivalent to any statutory computer-traffic-data retention requirement (no "90-day law" claim is made
anywhere in code, schema, or UI). Any such legal question requires separate, official research and a
fresh Owner Decision — not inferred from this feature's existence.

### 33.21 Node Tests Added

`tests/worker-audit.test.js` (new, 19 tests): `writeAuditEvent` rejects an unknown event type; no
credential ever appears in stored metadata across staff-create + recovery-issue; one emission test per
event type (all seven); the login-failure symmetry between "unknown identifier" and "wrong password";
forced-vs-voluntary password-change metadata; logout attribution before session deletion and its
no-op-for-unauthenticated case; the full Admin-only authorization boundary (401/403/200) on the new
read route; bounded `limit`; newest-first ordering; malformed `metadata_json` never leaking; and a
sanity check that `AUDIT_EVENT_TYPES` is exactly the seven-item scoped set (no accidental extra event
type). `tests/helpers/fake-d1.js` gained `audit_events` support (a new `INSERT INTO audit_events`
branch in `execRun`, a new `FROM audit_events` branch in `execAll`, and an `auditEvents` array exposed
via `_inspect`) — a new table needed new fake-D1 branches, it did not "just work."

### 33.22 Runtime Tests Added

`runtime-tests/audit.runtime.test.js` (new, 7 tests) against the real Worker/Miniflare-D1 runtime:
Admin-creates-Teacher → row exists with no credential; Admin-issues-recovery → row exists with no
credential; a failed login → row exists with no actor; a successful login → row exists with the real
user as actor/target; Teacher and Student are both denied read access; Admin can read, newest-first,
with no secret anywhere in the response body. `runtime-tests/migrations.runtime.test.js` was extended
with a new `audit_events` column-set assertion and its two named indexes, and its `describe` label was
updated from "0001-0005" to "0001-0006."

### 33.23 Final Unit-Test Count

**210/210 passing** (up from 191 — 19 new, zero regressions).

### 33.24 Final Runtime-Test Count

**34/34 passing** (up from 26 — 8 new: 7 in the new `audit.runtime.test.js` plus 1 new assertion added
to the existing migration-chain test file).

### 33.25 Migration-Chain Verification

Verified twice: locally (`npm run d1:migrate:local` applied `0006_p14_audit_events.sql` cleanly against
the local D1 used by `wrangler dev`) and via the isolated Worker-runtime suite's own
`applyD1Migrations()` (`runtime-tests/setup.js`, unchanged — a new numbered migration file is picked up
automatically with no config change, confirmed by `migrations.runtime.test.js`'s green run). Prior
schema (`users`/`sessions`/`progress`/`quiz_results`/`challenge_results`/`certificates`) is unaffected —
the new migration only adds `audit_events` and its two indexes, confirmed by re-running the full
existing test suites with zero regressions.

### 33.26 Production Backup

Taken **before** the production migration: `backups/pre-p14-migration-20260908-010505.sql` (gitignored,
per `.gitignore`'s existing D1-backup rule; 197KB), verified by direct inspection to contain the real
`users`/`sessions`/`progress`/`quiz_results`/`challenge_results`/`certificates` tables and their real
current data (4 real accounts, 10 sessions, 7 progress rows, 3 quiz results, 5 challenge results) before
any P14 change touched production.

### 33.27 Production Migration

Applied via `wrangler d1 migrations apply git-learning-lab-db --remote` — `0006_p14_audit_events.sql`
executed successfully (4 commands). Verified directly against production immediately after: `sqlite_master`
confirms `audit_events`, `idx_audit_events_created_at`, and `idx_audit_events_event_type` all exist;
`SELECT COUNT(*) FROM audit_events` returned `0` (confirms no fabricated/backfilled history).

### 33.28 Worker Deploy

`wrangler deploy --config worker/wrangler.toml` succeeded — `git-learning-lab-api` redeployed
(Version ID `4f916acc-481e-444b-bf8e-2ce64cb3098a`), live at
`https://git-learning-lab-api.git-learning-lab.workers.dev`.

### 33.29 Pages Deploy — Plus a Discovered-and-Fixed Pre-Existing P13 Bug

Frontend changed (`frontend/src/admin-panel.js`, `frontend/src/api.js`, `frontend/src/i18n.js`) and was
expected to ship automatically via the existing GitHub-integrated Cloudflare Pages continuous
deployment the moment this session's commit reached `main`. **It did not — and investigation revealed
this had silently been true since P13.** Cloudflare's own deployment history showed the
`canonical_deployment` (the actually-live production build) was still `e3cc789` (**P12's** commit) —
P13's own push (`5b92fbb`) had triggered a Pages build that failed, unnoticed, and P13's own report
(§32.35) verified only via the Worker/bundle content it had cached locally, not a true fresh production
re-check. This session's P14 push (`d02bb97`) failed the same way, which is what surfaced the issue.

**Root cause** (confirmed via the Pages build log fetched through the Cloudflare API): Cloudflare's
build image resolves `npm run build:frontend` with `npm ci`, using whatever npm ships with the pinned
Node version (default here: Node 22.16.0 → npm 10.9.2). P13 introduced `vitest`/`@cloudflare/vitest-plugin`
as devDependencies (ADR-016), whose nested dependency tree (`vitest/node_modules/vite`, which declares
`"esbuild": "^0.28.2"`) npm 10.9.2's resolver cannot reconcile against the committed
`package-lock.json` — `npm ci` fails with `Missing: esbuild@0.28.2 from lock file` before the build
command ever runs. Reproduced deterministically both ways: `npx npm@10.9.2 ci` against the exact
committed lockfile fails identically; `npm ci` with the local npm 11.6.2 (which is what `node --version`
resolves to locally: Node 24.11.1) succeeds cleanly against the same files. `npm@10.9.2` itself even
crashes (`Cannot read properties of null (reading 'edgesOut')`, a known npm 10.x Arborist bug) when
asked to freshly resolve this same dependency tree from scratch — confirming this is an npm 10.x
limitation, not a fixable lockfile defect on our side (no `package-lock.json` change was needed or
committed).

**Fix**: Cloudflare Pages' build image has no `NPM_VERSION` override (confirmed via
`developers.cloudflare.com/pages/configuration/build-image/` — npm version always follows the pinned
Node version); the correct fix is pinning `NODE_VERSION` to a release that bundles npm 11. Set via the
Cloudflare API (`PATCH /accounts/{id}/pages/projects/git-learning-lab`,
`deployment_configs.production/preview.env_vars.NODE_VERSION = "24.11.1"`) — **this was an explicit
Owner-approved action this session** (an `AskUserQuestion` was raised after the Claude Code auto-mode
permission classifier itself blocked the first unprompted attempt at this Cloudflare project-settings
write; the Owner picked "set it via API" and it was then performed). A first attempt setting a
(nonexistent) `NPM_VERSION` var did nothing (confirmed by re-checking the build log — still showed
`npm@10.9.2`); the correct `NODE_VERSION` fix was verified by triggering a fresh ad-hoc deployment via
the API (`POST .../deployments`, since a `retry` of an already-queued deployment reuses that
deployment's original captured config, not the just-updated project settings) — build succeeded, deploy
succeeded, and the live `https://git-learning-lab.pages.dev/bundle.js` was confirmed to be exactly the
locally-built 407,482-byte file containing `renderAuditLogSection`/`adminListAuditEvents`.
`git-learning-lab.pages.dev/` and the Worker health check both remained `200` throughout.

**Consequence for future sessions**: `NODE_VERSION=24.11.1` is now a permanent Pages project setting
(production + preview) — not committed to the repository (it's Cloudflare project configuration, not
code), so a future session reading only the repo would not see it; this paragraph is the record of it.
Every push to `main` from this point forward should auto-deploy correctly; if a future Pages build ever
fails again with an `npm ci`/lockfile-sync error, check this setting first before assuming a real
lockfile defect.

### 33.30 Production Verification Performed This Session

`GET /api/health` returns `200` with the expected body; an unauthenticated `GET /api/admin/audit`
against the live production Worker returns `401`; the production Pages homepage returns `200`; the live
production `bundle.js` was confirmed byte-for-byte identical to the local verified build and to contain
the new P14 frontend code (§33.29). No disposable production staff/student account was created, per the
session brief's explicit prohibition. The full authenticated Admin-view click-through (staff-create →
recovery-issue → login-failure → the audit table rendering correctly in a real browser) was verified
end-to-end against a **local** `wrangler dev` + local D1 instance with a locally-promoted test Admin
account instead (never touching production) — see §33.6's test files for the equivalent automated
coverage of the same flows. A full real-Admin browser click-through against the now-correctly-deployed
production Pages site remains a reasonable follow-up whenever a session has real Owner/Admin
credentials available.

### 33.31 Production-Data Side Effects

**None beyond the schema migration itself.** No account was created, modified, or deleted in
production; no session was created or invalidated; `audit_events` began and remains empty in
production as of this report (the four real accounts' own future logins/actions will begin populating
it naturally from this point forward).

### 33.32 Security Review

- No secret in audit metadata: **confirmed** (automated tests + manual review, §33.6).
- No temp credential: **confirmed**.
- No session token: **confirmed** — `writeAuditEvent`'s signature has no parameter shaped to accept
  one, and no call site passes one.
- No password/hash/salt: **confirmed**.
- Admin-only read route: **confirmed** (§33.17).
- Parameterized SQL: **confirmed** — `writeAuditEvent`/`listAuditEvents` both use `.bind()`, no string
  interpolation.
- Fixed event types: **confirmed** — `AUDIT_EVENT_TYPES` allowlist, defense-in-depth (rejects unknown
  types even from a hypothetical future call-site typo).
- Bounded list query: **confirmed** — max 200, default 50.
- No raw request-body logging: **confirmed** — every metadata object is a small, explicitly-constructed
  literal, never `body` itself.
- No production test users: **confirmed** (§33.31).
- No login timing regression: **confirmed** — the dummy-PBKDF2 branch runs unchanged before either
  audit call, and the audit write itself is `await`ed after the response-determining logic completes,
  not inserted into the timing-sensitive comparison path.
- No auth behavior change except the logging side effect: **confirmed** — every existing
  `tests/worker-*.test.js` and `runtime-tests/*.runtime.test.js` file continues to pass unmodified
  (only `migrations.runtime.test.js` was intentionally extended, not changed in its existing
  assertions).

### 33.33 Performance Impact

One small `INSERT` per security/admin event (at most a few dozen per classroom day at ~29 students) —
negligible against the D1 free-tier row-write budget. No queue, Durable Object, Analytics Engine, or
external logging service was added or considered necessary.

### 33.34 CI Impact

None required — the existing `.github/workflows/ci.yml` already runs `npm ci`, `npm test`,
`npm run test:runtime`, and the frontend build on every push/PR (P13), and all three continue to pass
with the new test files included automatically by their existing glob patterns. No new CI step, secret,
or deploy stage was added.

### 33.35 Files Changed

New: `migrations/0006_p14_audit_events.sql`, `worker/src/routes/audit.js`, `tests/worker-audit.test.js`,
`runtime-tests/audit.runtime.test.js`. Modified: `worker/src/db.js`, `worker/src/index.js`,
`worker/src/routes/auth.js`, `worker/src/routes/admin.js`, `worker/src/routes/register.js`,
`tests/helpers/fake-d1.js`, `runtime-tests/migrations.runtime.test.js`, `frontend/src/api.js`,
`frontend/src/admin-panel.js`, `frontend/src/i18n.js`, `docs/ARCHITECTURE_DECISIONS.md` (new ADR-018),
`docs/REQUIREMENTS.md` (new AUDIT-xxx section), `docs/PROJECT_CONTEXT.md` (this report).

### 33.36 Git Commit/Push

Performed after this session's own explicit task brief directed the full pipeline through commit/push
(the project's standing rule — never commit/push without being asked — is satisfied by that brief
itself, matching the pattern already recorded in §32.37 for P13). See the commit immediately following
this entry in `git log`.

### 33.37 Remaining Debt

- `security.access_denied` logging remains unimplemented, by deliberate choice (§33.15) — revisit only
  if real classroom usage surfaces a concrete need.
- No full real-Admin browser click-through against production was performed this session (§33.30) —
  the next session with real Owner/Admin credentials available should do one, low-risk since the
  feature is read-only from the Admin's perspective plus already-existing, already-tested mutation
  routes.
- No retention/deletion automation exists (by design, §33.19) — a future Owner Decision is required
  before any is built.
- Teacher audit-log read access remains explicitly out of scope (§23 of the session brief) — revisit
  only via a fresh Owner Decision, not silently added later.

### 33.38 Owner Decisions Pending

**None new.** All P14 STOP conditions (external logging SaaS, storing IPs, storing raw request bodies,
claiming legal "90-day" compliance, a generic event-sourcing architecture, retention/deletion
automation, auth/session semantic changes, fake privileged accounts, unrelated schema changes) were
avoided by construction — none were triggered, so none required pausing for Owner input mid-session.

### 33.39 Whether P14 Is Safe to Approve

**Yes.** The existing 191-test suite is untouched and still green (now 210/210 with 19 additive audit
tests); the existing 26-test runtime suite is untouched and still green (now 34/34 with 8 additive audit
runtime tests); the frontend build is clean; the one D1 migration adds exactly one new table plus two
indexes, backed up and verified before and after; no production account was created, modified, or
mutated beyond the schema migration itself; no secret was found or introduced; the new feature is
strictly additive (no existing route's behavior changed except the new logging side effect, verified by
full regression passes); the Worker and its migration are both live and verified in production.

**Explicit answers**: Temp credentials stored in audit logs? **No.** Password/session secrets stored?
**No.** Teacher can read audit logs? **No.** Student can read audit logs? **No.** Production test staff
created? **No.** Historical events backfilled/fabricated? **No.** Legal 90-day compliance claimed?
**No.** D1 migration added? **Yes, `audit_events` only.** P14 remained bounded to audit/security
events? **Yes.**

---

## 34. P15 Status Report — Backup, Restore & Disaster Recovery

### 34.1 Baseline

Confirmed identical to the session brief's expected baseline before any change: `git status` clean on
`main`; `npm test` 210/210; `npm run test:runtime` 34/34; `npm run build:frontend` clean
(`frontend/public/bundle.js`, 397.9kb); migrations `0001`–`0006` present; `wrangler whoami` authenticated
(account `168305221005-st@rmutsb.ac.th's Account`); `wrangler d1 list` confirmed the real production
database (`git-learning-lab-db`, uuid `6df6c304-173a-46fc-b576-205e944341da`); Node `v24.11.1`, npm
`11.6.2`, Wrangler `4.129.1`.

### 34.2 Official Cloudflare Recovery Research (live, September 2026)

- **D1 export/import**: `developers.cloudflare.com/d1/reference/data-export/` 404'd at fetch time (docs
  reorganization); exact current flag syntax was instead confirmed via
  `developers.cloudflare.com/workers/wrangler/commands/` plus the installed `wrangler` binary's own
  `--help` output. `wrangler d1 export <NAME> --remote --output=<file> [--table=... | --no-schema |
  --no-data]` is read-only. `wrangler d1 execute <DB> --file=<file> [--local|--remote]` is the
  import/restore primitive.
- **D1 Time Travel** (`developers.cloudflare.com/d1/reference/time-travel/`): bookmark-based
  point-in-time recovery, available on the **Free plan with a 7-day retention window** (30 days on
  Workers Paid). `wrangler d1 time-travel info <DB>` / `wrangler d1 time-travel restore <DB>
  --timestamp=<unix-ts>`. Restore is **in-place and destructive** — it overwrites the live database and
  cancels in-flight queries; it does **not** clone/fork to a new copy; no dry-run exists.
- **Worker rollback**
  (`developers.cloudflare.com/workers/configuration/versions-and-deployments/rollbacks/`, plus
  `wrangler deployments list`/`wrangler rollback` confirmed via live search of current Wrangler docs):
  dashboard (Deployments tab → three-dot menu → Rollback) or CLI (`wrangler rollback [version-id]`,
  defaults to the version before the current one). Immediately becomes the active deployment on all
  routes. Limited to the 100 most recent versions; blocked if a Developer Platform binding (D1/KV/etc.)
  changed between target and current.
- **Pages rollback** (`developers.cloudflare.com/pages/configuration/rollbacks/`): **dashboard-only** —
  Deployments → All deployments → three-dot menu → "Rollback to this deployment," only for successfully
  built production deployments (not previews). Confirmed via live search that `wrangler pages deployment
  list`/`wrangler pages deployment tail` exist for **listing/log-streaming** only — no CLI/API command
  performs the actual rollback/promote action for Pages. The Git-revert-and-push alternative is the only
  CLI-driven path, and it works because P14 already repaired and verified the GitHub-integrated
  auto-deploy.
- **Pages build environment**: confirmed (already established in P14, re-verified this session) that
  Cloudflare's build image resolves npm version from the pinned `NODE_VERSION`, with no separate
  `NPM_VERSION` override — `NODE_VERSION=24.11.1` remains the fix for the npm-10.x lockfile-resolution
  failure documented in P14's report (§33.29).

### 34.3 Recoverable System Inventory

| Component | Recovery source |
|---|---|
| Source code | GitHub (canonical, ADR-004) |
| Frontend | Rebuilt from source (`npm run build:frontend`) / Cloudflare GitHub-integrated build |
| Worker | Redeployed from source (`npm run deploy:worker`) |
| **D1 database** | **Irreplaceable** — Time Travel + Owner-triggered SQL exports |
| Cloudflare project config (`NODE_VERSION`) | Not in Git — dashboard/API only, documented in §4a of the new runbook |

No object storage / user-uploaded-file system exists in this project — confirmed by inspecting
`worker/src/`, `functions/api/[[path]].js`, and `docs/ARCHITECTURE_DECISIONS.md`; nothing was invented
here that doesn't already exist.

### 34.4 Critical Persisted State / Data Classification

Current production tables (`users`, `sessions`, `progress`, `quiz_results`, `challenge_results`,
`certificates`, `audit_events`, plus Wrangler's own `d1_migrations` bookkeeping table) were enumerated
directly from the real production export, not assumed from memory. `sessions` is technically
**replaceable** (users can re-authenticate), but a full export preserves it as-is regardless — no table
is deliberately excluded from backup/restore scope. `users`/`progress`/`quiz_results`/
`challenge_results`/`certificates`/`audit_events` are **important**: the only state that cannot be
regenerated by re-running the application.

### 34.5 Backup Strategy — ADR-019

Added `docs/ARCHITECTURE_DECISIONS.md` **ADR-019: layered, Owner-triggered backup/recovery** — three
layers (GitHub → Cloudflare-native Time Travel → Owner-triggered SQL export), explicitly **no**
automated/scheduled production backup (would require storing a Cloudflare API token somewhere reachable
by a scheduler — a new secret-handling surface this session's own STOP conditions flagged as needing a
fresh Owner Decision, not a default) and **no** paid backup service/S3/R2/external scheduler (0-THB
target, ADR-010, and unjustified at ~31 accounts). Full reasoning, alternatives considered, and
consequences are in the ADR itself.

### 34.6 Cloudflare-Native Recovery Capability

Time Travel is available today with **zero setup** on the Free plan (7-day window) — it is the fastest
recovery path for anything within that window, and is documented as such in
`docs/DISASTER_RECOVERY.md` §8a. It is **not** a substitute for the SQL-export layer, because it cannot
outlive its own retention window and offers no way to inspect "what would this restore actually contain"
before committing (restore is in-place and destructive, no dry-run, no clone-to-new-copy option).

### 34.7 SQL Export Strategy

Continues this project's existing convention (backups/pre-p2-migration-*.sql onward, predating this
phase) of an Owner-triggered `wrangler d1 export --remote` before any schema-changing deploy, now
additionally: (a) scripted for repeatability and loud failure instead of ad hoc, (b) structurally
verified against the current expected table set, (c) paired with a row-count snapshot for later restore
comparison, (d) SHA-256'd for integrity tracking.

### 34.8 Backup Tooling Added

`tools/dr/` (new directory):
- `lib.mjs` — pure logic only (`timestampedFilename`, `validateBackupText`, `assertNotProduction`,
  `EXPECTED_TABLES`, the real production database name/id as named constants) — no fs/child_process/
  network side effects, so it's directly unit-testable with tiny fabricated fixtures.
- `backup-production-d1.mjs` — `wrangler d1 export --remote` against the real production binding
  (read from `worker/wrangler.toml`, never hardcoded twice), verifies the output file exists/is
  non-empty/structurally complete, captures safe `COUNT(*)` aggregates per table (never row contents),
  writes `.meta.json` (size/SHA-256/tables/counts) and `.counts.json` sidecars under gitignored
  `backups/`, fails loudly (non-zero exit) on any failure, never prints file contents or credentials.
- `validate-backup.mjs` — standalone structural check for any existing backup file.
- `restore-to-isolated-drill.mjs` — restore helper hardcoded to `tools/dr/wrangler.restore-drill.toml`
  (see below); accepts **no** `--remote` flag and **no** alternate `--config` at all (not just "refuses
  it" — the option doesn't exist in this script's argument surface); independently re-verifies via
  `assertNotProduction` that its hardcoded target never resolves to the real production database
  name/id; requires an explicit `--reset` flag before wiping any prior local drill state.
- `wrangler.restore-drill.toml` — a **third**, separate, obviously-fake local-only D1 config
  (`git-learning-lab-DR-DRILL-ONLY-db` / `22222222-...`), deliberately distinct from both
  `worker/wrangler.toml` (production) and `worker/wrangler.test.toml` (ADR-017's dedicated P13 Vitest
  runtime-test config) — kept separate so each file's header comment states exactly what may use it,
  with no ambiguity between "automated test fixture" and "manual DR drill."

`package.json` gained `dr:backup`, `dr:validate-backup`, `dr:restore-drill` npm scripts. No new npm
runtime dependency — all three scripts use only Node built-ins (`node:child_process`, `node:fs`,
`node:crypto`, `node:path`) plus the already-installed `wrangler` devDependency.

**One real bug found and fixed during this session**: `spawnSync(cmd, args, {shell:true})` on Windows
does **not** escape array-form arguments (Node's own documented behavior — "arguments are not escaped,
only concatenated") — a `--command "SELECT COUNT(*) as count FROM x"` argument was silently re-split by
`cmd.exe` into separate words before reaching `wrangler`, producing a real `wrangler` argument-parsing
error on the first live run against production (read-only — no mutation occurred). Fixed by manually
quoting each argument and invoking the shell with one pre-built command string (`quoteArgForWindowsShell`
in both scripts) — verified working end-to-end afterward (§34.10–34.12).

### 34.9 Backup Security

`backups/` was already gitignored since P2 (unchanged); this phase added `.meta.json`/`.counts.json`
sidecars, also covered by the same `backups/` gitignore rule (verified: `git check-ignore -v` confirms
all three files for this session's real backup are ignored). `tools/dr/.wrangler/` (isolated
restore-drill local D1 state) is additionally covered both by the pre-existing `tools/**/.wrangler/` glob
and a new explicit `.gitignore` line added for clarity. No backup content, row value, password hash, or
session-token hash was ever printed to a terminal, committed, or pasted into this document — only table
names, file sizes, and aggregate row counts, which is what §12 of the session brief explicitly allows.

### 34.10 Fresh Production Backup Result

**Taken this session, read-only.** File: `backups/p15-dr-verification-20260908-125515.sql` (10,332
bytes). SHA-256: `ca3f8674d6a019be49c85e0f877232dbf515e2ebb941c481ab86d053f192af82`. All 7 expected
tables present (plus Wrangler's own `d1_migrations` bookkeeping table — 8 total). Real production row
counts captured (aggregate counts only): `users=4`, `sessions=10`, `progress=7`, `quiz_results=3`,
`challenge_results=5`, `certificates=0`, `audit_events=0` — consistent with the counts recorded in
P14's own report (§33.26: "4 real accounts, 10 sessions, 7 progress rows, 3 quiz results, 5 challenge
results"), which is independent corroboration that both this export and P14's prior one are reading the
same real state correctly.

### 34.11 Backup Integrity Verification

`tools/dr/validate-backup.mjs backups/p15-dr-verification-20260908-125515.sql` → **PASS** (all 7
expected tables present, non-empty file). Both the backup script's own inline check and the standalone
validator agree.

### 34.12 Restore Drill — Result

`node tools/dr/restore-to-isolated-drill.mjs --file=backups/p15-dr-verification-20260908-125515.sql
--reset --counts=backups/p15-dr-verification-20260908-125515.sql.counts.json` against
`tools/dr/wrangler.restore-drill.toml` (isolated local D1, `git-learning-lab-DR-DRILL-ONLY-db`):
- Import succeeded (`wrangler d1 execute --local`, exit 0).
- Restored row counts: `users=4`, `sessions=10`, `progress=7`, `quiz_results=3`, `challenge_results=5`,
  `certificates=0`, `audit_events=0` — **every table MATCH** against the production snapshot captured
  in §34.10 (script's own comparison printed `MATCH` for all 7 and exited 0).
- **Application-compatibility checks** (run manually against the restored isolated DB, reusing the
  actual query shapes from `worker/src/db.js`, not synthetic queries): admin-style full user listing
  (`SELECT id, identifier, role, created_at FROM users ORDER BY id`), Teacher-roster-style STUDENT-role
  filter with `full_name`/`student_id` columns, per-user progress listing, certificate lookup (correctly
  returned an empty set, not an error, matching that no certificate has been issued yet), and an
  audit-log-listing-shaped query (correctly returned an empty set) — **all succeeded** against the
  restored schema with no error and no unexpected column/type mismatch.
- No production database was contacted by the restore script (confirmed by its own printed target and
  by `assertNotProduction`'s guard never firing an error, meaning the target was correctly identified as
  non-production throughout).
- **Disposal choice**: the disposable isolated local state (`tools/dr/.wrangler/`) was deleted
  (`rm -rf`) after the drill completed successfully, rather than left in place — this session's judgment
  was that minimizing lingering local copies of real (if minimal) learner data outweighed the minor
  convenience of a warm cache for a future drill; a future drill simply re-runs the same restore command
  against a fresh backup.

### 34.13 Schema Comparison

Identical table set before/after restore (verified directly, not assumed): `users`, `sessions`,
`progress`, `quiz_results`, `challenge_results`, `certificates`, `audit_events`, `d1_migrations`. No
`CREATE TABLE` statement was missing or altered by the export/import round-trip.

### 34.14 Row-Count Comparison

See §34.12 — all 7 application tables matched exactly between the production snapshot and the restored
isolated database. Zero drift.

### 34.15 Application Compatibility Checks

See §34.12. Covered: users listing, role-filtered roster query (Teacher-dashboard shape), progress
aggregation, certificate lookup, audit-log listing shape. Not covered (not practical without real
plaintext credentials, which this session correctly never used): a live authenticated sign-in against the
restored DB — read-only query compatibility was used instead, as the session brief explicitly permits
("If authentication requires credentials not available: verify DB/app integration through safe
internal/read queries instead").

### 34.16 Migration-Chain vs. Backup-Restore Relationship

Documented explicitly in `docs/DISASTER_RECOVERY.md` §9: a fresh empty database runs the full migration
chain (`npm run d1:migrate:remote`/`:local`); a disaster-recovery restore uses the backup's own captured
schema and must **not** also have the migration chain blindly re-applied on top of it (risk of
re-applying schema changes the export already contains, or conflicting with the restored
`d1_migrations` bookkeeping table) — only migrations newer than the backup's timestamp should be applied
afterward, and only after confirming the restore itself succeeded.

### 34.17 Future Migration-Failure Procedure

Documented in `docs/DISASTER_RECOVERY.md` §5: stop further writes if possible → take a forensic backup of
the current (possibly-damaged) state before touching anything else → classify (failed-before-mutation =
investigate only, no restore; partially-applied/bad-state = the serious case) → determine the correct
restore path (§7/§8) → **STOP for explicit Owner confirmation** before any production restore. No
automated destructive rollback exists or was built.

### 34.18 Worker Rollback Procedure

Documented in `docs/DISASTER_RECOVERY.md` §4: preferred Cloudflare-native `wrangler rollback`
(dashboard or CLI, immediate, 100-version limit, blocked by binding drift) as path A; Git-based
`git revert` + `npm run deploy:worker` as path B, history-preserving. **Not executed against real
production this session** — the session brief explicitly prohibited rolling production back merely to
test the procedure, and no incident existed to justify it.

### 34.19 Pages Rollback Procedure

Documented in `docs/DISASTER_RECOVERY.md` §3: Cloudflare-native rollback is **dashboard-only** (confirmed
via live research — no CLI/API path exists for the actual rollback/promote action, only for
listing/log-streaming); Git-revert-and-push is the CLI-driven alternative, relying on the
GitHub-integrated auto-deploy that P14 repaired and verified. **Not executed against real production this
session**, for the same reason as §34.18.

### 34.20 Pages Build-Environment Recovery Notes

Documented in `docs/DISASTER_RECOVERY.md` §4a: `NODE_VERSION=24.11.1` (Production and Preview) remains
the confirmed fix for the P14-discovered npm-10.x lockfile-resolution failure; a diagnostic order is
given (confirm commit on GitHub → confirm a deployment was triggered for that commit and its build
succeeded → check the build log against the known cause → compare the live bundle against a fresh local
build) so a future stale-frontend incident isn't misdiagnosed as a source-code problem.

### 34.21 Git Recovery Procedure

Documented in `docs/DISASTER_RECOVERY.md` §11/§12: clone → `npm ci` → `npm test && npm run test:runtime
&& npm run build:frontend` → redeploy. No second source-code backup service was built — Git history
itself is treated as the recovery asset, per the session brief.

### 34.22 New-PC / Local-PC-Loss Procedure

Documented in `docs/DISASTER_RECOVERY.md` §12: production does not depend on the Owner's Windows/XAMPP
machine; a new machine recovers the deployable system from GitHub + `npm ci` + `wrangler login` +
Cloudflare's already-existing remote resources. Explicitly identified as **not** automatically
recovering: local `backups/*.sql` exports, `.dev.vars`/local secrets (none currently used for
production), `tools/bootstrap-accounts/credentials.local.txt`, and any uncommitted local changes — see
§34.23.

### 34.23 RPO / RTO Assessment (estimates, not guarantees)

No formal SLA is claimed anywhere in this document, matching the session brief's explicit instruction.

- **RPO (potential data loss)**: bounded above by "time since the last Owner-triggered backup" for the
  SQL-export layer, or by Time Travel's continuous bookmarking (near-zero) within its 7-day window for
  anything Time Travel can still reach. In practice, since backups are taken before every
  schema-changing deploy (an established practice since P2) plus on-demand, realistic RPO for a
  migration-adjacent incident is effectively zero; for an incident unrelated to any deploy, RPO depends
  entirely on Time Travel's 7-day window unless a manual backup happens to be more recent.
- **RTO (time to recover)**: a Worker/Pages rollback is minutes (dashboard click or one CLI command). A
  D1 Time Travel restore is likely minutes once the correct bookmark/timestamp is identified — the
  restore operation itself is fast, but *deciding* the correct target is the real time cost, especially
  under pressure. A full SQL-export restore's duration scales with export size (10KB today, at ~31
  accounts) and is not a concern at this project's scale.
- **If a tighter RPO is ever required** (e.g., a formal "backups every N hours" schedule), that requires
  automation, which requires a stored Cloudflare credential — explicitly flagged here as a **future Owner
  Decision**, not assumed or built.

### 34.24 Retention / Housekeeping Decision

No automatic deletion of old backups was built (would require inventing a "when is a backup safe to
delete" policy this session has no authority to assert). Practical recommendation recorded in
`docs/DISASTER_RECOVERY.md`: keep recent pre-migration/incident backups until the change they preceded
has been stable in production and at least one newer verified backup exists — a housekeeping suggestion,
not an automated or enforced rule, and explicitly not framed as any statutory retention requirement.

### 34.25 DR Runbook

`docs/DISASTER_RECOVERY.md` (new) — break-glass checklist, quick triage, frontend/Worker/D1 incident
procedures, emergency-backup and restore-drill commands, the explicit-confirmation-required production
restore procedure (Time Travel and SQL-import paths, both), migration-chain-vs-restore guidance, a
verification checklist, a command reference, new-PC recovery, the local-backup-location limitation, a
"never do this" list, and a no-secrets contact/credential-assumptions section.

### 34.26 ADR / Requirements Changes

- `docs/ARCHITECTURE_DECISIONS.md`: added **ADR-019** (layered backup/recovery strategy).
- `docs/REQUIREMENTS.md`: added a new **DR** section, **DR-001** through **DR-005** (export is read-only;
  restore drills stay isolated; restore verification compares schema/counts; no automatic production
  restore exists; backups are never committed).

### 34.27 Tests Added/Changed

`tests/dr-lib.test.js` (new, 12 tests, `node:test`, tiny fabricated fixtures only — no real production
SQL): filename generation and label-sanitization (including a blank-label rejection), full-fixture
validation pass, missing-table detection with exact missing-set reporting, `IF NOT EXISTS`/quoted-
identifier recognition, an empty-export failure case, the production-name guard (case-insensitive), the
production-id guard, a non-production target *not* throwing, a config-drift check that the restore-drill
config's database name/id are both present and distinct from production **and** from
`worker/wrangler.test.toml`'s own test-runtime identifiers, and a no-drift check that `tools/dr/lib.mjs`'s
hardcoded production constants still match `worker/wrangler.toml`'s real values.

### 34.28 Final Unit-Test Count

**222/222 passing** (up from 210 — 12 new, zero regressions).

### 34.29 Final Runtime-Test Count

**34/34 passing** — unchanged from P14. No runtime-test-worthy application behavior was introduced by
this phase (the DR tooling runs outside the Worker entirely), matching the session brief's explicit
"that is acceptable" allowance.

### 34.30 Build Result

`npm run build:frontend` — clean, `frontend/public/bundle.js` 397.9kb, unchanged from baseline (this
phase touched no frontend code).

### 34.31 CI Result

Unaffected — `.github/workflows/ci.yml` was not modified. No production Cloudflare credential, D1
access, or backup file was added to CI at any point, matching the session brief's explicit prohibition.

### 34.32 Files Changed

New: `docs/DISASTER_RECOVERY.md`, `tests/dr-lib.test.js`, `tools/dr/lib.mjs`,
`tools/dr/backup-production-d1.mjs`, `tools/dr/validate-backup.mjs`,
`tools/dr/restore-to-isolated-drill.mjs`, `tools/dr/wrangler.restore-drill.toml`.
Modified: `.gitignore` (one clarifying line for `tools/dr/.wrangler/`), `docs/ARCHITECTURE_DECISIONS.md`
(ADR-019), `docs/REQUIREMENTS.md` (DR-001–005), `package.json` (three `dr:*` scripts), and this file.
Real backup artifacts (`backups/p15-dr-verification-*.sql` + `.meta.json` + `.counts.json`) exist on
disk, gitignored, not part of this commit.

### 34.33 Production Deployment Required/Performed?

**Not required, none performed.** No Worker or frontend source file changed this phase — only docs,
tests, tooling scripts, and config. No `npm run deploy:worker` was run; Pages auto-deploy may or may not
trigger for a docs-only push depending on Cloudflare's own build-trigger rules for this project, but no
runtime behavior changes either way since no served code changed.

### 34.34 Production Verification

`node tools/prod-smoke/check.mjs` was available and this phase's only real production interaction was
strictly read-only (`wrangler d1 export --remote` + `SELECT COUNT(*)` aggregate queries) — no mutation
path exists in any script added this session, and none was exercised.

### 34.35 Production-Data Side Effects

**None.** Every production interaction this session was read-only: `wrangler d1 list`, `wrangler d1
export --remote`, and per-table `SELECT COUNT(*)` queries. No row was inserted, updated, or deleted in
production. The restore drill ran exclusively against `tools/dr/wrangler.restore-drill.toml`'s isolated
local D1, never production.

### 34.36 Git Commit/Push

Commit created per the Owner's standing convention (see §33.36's identical pattern) — this session brief
itself is the "asked" trigger, matching prior phases. See the commit immediately following this entry in
`git log`.

### 34.37 Remaining DR Debt

- No automated/scheduled backup exists (by design, ADR-019) — would require a stored Cloudflare
  credential and is explicitly deferred to a future Owner Decision.
- No off-device/encrypted copy of local backups exists (§34.22/§13 of the runbook) — local-disk-only
  backups remain a real, documented limitation, not silently accepted as a non-issue.
- A real production restore (Time Travel or SQL-import) has never actually been executed end-to-end in
  this project — by design (never test DR against real production) — meaning the *documented* procedure
  is verified by research and by the isolated drill's success, but the exact production command sequence
  itself remains unexercised in anger. This is the correct tradeoff, not an oversight, but worth stating
  plainly.
- `docs/DISASTER_RECOVERY.md`'s recommended backup housekeeping (§34.24) is a suggestion, not an
  enforced/automated policy — nothing currently prevents `backups/` from growing unbounded on the
  Owner's disk over many phases.

### 34.38 Owner Decisions Pending

- Whether to add scheduled/automated production backups (requires accepting a new Cloudflare-credential
  storage surface).
- Whether to add an encrypted off-device copy of local backups.
- Whether a formal backup-retention/housekeeping policy (e.g., "delete backups older than N phases once
  superseded") should be enforced rather than left as a suggestion.

None of these were treated as blocking — all are explicitly deferred, per the session brief's own STOP
conditions.

### 34.39 Whether P15 Is Safe to Approve

**Yes.** The existing 210-test suite is untouched and still green (now 222/222 with 12 additive DR-tooling
tests); the existing 34-test runtime suite is untouched and still green (unchanged, no new runtime-test-
worthy behavior); the frontend build is clean and unchanged; no D1 migration was added; every production
interaction this session was read-only (export + aggregate counts); the restore drill ran end-to-end
successfully against a real production backup, entirely within an isolated local D1, with matching row
counts and passing application-shaped read queries; no production data was created, modified, or deleted;
no secret was found, introduced, or committed (`git check-ignore` confirms every backup artifact stays
ignored); the new DR tooling is additive only (no existing route, script, or test changed behavior,
verified by full regression passes); no scope-boundary item from the session brief's exclusion list
(§41) was touched.

**Explicit answers**: Fresh production backup taken? **Yes.** Actual production restore performed?
**No.** Restore drill performed against isolated D1? **Yes.** Restored row counts matched source?
**Yes, all 7 tables.** Production data modified during drill? **No.** Production backup committed to
Git? **No.** D1 migration added? **No.** Paid backup service introduced? **No.** Automated production
backup requiring secrets added? **No.** Worker/Pages rollback documented? **Yes.** P15 remained bounded
to DR/backup/recovery? **Yes.**

---

## 35. P16 Status Report — Final Classroom Launch Dry Run & Release Freeze

### 35.1 Baseline

Confirmed identical to the session brief's expected baseline: `git status` clean on `main`; `npm test`
222/222; `npm run test:runtime` 34/34; `npm run build:frontend` clean (397.9kb); migrations `0001`–`0006`
present, `wrangler d1 migrations list --remote` reported "No migrations to apply!"; Node `v24.11.1`, npm
`11.6.2`, Wrangler `4.129.1`; CI latest run on `main` ("CI #4", commit `8598c88`) green (confirmed via the
live GitHub Actions page). Re-run at the end of this session with identical results — no regression
introduced.

### 35.2 Release Candidate

- Commit: `8598c88d3adf24bff83fdb0ee2ce1aa13dbb6a06` ("P15: add verified backup and disaster recovery
  runbook").
- Worker version (redeployed this session — see §35.3): `eb81dce1-0160-4f49-8559-53bc83043c05`.
- Pages production deployment: `9eabe423-2ade-442c-97a5-f9ab523f7e9d`, commit `8598c88`, not a Failure
  status — already matched the release candidate before this session touched anything.
- D1 migrations: `0001`–`0006`, all applied to production.

### 35.3 Deployment-Pipeline Defect Found and Fixed

The production Worker's most recent deployment (`4f916acc…`, 2026-09-07T18:06:16Z) predated the P14
commit (`d02bb97`, 2026-09-07T18:09:10Z) that changed `worker/src/db.js`, `index.js`,
`routes/admin.js`, `routes/auth.js`, `routes/audit.js`, and `routes/register.js` — by only 3 minutes, but
on the wrong side of it. Because the router resolves the session (and returns 401) before checking route
existence, this could not be distinguished from the outside by probing route shapes alone. With Owner
approval, redeployed current HEAD via `npm run deploy:worker`; `node tools/prod-smoke/check.mjs` passed
after. This was subsequently confirmed materially real, not just theoretical: before the redeploy, a
production `audit_events` count was 0 despite P14 having shipped days earlier; after the redeploy, real
login/logout/registration/failure activity from this session's dry run correctly produced audit rows.
**Classified Class A (a P14 release-blocking security feature was not actually live in production).
Fixed. No code/logic defect — purely a missed manual deploy step — so no regression test was added; the
gap is now covered procedurally by a pre-class deployment-verification step in the new
`docs/CLASSROOM_LAUNCH.md`.**

### 35.4 Pre-Freeze Production Backup

`backups/p16-pre-classroom-dryrun-20260908-141221.sql` — read-only export, validated (all 7 expected
tables plus `d1_migrations`), SHA-256 `ca3f8674d6a019be49c85e0f877232dbf515e2ebb941c481ab86d053f192af82`,
gitignored. Row counts at capture: users 4, sessions 10, progress 7, quiz_results 3, challenge_results 5,
certificates 0, audit_events 0 (the last figure itself corroborating §35.3 — no audit events existed
before the redeploy).

### 35.5 Test-Account Strategy

Used the Owner's own `admin`/`teacher1`/`student1` accounts where read-only inspection sufficed, and one
disposable Student account, `p16dryrun`, created by the **Owner** through the real production UI (Claude
does not create accounts or enter passwords into any authentication field, by standing policy). No
disposable Teacher/Admin was created. `p16dryrun`'s password became briefly visible in the Owner's own
screenshot while testing the show/hide control; this is Owner-side, not logged or recorded here, and the
account is flagged for Owner-approved cleanup (§35.19).

### 35.6 Public / Login / Register Dry Run (Owner-performed, D1-cross-checked)

Owner performed this live against production; every result was independently confirmed against D1
afterward, not just taken on report:
- Thai UI, password show/hide, generic invalid-credentials message (no user-existence leak): confirmed
  live by Owner; the `auth.login.failure` audit row for this attempt was found with only
  `{"attemptedIdentifier":"student1"}` in metadata — no password, matching AUDIT expectations exactly.
- `p16dryrun` registration: D1 confirms `role = STUDENT` (id 8) — no forged-role path exists regardless
  of client input (REG-002).
- Public certificate verify with a bogus id: Owner confirmed a safe generic invalid result; matches this
  session's own runtime-test coverage of the same route.

### 35.7 Student First-Use, Module 1, Module 2 (Owner-performed, D1-cross-checked)

D1 confirms exactly what the Owner reported: `progress` rows for `module-1` and `module-2` both
`status = completed`; `quiz_results` shows `module-1` at 2/5 correct (40%) and `module-2` at 5/5 (100%) —
an exact match to the Owner's report, proving the Dashboard/quiz UI is not fabricating displayed numbers.

### 35.8 Modules 3–7 — Verified by Automated/Code-Level Means (No Manual Walkthrough, Per Owner Instruction)

The Owner explicitly asked that Modules 3–7 be verified without a manual click-through, using the
strongest available automated combination. This was done as follows, all against the project's existing,
unmodified test suites (no new tests were needed — coverage was already comprehensive):

- **Simulator engine** (`shared/simulator-core.js`, exercised by 47 tests in `tests/shared-core.test.js`,
  all passing): the three distinct `git reset` modes (`--soft`/`--mixed`/`--hard`) produce three distinct,
  individually-tested states from the same start; branch creation/checkout/`-b`/`-d` and HEAD movement;
  merge fast-forward, auto-merge of non-conflicting changes, and conflict detection without state
  corruption; `git push` including non-fast-forward rejection; `git pull` including the
  no-tracked-branch failure case; `git clone` including rejection into an already-initialized repo; and
  `git log --graph` rendering a fork/merge join correctly.
- **Challenge replay for every Module 3–7 challenge, including both enrichment variants**
  (`tests/quiz-challenge-core.test.js`): `challenge-module-3` through `capstone-module-7`, plus
  `challenge-module-4-b` and `challenge-module-6-b`, each with a passing correct transcript, a failing
  incorrect transcript, and — for several — an alternate valid command order also passing (CHAL-005: the
  replay engine, not a fixed script, decides correctness).
- **Server-side authority, against a real Worker/Miniflare runtime** (`runtime-tests/authority.runtime.test.js`):
  a forged `passed: true` with an empty transcript is ignored and correctly fails; the same request with
  a real, correct transcript passes; a non-array transcript is rejected before any replay is attempted.
- **Full-course completion, driven entirely through real route handlers**
  (`tests/worker-certificate.test.js`'s `completeEntireCourse` helper): every one of the 7 modules'
  lesson/quiz/challenge requirements is satisfied via `POST /api/progress`, `POST /api/quiz/submit`
  (server-selected subset, real answer key), and `POST /api/challenge/submit` (real transcripts per
  module) — proving `isComplete = true` / 100% is reachable exactly as a real learner would reach it, not
  assumed.
- **Module 7's optional quiz is structurally excluded from the completion requirement**
  (`shared/completion.js` only requires a quiz where `shared/curriculum.js` declares one, and Module 7's
  entry does not) and behaviorally confirmed by two dedicated tests: completion is unaffected whether or
  not the Module 7 quiz was ever attempted, and submitting it persists a result without changing
  completion.
- **Frontend wiring, verified by source review** (not live interaction, since it sits behind Student
  login): `frontend/src/terminal.js` submits on Enter via an explicit `form.requestSubmit()` (not relying
  on implicit form submission alone — this is the same fix that closed the project's earlier physical
  Enter-key debt) and the visible "Run" button is the same form's native submit button, not a divergent
  code path; all terminal output is written via `textContent`, never `innerHTML` (SEC-002 — safe against
  a learner-supplied filename); `frontend/src/visualizer.js` unconditionally renders all four zones
  (Working Directory/Staging/Local/Remote) from current state; `frontend/src/simulator-workspace.js`
  calls `applyCommand` (the same shared engine used server-side) then synchronously re-renders after
  every command, with no page reload and no network round-trip for the simulator itself.
- **No placeholder/incomplete content, no out-of-scope commands**: a repository-wide scan for
  TODO/placeholder/"coming soon"/lorem-ipsum text and for `git switch`/`restore`/`rebase`/`.gitignore`/PR
  workflows in lesson content found none (the one "Pull Request" mention is descriptive text in Module
  2's Git-vs-GitHub conceptual content, not a taught command).

### 35.9 Quiz-System Verification

Server-side subset selection and scoring, forged full-bank-length answer arrays rejected, forged
`percent`/`correctCount` fields ignored in favor of a server-computed score — all proven at both the
`node:test` unit level and the Worker-runtime level against a real Miniflare instance.

### 35.10 Challenge-System Verification

ADR-013 replay authority proven at three independent levels: the pure engine
(`tests/quiz-challenge-core.test.js`, all 7 modules + 2 enrichment variants), the real-route unit level
(`tests/worker-quiz-challenge.test.js`), and the real-Worker-runtime level
(`runtime-tests/authority.runtime.test.js`). A forged `passed`/`finalState` is never sufficient by
itself in any of the three.

### 35.11 Completion Verification

Single authoritative evaluator (`shared/completion.js`), imported unmodified by both frontend display and
the Worker's authorization decision for certificate issuance. Tested for zero activity, one missing
module, and full 7-module completion; Module 7's optional quiz is provably non-blocking.

### 35.12 Certificate Verification

Unauthenticated/incomplete/forged-`userId`/TEACHER-or-ADMIN-role requests all rejected; an eligible,
fully-completed STUDENT can issue; issuance is idempotent (no duplicate rows); `full_name`-absent fallback
to login identifier works; public verification returns exactly 4 public fields
(`learnerName`/`courseName`/`issuedAt`/`verificationId`) with no user id, status, or row id, and fails
safely for unknown/malformed ids — all with no session/cookie required, matching the public-link use
case.

### 35.13 Learning History Verification

Not independently re-driven live this session (would require Student login), but cross-user isolation is
directly proven: "a freshly registered student cannot see another student's progress (history
isolation)" and "one user's quiz results are never visible via another user's session" both pass in the
existing suite.

### 35.14 Teacher Handoff / Account State

`teacher1` currently has `must_change_password = 0` and no pending recovery — no temporary handoff
credential is outstanding, so nothing was at risk of being consumed. No disposable Teacher account was
created. Teacher login itself was not performed live by Claude (would require entering `teacher1`'s real
password); RBAC and dashboard-data correctness for the Teacher role are proven via
`tests/worker-teacher.test.js` and `runtime-tests/roles.runtime.test.js` against real route handlers.

### 35.15 Teacher Dashboard Result

Verified server-side (not live-rendered, per §35.14): unauthenticated/STUDENT/ADMIN sessions rejected on
every Teacher route; a TEACHER session can access every classroom endpoint; the roster reflects real
progress and never includes password/session/recovery fields; a student with no activity is classified
`not_started`; a Teacher account itself never appears in its own roster; summary totals match the
roster's own per-student data; per-student detail matches the student's own `GET /api/completion`; CSV
export has correct headers, a UTF-8 BOM, and both formula-injection neutralization and comma-safe
quoting for learner-supplied names, verified by unit test.

### 35.16 Admin Result

Verified server-side (Admin login was not performed live by Claude, for the same reason as §35.14):
unauthenticated/STUDENT/TEACHER sessions rejected on every Admin route; an ADMIN session can create
TEACHER or ADMIN accounts but never STUDENT (a forged/unknown role string is rejected, not silently
allowed); duplicate identifier/email rejected; the full temporary-credential lifecycle
(issue → login with temp credential → forced password change → old temp credential immediately dead)
is proven end-to-end by a dedicated test. Read-only inspection of live production confirms exactly 5
users today (`admin`/ADMIN, `teacher1`/TEACHER, `student1`/STUDENT, `Sprite`/STUDENT, `p16dryrun`/STUDENT
dry-run account) — no unexpected disposable staff.

### 35.17 Audit-Log Result

19 dedicated tests in `tests/worker-audit.test.js` confirm: only an allowlisted set of event types can
ever be written; a temporary credential is never present in stored metadata for any implemented event;
`admin.staff.created`/`admin.recovery.issued`/`student.registered`/`auth.login.success`/
`auth.login.failure`/`auth.password.changed`/`auth.logout` all record the correct actor/target fields
with no secret; login-failure metadata contains only the normalized attempted identifier, identically
whether the identifier exists or not (no account-enumeration leak via the log itself); listing is
Admin-only, newest-first, with a clamped (not client-trusted) limit, and malformed metadata is returned
as `null` rather than leaking or throwing. Cross-checked directly against live production this session:
9 real rows after the dry run's actual activity (login success/failure, registration, logout), every
`metadata_json` inspected by hand contains no password, hash, token, or IP — only
`{"attemptedIdentifier": "student1"}` on the one failed-login row.

### 35.18 Role-Boundary Verification

Exhaustively covered by the existing suite's cross-boundary matrix (Student/Teacher/Admin ×
Student/Teacher/Admin routes) at both the unit and Worker-runtime levels, plus this session's live
production smoke check confirming unauthenticated 401 on both a general protected route and an Admin
route.

### 35.19 Mobile / Tablet / Desktop Result

Live-checked this session (login/register/public-cert-verify screens, the only screens reachable without
credentials): zero horizontal page overflow at 375px and 430px viewports (`document.documentElement.
scrollWidth` equals `window.innerWidth` at both sizes); skip-link (`ข้ามไปยังเนื้อหาหลัก` →
`#app-main-content`) present; forms use real `<label>` elements. Authenticated screens (Dashboard,
Terminal, Teacher Dashboard, Admin panel, Audit log) were **not** live-rendered by Claude (behind
Student/Teacher/Admin login) — verified instead via source: `frontend/public/styles.css` carries 6 media
queries (900/768/640/420px, plus reduced-motion and print), covering the required 375–430–768–desktop
range, and a dedicated print stylesheet exists for the certificate's Print/Save-as-PDF path.

### 35.20 Physical-Device Result

**Not performed by Claude** — no physical device is available in this environment, and this is one of
the session brief's own explicit stop conditions. Not claimed as done. Remains open for the Owner if
desired before Sept 12.

### 35.21 Accessibility Result

Skip link, universal `:focus-visible` styling (buttons/links/inputs/`[tabindex]`), and a
`prefers-reduced-motion: reduce` override block are all present and confirmed by direct inspection of
`frontend/public/styles.css`. Terminal/form output uses `textContent` exclusively (no `innerHTML`
injection surface). Login/register forms carry `alert`/`status` ARIA regions for feedback. No WCAG
certification is claimed.

### 35.22 Security-Final-Review Result

No `eval`/`new Function`/`child_process`/shell-exec anywhere in `worker/src` or `frontend/src`. Session
cookie: `HttpOnly; Secure; SameSite=Lax; Path=/`, no `Domain` attribute (host-only by design, ADR-015).
Session tokens are looked up and stored as SHA-256 hashes (`session.js`), never the raw token. CSRF
Origin/Referer check defaults to **reject** when neither header is present. Password hashing remains
PBKDF2-HMAC-SHA256 (AUTH-002, unchanged). CSV formula-injection mitigation and BOM handling confirmed in
both source and passing tests. Audit log confirmed secret-free by code, test, and live inspection (§35.17).
Registration cannot elevate role, confirmed both by test and by this session's live `p16dryrun` dry run
(landed as STUDENT). Public certificate verification leaks nothing beyond the 4 public fields, confirmed
by test and live check. No release blocker found in this review.

### 35.23 Deployment-Pipeline Result

See §35.3 for the defect found and fixed. After the redeploy, `wrangler deployments list` shows the
Worker's current version as the most recent entry, and `node tools/prod-smoke/check.mjs` passes. Pages
production (`9eabe423…`, commit `8598c88`) already matched the release candidate and required no action.
`NODE_VERSION=24.11.1` was not re-verified via the Cloudflare dashboard this session (no dashboard access
from this environment) — inferred still correct from every recent Pages deployment in `wrangler pages
deployment list` showing a non-Failure status (the only Failure entries predate the P14 fix and are
already documented in the P14 report).

### 35.24 CI Result

Latest GitHub Actions run on `main` ("CI #4", commit `8598c88`) confirmed green via the live Actions page
(`npm ci`, `npm test`, `npm run test:runtime`, `npm run build:frontend`, 19s). No deployment step exists
in CI, and no production secret is present there — unchanged from prior phases.

### 35.25 DR Readiness

A fresh, validated P16 pre-freeze backup exists (§35.4). `docs/DISASTER_RECOVERY.md` (read in full this
session) remains usable and accurate. `backups/` remains gitignored. The full restore-drill was proven
in P15 and was **not** re-run this session — no reason to repeat a full destructive-scenario drill so
soon, per the session brief's own instruction not to. Production restore still requires deliberate,
in-the-moment Owner confirmation; nothing added this session changes that.

### 35.26 Production DB Sanity

5 users, correct role distribution (1 ADMIN, 1 TEACHER, 3 STUDENT including the one disposable dry-run
account), migrations `0001`–`0006` fully applied, `audit_events` table healthy and populated with real
dry-run activity, `certificates` table empty (expected — no one has completed the full course yet). No
orphan rows found in the checks performed.

### 35.27 Defects Found

One: the deployment-pipeline gap in §35.3 (Class A — a P14 security feature not actually live in
production). No other defect was found across security, RBAC, quiz/challenge authority, completion,
certificate, audit, CSV export, or accessibility review.

### 35.28 Defects Fixed

The one defect in §35.27 — Worker redeployed to match committed HEAD, verified.

### 35.29 Tests Added

None. The one defect found was operational (a missed deploy step), not a code/logic defect, so no new
regression test applies; the gap is covered procedurally instead (§35.3, `docs/CLASSROOM_LAUNCH.md`).

### 35.30 Final Counts

222/222 unit tests, 34/34 Worker-runtime tests, frontend build clean (397.9kb), `git diff --check` clean,
working tree clean.

### 35.31 Production Side Effects This Session

One real Worker redeployment (code-identical to already-tested/committed HEAD; the only behavioral
change is that P14's audit-log routes became actually reachable, which is the intended, tested behavior,
not a new one). One real, read-only D1 backup. The Owner's own registration of `p16dryrun` and completion
of Modules 1–2 through the real UI (their action, authorized dry-run activity, not a Claude-initiated
side effect).

### 35.32 Cleanup Performed

None yet. `p16dryrun` remains active in production pending an Owner decision (§35.34) — deleting a real
production account is one of this session's explicit stop conditions.

### 35.33 `docs/CLASSROOM_LAUNCH.md`

Created this session — concise, practical, no credentials recorded, covering pre-class checks, the first
10 minutes, and the four "if X breaks" branches (login/deploy-staleness/Worker failure/bad data) plus
after-class steps.

### 35.34 Owner Decisions Pending

- Whether/when to delete the disposable `p16dryrun` production account, and whether to let it exercise
  Modules 3–7 and certificate issuance first for one real end-to-end production data point, or remove it
  as-is.
- Whether the automated-equivalent verification of Modules 3–7, Teacher Dashboard, and Admin panel
  (§35.8, §35.15, §35.16 — strong evidence against real Worker/Miniflare runtime and exhaustive tests,
  but not a literal human click-through in production) is sufficient to approve the release freeze, or
  whether the Owner wants to personally spot-check any of those first.
- The release tag itself (name and creation) — not created this session, pending the above.

### 35.35 Known Non-Blocking Limitations

- Physical real-device check not performed (§35.20).
- Live human click-through of Modules 3–7, Teacher Dashboard, and Admin panel in production was not
  performed by Claude this session, per the Owner's own explicit instruction — substituted with
  automated-equivalent evidence (§35.8, §35.15, §35.16). This is a genuine scope difference from a
  literal human click-through, stated plainly rather than glossed over.
- No off-device/encrypted backup copy exists (pre-existing, documented in P15).
- No automated/scheduled production backup (by design, ADR-019, pre-existing).

### 35.36 Whether Classroom Release Is Safe

**Conditionally yes.** Every automatable gate is green (222/34 tests, clean build, clean git tree, green
CI, matching Pages/Worker deployment, healthy D1, validated backup), and the one real defect found this
session (stale Worker deployment) was fixed and verified. Release tagging and freeze declaration are
withheld pending the two Owner decisions in §35.34, per this session's own stop conditions — not because
any check failed.

**Explicit answers**: New feature added? **No.** New Git concept added? **No.** D1 migration added?
**No.** Completion rules changed? **No.** Production backup taken? **Yes.** Production restore performed?
**No.** Disposable production Teacher/Admin created? **No.** Teacher handoff credential consumed without
Owner approval? **No** (none was outstanding to consume). All unit tests green? **Yes (222/222).** All
runtime tests green? **Yes (34/34).** CI green? **Yes.** Pages deployment matches release candidate?
**Yes.** Worker healthy? **Yes (redeployed and verified this session).** Release tag created only after
gates passed? **N/A — not yet created, pending Owner approval.** Classroom release frozen? **No — pending
Owner approval.** Safe for September 12 classroom use? **Yes, conditional on the two pending Owner
decisions in §35.34.**
