// Git Learning Lab — Git-state visualizer (P2).
//
// UX skill §9 (protected four-zone contract): Working Directory, Staging
// Area, Local Repository, and Remote Repository are rendered as four always
// distinct, always-labeled zones (VIS-001) — this function is the ONLY place
// that decides what goes in each zone, and it reads the shared simulator
// core's own state model (via computeStatus) rather than re-deriving status
// independently (Engineering skill §6). Every piece of rendered text is set
// via textContent, never innerHTML (SEC-002 — commit messages/filenames are
// learner-supplied).
import { computeStatus } from "../../shared/simulator-core.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderZone(title, items, emptyText) {
  const zone = el("div", "vis-zone");
  zone.appendChild(el("h4", "vis-zone-title", title));
  if (items.length === 0) {
    zone.appendChild(el("p", "vis-empty", emptyText));
  } else {
    const list = el("ul", "vis-list");
    items.forEach((item) => list.appendChild(item));
    zone.appendChild(list);
  }
  return zone;
}

function fileItem(path, label) {
  const li = el("li", `vis-file vis-file--${label}`);
  li.appendChild(el("span", "vis-file-path", path));
  li.appendChild(el("span", "vis-file-label", ` (${label})`)); // never color-only (A11Y-003)
  return li;
}

function commitItem(commit, isHead) {
  const li = el("li", "vis-commit" + (isHead ? " vis-commit--head" : ""));
  li.appendChild(el("span", "vis-commit-id", commit.id.slice(0, 7)));
  li.appendChild(el("span", "vis-commit-msg", ` ${commit.message}`));
  if (isHead) li.appendChild(el("span", "vis-head-marker", " ← HEAD"));
  return li;
}

function commitChain(commits, headId) {
  const chain = [];
  let cur = headId;
  const seen = new Set();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const c = commits.find((x) => x.id === cur);
    if (!c) break;
    chain.push(c);
    cur = c.parentId;
  }
  return chain;
}

export function renderVisualizer(container, state, remoteState) {
  container.innerHTML = "";
  container.classList.add("visualizer");

  if (!state.initialized) {
    container.appendChild(el("p", "vis-empty", "Run \"git init\" to start a repository."));
    return;
  }

  const statusEntries = computeStatus(state);
  const workingItems = statusEntries.map((e) => fileItem(e.path, e.label));

  const stagingItems = Object.keys(state.stagingArea)
    .sort()
    .map((path) => fileItem(path, "staged"));

  const headId = state.branches[state.head];
  const localChain = commitChain(state.commits, headId);
  const localItems = localChain.map((c) => commitItem(c, c.id === headId));

  const remote = remoteState || { branches: {}, commits: [] };
  const remoteHeadId = remote.branches[state.head];
  const remoteChain = commitChain(remote.commits, remoteHeadId);
  const remoteItems = remoteChain.map((c) => commitItem(c, c.id === remoteHeadId));

  const header = el("p", "vis-branch-line");
  header.appendChild(el("span", null, "Branch: "));
  header.appendChild(el("strong", null, state.head));
  container.appendChild(header);

  const grid = el("div", "vis-grid");
  grid.appendChild(renderZone("Working Directory", workingItems, "No files yet."));
  grid.appendChild(renderZone("Staging Area", stagingItems, "Nothing staged."));
  grid.appendChild(renderZone("Local Repository", localItems, "No commits yet."));
  grid.appendChild(renderZone("Remote Repository", remoteItems, "Remote is empty until you push."));
  container.appendChild(grid);
}
