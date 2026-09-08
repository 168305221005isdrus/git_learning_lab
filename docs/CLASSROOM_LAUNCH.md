# Classroom Launch Runbook — Git Learning Lab

Practical, Owner-usable checklist for the day of classroom use. Not a policy document — for incident
recovery mechanics, see `docs/DISASTER_RECOVERY.md`. No credentials are recorded here or anywhere in
this repository.

---

## BEFORE CLASS

1. **Health check** (read-only, safe anytime):
   ```bash
   node tools/prod-smoke/check.mjs
   ```
   Expect all 5 lines to say PASS: Pages responds, Worker `/api/health` responds, cert-verify handles a
   bad id safely, and two unauthenticated routes correctly 401.

2. **Verify Pages deployment matches the intended commit**:
   ```bash
   npx wrangler pages deployment list --project-name=git-learning-lab
   ```
   Confirm the top (most recent) row is `Production`, branch `main`, and its commit SHA matches
   `git log -1 --format=%h` on your local `main`. A blank/failed status on the newest row means the
   previous deployment is still live — see `docs/DISASTER_RECOVERY.md` §3.

3. **Verify Worker deployment is current**:
   ```bash
   npx wrangler deployments list --config worker/wrangler.toml
   ```
   Confirm the most recent entry's timestamp is at or after your last `worker/src` commit. If in doubt,
   `npm run deploy:worker` is safe to re-run (idempotent) — see `docs/DISASTER_RECOVERY.md` §4.

4. **Confirm a fresh D1 backup exists** (same day, or take one now):
   ```bash
   npm run dr:backup -- classroom-<date>
   ```
   This is read-only against production. Never skip this before a class session where ~30 students will
   be writing real progress data.

5. **Teacher account ready**: confirm out-of-band (not in this file) that the Teacher knows their
   sign-in identifier and either already has an active password or has a temporary credential ready to
   hand off. If a temporary credential must be issued, do it as close to handoff as practical — RECOV-004
   bounds its validity window.

---

## FIRST 10 MINUTES OF CLASS

1. Students open the production URL (`https://git-learning-lab.pages.dev/`) on their own device.
2. Each student self-registers (no pre-created accounts needed — self-service registration is by
   design, see `docs/SCOPE.md`). They pick their own username/password; only role is fixed to STUDENT
   server-side (REG-002).
3. Confirm each student lands on their Dashboard at 0/7 modules, 0%, automatically signed in.
4. Briefly explain: the terminal is a **simulated** Git environment — no real shell runs anywhere; every
   command is replayed and validated by the server, so their progress is safe even if they experiment.

---

## IF A STUDENT CANNOT LOG IN

Most likely cause: a mistyped password on their own new account (not a system fault — there is no
self-service "forgot password" flow in this project by design, RECOV-001).

1. Have the student try again carefully (case-sensitive, check for autocomplete/autofill mismatches).
2. If they are genuinely locked out, the Admin (Owner) issues a temporary credential via the Admin
   panel (`ผู้ดูแลระบบ` → account list → issue recovery). This does not require or reveal their old
   password (RECOV-002/006).
3. The student signs in with the temporary credential and is immediately forced to set a new password
   before doing anything else (RECOV-003). The temporary credential is single-use/time-bounded and stops
   working once that happens (RECOV-004/005).
4. This is Admin-only — there is no Teacher-level password reset capability (ADR-007 boundary).

---

## IF THE SITE LOOKS OLD / A RECENT FIX ISN'T SHOWING

Don't assume the source is wrong — check the deployment mapping first:

1. `git log --oneline -5` — confirm the expected commit is really on `main` on GitHub, not just local.
2. Cloudflare dashboard → Pages project → Deployments — confirm a deployment was triggered for that
   exact commit and its build **succeeded**. A failed build silently leaves the previous deployment live
   (this exact failure mode has happened before in this project — see `docs/DISASTER_RECOVERY.md` §3a).
3. Hard-refresh / check `bundle.js` directly rather than trusting browser cache as proof of anything.

---

## IF THE WORKER FAILS (API errors, 500s, health check fails)

1. `node tools/prod-smoke/check.mjs` to confirm and scope the failure.
2. Check `wrangler tail` or the Cloudflare dashboard's Worker logs for the actual error — don't guess.
3. Preferred fix: `npx wrangler rollback --config worker/wrangler.toml` (rolls back to the previous
   version). Full details and limitations: `docs/DISASTER_RECOVERY.md` §4.

---

## IF DATA LOOKS WRONG (missing/incorrect progress, a bad migration, unexpected rows)

1. **Stop and do not try to fix it live under pressure.**
2. Take a fresh forensic backup of the current state first, before changing anything:
   ```bash
   node tools/dr/backup-production-d1.mjs incident-<short-description>
   ```
3. Follow `docs/DISASTER_RECOVERY.md` §5 onward. A production restore always requires your own explicit,
   in-the-moment confirmation — nothing in this repository automates that away.

---

## AFTER CLASS

1. Optional end-of-day backup:
   ```bash
   npm run dr:backup -- end-of-class-<date>
   ```
2. Review the audit log (Admin panel → newest first) for anything unexpected — repeated failed logins,
   unfamiliar staff-creation events, etc.
3. Record any observed defects or student feedback separately (not in this file) for a future,
   non-frozen development phase — see the release-freeze rules in the P16 status report
   (`docs/PROJECT_CONTEXT.md`).
