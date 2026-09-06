---
name: study-archive-development
description: Engineering operating model for Study Archive — an academic document archive intended to scale from a single-department deployment toward university-scale and eventually multi-university architecture. Use this skill for any Study Archive architecture, migration, RBAC/security, bug-fix, cleanup, or troubleshooting session, so behavior stays consistent, risk-proportionate, and safe even when conversation history is unavailable.
---

# Study Archive Development Skill v2

This file governs **how** to work on Study Archive, not **what** it currently contains — for
current state read §1's hierarchy. It is a **risk-adaptive operating model**, not a fixed
one-size-fits-all checklist: a comment fix and a schema/RBAC cutover both live in this project, and
they must not cost the same number of prompts, tokens, or gates. Read only as much of this file as
your task's risk tier requires (§2 tells you the tier, §3 tells you what that tier owes in process).

**v2 note**: this is a major consolidation of a v1 built incrementally across five completed phases
(P1–P5). v1's exact prior wording is preserved at `skills/study_archive/archive/SKILL_v1.md` for
comparison (relocated from `skills/study_archive/SKILL_v1_ARCHIVE.md` during a 2026-08-18 bounded
housekeeping pass, content byte-identical, not renamed for any content reason). See
`skills/study_archive/archive/SKILL_V2_CONSOLIDATION_HANDOFF.md` (relocated from
`docs/SKILL_V2_CONSOLIDATION_HANDOFF.md`, same pass, same byte-identical guarantee) for the full
rationale, the evidence this version is built from, and the required scope of the still-pending
independent review of *this* file — v2 has not yet been independently reviewed; do not treat it as
final.

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
below triggers — don't average.

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
| Ordinary feature (MEDIUM) | Plan (light) → Implement → Regression → Execution Record | No, unless it touches §5 | Recommended; required if it touches §5 or adds an FK write path |
| Bounded bug fix (MEDIUM/LOW) | Investigate (§4) → minimum fix → targeted Regression → Execution Record | No, unless the fix touches a HIGH surface | Recommended for MEDIUM, optional for LOW |
| Bounded housekeeping/cleanup (LOW) | Confirm footprint already declared → fix → prove equivalence → Regression → Execution Record | No, unless footprint is ambiguous | Optional |
| Troubleshooting/investigation | §4's loop only | N/A — investigation never mutates state | N/A |
| Independent audit/review | Re-derive from live state, not from the plan's transcription (§8) | N/A | is the audit |
| Documentation-only change | Implement → spot-check accuracy | No | No |
| Emergency/high-confidence rollback | See below | Yes (see exception) | After the fact if HIGH+ |

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
- CSRF verification is the first line of every state-changing POST handler, no exceptions
  (`logout.php`'s plain-GET is a deliberately reviewed exception, not a precedent for new handlers).
- Every authorization decision is enforced server-side; UI hiding/greying is convenience only.
- Any write referencing a request-supplied entity/FK id must catch the failure and show a friendly,
  generic message — never a raw exception, SQL text, stack trace, or filesystem path to the client.
  Apply this by **mechanism** (any constraint the write could violate), not by a bug class's most
  common historical trigger (see §4's first heuristic). Include at least one adversarial
  tampered/stale-id test for every such new write path.
- Upload/download validation and visibility re-checks are never bypassed, cached across requests, or
  skipped for convenience, including on privileged paths.
- Every query that lists, counts, or searches protected content for a non-privileged viewer applies
  the visibility filter via the existing shared visibility-condition function — never a hand-rolled
  equivalent `WHERE` clause, which can drift from the real rule while still looking correct at a
  glance. This is the single most-repeated bug class in this project's history; treat any new
  listing/counting/search query as a candidate for it until proven otherwise.

### 5.2 Identity & Access
- Passwords: platform-standard hashing only (`password_hash`/`password_verify`), never custom.
- Session hardening (fixation protection, `httponly`/`samesite`/strict-mode cookies) is never
  loosened without an explicit, separate Owner decision.
- Once a scoped-role model is live: authorization = **Permission + Scope evaluated together**, never
  simplified to "higher rank can do everything a lower rank can, plus more." A higher rank with a
  narrower scope never acts outside that scope.
- Any row-level invariant that predates or sits outside the RBAC/scope model is a second, independent
  layer that a passing Permission+Scope check does not override — passing scope is necessary but not
  sufficient. **File Ownership is the sharpest current instance, and is stronger than administrative
  hierarchy**: no role — including any future top-of-hierarchy role — gains file edit/delete rights
  merely by rank, without an explicit, deliberate Owner decision recorded via §9.
- Peer-or-higher admin-tier accounts are mutually protected from each other's edit/delete/demote
  actions (View stays allowed); the system may never reach zero active holders of a given
  capability/scope, including as a *consequence* of an edit/delete/role-change action, not only as a
  precondition check.
- Granting/escalating a role or scope is itself a permission-gated action: no self-escalation, no
  granting peer-or-higher rank than the grantor holds; scope containment (does this grant's scope
  actually cover the target) is verified server-side, never inferred from the UI only offering
  valid-looking choices.
- Do not implement any part of a not-yet-authorized RBAC/scope phase merely because an earlier
  phase's schema makes it newly possible (see §10's Scope Discipline).

### 5.3 Data Integrity
- Any entity that becomes tenant/scope-bound must resolve, via its FK chain, to **exactly one**
  tenant/scope — never zero, never ambiguous, never two disagreeing paths. Where the database can't
  express this as a constraint (MariaDB 10.4 has no cross-join `CHECK`), enforce it in application
  code at the exact write point, from the **first** phase where the relationship becomes writable —
  not deferred until it can actually fail — with a regression test proving the guard even before real
  data can violate it. This generalizes to any DB-inexpressible multi-column invariant (e.g. "exactly
  one of N nullable columns is non-NULL"); MariaDB will not reject the violating shape on its own —
  confirmed twice independently in this project (a tenant-path case and a mutually-exclusive-scope-
  column case where a generated column's `CASE` priority order *masked* the invalid state rather than
  rejecting it).
- Database cascades never delete physical files. Every delete affecting stored files, in order:
  authorize → capture affected filenames **before** the DB delete → perform the DB delete → unlink
  physical files **after** DB success, using the captured filenames → decide and document
  partial-failure handling → verify DB rows and disk files match **in both directions** afterward.
- Migrations are additive-first: new structure created empty and nullable → backfilled → verified →
  constrained → application read-path cutover → write-path cutover → stable-usage period → legacy
  cleanup as a **separate, later, separately-authorized** phase. Legacy structure stays alive and
  correct until that dedicated cleanup phase. Loosening a constraint is reversible only until real
  data exists that depends on the loosened state — document exactly when that point arrives.
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
  it as non-idempotent explicitly, with the companion check spelled out.

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
pattern, not from precedent, not from any heuristic.

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

### 7.6 Token/Context Efficiency
- Inspect only files actually relevant to the current task — a targeted grep or specific read beats
  re-reading a whole codebase "just in case."
- Don't re-read a large document repeatedly once its relevant content is extracted and acted on —
  re-read a section if needed, not the whole file, unless the file's own structure is in question.
- Treat `PROJECT_CONTEXT.md` and the active/previous phase plan documents as the durable handoff
  between sessions — a future session should be able to pick up from these alone, without this
  conversation's transcript.
- Produce concise reports — state the result and what was checked, not the full transcript of how it
  was obtained.
- Record durable knowledge (decisions, invariants, discrepancies found) in project files, not only in
  chat responses that won't persist into the next session.
- Don't restate unchanged architecture in a report — reference the section that already covers it.

**Hard limit, non-negotiable**: none of the above ever justifies skipping §7.1's backup verification,
§7.2's rehearsal or its resource cleanup, §7.3's live re-scan, §9's schema-sync check, or §8's
independent audit once it's required. These exist because this project's own history shows they catch
real defects — token/time efficiency governs *how* you report and reuse evidence (§7.5), never
*whether* the evidence gets gathered.

---

## 8. Independent Review Policy

Independent review means treating the implementing session's own report as an unverified hypothesis —
re-deriving live DB/code state from scratch rather than reading the plan's transcription of it — and
asking two separate questions, not one: does the code **behave** correctly, and is every remaining
**claim or comment** about this area still **true**. The second question is not implied by the first
(§4's prose-accuracy heuristic) and needs its own sweep. This requires a session distinct in context
and authority from the one that implemented the work — re-deriving evidence within the same
continuous implementing session does not satisfy this, no matter how thoroughly re-derived, for the
same reason a Skill-consolidation session is excluded from reviewing its own output (this section's
own last bullet, below): the
implementer's own blind spots are exactly what independent review exists to catch, and a session
cannot independently catch its own blind spots.

- **Required** before any HIGH or CRITICAL risk-tier phase (§2) is marked complete.
- **Recommended** for MEDIUM-risk work touching a Core Invariant surface (§5) or adding a
  request-supplied-FK write path; escalates to required if either applies.
- **Optional** for LOW-risk/bounded housekeeping — the executor's own §7 self-verification suffices,
  though a disclosed finding from any audit is always worth a look even outside its own scope.
- A disclosed finding with **no security or behavioral impact** (a documentation/dead-code-class
  finding) may be resolved via a bounded housekeeping session (§3) **without reopening** the
  originating phase's lifecycle — demonstrated once in this project's history (P5's Category B
  docblock/dead-condition finding, `docs/P5_IMPLEMENTATION_PLAN.md` §36→§37) — provided behavioral
  equivalence is proven for the affected surface, full regression runs clean, and nothing outside the
  already-declared footprint is touched. A finding with any security or behavioral impact (e.g. P3's
  PDOException/stack-trace disclosure) does not qualify for this lighter path, even when fixed
  promptly and within an audit's own bounded-remediation authority.
- This session (any Skill-consolidation or self-modifying-methodology session) is itself explicitly
  **excluded** from marking its own output "independently reviewed" — that review is always a
  separate, later session with no stake in the outcome (see the v2 note at the top of this file).

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
silently decide an ambiguous business rule and present it as settled. Every open decision states: the
question precisely, the realistic options, a recommendation with reasoning, consequences for later
phases, what it blocks (`BLOCKS THIS PHASE` / `BLOCKS ONLY FINAL CUTOVER` / `CAN DEFER TO PHASE N+`),
and whether deferring creates a redesign trap later (§10). Once resolved, append the resolution
alongside the original reasoning — never delete it. A decision-approval event is never the same event
as an execution-authorization GO (§3) — keep them visibly distinct.

New internal identifiers standing in for real institutional data (a short code the Owner supplies but
that isn't an official registrar code) must be conflict-checked against the full codebase/DB before
acceptance, and labeled as internal wherever they appear in the running system.

**Execution records** are appended to the phase's own plan document, never rewritten to read as if
always historical fact — leave the original plan legible as what was proposed and approved.

**Schema snapshot sync**: for any phase whose plan included DDL, regenerating and scratch-validating
`database/schema.sql` is a Phase-Complete precondition, not optional housekeeping.

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

**v1** (2026-08-13 → 2026-08-17): built incrementally across five completed phases (P1 Org Hierarchy,
P2 Subject Catalog/Offering split, P3 Curriculum, P4 RBAC Foundation, P5 RBAC Enforcement Cutover),
hardened after each phase's independent audit. Full incident-by-incident history isn't reproduced
here — see each phase's own `docs/P{n}_IMPLEMENTATION_PLAN.md` for the original evidence, and
`skills/study_archive/archive/SKILL_v1.md` for v1's exact prior wording.

**v2** (2026-08-17, this consolidation): major restructure from an append-only rule list into a
risk-adaptive operating model — risk tiers (§2), a lifecycle router by work class (§3), an explicit
troubleshooting/diagnostic loop (§4), a promoted independent-review policy (§8), and a tightened
efficiency/evidence-reuse policy (§7.5, §7.6, §9, §12). See
`skills/study_archive/archive/SKILL_V2_CONSOLIDATION_HANDOFF.md` for the full evidence mapping and
the old-vs-new safeguard coverage table this consolidation produced.

**v2, Independent Review pass** (2026-08-17, separate session, no stake in the original rewrite):
performed the still-pending independent review the v2 consolidation itself required. Verdict: PASS
AFTER BOUNDED REMEDIATION. Provenance of `SKILL_v1.md` (then still named `SKILL_v1_ARCHIVE.md`,
relocated to `skills/study_archive/archive/` by a later 2026-08-18 housekeeping pass — see §14's
own note above) independently confirmed byte-identical
against a separately-preserved pre-P5b backup copy of `SKILL.md`
(`C:\xampp\backups\study_archive_pre_p5b_20260817_130954\`), not merely trusted from the consolidation
session's own claim. Contrary to v2's original text above, the consolidation's compression pass had in
fact silently dropped a fifth safeguard beyond the four it had already caught and restored itself: the
§11 mandate to apply the visibility filter via the shared visibility-condition function and never
hand-roll an equivalent `WHERE` clause — v1's own text called this "the single most-repeated bug class
in this project's history." Restored to §5.1. Four further bounded defects were found and fixed in the
same pass: §8's Independent Review definition now states explicitly that it requires a session distinct
from the implementer, closing a self-audit-as-independent loophole; §8's "proven twice" claim (only one
genuine matching instance exists in the evidence) corrected to name the one real instance; §3's
No-DDL/DML-during-planning rule, which had been narrowed to apply only to GO-requiring work classes,
restored to apply unconditionally to every work class as in v1; §5.2's File Ownership rule restored to
state the general row-level-invariant-beats-RBAC principle it is an instance of, not only the specific
instance. Two further findings were disclosed but explicitly not remediated by this pass: the
consolidation handoff's citation of "P2's Checkpoint 9" as independent-review evidence is itself
inaccurate (that gap was self-caught by the implementing session, not independently audited — no
independent P2 audit has ever been performed, per `docs/P2_IMPLEMENTATION_PLAN.md`'s own closing lines);
and the new "Emergency rollback exception" (§3) has no v1 counterpart or P1–P5 precedent and was added
without an Owner Decision record — flagged for explicit Owner ratification, not altered unilaterally.
`docs/PROJECT_CONTEXT.md`'s Phase Status table asserting a "P2 Post-Implementation Audit... PASS WITH
REMEDIATIONS" remains confirmed false and unresolved — out of this review's authorized scope (Skill
file only); needs its own dedicated documentation-only correction session.

**v2, Owner Decision + Documentation Integrity Correction pass** (2026-08-17, separate session):
resolved the two items the Independent Review pass above disclosed but left unremediated.

*Finding #7 (Emergency rollback exception, this section)*: Project Owner decision recorded —
**NARROW**. The exception now authorizes restoration only: it applies solely to restore the last
known-good state after a failure the currently authorized execution itself caused, and explicitly
excludes new functionality, expanded scope, unrelated changes, a new architecture/remediation path,
or crossing a Point of No Return the current authorization hadn't already crossed; rollback authority
is never itself authorization for a forward fix. A mandatory post-rollback STOP-and-report (incident,
rollback performed, evidence of restored state, exact next §3 lifecycle state) was added; any
remediation requires normal risk-appropriate lifecycle authorization, obtained fresh. See the revised
exception text above this History section.

*Finding #6 (P2 audit citation)*: independently re-verified against the primary source,
`docs/P2_IMPLEMENTATION_PLAN.md`, in full — confirmed its own closing lines state "No P2
Post-Implementation Audit was begun," both P2 scratch databases were dropped within-session, and the
one defect found during the phase (a missing per-offering Delete handler) was caught and fixed by the
**implementing session itself** during Checkpoint 9, not by any independent audit. No genuine P2
Post-Implementation Audit exists anywhere in the project's primary evidence. This file already stated
that correctly (§1's citation-integrity example, and the Independent Review entry above) and required
no further change. `docs/PROJECT_CONTEXT.md` — the actual "recovery/handoff document" per §1's
hierarchy — did assert the false "P2 Post-Implementation Audit... PASS WITH REMEDIATIONS" claim in
five places (its opening header, the Phase Status table's P2 entry, the P4 entry's P2 comparison, a
directory-tree comment mislabeling the post-P2-Housekeeping `schema.sql` regeneration as "post-P2
audit," and §11's summary sentence); all five corrected in place to state plainly that P2 completed
but was never independently audited, while leaving P2's completion status and every other phase's
audit record untouched. No historical primary phase-evidence document (`docs/P{n}_IMPLEMENTATION_PLAN.md`,
any of them) was altered — those remain the frozen record of what each session actually did and
claimed at the time, including any place they themselves cite the disputed P2 audit; only current-state
documentation was corrected. `skills/study_archive/archive/SKILL_V2_CONSOLIDATION_HANDOFF.md`
(relocated from `docs/SKILL_V2_CONSOLIDATION_HANDOFF.md` by a later 2026-08-18 housekeeping pass;
§7's "P2's Checkpoint 9... independent review" framing) still carries the same class of
misattribution and was deliberately left untouched, as a session-specific evidence artifact of the
completed consolidation rather than the
project's living handoff document — flagged here for whoever next has reason to touch that file.

**Artifact housekeeping pass** (2026-08-18, standalone session, immediately after resolving Finding
P — see `docs/P6_IMPLEMENTATION_PLAN.md`'s addendum, does not itself touch P6 or any phase content):
relocated the two historical Skill artifacts this section already cited by their old names into a
new `skills/study_archive/archive/` directory, so `skills/study_archive/SKILL.md` is the only file
directly in `skills/study_archive/` — `SKILL_v1_ARCHIVE.md` → `skills/study_archive/archive/SKILL_v1.md`
and `docs/SKILL_V2_CONSOLIDATION_HANDOFF.md` → `skills/study_archive/archive/SKILL_V2_CONSOLIDATION_HANDOFF.md`,
both copied then diff-verified byte-identical before the originals were removed (no content change,
confirmed). Every reference to either old path across the live project tree (`skills/`, `docs/`,
`admin/`, every other PHP/Markdown file) and this project's own memory records was found by a
project-wide grep first, then updated to the new path — including the four self-references inside
the relocated handoff document itself (a short relocation note was added at its top; its body
otherwise unaltered) and this section's own three citations above. No `docs/P{n}_IMPLEMENTATION_PLAN.md`
or other frozen phase-execution record referenced either filename, so none needed touching. Zero PHP
file in the codebase ever referenced either document (confirmed by a fresh grep) — these are pure
documentation, never `require`d/`include`d, so this pass has **zero effect on application
behavior**, verified rather than assumed. Zero duplicate files left at either old location.
