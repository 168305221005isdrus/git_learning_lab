# Disaster Recovery Runbook — Git Learning Lab

Practical, Owner-usable reference for "something in production looks broken — what do I actually do."
Not a policy document. If a step here conflicts with a locked ADR, the ADR wins — see
`docs/ARCHITECTURE_DECISIONS.md` ADR-019 for the design reasoning behind this runbook.

**Scope**: frontend (Cloudflare Pages), backend (Cloudflare Worker), database (Cloudflare D1), source
(GitHub). Not covered: anything requiring a paid Cloudflare plan, an external backup service, or
scheduled/automated production backups — none of those exist in this project (see ADR-019).

---

## 0. BREAK-GLASS CHECKLIST — read this first if production looks broken

1. **Do not touch D1 first.** Most incidents are frontend or Worker, not data.
2. Check Pages and Worker health **separately** (§2) — don't assume one broke because the other looks
   wrong.
3. Check the latest GitHub commit and the latest Cloudflare deployment for each service — a `git push`
   succeeding does **not** mean Cloudflare actually deployed it (P13/P14 both hit exactly this — see
   §4).
4. If you suspect data may have been affected (a bad migration, an accidental delete, corrupted rows),
   **take a fresh D1 export first** (§6), before doing anything else to the database. This preserves
   evidence and gives you a rollback point even if you haven't decided what to do yet.
5. Preserve evidence: note timestamps, error messages, and which layer (frontend/Worker/D1) is actually
   misbehaving before changing anything.
6. Only then choose a fix: frontend rollback (§3), Worker rollback (§4), or D1 restore (§5/§8) — pick the
   one that matches the layer you actually identified, not the first one you thought of.

---

## 1. What is backed up

| Component | Recovery source | Notes |
|---|---|---|
| Source code | GitHub (`git_learning_lab` repo) | canonical — see §9 |
| Frontend (Pages) | Rebuilt from source | `npm run build:frontend`, or Cloudflare's own GitHub-integrated build |
| Worker | Redeployed from source | `npm run deploy:worker` |
| **D1 database** | **Irreplaceable** | Cloudflare Time Travel (7-day Free-plan window) + Owner-triggered SQL exports under `backups/` (gitignored, unlimited retention, local-disk only) |
| Cloudflare project config (e.g. `NODE_VERSION`) | Not in Git — see §4a | Set via Cloudflare dashboard/API; not reproduced by a fresh clone |

D1 is the only genuinely irreplaceable state. Everything else is reproducible from GitHub.

---

## 2. Quick incident triage

Check these independently — do not assume a failure in one implies a failure in another:

```bash
node tools/prod-smoke/check.mjs
```

This is read-only and safe to run at any time. It checks: Pages responds, Worker `/api/health`
responds, certificate-verify handles a bad id safely, and two unauthenticated routes correctly return
401 instead of leaking data.

If it fails, check manually:
- Pages: open `https://git-learning-lab.pages.dev/` in a browser.
- Worker: `curl https://git-learning-lab-api.git-learning-lab.workers.dev/api/health`
- Cloudflare dashboard → Workers & Pages → each project → **Deployments** tab, for build/deploy status
  and logs.

---

## 3. Bad frontend deploy (Pages)

**Symptom**: the live site shows old/wrong content, a broken bundle, or a blank page, despite `main`
looking correct on GitHub.

1. Confirm this is really a Pages problem, not a Worker problem — the API can be fine while only the
   static frontend is stale/broken.
2. Check Cloudflare dashboard → Pages project → Deployments → confirm which commit SHA is actually the
   **live production** deployment (`canonical_deployment`), and whether its build **succeeded**. A
   failed build silently leaves the previous deployment live — `git push` succeeding is not proof the
   new build shipped (this exact failure mode hit P13 and P14; see §4a for the specific known cause).
