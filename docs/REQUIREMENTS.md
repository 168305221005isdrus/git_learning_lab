# Requirements — Git Learning Lab v0.9 Classroom MVP

Implementation-oriented, testable requirements. Each ID is unique and stable — reference it in code
comments, tests, and commit messages rather than re-describing the requirement. Requirements marked
**(MVP)** are release-blocking per `docs/SCOPE.md`; requirements marked **(Should)** are not.

---

## AUTH — Authentication

- **AUTH-001 (MVP)**: A user (Student/Teacher/Admin) can sign in with a username/identifier and
  password. An incorrect password is rejected with a generic "invalid credentials" message that does
  not reveal whether the identifier exists.
- **AUTH-002 (MVP)**: Passwords are hashed using PBKDF2-HMAC-SHA256 via the native Web Crypto API
  (see `ARCHITECTURE_DECISIONS.md` ADR-012), with a unique random salt per user and a stored
  iteration count. The plaintext password is never stored or logged anywhere, including error logs.
- **AUTH-003 (MVP)**: A successful sign-in issues an opaque, random session token (see ADR-011),
  delivered via an `httpOnly`, `Secure`, `SameSite=Lax` cookie. The token itself is never exposed to
  JavaScript running on the page.
- **AUTH-004 (MVP)**: Every Worker endpoint that reads or writes user-specific data validates the
  session token against Cloudflare D1 before acting. An invalid, expired, or missing session token
  results in a 401-equivalent response, not a default/anonymous identity.
- **AUTH-005 (MVP)**: A user can sign out; signing out invalidates the session server-side
  (deletes/expires the D1 session row) — the cookie being cleared client-side is not sufficient by
  itself.
- **AUTH-006 (MVP)**: State-changing Worker requests (anything beyond a plain GET) verify the request
  `Origin`/`Referer` matches the application's own origin, mitigating CSRF for the cookie-based
  session design (Engineering skill §17).

## ROLE — Roles / Authorization

- **ROLE-001 (MVP)**: Every user has exactly one role: `STUDENT`, `TEACHER`, or `ADMIN`. There is no
  mechanism for a user to hold more than one role or escalate their own role.
- **ROLE-002 (MVP)**: A Student can access only their own lessons, simulator, challenges, quizzes,
  and progress. A request for another user's progress/results (e.g., by manipulating a URL or API
  parameter) is rejected server-side regardless of what the client sends.
- **ROLE-003 (MVP)**: A Teacher account can sign in and use the full Student-equivalent learning
  experience (lessons, simulator, challenges, quizzes, own progress). No Teacher-only screen or
  Teacher Dashboard is required in v0.9.
- **ROLE-004 (MVP)**: An Admin account can perform the minimum administration functions listed under
  ADMIN-xxx below. An Admin has no special access to another user's learning content beyond what
  administration requires (e.g., an Admin does not get a generic "view all progress" screen unless a
  future Owner Decision adds one).
- **ROLE-005 (MVP)**: Role is resolved server-side from the authenticated session (AUTH-004) on every
  request; it is never accepted as a client-supplied field.

## RECOV — Password Recovery

- **RECOV-001 (MVP)**: There is no self-service "forgot password" flow that sends an email in v0.9.
  No email-provider integration exists anywhere in the codebase.
- **RECOV-002 (MVP)**: An Admin can issue a temporary credential for a specified user account. Issuing
  it does not require or display the user's current password.
- **RECOV-003 (MVP)**: A user who signs in with a temporary credential is immediately required to set
  a new password before accessing any other part of the application.
- **RECOV-004 (MVP)**: A temporary credential expires after a bounded time window (implementation
  sets the exact duration; must not be "indefinite") and/or is single-use — whichever the P1
  implementation chooses, it must satisfy "not valid indefinitely."
- **RECOV-005 (MVP)**: Once a user successfully sets a new password via RECOV-003, the temporary
  credential is invalidated and cannot be reused, even if it hasn't expired yet.
- **RECOV-006 (MVP)**: At no point in the recovery flow can the Admin view, recover, or derive the
  user's previous plaintext password.

## LEARN — Learning Modules

- **LEARN-001 (MVP)**: Every module defined in `docs/LEARNING_OBJECTIVES.md` exists as a distinct,
  navigable unit in the product, in the same order as that document.
