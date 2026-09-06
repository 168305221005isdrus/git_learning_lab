---
name: study-archive-ux-ui
description: UX/UI operating model for Study Archive — visual hierarchy, layout, spacing, typography, presentation-level color, components, responsive behavior, accessibility presentation, interaction states, theme-aware UX, localization-aware layout, and safe composition with the Engineering Skill. Use for any Study Archive styling, layout, component, responsive, accessibility-presentation, or theme/localization-layout session.
---

# Study Archive UX/UI Skill

> **STATUS: FINAL.** Stage 1 (UX/UI Post-Project Analysis) is complete. Stage 2 (UX/UI Skill Design)
> is complete. Stage 3 (this file's creation) is complete. Stage 4 (the mandatory, separate
> **Independent UX/UI Skill Review** — a later, no-stake session per Engineering `SKILL.md` §8's
> session-distinctness principle applied to this file's own authorship) is complete: verdict **PASS
> WITH REMEDIATIONS**, all Category A/B findings closed, post-remediation re-review PASS. This
> version is final. Provenance: §14; full record:
> `skills/study_archive/ux_ui/archive/UX_UI_SKILL_INDEPENDENT_REVIEW.md`.

This file governs **how** to approach UX/UI work on Study Archive — visual hierarchy, layout,
spacing, typography, presentation-level color, components, responsive behavior, accessibility
presentation, interaction states, theme-aware UX, and localization-aware layout. It is a narrow,
evidence-first **specialist** methodology, not a style guide, not a design-token dump, not a second
Engineering Skill, and not an autonomous redesign license. Where a Study-Archive-specific fact
attaches to a general rule, it is marked **"concrete instance: …"** so the rule itself stays portable.

---

## 0. Mission, Authority & Companion Skill

**Priority ordering when layers conflict**: governed entirely by Engineering `SKILL.md` §0's ordering
— read it there; never re-derived or paraphrased as a substitute list here. Within that ordering,
UX/UI's own domain (accessibility/usability, visual/aesthetic preference) sits below security, data
integrity, and behavioral/architectural contracts: a UX/UI improvement never buys a lower layer's
cost with a higher layer's coin.

**Companion Engineering Skill** (exact, current path — the single field this Skill's Engineering
composition depends on):

```
skills/study_archive/engineering/SKILL.md
```

**No auto-discovery.** Nothing about folder naming causes that file to load automatically. Whenever
this Skill's boundary machinery (§4) requires reading it — any tier-B contract-preservation edit
(§4: read the specific invariant/fact the contract rests on **before editing**, not only if the
contract check later fails), Route 3 (§2), a failed tier-B contract check escalating to tier C, or
any STOP (§11) — actually issue a `Read` of that path in the current session. Never assume its
contents from memory of an earlier session; treat a prior session's recollection of Engineering
methodology as stale until re-read.

**This Skill never restates** Engineering's Core Invariants, Risk Classification, or Lifecycle
Router content. Wherever UX/UI work needs one of those, this file names the section and says "read
it there." Duplication is a named failure mode this Skill must not become an instance of.

**Scope**: this Skill governs presentation. It does not govern schema, RBAC/authorization
enforcement, backup/rehearsal, or migration methodology — those remain Engineering's exclusively,
referenced here only by pointer.

**Portability**: a project with a different companion methodology, or none yet, replaces the path
above or leaves it explicitly empty with a note that no companion exists.

---

## 1. Source & Evidence Hierarchy

For a UX/UI task, read in this order:

1. **This file** — methodology. Rarely changes.
2. **§13 Project UX/UI Profile** (below) — Study Archive's current concrete facts (breakpoints,
   theme-block locations, design-system strengths, known debt).
3. **The live source** — the actual CSS/markup/template files the task touches. A design fact this
   file states is a snapshot; the live file is authoritative if they disagree — investigate the
   discrepancy, don't silently pick a side, and correct §13 if it's stale.
4. **`skills/study_archive/engineering/SKILL.md`** — only when the boundary machinery (§4) requires
   it (a tier-B contract-preservation edit, before editing; Route 3; a failed tier-B check escalating
   to tier C; STOP). Not read by default for ordinary Route 1 work, or for a Route 2 change that
   never touches a tier-B surface.

