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
  substantially complete**, see §17 for the full P2 status report; this document's older sections
  below are historical (P1) unless a P2 note says otherwise.
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
