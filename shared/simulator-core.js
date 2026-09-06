/**
 * Git Learning Lab — shared simulator core (ADR-013).
 *
 * This module is the SINGLE implementation of Git state/semantics shared by:
 *   - the browser frontend (live simulation + visualization)
 *   - the Cloudflare Worker (server-authoritative challenge replay/validation)
 *
 * HARD CONSTRAINTS (do not violate, per Engineering skill §6 and ADR-013):
 *   - No DOM APIs (no `document`, `window`, `localStorage`, etc.)
 *   - No Worker-specific APIs (no Cloudflare bindings, no `env`, no D1)
 *   - No `fetch`, no network access
 *   - Pure functions only: (state, command) -> { state, output, error }
 *
 * P1 STATUS: placeholder + minimal proof-of-wiring only.
 * Full Git command semantics (SIM-001..SIM-016 in docs/REQUIREMENTS.md) are
 * NOT implemented yet — that is P2 work. This file exists in P1 to prove the
 * shared-module import path works end-to-end from both the frontend bundle
 * and the Worker bundle, per docs/REQUIREMENTS.md SIM-016.
 */

/**
 * Creates a fresh, empty simulated repository state.
 * Shape is provisional and will be extended in P2 to match the full
 * Working Directory / Staging Area / Local Repository / Remote Repository
 * model described in the Engineering skill §7.
 */
export function createInitialState() {
  return {
    initialized: false,
    workingDirectory: {},
    stagingArea: {},
    commits: [],
    branches: { main: null },
    head: "main",
  };
}

/**
 * Applies a single command string to a state, returning a NEW state object
 * (never mutates the input) plus output/error text.
 *
 * P1 implements only `git init`, as a minimal, honest proof that the
 * (state, command) -> { state, output, error } contract works end-to-end.
 * Every other input is correctly reported as not-yet-recognized rather than
 * silently accepted — this is deliberate: an unimplemented command must never
 * be confused with an implemented one that happens to do nothing.
 */
export function applyCommand(state, commandString) {
  const trimmed = String(commandString ?? "").trim();

  if (trimmed === "git init") {
    if (state.initialized) {
      return { state, output: "", error: "Reinitialized existing Git repository" };
    }
    return {
      state: { ...state, initialized: true },
      output: "Initialized empty Git repository",
      error: null,
    };
  }

  return {
    state,
    output: "",
    error: `command not recognized (P1 scaffold only implements "git init"): ${trimmed}`,
  };
}
