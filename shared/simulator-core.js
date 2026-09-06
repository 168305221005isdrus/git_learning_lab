/**
 * Git Learning Lab — shared simulator core (ADR-013).
 *
 * SINGLE implementation of Git state/semantics shared by:
 *   - the browser frontend (live simulation + visualization)
 *   - the Cloudflare Worker (server-authoritative challenge replay/validation)
 *
 * HARD CONSTRAINTS (do not violate — Engineering skill §6, ADR-013):
 *   - No DOM APIs (no `document`, `window`, `localStorage`, etc.)
 *   - No Worker-specific APIs (no Cloudflare bindings, no `env`, no D1)
 *   - No `fetch`, no network access, no `eval`/`Function`, no real filesystem
 *   - Pure functions only: (state, command) -> { state, output, error } —
 *     inputs are never mutated.
 *
 * P2 STATUS: real Git semantics for the release-blocking command set (per
 * the P2 brief's staged order) are implemented: init, status, add, add .,
 * add *.<ext>, rm --cached, commit -m, log, log --oneline, diff, checkout
 * <file>. The "if time allows" extended set is also implemented: reset
 * --soft/--mixed/--hard, branch, checkout <branch>, checkout -b <branch>,
 * merge (fast-forward + simple non-conflicting three-way), push, pull,
 * clone. NOT implemented: `git log --graph` (commit-graph text rendering)
 * — out of this session's staged scope; see docs/PROJECT_CONTEXT.md "known
 * P2 debt".
 *
 * ============================================================================
 * STATE MODEL (Engineering skill §7)
 * ============================================================================
 *
 * A single LOCAL repository state has this shape:
 *   {
 *     initialized:   boolean
 *     workingDirectory: { [path]: string }   // files that exist on disk
 *     stagingArea:      { [path]: string }   // Index — snapshot per file
 *     commits:       Commit[]                // append-only object store
 *     branches:      { [name]: commitId|null }
 *     head:          string                  // current branch name
 *     commitSeq:     number                  // monotonic counter for IDs
 *   }
 *
 *   Commit = {
 *     id: string, parentId: string|null, parentId2: string|null (merges only),
 *     message: string, snapshot: { [path]: string }, timestamp: string,
 *     seq: number,
 *   }
 *
 * The simulated REMOTE is a SEPARATE, independent object with the same
 * commits/branches shape:  { branches: { [name]: commitId|null }, commits: Commit[] }
 * It is deliberately NOT nested inside the local state (see "why remote is
 * separate" below) — callers hold it and pass it in via `options.remoteState`
 * to any command that needs it (push/pull/clone). This is what makes the
 * "two machines, one remote" Module 6 scenario possible: two independent
 * local states can be pushed/pulled against the very same remoteState value
 * held by the caller, without any command ever mutating its inputs.
 *
 * Tracked-status vocabulary matches the PDF exactly: Untracked / Modified /
 * Staged / Committed (Engineering skill §7) — no invented synonyms.
 *
 * Determinism (SIM-013): commit IDs are derived from content (parent + message
 * + snapshot + sequence), never from wall-clock or randomness, so the same
 * command sequence always produces the same resulting state. `timestamp` is
 * stored for DISPLAY only and never affects which transition occurs or what
 * the resulting state is.
 */

// ----------------------------------------------------------------------------
// State constructors
// ----------------------------------------------------------------------------

/** Creates a fresh, empty simulated LOCAL repository state. */
export function createInitialState() {
  return {
    initialized: false,
    workingDirectory: {},
    stagingArea: {},
    commits: [],
    branches: { master: null },
    head: "master",
    commitSeq: 0,
  };
}

/** Creates a fresh, empty simulated REMOTE repository state. */
export function createInitialRemoteState() {
  return { branches: {}, commits: [] };
}

// ----------------------------------------------------------------------------
// Non-Git working-directory editing (NOT part of the command grammar)
// ----------------------------------------------------------------------------

/**
 * Simulates a learner creating/editing a file in the Working Directory —
 * the "text editor" half of the workflow real Git doesn't itself provide.
 * This is NOT a Git command and is never reached through `applyCommand`'s
 * parser (SIM-014's constrained grammar is unaffected by this function's
 * existence) — it's the lesson/practice UI's own explicit API for setting up
 * or driving a scenario. Pure: returns a new state, never mutates `state`.
 */
export function writeFile(state, path, content) {
  const trimmedPath = String(path ?? "").trim();
  if (!trimmedPath) {
    throw new Error("writeFile: path must be a non-empty string");
  }
  return {
    ...state,
    workingDirectory: { ...state.workingDirectory, [trimmedPath]: String(content ?? "") },
  };
}

