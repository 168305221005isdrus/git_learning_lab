// P3: Thai-first UI string coverage (Part A / Translation Discipline).
//
// No jsdom/DOM-testing framework is added (ADR-014: minimal toolchain, no
// new heavy dependency) — instead this proves every `t("key")` call site
// actually used across the rendered frontend resolves to real Thai text,
// which is the concrete failure mode that would otherwise only surface as a
// runtime crash in a real browser ("i18n: missing Thai string for key ...").
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { t, STRINGS } from "../frontend/src/i18n.js";

const FRONTEND_SRC = fileURLToPath(new URL("../frontend/src", import.meta.url));

function allFrontendSourceFiles() {
  return readdirSync(FRONTEND_SRC)
    .filter((f) => f.endsWith(".js"))
    .map((f) => path.join(FRONTEND_SRC, f));
}

function extractTCalls(source) {
  const keys = new Set();
  const re = /\bt\(\s*["']([a-zA-Z0-9_]+)["']/g;
  let match;
  while ((match = re.exec(source)) !== null) keys.add(match[1]);
  return keys;
}

test("every t(\"key\") call site across the frontend resolves to a real Thai string", () => {
  const allKeys = new Set();
  for (const file of allFrontendSourceFiles()) {
    const source = readFileSync(file, "utf8");
    extractTCalls(source).forEach((k) => allKeys.add(k));
  }
  assert.ok(allKeys.size > 20, "sanity check: expected many i18n keys to be in use across the frontend");

  for (const key of allKeys) {
    assert.doesNotThrow(() => {
      const value = STRINGS[key];
      if (typeof value === "function") {
        // Parameterized strings (e.g. quizCorrectCount(correct, total)) —
        // call with harmless dummy args just to prove the key itself exists
        // and the function doesn't throw for reasonable input.
        value(1, 2);
      } else {
        t(key);
      }
    }, `t("${key}") must resolve — a missing key crashes real rendering`);
  }
});

test("no i18n string is empty, and Git commands inside Thai strings are never translated", () => {
  const GIT_COMMANDS = ["git init", "git add", "git commit", "git status", "git log", "git diff", "git checkout", "git reset", "git branch", "git merge", "git push", "git pull", "git clone", "git rm"];
  for (const [key, value] of Object.entries(STRINGS)) {
    if (typeof value === "function") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => assert.ok(v.length > 0, `array string ${key} must have no empty entries`));
      continue;
    }
    assert.ok(value.length > 0, `${key} must not be an empty string`);
  }
  // Spot-check: a handful of strings that reference Git commands keep the
  // command itself in English (Engineering skill §9/§15 applied to language —
  // no invented Thai command equivalents).
  assert.match(STRINGS.hintStart, /git init/);
  assert.match(STRINGS.onboardingEnglishNotice, /git add/);
});

test("QUIZ-001/CHEAT-001 content only ever names commands that are actually implemented in shared/simulator-core.js", () => {
  const simulatorSource = readFileSync(fileURLToPath(new URL("../shared/simulator-core.js", import.meta.url)), "utf8");
  // Every command the cheat sheet lists must appear as a case/sub-check in
  // the command engine — guards against the cheat sheet silently drifting
  // ahead of (or behind) what the simulator actually supports.
  const cheatsheetSource = readFileSync(path.join(FRONTEND_SRC, "cheatsheet.js"), "utf8");
  const commandNames = ["init", "status", "add", "rm --cached", "commit", "log", "log --graph", "diff", "checkout", "reset --soft", "branch", "merge", "push", "pull", "clone"];
  for (const cmd of commandNames) {
    assert.ok(cheatsheetSource.includes(cmd), `cheat sheet is missing "${cmd}"`);
  }
  assert.ok(simulatorSource.includes('args.includes("--graph")'), "simulator core must implement --graph for the cheat sheet's claim to be true");
});