3. **Preferred fix — Cloudflare-native rollback (dashboard only)**: Pages project → Deployments → All
   deployments → find the last known-good **successfully built** production deployment → three-dot menu
   → **Rollback to this deployment** → confirm. Takes effect immediately. Only successfully-built
   production deployments are valid rollback targets; preview deployments are not.
   - No CLI/API command exists for this step (confirmed via Cloudflare's own Pages rollback
     documentation, September 2026 research) — it is dashboard-only.
4. **Git-based alternative** (keeps full history, preferred if the bad deploy was itself a bad commit,
   not just a bad build): `git revert <bad-commit>` → push to `main` → Cloudflare's existing
   GitHub-integrated auto-deploy rebuilds and redeploys automatically (this integration was repaired and
   verified in P14 — do not disable or bypass it).
5. After either path, re-run `node tools/prod-smoke/check.mjs` and manually load the live URL to confirm.

**Never**: force-push or rewrite `main` history to "undo" a bad deploy — revert forward instead.

### 3a. Diagnosing "Pages serves an old/wrong frontend after a push that looked fine"

Do not assume the source is wrong. Walk this order:
1. `git log --oneline -5` — confirm the commit you expect is actually on `main` on GitHub (not just
   local).
2. Cloudflare dashboard → Pages → Deployments — confirm a deployment was triggered for that exact commit
   SHA, and that its build log shows success, not failure.
3. If the build failed, read the build log. The known P14 root cause (Cloudflare's build image resolving
   `npm ci` with an npm version that can't reconcile this project's lockfile) is fixed by
   `NODE_VERSION=24.11.1` being set in the Pages project's environment variables (Settings → Environment
   variables → Production **and** Preview). Confirm that variable is still set — Cloudflare project
   settings are **not** stored in Git and will not reappear from a fresh clone (see §4a).
4. If the build succeeded but the live bundle still looks stale, hard-refresh / check
   `https://git-learning-lab.pages.dev/bundle.js` directly and compare against a fresh local
   `npm run build:frontend` output — don't trust browser cache as proof of anything.

---

## 4. Bad Worker deploy

**Symptom**: `/api/health` fails, a specific route 500s, or behavior regressed after a Worker deploy.

1. Confirm via `wrangler tail` (live production logs) or the Cloudflare dashboard's Worker logs what is
   actually failing — don't guess.
2. **Preferred fix — Cloudflare-native version rollback**:
   ```bash
   npx wrangler deployments list --config worker/wrangler.toml
   npx wrangler rollback --config worker/wrangler.toml
   ```
   `wrangler rollback` (no argument) rolls back to the version before the currently-active one; pass a
   specific version ID from `deployments list` to target a different one. This immediately creates a new
   deployment using the target version's code and becomes active on all routes.
   - **Limitation**: rollback is blocked if a Developer Platform resource (D1 binding, KV, etc.) was
     added/removed/renamed between the target version and now — bindings themselves are not rolled back,
     only code. If the target version expects a binding that no longer matches current config, rollback
     will refuse or behave unexpectedly; verify `worker/wrangler.toml`'s bindings haven't changed before
     relying on this.
   - Only the 100 most recent versions are eligible.
3. **Git-based alternative**:
   ```bash
   git revert <bad-commit>
   git push origin main
   npm run deploy:worker
   ```
   This is the more history-preserving path and matches how this project already treats `main` (never
   force-reset).
4. After either path: `node tools/prod-smoke/check.mjs` again.

### 4a. Pages build-environment recovery

Confirmed, currently-set Pages project setting (set via Cloudflare API in P14, not in Git):

- `NODE_VERSION = 24.11.1` (both Production and Preview environments) — required because Cloudflare
  Pages' build image resolves the npm version from the pinned Node version, and npm 10.x (the default
  for older Node pins) cannot resolve this project's `vitest`/`@cloudflare/vitest-plugin` dependency
  tree in `package-lock.json` (`npm ci` fails with a `Missing: esbuild@...` error). No `NPM_VERSION`
  variable exists in Cloudflare Pages — Node version is the only lever.

If a future Pages build starts failing after a dependency change, check this setting still exists
(dashboard → Pages project → Settings → Environment variables) before assuming the lockfile itself is
broken — reproduce locally first with the *exact* pinned Node version, not just your own machine's
Node, to tell the two apart.

