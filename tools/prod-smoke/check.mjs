#!/usr/bin/env node
/**
 * Git Learning Lab — P13: production smoke check.
 *
 * READ-ONLY / NON-MUTATING ONLY. Every request below either reads public data
 * or is EXPECTED to be rejected (401/safe-invalid) — nothing here creates an
 * account, issues a recovery credential, writes progress, or issues a
 * certificate. Safe to run against real production at any time; not
 * scheduled automatically (run manually: `node tools/prod-smoke/check.mjs`).
 */

const PAGES_ORIGIN = "https://git-learning-lab.pages.dev";
const WORKER_ORIGIN = "https://git-learning-lab-api.git-learning-lab.workers.dev";

const checks = [
  {
    name: "Pages frontend responds",
    async run() {
      const res = await fetch(PAGES_ORIGIN + "/");
      return res.status === 200;
    },
  },
  {
    name: "Worker /api/health responds 200",
    async run() {
      const res = await fetch(WORKER_ORIGIN + "/api/health");
      if (res.status !== 200) return false;
      const body = await res.json();
      return body.ok === true;
    },
  },
  {
    name: "Certificate verify with a malformed id returns a safe {valid:false}, not an error",
    async run() {
      const res = await fetch(PAGES_ORIGIN + "/api/certificate/verify?id=not-a-real-id");
      if (res.status !== 200) return false;
      const body = await res.json();
      return body.ok === true && body.valid === false;
    },
  },
  {
    name: "Unauthenticated protected route (GET /api/auth/session) returns 401",
    async run() {
      const res = await fetch(PAGES_ORIGIN + "/api/auth/session");
      return res.status === 401;
    },
  },
  {
    name: "Unauthenticated Admin route (GET /api/admin/users) returns 401, not data",
    async run() {
      const res = await fetch(PAGES_ORIGIN + "/api/admin/users");
      return res.status === 401;
    },
  },
];

let allPassed = true;
for (const check of checks) {
  try {
    const ok = await check.run();
    console.log(`${ok ? "PASS" : "FAIL"} — ${check.name}`);
    if (!ok) allPassed = false;
  } catch (err) {
    console.log(`FAIL — ${check.name} (${err.message})`);
    allPassed = false;
  }
}

process.exit(allPassed ? 0 : 1);
