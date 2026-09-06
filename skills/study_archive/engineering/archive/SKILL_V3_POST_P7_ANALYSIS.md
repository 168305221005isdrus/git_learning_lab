# Skill Post-P7 Analysis — Evidence Base for a Future Skill v3

**Status of this document**: analysis/history artifact only. It is **not** governing methodology, does
not modify `skills/study_archive/SKILL.md`, and does not itself constitute Skill v3 design. It answers
one question — *how did Skill v2 actually perform under real P6/P7 use, measured against No Skill and
Skill v1?* — from primary evidence, and ends with problems and open questions, not a redesign.

**Session scope**: Stage 1 (analysis) only, per explicit instruction. Stage 2 (Skill v2 → new version
design) is out of scope and not begun by this document.

---

## 0. Sources Actually Inspected

1. `skills/study_archive/SKILL.md` (v2, 739 lines) — read in full.
2. `skills/study_archive/archive/SKILL_v1.md` (1021 lines) — read in full.
3. `skills/study_archive/archive/SKILL_V2_CONSOLIDATION_HANDOFF.md` (216 lines) — read in full.
4. `docs/P6_IMPLEMENTATION_PLAN.md` (3883 lines) — table of contents mapped in full; read in full for
   §22 (Independent Plan Review), §27 (Independent Post-Implementation Audit #1), §30 (Independent
   Post-Implementation Audit #2, through §30.8/Finding P). Not re-transcribed line-by-line here for
   §1-21/§23-26/§28-29/Addendum — those were consulted via their own summaries in §27/§30's
   independent re-derivations and via `PROJECT_CONTEXT.md`'s Phase Status narrative, which itself
   independently cites specific section numbers for every claim used below.
5. `docs/P7_IMPLEMENTATION_PLAN.md` (5310 lines) — table of contents mapped in full; read in full for
   Part XI (§86-93, the P7b-6 STOP), Part XII (§94-103, the Scoped Plan Amendment, via
   `PROJECT_CONTEXT.md`'s citation plus Part XI directly), and Part XV (§127-149, the final Independent
   P7b Audit, specifically §141-146). Other Parts consulted via `PROJECT_CONTEXT.md`'s own detailed,
   section-citing Phase Status narrative (which was itself cross-checked against the Part XI/XV primary
   text where the two overlap, and found accurate).
6. `docs/PROJECT_CONTEXT.md` (1599 lines) — read in full.
7. `docs/benchmarks/SKILL_EFFICIENCY_BENCHMARK.md` (285 lines) — read in full.
8. `docs/benchmarks/SKILL_EFFICIENCY_BENCHMARK.xlsx` — inspected directly via `openpyxl` (Python), not
   screenshotted, not guessed from the `.md` guide alone. One worksheet ("Sheet1"), 94 rows × 19
   columns, two tables: a primary three-generation table (rows 1-41: No Skill / Skill V1 / Skill V2)
   and a partial second table (rows 71-94, titled "V2") that duplicates rows 71-88 of the first table's
   V2 column exactly, then **stops being filled in** from "Owner Decisions + Detailed Planning" (P7)
   onward — those five rows show literal blank/placeholder cells (` นาที`, `%`, `%`) even though the
   *first* table already has real values for the same named steps. This is a genuine data-quality
   artifact of the workbook itself: an abandoned duplicate, not a second independent measurement.
   Flagged here, not silently resolved, per the benchmark guide's own "preserve historical measurements"
   rule (§7 of the guide) — do not treat the second table's blanks as a corroborating zero.

No P1-P5 Implementation Plan was read in full for this session — `PROJECT_CONTEXT.md` and
`skills/study_archive/archive/SKILL_v1.md`'s own revision notes (which cite specific P1-P5 sections for
every claim) were sufficient for every claim this analysis needed to make about the No-Skill/v1 eras,
consistent with the task's instruction to prefer targeted retrieval over default full reads.

---

## 1. Overall Verdict

Skill v2 **worked as designed for its one genuinely novel mechanism** — required Independent Audit for
HIGH/CRITICAL work — which is also the mechanism that caught every safety-relevant defect found during
P6 and P7 (§7). It did **not** solve, and by its own text never claimed to solve, the deeper problem
both phases actually exposed: verification that is anchored to a checkpoint's own declared file/scope
footprint will not by itself discover a same-class defect sitting in a file or code path outside that
footprint, even when the file is otherwise well-known and even when the underlying *mechanism* the Skill
already names (SKILL §5.1, §4's first heuristic) is the exact mechanism missing. P6's Finding L and P7's
`auth.php` STOP are two independent, differently-shaped instances of this same higher-level gap, five
weeks apart in project time and audited by different sessions each time. This is the central,
evidence-backed problem statement for Stage 2 (§14 below) — not a Skill v2 failure in the sense of a
missing rule (the relevant rules already existed), but a **discovery-scope** gap current process
structure does not close.

The quantitative benchmark cannot support a numeric efficiency verdict between generations: the No-Skill
and Skill-v1 eras have essentially no time/token measurements (§8). What the benchmark *can* show — and
does show cleanly — is that Skill v2's own two HIGH-risk phases were measured with much finer discipline
than anything before them, and that every named lifecycle stage in both phases has a real, non-zero
token/time cost, none of which was gratuitous relative to what it caught or proved (§9).

---

## 2. No Skill → Skill v1 → Skill v2 → P6/P7: Methodology Evolution

### 2.1 No Skill (P1, P2)

No dedicated engineering Skill existed. `PROJECT_CONTEXT.md` and `SKILL_v1.md`'s own revision notes are
the only surviving process record; the benchmark has zero time/token data for this era (all cells `-`).
Process problem being solved: none explicitly — this is the baseline. Known failure modes from this era,
per `SKILL_v1.md`'s revision notes: P1's Track A/B write-order dependency incorrectly assumed independent
(caught only in a later review, not a formal audit); P2 left a scratch database
(`study_archive_p2_verify`) behind, caught only by the independent P2 audit that — per the v2
consolidation's own disclosed citation-integrity finding — **never actually happened** (P2's own closing
lines state "No P2 Post-Implementation Audit was begun"; the defect that *was* caught, a missing
per-offering Delete handler, was self-caught by the implementing session during Checkpoint 9). This
matters for the evolution narrative: the project's own institutional memory of "P2 was independently
audited" was itself false for roughly a year of project history and had to be corrected twice — once in
the v2 Skill text (§1's citation-integrity example) and once in `PROJECT_CONTEXT.md` (five separate
locations, per SKILL v2 §14's Owner Decision + Documentation Integrity Correction pass). This is direct,
first-party evidence for why §5.4/§9's citation-integrity rule exists at all — not a hypothetical.

### 2.2 Skill v1 (built incrementally across P1-P5, hardened after P2/P3/P4 audits and one adversarial
self-audit)

v1's shape: a single fixed 12-stage lifecycle applied uniformly regardless of risk (Architecture →
Architecture Review → Owner Decisions → Implementation Plan → Plan Review → Operational Readiness →
Pre-Execution Gate → Explicit GO → Implementation → Regression → Execution Record → Phase Complete), 22
numbered sections, and a ~250-line append-only Revision Notes log recording every incident that produced
a rule change. Genuine defects it closed, each with a named incident: the visibility-filter-must-use-
the-shared-function rule (repeated bug class, most-cited invariant in the whole project); the
try/catch-around-FK-referencing-writes rule (recurred twice — pre-P1 in `file_management.php`, then
again in P3's `curriculum_management.php`, which is exactly why v1 generalized it into a standing rule
rather than treating the second occurrence as a one-off); scratch-resource lifecycle tracking (from the
P2 orphaned scratch DB); diff-over-mtime evidence preference (from P4's audit finding stronger evidence
after weaker evidence had already been reported as sufficient); the two-stage-GO pattern (from P5's
real, organic admin-exposure gap, which no adversarial test suite had constructed).

v1's own revision notes explicitly *declined* to formalize "independent audit" as a lifecycle stage
after the P2 hardening pass — reasoning at the time: the P2 audit was "a Project-Owner-commissioned
review outside the normal phase flow, not a step every phase must schedule." This decision is directly
falsified by the accumulating evidence across P2 (implementer self-caught, no real audit ever occurred
despite the false institutional memory that one had), P3 (independent audit caught a live PDOException
stack-trace leak the implementer missed), and P5 (independent audit caught documentation-quality
findings the implementer's own five sessions had all missed) — this is the single most consequential
lesson the v2 consolidation drew from v1's history (§7 of the consolidation handoff), and P6/P7 (§7
below) provide two more, larger data points confirming the reversal was correct.