/** Simulates deleting a file from the Working Directory (not a Git command). */
export function deleteWorkingFile(state, path) {
  const next = { ...state.workingDirectory };
  delete next[path];
  return { ...state, workingDirectory: next };
}

// ----------------------------------------------------------------------------
// Status derivation (shared by `git status`, `git diff`, and the visualizer —
// one place decides "what is this file's state", per Engineering skill §6)
// ----------------------------------------------------------------------------

/**
 * Returns the current branch's last-commit snapshot ({} if no commits yet).
 */
function headSnapshot(state) {
  const commitId = state.branches[state.head];
  if (!commitId) return {};
  const commit = findCommitIn(state.commits, commitId);
  return commit ? commit.snapshot : {};
}

function findCommitIn(commits, id) {
  return commits.find((c) => c.id === id) || null;
}

/** Looks up a commit by id across a local state and an optional remote state. */
function findCommitAnywhere(state, remoteState, id) {
  return (
    findCommitIn(state.commits, id) ||
    (remoteState ? findCommitIn(remoteState.commits, id) : null) ||
    null
  );
}

/**
 * Computes a single, mutually-exclusive status label per file — matching
 * SIM-004's literal requirement ("one of: untracked, modified, staged,
 * committed"). Reused by `git status`, `git diff`, and any UI/visualizer
 * code (never re-derived independently elsewhere, per Engineering skill §6).
 *
 * Returns: Array<{ path, label }>, label ∈ 'untracked'|'modified'|'staged'|'committed'
 */
export function computeStatus(state) {
  const committed = headSnapshot(state);
  const staged = state.stagingArea;
  const working = state.workingDirectory;

  const paths = new Set([...Object.keys(working)]);
  const results = [];

  for (const path of paths) {
    const workingContent = working[path];
    const stagedContent = Object.prototype.hasOwnProperty.call(staged, path) ? staged[path] : undefined;
    const committedContent = Object.prototype.hasOwnProperty.call(committed, path) ? committed[path] : undefined;

    let label;
    if (stagedContent !== undefined) {
      label = workingContent !== stagedContent ? "modified" : "staged";
    } else if (committedContent === undefined) {
      label = "untracked";
    } else {
      label = workingContent === committedContent ? "committed" : "modified";
    }
    results.push({ path, label });
  }

  return results.sort((a, b) => a.path.localeCompare(b.path));
}

// ----------------------------------------------------------------------------
// Parsing (SIM-014's safe boundary: a constrained grammar, never a fallback
// that executes anything real — Engineering skill §10)
// ----------------------------------------------------------------------------

/** Tokenizes a command string, respecting "double" and 'single' quoted args. */
function tokenize(commandString) {
  const tokens = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;
  while ((match = re.exec(commandString)) !== null) {
    tokens.push(match[1] !== undefined ? match[1] : match[2] !== undefined ? match[2] : match[3]);
  }
  return tokens;
}

function globToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
}

function deepEqualSnapshot(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => a[k] === b[k]);
}

// ----------------------------------------------------------------------------
// Commit-graph helpers
// ----------------------------------------------------------------------------

/** True if `ancestorId` is `id` itself or reachable by walking parent pointers from `id`. */
function isAncestor(commits, remoteCommits, ancestorId, id) {
  if (!id) return false;
  const seen = new Set();
  const stack = [id];
  const all = commits.concat(remoteCommits || []);
  while (stack.length) {
    const cur = stack.pop();
    if (cur === ancestorId) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    const c = all.find((x) => x.id === cur);
    if (!c) continue;
    if (c.parentId) stack.push(c.parentId);
    if (c.parentId2) stack.push(c.parentId2);
  }
  return false;
}

/** All ancestor commit ids reachable from `id` (inclusive), across local+remote commit pools. */
function ancestorSet(commits, remoteCommits, id) {
  const set = new Set();
  if (!id) return set;
  const all = commits.concat(remoteCommits || []);
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop();
    if (set.has(cur)) continue;
    set.add(cur);
    const c = all.find((x) => x.id === cur);
    if (!c) continue;
    if (c.parentId) stack.push(c.parentId);
    if (c.parentId2) stack.push(c.parentId2);
  }
  return set;
}

/** Deterministic pseudo-hash (NOT cryptographic) — content-derived, never time/random-derived. */
function generateCommitId(seed) {
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5 ^ 0xffffffff;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= c;
    h2 = Math.imul(h2, 0x01000193);
  }
  const hex = (n) => (n >>> 0).toString(16).padStart(8, "0");
  return (hex(h1) + hex(h2) + hex(h1 ^ h2) + hex((h1 + h2) >>> 0) + hex((Math.imul(h1, 3) + h2) >>> 0)).slice(0, 40);
}

