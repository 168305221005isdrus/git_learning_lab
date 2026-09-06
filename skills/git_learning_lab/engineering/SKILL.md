---
name: git-learning-lab-engineering
description: Engineering operating model for Git Learning Lab — an interactive Git/GitHub teaching platform (simulator, visualizer, lessons, challenges, quizzes, progress tracking) built toward a classroom-usable MVP. Use this skill for any Git Learning Lab architecture, simulator-logic, persistence, security, testing, or release-readiness session, so behavior stays consistent and risk-proportionate under the September 12, 2026 MVP deadline.
---

# Git Learning Lab Engineering Skill v1

This file governs **how** to build Git Learning Lab, not **what** it currently contains — read
`docs/PROJECT_CONTEXT.md` (once it exists) for current state. It is a **risk-proportionate**
operating model: a lesson-copy fix and a change to `git reset`'s state-transition logic both live
in this project, and they must not cost the same review effort. Read only as much of this file as
the task's risk tier (§3) requires.

This is a **from-scratch skill**, not an edit of any other project's methodology. Where this file
draws a general engineering principle that another project also uses, that is coincidence of good
practice, not inheritance — nothing here should be assumed to carry hidden assumptions from a
document-archive/RBAC domain. This project has no file-ownership model, no multi-tenant boundary,
and no legacy-compatibility debt yet; do not invent process for risks that do not exist here.

**Production is cloud-first on Cloudflare** (Pages/Workers/D1, §11) — the local path
`C:\xampp\htdocs\git_learning_lab` is **development only** and is never the production target.
Nothing in this file should be read as designing around PHP/Apache, production MySQL/MariaDB, local
filesystem persistence, or a permanently-running development PC — see §11 for the locked
architecture.

---

## 0. Mission & Priorities

Git Learning Lab teaches Git and GitHub to beginners through structured lessons, a safe simulated
terminal, a live state visualizer, practice challenges, quizzes, and persisted learner progress —
first for self-study, second as a classroom teaching aid. `docs/Git & GitHub.pdf` is the
authoritative source of course scope and terminology (§9).

**Hard release constraint**: the Classroom MVP (Lesson + Simulator + Visualizer + Challenge + Quiz
+ Progress + Cheat Sheet + Responsive/Security/Testing + Deployment) must be ready for real student
use by **Saturday, September 12, 2026**. Every process decision in this file is calibrated against
that date: protect what actually breaks the product or misteaches Git; defer ceremony that doesn't.

When priorities conflict, resolve in this order:

1. **Git semantic correctness** — the simulator must never teach a wrong mental model of real Git.
   A convincing-looking but semantically wrong simulator is worse than a smaller, correct one.
2. **Curriculum fidelity** — content matches `docs/Git & GitHub.pdf`'s scope and terminology unless
   an explicit Owner Decision (§9) says otherwise.
3. **Learner data integrity & privacy** — a learner's account, progress, quiz, and challenge results
   are never silently lost, corrupted, or exposed to another learner.
4. **Security baseline** — authentication, safe command-input handling, and validation-integrity
   invariants (§5, §8, §13) are never weakened to save time.
5. **Shipping the Classroom MVP on time** — real deadline, real students. Scope control (§21) exists
   specifically to protect this priority from process creep and from feature creep alike.
6. **Regression safety** — a fix or feature does not break a previously-working lesson, simulator
   command, or challenge.
7. **Production readiness at MVP scope** — deployable, documented, backed up — sized to what the
   MVP actually needs, not a hypothetical future scale.
