# Learning Objectives — Git Learning Lab

Derived exclusively from `docs/Git & GitHub.pdf`. No objective, command, or concept below appears
in that PDF's absence — anything a future contributor wants to add beyond this list is supplemental
material and requires an Owner Decision (Engineering skill §9, §15).

Page ranges cite the PDF's own slide numbers, for traceability back to source.

---

## Module 1 — Version Control Foundations
*(PDF pp. 2–63)*

**Objective**: understand what Version Control is, why it's needed, and how it evolved into modern
Git — without touching a command yet.

**Key concepts**: Version Control / Source Control as a change-tracking tool; the "why" (backup,
avoiding `projectv2_final_fixbug` filename chaos, team collaboration pain points); the five-stage
evolution — Copy File & Folder → Patch → Local Version Control System → Centralized Version Control
System (CVCS) → Distributed Version Control System (DVCS); Check-In/Check-Out vocabulary as used by
pre-Git Local VCS; CVCS's single-point-of-failure weakness; DVCS's offline/cloned-repository
advantage.

**Commands/concepts covered**: none yet (conceptual only).

**Learner should be able to**: explain, in their own words, why version control exists; name the
five evolutionary stages in order; explain why a CVCS server outage blocks work but a DVCS clone
does not.

**Suggested lesson/practice outcome**: a short scenario-comparison exercise (no simulator needed) —
e.g., "which approach would have saved this student from losing their thesis?" — answered by
selecting the correct VCS category.

**Required prerequisite**: none (entry point).

**Assessment target**: quiz only (no challenge — nothing to simulate yet).

---

## Module 2 — Git & GitHub Fundamentals
*(PDF pp. 64–76)*

**Objective**: understand what Git and GitHub each are, how they relate, and Git's core
offline-first principle, before writing a single command.

**Key concepts**: Git is a DVCS used to track every character/line/file change and who made it, when;
GitHub is a web-hosting service *for* Git repositories (not Git itself), commonly used for open-source
projects; Git's core workflow principle — clone/copy a repository locally, work fully offline,
Check-In changes to the Local Repository, and only later Sync (Pull/Merge/Push) with the remote.

**Commands/concepts covered**: Local Repository vs. Remote Repository (introduced conceptually here,
detailed in Module 3); no git subcommands yet.

**Learner should be able to**: state the distinction between Git and GitHub in one sentence each;
describe why a Git user can keep working without an internet connection.

