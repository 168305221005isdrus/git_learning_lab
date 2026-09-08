#!/usr/bin/env node
/**
 * Git Learning Lab — P15: standalone backup integrity check.
 *
 * Confirms a D1 export file structurally contains every table this project
 * currently expects. Never reads/prints row contents — table names and
 * file size only.
 *
 * Usage: node tools/dr/validate-backup.mjs <path-to-backup.sql>
 */
import { readFileSync, statSync } from "node:fs";
import { EXPECTED_TABLES, validateBackupText } from "./lib.mjs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node tools/dr/validate-backup.mjs <path-to-backup.sql>");
  process.exit(2);
}

const size = statSync(file).size;
const text = readFileSync(file, "utf8");
const { ok, foundTables, missingTables } = validateBackupText(text);

console.log(`File:     ${file} (${size} bytes)`);
console.log(`Expected: ${EXPECTED_TABLES.join(", ")}`);
console.log(`Found:    ${foundTables.join(", ") || "(none)"}`);
if (missingTables.length) console.log(`Missing:  ${missingTables.join(", ")}`);
console.log(ok ? "PASS — all expected tables present." : "FAIL — one or more expected tables are missing.");
process.exit(ok ? 0 : 1);
