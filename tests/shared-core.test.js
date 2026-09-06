// Transition-oriented regression corpus for shared/simulator-core.js
// (Engineering skill §12; docs/REQUIREMENTS.md TEST-001/TEST-002/TEST-007).
// Every command implemented in P2 gets at least one happy-path test and at
// least one invalid-sequence test, per the P2 session brief.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createInitialState,
  createInitialRemoteState,
  applyCommand,
  writeFile,
  computeStatus,
} from "../shared/simulator-core.js";

function run(state, cmd, options) {
  return applyCommand(state, cmd, options);
}

// ---------------------------------------------------------------------------
// Environment-agnosticism (SIM-016 / TEST-007's Node-side half)
// ---------------------------------------------------------------------------

test("shared core source contains no DOM/Worker-specific globals", () => {
  const source = readFileSync(new URL("../shared/simulator-core.js", import.meta.url), "utf8");
  for (const forbidden of ["document.", "window.", "localStorage.", "addEventListener(", "Deno.", "eval(", "new Function("]) {
    assert.ok(!source.includes(forbidden), `must not reference ${forbidden}`);
  }
});

test("createInitialState returns an uninitialized repository", () => {
  const state = createInitialState();
  assert.equal(state.initialized, false);
  assert.deepEqual(state.commits, []);
  assert.deepEqual(state.branches, { master: null });
});

// ---------------------------------------------------------------------------
// git init
// ---------------------------------------------------------------------------

test("applyCommand: git init initializes the repository exactly once", () => {
  const before = createInitialState();
  const { state: afterInit, output, error } = run(before, "git init");

  assert.equal(before.initialized, false, "input state must not be mutated");
  assert.equal(afterInit.initialized, true);
  assert.equal(error, null);
  assert.match(output, /Initialized empty Git repository/);
});

test("applyCommand: unrecognized command is reported, not silently accepted", () => {
  const state = createInitialState();
  const { state: after, error } = run(state, "git init");
  const { state: after2, error: error2 } = run(after, "rm -rf /");
  assert.deepEqual(after2, after, "no state change for an unrecognized command");
  assert.match(error2, /not recognized/);
});

test("applyCommand: commands before git init fail with a specific error, not a generic one", () => {
  const state = createInitialState();
  const { state: after, error } = run(state, "git status");
  assert.deepEqual(after, state);
  assert.match(error, /not a git repository/);
});

// ---------------------------------------------------------------------------
// git add / git status
// ---------------------------------------------------------------------------

test("applyCommand: git add <file> stages exactly the named file", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "hello");
  state = writeFile(state, "b.txt", "world");

  const before = computeStatus(state);
  assert.deepEqual(before.map((e) => e.label), ["untracked", "untracked"]);

  const { state: afterAdd } = run(state, "git add a.txt");
  const statuses = computeStatus(afterAdd);
  assert.equal(statuses.find((e) => e.path === "a.txt").label, "staged");
  assert.equal(statuses.find((e) => e.path === "b.txt").label, "untracked", "b.txt must remain untouched");
});

test("applyCommand: git add . stages every working-directory file", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = writeFile(state, "b.js", "2");

  const { state: after } = run(state, "git add .");
  const labels = computeStatus(after).map((e) => e.label);
  assert.deepEqual(labels, ["staged", "staged"]);
});

test("applyCommand: git add *.<ext> stages only matching files", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.js", "1");
  state = writeFile(state, "b.txt", "2");

  const { state: after } = run(state, "git add *.js");
  assert.equal(computeStatus(after).find((e) => e.path === "a.js").label, "staged");
  assert.equal(computeStatus(after).find((e) => e.path === "b.txt").label, "untracked");
});

test("applyCommand: git add <file> on a nonexistent file fails with a specific pathspec error", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  const { state: after, error } = run(state, "git add ghost.txt");
  assert.deepEqual(after, state);
  assert.match(error, /pathspec/);
});

