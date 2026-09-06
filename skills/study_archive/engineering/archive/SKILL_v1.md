---
name: study-archive-development
description: Engineering methodology and safety discipline for developing Study Archive — an academic document archive intended to scale from a single-department deployment toward university-scale and eventually multi-university architecture. Use this skill for any Study Archive architecture planning, database migration, or phased implementation session (P1 onward), so behavior stays consistent even when conversation history is unavailable.
---

# Study Archive Development Skill v1

This skill governs **how** to work on Study Archive, not **what** the project currently contains.
For current state, read the documents named in §2. This file teaches process, invariants, decision
rules, and safety discipline that must hold across every future phase, regardless of who or what is
executing the session.

---

## 1. Purpose

Study Archive is a long-lived academic information system. It began as a single-department
document archive and is being deliberately evolved — phase by phase, with explicit Project Owner
authorization at each step — toward an architecture that can scale to university-wide use and,
eventually, multiple universities on shared infrastructure. It is **not** being rewritten from
scratch, and it is **not** a greenfield project: every phase must keep the live system working for
its existing users throughout the transition.

When priorities conflict, resolve in this order:

1. **Data integrity** — no silent data loss, no orphaned rows, no orphaned physical files.
2. **Security invariants** — CSRF, ownership, visibility, admin-protection rules never weaken.
3. **Backward compatibility** — the running app keeps working at every checkpoint, not just at
   the end of a phase.
4. **Rollback safety** — every destructive-shaped step has a demonstrated way back, until the
   phase's dedicated cleanup step (which is explicit and separately authorized).
5. **Evidence-based decisions** — verify against live code/DB, don't assume from memory or docs.
6. **Maintainable architecture** — prefer patterns already proven in this codebase over novel ones.
7. **Production readiness** — hardening items are tracked, not silently dropped, even when
   deferred.
8. **Feature completeness** — a phase is done when its own scope is done, not everything possible.
9. **UI consistency** — new UI follows existing patterns (see §15's Offering-UI example).
10. **Performance** — only tuned after correctness is verified; do not add speculative indexes
    without a named query that needs them.

This ordering is itself a decision rule: when a shortcut would trade a higher item for a lower one
(e.g., skip a rollback rehearsal to move faster), the shortcut MUST NOT be taken without explicit
Project Owner sign-off.

---

## 2. Source-of-Truth Hierarchy

Read in this order. Each level can be *wrong* relative to the one below it — that is expected, not
alarming — but the order determines what to trust when they disagree.

1. **This file (`SKILL.md`)** — development methodology and rules. Rarely changes.
2. **`docs/PROJECT_CONTEXT.md`** — current project state and historical invariants. The
   recovery/handoff document. Changes as the project evolves.
3. **`docs/ARCHITECTURE_SPECIFICATION.md`** — the approved target architecture. The baseline for
   what "correct" means at the schema/security level. Changes only through the Owner Decision
   Protocol (§10), never silently.
4. **The current phase's Implementation Plan** (e.g. `docs/P2_IMPLEMENTATION_PLAN.md`) — the
   concrete, checkpointed plan for the phase actually being worked on right now.
5. **Previous completed phase execution records** (e.g. `docs/P1_IMPLEMENTATION_PLAN.md` §10) —
   what actually happened, which may include corrections discovered only during rehearsal or
   execution that never made it back into earlier planning documents.
6. **The actual live codebase** — read the files, don't infer them from a dependency table in a
   doc.
7. **The actual live database** — `SHOW`/`SELECT`/`DESCRIBE`, read-only, every time state matters.

**Hard rule: documentation MUST NEVER override contradictory live evidence blindly.** If the live
code or database disagrees with any document above it:

- Investigate — read the actual file/table, don't guess which side is right.
- Classify the discrepancy — is it a stale doc (harmless), a missed migration step (needs a plan
  fix), or a live-data surprise (may need to STOP, see §21)?
- Report it plainly, in whatever document or report you are producing.
- **Do not silently pick one side and proceed as if there was no disagreement.** Precedent: the
  P2 planning session found `database/schema.sql` was stale after P1 executed (harmless,
  documentation-only) and also found the approved spec's P2 dependency table listed `download.php`
  as needing a JOIN change it doesn't actually need (a doc imprecision, corrected in the P2 plan
  rather than propagated).

---

## 3. Verify Before Modify

Before any architecture proposal, plan, migration, or implementation work:

- MUST read the required project documents for the phase at hand (§2's levels 2–5).
- MUST inspect the actual application files the phase will touch — not just the dependency table
  in a planning doc, which may itself be imprecise (see §2's hard rule).
- MUST inspect the relevant live database structures (`SHOW CREATE TABLE`, row counts, actual
  content of any row that will be migrated) before writing a migration step that depends on them.
- MUST verify assumptions against actual evidence, not conversation memory — a session's own
  recollection of "what P1 did" is not a substitute for reading `P1_IMPLEMENTATION_PLAN.md` §10 and
  spot-checking the live DB.
- MUST identify and report documentation drift found along the way, even when it doesn't block the
  current task.
- MUST NOT rely only on what a prior conversation turn said happened — a fresh session has no
  access to that conversation, and even the *same* session's memory can be wrong.
- **MUST NOT execute any DDL/DML against the live database during Architecture, Owner Decisions,
  Implementation Plan, or Plan Review stages (§4)** — every database interaction at these stages is
  read-only (`SHOW`/`SELECT`/`DESCRIBE`). This is stated explicitly, not left to be inferred from
  the stage ordering alone, because "just this one small check" is exactly the kind of exception a
  planning session could otherwise rationalize.

This is not a one-time gate — it applies fresh at the start of every phase's planning, and again,
narrower, immediately before that phase's actual execution (see §9, Live Re-Scan). The P1→P2
planning sequence is the reference example: P2 planning re-verified P1's claimed end-state live
before trusting it, rather than assuming P1's own "SUCCESS" self-report was sufficient.

---

## 4. Phase Development Lifecycle

Every phase MUST move through these stages, in order, with no stage skipped:

```
Architecture
  → Architecture Review          (alternatives considered, rejected options explained)
  → Owner Decisions               (ambiguous/institutional questions answered explicitly)
  → Implementation Plan           (checkpointed, reversible, regression-gated)
  → Plan Review                   (re-verify plan against live system before trusting it)
  → Operational Readiness         (backup verified, rollback rehearsed in a scratch DB)
  → Pre-Execution Gate            (final live re-check, e.g. re-run the Live Re-Scan of §9)
  → Explicit GO                   (Project Owner command naming the phase, in writing)
  → Implementation
  → Regression Testing            (full suite, not just the new feature)
  → Execution Record               (appended to the phase's plan doc, not a rewrite of it)
  → Phase Complete
```

**MUST NOT** treat "a plan document exists" as authorization to implement. **MUST NOT** treat
"Owner approved the architecture/decisions" as authorization to implement — those are separate,
earlier gates. Precedent: in this project, `"GO — BEGIN P1 IMPLEMENTATION"` was a distinct, later
command from the architecture-baseline approval (OD-5) — two separate authorizations, not one. (P1
itself folded "plan/sequence sign-off" into that same GO event rather than treating it as a third,
earlier gate — that is an acceptable simplification for a phase small enough to review in one pass,
but the Plan Review and Operational Readiness stages above MUST still be genuinely completed before
GO is requested, even when a single Owner message ends up covering more than one gate at once.) The
same separation applies to every future phase: approving a phase's Owner Decisions is not the same
event as authorizing its execution — precedent: P2's Owner Decisions (OD-P2-1 through OD-P2-8) were
approved in a dedicated session that explicitly did not authorize P2 execution.

A session whose task is explicitly scoped to "planning only" or "decisions only" MUST stop at the
appropriate stage above and MUST NOT advance further even if it would be technically capable of
doing so.

**Closing the folding loophole**: the fact that P1 folded plan/sequence sign-off into its GO event
(above) MUST NOT be read as license to request or accept a GO before Operational Readiness (§7, §8)
is actually, verifiably complete. Before requesting or accepting a GO for any phase, MUST
independently confirm — by reading the phase's plan document, not by recalling a conversation — that
a verified backup (§7) and a rehearsed rollback (§8) are already recorded there with concrete
evidence (dates, what was checked, what was found), not merely asserted. If either is missing or
stale, MUST treat the phase as not yet at the GO stage, regardless of how the Owner's message is
phrased, and say so plainly rather than treating an ambiguous "go ahead" as the phase-naming,
in-writing GO this lifecycle requires.

---

## 5. Additive-First Migration Rule

Default migration shape, in order:

```
CREATE new structure (empty)
  → add new FK/column as NULLABLE
  → backfill from legacy data
  → verify (row counts, zero unexpected NULLs)
  → add FK constraint
  → enforce NOT NULL
  → application read-path cutover
  → application write-path cutover
  → stable usage period
  → legacy cleanup (separate, later, separately authorized phase)
```

- MUST prefer this shape over any migration that drops or destructively rewrites an existing
  column/table within the same phase that introduces its replacement.
- MUST keep legacy columns/tables alive until a **dedicated cleanup phase**, not as an
  afterthought at the end of the phase that replaced them — this is what keeps every earlier
  checkpoint rollback-safe with zero data loss (see §6).
- SHOULD let old and new constraints (e.g. two unique keys) coexist during the transition rather
  than force a single atomic swap, **unless** the swap can be proven safe in one atomic statement.
  "Proven safe" has a narrow, specific meaning here — it means the plan document shows, in writing,
  that no row can be in a state the atomic statement would mishandle at the moment it runs (e.g. a
  NOT NULL column's unique-key transition, where NULL-uniqueness semantics can't create a gap
  because no row is NULL at the time of the swap). It does NOT mean "seems fine" or "should be
  quick" — if the safety argument can't be written down and checked, coexistence is the default,
  not the atomic swap.
- MUST NOT loosen a constraint (e.g. NOT NULL → NULL) without documenting exactly when it becomes
  lossy to reverse — loosening a constraint is reversible only until real data exists that depends
  on the loosened state (see §6's Point-of-No-Return discussion).

Reference pattern: the P1 `users.university_id` cutover and the P2 `subjects`/`subject_offerings`
split both followed this shape end-to-end and are worth re-reading as concrete examples before
designing a new migration.

---

## 6. Migration Checkpoints

A migration plan is **not** one giant SQL script. Every individual step MUST specify, explicitly:

- the exact change (DDL/DML, one logical operation);
- its prerequisites (which earlier steps must have completed);
- whether the **old** application code path still works after this step — **verified by actually
  executing the current application's real INSERT/UPDATE statement (copied from the source file,
  not reconstructed from memory) against the post-step schema during rehearsal, not asserted from
  reasoning alone.** "The app only reads this column, so writes are unaffected" is exactly the kind
  of reasoning that misses a NOT NULL constraint silently rejecting an old INSERT that never
  populated the new column — this class of defect only surfaces by running the real statement;
- whether the **new** application code path works after this step (if applicable yet);
- a verification query proving the step did what it claimed;
- the rollback action for this step specifically, in isolation;
- Point-of-No-Return analysis: is this step still losslessly reversible, and if not yet, at what
  *later* event (usually: real new data being written under the new shape) does it stop being so;
- which regression gate must pass before the next step may run;
- an **idempotency/already-applied check**: before executing the step's DDL/DML, check whether its
  target state already exists (e.g. `SHOW TABLES LIKE`, a row-existence `SELECT`, a `SHOW CREATE
  TABLE` diff) and skip cleanly if so, rather than blindly re-running a statement that assumes a
  pre-step state which may no longer hold. If a step would silently create a duplicate or corrupt
  state on re-run (most INSERTs into a table without a matching UNIQUE constraint, most
  non-idempotent `UPDATE`s), it MUST be explicitly flagged as non-idempotent in the plan, with the
  companion already-applied check spelled out, not left to the executor to improvise.

**Seed/catalog completeness**: when a checkpoint seeds rows into a fixed, already-approved catalog
(a role/permission list, a lookup table, etc.), the plan MUST embed, or precisely and
unambiguously cite (exact document + section), **every** column's full value the `INSERT` actually
needs — not only the column(s) most central to that checkpoint's own logic (e.g. a permission
catalog's `key_name`s) while silently leaving another required column (e.g. `description`) to be
re-derived from a different document at execution time. This does not forbid citing the
architecture spec as the source of truth (§2's hierarchy already allows that) — it forbids a plan
that is *incomplete without saying so*, forcing the execution session to notice the gap itself and
go recover the missing values under time pressure rather than following the plan as written.
Precedent: P4's catalog-seeding checkpoint table listed `permissions.key_name`s only;
`permissions.description` text had to be recovered directly from the architecture spec during
implementation. The recovery was faithful and caused no defect (confirmed by the independent P4
audit), but the plan itself should already have contained or precisely pointed to it, so the gap is
worth closing at the source rather than relying on every future implementer to notice and recover
correctly.

**On step failure**: if a step's own execution errors out, MUST stop immediately — do not attempt
the next step, do not improvise an undocumented fix. Roll back only that step, using its own
documented rollback action (not a guess at what "should" undo it). Report the exact error before
doing anything else. Treat the phase as requiring a fresh Plan Review (§4) before any retry, not an
immediate re-attempt — the failure itself is new evidence the plan may need revising, not just
re-running.

**Physical file operations count as steps too**: if a migration step moves, renames, or copies
physical files (not just deletes them — see §14 for deletion specifically), it MUST follow this
same per-step discipline: a verification check that the operation succeeded, and a rollback action.
Prefer copy-then-verify-then-delete-original over move/rename, so an interrupted operation never
leaves a file that exists nowhere.

**Concurrent load**: this is a live, actively-used system during migration, not a frozen one (§9).
DDL against a table under real concurrent traffic can block or be blocked by in-flight requests for
the lock duration, which varies by statement type and MUST be checked for the specific MariaDB
version in use (§19), not assumed. SHOULD schedule DDL-bearing checkpoints for a low-traffic window
where practical, and the plan SHOULD note the expected user-facing effect, if any, of each such
step.

A phase-level rollback is **not** simply "run each step's own rollback in reverse order" once
multiple steps have executed — FK dependencies between new tables/columns can make the naive
reverse order fail. **MUST rehearse the full multi-step teardown** (§8) rather than assume the
per-step rollback column composes correctly; P1's own rehearsal found two real teardown-order
defects (an index needed by a still-present FK, and a child junction table that had to be dropped
whole rather than emptied-then-dropped) that were not obvious from the plan text alone.

A phase SHOULD declare explicitly whether it has a true Point of No Return at all. Prefer designs
with **none** until the dedicated cleanup phase (§5) — this has held for every phase planned in
this project so far and should be treated as the default expectation, not a bonus.

---

## 7. Backup and Restore Discipline

This is the core of the Phase Lifecycle's **Operational Readiness** stage (§4). Before a phase's
**first** migration step that mutates live schema or data:

- MUST have a verified backup covering: the database (full logical dump), uploaded document
  storage, user-asset storage (e.g. avatars), the project's application directory, and any
  relevant configuration. **One verified backup, taken before the first mutating checkpoint,
  covers the whole phase** — this is not a "backup before every checkpoint" rule; re-checking
  recency (below) is what covers the gap between backup time and each later checkpoint, not a
  fresh full backup each time.
- A backup is **not** "verified" merely because a dump file exists on disk. Where practical, MUST
  restore the dump into an isolated scratch database and compare: table list, row counts, `SHOW
  CREATE TABLE` output for every table, and any constraint the phase specifically cares about.
- MUST re-verify the backup is recent enough if meaningful time has passed or the live system has
  continued to receive real traffic since the backup was taken (this project's own app is never
  frozen during planning — see §9).

This applies to every phase that touches schema or data, not only "large" ones — the discipline
does not scale down for a phase that looks simple on paper.

---

## 8. Scratch Rehearsal Rule

The other half of the **Operational Readiness** stage (§4, §7). Before any migration classified
above Low risk:

- MUST rehearse the complete migration sequence (build **and** tear down) against an isolated,
  disposable scratch database — never the live database.
- Use the rehearsal specifically to surface: FK teardown ordering problems, index-vs-FK
  dependency conflicts, NOT NULL transition failures under `STRICT_TRANS_TABLES`, charset/collation
  mismatches, backfill logic errors on edge-case data, and rollback-script defects.
- MUST record every defect found during rehearsal, with what was wrong and what fixed it, in the
  phase's plan document — a rehearsal that finds nothing worth recording is either unusually clean
  or wasn't probing hard enough; a rehearsal that finds something and doesn't record it wastes the
  next person's time re-discovering it live.
- MUST NOT let rehearsal activity touch the live database under any circumstance, including
  read-only convenience queries run against the wrong connection by mistake — always double-check
  which database a rehearsal session is pointed at before running DDL.
- **Every scratch/rehearsal resource has a tracked lifecycle, not just a tracked creation.** Any
  scratch database, rehearsal schema, temporary directory, or generated verification artifact
  created for this purpose MUST be recorded (name, purpose, date created) and, before the session's
  Completion Report (§22) is issued, either confirmed cleaned up — verified by re-checking it no
  longer exists, not merely assumed — or explicitly retained with a documented reason. Cleanup
  itself MUST be verified without touching or risking the live database/resource it was rehearsing
  against — confirm which connection/target you're dropping before dropping it, the same discipline
  this section already requires when building it. Precedent: P2's `study_archive_p2_verify` scratch database
  was left behind after Operational Readiness and was only caught by the independent P2
  Post-Implementation Audit — §16's test-row ledger tracks rows left in live tables, but a whole
  scratch database is a different resource class that ledger never covered, which is exactly why it
  needs this separate, explicit lifecycle rule.

---

## 9. Live Re-Scan Before Migration

This is the **Pre-Execution Gate** stage (§4). Any migration step whose correctness depends on a
**snapshot of mutable live data** (row counts, specific mappings, "how many X exist right now")
MUST be preceded by a fresh, live re-scan immediately before that step actually executes — not
satisfied by a planning-time snapshot no matter how recently it was taken.

**Drift does not stop after the first checkpoint.** A checkpointed migration can span hours, days,
or multiple sessions between its data-dependent backfill checkpoint and its later application-
cutover checkpoint — the live application is normally not frozen for that whole window (§7's
"never frozen during planning" applies equally during execution). If a checkpoint later in the same
phase depends on the same live-data assumption a re-scan already checked earlier in the phase, MUST
repeat the re-scan immediately before that later checkpoint too, not rely on the earlier one — a row
created through the still-live application between two checkpoints is exactly as real, and exactly
as unmappable-by-inference, as one found during the first re-scan.

- MUST NOT assume a planning-time row count, mapping, or "there's only one of these" fact still
  holds at execution time. The application under migration is normally never frozen during
  planning — users and admins can keep creating real rows the whole time.
- If the re-scan finds a row that does not match an already-approved mapping (an unexpected
  subject, department, campus, role, tenant, or any other organizational/institutional fact):
  **STOP.** Do not infer, guess, or default a mapping for it — not from a naming-convention
  pattern, not from "it's probably the same as the last one," not from any heuristic.
  Escalate to the Project Owner and wait for an explicit answer before continuing that step.
- This is a **standing, repeatable procedure**, not a one-time fact that gets checked off once and
  trusted forever. A planning document recording "re-scanned, found N rows, all mapped" describes
  that moment only — the same re-scan must run again at actual execution time, however much later
  that is.

---

## 10. Owner Decision Protocol

Every planning document MUST clearly separate three different kinds of statement:

1. **Technical facts** — verified against live code/DB (§2, §3). Not debatable; either true or
   corrected.
2. **Architectural recommendations** — a reasoned proposal, with alternatives considered and
   rejected reasoning stated. Debatable, but the reasoning must be shown, not just the conclusion.
3. **Project Owner decisions** — genuinely ambiguous business/institutional questions that no
   amount of code-reading can answer, because the answer depends on real-world facts (an
   institution's actual department names, a policy choice, a UX preference) the system cannot
   derive.

**MUST NOT invent institutional data** — real department names, faculty names, curriculum names,
codes claimed to be "official," or any other real-world fact the Project Owner would need to supply
or confirm. **MUST NOT silently decide an ambiguous business rule** and present it as settled
without flagging it as a decision that was made and why.

Every open decision listed in a planning document MUST include:

- the question, stated precisely enough to answer without re-deriving context;
- the realistic options (not a false binary if more genuinely exist);
- a recommendation, with reasoning — silence is not neutral; a recommendation helps the Owner
  decide faster even if they choose differently;
- the consequences of each option, especially for later phases (does this option foreclose or
  complicate something in P+1?);
- which phase/checkpoint the decision blocks (`BLOCKS THIS PHASE`, `BLOCKS ONLY FINAL CUTOVER`,
  `CAN DEFER TO PHASE N+`) — not every open question blocks everything;
- whether it can safely defer, and if so, to where, with reasoning for why deferring doesn't
  create a redesign trap later (see §18).

When a phase needs to mint a new internal identifier standing in for real institutional data (a
short code for a department/campus/etc. that the Project Owner supplies but that is not an official
registrar/institutional code), it MUST be conflict-checked against the full codebase and live
database before acceptance (search for the exact string, not just a similar one), and MUST be
labeled wherever it appears in the running system as an internal identifier, not an official one —
so nobody downstream mistakes a Study-Archive-internal code for a real institutional code.

Once the Project Owner answers, the document MUST be updated to show the decision as **resolved**
with the approved answer recorded verbatim (or close to it) and the reasoning preserved — do not
delete the original recommendation/reasoning when recording the resolution; append the resolution
alongside it so a future reader can see both what was proposed and what was actually decided.
**A decision-approval event is not an execution-authorization event** — keep these visibly distinct
in the document (see §4).

---

## 11. Security Invariants

These MUST be preserved across every phase unless the Project Owner explicitly, deliberately
changes one — "the new architecture makes this awkward" is never sufficient justification on its
own to weaken a security invariant; if a phase's design seems to require weakening one, that is a
signal to redesign the phase, not the invariant, and if genuinely unavoidable, it must be escalated
per §21, not silently absorbed into an implementation plan.

- CSRF protection on **every** state-changing request — new forms added by any phase MUST call the
  project's CSRF-verification function as the first line of their POST handler, no exceptions.
- **All authorization checks are server-side.** UI hiding/greying of a control is convenience only,
  never the enforcement mechanism.
- Password hashing stays on the platform's standard hashing function — never a custom scheme.
- Session security mechanisms (fixation protection, cookie hardening, strict mode) are never
  loosened without an explicit, separate Owner decision.
- Upload validation (extension + MIME + structural checks as applicable) is never bypassed for
  convenience, including for admin-only upload paths.
- Download/access authorization is re-checked on every request that serves a stored file — never
  cached across requests in a way that could serve stale permission state.
- Visibility enforcement (whatever tiers the system defines) MUST be applied to **every** query
  that lists or counts protected content for a non-privileged viewer — a query that forgets this
  filter is the single most-repeated bug class in this project's history; treat any new
  listing/counting/search query as a candidate for this bug until proven otherwise. MUST call the
  existing shared visibility-condition function to get this filter, never hand-roll an equivalent
  `WHERE` clause inline — a hand-rolled copy is exactly how this bug class recurs, since it can
  drift from the real rule silently while still looking correct at a glance.
- File ownership rules are enforced independently of any administrative hierarchy.
- Admin-to-admin protection (no admin account can edit/disable/delete another admin account) and
  Last-Active-Admin-or-Role-Holder protection (never allow the system to reach zero active holders
  of an administrative capability) are preserved, generalized to whatever scope model a later phase
  introduces (see §12), never dropped.
- **No privilege escalation is reachable through direct POST** — every server-side check that a UI
  control implies MUST be independently re-verified in the handler, because a control being hidden
  or disabled in the UI is never itself a security boundary.
- **Never expose raw database exceptions, SQL text, stack traces, or absolute filesystem paths to
  the client.** Any state-changing write that references a request-supplied entity/FK identifier
  (e.g. a dropdown-sourced `department_id`, `subject_id`, or similar) MUST catch the failure and
  show a generic, translated flash message instead of letting the exception propagate — never
  assume a bad value is unreachable just because the UI only offers valid-looking dropdown options,
  since a direct/tampered request bypasses the dropdown entirely. Follow this codebase's own
  established pattern of wrapping the FK-referencing `INSERT`/`UPDATE` in `try/catch
  (PDOException)` (see `subject_detail.php`'s `add_offering` handler) for every *new* write path
  that introduces a request-supplied FK reference, from the moment it is written — do not treat it
  as retrofittable after a live incident. This is a distinct, recurring bug class from the
  visibility-filter omission above: it has now surfaced twice in this project's history (once,
  pre-P1, in `admin/file_management.php`'s `update_file`, and again in P3's
  `admin/curriculum_management.php`'s Curriculum-creation handler, caught by the independent P3
  Post-Implementation Audit) — treat any new write handler taking a request-supplied FK/entity id
  as a candidate for this bug until its failure path has been adversarially tested (see §16).

**Explicit standing rule, stated in full because it must survive independent of any other document:
File Ownership is stronger than administrative hierarchy.** No role — including any future "System
Admin" or top-of-hierarchy role introduced by a later phase — automatically gains permission to
edit or delete another user's file merely by being higher in the role hierarchy. This can only
change through an explicit, deliberate Project Owner decision recorded via the Owner Decision
Protocol (§10) — never as a side effect of "the new RBAC model makes hierarchy the natural rule."

---

## 12. RBAC Rule (applies once a scoped-role phase begins)

When a phase introduces roles/permissions/scoping:

- Authorization decisions MUST be evaluated as **Permission + Scope**, evaluated together — never
  simplified to "a higher-ranked role can do everything a lower-ranked role can do, plus more."
  A higher rank with a *narrower* scope must not be able to act outside that scope merely because
  its rank is high.
- Row-level invariants that predate the RBAC model (see §11's File Ownership rule) are a **second,
  independent layer** that scoped permission checks do not override. Passing a Permission+Scope
  check is necessary but not sufficient — the row-level invariant must also pass.
- Granting or escalating any role/scope to another user MUST itself be a permission-gated action,
  with an explicit rule preventing self-escalation and preventing granting a peer-or-higher rank
  than the grantor's own.
- Scope relationships (does this assignment's scope actually cover the target object's scope) MUST
  be verified server-side on every write, not inferred from the UI having only offered valid-looking
  choices.
- MUST NOT implement any part of the RBAC model during a phase whose approved scope does not
  include it, merely because the schema changes introduced by an earlier phase make it newly
  possible to start. "We could build it now" is not "we should build it now" — see §18.

---

## 13. Tenant Integrity Rule (applies once any multi-tenant-shaped column exists)

- Any entity that becomes tenant-scoped (e.g. university-scoped) MUST be resolvable, via its FK
  chain, to **exactly one** tenant — never zero, never ambiguous, never two disagreeing paths.
- If a table has more than one FK path that could each independently resolve to a tenant (e.g. one
  FK straight to the tenant table, another via a two-hop join through a different parent), those
  paths MUST be kept in agreement. If the database engine cannot express "these two paths must
  agree" as a single constraint (common in MariaDB, which lacks cross-join CHECK constraints),
  **implement the equivalent check in the application layer**, at the exact point where the row is
  written — not deferred to a later validation pass, not deferred to whenever the multi-tenant
  phase is actually opened.
- MUST implement this app-layer check from the **first phase where the relationship becomes
  writable**, even if it can never actually fail yet because only one tenant currently exists. The
  cost of writing the check early is low; the cost of a silent cross-tenant leak once a second
  tenant exists is a real security/data-integrity incident. Do not wait for the multi-tenant phase
  to "activate" a check that could have existed all along.
- A regression test that documents "this cannot be violated given current data" is still a
  meaningful test to keep in the suite — it proves the guard exists and is wired in, even before it
  can be exercised by real data.
- **This same reasoning generalizes to any DB-inexpressible multi-column app-layer invariant, not
  only tenant-path agreement** — e.g. "exactly one of N nullable columns may be non-NULL," a shape
  this project's scoped-role assignments require. MariaDB 10.4 enforces neither shape as a
  constraint; both need identical treatment: validated at the exact write point, from the first
  phase where that write path exists, with a regression test proving the guard even before real
  data can violate it. Confirmed independently during the P4 audit: the database alone did not
  reject a row with two mutually-exclusive scope columns populated simultaneously — the row
  inserted silently, with a generated column's `CASE`-based priority order masking the invalid
  state rather than rejecting it — exactly the class of gap this section's app-layer requirement
  exists to close, encountered here in a non-tenant column shape.

---

## 14. Physical File Lifecycle

**Database cascades cannot delete physical files on disk.** Any delete operation that affects
stored files MUST explicitly account for all of the following, in order:

1. **Authorization** — confirm the acting user/role may perform this delete, per §11/§12.
2. **Identify affected stored filenames** — query and capture them **before** any DB delete runs.
3. **DB deletion order** — perform the database delete (direct or cascaded) in a way consistent
   with the rest of the migration's FK/constraint shape.
4. **Physical unlink** — remove the actual files from storage, using the filenames captured in
   step 2, **after** the DB delete has succeeded.
5. **Partial failure handling** — decide and document what happens if a physical unlink fails
   partway through a batch (today's baseline behavior in this codebase suppresses the error and
   continues, which can leave an orphaned physical file with no DB row — this is a known, currently
   accepted low-severity risk, not something a new phase should silently worsen, but also not
   something a new phase is required to fix unless explicitly scoped to do so).
6. **Orphan detection** — after any file-related migration or bulk delete, verify DB rows and
   physical files match **in both directions**: every DB row's stored filename exists on disk, and
   every file on disk corresponds to a DB row. Do not check only one direction.

---

## 15. Application Cutover Rule

For any architecture change large enough to touch how existing data is read/written by the
application (not just schema additions):

- SHOULD separate the work into: schema preparation → data backfill → application **read-path**
  cutover → application **write-path** cutover, as distinct, individually-regression-gated steps,
  when practical.
- SHOULD cut the read path over before the write path, so the write path's correctness can be
  verified by immediately reading back through an already-proven read path, rather than trusting a
  new write path and a new read path simultaneously.
- MUST keep the legacy relationship (old column/FK) intact and correct throughout the transition
  window, so a **code-only rollback** (revert the deploy, no DB changes needed) remains available
  right up until the dedicated cleanup phase.
- MUST NOT deploy code that depends on a schema element before that element has been created,
  backfilled, and verified live — the DB migration leads, the code cutover follows, never the
  reverse. This is the mirror image of the previous bullet: just as legacy DB structure must outlive
  the code that stops using it, new DB structure must exist before code starts assuming it.
- **When a rollback is needed after both code and schema have changed, roll back code before
  schema, in that order, not simultaneously and not schema-first.** Reverting code first stops any
  new data from being written in the new shape; only once that is confirmed is it meaningful to ask
  whether the schema change itself can still be reverted losslessly (see §6's Point-of-No-Return
  analysis — a schema change that looked reversible before cutover can stop being so once the new
  code path has written real data under it).
- New UI introduced during a cutover SHOULD follow existing UI patterns in the codebase (e.g.
  simple dropdown/select-based controls, consistent styling, same form/CSRF conventions) rather
  than introducing a new interaction paradigm — save UX innovation for a dedicated later pass, not
  bundled into a data-model migration.
- The Subject/Offering split (this project's P2) is the reference pattern for this rule — read its
  plan document's Deployment Sequence section as the template for how to checkpoint a cutover of
  this shape.

---

## 16. Regression Testing

- Every phase MUST preserve every previously-working behavior — a phase is not done when its new
  feature works, it is done when its new feature works **and nothing else broke**.
- Regression coverage MUST include both: (A) the phase's own new functionality, and (B) the full
  set of pre-existing project invariants (auth, CSRF, ownership, visibility, admin-protection,
  upload/download, i18n/theme persistence, and anything else the project's regression history has
  accumulated) — re-run the **whole** suite, not just a subset judged "probably unaffected."
- Define explicit regression gates **before and after** every checkpoint classified above Low risk
  in the migration plan (§6) — not just once at the very end of the phase.
- A checkpoint's regression gate MUST be checked before the next checkpoint begins, not batched up
  and checked only once several checkpoints have already run — this is what makes a mid-sequence
  failure cheap to diagnose instead of requiring a bisection across several DDL statements.
- Some regression checks unavoidably create real rows in the live database to prove a live code
  path works (e.g. "new registration succeeds end-to-end" necessarily inserts a real user). This
  project's own history already has such rows sitting in the live `users` table from prior
  regression testing. MUST record every such row's identifying value(s) in the phase's execution
  record when it is created, so it is identifiable later as test-created rather than a real user —
  do not leave anonymous test rows indistinguishable from genuine data with no record of why they
  exist.
- **Any new write handler that accepts a request-supplied entity/FK identifier (e.g. a
  dropdown-sourced id) MUST include at least one adversarial tampered/stale-identifier test**:
  submit a nonexistent id via a direct request (not the UI, which would only ever offer
  valid-looking values) and confirm the failure is caught gracefully — a friendly message, zero
  orphaned row, and zero leaked exception detail per §11 — rather than an uncaught exception. This
  is the write-side counterpart to treating every new listing/counting query as a visibility-bug
  candidate (§11): treat every new write path the same way until its failure path is proven safe,
  not merely its success path.
- **A regression gate's required outcome is the invariant it protects, not any one particular
  testing mechanism for reaching it.** When the preferred mechanism for exercising a gate is
  unavailable because of a legitimate environment or tool safety boundary (e.g., a sandboxed
  execution environment refusing a direct role-promotion `UPDATE`, or any other guardrail that
  exists for a real reason) — MUST NOT bypass, disable, or work around that boundary to force the
  preferred mechanism through anyway. Instead: use the strongest safe alternative evidence actually
  available (e.g., the equivalent live application code path, a reviewed prior execution record, or
  a scratch-database rehearsal of the same operation), and the report MUST state plainly which gates
  were independently exercised and which were not, and why. **MUST NOT report a gate as
  executed/passed when it was not** — an unreachable gate is disclosed as unreachable, never
  silently marked pass and never silently omitted (see §22, "Verification performed"). Precedent:
  the independent P2 Post-Implementation Audit could not itself reproduce one admin-role regression
  test because its execution environment blocked the direct role-promotion operation the original
  test used; disclosing that gap plus the strongest available alternative evidence — not fabricating
  a pass — is the generalized response for any future phase that hits the same kind of boundary.
- **When two evidence types are both available for the same claim, use the strictly stronger one,
  even if the weaker one is more habitual.** Filesystem mtimes are weaker proof that a file "was not
  touched" than a byte-for-byte diff against a verified pre-phase backup (§7) — mtimes can mislead
  (a `touch`, a redeploy that rewrites identical content, clock/timezone skew, coarse timestamp
  granularity), while a diff is definitive and, run recursively against the whole project tree, also
  catches files outside the previously-assumed impact map, not only the ones already suspected.
  Whenever a verified pre-phase backup with a full application-directory copy already exists, an
  execution record or independent audit confirming "no file outside the declared scope changed"
  MUST use a full-tree diff against it, not an mtime check alone. Confirmed as a real evidence-
  strength gap during the P4 audit: the implementation session's mtime check of its own named
  impact-map files was correct as far as it went, but the audit's full recursive diff against the
  same phase's verified backup gave strictly stronger, whole-project-tree confirmation of the
  identical claim.

---

## 17. Documentation Synchronization

- After implementation, MUST append an **execution record** to the phase's own implementation plan
  document (see `P1_IMPLEMENTATION_PLAN.md` §10 for the pattern) — recording what actually ran,
  any deviation from the plan, and the final verification results.
- MUST NOT rewrite a plan document's earlier sections to read as if they were always historical
  fact — append the execution record on top; leave the original plan legible as what was proposed
  and approved, so a future reader can see the reasoning trail, not just the outcome.
- `PROJECT_CONTEXT.md` SHOULD be updated only when the current project state **materially**
  changes (a phase completes, a significant new invariant is established) — not for every minor
  planning detail, which belongs in the phase's own plan document instead.
- **Schema snapshot synchronization is a Phase Complete precondition, not optional housekeeping,
  for any phase whose Implementation Plan included DDL.** Before such a phase is marked Phase
  Complete (§4), MUST regenerate `database/schema.sql` against the actual live post-execution
  schema, then validate the regenerated file using the same isolated-scratch-database comparison
  technique §7 already uses for backup verification — load the snapshot into a scratch database,
  structurally compare it against live (table list, `SHOW CREATE TABLE` per table), record the
  result in the phase's execution record, and clean up the scratch database per §8's resource-
  lifecycle rule. A phase that made no schema changes has nothing to regenerate and is exempt.
  Precedent: `database/schema.sql` drifted across P1 and P2 — it still reflected the pre-P1 shape
  even after both phases' own completion — and was only caught and corrected during the independent
  P2 Post-Implementation Audit; making this check a closure gate instead of a best-effort flag is
  what closes that gap for P3 onward.
- MUST avoid stale status markers — a document claiming "PENDING" or "OPEN" on something that was
  actually resolved is actively misleading to a future session with no memory of the resolution;
  when a decision or checkpoint resolves, update every place in the document that referenced it as
  open, not just the primary decision table.

---

## 18. Scope Discipline

- Every phase's plan document MUST explicitly state what it **does** and what it **does not**
  implement, naming the specific concepts deferred and which future phase owns them.
- MUST NOT pull a future phase's feature forward merely because the current phase's schema change
  makes it newly *possible* — "we could add this column now since we're already touching this
  table" is not sufficient justification; the bar is a **demonstrated current requirement**, not a
  hypothetical future convenience.
- Concrete precedent from this project: P2 (Subject/Offering split) must not silently implement P3
  (Curriculum) or P4/P5 (RBAC) concepts merely because the new schema shape brings them within
  reach. A `subject_offerings.campus_id` column was explicitly considered and rejected during P2
  planning for exactly this reason — no current data gave any signal it was needed, and adding it
  speculatively would have introduced a new invariant to maintain for zero present benefit.
- **Exception**: it is acceptable, and often correct, to add a column/table now specifically to
  avoid an expensive future redesign — but only when that future need is not speculative. The test
  is: "does *today's* approved architecture already name this as a known, structural requirement of
  a near-term phase" (e.g. `university_id` added early in tenant-scoped tables, per the approved
  Tenant-Ready Architecture directive) — as opposed to "this might be useful if some hypothetical
  future scenario occurs." When genuinely unsure which case applies, treat it as the Owner Decision
  Protocol (§10) territory rather than deciding unilaterally.

---

## 19. MariaDB / Windows / XAMPP Environment Lessons

Reusable technical lessons already discovered in this project — apply them proactively in any
future phase rather than rediscovering them the hard way:

- MariaDB 10.4's specific feature set matters — do not assume capabilities from newer
  MySQL/MariaDB versions (e.g. no cross-join `CHECK` constraints; see §13).
- The server's *default* charset/collation may differ from the charset every actual table uses —
  verify `character_set_server`/`collation_server` and never omit the explicit
  `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` clause on any new `CREATE TABLE`, even though
  it matches what every existing table already does implicitly.
- `sql_mode` including `STRICT_TRANS_TABLES` is a safety net for NOT NULL transitions — it turns a
  would-be silent data-truncation/coercion into a hard failure. Confirm it's set before relying on
  a NOT NULL cutover step to fail loudly instead of silently corrupting data; do not assume it is
  set without checking.
- FK-supporting indexes constrain teardown order — InnoDB requires a supporting index on an FK
  column at all times, so an FK must be dropped before its supporting unique/index, not after. A
  child junction table with FKs to two parents must be dropped as a whole table, not emptied via
  `DELETE` and dropped later once the parents are already gone.
- On this Windows/git-bash environment, passing non-ASCII (e.g. Thai) text inline to a shell-invoked
  SQL client can corrupt UTF-8 multi-byte sequences. **Prefer writing the statement to a UTF-8-
  encoded `.sql` file and sourcing it** (`mysql ... < file.sql`) whenever a migration step inserts
  non-ASCII seed data, rather than passing it as an inline `-e` argument.
- This development machine's MariaDB installation has a documented history of system-table
  corruption traced to improper shutdowns (no Windows service registered for `mysqld`/`httpd`, so
  both must be started/stopped manually). Treat this as a standing environmental risk: back up
  before any schema-touching sequence, and avoid unnecessary database restarts mid-migration.
- Do not hard-code today's row counts, table counts, or specific ID values into this skill file —
  those belong in `PROJECT_CONTEXT.md` and the current phase's plan document, which are expected to
  change; this file's job is the *pattern*, not the *snapshot*.

---

## 20. Token-Efficient Working Style

- Inspect only the files actually relevant to the current phase/task — do not re-read the entire
  codebase "just in case" when a targeted grep or a specific file read answers the question.
- Do not re-read large documents in full repeatedly within the same session once their relevant
  content has already been extracted and acted on — re-read a *section* if needed, not the whole
  file, unless the whole file's structure itself is in question.
- Treat `PROJECT_CONTEXT.md` and the current/previous phase plan documents as the durable handoff
  artifacts between sessions — a future session should be able to pick up from these documents
  alone, without needing this conversation's transcript.
- Produce concise execution/verification reports — state the result, not the full transcript of how
  it was obtained.
- Record durable knowledge (decisions, invariants, discrepancies found) in project files, not only
  in chat responses that will not persist into the next session.
- Avoid restating unchanged architecture in every report — reference the section of the document
  that already covers it instead of re-explaining it.

**Hard limit on this rule: token efficiency MUST NEVER justify skipping verification for
destructive or security-sensitive work.** Skipping a live re-scan (§9), a backup verification (§7),
a rehearsal or its resource cleanup (§8), or a schema snapshot synchronization check (§17) to save
time or context budget is not an acceptable trade — those steps exist specifically because this
project's own history shows they catch real defects (including documentation drift and leftover
scratch resources, not only data-loss risks) before or instead of a future session rediscovering
them the hard way.

---

## 21. STOP Conditions

The agent MUST stop and request explicit Project Owner input — not proceed with a best guess, not
silently pick a default — whenever any of the following is true:

- Live database/codebase state materially contradicts an approved plan or the approved
  architecture baseline.
- A live re-scan (§9) finds a row/entity that has no approved mapping, and the gap cannot be
  resolved by inference (it never can be — see §9).
- A decision requires institutional/real-world data (names, codes, policies) that does not already
  exist, verified, in the project's documentation or the Project Owner's own words.
- A phase's design appears to require changing the already-approved architecture baseline beyond
  what that phase was scoped to decide (see §10's distinction between a phase-scoped design
  question and a baseline change) — in that case, follow the heavier process: document the issue,
  classify its severity, explain the proposed architecture change, mark it as requiring Project
  Owner approval, and stop before editing the approved specification document itself.
- A migration's rollback cannot be demonstrated safely (rehearsal fails, or no rehearsal has been
  performed yet for a step above Low risk).
- Backup verification fails, or a backup cannot be confirmed restorable.
- Making a phase's design work would require weakening any security invariant in §11.
- A new cross-tenant (or, pre-multi-tenant, cross-organizational-unit) ambiguity appears that the
  approved architecture did not anticipate.
- A destructive operation becomes necessary that was not already explicitly approved for the
  current phase/checkpoint.

Stopping means: report the specific condition clearly, do not attempt a workaround that avoids the
question, and wait — do not continue with other in-scope work as a way of deferring the stop
(unless that other work is genuinely independent and was going to happen anyway).

---

## 22. Completion Report Standard

Every planning or execution session MUST close with a report containing, at minimum:

1. **Status** — what stage (per §4's lifecycle) the phase is at now.
2. **Files inspected** — enough to show verification actually happened (§3).
3. **Files modified** — the exact list; nothing implied, nothing omitted.
4. **Database changes** — explicitly state "none" if planning-only; list exactly what ran if not.
5. **Data changes** — same as above, for row-level data specifically.
6. **Scratch/temporary resource status** — every scratch database, rehearsal schema, temp
   directory, or generated verification artifact created this session (§8): confirmed cleaned up
   (verified, not assumed) or explicitly retained with a documented reason. State "none created" if
   the session created none.
7. **Verification performed** — what was actually checked (queries run, files read, cross-checks
   made), not just "verified" as an unsupported claim; state plainly which regression gates could
   not be independently exercised and why, rather than omitting them (§16).
8. **Regression results** — pass/fail per gate, not a single aggregate "looks fine."
9. **Security/invariant results** — explicit confirmation that §11 (and §12/§13 once applicable)
   were not weakened, or an explicit flag if something needs Owner attention.
10. **Deviations** — anything that didn't go exactly per the plan, including in a planning-only
    session (e.g. a discrepancy found between docs and live state).
11. **Risks/issues** — carried forward from the plan's risk table, updated with anything new found
    this session.
12. **Remaining blockers** — what specifically still prevents the next stage from starting.
13. **Recommended next action** — the single next step, stated plainly, not a menu of options.

**Execution sessions** additionally MUST report backup status and rollback-readiness status
explicitly — these are never assumed satisfied just because an earlier planning session discussed
them.

**Mid-phase interruption**: an execution session MUST only pause or end at a checkpoint boundary —
never between a checkpoint's DDL/DML and its verification query (§6). If a checkpoint's mutation has
run, its verification MUST run and be recorded before the session ends, even if that means not
starting the next checkpoint. Before ending a session that leaves a phase partially executed (not
complete, not rolled back), MUST update the phase's plan document to state plainly: which checkpoint
last completed and passed its gate, what the live database's actual current state is, and that this
is a **partial, in-progress phase** — never leave it reading as either "Phase Complete" or as if no
progress had been made. A future session (or a fresh instance of the same agent, after context
exhaustion) MUST be able to determine exactly where to resume from this document alone, without any
access to the interrupted session's conversation.

This report format is deliberately the same shape regardless of whether the session was "just
planning" or "actually executed something" — the discipline of reporting facts, verification, and
blockers plainly is what lets a future session (or the Project Owner) trust the document without
re-deriving everything from scratch.

---

## Revision Notes

**2026-08-16 — Evidence-based hardening from the P4 Post-Implementation Audit (still v1 — three
targeted additions, no methodology redesign).** Following the P4 (RBAC Foundation) independent
Post-Implementation Audit (**PASS, no remediation required** — see `docs/PROJECT_CONTEXT.md`'s
Phase Status note and `docs/P4_IMPLEMENTATION_PLAN.md` §20), this file was reviewed for reusable
lessons. Unlike the P2/P3 audits, P4's audit found **no application-code defect** — the three
changes below are process/evidence-quality refinements the audit's own method demonstrated, not
fixes for a bug it found. Several other candidate lessons were explicitly considered and rejected
as already adequately covered (see below) — absence of a defect is itself evidence, and this pass
deliberately did not manufacture rules to justify touching the file. No change to the phase
lifecycle, stage ordering, or the priority list in §1:

- §6: added a "Seed/catalog completeness" requirement — a checkpoint seeding a fixed/approved
  catalog must embed or precisely cite every column's value the `INSERT` needs, not only the
  column(s) central to that checkpoint's own logic. Motivated by P4's catalog-seed checkpoint
  listing `permissions.key_name`s only, forcing `permissions.description` text to be recovered from
  the architecture spec at implementation time — a faithful recovery that caused no defect, but a
  planning-completeness gap worth closing at the source.
- §13: added a bullet generalizing the Tenant Integrity Rule's existing reasoning (app-layer
  validation for anything the DB can't express as a constraint, from the first writable phase, with
  a test proving the guard even before real data can violate it) to any DB-inexpressible
  multi-column invariant, not only tenant-path agreement. Motivated by the P4 audit independently
  reproducing a second, non-tenant instance of the same underlying gap: the database did not reject
  a row with two mutually-exclusive scope columns populated simultaneously — masked, not rejected,
  by a generated column's `CASE` priority order.
- §16: added a rule preferring diff-based evidence over timestamp-based evidence when both are
  available, specifically: a full-tree diff against a verified pre-phase backup (§7) is strictly
  stronger proof that "nothing outside the declared scope changed" than a filesystem-mtime check,
  and also catches files the mtime check wasn't even looking at. Motivated by the P4 audit's own
  full recursive diff against the Session-3 pre-P4 backup giving stronger, whole-project-tree
  confirmation of the same "zero unauthorized file changed" claim the implementation session had
  already made (correctly, but on weaker evidence) via a 12-file mtime check.

**Candidates reviewed and rejected (no change made), with reasoning:**

- *Session segmentation / persistent-document handoff as a formal Skill rule*: not added. §3's
  "MUST NOT rely only on what a prior conversation turn said happened" and §20's "treat
  `PROJECT_CONTEXT.md` and the current/previous phase plan documents as the durable handoff
  artifacts between sessions" already establish that documents, not conversation continuity, are
  the source of truth across session boundaries — P4's five-session lifecycle (Plan → Plan Review →
  Operational Readiness → Implementation → Audit) is a successful *application* of that existing
  rule, not evidence the rule was missing. Mandating fresh sessions at each stage would also
  contradict this same review's own continuation (audit and hardening review, same session, by
  design) — the existing rule already correctly leaves that judgment to the task at hand.
- *A dedicated "foundation-phase inertness" rule requiring phases to verify both new-structure-
  correctness and old-authority-still-sole*: not added as a separate rule. §5 (Additive-First),
  §6's "prefer no true Point of No Return" default, §15's "keep the legacy relationship intact
  throughout the transition window," and §16's "every phase MUST preserve every previously-working
  behavior" already jointly cover this; the one genuine incremental gap P4 exposed — *verifying*
  the inertness claim with strong evidence rather than asserting it — is the §16 diff-vs-timestamp
  change above, not a new standalone rule.
- *Audit evidence-substitution disclosure*: no change. §16's existing rule ("use the strongest safe
  alternative evidence actually available... an unreachable gate is disclosed as unreachable, never
  silently marked pass") already generalizes past its originating tool-boundary example via its own
  "or any other guardrail that exists for a real reason" clause. The P4 audit's credentials-
  unavailable case (no known test-user passwords, and creating/resetting one to force a login test
  was correctly judged disproportionate) is a second, different-flavored confirmation that the
  existing generalized wording already covers this, not evidence of a gap.
- *Broad token-efficiency rewrite of §20 or elsewhere*: not performed — no duplicated instruction or
  repeated proof requirement was found that could be safely consolidated without losing specificity;
  this session's own instructions also explicitly excluded a broad rewrite.

**2026-08-16 — Evidence-based hardening from the P3 Post-Implementation Audit (still v1 — one
targeted addition, no methodology redesign).** Following the P3 (Curriculum) Post-Implementation
Audit (PASS WITH REMEDIATIONS; see `docs/PROJECT_CONTEXT.md`'s Phase Status note and
`docs/P3_IMPLEMENTATION_PLAN.md` §21), this file was hardened against one concrete, evidence-backed
lesson the audit surfaced. It did not change the phase lifecycle, the stage ordering, or the
priority list in §1 — it is a targeted addition to two existing sections:

- §11: added a rule that a state-changing write referencing a request-supplied entity/FK identifier
  MUST catch the failure and show a friendly message, never letting a raw database exception, SQL
  text, stack trace, or absolute filesystem path reach the client — and MUST follow this codebase's
  own established `try/catch (PDOException)`-around-FK-referencing-write pattern from the moment a
  new write path is introduced. Motivated by the independent P3 auditor live-reproducing an
  uncaught `PDOException` (full stack trace + server filesystem path disclosed to an authenticated
  admin client) via a tampered `department_id` on `admin/curriculum_management.php`'s
  Curriculum-creation handler — a recurrence of a bug class already fixed once before, pre-P1, in
  `admin/file_management.php`'s `update_file` (per `docs/PROJECT_CONTEXT.md` §12's existing note),
  but never generalized into a standing Skill rule, which is exactly why it recurred in new P3 code
  instead of being caught by methodology alone.
