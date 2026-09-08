// P15 — Backup, Restore & Disaster Recovery.
// Covers: tools/dr/lib.mjs's pure logic only (filename generation, backup
// structural validation, and the production-target guard). No real
// Cloudflare account, D1 binding, or child process is involved — only tiny
// fabricated SQL fixtures. The CLI scripts that call this logic
// (backup-production-d1.mjs, validate-backup.mjs,
// restore-to-isolated-drill.mjs) are exercised manually against real
// infrastructure and documented in docs/PROJECT_CONTEXT.md's P15 report,
// not here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EXPECTED_TABLES,
  PRODUCTION_DATABASE_ID,
  PRODUCTION_DATABASE_NAME,
  assertNotProduction,
  timestampedFilename,
  validateBackupText,
} from "../tools/dr/lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("timestampedFilename: produces a <label>-YYYYMMDD-HHMMSS.sql name", () => {
  const name = timestampedFilename("pre-p16-migration", new Date(2026, 8, 8, 1, 5, 5));
  assert.equal(name, "pre-p16-migration-20260908-010505.sql");
});

test("timestampedFilename: sanitizes an unsafe label instead of producing a surprising path", () => {
  const name = timestampedFilename("weird label/../with spaces", new Date(2026, 0, 1, 0, 0, 0));
  assert.doesNotMatch(name, /[/\\ ]/);
  assert.match(name, /^weird-label-.*-with-spaces-20260101-000000\.sql$/);
});

test("timestampedFilename: rejects a blank label", () => {
  assert.throws(() => timestampedFilename("   "), /safe character/);
  assert.throws(() => timestampedFilename(""), /safe character/);
});

test("validateBackupText: a full fixture with every expected table passes", () => {
  const fixture = EXPECTED_TABLES.map((t) => `CREATE TABLE ${t} (id INTEGER PRIMARY KEY);`).join("\n");
  const result = validateBackupText(fixture);
  assert.equal(result.ok, true);
  assert.deepEqual(result.missingTables, []);
  assert.deepEqual(result.foundTables, [...EXPECTED_TABLES].sort());
});

test("validateBackupText: a fixture missing tables reports exactly which ones", () => {
  const fixture = "CREATE TABLE users (id INTEGER);\nCREATE TABLE sessions (id INTEGER);\n";
  const result = validateBackupText(fixture);
  assert.equal(result.ok, false);
  assert.deepEqual(result.foundTables, ["sessions", "users"]);
  assert.deepEqual(
    result.missingTables,
    EXPECTED_TABLES.filter((t) => t !== "users" && t !== "sessions")
  );
});

test("validateBackupText: recognizes IF NOT EXISTS and quoted identifiers", () => {
  const fixture = 'CREATE TABLE IF NOT EXISTS "users" (id INTEGER);\nCREATE TABLE `sessions` (id INTEGER);';
  const result = validateBackupText(fixture);
  assert.ok(result.foundTables.includes("users"));
  assert.ok(result.foundTables.includes("sessions"));
});

test("validateBackupText: an empty export finds nothing and fails", () => {
  const result = validateBackupText("-- empty export, no data\n");
  assert.equal(result.ok, false);
  assert.deepEqual(result.foundTables, []);
  assert.deepEqual(result.missingTables, EXPECTED_TABLES);
});

test("assertNotProduction: throws when the database name matches production (case-insensitive)", () => {
  assert.throws(
    () => assertNotProduction({ databaseName: PRODUCTION_DATABASE_NAME.toUpperCase(), databaseId: "anything" }),
    /matches production/
  );
});

test("assertNotProduction: throws when the database id matches production", () => {
  assert.throws(
    () => assertNotProduction({ databaseName: "some-other-name", databaseId: PRODUCTION_DATABASE_ID }),
    /matches production/
  );
});

test("assertNotProduction: does not throw for an obviously-fake restore-drill target", () => {
  assert.doesNotThrow(() =>
    assertNotProduction({ databaseName: "git-learning-lab-DR-DRILL-ONLY-db", databaseId: "22222222-2222-2222-2222-222222222222" })
  );
});

test("restore-drill config: database name/id are real (present) and distinct from production and the test-runtime config", () => {
  const drillToml = readFileSync(path.join(ROOT, "tools/dr/wrangler.restore-drill.toml"), "utf8");
  const testToml = readFileSync(path.join(ROOT, "worker/wrangler.test.toml"), "utf8");
  const drillName = drillToml.match(/database_name\s*=\s*"([^"]+)"/)?.[1];
  const drillId = drillToml.match(/database_id\s*=\s*"([^"]+)"/)?.[1];
  const testName = testToml.match(/database_name\s*=\s*"([^"]+)"/)?.[1];
  const testId = testToml.match(/database_id\s*=\s*"([^"]+)"/)?.[1];

  assert.ok(drillName && drillId, "restore-drill config must declare a database_name/database_id");
  assert.notEqual(drillName.toLowerCase(), PRODUCTION_DATABASE_NAME.toLowerCase());
  assert.notEqual(drillId.toLowerCase(), PRODUCTION_DATABASE_ID.toLowerCase());
  assert.notEqual(drillName, testName, "restore-drill and Vitest test-runtime configs must not share a database_name");
  assert.notEqual(drillId, testId, "restore-drill and Vitest test-runtime configs must not share a database_id");
  assert.doesNotThrow(() => assertNotProduction({ databaseName: drillName, databaseId: drillId }));
});

test("production identifiers in lib.mjs match worker/wrangler.toml (no drift)", () => {
  const workerToml = readFileSync(path.join(ROOT, "worker/wrangler.toml"), "utf8");
  const realName = workerToml.match(/database_name\s*=\s*"([^"]+)"/)?.[1];
  const realId = workerToml.match(/database_id\s*=\s*"([^"]+)"/)?.[1];
  assert.equal(realName, PRODUCTION_DATABASE_NAME);
  assert.equal(realId, PRODUCTION_DATABASE_ID);
});
