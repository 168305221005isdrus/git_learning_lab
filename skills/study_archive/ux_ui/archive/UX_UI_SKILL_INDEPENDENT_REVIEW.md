# Study Archive UX/UI Skill — Independent Review (Stage 4)

**Session date**: 2026-08-19. **Session type**: separate, no-stake Independent Review — did not
author the Stage-3 draft, treats the Stage-3 Completion Report as a claim set, not evidence.

**Independence statement**: this session read `skills/study_archive/ux_ui/SKILL.md` directly rather
than relying on Stage 3's own summary of what it implemented, and re-derived every UX-01–UX-16
mapping, every Must-Survive safeguard, and every adversarial case independently against the actual
file text, the Stage-2 Design (`UX_UI_SKILL_DESIGN.md`), and the current Engineering `SKILL.md`.

---

## 1. Baseline

| | Pre-review (Stage-3 draft) | Post-remediation |
|---|---|---|
| Lines | 538 | 578 |
| Bytes | 33,519 | 37,380 |
| SHA-256 | `d6cf416877c6d9a90571215bb0cdcb95ef70ab3c0f46020422632a0e5c8a096c` | `b3faf35a8d7b50f6485bfe20849d7c06859ca1200e428f12ce52385379167687` |

Post-remediation figures are the file's true final state — six methodology-precision edits plus the
Stage-4 status-banner/title/Version-History update that finalizes it.

Pre-remediation snapshot preserved at `skills/study_archive/ux_ui/archive/SKILL_STAGE3_DRAFT.md`,
verified byte-identical to the baseline before any edit (hash above).

Engineering `SKILL.md` hash, confirmed unchanged across this entire session:
`0cfd245e7f067207b975642f25dee516ee4b7a1bcb6605d743c472a4e114bdda`.

---

## 2. Sources inspected

- `skills/study_archive/ux_ui/SKILL.md` — full read, twice (pre- and post-remediation).
- `skills/study_archive/ux_ui/archive/UX_UI_SKILL_DESIGN.md` — full read (778 lines, all of §1–§30).
- `skills/study_archive/engineering/SKILL.md` — full read (895 lines, all sections).
- `skills/study_archive/ux_ui/archive/UX_UI_POST_PROJECT_ANALYSIS.md` — targeted read (theme-block
  byte-identical claim, §10.B context) to verify a factual claim carried into §13/Target Q.
- Grep sweeps of both UX/UI files for: `byte-sync`/`byte-identical`, `architecture/behavioral`,
  Route-3/tier-B trigger phrasing, decorative-SVG phrasing, theme mentions in Engineering `SKILL.md`.

---

## 3. UX-01 → UX-16 matrix

| ID | Verdict | SKILL.md section | Note |
|---|---|---|---|
| UX-01 | PASS (post-remediation; PARTIAL pre) | §0 | Pre: restated an inaccurate paraphrase of Engineering §0's ordering while claiming "unchanged" — Finding 6. Post: pure pointer, no restated list. |
| UX-02 | PASS (post; PARTIAL pre) | §2 | Pre: Route 3 conflated tier C/D handling — Finding 2. Post: split per tier. |
| UX-03 | PASS | §3 | Ladder, Case I gate, scope-expansion clause all faithful. |
| UX-04 | PASS | §4 | Table matches Design §4 verbatim; the contradiction lived in §2's prose, not this table. |
| UX-05 | PASS | §5 | 9-step loop and evidence-type table faithful. |
| UX-06 | PASS (post; PARTIAL pre) | §6.A | Pre: "layout change of any kind" contradicted the NOT REQUIRED carve-out — Finding 3 (upstream in Design §8 too). Post: carve-out stated as the sole exception. |
| UX-07 | PASS | §6.B | Three-class viewport strategy, breakpoint conditioning, overflow/touch-target rules faithful. |
| UX-08 | PASS (post; PARTIAL pre) | §7 | Pre: `aria-hidden`/`role="img"` described as if both suppress — technically wrong (Finding 4, upstream in Design §10). Post: corrected. Ban list unaffected, was already correct. |
| UX-09 | PASS | §8 | No token-registry drift; correctly points to §13. |
| UX-10 | PASS | §9.A | Applicability-gating and Loading-state conditional faithful. |
| UX-11 | PASS | §9.B | A/B split and one-site-vs-many-conditional test faithful; Case F resolves correctly. |
| UX-12 | PASS (post; PARTIAL pre) | §9.C + §13 | Pre: §13's "byte-sync verification" overclaimed relative to §9.C's own "same values" standard — Finding 5. Post: reworded to match. |
| UX-13 | PASS | §10 | Prohibited list and handoff rule verbatim-equivalent to Design §15. |
| UX-14 | PASS | §11 | 9-item STOP list; correctly does *not* include tier-D refusals (verified against Route 3 fix). |
| UX-15 | PASS | §12 | Scope discipline, two regression checks, proportional review table faithful. |
| UX-16 | PASS | §13 | Every Design §22 C/B-classified fact has a §13 entry; `download.php`'s "tier-B-adjacent" phrasing reviewed under Target P — resolves to real procedure, Category C note only. |