Do not re-read `skills/study_archive/ux_ui/archive/UX_UI_POST_PROJECT_ANALYSIS.md` or
`UX_UI_SKILL_DESIGN.md` for ordinary work — they are this Skill's own creation provenance, not a
per-task reference. Consult them only if a §13 fact's exact wording or citation needs verification.

---

## 2. UX/UI Change Router

Three routes. Classify before touching anything.

### Route 1 — Local / Cosmetic
Single component, single file (or a self-contained edit inside `assets/css/style.css` outside the
two theme blocks, §9.C), no shared pattern reused elsewhere is structurally changed, tier A only
(§4).

- Investigation: read the one file/component. Planning: state the change, nothing more.
  Implementation: exactly the named surface.
- Runtime/responsive/accessibility/cross-page checks: not required unless a §6 mandatory trigger
  independently fires — if one does, the surface wasn't really Route 1 to begin with; reclassify as
  Route 2.
- Independent Review: not required — targeted regression (§12) suffices.

*Example: Case A, dashboard card spacing — single surface, no shared-pattern footprint, stays Route 1.*

### Route 2 — Shared Pattern / Workflow / Systemic
Anything touching a component or pattern reused across pages (badges, buttons, tables, cards, nav),
any multi-step interaction/workflow change, any responsive or accessibility change with a footprint
wider than one page, or any tier-B contract-preservation surface (§4).

- Investigation: reconstruct the *current* pattern across every page that uses it — a shared concept
  is not always implemented via one shared component in this codebase; verify before assuming a
  one-place fix covers every instance. Planning: state the preserve-vs-redesign rung (§3) explicitly
  before implementing.
- Implementation: the shared surface plus every page instantiating it, unless §12's Scope Discipline
  narrows it with a stated reason.
- Runtime verification: **mandatory** (§6). Responsive verification required if layout is affected;
  accessibility verification required if interaction/focus/labeling is affected (§7).
- Cross-page consistency check: **mandatory** — this route's defining extra step over Route 1.
  Engineering-contract check: mandatory if any touched surface is tier B or higher (§4).
- Independent Review: recommended; **required** if a tier-B contract surface was touched (§12).

*Example: Case B, normalizing Delete-button styling across pages — shared pattern, no gate touched,
Independent Review recommended not required.*

### Route 3 — Engineering Escalation
Anything landing in tier C or D (§4) never gets Route 1/2 treatment. This route's only job is to
**detect and close correctly per tier** — it never implements the change itself either way. Tier C
and tier D close differently; never collapse them (§4):

- **Tier C — detect and hand off.** Investigation stops at classification. STOP (§11): record the
  finding, `Read` `skills/study_archive/engineering/SKILL.md`, route via its own §2/§3. No UX/UI
  implementation occurs.
- **Tier D — detect and refuse.** No Engineering handoff and no §11 STOP — §4's own row is explicit:
  Read Engineering SKILL.md? N/A; Handoff? N/A. Refuse the shortcut in this session, explain why, and
  offer the tier-B-compliant alternative if one exists, per §4's Tier D closure.

