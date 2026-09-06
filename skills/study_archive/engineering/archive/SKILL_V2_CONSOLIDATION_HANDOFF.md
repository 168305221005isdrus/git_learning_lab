# Study Archive Skill — v1→v2 Major Consolidation Handoff

> **Relocation note (2026-08-18 bounded housekeeping, not a content change)**: this document was
> moved unchanged from `docs/SKILL_V2_CONSOLIDATION_HANDOFF.md` to
> `skills/study_archive/archive/SKILL_V2_CONSOLIDATION_HANDOFF.md`, and its sibling
> `SKILL_v1_ARCHIVE.md` (referenced throughout the text below by that name) was simultaneously
> moved and renamed to `skills/study_archive/archive/SKILL_v1.md`, in the same directory as this
> file. Every mention of `SKILL_v1_ARCHIVE.md` below now resolves to that file. No other content on
> this page was altered.

**Purpose of this document**: durable handoff for a separate, later, fresh session to perform the
**Independent Skill Review** of `skills/study_archive/SKILL.md` v2. That review was explicitly out of
scope for the consolidation session that produced this document (2026-08-17) — it must be performed
by a session with no stake in the rewrite. This document is the compact evidence trail; it does not
narrate the full rewrite in prose — read `SKILL.md` v2 itself for that, and
`skills/study_archive/archive/SKILL_v1.md` for the exact prior wording to diff against.

---

## 1. What triggered this consolidation

Not a bug, not an incremental patch. Explicit Project Owner instruction to re-evaluate the Skill as an
engineering operating system using the completed P1–P5 lifecycle (Org Hierarchy → Subject/Offering
split → Curriculum → RBAC Foundation → RBAC Enforcement Cutover) as empirical evidence, with four
simultaneous goals: fold in P1–P5 lessons, improve troubleshooting intelligence, improve token/time/
prompt efficiency, and resist further append-only bloat — without weakening any proven safeguard.

## 2. Evidence base actually inspected

- `skills/study_archive/SKILL.md` v1 in full (1021 lines / 74,008 bytes) — now archived unchanged at
  `skills/study_archive/archive/SKILL_v1.md`.
- `docs/PROJECT_CONTEXT.md` in full (993 lines).
- `docs/P1_IMPLEMENTATION_PLAN.md` through `docs/P5_IMPLEMENTATION_PLAN.md` — five separate research
  passes (one per phase, run in parallel), each specifically extracting process/methodology evidence
  (not feature summaries): what prevented defects, what caught real defects and how, what was caught
  late, repeated verification patterns, redundant ceremony, token/time waste, phase-specific
  precedents, rehearsal/rollback outcomes, and scope-discipline decisions. P5's plan (495KB, 37
  sections, ~17 sessions across two authorized sub-stages) was searched by section/keyword rather than
  read linearly, given its size.
- `docs/ARCHITECTURE_SPECIFICATION.md` / `ARCHITECTURE_EXPANSION_PLAN.md` were **not** re-read in full
  for this pass — they describe target architecture (system state), not process/methodology, and
  §9/§1 of the new Skill already route "current state" questions to `PROJECT_CONTEXT.md` and the
  spec itself, not to this file. If the independent review believes process lessons are buried in
  those documents too, that's an open question (see §7 below).

## 3. A discrepancy found and disclosed, not silently resolved

Pre-v2 `SKILL.md` (§8, §17 of the archived v1) and `PROJECT_CONTEXT.md` both cite a "P2
Post-Implementation Audit" finding that the scratch database `study_archive_p2_verify` was left
behind. Reading `docs/P2_IMPLEMENTATION_PLAN.md` in full for this consolidation found: both P2 scratch
databases (`study_archive_p2_verify`, `study_archive_8b_verify`) explicitly recorded as dropped
within-session; the document contains no independent-audit section at all; its own final lines state
"No P2 Post-Implementation Audit was begun." The specific citation does not resolve to a real source.