- **LEARN-002 (MVP)**: A module's on-screen content (explanations, terminology, example commands)
  matches `docs/Git & GitHub.pdf` — no command, concept, or term appears that isn't traceable to the
  PDF, unless logged as an approved supplemental-material Owner Decision.
- **LEARN-003 (MVP)**: A learner can navigate between modules and see which ones they've started or
  completed (ties to PROG-001).

## FLOW — Lesson Flow

- **FLOW-001 (MVP)**: Every lesson within a module presents, in order: a short explanation, a
  demonstration (a worked example, preferring one drawn from the PDF), a practice step, and feedback
  on the practice attempt. No lesson skips the practice or feedback stage. The form of "practice"
  matches the module's content: in Modules 1–2 (conceptual, no Git commands taught yet), practice is
  a conceptual interactive activity — e.g., matching, sequencing, or scenario selection — not
  simulator/terminal practice, since there is nothing yet to simulate. In Modules 3–7, where the
  lesson teaches actual Git commands, practice uses the simulator/terminal. Modules 1–2 are not
  required to have a simulator Challenge (see CHAL-001) — their practice step is conceptual, not
  simulator-based.
- **FLOW-002 (MVP)**: A lesson's explanation is scannable (short paragraphs/bullets), not a verbatim
  transcription of the PDF's slide text.
- **FLOW-003 (Should)**: A learner can revisit a completed lesson's explanation/demonstration without
  losing their recorded completion status.

## SIM — Git Simulator

Commands in scope (per `docs/LEARNING_OBJECTIVES.md`, derived from the PDF): `init`, `add`, `rm
--cached`, `status`, `commit`, `log`, `diff`, `checkout` (file-revert and branch-switch), `reset`
(`--soft`/`--mixed`/`--hard`), `branch`, `merge`, `push`, `pull`, `clone`.

- **SIM-001 (MVP)**: `git commit` must be rejected — no new commit created — when the staging area is
  empty relative to the current HEAD, regardless of the commit message supplied. This holds even for
  a syntactically well-formed command such as `git commit -m "test"`.
- **SIM-002 (MVP)**: `git add <file>`, `git add *.<ext>`, and `git add .` each move the correct,
  distinct set of matching files from Working Directory (untracked or modified) into the Staging
  Area; files outside the match are left untouched.
- **SIM-003 (MVP)**: `git rm --cached <file>` removes a file from the Staging Area/tracking without
  deleting it from the simulated Working Directory.
- **SIM-004 (MVP)**: `git status` accurately reports, for every file, one of: untracked, modified
  (unstaged), staged, or clean/committed — matching the PDF's Modified/Staged/Committed vocabulary
  exactly (no invented synonyms).
- **SIM-005 (MVP)**: A successful `git commit -m "<message>"` creates exactly one new commit, whose
  parent is the prior HEAD commit, clears the Staging Area for the committed files, and moves HEAD
  (via its branch) to the new commit.
- **SIM-006 (MVP)**: `git log` lists commits with ID, message, author, and timestamp, most recent
  first; `git log --oneline` shows one line per commit; `git log --graph` renders branch topology.
- **SIM-007 (MVP)**: `git diff` against a given commit (or between two commits) shows removed lines
  distinctly from added lines, matching the PDF's convention.
- **SIM-008 (MVP)**: `git checkout <file>` reverts uncommitted changes to that file back to the last
  commit's version, and does not move HEAD or switch branches.
- **SIM-009 (MVP)**: `git reset --soft <commit>` removes commits after `<commit>` from history and
  returns their changes to the Staging Area. `git reset --mixed <commit>` does the same but returns
  changes to the Working Directory instead. `git reset --hard <commit>` does the same and discards the
  changes entirely. These three must produce three distinct, verifiably different resulting states
  for the same starting point.
- **SIM-010 (MVP)**: `git branch <name>` creates a new branch pointer at the current commit without
  moving HEAD. `git checkout <name>` (branch-switch form) moves HEAD to point at that branch.
- **SIM-011 (MVP)**: `git merge <branch>` combines the named branch's history into the current
  branch; when the merge is a straightforward fast-forward or non-conflicting case, it completes
  automatically and produces a state containing both branches' commits.
- **SIM-012 (MVP)**: `git push`, `git pull`, and `git clone` operate on the simulated Local
  Repository and simulated Remote Repository as two genuinely independent commit graphs that only
  synchronize on these explicit actions — no other command silently syncs them.
