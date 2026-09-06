# Study Archive — UX/UI Skill Design Specification (Stage 2)

> **Status**: Stage-2 design only. Produces the controlling specification Stage 3 will build
> `skills/study_archive/ux_ui/SKILL.md` from. Does **not** create that file, does **not** modify the
> application, does **not** modify `skills/study_archive/engineering/SKILL.md`. See §14 for the exact
> next action.

**Session date**: 2026-08-19. **Primary empirical input**:
`skills/study_archive/ux_ui/archive/UX_UI_POST_PROJECT_ANALYSIS.md` (Stage 1, read in full — all
843 lines). **Governing Engineering boundary**: `skills/study_archive/engineering/SKILL.md` (v3,
FINAL, read in full — all 895 lines; §0, §1, §5, §7.5, §8, §9, §10 are load-bearing for this design).
**Targeted supporting context**: `docs/PROJECT_CONTEXT.md` table of contents cross-checked against
Stage-1's citations (§9–§16 section numbers confirmed unchanged); full body not reread, since Stage 1
already read those sections in full and this session found no ambiguity requiring re-verification.

---

## 1. Design Verdict

A future UX/UI Skill for Study Archive should be a **narrow, evidence-first specialist methodology**
that composes with Engineering by explicit reference, not duplication. Its central mechanism is not a
style guide — it's a **boundary classifier** (§4 below) that tells an agent, before it touches a single
pixel, whether the surface it's about to restyle has an attached invariant. Stage 1 already did the
hard empirical work of finding exactly where those attachments are (§10 of the analysis); this design
turns that map into a repeatable procedure plus a lightweight, proportional process router — deliberately
**not** a copy of Engineering's four-tier LOW/MEDIUM/HIGH/CRITICAL model, which Stage 1 already showed
would misclassify almost all real UX/UI work (analysis §12/§14).

---

## 2. Composition Principle (governs every section below)

Two files, two authorities, one ordering:

```
skills/study_archive/engineering/SKILL.md   ← Engineering (final, unchanged by this design)
skills/study_archive/ux_ui/SKILL.md         ← UX/UI (specialist, NOT created this session)
```

Priority when they conflict (unchanged from Engineering SKILL.md §0, restated here only as a pointer,
never re-derived): **data integrity → security/authorization/ownership → architecture/behavioral
contracts → functional behavior → accessibility/usability → visual/aesthetic preference.** A UX/UI
improvement never buys a lower layer's cost with a higher layer's coin.

The UX/UI Skill **never restates** Engineering's Core Invariants (§5), Risk Classification (§2), or
Lifecycle Router (§3) content. Wherever UX/UI work needs one of those, it names the section and says
"read it there" — this is itself Design ID UX-01 below, and it is the single most load-bearing
anti-duplication rule in this whole design, because Stage 1's own §12 names duplication-drift as a
named failure mode this Skill must not become an instance of.

**No auto-discovery.** Nothing about directory naming causes the Engineering Skill to load
automatically. The UX/UI Skill must state explicitly, as a Companion Skill Path (a named field in its
own Project Profile section, §12/UX-16), where to `Read` the Engineering Skill from — and must actually
issue that read, not assume its contents are already known, whenever a boundary check requires it.

---

## 3. Stage-1 Finding → Design Requirement Disposition

Every significant Stage-1 finding, classified per the task's required vocabulary (A–G).

| Stage-1 finding | Class | Disposition |
|---|---|---|
| Informal-but-real design system (tokens, `t()`, `avatar_html()`, visibility function) exists | B | Preserve-vs-Redesign ladder defaults to PRESERVE (§6/UX-03); Strengths list carried into Project Profile (UX-16) |
| Theme architecture: clean, near-total CSS-variable coverage | B | Same — named strength, not a defect to "fix" |
| Two dark-mode CSS blocks must stay synchronized (documented prior silent-drift incident) | E | Tier-B contract-preservation rule + mandatory both-path runtime verification (UX-11) |
| Spacing/type/breakpoint accretion, no token layer | C | NORMALIZE-tier candidate under the ladder (UX-03), not automatic; component/shared-pattern route (UX-02) if actually touched |
| Responsive sidebar gap (no collapse mechanism at all) | C | Shared/Systemic route, mandatory responsive verification (UX-06); explicitly not an Engineering matter (no invariant attached, analysis §11) |
| Table responsiveness inconsistency (3 wrapped, 1 not) | C | Shared-pattern route; NORMALIZE candidate; targeted, not systemic, regression (UX-14) |
| Button/action inconsistency (4 treatments; Delete styled 2 ways) | C | NORMALIZE candidate under the ladder; cross-page consistency check required (UX-14) |
| Badge semantic overload (4 colors / 5 meanings) | C | NORMALIZE/REFACTOR candidate only with explicit evidence of user-facing harm, not automatic (§6/UX-03); flagged in Project Profile as a known debt item, not silently fixed |
| Inline-style accumulation (61 occurrences) | C | Same tier as spacing/token gap — logged debt, not opportunistic global fix (Scope Discipline, UX-14) |
| Focus/accessibility gaps (:focus only on inputs, no `:disabled` CSS, no button focus rule) | D | Accessibility methodology (UX-07), mandatory runtime verification when focus behavior changes (UX-05) |
| ARIA/error-association gaps (zero `aria-` usage, no `aria-describedby`) | D | Same — UX/UI-owned (analysis §11 responsibility map: CONDITIONAL, no invariant conflict), claim-precision rule applies (UX-07) |
| Missing state vocabulary (no warning/info tone, no loading, no real `:disabled`) | D | State Coverage Matrix (UX-09), proportional — a project with no client-side layer doesn't get an invented Loading state |
| Localization-aware layout (TH/EN width risk, no defensive CSS) | C/D | UX/UI-owned layout-robustness rule (UX-10.A); runtime verification in both languages when layout could be affected (UX-05/UX-06) |
| Dynamic-message localization boundary (validation/flash bypass `t()`) | E | Cross-cutting → Engineering-escalation route (UX-10.B), matches Case F |
| `download.php` UX inconsistency (raw `exit()`, mixed-language, bypasses layout) | E | Contract-preservation tier (streaming/visibility endpoint) — Shared/Systemic route with mandatory boundary check before restyling, not a pure-cosmetic fix (analysis §18) |
| Login/Register deliberate scope boundaries (untranslated/unthemed) | F | Named explicitly as a documented Owner Decision in Project Profile (UX-16); STOP trigger if reopened (UX-13), matches Case G |
| Ownership/rank-gated controls (icon greying) | E | Tier-B contract-preservation, canonical worked example (UX-01/UX-12), matches Case E |
| Security-sensitive presentation (badges = visibility gate, not decoration) | E | Prohibited-shortcut list (UX-12): never color-only, never move enforcement into UI |
| Zero-runtime-evidence limitation (Stage 1 used none) | D | Runtime Inspection Policy (UX-05) exists specifically to close this gap going forward |
| Server-rendered / no-SPA interaction model (JS confined to 2 files) | F | Project Profile fact (UX-16); conditions Loading-state and "live validation" guidance (UX-09/portability note) |
| "Remember Me" non-functional, dead "Forgot Password?" link | G | Insufficient evidence of intended future behavior — logged as a known-issue instance in Project Profile, not a Skill rule; a UX/UI session that later touches `login.php` should notice it, not invent a fix silently |
| Single-university email hint vs. multi-university-aware server check (`profile.php`) | G | Same — logged instance, deferred; fixing it is content/logic work (hint text `+` possibly widening validation display) worth a bounded scope-check first, not auto-fixed as a byproduct of unrelated UX work |
| Avatar auto-submit-on-select, no preview/cancel | A | No Skill rule needed — this is a UX judgment call (should there be a confirm step?) with no recurring mechanism behind it; if requested, ordinary Local/cosmetic-to-workflow classification applies via the router, nothing special |