This is disclosed in v2 `SKILL.md` §1 as a live example of the new "citation integrity" rule, not
silently corrected in `PROJECT_CONTEXT.md` (out of this session's scope — the task authorized editing
the Skill only). **The underlying rule** (§7.2's scratch-resource lifecycle tracking) is retained
regardless, because it's independently well-evidenced by P1's rehearsal (two real teardown-order
defects found), P4's audit (byte-diff vs mtime), and P5's audit (stale docblocks) — none of which
depend on the disputed P2 citation. **Open item for the independent reviewer**: confirm whether a real
P2 audit exists somewhere else (a separate document, or genuinely only in `PROJECT_CONTEXT.md`'s
summary with no underlying record), and if it truly doesn't exist, `PROJECT_CONTEXT.md`'s Phase Status
note is itself materially wrong and should be corrected in a dedicated documentation-only session —
not by this one.

## 4. New architecture (v2), 15 sections vs. v1's 22 + a 250-line revision log

`§0` Mission & Authority · `§1` Source-of-Truth Hierarchy · `§2` Risk Classification (**new**) ·
`§3` Lifecycle Router (**new** — replaces v1's single fixed 12-stage track) ·
`§4` Investigation/Troubleshooting Loop (**new**) · `§5` Core Invariants (merged from v1 §11–§14) ·
`§6` Change Execution Protocol (merged from v1 §5, §6, §15) · `§7` Verification Strategy (merged from
v1 §7, §8, §9, §16, with `§7.5` Evidence Strength & Reuse and `§7.6` Token/Context Efficiency as
explicit subsections) · `§8` Independent Review Policy (**new**, promoted from v1's explicit
non-decision not to formalize audit as a stage) · `§9` Evidence & Documentation Policy (merged from
v1 §10, §17) · `§10` Scope Discipline (from v1 §18) · `§11` STOP Conditions (from v1 §21) ·
`§12` Completion Report Standard (from v1 §22, + delta-reporting) · `§13` Environment Notes (from
v1 §19) · `§14` Version History (**replaces** v1's 250-line per-revision narrative with a compact
pointer to the archived v1 file and the phase docs, which already hold the full detail).

## 5. Retained / Generalized / Deleted / Relocated — old-vs-new safeguard coverage table

Every v1 rule is accounted for below. "Retained" = same rule, compressed wording. "Generalized" = same
protection, broader statement. "Relocated" = moved to a more correct destination per the file's own
new four-way separation (§9). Nothing is marked "Deleted" without a stated reason.

| v1 section | Content | v2 destination | Disposition |
|---|---|---|---|
| §1 Purpose, priority order | 10-item priority list | §0 | Retained |
| §2 Source-of-Truth Hierarchy | 7-level list + hard rule | §1 | Retained + citation-integrity rule added |
| §3 Verify Before Modify | read-required-docs, inspect-live-files/DB, no-DDL-during-planning, don't-trust-prior-conversation | §1, §3, §4, §7.5 | Retained, distributed to where each sub-rule is actually used |
| §4 Phase Development Lifecycle | fixed 12-stage ASCII pipeline, GO-loophole closure | §3 | **Generalized**: risk-routed table replaces one-size-fits-all track; GO-loophole language kept explicit |
| §5 Additive-First Migration Rule | additive shape, atomic-swap proof requirement | §5.3, §6 | Retained (shape in §5.3, swap-proof rule restored to §6 after an initial compression pass had dropped it) |
| §6 Migration Checkpoints | per-checkpoint checklist, seed/catalog completeness, on-failure, physical-file-ops, concurrent load, phase rollback | §6 | Retained in full |
| §7 Backup and Restore Discipline | one-backup-per-phase, verified-by-restore | §7.1 | Retained |
| §8 Scratch Rehearsal Rule | rehearsal discipline, scratch-resource lifecycle | §7.2 | Retained |
| §9 Live Re-Scan Before Migration | fresh-scan, repeat-per-checkpoint, STOP-on-unmapped | §7.3 | Retained |
| §10 Owner Decision Protocol | fact/recommendation/decision split, no-invented-data, decision structure | §9 | Retained |
| §11 Security Invariants | CSRF, server-side authz, password hashing, session hardening, upload/download, visibility, ownership, admin-protection, no-raw-exceptions, File-Ownership>Hierarchy | §5.1, §5.2 | Retained, clustered by request-handling vs. identity/access |
| §12 RBAC Rule | Permission+Scope, row-level-layer, grant-gating, no-ahead-of-schedule build | §5.2 | Retained |
| §13 Tenant Integrity Rule | exactly-one-tenant, app-layer multi-column invariant, generalization to any DB-inexpressible invariant | §5.3 | Retained |
| §14 Physical File Lifecycle | 6-step delete discipline | §5.3 | Retained |
| §15 Application Cutover Rule | schema-before-code, read-before-write, code-before-schema-rollback, UI-pattern-consistency | §5.3, §6, §0 | Retained (read-before-write ordering restored to §6 after an initial compression pass had dropped it) |
| §16 Regression Testing | full-suite gating, adversarial FK test, evidence-mechanism-vs-outcome, never-fake-a-pass | §7.4, §5.1, §7.5 | Retained, distributed |
| §17 Documentation Synchronization | execution records, schema-sync precondition, no-stale-PENDING | §9, §5.4 | Retained |
| §18 Scope Discipline | defer-unless-demonstrated-need, near-term-structural exception | §10 | Retained |
| §19 Environment Lessons | MariaDB/Windows/XAMPP specifics | §13 | Retained; one bullet ("don't hardcode counts into this file") dropped as **redundant with** §9's four-way separation rule, not lost |
| §20 Token-Efficient Working Style | efficiency bullets + hard limit | §7.6 | Retained in full (moved to its own explicit subsection after an initial pass had folded it too thinly into evidence-reuse content) |
| §21 STOP Conditions | 9 trigger conditions | §11 | Retained |
| §22 Completion Report Standard | 13-item report, mid-phase-interruption handling | §12 | Retained + delta-reporting variant added |
| Revision Notes (~250 lines) | per-phase incident narrative | §14 | **Relocated**, not deleted — full text survives unchanged in `skills/study_archive/archive/SKILL_v1.md`; the underlying incidents are independently recorded in each phase's own plan document's audit section |

**Self-check performed during this session**: after the first full draft, a line-by-line re-read
against v1 found three real content gaps that a pure "compress and reorganize" pass had silently
dropped (the no-DDL-during-planning explicit statement + GO-loophole closure, the atomic-swap
written-proof requirement, the read-before-write cutover ordering) and one that had been weakened
(the Token-Efficiency hard limit, folded too thinly into a different section). All four were restored
via targeted edits before this handoff was written — see `SKILL.md` §3, §6, §7.6. This is disclosed so
the independent reviewer knows to check specifically whether any *other* gap of the same kind survived
undetected — a compression pass is exactly the failure mode most likely to silently drop a safeguard,
and one self-check pass finding four instances of it is evidence there could be a fifth.

## 6. New troubleshooting intelligence (§4)

Eleven heuristics, each tied to a specific incident rather than invented generically: check-mechanism-
not-trigger (P3's PDOException recurrence), write-order-not-table-overlap dependency analysis (P1's
Track A/B), first-genuine-usage-is-different-evidence (P5's scope-selector UI gap), sweep-prose-
separately-from-behavior (P5's stale docblocks surviving five sessions), plus six shorter ones
(disagreement-triggers-investigation, unreproducible-isn't-no-bug, falsify-fastest, hidden-callers,
live-drift-before-blaming-rehearsal, stop-don't-improvise-on-step-failure, write-hypotheses-down-near-
context-limits, previous-conclusions-may-be-wrong). v1 had no equivalent section — troubleshooting
guidance previously existed only implicitly, scattered across specific rules.

## 7. Risk-adaptive lifecycle routing (§2, §3)

Four risk tiers (LOW/MEDIUM/HIGH/CRITICAL) with concrete triggers, and a ten-row router table mapping
work class → minimum lifecycle → GO requirement → audit requirement. v1's Revision Notes explicitly
recorded a *rejection* of formalizing independent audit as a routed stage ("not every phase must
schedule one"). This consolidation reverses that specific prior decision: the evidence across P2's
Checkpoint 9 (missing Delete-Offering handler), P3's audit (PDOException leak), and P5's audit (stale
docblocks) shows independent review is where the two live-defect-class findings and one significant
gap in this project's whole history were actually caught — strong enough to make it **required**,
not optional, for HIGH/CRITICAL risk work, while staying optional for LOW-risk work so a comment fix
doesn't pay for a schema-migration's ceremony. **This is a genuine policy reversal from v1 and the
single highest-leverage item for the independent reviewer to scrutinize** — confirm the evidence
cited actually supports "required," not just "valuable."

## 8. Efficiency estimate (qualitative, not fabricated precision)

Representative examples from the evidence:
- **P1-shaped task** (a schema migration with no prior lessons to draw on): v1 and v2 route it
  identically — HIGH risk, full lifecycle, independent audit. No expected change in stage count;
  v2's Change Execution Protocol checklist (§6) is the same content, just without the ~4x repeated
  self-justifying narrative P1's own plan carried for the same points (e.g. "register.php unchanged"
  restated three times) — that repetition was a documentation habit, not a Skill requirement, so v2
  can't force it away by itself, but §7.6's explicit "cite, don't re-narrate" rule gives a future
  session a named reason to stop doing it.
- **P2-shaped task** (a phase with a self-acknowledged "extra precaution" second scratch DB, and
  verbatim-repeated baseline facts across sections): v2's §7.5 evidence-reuse rule and §7.6's
  citation rule directly target this waste class. Expected effect: same verification depth, fewer
  tokens spent re-narrating facts already established this session.
- **P5-shaped task** (two-stage GO, ~17 sessions, near-identical boilerplate every session): the
  single richest waste source found. v2's §12 delta-reporting ("unchanged since §N") and §3's
  explicit two-stage-GO *decision rule* (so a future high-risk cutover doesn't have to rediscover
  from scratch that this pattern is legitimate and when to use it) both target this directly. This is
  the clearest case where v2 should reduce token/prompt cost for equivalent-or-better confidence —
  but it's a qualitative expectation, not a measured one; no P6-shaped phase has run under v2 yet.
- **Bounded housekeeping** (P3's PDOException fix, P5 §37): v1 already supported this pattern
  implicitly; v2 makes it an explicit, named lifecycle-router row (§3) with its own row in the
  Independent Review Policy (§8) — expected effect is mainly clarity/confidence for whoever runs the
  next one, not a token saving, since the pattern was already lightweight.

No phase has yet been run under v2 — all of the above is a structural prediction from the evidence,
not a measured result. The independent reviewer and/or the next real phase (P6) are what will confirm
or falsify it.

## 9. Remaining uncertainties (for the independent reviewer to weigh in on)

1. **§7 above** — the audit-required policy reversal is the largest substantive change; verify the
   evidence supports "required" for HIGH/CRITICAL, not just "recommended."
2. **§3 above** — confirm no other gap-class content loss survived past this session's one self-check
   pass (four were found and fixed; a second independent pass may find more).
3. **§3 above (P2 discrepancy)** — determine whether a real P2 audit record exists anywhere, and if
   not, flag `PROJECT_CONTEXT.md`'s Phase Status note for correction in its own dedicated session.
4. Whether `ARCHITECTURE_SPECIFICATION.md`/`ARCHITECTURE_EXPANSION_PLAN.md` contain process lessons
   this consolidation didn't look for (they weren't in the task's required-evidence list, and are
   target-state documents by design, but worth a deliberate check rather than an assumption).
5. Whether the two-stage-GO pattern (§3) is stated generally enough to apply to a **non**-RBAC
   HIGH-risk cutover (e.g. a future storage-backend migration), or whether it's still implicitly
   RBAC-shaped despite the generalized wording — test it against a hypothetical non-security HIGH-risk
   scenario.
6. Whether the risk-tier criteria (§2) can be gamed by under-describing a task, and if so, whether the
   escalation triggers (touches Core Invariant surface, prior-audit-found-a-defect, ambiguous scope)
   are sufficient guardrails against that.

## 10. Exact scope for the Independent Skill Review

Per the consolidation task's own requirement, the review must be a **separate session** and should
specifically challenge:
- whether any safeguard was accidentally compressed away beyond the four already found and fixed here;
- whether the new risk/lifecycle abstractions (§2, §3) introduce classification ambiguity a bad-faith
  or merely rushed task description could exploit to under-scope HIGH-risk work as MEDIUM;
- whether §4's troubleshooting guidance is actually actionable, not just descriptive;
- whether the rule mergers (§5, §6, §7, §9) changed any rule's semantics, not just its wording — diff
  against `skills/study_archive/archive/SKILL_v1.md` line by line for the security-invariant sections (§5.1–§5.4)
  specifically, since those carry the highest cost if something was lost silently;
- whether Project Owner authority (§0, §3's GO requirements, §9's Owner Decision Protocol) is fully
  intact;
- whether the audit-required policy reversal (§8, and item 1 above) is correctly scoped;
- whether this file still works for P6 (Multi-University, not started) and unknown future phases,
  rather than being overfit to P1–P5's specific shape;
- whether v2 itself, despite the consolidation goal, has already reintroduced bloat anywhere (check
  §5–§7 in particular, the largest sections).

**Not yet done, and explicitly out of scope for this consolidation session**: the Independent Skill
Review itself, any P6 work, any correction to `PROJECT_CONTEXT.md`'s disputed P2 audit citation, and
any change to application code, live DB, or schema. None of those were touched.
