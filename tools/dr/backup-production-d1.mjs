#!/usr/bin/env node
/**
 * Git Learning Lab — P15: safe, read-only production D1 backup.
 *
 * Exports the REAL production D1 database (the binding declared in
 * worker/wrangler.toml) to a timestamped SQL file under the gitignored
 * backups/ directory, then verifies the export is non-empty and
 * structurally contains every expected table before reporting success.
 * Also captures safe aggregate row counts per table (counts only — never
 * row contents) for later restore-drill comparison.
 *
 * This script only ever EXPORTS and reads COUNT(*) aggregates — it never
 * calls `d1 execute` with a writing statement, `d1 migrations apply`, or
 * anything else that could mutate D1. It never prints backup file contents,
 * row values, or credentials.
 *
 * Usage:
 *   node tools/dr/backup-production-d1.mjs [label]
 *   (label defaults to "manual"; use something like "pre-p16-migration"
 *   before a schema-changing deploy, matching this project's existing
 *   convention — see backups/pre-p14-migration-*.sql and earlier.)
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXPECTED_TABLES, timestampedFilename, validateBackupText } from "./lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const WORKER_CONFIG = path.join(ROOT, "worker", "wrangler.toml");
const BACKUPS_DIR = path.join(ROOT, "backups");

function readProductionDatabaseName() {
  const toml = readFileSync(WORKER_CONFIG, "utf8");
  const match = toml.match(/database_name\s*=\s*"([^"]+)"/);
  if (!match) throw new Error(`Could not find database_name in ${WORKER_CONFIG}`);
  return match[1];
}

// Node's spawnSync does NOT escape array-form arguments when shell:true on
// Windows (it only concatenates them) — a `--command "SELECT ... FROM x"`
// argument containing spaces/parentheses would otherwise get re-split by
// cmd.exe before wrangler ever sees it. Quoting each argument ourselves and
// invoking the shell with one pre-built command string avoids that.
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

function queryRemoteCount(databaseName, table) {
  const output = run("npx", [
    "wrangler", "d1", "execute", databaseName,
    "--remote", "--config", WORKER_CONFIG,
    "--json", "--command", `SELECT COUNT(*) as count FROM ${table}`,
  ]);
  const parsed = JSON.parse(output);
  const row = parsed?.[0]?.results?.[0];
  return row ? Number(row.count) : null;
}

const label = process.argv[2] || "manual";
const databaseName = readProductionDatabaseName();

mkdirSync(BACKUPS_DIR, { recursive: true });
const filename = timestampedFilename(label);
const outputPath = path.join(BACKUPS_DIR, filename);

console.log(`Exporting production D1 "${databaseName}" (read-only) -> backups/${filename}`);
run("npx", [
  "wrangler", "d1", "export", databaseName,
  "--remote", "--config", WORKER_CONFIG,
  "--output", outputPath, "-y",
]);

if (!existsSync(outputPath)) {
  throw new Error(`Export reported success but ${outputPath} does not exist.`);
}
const size = statSync(outputPath).size;
if (size === 0) {
  throw new Error(`Export produced an empty file: ${outputPath}`);
}

const text = readFileSync(outputPath, "utf8");
const { ok, foundTables, missingTables } = validateBackupText(text);
const sha256 = createHash("sha256").update(text).digest("hex");

console.log("Capturing safe aggregate row counts (counts only, never row contents)...");
const counts = {};
for (const table of EXPECTED_TABLES.filter((t) => foundTables.includes(t))) {
  counts[table] = queryRemoteCount(databaseName, table);
}

const metaPath = `${outputPath}.meta.json`;
writeFileSync(
  metaPath,
  `${JSON.stringify(
    {
      file: filename,
      sizeBytes: size,
      sha256,
      foundTables,
      missingTables,
      expectedTables: EXPECTED_TABLES,
      rowCounts: counts,
      createdAt: new Date().toISOString(),
    },
    null,
    2
  )}\n`
);

const countsPath = `${outputPath}.counts.json`;
writeFileSync(countsPath, `${JSON.stringify(counts, null, 2)}\n`);

console.log("");
console.log(`Backup file:   backups/${filename} (${size} bytes)`);
console.log(`SHA-256:       ${sha256}`);
console.log(`Tables found:  ${foundTables.join(", ") || "(none)"}`);
if (!ok) {
  console.warn(`WARNING: expected table(s) missing from export: ${missingTables.join(", ")}`);
} else {
  console.log("All expected tables present.");
}
console.log("Row counts:");
for (const [table, count] of Object.entries(counts)) {
  console.log(`  ${table.padEnd(18)} ${count}`);
}
console.log(`Metadata:      backups/${filename}.meta.json`);
console.log(`Row counts:    backups/${filename}.counts.json`);
console.log("");
console.log("Backup contents were never printed. This file is gitignored — never commit it.");

if (!ok) process.exit(1);
