// Proves the shared simulator core (ADR-013) is importable and behaves
// correctly as a plain, environment-agnostic ES module — the same file the
// frontend bundle and the Worker bundle both import unmodified.
//
// Honest scope note: this test runs under Node, not literally inside a
// browser or the Workers/workerd runtime. Since shared/simulator-core.js
// contains zero DOM/Worker-specific APIs by construction (verified by
// inspection here too), a passing Node import is strong evidence of
// environment-agnosticism, but P2 should add a Worker-side (wrangler
// dev/vitest-pool-workers) equivalent once real Git semantics land, per
// docs/REQUIREMENTS.md TEST-007.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialState, applyCommand } from "../shared/simulator-core.js";

test("shared core source contains no DOM/Worker-specific globals", () => {
  const source = readFileSync(
    new URL("../shared/simulator-core.js", import.meta.url),
    "utf8"
  );
  // Match actual API *usage* (a trailing "." or "(") rather than bare words,
  // so a doc-comment that merely names a forbidden API as an example (as
  // this file's own header comment does) doesn't trip a false positive.
  for (const forbidden of ["document.", "window.", "localStorage.", "addEventListener(", "Deno."]) {
    assert.ok(!source.includes(forbidden), `must not reference ${forbidden}`);
  }
});

test("createInitialState returns an uninitialized repository", () => {
  const state = createInitialState();
  assert.equal(state.initialized, false);
  assert.deepEqual(state.commits, []);
});

test("applyCommand: git init initializes the repository exactly once", () => {
  const before = createInitialState();
  const { state: afterInit, output, error } = applyCommand(before, "git init");

  assert.equal(before.initialized, false, "input state must not be mutated");
  assert.equal(afterInit.initialized, true);
  assert.equal(error, null);
  assert.match(output, /Initialized empty Git repository/);
});

test("applyCommand: unrecognized command is reported, not silently accepted", () => {
  const state = createInitialState();
  const { state: after, error } = applyCommand(state, "git commit -m \"test\"");

  assert.deepEqual(after, state, "no state change for an unrecognized command");
  assert.match(error, /not recognized/);
});
