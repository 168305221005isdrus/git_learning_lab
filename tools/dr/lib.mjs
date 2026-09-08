/**
 * Git Learning Lab — P15: pure disaster-recovery helper logic.
 *
 * No fs/child_process/network side effects here on purpose — this is the
 * part of the DR tooling that tests/dr-lib.test.js can exercise directly
 * with tiny fabricated fixtures, without a real Cloudflare account. The
 * CLI scripts in this directory (backup-production-d1.mjs,
 * validate-backup.mjs, restore-to-isolated-drill.mjs) import from here
 * rather than duplicating this logic inline.
 */

// The full current table set a production export is expected to contain
// (migrations 0001-0006). Update this list only when a migration adds or
// removes a user-data table.
export const EXPECTED_TABLES = [
  "users",
  "sessions",
  "progress",
  "quiz_results",
  "challenge_results",
  "certificates",
  "audit_events",
];

// The real production D1 resource identifiers (worker/wrangler.toml). Never
// a valid target for any restore/reset operation in this toolset.
export const PRODUCTION_DATABASE_NAME = "git-learning-lab-db";
export const PRODUCTION_DATABASE_ID = "6df6c304-173a-46fc-b576-205e944341da";

/**
 * Builds a `<label>-YYYYMMDD-HHMMSS.sql` filename, matching this project's
 * existing backup-naming convention (see backups/pre-p14-migration-*.sql
 * etc., predating this script). `label` is sanitized to a safe filename
 * fragment so a stray shell-special character can't produce a surprising
 * path.
 */
export function timestampedFilename(label, date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const stamp =
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const safeLabel = String(label).trim().replace(/[^a-zA-Z0-9._-]+/g, "-");
  if (!safeLabel) {
    throw new Error("timestampedFilename: label must contain at least one safe character");
  }
  return `${safeLabel}-${stamp}.sql`;
}

/**
 * Structural-only backup check: does the exported SQL text contain a
 * `CREATE TABLE` statement for every table this project currently expects?
 * `wrangler d1 export` always emits schema as literal `CREATE TABLE`
 * statements, so this is a reliable check without a full SQL parser.
 * Never inspects row *contents* — only table names, which are not sensitive.
 */
export function validateBackupText(text) {
  const found = new Set();
  const pattern = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?["'`[]?([a-zA-Z_][a-zA-Z0-9_]*)["'`\]]?/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    found.add(match[1].toLowerCase());
  }
  const missingTables = EXPECTED_TABLES.filter((t) => !found.has(t));
  return {
    ok: missingTables.length === 0,
    foundTables: [...found].sort(),
    missingTables,
  };
}

/**
 * Defense-in-depth guard: throws if a proposed restore/reset target's
 * database name or id matches the real production resource. Every script in
 * tools/dr/ that touches local D1 state calls this before doing anything,
 * even though the restore-drill script's own config is already hardcoded to
 * a separate, obviously-fake resource — this is a second, independent check,
 * never the only line of defense.
 */
export function assertNotProduction({ databaseName, databaseId }) {
  if (databaseName && databaseName.toLowerCase() === PRODUCTION_DATABASE_NAME.toLowerCase()) {
    throw new Error(
      `Refusing to proceed: database name "${databaseName}" matches production (${PRODUCTION_DATABASE_NAME}).`
    );
  }
  if (databaseId && databaseId.toLowerCase() === PRODUCTION_DATABASE_ID.toLowerCase()) {
    throw new Error(
      `Refusing to proceed: database id "${databaseId}" matches production (${PRODUCTION_DATABASE_ID}).`
    );
  }
}