- **SIM-013 (MVP)**: Given identical starting state and identical command input, the simulator always
  produces identical resulting state and identical displayed output (determinism, no
  wall-clock/random branching in transition logic).
- **SIM-014 (MVP)**: Any input that does not parse as a recognized in-scope command (per this list)
  produces a "command not recognized" response and causes no state change — it is never passed to a
  real shell, `eval`, or filesystem-executing API, under any circumstance.
- **SIM-015 (MVP)**: Every command's error response is specific to the actual failure reason (e.g.,
  "nothing to commit" vs. "not a valid branch name") — never a bare generic "invalid command" for a
  precondition failure.
- **SIM-016 (MVP)**: The state model and command engine (Engineering skill §6 layers 1–2) are
  implemented as one shared, pure module with no DOM APIs (`document`, `window`, browser storage) and
  no Worker-specific APIs (Cloudflare bindings) referenced anywhere inside it. The exact same module,
  unmodified, is imported by both the browser frontend and the Cloudflare Worker (ARCHITECTURE_
  DECISIONS.md ADR-013). There is exactly one implementation of Git command semantics in the
  codebase — never a second, independently-written copy for server-side validation.

## VIS — Visualizer

- **VIS-001 (MVP)**: The visualizer renders four distinct, always-labeled zones — Working Directory,
  Staging Area, Local Repository, Remote Repository — and a file or commit is never shown as
  simultaneously present in two zones.
- **VIS-002 (MVP)**: Every state-changing simulator command (SIM-xxx) produces a visible update in the
  visualizer within the same interaction — no stale visualizer state after a command executes.
- **VIS-003 (MVP)**: The rendered commit graph's parent/child structure and branch divergence points
  match the simulator's actual commit DAG.
- **VIS-004 (MVP)**: HEAD is rendered as a distinct, visible pointer; a branch switch visibly moves it
  rather than silently relabeling the display.

## CHAL — Challenges

Module assessment matrix is locked by `docs/LEARNING_OBJECTIVES.md` — Modules 1–2 are conceptual and
introduce no simulator commands, so no challenge is required for them; Modules 3–6 each require at
least one challenge; Module 7 requires its capstone challenge. Do not add a challenge to Module 1 or
2 "for completeness" — a challenge with nothing to simulate is not a meaningful requirement.

- **CHAL-001 (MVP)**: At least one challenge exists for each of Modules 3, 4, 5, 6, and 7, each with
  a defined starting simulator state and a defined success condition expressed in terms of that
  state. Modules 1 and 2 have no challenge requirement.
- **CHAL-002 (MVP)**: Challenge submission sends the challenge identifier and the learner's command
  transcript (the ordered list of commands they executed in the browser simulator) — never a final
  state snapshot or a `completed`/`passed` boolean. The Cloudflare Worker reconstructs the
  challenge's authoritative starting state and replays the submitted transcript through the shared
  simulator core (see ARCHITECTURE_DECISIONS.md ADR-013) to derive the resulting state itself, then
  evaluates the success condition against that Worker-derived state. A client-supplied final state or
  pass/fail claim is never accepted as evidence on its own.
- **CHAL-003 (MVP)**: A failed challenge attempt does not corrupt or lock the learner's simulator
  state — they can keep trying without reloading the page.
- **CHAL-004 (MVP)**: Challenge-passed feedback names the specific Git concept the challenge
  exercised (not a generic "success" message).
- **CHAL-005 (MVP)**: Module 7's capstone challenge accepts any command sequence that reaches the
  specified final state via in-scope commands — it is graded on the resulting state, not on matching
  one fixed "correct" transcript — consistent with real Git accepting multiple valid paths to the
  same result.

## QUIZ — Quizzes

Module assessment matrix is locked by `docs/LEARNING_OBJECTIVES.md` — Modules 1–6 each require at
least one quiz; Module 7's quiz is Should-Have, not release-blocking, since Modules 1–6 already
assess each underlying concept individually and Module 7 introduces no new content to test.

- **QUIZ-001 (MVP)**: At least one quiz exists for each of Modules 1, 2, 3, 4, 5, and 6, using only
  terminology and concepts from `docs/Git & GitHub.pdf`.
- **QUIZ-001b (Should)**: Module 7 has an optional capstone quiz; its absence does not block release.
- **QUIZ-002 (MVP)**: Quiz scoring logic is implemented once and reused by every quiz — no per-quiz
  duplicated scoring code.