Remaining unsolved failure modes at the end of v1: no formal risk tiering (a comment fix and a schema
migration nominally moved through the same 12-stage track, though in practice v1 phases folded stages
together for small work — an informal, undocumented escape valve, not a designed one); heavy
per-revision narrative bloat (250 lines of incident history, each phase's own plan documents also
repeating baseline facts verbatim across sections — explicitly named as the single richest waste source
in the consolidation handoff's efficiency estimate, §8 of that document); no explicit troubleshooting
loop (heuristics existed only as scattered incident footnotes, not a named process).

### 2.3 Skill v2 (2026-08-17 consolidation + same-day Independent Review + Owner Decision correction
pass, later a housekeeping relocation)

New complexity/ceremony introduced, each traceable to a named v1 gap: §2 Risk Classification + §3
Lifecycle Router (replaces one fixed track with four risk tiers and a ten-row work-class table); §4
Investigation/Troubleshooting Loop (eleven heuristics promoted from scattered footnotes to a named,
reusable process); §8 Independent Review Policy, promoted from "explicitly declined" in v1 to
**required** for HIGH/CRITICAL (the policy reversal named above); §7.5 Evidence Strength & Reuse and
§7.6 Token/Context Efficiency, split into explicit named subsections specifically to give "cite, don't
re-narrate" a citable rule rather than relying on habit; §12's delta-reporting ("unchanged since §N").

What v1 content survived unchanged: every Core Invariant (§5.1-§5.4 in v2, §11-§17 in v1), the full
per-checkpoint Change Execution Protocol (§6), Backup/Rehearsal/Live-Re-Scan/Regression discipline
(§7.1-§7.4), STOP Conditions (§11), and the Completion Report Standard (§12) — all "Retained" per the
consolidation handoff's own old-vs-new coverage table, not weakened.

**What the consolidation itself got wrong, self-disclosed, not silently fixed**: the handoff document
records that a first compression draft had *silently dropped* four real safeguards (no-DDL-during-
planning's explicit statement + GO-loophole closure; the atomic-swap written-proof requirement; read-
before-write cutover ordering; the Token-Efficiency hard limit, weakened by being folded too thinly into
another section) before a self-check caught and restored all four. The document explicitly flags this as
evidence "there could be a fifth" and asks the independent reviewer to look harder. The subsequent
Independent Review pass (same v2 Version History, §14) did find a fifth: the visibility-filter-via-
shared-function rule, the single most-repeated bug class in the whole project's history, had been
silently dropped and had to be restored. **This is the strongest single piece of evidence in this
project's history that a compression/consolidation pass is itself a distinct hazard class** — every
generation of this Skill, including the one meant to fix v1's bloat, has independently demonstrated that
compressing safety rules silently drops some of them, caught only by a second, differently-motivated
pass. This is directly relevant to Stage 2: **a v3 rewrite pass will very likely repeat this exact
failure mode unless it budgets for the same two-pass (rewrite, then independent adversarial diff against
v2) discipline v2's own history required.**

### 2.4 v2 in empirical use (P6, P7) — summary; full forensic detail in §5, §6

