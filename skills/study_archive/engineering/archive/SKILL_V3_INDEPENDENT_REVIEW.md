# Skill V3 Independent Review

**Status of this document**: durable independent-review artifact. This session had no stake in the
Stage 3 rewrite's outcome; its explicit mandate was to try to disprove the v3 draft's correctness, not
confirm it. Verdict recorded at the end.

---

## 0. Independence Note — How the v2 Baseline Was Located

The task instructions required using "the preserved pre-rewrite v2 Skill copy," locating it safely if
its path wasn't obvious, and explicitly forbade reconstructing v2 from memory. No such copy exists
inside the project tree — unlike the v1→v2 transition, which archived the prior version verbatim as
`skills/study_archive/archive/SKILL_v1.md` before overwriting, Stage 3 overwrote
`skills/study_archive/SKILL.md` in place with no in-repo v2 archive.

A candidate was located outside the project tree: `C:\xampp\htdocs\nb\study_archive11\skills\study_archive\SKILL.md`
— a user-maintained numbered snapshot directory (`nb/study_archive1`…`study_archive12`), unrelated to
the project's own archive mechanism. This copy is 739 lines, headed "Study Archive Development Skill
v2," timestamped 2026-08-18 15:15 — one day before this rewrite and consistent with the memory record
that v2 remained textually unchanged from consolidation through the completion of Stage 1/Stage 2
(design status memory: "`skills/study_archive/SKILL.md` (v2) is UNCHANGED," timestamped
2026-08-19T09:44). It was read-only inspected, never modified. This is treated as the authoritative v2
baseline for this review — it is real primary evidence, not memory-reconstructed text, satisfying the
independence rule, and its content was independently cross-checked against the Stage 1 analysis's and
Stage 2 design's own descriptions of "v2, 739 lines" (matching exactly).

**This gap is itself recorded as Finding 1 below** (Category B): the absence of an in-repo v2 archive
means a future independent review could not have performed this verification if the external backup
directory did not happen to exist or had been rotated away. This did not block this review (real
primary evidence was found and used), but it is a durability gap Stage 3 should have closed the same
way the v1→v2 transition did.

---

## 1. Sources Inspected (full, in this session)

1. `skills/study_archive/SKILL.md` — v3 draft, 883 lines (numbered), read in full.
2. `C:\xampp\htdocs\nb\study_archive11\skills\study_archive\SKILL.md` — v2 baseline, 739 lines, read in
   full (located per §0 above).
3. `skills/study_archive/archive/SKILL_V3_DESIGN.md` — Stage 2 design specification, 849 lines, read in
   full.
4. `skills/study_archive/archive/SKILL_V3_POST_P7_ANALYSIS.md` — Stage 1 empirical analysis, 764 lines,
   read in full.
5. `skills/study_archive/archive/SKILL_V2_CONSOLIDATION_HANDOFF.md` — v1→v2 handoff, 217 lines, read in
   full.
6. `C:\Users\Thanaphon Yinde\.claude\projects\...\memory\project_skill_v3_design_status.md` — targeted
   read, to locate the v2 baseline and confirm the "v2 unchanged through design phase" claim.

