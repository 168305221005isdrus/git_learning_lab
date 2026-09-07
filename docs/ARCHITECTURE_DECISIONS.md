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

- **P1 production re-benchmark (Cloudflare authentication completed this session)**: the same probe
  was deployed live to Cloudflare (`pbkdf2-bench-scratch`, a temporary, isolated Worker — never the
  real API worker) and measured via `wrangler tail`'s real `cpuTime` field — Cloudflare's actual
  production CPU-time billing metric, not a wall-clock proxy. Multiple samples per level, from the
  `BKK` colo:

  | Iterations | cpuTime samples (ms) | avg | max |
  |---|---|---|---|
  | 10,000 | 2, 5, 3 | 3.3ms | 5ms |
  | 20,000 | 6, 6, 10 | 7.3ms | 10ms |
  | 30,000 | 7, 12, 7 | 8.7ms | 12ms |
  | 40,000 | 10, 16, 15 | 13.7ms | 16ms |
  | 50,000 | 11, 14, 15 | 13.3ms | 15ms |
  | 75,000 | 24, 17, 19 | 20.0ms | — |
  | 100,000 | 25, 23, 23 | 23.7ms | — |

  **Two findings, both important**: (1) production `cpuTime` is *far* more favorable than the local
  `wrangler dev` wall-clock proxy suggested at the low end (10,000 iterations: ~3.3ms avg in
  production vs. ~4–5ms local — roughly consistent) but the picture inverts at higher counts, where
  production shows real, sizeable **run-to-run jitter** (20,000 iterations ranged from 6ms to 10ms
  across three back-to-back requests — a ~67% swing). (2) Because Cloudflare enforces the 10ms cap as
  a hard per-invocation limit, the **worst observed case**, not the average, is what matters — 20,000
  iterations already touched the full 10ms budget on one sample with zero headroom left for
  routing/D1/JSON, and 30,000+ regularly exceeded it outright.

- **Final decision (confirmed, no longer provisional)**: **10,000 iterations**, matching the P1
  interim value — now backed by real production evidence (max observed 5ms across samples), leaving
  real, demonstrated headroom (~5ms) for the rest of an authentication request. This is lower than
  typical 2026 general-purpose guidance (600,000+ for high-value targets) — an explicit, documented
  trade-off for a free-tier classroom tool with 31 low-value accounts, not an oversight.
- **Consequences**: 10,000 iterations is confirmed safe with headroom at this project's scale, but the
  observed jitter means P2's real auth implementation should treat an occasional CPU-limit exception
  as a possibility to handle gracefully (e.g., a retry-safe error response), not assume zero variance.
  Revisit (raise significantly) automatically if the project ever moves off the Workers free plan,
  since the paid plan's CPU budget (confirmed up to 30 seconds standard) removes today's constraint.
- **Sources consulted**: Cloudflare Workers Web Crypto runtime API documentation
  (developers.cloudflare.com/workers/runtime-apis/web-crypto/); Cloudflare Workers pricing/CPU-limit
  documentation (developers.cloudflare.com/workers/platform/pricing/); this session's local
  `wrangler dev` benchmark (superseded at the high end by the finding below); this session's **real
  production measurement** via `wrangler tail`'s `cpuTime` field against a temporarily-deployed,
  since-deleted scratch Worker (`tools/pbkdf2-bench/`) — the authoritative source for this decision.
- **Deferred/revisit trigger**: none remaining for the iteration count itself — it is now confirmed
  against real production telemetry, not provisional. Revisit only if the free-tier CPU limit changes,
  or if real classroom usage reveals CPU-limit errors in practice (an Engineering skill §22 STOP-
  worthy signal, not a silent tune-up).

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

## P2-Decided: Cross-Origin Cookie Fix

### ADR-015: Same-origin authenticated API access via a Cloudflare Pages Function reverse proxy