**Result**: 16/16 PASS after remediation. 6 of 16 were PARTIAL before remediation.

---

## 4. Must-Survive safeguards (30-item list)

All 30 reviewed individually against the current file. 27 were PASS pre-remediation with no textual
issue. Three intersected directly with the findings below and are now PASS post-remediation:

- **#4** (Engineering methodology referenced rather than duplicated) — PARTIAL pre (Finding 6's
  inaccurate restatement was itself a form of duplication), PASS post.
- **#8** (Engineering Escalation does not silently implement Engineering work) — PASS throughout;
  Finding 2 didn't threaten this one, but the fix strengthens its operational clarity.
- **#10** (Tier C and Tier D have different semantics) — PARTIAL pre (asserted in §4's prose but
  contradicted operationally by §2's old Route-3 text — Finding 2), PASS post.

No safeguard is FAIL at either point. #29 (status is DRAFT until review passes) and #30 (no
application code changed during review) are confirmed true for the review's own conduct; #29 is now
superseded by the FINAL status this review grants.

---

## 5. Findings

All six findings below are **Category B** — bounded wording/consistency defects repairable inside the
already-approved Stage-2 methodology, requiring no new route, tier, ladder rung, or review regime.
Findings 3, 4, and 6 originated in the Stage-2 Design itself (upstream defects, faithfully
transcribed by Stage 3) rather than being introduced during Stage-3 authoring; this is recorded
per Axis E's requirement to distinguish design-fidelity defects from upstream design defects. No
Category A finding was found — nothing required inventing a fourth route, redefining the four-tier
model, or reopening Stage-2 methodology.