function shortId(id) {
  return id.slice(0, 7);
}

// ----------------------------------------------------------------------------
// The command engine
// ----------------------------------------------------------------------------

/**
 * Applies a single command string to a LOCAL state, returning a NEW state
 * (never mutates `state` or `options.remoteState`) plus display output.
 *
 * @param {object} state - current local repository state
 * @param {string} commandString - raw learner-typed input
 * @param {object} [options]
 * @param {object} [options.remoteState] - simulated remote (createInitialRemoteState()
 *   if omitted); only read/replaced by push/pull/clone.
 * @param {string} [options.now] - display-only timestamp override for the next
 *   commit (tests use this for determinism; state transitions never depend on it).
 * @returns {{ state: object, remoteState: object, output: string, error: string|null }}
 */
export function applyCommand(state, commandString, options = {}) {
  const remoteState = options.remoteState || createInitialRemoteState();
  const trimmed = String(commandString ?? "").trim();
  const noop = (error, output = "") => ({ state, remoteState, output, error });

  if (!trimmed) return noop("command not recognized: (empty input)");

  const tokens = tokenize(trimmed);
  if (tokens[0] !== "git") {
    return noop(`command not recognized: ${trimmed}`);
  }

  const sub = tokens[1];
  const args = tokens.slice(2);

  // git init — Preconditions: none. Effect: initializes the repo (idempotent
  // re-init is reported, not treated as an error). Postconditions: initialized=true.
  if (sub === "init") {
    if (state.initialized) {
      return { state, remoteState, output: "Reinitialized existing Git repository", error: null };
    }
    return { state: { ...state, initialized: true }, remoteState, output: "Initialized empty Git repository", error: null };
  }

  // git clone is the other exception to the "must already be initialized"
  // guard below — cloning is precisely how an UNINITIALIZED directory gets a
  // repository, so it must be reachable before `git init` has ever run.
  if (sub === "clone") {
    return doClone(state, remoteState);
  }

  // Every other command requires an initialized repository.
  if (!state.initialized) {
    return noop("fatal: not a git repository (or any of the parent directories)");
  }

  switch (sub) {
    case "status":
      return doStatus(state, remoteState);
    case "add":
      return doAdd(state, remoteState, args);
    case "rm":
      return doRm(state, remoteState, args);
    case "commit":
      return doCommit(state, remoteState, args, options);
    case "log":
      return doLog(state, remoteState, args);
    case "diff":
      return doDiff(state, remoteState, args);
    case "checkout":
      return doCheckout(state, remoteState, args);
    case "reset":
      return doReset(state, remoteState, args);
    case "branch":
      return doBranch(state, remoteState, args);
    case "merge":
      return doMerge(state, remoteState, args);
    case "push":
      return doPush(state, remoteState, args);
    case "pull":
      return doPull(state, remoteState, args);
    default:
      return noop(`command not recognized: ${trimmed}`);
  }
}

// ---- git status -------------------------------------------------------------
// Preconditions: repo initialized. Effect: none (read-only). Postconditions:
// state unchanged. Error states: none (always succeeds once initialized).
function doStatus(state, remoteState) {
  const entries = computeStatus(state);
  const staged = entries.filter((e) => e.label === "staged");
  const modified = entries.filter((e) => e.label === "modified");
  const untracked = entries.filter((e) => e.label === "untracked");

  const lines = [`On branch ${state.head}`];
  if (!state.branches[state.head]) lines.push("", "No commits yet");

  if (staged.length) {
    lines.push("", "Changes to be committed:");
    staged.forEach((e) => lines.push(`  staged: ${e.path}`));
  }
  if (modified.length) {
    lines.push("", "Changes not staged for commit:");
    modified.forEach((e) => lines.push(`  modified: ${e.path}`));
  }
  if (untracked.length) {
    lines.push("", "Untracked files:");
    untracked.forEach((e) => lines.push(`  untracked: ${e.path}`));
  }
  if (!staged.length && !modified.length && !untracked.length) {
    lines.push("", "nothing to commit, working tree clean");
  }

  return { state, remoteState, output: lines.join("\n"), error: null };
}

