# Study Archive — UX/UI Post-Project Empirical Analysis (Stage 1)

> **Status**: Stage-1 empirical analysis only. Produces evidence for a future UX/UI Skill design.
> Does **not** create a UX/UI SKILL.md, does **not** begin Stage 2 design, does **not** modify the
> application. See §21 for exact next action.

**Session date**: 2026-08-19. **Governing Engineering boundary**: `skills/study_archive/engineering/SKILL.md`
(read as authority for §10 below; not modified by this analysis). **Current-state source**:
`docs/PROJECT_CONTEXT.md` (read in full for security/architecture sections; targeted retrieval only
for `docs/P{n}_IMPLEMENTATION_PLAN.md`, per this session's scope instructions).

---

## 1. Overall Stage-1 Verdict

UX/UI POST-PROJECT ANALYSIS: COMPLETE. The application has a real, if informally-documented, design
system (CSS custom properties, a `t()`-routed i18n layer, a single avatar-rendering function, a
single visibility-condition function reused across every listing page) — this is not a codebase
starting from zero. The most load-bearing empirical finding is that **presentation and security
enforcement are already interleaved in several places** (theme dark-mode CSS blocks, ownership-gated
icon greying, visibility badges), which is precisely why a future UX/UI Skill needs an explicit
boundary model (§10) before it is allowed to touch this codebase unsupervised.

---

## 2. Sources / Files Inspected

**Read in full**: `skills/study_archive/engineering/SKILL.md` §0–§5, §10, §11 (Mission/Authority,
Source-of-Truth Hierarchy, Risk Classification, Lifecycle Router, Core Invariants, Scope Discipline,
STOP Conditions); `docs/PROJECT_CONTEXT.md` §9–§16 (File Ownership, File Visibility, Upload/Download
Security, Profile Picture Architecture, Theme/Settings Architecture, i18n Architecture, Security
Decisions list).

**Application source read**: full file inventory taken; two parallel background evidence passes read,
in full: `assets/css/style.css` (1004 lines), all layout partials, both lang files, and the primary
page set (`dashboard.php`, `files.php`, `subject_detail.php`, `profile.php`, `settings.php`,
`login.php`, `register.php`, `subjects.php`, `admin/member_management.php`,
`admin/file_management.php`, `admin/role_management.php`), plus `includes/auth.php` and
`includes/functions.php` for CSRF/flash/permission-helper call sites.

**Not reread in full** (per scope instructions): `docs/P1`–`P7_IMPLEMENTATION_PLAN.md`. Used only
where current behavior needed provenance (none required — current-state docs were sufficient for
every conclusion below).

**Evidence-gathering method**: two parallel read-only research passes (visual-system extraction;
user-journey + responsive + accessibility extraction) plus this session's own direct reading of the
Engineering Skill and security-relevant PROJECT_CONTEXT sections, so the boundary model in §10 carries
this session's own authority rather than a delegated summary.

---

## 3. UI Surface Inventory (current application, source-confirmed)

Confirmed present, by direct file listing (`find` over the working tree, not inferred from historical
plans):

| Surface | File(s) |
|---|---|
| Login | `login.php` |
| Register | `register.php` |
| Logout | `logout.php` (plain GET, deliberately reviewed CSRF exception — Engineering SKILL.md §5.1) |
| Dashboard/Home | `dashboard.php` |
| Profile | `profile.php` (edit profile, avatar upload/remove) |
| Settings | `settings.php` (theme, language) |
| Subjects (list) | `subjects.php` |
| Subject Detail | `subject_detail.php` (offerings, file listing, category counts) |
| File discovery / search / filter | `files.php` |
| File streaming (preview/download) | `download.php` (no standalone page — a streaming endpoint) |
| File Management (admin) | `admin/file_management.php` |
| Member Management (admin) | `admin/member_management.php` |
| Role Management (admin) | `admin/role_management.php` |
| University Management (admin) | `admin/university_management.php` |
| Curriculum Management (admin) | `admin/curriculum_management.php` |
| Shared header | `includes/layout_header.php` |
| Shared sidebar/nav | `includes/layout_sidebar.php` |
| Shared footer | `includes/layout_footer.php` |
| Entry/guest routing | `index.php` |

**Not present / not applicable** (do not appear in the current file tree, so not assessed): a
standalone "Course/Curriculum management" surface separate from `admin/curriculum_management.php`
(it *is* that surface); no dedicated confirmation-modal component file — confirmation UX, where it
exists, is inline per-page (see §8).

**Client-side script**: no dedicated `.js` files exist anywhere in the tree; `<script>` blocks are
inline and confined to exactly two files: `admin/file_management.php` and `admin/role_management.php`
(confirmed by direct grep across all `.php` files). This is itself a §4/§13 finding.

---

## 4. Visual System Reconstruction

Source: full read of `assets/css/style.css` (1004 lines), all layout partials, both lang files, and 11
representative page files; grep-verified for absent patterns (`.btn-link`, `:disabled`, nav-toggle
markup). Evidence type: **SOURCE-DERIVED FACT** throughout this section unless marked otherwise.

**Typography** — single font stack (`"Segoe UI", "Noto Sans Thai", Roboto, Arial, sans-serif"`,
`style.css:91`), but font-size values (11–26px, ~15 distinct values with many near-duplicates like
12/12.5/13/13.5/14/14.5) show no formal type scale — **SYSTEMIC INCONSISTENCY**, accretion of
per-component one-offs rather than a token set. `.settings-section-header h2` styles only its child
`<p>`, leaving the actual `<h2>` at unstyled browser default — **IMPLEMENTATION ARTIFACT**.

**Color** — full custom-property token set (`style.css:1-25`), each redefined identically in both
dark-mode activation paths (§10.B). Success=green, danger=red, muted=gray, primary=blue; **no
warning/info token exists** — every flash message in the codebase is only ever `success` or `danger`.
The 4-badge-color vocabulary (primary/success/muted/primary-light) is genuinely reused consistently
(`files.php:154`, `subject_detail.php:340`, `admin/file_management.php:605` — **DELIBERATE / REPEATED
PATTERN**) but is overloaded across 5 unrelated concepts (role, status, visibility, a "You" self-marker,
curriculum-code chips) — **SYSTEMIC INCONSISTENCY** at the semantic level even though the component
itself is consistent. Two concrete dark-mode color leaks: `subject_detail.php:254` hardcodes a
`#c0392b` fallback for a CSS variable (`--color-danger`) that is never actually defined anywhere in
`style.css` (only `--color-danger-text` exists) — that link's color **never changes with theme**; and
the inline SVG logo mark (`layout_sidebar.php:16-19`, duplicated verbatim in `login.php:49-52` and
`register.php:133-136`) hardcodes `stroke="#3b6fe0"` instead of using `currentColor`/a theme variable,
so it doesn't match `--color-primary` in dark mode. Both are **IMPLEMENTATION ARTIFACT**.

**Spacing** — no `--space-*` tokens exist; every component hardcodes its own padding/margin
independently, producing ~20 distinct near-multiple values — **SYSTEMIC INCONSISTENCY**.

**Layout/grid** — the `repeat(auto-fit/auto-fill, minmax(Npx, 1fr))` card-grid idiom is used
identically 5+ times (stat tiles, subject cards, file cards, quick-access tiles, settings option
cards) — **DELIBERATE / REPEATED PATTERN**, and the single strongest structural consistency found in
the stylesheet.

**Border-radius** — two tokens (`--radius-md: 12px`, `--radius-lg: 18px`) plus a `999px` pill radius
used consistently for search/filter inputs and badges. `.icon-btn` (8px) and `.file-card-icon` (10px)
sit close to but don't match `--radius-md` — **LOCAL INCONSISTENCY**, no apparent reason for the
divergence.

**Shadows** — exactly one token (`--shadow-soft`), applied identically everywhere elevation is used,
redefined per theme. No ad hoc shadow values anywhere.

**Buttons** — the base `.btn`/`.btn-primary`/`.btn-secondary` system is applied consistently for
primary form actions, but at least **four visually distinct treatments exist for equivalent actions**:
(1) `.icon-btn`/`.icon-btn.danger` for admin-table row actions (consistent across
`subjects.php`/`member_management.php`/`file_management.php`/`role_management.php`); (2)
`.file-card-actions .btn-preview`/`.btn-download`, a separate one-off pill style not built on `.btn` at
all; (3) `.filter-bar .btn`, pill-shaped only inside filter bars via a targeted radius override; (4)
`subject_detail.php:254`'s delete-offering action, a plain inline-styled text link using an **undefined
CSS class** (`.btn-link` does not exist — grep-confirmed). **SYSTEMIC INCONSISTENCY**: "Delete"
specifically is styled two different ways in the same app (red icon-button everywhere else vs. a plain
always-red text link for offering deletion).

**Forms** — labels are consistently block-level above the input (**STRENGTH**); validation follows one
`.field.has-error` + `.error-text` pattern applied uniformly across every form read (register, subject
offering, profile, all three admin forms) — **STRENGTH**. No visual required-field marker exists
anywhere (relies solely on the HTML5 `required` attribute) — a genuine, if minor, gap.

**Tables** — `table.data-table` styling is identical across dashboard/member/file/role management —
**STRENGTH**. Responsive safety: member/file/role management each wrap their table in a hand-typed
`<div style="overflow-x:auto;">`, copy-pasted three times rather than a shared class —
**IMPLEMENTATION ARTIFACT**; `dashboard.php`'s recent-files table has **no such wrapper at all** —
**LOCAL INCONSISTENCY**, the one table of four with no horizontal-scroll safety net.

**Cards** — visually consistent to the user, but `.auth-card`/`.subject-card`/`.file-card` each
re-declare the identical background/radius/shadow triple independently rather than composing a shared
base class — **IMPLEMENTATION ARTIFACT** (CSS-authoring smell, not user-visible).

**Badges** — one `.badge` base + 4 modifiers is the only badge component, reused everywhere (see Color
above) — component-reuse is a **STRENGTH**; semantic overload is a **SYSTEMIC INCONSISTENCY**.

**Icons** — no icon font/SVG library; the app's only icon language is HTML numeric entities/emoji
(consistent — **DELIBERATE / REPEATED PATTERN**), plus a hand-authored inline SVG logo duplicated
verbatim in three files rather than extracted to a shared partial — **IMPLEMENTATION ARTIFACT**.

**Navigation** — sidebar is fixed-width (260px), text-only, with a solid active-state background and a
distinct hover tint. **No responsive collapse mechanism exists at all** — no hamburger/toggle markup,
no JS, and grep confirms zero `@media` rule ever touches `.sidebar`/`.app-shell`, despite six other
components having explicit mobile breakpoints. This is the most significant layout gap found (see §6).

**Responsive breakpoints** — verbatim from `style.css`: `max-width:520px` (`.form-row`, `.button-row`,
two separate blocks), `max-width:900px` (`.two-col`, `.upload-layout`, two separate blocks),
`max-width:760px` (`.profile-grid`), `max-width:800px` (`.detail-layout`). Five distinct pixel values
hardcoded independently per component rather than a shared breakpoint token set — **SYSTEMIC
INCONSISTENCY**. None ever addresses the sidebar.

**Theme implementation** — architecture is deliberate, documented in-code, and near-completely covered:
every component rule in the stylesheet references a `var(--color-*)`; the only leaks found are the two
inline-style hardcodes in Color above. `login.php`/`register.php` build their own `<html>` shell with
no `data-theme` attribute at all — **not a bug**: absence still matches the `:root:not([data-theme=
"light"])` OS-driven rule, so pre-auth pages still follow system dark mode; only an explicit per-user
override is unavailable there, correctly, since no session exists yet. Overall: **STRENGTH**, with one
narrow, precisely-located leak.

**Thai/English layout** — font stack includes `"Noto Sans Thai"` explicitly (good bilingual support);
no `:lang(th)` rules, no defensive `overflow`/`text-overflow` handling on fixed-width text containers
(nav links, badges) — **INSUFFICIENT EVIDENCE** that this visibly breaks without rendering, but no
defensive CSS exists to prevent it if a long string occurs.

**Interaction states** — `:hover` is broadly and consistently defined. `:focus` is defined **only** on
form inputs, and that rule replaces the native outline with a border-color/background change and no
glow/shadow — the **only** focus style in the entire stylesheet; buttons, icon-buttons, and nav/category
links have no authored focus state at all. `:active` exists only for `.btn`. **No `:disabled` CSS rule
exists anywhere** (grep-confirmed) — "disabled-looking" action icons are faked with a `<span>` (not a
real disabled control) via a duplicated inline `style="opacity:.4; cursor:not-allowed;"` repeated 4+
times across two admin files, rather than one shared class — **IMPLEMENTATION ARTIFACT**, and see §7 for
the accessibility consequence (a `<span>` carries no disabled semantics for assistive tech). No
`.loading` class or spinner markup exists anywhere in the files read. `.empty-state` and
`.alert-success`/`.alert-danger` are each used consistently — **STRENGTH** — but no warning/info alert
tone exists.

**Destructive actions** — 4 of 5 delete/revoke actions (subjects, members, files, roles) share one
icon-button + native `confirm()` pattern with translated confirm text — **STRENGTH**. The one outlier is
`subject_detail.php`'s delete-offering link (see Buttons above) — **LOCAL INCONSISTENCY**. No custom
themed confirmation modal exists anywhere; all rely on the native browser `confirm()` dialog, which
cannot follow the app's theme — an inherent, app-wide limitation, not a page-specific defect.

**Inline styles vs. classes** — 61 inline `style="..."` occurrences across the files scanned, the large
majority one-off vertical-rhythm patches (`margin-bottom:20px`, `margin-top:-8px`, etc.) repeated
near-verbatim across many files with no spacing-utility class layer to replace them —
**SYSTEMIC INCONSISTENCY**, reflecting a genuine gap in the design system rather than isolated sloppiness.

---

## 5. User-Journey Analysis

Traced by direct code-path reading (not assumed from historical plans). Each item below is labeled
**OBSERVED** (directly evidenced in code) or **HEURISTIC** (grounded judgment call) per the task's
required separation.

**A. visitor → register → login** — Entry: `register.php`. Server-side-only validation (`novalidate`
on both forms), one full-page-reload cycle per failed submit; field-level inline errors on retry.
OBSERVED friction: the "Remember Me" checkbox (`login.php:80-83`) is rendered but never read
server-side anywhere — a non-functional control; "Forgot Password?" (`login.php:82`) is a dead
`href="#"` link with `title="Coming soon"` presented as clickable; a wrong-domain email and a
correct-domain-but-disabled-university both return the identical generic error by deliberate design
(`includes/functions.php:96-102`), so a disabled-university user gets no differentiated explanation.

**B. dashboard → subject → subject_detail → files** — Quick-access links are permission-conditional
(Upload only with `file.upload`, Manage Members only with elevated access, `dashboard.php:15-16`).
Not-found and cross-tenant subjects deliberately return the identical flash+redirect (no oracle
leak) — OBSERVED, a documented security-vs-UX tradeoff, not an oversight. Empty states are rendered
inline via `t()`, never hidden sections. HEURISTIC: the visibility badge for `private` reuses the same
grey `badge-disabled` styling normally meaning "inactive account/item," which could be visually
conflated by a fast-scanning user (see §4/§9's semantic-overload finding — this journey is where it's
user-facing, not just a stylesheet observation).

**C. profile/settings** — OBSERVED inconsistency: the edit-profile page hardcodes a
single-university email hint and HTML5 `pattern` (`profile.php:42,263`, `@rmutsb.ac.th` only) while the
actual server-side check (`is_valid_university_email()`) is already multi-university-aware — a second
registered university's users would see a misleading client-side hint even though the server would
accept their email. Avatar upload auto-submits on file selection
(`onchange="this.form.submit()"`, `profile.php:189`) with no preview/cancel step before the upload
fires — OBSERVED, the only "undo" is uploading again or using the separate Remove-Photo form. Theme/
language changes take effect next page load only (already noted in PROJECT_CONTEXT §14, confirmed here
at the code level).

**D. file discovery/search/filter/download** — Six independent, combinable GET filters, all
URL-shareable/bookmarkable (OBSERVED positive). The type-filter dropdown's own option list is derived
from currently-visible files only, so it can silently shrink as other filters are applied — HEURISTIC,
no obvious in-UI explanation for why an option disappeared. The single sharpest inconsistency in the
whole error-handling surface lives here: `download.php`'s 404/403 responses are raw `exit()` text that
bypass the flash/layout/`t()` system entirely — no navigation, no header, and genuinely mixed-language
text within the same file (English `'File not found'` at one line, Thai at the next two), independent
of the user's language preference. OBSERVED, high-confidence, directly cited (`download.php:23-42`).

**E. file-management actions** — Two-layer ownership enforcement (permission, then unconditional
`is_file_owner()`) is applied consistently to edit and delete, with re-verification of the target
offering's department scope on every write — OBSERVED, matches the "File Ownership > Admin Hierarchy"
invariant from Engineering SKILL.md §5.2 exactly. Non-owned rows show edit/delete as disabled, inert
`<span>`s with a Thai-only `title` explaining why, rather than hiding the affordance — visible-but-
unusable, a deliberate transparency choice. OBSERVED gap: the upload form has no client-side
size/extension pre-check (`admin/file_management.php:448` has no `accept` attribute) unlike the avatar
upload which does — a 150MB or wrong-type file is only rejected after a full upload+POST round-trip.

**F. admin → member management** — Role editing has been fully relocated to a separate
`admin/role_management.php` page (P7b-4); this page now governs status only. Layered protections
(rank check, self-disable block, last-active-admin-per-scope guard, and — uniquely — a file-count guard
blocking deletion of any user who has uploaded ≥1 file, with a suggested "disable instead" alternative
in the message itself) are all OBSERVED, matching Engineering SKILL.md §5.2's "system may never reach
zero active holders of a given capability" invariant precisely. OBSERVED friction: the last-active-admin
and self-disable guards are only surfaced as inline hints *after* navigating into edit mode — the list
view's badge gives no forward-looking cue that a row is protected before the user opens it.

**G. role/status comprehension** — OBSERVED: status is color **and** text together (badge with a
`t()`-routed label inside it), not color-only — a genuine accessibility positive. A user can hold
multiple role badges simultaneously, each suffixed with its scope when non-global (e.g. "Department
Admin @ Computer Science"). The same 4-color badge vocabulary is reused across three unrelated semantic
axes (role tier, file visibility, account status) — HEURISTIC: visually consistent, but a fast-scanning
user could misassociate meaning across contexts since the same color occurs on unrelated concepts.

**H. theme/language preference** — OBSERVED: the only toggle lives on `settings.php`; there is no
quick-toggle in the topbar, so any change requires a full navigation+form-submit round trip. Persistence
is server-side (DB columns), not cookie/localStorage — confirmed to survive navigation for logged-in
users via a fresh per-request read. OBSERVED, and a real gap: pre-authentication pages hardcode
`lang="th"` unconditionally with no fallback to any prior preference — a returning English-preference,
dark-mode user is dropped back into a Thai/light-only login screen every time they log out, since there
is no cookie mirror of the DB preference (a scope decision already recorded in PROJECT_CONTEXT §14, but
its user-facing consequence is concretely observed here).

**I. invalid/error-action recovery** — Four distinct recovery paths coexist and are **not** uniform:
(1) field-level validation re-renders the same page with inline errors and repopulated values but no
`aria-describedby`/`aria-invalid` linkage (see §7); (2) CSRF failure redirects with a generic flash and
**loses all in-progress input**, with no explanation of expired-vs-tampered; (3) permission-denied
redirects to a list/dashboard view, discarding whatever the user was mid-editing; (4) not-found
deliberately maps cross-tenant and truly-nonexistent objects to the identical message (a documented
security-vs-UX tradeoff, not an oversight); (5) `download.php`'s errors bypass all of the above (see
Journey D) and are the one path this analysis found genuinely broken from a consistency standpoint, not
merely un-optimized.

---

## 6. Responsive Analysis

Labeled per the required CONFIRMED / LIKELY FROM SOURCE / UNVERIFIED vocabulary.

- **Viewport meta tag** — CONFIRMED present on every page type checked (`register.php`, `login.php`,
  and `layout_header.php`, which every authenticated page includes).
- **Mobile nav toggle** — CONFIRMED absent. No hamburger/toggle markup anywhere, no JS file exists for
  it, and a project-wide grep for toggle-related terms returns zero hits.
- **Sidebar collapse on small screens** — CONFIRMED it does not collapse: the fixed 260px `.sidebar`
  inside a flex `.app-shell` has no `@media` rule anywhere in the stylesheet targeting it, while six
  other components (`.form-row`, `.button-row`, `.two-col`, `.profile-grid`, `.detail-layout`,
  `.upload-layout`) each have one. This is the single largest, most confidently-evidenced responsive gap
  in the application.
- **Tables** — CONFIRMED inconsistent: member/file/role management wrap their tables in a hand-typed
  `overflow-x:auto` div (copy-pasted three times); the dashboard's recent-files table has no such
  wrapper at all (§4/§9).
- **Cards/grids** — CONFIRMED functional: the `repeat(auto-fit/auto-fill, minmax(Npx,1fr))` idiom
  reflows without needing a breakpoint, a legitimate technique used consistently across five component
  types.
- **Forms** — CONFIRMED: `.form-row` collapses to one column at `max-width:520px`.
- **Touch targets** — LIKELY FROM SOURCE / partially CONFIRMED: `.icon-btn` is a fixed 30×30px
  (`style.css:743-746`), below common 44×44px comfortable-touch-target guidance though above the
  24×24px WCAG 2.2 AA minimum; several sit adjacent with only 6px gap. The markup+CSS pairing is
  confirmed; whether this actually causes mis-taps on a real device is UNVERIFIED without runtime
  testing.
- **Overall device coverage claim** — UNVERIFIED: no evidence in this analysis comes from an actual
  browser/device; every finding above is a source-code inference, however confidently cross-checked
  between CSS and markup.

---

## 7. Accessibility Analysis

Labeled per the required SOURCE-CONFIRMED ISSUE / POTENTIAL RISK / REQUIRES RUNTIME VERIFICATION /
NOT ASSESSED vocabulary. No WCAG conformance-level claim is made anywhere in this section.

- **Form labels** — SOURCE-CONFIRMED present and correctly `for=`-associated across every form checked
  (register, login, profile, settings, all three admin forms). No unlabeled text/email/password input
  found.
- **Date-range filter inputs** (`admin/member_management.php:409-410`) use only a `title` attribute, no
  `<label for>` — POTENTIAL RISK (title-only accessible names have inconsistent screen-reader support).
- **Icon-only action buttons** — SOURCE-CONFIRMED all carry a `title` attribute (which browsers do fold
  into the accessible name), so none are strictly nameless; still POTENTIAL RISK since `title` alone has
  no visible label and unreliable touch/keyboard discoverability, and no `aria-label` is used anywhere as
  a supplement (project-wide grep for `aria-` returns **zero** matches in the entire codebase).
- **Disabled icon-buttons rendered as inert `<span>`s** (not real `disabled` buttons) — SOURCE-CONFIRMED
  as the semantically *correct* choice (no focusable-but-inert control) — a genuine positive, not a gap.
- **Heading hierarchy** — SOURCE-CONFIRMED single `<h1>` per page (both shared-layout pages via
  `layout_header.php` and the two standalone auth pages), no skipped levels in the pages checked.
- **Alt text** — SOURCE-CONFIRMED present and meaningful on avatars (`alt="<full name>"` via the single
  `avatar_html()` function). Decorative inline SVG logos have no `aria-hidden`/`role="img"` suppression —
  POTENTIAL RISK (inconsistent screen-reader announcement of a purely decorative element).
- **Validation/error-message association** — SOURCE-CONFIRMED ISSUE: zero `aria-describedby`/
  `aria-invalid` usage anywhere in the codebase (project-wide grep, zero matches); every error message
  is a plain sibling `<div>` placed visually near its field with no programmatic link. A screen-reader
  user tabbing directly to a flagged field would not hear the error announced.
- **Focus visibility on form fields** — SOURCE-CONFIRMED ISSUE (the removal itself): the native focus
  outline is explicitly suppressed on every text/select/textarea field app-wide and replaced only with a
  border-color + background-tint change (`style.css:196-199`) — the *only* focus style in the entire
  stylesheet. Whether the replacement is sufficient contrast is REQUIRES RUNTIME VERIFICATION. Buttons
  and links have no authored focus rule at all, so they retain the browser's native outline — a positive,
  by absence of interference, relative to the inputs.
- **Document language attribute** — SOURCE-CONFIRMED changes correctly per user on authenticated pages;
  SOURCE-CONFIRMED ISSUE that pre-auth pages hardcode `lang="th"` unconditionally regardless of any
  historical preference (there is nothing to read one from pre-session).
- **Keyboard/custom-interactive-element misuse** — SOURCE-CONFIRMED **none found**: zero real
  `onclick=`/`tabindex` hits project-wide (grep false-positives were RBAC code comments, not markup);
  every interactive affordance is a native `<a>/<button>/<input>/<select>/<form>` element. A genuine
  positive for baseline keyboard operability.
- **Destructive-action confirmation** — SOURCE-CONFIRMED present on every delete/revoke action traced,
  via native `confirm()`; message language is inconsistently localized (see §5/§9), which is a
  localization finding, not itself an accessibility one.
- **Color contrast, real screen-reader behavior, real touch mis-tap rates** — NOT ASSESSED / REQUIRES
  RUNTIME VERIFICATION throughout; explicitly out of this session's source-only scope.

---

## 8. UI State Coverage

Synthesized from both evidence passes; per-state, per-component.

- **Default / idle** — present and consistent everywhere (base `.btn`, `.field`, `.card`, `.badge`
  styles).
- **Hover** — broadly and consistently defined across buttons, nav links, icon-buttons, category links,
  file-card action links.
- **Focus** — defined **only** on form inputs (and there, with the native outline removed — see §7);
  buttons, icon-buttons, and nav/category links have no authored focus state at all, relying entirely on
  browser defaults. **Gap**: no deliberate, verified focus design exists for the majority of interactive
  elements in the app.
- **Active (pressed)** — defined only for `.btn` (`transform: translateY(1px)`); absent for `.icon-btn`
  and nav/category links.
- **Disabled** — **no CSS `:disabled` rule exists anywhere in the stylesheet** (grep-confirmed). Two
  different disabled patterns coexist: (a) real HTML — none observed using the `disabled` attribute with
  dedicated styling; (b) faked via an inert `<span>` with a duplicated inline
  `style="opacity:.4;cursor:not-allowed;"`, repeated 4+ times across two admin files rather than one
  shared class. Semantically defensible (no focusable-but-inert control — a positive, §7) but a
  maintainability gap and the clearest candidate for a real shared `.icon-btn.disabled` class.
- **Loading** — **no `.loading` class or spinner markup found anywhere.** Given the app is almost
  entirely server-rendered full-page-reload (§13), this may be a legitimate low-priority gap rather than
  an oversight — but it is a genuine, complete absence, worth naming for a future Skill that might
  introduce any async interaction.
- **Empty** — present and consistent: one `.empty-state` component used identically across every
  list/table page checked.
- **Success / Error (flash)** — present via `.alert-success`/`.alert-danger`, consistently rendered by
  one shared mechanism (`layout_header.php:34-36`) immediately after `<main>`. Localization of the
  *content* of these messages is inconsistent (§5/§9's flash-message finding: only 3 of the files
  issuing `set_flash()` route the message through `t()`).
- **Warning / Info** — **no CSS token or alert class exists for either tone.** Every flash message in the
  codebase is binary success/danger; there is no vocabulary for a message that's neither.
- **Destructive** — a real, consistent confirm-before-delete pattern exists (native `confirm()`) on 4 of
  5 traced delete/revoke actions, with one local outlier (`subject_detail.php`'s delete-offering link,
  §4/§9). No themed/custom confirmation modal exists anywhere — an inherent, app-wide limitation of using
  the native dialog, not a per-page inconsistency.
- **Permission-denied / unavailable** — handled at two granularities: page-level (consistent flash+
  redirect-to-dashboard across all three admin pages, identical message text) and row-level (rendered as
  the same inert-`<span>` disabled pattern used for the general Disabled state above, consistently).

---

## 9. Consistency / Design Debt

Classified per the required LOCAL / REPEATED / SYSTEMIC vocabulary (distinct from §4's finer-grained
labels — this section names the debt items that most matter for a future Skill's mechanism-level
targeting, per the instruction that the Skill should target mechanisms, not become a screenshot list).

- **SYSTEMIC — no formal design-token layer below the color/radius/shadow level.** Typography sizes,
  spacing values, and responsive breakpoints are each accreted per-component rather than drawn from a
  shared scale (§4). This is the single largest piece of design debt: it doesn't break anything today,
  but it's the reason near-identical components (button treatments, table wrappers, card base styles)
  keep getting re-solved slightly differently.
- **SYSTEMIC — equivalent actions styled differently.** "Delete" alone has two unrelated visual
  treatments in the same app (icon-button vs. plain text link, §4/Buttons); button style itself has four
  coexisting treatments for otherwise-equivalent actions.
- **SYSTEMIC — badge color vocabulary overloaded across 5 unrelated meanings** (role/status/
  visibility/self-marker/curriculum chips) sharing the same 4 colors.
- **SYSTEMIC — dozens of hardcoded-language validation/error strings bypass the `t()` system**
  entirely (registration, login, profile, subjects, subject offerings, member/file management all
  contain raw Thai literals in server-side validation, independent of the session's language
  preference) — this is the single most consequential TH/EN finding in this analysis; see §13/§10.C for
  why it's Engineering-tier work, not a UX/UI-owned fix.
- **REPEATED (2 instances) — `max-width:900px` and `max-width:520px` breakpoints each declared in two
  separate, non-consolidated `@media` blocks** rather than one — a maintainability smell more than a
  user-visible bug.
- **REPEATED (3 instances) — the `overflow-x:auto` table wrapper is copy-pasted as an inline style**
  in member/file/role management rather than defined once.
- **LOCAL — dashboard's recent-files table is the one table of four with no responsive-scroll
  wrapper.**
- **LOCAL — `.icon-btn`/`.file-card-icon` radii (8px/10px) drift from the `--radius-md` (12px) token
  they otherwise resemble.**
- **LOCAL — `login.php`/`register.php` are the only pages in the app not translated and not
  theme-attributed** (deliberate scope decision per PROJECT_CONTEXT §14/§15, not oversight — see
  §10.C) — still worth naming here as the most visible seam in the app's otherwise-consistent bilingual,
  themed experience. `register.php` additionally mixes hardcoded raw Thai strings into its
  otherwise-English markup — internally inconsistent even within its own carved-out exception.
- **TH/EN text-length issue** — no evidence of an actual overflow found (no defensive CSS exists to
  check against), so this is named as a **risk**, not a confirmed defect: fixed-width badges/nav items
  have nothing preventing overflow if a long Thai or English string occurs.
- **Theme divergence** — narrow and precisely located (two hardcoded-color leaks, §4/Color), not
  systemic; the theme architecture itself is a strength, not a debt item.
- **Duplicate component CSS** — `.auth-card`/`.subject-card`/`.file-card` each re-declare an identical
  background/radius/shadow triple independently; visually harmless to the end user, but a
  maintainability smell (**IMPLEMENTATION ARTIFACT**, not user-facing debt).

---

## 10. UX/UI ↔ Engineering Boundary

This is the load-bearing section for a future UX/UI Skill: it may govern presentation, but Engineering
always wins where security/data-integrity/authorization semantics conflict with presentation
convenience (per Engineering SKILL.md §0). Four tiers, each with concrete Study Archive evidence.

### A. UX/UI-OWNED — safe under UX/UI authority alone
- Spacing, typography, non-semantic color values, border-radius, shadow/elevation choices anywhere in
  `assets/css/style.css` **outside** the two dark-theme blocks named in tier B.
- Icon choice, card/table visual layout, non-invariant hover/idle styling.
- Wording of any string that already routes through `t()` (translation-key content is data, not code —
  editing `includes/lang/{th,en}.php` values is a translation-content change, not a logic change).
- This maps directly onto Engineering SKILL.md §2's own **LOW** tier: "cosmetic UI/CSS, translation-key
  additions... No schema change, no change to any Core Invariant surface." A future UX/UI Skill should
  inherit this LOW-tier definition rather than re-derive it (see §12's ceremony-mismatch risk below).

### B. UX/UI WITH CONTRACT PRESERVATION — presentation may change only while the existing
contract stays intact
- **The two dark-theme CSS blocks** (`@media (prefers-color-scheme: dark)` block and
  `:root[data-theme="dark"]` block in `style.css`) — Engineering SKILL.md §5/PROJECT_CONTEXT §16 item
  10 requires them to **stay byte-identical**; PROJECT_CONTEXT §14 documents a real prior incident
  where a `replace_all` edit updated only one block due to differing indentation, silently leaving dark
  mode with missing variables. A UX/UI-authored dark-mode color change is fine; shipping it without
  diffing both blocks afterward is not — this is the single highest-probability place a UX/UI edit
  breaks something invisibly.
- **Ownership/role-gated icon greying** on `admin/file_management.php` and `admin/member_management.php`
  (Edit/Delete icons visually disabled for files/accounts the acting admin doesn't own or outrank) — the
  *visual* treatment is UX/UI's to restyle; the underlying server-side gates (`is_file_owner()`,
  `rbac_is_other_admin_tier_account()` + `rbac_actor_outranks_target()`) are Engineering-owned and must
  keep firing regardless of how the disabled state is styled. PROJECT_CONTEXT §9 states this explicitly:
  "this is UI convenience on top of a server-side check, not a substitute."
- **Status/visibility badges** route through `t()` and SQL-level `file_visibility_condition()`
  filtering (§9/§10 above) — restyling the badge is UX/UI-owned; changing what determines badge state, or
  moving filtering logic into PHP/HTML, is not.
- **Settings' "next page load, no live preview" behavior** (PROJECT_CONTEXT §14) — adding a live JS
  preview is a legitimate UX/UI improvement only if the actual persisted-preference write path is
  untouched.
- **Avatar rendering via the single `avatar_html()` function** (PROJECT_CONTEXT §13) — restyling
  `.avatar`/`.avatar-lg` is UX/UI's; bypassing the single rendering function or adding a second code
  path that renders avatars differently is not.

### C. CROSS-SKILL / ENGINEERING DEPENDENCY — requires Engineering Skill authority/process
- **Translating dynamic validation/flash messages.** Currently, by explicit design decision
  (PROJECT_CONTEXT §15), these are *not* routed through `t()` — the document itself notes retrofitting
  "would mean touching nearly every conditional in the codebase." The symptom (English-only error text
  for a Thai-language user) reads as a UX complaint, but the fix is cross-cutting logic-touching work
  requiring Engineering-tier scoping, not a UX/UI-owned change.
- **Extending theming or translation to the Login/Register pages.** PROJECT_CONTEXT §14/§15 both record
  this as a *deliberate, already-made scope decision*, not an oversight. Reopening it is an Owner
  Decision under Engineering SKILL.md §9's process, not a UX/UI call, even though the visible effect
  (an untranslated, unthemed page in an otherwise translated/themed app) is squarely a UX/UI observation.
- **Changing `users.theme_preference`'s default** or adding a new theme option — the current `light`
  default is a documented, deliberate choice ("no existing user's UI changes until they opt in") whose
  reversal has a real behavioral consequence for existing accounts; Owner Decision territory.
- **Any change to *whether* Edit/Delete is gated**, as opposed to how the gate is displayed — this is
  Engineering SKILL.md §2 HIGH tier ("any change to a live authorization-sensitive surface... ownership,
  visibility, admin-protection") regardless of how small the visual diff looks.

### D. PROHIBITED UX SHORTCUT — a UX improvement that would weaken a higher-priority invariant
- Removing the greyed-out/disabled visual state from an Edit/Delete icon "because the server already
  checks it anyway, so the client-side state is just visual noise" — Engineering's own principle (§5.1:
  "every authorization decision is enforced server-side; UI hiding/greying is convenience only") means
  the greying is *intentional* UX, not redundant chrome; dropping it in the name of simplification is a
  regression Engineering would need to catch, because it looks purely cosmetic in a diff.
- Redesigning a status/visibility/role badge to be color-only (no text/icon) for a "cleaner" look —
  would create a real accessibility regression (contrast/colorblindness) on data that currently has
  independent evidence of being genuinely security/behavior-relevant (visibility gates what a member can
  even see), while presenting as a pure visual change.
- "Simplifying" the two dark-theme CSS blocks into a single shared source without independently
  re-verifying that both the media-query path (OS-level, no explicit `data-theme`) and the
  attribute-selector path (explicit user choice) still activate identically — this is exactly the class
  of edit PROJECT_CONTEXT §14 already documents as having silently broken once.

---

## 11. Future UX/UI Skill Responsibility Map

| Domain | Classification | Basis |
|---|---|---|
| Visual hierarchy, layout, spacing, typography | SHOULD GOVERN | Pure §10.A territory; no evidence any of it is invariant-adjacent. |
| Colors/semantics (non-theme-block) | SHOULD GOVERN | Same, with the explicit carve-out that theme-block edits are §10.B (contract preservation), not free governance. |
| Components (cards, tables, badges, avatars) | CONDITIONAL | Visual treatment SHOULD GOVERN; several components (badges, avatar rendering, ownership-gated icons) carry an attached contract (§10.B) the Skill must check before editing. |
| Forms | CONDITIONAL | Field layout/styling SHOULD GOVERN; which fields exist and what they bind to (e.g. no `uploaded_by` field, ever) is §10.D territory. |
| Tables | CONDITIONAL | Same shape as Components — styling is free, but table queries feeding visibility/ownership-filtered rows are not the UX/UI Skill's to touch. |
| Navigation | SHOULD GOVERN | No invariant found attached to `layout_sidebar.php`/`layout_header.php` structure beyond the server-side theme/language attribute injection (§10.B, narrowly: don't break the no-FOUC server-side `data-theme` mechanism). |
| Responsive behavior | SHOULD GOVERN | §6 confirms no invariant is attached to the sidebar/table/breakpoint gaps found — purely a presentation and structural-markup concern. |
| Accessibility | CONDITIONAL | §7 found no invariant conflicts, so most fixes SHOULD GOVERN outright (labels, `aria-describedby`, focus states); the one caveat is that some fixes (e.g. adding `aria-label` to icon-buttons) are trivial while others (systematic `aria-describedby` wiring across every form) are component-level changes that should go through the same review as any shared-component edit. |
| Interaction states (hover/focus/disabled/loading/etc.) | CONDITIONAL | SHOULD GOVERN for purely visual states; disabled-state removal on ownership/role-gated controls specifically falls into §10.D (prohibited shortcut) and needs an explicit carve-out rule, not blanket governance. |
| Feedback / flash messages (presentation) | CONDITIONAL | Styling of the flash-message component SHOULD GOVERN; the *content/translation* of validation messages is §10.C (cross-skill). |
| Loading/empty/error states | CONDITIONAL | Empty/error presentation SHOULD GOVERN (§8 shows solid existing patterns to extend); introducing a Loading state is CONDITIONAL on whether a project has any client-side interaction layer at all (§13) — inventing one for Study Archive today would be architecture work, not UI work. |
| Consistency enforcement | SHOULD GOVERN | This is arguably the future Skill's core value — see §9's design-debt findings. |
| Localization-aware layout (TH/EN width handling) | SHOULD GOVERN | Purely a layout-robustness concern; does not touch which strings get translated (that boundary is §10.C). |
| Theme-aware design (applying theme tokens to new components) | CONDITIONAL | Using existing CSS custom properties in new components SHOULD GOVERN; editing the two dark-mode source-of-truth blocks themselves is §10.B. |
| Destructive-action UX (confirmations, warnings) | CONDITIONAL | Presentation SHOULD GOVERN; must never be the mechanism that actually prevents/allows the destructive action (that's server-side, §10.D precedent). |
| Information density / progressive disclosure | SHOULD GOVERN | No invariant found attached; pure presentation choice. |
| UX regression verification | SHOULD GOVERN (as a Skill *responsibility*, method TBD) | The Skill should own defining what "UX regression" verification means (§15), even though it doesn't own Engineering's own regression suite. |

---

## 12. Failure Modes the Future Skill Must Prevent

Evidence-grounded where this codebase already shows the specific risk; general otherwise.

- **Visual change altering authorization behavior** — CONCRETE, see §10.D. The highest-confidence
  failure mode in this specific codebase: several "purely visual" surfaces (icon greying, badges,
  dark-mode CSS) sit directly on top of enforced invariants.
- **Changing backend contracts to simplify UI** — CONCRETE risk shape: PROJECT_CONTEXT §9 records that
  there is deliberately no `uploaded_by`/`user_id` field in the upload form at all ("the bypass is
  architecturally impossible, not merely validated away"); a UX/UI change that "simplifies" a form by
  adding an editable owner field, or any hidden field mirroring a server-trusted value, would reopen
  exactly the class of bug this design already closed by construction.
- **Excessive ceremony for tiny cosmetic changes** — a structural risk specific to pairing with this
  Engineering Skill: SKILL.md's own worked examples (schema migrations, RBAC cutovers) are all
  HIGH/CRITICAL, and its lifecycle machinery (Owner GO, Independent Audit, backups, rehearsals) is
  heavy. A UX/UI Skill that mechanically inherits that ceremony for genuinely LOW-tier cosmetic work
  (Engineering §2 already classifies "cosmetic UI/CSS" as LOW) would make trivial changes disproportionately
  expensive. The future Skill needs its own lightweight-first default, escalating only when a change
  actually lands in tier B/C/D above — not scaled to Engineering's default assumption of high stakes.
- **Duplicating Engineering Skill** — the future Skill should reference Engineering's Core Invariants
  (§5) and boundary tiers (§10 above) rather than restate or reinterpret them; restating creates a
  second copy that can drift out of sync with the authoritative one (the same class of risk Engineering
  SKILL.md itself calls out for its own dual dark-mode CSS blocks).
- **"Make it beautiful" subjective rewriting / redesign-everything behavior / arbitrary pixel
  perfection** — general risk, no specific incident evidence in this codebase (none exists yet — no
  UX/UI Skill has operated on this project). Still worth naming explicitly because the codebase *does*
  have a real, if informal, existing visual language (§4) that a redesign-everything default would
  discard without justification.
- **Hard-coding one aesthetic for every project / overfitting to Study Archive** — general portability
  risk. Engineering SKILL.md v3 itself already solved this exact problem for its own domain via a
  principle-first / instance-tagged structure ("Study-Archive-specific detail... marked 'concrete
  instance in this project'"); a future UX/UI Skill should adopt the same structural pattern rather than
  invent a new one.
- **Desktop-only reasoning, ignoring accessibility, ignoring component states** — §6/§7/§8 show this
  codebase's actual current coverage is genuinely mixed (some strong patterns, some real gaps); the
  failure mode is treating whatever coverage exists today as sufficient without verification.
- **Replacing evidence with taste** — general risk; mitigated structurally by requiring the evidence-type
  labeling this document itself uses (§17).

---

## 13. Portability

- **GENERAL WEB-APP UX/UI PRINCIPLE**: theming via CSS custom properties, redefined once per theme and
  referenced everywhere else, is a portable pattern independent of Study Archive — but the specific
  *failure mode* attached to it here (two redundant activation paths, one `@media`-based and one
  attribute-based, that must be kept byte-identical by hand) is a consequence of this app's specific
  choice to support `system`-preference theming without a build step or CSS preprocessor. A future Skill
  should state the general principle ("single source of truth per theme value") separately from the
  Study-Archive-concrete instance (the two-block byte-identity rule), since a project using a
  CSS-variable build pipeline wouldn't have this exact failure mode at all.
- **GENERAL PRINCIPLE + STUDY ARCHIVE CONCRETE INSTANCE**: "authorization state must never be inferred
  from presentation state" is portable; "Edit/Delete icons are greyed via CSS class, gated server-side by
  `is_file_owner()`" is the concrete instance.
- **STUDY-ARCHIVE-SPECIFIC**: the exact `t()` key-naming convention (`<area>.<element>`), the specific
  choice to leave Login/Register untranslated/unthemed, the specific 260-key dictionary size — these are
  facts about this project, not general UX/UI rules, and should not be hard-coded into a portable Skill's
  normative rules.
- **Zero client-side JS outside two admin pages** (§3) is itself a portability-relevant fact: this
  project's interaction model is almost entirely server-rendered, full-page-reload. A future Skill's
  guidance on "loading states," "live validation," or "optimistic UI" needs to be conditional on whether
  a project actually has a client-side interaction layer at all — Study Archive today mostly doesn't, so
  rules assuming SPA-like interactivity would not apply here without a prior architectural decision
  (itself Engineering-tier, per §10.C).

---

## 14. UX/UI Change-Risk Need — Analysis Only

Evidence supports that a lightweight classification is needed, distinct from Engineering's four-tier
model (LOW/MEDIUM/HIGH/CRITICAL) — mechanically copying that model would misclassify most real UX/UI
work, because Engineering's tiers are calibrated to schema/RBAC stakes, not visual stakes. Candidate
dimensions the evidence supports investigating in Stage 2 (not designing here):

- **cosmetic/local** — e.g. a spacing or color-value change confined to one component, no shared file
  touched (maps toward Engineering's own LOW, per §10.A).
- **component-level** — a change to a shared pattern reused across pages (e.g. the badge system, the
  avatar rendering function) — touches more surface than cosmetic/local but is still presentation-only
  if it stays within §10.A/B.
- **workflow/interaction** — a change to a multi-step flow (e.g. adding live validation to a form,
  changing what happens after a destructive action) — this is where §10.B's contract-preservation
  tier starts mattering in practice.
- **responsive/accessibility** — §6/§7's evidence suggests this can largely fold into component-level
  (most findings were component- or page-scoped, not a distinct risk shape of their own).
- **engineering/security-touching** — anything landing in §10.C/D above; this dimension's job is purely
  to detect the landing, then hand off to Engineering's own router (SKILL.md §3), not to process it
  itself.

Stage 2 owns the actual router design, the exact tier boundaries, and whether these five collapse into
fewer categories.

---

## 15. Verification Needs — Analysis Only

Evidence-supported verification types a future UX/UI Skill will likely need (need only, not the final
protocol):

- **Source inspection** — sufficient for cosmetic/local and most component-level changes; this session
  relied on it almost entirely and reached concrete, citable conclusions.
- **Runtime visual inspection** — necessary wherever this session had to fall back to "REQUIRES RUNTIME
  VERIFICATION" (§7) — contrast ratios, actual computed layout, and anything depending on how a
  browser resolves CSS cascade/media queries cannot be fully confirmed from source alone.
- **Viewport/responsive checks** — needed to convert this session's "LIKELY FROM SOURCE" responsive
  findings (§6) into "CONFIRMED."
- **Theme checks** — specifically both dark-mode activation paths (§10.B) need independent verification
  after any dark-mode-touching change, given the documented prior silent-drift incident.
- **TH/EN checks** — needed wherever a layout assumption (button width, badge width, nav item width) was
  sized for one language's string length; source alone can flag the *risk* (a fixed-width element near
  translated text) but not confirm actual overflow without rendering both languages.
- **Before/after comparison** — needed for any change in §10.B/C tiers, to demonstrate the preserved
  contract wasn't altered, not just that the new visual looks right.
- **Cross-page component consistency** — needed because this session found (§9) that shared visual
  concepts are not always implemented via one shared component; a change to "the button style" may need
  to be verified across every page that independently implements it.
- **Engineering-contract preservation** — a distinct verification type from ordinary regression testing:
  confirming a UX/UI change didn't cross into §10.B/C/D, which is a boundary check, not a visual check.

---

## 16. Strengths to Preserve

Every item below is evidence-supported (§4/§5/§6/§7 above); the future Skill must know not to
"fix" these.

- **Theme architecture** — a clean, well-documented, three-mode (Light/Dark/System) CSS-custom-property
  system with a single source of truth per mode and near-total coverage; server-side application means
  zero flash-of-wrong-theme.
- **Card-grid layout idiom** (`auto-fit/auto-fill, minmax(...)`) — used identically across five
  component types; genuinely consistent and inherently responsive without a breakpoint.
- **Form validation presentation** — `.field.has-error` + `.error-text`, applied uniformly across every
  form in the app.
- **Single elevation token, single visibility-filter function, single avatar-rendering function, single
  badge component** — each a genuine one-mechanism-many-callers pattern, exactly the shape a design
  system should have, even where (per §9) the semantics layered on top of the shared component have
  drifted.
- **Data-table styling** — identical across all four tables that use it (dashboard, member, file, role
  management).
- **Empty-state component** — one pattern, used consistently everywhere a list can be empty.
- **Destructive-action confirmation** — a real confirm-before-delete gate on effectively every delete/
  revoke action in the app.
- **Baseline keyboard operability** — zero `onclick`-on-`<div>` or `tabindex` misuse anywhere; every
  interactive affordance is a native, keyboard-operable element.
- **Status/role badges combine color and text**, never color-only — a real accessibility positive,
  not merely a lucky default.
- **Viewport meta tag present app-wide**, and the CSS-grid-based card layouts reflow correctly without
  any JS.
- **Bilingual page-chrome infrastructure** — labels, headings, buttons, and navigation are thoroughly
  and consistently localized via `t()` across every authenticated page; the gap is specifically in
  dynamic/validation messages (§9), not the localization system itself, which is sound.
- **Layered, defense-in-depth authorization UX** — ownership/rank/last-admin/file-count guards are
  real, tested-by-construction protections (matching Engineering SKILL.md §5.2's invariants precisely),
  consistently surfaced to the user as specific, explanatory flash messages rather than generic denials.

---

## 17. Evidence Quality / Limitations

- **STRONG** evidence: every §4 CSS/markup finding (full-file reads, cross-checked with grep for
  absence-claims like "no `:disabled` rule exists" or "zero `aria-` usage") and every §5 journey-tracing
  finding with a direct file:line citation to a specific code path. These are **SOURCE-DERIVED FACT**.
- **MODERATE** evidence: findings that required tracing a full request/response cycle across multiple
  files (e.g. the `download.php` mixed-language error finding, the flash-message-localization count) —
  still source-derived, but assembled across more than one file's worth of context.
- **WEAK / HEURISTIC** evidence: every item explicitly labeled HEURISTIC in §5 (e.g. badge-color
  conflation risk, "user might be confused by a disappearing filter option") — grounded in the code but
  ultimately a judgment call about human perception, not a verifiable fact.
- **UNVERIFIED**: every item this document labels REQUIRES RUNTIME VERIFICATION or NOT ASSESSED in §7,
  and every UNVERIFIED item in §6 — most importantly, **this entire analysis used zero browser/runtime
  evidence**. No screenshot, no rendered page, no actual contrast-ratio measurement, no real device or
  screen reader was used anywhere in this Stage-1 pass. Every visual/interaction claim is a source-code
  inference, however carefully cross-checked between CSS and markup. This is the single largest
  limitation of this document as a whole, not just of §6/§7 individually.
- **PROJECT-DOCUMENT CLAIM**: facts drawn from `docs/PROJECT_CONTEXT.md` / Engineering SKILL.md rather
  than independently re-derived from source in this session (e.g. the theme-block drift incident
  history, the deliberate Login/Register scope-exclusion rationale) — treated as reliable per this
  project's own source-of-truth hierarchy, but distinct in kind from this session's own direct
  code-reading.
- **INFERENCE**: conclusions this document draws by combining two or more of the above (e.g. §9's
  "no formal design-token layer" is an inference from many individually-STRONG observations, not itself
  a single citable fact).

---

## 18. Change Pressure Map

Where would an AI agent most likely make a bad UX/UI decision without explicit Skill guidance?

| Domain | Pressure | Why |
|---|---|---|
| Dark-mode CSS block edits | **HIGH** | Documented prior silent-drift incident (§10.B); an agent optimizing for a single change without being told the two-block rule exists will very likely repeat it. |
| Ownership/role-gated icon/state styling | **HIGH** | Looks purely cosmetic in a diff; the actual gate lives in PHP, not CSS — an agent reasoning only from the CSS/HTML it's editing has no local signal that a server-side invariant is attached. |
| Badge/status-indicator redesign | **MEDIUM–HIGH** | Natural target for "make it prettier" requests; risk of color-only encoding (accessibility regression) and of quietly changing what the badge's data source is. |
| Translating flash/validation messages | **MEDIUM** | Reads as an obviously-good localization fix; evidence (§10.C) shows it's actually cross-cutting logic work deferred by deliberate decision — an agent asked to "just translate the error messages" could touch dozens of conditionals without realizing the scope. |
| Ordinary component restyle (buttons, cards, spacing) confined to `style.css` outside the dark-mode blocks | **LOW** | Matches Engineering's own LOW tier; main risk is process mismatch (§12's ceremony-mismatch), not a correctness risk. |
| Settings/theme default changes | **MEDIUM** | Low code-complexity, but PROJECT_CONTEXT documents an explicit behavioral rationale for the current default that an agent could silently override while believing it's a cosmetic choice. |
| Responsive/mobile-nav work (adding sidebar collapse) | **MEDIUM–HIGH** | §6 confirms zero existing mobile-nav infrastructure — an agent asked to "make it responsive" would need to design a new interaction pattern from scratch, not extend an existing one, with real risk of inventing something inconsistent with the rest of the app's plain-server-rendered interaction model (§13). |
| `download.php`'s error-response inconsistency | **MEDIUM–HIGH** | The single sharpest, most concretely-evidenced UX defect found in this analysis (§5/§9) — high temptation for an agent to "just fix it" by wrapping it in the normal flash/layout system, which is actually the right fix but touches a security-sensitive streaming endpoint (visibility 403/404 responses), so it needs at least a contract-preservation-tier check (§10.B), not a pure-cosmetic one. |
| Accessibility fixes (labels, `aria-describedby`, focus states) | **MEDIUM** | §7 found no invariant conflicts, so the risk isn't authorization — it's an agent either overclaiming WCAG compliance after a partial fix, or making superficial ARIA additions (e.g. `aria-label` on icon-buttons) while leaving the deeper gaps (error-message association, input focus-visibility) untouched. |
| Login/Register theming or translation scope | **MEDIUM** | Visibly inconsistent with the rest of the app (an obvious "fix" target), but is a documented, deliberate Owner-level scope boundary (§10.C), not an oversight — high risk of an agent "fixing" something that wasn't broken by project decision. |

---

## 19. Stage-1 Empirical Problem Statement

**Strengths to preserve**: a real, if informal, design system exists — theming, visibility filtering,
avatar rendering, badges, card grids, tables, empty states, and destructive-action confirmation are each
governed by one consistent mechanism reused everywhere, and baseline keyboard operability is already
correct throughout. A future Skill's default posture toward this codebase should be **preserve and
extend**, not **redesign**.

**Repeated/systemic weaknesses**: no formal design-token layer below color/radius/shadow (typography
sizes, spacing values, and breakpoints all accrete per-component); equivalent actions (most visibly
"Delete") are styled inconsistently in more than one place; the badge-color vocabulary is reused across
several unrelated semantic axes; and — the single most consequential finding — dynamic validation/flash
messages bypass the `t()` localization system almost entirely (only 3 of the files issuing `set_flash()`
route through it), while `download.php`'s error responses additionally bypass the entire layout/flash
system, producing genuinely mixed-language, unstyled output regardless of the user's stated preference.

**Missing agent guidance an AI agent would need**: which "purely visual" surfaces actually carry an
attached authorization/data-integrity contract (§10.B); that Engineering's own risk-tier vocabulary
(LOW/MEDIUM/HIGH/CRITICAL) is not calibrated to visual-change stakes and would create a ceremony
mismatch if copied mechanically (§12/§14); that several visible inconsistencies (Login/Register's
missing theme/translation, generic error/not-found messages) are *deliberate, documented, Owner-level
scope decisions*, not defects an agent should "fix" on sight.

**Engineering/UX boundary**: four tiers established in §10, each with concrete, cited Study Archive
instances — UX/UI-owned, contract-preservation, cross-skill-dependency, and prohibited-shortcut. The
clearest boundary-violation shape found in this codebase is a visual change that silently touches an
attached invariant (ownership-gated icon state, the two dark-mode CSS blocks, or the visibility/badge
data source).

**Mistakes the future Skill must prevent**: see §12 in full; the two mistakes with direct, concrete
precedent risk in *this* codebase specifically are (a) editing dark-mode colors without re-verifying
both activation paths, and (b) "simplifying" a form or table in a way that reintroduces a
server-trusted-value-from-request pattern the app currently avoids by construction.

---

## 20. Stage-2 Design Questions

Questions only — no answers designed here.

- What is the future UX/UI Skill's exact authority — does it need any GO/approval mechanism at all for
  tier-A (UX/UI-owned) work, or only from tier B upward?
- What does a lightweight change-routing mechanism look like, given that Engineering's four-tier model
  is demonstrably miscalibrated for most UX/UI work (§12/§14) — five categories, three, or a different
  axis entirely?
- What counts as *sufficient* UX/UI evidence for a given change tier — is source inspection alone ever
  enough for a tier-B change, or does touching a contract-preservation surface always require the
  before/after runtime comparison named in §15?
- When is runtime visual inspection *mandatory* rather than optional, given this session found zero
  runtime evidence was used and still reached many high-confidence conclusions — where exactly does
  source-only stop being sufficient?
- How should responsive and accessibility guidance scale across projects that, unlike Study Archive,
  *do* have a client-side interaction layer — does the Skill need a "does this project have JS at all"
  precondition check?
- How do the Engineering and UX/UI Skills compose procedurally — does a UX/UI session ever hand off
  mid-task to Engineering's lifecycle router (§3), and if so, how is that handoff triggered and
  recorded?
- Where should project-specific design tokens (a spacing scale, a type scale, a consolidated breakpoint
  set) live, and who owns introducing them given none currently exist?
- What is the actual decision rule for "preserve vs. redesign" when a genuine inconsistency (like the
  Delete-button divergence) is found — fix opportunistically, log for a separate pass, or something
  else?
- What specific condition should make a UX/UI session STOP and escalate to Engineering, distinct from
  Engineering's own STOP conditions (SKILL.md §11) — is it simply "any tier-C/D finding," or does it
  need its own STOP list?

---

## 21. Durable Output

This file (`skills/study_archive/ux_ui/archive/UX_UI_POST_PROJECT_ANALYSIS.md`) is the only artifact
created by this session. No `skills/study_archive/ux_ui/SKILL.md` was created. No application file was
modified. See the session's separate completion report for the full Task A / Task B accounting.

---