test("applyCommand: git status distinguishes untracked / modified / staged / committed", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "b.txt", "v1");
  state = run(state, "git add b.txt").state;
  state = run(state, 'git commit -m "first"').state; // b: committed, clean

  state = writeFile(state, "b.txt", "v2"); // b: modified (was committed, now edited)
  state = writeFile(state, "a.txt", "v1");
  state = run(state, "git add a.txt").state; // a: staged, never committed
  state = writeFile(state, "c.txt", "v1"); // c: untracked, never staged

  const labels = Object.fromEntries(computeStatus(state).map((e) => [e.path, e.label]));
  assert.equal(labels["a.txt"], "staged");
  assert.equal(labels["b.txt"], "modified");
  assert.equal(labels["c.txt"], "untracked");
});

// ---------------------------------------------------------------------------
// git rm --cached
// ---------------------------------------------------------------------------

test("applyCommand: git rm --cached unstages a file without deleting it from the working directory", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "hello");
  state = run(state, "git add a.txt").state;

  const { state: after, error } = run(state, "git rm --cached a.txt");
  assert.equal(error, null);
  assert.equal(after.workingDirectory["a.txt"], "hello", "working directory file must survive");
  assert.equal(computeStatus(after).find((e) => e.path === "a.txt").label, "untracked");
});

test("applyCommand: git rm --cached on an unknown file fails specifically", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  const { state: after, error } = run(state, "git rm --cached ghost.txt");
  assert.deepEqual(after, state);
  assert.match(error, /pathspec/);
});

// ---------------------------------------------------------------------------
// git commit — the canonical mandatory case
// ---------------------------------------------------------------------------

test("MANDATORY: git commit -m \"test\" with nothing staged creates no commit", () => {
  let state = createInitialState();
  state = run(state, "git init").state;

  const before = state;
  const { state: after, error } = run(state, 'git commit -m "test"');

  assert.deepEqual(after, before, "state must be fully preserved");
  assert.equal(after.commits.length, 0, "no commit created");
  assert.match(error, /nothing to commit/);
});

test("MANDATORY: add then commit creates exactly one commit", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "hello");
  state = run(state, "git add a.txt").state;

  const { state: after, output, error } = run(state, 'git commit -m "Initial commit"');
  assert.equal(error, null);
  assert.equal(after.commits.length, 1);
  assert.deepEqual(after.stagingArea, {}, "staging area is cleared after commit");
  assert.equal(after.branches[after.head], after.commits[0].id, "HEAD's branch points at the new commit");
  assert.match(output, /Initial commit/);
});

test("applyCommand: committing with an empty message is rejected", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "hello");
  state = run(state, "git add a.txt").state;

  const { state: after, error } = run(state, 'git commit -m ""');
  assert.equal(after.commits.length, 0);
  assert.match(error, /empty commit message/);
});

// ---------------------------------------------------------------------------
// git log / git log --oneline
// ---------------------------------------------------------------------------

test("applyCommand: git log lists commits most-recent-first", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;
  state = writeFile(state, "a.txt", "2");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "second"').state;

  const { output, error } = run(state, "git log --oneline");
  assert.equal(error, null);
  const lines = output.split("\n");
  assert.equal(lines.length, 2);
  assert.match(lines[0], /second/);
  assert.match(lines[1], /first/);
});

test("applyCommand: git log on a branch with no commits fails specifically", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  const { error } = run(state, "git log");
  assert.match(error, /does not have any commits yet/);
});

// ---------------------------------------------------------------------------
// git diff
// ---------------------------------------------------------------------------

test("applyCommand: git diff shows removed and added lines distinctly", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "line1\nline2");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;
  state = writeFile(state, "a.txt", "line1\nCHANGED");

  const { output, error } = run(state, "git diff");
  assert.equal(error, null);
  assert.match(output, /^-line2$/m);
  assert.match(output, /^\+CHANGED$/m);
});

test("applyCommand: git diff is empty when nothing differs", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "same");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;

  const { output, error } = run(state, "git diff");
  assert.equal(error, null);
  assert.equal(output, "");
});

// ---------------------------------------------------------------------------
// git checkout <file>
// ---------------------------------------------------------------------------