**Suggested lesson/practice outcome**: a "Git vs. GitHub" matching exercise; a short explanation
screen covering install/account-setup context (the PDF's own install/signup sections) without
requiring an actual local install to proceed in-browser.

**Required prerequisite**: Module 1.

**Assessment target**: quiz only.

---

## Module 3 — The Git Workflow & Staging
*(PDF pp. 77–89)*

**Objective**: learn the five-stage Git pipeline and the first commands that move a file through it.

**Key concepts**: the pipeline — Working Directory (Untracked) → Working Directory (Tracked) →
Staging Area → Local Repository → Remote Repository; the three tracked-status terms — **Modified**
(edited, not yet staged), **Staged** (marked for the next commit), **Committed** (durably recorded);
`git status` as the pipeline's inspection tool.

**Commands/concepts covered**: `git init`; `git add <file>`, `git add *.<ext>`, `git add .`; `git rm
-r --cached .` / `git rm --cached <file>`; `git status`.

**Learner should be able to**: initialize a repository; move a specific file, a file pattern, or
every file into the Staging Area; remove a file from tracking without deleting it from disk; read a
`git status` report and correctly identify which files are untracked, modified, or staged.

**Suggested lesson/practice outcome**: a guided simulator exercise — create a file, observe it as
Untracked, stage it, observe it as Staged, `rm --cached` it, observe it return to Untracked/Modified.

**Required prerequisite**: Module 2.

**Assessment target**: quiz + challenge (first hands-on simulator challenge: reach a specified
Staging Area state from a given starting Working Directory).

---

## Module 4 — Commits, History, Diff & Undoing Changes
*(PDF pp. 90–101)*

**Objective**: permanently record staged changes, inspect history, compare versions, and undo
mistakes at three different levels of severity.

**Key concepts**: a commit as a durable, ID-addressed snapshot; the Commit ID as a SHA-1 hash
(referenced by its first 7 characters in practice); `diff` output convention (`-`/red for removed
lines, `+`/green for added lines); `checkout <file>` as a revert-to-last-commit operation, distinct
from branch-switching (covered in Module 5); the three distinct `reset` modes and where each sends
the undone changes.

**Commands/concepts covered**: `git commit -m "<message>"`; `git log`, `git log --oneline`, `git log
--graph`; `git diff <commit>`, `git diff <commit> <commit>`; `git checkout <file>` (file-revert
form); `git reset --soft <commit>` (→ Staging Area), `git reset --mixed <commit>` (→ Working
Directory), `git reset --hard <commit>` (discarded entirely).

**Learner should be able to**: commit staged changes with a message; read commit history in full,
one-line, and graph form; explain what a diff's `+`/`-` lines mean; revert an uncommitted file
change; choose the correct `reset` mode for a stated goal (e.g., "I want to undo the commit but keep
my changes staged").

**Suggested lesson/practice outcome**: the canonical invalid-sequence exercise — attempt `git commit
-m "test"` with nothing staged and observe the simulator correctly refuse it, then stage a real
change and succeed; a second exercise walking all three `reset` modes from the same starting commit
and comparing the three resulting states side by side in the visualizer.

**Required prerequisite**: Module 3.

**Assessment target**: quiz + challenge (including a challenge that specifically exercises the
"nothing staged" rejection case, and one covering at least one `reset` mode).

---

## Module 5 — Branching & Merging
*(PDF pp. 102–133)*

**Objective**: work on parallel lines of development without disturbing the main line, then combine
them back together.

**Key concepts**: `master` as the default branch created implicitly by `git init`; a branch as a
named pointer into the commit graph, not a copy of the project; HEAD as a pointer that moves between
branches; committing on a Feature Branch does not affect `master` until merged; a simple/non-
conflicting merge completes automatically, a conflicting one requires a decision (conceptual
introduction only — full conflict-resolution UI is not required for v0.9, per `docs/SCOPE.md`).

**Commands/concepts covered**: `git branch` (list), `git branch <name>` / `git checkout -b <name>`
(create+switch); `git checkout <name>` (branch-switch form, distinct from Module 4's file-revert
form); `git branch -d <name>`; `git checkout master`; `git merge <name>`.

**Learner should be able to**: create a branch and switch to it; make commits that exist only on
that branch; switch back to `master` and observe those commits are absent; merge the branch back
into `master` and observe the combined history; explain what HEAD is pointing at, at each step.

**Suggested lesson/practice outcome**: the PDF's own Master/Feature-Branch worked example — branch
off, commit a "bug fix" on the feature branch, switch back to `master`, merge, observe the graph in
the visualizer at each step.

**Required prerequisite**: Module 4.

**Assessment target**: quiz + challenge (reach a specified branch/commit-graph topology; a second
challenge that requires an actual merge).

---

## Module 6 — Remote Repositories: Push, Pull & Clone
*(PDF pp. 134–137)*

**Objective**: synchronize local work with a remote (GitHub-hosted) repository.

**Key concepts**: the Local Repository and Remote Repository are genuinely independent commit graphs
until explicitly synced (re-emphasizing Module 2's DVCS principle concretely); `push` sends local
commits to the remote; `pull` retrieves and merges remote commits into the local repository; `clone`
copies an entire remote repository — full history, not just the latest snapshot — to a new local
machine.

**Commands/concepts covered**: `git push`; `git pull`; `git clone`.

**Learner should be able to**: push local commits to a simulated remote and see them appear there
and only there until pushed; pull remote commits into a local repository that has diverged; clone a
simulated remote and verify the full commit history (not just current files) is present locally.

**Suggested lesson/practice outcome**: a two-"machine" simulated scenario (two simulated local
repositories against one simulated remote) demonstrating push/pull divergence and reconciliation.

**Required prerequisite**: Module 5.

**Assessment target**: quiz + challenge (reach a specified state of sync/divergence between a
simulated local and remote repository).

---

## Module 7 — Integrated Git Workflow
*(Synthesis/practice — no new PDF content; reinforces Modules 3–6 together)*

**Objective**: apply the full pipeline — init through push — as one continuous, realistic workflow,
consolidating everything taught rather than introducing anything new.

**Key concepts**: none new — this module is explicitly a capstone review, not a source of new
curriculum content, and must not introduce any command or term beyond Modules 1–6.

**Commands/concepts covered**: all commands from Modules 3–6, used together in one scenario.

**Learner should be able to**: start from an empty repository and, unaided, initialize it, stage and
commit changes, create and merge a feature branch, and push the result to a simulated remote — the
full pipeline in one sitting.

**Suggested lesson/practice outcome**: one longer, multi-step capstone challenge spanning the whole
pipeline, graded on reaching a specified final state rather than on the exact command sequence used
to get there (multiple valid paths should be accepted where real Git would also accept them).

**Required prerequisite**: Module 6.

**Assessment target**: challenge is required; a capstone quiz (built P8) exists as optional/enrichment
(QUIZ-001b, Should-Have) and never blocks completion, since Modules 1–6 already assessed each
underlying concept individually — it only reviews them together, introducing nothing new.