Not opened (no load-bearing claim in this review turned out to depend on them, per the task's own
targeted-retrieval instruction): `docs/P6_IMPLEMENTATION_PLAN.md`, `docs/P7_IMPLEMENTATION_PLAN.md`,
`docs/PROJECT_CONTEXT.md`, `docs/benchmarks/SKILL_EFFICIENCY_BENCHMARK.md` — Stage 1's own citation
chain (verified present and specific throughout Stage 1's text) was sufficient to check every v3 claim
that traces to P6/P7 incidents, since this review's job is to verify v3 against v2/Design/Stage-1, not
to re-litigate Stage 1's own primary-source forensics.

A raw `diff -u` between the v2 baseline and the v3 draft was also generated and read in full (617
lines) as a mechanical cross-check against the manual line-by-line read, to catch any wording change a
manual pass might skim past.

---

## 2. V2 → V3 Diff Result

The mechanical diff confirms the manual read: every hunk is either a pure **addition** (new
subsections/rows/bullets) or a **local rewording** of an existing sentence for portability
(principle-first, "concrete instance in this project: …" tagging) or precision. No hunk deletes a
normative rule without an equivalent or strengthened replacement appearing nearby. Classification of
every touched v2 passage:

| v2 passage | v3 disposition | Classification |
|---|---|---|
| Title/preamble, v2 note | Replaced with v3 note + portability paragraph | INTENTIONALLY REORGANIZED |
| §2 opening paragraph | +1 clarifying sentence (mechanism-not-wording classification) | INTENTIONALLY STRENGTHENED (CH-10) |
| §3 work-class table | +2 rows (Destructive Retirement, Scoped Plan Amendment) + 2 explanatory paragraphs | INTENTIONALLY STRENGTHENED (CH-01, CH-02) |
| §4 heuristic list | +1 heuristic (Shape 1/Shape 2), inserted after the mechanism-vs-trigger heuristic it refines | INTENTIONALLY STRENGTHENED (CH-03); original heuristic text PRESERVED VERBATIM |
| §5.1 CSRF bullet | Split into two sentences, same content | PRESERVED SEMANTICALLY |
| §5.1 write-error bullet | "see §4's first heuristic" → "§4's mechanism-vs-trigger heuristic" | PRESERVED SEMANTICALLY (clearer reference, not a rule change) |
| §5.1 visibility-filter bullet | "the existing shared…function" → "a single shared…function" | PRESERVED SEMANTICALLY / clarified (singularity emphasized, not weakened) |
| §5.2 Permission+Scope bullet | "higher rank"/"scoped-role model" → "capability"/"scoped-authorization model", concrete instance tagged | PRESERVED SEMANTICALLY, PORTABLE REWORDING (CH-12) |
| §5.2 row-level-invariant/File-Ownership bullet | "RBAC/scope model" → "primary authorization model"; File Ownership pulled into a tagged concrete-instance clause | PRESERVED SEMANTICALLY, PORTABLE REWORDING (CH-12) |
| §5.2 peer-protection bullet | "admin-tier" → "privileged" | PRESERVED SEMANTICALLY (same coverage in this project) |
| §5.2 scope-discipline bullet | "RBAC/scope phase" → "authorization-model phase" + concrete-instance tag | PRESERVED SEMANTICALLY, PORTABLE REWORDING (CH-12) |
| §5.3 tenant-binding bullet | "tenant/scope-bound"/"tenant/scope" → "ownership-partition-bound"/"partition"; MariaDB 10.4 detail moved to a §13 cross-reference | PRESERVED SEMANTICALLY, PORTABLE REWORDING (CH-12); detail relocated, not lost — confirmed present in v3 §13 |
| §5.3 additive-first migration bullet | +cross-reference to §6 Retirement Closure | INTENTIONALLY STRENGTHENED (cross-ref only, no content removed) |
| §6 per-checkpoint bullet list | +1 bullet (Phase Contract field requirement) | INTENTIONALLY ADDED (CH-08 cross-ref) |
| §6, end | +full "Retirement Closure" subsection (~55 lines) | NEW CONCEPT, per design (CH-02/CH-04) |
| §7.3 Live Re-Scan | +2 sentences generalizing to every HIGH+ step and cross-referencing §6 | INTENTIONALLY STRENGTHENED; original STOP-on-unmapped sentence PRESERVED VERBATIM |
| §7.5 Evidence Strength & Reuse | +1 bullet (evidence-claim precision template + ban list) | NEW CONCEPT, per design (CH-05); all four pre-existing §7.5 bullets PRESERVED VERBATIM |
| §7.6 Token/Context Efficiency | +1 bullet (durable-handoff pattern) | INTENTIONALLY ADDED (CH-06) |
| §7's hard-limit paragraph | +cross-reference to §6 Retirement Closure specialization | INTENTIONALLY STRENGTHENED; original hard-limit list PRESERVED VERBATIM |
| §8 opening paragraph | +2 sentences (reuse-boundary clarification, "may cite… must not reuse…" pairing) | INTENTIONALLY STRENGTHENED (CH-07/§9.3) |
| §8 bullet list | +6-item required HIGH/CRITICAL audit scope list | NEW NORMATIVE CONTENT, per design (CH-07); the 3 pre-existing Required/Recommended/Optional bullets PRESERVED VERBATIM |
| §8 self-exclusion bullet | "Skill-consolidation" → "Skill-consolidation, Skill-rewrite, or self-modifying-methodology" | INTENTIONALLY STRENGTHENED (closes a wording gap for this exact rewrite) |
| §9 Owner Decision Protocol | +2 sentences (unstated functional promise rule, Finding O cite) | INTENTIONALLY ADDED (CH-09); rest of paragraph PRESERVED VERBATIM |
| §9, end | +full "Phase Contract" subsection (~30 lines) | NEW CONCEPT, per design (CH-08) |
| §11, end | +1 cross-reference sentence to Scoped Plan Amendment | INTENTIONALLY ADDED (CH-13); STOP trigger list and "wait, don't workaround" language PRESERVED VERBATIM |
| §12, mid-list | +1 cross-reference sentence for Phase Contract fields | INTENTIONALLY ADDED (design's IA table row 12) |
| §14 Version History | v1/v2/Independent-Review/Owner-Decision/Housekeeping entries (~96 lines) compressed to v1+v2 entries (~35 lines) + new v3 entry (~22 lines) | INTENTIONALLY REORGANIZED (CH-11) — verified below (§5) that no load-bearing fact was lost, only narrative repetition |

No passage was found that deletes a v2 safeguard without a same-or-stronger replacement. No hunk
matches the ADVERSARIAL-flagged pattern (a v2 MUST/NEVER/ONLY/REQUIRED/EVERY sentence quietly dropped
or softened) anywhere in the diff.

---

## 3. Safeguard Preservation Matrix — Independent Re-Verification

Re-verified against the actual v3 text (not the Design document's own claim), all 19 items from the
task's checklist plus the Design's own §15 matrix:

| # | Safeguard | v3 verified state |
|---|---|---|
| 1 | Independent Audit required for HIGH/CRITICAL | PRESERVED VERBATIM ("**Required** before any HIGH or CRITICAL risk-tier phase (§2) is marked complete.") |
| 2 | Session distinctness for Independent Review/Audit | PRESERVED, STRENGTHENED — new text states both "may cite a fact an *earlier, different* independent session already established" AND "must not reuse the implementer's own evidence for any load-bearing claim… both halves of this apply together, not one without the other" in the same passage, exactly as the Design's matrix required |
| 3 | Fresh Live Re-Scan immediately before execution, mandatory | PRESERVED, generalized explicitly to "every HIGH+ step, not only retirement steps" |
| 4 | Criterion-driven stability gate distinct from synthetic rehearsal | PRESERVED VERBATIM — the two-stage-GO paragraph in §3 is untouched by the diff |
| 5 | Backup verification mandatory | PRESERVED VERBATIM — §7.1 untouched by the diff |
| 6 | Rollback rehearsal mandatory | PRESERVED VERBATIM — §7.2 untouched by the diff |
| 7 | Full-tree diff is the stronger evidence for footprint claims | PRESERVED VERBATIM — the "stronger evidence beats habitual evidence" §7.5 bullet is untouched |
| 8 | STOP-before-improvising intact | PRESERVED VERBATIM — §11's trigger list and "don't workaround" language untouched; now cross-referenced (not softened) by CH-13 |
| 9 | Owner GO narrow and explicit | PRESERVED VERBATIM — the GO-loophole-closing paragraph in §3 untouched |
| 10 | STOP after GO does not silently preserve authorization | PRESERVED, STRENGTHENED — new Scoped Plan Amendment row states explicitly "the prior GO is spent by the STOP and does not carry over" |
| 11 | Citation integrity intact | PRESERVED VERBATIM — §1's citation-integrity paragraph and its P2-audit worked example are untouched by the diff |
| 12 | No silent remediation of security/behavioral findings | PRESERVED VERBATIM — the relevant §8 bullet is untouched |
| 13 | Scratch-resource lifecycle tracking intact | PRESERVED VERBATIM — §7.2's tracked-lifecycle paragraph is untouched |
| 14 | No-DDL/DML-during-planning discipline intact | PRESERVED VERBATIM — the §3 paragraph is untouched by the diff |
| 15 | Read-before-write cutover ordering intact | PRESERVED VERBATIM — the §6 "Cutover ordering" paragraph is untouched |
| 16 | Atomic/constraint-swap written-proof discipline intact | PRESERVED VERBATIM — the §6 "Constraint swaps" paragraph is untouched |
| 17 | Visibility-filter-via-shared-function rule intact | PRESERVED, minor clarifying reword ("a single shared…function") — same enforceable meaning |
| 18 | Row-level invariant > authorization hierarchy semantics intact | PRESERVED SEMANTICALLY, generalized wording, File Ownership named as the concrete instance exactly as before |
| 19 | Emergency Rollback restoration-only, not forward-fix authorization | PRESERVED VERBATIM — the entire Emergency Rollback exception paragraph block (§3) is untouched by the diff |

No row shows weakening, ambiguity, or relocation-with-effect-change. All 19 PASS.

---

## 4. CH-01 → CH-13 Design-Fidelity Matrix

| Change ID | Verdict | Basis |
|---|---|---|
| CH-01 (Scoped Plan Amendment row) | **PASS** | Row present immediately after Emergency/high-confidence rollback row as instructed; states "requires a fresh, separate Owner GO naming the amended scope" verbatim; §11 cross-references it (CH-13); no existing row altered |
| CH-02 (Destructive Retirement row) | **PASS** | Row present with trigger condition explicitly naming "multi-checkpoint compatibility arc," not "any schema DDL," matching the acceptance criterion precisely |
| CH-03 (mechanism-scoped discovery heuristic) | **PASS** | Both shapes named with their own incident citations (Finding L / Findings M-N-P + auth.php); original "check the general mechanism" heuristic text unaltered, only extended |
| CH-04 (Retirement Closure gate mechanics) | **PASS** | Full 10-item mechanism checklist present, matching design §4.3 table exactly; explicit statement that "compatibility-only" alone never closes the obligation; explicit ownership rule (Phase Contract field) stated |
| CH-05 (evidence-claim precision template) | **PASS** | WHAT/HOW/WHAT-was-proven template present; ban list present (byte-identical / zero dependency / proves comprehensive X); explicit statement that the underlying check itself isn't being second-guessed, only its description |
| CH-06 (durable-handoff pattern) | **PASS** | One sentence added to §7.6 as instructed; §7.5's fresh-evidence-at-session-boundary rule not weakened or contradicted |
| CH-07 (Independent Audit required scope) | **PASS** | All six items from Design §9.2 present verbatim in substance; session-distinctness requirement preserved and strengthened, not weakened |
| CH-08 (Phase Contract minimal fields) | **PASS** | Exactly 4 fields (Produces/Consumes/Obligations opened-closed/Invariants touched), matching §6.1's table; explicit "not a new document" statement present |
| CH-09 (unstated functional promise clarification) | **PASS** | Sentence present; Finding O cited as a parenthetical provenance note, not inline in the normative sentence — matches the portability instruction |
| CH-10 (risk-classification gaming-resistance clarification) | **PASS** | Sentence present in §2's opening paragraph; explicitly framed as closing "a plausible wording gap, not a demonstrated one," matching the "defer, not resolved" framing requirement |
| CH-11 (bound Version History growth) | **PASS** | See §5 below for the detailed independent check — every fact cited elsewhere in the file remains independently statable outside the history entry |
| CH-12 (§5 portability restructuring) | **PASS** | Principle-first/instance-tagged wording applied consistently across §5.1–§5.4; every remaining Study-Archive-specific noun sits inside an explicitly tagged "concrete instance in this project" clause; §13 left untouched as instructed |
| CH-13 (STOP cross-reference to Amendment route) | **PASS** | Cross-reference sentence added to §11's closing paragraph; existing STOP triggers and "wait, don't workaround" language unaltered |

**13 of 13 PASS. Zero PARTIAL, zero FAIL.**

---

## 5. CH-11 / §14 Compression — Detailed Check

Every fact from v2's original ~96-line §14 that a live v3 rule's own justification depends on was
traced independently:

- **Visibility-filter safeguard restoration** (v1's "single most-repeated bug class") — the *rule
  itself* is fully restated in v3 §5.1 independent of the history entry; the compressed v3 §14 v2-entry
  still names it explicitly ("the §5.1 rule against hand-rolled visibility `WHERE` clauses… restored and
  stated in full in §5.1 above").
- **Emergency Rollback narrowing** — the *ratified rule itself* is fully restated in v3 §3, unchanged
  from v2; the compressed history entry still names the Owner-ratification event and points to §3.
- **P2-audit false-citation finding** — the *citation-integrity worked example* is fully restated in v3
  §1, unchanged from v2; the compressed history entry still names the correction and points to §1.
- Detail dropped from inline text (the exact five `PROJECT_CONTEXT.md` locations corrected, the
  Artifact-housekeeping pass's specific old/new file paths, the byte-identical relocation-verification
  narrative) is **not** cited by any live v3 rule's own justification — it is pure provenance narrative,
  and it survives unchanged and in full in `SKILL_V2_CONSOLIDATION_HANDOFF.md` (untouched by this
  rewrite) and in `docs/PROJECT_CONTEXT.md` itself (not part of this review's scope, not touched).

No live rule's justification depends on a sentence that was deleted rather than pointed-to. **CH-11
acceptance criterion satisfied.**

---

## 6. Mechanism-Scoped Discovery Review

The proportional rule (Design §3.1) is implemented faithfully: v3 §4's new heuristic distinguishes
Shape 1 (within-file sibling, closed at Regression for HIGH/CRITICAL implementation) from Shape 2
(whole-codebase, closed at Independent Audit for HIGH/CRITICAL) exactly as designed, and v3 §8's audit
scope item 2 makes the whole-codebase mechanism sweep mandatory, not discretionary, for HIGH/CRITICAL
audits. Nothing in v3's text imposes this scope on LOW/MEDIUM work — the escalation triggers remain
identical to v2's pre-existing §2 triggers (Core Invariant surface, unreconfirmed prior defect,
ambiguous scope). Tested against P6 Finding L (Shape 1: a within-file sibling handler) — v3's
implementation-stage sibling sweep (new §6 bullet) plus the mandatory audit-stage mechanism sweep (§8)
both target it. Tested against Findings M/N/P (Shape 2: untouched files) — v3's mandatory
whole-codebase Independent Audit sweep (§8 item 2) targets it directly. Both shapes remain distinct in
the text, as the task specifically warned they must not be collapsed into one generic rule — confirmed
they are not.

---

## 7. Retirement Closure Review

Verified against all 8 checkpoints in the task:
1. Applies to the compatibility-arc case — trigger text explicitly requires "an intervening
   multi-checkpoint compatibility arc," matching CH-02's acceptance criterion.
2. Does not weaken ordinary HIGH-risk Live Re-Scan — explicitly framed as "a specialized, mandatory
   instance of §7.3's existing Live Re-Scan — not a new, independent verification mechanism"; §7.3's own
   general text is generalized, not narrowed, alongside it.
3. Does not imply short retirements need no rigorous verification — the "why scoped this narrowly"
   paragraph explicitly states a short, single-sub-phase retirement "uses the ordinary Schema migration
   row and §7.3's general Live Re-Scan, unchanged" — still mandatory, just without the extra checklist.
4. The 10-item mechanism checklist faithfully covers the Design's own §4.3 table — verified item-by-item
   match (Readers explicit/wildcard, Writers, Authorization/display/filter, Runtime call chains,
   Schema-object dependencies, Compatibility-only dependencies, Documentation assumptions,
   Rollback/restore readiness, Environment health — all 10 present).
5. "Compatibility-only cannot silently mean safe forever" — explicitly stated: a reference recorded as
   compatibility-only "with no named closing checkpoint is treated as an **open Retirement Closure
   obligation, full stop**."
6. The closing checkpoint owns discharge — explicitly stated in the "Ownership" paragraph, tied to the
   Phase Contract's "Obligations opened / closed" field, matching CH-04's acceptance criterion.
7. Phase Contract integration is coherent — the Retirement Closure "Ownership" paragraph and the Phase
   Contract's own "Obligations opened / closed" row cross-reference each other correctly (§6 ↔ §9).
8. PoNR/backup/rollback/environment checks remain correctly ordered — the sweep is explicitly scoped
   "run fresh, immediately pre-Point-of-No-Return," consistent with §6's existing PoNR analysis
   requirement and §7.1/§7.2's unchanged backup/rehearsal discipline.

**Would this text have caught the P7 `auth.php` SELECT-role blocker before DROP?** Yes — the "Readers
(explicit column lists)" row requires "Every `SELECT`/query naming the artifact confirmed either removed
or provably safe post-retirement," which directly covers `auth.php`'s `SELECT … role …` statement,
combined with the "Runtime call chains" row explicitly warning that "a widely-called helper function can
turn a one-line syntactic dependency into an application-wide blast radius" — a direct textual
description of `require_login()`'s actual reach. **PASS.**

---

## 8. Scoped Plan Amendment Review

Route matches: STOP → bounded diagnosis (in the plan document) → amendment → fresh
rehearsal/verification → fresh explicit Owner GO (naming the amended scope) → retry. The row states this
explicitly and states the prior GO does not carry over. It is scoped to "post-GO STOP on HIGH/CRITICAL
work" only — the accompanying paragraph explicitly states ordinary §4 troubleshooting suffices when the
issue is fixable within the current checkpoint's already-authorized scope, so ordinary troubleshooting is
not escalated unnecessarily. The route does not grant forward-fix authority under rollback
authorization — it is a wholly separate table row from Emergency Rollback, and nothing in either row's
text cross-contaminates the other's authorization scope. Tested against the actual P7b-6 STOP/Amendment
sequence (diagnose → rehearse fresh → regression-gate → apply → fresh separate audit for HIGH/security
findings → fresh GO) — the named route reproduces this exact shape. **PASS.**

---

## 9. Phase Contract Review

Exactly four fields (Produces / Consumes / Obligations opened-closed / Invariants touched) — no more, no
fewer. Embedded in §9 as an addition to the existing per-checkpoint template referenced from §6, not a
new standalone document — the text explicitly states "not a new document type, preserving the four-way
separation" and "never a standalone ledger, registry, or graph document." Does not duplicate
`PROJECT_CONTEXT.md` — the text explicitly states `PROJECT_CONTEXT.md`'s role is unchanged and it is "not
restructured." Compatibility obligations name a closing checkpoint via the Retirement Closure
cross-reference in the Obligations field's own description. A later checkpoint's Consumes field is
required to name "the specific earlier checkpoint and field it relies on." **Would this have given the
`auth.php` obligation an explicit home before P7b-6?** Yes — the design's own worked example is directly
reproduced in the field's description text ("this is the direct mechanism that turns a cross-phase
obligation from something tracked only in prose… into an explicit field on the one checkpoint that needs
to answer it"). **PASS.**

---

## 10. Evidence-Claim Precision Review

WHAT/HOW/WHAT-was-proven template present in full, plus the explicit ban list ("byte-identical," "zero
dependency," "proves comprehensive X") with the precise condition each word requires to be used
honestly. No formal L1/L2/L3-style taxonomy was introduced — matching the Design's explicit rejection of
that heavier alternative. The text explicitly states "the underlying check itself is not what this
discipline second-guesses — it's the word chosen to describe the result," preserving the boundary the
Design specified. **PASS.**

---

## 11. Independent Audit Scope Review

All six required items present (declared-footprint verification; mechanism-scoped sibling-surface
discovery; negative-space search; adversarial testing; claim-strength verification; cross-phase
assumption verification when Retirement Closure applies), matching Design §9.2 one-for-one. This
strengthens the audit's required scope without loosening session-distinctness (§8's opening paragraph
was strengthened, not softened, per §3 above) or the required/recommended/optional tiering (all three
tiers preserved verbatim). **PASS.**

---

## 12. Portability / Generalization Review

Every materially generalized v2 rule in §5 keeps its general engineering principle as strong as the
original (verified sentence-by-sentence in §2 above) while the Study-Archive-specific invariant remains
explicitly tagged and fully enforceable: RBAC Permission+Scope (§5.2), File Ownership > hierarchy
(§5.2), peer/higher-rank protection (§5.2, wording generalized from "admin-tier" to "privileged" with
identical practical coverage in this project), last-active-holder protection (§5.2, already general,
untouched), tenant/scope binding (§5.3, MariaDB-specific detail relocated to §13, not dropped),
visibility filtering (§5.1, clarified not weakened). A future project without RBAC/multi-tenancy could
apply the portable rules without knowing any Study Archive internal noun — every normative sentence in
§5 reads correctly with the tagged instance mentally removed. No generalization was found to be
"prettier but less enforceable." **PASS.**

---

## 13. Rejected/Deferred Concept Intrusion Check

Searched the full v3 text for: Evidence Ledger, standalone Compatibility/Retirement Ledger, full
dependency graph, invariant ownership registry, a fifth risk tier, universal whole-codebase scanning for
all work, mandatory two-stage GO for all HIGH work, a formal L1/L2/L3 evidence taxonomy, UX/UI
methodology, any unauthorized CH-14-style concept. None found as live governing text — the only mentions
of ledger/graph/registry concepts are inside the §14 Version History's own summary of what was
*considered and rejected*, which is historical narrative, not adoption. Risk tiers remain exactly four
(§2 enumeration untouched by the diff). Two-stage GO remains scoped to RBAC-adjacent fallback removal
only (the paragraph is untouched by the diff). **PASS.**

---

## 14. Version History Compression Review

Covered in full in §5 above. **PASS.**

---

## 15. Internal Reference / Contradiction Check

Every new §-cross-reference introduced by this rewrite was traced to a real target section: §6
(Retirement Closure, referenced from §3, §5.3, §7.3, §7.5's ban list, §9); §9 (Phase Contract,
referenced from §6, §12); §4 (Shape-1/Shape-2 heuristic, referenced from §8); §8 (audit scope,
referenced from §3's Destructive Retirement row, §11). All resolve correctly. No new requirement
contradicts an existing one. Retirement Closure composes correctly with ordinary Live Re-Scan (explicit
"specialized instance of" framing, not a parallel/competing mechanism). Scoped Amendment and Emergency
Rollback remain on separate table rows with non-overlapping authorization language — no cross-bleed of
"restoration only" into Amendment's fresh-GO requirement or vice versa. Phase Contract and Completion
Report do not create contradictory documentation rules — Completion Report's new cross-reference (§12)
explicitly says to *cite* the Phase Contract fields, not duplicate them. Evidence reuse (§7.5's "cite a
fact already verified fresh this same phase") and session-boundary fresh verification do not conflict —
the same paragraph draws the line explicitly ("never applies *across* a session boundary for anything
load-bearing"), unchanged by this rewrite. **PASS.**

---

## 16. Size / Context-Efficiency Review

Independently confirmed: v3 is 882 lines by `wc -l` (883 by 1-indexed line numbering with a final
unterminated line), against v2's 739 — a +19.5% increase, exceeding the design's own 800–870 soft
ceiling by roughly 12–13 lines (~1.4% over the ceiling itself). Per the task's instruction, this alone
does not fail the review. Assessment:

- The added content maps one-to-one to the 13 approved Change IDs, each independently evidence-backed
  (Stage 1's incident citations, verified in §4 of this document) — none of the growth is unattributed.
- §14 itself was substantially compressed in the same rewrite (v2's ~96-line history section shrinks to
  roughly 49 lines in v3, even while adding an entirely new v3 entry) — CH-11's compression target was
  met, offsetting some of the new normative growth exactly as the design intended.
- No duplicated narrative was found on inspection; the overage is concentrated in the two genuinely new
  subsections (Retirement Closure, Phase Contract), both table-driven and already at the design's own
  described minimum size.
- Further compression below 870 lines would risk trimming one of the newly-added, evidence-backed
  mechanisms below its own acceptance-criteria completeness (e.g. shortening the 10-item Retirement
  Closure checklist) — not advisable.

**Classification: PASS WITH NON-BLOCKING SIZE NOTE.** The overage is small, fully evidence-backed, and
not a symptom of unmanaged bloat — §14's own successful compression is direct evidence the file is not
merely regrowing without bound.

---

## 17. Adversarial Regression Cases

| Case | Scenario | Verdict | Reasoning |
|---|---|---|---|
| A | P6 Finding L (within-file sibling gap) | **PASS** | CH-03's implementer-level within-file sweep (§4/§6) and CH-07's mandatory mechanism-scoped Independent Audit (§8) both target this |
| B | P6 Findings M/N/P (untouched-file siblings) | **PASS** | CH-07's mandatory whole-codebase mechanism/negative-space audit items directly target this; MEDIUM-tier work touching §5 still escalates via the unchanged §2 trigger |
| C | P7 `auth.php` blocker | **PASS** | See §7 above — Retirement Closure's Readers/Runtime-call-chain rows plus Phase Contract's ownership field target it independently; defense in depth |
| D | P7b-6 STOP + Scoped Amendment | **PASS** | See §8 above — CH-01 formalizes the exact mechanics already used successfully, unaltered |
| E | v1→v2 safeguard-loss recurrence, applied to v3's own rewrite | **PASS** | This review's own full line-by-line diff (§2–§3 above) found zero silently-dropped safeguards — the mandatory two-pass discipline (Design §18) was actually exercised, by this session, and found nothing |
| F | Ordinary LOW-risk CSS/text task | **PASS** | Retirement Closure/mechanism-scoped sweep/Phase Contract all remain scoped to HIGH/CRITICAL or destructive retirement; the Documentation-only-change row is untouched by the diff |
| G | Ordinary MEDIUM feature | **PASS** | The Ordinary-feature row is untouched by the diff; no new HIGH ceremony reaches it |
| H | Future project without RBAC/multi-tenancy | **PASS** | CH-12 was verified actually executed faithfully across §5.1–§5.4 (§12 above), not merely designed — every normative sentence in §5 is readable without a Study-Archive noun |
| I | Study Archive itself | **PASS** | Every concrete instance (RBAC Permission+Scope, File Ownership, tenant/scope binding, MariaDB 10.4 CHECK limitation, visibility filter) remains explicitly named and fully enforceable |

No case FAILed. No case is merely PASS-contingent in the final artifact — the two cases the Design itself
flagged as contingent (E: contingent on Stage 3 actually performing the second pass; G/H: contingent on
Stage 3's execution fidelity to CH-12) are now resolved to unconditional PASS, because this review *is*
that second pass and *did* verify that execution fidelity directly against the text, not merely against
Stage 3's own claim.

---

## 18. Findings

### Finding 1 — No in-repo v2 baseline preserved before rewrite (Category B)

**Summary**: Stage 3 overwrote `skills/study_archive/SKILL.md` in place without first archiving the v2
text into `skills/study_archive/archive/`, unlike the v1→v2 transition (which archived v1 verbatim as
`SKILL_v1.md` before the consolidation overwrote it). This review was only able to proceed because an
unrelated, user-maintained external backup directory (`nb/study_archive11`) happened to contain a
pre-rewrite copy.

**Why it matters**: the Design's own §18 "Mandatory Stage-3 Process Requirement" assumes a second,
differently-motivated session can diff the v3 draft against v2 — this is only reliably possible if v2 is
preserved somewhere inside the project's own durable record, not dependent on an incidental external
backup outside the project's control or knowledge.

**Severity**: non-blocking for this review (real primary evidence was in fact located and used,
satisfying the independence rule as written) but represents a real durability gap for *future* review or
audit needs.

**Recommended bounded remediation** (not performed by this session — this is a finding, not a fix; a
clean-PASS Independent Review session is authorized only to update SKILL.md's own heading/status
language, per the task's Finalization Rule): a small, separate bounded-housekeeping session should copy
the v2 text (available at `nb/study_archive11/skills/study_archive/SKILL.md`, verified byte-for-byte
against what this review inspected) into `skills/study_archive/archive/SKILL_v2.md`, mirroring the
existing `SKILL_v1.md` precedent, with no other change.

### No Category A findings.

No blocking methodology/safety regression, no contradiction, no material design deviation, and no
disclosed-but-unaddressed safeguard loss was found anywhere in this review.

### No further Category C findings beyond the size note in §16 (already resolved as non-blocking).

---

## 19. Final Verdict

- Every MUST-SURVIVE safeguard (§3 of this document) — **preserved**.
- Every CH-01–CH-13 design requirement (§4) — **PASS**, all 13.
- No Category A finding exists (§18).
- No material internal contradiction exists (§15).
- Portability does not weaken any project invariant (§12).
- All nine adversarial cases (§17) — **PASS**, none merely contingent in the final artifact.
- The draft is traceable to its empirical/design evidence throughout (§4's citation chain verified
  independently, not merely trusted).

**SKILL V3 INDEPENDENT REVIEW: PASS**
**SKILL V3 FINAL: YES**

**Finalization action taken by this session** (the only modification authorized on a clean PASS): the
temporary "has not yet completed its mandatory Independent Skill Review… do not treat it as final"
language in `skills/study_archive/SKILL.md`'s preamble and its §14 v3 entry was replaced with an accurate
final-status statement recording this review's PASS verdict and pointing to this document. No other
line of `skills/study_archive/SKILL.md` was touched by this finalization step. No methodology content
was rewritten during finalization.

---

*End of Skill V3 Independent Review. No application code, database, schema, or live data was touched by
this session. Finding 1 above is disclosed, not silently remediated — it awaits its own bounded
housekeeping session, not folded into this review.*
