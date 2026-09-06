---
name: git-learning-lab-ux-ui
description: UX/UI operating model for Git Learning Lab — beginner-first interaction design for lesson flow, the simulated terminal, the Git-state visualizer, challenges, quizzes, and progress feedback, built toward a classroom-usable MVP. Use this skill for any Git Learning Lab layout, interaction, terminal, visualizer, accessibility, responsive, or feedback-design session.
---

# Git Learning Lab UX/UI Skill v1

This file governs **how** to approach UX/UI work on Git Learning Lab — layout, interaction design,
the terminal, the state visualizer, feedback/error states, responsive behavior, and accessibility.
It is a narrow, evidence-first specialist methodology, not a style guide and not a design-token
dump. Written from scratch for this project; it is not an edited copy of any other project's UX
skill, and it does not assume this project has a mature design system, exact breakpoints, or a
finished visual language yet — those are marked **TBD** below and filled in as real implementation
decisions are made, not invented now.

---

## 0. UX Mission, Authority & Companion Engineering Skill

**Mission**: make Git concepts learnable by someone who has never used version control, through
progressive disclosure, an honest and forgiving simulated terminal, and a visualizer that makes the
four-stage Git workflow (§9) visible and unambiguous — for both self-study and classroom use, ready
for real students by **September 12, 2026**.

**Priority ordering when layers conflict**: governed by the Engineering skill's §0 — read it there,
never re-derived here. Within that ordering, this skill's domain (layout, interaction, visual
feedback, accessibility) sits below Git semantic correctness, curriculum fidelity, and data
integrity/security: a UX improvement never buys its polish with a correctness or privacy cost.

**Companion Engineering Skill**: `skills/git_learning_lab/engineering/SKILL.md`. Re-read it whenever
this skill's boundary machinery (§5) requires it — any Tier-B contract-preservation edit, any Route
3 classification, a failed Tier-B check, or a STOP (§29).

**Scope**: this skill governs presentation and interaction. It does not govern simulator semantics,
validation logic, persistence, or security enforcement — those are Engineering's, referenced here
only by pointer.

---

## 1. Learner Personas & Learning Flow

**Primary persona**: a learner with little or no prior Git experience — the platform's own stated
audience. Design defaults to this persona's needs (minimal jargon up front, one new concept at a
time, safe-to-fail practice) rather than to what a confident developer would find efficient.

**Usage modes, both first-class**:

- **Self-study**: a learner working alone, at their own pace, possibly returning across multiple
  sessions (progress must be legible on return — §22).
- **Classroom instruction**: an instructor may project the platform to a room, or a class may work
  through the same lesson simultaneously (§26).

Neither mode is an afterthought; a design that only works well for one is incomplete.

**Role-aware UI for v0.9** (three locked roles — Engineering skill §16): a **Student** gets the
full learner experience described throughout this file. A **Teacher** account exists in v0.9 and
uses the *same* lesson/simulator/challenge/quiz UI a Student uses — no dedicated teacher screen or
view is required for v0.9 (a full Teacher Dashboard is deferred, Engineering §9.1/§16/§21); do not
build teacher-only lesson/simulator variants. An **Admin** (Project Owner) needs only the minimal
UI necessary to administer accounts and issue password-recovery credentials (Engineering §18) — this
is a small, utilitarian screen, not a design priority, and never exposes another user's actual
password (Engineering §17, §18).

---

## 2. Source & Evidence Hierarchy

For a UX/UI task, read in this order:

1. **This file** — methodology.
2. **`docs/Git & GitHub.pdf`** — the source of truth for what a lesson/visualizer/cheat-sheet must
   actually represent about Git (terminology, workflow stages, command behavior) — a UX decision
   never contradicts it (coordinate with Engineering skill §1, §9).
3. **§30 Project UX/UI Profile** (below) — this project's concrete facts once established. Currently
   mostly **TBD** — do not invent breakpoints, tokens, or component inventories that don't exist yet.
4. **The live source** (markup/CSS/components actually in the repo) — authoritative over this file
   or §30 if they disagree; correct §30 when found stale.
5. **`skills/git_learning_lab/engineering/SKILL.md`** — only when the boundary machinery (§5)
   requires it.

---

## 3. UX/UI Change Router