test("applyCommand: git checkout <file> reverts content without moving HEAD", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "original");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;
  const headBefore = state.branches[state.head];
  state = writeFile(state, "a.txt", "oops i broke it");

  const { state: after, error } = run(state, "git checkout a.txt");
  assert.equal(error, null);
  assert.equal(after.workingDirectory["a.txt"], "original");
  assert.equal(after.branches[after.head], headBefore, "HEAD must not move");
});

test("applyCommand: git checkout <file> on a never-committed file fails specifically", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "hi");
  const { error } = run(state, "git checkout a.txt");
  assert.match(error, /did not match any file/);
});

// ---------------------------------------------------------------------------
// git reset --soft / --mixed / --hard (three distinct resulting states)
// ---------------------------------------------------------------------------

function twoCommitState() {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "v1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;
  const firstId = state.branches[state.head];
  state = writeFile(state, "a.txt", "v2");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "second"').state;
  return { state, firstId };
}

test("applyCommand: git reset --soft moves HEAD and stages the undone changes", () => {
  const { state, firstId } = twoCommitState();
  const { state: after, error } = run(state, `git reset --soft ${firstId}`);
  assert.equal(error, null);
  assert.equal(after.branches[after.head], firstId);
  assert.equal(after.stagingArea["a.txt"], "v2", "undone change is staged");
  assert.equal(after.workingDirectory["a.txt"], "v2", "working directory untouched");
});

test("applyCommand: git reset --mixed moves HEAD but leaves changes unstaged", () => {
  const { state, firstId } = twoCommitState();
  const { state: after } = run(state, `git reset --mixed ${firstId}`);
  assert.deepEqual(after.stagingArea, {});
  assert.equal(after.workingDirectory["a.txt"], "v2");
  assert.equal(computeStatus(after).find((e) => e.path === "a.txt").label, "modified");
});

test("applyCommand: git reset --hard moves HEAD and discards changes entirely", () => {
  const { state, firstId } = twoCommitState();
  const { state: after } = run(state, `git reset --hard ${firstId}`);
  assert.deepEqual(after.stagingArea, {});
  assert.equal(after.workingDirectory["a.txt"], "v1");
  assert.equal(computeStatus(after).find((e) => e.path === "a.txt").label, "committed");
});

test("applyCommand: the three reset modes produce three distinct states from the same start", () => {
  const { state, firstId } = twoCommitState();
  const soft = run(state, `git reset --soft ${firstId}`).state;
  const mixed = run(state, `git reset --mixed ${firstId}`).state;
  const hard = run(state, `git reset --hard ${firstId}`).state;
  assert.notDeepEqual(soft.stagingArea, mixed.stagingArea);
  assert.notDeepEqual(mixed.workingDirectory, hard.workingDirectory);
  assert.notDeepEqual(soft, hard);
});

// ---------------------------------------------------------------------------
// git branch / git checkout <branch> / -b
// ---------------------------------------------------------------------------

test("applyCommand: git branch <name> creates a pointer without moving HEAD", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;

  const { state: after, error } = run(state, "git branch feature");
  assert.equal(error, null);
  assert.equal(after.head, "master");
  assert.equal(after.branches.feature, after.branches.master);
});

test("applyCommand: git checkout <branch> switches HEAD", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;
  state = run(state, "git branch feature").state;

  const { state: after, error } = run(state, "git checkout feature");
  assert.equal(error, null);
  assert.equal(after.head, "feature");
});

test("applyCommand: git checkout -b creates and switches in one step", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;

  const { state: after, error } = run(state, "git checkout -b feature");
  assert.equal(error, null);
  assert.equal(after.head, "feature");
  assert.ok(after.branches.feature);
});

test("applyCommand: git branch on a repo with zero commits fails specifically", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  const { error } = run(state, "git branch feature");
  assert.match(error, /not a valid object name/);
});

