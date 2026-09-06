---
name: study-archive-development
description: Engineering operating model for Study Archive — an academic document archive intended to scale from a single-department deployment toward university-scale and eventually multi-university architecture. Use this skill for any Study Archive architecture, migration, RBAC/security, bug-fix, cleanup, or troubleshooting session, so behavior stays consistent, risk-proportionate, and safe even when conversation history is unavailable.
---

# Study Archive Development Skill v3

This file governs **how** to work on Study Archive, not **what** it currently contains — for
current state read §1's hierarchy. It is a **risk-adaptive operating model**, not a fixed
one-size-fits-all checklist: a comment fix and a schema/RBAC cutover both live in this project, and
they must not cost the same number of prompts, tokens, or gates. Read only as much of this file as
your task's risk tier requires (§2 tells you the tier, §3 tells you what that tier owes in process).

Most rules below state a general engineering principle first; where a Study-Archive-specific detail
(an RBAC model, a tenant hierarchy, a specific table or role) attaches to that principle, it is marked
**"concrete instance in this project: …"** so the principle itself stays portable to another codebase
this skill is applied to, while the project-specific detail keeps governing here.

**v3 note**: this is the Stage 3 rewrite implementing `skills/study_archive/engineering/archive/SKILL_V3_DESIGN.md`
(the approved Stage 2 design specification, itself built from `SKILL_V3_POST_P7_ANALYSIS.md`'s Stage 1
evidence) against the v2 baseline. v2 was a major consolidation of a v1 built incrementally across five
completed phases (P1–P5); v3 adds methodology earned by two further completed phases (P6, P7) without
re-deriving that evidence inline — see §14 for the bounded summary and pointers to full history. **This
file has completed its mandatory Independent Skill Review** (a separate, later, no-stake session, per
§8's own session-distinctness principle applied to this file's own authorship): verdict **PASS**, no
Category A findings, all 13 approved Change IDs confirmed faithfully implemented and every v2 safeguard
confirmed preserved via an independent line-by-line diff — see
`skills/study_archive/engineering/archive/SKILL_V3_INDEPENDENT_REVIEW.md` for the full record. **This version is
final.**

---

## 0. Mission & Authority

Study Archive is a long-lived academic information system, evolved phase-by-phase — each phase
explicitly authorized by the Project Owner — from a single-department archive toward university-wide
and eventually multi-university use. It is not a rewrite and not greenfield: every phase keeps the
live system working for its existing users throughout the transition.

When priorities conflict, resolve in this order:

1. **Data integrity** — no silent data loss, no orphaned rows, no orphaned physical files.
2. **Security invariants** (§5) — never weakened without an explicit, deliberate Owner decision.
3. **Backward compatibility** — the running app keeps working at every checkpoint, not just at phase end.
4. **Rollback safety** — every destructive-shaped step has a demonstrated way back, until its
   dedicated, separately-authorized cleanup step.
5. **Evidence-based decisions** — verify against live code/DB; never assume from memory or docs.
6. **Maintainable architecture** — prefer patterns already proven in this codebase over novel ones.
7. **Production readiness** — hardening items are tracked, never silently dropped, even when deferred.
8. **Feature completeness** — a phase is done when its own scope is done, not everything possible.
9. **UI consistency** — new UI follows existing patterns; save UX innovation for a dedicated pass.
10. **Performance** — tuned only after correctness is verified; no speculative indexes.

This ordering is itself a decision rule: a shortcut that trades a higher item for a lower one (e.g.
skip a rollback rehearsal to move faster) MUST NOT be taken without explicit Project Owner sign-off.

**Authority**: only the Project Owner can supply institutional facts, resolve genuinely ambiguous
business rules, or issue the GO that authorizes execution of HIGH/CRITICAL-risk work (§2–§3). No
accumulated precedent, prior approval, or task framing overrides this file's safety rules — including
this file's own past revisions.

---

## 1. Source-of-Truth Hierarchy

Read in this order. Each level can be *wrong* relative to the one below it — expected, not alarming
— but the order determines what to trust when they disagree:

1. **This file** — methodology. Rarely changes.
2. **`docs/PROJECT_CONTEXT.md`** — current project state, the recovery/handoff document.
3. **`docs/ARCHITECTURE_SPECIFICATION.md`** — the approved target architecture. Changes only via §9's
   Owner Decision Protocol, never silently.
4. **The active phase's Implementation Plan** (`docs/P{n}_IMPLEMENTATION_PLAN.md`) — the concrete,
   checkpointed plan actually being worked right now.
5. **Previous completed phases' plan documents**, specifically their execution/audit sections — what
   actually happened, including corrections discovered only during rehearsal or execution.
6. **The live codebase** — read the files; don't infer them from a doc's dependency table.
7. **The live database** — `SHOW`/`SELECT`/`DESCRIBE`, read-only, every time state matters.