---

## 5. D1 data problem (corrupted/deleted rows, bad migration)

**Symptom**: data is missing, wrong, or a migration partially/fully failed.

**Do not immediately restore or delete anything.** Follow this order:

1. **Stop further writes if possible** — e.g., pause any in-progress manual operation you were running.
   There is no maintenance-mode switch in this app; if the issue is being actively made worse by normal
   traffic, that is itself an escalation signal, not something to script around under pressure.
2. **Take a forensic backup of the current (possibly-damaged) state** before changing anything further
   (§6) — even damaged data is evidence, and you may need to compare before/after.
3. **Classify the failure**:
   - *Migration failed before any schema/data mutation actually landed* (e.g., syntax error, rejected
     before execution) → investigate and fix the migration file; do **not** restore anything — nothing
     was actually damaged.
   - *Migration partially applied / caused a bad state* → this is the serious case. Determine exactly
     what changed (compare the pre-migration backup you should already have taken — DATA-004 — against
     current state). Do not attempt an automated rollback.
   - *Accidental data loss unrelated to a migration* (e.g., a manual `DELETE` run by mistake) → same
     principle: stop, snapshot current state, determine scope, then decide on a restore path.
4. **Determine the restore path** (see §7 for which one applies) and **STOP for explicit Owner
   confirmation** before executing any restore against real production data — see §8. Nothing in this
   repository automates that confirmation away.

---

## 6. Take an emergency backup

```bash
node tools/dr/backup-production-d1.mjs incident-<short-description>
```

Example: `node tools/dr/backup-production-d1.mjs incident-bad-p16-migration`

This is **read-only** against production (a `wrangler d1 export --remote`, plus safe aggregate
`COUNT(*)` queries per table — never row contents). It:
- writes a timestamped `.sql` file under `backups/` (gitignored, never commit it),
- writes a `.meta.json` sidecar (size, SHA-256, which tables were found, row counts),
- writes a `.counts.json` sidecar (row counts only, for later restore comparison),
- fails loudly (non-zero exit, no silent partial success) if the export or verification fails.

Never prints backup contents. Note the printed file path somewhere you'll find it again.

---

## 7. Restore to an isolated environment (drill, or investigation)

**This never touches production.** Use this to verify a backup is usable, or to investigate what a
backup actually contains, before deciding anything about real production.

```bash
node tools/dr/restore-to-isolated-drill.mjs --file=backups/<your-backup>.sql --reset --counts=backups/<your-backup>.sql.counts.json
```

- `--file` (required): the backup to restore.
- `--reset`: wipes any prior isolated restore-drill local state first (safe — it's disposable, gitignored
  local test state under `tools/dr/.wrangler/`, never production).
- `--counts` (optional): compares restored row counts against a `.counts.json` snapshot from `§6`.

This script is hardcoded to `tools/dr/wrangler.restore-drill.toml` — an isolated, local-only,
obviously-fake D1 config (`git-learning-lab-DR-DRILL-ONLY-db`) — and independently re-verifies at
runtime that it never resolves to the real production database name/id. It accepts no `--remote` flag
and no alternate `--config`: there is no way to point this particular script at production, by design.

After a drill, you can inspect the restored data further with ordinary `wrangler d1 execute --local
--config tools/dr/wrangler.restore-drill.toml --persist-to tools/dr/.wrangler --command "..."` queries,
or delete the disposable state (`rm -rf tools/dr/.wrangler`) once you're done.

**Validate a backup file's structure without restoring anything:**
```bash
node tools/dr/validate-backup.mjs backups/<your-backup>.sql
```
Confirms the file is non-empty and contains every table this project currently expects
(`users`, `sessions`, `progress`, `quiz_results`, `challenge_results`, `certificates`,
`audit_events`) — never inspects row contents.

---

## 8. Production restore procedure — REQUIRES explicit confirmation

