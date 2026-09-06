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
- **Current phase**: **P1 — Environment, Repository, Cloudflare & Skeleton Setup** (P0 is FINAL
  APPROVED). The local Git repository, GitHub push, and the technical scaffold (frontend/Worker/
  shared-core/migrations/tests skeletons) are done. **Cloudflare resource creation is blocked on an
  Owner-interaction STOP** — see §10 and §15.
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
| Initial public URL | Cloudflare-provided `*.pages.dev` domain |
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
│   ├── src\index.js                      (GET /api/health only; other routes stubbed as comments)
│   └── wrangler.toml                     (D1 binding present; database_id is a PLACEHOLDER)
├── migrations\
│   └── 0001_init.sql                     (users + sessions tables only — DATA-001's fuller schema
│                                           is P2 work)
├── tests\
│   ├── pipeline.test.js                  (trivial pipeline-works proof)
│   └── shared-core.test.js               (imports shared core; proves no DOM/Worker API usage)
└── tools\pbkdf2-bench\                   (standalone benchmark worker for ADR-012, NOT the real API
                                            worker, never deployed to production)
```

## 10. Current Known External Services / Accounts

- Git is installed locally (2.55.0); Node 24.11.1 / npm 11.6.2 confirmed installed.
- **GitHub**: repository `git_learning_lab` exists at
  `https://github.com/168305221005isdrus/git_learning_lab.git` (confirmed by the Owner directly, not
  guessed). The local repository is initialized on branch `main`, `origin` is configured to this URL,
  and **the initial commit has been pushed successfully** — `git ls-remote origin` confirms the
  remote's `main` matches local HEAD. Git Credential Manager handled authentication with an
  already-cached credential; no interactive login was needed for this push.
- **Cloudflare**: an account exists, but **Wrangler is NOT authenticated on this machine**
  (`wrangler whoami` → "You are not authenticated"). No `CLOUDFLARE_API_TOKEN`/
  `CLOUDFLARE_ACCOUNT_ID` env vars are set. **No Cloudflare Pages project, Worker, or D1 database has
  been created yet** — this is the P1 Owner-interaction STOP; see §15.
- Local-only proof performed instead: `wrangler dev` (local mode, no Cloudflare login required) ran
  the Worker skeleton successfully, and `wrangler d1 migrations apply ... --local` applied
  `migrations/0001_init.sql` against a local D1 simulation, creating `users` and `sessions` tables —
  this proves the migration mechanism is real and reproducible, but it is **not** the same as a real
  Cloudflare D1 database existing.

## 11. What Has Been Built (P1) vs. What Has NOT (still P2+)

**Built in P1** (scaffold/proof only, not real features):
- Local Git repository, pushed to GitHub (§10).
- Root npm project (ADR-014: plain ES modules, esbuild, Wrangler, `node:test` — no framework).
- `shared/simulator-core.js` — proves the shared-core import pattern (ADR-013) works from both a
  browser bundle and a Worker bundle; implements only `git init`, nothing else.
- Frontend skeleton — loads, shows nav + placeholder panels for all six MVP sections, responsive at
  narrow width, keyboard-focusable nav buttons, confirms the shared core loaded.
- Worker skeleton — `GET /api/health` returns `{"ok":true,"service":"git-learning-lab-api"}`,
  verified locally; all other routes return 404 (stubbed as comments only).
- `migrations/0001_init.sql` — `users` + `sessions` tables, applied and verified against local D1.
- Test suite — 5 passing tests (`npm test`), covering pipeline sanity and the shared core's basic
  behavior/no-DOM-API guarantee.
- PBKDF2 benchmark (`tools/pbkdf2-bench/`) — real local measurements taken; **ADR-012 updated** with
  an interim iteration count of **10,000**, explicitly flagged as provisional pending confirmation
  against real production CPU-time telemetry once Cloudflare deployment is possible.

**Still NOT built** (P2+, do not assume otherwise):
- Real Git command semantics (only `git init` exists; SIM-001 through SIM-016 are unimplemented).
- Any real authentication, session, or password-recovery logic (AUTH-xxx/RECOV-xxx are unimplemented
  — the `users`/`sessions` tables exist, but nothing reads/writes them yet).
- Lesson, quiz, or challenge content (LEARN-xxx/FLOW-xxx/QUIZ-xxx/CHAL-xxx are unimplemented).
- Any Cloudflare cloud resource: no D1 database, no deployed Worker, no Pages project (§10, §15).
- Any live URL of any kind — nothing is deployed.