---

## 4. UX/UI Authority Model (adopted from analysis §10, made operational)

Four tiers, unchanged in substance from Stage 1's empirical finding — this design's job is only to
attach **procedure** to each, since the analysis already established the classification is correct.

| Tier | What belongs here | Evidence needed | Execute directly? | Read Engineering SKILL.md? | Handoff? | STOP? | Closes via |
|---|---|---|---|---|---|---|---|
| **A — UX/UI-owned** | Spacing, typography, non-semantic color, radius, shadow, icon choice, layout, hover/idle styling, `t()`-routed string wording, any change confined to `assets/css/style.css` outside the two theme blocks | Source inspection; runtime only if a mandatory trigger (UX-05) independently fires | Yes | No (unless a mandatory trigger elsewhere on this table also fires) | No | No | Targeted regression (UX-14) |
| **B — UX/UI with contract preservation** | Two dark-theme CSS blocks; ownership/role-gated icon greying; visibility/status badges; settings' next-load-only behavior; `avatar_html()` rendering | Source inspection **plus** a named contract check (what must stay true) **plus** runtime verification proving the contract held | Yes, once the contract check is written down and passes | Yes — read the specific §5 invariant or §10.B-equivalent fact the contract rests on, before editing | No, unless the contract check fails | No, unless the contract check fails (then escalate to C) | Contract-preservation verification named explicitly in the completion report, not implied by "looks fine" |
| **C — Cross-skill / Engineering dependency** | Translating dynamic validation/flash messages; extending theme/translation to Login/Register; changing `theme_preference`'s default; anything changing *whether* a gate fires | N/A — UX/UI does not gather implementation evidence here | No | Yes — read Engineering SKILL.md §2/§3 in full before proceeding | **Yes, mandatory** | **Yes** — UX/UI session stops, records the finding | Engineering's own lifecycle (SKILL.md §3), not this Skill |
| **D — Prohibited UX shortcut** | Removing a disabled/greyed state "because the server checks anyway"; color-only badge redesign; simplifying the two theme blocks into one without independently re-verifying both activation paths; adding a request-trusted ownership/identity field for convenience | N/A | **Never** | N/A | N/A | **Yes, immediately, no partial execution** | Refuse; explain why in the response; offer the tier-B-compliant alternative if one exists |

**Test against Stage-1 examples** (analysis §10, all four): icon-greying restyle → B, passes cleanly
(this is Case E, §11 below). Dark-mode palette change → B (Case H). Translating flash messages → C
(Case F). "Simplify the two theme blocks into one" → D, refused outright regardless of how the request
is phrased. The authority ordering (§2 above) is never weakened by any of the above — tier B's contract
check exists precisely to enforce it operationally.

---

## 5. UX/UI Change Router

Three routes — collapsed from the five candidate dimensions in analysis §14, per that section's own
suggestion that responsive/accessibility work "can largely fold into component-level," and per the
task's explicit instruction to avoid inventing five categories merely because five were listed as
candidates.

### Route 1 — Local / Cosmetic
Single component, single file (or a self-contained edit inside `style.css` outside the two theme
blocks), no shared pattern reused elsewhere is structurally changed, tier A only.