### Finding 1 — Tier-B Engineering-read trigger list incomplete (Target L)
**File/section**: §0, §1 (pre-remediation).
**Defect**: §0's "No auto-discovery" paragraph enumerated exactly three triggers for reading
Engineering `SKILL.md` — Route 3, a *failed* tier-B contract check, or a STOP — omitting the ordinary,
un-failed tier-B contract-preservation edit that §4's own table already requires reading Engineering
for, "before editing." §1 item 4 repeated the same incomplete list. Two competent agents could
reasonably disagree about whether an ordinary (non-failing) tier-B edit requires reading Engineering
first.
**Origin**: Stage 3 (§0/§1 wording did not carry Design §4's "before editing" language into the
trigger-enumeration sentences, even though Design's own §4 table stated it correctly).
**Fix**: both §0 and §1's trigger lists now explicitly include "a tier-B contract-preservation edit,
before editing" as a trigger, distinct from "a failed tier-B check escalating to tier C."
**Post-fix verdict**: PASS — Target L.

### Finding 2 — Route 3 conflated Tier C and Tier D closure (Target N)
**File/section**: §2, Route 3 (pre-remediation).
**Defect**: Route 3's prose described tier C and D uniformly as "detect and hand off," with a single
STOP procedure ("record the finding, Read Engineering SKILL.md, route via its own §2/§3") applying to
both. This directly contradicts §4's own Tier D row: Read Engineering SKILL.md? N/A; Handoff? N/A;
Closes via "Refuse; explain why; offer the tier-B-compliant alternative" — a purely local, immediate
refusal with no Engineering read and no handoff. §11's own STOP-condition list independently confirms
this: none of its 9 items describe a tier-D shortcut-refusal scenario, meaning Route 3's old text was
citing "STOP (§11)" for a case §11 doesn't actually cover.
**Origin**: Stage 2 Design §5 (verbatim same conflation present in the controlling specification) —
upstream defect, faithfully carried into Stage 3.
**Fix**: Route 3 now states two explicit sub-procedures — "Tier C — detect and hand off" (STOP, read
Engineering, route via §2/§3) and "Tier D — detect and refuse" (no Engineering read required, no
handoff, refuse in-session per §4's own row) — with the worked examples relabeled by tier and a third
example (theme-block-merge shortcut) added to anchor the D case using §4's own existing vocabulary.
**Post-fix verdict**: PASS — Target N.

### Finding 3 — Runtime-trigger self-contradiction for layout changes (Target M)
**File/section**: §6.A (pre-remediation).
**Defect**: The MANDATORY list's first item, "Layout change of any kind," directly contradicted the
NOT REQUIRED list's "A single-page, single-value cosmetic tweak with no shared-component footprint" —
a plain single-page margin change (Test A1 in this review) satisfies both a MANDATORY and a NOT
REQUIRED description simultaneously, with no stated precedence rule. Case A's worked example (card
spacing stays Route 1, no runtime trigger) only resolved this for that one cited instance, not for the
general rule.
**Origin**: Stage 2 Design §8 (identical contradiction, down to the same "one page's margin value"
example under NOT REQUIRED) — upstream defect.
**Fix**: The MANDATORY bullet now reads "Layout change of any kind, **except** the single-page/
single-value carve-out named under NOT REQUIRED below — that carve-out is the sole exception to this
trigger, not a competing rule," making the precedence explicit and deterministic.
**Post-fix verdict**: PASS — Target M. Test A1 (single-page margin) → NOT REQUIRED. Test A3 (shared
`.card` padding across pages) → Route 2, mandatory regardless, unaffected by this fix.

### Finding 4 — Technically incorrect decorative-SVG accessibility guidance (Target O)
**File/section**: §7, In-scope bullet list (pre-remediation).
**Defect**: "`alt` on meaningful images; `aria-hidden`/`role="img"` suppression on purely decorative
SVGs" presents `aria-hidden` and `role="img"` as if both suppress decorative content from assistive
tech. This is factually wrong: `aria-hidden="true"` removes an element from the accessibility tree
(the correct decorative-SVG mechanism); `role="img"` does the opposite — it explicitly exposes an
element as a single image to assistive tech and is the correct mechanism for a *meaningful* inline
SVG when paired with an accessible name, not a decorative one. A faithful transcription of this
sentence would teach an agent to apply an accessibility-exposing role to content meant to be hidden.
**Origin**: Stage 2 Design §10 (identical phrasing) — upstream factual defect in the Design, not
introduced by Stage 3.
**Fix**: Rewrote the sentence to state the correct, distinct mechanisms for meaningful vs. decorative
images/SVGs, with an explicit note that `role="img"` exposes rather than suppresses. The checklist's
scope (10 items) and the claim-precision/ban-list rules are unchanged — this is a factual-accuracy
fix, not a methodology change.
**Post-fix verdict**: PASS — Target O.

### Finding 5 — Theme-sync claim overclaimed relative to its own operational rule (Target Q)
**File/section**: §13 (pre-remediation).
**Defect**: §13 stated "Two dark-mode activation blocks require byte-sync verification per §9.C," but
§9.C's actual operational rule — the one §13 is citing — requires only "an explicit diff/compare of
both blocks confirming they still express the same values," deliberately not byte-identical, since the
blocks are documented (Stage-1 analysis §10.B) to differ in indentation. "Byte-sync" is a stronger,
inconsistent claim than the rule it's supposed to be summarizing.
**Origin**: Stage 3 (the Design's own §22 portability table uses "byte-sync" only as an informal row
label, never as operational instruction text; Design §14's actual operational rule already uses
"same values" correctly — Stage 3 introduced the stronger, inconsistent word into §13's body text).
**Fix**: §13 now reads "require both-block value-agreement verification per §9.C (an explicit
diff/compare confirming the same values — not a byte-identical claim, since the blocks are known to
differ in indentation)," matching §9.C exactly.
**Post-fix verdict**: PASS — Target Q.

### Finding 6 — Priority-ordering pointer inaccurately restated Engineering §0
**File/section**: §0 (pre-remediation).
**Defect**: §0 opened with "(unchanged from, and never re-derived from, Engineering `SKILL.md` §0 —
read it there): data integrity → security/authorization/ownership → architecture/behavioral contracts
→ functional behavior → accessibility/usability → visual/aesthetic preference." Engineering `SKILL.md`
§0's actual ordering is a *ten*-item list (data integrity, security invariants, backward compatibility,
rollback safety, evidence-based decisions, maintainable architecture, production readiness, feature
completeness, UI consistency, performance) — the six-item list is a compressed paraphrase that invents
categories ("architecture/behavioral contracts," "functional behavior") not present as Engineering line
items, while claiming to be "unchanged." This both restates Engineering content (violating this same
section's own "never restates" principle two paragraphs later) and restates it inaccurately.
**Origin**: Stage 2 Design §2 (identical six-item list, identical "unchanged from... read it there"
claim) — upstream defect.
**Fix**: Replaced with a pure pointer that states no itemized list at all: "governed entirely by
Engineering `SKILL.md` §0's ordering — read it there; never re-derived or paraphrased as a substitute
list here," followed by one sentence locating UX/UI's own domain (accessibility/usability,
visual/aesthetic preference) as subordinate to security/data-integrity/behavioral-contract concerns,
without claiming this is Engineering's literal list.
**Post-fix verdict**: PASS.