// ---- git add ------------------------------------------------------------
// Preconditions: for `git add <file>`, <file> must exist in the Working
// Directory. Effect: copies the current Working Directory content for the
// matched file(s) into the Staging Area (snapshot at add-time). Postconditions:
// matched file(s) show status 'staged'. Error states: pathspec did not match.
function doAdd(state, remoteState, args) {
  if (args.length === 0) {
    return { state, remoteState, output: "Nothing specified, nothing added.", error: null };
  }
  const pattern = args[0];
  let matched;

  if (pattern === ".") {
    matched = Object.keys(state.workingDirectory);
  } else if (pattern.includes("*")) {
    const re = globToRegExp(pattern);
    matched = Object.keys(state.workingDirectory).filter((p) => re.test(p));
  } else {
    if (!Object.prototype.hasOwnProperty.call(state.workingDirectory, pattern)) {
      return { state, remoteState, output: "", error: `fatal: pathspec '${pattern}' did not match any files` };
    }
    matched = [pattern];
  }

  if (matched.length === 0) {
    return { state, remoteState, output: "", error: `fatal: pathspec '${pattern}' did not match any files` };
  }

  const nextStaging = { ...state.stagingArea };
  matched.forEach((p) => {
    nextStaging[p] = state.workingDirectory[p];
  });

  return { state: { ...state, stagingArea: nextStaging }, remoteState, output: "", error: null };
}

// ---- git rm --cached ------------------------------------------------------
// Preconditions: `--cached` flag required (this simulator only implements the
// non-destructive tracking-removal form, per SIM-003); <file> must currently
// be staged or present in HEAD's snapshot (i.e., known to Git). Effect:
// removes the file from the Staging Area only. Postconditions: the Working
// Directory file is untouched (SIM-003's core guarantee). Error states:
// missing --cached, or pathspec not known to Git.
function doRm(state, remoteState, args) {
  if (args[0] !== "--cached") {
    return { state, remoteState, output: "", error: "usage: git rm --cached <file> (this simulator only supports the tracking-removal form)" };
  }
  const path = args[1];
  if (!path) {
    return { state, remoteState, output: "", error: "usage: git rm --cached <file>" };
  }
  const committed = headSnapshot(state);
  const knownToGit =
    Object.prototype.hasOwnProperty.call(state.stagingArea, path) ||
    Object.prototype.hasOwnProperty.call(committed, path);
  if (!knownToGit) {
    return { state, remoteState, output: "", error: `fatal: pathspec '${path}' did not match any files` };
  }
  const nextStaging = { ...state.stagingArea };
  delete nextStaging[path];
  return {
    state: { ...state, stagingArea: nextStaging },
    remoteState,
    output: `rm '${path}' (removed from tracking; kept in working directory)`,
    error: null,
  };
}

// ---- git commit -m "<message>" --------------------------------------------
// Preconditions (SIM-001, canonical case): the Staging Area must contain at
// least one meaningful change relative to HEAD's snapshot — a non-empty
// commit message is also required. Effect: creates exactly one new commit
// whose parent is the prior HEAD commit, moves the current branch (and HEAD)
// to it, and clears the Staging Area. Postconditions: `git log` shows the new
// commit first; the committed files now read as 'committed' (clean). Error
// states: nothing staged / message empty — NEVER a bare "invalid command".
function doCommit(state, remoteState, args, options) {
  const mIndex = args.indexOf("-m");
  if (mIndex === -1 || args[mIndex + 1] === undefined) {
    return { state, remoteState, output: "", error: "usage: git commit -m <message>" };
  }
  const message = args[mIndex + 1].trim();
  if (!message) {
    return { state, remoteState, output: "", error: "Aborting commit due to empty commit message" };
  }

  const lastSnapshot = headSnapshot(state);
  const newSnapshot = { ...lastSnapshot, ...state.stagingArea };

  if (Object.keys(state.stagingArea).length === 0 || deepEqualSnapshot(newSnapshot, lastSnapshot)) {
    // SIM-001's canonical case: `git commit -m "test"` with nothing staged
    // must create NO commit and must preserve state exactly.
    return { state, remoteState, output: "", error: "nothing to commit, working tree clean" };
  }

  const parentId = state.branches[state.head];
  const seq = state.commitSeq + 1;
  const id = generateCommitId(`${parentId || ""}|${message}|${JSON.stringify(newSnapshot)}|${seq}`);
  const commit = {
    id,
    parentId: parentId || null,
    parentId2: null,
    message,
    snapshot: newSnapshot,
    timestamp: options.now || new Date().toISOString(),
    seq,
  };

  const nextState = {
    ...state,
    commits: [...state.commits, commit],
    branches: { ...state.branches, [state.head]: id },
    stagingArea: {},
    commitSeq: seq,
  };

  return { state: nextState, remoteState, output: `[${state.head} ${shortId(id)}] ${message}`, error: null };
}

