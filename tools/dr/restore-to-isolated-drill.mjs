#!/usr/bin/env node
/**
 * Git Learning Lab — P15: restore a backup into an ISOLATED LOCAL D1 only.
 *
 * Hardcoded to tools/dr/wrangler.restore-drill.toml — a dedicated, local-
 * only, obviously-fake D1 config (see that file's own header comment).
 * This script accepts NO --remote flag and NO alternate --config: the
 * restore target is not a runtime choice. It also independently re-checks
 * (assertNotProduction) that the config it is about to use does not resolve
 * to the real production database name/id before running anything —
 * defense in depth on top of the hardcoded path, not the only safeguard.
 *
 * A real production restore is INTENTIONALLY not automated by this script —
 * see docs/DISASTER_RECOVERY.md §8. It requires a human running the
 * documented command by hand, at the moment it is actually needed, after
 * explicit Owner confirmation.
 *
 * Usage:
 *   node tools/dr/restore-to-isolated-drill.mjs --file=backups/<name>.sql [--reset] [--counts=backups/<name>.sql.counts.json]
 *
 *   --file    path to a D1 SQL export to import (required)
 *   --reset   wipe any prior isolated restore-drill local state first
 *   --counts  path to a *.counts.json produced by backup-production-d1.mjs;
 *             if given, restored row counts are compared against it
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertNotProduction, EXPECTED_TABLES, validateBackupText } from "./lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DRILL_CONFIG = path.join(ROOT, "tools", "dr", "wrangler.restore-drill.toml");
const PERSIST_DIR = path.join(ROOT, "tools", "dr", ".wrangler");

function readArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}
const hasFlag = (name) => process.argv.includes(`--${name}`);

function readDrillDatabase() {
  const toml = readFileSync(DRILL_CONFIG, "utf8");
  const name = toml.match(/database_name\s*=\s*"([^"]+)"/)?.[1];
  const id = toml.match(/database_id\s*=\s*"([^"]+)"/)?.[1];
  if (!name || !id) throw new Error(`Could not read database_name/id from ${DRILL_CONFIG}`);
  return { name, id };
}

// Node's spawnSync does NOT escape array-form arguments when shell:true on
// Windows (it only concatenates them) — see backup-production-d1.mjs's
// identical helper for why a `--command "SELECT ..."` argument needs this.
function quoteArgForWindowsShell(arg) {
  const s = String(arg);
  return /[\s()&|<>^"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function run(cmd, args) {
  const isWindows = process.platform === "win32";
  const result = isWindows
    ? spawnSync([cmd, ...args].map(quoteArgForWindowsShell).join(" "), {
        stdio: ["ignore", "pipe", "inherit"],
        shell: true,
        encoding: "utf8",
      })
    : spawnSync(cmd, args, { stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} exited with status ${result.status}`);
  }
  return result.stdout;
}

const file = readArg("file");
if (!file || !existsSync(file)) {
  console.error(
    "Usage: node tools/dr/restore-to-isolated-drill.mjs --file=<backup.sql> [--reset] [--counts=<counts.json>]"
  );
  process.exit(2);
}

const { name: databaseName, id: databaseId } = readDrillDatabase();
assertNotProduction({ databaseName, databaseId });

console.log("Restore-drill target (ISOLATED LOCAL ONLY, never production):");
console.log("  config:   tools/dr/wrangler.restore-drill.toml");
console.log(`  database: ${databaseName} (${databaseId})`);
console.log("  persist:  tools/dr/.wrangler");

const { ok, foundTables, missingTables } = validateBackupText(readFileSync(file, "utf8"));
console.log(`Backup file: ${file}`);
console.log(`Tables in backup: ${foundTables.join(", ") || "(none)"}`);
if (!ok) console.warn(`WARNING: backup is missing expected table(s): ${missingTables.join(", ")}`);

if (hasFlag("reset") && existsSync(PERSIST_DIR)) {
  console.log("Resetting prior isolated restore-drill state (tools/dr/.wrangler)...");
  rmSync(PERSIST_DIR, { recursive: true, force: true });
}

console.log("Importing backup into isolated local D1...");
run("npx", [
  "wrangler", "d1", "execute", databaseName,
  "--local", "--config", DRILL_CONFIG, "--persist-to", PERSIST_DIR,
  "--file", file, "-y",
]);

console.log("Restore complete. Row counts in isolated restore-drill DB:");
const counts = {};
for (const table of foundTables.filter((t) => EXPECTED_TABLES.includes(t))) {
  const output = run("npx", [
    "wrangler", "d1", "execute", databaseName,
    "--local", "--config", DRILL_CONFIG, "--persist-to", PERSIST_DIR,
    "--json", "--command", `SELECT COUNT(*) as count FROM ${table}`,
  ]);
  const row = JSON.parse(output)?.[0]?.results?.[0];
  counts[table] = row ? Number(row.count) : null;
  console.log(`  ${table.padEnd(18)} ${counts[table]}`);
}

const countsFile = readArg("counts");
if (countsFile && existsSync(countsFile)) {
  const expected = JSON.parse(readFileSync(countsFile, "utf8"));
  console.log("Comparing against production snapshot counts:");
  let allMatch = true;
  for (const table of Object.keys(expected)) {
    const match = expected[table] === counts[table];
    if (!match) allMatch = false;
    console.log(
      `  ${table.padEnd(18)} production=${expected[table]}  restored=${counts[table]}  ${match ? "MATCH" : "MISMATCH"}`
    );
  }
  console.log(allMatch ? "Row counts MATCH production snapshot." : "ROW COUNT MISMATCH — investigate before trusting this restore.");
  if (!allMatch) process.exit(1);
}

console.log("");
console.log("No production database was contacted by this script.");