*Example: Case F, "translate all remaining error messages" — a many-conditional retrofit (§9.B), tier
C, routes here. Case G, redesigning Login/Register — reopens a documented Owner Decision (§13), tier
C, routes here. "Simplify the two theme blocks into one" (§4's tier-D worked example) — refused
directly, never routed through Engineering's lifecycle.*

**A request that names no specific defect and no route-qualifying footprint never gets to skip
classification** — even an apparently trivial request is checked against §4's tiers before Route 1
is assumed.

---

## 3. Preserve-vs-Redesign Ladder

Five rungs, ascending authorization requirement. Climb only when the evidence bar for that rung is
met — never by default, never from aesthetic preference alone.

| Rung | Meaning | Evidence required to be at this rung |
|---|---|---|
| **PRESERVE** | Change nothing; extend understanding only | Default for any request naming no specific defect |
| **EXTEND** | Apply an existing, evidenced pattern to a new surface | The pattern already exists and is reused elsewhere (§13 Strengths) — citing it is sufficient |
| **NORMALIZE** | Fix a named, evidenced inconsistency within the existing visual language | A specific, citable inconsistency — not "this could be nicer" |
| **REFACTOR** | Introduce a new shared mechanism replacing duplicated implementations | Repeated/systemic evidence of drift, or an explicit Project Owner request naming this scope |
| **REDESIGN** | Change the visual language itself (palette philosophy, layout paradigm, component vocabulary) | **Explicit, recorded Project Owner redesign intent** — never inferred from a vague aesthetic request |

A request like "make the dashboard prettier" or "make the whole site modern" caps at
NORMALIZE/EXTEND by default. Reaching REDESIGN requires asking the Owner what's actually driving the
request and getting a scoped answer — the same way Engineering `SKILL.md` §9 treats a genuinely
ambiguous business question.

**Scope-expansion prevention**: climbing a rung is a per-request decision, never a standing grant. A
session authorized to NORMALIZE the Delete button does not thereby gain standing authorization to
NORMALIZE the badge system too, even if noticed along the way — see §12.

*Case I, "make the whole website modern," is blocked here before a route is even assigned — no
route authorizes unlimited scope from a vague request.*

---

## 4. UX/UI ↔ Engineering Boundary — the Four-Tier Authority Model

The load-bearing section. Classify every change into exactly one tier before proceeding.

| Tier | What belongs here | Evidence needed | Execute directly? | Read Engineering `SKILL.md`? | Handoff? | STOP? | Closes via |
|---|---|---|---|---|---|---|---|
| **A — UX/UI-owned** | Spacing, typography, non-semantic color, radius, shadow, icon choice, layout, hover/idle styling, `t()`-routed string wording, any change confined to `assets/css/style.css` outside the two theme blocks | Source inspection; runtime only if a §6 mandatory trigger independently fires | Yes | No, unless another trigger on this table also fires | No | No | Targeted regression (§12) |
| **B — UX/UI with contract preservation** | The two dark-theme CSS blocks (§9.C); ownership/role-gated icon greying; visibility/status badges; settings' next-load-only behavior; avatar rendering | Source inspection **plus** a named contract check (what must stay true) **plus** runtime verification proving the contract held | Yes, once the contract check is written down and passes | Yes — read the specific invariant/fact the contract rests on, before editing | No, unless the contract check fails | No, unless the contract check fails (then escalate to C) | Contract-preservation verification named explicitly in the completion report, never implied by "looks fine" |
| **C — Cross-skill / Engineering dependency** | Translating dynamic validation/flash messages; extending theme/translation to Login/Register; changing a persisted setting's default; anything changing *whether* a gate fires | N/A — UX/UI does not gather implementation evidence here | No | Yes — read Engineering `SKILL.md` §2/§3 in full before proceeding | **Yes, mandatory** | **Yes** | Engineering's own lifecycle, not this Skill |
| **D — Prohibited UX shortcut** | Removing a disabled/greyed state "because the server checks anyway"; color-only badge redesign; simplifying the two theme blocks into one without independently re-verifying both paths; adding a request-trusted ownership/identity field for convenience | N/A | **Never** | N/A | N/A | **Yes, immediately, no partial execution** | Refuse; explain why; offer the tier-B-compliant alternative if one exists |

**Tier C ≠ Tier D.** C means the requested outcome may be legitimate, but Engineering must own the
architecture/security portion — hand off, don't refuse the goal. D means the proposed shortcut
itself violates a higher-priority invariant and must not be executed as requested, regardless of the
underlying goal's legitimacy. Never collapse the two. Worked tests: icon-greying restyle → B (Case
E); dark-mode palette change → B (Case H); translating flash messages → C (Case F); "simplify the two
theme blocks into one" → D, refused outright regardless of phrasing. §0's authority ordering is never
weakened by any tier — tier B's contract check exists precisely to enforce it operationally.

---

## 5. Investigation / Evidence Loop

```
request
  → surface inventory        (which file(s)/page(s)/component(s) does this actually touch?)
  → pattern reconstruction   (what's the existing convention here — cite it, don't assume)
  → boundary classification  (§4: tier A/B/C/D)
  → route selection          (§2: Local / Shared-Systemic / Engineering-Escalation)
  → scope-ladder rung        (§3: Preserve/Extend/Normalize/Refactor/Redesign)
  → evidence gathering       (source always; runtime per §6's trigger policy)
  → implementation           (bounded to the declared footprint, §12)
  → verification             (targeted regression always; cross-page if Route 2; contract check if tier B)
  → completion report
```

