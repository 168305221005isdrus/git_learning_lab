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
  — substantially complete**, see §19 for the full P3 status report and §20 for the recommended P4
  starting point. This document's older sections are historical (P1/P2) unless a later note says
  otherwise.
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