## 12. Explicit Deferred Scope

See §4 above and `docs/SCOPE.md`'s "Out of Scope / Deferred" section for the full, current list.

## 13. PBKDF2 Benchmark Result (ADR-012)

Measured locally via `wrangler dev` (real workerd runtime, no Cloudflare account needed for local
mode): PBKDF2-HMAC-SHA256 cost scales roughly linearly, ~0.43–0.45ms per 1,000 iterations at
steady state (e.g., 10,000 ≈ 4–5ms; 100,000 ≈ 43–45ms — the latter alone would exceed the entire
10ms free-tier CPU budget). **Interim value: 10,000 iterations**, chosen to leave real headroom
against the free tier's 10ms-per-invocation cap. This is provisional — re-benchmark against real
production CPU-time telemetry (`wrangler tail` or dashboard analytics) the first time the Worker is
actually deployed, and update ADR-012 with the confirmed figure before real authentication ships.
Full detail: `docs/ARCHITECTURE_DECISIONS.md` ADR-012.

## 14. Immediate Next Phase After P1

Once the Cloudflare STOP (§15) is cleared by the Owner: complete P1 Steps 8/10/11 (create the real D1
database, deploy the Worker, create the Pages project — preferably GitHub-integrated — and smoke-test
the live URLs), then proceed to **P2 — Core Simulator & Authentication**, expected to cover (pointer
only, not yet planned): implementing real Git command semantics in `shared/simulator-core.js`
(SIM-001..SIM-016), real authentication/session/password-recovery against the Worker+D1
(AUTH-xxx/RECOV-xxx), and the first real lesson module's content.

## 15. OPEN Owner-Interaction STOP (as of this document)

**Cloudflare is not authenticated on this machine.** `wrangler whoami` confirms no login; no API
token is set. This blocks: creating the real D1 database, deploying the Worker, and creating the
Pages project. **What the Owner must do** (either path unblocks P1 Steps 8/10/11):

- **Path A (interactive, simplest)**: run `wrangler login` from the project root in a terminal — this
  opens a browser to Cloudflare's own login/consent screen; sign in and click Allow.
- **Path B (non-interactive, automation-friendly)**: create a Cloudflare API Token (dashboard → My
  Profile → API Tokens → "Edit Cloudflare Workers" template, or a custom token with Workers Scripts,
  D1, and Pages edit permissions) and provide it as the `CLOUDFLARE_API_TOKEN` environment variable
  (and `CLOUDFLARE_ACCOUNT_ID` if prompted) — do not paste the token value into chat; set it directly
  in the terminal environment.
- **For Cloudflare Pages specifically**, GitHub-integrated deployment (the preferred mode per
  `ARCHITECTURE_DECISIONS.md`) additionally requires a one-time dashboard action regardless of path
  A/B: Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → authorize the
  Cloudflare GitHub App for the `git_learning_lab` repository → set build command
  `npm run build:frontend` and output directory `frontend/public`.

Until one of these happens, do not fabricate a Cloudflare resource ID, database ID, or URL anywhere
in this project's docs or config.

## 16. Recovery Instructions — What to Read First

A future session picking this project up cold should read, in this order:

1. **This file** — current state, what's locked, what exists, what's blocked (§15).
2. **`skills/git_learning_lab/engineering/SKILL.md`** and **`skills/git_learning_lab/ux_ui/SKILL.md`**
   — the operating methodology for any implementation work.
3. **`docs/SCOPE.md`** — what's actually in v0.9 vs. deferred.
4. **`docs/REQUIREMENTS.md`** — concrete, testable requirements by capability.
5. **`docs/LEARNING_OBJECTIVES.md`** — the curriculum structure, derived from the PDF.
6. **`docs/ARCHITECTURE_DECISIONS.md`** — locked technical decisions and their rationale, including
   ADR-012's provisional PBKDF2 value and ADR-014's toolchain choice.
7. **`docs/Git & GitHub.pdf`** — the curriculum ground truth itself; re-check it directly whenever a
   curriculum question arises rather than trusting a summary.
8. **Live inspection** — run `git status`, `git remote -v`, and `npx wrangler whoami` before assuming
   §9/§10/§15 above are still accurate; this document reflects state at authoring time and can go
   stale the moment the Owner clears the STOP in §15.

Do not begin implementation from memory of a prior conversation alone — verify against the live
repository and Cloudflare state first.