- **QUIZ-003 (MVP)**: After submission, the learner sees per-question correctness and a brief
  explanation for any wrong answer — not only an aggregate score.

## PROG — Progress

- **PROG-001 (MVP)**: A learner's per-module and per-lesson completion state, plus quiz and
  challenge results, are persisted in Cloudflare D1 and survive sign-out/sign-in on any device.
- **PROG-002 (MVP)**: A progress-updating write (lesson complete, quiz submitted, challenge passed)
  is idempotent — retrying the same submission does not create a duplicate result row or corrupt the
  stored state.
- **PROG-003 (MVP)**: A learner can see, at a glance, which modules/lessons/challenges/quizzes are
  complete, in progress, or not started.
- **PROG-004 (MVP)**: No API response intended for one user's progress view includes another user's
  data, verified by an explicit test that requests another user's data and expects rejection.

## CHEAT — Cheat Sheet

- **CHEAT-001 (MVP)**: A cheat-sheet page lists every in-scope command (the SIM-xxx list) with a
  one-line description using PDF-consistent terminology.
- **CHEAT-002 (MVP)**: The cheat sheet contains no command or workflow outside the PDF's scope
  (cross-checked against `docs/LEARNING_OBJECTIVES.md`).

## ADMIN — Admin Minimum Functions

- **ADMIN-001 (MVP)**: An Admin can view a list of user accounts (identifier and role only — not
  passwords or password hashes).
- **ADMIN-002 (MVP)**: An Admin can issue a temporary password/credential for a specified account
  (RECOV-002).
- **ADMIN-003 (MVP)**: An Admin action (e.g., issuing a credential) is itself authenticated and
  restricted to the Admin role (ROLE-004/ROLE-005) — not reachable by a Student or Teacher session.
- **ADMIN-004 (Should)**: An Admin can see basic account metadata (role, created date, last sign-in)
  for troubleshooting — not required for MVP if time-constrained.

## AUDIT — Audit Log & Security Events (P14)

A bounded APPLICATION audit log for operational/security traceability of privileged/security-relevant
events — not a generic analytics system, not an HTTP access-log replacement, not a SIEM, and not a
substitute for any statutory computer-traffic-data retention requirement. See
`docs/ARCHITECTURE_DECISIONS.md` ADR-018 for the full design rationale.

- **AUDIT-001 (P14)**: A fixed set of privileged/security-relevant events (`admin.staff.created`,
  `admin.recovery.issued`, `student.registered`, `auth.login.success`, `auth.login.failure`,
  `auth.password.changed`, `auth.logout`) is recorded with actor (who), target (on whom), event type,
  and timestamp.
- **AUDIT-002 (P14)**: No audit event ever stores a plaintext password, temporary credential, password
  hash/salt, session token, raw cookie, recovery credential, IP address, or full request body
  (DATA-002 applied specifically to this table).