- §16: added a companion regression-test requirement — any new write handler taking a
  request-supplied entity/FK identifier MUST include an adversarial tampered/stale-identifier test,
  mirroring the treatment already given to visibility-filter omissions (§11) as a candidate bug
  class until proven otherwise, extended here to the write side.

**Scope note**: this was a compliance failure that recurred *because* no standing rule existed to
prevent it — the audit fixed the immediate defect in application code (out of this Skill-hardening
session's own scope) by applying the codebase's own already-established pattern; this Skill update
only closes the methodology gap so future phases don't have to rediscover the same lesson a third
time. No change was made regarding write-path race conditions on duplicate-key checks (the
pre-check-then-insert pattern already used throughout this codebase, including by P3) — the audit
found no defect there, and inventing a new atomicity requirement with no supporting evidence would
have been scope creep beyond what this pass's evidence justifies.

**2026-08-16 — Evidence-based hardening from the P2 Post-Implementation Audit (still v1 — targeted
generalizations, no methodology redesign).** Following the P2 Post-Implementation Audit (PASS WITH
REMEDIATIONS; see `docs/PROJECT_CONTEXT.md`'s Phase Status note) and before P3 (Curriculum) planning
begins, this file was hardened against three concrete, evidence-backed lessons the audit surfaced.
None of them changed the phase lifecycle, the stage ordering, or the priority list in §1 — each is a
targeted addition or upgrade to an existing section:

- §16: added a rule distinguishing a regression gate's required *invariant* from any one particular
  *testing mechanism* for reaching it — when a preferred mechanism is blocked by a legitimate
  environment/tool safety boundary, MUST NOT bypass the boundary, MUST use the strongest safe
  alternative evidence available, and MUST disclose exactly what was and wasn't independently
  exercised rather than report an unreachable gate as passed. Motivated directly by the independent
  P2 auditor being unable to reproduce one admin-role test because its execution environment blocked
  the direct role-promotion operation the original test used.
- §8: added an explicit lifecycle rule for scratch/rehearsal resources (scratch databases, rehearsal
  schemas, temp directories, generated artifacts) — tracked on creation, and either verified cleaned
  up or explicitly retained with a documented reason before the session's Completion Report, with
  cleanup itself never risking the live resource. Motivated by `study_archive_p2_verify` being left
  behind after P2 Operational Readiness; §16's existing test-row ledger only ever covered live-table
  rows, not whole scratch resources, so it could not have caught this on its own.
- §17: upgraded schema snapshot regeneration from a SHOULD-eventually housekeeping note to a Phase
  Complete precondition for any phase whose plan included DDL, using the same scratch-database
  structural-comparison technique §7 already uses for backup verification, and routing its cleanup
  through §8's new resource-lifecycle rule rather than restating it. Motivated by `database/
  schema.sql` drifting across both P1 and P2 (still reflecting the pre-P1 shape after both phases'
  own completion) and being caught only by the independent audit rather than by phase closure itself.
- §22: added a "Scratch/temporary resource status" report item (closing the same gap §8 now tracks
  at the point it would actually surface in a report), and tightened the "Verification performed"
  item to require stating which gates could not be independently exercised and why, rather than
  allowing silent omission.
- §20: extended the existing "token efficiency must never justify skipping verification" hard limit
  to explicitly cover schema-sync checks and scratch-resource cleanup, so the same reasoning that
  already protected re-scans/backups/rehearsals from being skipped for budget reasons now protects
  these two newly-hardened gates too.

**Secondary review finding (not fixed — no change needed):** the Skill does not formalize
"independent audit" as a named stage in the Phase Lifecycle (§4). This was considered and
deliberately not added — the audit that produced this session's evidence was a Project-Owner-
commissioned review outside the normal phase flow, not a step every phase must schedule, and the
three concrete lessons it surfaced are now encoded as standing rules that apply whether or not a
future phase happens to get a dedicated audit. Formalizing "audit" itself as a stage would have been
a methodology change disproportionate to what the evidence justified — the same result is achieved
by hardening the rules an audit would check, not by mandating the audit itself.

**2026-08-15 — P2 Operational Readiness rehearsal (still v1 — one narrow, well-evidenced addition).**
Rehearsing the full P2 checkpoint sequence against an isolated scratch database (per §7/§8) found
two Critical defects in `docs/P2_IMPLEMENTATION_PLAN.md`'s checkpoint *ordering* — both fixed there
directly, since both were plan-sequencing defects, not methodology gaps (§6/§15's rules already
correctly required checking "does old code still work," and already correctly required DB-leads-code
ordering; the plan simply hadn't been rehearsed carefully enough to apply those rules correctly).
One genuinely reusable refinement to §6 was made: the existing "verify old code still works" bullet
now explicitly requires proving this by *executing the real, current INSERT/UPDATE statement* from
the source file against the post-step schema during rehearsal — not by reasoning about it in the
abstract. This generalizes beyond P2 because the failure mode that motivated it (a NOT NULL
constraint silently rejecting an old write that never populated the new column) is a structural risk
of *any* additive-first migration that adds a NOT NULL column, in any future phase, not specific to
`subjects.university_id` or `files.offering_id`. No other Skill section changed; no backup/rehearsal
rule was found missing — both were already present and, once actually followed with real SQL
instead of assumed, worked exactly as designed (full rehearsal, restore verification, and rollback
all passed cleanly; see `docs/P2_IMPLEMENTATION_PLAN.md` §12.1/§12.2/§18.2 for the evidence).

**2026-08-14 — Adversarial audit hardening (still v1 — no methodology redesign, corrections only).**
An adversarial audit session reviewed this file against 20 failure categories (ambiguous rules,
authorization loopholes, missing execution-robustness handling, etc.) and against
`docs/P2_IMPLEMENTATION_PLAN.md` for conformance. Findings that justified a fix were applied inline,
in place, in the relevant numbered section (not appended as exceptions) — the methodology itself did
not change, so the version stays v1. Summary of what was hardened and why:

- §3: added an explicit "no DDL/DML during planning-stage sessions" rule — previously only implied
  by stage ordering, which a looser future task prompt could have missed.
- §4: closed a loophole where P1's precedent of folding plan-review sign-off into its GO event could
  be misread as permission to request/accept GO before backup+rehearsal are verifiably recorded.
- §5: tightened "the swap can be proven safe" from a vague judgment call to a concrete written-proof
  requirement, defaulting to coexistence when the proof can't be shown.
- §6: added idempotency/already-applied checks, an explicit on-step-failure stop procedure, physical
  file moves treated with the same per-step discipline as DDL, and a concurrent-load/DDL-locking
  consideration — none of these were previously addressed, and all are realistic for a live,
  never-frozen system.
- §7/§8/§9: cross-referenced to their Phase Lifecycle stage names (Operational Readiness,
  Pre-Execution Gate) so the four-stage distinction in §4 is reinforced where the actual work
  happens, not only in one ASCII diagram; §7 also clarified that one backup covers a whole phase,
  not one per checkpoint; §9 extended to require repeating the live re-scan before *later*
  checkpoints too, not only once before the first data-dependent one.
- §10: added a conflict-check + internal-vs-official labeling requirement for newly minted
  identifiers, generalizing a real P1 lesson that hadn't yet been written as a standing rule.
- §11: required use of the existing shared visibility-condition function specifically, closing the
  gap where a hand-rolled equivalent could silently drift from the real rule.
- §15: generalized "code rollback before schema rollback" from an implicit pattern into an explicit
  rule, and added its mirror — schema must lead code on the way in, not just on the way out.
- §16: required test-created rows to be recorded in the execution record — motivated by direct
  evidence that prior regression testing already left identifiable test accounts in the live
  `users` table with no such record.
- §22: added explicit mid-phase interruption/handoff requirements — pause only at checkpoint
  boundaries, and leave a document any future session can resume from without conversation access.

Findings considered but not fixed (severity too low, or already adequately covered elsewhere): the
project being too Study-Archive-specific to generalize (not found — no institution-specific facts
were present in v1); rules being too generic to guide the project (not found — every rule already
carried a concrete Study Archive anchor). No finding required a methodology change large enough to
justify a v2.