**There is no one-command production restore in this repository, on purpose.** A real restore is rare,
high-stakes, and deserves a human making a deliberate choice at the moment it's actually needed — not a
script that could be run by accident.

Before doing anything in this section:
- You have already taken a fresh forensic backup (§6) of the current (possibly-damaged) state.
- You have identified, as specifically as possible, what is wrong and what a correct end-state looks
  like.
- **The Owner has explicitly confirmed this specific restore, right now** — not a standing approval from
  an earlier conversation.

Two possible mechanisms, pick based on the situation:

### 8a. Cloudflare D1 Time Travel (fast, recent damage, in-place)

Only useful if the damage happened within the retention window (7 days on the Free plan, per Cloudflare's
current documentation — confirmed September 2026).

```bash
npx wrangler d1 time-travel info git-learning-lab-db --config worker/wrangler.toml
npx wrangler d1 time-travel restore git-learning-lab-db --config worker/wrangler.toml --timestamp=<unix-timestamp-or-bookmark>
```

**This is in-place and destructive** — it overwrites the live production database and cancels any
in-flight queries/transactions. It does **not** create a separate copy first. There is no dry-run.
Get the bookmark/timestamp from `time-travel info` (or from your own notes of when the incident started)
before running `restore`.

### 8b. Restoring from an SQL export (older damage, or Time Travel window has passed)

```bash
npx wrangler d1 execute git-learning-lab-db --remote --config worker/wrangler.toml --file=backups/<chosen-backup>.sql -y
```

This **executes the backup's SQL directly against production** — if the backup's schema doesn't match
current production schema (e.g., a table was added since the backup was taken), reconcile that first
(see §9 below) rather than running this blind. There is no built-in "wipe first" step — if you need a
clean restore rather than a merge, you must explicitly plan the `DROP TABLE`/recreate sequence yourself,
deliberately, with the Owner's confirmation covering that specific plan.

After either 8a or 8b: verify immediately (§10), redeploy the Worker if its code also needs to match
(`npm run deploy:worker`), and run `node tools/prod-smoke/check.mjs`.

---

## 9. Migration-chain vs. backup restore — do not conflate these

- **New, empty database** (e.g., setting up a fresh environment): run the full migration chain in order —
  `npm run d1:migrate:remote` (or `:local` for local dev) applies `migrations/0001_init.sql` through the
  latest numbered migration.
- **Disaster recovery** (restoring existing production from a backup): the backup's SQL export already
  contains the schema as it existed at export time — do **not** also run the migration chain on top of a
  restored export; that risks re-applying schema changes the export already has, or conflicting with
  `d1_migrations` bookkeeping the export also restored. Only apply *newer* migrations (ones added after
  the backup was taken) after confirming the restore itself succeeded.

---

## 10. Verification checklist (after any Worker/Pages/D1 recovery action)

- [ ] `node tools/prod-smoke/check.mjs` passes.
- [ ] Cloudflare dashboard shows the expected commit/version as the live production deployment for both
      Pages and the Worker.
- [ ] If D1 was touched: row counts for `users`/`sessions`/`progress`/`quiz_results`/
      `challenge_results`/`certificates`/`audit_events` match what you expect (compare against a
      `.counts.json` snapshot if you have one).