- **AUDIT-003 (P14)**: A failed login is logged identically whether the identifier is unknown or the
  password is wrong (mirrors AUTH-001's own identical-response invariant) — the audit log is never a
  more revealing side channel than the login API's own response.
- **AUDIT-004 (P14)**: Only the ADMIN role can read the audit log (`GET /api/admin/audit`) — TEACHER
  and STUDENT sessions receive 403, an unauthenticated request receives 401.
- **AUDIT-005 (P14)**: The audit-read endpoint returns events newest-first, bounded to a maximum of
  200 rows per request (default 50), never an unbounded table scan.
- **AUDIT-006 (P14)**: An audit-write failure never blocks or fails the primary action it accompanies
  (best-effort logging — ADR-018's documented failure-semantics tradeoff).
- **AUDIT-007 (P14)**: No historical event is fabricated or backfilled — the table begins empty and
  audit logging starts from the P14 deployment onward.

## SEC — Security

- **SEC-001 (MVP)**: No code path, in any environment, allows learner-supplied input to reach a real
  shell, `eval`/dynamic-code-execution, or a real filesystem write (Engineering skill §10). This is
  verified by an explicit test attempting a shell-metacharacter/command-injection-style input through
  the terminal and asserting no side effect beyond a "not recognized" response.
- **SEC-002 (MVP)**: All user-supplied text rendered back to any user (commit messages, branch names,
  profile fields, quiz free-text if present) is output-escaped — verified by an XSS-payload test
  string that renders as inert text, not executed markup/script.
- **SEC-003 (MVP)**: Secrets (session-signing material, any API keys) are never committed to the Git
  repository; they are stored via Cloudflare's environment/secrets mechanism only.
- **SEC-004 (MVP)**: Production traffic is served over HTTPS only.
- **SEC-005 (MVP)**: A runtime error shown to a user is a safe, generic message — never a raw stack
  trace, SQL/D1 error, or file path.

## A11Y — Accessibility

- **A11Y-001 (MVP)**: Every interactive element (terminal input, lesson navigation, quiz controls,
  challenge submit, hint button) is reachable and operable using the Tab key and Enter/Space alone,
  with no mouse.
- **A11Y-002 (MVP)**: Every interactive element has a visible focus indicator when focused via
  keyboard.
- **A11Y-003 (MVP)**: No status (command-accepted/rejected, quiz correct/incorrect, challenge
  passed/failed) is communicated by color alone — each is paired with text or an icon.
- **A11Y-004 (MVP)**: Interactive elements use native semantic markup (`<button>`, `<a>`, `<input>`)
  rather than a non-interactive element with a click handler attached.
- **A11Y-005 (Should)**: New terminal output is exposed to assistive technology via an appropriately
  labeled live region.

## RESP — Responsive

- **RESP-001 (MVP)**: The lesson, terminal, and visualizer are all usable (no horizontal scroll on
  the page body, no clipped/overlapping controls) at a Narrow viewport (~375–420px).
- **RESP-002 (MVP)**: The same holds at Medium (~768px) and Wide (~1280px+) viewports.
- **RESP-003 (MVP)**: Interactive controls meet a reasonable touch-target size at Narrow width.

## CLOUD — Cloud Deployment

- **CLOUD-001 (MVP)**: The frontend is deployed to Cloudflare Pages and reachable at a `*.pages.dev`
  URL.
- **CLOUD-002 (MVP)**: All authenticated/security-sensitive operations are handled by a Cloudflare
  Worker — the browser never talks to D1 directly.
- **CLOUD-003 (MVP)**: The application is deployable from a clean clone of the GitHub repository plus
  documented Cloudflare configuration — no dependency on a file that exists only on the Owner's local
  machine.
- **CLOUD-004 (MVP)**: Deployment stays within Cloudflare's free-tier limits for Pages, Workers, and
  D1 (0 THB infrastructure cost).
- **CLOUD-005 (MVP)**: After each deploy, the live `*.pages.dev` URL is smoke-tested (sign-in → one
  lesson → one simulator command) before considering the deploy complete.

## TEST — Testing

- **TEST-001 (MVP)**: Every command in the SIM-xxx list has at least one automated happy-path
  transition test and at least one invalid-sequence test (Engineering skill §12).
- **TEST-002 (MVP)**: An automated test exists proving `git commit -m "test"` with nothing staged
  creates no commit (the canonical case from SIM-001).
- **TEST-003 (MVP)**: An automated test exists proving one user's session cannot read or write
  another user's progress/results (PROG-004, ROLE-002).
- **TEST-004 (MVP)**: An automated test exists proving a temporary recovery credential cannot be
  reused after a successful forced password change (RECOV-005).
- **TEST-005 (MVP)**: Regression: re-running the full test suite after any HIGH-risk change
  (Engineering skill §2) shows no previously-passing test now failing.
- **TEST-006 (MVP)**: An automated test proves the Worker rejects a challenge submission carrying a
  forged `passed=true`/`completed=true` flag or an arbitrary final-state payload with no accompanying
  command transcript, or with a transcript that does not actually reach the claimed state (CHAL-002).
- **TEST-007 (MVP)**: An automated test proves the shared simulator core (SIM-016) produces identical
  results whether invoked from the browser build or the Worker build, for the same starting state and
  command transcript — guarding against the two runtimes silently drifting apart.

## DATA — Data Persistence

- **DATA-001 (MVP)**: User accounts, role, password hash+salt+iteration-count, lesson/module
  progress, quiz results, and challenge results are stored in Cloudflare D1.
- **DATA-002 (MVP)**: No table stores a field not used by a shipped feature (minimal-collection
  discipline, Engineering skill §17.1).
- **DATA-003 (MVP)**: A schema change to any user-data table has a documented, reproducible D1
  migration step (Engineering skill §24) — no hand-edited production schema.
- **DATA-004 (MVP)**: A verified D1 backup/export exists before any schema-changing production
  deploy.
