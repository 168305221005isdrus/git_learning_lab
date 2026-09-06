# Architecture Decision Record — Git Learning Lab

Lightweight ADRs. Each records a locked decision, not an essay. ADR-001 through ADR-010 record
decisions already locked by the Project Owner before P0. ADR-011 and ADR-012 were the two questions
the Engineering skill explicitly deferred to P0 (Engineering skill §17) — both are resolved below
with cited, current technical evidence, not guessed.

---

### ADR-001: Cloudflare Pages for frontend hosting

- **Decision**: The frontend deploys to Cloudflare Pages, served initially at a `*.pages.dev` URL.
- **Reason**: Free tier, zero-config static/SPA hosting, integrates natively with Cloudflare Workers
  and GitHub-based deploys — meets the 0 THB cost target with no separate hosting account needed.
- **Consequences**: No server-rendered templating layer; the frontend is a static/SPA build. All
  server-authoritative logic must live in a Worker (ADR-002), not in the Pages build.
- **Deferred/revisit trigger**: revisit only if a custom domain or a hosting feature Pages doesn't
  offer becomes a genuine requirement — not before v0.9.

### ADR-002: Cloudflare Workers for backend/API

- **Decision**: All authenticated, security-sensitive, and server-authoritative operations
  (challenge/quiz validation, progress read/write, account operations) run in a Cloudflare Worker.
- **Reason**: Free tier, colocated with Pages and D1, no server to provision or patch, fits the
  ~31-account scale without any capacity planning.