Distinct from Engineering's investigation loop (`SKILL.md` §4) in one structural way: Engineering's
loop finds root cause of a *defect*; this loop classifies a *request* before any pixel moves —
classification, not implementation, is where this domain's real risk lives (a visual change altering
authorization behavior is caught at classification, not at code-review time).

**Evidence types**, matched to the claim they can support:

| Evidence type | Answers |
|---|---|
| Source read | Does this pattern exist elsewhere? What does the current markup/CSS actually say? |
| Grep for absence | Is this component/rule genuinely absent, or did I just not find it? |
| Runtime render | What does this look like once the browser resolves cascade/media queries? |
| Viewport resize | Does this hold at narrow/medium/wide? |
| Theme toggle (both paths) | Do both dark-mode activation paths still agree? |
| Language toggle | Does this hold with the other language's string lengths? |
| Keyboard-only pass | Is this operable and visibly focused without a mouse? |
| Before/after screenshot | Did the contract-preserved surface actually stay preserved? |

---

## 6. Runtime & Responsive Verification

### 6.A Runtime Inspection Triggers

**MANDATORY** (never skip; never substitute source-reasoning for the check):
- Layout change of any kind, **except** the single-page/single-value carve-out named under NOT
  REQUIRED below — that carve-out is the sole exception to this trigger, not a competing rule.
- Responsive change (new/modified breakpoint behavior).
- Typography or spacing change on a component reused across ≥2 pages.
- Color/contrast change.
- Any edit inside either theme-activation block (§9.C) — both paths, always, no exception; this is
  the single highest-probability place a UX/UI edit breaks something invisibly.
- Focus/keyboard-behavior change.
- Any language-affecting layout claim ("this won't overflow in Thai/English").
- Any accessibility claim made in a completion report.
- Every Route 2 change, regardless of which sub-trigger above applies.

**RECOMMENDED** (do it unless a specific reason not to is stated):
- A Route 1 cosmetic change to a component appearing on more than one page — sample 1–2
  representative instances, not the whole site.

**NOT REQUIRED** (source alone suffices):
- A single-page, single-value cosmetic tweak with no shared-component footprint.
- A pure wording change to a string already routed through `t()` — unless the new string is
  meaningfully longer, which triggers the language-layout item above.

**Proportional sampling, not exhaustive crawling**: when a mandatory trigger fires on a shared
component, verify representative instances (one per distinct page-layout context it appears in) —
never literally every page. "Always open every page in every browser" is not this Skill's rule.

### 6.B Responsive Verification

**Portable minimum — three viewport classes**, independent of any project's specific breakpoints:

| Class | Approximate width | Verifies |
|---|---|---|
| Narrow | ~375–420px | Mobile-equivalent stacking, overflow, touch-target sizing |
| Medium | ~768px | Tablet-equivalent transition zone — where most breakpoint bugs surface |
| Wide | ~1280px+ | Desktop layout, the project's max meaningful content width |

Study Archive's exact authored breakpoints (§13) are tested precisely, **in addition to** the three
classes above, only when the change touches a component whose breakpoint sits at one of those exact
values — otherwise the three-class sweep is sufficient evidence.

**Overflow checks**: required whenever a fixed-width element (badge, nav item, button) sits near
translated or otherwise dynamic-length text.

**Touch-target checks**: required for any new/changed interactive control, evaluated at the Narrow
class. Not evaluated for a project confirmed to have no touch-driven usage pattern.

**Orientation**: not a current Study Archive concern (no evidence of orientation-dependent layout); a
future project's evidence base may require it — check only if that evidence exists.

**Evidence recording**: runtime tool screenshots/viewport resizes, referenced in the completion
report by viewport class and what was observed — never merely asserted as "checked responsive
behavior."

---

## 7. Accessibility

Bounded to what is actually evidenced for this project. Reuses Engineering `SKILL.md` §7.5's
evidence-claim-precision philosophy by reference — not duplicated here.