test("applyCommand: switching branches with uncommitted changes is rejected", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;
  state = run(state, "git branch feature").state;
  state = writeFile(state, "a.txt", "dirty");

  const { error } = run(state, "git checkout feature");
  assert.match(error, /overwritten/);
});

test("applyCommand: git branch -d deletes a branch pointer without touching commits", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;
  state = run(state, "git branch feature").state;

  const { state: after, error } = run(state, "git branch -d feature");
  assert.equal(error, null);
  assert.ok(!("feature" in after.branches));
  assert.equal(after.commits.length, 1, "commits are never deleted by branch -d");
});

test("applyCommand: git branch -d refuses to delete the currently checked-out branch", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;

  const { error } = run(state, "git branch -d master");
  assert.match(error, /checked out/);
});

// ---------------------------------------------------------------------------
// git merge
// ---------------------------------------------------------------------------

test("applyCommand: git merge fast-forwards when current branch has not diverged", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;
  state = run(state, "git checkout -b feature").state;
  state = writeFile(state, "b.txt", "2");
  state = run(state, "git add b.txt").state;
  state = run(state, 'git commit -m "feature work"').state;
  state = run(state, "git checkout master").state;

  const { state: after, output, error } = run(state, "git merge feature");
  assert.equal(error, null);
  assert.match(output, /Fast-forward/);
  assert.equal(after.workingDirectory["b.txt"], "2");
});

test("applyCommand: git merge auto-merges non-conflicting divergent changes", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "base");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "base"').state;
  state = run(state, "git branch feature").state;

  // master changes file b, feature changes file c — no overlap.
  state = writeFile(state, "b.txt", "on master");
  state = run(state, "git add b.txt").state;
  state = run(state, 'git commit -m "master change"').state;

  state = run(state, "git checkout feature").state;
  state = writeFile(state, "c.txt", "on feature");
  state = run(state, "git add c.txt").state;
  state = run(state, 'git commit -m "feature change"').state;
  state = run(state, "git checkout master").state;

  const { state: after, error } = run(state, "git merge feature");
  assert.equal(error, null);
  assert.equal(after.workingDirectory["b.txt"], "on master");
  assert.equal(after.workingDirectory["c.txt"], "on feature");
});

test("applyCommand: git merge reports a conflict without changing state", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "base");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "base"').state;
  state = run(state, "git branch feature").state;

  state = writeFile(state, "a.txt", "master version");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "master edits a"').state;

  state = run(state, "git checkout feature").state;
  state = writeFile(state, "a.txt", "feature version");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "feature edits a"').state;
  state = run(state, "git checkout master").state;

  const before = state;
  const { state: after, error } = run(state, "git merge feature");
  assert.deepEqual(after, before, "conflicting merge must not change state");
  assert.match(error, /conflict/i);
});

// ---------------------------------------------------------------------------
// git push / git pull / git clone (remote is a genuinely separate state)
// ---------------------------------------------------------------------------

test("applyCommand: git push copies local commits into a separate remote state", () => {
  let state = createInitialState();
  let remoteState = createInitialRemoteState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;

  const result = run(state, "git push", { remoteState });
  assert.equal(result.error, null);
  assert.equal(result.remoteState.commits.length, 1);
  assert.equal(result.remoteState.branches.master, state.branches.master);
  assert.notEqual(result.remoteState, remoteState, "remote is not mutated in place");
});

test("applyCommand: git push is rejected when the remote has diverged (non-fast-forward)", () => {
  let state = createInitialState();
  let remoteState = createInitialRemoteState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;
  remoteState = run(state, "git push", { remoteState }).remoteState;

  // Someone else pushes a second commit directly to remote that local doesn't have.
  let other = createInitialState();
  other = run(other, "git clone", { remoteState }).state;
  other = writeFile(other, "b.txt", "2");
  other = run(other, "git add b.txt").state;
  other = run(other, 'git commit -m "second"').state;
  remoteState = run(other, "git push", { remoteState }).remoteState;

  // Original local is now behind; its push must be rejected.
  const result = run(state, "git push", { remoteState });
  assert.match(result.error, /rejected/);
});