- **Problem discovered during P2 implementation**: ADR-011 locks an httpOnly,
  `Secure`, `SameSite=Lax` session cookie. Pages (`git-learning-lab.pages.dev`)
  and the Worker (`git-learning-lab-api.git-learning-lab.workers.dev`) are
  different registrable domains (`pages.dev` vs `workers.dev`) — a browser
  `fetch()` from the frontend directly to the Worker is therefore
  **cross-site**, and `SameSite=Lax` cookies are never sent on a cross-site
  `fetch()`/XHR (only on a top-level navigation). As built through P1, the
  browser would never send the session cookie back to the Worker on any
  authenticated API call — the locked cookie design could not function at all
  across the two hostnames. This is exactly the STOP condition the P2 session
  brief anticipated ("if the separate-hostname cookie architecture introduces
  an actual browser compatibility/security issue, STOP and document the exact
  problem before inventing a workaround") — raised to, and resolved by, the
  Project Owner before any auth code was written.
- **Decision**: Add a Cloudflare Pages Function reverse proxy at
  `functions/api/[[path]].js` (repo root, per Pages Functions' own routing
  convention). It forwards every `/api/*` request server-side (a plain
  `fetch()` to the real Worker's URL, headers and body passed through
  unmodified) and relays the Worker's response — including `Set-Cookie` —
  back to the browser untouched. The browser now only ever talks to
  `https://git-learning-lab.pages.dev/api/*`: a genuinely same-origin request,
  so the `SameSite=Lax` cookie is sent exactly as ADR-011 intended, with zero
  weakening of the cookie or CSRF posture.
- **Alternative considered and rejected**: switching the cookie to
  `SameSite=None; Secure` and relying solely on the Origin/Referer check
  (AUTH-006) for CSRF. Rejected because it's a real weakening of the locked
  cookie design (trading a browser-enforced protection for an
  application-enforced one) and remains subject to browsers' ongoing
  restrictions on cross-site/third-party cookies — a correctness and
  reliability risk the proxy avoids entirely, at the cost of one extra
  request hop.
- **Consequences**: `worker/src/index.js`'s authenticated routes carry **no**
  CORS headers at all — correct, not an oversight, because the browser never
  makes a cross-origin request to them anymore (the Pages Function does a
  server-to-server fetch, which browser CORS enforcement doesn't apply to).
  The one deliberate exception is `GET /api/health`, still fetched directly
  cross-origin by the frontend (P1, unauthenticated, no session data) and
  still carrying its existing wildcard CORS header — untouched by this ADR.
  The Worker's `Set-Cookie` response must never set an explicit `Domain`
  attribute (it doesn't — see `worker/src/cookies.js`), so the cookie stays
  host-only for whichever origin the browser actually talked to
  (`git-learning-lab.pages.dev`), not the Worker's own hostname.
- **Deferred/revisit trigger**: revisit only if Pages Functions' behavior or
  limits genuinely stop fitting (not anticipated at this project's scale) —
  not a v0.9 concern.

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

---

## P13-Decided: Worker-Runtime Testing

### ADR-016: Amend ADR-014's testing constraint — add a small, additive Vitest-based Worker-runtime layer

- **Decision**: ADR-014's "no Jest/Vitest/Mocha dependency" clause is amended, **for testing tooling
  only** — every other part of ADR-014 (no frontend framework, esbuild, Wrangler, flat root
  `package.json`) is unchanged. `vitest@4.1.11` and `@cloudflare/vitest-plugin@1.1.5` (the current,
  actively-maintained official Cloudflare package — confirmed via `developers.cloudflare.com`,
  September 2026, superseding the now-legacy `@cloudflare/vitest-pool-workers`) are added as
  **devDependencies only**, used **exclusively** by a new `runtime-tests/` suite (`npm run
  test:runtime`). The existing 191-test `node:test` suite (`npm test`, `tests/**/*.test.js`) is
  **completely unchanged** and remains the fast, primary suite — nothing was ported to Vitest, nothing
  was deleted from `tests/helpers/fake-d1.js`.
- **Reason**: P2 through P12 each recorded the same debt — Worker route logic (`worker/src/index.js`
  and everything it dispatches to) had never once executed inside a real `workerd`/Miniflare runtime
  under an automated test; only `tests/helpers/fake-d1.js` (a hand-written approximation of D1's API
  surface) plus manual `wrangler dev`/production `curl` checks stood in for it. `@cloudflare/
  vitest-plugin` runs the REAL `worker/src/index.js` inside the REAL Workers runtime, against a REAL
  (locally-isolated) D1 instance with REAL migrations applied — closing exactly that gap for a
  deliberately small, high-value set of scenarios (ADR-013's challenge replay, quiz-authority,
  role/CSRF boundaries — see `docs/PROJECT_CONTEXT.md`'s P13 report for the full list) without
  duplicating all 191 existing unit tests in a slower runtime.
- **Why not a full toolchain migration**: P13's session brief explicitly capped this at "can we add a
  Worker-runtime test layer without replacing `node:test`" — yes, cleanly, because Vitest's `include`
  glob (`runtime-tests/**/*.test.js`) and `node --test`'s own glob (`tests/**/*.test.js`) are disjoint
  directories; the two runners never compete for the same files and both run independently in CI. No
  STOP condition in the P13 brief was triggered: `node:test` was not replaced, no frontend framework
  was introduced, no production D1 or Cloudflare credential was needed to run the new suite (it runs
  entirely against a local Miniflare instance — see ADR-017 below for the isolation mechanism), and no
  D1 migration was required.
- **Consequences**: two test commands now exist (`npm test` for the fast unit suite, `npm run
  test:runtime` for the runtime suite) — CI (added in P13, `.github/workflows/ci.yml`) runs both, plus
  the frontend build, on every push/PR. A contributor adding new Worker route logic should keep adding
  fast `node:test`/fake-D1 coverage as the default (matches existing practice) and add a `runtime-tests/`
  case only for genuinely runtime-dependent behavior (real D1 constraint enforcement, real
  Origin/cookie handling, ADR-013 replay) that a hand-written fake could plausibly get wrong in a way
  that wouldn't show up until production.
- **Sources consulted**: `developers.cloudflare.com/workers/testing/` and its `vitest-integration/*`
  subpages (get-started, configuration, test-apis, known-issues), fetched live during this P13 session,
  September 2026; `npm view @cloudflare/vitest-plugin` / `npm view vitest` for the actual published
  versions and peer-dependency constraints (`vitest@^4.1.0`) rather than trusting documentation prose
  alone; the installed package's own `.d.ts`/`.d.mts` type definitions, read directly, to confirm the
  real export surface (`cloudflareTest`, `readD1Migrations` from the package's main entry point — the
  officially-documented `@cloudflare/vitest-plugin/config` subpath does not exist in `1.1.5`) before
  writing any test code against it.
- **Deferred/revisit trigger**: revisit only if a future Cloudflare release deprecates
  `@cloudflare/vitest-plugin` in favor of something else (re-run the same live-documentation-first
  research this ADR did, don't assume prior knowledge is still current), or if `runtime-tests/` growth
  starts duplicating `tests/`'s own coverage rather than complementing it (a signal to prune, not to
  keep adding).

### ADR-017: Worker-runtime test D1 isolation — a dedicated `worker/wrangler.test.toml`, never production

- **Decision**: `runtime-tests/` never touches the real `git-learning-lab-db` D1 binding
  (`database_id: 6df6c304-173a-46fc-b576-205e944341da` in `worker/wrangler.toml`). A separate
  `worker/wrangler.test.toml` declares its own `DB` binding with an obviously-fake
  `database_name`/`database_id` (`git-learning-lab-TEST-ONLY-db` /
  `00000000-0000-0000-0000-000000000000`), used only by `vitest.config.js`'s `wrangler.configPath`.
  Every migration in `migrations/*.sql` is applied fresh to this isolated instance via
  `applyD1Migrations()`/`readD1Migrations()` in `runtime-tests/setup.js`, which Vitest runs before
  every test file (Miniflare resets each binding's storage per test file), so each file starts from a
  clean, fully-migrated, empty schema with no cross-file or cross-run state leakage.
- **Reason**: even though Cloudflare's local D1/Miniflare mode never contacts a real remote database
  unless a binding explicitly sets `remote: true` (which neither `wrangler.toml` nor
  `wrangler.test.toml` does), P13's session brief specifically required removing any *ambiguity* about
  this, not just relying on that default being safe. A visibly fake id/name in a dedicated file is a
  stronger, more auditable guarantee than "the same id, but local mode doesn't call out" — a future
  reader (or a future accidental `--remote` flag) has an obvious, self-describing name to catch the
  mistake against, rather than the real production identifier being present in a test config at all.
- **Consequences**: `worker/wrangler.test.toml` is never used by `wrangler dev`/`wrangler deploy`
  (both remain pinned to `worker/wrangler.toml`, unchanged) and is committed (it contains no secret —
  same convention as the real `wrangler.toml`'s own resource-identifier-is-not-a-secret rule). Local
  Miniflare state from running `npm run test:runtime` lands under `.wrangler/` (already gitignored,
  confirmed no test-run artifacts are ever staged).
- **Deferred/revisit trigger**: none anticipated — revisit only if Cloudflare's tooling changes how
  local-vs-remote D1 isolation is declared.