- Minimum investigation: read the one file/component.
- Design/planning: none beyond stating the change.
- Implementation scope: exactly the named surface.
- Runtime verification: only if a UX-05 mandatory trigger independently fires (e.g. the "single
  component" happens to be a shared card style — then it's not actually Route 1, see below).
- Responsive/accessibility/cross-page checks: not required unless a trigger fires.
- Independent Review: not required — self-check (§9's targeted regression) suffices.

### Route 2 — Shared Pattern / Workflow / Systemic
Anything touching a component or pattern reused across pages (badges, buttons, tables, cards, nav),
any multi-step interaction/workflow change, any responsive or accessibility change with a footprint
wider than one page, or any tier-B contract-preservation surface.

- Minimum investigation: reconstruct the *current* pattern across every page that uses it (analysis
  §9 found shared concepts are not always implemented via one shared component — verify this before
  assuming a one-place fix covers every instance).
- Design/planning: state the preserve-vs-redesign level (§6/UX-03) explicitly before implementing.
- Implementation scope: the shared surface plus every page instantiating it, unless Scope Discipline
  (§10/UX-14) narrows it with a stated reason.
- Runtime verification: **mandatory** (UX-05).
- Responsive verification: required if layout is affected (UX-06).
- Accessibility verification: required if interaction/focus/labeling is affected (UX-07).
- Cross-page consistency check: **mandatory** — this is this route's defining extra step over Route 1.
- Engineering-contract check: mandatory if any touched surface is tier B or higher (§4).
- Independent Review: recommended; **required** if a tier-B contract surface was touched, mirroring
  Engineering §8's own escalation pattern for Core-Invariant-adjacent MEDIUM work.

### Route 3 — Engineering Escalation
Anything landing in tier C or D (§4). This route's only job is to **detect the landing and hand off**
— it does not process the change itself.

- Investigation stops at classification.
- STOP (§11/UX-13): record the finding, read Engineering SKILL.md §2/§3, route via its own machinery.
- No UX/UI implementation occurs in this route.

**Routing test**: dashboard card spacing (Case A) → Route 1. Delete-button normalization across pages
(Case B) → Route 2 (shared pattern, no tier-B surface, Independent Review recommended not required).
Sidebar mobile collapse (Case C) → Route 2 (systemic, mandatory responsive verification, no Engineering
escalation — no invariant attached). Focus/error-accessibility (Case D) → Route 2 (accessibility
footprint spans forms sitewide). Disabled-state restyle (Case E) → Route 2, tier B, Independent Review
required. "Translate all error messages" (Case F) → Route 3. Login/Register redesign (Case G) → Route 3
(reopens a §10.C Owner Decision). Dark-mode palette (Case H) → Route 2, tier B. "Make the whole site
modern" (Case I) → blocked at the Preserve-vs-Redesign gate (§6) before a route is even assigned, since
no route authorizes unlimited scope from a vague request. DB/schema requirement discovered mid-change
(Case K) → Route 3, immediate STOP.

---

## 6. Preserve vs. Redesign — the Scope Ladder (UX-03)

Five rungs, ascending authorization requirement. An agent may only climb to a rung whose evidence bar
is met — never by default, never from aesthetic preference alone.

| Rung | What it means | Evidence required to be *at* this rung |
|---|---|---|
| **PRESERVE** | Change nothing; extend understanding only | Default rung for any request that doesn't name a specific defect |
| **EXTEND** | Apply an existing, evidenced pattern to a new surface (e.g. use the existing card-grid idiom for a new list) | The pattern already exists and is reused elsewhere (analysis §4/§16 "Strengths") — citing it is sufficient |
| **NORMALIZE** | Fix a named, evidenced inconsistency within the existing visual language (e.g. the Delete-button divergence) | A specific, citable inconsistency (analysis §9's LOCAL/REPEATED/SYSTEMIC vocabulary, or freshly found and stated the same way) — not "this could be nicer" |
| **REFACTOR** | Introduce a new shared mechanism replacing duplicated implementations (e.g. consolidate `.auth-card`/`.subject-card`/`.file-card` into one base class) | Repeated/systemic evidence that duplication is causing *drift* (components re-solving the same problem slightly differently), or an explicit Project Owner request naming this scope |
| **REDESIGN** | Change the visual language itself (palette philosophy, layout paradigm, component vocabulary) | **Explicit, recorded Project Owner redesign intent** — never inferred from a vague aesthetic request. A request like "make the dashboard prettier" or "make the whole site modern" caps at NORMALIZE/EXTEND by default; reaching REDESIGN requires asking the Owner what's actually driving the request and getting a scoped answer, exactly the way Engineering SKILL.md §9 treats a genuinely ambiguous business question |

This directly answers analysis §20's design question ("what's the actual decision rule for
preserve-vs-redesign") and is the mechanism that makes Case I pass: a vague request cannot self-issue
its own authorization to climb the ladder.

**Scope-expansion prevention**: climbing a rung is a per-request decision, not a standing grant — a
session authorized to NORMALIZE the Delete button doesn't thereby gain standing authorization to
NORMALIZE the badge system too, even if it's noticed along the way (Scope Discipline, §10/UX-14).

---

## 7. UX/UI Investigation / Evidence Loop (UX-04)

```
request
  → surface inventory        (which file(s)/page(s)/component(s) does this actually touch?)
  → pattern reconstruction   (what's the existing convention here — cite it, don't assume)
  → boundary classification  (§4: which tier — A/B/C/D)
  → route selection          (§5: Local / Shared-Systemic / Engineering-Escalation)
  → scope-ladder rung        (§6: Preserve/Extend/Normalize/Refactor/Redesign)
  → evidence gathering       (source always; runtime per §8's trigger policy)
  → implementation           (bounded to the declared footprint, §10/UX-14)
  → verification             (targeted regression always; cross-page if Route 2; contract check if tier B)
  → completion report        (§13)
```

Distinct from Engineering's investigation loop (SKILL.md §4) in one structural way: Engineering's loop
exists to find root cause of a *defect*; this loop exists to classify a *request* before any pixel
moves, because the classification — not the implementation — is where this domain's real risk lives
(analysis §12: "visual change altering authorization behavior" is the highest-confidence failure mode,
and it's caught at classification, not at code-review time).

**Evidence types this loop draws on**, matched to the claim they can support:

| Evidence type | Answers |
|---|---|
| Source read | "Does this pattern exist elsewhere? What does the current markup/CSS actually say?" |
| Grep for absence | "Is this component/rule genuinely absent, or did I just not find it?" (mirrors analysis's own method) |
| Runtime render | "What does this actually look like once the browser resolves cascade/media queries?" |
| Viewport resize | "Does this hold at narrow/medium/wide?" |
| Theme toggle (both paths) | "Do both dark-mode activation paths still agree?" |
| Language toggle | "Does this hold with the other language's string lengths?" |
| Keyboard-only pass | "Is this operable and visibly focused without a mouse?" |
| Before/after screenshot | "Did the contract-preserved surface actually stay preserved, not just 'look right'?" |

---

## 8. Runtime Visual Inspection Policy (UX-05)

Closes Stage 1's largest named limitation (analysis §17: zero runtime evidence used throughout).

**MANDATORY** (must not skip; must not substitute source-reasoning for the check):
- Layout change of any kind.
- Responsive change (new/modified breakpoint behavior).
- Typography or spacing change on a component reused across ≥2 pages.
- Color/contrast change.
- Any edit inside either of the two theme-activation blocks (both paths, always, no exception — this
  is the single highest-probability place a UX/UI edit breaks something invisibly, per analysis §10.B).
- Focus/keyboard-behavior change.
- Any language-affecting layout claim ("this won't overflow in Thai/English").
- Any accessibility claim made in a completion report.
- Every Route 2 (Shared/Systemic) change, regardless of which sub-trigger above applies.

**RECOMMENDED** (do it unless a specific reason not to is stated):
- A Route 1 cosmetic change to a component that happens to appear on more than one page — sample 1–2
  representative instances rather than the whole site.

**NOT REQUIRED / source alone suffices**:
- A single-page, single-value cosmetic tweak with no shared-component footprint (e.g. one page's
  margin value).
- A pure wording change to a string that already routes through `t()` (content, not layout, unless the
  new string is meaningfully longer — then the language-layout trigger above applies).

**Proportional sampling, not exhaustive crawling**: when a mandatory trigger fires on a shared
component, verify representative instances (one per distinct page-layout context the component
appears in), not literally every page in the app — the Stage-1 surface inventory (analysis §3) is the
reference list for what "representative" means for this project.

---

## 9. Responsive Verification (UX-06)

**Portable minimum — three viewport classes**, independent of any project's specific breakpoints:

| Class | Approximate width | Verifies |
|---|---|---|
| Narrow | ~375–420px | Mobile-equivalent stacking, overflow, touch-target sizing |
| Medium | ~768px | Tablet-equivalent transition zone — where most breakpoint bugs actually surface |
| Wide | ~1280px+ | Desktop layout, whatever the project's max meaningful content width is |

**Project's exact breakpoints** (Study Archive instance: `520px`, `760px`, `800px`, `900px` — see
Project Profile, UX-16) are tested precisely, in addition to the three classes above, only when the
change touches a component whose authored breakpoint sits at one of those exact values — otherwise the
three-class sweep is sufficient evidence.

**Overflow checks**: required whenever a fixed-width element (badge, nav item, button) sits near
translated or otherwise dynamic-length text — this converts analysis §6/§9's named *risk* (no defensive
CSS exists to prevent overflow) into an actual pass/fail per change, without requiring a blanket sweep
of every fixed-width element in the app up front.

**Touch-target checks**: required for any new/changed interactive control, evaluated at the Narrow
class. Not evaluated at all for a project confirmed to have no touch-driven usage pattern.

**Orientation**: not a Study Archive concern today (no evidence of orientation-dependent layout); a
portable Skill still names this as a class to check *if* a project's evidence base ever shows
orientation-sensitive layout.

**Evidence recording**: runtime browser tool screenshots/viewport resizes, referenced in the
completion report by viewport class and what was observed — not merely asserted as "checked responsive
behavior."

---

## 10. Accessibility Methodology (UX-07)

Bounded to what analysis §7 actually found evidence for, reusing Engineering §7.5's evidence-claim-
precision philosophy rather than duplicating its machinery.

**In scope** (each maps to a Stage-1-confirmed gap or strength):
- Semantic element preservation (don't regress native `<a>/<button>/<input>` usage — analysis §7 found
  this is currently a genuine strength; don't introduce `onclick`-on-`<div>`/`tabindex` misuse).
- Labels / accessible names (block-level `<label for>` is the existing pattern; `title`-only is a
  known, named gap — analysis §7).
- Keyboard operability (native elements only; verify tab order after any interactive-markup change).
- Focus visibility (the app-wide input-focus-outline removal is a known finding — any focus-affecting
  change requires the runtime mandatory trigger, UX-05).
- Error association (`aria-describedby`/`aria-invalid` — currently absent everywhere; adding it to a
  form you're already touching for another reason is in-scope; retrofitting it sitewide as an
  unrelated byproduct is not, per Scope Discipline).
- Color dependence (status must stay color **+** text/icon, never color-only — this is also a tier-D
  prohibited shortcut when applied to a security-relevant badge, §4/UX-12).
- Contrast verification (requires runtime — never claimed from source reasoning alone).
- Heading semantics (single `<h1>` per page is the existing pattern — preserve it).
- Image/decoration semantics (`alt` on meaningful images; `aria-hidden`/`role="img"` suppression on
  purely decorative SVGs — the logo-mark gap is a named instance).
- Reflow/zoom (folds into UX-06's viewport sweep — no separate mechanism needed).
- Dialog/modal behavior — not applicable today (no themed modal exists); apply this item only if a
  future change introduces one.

**Claim-precision rule** (adapted from Engineering SKILL.md §7.5, not duplicated in full — referenced):
every accessibility claim in a completion report states, in the same sentence or the next one, **WHAT**
was checked (which fields/components/pages, not "the form"), **HOW** (source read vs. runtime keyboard
pass vs. contrast measurement), and **WHAT it proves** at its narrowest true scope.

**Ban list**: never state or imply "WCAG [A/AA/AAA] compliant" from source inspection or a partial
checklist — that is exactly the overclaiming pattern Engineering §7.5 names and bans for its own domain
("byte-identical," "zero dependency"); this Skill's equivalent banned phrase is any unqualified
accessibility-compliance claim. State the specific checks performed instead.

---

## 11. Component / Design-System Policy (UX-08)

**General methodology** (portable): use CSS custom properties / design tokens rather than hardcoded
values in any new or edited component; prefer the existing single-mechanism-many-callers pattern
(analysis §16 names four: elevation token, visibility-filter function, avatar-rendering function,
badge component) over inventing a parallel implementation; a new component composes existing tokens
before introducing a new one.

**Project-specific profile vs. portable methodology**: kept separate, per the task's explicit
instruction not to hard-code Study Archive's exact colors/pixels/breakpoints into portable rules.
**Decision**: project-specific facts live in a compact **Project Profile section inside the future
`ux_ui/SKILL.md` itself** (§12/UX-16) — not a separate document, not a generated design-token registry.

Reasoning: Engineering SKILL.md already solved this exact problem for its own domain with a
principle-first/instance-tagged structure inside one file (v3 note, §0's opening framing) rather than a
second artifact; a separate "project design profile" document would itself become a fifth thing to keep
in sync (the same class of drift risk Engineering's own §9 "four-way separation" rule exists to
prevent). A compact, clearly-labeled section is the smallest maintainable solution and matches the
task's explicit "avoid creating unnecessary documents" instruction.

**Not building**: a giant design-token registry, a generated style-guide document, or a component
catalog with exhaustive specimens — Study Archive doesn't have a formal token layer to catalog yet
(analysis §9's single largest debt item), and building an aspirational one the app doesn't use would
itself be REFACTOR/REDESIGN-tier work requiring the ladder's evidence bar (§6), not a Skill-authoring
default.

---

## 12. State Coverage Policy (UX-09)

Reusable matrix — **applicability-gated**, not mandatory-everywhere:

`default · hover · focus · active · disabled · loading · empty · success · warning · info · error ·
destructive · permission-unavailable`

Procedure: for the component/surface actually being touched, ask **"which of these states are
applicable here?"** — then verify only those, at the depth the route (§5) requires. A static content
block doesn't need a loading state considered at all. A project with no client-side interaction layer
(Study Archive, per analysis §13) does not get a Loading state invented as a byproduct of unrelated
work — introducing one is REFACTOR-tier architecture work (§6), requiring the same evidence bar as any
other architectural addition, and very likely Route 3 if it implies a new client-side pattern the
project doesn't currently have.

Two states carry an explicit tier-D caveat (§4): removing a **disabled** state from an
ownership/role-gated control is prohibited regardless of how the state is restyled (the state itself is
part of a contract, not decoration); encoding **destructive** exclusively via color is likewise
prohibited on any state that gates real data/access, not just styled as a suggestion.

---

## 13. Localization-Aware UX Policy (UX-10)

Two independent questions, kept structurally separate (this is the mechanism that makes Case F route
correctly):

**A. Layout behavior under translated strings** — UX/UI-owned. Does a fixed-width element hold up
against the other language's string length? Verified via UX-06's runtime language-toggle check
whenever a layout claim is made. Editing an existing `t()`-routed string's *value* is tier A,
regardless of language.

**B. Whether application logic routes a string through the translation infrastructure at all** — may
be UX/UI-owned (wrapping one already-isolated hardcoded string in `t()`, a mechanical one-site change)
or Engineering-touching (retrofitting many conditionals across the codebase — analysis §10.C's
explicit example: "would mean touching nearly every conditional"). The distinguishing test: **does this
request touch one call site, or does it imply a systematic sweep across many independent conditionals?**
The former stays Route 1/2; the latter is a Route 3 cross-cutting change, full stop, regardless of how
the request is phrased ("just translate the errors" and "retrofit i18n across all validation" are the
same underlying request and route identically).

Thai/English are named throughout this design only as **Study Archive's concrete instance** of A/B —
a portable Skill states the A/B split generically; a project with only one language skips this section
entirely.

---

## 14. Theme-Aware Design Policy (UX-11)

**General, portable rule**: use design tokens/variables, never hardcoded semantic color values, for
any theme-aware component. Every supported theme activation path must be independently verified after
a theme-touching change — never assume one path's correctness implies the other's. Distinguish explicit
user-selected theme from OS/system-preference-driven theme where a project supports both, since they
can diverge silently if only one is tested.

**Study Archive's concrete instance** (tagged, not generalized): two theme-activation source blocks
(`@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]`) must stay in agreement after any
edit. This is not merely a style preference — analysis §10.B documents a real prior incident where a
`replace_all` edit silently updated only one block due to differing indentation. The operational rule:
**any edit inside either block requires, before the change is considered done, an explicit diff/compare
of both blocks confirming they still express the same values** — this is the UX-05 mandatory-runtime
trigger for this specific surface, and it is never satisfied by "the CSS looks right" alone.

---

## 15. Destructive / Security-Sensitive UX (UX-12)

UX/UI owns **communication and presentation**. Engineering owns **enforcement**. This design adopts
analysis §10.D's prohibited-shortcut list verbatim as binding rule, not merely as illustrative example:

**Explicitly forbidden, unconditionally**:
- Moving an authorization decision into client-side/UI logic.
- Weakening or hiding a server-side enforcement mechanism to simplify presentation.
- Changing a backend decision merely to make presentation easier (e.g. altering what a query returns
  so the UI has less conditional logic to render, when the alteration changes who sees what).
- Encoding security-relevant state (visibility, ownership, role) via color alone, with no
  text/icon/other independent signal.
- Introducing any request-trusted identity/ownership field for UI/form convenience — Study Archive's
  concrete precedent (analysis §12/PROJECT_CONTEXT §9): there is deliberately no `uploaded_by` field in
  the upload form; "the bypass is architecturally impossible, not merely validated away."

**The handoff rule**: when a genuine presentation improvement requires the backend to expose new
information it doesn't currently return (e.g. a differentiated disabled-university error message needs
the server to distinguish that case, which it currently deliberately does not — analysis §5 Journey A),
that is not a UX/UI fix with a backend dependency; it is a Route 3 Engineering-escalation, full stop,
because the *decision* to differentiate is itself security-relevant (oracle-leak territory, per analysis
§5 Journey B's explicit "no oracle leak" note on the adjacent not-found case).

---

## 16. UX/UI STOP Conditions → Engineering Handoff (UX-13)

STOP — record the finding, `Read` the Engineering SKILL.md path from the Project Profile (UX-16), and
route via its §2/§3 machinery — whenever:

- Backend behavior, endpoint semantics, or a server-side decision must change to satisfy the request.
- Authorization/ownership/visibility logic must change (not merely its presentation).
- A schema or persisted-data contract must change.
- A persisted setting's semantics or default must change (e.g. `theme_preference`'s default).
- A security-relevant response's semantics must change (e.g. differentiating two currently-identical
  error responses).
- A documented Project Owner scope decision would be reopened (Login/Register's theming/translation
  exclusion is the concrete Study Archive instance).
- The desired result requires a new client-side architecture or framework the project doesn't have.
- The requested interaction cannot be implemented without touching an Engineering Core Invariant (§5
  of the Engineering Skill).
- A change classified Route 2 fails its tier-B contract check (§4) — the failure itself is the trigger.

This list is **UX/UI-specific**, distinct from Engineering's own STOP list (SKILL.md §11) by design —
it exists to catch the moment a *presentation* request crosses into Engineering territory, which
Engineering's own STOP conditions (phrased for schema/RBAC/backup context) don't name from the UX side.

---

## 17. Multi-Skill Composition Rule (folded into UX-01)

Because Study Archive doesn't auto-discover Skills by folder convention, the UX/UI Skill names its
companion path as an explicit, single field:

```
Companion Engineering Skill: skills/study_archive/engineering/SKILL.md
```

Any UX/UI session reaching Route 3 (§5) or a failed tier-B check (§4) must issue an actual `Read` of
that path before proceeding — never assume the Engineering Skill's contents from memory of an earlier
session, matching Engineering's own §1 hard rule about never trusting a stale recollection over live
state. A portable version of this Skill (§18) replaces the field's value with whatever companion
Engineering-equivalent methodology the target project uses, or leaves it empty with an explicit note
that no such companion exists yet.

---

## 18. Implementation Scope Discipline (folds into UX-14)

Adopts Engineering SKILL.md §10 by direct reference, restated only at the boundary this domain adds:

- A discovered issue **outside** the current change's declared footprint is logged/deferred (Project
  Profile's "known debt" list, UX-16), never folded into the current change.
- **Exception**: only when leaving it unfixed would make the *current* change internally inconsistent
  — e.g., normalizing Delete-button styling on a page that itself has two different Delete-button
  treatments is in-scope for that page; a third page's unrelated Delete-button inconsistency is not,
  and gets logged instead.
- "Make it prettier while I'm in here" is never, by itself, sufficient authorization to expand a
  Route-1 change into a Route-2 one — the router (§5) and the ladder (§6) are re-evaluated, not
  silently overridden, if the agent notices a bigger opportunity mid-change.

---

## 19. UX Regression Model (UX-14)

Two distinct checks, required at different routes:

**Targeted UX regression** (always required, every route): the changed surface renders correctly —
across every theme/language/state actually applicable to it (UX-09/UX-10/UX-11) — at the viewport
classes a mandatory trigger required (UX-06), with no new console/layout error, and with the
contract-preservation check (§4, tier B) passing if applicable.

**Cross-page / systemic UX regression** (required whenever Route 2 applies, §5): every other page that
independently implements the same shared visual concept (not just the one edited) is re-checked — this
directly closes analysis §9's finding that shared concepts aren't always implemented via one shared
component, so a fix in one place can silently leave siblings inconsistent or, worse, visually diverged
in a way that looks like a *new* bug.

Both checks are distinct from Engineering-contract preservation (§4/UX-01), which is a boundary check
("did I cross into tier C/D"), not a visual-correctness check — a change can pass both regression checks
and still fail the boundary check, and vice versa; neither substitutes for the other.

---

## 20. Independent UX/UI Review Policy (UX-15)

Not copied mechanically from Engineering's "required before every HIGH/CRITICAL phase" rule (analysis
§21 explicitly warns against this) — proportional to the router instead:

| Route | Independent Review |
|---|---|
| Local/Cosmetic | Not required — self-check (targeted regression) suffices |
| Shared Pattern/Systemic, tier A surfaces only | Recommended |
| Shared Pattern/Systemic, tier B surface touched | **Required** — mirrors Engineering §8's own escalation pattern for Core-Invariant-adjacent work |
| Engineering Escalation | Not this Skill's to require or waive — governed entirely by Engineering SKILL.md §8 once handed off |

**The UX/UI Skill's own creation lifecycle** (this document's own concern, per the task's explicit
instruction) retains the same four-stage shape that has already proven itself for Engineering's Skill
authorship: **Analysis (done, Stage 1) → Design (this document) → Creation (Stage 3) → separate
Independent Skill Review**, with the creating/rewriting session excluded from certifying its own output
— identical reasoning to Engineering SKILL.md §8's last bullet, restated here because it is a fact
about *this* Skill's own governance, not a fact this Skill inherits by reference from Engineering's
text.

---

## 21. Token / Context Efficiency Strategy

- Inspect only the changed surface first; expand only when the router (§5) or a mandatory trigger
  (UX-05) requires more.
- The Project Profile section (UX-16) exists specifically so recurring facts (breakpoint values, theme
  block locations, the badge semantic map) are cited, not re-derived, each session.
- Sample viewports/languages/themes proportionally (UX-06/UX-05) rather than exhaustive matrices,
  unless a mandatory trigger specifically requires the full set.
- Delta reporting: a session resuming known-unchanged Project Profile facts states "unchanged since
  [date/session]" rather than re-narrating them.
- **Hard limit** (mirrors Engineering §7.6's own non-negotiable line): none of the above ever justifies
  skipping a UX-05 mandatory runtime check, a tier-B contract check, or declaring an untested
  viewport/theme/language/accessibility claim as passed. Efficiency governs *how* evidence is reused
  and reported, never *whether* it's gathered.

---

## 22. Portability Classification

| Rule / mechanism | Class |
|---|---|
| Authority ordering (§2), four-tier boundary model (§4) | A — general (tiers B/C/D's *examples* are C, instances) |
| Change router, 3 routes (§5) | A |
| Preserve-vs-redesign ladder (§6) | A |
| Investigation loop (§7) | A |
| Runtime inspection trigger *categories* (§8) | A |
| Study Archive's specific trigger instances (theme blocks, `.icon-btn` etc.) | C |
| 3-viewport-class responsive strategy (§9) | A |
| Study Archive's exact breakpoints (520/760/800/900px) | C |
| Accessibility methodology + claim-precision rule (§10) | A |
| Component/token policy + "profile lives in-Skill" decision (§11) | A |
| State coverage matrix + applicability-gating (§12) | A |
| Study Archive's actual state gaps (no `:disabled` CSS, no Loading) | C |
| Localization A/B split (§13) | A |
| Thai/English as the concrete instance | C |
| Theme-token general rule (§14) | A |
| The two-block byte-sync requirement | C |
| Destructive/security-UX prohibitions (§15) | A |
| The `uploaded_by`-field precedent | C |
| STOP conditions, general shapes (§16) | A |
| Login/Register scope-decision instance | C |
| Companion Skill Path mechanism (§17) | A |
| The literal path string to Engineering SKILL.md | B (project-specific config, not a fact *about* SA) |
| Scope discipline exception clause (§18) | A |
| Targeted vs. cross-page regression (§19) | A |
| Independent Review proportionality table (§20) | A |
| Skill's own creation-lifecycle requirement (§20, last part) | A |

**Portability result**: every normative mechanism is class A; every Study-Archive fact is either C
(a concrete instance illustrating a portable rule) or B (a swappable config value, the companion path).
D (a hard Engineering-Skill dependency with no portable equivalent) does not occur as its own row
because every Engineering dependency is expressed as a *reference* (§2/§17), never inlined — there is
nothing left to classify D once duplication is structurally prevented. A future project with no RBAC,
no multi-tenancy, no Thai/English, no dark/system themes can use every A-class section unchanged, skip
every C-class instance (they won't apply), and replace the single B-class path.

---

## 23. Proposed `ux_ui/SKILL.md` Information Architecture

| Section | Purpose | Stage-1 pressure | Content type | Engineering dependency | Size |
|---|---|---|---|---|---|
| §0 Mission / Authority / Companion Skill | Priority ordering, companion path field | §10 (boundary), §12 (duplication risk) | Normative (A) + config (B) | Referenced | SMALL |
| §1 Source & Evidence Hierarchy | What to read, in what order, for a UX/UI task | §2/§17 | Normative (A) | Referenced | SMALL |
| §2 Change Router | The 3 routes (§5 of this doc) | §14 | Normative (A) | None | MEDIUM |
| §3 Preserve-vs-Redesign Ladder | The 5-rung scope gate (§6 of this doc) | §20 (design question) | Normative (A) | None | SMALL |
| §4 UX/UI ↔ Engineering Boundary | The 4-tier authority model (§4 of this doc) | §10 (the load-bearing section) | Normative (A) + instances (C) | **Heavy — this is the composition point** | MEDIUM–LARGE |
| §5 Investigation / Evidence Loop | The procedure (§7 of this doc) | §15 | Normative (A) | None | SMALL |
| §6 Runtime & Responsive Verification | Trigger policy + viewport strategy (§8/§9 of this doc) | §6/§15/§17 (largest limitation) | Normative (A), instances (C) tagged | None | MEDIUM |
| §7 Accessibility | Bounded methodology + claim-precision (§10 of this doc) | §7 | Normative (A) | Pointer to §7.5's claim-precision pattern only | MEDIUM |
| §8 Components / Design System | Token policy, where the profile lives (§11 of this doc) | §4/§9 | Normative (A) | None | SMALL |
| §9 States / Localization / Theme | Matrix + A/B split + two-path rule (§12–14 of this doc) | §8/§9 | Normative (A), instances (C) tagged | None | MEDIUM |
| §10 Destructive / Security-Sensitive UX | Prohibitions + handoff rule (§15 of this doc) | §10.D | Normative (A), one instance (C) | Referenced | SMALL–MEDIUM |
| §11 STOP Conditions | The UX-specific STOP list (§16 of this doc) | §10.C/D | Normative (A) | Referenced | SMALL |
| §12 Scope Discipline / Regression / Review | §18–20 of this doc combined | §12/§19/§21 | Normative (A) | Pointer for Route-3 handoff only | MEDIUM |
| §13 Project UX/UI Profile | Study Archive's concrete instances, all C/B facts | Throughout | Instance data only | None | MEDIUM |
| §14 Version History | This design's provenance | — | Historical pointer | None | SMALL |

Deliberately **not append-only**: §4 (Boundary) and §13 (Profile) are the two sections expected to
accumulate new concrete instances over time as new tier-B/C surfaces are discovered; every other
section states a mechanism once and stays stable, matching Engineering's own "rarely changes" framing
for its methodology sections.

---

## 24. Size Target

**Estimate: 380–480 lines** for the eventual `ux_ui/SKILL.md` — meaningfully smaller than Engineering's
~895, and deliberately not calibrated to match it. Rationale: this domain has one router (3 routes, not
4 tiers with a lifecycle table), one boundary model (4 tiers, directly adopted not re-derived), one
ladder, and one profile section — no equivalent of Engineering's Change Execution Protocol (§6),
Phase Contract (§9), or multi-page backup/rehearsal machinery (§7.1/§7.2) exists in this domain, because
UX/UI work in this project is never itself schema/DDL-shaped; when it would be, it's Route 3 and
Engineering's machinery applies instead, referenced not duplicated. The target optimizes for decision
quality per unit of context (task §25's stated goal) — every section above earns its size from a named
Stage-1 pressure (§3 table), not from mirroring Engineering's structure for its own sake.

---

## 25. UX/UI Skill Design Change Specification

| ID | Domain | Empirical Pressure | Design Decision | Engineering Interaction | Context Cost | Creation Instruction | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| **UX-01** | Mission / Authority / Composition | Analysis §10, §12 (duplication risk), §18 (auto-discovery) | Priority ordering by reference; explicit Companion Skill Path field; never restate Engineering content | Referenced by path, read on demand | SMALL | Write §0 stating the 6-layer priority ordering by pointer (not copy) and the literal companion path | SKILL.md contains zero restated Core Invariant text; contains one explicit `Read`-triggering path string |
| **UX-02** | Change Router | Analysis §14 | 3 routes (Local / Shared-Systemic / Engineering-Escalation), collapsed from 5 candidates | Route 3 hands off entirely | MEDIUM | Write §2 with the routing table + worked Case A/B/C mini-examples | All 11 validation cases (§26) route to the intended lane when re-tested against the written SKILL.md text |
| **UX-03** | Preserve-vs-Redesign | Analysis §20 (open design question) | 5-rung ladder; REDESIGN requires explicit recorded Owner intent | None directly; REDESIGN-adjacent Owner Decisions may overlap Engineering §9's protocol | SMALL | Write §3 with the ladder table and the "vague request caps below REDESIGN" rule stated as binding | Case I (vague "modernize" request) cannot reach REDESIGN per the written rule alone |
| **UX-04** | Boundary Model | Analysis §10 (the load-bearing section) | Adopt the 4-tier A/B/C/D model verbatim in substance; attach procedure (evidence/execute/read-Engineering/handoff/STOP/closure) to each | Tier C/D both require reading Engineering SKILL.md §2/§3 | MEDIUM–LARGE | Write §4 as the largest normative section; include the theme-block and icon-greying worked examples from analysis §10 as citable instances | Tier assignment for every §10 analysis example matches this design's §4 table |
| **UX-05** | Investigation Loop | Analysis §15 (verification-needs list) | 9-step loop; evidence-type table | None structurally different from what §4 already requires | SMALL | Write §5 as a compact numbered pipeline | Loop is traceable step-by-step against any of the 11 validation cases |
| **UX-06** | Runtime Inspection Policy | Analysis §17 (zero runtime evidence used) | MANDATORY/RECOMMENDED/NOT REQUIRED trigger lists | Theme-block trigger is itself tier-B, so overlaps §4 | MEDIUM | Write §6a as an explicit trigger table, not prose | Every analysis §7 "REQUIRES RUNTIME VERIFICATION" item maps to a MANDATORY trigger in the written table |
| **UX-07** | Responsive Verification | Analysis §6 (LIKELY FROM SOURCE / UNVERIFIED findings) | 3 portable viewport classes + project-exact-breakpoint condition | None | MEDIUM | Write §6b with the viewport table and overflow/touch-target sub-rules | Sidebar-collapse case (Case C) is fully specifiable using only this section's rules |
| **UX-08** | Accessibility | Analysis §7 | Bounded 10-item checklist + claim-precision rule + ban list | Claim-precision pattern referenced from Engineering §7.5, not copied in full | MEDIUM | Write §7 with the checklist and an explicit banned-phrase list | No item in the written checklist claims a WCAG conformance level |
| **UX-09** | Component / Design-System | Analysis §4, §9 | General-token methodology; profile lives in-file, not a separate document | None | SMALL | Write §8 stating the "compose existing tokens first" rule and pointing to §13 for instances | SKILL.md contains no standalone token registry file reference |
| **UX-10** | State Coverage | Analysis §8 | Applicability-gated matrix; Loading conditioned on client-side-layer existence | None | SMALL–MEDIUM | Write §9a with the 13-state list and the applicability-question framing | Loading state is never required for a project with server-rendered-only interaction, per the written conditional |
| **UX-11** | Localization Boundary | Analysis §5 Journey D/I, §9, §10.C | A (layout)/B (infrastructure) split; one-site vs. many-conditional test | B-classified requests route to Engineering | SMALL–MEDIUM | Write §9b with the A/B split and the routing test as one sentence each | Case F ("translate all remaining error messages") classifies as B per the written test |
| **UX-12** | Theme Verification | Analysis §10.B, §4 Color findings | Portable single-source-of-truth principle + SA's two-block sync instance | Theme-block edits are tier B, cross-referenced to §4 | SMALL–MEDIUM | Write §9c with the general rule first, instance second, explicitly tagged | Case H (dark-mode palette change) requires both-block verification per the written rule alone |
| **UX-13** | Destructive / Security-Sensitive UX | Analysis §10.D | Prohibited-shortcut list; handoff rule for backend-info-gap requests | Handoff rule routes to Route 3 | SMALL–MEDIUM | Write §10 with the 5-item prohibited list verbatim from this design's §15 | Case E (disabled-state restyle) passes without weakening the underlying gate, per the written rule |
| **UX-14** | STOP Conditions | Analysis §10.C/D, §20 | 9-condition UX-specific STOP list, distinct from Engineering's own §11 | Every STOP reads Engineering SKILL.md before proceeding | SMALL | Write §11 as a flat trigger list, each ending in "→ read Engineering SKILL.md §2/§3" | Case K (accidental schema requirement) triggers STOP per an exact list item, not an inferred one |
| **UX-15** | Scope Discipline / Regression / Review | Analysis §12, §19, §21 | Footprint-exception clause; targeted vs. cross-page regression; proportional Independent Review table | Review-required row cross-references §4's tier-B trigger | MEDIUM | Write §12 combining all three mechanisms, since they share one "how much checking is owed" question | Case B (Delete-button normalization) is fully resolvable (footprint, regression type, review requirement) from this section alone |
| **UX-16** | Project UX/UI Profile | All C/B-classified facts throughout | Compact in-file section: breakpoints, theme-block locations, badge semantic map, `t()` pointer, known-deferred items (Login/Register scope, Remember-Me, disabled email hint), companion path | This section *is* the config surface §01 references | MEDIUM | Write §13 as a fact list, each tagged with its source (analysis section citation) | Every C-classified row in this design's §22 table has a corresponding §13 entry |

16 IDs, each mapped to exactly one mechanism; none introduces a new document, a new registry, or a
duplicated Engineering rule.

---

## 26. Rejected / Deferred Ideas

| Candidate | Verdict | Why | What would justify reconsideration |
|---|---|---|---|
| Copy Engineering's exact LOW/MEDIUM/HIGH/CRITICAL tiers | **REJECT** | Analysis §12/§14: calibrated to schema/RBAC stakes, would misclassify nearly all real UX/UI work — either everything looks LOW (under-caring about tier-B surfaces) or the vocabulary gets silently reinterpreted per-session | A future incident where the 3-route model demonstrably misclassifies a real change the 4-tier model would have caught |
| Mandatory Independent Review for every CSS change | **REJECT** | Disproportionate for Route 1; named ceremony-mismatch risk (analysis §12) | Evidence that Route-1 self-check has actually missed something an Independent Review would have caught |
| Mandatory full-site screenshot suite for every change | **REJECT** | Proportional sampling (UX-05/UX-06) already targets exactly where evidence is needed; a blanket suite is pure token cost with no marginal safety gain for a Route-1 change | A demonstrated instance where sampling missed a defect a full sweep would have caught |
| Full browser/device matrix | **DEFER** | No evidence of a real device-specific defect in this project yet; 3 viewport classes cover the responsive risk actually found (analysis §6) | A confirmed real-device rendering bug that the 3-class sweep would have missed |
| Separate accessibility Skill | **REJECT** | Accessibility findings (analysis §7) are tightly coupled to component/boundary work (labels on inputs, focus on shared buttons) — splitting fragments a domain that needs the same boundary-check machinery UX/UI already has | The accessibility methodology growing large enough to threaten the size target (§24) on its own |
| Separate responsive Skill | **REJECT** | Same reasoning — responsive findings (analysis §6) are inseparable from the component/route model | Same trigger as above |
| Giant design-token registry inside SKILL.md | **REJECT** | No formal token layer exists yet in the app (analysis §9's largest debt item) — cataloging an aspirational one is REFACTOR-tier work, not Skill-authoring | The app actually adopts a formal token layer through a properly-authorized REFACTOR/redesign phase |
| Hard-coded Study Archive pixel values inside *general* rules | **REJECT** | Directly violates the portability requirement (task §23, this design's §22) | Never — this is a structural rule, not evidence-contingent |
| Requiring JS/loading-state patterns even with no client-side architecture | **REJECT** | Analysis §13: inventing async UI for a server-rendered-only project is architecture work, not UI work | The project actually gains a client-side interaction layer (an Engineering-tier decision) |
| Autonomous redesign permission | **REJECT** | Directly defeats the ladder's purpose (§6); Case I exists specifically to test this | Never — this is the load-bearing anti-scope-creep mechanism |
| Automatic Engineering-rule duplication inside UX/UI Skill | **REJECT** | Analysis §12 names this as a failure mode in its own right (drift risk, same class Engineering's own dual-theme-block problem represents) | Never — §2/§17's reference-not-copy rule is structural, not evidence-contingent |

---

## 27. Adversarial Design Validation

| Case | Expected (per task) | Design outcome | Verdict |
|---|---|---|---|
| **A** — dashboard card spacing only | Very lightweight | Route 1, tier A, self-check only, no runtime trigger fires | **PASS** |
| **B** — normalize Delete styling across pages | Shared-pattern reasoning, no unneeded Engineering ceremony | Route 2 (shared pattern), NORMALIZE rung (cited inconsistency, analysis §4/§9), cross-page check required, tier A once confirmed no gate touched, Independent Review recommended not required | **PASS** |
| **C** — sidebar mobile fix | Responsive/systemic verification, no backend mutation unless truly required | Route 2, mandatory UX-06 responsive sweep at all 3 classes (no existing breakpoint for sidebar to anchor to), tier A/B (no invariant attached per analysis §11), no Route 3 escalation | **PASS** |
| **D** — focus visibility + field-error accessibility | Accessibility evidence + runtime/keyboard verification, no unsupported WCAG claim | Route 2, UX-07 checklist items (focus visibility, error association) both mandatory-runtime-triggered, claim-precision rule blocks a WCAG-compliance statement | **PASS** |
| **E** — restyle Edit/Delete disabled states | Presentation may change; enforcement may not | Route 2, tier B (§4's canonical worked example), contract check requires confirming `is_file_owner()`/rank checks still fire and the control stays a real inert non-focusable element; Independent Review required | **PASS** |
| **F** — "translate all remaining error messages" | Detect cross-cutting dependency, not pure UX copy change | UX-11's one-site-vs-many-conditional test classifies this as B (systematic retrofit) → Route 3 → STOP → Engineering | **PASS** |
| **G** — redesign Login/Register to match authenticated pages | Recognize documented scope decision, escalate rather than override | Tier C directly (analysis §10.C names this exact case) → Route 3 → STOP, framed as reopening an Owner Decision | **PASS** |
| **H** — change dark-mode palette | Both activation paths verified | Tier B, UX-05 mandatory trigger, UX-12 both-block-diff rule | **PASS** |
| **I** — "make the whole website modern" | No unlimited redesign authority from vague request | Ladder (§6/UX-03) caps at NORMALIZE/EXTEND absent explicit recorded Owner redesign intent; agent asks a scoping question rather than proceeding | **PASS** |
| **J** — future React/Vue/Svelte app, no RBAC | Generic methodology still usable | §22 portability table: every normative section is class A; Project Profile (UX-16) swaps out; Companion Skill path (UX-01) becomes empty or points elsewhere; router/ladder/loop/state-matrix/a11y/responsive sections apply unchanged | **PASS** |
| **K** — UX change accidentally requires DB/schema modification | STOP → Engineering | UX-14's STOP list, item 3 ("a schema or persisted-data contract must change") fires directly | **PASS** |

All 11 cases PASS with no revision required to the design as specified. No load-bearing FAIL surfaced,
so §29's self-check proceeds without a design-revision cycle.

---

## 28. Design Self-Check

1. Every HIGH/MEDIUM Stage-1 pressure has a design disposition — **confirmed**, §3 table covers all
   named findings; the two "insufficient evidence" items (Remember-Me, university-email hint) are
   correctly logged as Project-Profile instances rather than forced into a Skill rule they don't need.
2. Every Stage-1 strength has preservation coverage — **confirmed**, §6's PRESERVE default rung plus
   §16's mandatory strengths-carry-forward into Project Profile (UX-16).
3. Engineering boundary is explicit — **confirmed**, §4 is the design's largest single section by
   intent.
4. Engineering rules are referenced, not duplicated — **confirmed**, §2/§17/UX-01 make this structural;
   §22's portability table shows zero D-class (un-referenceable Engineering-only) rows remaining.
5. No auto-discovery assumption remains — **confirmed**, §17/UX-01's explicit `Read`-on-demand rule.
6. Runtime evidence policy closes Stage 1's source-only limitation — **confirmed**, §8/UX-05's trigger
   table is built directly from analysis §7's "REQUIRES RUNTIME VERIFICATION" items.
7. Accessibility claims cannot exceed evidence — **confirmed**, §10/UX-08's claim-precision rule + ban
   list.
8. Responsive verification is proportional — **confirmed**, §9/UX-06's 3-class-plus-exact-breakpoint-
   condition structure, not exhaustive-by-default.
9. Local cosmetic work remains lightweight — **confirmed**, Route 1 (§5) carries no mandatory runtime/
   cross-page/review burden absent a trigger.
10. Vague aesthetic requests cannot authorize unlimited redesign — **confirmed**, §6/UX-03's ladder,
    validated against Case I.
11. Project-specific styling is separated from portable methodology — **confirmed**, §22's full
    classification table, zero unclassified rows.
12. Rejected ideas did not leak into live design — **confirmed**, cross-checked §26 against §3–§21;
    none of the 11 rejected mechanisms appears as an adopted rule anywhere above.
13. Stage 3 can create the Skill without re-reading the entire app — **confirmed**, §25's Design ID
    table gives a direct creation instruction per section, each citing the specific analysis section
    it's grounded in, so Stage 3 works from this document plus targeted analysis citations rather than
    a fresh full-codebase pass.

---

## 29. Unresolved / Open Questions Carried Forward

None of these block Stage 3; they're scoping notes for whoever authors specific Project Profile
entries or later extends the boundary table:

- The exact wording Stage 3 uses for the Companion Skill Path field's portability fallback (empty vs.
  a placeholder token) is a Stage-3 authoring choice, not a Stage-2 design decision — either satisfies
  this design's requirement that the field exist and be explicit.
- Whether `download.php`'s error-response fix (analysis §5 Journey D, the sharpest concretely-evidenced
  defect found) is itself the first real change this Skill processes is a scheduling question for
  whoever runs UX/UI Skill Creation/Optimization next, not a design question — this document only
  establishes that such a change would route to Route 2 with a mandatory tier-B-adjacent boundary check
  (it's a security-sensitive streaming endpoint), never that it should or shouldn't happen first.
- The precise line count of the eventual SKILL.md (§24 gives an estimate, not a hard ceiling) will be
  known only once Stage 3 writes it; if it materially exceeds ~480 lines, that's a signal for Stage 3
  to look for content that drifted from principle-first into an accidental style-guide, not a signal
  to raise the target retroactively.

---

## 30. Durable Output

This file is the only artifact created by this session:
`skills/study_archive/ux_ui/archive/UX_UI_SKILL_DESIGN.md`.

No `skills/study_archive/ux_ui/SKILL.md` was created. No file under `skills/study_archive/engineering/`
was modified. No application source was modified. No `docs/PROJECT_CONTEXT.md` edit was made. No
database/schema/data was touched.

---
