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
  performance/accessibility review, and release-readiness polish — complete**, see §25 for the full
  P7 status report. This document's older sections are historical (P1/P2/P3/P4/P5/P6) unless a later
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

**Still not closed** — unchanged from P3.5/P4/P5/P6. This session's environment has no physical
keyboard capability either; the existing "Run" button fallback (added in P2 specifically for this
class of concern) continues to be used for all terminal interaction verification, including this
session's own. This remains a tiny, low-risk manual Owner check, explicitly documented rather than
falsely claimed as verified.

### 25.14 Production Data / Test-Account Status

No new student account was created this session (unlike P2/P4/P5, each of which left a harmless
bootstrap/verification account behind). The one real side effect: opening the Module 1 lesson page as
`teacher1` during UI verification triggered the lesson's own unconditional `postProgress("module-1",
"started")` call (`frontend/src/lesson-module1.js`), writing one real `progress` row for `teacher1` in
production D1. This was noticed via a live query and its deletion was attempted but **blocked by this
session's own safety controls** as a destructive production-database write requiring explicit user
confirmation — correctly so. **This one row (`teacher1` / `module-1` / `started`,
`2026-09-07 09:57:58`) remains in production** and should be cleared by the Owner via a direct D1
query if a fully clean state is wanted before the class starts; it has no effect on any real student's
data or on `teacher1`'s ability to use the account normally. Separately, `teacher1`'s password was
changed (via the ordinary Admin-issued-recovery flow, the same mechanism P2/P6 already used for their
own verification) to a session-local value the Owner should treat as current — **issue `teacher1` a
fresh recovery credential via the Admin panel before handing this account to the real class teacher**,
identical to the standing note P2/P6 already left for this same account.

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

- Physical-keyboard Enter-key spot-check (§25.13) — standing since P3.5.
- No automated Worker-runtime (workerd) test harness — standing since P2.
- Teacher/roster/export scale to one query per table, correct at ~29 students, would need pagination
  at a much larger scale — standing since P6, not a v0.9 concern.
- CSV export is a same-origin `<a href>` navigation, not a `fetch`+blob download — standing since P6.
- The one harmless `teacher1`/`module-1` progress row from this session's own verification (§25.14).

### 25.17 Owner Decisions Made / Pending

No Owner Decision was required this session — every fix was a citable, in-scope NORMALIZE-tier bug
fix (UX skill §4), not a scope question, a redesign, or a security tradeoff. Nothing was escalated per
§9.2's Owner Decision Protocol. **Pending, non-blocking**: clear the one `teacher1` progress row and
issue `teacher1` a fresh recovery credential (§25.14) before the real class starts; close the physical
Enter-key check (§25.13) opportunistically if a real device becomes available before September 12.

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
- The physical-keyboard Enter-key spot-check from P3.5 (§21) remains unconfirmed, unchanged.