// ---- git log / git log --oneline -------------------------------------------
// Preconditions: none beyond initialized. Effect: none (read-only).
// Error states: no commits yet on this branch.
function doLog(state, remoteState, args) {
  const headId = state.branches[state.head];
  if (!headId) {
    return { state, remoteState, output: "", error: `fatal: your current branch '${state.head}' does not have any commits yet` };
  }

  const oneline = args.includes("--oneline");
  const list = [];
  let cur = headId;
  const seen = new Set();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const commit = findCommitIn(state.commits, cur);
    if (!commit) break;
    list.push(commit);
    cur = commit.parentId;
  }

  const output = oneline
    ? list.map((c) => `${shortId(c.id)} ${c.message}`).join("\n")
    : list
        .map(
          (c) =>
            `commit ${c.id}\nAuthor: Learner <learner@git-learning-lab.local>\nDate:   ${c.timestamp}\n\n    ${c.message}\n`
        )
        .join("\n");

  return { state, remoteState, output, error: null };
}

// ---- git diff (plain, working directory vs. index/HEAD) --------------------
// Preconditions: none. Effect: none (read-only). Shows only tracked files
// (staged or committed) whose Working Directory content differs from the
// comparison reference — matches real Git's default `git diff` scope
// (untracked files are never shown by plain `git diff`).
function doDiff(state, remoteState) {
  const committed = headSnapshot(state);
  const staged = state.stagingArea;
  const working = state.workingDirectory;

  const trackedPaths = new Set([...Object.keys(committed), ...Object.keys(staged)]);
  const blocks = [];

  for (const path of trackedPaths) {
    const reference = Object.prototype.hasOwnProperty.call(staged, path) ? staged[path] : committed[path];
    const current = working[path];
    if (current === undefined || current === reference) continue;

    const oldLines = String(reference ?? "").split("\n");
    const newLines = String(current ?? "").split("\n");

    let prefixLen = 0;
    while (prefixLen < oldLines.length && prefixLen < newLines.length && oldLines[prefixLen] === newLines[prefixLen]) prefixLen++;
    let suffixLen = 0;
    while (
      suffixLen < oldLines.length - prefixLen &&
      suffixLen < newLines.length - prefixLen &&
      oldLines[oldLines.length - 1 - suffixLen] === newLines[newLines.length - 1 - suffixLen]
    )
      suffixLen++;

    const removed = oldLines.slice(prefixLen, oldLines.length - suffixLen);
    const added = newLines.slice(prefixLen, newLines.length - suffixLen);

    const block = [`--- a/${path}`, `+++ b/${path}`];
    removed.forEach((l) => block.push(`-${l}`));
    added.forEach((l) => block.push(`+${l}`));
    blocks.push(block.join("\n"));
  }

  return { state, remoteState, output: blocks.join("\n"), error: null };
}

// ---- git checkout <file> | <branch> | -b <branch> --------------------------
// File-revert form (SIM-008): Preconditions: <file> must exist in HEAD's
// snapshot. Effect: Working Directory content for that file is reverted to
// HEAD's committed version. Does NOT touch the Staging Area, does NOT move
// HEAD. Branch-switch form (SIM-010): Preconditions: <branch> must exist, and
// there must be no uncommitted staged/modified changes that switching would
// silently discard. Effect: HEAD moves to <branch>; Working Directory is
// reset to that branch's committed snapshot.
function doCheckout(state, remoteState, args) {
  if (args[0] === "-b") {
    const name = args[1];
    if (!name) return { state, remoteState, output: "", error: "usage: git checkout -b <branch>" };
    const created = createBranch(state, name);
    if (created.error) return { state, remoteState, output: "", error: created.error };
    return { state: { ...created.state, head: name }, remoteState, output: `Switched to a new branch '${name}'`, error: null };
  }

  const target = args[0];
  if (!target) return { state, remoteState, output: "", error: "usage: git checkout <file>|<branch>" };

  // Branch-switch form.
  if (Object.prototype.hasOwnProperty.call(state.branches, target)) {
    if (target === state.head) {
      return { state, remoteState, output: `Already on '${target}'`, error: null };
    }
    const dirty = computeStatus(state).some((e) => e.label === "modified" || e.label === "staged");
    if (dirty) {
      return {
        state,
        remoteState,
        output: "",
        error: "error: your local changes would be overwritten by checkout; commit or discard them first",
      };
    }
    const targetCommitId = state.branches[target];
    const targetSnapshot = targetCommitId ? findCommitIn(state.commits, targetCommitId).snapshot : {};
    return {
      state: { ...state, head: target, workingDirectory: { ...targetSnapshot }, stagingArea: {} },
      remoteState,
      output: `Switched to branch '${target}'`,
      error: null,
    };
  }

  // File-revert form.
  const committed = headSnapshot(state);
  if (!Object.prototype.hasOwnProperty.call(committed, target)) {
    return { state, remoteState, output: "", error: `error: pathspec '${target}' did not match any file(s) known to git` };
  }
  return {
    state: { ...state, workingDirectory: { ...state.workingDirectory, [target]: committed[target] } },
    remoteState,
    output: `Updated 1 path from the index: ${target}`,
    error: null,
  };
}

