# Skill V3 Design Specification

**Status of this document**: design/specification artifact only. It is **not** governing methodology
and does **not** modify `skills/study_archive/SKILL.md`. It is Stage 2's deliverable: a concrete,
reviewable specification of what Skill v3 should become and why, sufficient for a fresh Stage 3
session to perform the actual rewrite without re-deriving P6/P7 evidence from scratch.

**Session scope**: Stage 2 (design) only. No SKILL.md edit, no application/DB change, no P1–P7
historical record altered, no benchmark data altered, this document does not narrate UX/UI work.

---

## 0. Sources Actually Inspected

1. `skills/study_archive/SKILL.md` (v2, 739 lines) — read in full.
2. `skills/study_archive/archive/SKILL_V3_POST_P7_ANALYSIS.md` (764 lines) — read in full. This is the
   primary evidence-compression layer this design is built from.
3. `skills/study_archive/archive/SKILL_V2_CONSOLIDATION_HANDOFF.md` (217 lines) — read in full, for
   v2's original policy rationale and its self-disclosed safeguard-loss history.
4. `docs/PROJECT_CONTEXT.md` — targeted read: header/TOC grep (confirmed P7a+P7b both Phase Complete,
   PASS) and full read of the closing paragraph of the P7b Independent Audit entry (lines 640–665).
   Not read linearly in full — the Stage 1 analysis already extracted what this design needs, and the
   targeted read confirmed current state matches Stage 1's account with nothing materially changed
   since.