### Finding 7 (Category C, non-blocking, not remediated) — "tier-B-adjacent" terminology (Target P)
**File/section**: §13, `download.php` entry.
**Observation**: "a contract-preservation (tier-B-adjacent, streaming/visibility endpoint) surface"
uses a term not defined anywhere in §4's four-tier vocabulary. Tested whether this creates an
unofficial fifth classification: it does not — the same sentence instructs "any restyle needs the
boundary check of §4 before proceeding, not a pure-cosmetic fix," meaning an agent is directed to run
the real A/B/C/D classification at task time rather than treat "tier-B-adjacent" as a standing
classification. No operational path skips §4 because of this label.
**Disposition**: left as-is. Category C — genuinely non-operational; renaming it would not change any
agent's behavior, since the operative instruction ("run §4's boundary check") is already unambiguous.
Recorded here so it isn't silently dropped from the record, per §4/§16's instruction not to resolve
Category C via unrecorded edits.

---

## 6. Target results (L–Q)

| Target | Pre-remediation | Post-remediation |
|---|---|---|
| L — Tier-B Engineering-read semantics | FINDING (Finding 1) | PASS |
| M — Route 1 / runtime-trigger determinism | FINDING (Finding 3) | PASS |
| N — Tier D vs. Route-3 handoff | FINDING (Finding 2) | PASS |
| O — Accessibility technical correctness | FINDING (Finding 4) | PASS |
| P — "tier-B-adjacent" terminology | PASS (Category C note, Finding 7) | PASS |
| Q — Theme-sync claim precision | FINDING (Finding 5) | PASS |

---

## 7. Engineering composition / pointer verification

Checked every UX/UI reference to Engineering `SKILL.md` against the actual current file:

| Reference | Exists? | Means what UX/UI claims? |
|---|---|---|
| §0 (Mission & Authority, priority ordering) | Yes | Yes, post-Finding-6-fix (no longer misquoted) |
| §2 (Risk Classification) | Yes | Referenced correctly (Route 3 tier-C handoff) |
| §3 (Lifecycle Router) | Yes | Referenced correctly (Route 3, §9 REDESIGN analogy) |
| §5 (Core Invariants) | Yes | Referenced correctly, never restated verbatim |
| §7.5 (Evidence Strength & Reuse / claim-precision) | Yes | Referenced correctly for accessibility claim-precision |
| §8 (Independent Review Policy) | Yes | Referenced correctly for Route-3 handoff's own review governance |
| §9 (Evidence & Documentation Policy, Owner Decision Protocol) | Yes | Referenced correctly for the REDESIGN-ladder analogy |
| §11 (STOP Conditions) | Yes | Referenced correctly, distinguished from UX/UI's own §11 |

No stale path remains (single companion-path string, verified against the actual repo location). No
Engineering invariant/risk router content is duplicated inline in UX/UI's file (Finding 6 was exactly
this failure mode in miniature, now fixed). UX/UI cannot override Engineering: §0's priority ordering
is now a pure pointer, and §4/§10 explicitly forbid UX/UI from weakening enforcement.

---

## 8. Technical/factual correctness

One defect found and fixed (Finding 4, decorative/meaningful SVG semantics). All other technical
claims reviewed — CSS custom-property/theme-token guidance, responsive viewport classes, focus/
keyboard semantics, `aria-describedby`/`aria-invalid` usage, single-`<h1>`-per-page — are standard and
correct. No other ARIA/HTML-semantic, CSS/theme-behavior, or evidence-precision claim was found
technically wrong.

---

## 9. Size / context assessment

578 lines post-remediation (was 538 pre-remediation; Stage-2 target was 380–480). The overage predates
this review and was not grown by remediation beyond what fixing six real contradictions/inaccuracies
required (+40 lines net for six precision fixes, no line removed for unrelated reasons). Classified per
Axis F's categories: the overage is category A (necessary operational semantics — six sections each
carrying worked routing/tier tables) and B (Project Profile evidence, §13), not C/D/E/F (no duplicated
rationale or style-guide drift was found on this pass). No line was removed merely to chase the
numeric target, and no safeguard was thinned for size. **Verdict**: acceptable — decision quality per
unit of context, not smallest-possible-file, is the governing criterion per the task's own instruction.

---

## 10. Portability

Re-checked §0–§12 against the Case-J hypothetical (React/Vue/Svelte, no RBAC, one language, no dark
mode, client-side interaction layer). All of §2 (router), §3 (ladder), §4 (tier model), §5
(investigation loop), §6 (runtime/responsive policy), §7 (accessibility), §8 (component policy), §9.A
(state matrix) apply unchanged. §9.B/§9.C's *general* rules apply unchanged; their Study-Archive
concrete instances (Thai/English, the two theme blocks) are correctly isolated as tagged instances, not
baked into the general rule. §13 is the sole project-specific section and is clearly separated. Finding
6's fix improves portability further by removing an inaccurately-restated ordering that could have
been mistaken for a portable normative list. **Verdict**: PASS.

---

## 11. Rejected/deferred idea intrusion

Checked the current file against all 11 rejected/deferred candidates in Design §26: Engineering's
LOW/MEDIUM/HIGH/CRITICAL tiers, mandatory Independent Review per CSS change, full-site screenshot
suites, full browser/device matrices, a separate Accessibility Skill, a separate Responsive Skill, a
design-token registry, hard-coded SA pixel values in general rules, mandatory JS/loading-state
architecture, autonomous redesign permission, duplicated Engineering rules. **All ABSENT.** Finding 6
was the closest thing to a leak (an inaccurate partial restatement of Engineering content), now closed.

---

## 12. Cases A–K (re-run against current text)