// ---- git reset --soft|--mixed|--hard <commit> -------------------------------
// Preconditions: a mode flag and a resolvable ancestor commit reference are
// required; the Staging Area must currently be empty (a simplifying MVP
// precondition — reset while mid-edit-of-the-index is out of scope). Effect
// varies by mode (each must produce a genuinely distinct resulting state,
// SIM-009):
//   --soft:  branch pointer moves only. Staging Area becomes a full copy of
//            the OLD HEAD snapshot (the undone commits' changes are staged).
//            Working Directory untouched.
//   --mixed: branch pointer moves; Staging Area becomes empty (index matches
//            new HEAD). Working Directory untouched (files now read as
//            'modified', not staged).
//   --hard:  branch pointer moves; Staging Area cleared; Working Directory is
//            reset to the target commit's snapshot (undone changes discarded).
function doReset(state, remoteState, args) {
  const mode = args[0];
  if (!["--soft", "--mixed", "--hard"].includes(mode)) {
    return { state, remoteState, output: "", error: "usage: git reset --soft|--mixed|--hard <commit>" };
  }
  const ref = args[1];
  if (!ref) return { state, remoteState, output: "", error: "usage: git reset --soft|--mixed|--hard <commit>" };

  if (Object.keys(state.stagingArea).length > 0) {
    return { state, remoteState, output: "", error: "cannot reset: you have staged changes — commit or unstage them first" };
  }

  const currentId = state.branches[state.head];
  const target = resolveCommitRef(state.commits, ref);
  if (!target) return { state, remoteState, output: "", error: `fatal: ambiguous argument '${ref}': unknown revision` };
  if (!isAncestor(state.commits, [], target.id, currentId)) {
    return { state, remoteState, output: "", error: `fatal: '${ref}' is not an ancestor of the current branch` };
  }

  const oldSnapshot = headSnapshot(state);
  const targetSnapshot = target.snapshot;
  const nextBranches = { ...state.branches, [state.head]: target.id };

  if (mode === "--soft") {
    return { state: { ...state, branches: nextBranches, stagingArea: { ...oldSnapshot } }, remoteState, output: `HEAD is now at ${shortId(target.id)}`, error: null };
  }
  if (mode === "--mixed") {
    return { state: { ...state, branches: nextBranches, stagingArea: {} }, remoteState, output: `HEAD is now at ${shortId(target.id)}`, error: null };
  }
  // --hard
  return {
    state: { ...state, branches: nextBranches, stagingArea: {}, workingDirectory: { ...targetSnapshot } },
    remoteState,
    output: `HEAD is now at ${shortId(target.id)}`,
    error: null,
  };
}

function resolveCommitRef(commits, ref) {
  if (ref.length >= 4) {
    return commits.find((c) => c.id.startsWith(ref)) || null;
  }
  return commits.find((c) => c.id === ref) || null;
}

// ---- git branch [<name>] | -d <name> ---------------------------------------
// List form: Preconditions: none. Effect: none. Create form (SIM-010):
// Preconditions: current branch must have at least one commit; <name> must
// not already exist. Effect: creates a new pointer at the current commit.
// Postconditions: HEAD does not move. Delete form (`-d`): Preconditions:
// <name> must exist and must not be the currently checked-out branch (Git
// itself refuses to delete the branch you're standing on). Effect: removes
// the branch pointer only — no commits are deleted (they remain reachable
// from any other branch/HEAD that still points to them).
function doBranch(state, remoteState, args) {
  if (args.length === 0) {
    const lines = Object.keys(state.branches)
      .sort()
      .map((name) => (name === state.head ? `* ${name}` : `  ${name}`));
    return { state, remoteState, output: lines.join("\n"), error: null };
  }
  if (args[0] === "-d") {
    const name = args[1];
    if (!name || !Object.prototype.hasOwnProperty.call(state.branches, name)) {
      return { state, remoteState, output: "", error: `error: branch '${name || ""}' not found` };
    }
    if (name === state.head) {
      return { state, remoteState, output: "", error: `error: cannot delete branch '${name}' checked out` };
    }
    const nextBranches = { ...state.branches };
    delete nextBranches[name];
    return { state: { ...state, branches: nextBranches }, remoteState, output: `Deleted branch ${name}`, error: null };
  }
  const created = createBranch(state, args[0]);
  if (created.error) return { state, remoteState, output: "", error: created.error };
  return { state: created.state, remoteState, output: `Created branch '${args[0]}'`, error: null };
}