**In scope**:
- Semantic element preservation — don't regress native `<a>/<button>/<input>` usage; don't introduce
  `onclick`-on-`<div>`/`tabindex` misuse.
- Labels/accessible names — block-level `<label for>` is the existing pattern; `title`-only attribute
  is a known gap. Keyboard operability — native elements only; verify tab order after any
  interactive-markup change. Focus visibility — any focus-affecting change requires §6.A's mandatory
  runtime trigger.
- Error association — `aria-describedby`/`aria-invalid` on a form already being touched for another
  reason is in scope; retrofitting it sitewide as an unrelated byproduct is not (§12).
- Color dependence — status must stay color **+** text/icon, never color-only; on a security-relevant
  badge this is also a tier-D prohibited shortcut (§4/§10). Contrast verification requires runtime;
  never claimed from source reasoning alone.
- Heading semantics — single `<h1>` per page is the existing pattern; preserve it. Image/decoration
  semantics — a meaningful image gets `alt` text (an inline meaningful SVG instead gets `role="img"`
  plus an accessible name via `aria-label` or `<title>`+`aria-labelledby`); a purely decorative
  image/SVG gets `aria-hidden="true"` with no `role="img"`, removing it from the accessibility tree.
  `role="img"` *exposes* an image to assistive tech — it is not a suppression mechanism, and applying
  it to a decorative SVG is the wrong tool, not a stronger version of the right one.
- Reflow/zoom — folds into §6.B's viewport sweep, no separate mechanism. Dialog/modal behavior — not
  applicable today (no themed modal exists); apply only if a future change introduces one.

**Claim-precision rule** (adapted from Engineering `SKILL.md` §7.5, referenced not copied): every
accessibility claim in a completion report states, in the same or the next sentence, **WHAT** was
checked (which fields/components/pages, not "the form"), **HOW** (source read vs. runtime keyboard
pass vs. contrast measurement), and **WHAT it proves** at its narrowest true scope.

**Ban list**: never state or imply "WCAG [A/AA/AAA] compliant" or "fully accessible" from source
inspection or a partial checklist. State the specific checks performed instead.

---

## 8. Components / Design System

**General methodology**: use CSS custom properties / design tokens rather than hardcoded values in
any new or edited component. Prefer the existing single-mechanism-many-callers pattern (§13
Strengths) over inventing a parallel implementation. A new component composes existing tokens before
introducing a new one.

**Where project facts live**: Study Archive's concrete design-system facts (which tokens exist, which
patterns are strengths, what's currently debt) live in §13 — a compact section inside this file, not
a separate document, not a generated token registry.

**Not building**: a giant design-token registry, a generated style-guide document, or a component
specimen catalog — Study Archive has no formal token layer to catalog yet (§13); building an
aspirational one is REFACTOR/REDESIGN-tier work (§3), not a default of authoring or using this Skill.

---

## 9. States, Localization & Theme

### 9.A State Coverage

Applicability-gated, not mandatory-everywhere: `default · hover · focus · active · disabled ·
loading · empty · success · warning · info · error · destructive · permission-unavailable`.

Procedure: for the component/surface being touched, ask **"which of these states are applicable
here?"** — verify only those, at the depth the route (§2) requires. A static content block doesn't
need a loading state considered at all, and a project with no client-side interaction layer (Study
Archive currently — §13) does not get one invented as a byproduct of unrelated work; introducing one
is REFACTOR-tier architecture work (§3), likely Route 3 if it implies a new client-side pattern.

Two states carry an explicit tier-D caveat (§4): removing **disabled** from an ownership/role-gated
control is prohibited regardless of restyling — the state is part of a contract, not decoration.
Encoding **destructive** exclusively via color is prohibited on any state gating real data/access.

### 9.B Localization-Aware Layout

Two independent questions, kept structurally separate:

**A. Layout behavior under translated strings** — UX/UI-owned. Does a fixed-width element hold up
against the other language's string length? Verified via §6.B's runtime language-toggle check
whenever a layout claim is made. Editing an existing `t()`-routed string's *value* is tier A,
regardless of language.