- **Consequences**: Ordinary Worker CPU time is capped at 10ms per invocation on the free plan
  (confirmed via Cloudflare's own pricing documentation, September 2026) — this directly constrains
  ADR-012's iteration-count choice below. Code must be written knowing this budget covers the *entire*
  request, not just one operation within it.
- **Deferred/revisit trigger**: revisit only if a genuine paid-tier need arises (e.g., CPU-bound work
  that can't fit 10ms even after optimization) — requires an Owner Decision, since it has a cost.

### ADR-003: Cloudflare D1 for persistence

- **Decision**: User accounts, sessions, lesson/module progress, quiz results, and challenge results
  are stored in Cloudflare D1.
- **Reason**: Free tier (5 GB storage, 5,000,000 row-reads/day, 100,000 row-writes/day — confirmed via
  Cloudflare's own D1 pricing documentation, September 2026), SQL-familiar, colocated with Workers.
  At ~31 accounts, this project will use a negligible fraction of these limits even under heavy
  classroom use.
- **Consequences**: The browser never queries D1 directly — every read/write goes through a Worker
  (ADR-002), which also enforces role-scoping (ADR-007).
- **Deferred/revisit trigger**: revisit only if the class population or query volume grows by orders
  of magnitude — not a v0.9 concern.

### ADR-004: GitHub as canonical repository / deployment source

- **Decision**: GitHub holds the canonical source (repository `git_learning_lab`, already created).
  Production deploys from GitHub via Cloudflare's Git integration — never from a file that exists only
  on the Owner's local machine.
- **Reason**: Matches the locked deployment flow (local → commit → GitHub → Cloudflare); makes the
  build reproducible and independent of any one machine, including the Owner's XAMPP dev box.
- **Consequences**: Secrets/environment config must live in Cloudflare's own secrets mechanism, never
  in the Git repository (ties to ADR-011/012's key material).
- **Deferred/revisit trigger**: none anticipated for v0.9.

### ADR-005: Browser-side deterministic Git simulator

- **Decision**: The Git state machine (Working Directory, Staging Area, Local Repository, branches,
  HEAD, simulated Remote) runs as JavaScript in the learner's browser. Ordinary simulated commands
  are not round-tripped to a Worker.
- **Reason**: Instant feedback for learners (no network latency per keystroke/command), avoids
  unnecessary Worker invocations (protects the free-tier CPU budget for what actually needs it —
  auth and validation), and matches the Engineering skill's three-layer simulator architecture.
- **Consequences**: Only challenge/quiz *validation* and *persistence* cross into the Worker — the
  Worker must be able to accept a client-reported final state for a challenge attempt and
  independently verify it represents a legitimately reachable state (not merely trust the label
  "passed").
- **Deferred/revisit trigger**: none anticipated — this is a core, stable architectural choice.

### ADR-006: No real shell execution

- **Decision**: No learner-typed input, in the simulator or anywhere else in the application, ever
  reaches a real shell, `eval`, dynamic-code-execution, or a real filesystem-write API, in any
  environment.
- **Reason**: Non-negotiable safety invariant (Engineering skill §5, §10) — this is a teaching
  simulator, not a real terminal; the risk of arbitrary code execution from learner input is
  unacceptable regardless of convenience.
- **Consequences**: Every simulated command must be handled by the constrained parser/state-machine
  (ADR-005), never by a generic "run this string" fallback, even for commands not yet implemented
  (unrecognized input is rejected, never passed through).
- **Deferred/revisit trigger**: **never** — this is permanent, not deferred.

### ADR-007: Three-role model — Student / Teacher / Admin

- **Decision**: Exactly three roles for v0.9: STUDENT (29 expected), TEACHER (1), ADMIN (1) — no
  general RBAC/tenant/permission-scope system.
- **Reason**: Matches the actual classroom population and need; anything more general is unjustified
  process/engineering overhead for 31 accounts.
- **Consequences**: Role is resolved server-side from the authenticated session on every request
  (ROLE-005); a Teacher uses the same UI as a Student in v0.9 (Teacher Dashboard deferred, ADR
  doesn't cover it since it's explicitly out of scope, see `docs/SCOPE.md`).
- **Deferred/revisit trigger**: revisit if a genuine need for a fourth role, or multi-class/multi-
  teacher support, is approved by the Project Owner.

### ADR-008: Admin-mediated password recovery for v0.9

- **Decision**: No self-service email password reset in v0.9. Recovery is: user contacts Admin → Admin
  issues a temporary credential → user signs in and is forced to set a new password → the temporary
  credential is invalidated.
- **Reason**: Avoids any email-provider integration/cost/complexity for a 31-account classroom, while
  still giving locked-out users a working recovery path before September 12.
- **Consequences**: The Admin UI needs a minimal "issue temporary credential" function (ADMIN-002);
  the temporary credential must be modeled as its own invalidatable state, not as a permanent
  password reset.
- **Deferred/revisit trigger**: revisit once a suitable free transactional-email service is
  explicitly selected and approved via a fresh Owner Decision.

### ADR-009: `docs/Git & GitHub.pdf` as curriculum authority

- **Decision**: The PDF is authoritative for course scope, sequencing, and terminology. No
  command/concept absent from it appears learner-facing without a dated Owner Decision.
- **Reason**: Preserves fidelity to the instructor's actual material; prevents silent scope drift or
  "modernization" that would diverge from what the class is actually taught.
- **Consequences**: `docs/LEARNING_OBJECTIVES.md` is derived strictly from the PDF and must be
  re-checked against it whenever curriculum content changes.
- **Deferred/revisit trigger**: revisit only when the Project Owner explicitly approves supplemental
  material (Engineering skill §15).

### ADR-010: Free-tier / 0 THB infrastructure target

- **Decision**: Stay within Cloudflare Pages/Workers/D1 free-tier limits; no paid hosting, VPS, or
  domain for v0.9.
- **Reason**: Locked cost constraint; ~31 accounts is far below what the free tier supports (see
  ADR-002/ADR-003's cited limits), so this is achievable without compromising functionality.
- **Consequences**: Design choices (e.g., ADR-011/012 below) are made with the free tier's CPU-time
  and row-read/write limits as a hard constraint, not an afterthought.
- **Deferred/revisit trigger**: revisit only if real usage data shows the free tier is genuinely
  insufficient — requires an Owner Decision, since upgrading has a cost.

---

## P0-Resolved Architecture Questions

The Engineering skill (§17) intentionally deferred these two choices to P0, pending runtime-specific
evidence. Both are now resolved below, based on Cloudflare's own current documentation (fetched and
verified during this P0 session, September 2026) rather than assumption.

### ADR-011: Session/authentication mechanism — opaque D1-backed session token in an httpOnly cookie

- **Decision**: Authentication uses a server-issued, random, opaque session token (not a JWT) — at
  least 256 bits of entropy from a CSPRNG (`crypto.getRandomValues`), stored **hashed** (e.g.,
  SHA-256) in a Cloudflare D1 `sessions` table (columns: token hash, user id, role, created-at,
  expires-at). The raw token is delivered to the browser only via an `httpOnly`, `Secure`,
  `SameSite=Lax` cookie — never accessible to page JavaScript. Every authenticated Worker request
  looks up the session by hashing the incoming cookie value and querying D1.
- **Reason**:
  - **Evaluated alternative — stateless JWT**: commonly recommended for Workers because it avoids a
    per-request datastore lookup. Rejected here because JWT revocation requires extra machinery
    (a token-version/blocklist check) to satisfy this project's own locked requirements — "sign out"
    invalidation (AUTH-005) and, critically, "a successful forced password change invalidates the
    temporary recovery state immediately" (RECOV-005, a **locked Owner Decision**, not optional).
    A stateless JWT can't satisfy immediate invalidation without effectively reintroducing a
    server-side check anyway — at which point the "stateless" benefit is gone but the complexity
    remains.
  - **D1-backed opaque token satisfies invalidation by construction**: "invalidate this session" is
    just "delete/expire this row." This directly and simply implements RECOV-005 and AUTH-005 with no
    extra token-versioning logic.
  - **Free-tier cost is negligible**: Cloudflare's own D1 pricing page (fetched during this session)
    confirms 5,000,000 row-reads/day and 100,000 row-writes/day on the free plan. One session lookup
    per authenticated request, for 31 users even under heavy classroom use, is a rounding error
    against that budget.
  - **No multi-server session-store problem**: the "sessions need a centralized store across
    servers" concern that motivates JWT in larger distributed systems doesn't apply here — D1 already
    *is* this project's single centralized store.
- **Consequences**:
  - CSRF is applicable (cookie-based auth) — mitigated via `SameSite=Lax` plus an `Origin`/`Referer`
    check on state-changing requests (AUTH-006). This is deliberately simpler than issuing and
    validating a separate CSRF token, and is sufficient at this scale and risk profile.
  - A session-hash lookup adds one D1 read to each authenticated request — acceptable per the cost
    analysis above.
  - Session tokens are stored hashed specifically so a D1 data exposure doesn't directly hand over
    usable session tokens (defense in depth, cheap to implement).
- **Sources consulted**: Cloudflare D1 pricing documentation (developers.cloudflare.com/d1/platform/
  pricing/); general JWT-vs-session tradeoff writeups (acknowledging the JWT-for-Workers folk wisdom
  and explaining why it doesn't fit this project's specific invalidation requirements).
- **Deferred/revisit trigger**: revisit only if the project moves to a genuinely distributed/multi-
  region backend where a single D1 instance can no longer serve as the session store — not a v0.9
  concern.

### ADR-012: Password hashing/KDF — PBKDF2-HMAC-SHA256 via the native Web Crypto API

- **Decision**: Passwords are hashed with **PBKDF2-HMAC-SHA256**, called through Cloudflare Workers'
  built-in Web Crypto API (`crypto.subtle.importKey` + `crypto.subtle.deriveBits`, algorithm
  `PBKDF2`) — no external library, no WASM. Each user's row stores: a unique random salt (16+ bytes,
  from `crypto.getRandomValues`), the derived hash, and the iteration count used, so the iteration
  count can be raised later without invalidating existing hashes (standard upgradeable-KDF pattern).
- **Reason**:
  - **Confirmed via Cloudflare's own runtime API documentation** (developers.cloudflare.com/workers/
    runtime-apis/web-crypto/, fetched during this session): PBKDF2 is natively supported for
    `deriveBits()`/`deriveKey()`. **bcrypt and scrypt are not** in Cloudflare's supported Web Crypto
    algorithm table — using either would require a pure-JS or WASM port, adding dependency weight and
    CPU cost for no clear benefit at this project's risk level.
  - Native Web Crypto operations run as optimized platform code, not interpreted JavaScript, which
    matters directly against the free tier's CPU budget (ADR-002).
  - This is a deliberate, documented trade-off, not an oversight: 2026 general password-hashing
    guidance favors Argon2id where available and recommends very high PBKDF2 iteration counts
    (600,000+ for SHA-256) for high-value targets. Git Learning Lab is a classroom learning tool with
    31 accounts and no financial or highly sensitive data — the risk profile does not demand
    Argon2id-grade hardening, and Argon2id is not available in Workers' native Web Crypto at all.
  - Cloudflare's free plan caps a Worker invocation at **10ms of CPU time total** (confirmed via
    Cloudflare's pricing documentation, September 2026) — that budget must cover the entire request
    (routing, D1 query, JSON handling), not just the hash.

- **P1 benchmark performed (this session)**: a standalone probe (`tools/pbkdf2-bench/`, isolated from
  the real API worker) was run under `wrangler dev` **locally** (no Cloudflare account needed for
  local mode), measuring `crypto.subtle.deriveBits({name:"PBKDF2", hash:"SHA-256"}, ...)` wall-clock
  time via `performance.now()` inside actual workerd. Steady-state results (3 trials each, first-call
  JIT warmup discarded):

  | Iterations | Measured elapsed (local workerd) |
  |---|---|
  | 5,000 | ~2–3 ms |
  | 10,000 | ~4–5 ms |
  | 15,000 | ~6–8 ms |
  | 20,000 | ~8–9 ms |
  | 50,000 | ~21–22 ms |
  | 100,000 | ~43–45 ms |
  | 300,000 | ~130 ms |

  This is real, measured evidence, not a community-cited guess — and it materially **overturned**
  this ADR's original P0-era candidate of "~100,000, reducing toward 20,000–80,000 if needed." At
  100,000 iterations the hash alone costs ~43–45ms, over **four times** the entire 10ms free-tier
  budget; even the low end of the previously-cited 20,000–80,000 "community" range (20,000 ≈ 8–9ms)
  leaves almost no headroom for routing/D1/JSON once in production.

  **Important caveat, stated plainly**: `elapsedMs` here is local-machine **wall-clock** time inside
  `wrangler dev`'s workerd instance, not Cloudflare's actual production **CPU-time** billing metric,
  and not measured on Cloudflare's edge hardware. It is a meaningfully better signal than an unmeasured
  guess, but it is a proxy, not a substitute for production telemetry.

- **P1 interim decision**: set the iteration count to **10,000** (~4–5ms measured locally) as the
  working value for initial implementation — leaving roughly half the free-tier CPU budget as
  headroom for the rest of a real request. This is lower than typical 2026 general-purpose guidance
  (600,000+ for high-value targets) — an explicit, documented trade-off for a free-tier classroom tool
  with 31 low-value accounts, not an oversight. **This value is provisional, not final**: once the
  Worker is actually deployed to Cloudflare (P1 Step 8 / a later phase, pending the Cloudflare-login
  Owner-interaction STOP recorded in `docs/PROJECT_CONTEXT.md`), it must be re-measured against real
  production CPU-time telemetry (`wrangler tail` or the dashboard's Worker analytics) and this ADR
  updated with the confirmed figure before real authentication ships.
- **Consequences**: 10,000 iterations is a genuine, honest security/cost trade-off appropriate to a
  free-tier classroom tool — it should be revisited (raised significantly) automatically if the
  project ever moves off the Workers free plan, since the paid plan's CPU budget (confirmed up to 30
  seconds standard, far higher than 10ms) removes the constraint that caps it today.
- **Sources consulted**: Cloudflare Workers Web Crypto runtime API documentation
  (developers.cloudflare.com/workers/runtime-apis/web-crypto/); Cloudflare Workers pricing/CPU-limit
  documentation (developers.cloudflare.com/workers/platform/pricing/); this session's own local
  `wrangler dev` benchmark (`tools/pbkdf2-bench/`), superseding the P0-era community-figure estimate.
- **Deferred/revisit trigger**: re-benchmark against real production CPU-time telemetry the first time
  the Worker is deployed to Cloudflare's actual edge, and update this ADR with the confirmed value
  before real authentication ships. This does not require a fresh Owner Decision; it is a normal
  implementation-tuning step within an already-locked algorithm choice.

---

## P0-Correction: Challenge Validation Architecture

ADR-005 established that the simulator runs primarily in the browser. That alone leaves a gap: a
Worker cannot treat a client-supplied final state or a `passed=true` flag as trustworthy evidence
that a challenge was actually completed by executing valid commands. This correction makes the
validation architecture explicit.

### ADR-013: Challenge validation via a shared simulator core, replayed server-side

- **Decision**: The Git state model and command engine (Engineering skill §6, layers 1–2) are written
  as **one shared, pure JavaScript module** — no DOM APIs (`document`, `window`, browser storage) and
  no Worker-specific APIs (Cloudflare bindings) referenced anywhere inside it. This exact module is
  imported, unmodified, by both the browser frontend (for live simulation and visualization) and the
  Cloudflare Worker (for challenge validation). There is exactly one implementation of Git command
  semantics in the codebase.

  On challenge submission, the browser sends the **challenge identifier and the learner's command
  transcript** (the ordered list of commands they actually executed) — never a final state snapshot
  and never a `completed`/`passed` boolean. The Worker then:
  1. looks up the challenge's authoritative starting-state definition (not anything client-supplied);
  2. instantiates the shared simulator core with that starting state;
  3. replays each submitted command through the core, in order, using the exact same command engine
     the browser used;
  4. reads the resulting state directly from the core it just ran — not from anything the client
     asserted;
  5. evaluates the challenge's success condition against that Worker-derived state;
  6. only then persists pass/fail and progress to D1.

  A client-supplied final state, a `completed=true` flag, or any other unverified claim of success is
  never accepted on its own as evidence — see `docs/REQUIREMENTS.md` CHAL-002.

- **Reason**: Prevents exactly the failure mode the Engineering skill's simulator-correctness
  discipline exists to guard against — two independently-implemented Git semantic engines (one in the
  browser, one hand-written again for the Worker) that could silently drift apart, or a Worker that
  is trivially fooled by a forged completion request. Reusing one shared core instead of writing a
  second validation engine also means the same transition-test corpus (Engineering skill §12; SIM-016
  in `docs/REQUIREMENTS.md`) proves correctness for both runtimes at once, rather than needing a
  parallel test suite for a parallel implementation.
- **Consequences**: The command engine must be written with zero environment-specific dependencies so
  it can run inside a Worker isolate unmodified — this constrains its implementation from day one of
  P1, not as a later refactor. The challenge-submission API shape is a transcript, not a state
  snapshot, which P1's Worker-endpoint and frontend-submission code must both follow. Replaying a
  short classroom-challenge transcript costs a small, bounded amount of Worker CPU time, well inside
  the free-tier budget discussed in ADR-012.
- **Deferred/revisit trigger**: revisit only if a future challenge design requires replaying an
  amount of history long enough to threaten the free-tier CPU budget — not anticipated for v0.9's
  curriculum scope (`docs/LEARNING_OBJECTIVES.md`).

---

## P1-Decided: Project Toolchain

### ADR-014: Minimal JavaScript toolchain — plain ES modules, esbuild, Wrangler, `node:test`

- **Decision**: No frontend framework (no React/Vue/Svelte/etc.). The frontend is plain HTML/CSS +
  vanilla JavaScript ES modules. **esbuild** is used only as a one-shot bundler (`npm run
  build:frontend`) so the frontend can import the shared simulator core file directly without
  duplicating it. The Worker is bundled by **Wrangler**'s own built-in esbuild step — no separate
  worker build tool. Tests run on Node's **built-in `node:test` runner** (`node --test`) — no
  Jest/Vitest/Mocha dependency. Package management is a single flat root `package.json` — no npm
  workspaces, no monorepo tooling (Turborepo/Nx/etc.).
- **Reason**: Matches the Engineering skill's scope-control discipline (§20, §21) and the September 12
  deadline — every one of these tools is either already required by the locked architecture
  (Wrangler, for Cloudflare) or already ships with the platform (Node's test runner, Node 24 confirmed
  installed). esbuild is the one new dependency, and it's also what Wrangler already uses internally,
  so it introduces no new *kind* of tooling to the project, just a second, tiny invocation of the same
  bundler for the frontend side. A framework was considered and rejected as unjustified for a project
  this MVP's actual UI complexity (lessons, terminal, visualizer, quiz/challenge panels) does not yet
  demonstrate a need for — Engineering skill §20 explicitly warns against building ahead of
  demonstrated need.
- **Consequences**: `shared/simulator-core.js` is imported by both `frontend/src/main.js` (bundled by
  esbuild into `frontend/public/bundle.js`, gitignored as a build artifact) and `worker/src/index.js`
  (bundled by Wrangler at dev/deploy time) — one source file, two independent build steps, satisfying
  ADR-013's single-implementation requirement. If the frontend's interactivity genuinely outgrows
  vanilla JS (e.g., complex reactive state across many components), introducing a small framework is a
  legitimate future ADR — not decided now, and not needed for the P1 skeleton.
- **Deferred/revisit trigger**: revisit if UI complexity in P2+ genuinely demands component-level state
  management a plain vanilla-JS approach can't reasonably handle — evaluate against real friction
  encountered, not preemptively.