function createBranch(state, name) {
  if (Object.prototype.hasOwnProperty.call(state.branches, name)) {
    return { state, error: `fatal: a branch named '${name}' already exists` };
  }
  const headId = state.branches[state.head];
  if (!headId) {
    return { state, error: `fatal: not a valid object name: '${state.head}'` };
  }
  return { state: { ...state, branches: { ...state.branches, [name]: headId } }, error: null };
}

// ---- git merge <branch> -----------------------------------------------------
// Preconditions (SIM-011): <branch> must exist. Effect: if the current branch
// is an ancestor of <branch>, fast-forwards (moves the pointer, no new
// commit). If <branch> is already an ancestor of current, no-op. Otherwise
// attempts a simple three-way merge from the nearest common ancestor; if any
// file was changed differently on both sides, reports a conflict and makes NO
// state change (conflict *resolution* UI is out of scope per docs/SCOPE.md —
// this simulator detects and reports conflicts, it does not resolve them).
function doMerge(state, remoteState, args) {
  const name = args[0];
  if (!name || !Object.prototype.hasOwnProperty.call(state.branches, name)) {
    return { state, remoteState, output: "", error: `merge: ${name || ""} - not something we can merge` };
  }

  const currentId = state.branches[state.head];
  const otherId = state.branches[name];
  if (currentId === otherId) return { state, remoteState, output: "Already up to date.", error: null };

  if (isAncestor(state.commits, [], currentId, otherId)) {
    // Fast-forward: current is behind other.
    const otherCommit = findCommitIn(state.commits, otherId);
    return {
      state: { ...state, branches: { ...state.branches, [state.head]: otherId }, workingDirectory: { ...otherCommit.snapshot }, stagingArea: {} },
      remoteState,
      output: "Fast-forward",
      error: null,
    };
  }
  if (isAncestor(state.commits, [], otherId, currentId)) {
    return { state, remoteState, output: "Already up to date.", error: null };
  }

  // True divergence — attempt a simple non-conflicting three-way merge.
  const currentAncestors = ancestorSet(state.commits, [], currentId);
  let commonAncestorId = null;
  let cur = otherId;
  const seen = new Set();
  const stack = [otherId];
  while (stack.length) {
    const id = stack.pop();
    if (currentAncestors.has(id)) {
      commonAncestorId = id;
      break;
    }
    if (seen.has(id)) continue;
    seen.add(id);
    const c = findCommitIn(state.commits, id);
    if (c?.parentId) stack.push(c.parentId);
    if (c?.parentId2) stack.push(c.parentId2);
  }

  const baseSnapshot = commonAncestorId ? findCommitIn(state.commits, commonAncestorId).snapshot : {};
  const currentSnapshot = findCommitIn(state.commits, currentId).snapshot;
  const otherSnapshot = findCommitIn(state.commits, otherId).snapshot;

  const allPaths = new Set([...Object.keys(baseSnapshot), ...Object.keys(currentSnapshot), ...Object.keys(otherSnapshot)]);
  const merged = {};
  for (const path of allPaths) {
    const base = baseSnapshot[path];
    const ours = currentSnapshot[path];
    const theirs = otherSnapshot[path];
    if (ours === theirs) {
      if (ours !== undefined) merged[path] = ours;
      continue;
    }
    if (ours === base) {
      if (theirs !== undefined) merged[path] = theirs;
      continue;
    }
    if (theirs === base) {
      if (ours !== undefined) merged[path] = ours;
      continue;
    }
    // Both sides changed this file differently from base and from each other.
    return {
      state,
      remoteState,
      output: "",
      error: `Automatic merge failed; fix conflicts in '${path}' and then commit the result (conflict resolution is not supported by this simulator)`,
    };
  }

  const seq = state.commitSeq + 1;
  const id = generateCommitId(`merge|${currentId}|${otherId}|${JSON.stringify(merged)}|${seq}`);
  const commit = { id, parentId: currentId, parentId2: otherId, message: `Merge branch '${name}' into ${state.head}`, snapshot: merged, timestamp: new Date().toISOString(), seq };

  return {
    state: { ...state, commits: [...state.commits, commit], branches: { ...state.branches, [state.head]: id }, workingDirectory: { ...merged }, stagingArea: {}, commitSeq: seq },
    remoteState,
    output: `Merge made by the 'recursive' strategy.`,
    error: null,
  };
}