### Route 1 — Local / Cosmetic
Single component, single file, no shared pattern reused elsewhere is structurally changed, Tier A
only (§5). Implement directly; targeted regression (§28) suffices; no runtime check required unless
a §11 mandatory trigger independently fires (if one does, reclassify as Route 2).

### Route 2 — Shared Pattern / Workflow / Systemic
Anything touching a pattern reused across lessons (lesson-card layout, the terminal component, the
visualizer component, feedback-state styling), any change to the protected Lesson Flow (§6) or the
protected four-zone visualizer contract (§9), any responsive/accessibility change with a
footprint wider than one screen, or any Tier-B surface (§5). Reconstruct the current pattern across
every place it's used before changing it — cross-page/cross-lesson consistency check is mandatory.
Runtime verification is mandatory (§11).

### Route 3 — Engineering Escalation
Anything landing in Tier C or D (§5) never gets Route 1/2 treatment:

- **Tier C — detect and hand off.** Stop, read the Engineering skill, route via its lifecycle (§3
  there). No UX implementation occurs until Engineering's side is resolved.
- **Tier D — detect and refuse.** No handoff — refuse the shortcut in this session, explain why,
  offer the compliant alternative if one exists.

A request naming no specific defect and no clear footprint never skips classification, even if it
looks trivial.

---

## 4. Preserve-vs-Redesign Ladder

| Rung | Meaning | Evidence required |
|---|---|---|
| **PRESERVE** | Change nothing; extend understanding only | Default for a request naming no specific defect |
| **EXTEND** | Apply an existing, evidenced pattern to a new surface | The pattern already exists and is reused elsewhere |
| **NORMALIZE** | Fix a named, specific inconsistency in the existing visual language | A citable inconsistency, not "could be nicer" |
| **REFACTOR** | Introduce a new shared mechanism replacing duplicated implementations | Repeated, evidenced drift, or an explicit Owner request naming this scope |
| **REDESIGN** | Change the visual language itself | Explicit, recorded Project Owner redesign intent |

A vague "make it nicer/more modern/more fun" request caps at NORMALIZE/EXTEND by default — this is
the specific rule that blocks over-gamification and unscoped redesign requests (§27) before a route
is even assigned.

---

## 5. UX/UI ↔ Engineering Boundary (Four-Tier Model)