Both phases used the full HIGH/CRITICAL lifecycle: Initial Planning → Owner Decisions/Detailed Planning
→ Independent Plan Review → Operational Readiness → Pre-Execution Gate → Owner GO → Implementation →
Regression → Independent Post-Implementation Audit. Both required at least one bounded Plan Amendment
mid-lifecycle after a HIGH-severity gap surfaced (P6: Finding H mid-Independent-Plan-Review, then
Findings L/M/N/O post-Implementation-Audit; P7: the `auth.php` STOP immediately before the DROP). Both
required a **second**, separately-staffed Independent Audit after remediation before Phase Complete
(P6: session 10; P7: no second full audit was needed since the audit that found the STOP-worthy gap was
itself pre-DDL — but P7b did get its own dedicated post-Implementation Independent Audit, session 12,
which found one more disclosed-but-non-blocking finding even after the STOP/Amendment cycle had already
closed the blocking one). Neither phase evidences that v2's structural changes (risk tiers, lifecycle
router) *caused* a defect or a missed check — every miss in both phases traces to **discovery scope**,
not to a misclassified risk tier or a skipped lifecycle stage (§13's taxonomy formalizes this).

---

## 3. Testing V2's Original Predictions (from `SKILL_V2_CONSOLIDATION_HANDOFF.md`)

| Prediction | Classification | Evidence |
|---|---|---|
| Independent Audit required for HIGH/CRITICAL is the single highest-leverage change, evidenced by P2/P3/P5's history | **CONFIRMED, strongly** | P6's first Independent Audit (§27) found the phase's only HIGH-severity live-exploitable defect (Finding L), missed by 7 implementation checkpoints, the Independent Plan Review, and two Operational Readiness rehearsals. P7's equivalent discovery point (the `auth.php` STOP) was found by the GO's own mandated fresh dependency re-check — the same *kind* of independent, adversarial-minded re-verification the audit policy formalizes — not by any of the five prior P7b sessions' own scoped verification. The final P7b Independent Audit (session 12) found a further, real evidence-precision defect (the "byte-identical" overstatement, §7 below) that two prior *audited* sessions had both missed. Three-for-three: every genuinely independent, adversarially-scoped re-verification pass in P6/P7 found something the narrower, checkpoint-scoped verification before it did not. |
| Risk-adaptive lifecycle routing (§2/§3) will route work correctly without being gameable by under-description | **CONFIRMED for HIGH/CRITICAL; UNTESTED for the gaming concern specifically** | Both P6 (multi-tenant, schema-adjacent RBAC surfaces) and P7 (schema DDL retiring a legacy RBAC-adjacent column) were correctly classified HIGH from the outset and routed through the full lifecycle including two-audit cycles when warranted. No instance in P6/P7 shows a task being under-described to escape a heavier tier — but no adversarial/bad-faith test of this was performed either; the consolidation handoff's own uncertainty #6 (whether the escalation triggers are sufficient guardrails against gaming) remains untested by real evidence, only by the absence of a counterexample. |
| Evidence reuse / delta reporting ("unchanged since §N") will reduce token cost for multi-session phases | **PARTIALLY CONFIRMED, qualitatively; not measurable from this dataset** | P6 and P7's own text repeatedly cite prior sections rather than re-deriving ("cited not re-run" language appears throughout both plans, e.g. P7a Pre-Execution Gate §36 explicitly reuses §29.2's rehearsal evidence "SKILL §7.5 — stronger evidence than repeating an already-verified restore"). The benchmark cannot quantify the saving because Skill-v1-era phases (the only would-be comparison baseline) have no token measurements recorded (§8). The qualitative pattern (citation instead of renarration) is visibly present and matches the consolidation's intent; the *magnitude* of the saving is not something this dataset can prove. |
| Troubleshooting intelligence (§4) will be actionable, not just descriptive | **CONFIRMED** | P6's audit explicitly invokes §4's "check the general mechanism, not just the common trigger" heuristic by name to explain *why* Finding L was missed (upload_file was checked, update_file — same mechanism, different trigger — was not, §27.6). P7's STOP explicitly frames its own root cause the same way (a characterization correct for each checkpoint's own scope, wrong for the one that actually needed it closed). The heuristics are being cited as live diagnostic tools mid-audit, not merely recited. |
| Independent-Audit-Required policy reversal risk of adding audit ceremony without matching value | **DISPROVEN as a risk** — value was real and repeated, not ceremonial | See row 1. Every audit in P6/P7 found something real; none was a rubber stamp. |
| Two-stage GO pattern generalizes beyond RBAC | **STILL UNTESTED for a genuinely non-RBAC HIGH-risk cutover** (the handoff's own named test case: "a future storage-backend migration") | P7b's own shape (reversible rollout → real organic-exposure stability gate → separately-GO'd irreversible DROP) is a close structural cousin of the two-stage-GO pattern and reused its "criterion-driven stable-usage gate over an arbitrary day-count" reasoning successfully — but `users.role` is itself an RBAC-adjacent legacy column, so this is not the non-RBAC test case the handoff specifically flagged as open. No non-RBAC HIGH-risk cutover has occurred in this project's history yet. |
| Consolidation itself would not silently reintroduce v1-class bloat | **PARTIALLY CONFIRMED / minor recurrence noted** | v2's Version History (§14) — meant to be a "compact pointer" replacing v1's 250-line append-only revision log — has itself grown to roughly 95 lines through three post-consolidation correction passes (Independent Review, Owner Decision correction, artifact housekeeping), each individually justified and evidence-backed, but the *pattern* (a methodology document's own append-only history section growing indefinitely) is the same pattern v1 exhibited, just starting from a smaller base. Not yet bloat by v1's standard, but the trend is the same shape. |
| Citation integrity rule closes the "unresolvable citation" class of error | **CONFIRMED, and the rule caught its own founding example** | The rule's own worked example (the false "P2 Post-Implementation Audit" citation) was found and is now correctly disclosed everywhere it was cited. The rule was tested again in P7b's own final audit, which used the identical mechanism (SKILL §1) to correct Part VII's/Part XIV's own "byte-identical" overstatement (§7 below) — the rule is being actively applied by later sessions, not just stated. |
| Source/citation integrity generally, and consolidation-vs-safeguard-loss risk | **CONFIRMED as a real, recurring risk class**, not merely theoretical | Both v2's own consolidation (four safeguards silently dropped, a fifth found only by independent review) and, at smaller scale, individual audit claims within P6/P7 ("byte-identical," "93/93 proves comprehensive tenant correctness") show the same underlying failure shape: a true, narrower claim getting reported or remembered as a broader, stronger one. |
| Avoiding append-only Skill bloat | **PARTIALLY CONFIRMED** — see the Version History note above; real but modest recurrence | |

---

## 4. Reconstructing the Methodology Evolution — Summary Table

| Generation | Process problem targeted | Major change | Prior failure modes closed | Failure modes still open | New cost/ceremony introduced | Evidence basis |
|---|---|---|---|---|---|---|
| No Skill (P1/P2) | none (baseline) | — | — | Write-order dependency blindness; false institutional memory of an audit that never happened; orphaned scratch resources | none | `PROJECT_CONTEXT.md`, `SKILL_v1.md` revision notes |
| Skill v1 (P1-P5) | codify recurring incidents as standing rules | Fixed 12-stage lifecycle, 22 sections, append-only revision log | Visibility-filter omission (once fixed, recurred zero times after); FK-write exception leaks (recurred once even after a first fix, closed by generalizing the rule); scratch-resource loss; weak (mtime) evidence habits | No risk tiering (uniform ceremony); independent audit explicitly declined as a formal stage even after evidence it catches real defects; heavy narrative repetition | 250-line revision log; full lifecycle even for small work (informally shortcut, not designed for) | `SKILL_v1.md` in full |
| Skill v2 (consolidation) | risk-proportionate process; stop the append-only bloat; formalize what v1's own evidence already justified | Risk tiers + lifecycle router; required-audit reversal; troubleshooting loop; evidence-reuse/delta-reporting rules | v1's declined-audit gap (now required for HIGH/CRITICAL); narrative-repetition waste (named "cite, don't re-narrate" rule) | Compression itself silently drops safeguards (self-demonstrated twice in one consolidation cycle); no lived evidence yet at time of writing (explicitly disclosed as untested) | New §2-§4/§8 structure; version history already regrowing | `SKILL_V2_CONSOLIDATION_HANDOFF.md`, v2 §14 |
| v2 in P6/P7 (empirical) | — (first and second real tests) | none to the Skill itself (SKILL.md was not touched by P6/P7 work) | Confirmed the audit-required reversal's value twice more, independently, at larger scale than P2-P5 combined | **Discovery-scope gap**: checkpoint-anchored verification does not reliably find a same-mechanism defect in an unexamined sibling file/path; **evidence-strength imprecision**: "byte-identical"/"93/93 proves X" overclaiming recurs even inside independently-audited work | Two full audit-remediate-reaudit cycles (P6); one STOP-amend-reGO cycle (P7b) — both real, both found real problems, neither was ceremony | P6 §22/§27/§28-30; P7 Parts XI-XV; `PROJECT_CONTEXT.md` |

---

## 5. P6 Forensic Methodology Analysis

### 5.1 What was prevented before implementation

The Independent Plan Review (session 3, §22) found and fixed **Finding H** (a `system_admin`-tier crash
on `subjects.php`'s Add-Subject form via a NULL-bound `university_id`) before any Operational Readiness
rehearsal began — this is a genuine **prevention**, category A/B boundary: the underlying rule (§5.1's
no-raw-exceptions mandate, §5.3's tenant-resolution invariant) already existed; the *plan itself* had a
design gap the rule didn't automatically catch because the rule requires someone to actually trace the
`system_admin` (unrestricted, `university_id=null`) code path through to the write, which none of the
prior sessions had done for this specific tier. Classified: **C (discovery-scope gap in planning
review's own predecessor sessions), closed by C's own remedy (an independent plan review, done
correctly)**.

### 5.2 What was found only during Independent Audit (not preventable earlier by evidence in this
project's own history)

**Finding L** (HIGH — `update_file`'s missing tenant-scope check) is the central forensic artifact of P6.
It was not found by: 7 implementation checkpoints' own design and self-verification; the Independent Plan
Review (session 3, which adversarially re-checked all 7 checkpoints line-by-line); two Operational
Readiness rehearsals (§23 original 41-row matrix, §24's targeted 19-row extension); the Pre-Execution
Gate; or Implementation's own 93/93 adversarial regression proof. It was found only by the first
Independent Post-Implementation Audit's own scratch rehearsal, built with a genuinely independent
synthetic University-B topology and a mandate (per the task instructions governing that audit session,
quoted in §27.5/§27.6) to search by *mechanism*, not by *file*.

**Why extensive planning + rehearsal + regression still let this through**: `update_file` sits in
`admin/file_management.php`, a file P6-4 *did* declare as in-scope and *did* modify (the listing query
got P6-4's tenant filter). Every prior session's search was anchored to "what does P6-4 change" — the
listing — not to "what else does this file's write-surface do that the same underlying invariant
applies to." `upload_file`, in the same file, already had the correct scope check (a pre-P6, P5-9-era
pattern); `update_file` did not. The gap is a **sibling write handler in an already-touched file**, not
an untouched file and not an unexamined risk class — the specific mechanism (verify the actor's scope
covers the *target* Offering before writing it) was already a proven, precedented pattern *in the same
file*, just not applied consistently within it.

**Testing the hypothesis** ("changed-file-centered verification is insufficient when a phase activates
a system-wide invariant, because sibling surfaces may exist outside the declared modification
footprint"): **partially confirmed, but needs refinement — the evidence shows something narrower and
more specific than the hypothesis as stated.** Finding L was *inside* the declared footprint at the
file level (`admin/file_management.php` was named and touched by P6-4) but *outside* it at the
handler/mechanism level (`update_file` vs. `upload_file`). Findings M/N, by contrast, *were* genuinely
outside the declared file footprint entirely (`admin/curriculum_management.php` was never touched by
any P6 checkpoint). So the project's evidence actually supports **two distinct discovery-scope failure
shapes**, not one:
- **Shape 1 (Finding L)**: verification scoped to "what does this checkpoint change" inside an
  already-touched file, missing a sibling handler in the same file that the same invariant applies to.
  This is a **within-file mechanism-scope gap**.
- **Shape 2 (Findings M/N, and P7's `auth.php`)**: verification scoped to the checkpoints' own declared
  file list entirely, missing a file never named by any checkpoint at all, where the *same underlying
  invariant or dependency* nonetheless applies. This is a **whole-codebase mechanism-scope gap** — the
  hypothesis as originally stated describes this shape well, not Shape 1.

Both shapes share a root cause: verification (rehearsal, matrix design, regression) is organized around
**"what did we change,"** while the defects found were organized around **"what does the invariant
apply to."** A file-footprint-anchored verification strategy structurally cannot find either shape
reliably, because the footprint is defined by the diff, not by the invariant's true reach. This
refinement matters for Stage 2: a fix aimed only at "search outside the changed-file footprint" would
have caught Shape 2 (Findings M/N, `auth.php`) but not Shape 1 (Finding L, which *was* inside the
footprint) — Stage 2 needs a mechanism-scoped search concept, not merely a wider-file-scoped one.

**Classification (§13's taxonomy)**: Finding L, M, N — **C, Discovery-Scope Gap**. The relevant Skill
rule already existed (§4's first heuristic, §5.1's shared-visibility-function mandate) and was not
weakened or missing; what was missing was a *process* step that forces verification to enumerate every
site the invariant applies to, independent of the checkpoint's own declared footprint. Finding H — **B,
Application Gap caught by its own remedy** (Independent Plan Review functioning exactly as designed).
Finding O — **A/D boundary**: partly a genuine methodology gap (no rule requires a new feature's written
behavior — "Disable" — to be checked against what it actually does at runtime) and partly an
evidence-claim gap (the checkpoint's own text promised "Disable" without the plan ever specifying what
that should functionally mean, an Owner Decision gap per §9, not flagged as one at Detailed Planning
time).

### 5.3 Finding P — the limits of even a second, independently-built audit

Session 10's own fresh, independently-built scratch topology (explicitly *not* reusing session 9's
rehearsal) still found one more instance of the identical bug class (`admin/role_management.php`'s
unfiltered dropdowns) — a file that had never been touched by any P6 checkpoint or by the L/M/N/O
remediation, found only because session 10's task explicitly instructed a mechanism-based sweep ("grep
the full codebase for every unconditional SELECT ... FROM (universities|faculties|departments|users)"),
not a footprint-based one. This is the single strongest piece of evidence in the whole P6/P7 record for
**why a mechanism-based sweep, not a footprint-based one, is what actually closes this gap class** —
when the second audit was instructed to search by mechanism, it found the residual instance; every
prior session (which searched by footprint) had missed it, including the L/M/N/O remediation which
*was* explicitly designed to close "the same bug class" but only checked the specific files already
named by the four findings it was fixing.

---

## 6. P7 Forensic Methodology Analysis

### 6.1 Which v2 safeguards demonstrably prevented a serious live failure

Two, concretely: (1) **the two-stage-GO-shaped stability gate** (OD-P7-2's seven-item criterion-driven
gate, item 7 specifically) genuinely blocked P7b-6 from being requested until real organic admin
exposure occurred — not a formality, since Operational Readiness (§30-33) explicitly found item 7
"structurally unsatisfiable at this stage" and refused to treat any synthetic/rehearsed exposure as a
substitute; this is v1's own P5 lesson (real usage is different evidence than adversarial-authored
tests) correctly generalized and re-applied to a second, unrelated retirement. (2) **The GO's own
mandated fresh pre-execution dependency re-check** (SKILL §7.3's Live Re-Scan, explicitly required
immediately before a GO-gated irreversible step) is what surfaced the `auth.php` gap — had P7b-6 been
executed as a single atomic step without that mandated fresh re-check (i.e., under a lighter process
than SKILL §3's HIGH-tier row requires), the DROP would have run with the gap live, breaking every
authenticated page in the application on the next request.

### 6.2 Was the P7b-6 STOP a methodology success, methodology failure, or both, at different layers

**Both, cleanly separable by layer.** At the **process layer**, this is an unambiguous success: the STOP
mechanism (SKILL §11) worked exactly as designed — a required fresh re-check found a real,
application-breaking gap immediately before an irreversible step, and the session stopped rather than
improvising a fix under a scope-narrow GO, exactly per that GO's own explicit instruction not to
silently remediate outside P7b-6's bounded scope. Escalating this as a Scoped Plan Amendment, rehearsing
it, and requiring a fresh separate GO before retrying is precisely the discipline SKILL §6/§9 already
demand for any newly-discovered issue. At the **planning layer**, this is a genuine, real gap: five
prior P7b sessions (Initial Planning, Independent Plan Review, Operational Readiness, P7b-4, P7b-5) each
correctly tracked `auth.php:37` as a live "reader" site and each correctly judged it non-blocking *for
their own checkpoint's own scope* — but none of them asked the one question that mattered for the
checkpoint that actually needed it answered: "is this SELECT still safe once the column is actually
gone?" That question is checkpoint-P7b-6-specific and was never assigned to any checkpoint's own
`Files/schema objects` field, including P7b-6's own (which named only "users table — drops the role
column only").

### 6.3 Why `auth.php` survived five prior stages before becoming blocking immediately before DROP

Because every one of those five stages was asking a **locally correct but differently-scoped** question.
Initial Planning and the Independent Plan Review were asking "does anything read this column" (yes,
`auth.php`, correctly tracked) and "is that a problem for the checkpoint I'm reviewing right now" (no,
not yet — P7b-3 hadn't cut the display sites over, so `auth.php`'s read was still load-bearing at that
point; later, P7b-4/P7b-5 correctly noted it as "compatibility-only" once the display sites moved, since
a SELECT naming a still-*existing* column is genuinely harmless). The question that was never asked by
any of the five is checkpoint-relative in a way none of the "Files/schema objects" fields captured:
*which checkpoint is the one where this specific reference stops being safe, and does that checkpoint's
own declared scope include it.* This is the same underlying shape as P6's Finding L/M/N (Shape 2 from
§5.2 above) — a dependency correctly tracked in the abstract, never assigned ownership by the one
checkpoint whose action actually activates the risk.

### 6.4 Dependency-type lenses (used only as analytical tools, not proposed terminology)

- **Behavioral dependency**: `auth.php`'s SELECT behaves differently (crashes) only after the DROP —
  before that, its behavior is unaffected by the column's presence beyond fetching an unused value.
- **Semantic dependency**: none of `auth.php`'s downstream code ever reads the fetched `role` value
  (confirmed exhaustively, §79/§85/§87) — the *column reference* is a syntactic artifact with zero
  remaining semantic use, which is exactly why the fix is "zero behavior change."
- **Syntactic dependency**: the literal presence of the column name `role` in a `SELECT`'s column list —
  this is the actual failure mode (MariaDB errors on an unknown column name), independent of whether the
  value is ever used afterward.
- **Schema-object dependency**: the FK/constraint-level dependencies (none found for `users.role` beyond
  the column itself — no FK references it, confirmed by the pre-drop dependency scans).
- **Compatibility-only dependency**: every P7b-4/P7b-5 session's own characterization of `auth.php` —
  correct in that no downstream *semantic* dependency remained, but this label itself is what let the
  *syntactic* dependency slide as "non-blocking" for four consecutive sessions, because "compatibility-
  only" reads as "safe to ignore" rather than "safe to ignore **only until the column itself is
  physically removed**."
- **Runtime dependency**: `require_login()`'s universal call-site reach (every authenticated page) is
  what turns a single-line syntactic dependency into an application-wide blast radius — this is the
  scope-of-impact multiplier, not the dependency itself.

The evidence shows the project's actual gap was conflating **compatibility-only** (safe indefinitely)
with **syntactic-dependency-that-becomes-fatal-at-a-specific-future-step** (safe only until that step).
A vocabulary that forced these two apart explicitly — "this reference has zero semantic dependency but
remains a syntactic blocker until schema step X" — would likely have surfaced the gap earlier, at
P7b-3 (when the semantic dependency was actually severed) rather than at P7b-6's own GO.

### 6.5 Does the evidence show a missing concept around destructive-retirement dependency closure

**Yes, directly.** P6's Finding L and P7's `auth.php` STOP are two independent phases, five weeks apart,
each producing a HIGH-severity gap that survived multiple planning/review/rehearsal stages and was
caught only immediately before or during the phase's own most consequential step (an irreversible
write-path exposure in P6's case; an irreversible schema DROP in P7's case). Neither gap was a
misclassified risk tier, a skipped lifecycle stage, or a missing named rule — both were **discovery-
scope** gaps in what each stage's own verification chose to examine. This is strong, repeated,
cross-phase evidence (not a single incident) that a **named dependency-closure gate specific to
destructive/irreversible retirement** — one that forces an explicit, mechanism-based (not file-list-
based) sweep for every remaining reference to the thing being retired, run fresh immediately before the
irreversible step — would have caught both. SKILL v2 already gestures at this (§7.3's Live Re-Scan,
§6's Point-of-No-Return analysis) but neither names "prove zero remaining dependency of every kind,
enumerated by mechanism" as its own explicit, closure-shaped verification target; both P6 and P7's actual
catches happened through mandated *re-checks* that happened to be thorough, not through a named process
step that structurally guarantees that thoroughness.

### 6.6 STOP → Scoped Plan Amendment → Fresh verification → Fresh explicit GO → Retry: does this route
already exist in v2, and how well

**It exists only implicitly, through precedent, not as a named lifecycle-router row.** SKILL v2 §3's
work-class table has ten rows; none is titled "Scoped Plan Amendment." The pattern is real and was used
independently at least **four** separate times across P6/P7, each time reconstructing the same shape
from first principles rather than following a named route: P6 §22.4 (Independent Plan Review remediating
a bounded finding in place — permitted per §3's "an Independent Plan Review may remediate an unambiguous,
bounded planning-document defect in place"); P6 §24 (a full Bounded Plan Amendment session, its own
numbered part of the document); P6 §28-29 (the Findings L/M/N/O remediation, explicitly modeled on §24's
own precedent, per its own text: "mirroring how §22.4 and §24 each handled their own just-found
HIGH/security findings"); and P7's Part XII (the `auth.php` amendment, explicitly citing "this project's
own precedent (P6 Findings L/M/N/O)" as its own justification for the shape it took). Each of these four
instances independently reconstructs the same skeleton: diagnose in the plan document → rehearse fresh
in scratch → regression-gate → apply → (for HIGH/security findings) require a **fresh, separate**
Independent Audit before Phase Complete. The consistency across four independently-executed instances,
each citing the previous one as precedent rather than a shared named rule, is itself the evidence that
this has become a **de facto standing route** without ever being **formalized** as one — exactly the
"exists only implicitly" case. Given four clean, independently-successful executions of the identical
shape, the evidence supports Stage 2 formalizing it as an explicit lifecycle-router row — not because
the informal version failed (it didn't, in any of the four instances), but because a named route would
save each future instance from re-deriving its own shape from precedent-citation alone, which is itself
a token cost this analysis's benchmark section (§8) shows is non-trivial (each of these four sessions
carried real token/time cost, §8).

---

## 7. Pre-Point-of-No-Return Analysis

Comparing P7b-6 (the DROP) against ordinary P7a migration work: P7a's own two DDL steps (dropping
`files.subject_id` and `subjects.academic_year`/`semester`) went through the identical lifecycle
(Independent Plan Review → Operational Readiness with rehearsal → Pre-Execution Gate → GO →
Implementation → Independent Audit) and produced **zero** STOP events — both were found, live, and
independently audited clean on the first pass. P7b-6 is schema-identical in *kind* (a DDL column drop)
but differs in exactly the dimension that produced the STOP: `users.role` was a **compatibility-adjacent**
column with a five-checkpoint-long retirement arc (P7b-1 through P7b-5) behind it, each of which had its
own "is this still safe" question to answer, whereas P7a's two retirement candidates had **no** live
compatibility arc — they were cut over and dropped inside a single, tightly-scoped sub-phase with no
intervening checkpoints that could each independently, locally-correctly, judge a dependency as
"not my problem yet."

This directly supports the case that **destructive retirement following a multi-checkpoint compatibility
arc needs a stronger closure discipline than an ordinary HIGH-risk migration with no such arc** — not
because the DDL itself is more dangerous, but because the **number of prior sessions that could each
correctly, locally judge a dependency non-blocking (and therefore never re-examine it) grows with the
length of the arc.** P7a's short arc gave this failure mode no room to occur; P7b's five-checkpoint arc
did.

The evidence justifies Stage 2 exploring a concept that, before a destructive/irreversible retirement
step specifically, requires proving closure across the full list the task instructions specify (readers,
writers, authorization logic, display/filter logic, explicit column lists, wildcard queries, schema
assumptions, FK/index dependencies, runtime call chains, compatibility code, documentation claims) —
**by mechanism, not by the retiring checkpoint's own declared file list** — as its own named, explicit
verification target distinct from an ordinary HIGH-risk migration's regression gate. P7's own actual
practice (the whole-codebase categorized dependency re-scan performed at P7b-5, P7b-6's attempt, the
Amendment, P7b-7, and the final audit — five separate full-codebase sweeps across the tail of P7b alone)
already approximates this informally and expensively (§8 quantifies the cost); formalizing it as a single
named gate could plausibly reduce the number of times it needs to be fully re-derived from scratch, while
keeping the one instance that matters (immediately pre-DDL) mandatory.

---

## 8. Evidence Quality / Claim Precision

### 8.1 The "byte-identical" finding — isolated wording mistake or a recurring pattern?

**A recurring pattern, not an isolated mistake — this project's evidence shows at least three separate
instances of the same shape.** (1) P6's 93/93 regression proof: accurate for what it measured
(zero-regression for real single-tenant accounts) but flagged by the first Independent Audit (§27.10) as
liable to be over-read as proof of "comprehensive tenant-boundary correctness," which it never was and
never claimed to be, but which "93/93 passed" as a bare headline number invites. (2) The v2 consolidation
itself: "four safeguards restored" read, before the independent review, as "the consolidation is
complete and faithful" — a narrower claim (four *known* gaps closed) stood in for a broader one (no gaps
remain) until a fifth was found. (3) P7's "byte-identical" / "zero mismatch" schema.sql claims: Part VII
(P7a's audit) and Part XIV (P7b-7) both genuinely ran a scratch-restore diff and both genuinely found
zero mismatch **by the specific comparison method each happened to use** — but the final Independent
Audit (session 12, §141) ran a raw-text `SHOW CREATE TABLE` diff (not a normalized/structural one) and
found 2 of 20 tables differ in key-declaration order, a difference invisible to a structural-equivalence
comparison but present in a literal byte comparison. Both prior sessions' verification was genuine, not
fabricated — the imprecision is in the **word chosen to describe the result**, not in the underlying
check.

### 8.2 Would Stage 2 benefit from defining evidence-strength semantics more precisely

**Yes, directly supported by the pattern above.** All three instances share the same shape: a true,
narrower, method-specific claim ("zero mismatch under the comparison method I used," "zero regression
for the accounts I tested," "the four gaps I found are fixed") gets reported using language that reads
as a broader, method-independent claim ("byte-identical," "comprehensively correct," "the consolidation
is faithful"). SKILL v2 already has the raw material for this (§7.5's evidence-strength preference:
diff beats mtime, executing beats reasoning) but does not yet name the **reporting** discipline this
project's evidence shows is the actual gap — not "which check did you run" (that part is already well
covered) but "what specific claim does the check you ran actually support, phrased narrowly enough that
a reader can't over-read it." The evidence justifies exploring named equivalence levels (e.g.
structurally-equivalent vs. byte-identical vs. behaviorally-equivalent, as the task's own vocabulary
already suggests) as a Stage 2 concept — not inventing new categories with no basis, but naming the
distinction this project's own three incidents already independently demonstrate matters.

---

## 9. Quantitative Token / Time / Cycle Analysis

### 9.1 What the dataset can and cannot support

**The No-Skill (P1/P2) and Skill-v1 (P3-P5) eras have essentially no time/token measurements** — every
cell in those two column-groups is `-` except: `P3 remediation` (32% remaining), `P4 Operational
Readiness` (5% remaining), `P4 Independent Audit` (80% remaining), `P5 Gate PASS` (69% remaining), and
the P5b tail (six rows, `~11%`/`~6%`/`~12%`/`~2%`/`~6%`/`~13%` **used**, explicitly marked approximate).
**No elapsed-time value exists anywhere in the No-Skill or Skill-v1 columns.** This means: **any claim
of the form "Skill v2 is faster/cheaper than Skill v1" is an UNSUPPORTED CLAIM** — the dataset
structurally cannot support a time or token comparison across those generations, only a qualitative
process comparison (§2/§4 above). This is stated as plainly as the benchmark guide itself demands
(§10 of the guide, rule 9).

**Skill v2 (P6, P7) is densely and consistently measured** — every named step in the P6/P7 portion of
the table has both an elapsed-time and a token-used/token-remaining value, except two genuinely missing
measurements, both explicitly marked, not defaulted to zero: the P6 "Bounded Plan Amendment + Targeted
Rehearsal" step (marked "hit usage limit, auto-resumed" — the step spanned a retoken event and its own
cost is genuinely unrecorded) and P7b-5 ("Full Regression + Final Stability Gate 7/7 Reconfirmation,"
marked `-`/`%`/`%`, with the very next row explicitly noting "because work stopped during P7b-5" — again
a retoken event during the step itself).

### 9.2 Measured facts (internal consistency check performed by this analysis, not present in the
workbook itself)

Recomputing each token cycle's arithmetic (remaining = previous remaining − used) against the workbook's
own recorded values:
- **P6 cycle 2** (P6 Gate through the Skill-file-move housekeeping pass, 7 steps): used values sum to
  exactly 0.80, ending remaining recorded as 0.20 — **exact internal consistency**.
- **P7 cycle 2** (Owner Decisions through P7b Reversible Implementation, 7 steps): used values sum to
  0.72, recorded ending remaining 0.26 (arithmetic would predict 0.28) — a **2-percentage-point
  discrepancy**, plausibly rounding across seven successive readings.
- **P7 cycle 4** (P7b GO through P7b Independent Audit, 5 steps): used values sum to exactly 0.36,
  recorded ending remaining 0.64 — **exact internal consistency**.
- **P6 cycle 1** (Initial Planning through Operational Readiness, before the retoken): the first three
  steps reconcile exactly (0.46 → 0.32 → 0.26), but the fourth (P6 Operational Readiness, used 0.11)
  predicts a remaining of 0.15, while the workbook records "10%*" — a **5-percentage-point discrepancy**,
  larger than the P7-cycle-2 rounding gap. Both of the asterisked cells in this row-range (`26%*`,
  `10%*`) carry no explanatory note anywhere in the workbook (no cell comment, no legend found on any
  row) — their asterisk's meaning is itself undocumented. **This is disclosed as an unresolved,
  low-stakes data-quality note, not silently corrected**, per the benchmark guide's own rule against
  rewriting historical measurements.

**Total measured elapsed time**: P6's named steps with a real time value sum to roughly 157 minutes
(9+18+11+19+5+18+19+25+18+10+5, excluding the unmeasured Amendment step's own duration, which the
workbook explicitly records as unknown, not zero). P7's named steps with a real time value sum to
roughly 157 minutes as well (10+12+9+18+6+18+10+13+6+13+6+4+10+10+12, excluding P7b-5's unmeasured
duration). **These two totals are close enough in magnitude to note as a REASONABLE INFERENCE that the
two HIGH-risk phases cost roughly comparable total measured wall-clock time**, despite P7 spanning
substantially more named checkpoints (14 vs. P6's 7) and including a full STOP/Amendment cycle — this is
not a precise percentage claim (the two unmeasured steps could each be large), only an order-of-magnitude
observation.

### 9.3 Safety-per-token / verified-work-per-token

Every named P6/P7 step that consumed measurable tokens also has a documented verification/audit purpose
recorded in the corresponding plan section — none of the named steps in the benchmark is un-attributable
ceremony. The two largest single-step token costs in the whole v2 dataset are **P6 remediation reserve**
(0.21, 25 minutes) and **P6 Independent Audit#2** (0.16, 18 minutes) — both directly attributable to
fixing and re-verifying a real HIGH-severity defect (Finding L and its siblings), i.e. the highest-cost
steps are the ones that did the most safety-relevant work, not overhead. This is consistent with the
benchmark guide's own safety-per-token principle (§6 of the guide): a step that costs more but catches or
closes a real defect is high-value, not waste, and nothing in the P6/P7 data contradicts that principle.

### 9.4 Confounders explicitly acknowledged

P6 and P7 differ in technical shape (multi-tenant feature build vs. legacy-column retirement) and cannot
be compared to each other as if measuring the "same" kind of work at two efficiency levels. Both phases
benefited from durable state P1-P5 had already produced (RBAC catalog, tenant/scope machinery) that
earlier phases had to build from nothing — some of P6/P7's own relative speed (where speed can even be
measured, i.e. within v2 only) is attributable to that accumulated durable state, not to Skill v2's
process changes specifically, and this dataset cannot separate the two effects. Project documentation
maturity and the Project Owner's own prompting/workflow maturity also improved over the same period the
benchmark itself started being filled in consistently (v1-era measurement was sparse; v2-era measurement
is dense) — this is itself a confound: the *measurement discipline* improving is a separate fact from
the *underlying work* becoming more efficient, and the two are not distinguishable from this dataset
alone.

---

## 10. Ceremony vs. Safety Analysis

| Mechanism | Classification | Basis |
|---|---|---|
| Independent Post-Implementation Audit (HIGH/CRITICAL) | **ESSENTIAL** | Found the only HIGH-severity defect in P6 (Finding L) and the byte-identical overclaim in P7 (§141); a second audit found a further residual instance (Finding P) after full remediation. Three-for-three catch rate across the two phases' four total audit passes. |
| Independent Plan Review | **ESSENTIAL** | Caught Finding H (P6) before any implementation occurred — the cheapest possible point to catch a HIGH-severity design gap. |
| Operational Readiness (backup + rehearsal) | **ESSENTIAL** | P7b-6's own rehearsed rollback and P7a's rehearsed teardown are exactly what the STOP event relied on being trustworthy when it deferred execution; no incident in P6/P7 shows this step failing to justify its cost. |
| Fresh Live Re-Scan immediately before GO/execution | **ESSENTIAL** | This exact mechanism is what surfaced the `auth.php` gap — not a hypothetical value, a direct catch. |
| Stability/soak gate with a criterion-driven (not calendar) item-7-style "real organic exposure" requirement | **ESSENTIAL** | Directly reused from P5's own lesson; Operational Readiness correctly refused to treat it as satisfiable by rehearsal alone. |
| Scoped Plan Amendment (informal route, §6.6) | **VALUABLE, CANDIDATE FOR CONSOLIDATION as a named route** | Used successfully four times, each time re-deriving its own shape from precedent rather than a named rule — real value, real recurring cost from re-derivation. |
| Second Independent Audit after a HIGH-severity remediation | **ESSENTIAL** | Found Finding P — a residual, real, previously-invisible instance of the same bug class, after a full remediation pass. Removing this step would have shipped Finding P undisclosed. |
| Regression matrix / adversarial matrix design (per-phase) | **VALUABLE, INSUFFICIENT as currently scoped** | The 93/93 (P6) and 21-row (P7) matrices are real, sound evidence for what they measure, but neither structurally includes every sibling-mechanism site (§5.2's Shape 1) — valuable, but not sufficient on its own to close the discovery-scope gap this whole analysis centers on. |
| Delta reporting / "cite, don't re-narrate" (§7.5/§12) | **VALUABLE** | Visibly used throughout P6/P7's own text (e.g. P7a's Pre-Execution Gate explicitly reusing rather than re-running earlier rehearsal evidence); cannot be quantified against v1 due to missing v1 token data, but no incident shows it causing a missed check. |
| Full-tree diff against verified backup, at every audit/amendment closure | **ESSENTIAL** | Directly used to independently reconfirm exactly-declared footprints multiple times in both phases (P6 §27.2, §30.2; P7 §142); this is the mechanism that repeatedly proves "no undeclared file differs," a claim narrative self-report alone cannot support as strongly. |
| Schema-snapshot scratch-validation at phase close | **ESSENTIAL, but methodology needs the §8.2 precision fix** | Caught real drift historically (P1/P2 per v1's own revision notes) and, in P7, is exactly the mechanism that surfaced the byte-identical imprecision (§8.1) — valuable both for what it verifies and, in this instance, for exposing a claim-precision gap. |
| Completion Report Standard's 13-item structure | **NO EVIDENCE FOR CHANGE** | Present and followed consistently across every P6/P7 session; no incident traces to this structure being insufficient or excessive. |

No mechanism examined in P6/P7 is classified **INSUFFICIENT** in the sense of "existed but failed to
catch something its purpose arguably should have caught" *when judged against its own explicitly stated
scope* — the regression matrices, for instance, never claimed to prove tenant isolation (§27.10 says so
explicitly), so their not catching Finding L is not a failure of the matrix, it is evidence the matrix's
own declared scope was too narrow for what the project actually needed at that point, which is a
**design-scope** observation, not a **broken-mechanism** one.

---

## 11. Cross-Phase / Long-Lived Project Analysis

Two concrete instances in P6/P7 show the project already handling multi-phase dependency/obligation
tracking reasonably well by convention, without a named structure: (1) `users.role`'s retirement was
correctly deferred from P5 ("out of scope until P7," stated explicitly in P5's own execution record) and
correctly picked up by name in P7's own scope derivation — a five-phase-spanning obligation tracked
correctly purely through `PROJECT_CONTEXT.md`'s Phase Status narrative and each phase's own forward-
pointer text, no formal ledger. (2) P6's Findings M/N/P (bugs in files P6 never touched) were each
explicitly logged as "a standalone, non-blocking item... tracked... not part of P6's own scope and not
reopening P6's lifecycle" — informal but functioning scope discipline, later actually followed through on
(Finding P was closed by its own dedicated bounded-cleanup session, confirmed in `PROJECT_CONTEXT.md`).

Where this informality shows real strain: the `auth.php` gap (§6.3) is precisely a case where an
obligation ("this reference must be removed before the column can be dropped") was tracked in *prose*,
correctly, across five sessions, but never assigned to a specific checkpoint as that checkpoint's own
closing condition — nothing forced the question "which checkpoint's Files/schema-objects field should
this actually live in" to be asked until the checkpoint that needed the answer was already mid-GO. A
lightweight **phase/checkpoint contract concept** ("this checkpoint's completion requires: zero remaining
reference to X, verified by mechanism Y") would have given that obligation an explicit home earlier, at
no cost beyond naming it — this project's own evidence (`auth.php`, and P6's Finding-P-style
never-touched-file gaps) is a real, repeated basis for Stage 2 to explore this, not a hypothetical.

The evidence does **not** yet show large-implementation-plan-document reconstruction cost as a proven
problem: P6 (3883 lines) and P7 (5310 lines) were both navigated efficiently in this very analysis
session via targeted table-of-contents + section reads, and P7's own sessions repeatedly demonstrate
citing rather than re-reading whole documents (§9.1's delta-reporting discussion). This is a **REASONABLE
INFERENCE, not a measured fact** (this analysis session's own token cost for navigating both documents
was not separately benchmarked), but nothing in the primary evidence shows a session stalling or
re-deriving unnecessarily because a plan document was too large to navigate.

**Stage 2 exploration justified by this evidence**: a lightweight Phase/Checkpoint Contract concept
(what a checkpoint guarantees is true on its own completion, stated explicitly enough that a later,
unrelated checkpoint can cite it without re-deriving it) and a Compatibility/Retirement Ledger (a durable
list of "this exists only for legacy compatibility, owned by phase X, to be closed by phase Y" entries,
so an obligation like `auth.php`'s gets an explicit home the moment it's first identified as
compatibility-only, not five sessions later). **Not justified by current evidence**: a general-purpose
Evidence Ledger or Invariant Ownership registry as separate durable artifacts — no incident in P6/P7
traces to evidence being lost or an invariant's owner being ambiguous in a way a registry would have
prevented; `PROJECT_CONTEXT.md` and the phase plan documents already functioned as adequate evidence
carriers throughout both phases.

---

## 12. Safeguards That Must Survive (v3 must not weaken these)

| Safeguard | Skill concept | Concrete P6/P7 incident proving value | Consequence if weakened |
|---|---|---|---|
| Independent Audit required for HIGH/CRITICAL | §8 | Caught Finding L (P6), the `auth.php`-adjacent byte-identical overclaim (P7 §141), Finding P (P6, second audit) | A live-exploitable cross-tenant defect (Finding L) or an application-wide crash-on-DROP (`auth.php`) would have shipped |
| Session-distinctness for Independent Review/Audit | §8's explicit requirement | Every P6/P7 audit explicitly states "no stake in the implementation," and each independently re-derives rather than trusts prior sessions' reports — this is exactly what let session 10 find Finding P after session 9's own remediation had already "passed" its own 19/19 | A same-session or same-author "audit" would inherit the implementer's own blind spot — precisely the failure mode P2's false-audit-citation history (§2.1) already demonstrates |
| Fresh Live Re-Scan immediately before GO/execution (§7.3) | §7.3 | Directly surfaced the `auth.php` STOP | An irreversible DROP would have run with a known-fatal gap live |
| Criterion-driven, non-calendar stability/soak gate with a genuine-organic-use criterion | §3's two-stage-GO precedent | P7b's item 7 correctly blocked GO until a real admin session occurred; Operational Readiness correctly refused to fake it | Reintroduces exactly the P5-class gap this rule was built to close — a defect no adversarial test suite constructs |
| Rollback rehearsal + backup verification before any HIGH-risk step | §7.1/§7.2 | P7b-6's rehearsed rollback and P7a's rehearsed teardown gave the STOP event a safe place to halt without data risk | An unrehearsed rollback discovered broken only during a real incident |
| Full-tree diff against verified backup for footprint claims | §7.5 (stronger evidence over habitual evidence) | Repeatedly used in P6/P7 to independently reconfirm "no undeclared file differs" — caught nothing wrong in P6/P7 specifically, but is the mechanism that makes that claim trustworthy at all | A narrower/self-reported footprint claim could hide an undeclared change |
| STOP-before-improvising, scope-narrow GO discipline | §3's Emergency Rollback exception, §11 | The `auth.php` session explicitly declined to fix a one-line, obvious bug because the GO was scoped to "P7b-6 ONLY" | Scope creep under a narrow GO is exactly how an unreviewed, unrehearsed change reaches an irreversible step |
| Citation integrity (§1/§5.4/§9) | §1 | Actively used by the final P7b audit to correct two prior sessions' "byte-identical" overclaim, and by v2 itself to correct its own false P2-audit citation | Stale/false claims about what was proven compound across sessions, as the P2-audit-citation history already shows happened once for roughly a year |
| No silent remediation of security/behavioral findings (§8) | §8 | Findings L, M, N, O, P were all disclosed and left for a separate, scoped, later-audited fix — never quietly patched by the discovering session | A quietly-patched HIGH finding would never get its own required second Independent Audit |
| Scratch-resource lifecycle tracking (§7.2) | §7.2 | Every P6/P7 scratch DB, cookie jar, and scratch app copy is explicitly enumerated and confirmed torn down in every session's own completion report | Recurrence of the P2 orphaned-scratch-DB incident this rule was built to prevent |

All ten are evidence-supported by P6/P7 specifically, not merely inherited unmodified from v1 — each
line above cites a P6/P7-era incident, not only a P1-P5 one.

---

## 13. V2 Rule Failure vs. Application Failure — Classification of Every Major P6/P7 Finding

| Finding | Classification | Reasoning |
|---|---|---|
| P6 Finding H (subjects.php NULL-university_id crash) | **B — Application Gap, caught by its own remedy** | §5.1's no-raw-exception rule and §5.3's tenant-resolution rule already existed; the Independent Plan Review process (already required by §8) is what found it, functioning exactly as designed. |
| P6 Finding L (update_file missing scope check) | **C — Discovery-Scope Gap (Shape 1: within-file mechanism gap)** | The relevant rule (§5.1's shared-condition mandate, §4's mechanism-not-trigger heuristic) already existed and was even correctly applied to the sibling `upload_file` handler in the same file — no rule was missing; the verification process never asked "does every write handler in this touched file, not only the one this checkpoint's design describes, need the same check." |
| P6 Findings M, N (curriculum listing leak; unscoped dropdowns) | **C — Discovery-Scope Gap (Shape 2: whole-codebase mechanism gap)** | Files never named by any P6 checkpoint; the rule (§5.1) already existed and was correctly applied everywhere P6 itself touched; the gap is in what P6's own scope-derivation process chose to examine. |
| P6 Finding O (Disable has no effect) | **A/D boundary — Methodology Gap (unstated acceptance criterion) + Evidence-Claim Gap** | No rule requires a new feature's plain-language promise ("Disable") to be checked against an explicit, Owner-confirmed functional definition before Implementation; §14's checkpoint text made a promise §9's Owner Decision Protocol should have forced into an explicit, resolved decision but did not. |
| P6 Finding P (role_management.php unscoped dropdowns) | **C — Discovery-Scope Gap (Shape 2)**, found only when a session was explicitly instructed to search by mechanism rather than by prior-finding file list | Confirms Shape 2 is not closed merely by fixing the specific files a prior finding named — the underlying mechanism-search discipline is what closes it, and only the second audit applied that discipline broadly. |
| P6's 93/93-regression over-readability risk | **D — Evidence-Claim Gap** | The check itself was sound and its own text (§15) correctly disclaimed the broader claim; the risk is purely in how a bare number invites a reader to over-extend it. |
| P7 `auth.php` STOP | **C — Discovery-Scope Gap**, cross-checkpoint variant | §7.3's Live-Re-Scan rule already existed and is exactly what caught it; the gap is that no checkpoint's own declared scope had ever assigned this specific closure obligation to itself across five prior sessions, each locally correct. |
| P7's environmental incident (mysqld/httpd crash during the STOP session) | **E — Unavoidable/Legitimate Late Discovery** | A documented, previously-known standing environmental risk (SKILL §13) that recurred despite no methodology gap — the correct response (investigate, verify integrity via CHECK TABLE, do not assume) is exactly what the existing rule already prescribes and is exactly what happened. |
| P7's "byte-identical" schema.sql overclaim | **D — Evidence-Claim Gap** | Both prior sessions' underlying verification was genuine and thorough; the gap is purely in the word chosen to describe a method-specific result as if it were method-independent. |
| v2 consolidation's own silently-dropped safeguards (4 found in self-check, a 5th found only by independent review) | **C — Discovery-Scope Gap**, applied reflexively to the Skill-authoring process itself | The compression pass's own self-check was scoped to "does this still say what v1 said" per section, not to an independent line-by-line diff against the full v1 text — exactly the same discovery-scope shape as the code-level findings above, one meta-level up. |

No finding across either phase is forced into "methodology failure" where the evidence instead shows a
correctly-functioning process (Finding H) or a genuinely unavoidable environmental event (the mysqld
crash) — both are classified accordingly, not folded into the dominant C-pattern for narrative
convenience.

---

## 14. Change Pressure Map

| SKILL.md v2 section/concept | Classification | P6/P7 evidence basis |
|---|---|---|
| §0 Mission & Authority, priority ordering | **NO EVIDENCE FOR CHANGE** | Never in question in either phase; every STOP/GO event in P6/P7 respected this ordering without incident. |
| §1 Source-of-Truth Hierarchy + citation integrity | **KEEP AS-IS; the citation-integrity clause is validated, not merely theoretical** | Actively used by the final P7b audit to correct a real overclaim (§8.1); no gap found in the hierarchy itself. |
| §2 Risk Classification | **NO EVIDENCE FOR CHANGE** | Both phases correctly classified HIGH from the start; no misclassification incident occurred. |
| §3 Lifecycle Router | **STRENGTHEN** — add a named row for the Scoped-Plan-Amendment route (§6.6) | Used successfully four times without a named row to anchor it; each instance re-derived its own shape from precedent citation rather than a shared rule. |
| §4 Investigation/Troubleshooting Loop | **KEEP AS-IS; actively and correctly cited in both audits** | §4's mechanism-not-trigger heuristic is explicitly invoked by name to explain Finding L (§27.6) and implicitly underlies the `auth.php` STOP's own framing. |
| §5 Core Invariants | **KEEP AS-IS** | Every §5 invariant was independently reconfirmed intact at the close of both phases; no invariant needed weakening or was found ambiguous. |
| §6 Change Execution Protocol | **CANDIDATE FOR NEW CONCEPT** — a destructive-retirement-specific dependency-closure requirement (§7 above) | P6 Finding L and P7's `auth.php` STOP are two independent, cross-phase instances of the same underlying gap this section does not yet name explicitly. |
| §7.1-§7.4 (Backup/Rehearsal/Live-Re-Scan/Regression) | **KEEP AS-IS** | Directly responsible for catching the `auth.php` gap (§7.3) and for making the STOP safe to execute (§7.1/§7.2); no incident shows these mechanisms insufficient for their own stated purpose. |
| §7.5 Evidence Strength & Reuse | **STRENGTHEN** — add explicit reporting-precision guidance (§8.2) | The "byte-identical" pattern (§8.1) shows the *checking* discipline is sound but the *reporting* discipline (what claim the check actually supports) is under-specified. |
| §7.6 Token/Context Efficiency | **NO EVIDENCE FOR CHANGE, cannot be measured against v1 from this dataset** | Visibly followed in P6/P7's own text; no counter-evidence found. |
| §8 Independent Review Policy | **KEEP AS-IS — the single most validated section in the whole document** | Three-for-three catch rate across four audit passes in P6/P7 combined (§3's table, row 1). |
| §9 Evidence & Documentation Policy | **CLARIFY** — the Owner Decision Protocol's "is this genuinely ambiguous" trigger should more explicitly cover a checkpoint's own unstated functional promise (Finding O's gap) | Finding O shows a plain-language feature promise ("Disable") shipping without its own functional definition ever being forced into an explicit Owner Decision. |
| §10 Scope Discipline | **NO EVIDENCE FOR CHANGE** | P6/P7's own scope-deferral discipline (e.g. `users.role` correctly deferred P5→P7) worked without incident. |
| §11 STOP Conditions | **KEEP AS-IS** | The `auth.php` STOP is a clean, textbook execution of this section exactly as written. |
| §12 Completion Report Standard | **NO EVIDENCE FOR CHANGE** | Followed consistently, no incident traces to its structure. |
| §13 Environment Notes | **KEEP AS-IS, one incident reconfirms it** | The mysqld/httpd crash during P7b-6's attempt is exactly the standing risk this section already documents, and the correct response is exactly what this section already prescribes. |
| §14 Version History | **SIMPLIFY / bound its own growth going forward** | Already regrowing toward the append-only shape it replaced (§3's prediction-testing table); a v3 rewrite should decide a durable cap or externalize incident-level detail the way v1's own history was externalized to `SKILL_v1.md`. |
| (New) Destructive-retirement dependency-closure gate | **CANDIDATE FOR NEW CONCEPT** | §7, §5.2, §13 above — two independent cross-phase incidents. |
| (New) Phase/Checkpoint Contract concept | **CANDIDATE FOR NEW CONCEPT, lighter-weight than a full ledger** | §11 above — the `auth.php` obligation had no explicit checkpoint home for five sessions. |
| (New) Evidence-strength/equivalence vocabulary | **CANDIDATE FOR NEW CONCEPT** | §8 above — three independent instances of the same overclaim shape. |

---

## 15. Candidate V3 Problem Statement

Skill v2 successfully generalized v1's incident-driven rules into a risk-adaptive operating model and
proved, twice, at real scale, that its single largest structural bet — requiring genuinely independent
audit for HIGH/CRITICAL work — was correct: every safety-relevant defect found in P6 and P7 was found by
an independent audit or an independent-audit-mandated fresh re-check, never by the narrower,
checkpoint-scoped verification that preceded it. What P6 and P7's evidence exposes, consistently and
repeatedly rather than as an isolated incident, is a **discovery-scope problem that exists one layer
below where v2's structural changes operate**: verification in this project is organized around *what a
checkpoint declares it changes*, while the defects that actually shipped or nearly shipped were organized
around *what an invariant or a retiring dependency actually reaches* — a sibling write handler in an
already-touched file (P6 Finding L), files never named by any checkpoint at all (P6 Findings M/N/P), and
a syntactic dependency correctly tracked in prose across five sessions but never assigned to the one
checkpoint whose action activated it (P7's `auth.php`). A second, related and evidence-backed problem is
that even genuinely thorough, honestly-reported verification recurringly produces **claims stronger than
what was actually proven** ("byte-identical" for a key-order difference, "93/93" read as comprehensive
tenant correctness) — not through dishonesty, but because the Skill does not yet name the distinction
between what a specific check proves and the broader-sounding word used to report it. Both problems are
evidence-backed by multiple, independent, cross-phase incidents, not a single occurrence each, and both
sit at a level Skill v2's risk-tier/lifecycle-router restructuring did not address, because both survive
even when every named lifecycle stage is followed correctly and every risk tier is classified correctly.

---

## 16. Questions for Stage 2

- Should destructive/irreversible retirement have a named dependency-closure gate distinct from an
  ordinary HIGH-risk migration's regression gate, given P6 Finding L and P7's `auth.php` STOP are two
  independent instances of the same underlying gap?
- If so, should that gate require a mechanism-based sweep (by invariant/dependency type) rather than a
  file-footprint-based one, given §5.2's Shape 1 (a sibling handler *inside* an already-touched file)
  would not have been caught by a wider-file-list approach alone?
- Should dependency closure distinguish semantic vs. syntactic vs. compatibility-only dependencies
  explicitly, given §6.4's evidence that conflating "compatibility-only" with "safe indefinitely" (rather
  than "safe until the specific future step that removes the referenced object") is what let `auth.php`
  survive five sessions?
- Should Independent Audit for HIGH/CRITICAL work explicitly require a same-class/system-wide
  sibling-surface sweep as part of its own defined scope, given that only the audit session explicitly
  instructed to search "by mechanism, not by file" (P6's second audit) found the residual Finding P?
- Should the STOP → Scoped Plan Amendment → Fresh verification → Fresh explicit GO → Retry sequence
  become an explicit, named lifecycle-router row, given it was independently reconstructed correctly four
  separate times without one?
- Should evidence-strength reporting (not just evidence-gathering) get named equivalence levels
  (structurally-equivalent / byte-identical / behaviorally-equivalent), given three independent instances
  of a true-but-narrower claim being reported using broader-sounding language?
- Which verification evidence may safely be reused across a phase's own sessions versus which must be
  re-derived fresh at every session boundary — is §7.5's current line (session-boundary-crossing,
  load-bearing facts must be re-derived) drawn in the right place, or did P6/P7 show cases where even
  more reuse would have been safe, or less?
- Would a lightweight Phase/Checkpoint Contract (what a checkpoint guarantees true on its own completion)
  or Compatibility/Retirement Ledger (a durable home for "this exists only for legacy compatibility,
  owned by phase X, closes at phase Y" entries) have caught the `auth.php` gap earlier than P7b-6's own
  GO, at a cost proportionate to the benefit — or would it merely relocate the same discovery-scope
  problem into a differently-shaped document?
- Can any Completion Report or lifecycle-ceremony item be compressed without losing the evidence that
  currently justifies it, given this analysis found no ceremony item in P6/P7 classified as pure waste?
- How should v3 avoid repeating v2's own demonstrated failure mode — a compression/consolidation pass
  silently dropping safeguards, caught only by a later, differently-motivated independent pass — given
  v2's Version History (§14) is itself already regrowing toward the append-only shape it was built to
  replace?

---

*End of Stage 1 analysis. No Skill v3 design, no SKILL.md edit, and no application/database change was
performed or is implied by this document.*
