// Trivial test proving the test pipeline itself works (Engineering skill §12 /
// docs/REQUIREMENTS.md TEST-001 baseline). Intentionally independent of any
// project code.
import { test } from "node:test";
import assert from "node:assert/strict";

test("test pipeline is wired up", () => {
  assert.equal(1 + 1, 2);
});