**B. Whether application logic routes a string through the translation infrastructure at all** — may
be UX/UI-owned (wrapping one already-isolated hardcoded string in `t()`) or Engineering-touching
(retrofitting many conditionals). Distinguishing test: **does this request touch one call site, or
imply a systematic sweep across many independent conditionals?** The former stays Route 1/2; the
latter is a Route 3 cross-cutting change, full stop, regardless of phrasing — "just translate the
errors" and "retrofit i18n across all validation" are the same request and route identically.

Thai/English are named in §13 only as Study Archive's concrete instance of A/B; a single-language
project skips this subsection entirely.

### 9.C Theme-Aware Design

**General rule**: use design tokens/variables, never hardcoded semantic color values, for any
theme-aware component. Every supported theme activation path must be independently verified after a
theme-touching change — never assume one path's correctness implies the other's. Distinguish
explicit user-selected theme from OS/system-preference-driven theme where a project supports both.

**Study Archive's concrete instance**: two theme-activation source blocks (`@media
(prefers-color-scheme: dark)` and `:root[data-theme="dark"]`) must stay in agreement after any edit —
not merely a style preference; a prior incident had a `replace_all` edit silently update only one
block due to differing indentation. **Operational rule**: any edit inside either block requires,
before the change is considered done, an explicit diff/compare of both blocks confirming they still
express the same values. This is §6.A's mandatory-runtime trigger for this surface, and it is never
satisfied by "the CSS looks right" alone.

---

## 10. Destructive / Security-Sensitive UX

UX/UI owns **communication and presentation**. Engineering owns **enforcement**.

**Explicitly forbidden, unconditionally**:
- Moving an authorization decision into client-side/UI logic.
- Weakening or hiding a server-side enforcement mechanism to simplify presentation.
- Changing a backend decision merely to make presentation easier (e.g. altering what a query returns
  so the UI has less conditional logic to render, when the alteration changes who sees what).
- Encoding security-relevant state (visibility, ownership, role) via color alone, with no
  text/icon/other independent signal.
- Introducing any request-trusted identity/ownership field for UI/form convenience — Study Archive's
  concrete precedent (§13): there is deliberately no `uploaded_by` field in the upload form; the
  bypass is architecturally impossible, not merely validated away.

**The handoff rule**: when a genuine presentation improvement requires the backend to expose new
information it doesn't currently return (e.g. a differentiated error message needs the server to
distinguish a case it currently deliberately doesn't), that is not a UX/UI fix with a backend
dependency — it is a Route 3 escalation, full stop, because the *decision* to differentiate is itself
security-relevant (potential oracle-leak territory).

---

## 11. STOP Conditions → Engineering Handoff

STOP — record the finding, `Read` `skills/study_archive/engineering/SKILL.md` (§0), and route via
its own §2/§3 — whenever:

1. Backend behavior, endpoint semantics, or a server-side decision must change to satisfy the
   request.
2. Authorization/ownership/visibility logic must change (not merely its presentation).
3. A schema or persisted-data contract must change.
4. A persisted setting's semantics or default must change (e.g. a theme preference's default).
5. A security-relevant response's semantics must change (e.g. differentiating two currently-identical
   error responses).
6. A documented Project Owner scope decision would be reopened (Login/Register's
   theming/translation exclusion, §13, is the concrete instance).
7. The desired result requires a new client-side architecture or framework the project doesn't have.
8. The requested interaction cannot be implemented without touching an Engineering Core Invariant
   (Engineering `SKILL.md` §5).
9. A change classified Route 2 fails its tier-B contract check (§4) — the failure itself is the
   trigger.

This list is UX/UI-specific, distinct from Engineering's own STOP list (`SKILL.md` §11) by design —
it exists to catch the moment a *presentation* request crosses into Engineering territory.

---

## 12. Scope Discipline, Regression & Review

**Scope discipline**: a discovered issue **outside** the current change's declared footprint is
logged/deferred (§13 Known Debt), never folded into the current change. **Exception**: only when
leaving it unfixed would make the *current* change internally inconsistent — e.g. normalizing
Delete-button styling on a page that itself has two different Delete-button treatments is in-scope
for that page; a third page's unrelated Delete-button inconsistency is not, and gets logged instead.
"Make it prettier while I'm in here" is never, by itself, sufficient authorization to expand a
Route-1 change into a Route-2 one — the router (§2) and the ladder (§3) are re-evaluated, not
silently overridden, if a bigger opportunity is noticed mid-change.

**UX regression — two distinct checks, required at different routes**:

- **Targeted UX regression** (always required, every route): the changed surface renders correctly —
  across every theme/language/state actually applicable to it (§9) — at the viewport classes a
  mandatory trigger required (§6), with no new console/layout error, and with the contract-
  preservation check (§4, tier B) passing if applicable.
- **Cross-page / systemic UX regression** (required whenever Route 2 applies): every other page that
  independently implements the same shared visual concept — not just the one edited — is re-checked,
  since shared concepts aren't always implemented via one shared component; a fix in one place can
  silently leave siblings inconsistent or newly divergent.

Both are distinct from the tier boundary check (§4) — a change can pass both regression checks and
still fail the boundary check, and vice versa; neither substitutes for the other.

**Independent Review policy** — proportional to the router, not copied from Engineering's own
HIGH/CRITICAL-required rule:

| Route | Independent Review |
|---|---|
| Local/Cosmetic | Not required — self-check (targeted regression) suffices |
| Shared/Systemic, tier A surfaces only | Recommended |
| Shared/Systemic, tier B surface touched | **Required** |
| Engineering Escalation | Not this Skill's to require or waive — governed entirely by Engineering `SKILL.md` §8 once handed off |

---

## 13. Project UX/UI Profile — Study Archive

Compact, project-specific facts the general methodology above needs repeatedly. Every empirical claim
here traces to `skills/study_archive/ux_ui/archive/UX_UI_POST_PROJECT_ANALYSIS.md` (Stage 1). This
section and §4 are expected to accumulate new instances over time; every other section states a
mechanism once and stays stable. Companion Engineering Skill: `skills/study_archive/engineering/SKILL.md` (§0).

**Interaction model**: primarily server-rendered; client-side JavaScript is confined to two files.
Conditions the Loading-state guidance (§9.A) and any "live validation" request — a client-side
interaction layer this project doesn't currently have is an architectural addition (§3 REFACTOR-tier,
likely Route 3), not a UX styling task.

**Theme architecture**: clean, near-total CSS-variable coverage — a named strength, not a defect to
fix. Two dark-mode activation blocks require both-block value-agreement verification per §9.C (an
explicit diff/compare confirming the same values — not a byte-identical claim, since the blocks are
known to differ in indentation):
- `@media (prefers-color-scheme: dark)`
- `:root[data-theme="dark"]`

**Language**: Thai/English are the current concrete instance of §9.B's A/B split. No defensive CSS
exists today to guard against translated-string overflow — treat any layout claim under the other
language as unverified until runtime-checked (§6.A).

**Breakpoints (exact, authored values)**: `520px`, `760px`, `800px`, `900px`. Tested precisely, in
addition to §6.B's three portable classes, only when a touched component's breakpoint sits at one of
these exact values.

**Design-system strengths worth preserving** (PRESERVE-by-default, §3): an informal but real design
system — CSS custom-property tokens, a `t()` translation helper, an `avatar_html()` rendering
function, and a shared visibility-filter function — each a single-mechanism-many-callers pattern
(§8) to compose with, not replace.

**Known design-debt instances** (logged, not opportunistically fixed — §12):
- Spacing/typography/breakpoint accretion with no formal token layer; inline-style accumulation (61
  occurrences at time of analysis) — logged, not a blanket global fix.
- Table responsiveness inconsistency (three tables wrap on narrow viewports, one does not); no
  collapse mechanism for the sidebar on narrow viewports.
- Button/action treatment inconsistency (four visual treatments; Delete styled two different ways).
- Badge semantic overload (four colors mapped to five meanings) — a NORMALIZE/REFACTOR candidate only
  with explicit evidence of user-facing harm, not automatic.
- Focus/accessibility gaps: `:focus` styling exists only on inputs, no real `:disabled` CSS, no
  button focus rule, zero `aria-*` usage, no `aria-describedby` error association anywhere.
- `download.php`: raw `exit()` error responses, mixed-language text, bypasses the site layout — a
  contract-preservation (tier-B-adjacent, streaming/visibility endpoint) surface; any restyle needs
  the boundary check of §4 before proceeding, not a pure-cosmetic fix.
- "Remember Me" is non-functional; "Forgot Password?" is dead. Insufficient evidence of intended
  future behavior — a session that later touches `login.php` should notice these, not silently fix.
- Single-university email hint text vs. a multi-university-aware server-side check on `profile.php` —
  logged; any fix is content/logic work needing a bounded scope-check first, not an automatic
  byproduct of unrelated UX work.

**Documented Project Owner scope decisions**:
- Login/Register pages are deliberately left untranslated and unthemed. Reopening this is a Route 3
  STOP trigger (§11 item 6), not a UX judgment call.

**Security-sensitive presentation precedent**: there is deliberately no `uploaded_by` (or equivalent
request-trusted identity/ownership) field in the upload form — the bypass this would enable is
architecturally impossible, not merely validated away (§10).

**Zero-runtime-evidence baseline**: Stage 1's analysis used no runtime browser evidence — every
finding above is source-derived unless a later session's completion report states otherwise for that
specific surface. §6's runtime policy exists specifically to close this going forward.

---

## 14. Version History

**Stage 1** (2026-08-19): UX/UI Post-Project Analysis — empirical findings, no design or Skill
content. `skills/study_archive/ux_ui/archive/UX_UI_POST_PROJECT_ANALYSIS.md`.

**Stage 2** (2026-08-19): UX/UI Skill Design — the controlling creation specification for this file
(Design IDs UX-01 through UX-16), built from Stage 1's evidence and cross-checked against Engineering
`SKILL.md` v3 (FINAL) for boundary/reference accuracy.
`skills/study_archive/ux_ui/archive/UX_UI_SKILL_DESIGN.md`.

**Stage 3** (2026-08-19): first creation of this file, implementing UX-01–UX-16 faithfully against
the Stage-2 specification. Draft status pending the mandatory, separate Independent UX/UI Skill
Review.

**Stage 4, Independent UX/UI Skill Review** (2026-08-19, separate session, no stake in Stage 3):
verified UX-01–UX-16 against the actual file text (not Stage 3's own claims), re-ran Cases A–K plus
six additional adversarial targets (L–Q) this review added, and checked Engineering-composition,
technical/factual correctness, portability, and rejected-idea intrusion independently. Found six
Category B defects, all bounded — repairable inside the approved Stage-2 methodology, none requiring
a design amendment: (1) §0/§1 omitted the ordinary tier-B "read Engineering before editing" trigger
that §4's own table already required, stating only a failed-check trigger; (2) Route 3 (§2) described
tier C and tier D as a single "detect and hand off" procedure, contradicting §4's own Tier D row
(Read Engineering? N/A; Handoff? N/A; closes via local refusal) — now split into distinct per-tier
closures; (3) §6.A's "layout change of any kind" mandatory trigger contradicted the NOT REQUIRED
single-page/single-value carve-out immediately below it (upstream in Stage-2 §8 as well) — now stated
as the sole exception, not a competing rule; (4) §7's accessibility guidance stated `aria-hidden`/
`role="img"` as if both suppress decorative SVGs, which is technically incorrect (`role="img"`
*exposes*, it does not suppress) — inherited from Stage-2 §10, corrected without changing the
checklist's scope; (5) §13's "byte-sync verification" phrasing overclaimed relative to §9.C's own,
more precise "diff/compare confirming the same values" standard — reworded to match; (6) §0's stated
priority ordering claimed to be "unchanged from Engineering SKILL.md §0" while actually being a
compressed six-item paraphrase of Engineering's real ten-item list — replaced with a pure pointer,
removing the inaccurate restatement. All six were remediated in this session; post-remediation
re-review confirmed every UX-01–UX-16 ID, all Must-Survive safeguards, and Cases A–Q pass against the
current text. Full findings, verification detail, and the remediation diff:
`skills/study_archive/ux_ui/archive/UX_UI_SKILL_INDEPENDENT_REVIEW.md`. Pre-remediation snapshot:
`skills/study_archive/ux_ui/archive/SKILL_STAGE3_DRAFT.md`. **This version is final** as of this
pass.