- [ ] A real sign-in + one lesson/simulator action works end-to-end on the live URL (matches this
      project's standing CLOUD-005 smoke-test requirement).
- [ ] No unexpected data appeared or disappeared beyond what the incident/fix explains.

---

## 11. Important commands (reference)

```bash
# Quick health check (read-only, safe anytime)
node tools/prod-smoke/check.mjs

# Emergency/manual backup (read-only export + row counts)
node tools/dr/backup-production-d1.mjs <label>

# Validate a backup file's structure (never inspects row contents)
node tools/dr/validate-backup.mjs backups/<file>.sql

# Restore a backup into an isolated LOCAL D1 (never production)
node tools/dr/restore-to-isolated-drill.mjs --file=backups/<file>.sql --reset

# Worker rollback (Cloudflare-native)
npx wrangler deployments list --config worker/wrangler.toml
npx wrangler rollback --config worker/wrangler.toml

# Worker redeploy from current source
npm run deploy:worker

# D1 Time Travel (production, destructive, in-place — §8a only)
npx wrangler d1 time-travel info git-learning-lab-db --config worker/wrangler.toml
npx wrangler d1 time-travel restore git-learning-lab-db --config worker/wrangler.toml --timestamp=<value>

# Fresh clone / new-machine recovery (§12)
git clone <repo-url> && cd git_learning_lab
npm ci
npm test && npm run test:runtime && npm run build:frontend
npx wrangler login
```

## 12. New-PC / local-PC-loss recovery

Production does **not** depend on the Owner's Windows PC/XAMPP box being online — Pages, the Worker, and
D1 all run entirely on Cloudflare's infrastructure already. A new machine can fully recover the
*deployable* system from:

- GitHub (clone the repo),
- Node.js + `npm ci` (reproduces `node_modules` exactly from `package-lock.json`),
- `npx wrangler login` (re-authenticate to the existing Cloudflare account — this does not recreate
  Cloudflare resources, it authenticates access to the ones that already exist),
- the Cloudflare resources themselves (D1 database, Worker, Pages project) already existing remotely —
  nothing about them lives on the old machine.

**What would NOT automatically come back** if the old machine's disk were lost, because these are
gitignored local-only files:
- any local `backups/*.sql` export not otherwise regenerated,
- `.dev.vars`/`.env` local secrets (none currently in use for production — see `worker/wrangler.toml`'s
  own comment that real secrets live in `wrangler secret put`, not local files),
- `tools/bootstrap-accounts/credentials.local.txt` (meant to be read once and deleted anyway),
- any uncommitted local code changes.

This is a real limitation (§13 below), not a false sense of security — a fresh local backup export
should be taken periodically (before migrations, at minimum) precisely because it's the one piece of DR
state that lives only on the Owner's disk.

## 13. Local backup location — a known limitation, not a gap to silently "fix"

`backups/*.sql` files are gitignored **on purpose** — committing real learner data (even hashed
passwords and session-token hashes) to a GitHub repository would be a real exposure, especially if the
repository is ever made public or forked. The tradeoff is that these backups exist only on whichever
machine generated them. If that disk fails between backups, the most recent local export is lost (though
Cloudflare Time Travel's own rolling window, §8a, is a separate safety net that doesn't depend on the
Owner's disk at all).

An encrypted, off-device copy of local backups (e.g., an encrypted drive, or a personal cloud storage the
Owner already trusts) would close this gap, but that is a **future Owner Decision**, not something this
phase adds — no backup is uploaded anywhere automatically by anything in this repository.

---

## Things NEVER to do

- Never run a production restore (Time Travel or SQL import) without a specific, current Owner
  confirmation for that exact action.
- Never "test" disaster recovery by damaging real production data, deleting a real row to see if it can
  be restored, or intentionally corrupting production.
- Never commit a file from `backups/` to Git.
- Never force-push or force-reset `main` to "undo" a bad deploy — revert forward.
- Never disable or bypass Cloudflare Pages' GitHub-integrated auto-deploy to work around a build problem
  — fix the build environment (§4a) instead.
- Never store a Cloudflare API token/credential in this repository or in GitHub Actions secrets for
  backup/restore purposes — DR operations stay Owner-triggered, run locally, authenticated via the
  Owner's own `wrangler login` session.
- Never treat "the export command exited 0" as proof a backup is usable — validate it (§7) or restore-drill
  it before trusting it.

## Contact / credential assumptions (no secrets recorded here)

Recovery assumes the Owner has, independently of this document: access to the GitHub repository, an
authenticated Cloudflare account with access to this project's Worker/Pages/D1 resources (via
`wrangler login` or the dashboard), and — for any recovery scenario that also needs to notify or restore
access for real users — the Owner's own admin-mediated recovery process (ADR-008), unrelated to
infrastructure DR. No password, API token, or session credential is recorded in this file or anywhere
else in this repository.