| Tier | What belongs here | Evidence needed | Execute directly? | Read Engineering skill? | Handoff? |
|---|---|---|---|---|---|
| **A — UX-owned** | Spacing, typography, non-semantic color, icon choice, copy wording (that doesn't change a taught Git fact), layout, hover/idle styling | Source inspection; runtime only if §11 trigger fires | Yes | No, unless another trigger fires | No |
| **B — UX with contract preservation** | The four-zone Working-Directory/Staging/Local-Repo/Remote-Repo visual distinction (§9); branch/HEAD/commit-graph rendering fidelity (§10); the protected Lesson Flow order (§6); terminal input/output visual distinction (§7) | Source inspection **plus** a named contract check **plus** runtime verification proving the contract held | Yes, once the contract check is written and passes | Yes — read the specific invariant the contract rests on before editing | No, unless the check fails (then escalate to C) |
| **C — Cross-skill / Engineering dependency** | Any change to what a challenge/quiz validates or how it's computed; any change exposing new simulator state to the UI that the state model doesn't currently expose; any change to what commands/concepts appear in lessons or the cheat sheet | N/A — UX doesn't gather engineering evidence here | No | Yes, in full, before proceeding | **Yes, mandatory** |
| **D — Prohibited UX shortcut** | Letting the terminal/visualizer UI decide challenge pass/fail itself; trusting a client-side "completed" flag for progress display without a server-confirmed value; adding a Git command to a lesson/cheat-sheet because "it would look more complete" without an Owner Decision (Engineering §15) | N/A | **Never** | N/A | **Yes, immediately** |

Tier C means the goal may be legitimate but Engineering must own the logic — hand off, don't refuse
the underlying goal. Tier D means the proposed shortcut itself is wrong regardless of the goal's
legitimacy.

---

## 6. Protected Lesson Flow

Every lesson module follows: **Lesson (short explanation) → Demonstration (worked example, ideally
using the PDF's own example) → Practice → Feedback (result + explanation, not just pass/fail)**.

"Practice" is the required pedagogical stage — it does not always mean terminal/simulator practice.
In a conceptual, no-command module (per `docs/LEARNING_OBJECTIVES.md` — currently Modules 1–2),
Practice is a conceptual interactive activity (matching, sequencing, scenario selection) — there is
nothing to simulate yet, so simulator/challenge practice is not required there. In a module that
teaches actual Git commands (currently Modules 3–7), Practice uses the simulator/terminal, per that
same document's module assessment matrix. Either way, no lesson may omit the Practice or Feedback
stage.

This order is a Tier-B contract (§5): a change to a lesson template that reorders, merges, or drops
one of these four stages requires the contract-preservation check (confirm the reordering doesn't
silently remove the practice or feedback step) before shipping, and a cross-lesson consistency check
(Route 2, §3) since this pattern repeats across every lesson.

Short explanations are the explicit design target over long slide-by-slide reading — a lesson's
explanation stage should be scannable, not a transcription of the PDF's slide text.

---

## 7. Terminal Interaction Design

The simulated terminal is a novel interaction surface with no precedent elsewhere in this project;
design it deliberately, not as an afterthought to the visualizer.

- **Keyboard behavior**: Up/Down arrow recalls command history (matching real-terminal muscle
  memory learners may already have or will build); Enter submits; a clear, discoverable way to see
  available/expected commands for the current step (e.g., a hint affordance, §19) rather than relying
  on tab-completion as the only aid.
- **Input/output visual distinction**: what the learner typed is visually distinct from what the
  system responded with (e.g., a prompt marker, consistent color/weight difference) — this is a
  Tier-B contract (§5): verify it holds after any terminal-styling change.
- **Focus management**: the input stays focused/re-focuses appropriately after a command executes,
  so a learner can keep typing without re-clicking; focus is never silently stolen elsewhere on
  screen during normal use.
- **Command-error feedback (§18)**: an unrecognized or precondition-failing command gets a specific,
  legible response in the terminal itself — never a silent no-op, never only a generic toast the
  learner might miss.

---

## 8. Visualizer Design

The visualizer renders the Engineering skill's authoritative state model (Engineering §6–§7) — it
never computes or infers state independently. Its job is to make the four-stage pipeline and the
branch/commit graph legible at a glance, and to update visibly and clearly the moment a command
changes state, so cause (command) and effect (visual change) are obviously linked for a beginner.

---

## 9. Protected Four-Zone Distinction

**Working Directory → Staging Area → Local Repository → Remote Repository** must remain visually and
semantically distinct at all times (Engineering skill §7; matches the PDF's own five-node
workflow diagram, pp.78–84). This is the project's primary Tier-B contract:

- Each zone has a consistent, distinguishable visual treatment (position, color/label, or grouping)
  that holds across every lesson and challenge screen that shows it, not just the first one built.
- A file or commit shown in one zone is never ambiguously rendered as if it were simultaneously in
  another — if a change makes the boundary fuzzy (e.g., collapsing Staging and Local Repository into
  one visual block to "simplify"), that is a Tier-D shortcut (§5), not a valid simplification,
  because it teaches a factually wrong model of Git.
- Any change touching this rendering requires the explicit contract check: screenshot or inspect
  before/after, confirm all four zones remain independently identifiable.

---

## 10. Branch / HEAD / Commit Visualization

- Rendered commit graph topology must match the underlying commit DAG (parent/child relationships,
  branch divergence points) — a Tier-B contract, verified against the actual state model, not just
  "looks plausible."
- HEAD is rendered as a distinct, visible pointer, and its movement (on checkout/branch switch) is
  visibly animated or otherwise clearly indicated — not just silently relabeled — so a learner can
  see that checkout moves a pointer rather than "loading a different project."
- Divergent branches (e.g., the PDF's Master/Feature Branch example, pp.120–128) are rendered so the
  divergence point and each branch's own subsequent commits are unambiguous.

---

## 11. Runtime & Responsive Verification

### 11.A Mandatory triggers (never skip; never substitute source-reading for the check)
- Any layout change to the terminal or visualizer.
- Any change inside the four-zone distinction (§9) or the commit-graph rendering (§10).
- Any change to command-error/feedback-state styling (§18).
- Responsive/breakpoint changes.
- Any accessibility claim made in a completion note.
- Every Route 2 change, regardless of sub-trigger.

### 11.B Recommended
A Route 1 cosmetic change to a component appearing on more than one lesson — sample 1–2 instances.

### 11.C Not required
A single-lesson, single-value cosmetic tweak with no shared-component footprint; a pure copy change
that doesn't touch a taught fact.

### 11.D Responsive verification — three portable viewport classes
Since this project has no established breakpoints yet (§30), use the portable minimum until real
ones exist:

| Class | Approximate width | Verifies |
|---|---|---|
| Narrow | ~375–420px | Mobile-equivalent stacking, terminal usability at small width, touch-target sizing |
| Medium | ~768px | Tablet-equivalent transition zone |
| Wide | ~1280px+ | Desktop layout, max meaningful content width |

The terminal and visualizer are the two components most likely to break at Narrow — treat both as
mandatory-check surfaces at that width, not merely recommended (§11.A).

---

## 12. Accessibility (Practical Baseline)

Bounded to what's actually achievable for the MVP — never claim more than what was checked (ban:
"WCAG-AA compliant" or "fully accessible" from source inspection or a partial pass alone; state the
specific checks performed instead).

- **Keyboard accessibility**: every interactive element (terminal input, hint button, quiz controls,
  navigation) is reachable and operable via keyboard alone; tab order is verified after any
  interactive-markup change (§11.A).
- **Focus visibility**: a visible focus indicator on every interactive element, including inside the
  terminal and visualizer.
- **Semantic structure**: native `<button>`/`<a>`/`<input>` elements used for their real purpose; no
  `onclick`-on-`<div>` in place of a real interactive element.
- **Screen-reader consideration for the terminal**: command output is exposed in a way a screen
  reader can announce (e.g., an appropriately-labeled live region for new output) — this is a new
  concern with no precedent elsewhere in the app; treat it as a Tier-B contract once implemented
  (§5), not a nice-to-have.
- **Color dependence**: success/error/warning states (§14) are never color-only — always paired with
  text or an icon, especially for command-accepted/command-rejected feedback.
- **Contrast**: verified at runtime, not asserted from source reasoning alone.

---

## 13. Classroom / Projector Usability

Where relevant (a lesson or the visualizer is likely to be shown on a projector or shared screen):
prefer legible type sizes and sufficient contrast at a glance-from-distance scale; avoid critical
information conveyed only through fine detail that disappears when projected. This is a
lightweight, MVP-appropriate consideration — not a mandate for a separate "presentation mode."

---

## 14. State Coverage

Applicability-gated — ask "which of these apply to the component being touched," don't force every
state onto every element.

**General states**: `default · hover · focus · disabled · loading · empty · success · warning ·
error`.

**Domain-specific states, with no generic-UI equivalent** — treat these as first-class, not as
flavors of the generic list above:

- **command accepted** — the terminal/visualizer clearly reflects that a valid command executed and
  changed state.
- **command rejected** — clearly distinct from a generic "error"; pairs with specific, explanatory
  feedback (§18), not just a red flash.
- **hint revealed** — a distinct visual state when a learner has asked for and received a hint,
  clearly different from feedback they earned by trying.
- **challenge passed** / **challenge failed** — distinct from generic success/error styling; feedback
  content explains *why* (§20), not just that it happened.

A loading state is required wherever a persisted action (progress save, quiz submission, sign-in)
has real latency — this project has real client-side interaction and real network calls (unlike a
mostly-static reference site), so this state is not optional.

---

## 15. (Reserved — see §9)

## 16. (Reserved — see §10)

---

## 17. Mistake Recovery

A learner must always have a clear, safe way to see they made a mistake and try again without
feeling the platform is broken or that they've lost work permanently:

- After a rejected command, the terminal stays usable immediately — no dead-end state requiring a
  page reload.
- Where the simulator supports it, offer a clear "reset this exercise" affordance distinct from
  "reset my whole progress" — the two must never be confusable given §5's data-integrity stakes.
- Recovery language is encouraging and specific ("that would remove your staged changes — try `git
  status` to see what's staged") rather than purely negative.

---

## 18. Hint Design & Command-Error Feedback

- Command-rejected feedback explains **why**, referencing the actual Git concept involved (e.g., for
  the canonical `git commit -m "test"` with nothing staged: explain that nothing is staged yet and
  point at `git add`), not a generic "invalid command."
- Hints are progressive: a first-level hint nudges toward the right concept; only a later level (if
  offered) reveals the exact command. Immediately revealing the answer on first request undermines
  the learning goal — but never gate a hint so aggressively that a genuinely stuck learner has no
  path forward.
- Hint content, like all lesson content, must stay consistent with the PDF's terminology (coordinate
  with Engineering §9, §15).

---

## 19. (Reserved — see §18)

---

## 20. Challenge Completion Feedback / Quiz Feedback

- Challenge-passed feedback reinforces the specific Git concept just demonstrated — not just a
  generic congratulations.
- Challenge-failed feedback is specific about what state was expected vs. what actually happened,
  where feasible, rather than a bare "try again."
- Quiz feedback shows correctness per question with a brief explanation for wrong answers, not just
  an aggregate score — the score alone doesn't teach anything.
- Both draw their pass/fail determination from Engineering's validation logic (§5 Tier C/D) — UX
  never independently decides or restyles around a different notion of "passed."

---

## 21. (Reserved — see §20)

---

## 22. Progress Clarity

- A learner can always see, at a glance, which lessons/challenges/quizzes are complete, in progress,
  or not yet started — this is the UI expression of Engineering §14's persistence requirement.
- Returning after signing back in shows the same progress state the learner left with — verify this
  specifically after any change touching the progress-display component (Tier B-adjacent: coordinate
  with Engineering's persistence integrity rules, §5).
- Progress display never shows another learner's data, and never shows a capability belonging to a
  different role (Engineering §16, §17) — a UX bug that accidentally renders the wrong user's
  progress, or shows Teacher/Admin-only information to a Student, is a Tier-D-equivalent severity
  issue, escalate immediately.

---

## 23. (Reserved — see §22)

---

## 24. (Reserved)

---

## 25. Classroom/Projector Usability

See §13. (Numbered separately here to match the requested checklist; content lives in §13 to avoid
duplication.)

---

## 26. Simultaneous-Classroom-Use Consideration

Design for the case where many learners in one room hit the same lesson at the same time: no UI
assumption that a learner is the only concurrent user of a shared resource (relevant mainly as a
reminder to Engineering-side load/consistency handling, §5 Tier C, rather than a UX-owned concern —
UX's job is simply not to assume single-user timing in animations or transitions, e.g. don't build a
countdown or lock that only makes sense for one active user).

---

## 27. Anti-Over-Gamification Rule

The product direction includes progress tracking and challenge/quiz completion feedback — it does
**not** call for points, badges, leaderboards, streaks, or other competitive/social mechanics.
Any proposal to add such a mechanic:

- Is capped at NORMALIZE/EXTEND by the Preserve-vs-Redesign Ladder (§4) by default, meaning it needs
  a specific, evidenced learning-outcome justification, not "more fun" alone.
- Requires an explicit Owner Decision before implementation, treated the same as a Tier-C escalation
  (§5) even though it may look like a pure UX feature — because it changes what the product
  optimizes for (engagement vs. comprehension).
- Completion/success feedback (§20) should reinforce the Git concept just learned, not merely
  reward participation.

---

## 28. Scope Discipline & Regression

- A discovered issue outside the current change's footprint is logged for later, never folded in
  (unless leaving it would make the *current* change internally inconsistent, e.g. two different
  error-state treatments on the same screen being edited).
- **Targeted regression** (every route): the changed surface renders correctly at the viewport
  classes a mandatory trigger required (§11), with the relevant states (§14) checked, and the
  Tier-B contract check (§5) passing if applicable.
- **Cross-lesson regression** (Route 2): every other lesson/screen using the same shared pattern
  (terminal, visualizer, feedback styling, lesson-flow template) is re-checked, not just the one
  edited.

---

## 29. UX STOP Conditions → Engineering Handoff

Stop, read the Engineering skill, and route via its lifecycle whenever:

1. A change would alter what a challenge/quiz validates, or expose new simulator state the state
   model doesn't currently provide (§5 Tier C).
2. A change would let the UI itself decide pass/fail or trust a client-side-only completion signal
   (§5 Tier D) — refuse directly, no handoff needed, just don't do it.
3. A change would blur the four-zone distinction (§9) or misrepresent the commit graph (§10) in a
   way that would teach an incorrect Git model.
4. A gamification mechanic is proposed (§27) with no Owner Decision yet.
5. A change would add a Git command/concept to any learner-facing surface (lesson, cheat sheet,
   hint, error message) that isn't in `docs/Git & GitHub.pdf` (Engineering §15).
6. A persisted-data or authentication change is implied by a UX request (e.g., "let learners see a
   friend's progress") — always Engineering territory (Engineering §17).
7. A request implies a dedicated Teacher-only or Admin-only screen/view beyond the minimal
   password-recovery administration already scoped (§1, Engineering §16, §18) — the Teacher
   Dashboard is deferred; building teacher-specific UI ahead of that decision is a scope escalation,
   not a routine UX task.

---

## 30. Project UX/UI Profile — Git Learning Lab (TBD)

This section accumulates real, evidenced facts as the project is actually built. It is intentionally
sparse now — do not invent breakpoints, a token system, or a component inventory that doesn't exist
yet; that would misrepresent the current state to a future session.

- **Breakpoints**: not yet established. Use §11.D's three portable classes until real ones are
  measured and recorded here.
- **Design tokens / component library**: not yet established. Use plain, consistent values and
  prefer CSS custom properties over hardcoded ones from the start, so a future token system has
  something coherent to formalize — but no formal token registry is required for the MVP.
- **Theme support (light/dark)**: not yet decided. If added, follow the general rule (tokens, not
  hardcoded colors; verify every activation path independently) but do not build this speculatively
  before it's requested.
- **Known debt**: none logged yet — this section is updated as real implementation surfaces real
  inconsistencies, not backfilled with guesses.
- **Interaction model**: client-side-interactive by design (terminal, visualizer, live feedback) —
  unlike a mostly-static reference site, loading/pending states (§14) are a first-class concern from
  the start, not an edge case.
- **Deployment target**: the frontend deploys to Cloudflare Pages and calls a Cloudflare Worker API
  for anything server-authoritative (Engineering §11) — there is no server-rendered templating layer
  to lean on. This doesn't change UX methodology, but it does mean every persisted action (sign-in,
  progress save, quiz/challenge submission) is a real network call with real latency (§14), not a
  same-process operation.

---

## 31. Version History

**v1** (this file, authored ahead of the September 12, 2026 Classroom MVP): written from scratch for
Git Learning Lab. Establishes the protected Lesson Flow (§6) and four-zone visualizer contract (§9)
as this project's primary Tier-B surfaces, defines terminal-specific interaction and accessibility
requirements with no precedent in prior methodology this project drew on, and states an explicit
anti-over-gamification rule (§27) given the product direction's deliberate omission of competitive
mechanics. Project Profile (§30) is deliberately left mostly TBD, to be filled from real
implementation evidence rather than invented ahead of it.

**v1.1** (architecture-alignment revision, same pre-MVP period): added role-aware UI guidance for
the newly locked v0.9 Student/Teacher/Admin model (§1) — Teacher uses the same learner-facing UI in
v0.9, Admin gets only a minimal account/recovery screen, no dedicated Teacher Dashboard UI is in
scope yet; extended Progress Clarity (§22) and the STOP list (§29) to cover cross-role data/UI
leakage, not just cross-learner; and noted the Cloudflare Pages/Workers deployment target in the
Project Profile (§30) as a fact affecting latency/loading-state assumptions, without inventing any
new design-system specifics. No section was renumbered.

**v1.2** (P0 consistency micro-patch): clarified §6's Protected Lesson Flow — "Practice" is the
required pedagogical stage, but does not always mean terminal/simulator practice. Conceptual,
no-command modules use conceptual interactive practice (matching/sequencing/scenario selection);
command-teaching modules use simulator/challenge practice. The four-stage contract and Tier-B
protection are unchanged; this corrects a wording gap that had implicitly required simulator
practice everywhere, which conflicted with the project's conceptual-only opening modules. No section
was renumbered.