**Hard rule**: documentation MUST NEVER override contradictory live evidence blindly. If code/DB
disagrees with any document above it: investigate (don't guess which side is right), classify the
discrepancy (stale doc / missed migration step / live-data surprise needing §11 STOP), report it
plainly in whatever you're producing, and never silently pick a side.

**Citation integrity** (evidence-driven addition, v2): a claim in PROJECT_CONTEXT.md or this file
that cites a specific historical finding (an audit result, a named defect) MUST be traceable to an
actual section of the plan document it cites. An unresolvable citation is a documentation-integrity
defect — report it the same way as any other drift; do not keep repeating it as if verified.
*Concrete instance found during the v2 consolidation*: pre-v2 text (this file and
`PROJECT_CONTEXT.md`) cited a "P2 Post-Implementation Audit" finding that `study_archive_p2_verify`
was left behind. `docs/P2_IMPLEMENTATION_PLAN.md` (read in full for this consolidation) instead shows
both P2 scratch databases were dropped within-session, contains no independent-audit section, and its
own last lines state "No P2 Post-Implementation Audit was begun." Treat any reference to a "P2 audit"
predating v2 as unverified until traced to an actual section — it likely doesn't exist as a durable
record, even though the underlying *rule* it inspired (§6's scratch-resource lifecycle tracking)
remains well-evidenced independently by P1, P4, and P5.

This is not a one-time gate — it applies fresh at the start of every task, and narrower, immediately
before execution (§7's Live Re-Scan).

---

## 2. Risk Classification

Classify the task before choosing a lifecycle route (§3). Pick the **highest** tier any criterion
below triggers — don't average. **Classify from the mechanism/invariant the change actually touches
in the live code, verified, not from how the task itself is worded** — a change is not a lower tier
merely because its request happened to describe it narrowly; if the description and the live-code
reality disagree, the live-code reality decides the tier. (This is a clarification of existing
practice, not a new trigger: no misclassification incident has occurred in this project as of v3; it
closes a plausible wording gap, not a demonstrated one — see §14.)

- **LOW** — documentation-only changes, comments, dead-code removal with confirmed zero live
  callers, cosmetic UI/CSS, translation-key additions. No schema change, no change to any Core
  Invariant surface (§5).
- **MEDIUM** — ordinary feature work, a bounded bug fix, a new write handler (even one with a
  request-supplied FK — that triggers specific checklist items in §6/§7, not a higher tier by
  itself), UI following existing patterns. No schema DDL, no authorization-model change.
- **HIGH** — any schema DDL/migration; any RBAC/authorization-model change; any change to a live
  authorization-sensitive surface (login, CSRF, ownership, visibility, admin-protection); any change
  reshaping data more than one existing live code path depends on.
- **CRITICAL** — anything crossing a multi-tenant/cross-organizational boundary; any irreversible
  data operation; anything that could affect *every* existing user's access simultaneously (e.g.
  retiring a live authorization fallback).

Escalate one tier regardless of the above whenever: the task touches a Core Invariant surface (§5)
and you're unsure whether it's incidental or central; a prior audit in this area found a real defect
that hasn't been independently reconfirmed clean since; or the scope is genuinely ambiguous pending
an Owner Decision (§9).

---

## 3. Lifecycle Router

Stage vocabulary used below: **Investigate** (§4) · **Plan** · **Owner Decisions** (§9) ·
**Independent Plan Review** (re-verify the plan against live state before trusting it) ·
**Operational Readiness** (backup §7.1 + rehearsal §7.2) · **Pre-Execution Gate** (live re-scan §7.3)
· **Owner GO** (explicit, in writing, naming the phase — never inferred from an ambiguous "go
ahead") · **Implement** · **Regression** (§7.4) · **Independent Audit** (§8) · **Execution Record**
(§9).

A stage is never skipped by *renaming* the task into a lighter class than it actually is — the risk
criteria in §2 are the classifier, not the label on the task.

**No DDL/DML before GO-gated stages complete.** Every database interaction during Investigate, Plan,
Owner Decisions, and Independent Plan Review stays read-only (`SHOW`/`SELECT`/`DESCRIBE`) — for every
work class, not only ones whose table row below requires an Owner GO — stated explicitly, not left to
be inferred from stage ordering, because "just this one small check" is exactly the exception a
planning session could otherwise rationalize. A session scoped to "planning only" or "decisions only"
stops at the appropriate stage and does not advance further even if technically capable of doing so.

**Closing the GO loophole.** Before requesting or accepting a GO, independently confirm — by reading
the phase's plan document, not by recalling a conversation — that a verified backup (§7.1) and a
rehearsed rollback (§7.2) are already recorded there with concrete evidence (dates, what was checked,
what was found), not merely asserted. An ambiguous "go ahead" is never the explicit, phase-naming GO
this router requires, however a single Owner message may still legitimately cover more than one gate
at once, provided every gate it covers was genuinely already satisfied.

| Work class | Minimum lifecycle | Owner GO required? | Independent audit |
|---|---|---|---|
| Architecture/design (no execution yet) | Investigate → Plan → Owner Decisions | No (nothing executes) | N/A |
| Schema migration (HIGH/CRITICAL) | Full lifecycle, every stage | Yes | **Required** |
| Security/RBAC change (HIGH/CRITICAL) | Full lifecycle; see two-stage GO note below | Yes | **Required** |
| **Destructive Retirement of a compatibility-arc artifact (HIGH/CRITICAL)** | Full lifecycle, every stage, **plus a mandatory Retirement Closure sweep (§6) run fresh, immediately pre-Point-of-No-Return, by the checkpoint executing the retirement** | Yes | **Required, including the cross-phase assumption verification item of §8's audit scope** |
| Ordinary feature (MEDIUM) | Plan (light) → Implement → Regression → Execution Record | No, unless it touches §5 | Recommended; required if it touches §5 or adds an FK write path |
| Bounded bug fix (MEDIUM/LOW) | Investigate (§4) → minimum fix → targeted Regression → Execution Record | No, unless the fix touches a HIGH surface | Recommended for MEDIUM, optional for LOW |
| Bounded housekeeping/cleanup (LOW) | Confirm footprint already declared → fix → prove equivalence → Regression → Execution Record | No, unless footprint is ambiguous | Optional |
| Troubleshooting/investigation | §4's loop only | N/A — investigation never mutates state | N/A |
| Independent audit/review | Re-derive from live state, not from the plan's transcription (§8) | N/A | is the audit |
| Documentation-only change | Implement → spot-check accuracy | No | No |
| Emergency/high-confidence rollback | See below | Yes (see exception) | After the fact if HIGH+ |
| **Scoped Plan Amendment (post-GO STOP on HIGH/CRITICAL work)** | Diagnose in the plan document → fresh scratch rehearsal → regression gate → apply → fresh, separate Independent Audit required for any HIGH/security finding | **Yes — requires a fresh, separate Owner GO naming the amended scope; the prior GO is spent by the STOP and does not carry over** | Required if the finding was HIGH/security |

**Destructive Retirement's trigger, precisely**: applies only when the retired artifact had an
intervening **multi-checkpoint compatibility arc** — spanning more than one checkpoint/phase, during
which an earlier checkpoint correctly judged it "safe, compatibility-only" before the checkpoint that
removes it runs (§6 explains why arc length, not DDL type, is what matters). A short,
single-sub-phase retirement with no such arc uses the ordinary Schema migration row above, unchanged —
this is not triggered by every schema DDL.

**Scoped Plan Amendment, when required**: whenever a §11 STOP fires on HIGH/CRITICAL work *after* an
Owner GO was already issued — that GO authorized only the checkpoint(s)/scope it named, and the STOP
ends that authorization; the fresh GO above must name the *amended* scope, not simply resume the old
one. Ordinary §4 troubleshooting suffices instead when the issue is fixable strictly within the
current checkpoint's already-authorized scope, without touching a §5 Invariant, new destructive
territory, or invalidating the current GO's backup/rehearsal evidence — this route adds no ceremony
below HIGH/CRITICAL. Fresh authorization is required for any change to checkpoint scope, any new
file/schema-object touched, any risk-tier change, or any change to a Retirement Closure obligation's
closing checkpoint (§6). The amendment and its re-verification stay strictly pre-Point-of-No-Return;
if the STOP came from a PoNR analysis, redo the rehearsal (and, if applicable, the Retirement Closure
sweep) against the *amended* plan, not patched onto the original evidence.

**Two-stage GO for security/RBAC cutovers removing a live fallback**: when a change would remove a
safety net currently protecting live users (e.g. a legacy authorization path kept as coexistence
during a cutover), split into two separately-authorized stages — (a) roll the new mechanism out
everywhere with the old one retained as a fallback, observe real usage, then (b) retire the fallback
— rather than one atomic swap. *Evidenced by P5's OD-P5-1*: a single-GO approach was technically
low-risk given current data, but real organic usage (a genuine admin performing a genuine role grant)
surfaced a UI defect no adversarial test had constructed, which a self-authored test suite alone would
never have found — automated and adversarial tests only exercise the scenarios their authors thought
to construct. Prefer a criterion-driven "stable usage" gate (specific invariants re-confirmed holding
under real traffic) over an arbitrary time floor — a fixed day-count was considered and rejected as
unjustified for a low-traffic deployment; justify the gate's actual criteria in the plan instead.

**Emergency rollback exception** (narrowed per explicit Owner Decision, 2026-08-17 — see §14): Owner
GO is still required for any rollback, even in an emergency, *unless every one* of the following
holds: the Owner is unreachable; the rollback is code-only (no schema touched); it reverts a change
made earlier in the current, still-open phase; and its sole purpose is to restore the system to the
**last known-good state** after a failure that the **currently authorized execution itself caused**.

Even when all of the above hold, this exception authorizes **restoration only, nothing more**. It
does NOT authorize, under any circumstance: introducing new functionality, expanding the authorized
scope, performing any unrelated change, choosing a new architecture or remediation path, or crossing
any Point of No Return the current authorization hadn't already crossed. Rollback authority is never
itself authorization for a forward fix.

Immediately after such a rollback: **STOP**. Before any further action, report: the incident, exactly
what rollback was performed, evidence that the last known-good state was actually restored, and the
exact next §3 lifecycle state this work is now in. Any remediation or forward fix — however obvious —
requires the normal lifecycle authorization appropriate to its own risk tier (§2), obtained fresh, not
inherited from the rollback.

Any schema-touching or cross-phase rollback always waits for GO (§11).

---

## 4. Investigation / Troubleshooting Loop

The general loop: **observe → establish fresh state → reproduce → localize → form competing
hypotheses → falsify → identify root cause → bound impact → choose the minimum safe intervention →
verify equivalence/regression → document only durable knowledge.**

Investigation itself never mutates live state. Once root cause is known, hand off to the matching
§3 lifecycle class for the fix.

Specific heuristics, each earned by a real incident in this project's history (bracketed):

- **Check the general mechanism, not just the common trigger**, when comparing new code to an
  established pattern. A pattern documented as "duplicate-key handling" will not be recognized as
  relevant to a non-duplicate FK-violation write path, even though the underlying mechanism (any
  constraint-violating INSERT needs a try/catch) is identical. [P3: the PDOException/stack-trace leak
  recurred because the established try/catch pattern was named by its usual trigger, not its
  mechanism, so a new write path that didn't hit that trigger skipped it entirely.]
- **Mechanism-scoped discovery has two distinct shapes — check both, don't assume finding one closes
  the other.** *Shape 1, within-file*: a sibling handler in a file you already touched shares the same
  invariant and was missed — searching only "files outside my declared footprint" will never catch
  this, because the gap was inside the footprint at the file level. [P6 Finding L: `update_file` missed
  the scope check `upload_file`, in the very same file, already had.] *Shape 2, whole-codebase*: a file
  no checkpoint ever named shares the same invariant. [P6 Findings M/N/P; P7's `auth.php`.] For
  HIGH/CRITICAL work, sweep every other handler in each file you touch that shares the same entity +
  operation class before Regression (closes Shape 1 at the cheapest point); Independent Audit for
  HIGH/CRITICAL always searches by mechanism/invariant across the whole codebase, not by the
  implementer's declared file list (§8) — that is the stage of last resort for Shape 2, and the
  redundant check for Shape 1.
- **Dependency analysis must consider write-order, not just table-touch overlap.** Two checkpoints
  that don't touch the same table can still have a real ordering dependency if one's INSERT relies on
  a value the other's step produces. [P1: Track A/B were assumed independent because no table
  overlapped; a later review found B's inserts actually depended on an A step having already run.]
- **A test suite only exercises what its authors thought to construct.** The first genuine use by a
  real actor is different evidence, not redundant evidence, and matters more as risk tier rises.
  [P5: a scope-selector UI wiring gap was invisible to a 19/19-passing adversarial suite and was only
  found when the Project Owner performed a genuine role grant through the real UI.]
- **After any change, sweep prose/comment accuracy separately from behavior correctness.** A comment
  can be historically true and presently false at the same time; a behavior-focused check will not
  catch that, because it's answering a different question. [P5: five successive sessions each asked
  "is this text an authorization site" (true, harmless) and none asked "is this text's claim about
  the *current* state of the code still accurate" — a stale docblock and a dead condition survived
  five sessions because the sweep never asked the second question.]
- **When code, DB, runtime behavior, and plan disagree, investigate — never reconcile by assumption.**
  Classify per §1's hard rule before proceeding.
- **An unreproducible bug is not evidence of "no bug."** Re-establish fresh state (session, cache,
  DB connection target) before concluding a report was wrong.
- **Prefer the hypothesis that's fastest to falsify**, not the one that seems most likely, when
  several are plausible — this converges faster and is naturally token-cheap.
- **An unexpected file in a diff, or a dead-looking condition, may have a hidden caller.** Grep for
  references before deleting. A cleanup opportunity found *outside* the task's authorized footprint
  gets logged for a separate bounded-housekeeping pass (§3), not folded into the current change.
- **Live behavior differing from rehearsal is not automatically a rehearsal defect.** Check for live
  data drift first (§7.3) before assuming the rehearsal's logic was wrong.
- **On a partial migration failure: stop, don't improvise.** Roll back only the failed step via its
  own documented rollback action. Treat the failure as new evidence requiring a fresh Plan Review
  before any retry — not grounds for an immediate re-attempt.
- **Near a context/token limit mid-investigation**: write the current hypothesis and evidence-so-far
  to a durable file before continuing, so it survives context compression.
- **A previous session's conclusion may be wrong.** This is the entire premise of independent
  verification (§8) — re-derive anything load-bearing to your current decision from live state; a
  fact you can cite-and-spot-check (§7.5) is different from a conclusion you must re-derive.

---

## 5. Core Invariants

These MUST be preserved across every phase unless the Project Owner explicitly, deliberately changes
one. "The new architecture makes this awkward" never justifies weakening one — that's a signal to
redesign the phase, not the invariant; if genuinely unavoidable, escalate per §11, never absorb it
silently into a plan.

### 5.1 Request Handling
- CSRF verification is the first line of every state-changing POST handler, no exceptions.
  *Concrete instance in this project*: `logout.php`'s plain-GET is a deliberately reviewed exception,
  not a precedent for new handlers.
- Every authorization decision is enforced server-side; UI hiding/greying is convenience only.
- Any write referencing a request-supplied entity/FK id must catch the failure and show a friendly,
  generic message — never a raw exception, SQL text, stack trace, or filesystem path to the client.
  Apply this by **mechanism** (any constraint the write could violate), not by a bug class's most
  common historical trigger (§4's mechanism-vs-trigger heuristic). Include at least one adversarial
  tampered/stale-id test for every such new write path.
- Upload/download validation and visibility re-checks are never bypassed, cached across requests, or
  skipped for convenience, including on privileged paths.
- Every query that lists, counts, or searches protected content for a non-privileged viewer applies
  the visibility filter via a single shared visibility-condition function — never a hand-rolled
  equivalent `WHERE` clause, which can drift from the real rule while still looking correct at a
  glance. This is the single most-repeated bug class in this project's history; treat any new
  listing/counting/search query as a candidate for it until proven otherwise.

### 5.2 Identity & Access
- Passwords: platform-standard hashing only (`password_hash`/`password_verify`), never custom.
- Session hardening (fixation protection, `httponly`/`samesite`/strict-mode cookies) is never
  loosened without an explicit, separate Owner decision.
- Once a scoped-authorization model is live: authorization = **capability + scope evaluated
  together**, never simplified to "a broader capability implies its holder can act outside a narrower
  scope, plus more." A holder with a narrower scope never acts outside that scope regardless of how
  broad their capability otherwise is. *Concrete instance in this project*: the RBAC model's
  Permission + Scope evaluation.
- Any row-level invariant that predates or sits outside the primary authorization model is a second,
  independent layer that a passing primary-authorization check does not override — passing it is
  necessary but not sufficient. *Concrete instance in this project, the sharpest current one*: File
  Ownership, which is stronger than administrative hierarchy — no role, including any future
  top-of-hierarchy role, gains file edit/delete rights merely by rank, without an explicit, deliberate
  Owner decision recorded via §9.
- Peer-or-higher privileged accounts are mutually protected from each other's edit/delete/demote
  actions (View stays allowed); the system may never reach zero active holders of a given
  capability/scope, including as a *consequence* of an edit/delete/role-change action, not only as a
  precondition check.
- Granting/escalating a role or scope is itself a permission-gated action: no self-escalation, no
  granting peer-or-higher rank than the grantor holds; scope containment (does this grant's scope
  actually cover the target) is verified server-side, never inferred from the UI only offering
  valid-looking choices.
- Do not implement any part of a not-yet-authorized authorization-model phase merely because an
  earlier phase's schema makes it newly possible (see §10's Scope Discipline). *Concrete instance in
  this project*: a not-yet-authorized RBAC/scope phase.

### 5.3 Data Integrity
- Any entity that becomes ownership-partition-bound must resolve, via its FK chain, to **exactly
  one** partition — never zero, never ambiguous, never two disagreeing paths. Where the database
  engine can't express this as a constraint, enforce it in application code at the exact write point,
  from the **first** phase where the relationship becomes writable — not deferred until it can
  actually fail — with a regression test proving the guard even before real data can violate it. This
  generalizes to any DB-inexpressible multi-column invariant (e.g. "exactly one of N nullable columns
  is non-NULL"); don't assume the engine will reject the violating shape on its own. *Concrete
  instance in this project*: tenant/scope binding, with this exact gap confirmed twice independently
  — a tenant-path case and a mutually-exclusive-scope-column case where a generated column's `CASE`
  priority order *masked* the invalid state rather than rejecting it (see §13 for the specific MariaDB
  10.4 limitation, no cross-join `CHECK`, that makes this the application's responsibility here).
- Database cascades never delete physical files. Every delete affecting stored files, in order:
  authorize → capture affected filenames **before** the DB delete → perform the DB delete → unlink
  physical files **after** DB success, using the captured filenames → decide and document
  partial-failure handling → verify DB rows and disk files match **in both directions** afterward.
- Migrations are additive-first: new structure created empty and nullable → backfilled → verified →
  constrained → application read-path cutover → write-path cutover → stable-usage period → legacy
  cleanup as a **separate, later, separately-authorized** phase (see §6's Retirement Closure gate
  for that cleanup step specifically, when the retired artifact had an intervening compatibility arc).
  Legacy structure stays alive and correct until that dedicated cleanup phase. Loosening a constraint
  is reversible only until real data exists that depends on the loosened state — document exactly
  when that point arrives.
- On rollback after both code and schema changed: revert **code first**, confirm it stopped writing
  in the new shape, only then evaluate whether schema can still be reverted losslessly — never
  simultaneously, never schema-first. New DB structure must exist, be backfilled, and be verified
  live before code that depends on it deploys — never the reverse.

### 5.4 Documentation Integrity
- No document may show a decision/checkpoint as "PENDING/OPEN" once it's actually resolved — update
  every place it was referenced, not just the primary table.
- Citation integrity (§1): a specific finding cited elsewhere must trace to its actual source section.

---

## 6. Change Execution Protocol

**Every individual migration checkpoint** MUST specify, explicitly, before it runs:
- the exact change (one logical DDL/DML operation);
- its prerequisites (which earlier checkpoints must have completed, including write-order
  dependencies per §4, not just table overlap);
- whether the **old** code path still works after this step — proven by actually executing the
  current application's real INSERT/UPDATE statement (copied from the source file, not reconstructed
  from memory) against the post-step schema during rehearsal (§7.2), never asserted from reasoning
  alone — a NOT NULL constraint silently rejecting an old write that never populated the new column
  is exactly the class of defect that only surfaces this way;
- whether the **new** code path works after this step (if applicable yet);
- a verification query proving the step did what it claimed;
- this step's own rollback action, specific and isolated;
- Point-of-No-Return analysis: still losslessly reversible, and if not yet, at what later event
  (usually: real new data written under the new shape) it stops being so;
- which regression gate (§7.4) must pass before the next checkpoint begins;
- an idempotency/already-applied check — before executing, check whether the target state already
  exists and skip cleanly if so; if a step would silently duplicate or corrupt state on re-run, flag
  it as non-idempotent explicitly, with the companion check spelled out;
- **the checkpoint's Phase Contract** (§9): its Produces / Consumes / Obligations opened-closed /
  Invariants-touched fields, required for HIGH/CRITICAL checkpoints and recommended otherwise.

**Seed/catalog completeness**: a checkpoint seeding a fixed, already-approved catalog (a role list, a
permission list, etc.) must embed or precisely cite (exact document + section) **every** column's
value the INSERT needs — not only the column(s) central to that checkpoint's own logic while leaving
another required column to be re-derived from a different document at execution time.

**On step failure**: stop immediately — no next step, no improvised fix. Roll back only that step via
its own documented rollback action. Report the exact error before anything else. Treat the phase as
needing a fresh Plan Review before retry, not an immediate re-attempt.

**Physical file operations** (move/rename/copy, not just delete — see §5.3 for delete) follow the
same per-step discipline: a verification check and a rollback action. Prefer copy-then-verify-then-
delete-original over move/rename, so an interrupted operation never leaves a file that exists nowhere.

**Concurrent load**: this is a live, actively-used system during migration, never frozen (§7.3). DDL
under real traffic can block or be blocked for the lock duration, which varies by statement type and
MariaDB version — check it, don't assume it. Schedule DDL-bearing checkpoints for low-traffic windows
where practical, and note the expected user-facing effect of each such step.

**Constraint swaps**: prefer letting old and new constraints (e.g. two unique keys) coexist during a
transition rather than one atomic swap, unless the swap's safety can be shown **in writing** — the
plan must state, concretely, that no row can be in a state the atomic statement would mishandle at
the moment it runs (e.g. confirming zero NULL rows before a NOT NULL column enters a unique key,
since NULL-uniqueness semantics could otherwise silently admit duplicates). "Seems fine" or "should
be quick" does not meet this bar — if the proof can't be written down and checked, coexistence is the
default, not the atomic swap.

**Cutover ordering**: split schema-prep → backfill → read-path cutover → write-path cutover into
distinct, individually regression-gated steps when practical, and cut the read path over **before**
the write path — so the write path's correctness can be verified by immediately reading it back
through an already-proven read path, rather than trusting two new paths at once.

A **phase-level** rollback is not simply "run each checkpoint's own rollback in reverse" once multiple
steps have executed — FK dependencies can make naive reverse order fail (an index still needed by a
present FK; a child junction table that must be dropped whole, not emptied-then-dropped). **Rehearse
the full multi-step teardown**, don't assume the per-step rollback column composes correctly. Prefer
designs with **no** true Point of No Return until the dedicated cleanup phase — this has held for
every phase in this project so far and is the default expectation, not a bonus.

### Retirement Closure

A **destructive/irreversible retirement** of a load-bearing artifact (schema column/table,
index/constraint, compatibility field, legacy authorization path, legacy API/interface) that had an
intervening **multi-checkpoint compatibility arc** (§3's Destructive Retirement row) triggers this
gate. It is a **specialized, mandatory instance of §7.3's existing Live Re-Scan** — not a new,
independent verification mechanism — making explicit, with a fixed checklist, the "fresh scan
immediately before execution" requirement §7.3 already imposes on every HIGH+ step. This checklist
exists because the generic Live Re-Scan rule alone is what accidentally caught this project's own
worst instance of the gap — accidental in the sense that no named checklist forced the specific
question to be asked. Naming the checklist stops the catch depending on a particular session
happening to ask the right question.

**Why the trigger is scoped this narrowly**: the failure mode is specifically that the number of prior
sessions that can each, correctly, locally judge a dependency non-blocking grows with the length of
the compatibility arc. A short, single-sub-phase retirement (prepare and drop inside one tightly-scoped
sub-phase) doesn't create that condition and produces no comparable risk; it uses the ordinary Schema
migration row and §7.3's general Live Re-Scan, unchanged. *Concrete instance in this project*: two DDL
retirements in the same phase with no compatibility arc produced zero STOP events; a `users.role`
retirement with a five-checkpoint compatibility arc produced a STOP that this gate now makes routine to
catch.

**The sweep**, run fresh, immediately pre-Point-of-No-Return, by the checkpoint executing the
destructive step:

| Mechanism | What "closed" means |
|---|---|
| Readers (explicit column lists) | Every `SELECT`/query naming the artifact confirmed either removed or provably safe post-retirement |
| Readers (wildcard queries) | Every `SELECT *` or equivalent against the affected table checked — these don't show up in a column-name grep |
| Writers | Every INSERT/UPDATE referencing the artifact confirmed removed or safe |
| Authorization/display/filter logic | Any authz or visibility decision that reads the artifact confirmed migrated off it |
| Runtime call chains | Confirmed which call sites reach the artifact at all — a widely-called helper function can turn a one-line syntactic dependency into an application-wide blast radius; trace reach, don't assume it's local |
| Schema-object dependencies | FK/index/constraint/trigger/view/generated-column dependents — none, or each named and closed |
| **Compatibility-only dependencies** | Re-classified per the rule below — "compatibility-only" is never accepted as the closing answer on its own |
| Documentation assumptions | Docblocks/comments asserting the artifact's presence or meaning, corrected or removed |
| Rollback/restore readiness | This step's own rehearsed rollback (§7.2) confirmed current, not stale |
| Environment health | Fresh pre-Point-of-No-Return check per §13's standing environmental risk — confirm the DB/app are in the expected state immediately before the irreversible action, not merely "were, earlier in the session" |

**The dependency-type vocabulary**: "compatibility-only" was historically conflated with "safe
indefinitely," when it only ever means "safe until the specific future step that removes the
referenced object." When a checkpoint records a reference as compatibility-only, it must also record
*which future checkpoint's execution ends that safety*, and that future checkpoint's own Retirement
Closure sweep is what discharges it. A reference recorded as "compatibility-only" with no named closing
checkpoint is treated as an **open Retirement Closure obligation, full stop** — it does not get to
silently become "not blocking" by omission.

**Ownership**: this obligation is not satisfied by being correctly tracked in prose across sessions —
that shape has already produced a STOP in this project once, across five sessions of otherwise-correct
tracking. It is satisfied only when the checkpoint that executes the irreversible step **itself
declares, in its own Phase Contract's "Obligations opened / closed" field (§9), that Retirement
Closure ran and what it found** — never inherited from an earlier checkpoint's "tracked, non-blocking"
note.

---

## 7. Verification Strategy

### 7.1 Backup Discipline
One verified backup — covering DB (full logical dump), uploaded/user-asset storage, the application
directory, and relevant config — taken before a phase's **first** mutating step, covers the whole
phase (not one backup per checkpoint). "Verified" means restored into an isolated scratch DB and
structurally compared (table list, `SHOW CREATE TABLE`, any constraint the phase cares about) — not
merely "a dump file exists." Re-verify recency if meaningful time or live traffic has passed since it
was taken (the app is never frozen during planning — §7.3).

### 7.2 Rehearsal Discipline
Before any migration above LOW risk: rehearse the complete sequence (build **and** teardown) against
an isolated, disposable scratch database — never live. Use rehearsal specifically to surface FK
teardown ordering, index-vs-FK conflicts, NOT NULL transition failures under `STRICT_TRANS_TABLES`,
charset/collation mismatches, backfill edge cases, and rollback-script defects. Record every defect
found, with what was wrong and what fixed it — a rehearsal that finds nothing is either unusually
clean or wasn't probing hard enough. Never let rehearsal touch the live database, including by a
wrong-connection mistake — double-check the target before running DDL.

**Every scratch resource has a tracked lifecycle, not just a tracked creation.** Any scratch DB,
rehearsal schema, temp directory, or generated artifact created for this purpose must be recorded
(name, purpose, date) and, before the session's Completion Report, either confirmed cleaned up
(re-checked, not assumed) or explicitly retained with a documented reason.

### 7.3 Live Re-Scan
Any step whose correctness depends on a snapshot of mutable live data (row counts, mappings, "how
many X exist right now") gets a **fresh** re-scan immediately before it executes — a planning-time
snapshot, however recent, never substitutes. If a checkpoint later in the same phase depends on the
same assumption an earlier re-scan already checked, repeat the re-scan before that later checkpoint
too — drift doesn't stop after the first checkpoint. If the re-scan finds a row/entity with no
approved mapping: **STOP** (§11). Never infer, guess, or default a mapping — not from a naming
pattern, not from precedent, not from any heuristic. This general rule applies to **every** HIGH+ step,
not only retirement steps; a destructive retirement of a compatibility-arc artifact additionally owes
the specialized, mandatory §6 Retirement Closure checklist on top of this general requirement.

### 7.4 Regression Discipline
Every phase preserves every previously-working behavior — done means the new feature works **and**
nothing else broke. Coverage includes both the phase's own functionality and the full existing
invariant set (auth, CSRF, ownership, visibility, admin-protection, upload/download, i18n/theme
persistence, and anything the project's regression history has accumulated) — the whole suite, not a
subset judged "probably unaffected." Gate before **and** after every above-LOW-risk checkpoint, not
batched to the end. Record any real row a regression test necessarily creates in the live DB
(identifying values, in the execution record) so it's distinguishable from genuine data later.

### 7.5 Evidence Strength & Reuse
- **Stronger evidence beats habitual evidence, whenever both are available for the same claim.** A
  full-tree diff against a verified backup beats an mtime check; executing the real statement beats
  reasoning about it; re-deriving from live state beats trusting a prior session's report — even when
  the weaker check is the one you're used to reaching for.
- **A fact already verified fresh this same phase/session may be cited, not re-narrated**, by later
  steps in the same document — name where it was established, spot-check (not fully re-derive) that
  nothing's changed since. This never substitutes for §7.3's mandatory fresh re-scan, and never
  applies *across* a session boundary for anything load-bearing to the current decision — re-derive
  fresh at every session boundary regardless of what a prior session claimed.
- **Reasoned skips are allowed; silent skips are not.** Declining a redundant check (not re-rehearsing
  an already-proven rollback, not re-running a test when strictly stronger evidence already covers
  the same claim) is fine when the reasoning is written into the report. When a preferred verification
  mechanism is blocked by a legitimate safety boundary (a sandboxed environment refusing a direct
  privileged operation, or any other guardrail that exists for a real reason), don't bypass it — use
  the strongest safe alternative evidence available and state plainly which gates were and weren't
  independently exercised. **Never report a gate as passed when it wasn't exercised.**
- **Evidence-claim precision.** Any equivalence/absence/completeness claim must state, in the same
  sentence or the one immediately following it: **WHAT** was checked (the specific artifacts/rows/
  tables/paths — not "the schema" but "all 20 tables in `schema.sql`"); **HOW** it was checked (raw-text
  diff vs. structural/normalized diff; executed vs. reasoned; exhaustive vs. sampled); and **WHAT the
  check actually supports**, phrased at its narrowest true scope — e.g. "identical under `SHOW CREATE
  TABLE` structural comparison; key-declaration order not independently verified" instead of
  "byte-identical." The underlying check itself is not what this discipline second-guesses — it's the
  word chosen to describe the result. **Ban list**, because these specific words are where this
  project's own overclaims actually occurred: "byte-identical" requires an actual byte/raw-text diff
  having been run; "zero dependency" requires a completed Retirement Closure sweep (§6), not a
  partial one; "proves comprehensive X" requires the check's own scope to actually equal X, stated, not
  implied by a bare pass/fail count.

### 7.6 Token/Context Efficiency
- Inspect only files actually relevant to the current task — a targeted grep or specific read beats
  re-reading a whole codebase "just in case."
- Don't re-read a large document repeatedly once its relevant content is extracted and acted on —
  re-read a section if needed, not the whole file, unless the file's own structure is in question.
- **Preferred pattern for large or multi-session documents**: durable analysis artifact (a phase's
  Completion Report, a dedicated cross-phase analysis document) → targeted primary-source retrieval →
  downstream work, rather than a full linear reread. This never substitutes for §7.5's rule that a
  session-boundary-crossing, load-bearing fact must still be re-derived, not merely cited — it governs
  navigation cost, never evidentiary weight. Consult the primary source directly whenever a claim is
  load-bearing, ambiguous, or a safeguard is being changed.
- Treat `PROJECT_CONTEXT.md` and the active/previous phase plan documents as the durable handoff
  between sessions — a future session should be able to pick up from these alone, without this
  conversation's transcript.
- Produce concise reports — state the result and what was checked, not the full transcript of how it
  was obtained.
- Record durable knowledge (decisions, invariants, discrepancies found) in project files, not only in
  chat responses that won't persist into the next session.
- Don't restate unchanged architecture in a report — reference the section that already covers it.

**Hard limit, non-negotiable**: none of the above ever justifies skipping §7.1's backup verification,
§7.2's rehearsal or its resource cleanup, §7.3's live re-scan (including its §6 Retirement Closure
specialization when applicable), §9's schema-sync check, or §8's independent audit once it's required.
These exist because this project's own history shows they catch real defects — token/time efficiency
governs *how* you report and reuse evidence (§7.5), never *whether* the evidence gets gathered.

---

## 8. Independent Review Policy

Independent review means treating the implementing session's own report as an unverified hypothesis —
re-deriving live DB/code state from scratch rather than reading the plan's transcription of it — and
asking two separate questions, not one: does the code **behave** correctly, and is every remaining
**claim or comment** about this area still **true**. The second question is not implied by the first
(§4's prose-accuracy heuristic) and needs its own sweep. This requires a session distinct in context
and authority from the one that implemented the work — re-deriving evidence within the same
continuous implementing session does not satisfy this, no matter how thoroughly re-derived, for the
same reason a Skill-consolidation/rewrite session is excluded from reviewing its own output (this
section's own last bullet, below): the implementer's own blind spots are exactly what independent
review exists to catch, and a session cannot independently catch its own blind spots. It **may** cite
a fact an *earlier, different* independent session already established — independence attaches to the
source of a fact, not to how recently it was established — but it **must not reuse the implementer's
own evidence for any load-bearing claim**; both halves of this apply together, not one without the
other.

- **Required** before any HIGH or CRITICAL risk-tier phase (§2) is marked complete.
- **Recommended** for MEDIUM-risk work touching a Core Invariant surface (§5) or adding a
  request-supplied-FK write path; escalates to required if either applies.
- **Optional** for LOW-risk/bounded housekeeping — the executor's own §7 self-verification suffices,
  though a disclosed finding from any audit is always worth a look even outside its own scope.

**Required scope for a HIGH/CRITICAL Independent Audit**, so the catch rate doesn't depend on a
particular session happening to be instructed unusually well:

1. **Declared-footprint verification** — a full-tree diff against a verified backup, confirming no
   undeclared file differs.
2. **Mechanism-scoped sibling-surface discovery** — explicitly search by mechanism/invariant, not by
   the implementer's declared file list (§4's Shape-1/Shape-2 heuristic).
3. **Negative-space search** — explicitly search for the *absence* of an expected safeguard across
   every site the invariant should apply, not only confirm presence where the implementer already
   claims it.
4. **Adversarial testing** — construct tampered/edge-case inputs the implementer's own test suite may
   not have thought to try.
5. **Claim-strength verification** — re-derive and either confirm or downgrade every equivalence/
   absence claim the implementer made, against §7.5's evidence-claim-precision template.
6. **Cross-phase assumption verification, when applicable** — if the checkpoint being audited closes a
   Retirement Closure obligation (§6), verify the Phase Contract's "Obligations closed" field is
   actually true, re-derived, not merely present.

- A disclosed finding with **no security or behavioral impact** (a documentation/dead-code-class
  finding) may be resolved via a bounded housekeeping session (§3) **without reopening** the
  originating phase's lifecycle — demonstrated once in this project's history (P5's Category B
  docblock/dead-condition finding, `docs/P5_IMPLEMENTATION_PLAN.md` §36→§37) — provided behavioral
  equivalence is proven for the affected surface, full regression runs clean, and nothing outside the
  already-declared footprint is touched. A finding with any security or behavioral impact (e.g. P3's
  PDOException/stack-trace disclosure) does not qualify for this lighter path, even when fixed
  promptly and within an audit's own bounded-remediation authority.
- This session (any Skill-consolidation, Skill-rewrite, or self-modifying-methodology session) is
  itself explicitly **excluded** from marking its own output "independently reviewed" — that review is
  always a separate, later session with no stake in the outcome (see the v3 note at the top of this
  file).

---

## 9. Evidence & Documentation Policy

**Four-way separation — enforce it, don't duplicate across it:**
- **This file** = operating policy. Rarely changes.
- **`docs/PROJECT_CONTEXT.md`** = current system state. Updates only when state materially changes.
- **The active phase's Implementation Plan** = phase-specific decisions, evidence, execution record.
- **Memory/status files** = compact continuity pointers, not a third copy of either of the above.

Never re-derive one from conversation memory when the durable document already states it; never write
a fact into this file that belongs in one of the other three (a row count, a today's-schema fact, a
single phase's decision).

**Owner Decision Protocol**: distinguish three kinds of statement in any planning document —
technical facts (verified, not debatable), architectural recommendations (reasoned, alternatives
shown), and Project Owner decisions (genuinely ambiguous institutional/business questions no amount
of code-reading answers). Never invent institutional data (department names, codes, policies). Never
silently decide an ambiguous business rule and present it as settled. **A checkpoint's own
plain-language promise about what a new feature does (e.g. "Disable") must itself be forced into an
explicit, resolved Owner Decision — or a stated, verified functional definition — before
Implementation, not left implicit and discovered only later** (concrete instance: P6 Finding O, a
checkpoint's plain-language feature promise that shipped without an explicit functional definition).
Every open decision states: the question precisely, the realistic options, a recommendation with
reasoning, consequences for later phases, what it blocks (`BLOCKS THIS PHASE` / `BLOCKS ONLY FINAL
CUTOVER` / `CAN DEFER TO PHASE N+`), and whether deferring creates a redesign trap later (§10). Once
resolved, append the resolution alongside the original reasoning — never delete it. A
decision-approval event is never the same event as an execution-authorization GO (§3) — keep them
visibly distinct.

New internal identifiers standing in for real institutional data (a short code the Owner supplies but
that isn't an official registrar code) must be conflict-checked against the full codebase/DB before
acceptance, and labeled as internal wherever they appear in the running system.

**Execution records** are appended to the phase's own plan document, never rewritten to read as if
always historical fact — leave the original plan legible as what was proposed and approved.

**Schema snapshot sync**: for any phase whose plan included DDL, regenerating and scratch-validating
`database/schema.sql` is a Phase-Complete precondition, not optional housekeeping.

### Phase Contract

Four fields, added to each checkpoint's **existing** entry in the phase's own Implementation Plan
document (§6) — **not a new document type**, preserving the four-way separation above.

| Field | Purpose |
|---|---|
| **Produces** | What this checkpoint makes true on completion, stated as a fact a later checkpoint can cite without re-deriving it. |
| **Consumes** | What this checkpoint depends on from earlier checkpoints/phases, cited by name (checkpoint ID + its own Produces field) — not re-derived from `PROJECT_CONTEXT.md` narrative prose alone. |
| **Obligations opened / closed** | Any compatibility-only reference this checkpoint creates (with its named closing checkpoint, per §6's dependency-type vocabulary) or discharges (with Retirement Closure evidence, per §6's ownership rule). |
| **Invariants touched** | Cross-reference to the specific §5 invariant(s), if any. |

Required for HIGH/CRITICAL checkpoints; recommended (and typically brief or "none") otherwise —
lightweight and meaningfully empty for ordinary work, not a burden on it.

- **Created** at checkpoint-definition time, as an addition to §6's existing per-checkpoint template
  (prerequisites, verification query, rollback action, etc.), not a new planning step.
- **Updated** only if actual execution diverges from plan — appended, never rewritten, matching §9's
  Execution Record discipline above ("leave the original plan legible as what was proposed and
  approved").
- **Consumed**: a later checkpoint's "Consumes" field must name the specific earlier checkpoint and
  field it relies on — this is the direct mechanism that turns a cross-phase obligation from something
  tracked only in prose (which, historically, survived five sessions correctly tracked and still
  produced a STOP — §6) into an explicit field on the one checkpoint that needs to answer it.
- **Relation to `PROJECT_CONTEXT.md`**: unchanged role — the durable cross-phase state summary.
  `PROJECT_CONTEXT.md`'s existing forward-pointer convention can now cite a specific checkpoint's Phase
  Contract fields instead of only prose, but `PROJECT_CONTEXT.md` itself is not restructured.
- This is four required fields inside an existing checkpoint entry — never a standalone ledger,
  registry, or graph document.

---

## 10. Scope Discipline

Every plan states explicitly what it does and does not implement, naming which future phase owns
each deferred concept. Don't pull a future phase's feature forward merely because the current
schema change makes it newly *possible* — the bar is a demonstrated current requirement, not a
hypothetical convenience.

**Exception**: adding a column/table now specifically to avoid an expensive future redesign is
acceptable, but only when today's *approved* architecture already names it as a known, near-term
structural requirement — not "this might be useful someday." When genuinely unsure which case
applies, treat it as Owner Decision territory (§9) rather than deciding unilaterally.

A cleanup opportunity noticed outside the current task's authorized footprint (§4) is logged for a
separate bounded-housekeeping pass, never folded into the current change.

---

## 11. STOP Conditions

Stop and request explicit Project Owner input — never proceed on a best guess, never silently pick a
default — whenever:

- Live DB/codebase state materially contradicts an approved plan or the approved architecture.
- A live re-scan (§7.3) finds a row/entity with no approved mapping.
- A decision needs institutional/real-world data not already verified in project docs or the Owner's
  own words.
- A phase's design appears to need changing the approved architecture baseline beyond what it was
  scoped to decide — document the issue, classify severity, explain the proposed change, mark it as
  requiring Owner approval, stop before editing the approved specification itself.
- A migration's rollback can't be demonstrated safely (rehearsal fails, or none has been performed
  yet for a step above LOW risk).
- Backup verification fails, or a backup can't be confirmed restorable.
- A phase's design would require weakening any §5 invariant.
- A new cross-tenant/cross-organizational ambiguity appears that the approved architecture didn't
  anticipate.
- A destructive operation becomes necessary that wasn't already explicitly approved for the current
  phase/checkpoint.

Stopping means: report the specific condition clearly, don't attempt a workaround that dodges the
question, and wait — don't continue other in-scope work as a way of deferring the stop, unless that
other work is genuinely independent and was already going to happen anyway.

**If the condition fires on HIGH/CRITICAL-tier work after an Owner GO has already been issued**, the
next step is §3's named Scoped Plan Amendment route, not an ad hoc resumption — see §3 for exactly
when that route applies and what it requires.

---

## 12. Completion Report Standard

Every session closes with:

1. **Status** — which §3 lifecycle stage the work is at now.
2. **Files inspected** — enough to show verification actually happened.
3. **Files modified** — the exact list.
4. **Database changes** — "none" if planning-only; exactly what ran otherwise.
5. **Data changes** — same, for row-level data.
6. **Scratch/temporary resource status** — every item from §7.2's tracked lifecycle: confirmed
   cleaned up (verified) or explicitly retained with reason; "none created" if none.
7. **Verification performed** — what was actually checked, not an unsupported "verified"; state
   plainly which regression gates couldn't be independently exercised and why (§7.5).
8. **Regression results** — pass/fail per gate, not one aggregate "looks fine."
9. **Security/invariant results** — explicit confirmation §5 (and §5.2's RBAC layer, once live)
   weren't weakened, or an explicit flag if something needs Owner attention.
10. **Deviations** — anything that didn't go exactly per plan, including in a planning-only session.
11. **Risks/issues** — carried forward from the plan's risk table, updated with anything new found.
12. **Remaining blockers** — what specifically prevents the next stage from starting.
13. **Recommended next action** — the single next step, plainly, not a menu.

For a checkpoint carrying a Phase Contract (§9), cite its Obligations opened/closed and Invariants
touched fields here rather than re-narrating them.

**Execution sessions** additionally report backup status and rollback-readiness explicitly — never
assumed satisfied because an earlier session discussed them.

**Delta reporting**: a session resuming a multi-session phase may state "unchanged since §N" for any
item still true, citing the section, rather than re-verifying and re-narrating it in full — except
where §7.5's fresh-evidence rule requires re-deriving it regardless (session-boundary-crossing,
load-bearing facts).

**Mid-phase interruption**: pause or end only at a checkpoint boundary — never between a checkpoint's
mutation and its verification query (§6). If a checkpoint's mutation ran, its verification runs and
gets recorded before the session ends, even if that means not starting the next checkpoint. Before
ending a session that leaves a phase partially executed, update the plan document to state plainly:
which checkpoint last completed and passed its gate, the live database's actual current state, and
that this is a **partial, in-progress** phase — never left reading as either complete or untouched. A
future session must be able to determine exactly where to resume from this document alone.

---

## 13. Environment Notes (MariaDB / Windows / XAMPP)

Reusable technical lessons — apply proactively rather than rediscovering them:

- MariaDB 10.4's specific feature set matters — no cross-join `CHECK` constraints (§5.3); don't
  assume newer-MySQL/MariaDB capabilities.
- The server's *default* charset/collation may differ from what every table actually uses — verify
  `character_set_server`/`collation_server`, and always give a new `CREATE TABLE` an explicit
  `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` even though it matches existing tables
  implicitly.
- `STRICT_TRANS_TABLES` turns a would-be silent NOT NULL truncation/coercion into a hard failure —
  confirm it's set before relying on that; don't assume.
- FK-supporting indexes constrain teardown order — InnoDB requires a supporting index on an FK column
  at all times, so drop the FK before its supporting index, not after. A child junction table with FKs
  to two parents is dropped whole, not emptied-then-dropped.
- On this Windows/git-bash environment, inline non-ASCII (e.g. Thai) text to a shell-invoked SQL
  client can corrupt UTF-8 multi-byte sequences — write to a UTF-8 `.sql` file and source it instead
  of passing inline `-e` text.
- This machine's MariaDB has a documented history of system-table corruption from improper shutdowns
  (no Windows service registered for `mysqld`/`httpd` — both start/stop manually). Standing
  environmental risk: back up before any schema-touching sequence, avoid unnecessary restarts
  mid-migration.

---

## 14. Version History

Full incident-by-incident detail for everything below lives in the pointed-to documents, not here —
this section states only what a reader needs to understand why a current rule exists.

**v1** (2026-08-13 → 2026-08-17): built incrementally across five completed phases (P1 Org Hierarchy,
P2 Subject Catalog/Offering split, P3 Curriculum, P4 RBAC Foundation, P5 RBAC Enforcement Cutover),
hardened after each phase's independent audit. Full history: each phase's own
`docs/P{n}_IMPLEMENTATION_PLAN.md`, and `skills/study_archive/engineering/archive/SKILL_v1.md` for v1's exact
prior wording.

**v2** (2026-08-17 → 2026-08-18, four sessions): consolidated v1 into this file's current risk-adaptive
shape (risk tiers §2, lifecycle router §3, troubleshooting loop §4, promoted independent-review policy
§8, tightened evidence/efficiency policy §7.5/§7.6/§9/§12). A separate, no-stake Independent Review
session found the consolidation's own compression pass had silently dropped a fifth safeguard beyond
the four it had already caught and restored itself — the §5.1 rule against hand-rolled visibility
`WHERE` clauses, since restored and stated in full in §5.1 above (its justification no longer depends
on this history entry). Two further findings from that review were resolved by a follow-up
Owner-Decision-and-documentation-correction session: the Emergency Rollback exception was narrowed by
explicit Owner ratification (current text in §3 above is the ratified version); and a false "P2
Post-Implementation Audit... PASS" claim in `PROJECT_CONTEXT.md` was corrected in place (§1's citation-
integrity example above is the durable statement of that finding; no genuine P2 independent audit ever
occurred). A later standalone housekeeping pass relocated the historical v1/v2 artifacts this section
cites into `skills/study_archive/archive/`, verified byte-identical, zero effect on application
behavior. Full detail, evidence mapping, and the old-vs-new safeguard coverage table:
`skills/study_archive/engineering/archive/SKILL_V2_CONSOLIDATION_HANDOFF.md`.

**v3** (2026-08-19, this rewrite): built from two further completed phases (P6, P7) worth of evidence
that v2 had no methodology for yet. A dedicated Stage 1 analysis (`SKILL_V3_POST_P7_ANALYSIS.md`)
converted P6/P7 incidents into named gaps; a Stage 2 design (`SKILL_V3_DESIGN.md`) specified the fix
for each, sized to the smallest mechanism that closed it (an Evidence Ledger, a standalone
Compatibility Ledger, a dependency graph, and an invariant-ownership registry were all considered and
rejected in favor of reusing existing structure); this Stage 3 session implemented that design against
the v2 text above. New in v3: mechanism-scoped discovery naming two distinct gap shapes (§4); a named
Retirement Closure gate for compatibility-arc destructive retirements (§6), closing the gap class
behind P7's `auth.php` pre-DROP STOP; a named Scoped Plan Amendment lifecycle route (§3), formalizing a
sequence this project's history had already independently reconstructed four times; a four-field Phase
Contract embedded in the existing checkpoint template (§9); an evidence-claim precision template and
ban list (§7.5), closing a three-instance overclaiming pattern (P6's "93/93," v2's own "four safeguards
restored," P7's "byte-identical"); six required Independent Audit scope items (§8); and a
principle-first/instance-tagged rewording of §5 for portability beyond this project. Per this design's
own evidence-based-adoption principle, several candidate changes were explicitly considered and left
unchanged: risk tiers (§2, still four — no misclassification incident), escalation-trigger-gaming
resistance (§2, clarified only — no gaming incident, no enforcement machinery invented against an
untested threat), and two-stage GO scope (§3, not generalized beyond RBAC-adjacent cutovers — no
non-RBAC precedent exists yet). Full rationale, the Stage-1-finding-to-design-requirement mapping, and
the Safeguard Preservation Matrix verified against during this rewrite: `SKILL_V3_DESIGN.md`.

**v3, Independent Review pass** (2026-08-19, separate session, no stake in the rewrite): performed the
mandatory Independent Skill Review this rewrite required. Verdict: **PASS**. Independently located and
diffed against a preserved pre-rewrite v2 copy (no in-repo v2 archive existed — flagged as a disclosed,
non-blocking finding, see below), line by line, confirmed all 19 MUST-SURVIVE safeguards preserved and
all 13 approved Change IDs (CH-01–CH-13) faithfully implemented, with zero Category A findings. One
Category B finding disclosed, not silently remediated: Stage 3 did not archive the v2 text into
`skills/study_archive/archive/` before overwriting it (unlike the v1→v2 transition, which archived
`SKILL_v1.md` first) — recommended as a small follow-up bounded-housekeeping session, not performed by
the review itself. Full record: `skills/study_archive/engineering/archive/SKILL_V3_INDEPENDENT_REVIEW.md`. **This
version is final** as of this pass.