| Case | Verdict | Controlling section |
|---|---|---|
| A — dashboard card spacing | PASS | §2 Route 1 (explicit worked example) |
| B — normalize Delete styling | PASS | §2 Route 2, §12 review table |
| C — sidebar mobile usability | PASS | §2 Route 2 (responsive footprint), §6.B |
| D — focus visibility + field-error a11y | PASS | §2 Route 2, §7 (ban list blocks WCAG claim) |
| E — restyle ownership-gated disabled states | PASS | §4 Tier B, §12 review table (Required) |
| F — translate all remaining error messages | PASS | §9.B test, §2 Route 3 (tier C) |
| G — redesign Login/Register | PASS | §11 item 6, §2 Route 3 (tier C) |
| H — change dark-mode palette | PASS | §4 Tier B, §9.C (now precisely worded) |
| I — "make the whole website modern" | PASS | §3 ladder gate |
| J — future React/Vue/Svelte, no RBAC | PASS | §10 portability assessment |
| K — UX work discovers DB/schema requirement | PASS | §11 item 3 |

## 13. Cases L–Q (re-run against current text)

| Case | Verdict | Controlling section |
|---|---|---|
| L — ordinary tier-B change before failure | PASS (was PARTIAL) | §0/§1/§4, post-Finding-1 |
| M — local margin vs. shared layout | PASS (was PARTIAL) | §6.A, post-Finding-3 |
| N — explicitly prohibited UX shortcut | PASS (was PARTIAL) | §2 Route 3, post-Finding-2 |
| O — decorative vs. meaningful SVG | PASS (was FAIL) | §7, post-Finding-4 |
| P — download.php Project Profile instance | PASS | §13 (Finding 7, Category C, not blocking) |
| Q — dark-theme synchronization claim | PASS (was PARTIAL) | §13/§9.C, post-Finding-5 |

---

## 14. Remediation log

Six hunks, all in `skills/study_archive/ux_ui/SKILL.md`, applied after the pre-remediation snapshot was
taken and hashed:

1. §0 priority-ordering paragraph — Finding 6.
2. §0 "No auto-discovery" trigger list — Finding 1.
3. §1 item 4 trigger list — Finding 1 (companion fix, same defect class, found during post-edit
   consistency sweep).
4. §2 Route 3 — Finding 2.
5. §6.A MANDATORY first bullet — Finding 3.
6. §7 decorative/meaningful image bullet — Finding 4.
7. §13 theme-block sync sentence — Finding 5.

(Numbered as 7 edits above because Finding 1's fix touched two locations, §0 and §1; both are the same
finding.) Diff reviewed in full (`diff -u` against the snapshot) — confirmed no hunk touched anything
outside the six findings' scope; no route, tier, rung, or review-policy structure was altered.

Status banner (top of file) and §14 Version History were then updated to reflect Stage 4's completion
and FINAL status, per the finalization rule — this is a documentation update, not a seventh
methodology remediation.

---

## 15. Post-remediation verification

Re-ran, against the fully-edited file: all 16 UX-01–UX-16 IDs (§3 above), all 30 Must-Survive
safeguards (§4 above), Cases A–K and L–Q (§§12–13 above), the Engineering-composition pointer check
(§7 above), the rejected-idea intrusion sweep (§11 above), and a full-file read-through for residual
inconsistency. No new contradiction was introduced by the remediation; no Category A or B finding
remains open.

**Final file state**: 578 lines, 37,380 bytes, SHA-256
`b3faf35a8d7b50f6485bfe20849d7c06859ca1200e428f12ce52385379167687` — this is the file's true final
state, including the status-banner/title/Version-History update. Engineering `SKILL.md` confirmed
byte-unchanged throughout (`0cfd245e7f067207b975642f25dee516ee4b7a1bcb6605d743c472a4e114bdda`).

---

## 16. Verdict

**INDEPENDENT UX/UI SKILL REVIEW: PASS WITH REMEDIATIONS.**

All Category A/B findings (six, all Category B) closed. Post-remediation re-review: PASS across every
axis required by §18's finalization rule. UX/UI SKILL.md updated to **FINAL**.

No Stage-2 methodology redesign occurred. No application code was read for modification purposes (only
Engineering `SKILL.md` and the UX/UI Design/analysis documents were read, per the review's targeted-read
allowance). No database/schema/live data was touched. Engineering `SKILL.md` is unchanged.