8. **Everything else** (analytics depth, teacher dashboard, extra content, visual polish beyond the
   UX skill's baseline) — explicitly lower priority; see §21.

**Authority**: the Project Owner resolves genuinely ambiguous curriculum, scope, or product
questions (§9). No accumulated precedent or task framing overrides this file's safety rules
(§5, §8, §13) or the locked Owner Decisions in §9.1.

---

## 1. Source-of-Truth Hierarchy

Read in this order; each level can be stale relative to the one below it — investigate disagreement,
don't silently pick a side:

1. **This file** — methodology. Rarely changes.
2. **`docs/Git & GitHub.pdf`** — authoritative source of course scope, sequencing, and terminology
   (§9). Overrides any contrary assumption in code, content, or a prior session's memory.
3. **`docs/PROJECT_CONTEXT.md`** (once created) — current project state and recovery/handoff doc.
4. **The active phase's plan/task notes** (once phase docs exist) — the concrete, checkpointed plan
   actually being worked.
5. **The live codebase** — read the files; don't infer simulator behavior from a diagram alone.
6. **The live database** (once persistence exists) — read-only inspection whenever state matters.

A curriculum claim in code or UI copy that contradicts the PDF is a defect, full stop, unless a
dated Owner Decision (§9) records an explicit deviation.

---

## 2. Risk Classification

Classify from the mechanism actually touched, verified in the code, not from how the task was
worded. Pick the highest tier any criterion triggers.

- **LOW** — lesson-copy wording fixes (that don't change taught facts), cosmetic UI, cheat-sheet
  formatting, comments/docs, adding a test with no production-code change.
- **MEDIUM** — ordinary feature work that doesn't touch simulator state-transition logic,
  challenge/quiz validation logic, authentication, or persisted-progress schema; a new lesson whose
  content is verified against the PDF; UI following existing patterns.
- **HIGH** — any change to the Git-state simulator's state-transition logic (§6–§8); any change to
  challenge/quiz validation logic (§13); any change to how learner progress/results are persisted or
  read (§14); any authentication/session/authorization change (§17); any change that adds a Git
  command or concept not currently in `docs/Git & GitHub.pdf` (§15) — this last one is HIGH by
  definition regardless of how small the code change looks, because it is a curriculum-authority
  decision, not just a code change.
- **CRITICAL** — anything that could let one learner read, modify, or delete another learner's
  account, progress, or results; anything that could let a Student, Teacher, or Admin gain a
  capability their role doesn't hold (§16), including a Teacher/Admin path exposing another class's
  or another user's private data; anything that could let simulated-terminal input reach a real
  shell, `eval`, or filesystem-executing API (§10); any irreversible learner-data operation.

Escalate one tier when unsure whether a change is incidental or central to a HIGH surface above.

---

## 3. Lifecycle Router

Lightweight, matched to the MVP deadline — heavier than "just ship it," far lighter than a
multi-stage enterprise migration process.

| Work class | Process |
|---|---|
| LOW (copy, cosmetic, docs) | Make the change → spot-check accuracy → done. No review gate required. |
| MEDIUM (ordinary feature, non-simulator) | State the change in one sentence → implement → run relevant regression (§19) → done. |
| HIGH (simulator logic, validation logic, progress schema, auth, new-command curriculum decision) | Write the state-transition spec or Owner Decision **before** implementing (§9, §12) → implement → run the transition-test corpus (§19) → self-review against §5/§8/§13 invariants → done. |
| CRITICAL (cross-learner data exposure risk, sandbox-escape risk, irreversible data op) | Same as HIGH, plus: a second look (self, at minimum a fresh re-read after a break; a second person if available) specifically hunting for the failure mode named in §2, before it ships. Never ship same-session with no re-check. |

No work below HIGH requires a written plan document. HIGH/CRITICAL work requires only a short
written note (in a commit message, PR description, or task file) stating: what state/behavior
changes, what was verified, what could break. This is intentionally lighter than a formal Phase
Contract — reintroduce heavier tracking only if this project reaches a scale where lightweight notes
stop being enough (a later, explicitly-decided change to this file, not a default).

---

## 4. Investigation / Troubleshooting Discipline

General loop: **observe → reproduce → localize → form competing hypotheses → falsify → root cause →
minimum safe fix → verify → document only what's durable.**

Domain-specific heuristics:

- **Check the mechanism, not just the triggering command.** If `git reset --hard` mishandles a
  precondition, check whether `git checkout`, `git commit`, or any other command shares the same
  underlying state-read logic — a fix to one call site that leaves a sibling with the same bug is a
  simulator correctness defect, not just an incomplete fix.
- **A simulator bug is not "just a bug" — treat a wrong state transition as a curriculum defect
  too.** If the simulator ever allows a transition real Git would reject (or rejects one real Git
  allows), that is at minimum MEDIUM severity even if no test currently catches it, because a
  learner may internalize the wrong model.
- **Prefer the hypothesis fastest to falsify** when several are plausible.
- **An unreproducible simulator bug is not evidence of "no bug."** Re-derive the exact command
  sequence and starting state before concluding a report was wrong.
- **When a report disagrees with the PDF**, resolve by re-reading the PDF section, not by assuming
  either the report or the current implementation is right.
- **Near a context limit mid-investigation**, write the current hypothesis and evidence to a durable
  file before continuing.

---

## 5. Core Invariants

These hold across all work unless the Project Owner explicitly, deliberately changes one via §9. "It
would be faster to skip this" is never sufficient justification.

- **No real shell/process/filesystem execution from simulated terminal input, ever** (§10). This is
  the single most important invariant in this project — see §10 for full detail.
- **The simulator's internal Git-state object is the single source of truth.** The terminal display,
  the visualizer, and challenge/quiz validation all read from it; none maintains an independent copy
  that can drift (§6).
- **Every simulator command transition is deterministic**: the same starting state plus the same
  input always produces the same resulting state and the same displayed output. No wall-clock- or
  randomness-dependent branching in state logic (commit timestamps/IDs may be generated, but must
  not affect *which* transition occurs).
- **Challenge and quiz results are computed in the Cloudflare Worker (server-authoritative) from the
  authoritative current state — never accepted as a client-reported boolean** (§11, §13).
- **A learner's persisted progress/results are never silently lost, duplicated, or overwritten by a
  concurrent session** (§14) — and are never readable by another learner, and never accessible via a
  role capability the requester doesn't actually hold (§16, §17).
- **No curriculum content asserts a Git behavior that contradicts `docs/Git & GitHub.pdf`**, and no
  command/concept absent from the PDF is presented as in-scope, without a dated Owner Decision (§9,
  §15).
- **Authentication uses a secure, established password hashing/KDF appropriate to the Cloudflare
  Workers runtime** (§17) — never a custom or reversible scheme; a temporary Admin-issued recovery
  credential is never valid indefinitely and is invalidated the moment it's used (§18).

---

## 6. Git Simulator Architecture

The simulator is a **state machine**, not a string-matcher. It has three layers, kept strictly
separate:

1. **State model** (§7) — a plain data structure representing the current simulated repository:
   working directory contents and tracked/modified flags, staging area contents, local commit graph,
   branches and HEAD, and zero or more simulated remotes with their own commit graphs.
2. **Command engine** — takes (current state, parsed command) and produces (new state, output text,
   optional error). Pure with respect to the state object: given the same inputs, always the same
   outputs (§5). Contains the actual Git semantics (§8).
3. **Presentation layer** — terminal rendering and visualizer rendering. Reads the state model and
   the command engine's output text; never mutates state directly, never re-implements Git logic to
   decide what to display.

Any code that decides "did this command succeed, and what changed" belongs in the command engine,
never in UI code, never in a challenge/quiz checker directly re-implementing the rule. Challenge and
quiz checkers call the command engine / read the state model; they do not duplicate its logic.

This entire state machine runs **primarily in the learner's browser** (§11) — ordinary simulated Git
commands are not round-tripped to a Cloudflare Worker. Only the results that must be
server-authoritative (challenge/quiz pass-fail, persisted progress) cross the network boundary into
a Worker, per §11's responsibility split.

---

## 7. Git State Model

The state model must represent, at minimum, the concepts the PDF teaches (§9, §15):

- **Working Directory** — files present in the simulated project folder, each with a status of
  untracked, tracked-and-unmodified, or tracked-and-modified relative to the last commit.
- **Staging Area / Index** — the set of changes marked (via `git add`) for the next commit, distinct
  from both the working directory and the last commit.
- **Local Repository** — the commit graph: an ordered/parented set of commits, each with an ID,
  message, author/timestamp, and a snapshot (or diff) of staged content at commit time.
- **Branches** — named pointers into the local commit graph. `master`/default branch exists
  implicitly after `git init`.
- **HEAD** — a pointer to the currently checked-out branch (or, if later supported, a specific
  commit). Moves on `git checkout`/branch switch; determines what "the current commit" means for
  every other command.
- **Remote Repository (simulated)** — a separate commit graph and branch set representing a
  GitHub-like remote, kept genuinely independent of the local repository until an explicit
  `push`/`pull`/`clone`/`fetch`-equivalent action synchronizes them (per the PDF's own DVCS
  distinction, §9).

Tracked-status vocabulary in code, UI, and content must use the PDF's own terms — **Modified /
Staged / Committed** — not invented synonyms (§9, §15).

---

## 8. Deterministic Command Transitions & Per-Command Specification

**Before implementing or changing any simulator command's behavior (HIGH risk, §2), write down**:

- **Preconditions**: what must be true of the current state for this command to do anything (e.g.,
  `git commit` requires at least one staged change, or an explicit allowance for an empty commit if
  the PDF ever covers that — it currently does not, so empty commits are out of scope, §15).
- **Effect**: exactly what state changes on success (which files move from staged to committed, what
  the new HEAD points to, etc.).
- **Postconditions**: what must be true of the resulting state (e.g., after `git commit`, the staging
  area for the committed files is empty and a new commit exists as a child of the prior HEAD commit).
- **Error states**: what happens when preconditions are not met — a specific, non-generic message
  reflecting the actual reason (e.g., "nothing to commit, working tree clean" style, matching real
  Git's own behavior class), never a silent success and never a bare "invalid command."

**Canonical example (from the source brief)**: `git commit -m "test"` issued when nothing is staged
must **not** produce a new commit. The command engine must inspect the staging area's actual
contents, find it empty relative to HEAD, and return the no-staged-changes error state — the same
way it would if the command string were syntactically perfect. Syntax validity is necessary, never
sufficient, for a state-changing command to succeed.

This specification is written as part of the HIGH-risk change itself (§3's lifecycle note) — it does
not need a separate document, but it must exist somewhere durable (code comment, PR description, or
test description) before the code is considered done.

---

## 9. Curriculum Fidelity & Supplemental-Material Rule

### 9.1 Locked Owner Decisions (current as of this file's authoring)

This list accumulates every locked Owner Decision, not only curriculum ones — curriculum-specific
rules are detailed in this section; other domains are detailed in their own cross-referenced
sections below.

- **Persistence for Classroom MVP**: the first classroom release includes real persisted user
  accounts, lesson/module progress, quiz results, and challenge results where needed. Complex
  analytics infrastructure is explicitly not required yet (§14, §21).
- **Teacher Dashboard timing**: a full teacher/classroom dashboard is deferred until after the
  Classroom MVP core is stable and is not a prerequisite for the first release — but the Teacher
  **role/account itself** is in scope for v0.9 (§16, §21).
- **Curriculum terminology**: `docs/Git & GitHub.pdf` is the authoritative source for current course
  scope and terminology. Content not present in the PDF — including but not limited to `git switch`,
  `git restore`, `git rebase`, `.gitignore`, Pull Request workflows, and other GitHub features beyond
  what the PDF covers — is **supplemental material** and must not be added silently. Adding any such
  material requires a fresh, explicit Owner Decision, recorded with a date and rationale.
- **Production cloud architecture**: locked to GitHub + Cloudflare Pages + Cloudflare Workers +
  Cloudflare D1, free-tier only, detailed in full in §11.
- **User/role model for v0.9**: three roles — STUDENT, TEACHER, ADMIN — detailed in full in §16.
- **Password recovery for v0.9**: Admin-mediated temporary credential, no email-delivery integration
  yet, detailed in full in §18.
- **Free-tier/scale assumption**: design for ~31 real accounts in one class, not hypothetical scale,
  detailed in full in §20.

### 9.2 Owner Decision Protocol (general mechanism)

Distinguish three kinds of statement in any design discussion: **technical facts** (verifiable by
reading the PDF or the code), **engineering recommendations** (reasoned, alternatives visible), and
**genuinely ambiguous curriculum/product/business decisions** that only the Project Owner can settle
(e.g., "should we teach `git switch` alongside `git checkout` once the PDF's scope is exceeded?").
Never invent an answer to the third kind and present it as settled. When a HIGH-risk change (§2)
depends on such a decision, stop and ask before implementing, stating: the question, the realistic
options, a recommendation, and what it blocks.

---

## 10. Safe Command-Parser Boundary (Non-Negotiable)

Learner-typed terminal text is untrusted input. The parser boundary is:

- Raw input text is parsed into a constrained grammar of recognized Git-subcommand tokens and their
  documented flags/arguments (only the subset covered by the PDF, §15). Anything outside that
  grammar produces a "command not recognized" response — it is never passed through to anything that
  executes code, spawns a process, evaluates a string as code, or touches the real filesystem.
- **There is no code path, in any environment (dev, staging, production), where terminal input
  reaches a real shell, `eval`/`Function`-style dynamic code execution, or a real filesystem write
  outside of the simulator's own in-memory/persisted state model.** This is a CRITICAL-tier invariant
  (§2) — any change that even appears to blur this boundary requires the CRITICAL-tier second look
  before shipping.
- File names, commit messages, branch names, and other learner-supplied strings inside the
  simulation are treated as data (displayed safely, escaped for HTML/XSS per §17) — never as code,
  never as shell arguments to anything real.

---

## 11. Production Architecture & Cloud Responsibility Split (Locked)

**Production stack, locked**: GitHub (canonical source repository) → **Cloudflare Pages**
(frontend hosting) → **Cloudflare Workers** (backend/API) → **Cloudflare D1** (persistent database).
Initial production URL is a Cloudflare-provided `*.pages.dev` domain — no paid domain required for
v0.9. Cost target is **0 THB infrastructure cost**: stay within free-tier limits for Pages, Workers,
and D1; no paid hosting or VPS for the Classroom MVP.

**Local development vs. production**: `C:\xampp\htdocs\git_learning_lab` (XAMPP) is local
development only and must never be described or designed as the production target. Do not design
the production application around PHP hosting, Apache, production MySQL/MariaDB, local filesystem
persistence, or a permanently-running development PC. Cloudflare Pages/Workers/D1 are the deployment
target from the beginning of implementation, not a later migration.

**Deployment flow**: local development → `git commit` → GitHub repository → Cloudflare deployment →
public `*.pages.dev` application. The application must be reproducibly deployable from a clean
GitHub checkout — never dependent on a file that exists only on the Owner's local machine. Secrets
and environment-specific configuration are never committed to Git; they live in Cloudflare's own
environment/secrets mechanism (see §24).

**Cloud responsibility split** — this is the concrete, this-project instantiation of §6's
state-model/command-engine/presentation-layer split, and of every "server-side" / "non-bypassable
module" reference elsewhere in this file (§5, §13, §17): read "server-side" as "the Cloudflare
Worker" throughout.

| Layer | Owns |
|---|---|
| **Frontend / Browser** | Lessons, terminal UI, the Git simulator state machine (§6–§8), the visualizer, ordinary client-side interaction. The simulator runs primarily in the browser. |
| **Cloudflare Workers** | Authenticated API operations, security-sensitive operations, persisted learner progress/results reads and writes, server-authoritative challenge/quiz validation (§13), account operations including password recovery (§18). |
| **Cloudflare D1** | User/account records, lesson/module progress, quiz results, challenge results, and other minimal MVP persistence only when justified (§14) — no data stored here beyond what a shipped feature actually needs. |

**Do not send every simulated Git command to the Worker.** Ordinary command execution (§6–§8) stays
entirely client-side; only the specific operations that must be server-authoritative (§5, §11's
table above) cross the network boundary at all.

**Scale**: ~31 real accounts (29 Student + 1 Teacher + 1 Admin, §16) in a single class. Design
cleanly and correctly, but do not build distributed-system or enterprise-scale infrastructure for
this scale (§20).

---

## 12. Testing & Simulator Regression Requirements

Every HIGH-risk simulator or validation change (§2) ships with **transition-oriented tests**, not
just unit tests of isolated functions. Minimum shape:

```
GIVEN: initial state
WHEN:  git init
  AND: git add .
  AND: git commit -m "Initial commit"
THEN:  staging area is empty; local repo has exactly one commit;
       HEAD points to that commit on the default branch
```

And explicitly, for every command with meaningful preconditions, at least one **invalid-sequence**
test:

```
GIVEN: initial state after git init (nothing staged, nothing committed)
WHEN:  git commit -m "test"
THEN:  no new commit is created; an appropriate "nothing to commit" error state is returned
```

**Minimum regression corpus for the MVP**: one happy-path and at least one invalid-sequence test for
each command in scope (§15): `init`, `add`, `rm`, `status`, `commit`, `log`, `diff`, `checkout`
(file-revert), `reset` (soft/mixed/hard, each as a distinct case per the PDF's own distinction, §9), `branch`,
`checkout` (branch-switch), `merge` (including at least one auto-mergeable case), `push`, `pull`,
`clone`. Where feasible, derive test cases directly from the PDF's own worked examples so the
simulator is checked against the same source the lessons teach from.

A HIGH-risk change is not "done" until its transition tests exist and pass, and the existing
regression corpus still passes (nothing else broke).

---

## 13. Challenge & Quiz Validation Integrity

- Challenge success/failure is computed by re-reading the authoritative simulator state at
  validation time, in the Cloudflare Worker (§5, §6, §11) — never by trusting a value the client
  claims (e.g., a `challengeComplete: true` flag sent from the browser with no Worker-side
  re-derivation).
- Quiz scoring logic lives in one place, reused by every quiz — no per-quiz hand-rolled scoring that
  can silently drift from the shared rule.
- A validation rule change (what counts as "passed") is HIGH risk (§2): write down what changed and
  verify it against the lesson it belongs to before shipping.

---

## 14. Persistence, Data Model & Progress Integrity

Per Owner Decision (§9.1), the Classroom MVP persists, in **Cloudflare D1** (§11): user accounts,
lesson/module progress, quiz results, and challenge results where needed. All reads/writes to D1 go
through the Cloudflare Worker (§11) — the browser never talks to D1 directly.

- A learner who signs out and returns later, on any device, retains their progress — this is a
  functional requirement, not an optimization.
- Writes that update progress/results are structured so a retry or a dropped connection cannot
  silently duplicate or lose a result (e.g., an idempotent upsert keyed by learner+lesson/challenge,
  not a blind insert).
- Every read/write is scoped to the authenticated user's own identity and role (§16, §17) — a
  Student, Teacher, or Admin capability is enforced in the Worker, never inferred from a
  client-supplied field.
- No destructive operation on learner data (account deletion, progress reset) ships without a
  confirmed, deliberate trigger and a clear statement of what is and isn't recoverable — full backup
  automation and rehearsed-restore drills are not required at MVP scale, but a basic, verified D1
  backup/export before any schema-changing deploy is required (§24).
- Schema changes to learner-data tables are HIGH risk (§2): note what changes, confirm existing rows
  remain valid or are migrated via a reproducible D1 migration (§24), and confirm the app still
  reads/writes correctly after the change.

---

## 15. Supplemental Material Rule (Detail)

A "new Git concept" is anything a learner would need to be taught to use — a command, flag, or
workflow not covered by `docs/Git & GitHub.pdf`. Before adding one:

1. Confirm it is genuinely absent from the PDF (re-check the specific section, don't assume).
2. If absent, treat it as HIGH risk (§2) and raise it as an Owner Decision (§9) — do not add it to
   lessons, the simulator's recognized-command grammar, the cheat sheet, or challenges without that
   decision recorded.
3. Once approved, the decision and its scope (which lesson, which commands) are recorded in
   `docs/PROJECT_CONTEXT.md` (once it exists) so future sessions don't re-litigate it.

This rule exists specifically to prevent silent modernization or scope drift away from the
instructor's material (§0, §9.1).

---

## 16. User & Role Model (v0.9, Locked)

Three roles for v0.9 — no Study-Archive-style RBAC/tenant hierarchy. Authorization stays minimal and
explicit for exactly these three roles; do not build a general permission/scope system for a
hypothetical fourth role.

- **STUDENT** — learn lessons, use the simulator, complete challenges, take quizzes, view their own
  progress only.
- **TEACHER** — exists as a distinct account/role in v0.9 and may use the learning platform (lessons,
  simulator, challenges, quizzes) the same way a Student does. Full Teacher Dashboard / classroom
  analytics is **deferred** (§9.1, §21) — the account/role itself is not deferred and is not gated on
  the dashboard shipping.
- **ADMIN** — the Project Owner; account/system administration capability, including issuing and
  managing password-recovery credentials (§18).

**Expected v0.9 population**: 29 Student + 1 Teacher + 1 Admin = 31 accounts. This informs the
free-tier/scale discipline (§20); it is not a hard limit enforced in code.

**Enforcement**: every Worker endpoint that reads or writes account/progress/result data checks the
authenticated caller's role server-side (§11, §17) before acting — a role is never inferred from a
client-supplied field, and a user can never grant themselves a higher role. When a Teacher Dashboard
is eventually built, it must be scoped so a Teacher sees only their own class's learners, never
platform-wide data, unless a separate Owner Decision says otherwise.

---

## 17. Authentication & Security Baseline

Sized for a classroom MVP on Cloudflare (§11), not an enterprise platform — but never skipped.
Stated in runtime-appropriate terms; **architecture/P0 selects the concrete library/mechanism**, not
this file:

- **Passwords**: a secure, established password hashing/KDF appropriate to the Cloudflare Workers
  runtime — never a custom scheme, never reversible encryption. This file does not prescribe a
  specific library; it prescribes the property (secure, established, one-way).
- **Sessions/tokens**: secure cookies or tokens appropriate to the chosen auth design, with
  session-fixation protection and secure transport (`secure`/HTTPS, reasonable `samesite` if cookies
  are used).
- **Cross-learner and cross-role data isolation**: every Worker operation that reads or writes
  progress/results/account data is scoped server-side to the authenticated caller's own identity
  *and* role (§16) — never inferred from a client-supplied ID or role field alone. A user must never
  be able to view or modify another user's data, or act with a role they don't hold, by manipulating
  a URL, form field, or API parameter.
- **CSRF protection** on state-changing requests (progress updates, quiz submissions, account
  actions) **where the selected authentication mechanism makes CSRF applicable** — e.g., required for
  cookie-based session auth; a purely bearer-token auth design may close this class of attack
  differently, but the underlying requirement (a state-changing request cannot be forged by another
  site) must be met one way or another.
- **Input handling**: all learner-supplied text (commit messages, branch names, profile fields,
  free-text quiz answers if any) is safely escaped on output — standard XSS prevention. This is
  independent of, and in addition to, the command-parser boundary in §10.
- **Secrets and environment-specific configuration** are stored using Cloudflare's own
  environment/secrets mechanism and are never committed to Git (§11, §24).
- **No unrestricted shell execution anywhere in the deployed application**, not just in the
  simulator's command path (§10) — the same rule applies to any admin tooling, build scripts invoked
  at runtime, or file-upload handling if added later. No learner input ever reaches a real shell,
  `eval`, or process-execution API, in the Worker or anywhere else.
- **HTTPS in production** — Cloudflare Pages/Workers serve HTTPS by default; never weaken this.
- **Teacher role**: the Teacher account/role exists in v0.9 (§16); when Teacher-specific tooling
  (dashboard/analytics) is eventually built, it must be scoped so a Teacher sees only their own
  class's learners, never platform-wide data, unless a separate Owner Decision says otherwise.

### 17.1 Privacy Baseline

- Collect only data needed for the learning function (account identity, progress, results). No
  assumption is made about whether learners are minors or adults — the same minimal-collection
  discipline applies either way.
- Avoid unnecessary PII — no collection of fields not actually used by a shipped feature.
- Persisted progress/results are protected data: never exposed to another learner (§17), never
  exposed in a public-by-default API response, never logged in plaintext application logs beyond
  what's needed for debugging (and scrub before sharing logs externally).

---

## 18. Password Recovery (v0.9, Locked)

Self-service email password reset is **deferred** — no email-delivery integration is required for
the September 12, 2026 v0.9 Classroom MVP (§21).

**v0.9 recovery flow**: a Student or Teacher who forgets their password contacts the Admin → the
Admin issues a temporary password/reset credential → the user signs in with it → the system requires
the user to immediately set a new private password.

**Locked security requirements** (concrete implementation mechanism is an architecture/P0 decision,
not fixed here):

- The Admin can never view or recover a user's old password — passwords remain securely hashed
  (§17) at all times; there is no "look up the password" path, only "issue a new temporary one."
- A temporary credential is not valid indefinitely — it expires or is single-use.
- A successful forced password change invalidates the temporary recovery state immediately (it
  cannot be reused after the user has set their own password).

**Future**: self-service email password reset may be added only after a suitable free
transactional-email service is explicitly selected and approved via a fresh Owner Decision. Do not
introduce an email provider in v0.9.

---

## 19. Testing & Regression Coordination

- Every HIGH-risk change (§2) runs its own transition tests (§12) plus the existing regression
  corpus for the simulator and for authentication/data-isolation.
- Every change touching a screen or interaction also satisfies the UX/UI skill's runtime-verification
  triggers (`skills/git_learning_lab/ux_ui/SKILL.md` §11) — Engineering does not duplicate that
  checklist here; it hands off to it for anything visual/interactive.
- LOW/MEDIUM content-only changes are spot-checked for accuracy against the PDF (§1) but do not
  require the full transition-test corpus unless they touch simulator or validation logic.

---

## 20. Free-Tier & Scale Discipline (Locked)

Initial real-world scale is approximately 31 accounts (§16) in one class. Design cleanly and
correctly, but do not build unnecessary distributed-system or enterprise-scale infrastructure —
optimize for correctness, simplicity, Cloudflare free-tier compatibility (§11), reliable classroom
use, and shipping before September 12, 2026, not for hypothetical thousands/millions of users.

Concretely: no queueing/sharding/multi-region infrastructure, no premature caching layers, no
speculative horizontal-scale design. Re-evaluate this discipline only if the Project Owner records a
scale-change decision (§9) — don't preemptively engineer for growth that hasn't been decided.

---

## 21. Scope Control for the September 12 Release

Explicitly **in scope** for the Classroom MVP, per Owner Decision (§9.1): Lesson modules, Simulator,
Visualizer, Challenges, Quizzes, Progress persistence, Cheat Sheet, User accounts for the three v0.9
roles (§16) with Admin-mediated password recovery (§18), Responsive behavior, Security baseline
(§17), Testing (§12, §19), Deployment (§24).

Explicitly **deferred**, not to be treated as blocking the release, and not to be built "while we're
in there" without a fresh Owner Decision:

- Full Teacher Dashboard / classroom analytics tooling (§9.1, §16) — the Teacher **account/role**
  itself is in scope and not deferred.
- Complex analytics infrastructure beyond what's needed to show a learner their own progress.
- Self-service email password reset and any email-delivery integration (§18) — v0.9 uses the
  Admin-mediated recovery flow only.
- Social features, leaderboards, or extensive gamification (coordinate with the UX skill's
  anti-gamification rule).
- Any Git command/workflow beyond `docs/Git & GitHub.pdf`'s current scope (§15).
- Any authorization model beyond the three explicit v0.9 roles — STUDENT, TEACHER, ADMIN (§16) —
  there is no file-ownership, tenant-hierarchy, or general permission/scope system in this project.
- Any "compatibility arc" / legacy-migration machinery — there is no legacy schema yet to migrate
  away from.
- Real unrestricted shell/eval execution in any form (§10) — never in scope, not even temporarily.
- Any paid hosting, VPS, paid domain, or infrastructure exceeding Cloudflare free-tier limits (§11,
  §20) — the MVP cost target is 0 THB infrastructure cost.
- Distributed-system or enterprise-scale infrastructure not justified by the ~31-account scale (§20).

A cleanup or improvement idea noticed outside the current task's footprint is noted for later, not
folded into the current change (this applies to both directions: don't let a small fix balloon into
scope creep, and don't let "we're close to the deadline" become an excuse to skip §5/§8/§13
invariants).

---

## 22. STOP Conditions

Stop and get an explicit Project Owner decision — don't guess, don't silently default — whenever:

- A curriculum question is genuinely ambiguous relative to the PDF (§1, §9).
- A request would add a Git command/concept outside the PDF's current scope (§15).
- A change would let simulated terminal input reach real shell/eval/filesystem execution (§10) —
  this should never even be proposed as a shortcut; if it's ever about to happen, stop immediately.
- A change would let one user's data be visible or writable by another user, or let a Student,
  Teacher, or Admin act with a role capability they don't hold (§16, §17).
- A schema change to learner-data tables has no clear migration path for existing rows.
- A proposed design would require paid hosting, a paid domain, or would exceed Cloudflare free-tier
  limits for the MVP (§11, §20) — surface the trade-off rather than quietly accepting a cost.
- The September 12 deadline is at genuine risk and a scope trade-off decision is needed — surface it
  early via §21's deferred list rather than silently cutting a §5 invariant to save time.

---

## 23. Completion-Report Standard

Every non-trivial session (MEDIUM and above) closes with a short note covering:

1. **What changed** — files/behavior, in one or two sentences.
2. **Risk tier** (§2) and why.
3. **Verification performed** — which tests ran, what was checked against the PDF, what UX
   verification (if any) was coordinated per §19.
4. **Curriculum/data-integrity confirmation** — explicit "no PDF contradiction introduced" /
   "no cross-learner data exposure" statement for anything HIGH+.
5. **Deviations or open questions** — anything that didn't go as planned, anything needing an
   Owner Decision.
6. **Next step** — plainly, not a menu.

LOW-risk sessions can skip this in favor of a one-line summary.

---

## 24. Deployment & Production Readiness

Sized to the MVP, not to a multi-year system — but the cloud-first architecture (§11) is not
optional, and none of the following depends on the Owner's local machine being on:

- **GitHub is the canonical source repository.** Production is deployed from it, not from a local
  working copy — a clean `git clone` of the repository plus documented Cloudflare setup is
  sufficient to reproduce the deployment.
- **Cloudflare configuration is documented**: which Pages project, which Worker(s), which D1
  database, and how they're bound together (Pages/Workers/D1 bindings) — reproducible by reading the
  docs, not by tribal knowledge of one machine's setup.
- **D1 schema/migrations are reproducible**: a fresh D1 database can be brought to the current schema
  from documented migration steps, not by copying an undocumented live database by hand.
- **Environment variables/secrets are documented without exposing values** — what exists and what
  it's for, stored via Cloudflare's own environment/secrets mechanism (§11, §17), never committed to
  Git.
- A verified D1 backup/export exists before any schema-changing deploy (§14) — "verified" means
  confirmed restorable, not merely "an export file exists somewhere."
- **The production URL is smoke-tested after every deploy** — confirm the live `*.pages.dev` app
  actually loads and a core flow (sign-in, one lesson, one simulator command) works, not just that
  the deploy step reported success.
- Basic error handling ensures a runtime failure shows the learner a safe, generic message — never a
  raw stack trace, SQL error, or file path (this is a direct extension of §17's input-handling rule
  to the output side).
- **Rollback uses a prior known-good Git/deployment version** (redeploy an earlier commit/tag) — full
  rehearsed rollback drills are not required at MVP scale, but "we have never actually tried rolling
  back" is a gap worth closing before September 12, not after.
- **The XAMPP/local machine is never required for production uptime** — if the Owner's PC is off,
  the deployed Cloudflare application keeps running.
- Basic uptime/error observability (Cloudflare's own logs/analytics, reviewed periodically) is enough
  for MVP; no dedicated third-party observability stack is required yet.

---

## 25. Version History

**v1** (this file, authored ahead of the September 12, 2026 Classroom MVP): written from scratch for
Git Learning Lab, informed by a migration/adaptation analysis of an unrelated prior project's
engineering methodology but not copied from it. Encodes three locked Owner Decisions (§9.1):
persisted accounts/progress/quiz/challenge data for the MVP with no complex analytics yet; teacher
dashboard deferred; `docs/Git & GitHub.pdf` as sole curriculum authority with supplemental material
requiring explicit approval. Deliberately omits: RBAC/tenant/file-ownership machinery, destructive-
retirement/compatibility-arc process, phase-contract ceremony, and any allowance for real shell/eval
execution from simulated input — none of these fit this project's current risk profile or timeline.

**v1.1** (architecture-alignment revision, same pre-MVP period): incorporated four further locked
Owner Decisions made after v1 — production cloud architecture (GitHub + Cloudflare Pages/Workers/D1,
free-tier, §11), the v0.9 Student/Teacher/Admin role model (§16), Admin-mediated password recovery
with no email integration for v0.9 (§18), and the ~31-account free-tier/scale discipline (§20).
Repurposed the four previously-reserved section slots (§11, §16, §18, §20) for this new content
specifically to avoid renumbering the rest of the file. Rewrote §17's security baseline in
runtime-appropriate (not PHP-specific) terms per the same decision, corrected the §17/§9.1 "Teacher
access is future-only" language (the Teacher role/account is in scope for v0.9; only the dashboard is
deferred), and rewrote §24's deployment section around the Cloudflare/GitHub flow, removing the
XAMPP-as-production-target framing. No section was renumbered; all pre-existing cross-references
remained valid except the handful corrected in the same pass.