// ---- git push ---------------------------------------------------------------
// Preconditions (SIM-012): current branch must have at least one commit; the
// remote's copy of this branch (if any) must be an ancestor of the local
// branch (fast-forward only — no force-push in scope). Effect: copies every
// commit reachable from the local branch tip into the remote's commit pool
// and advances the remote branch pointer. The remote and local commit graphs
// remain otherwise fully independent (no other command syncs them).
function doPush(state, remoteState, args) {
  const localId = state.branches[state.head];
  if (!localId) return { state, remoteState, output: "", error: `error: src refspec ${state.head} does not match any` };

  const remoteId = remoteState.branches[state.head];
  if (remoteId && !isAncestor(state.commits, remoteState.commits, remoteId, localId)) {
    return {
      state,
      remoteState,
      output: "",
      error: "! [rejected] " + state.head + " -> " + state.head + " (non-fast-forward) — pull before pushing again",
    };
  }

  const reachable = ancestorSet(state.commits, [], localId);
  const existingIds = new Set(remoteState.commits.map((c) => c.id));
  const toCopy = state.commits.filter((c) => reachable.has(c.id) && !existingIds.has(c.id));

  const nextRemote = {
    branches: { ...remoteState.branches, [state.head]: localId },
    commits: [...remoteState.commits, ...toCopy],
  };

  return { state, remoteState: nextRemote, output: `${toCopy.length} commit(s) pushed to origin/${state.head}`, error: null };
}

// ---- git pull ---------------------------------------------------------------
// Preconditions (SIM-012): the remote must have a branch matching HEAD's
// name. Effect: fetches the remote branch's commits into the local commit
// pool, then merges (fast-forward or simple three-way, same rule as `git
// merge`) into the current branch.
function doPull(state, remoteState, args) {
  const remoteCommitId = remoteState.branches[state.head];
  if (!remoteCommitId) {
    return { state, remoteState, output: "", error: "There is no tracking information for the current branch." };
  }

  const existingIds = new Set(state.commits.map((c) => c.id));
  const reachable = ancestorSet(remoteState.commits, [], remoteCommitId);
  const toCopy = remoteState.commits.filter((c) => reachable.has(c.id) && !existingIds.has(c.id));
  const stateWithFetched = { ...state, commits: [...state.commits, ...toCopy] };

  const localId = stateWithFetched.branches[stateWithFetched.head];
  if (localId === remoteCommitId) return { state: stateWithFetched, remoteState, output: "Already up to date.", error: null };

  if (!localId || isAncestor(stateWithFetched.commits, [], localId, remoteCommitId)) {
    const commit = findCommitIn(stateWithFetched.commits, remoteCommitId);
    return {
      state: { ...stateWithFetched, branches: { ...stateWithFetched.branches, [stateWithFetched.head]: remoteCommitId }, workingDirectory: { ...commit.snapshot }, stagingArea: {} },
      remoteState,
      output: "Fast-forward",
      error: null,
    };
  }

  // Divergence: reuse merge's three-way logic by temporarily exposing the
  // fetched remote commit as a local branch pointer, then delegating.
  const tempBranch = `__pull_${state.head}`;
  const withTemp = { ...stateWithFetched, branches: { ...stateWithFetched.branches, [tempBranch]: remoteCommitId } };
  const merged = doMerge(withTemp, remoteState, [tempBranch]);
  if (merged.error) return { state, remoteState, output: "", error: merged.error };
  const cleanedBranches = { ...merged.state.branches };
  delete cleanedBranches[tempBranch];
  return { state: { ...merged.state, branches: cleanedBranches }, remoteState, output: merged.output, error: null };
}

// ---- git clone ---------------------------------------------------------------
// Preconditions (SIM-012): the local repository must be uninitialized (a
// clone targets a fresh directory); the remote must have at least one branch.
// Effect: copies the ENTIRE remote history (not just the latest snapshot)
// into a newly-initialized local repository, matching every remote branch,
// with HEAD on 'master' (or the remote's only branch if 'master' is absent).
function doClone(state, remoteState) {
  if (state.initialized) {
    return { state, remoteState, output: "", error: "fatal: destination path already exists and is not an empty directory" };
  }
  const remoteBranchNames = Object.keys(remoteState.branches);
  if (remoteBranchNames.length === 0) {
    return { state, remoteState, output: "", error: "fatal: remote repository is empty — nothing to clone" };
  }

  const headBranch = remoteBranchNames.includes("master") ? "master" : remoteBranchNames[0];
  const headCommitId = remoteState.branches[headBranch];
  const snapshot = headCommitId ? findCommitIn(remoteState.commits, headCommitId).snapshot : {};

  const nextState = {
    initialized: true,
    workingDirectory: { ...snapshot },
    stagingArea: {},
    commits: [...remoteState.commits],
    branches: { ...remoteState.branches },
    head: headBranch,
    commitSeq: remoteState.commits.reduce((max, c) => Math.max(max, c.seq), 0),
  };

  return { state: nextState, remoteState, output: `Cloning into '${headBranch}'... done.`, error: null };
}