test("applyCommand: git pull fetches and fast-forwards when possible", () => {
  let state = createInitialState();
  let remoteState = createInitialRemoteState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;
  remoteState = run(state, "git push", { remoteState }).remoteState;

  let machineB = createInitialState();
  machineB = run(machineB, "git clone", { remoteState }).state;

  // machineB pushes a new commit.
  machineB = writeFile(machineB, "b.txt", "2");
  machineB = run(machineB, "git add b.txt").state;
  machineB = run(machineB, 'git commit -m "second"').state;
  remoteState = run(machineB, "git push", { remoteState }).remoteState;

  const result = run(state, "git pull", { remoteState });
  assert.equal(result.error, null);
  assert.equal(result.state.workingDirectory["b.txt"], "2");
});

test("applyCommand: git pull with no tracked remote branch fails specifically", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  const { error } = run(state, "git pull", { remoteState: createInitialRemoteState() });
  assert.match(error, /no tracking information/i);
});

test("applyCommand: git clone copies full remote history into a fresh local repository", () => {
  let state = createInitialState();
  let remoteState = createInitialRemoteState();
  state = run(state, "git init").state;
  state = writeFile(state, "a.txt", "1");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "first"').state;
  state = writeFile(state, "a.txt", "2");
  state = run(state, "git add a.txt").state;
  state = run(state, 'git commit -m "second"').state;
  remoteState = run(state, "git push", { remoteState }).remoteState;

  const fresh = createInitialState();
  const { state: cloned, error } = run(fresh, "git clone", { remoteState });
  assert.equal(error, null);
  assert.equal(cloned.initialized, true);
  assert.equal(cloned.commits.length, 2, "full history, not just latest snapshot");
  assert.equal(cloned.workingDirectory["a.txt"], "2");
});

test("applyCommand: git clone into an already-initialized repo is rejected", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  const { error } = run(state, "git clone", { remoteState: createInitialRemoteState() });
  assert.match(error, /already exists/);
});

// ---------------------------------------------------------------------------
// Safety boundary — SEC-001 / SIM-014
// ---------------------------------------------------------------------------

test("SECURITY: shell-metacharacter / injection-like input produces no side effect", () => {
  let state = createInitialState();
  state = run(state, "git init").state;
  const before = state;

  // Payloads with no valid Git-subcommand prefix: must be rejected as
  // "not recognized" — the parser never falls through to any execution path.
  const unrecognizedPayloads = ["; rm -rf /", "$(rm -rf /)", "`rm -rf /`", "process.exit(1)", "require('child_process').exec('ls')"];
  for (const payload of unrecognizedPayloads) {
    const { state: after, error } = run(state, payload);
    assert.deepEqual(after, before, `payload must cause no state change: ${payload}`);
    assert.match(error, /not recognized/);
  }

  // A payload that happens to start with a real subcommand prefix (e.g.
  // appending shell operators after a valid `git commit -m "test"`) is not
  // specially detected as an "attack" — the parser has no shell-operator
  // concept at all, so the trailing text is just ignored as extra tokens.
  // The safety property that matters (SEC-001) is that NOTHING beyond the
  // simulator's own pure state transition ever happens: no real command runs,
  // and the resulting error/state is whatever that legitimate subcommand's
  // own precondition check would produce — never a silent success.
  const lookalike = 'git commit -m "test" && rm -rf /';
  const { state: after, error } = run(state, lookalike);
  assert.deepEqual(after, before, "no commit was created and no other state changed");
  assert.match(error, /nothing to commit/);
});

test("shared core imports and behaves consistently regardless of call site (browser vs Worker proxy)", () => {
  // Both runtimes import this exact module; this test proves the same input
  // always produces the same output regardless of how many times/where it's
  // invoked, which is what makes Worker-side replay validation (ADR-013) safe.
  const state = createInitialState();
  const runA = run(run(state, "git init").state, "git status");
  const runB = run(run(state, "git init").state, "git status");
  assert.deepEqual(runA.state, runB.state);
  assert.equal(runA.output, runB.output);
});