Not opened, per the task's own "targeted retrieval only" instruction and because no design decision
below turned out to depend on them: `docs/P6_IMPLEMENTATION_PLAN.md`, `docs/P7_IMPLEMENTATION_PLAN.md`
(primary evidence; Stage 1 already performed the forensic read and every claim used below traces to a
Stage 1 citation, which itself cites specific primary sections — see Stage 1 §0 for its own citation
list), `docs/benchmarks/SKILL_EFFICIENCY_BENCHMARK.md`/`.xlsx` (Stage 1 §8–§10 already digested the
quantitative picture; no decision here turns on a number those sections don't already supply),
`docs/ARCHITECTURE_SPECIFICATION.md` (target-state document, not process/methodology — out of scope
for a methodology design session per §1's own hierarchy).

**Test of the instruction under evaluation**: this session deliberately did not re-open P6/P7 primary
text even once, relying entirely on Stage 1's citations. Every load-bearing claim below is traceable to
a specific Stage 1 section, which is itself traceable to a specific P6/P7 section — the citation chain
stays intact without this session re-walking it. This is itself evidence for §13 below.

---

## 1. Design Principles Selected

1. **v2 is the baseline, not a draft.** Every change below is a delta against v2, stated as a named
   Change ID (§17), not a rewrite from first principles.
2. **Minimum sufficient methodology.** No change is proposed without a specific P6/P7 (or v1→v2
   consolidation) incident behind it. Sections with "NO EVIDENCE FOR CHANGE" in Stage 1's own Change
   Pressure Map (Stage 1 §14) are left alone here, explicitly, rather than touched for symmetry.
3. **Safety semantics survive compression.** Every MUST-SURVIVE safeguard (Stage 1 §12) gets an
   explicit destination in §16 below. None is merged, renamed, or reorganized without that row being
   filled in.
4. **New concepts justify their own maintenance cost.** Each candidate structural addition (Retirement
   Closure, Phase Contract, evidence-precision template, Scoped Amendment route) is adopted only where
   Stage 1 shows a repeated, cross-phase incident, and each is sized to the smallest form that closes
   the demonstrated gap — a ledger, a graph, and a registry were all considered and rejected (§18) in
   favor of smaller mechanisms that reuse structure already proven to work.
5. **Portability is a first-class constraint**, not an afterthought — every new rule below is drafted
   in general engineering terms first, with the Study Archive incident attached as provenance (§14).

---

## 2. Stage-1 Findings Converted to Design Requirements

| # | Stage-1 finding | Classification | Design requirement |
|---|---|---|---|
| 1 | Discovery-scope gap, Shape 1 (within-file sibling handler, Finding L) | D — New Concept justified | Mechanism-scoped discovery heuristic (§4) |
| 2 | Discovery-scope gap, Shape 2 (whole-codebase, Findings M/N/P, `auth.php`) | D — New Concept justified | Same heuristic, generalized; mandatory audit scope item (§10) |
| 3 | Within-file vs whole-codebase gap are *distinct* shapes, not one bug | B — Clarification required | §4 must name both shapes separately, not one generic "search wider" rule |
| 4 | P6 Findings L/M/N/P | D | Mechanism-scoped sibling-surface sweep required in Independent Audit scope (CH-07) |
| 5 | P7 `auth.php` pre-DROP blocker | D | Retirement Closure gate (§5 below, CH-02/CH-04) + Phase Contract obligation field (CH-08) |
| 6 | Destructive-retirement closure has no named concept | D | Retirement Closure (§5) |
| 7 | STOP → Scoped Plan Amendment → Fresh GO used 4x informally | E — Organizational/structural | Named lifecycle-router row (CH-01) |
| 8 | Evidence-claim precision ("byte-identical" pattern, 3 instances) | C — Existing rule (§7.5) must be strengthened | Claim-precision template (CH-05) |
| 9 | Long-lived cross-phase dependency tracked correctly but only in prose (`auth.php`) | D | Phase Contract, minimal (CH-08) |
| 10 | Phase Contract candidate | D, but bounded | Adopt at 4 fields, embedded, not a new document (§7) |
| 11 | Compatibility/retirement obligations | E — merge, not new document | Folded into Phase Contract's obligation field (§8) |
| 12 | Evidence reuse (delta reporting) | A — No design change required | §7.5/§7.6 already correct; Stage 1 found no incident of over- or under-reuse |
| 13 | Session-boundary reconstruction cost | B — Clarification | §7.6 gets one clarifying sentence naming the durable-handoff pattern explicitly (CH-06) |
| 14 | Audit independence | A — No design change required | §8's session-distinctness requirement is validated (3-for-3 catch rate); unchanged |
| 15 | Escalation-trigger gaming, untested | F — Insufficient evidence, defer | Clarify only (CH-10); no structural fix invented without evidence |
| 16 | Two-stage GO generalization beyond RBAC, untested | F — Insufficient evidence, defer | No change; flagged in §18 as a standing open test, not resolved by invention |

No Stage-1 finding was converted into a new section merely for the sake of giving it a section — several
(rows 12, 14, 16) resolve to "no change," stated explicitly rather than silently dropped.

---

## 3. Mechanism-Scoped Discovery Design

**Problem, restated precisely** (Stage 1 §5.2): footprint-anchored verification ("what did this
checkpoint change") structurally cannot find defects organized around "what does the invariant apply
to." Stage 1 identifies **two distinct shapes**, not one:

- **Shape 1 — within-file mechanism gap**: a sibling handler in an *already-touched* file was missed
  (Finding L: `update_file` missed the scope check `upload_file`, in the same file, already had).
- **Shape 2 — whole-codebase mechanism gap**: a file *never named by any checkpoint* shared the same
  invariant (Findings M/N/P; `auth.php`).

A fix aimed only at "search outside the changed-file footprint" closes Shape 2 but not Shape 1 — Shape
1's defect was already inside the declared footprint at the file level. The design below treats
mechanism, not file boundary, as the unit of search.

### 3.1 The proportional rule

| Verification stage | Default scope | Escalates to mechanism-scoped search when… |
|---|---|---|
| Implementation self-check (LOW/MEDIUM, any tier) | Changed files + changed handlers only | The change touches a §5 Core Invariant surface (already an existing §2 escalation trigger — reused, not duplicated) |
| Implementation self-check (HIGH/CRITICAL) | Changed files + changed handlers, **plus every other handler in each changed file that shares the same entity + operation class** (closes Shape 1 at the cheapest possible point) | Always, at this tier — this is new: HIGH/CRITICAL implementation must sweep siblings *within its own touched files* before Regression, not wait for Audit to find Shape-1-class gaps |
| Independent Audit (HIGH/CRITICAL — required by §8) | **Mandatory**: full mechanism-based sweep, explicitly instructed "search by mechanism/invariant, not by the implementer's declared file list" | Always — this is the stage of last resort for Shape 2, and the redundant check for Shape 1 |
| Retirement Closure (destructive/irreversible retirement — §5) | **Mandatory**: whole-codebase sweep for every remaining reference to the artifact being retired, by mechanism (reader/writer/authz/schema/compatibility — see §5.3) | Always, immediately pre-PoNR |

### 3.2 Answers to the six required questions

1. **When must verification expand beyond changed files?** At HIGH/CRITICAL implementation self-check
   (within-file sibling sweep), always at Independent Audit for HIGH/CRITICAL, and always for
   Retirement Closure. Never mandated for LOW/MEDIUM outside the existing §2 Core-Invariant escalation
   trigger — this keeps the common case cheap (§3.4 below).
2. **What triggers mechanism-scoped discovery?** Touching a §5 Core Invariant surface (existing
   trigger, reused); risk tier HIGH/CRITICAL; a destructive/irreversible retirement step.
3. **How far should the search expand?** By entity + operation class, not by file or by directory —
   concretely: "every write handler touching table X" or "every query listing/counting/searching
   protected content of type Y," not "every file in `admin/`."
4. **When is whole-codebase search justified?** Independent Audit for HIGH/CRITICAL (mandatory, not
   discretionary); Retirement Closure (mandatory); a prior audit in the same invariant class found a
   real defect and hasn't been independently reconfirmed clean since (existing §2 trigger, reused).
5. **How should audit differ from implementation verification?** Implementation verification is
   proportional to declared scope plus the within-file sibling sweep (§3.1 row 2); Independent Audit is
   unconditionally mechanism-scoped for HIGH/CRITICAL — this asymmetry is deliberate and evidence-based
   (Stage 1: every genuinely independent, adversarially-scoped pass found something the narrower pass
   before it didn't, 3-for-3).
6. **How is blanket expensive whole-codebase auditing of every LOW/MEDIUM change prevented?** By keeping
   the escalation triggers identical to v2's existing §2 triggers (Core Invariant surface, unreconfirmed
   prior defect, ambiguous scope) plus the two new *bounded* additions (HIGH/CRITICAL within-file sweep;
   retirement sweep) — neither adds cost to ordinary MEDIUM feature work or LOW housekeeping. This is
   validated against Case F in §19 below.

### 3.3 Provenance (kept as compact incident citations, not narrative)

Shape 1: Finding L, `admin/file_management.php` (Stage 1 §5.2). Shape 2: Findings M/N/P,
`admin/curriculum_management.php` / `admin/role_management.php`, and `auth.php` (Stage 1 §5.2, §6.3).
The "search by mechanism, not file" instruction that found Finding P is the single strongest evidence
basis for §3.1's Audit row (Stage 1 §5.3).

---

## 4. Destructive Retirement / Dependency Closure Design

### 4.1 Naming decision

**Retirement Closure.** Chosen over "Dependency Closure" (too broad — implies every dependency
question, not specifically the irreversible-retirement moment) and "Pre-PoNR Closure" (accurate but
opaque without already knowing what PoNR means). "Retirement Closure" names the action (retiring
something) and the property being proven (closure — nothing still depends on it) in two ordinary
words.

### 4.2 When it applies

A destructive/irreversible retirement of a load-bearing artifact (schema column/table, index/
constraint, compatibility field, legacy authorization path, legacy API/interface) triggers a mandatory
Retirement Closure gate **specifically when the artifact had an intervening multi-checkpoint
compatibility arc** — i.e., there was a period, spanning more than one checkpoint or phase, during
which the artifact was correctly judged "safe, compatibility-only" by an earlier checkpoint before the
checkpoint that actually removes it runs.

This scoping is deliberate and evidence-based (Stage 1 §7): P7a's two DDL retirements had **no**
compatibility arc (cut over and dropped inside one tightly-scoped sub-phase) and produced **zero** STOP
events on the first pass; P7b's `users.role` had a five-checkpoint arc and produced the STOP. The
failure mode is specifically that **the number of prior sessions that can each, correctly, locally
judge a dependency non-blocking grows with the length of the arc** — a short, single-sub-phase
retirement doesn't create that condition. An ordinary HIGH-risk migration with no compatibility arc
uses its existing regression gate and Live Re-Scan (§7.3) unchanged — Retirement Closure does not
apply, and does not need to.

### 4.3 What must be proven before the irreversible step, by mechanism

Retirement Closure is a **specialized, mandatory instance of the existing §7.3 Live Re-Scan** — not a
new independent verification mechanism. It is Live Re-Scan's existing "fresh scan immediately before
execution" requirement, made explicit and given a fixed checklist for the retirement case specifically,
because Stage 1 shows the generic Live Re-Scan rule is what accidentally caught `auth.php` — accidental
in the sense that no named checklist forced the specific question to be asked; this design makes the
checklist explicit so the catch stops depending on a particular session happening to ask the right
question.

The sweep, run fresh, immediately pre-PoNR, by the checkpoint executing the destructive step:

| Mechanism | What "closed" means |
|---|---|
| Readers (explicit column lists) | Every `SELECT`/query naming the artifact confirmed either removed or provably safe post-retirement |
| Readers (wildcard queries) | Every `SELECT *` or equivalent against the affected table checked — these don't show up in a column-name grep |
| Writers | Every INSERT/UPDATE referencing the artifact confirmed removed or safe |
| Authorization/display/filter logic | Any authz or visibility decision that reads the artifact confirmed migrated off it |
| Runtime call chains | Confirmed which call sites reach the artifact at all — this is the scope-of-impact multiplier (Stage 1 §6.4: `require_login()`'s universal reach is why a one-line syntactic dependency became application-wide blast radius) |
| Schema-object dependencies | FK/index/constraint/trigger/view/generated-column dependents — none, or each named and closed |
| **Compatibility-only dependencies** | Explicitly re-classified per §4.4 below — "compatibility-only" is never accepted as the closing answer on its own |
| Documentation assumptions | Docblocks/comments asserting the artifact's presence or meaning, corrected or removed |
| Rollback/restore readiness | This step's own rehearsed rollback (§7.2) confirmed current, not stale |
| Environment health | Fresh pre-PoNR check per §13's standing environmental risk — confirm the DB/app are in the expected state immediately before the irreversible action, not merely "were, earlier in the session" |

### 4.4 The dependency-type vocabulary (adopted, lightweight)

Stage 1 §6.4/§6.5 identifies the actual failure shape precisely: **"compatibility-only" was conflated
with "safe indefinitely," when it only ever meant "safe until the specific future step that removes the
referenced object."** Retirement Closure adopts this distinction as a required re-statement, not as new
formal terminology with its own section — when a checkpoint records a reference as compatibility-only,
it must also record *which future checkpoint's execution ends that safety*, and that future checkpoint's
own Retirement Closure sweep (§4.3) is what discharges it. A reference recorded as "compatibility-only"
with no named closing checkpoint is treated as an open Retirement Closure obligation, full stop — it
does not get to silently become "not blocking" by omission.

### 4.5 Ownership — the fix that directly closes the `auth.php` gap class

The obligation is not satisfied by being correctly tracked in prose across sessions (this is exactly
what happened for five P7b sessions and still produced the STOP). It is satisfied only when the
checkpoint that executes the irreversible step **itself declares, in its own Phase Contract "obligations
closed" field (§7), that Retirement Closure ran and what it found** — not inherited from an earlier
checkpoint's "tracked, non-blocking" note. This is the direct mechanism fix for Case C in §19.

---

## 5. STOP → Scoped Plan Amendment → Fresh GO

### 5.1 Decision: formalize as a named lifecycle-router row

Evidence: this exact sequence (diagnose in the plan document → rehearse fresh in scratch →
regression-gate → apply → fresh separate Independent Audit for HIGH/security findings before Phase
Complete) was independently reconstructed **four separate times** in P6/P7 (Stage 1 §6.6: P6 §22.4, P6
§24, P6 §28–29, P7 Part XII), each time citing the previous instance as precedent rather than a shared
named rule. Four clean, independently-successful executions of an identical shape is exactly the
condition under which Stage 1's own principle ("prefer general rules that solve multiple demonstrated
incidents") calls for naming it — this is E, organizational/structural, not new safety content: the
mechanics already work and are not being changed, only given a name and a table row so future instances
don't re-derive their own shape from citation-chasing.

### 5.2 Answers to the six required questions

1. **When is this route required?** Whenever a STOP condition (§11) fires on HIGH/CRITICAL-tier work
   *after* an Owner GO has already been issued for the current execution step.
2. **When is ordinary troubleshooting (§4) enough?** When the issue is diagnosable and fixable strictly
   within the current checkpoint's already-authorized scope, doesn't touch a §5 Core Invariant, doesn't
   cross into new destructive territory, and doesn't invalidate the backup/rehearsal evidence already on
   record for the current GO. Below HIGH/CRITICAL tier, §4's ordinary loop always suffices — this route
   is scoped to GO-gated work specifically, so it adds no ceremony to MEDIUM/LOW troubleshooting.
3. **Does a prior GO become spent after a STOP?** Yes, explicitly. A GO authorizes exactly the
   checkpoint(s)/scope it named; a STOP under that GO ends that specific authorization. Evidenced
   directly: the `auth.php` session explicitly declined to fix a one-line, obvious bug because the GO
   was scoped to "P7b-6 ONLY" (Stage 1 §12's "STOP-before-improvising" row) — the design ratifies this
   as the standing rule, not a one-off caution.
4. **Which changes require fresh authorization?** Any change to the plan document's checkpoint scope,
   any new file/schema-object added to what will be touched, any change in risk classification, and —
   new, added by this design — any change to a Retirement Closure obligation's closing checkpoint (§4.4).
5. **Interaction with Point of No Return?** The amendment and its re-verification must stay strictly
   pre-PoNR. If the STOP occurred because a PoNR analysis itself surfaced the problem, the retry's
   rehearsal and (if applicable) Retirement Closure sweep must be redone against the *amended* plan, not
   patched onto the original evidence.
6. **How does this stay lightweight for non-destructive work?** By construction — it only exists as a
   named route for GO-gated HIGH/CRITICAL work; every other work class's STOP path is unchanged §4/§11
   behavior.

---

## 6. Phase Contract Design

### 6.1 Decision: ADOPT, at the minimum size that closes the demonstrated gap

Four fields only, added to each checkpoint's existing entry inside the phase's own Implementation Plan
document — **not a new document type**, preserving §9's existing four-way separation (this file / state
/ plan / memory).

| Field | Purpose | Rejected larger version |
|---|---|---|
| **Produces** | What this checkpoint makes true on completion, stated as a fact a later checkpoint can cite without re-deriving | — |
| **Consumes** | What this checkpoint depends on from earlier checkpoints/phases, cited by name (checkpoint ID + its own Produces field), not re-derived from `PROJECT_CONTEXT.md` narrative prose alone | — |
| **Obligations opened / closed** | Any compatibility-only reference this checkpoint creates (with its named closing checkpoint, per §4.4) or discharges (with Retirement Closure evidence, per §4.5) | A full Compatibility/Retirement Ledger as a separate document — rejected, §18 |
| **Invariants touched** | Cross-reference to the specific §5 invariant(s), if any | Full invariant-ownership registry — rejected, §18, deferred pending evidence |

Explicitly rejected from the field list (all present in the task's own candidate list, §7): phase
purpose (already covered by the plan document's own header), evidence artifacts (already covered by
citation integrity, §1/§9), superseded assumptions (already covered by Execution Record discipline,
§9), unresolved deferred items (already covered by Scope Discipline, §10). Adding these would recreate
a second Completion Report inside every checkpoint — Stage 1's own principle applies directly: no
evidence these additional fields would have prevented an incident this project actually had.

### 6.2 Lifecycle

- **Created**: at Detailed Planning / checkpoint-definition time, as part of the existing checkpoint
  specification §6 already requires (prerequisites, verification query, rollback action, etc.) — the
  four fields are additions to that existing template, not a new planning step.
- **Updated**: only if actual execution diverges from plan — appended, never rewritten, matching the
  existing Execution Record discipline (§9: "leave the original plan legible as what was proposed and
  approved").
- **Consumed**: a later checkpoint's "Consumes" field must name the specific earlier checkpoint and
  field it relies on. This is the direct mechanism that would have forced P7b-6's own checkpoint entry
  to state "Consumes: P7b-1's opened obligation — `auth.php` read closes here" — turning a five-session
  prose-tracked fact into an explicit field on the one checkpoint that needed to answer it.
- **Relation to `PROJECT_CONTEXT.md`**: unchanged role — the durable cross-phase state summary. Its
  existing forward-pointer convention (already demonstrated working correctly for `users.role`'s P5→P7
  deferral, Stage 1 §11) can now cite a specific checkpoint's Phase Contract fields instead of only
  prose, but `PROJECT_CONTEXT.md` itself is not restructured.
- **Relation to Implementation Plans**: the Phase Contract is not a new document; it is four required
  fields inside each checkpoint's existing entry.
- **Reporting burden**: replaces the informal "tracked in prose across sessions, never assigned to a
  checkpoint" pattern (Stage 1 §11's diagnosis of the `auth.php` gap) — it does not add a burden beyond
  what free-text tracking already cost, and removes the specific failure mode that free-text tracking
  produced.

---

## 7. Ledger / Graph / Registry Decisions

| Candidate | Decision | Reasoning |
|---|---|---|
| Evidence Ledger | **REJECT** | Stage 1 §11: no incident in P6/P7 traces to evidence being lost; `PROJECT_CONTEXT.md` + phase plan documents already function as adequate evidence carriers throughout both phases. |
| Compatibility/Retirement Ledger (standalone document) | **MERGE INTO PHASE CONTRACT** | The "obligations opened/closed" field (§6.1) is the minimal form that closes the demonstrated gap. A standalone ledger would duplicate that field at added maintenance cost, violating Stage 1's own adoption principle (maintenance cost vs. reconstruction cost saved). |
| Dependency Graph | **REJECT** | No incident shows a graph would have caught something the mechanism-based Retirement Closure sweep (§4.3) doesn't already catch; graph maintenance cost for a project this size plausibly exceeds the reconstruction cost it would save. |
| Invariant Ownership registry | **DEFER** | No incident shows ambiguous invariant ownership causing a miss — §5's existing per-invariant incident citations already function as informal ownership. Reconsider if a future phase shows genuinely contested ownership. |

---

## 8. Evidence-Claim Precision Design

### 8.1 The pattern (not an isolated wording slip)

Stage 1 §8.1 documents three independent instances of the identical shape: a true, narrower,
method-specific claim gets reported using broader-sounding, method-independent language — P6's "93/93"
read as comprehensive tenant correctness; the v2 consolidation's "four safeguards restored" read as "the
consolidation is faithful"; P7's "byte-identical" for a raw-text diff that a structural diff would have
called equivalent (2 of 20 tables differ only in key-declaration order). In every instance the
underlying check was genuine and thorough — the gap is in the word chosen to describe the result, not in
the checking discipline itself (which §7.5 already covers well).

### 8.2 Design: a lightweight reporting template, not a formal taxonomy

Adopted, added to §7.5 as an explicit claim-precision rule: any equivalence/absence/completeness claim
must state, in the same sentence or the one immediately following it:

- **WHAT** was checked (which specific artifacts/rows/tables/paths — not "the schema" but "all 20
  tables in `schema.sql`");
- **HOW** it was checked (method: raw-text diff vs. structural/normalized diff; executed vs. reasoned;
  exhaustive vs. sampled);
- **WHAT** the check actually supports, phrased at its narrowest true scope — "identical under
  `SHOW CREATE TABLE` structural comparison; key-declaration order not independently verified" instead
  of "byte-identical."

**Explicitly not adopted**: a formal named equivalence-level taxonomy (e.g. "L1/L2/L3 equivalence") —
Stage 1's own vocabulary experiment (§8.2, "structurally-equivalent vs. byte-identical vs.
behaviorally-equivalent") is useful as *example wording*, not as a category system requiring its own
definitions section. The three-part template above achieves the same precision without inventing
terminology whose maintenance (keeping definitions unambiguous over time) is itself a cost with no
demonstrated need beyond what plain, careful sentences already provide. If a future phase shows the
lightweight template producing genuine ambiguity, a formal taxonomy remains available to reconsider
(§18).

**Ban list** (explicit, added because Stage 1 shows these specific words are where the gap actually
occurred): "byte-identical" requires an actual byte/raw-text diff having been run; "zero dependency"
requires a completed Retirement Closure sweep (§4.3), not a partial one; "proves comprehensive X"
requires the check's own scope to actually equal X, stated, not implied by a bare pass/fail count.

---

## 9. Independent Audit V3 Design

### 9.1 Decision: STRENGTHEN §8, do not restructure it

§8 is Stage 1's single most validated section (3-for-3 catch rate across four audit passes in P6/P7
combined) — it survives unchanged in its core requirement (session-distinctness; required for
HIGH/CRITICAL; recommended-escalating-to-required for MEDIUM touching §5). What changes is making
**explicit, required scope items** that P6/P7's *best* audits already did informally, so future audits
don't depend on a particular session happening to be instructed well (exactly the P6 second-audit
"search by mechanism, not by file" instruction that found Finding P — Stage 1 flags this as the
strongest evidence that mechanism-based sweep is what closes the gap, not accidental thoroughness).

### 9.2 Required scope for HIGH/CRITICAL Independent Audit (v3)

1. **Declared-footprint verification** — unchanged, already essential (full-tree diff against verified
   backup, Stage 1 §10's own "ESSENTIAL" rating).
2. **Mechanism-scoped sibling-surface discovery** — new, mandatory (§3.1's Audit row): explicitly
   instructed to search by mechanism/invariant, not by the implementer's declared file list.
3. **Negative-space search** — new, mandatory: explicitly search for the *absence* of an expected
   safeguard across every site the invariant should apply, not only confirm presence where the
   implementer already claims it.
4. **Adversarial testing** — unchanged, already present in practice (P6/P7's own adversarial matrices).
5. **Claim-strength verification** — new, mandatory: re-derive and either confirm or downgrade every
   equivalence/absence claim the implementer made, against §8.2's template. This is the exact mechanism
   that caught "byte-identical" — made a required audit duty, not a byproduct of one session's
   unusually careful phrasing.
6. **Cross-phase assumption verification** — new, mandatory when the checkpoint being audited closes a
   Retirement Closure obligation (§4.5): the audit must verify the Phase Contract's "obligations closed"
   field is actually true, re-derived, not merely present.

### 9.3 Independence across session boundaries

Clarified, not changed in substance: an audit session must not reuse the implementer's own evidence for
any load-bearing claim (existing §7.5 rule). It **may** cite a fact an *earlier, different* audit session
already independently established — independence attaches to the source of the fact, not to how recently
it was established. What must always be freshly re-derived: anything only the implementer (not a
distinct audit) has verified.

---

## 10. Risk Router V3 Decision

**Keep the four tiers unchanged** — no P6/P7 evidence supports a fifth tier or a misclassification
incident of any kind (Stage 1 §14: "NO EVIDENCE FOR CHANGE" for §2 itself).

Two clarifications, not new tiers:

- Destructive retirement of an artifact with a prior multi-checkpoint compatibility arc is a **HIGH-tier
  modifier** — it triggers the mandatory Retirement Closure gate (§4) within the existing HIGH/CRITICAL
  row, not a new tier.
- HIGH/CRITICAL work touching a §5 Core Invariant surface requires the mechanism-scoped Independent
  Audit scope of §9.2 — cross-referenced from §2's existing escalation trigger, not duplicated as new
  tier language.

**Escalation-trigger gaming**: Stage 1 explicitly flags this as untested (no incident of under-description
occurred in P6/P7; only the absence of a counterexample, not evidence of resilience). Per this design's
own principle (§1.4: don't invent structure without evidence), this gets a **clarification, not a
structural fix**: risk classification is based on the mechanism/invariant the change actually touches, as
verified against the live code, not on the task description's own framing. This closes the specific gap
a bad-faith or merely-rushed description could exploit (classify from what the diff does, not from what
the request says it does) without inventing an unevidenced enforcement mechanism. Flagged in §18 as a
standing open test for a future phase to actually exercise.

---

## 11. Ceremony / Lifecycle Compression Decisions

Stage 1 found **zero** P6/P7 lifecycle mechanism classified as pure ceremony (Stage 1 §10's table: every
row is ESSENTIAL, VALUABLE, or NO-EVIDENCE-FOR-CHANGE; none INSUFFICIENT or wasteful). Accordingly, this
design removes **no** stage, gate, or check. Cost reduction is achieved only through the following, each
scored against the four required questions:

| Compression | Cost removed | Evidence preserved | Safeguard risk | How proven |
|---|---|---|---|---|
| CH-01, named Scoped Amendment route | Re-deriving the route's own shape from precedent-citation, 4 times observed | Every mechanic of the 4 prior instances (diagnose→rehearse→gate→apply→fresh audit) kept unchanged | None — pure naming, no mechanic altered | §5.2's point-by-point mapping to the existing 4 instances |
| CH-08, Phase Contract fields | Re-reading `PROJECT_CONTEXT.md` narrative prose to hunt for an obligation's owner | The obligation itself must still be tracked and closed — this only changes *where* it's declared, from prose to a named field | None — the field is additive to the existing checkpoint template, not a replacement for any existing check | §6's field-by-field mapping to the `auth.php` gap's actual failure mode |
| CH-04, Retirement Closure as a specialized Live Re-Scan | Re-deriving, each time, what a retirement-specific re-scan should cover | The underlying §7.3 Live Re-Scan requirement (fresh, immediately pre-execution) is unchanged and still mandatory | None — this makes an existing mandatory check's scope explicit; it doesn't relax when the check runs | §4.3's checklist is a superset restatement of what the actual `auth.php` catch already did |
| CH-11, bounded §14 Version History | Re-growing, unbounded, append-only narrative (already regrowing per Stage 1 §14's own observation) | Full incident detail preserved in each phase's own plan document (unchanged source of truth) and, for pre-v2 history, in `SKILL_v1.md` (unchanged) | Low — this is the one item requiring care: capping must not delete a safeguard-loss disclosure (e.g. the v1→v2 fifth-safeguard finding) that itself justifies a rule elsewhere in the file. See CH-11's acceptance criteria. | §14 below names exactly what must remain inline vs. what may be pointed-to |

No compression proposal here reduces the number of times a check is actually *performed* — only the
number of times its *shape* must be re-derived from scratch. This matches §1.4's adoption principle
exactly.

---

## 12. Token / Context Strategy

Adopted as an explicit, portable pattern (validated by this very session, per §0's "test of the
instruction under evaluation"): **durable compressed handoff → targeted primary-source retrieval →
downstream design**, used in place of full linear rereads of large, stable documents. This session
navigated a 739-line governing file, a 764-line analysis document, and a 217-line handoff in full (all
small enough to read directly) while deliberately not re-opening two multi-thousand-line implementation
plans, relying instead on Stage 1's own citation chain — and every claim in this document remains
traceable back through that chain to a specific primary section, per §0.

This adds one clarifying sentence to §7.6 (CH-06), not a new section: durable analysis artifacts
(a phase's Completion Report, a dedicated cross-phase analysis document like Stage 1's own output) are
the preferred entry point for a large or multi-session document, with the primary source consulted only
when a claim is load-bearing, ambiguous, or a safeguard is being changed — exactly the four conditions
the task instructions for this very session already specified, now generalized as a standing rule rather
than a one-session instruction.

**Boundary preserved unchanged**: load-bearing claims must remain traceable to primary evidence — this
design does not weaken §7.5's existing rule that a session-boundary-crossing, load-bearing fact must be
re-derived fresh, not merely cited. Compression governs *navigation cost*, never *evidentiary weight*.

---

## 13. Portability Beyond Study Archive

| Category | Content |
|---|---|
| **A — General engineering methodology** (v3 should prefer this) | Risk tiers + lifecycle router shape; investigation/troubleshooting loop; mechanism-scoped discovery rule (§3); Retirement Closure gate (§4); Scoped Plan Amendment route (§5); Phase Contract (§6); evidence-claim precision template (§8); Independent Audit required scope (§9); STOP conditions; Completion Report structure; token/context strategy (§12) |
| **B — Study-Archive-specific invariant** | §5.2's exact RBAC Permission+Scope model; File Ownership specifics; the university/faculty/department tenant hierarchy; `users.role` and its specific retirement history; §13's MariaDB/Windows/XAMPP environment notes (already correctly isolated in v2 — no change needed) |
| **C — Example/empirical provenance** (kept compact, attached to the general rule it justifies) | Finding L/M/N/P; the `auth.php` STOP; the P5 scope-selector gap; the v1→v2 safeguard-loss incidents; the "byte-identical" instances |

**Design instruction for Stage 3**: state each general rule's principle first, in Category-A language,
with the Category-B concrete instance explicitly tagged (e.g. "**concrete instance in this project**:
File Ownership, §5.2") rather than left indistinguishable from the general rule — this is a wording
discipline applied where §5 currently interleaves the two, not a restructuring into a separate document.
§13 (Environment Notes) is already correctly isolated as pure Category B and needs no change beyond
leaving it exactly where it is. No Study-Archive filename, table name, role name, or tenant-hierarchy
term should appear inside a Category-A rule's own normative sentence — only inside its attached,
clearly-marked provenance note.

---

## 14. Proposed V3 Information Architecture

| § | Name | Purpose | Source (v2) | Stage-1 pressure | Action | Size |
|---|---|---|---|---|---|---|
| 0 | Mission & Authority | Priority ordering, Owner authority | §0 | None | KEEP | SMALL |
| 1 | Source-of-Truth Hierarchy | Document precedence, citation integrity | §1 | Validated, actively used (§8.1's "byte-identical" correction) | KEEP | SMALL–MED |
| 2 | Risk Classification | Tiers + triggers | §2 | No misclassification incident; gaming untested | CLARIFY (§10 above) | SMALL–MED |
| 3 | Lifecycle Router | Work-class → stage table | §3 | Scoped Amendment + Retirement Closure both used informally, unnamed | STRENGTHEN (+2 rows) | MED |
| 4 | Investigation/Troubleshooting Loop | Diagnostic heuristics | §4 | Actively cited by name in both audits; missing Shape-1/Shape-2 heuristic | STRENGTHEN (+1 heuristic, 2 shapes) | MED |
| 5 | Core Invariants | CSRF/authz/data-integrity/doc-integrity rules | §5 | Semantics all intact; portability wording gap | REORGANIZE (principle/instance split, §13 above) | MED–LARGE |
| 6 | Change Execution Protocol | Per-checkpoint discipline | §6 | Missing named Retirement Closure gate | STRENGTHEN (+ Retirement Closure subsection) | MED–LARGE |
| 7.1–7.4 | Backup/Rehearsal/Live-Re-Scan/Regression | Core verification mechanics | §7.1–7.4 | No incident of insufficiency | KEEP | MED |
| 7.5 | Evidence Strength & Reuse | Reuse rules + (new) claim precision | §7.5 | 3 independent overclaim instances | STRENGTHEN (+ template, §8 above) | MED |
| 7.6 | Token/Context Efficiency | Efficiency rules | §7.6 | Pattern validated, one clarifying sentence justified | CLARIFY (+1 sentence, §12 above) | SMALL |
| 8 | Independent Review Policy | Audit requirement + scope | §8 | Most-validated section; scope was implicit, not required | STRENGTHEN (required scope items, §9 above) | MED |
| 9 | Evidence & Documentation Policy | Owner Decision Protocol + (new) Phase Contract | §9 | Finding O's unstated-promise gap; Phase Contract fields | CLARIFY + NEW (Phase Contract, §6 above) | MED |
| 10 | Scope Discipline | Deferral rules | §10 | No incident | KEEP | SMALL |
| 11 | STOP Conditions | Trigger list | §11 | Textbook execution in `auth.php` case; needs cross-ref to Amendment route | KEEP + cross-reference | SMALL–MED |
| 12 | Completion Report Standard | 13-item report | §12 | No incident; Phase Contract fields worth a one-line cross-ref | KEEP (+1 cross-ref) | SMALL–MED |
| 13 | Environment Notes | MariaDB/Windows/XAMPP | §13 | Reconfirmed by the mysqld crash incident | KEEP | SMALL |
| 14 | Version History | Revision log | §14 | Already regrowing toward v1's append-only shape | SIMPLIFY (bounded, §17/CH-11) | SMALL (capped) |

**Explicitly avoided**: a separate Retirement Ledger section, a separate Evidence Ledger section, a
separate Dependency Graph section, a separate formal-taxonomy section for evidence levels — all folded
into existing sections per §7/§8's decisions, per the architecture's own consolidation-over-proliferation
instruction.

**Approximate size target**: v2 is 739 lines. The additions above (Retirement Closure subsection, Phase
Contract fields, two new router rows, mechanism-scoped discovery heuristics, claim-precision template,
required-audit-scope items) are individually small and table-driven; offset against §14's cap (which
stops, not merely slows, the one section already shown to be regrowing). Target: **roughly 800–870
lines (+8% to +18% over v2)** — real growth, because real new safety content is being added, but not the
near-doubling v1→v2 itself reversed, and not growth proportional to the number of Stage-1 findings (16)
converted (only 6 produced new normative text; the rest resolved to KEEP/CLARIFY/DEFER). Optimized for
safety semantics per unit of context, not minimum KB — Stage 3 should treat 870 lines as a soft ceiling
to push back against, not a floor to fill.

---

## 15. Safeguard Preservation Matrix

Every safeguard Stage 1 marked MUST SURVIVE (Stage 1 §12), mapped to its v3 destination.

| Safeguard | v2 location | v3 location | Status | Incident | Regression risk | Stage-3 verification requirement |
|---|---|---|---|---|---|---|
| Independent Audit required for HIGH/CRITICAL | §8 | §8 | Unchanged core requirement; scope strengthened (§9.2) | Finding L, Finding P, `auth.php`-adjacent overclaim | Low — requirement itself untouched | Diff v3 §8's requirement sentence against v2 §8 word-for-word; confirm "required" language is not weakened to "recommended" anywhere |
| Session-distinctness for Independent Review/Audit | §8 | §8, §9.3 clarifies reuse boundary | Unchanged, clarified not loosened | Found Finding P after prior session's own 19/19 "pass" | Medium — the reuse clarification (§9.3) could be misread as loosening independence if worded carelessly | Confirm v3 text states "may cite an independently-sourced prior fact" AND "must not reuse the implementer's own evidence for a load-bearing claim" in the same breath, not one without the other |
| Fresh Live Re-Scan immediately before GO/execution | §7.3 | §7.3, specialized by Retirement Closure §6 (new) | Unchanged; Retirement Closure is additive | Surfaced the `auth.php` STOP | Low — §7.3's own text must not be narrowed when the new subsection is added nearby | Confirm §7.3's general rule still applies to every HIGH+ step, not only retirement steps, after the new subsection is inserted |
| Criterion-driven, non-calendar stability/soak gate | §3 (two-stage GO note) | §3, unchanged | Unchanged | P7b item 7 blocked GO until genuine organic use | Low | Confirm the two new router rows (Amendment, Retirement Closure) don't get inserted in a way that visually displaces or shortens this note |
| Rollback rehearsal + backup verification before HIGH-risk steps | §7.1/§7.2 | §7.1/§7.2, unchanged | Unchanged | Gave the STOP a safe place to halt | Low | Word-diff against v2 |
| Full-tree diff against verified backup for footprint claims | §7.5 | §7.5, unchanged; reinforced by §8.2 claim-precision template | Unchanged, strengthened | Repeatedly reconfirmed "no undeclared file differs" | Low | Confirm §7.5's original sentence survives verbatim or near-verbatim inside the strengthened section |
| STOP-before-improvising, scope-narrow GO discipline | §3, §11 | §3, §11, reinforced by §5 (Scoped Amendment route) | Unchanged, formalized | `auth.php` session declined to fix "one line" under a narrow GO | Medium — the new named Amendment route must not be worded as an invitation to fix things faster under an existing GO; it must explicitly require a fresh GO | Confirm the new §3 row states "requires a fresh, separate GO" explicitly, not merely "may proceed after remediation" |
| Citation integrity | §1/§5.4/§9 | §1/§5.4/§9, unchanged | Unchanged, actively used by §8.2's new template | Corrected the "byte-identical" claim; corrected v2's own P2-audit citation | Low | Word-diff against v2 |
| No silent remediation of security/behavioral findings | §8 | §8, unchanged | Unchanged | Findings L/M/N/O/P all disclosed, none quietly patched | Low | Word-diff against v2 |
| Scratch-resource lifecycle tracking | §7.2 | §7.2, unchanged | Unchanged | Prevents recurrence of the P2 orphaned-scratch-DB incident | Low | Word-diff against v2 |

**No MUST-SURVIVE safeguard is merged into a differently-scoped rule, renamed without cross-reference, or
left to implicit inheritance** — every row above names an explicit v3 destination.

---

## 16. Rejected / Deferred Ideas

| Idea | Decision | Why | What would justify reconsideration |
|---|---|---|---|
| Full dependency graph | REJECT | No incident traces to a gap a graph specifically would have closed; maintenance cost plausibly exceeds the reconstruction cost saved for a project this size | A future phase where Phase Contract fields + mechanism sweeps together still fail to surface a multi-hop dependency |
| Separate Evidence Ledger | REJECT | Stage 1 §11: no incident of lost evidence; existing documents already function as adequate carriers | A future phase where a load-bearing fact is genuinely lost between sessions despite §7.5's citation discipline |
| Separate Compatibility/Retirement Ledger document | REJECT (merged into Phase Contract) | Duplicates the "obligations opened/closed" field at added maintenance cost | Phase Contract's embedded field proves insufficient — e.g. an obligation spans so many checkpoints that per-checkpoint fields fragment the picture badly |
| Universal whole-codebase scanning for every change | REJECT | Would impose HIGH-risk-equivalent cost on LOW/MEDIUM work with no matching incident; §3's proportional rule already targets the actual gap shapes | A LOW/MEDIUM change is shown to have hidden a Shape-2-class defect |
| Additional risk tiers | REJECT | Four tiers cover every P6/P7 case correctly classified; no misclassification incident | A work class emerges that structurally doesn't fit HIGH/CRITICAL's existing criteria |
| Mandatory two-stage GO for every HIGH-risk task | REJECT | Evidence supports it only for fallback-retiring cutovers specifically (v2 already scopes it correctly); generalizing further is unevidenced | A non-fallback-retiring HIGH-risk task is shown to need the same soak-gate discipline |
| More lifecycle stages beyond the two new rows | REJECT | No evidence beyond Scoped Amendment and Retirement Closure supports further stages | A third recurring, independently-reconstructed-multiple-times pattern is identified in a future phase |
| Formal named equivalence-level taxonomy (L1/L2/L3-style) | DEFER | The lightweight WHAT/HOW/WHAT-was-proven template (§8.2) achieves the same precision without a definitions section to maintain | The lightweight template is shown, in practice, to produce genuine ambiguity a formal taxonomy would resolve |
| Separate portability "Appendix" document split | DEFER to Stage 3 | Organizational only, not safety-relevant; not core to this design's mandate | Stage 3 finds the inline principle/instance tagging (§13) insufficiently clear in practice |
| Invariant Ownership registry | DEFER | Stage 1 §11: no incident of ambiguous ownership | A future phase shows genuinely contested invariant ownership |
| Structural fix for escalation-trigger gaming | DEFER (clarification only adopted, §10) | No incident of gaming occurred; inventing enforcement machinery against an untested threat violates this design's own evidence-based-adoption principle | A future task is shown to have been under-described specifically to escape a heavier tier |
| Untested generalization of two-stage GO beyond RBAC | DEFER, not resolved | `users.role` is itself RBAC-adjacent; no genuinely non-RBAC HIGH-risk cutover has occurred yet | A future non-RBAC HIGH-risk cutover (e.g. a storage-backend migration, the handoff's own named test case) actually occurs |

---

## 17. V2 → V3 Change Specification

### CH-01 — Add Scoped Plan Amendment lifecycle-router row
- **TYPE**: ADD (organizational — formalizes existing informal practice)
- **CURRENT V2 BEHAVIOR**: §3's work-class table has 10 rows; none names the STOP→Amendment→fresh-GO
  sequence. It has been independently reconstructed 4 times from precedent citation.
- **EMPIRICAL PRESSURE**: Stage 1 §6.6 — 4 independent, successful instances (P6 §22.4, P6 §24, P6
  §28–29, P7 Part XII), each re-deriving the same shape.
- **V3 DESIGN DECISION**: add one new row: "Scoped Plan Amendment (post-GO STOP on HIGH/CRITICAL work)"
  → minimum lifecycle: diagnose in plan doc → fresh scratch rehearsal → regression gate → apply →
  fresh, separate Independent Audit required for any HIGH/security finding → Owner GO required: **yes,
  fresh, naming the amended scope** → independent audit: required if the finding was HIGH/security.
- **SAFETY IMPACT**: none — codifies existing successful mechanics; explicitly requires the fresh-GO
  step that the 4 prior instances already correctly performed.
- **TOKEN/CONTEXT IMPACT**: reduces future re-derivation of the route's shape from precedent-citation;
  no change to the actual verification work performed.
- **REWRITE INSTRUCTION**: insert as a new row in §3's table, immediately after the existing
  "Emergency/high-confidence rollback" row; cross-reference from §11 (STOP Conditions).
- **ACCEPTANCE CRITERIA**: new row present; explicitly states "requires a fresh, separate Owner GO
  naming the amended scope" (not merely "may resume"); §11 cross-references it; no existing row's text
  altered.

### CH-02 — Add Destructive Retirement work-class row
- **TYPE**: ADD
- **CURRENT V2 BEHAVIOR**: destructive retirement of a compatibility-arc artifact is handled under the
  existing "Schema migration (HIGH/CRITICAL)" row with no artifact-specific closure requirement named.
- **EMPIRICAL PRESSURE**: P6 Finding L, P7 `auth.php` — two independent cross-phase incidents of the
  same underlying gap (Stage 1 §6.5, §7).
- **V3 DESIGN DECISION**: add a row (or a sub-note on the existing schema-migration row) requiring
  Retirement Closure (§4 of this document) whenever the retirement follows a multi-checkpoint
  compatibility arc.
- **SAFETY IMPACT**: positive — closes a demonstrated, repeated, HIGH-severity gap class.
- **TOKEN/CONTEXT IMPACT**: adds cost only to the specific case (compatibility-arc retirement); zero
  added cost to a short, single-sub-phase retirement (per §4.2's explicit scoping).
- **REWRITE INSTRUCTION**: add to §3's table and add a full new subsection under §6 (see CH-04).
- **ACCEPTANCE CRITERIA**: the row's trigger condition explicitly names "multi-checkpoint compatibility
  arc," not "any schema DDL" (to avoid over-triggering on P7a-shaped short retirements, per §4.2).

### CH-03 — Add mechanism-scoped discovery heuristic
- **TYPE**: ADD (to §4's existing heuristic list)
- **CURRENT V2 BEHAVIOR**: §4's first heuristic ("check the general mechanism, not just the common
  trigger") is close but doesn't distinguish Shape 1 (within-file sibling) from Shape 2
  (whole-codebase).
- **EMPIRICAL PRESSURE**: Stage 1 §5.2's explicit refinement — a single "search wider" heuristic would
  have caught Shape 2 but not Shape 1.
- **V3 DESIGN DECISION**: add a heuristic explicitly naming both shapes, bracketed with Finding L
  (Shape 1) and Findings M/N/P + `auth.php` (Shape 2), matching v2's existing style of one heuristic per
  incident.
- **SAFETY IMPACT**: positive — gives implementers (not just auditors) a named reason to sweep sibling
  handlers in already-touched files before Regression.
- **TOKEN/CONTEXT IMPACT**: small, bounded addition to an existing list-format section.
- **REWRITE INSTRUCTION**: insert as a new bullet immediately after §4's existing "check the general
  mechanism" heuristic, since it refines that heuristic rather than replacing it.
- **ACCEPTANCE CRITERIA**: both shapes named explicitly with their own incident citation; existing
  "check the general mechanism" heuristic text unaltered, only extended.

### CH-04 — Retirement Closure gate mechanics
- **TYPE**: ADD (new subsection under §6)
- **CURRENT V2 BEHAVIOR**: §6's per-checkpoint protocol includes PoNR analysis but no dedicated,
  named, mechanism-based closure checklist for retiring an artifact with a compatibility arc.
- **EMPIRICAL PRESSURE**: §4 of this document, in full — P6 Finding L, P7 `auth.php`, and the
  §4.2 P7a-vs-P7b arc-length comparison.
- **V3 DESIGN DECISION**: as specified in §4 of this document — a specialized, mandatory Live Re-Scan
  instance with the 10-item mechanism checklist (§4.3), triggered specifically by compatibility-arc
  retirements, owned explicitly by the executing checkpoint's Phase Contract field (§4.5).
- **SAFETY IMPACT**: positive, directly targets the highest-severity repeated gap class in the project's
  P6/P7 history.
- **TOKEN/CONTEXT IMPACT**: bounded to compatibility-arc retirements only; framed as a specialization of
  an already-mandatory check (§7.3), not new independent work for the common case.
- **REWRITE INSTRUCTION**: new §6.x subsection, cross-referenced from the new §3 row (CH-02) and from
  §7.3.
- **ACCEPTANCE CRITERIA**: the 10-item checklist from §4.3 present in full; explicit statement that
  "compatibility-only" alone never satisfies closure without a named closing checkpoint (§4.4); explicit
  ownership rule (§4.5) stated.

### CH-05 — Evidence-claim precision template
- **TYPE**: STRENGTHEN (§7.5)
- **CURRENT V2 BEHAVIOR**: §7.5 covers evidence-*gathering* strength (diff beats mtime, executing beats
  reasoning) but not evidence-*reporting* precision.
- **EMPIRICAL PRESSURE**: Stage 1 §8.1 — 3 independent instances of true-narrow-claim reported as
  broad-strong claim.
- **V3 DESIGN DECISION**: as specified in §8 of this document — WHAT/HOW/WHAT-was-proven template plus
  an explicit ban list for "byte-identical" / "zero dependency" / "proves comprehensive X" used loosely.
- **SAFETY IMPACT**: positive — directly prevents recurrence of a demonstrated, 3-instance pattern.
- **TOKEN/CONTEXT IMPACT**: small — a reporting discipline, not a new verification step.
- **REWRITE INSTRUCTION**: add as a new bullet/sub-list at the end of §7.5, after the existing "reasoned
  skips are allowed" bullet.
- **ACCEPTANCE CRITERIA**: template's three parts present; ban list present; explicit statement that the
  underlying check itself is not what's being second-guessed, only its description.

### CH-06 — Durable-handoff pattern clarification
- **TYPE**: CLARIFY (§7.6)
- **CURRENT V2 BEHAVIOR**: §7.6 already contains the substance of this pattern but doesn't name it as a
  standing preference for large/multi-session documents specifically.
- **EMPIRICAL PRESSURE**: this very Stage 1→Stage 2 transition (§0/§12 of this document) plus P6/P7's
  own delta-reporting citations (Stage 1 §9.1).
- **V3 DESIGN DECISION**: one clarifying sentence naming "durable analysis artifact → targeted
  primary-source retrieval → downstream design" as the preferred pattern for large or multi-session
  documents, citing this Stage 1/2 pair as its own validating instance.
- **SAFETY IMPACT**: none — clarifies an existing, already-correct rule; explicitly restates that
  load-bearing claims still require primary-evidence traceability.
- **TOKEN/CONTEXT IMPACT**: reduces unnecessary full rereads of large stable documents.
- **REWRITE INSTRUCTION**: add one sentence to §7.6, not a new subsection.
- **ACCEPTANCE CRITERIA**: sentence added; §7.5's existing "re-derive fresh at session boundaries for
  load-bearing facts" rule is not weakened or contradicted by the new sentence.

### CH-07 — Strengthen Independent Audit required scope
- **TYPE**: STRENGTHEN (§8)
- **CURRENT V2 BEHAVIOR**: §8 requires Independent Audit for HIGH/CRITICAL but does not name required
  scope items beyond "re-deriving live DB/code state" and the behavior/claims two-question framing.
- **EMPIRICAL PRESSURE**: §9 of this document — the P6 second-audit's explicit "search by mechanism, not
  file" instruction is what found Finding P; no rule currently requires that instruction for every audit.
- **V3 DESIGN DECISION**: as specified in §9.2 of this document — six required scope items, all but two
  (footprint verification, adversarial testing) newly explicit.
- **SAFETY IMPACT**: positive — removes dependence on a particular audit session happening to be
  instructed unusually well.
- **TOKEN/CONTEXT IMPACT**: real, bounded increase in audit-stage cost for HIGH/CRITICAL work only —
  matches Stage 1's own principle that the highest-cost steps in P6/P7 were exactly the ones doing the
  most safety-relevant work.
- **REWRITE INSTRUCTION**: expand §8's existing paragraph into an explicit numbered list of required
  scope items.
- **ACCEPTANCE CRITERIA**: all six items from §9.2 present; session-distinctness requirement (existing
  v2 text) preserved verbatim or near-verbatim.

### CH-08 — Phase Contract minimal fields
- **TYPE**: NEW CONCEPT (added under §9)
- **CURRENT V2 BEHAVIOR**: cross-checkpoint dependencies are tracked in free prose across
  `PROJECT_CONTEXT.md` and plan-document narrative, with no required field forcing assignment to a
  specific checkpoint.
- **EMPIRICAL PRESSURE**: §6 of this document — the `auth.php` gap's actual failure mode (correctly
  tracked in prose for 5 sessions, never assigned to a checkpoint's own closing condition).
- **V3 DESIGN DECISION**: as specified in §6 of this document — 4 fields (Produces / Consumes /
  Obligations opened-closed / Invariants touched), embedded in each checkpoint's existing plan-document
  entry, not a new document.
- **SAFETY IMPACT**: positive, directly closes the demonstrated gap; explicitly bounded to avoid
  recreating a second Completion Report per checkpoint.
- **TOKEN/CONTEXT IMPACT**: small, bounded — 4 short fields per checkpoint; reduces future
  prose-hunting cost.
- **REWRITE INSTRUCTION**: add to §9 as a required addition to §6's existing per-checkpoint
  specification template; cross-reference from §6 and from §11.
- **ACCEPTANCE CRITERIA**: exactly 4 fields, matching §6.1's table; explicit statement that this is not
  a new document and does not replace `PROJECT_CONTEXT.md` or the Implementation Plan.

### CH-09 — Clarify Owner Decision Protocol for unstated functional promises
- **TYPE**: CLARIFY (§9)
- **CURRENT V2 BEHAVIOR**: §9's Owner Decision Protocol triggers on "genuinely ambiguous
  institutional/business questions" but doesn't explicitly cover a checkpoint's own plain-language
  feature promise (e.g. "Disable") shipping without an explicit functional definition.
- **EMPIRICAL PRESSURE**: P6 Finding O (Stage 1 §5.2, §13) — classified A/D boundary, partly a
  methodology gap.
- **V3 DESIGN DECISION**: add one clarifying sentence: a checkpoint's own plain-language promise about
  what a new feature does must be forced into an explicit, resolved Owner Decision (or a stated,
  verified functional definition) before Implementation, not left implicit.
- **SAFETY IMPACT**: positive, low-severity — prevents a shipped feature from silently not doing what its
  own plan text promised.
- **TOKEN/CONTEXT IMPACT**: negligible — one sentence.
- **REWRITE INSTRUCTION**: add to §9's Owner Decision Protocol paragraph.
- **ACCEPTANCE CRITERIA**: sentence present; explicitly cites the general pattern (unstated functional
  promise), with Finding O as its attached provenance note, not inline in the normative sentence
  (portability, §13 above).

### CH-10 — Clarify risk-classification gaming resistance
- **TYPE**: CLARIFY (§2)
- **CURRENT V2 BEHAVIOR**: §2's escalation triggers exist but don't explicitly state that classification
  must be based on the live-code mechanism touched, not the task description's own framing.
- **EMPIRICAL PRESSURE**: Stage 1's own explicitly flagged untested concern (§16 above; no incident, no
  fix invented beyond clarification, per this design's evidence-based-adoption principle).
- **V3 DESIGN DECISION**: one clarifying sentence in §2; no new trigger, no new tier.
- **SAFETY IMPACT**: neutral-to-positive; doesn't claim to solve an untested problem, only removes one
  plausible loophole in wording.
- **TOKEN/CONTEXT IMPACT**: negligible.
- **REWRITE INSTRUCTION**: add to §2's opening paragraph.
- **ACCEPTANCE CRITERIA**: sentence present; §18's "defer, not resolved" framing preserved in §14
  (Version History) or wherever Stage 3 records open questions, so a future session doesn't mistake this
  clarification for a proven fix.

### CH-11 — Bound Version History growth
- **TYPE**: STRENGTHEN/SIMPLIFY (§14)
- **CURRENT V2 BEHAVIOR**: §14 is an open-ended append-only log, already regrown from a "compact
  pointer" concept to ~95 lines through three correction passes (Stage 1 §14's own observation).
- **EMPIRICAL PRESSURE**: Stage 1 §14 explicitly names this as the same shape v1's 250-line log had,
  just starting from a smaller base — a live recurrence, not a hypothetical risk.
- **V3 DESIGN DECISION**: cap §14 at the entries needed to explain the current governing text; any entry
  whose *content* (not just its citation) is no longer needed to understand a live rule gets summarized
  to one line with a pointer to where the full detail already lives permanently (the phase's own plan
  document, or `SKILL_v1.md`/`SKILL_V2_CONSOLIDATION_HANDOFF.md` for pre-v3 history) — mirroring exactly
  how v1's full revision log was already externalized during the v1→v2 consolidation itself.
- **SAFETY IMPACT**: requires care — must not summarize away a disclosure (e.g., the v1→v2 fifth-
  safeguard finding) that itself is the *evidentiary basis* for a current rule; summarization removes
  narrative repetition, not the fact being cited.
- **TOKEN/CONTEXT IMPACT**: stops, rather than slows, an already-observed regrowth pattern.
- **REWRITE INSTRUCTION**: at v3's creation, collapse v2's Version History into a single dated v3 entry
  summarizing the v1→v2 arc (with a pointer to `SKILL_V2_CONSOLIDATION_HANDOFF.md` and this document for
  full detail) plus a fresh v3 entry describing this rewrite — do not carry forward the full multi-pass
  narrative inline.
- **ACCEPTANCE CRITERIA**: every fact currently in v2 §14 that is cited elsewhere in the file (e.g. the
  visibility-filter safeguard restoration) remains independently statable from the *rule* that cites it,
  not only from the history entry — confirm before deleting any history detail that no live rule's
  justification depends on that specific sentence surviving inline.

### CH-12 — Portability restructuring of §5
- **TYPE**: REORGANIZE (wording discipline, not content change)
- **CURRENT V2 BEHAVIOR**: §5's Core Invariants interleave general principle and Study-Archive-specific
  instance in the same sentences (e.g. File Ownership as the sharpest current instance of a general
  row-level-invariant principle).
- **EMPIRICAL PRESSURE**: §13 of this document — the task's own portability mandate; no incident, a
  design requirement stated directly by the task.
- **V3 DESIGN DECISION**: state each invariant's general principle first; tag the Study-Archive concrete
  instance explicitly ("concrete instance in this project: …") rather than leaving it indistinguishable.
- **SAFETY IMPACT**: none — wording only, no rule's substance changes.
- **TOKEN/CONTEXT IMPACT**: roughly neutral; may add a few words per invariant for the explicit tag.
- **REWRITE INSTRUCTION**: apply the principle/instance split across §5.1–§5.4; leave §13 untouched
  (already correctly isolated as pure Category B).
- **ACCEPTANCE CRITERIA**: every §5 invariant's normative sentence readable and enforceable without any
  Study-Archive-specific noun; every Study-Archive-specific noun that remains is inside an explicitly
  tagged provenance note.

### CH-13 — Cross-reference STOP conditions to Scoped Amendment route
- **TYPE**: CLARIFY (§11)
- **CURRENT V2 BEHAVIOR**: §11 lists STOP triggers and says "report the condition, wait" but doesn't
  point to what happens next for HIGH/CRITICAL GO-gated work specifically.
- **EMPIRICAL PRESSURE**: direct consequence of CH-01 — a named route needs to be findable from the
  condition that triggers it.
- **V3 DESIGN DECISION**: one cross-reference sentence added to §11, pointing to the new §3 row.
- **SAFETY IMPACT**: none — pure navigability.
- **TOKEN/CONTEXT IMPACT**: negligible.
- **REWRITE INSTRUCTION**: add to §11's closing paragraph.
- **ACCEPTANCE CRITERIA**: cross-reference present; §11's existing STOP triggers and "wait, don't
  workaround" language unaltered.

---

## 18. Mandatory Stage-3 Process Requirement (not a Change ID — a rewrite-discipline instruction)

Stage 1's own strongest single piece of evidence about *how* a Skill rewrite fails is not about content —
it's about process: **the v1→v2 consolidation itself silently dropped four safeguards on its first
compression pass, found a fifth only via a separate, later, independently-motivated review pass** (Stage
1 §2.3, citing v2's own §14 history and the Consolidation Handoff §5's self-check). Stage 1 states
explicitly: *"a v3 rewrite pass will very likely repeat this exact failure mode unless it budgets for the
same two-pass (rewrite, then independent adversarial diff against v2) discipline v2's own history
required."*

This design specification therefore carries forward, as a **mandatory precondition for Stage 3**, not
merely a suggestion: Stage 3 must perform its own rewrite draft, then a **separate, differently-motivated
pass** — ideally a distinct session with no stake in the rewrite, per §8's own session-distinctness
principle applied reflexively to the Skill-authoring process itself (Stage 1 §13's own final row) —
performing a line-by-line diff of the v3 draft against v2, specifically hunting for silently-dropped
safeguards, before v3 is treated as final. §15's Safeguard Preservation Matrix above is the checklist
that second pass should verify against, row by row.

---

## 19. Adversarial Design Validation

| Case | Scenario | Result | Reasoning |
|---|---|---|---|
| A | P6 Finding L (within-file sibling gap) | **PASS** | CH-07's mandatory mechanism-scoped Independent Audit scope (§9.2 item 2) makes the "search by mechanism, not file" instruction standard, not session-dependent; CH-03's implementer-level within-file sweep (§3.1) also targets this at the cheaper, earlier stage. Note: this formalizes reliable *audit-stage* discovery of the same shape that was actually found — it does not claim earlier, planning-stage prevention beyond what already happened (Finding H's own success shows planning-stage review already works when the gap is a design-level one; Finding L's gap was specifically execution-detail-level, which is why audit-stage catch, not planning-stage, is the honest claim here). |
| B | P6 Findings M/N/P (untouched-file siblings) | **PASS** | CH-07's negative-space + mechanism-scoped search items directly target Shape 2; MEDIUM-tier work touching §5 still escalates to required audit via the existing, unchanged §2 trigger. |
| C | P7 `auth.php` blocker | **PASS** | The load-bearing case for this design. CH-02/CH-04 (Retirement Closure, mandatory fresh mechanism sweep pre-PoNR, owned by the executing checkpoint) and CH-08 (Phase Contract's obligation field, forcing explicit assignment rather than prose-only tracking) target it independently — either one alone would likely have caught it; both together is defense in depth. |
| D | P7b-6 STOP + Scoped Amendment | **PASS** | CH-01 formalizes exactly the mechanics already used successfully; no mechanic altered, only named — the retry-with-fresh-GO discipline that already worked is preserved verbatim (§5.2 point 3). |
| E | v1→v2 safeguard-loss recurrence risk, applied to v3's own rewrite | **PASS, contingent** | §18's mandatory two-pass Stage-3 requirement directly targets this; §15's matrix is the checklist for that second pass. This is a process requirement on Stage 3, not something this design document can itself guarantee — flagged honestly as contingent on Stage 3 actually performing the second pass, not a claim that the design alone prevents recurrence. |
| F | Ordinary LOW-risk UI/text change | **PASS** | Retirement Closure triggers only on compatibility-arc destructive retirement (§4.2); mechanism-scoped discovery escalates only for HIGH/CRITICAL or existing §2 Core-Invariant triggers (§3.1); Phase Contract fields are lightweight and meaningfully empty ("none") for a LOW change. No new ceremony reaches this case. |
| G | Future project, no RBAC/multi-tenancy | **PASS, contingent on Stage 3 fidelity to §13** | Every new mechanism (mechanism-scoped discovery, Retirement Closure, Phase Contract, claim-precision template, Scoped Amendment route, audit scope) is stated in this design in general engineering terms with no RBAC/tenant noun in any normative sentence. The risk is execution, not design: Stage 3 must actually perform CH-12's principle/instance split faithfully across §5 rather than leaving Study-Archive nouns embedded in normative text — flagged as a Stage-3 execution risk, not a gap in this specification. |

No case FAILed; two (E, G) are marked PASS-contingent rather than unconditional PASS, stated honestly per
this design's own §8 evidence-precision principle rather than overclaimed. No redesign loop was required.

---

## 20. Durable Output

This document is that output: `skills/study_archive/archive/SKILL_V3_DESIGN.md`.

Not modified by this session: `skills/study_archive/SKILL.md`, `skills/study_archive/archive/SKILL_v1.md`,
`skills/study_archive/archive/SKILL_V2_CONSOLIDATION_HANDOFF.md`,
`skills/study_archive/archive/SKILL_V3_POST_P7_ANALYSIS.md`, any `docs/P{n}_IMPLEMENTATION_PLAN.md`,
`docs/PROJECT_CONTEXT.md`, benchmark files, application code, or database/schema/live data.

---

*End of Skill v3 Design Specification. No SKILL.md rewrite was performed or is implied by this document.
Stage 3 (the actual governing-file rewrite) has not begun.*
