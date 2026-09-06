// Git Learning Lab — Git-state visualizer (P2, extended P3).
//
// UX skill §9 (protected four-zone contract): Working Directory, Staging
// Area, Local Repository, and Remote Repository are rendered as four always
// distinct, always-labeled zones (VIS-001) — this function is the ONLY place
// that decides what goes in each zone, and it reads the shared simulator
// core's own state model (via computeStatus/buildCommitGraph) rather than
// re-deriving status independently (Engineering skill §6). Every piece of
// rendered text is set via textContent, never innerHTML (SEC-002 — commit
// messages/filenames are learner-supplied).
//
// P3 (VIS-003/004, Part F): the Local/Remote Repository zones now render
// EVERY commit reachable from ANY branch (via buildCommitGraph), not just
// the current branch's own chain — so a diverged Feature Branch, its own
// commits, HEAD's position, and a merge's two parents are all visible at
// once, not just decorative. Thai-first zone labels (Part A) keep the real
// English Git term alongside, per the P3 translation discipline.
import { computeStatus, buildCommitGraph } from "../../shared/simulator-core.js";
import { t } from "./i18n.js";

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

const STATUS_LABEL_KEY = {
  untracked: "fileStatusUntracked",
  modified: "fileStatusModified",
  staged: "fileStatusStaged",
  committed: "fileStatusCommitted",
};

function fileItem(path, label) {
  const li = el("li", `vis-file vis-file--${label}`);
  li.appendChild(el("span", "vis-file-path", path));
  li.appendChild(el("span", "vis-file-label", ` (${t(STATUS_LABEL_KEY[label])})`)); // never color-only (A11Y-003)
  return li;
}

/** Renders one row of buildCommitGraph()'s output — a commit plus whichever
 * branch names/HEAD point at it (VIS-003/004: real state, not decorative). */
function commitNode(node) {
  const { commit, branchNames, isHead } = node;
  const li = el("li", "vis-commit" + (isHead ? " vis-commit--head" : ""));
  li.appendChild(el("span", "vis-commit-id", commit.id.slice(0, 7)));
  if (commit.parentId2) li.appendChild(el("span", "vis-commit-merge-marker", " (merge)"));
  li.appendChild(el("span", "vis-commit-msg", ` ${commit.message}`));
  if (branchNames.length) {
    li.appendChild(el("span", "vis-branch-marker", ` [${branchNames.join(", ")}]`));
  }
  if (isHead) li.appendChild(el("span", "vis-head-marker", t("headMarker")));
  return li;
}

export function renderVisualizer(container, state, remoteState) {
  container.innerHTML = "";
  container.classList.add("visualizer");

  if (!state.initialized) {
    container.appendChild(el("p", "vis-empty", t("zoneEmptyWorking")));
    return;
  }

  const statusEntries = computeStatus(state);
  const workingItems = statusEntries.map((e) => fileItem(e.path, e.label));

  const stagingItems = Object.keys(state.stagingArea)
    .sort()
    .map((path) => fileItem(path, "staged"));

  const localItems = buildCommitGraph(state).map(commitNode);

  const remote = remoteState || { branches: {}, commits: [] };
  const remoteItems = buildCommitGraph(remote).map(commitNode);

  const header = el("p", "vis-branch-line");
  header.appendChild(el("span", null, t("branchLabel")));
  header.appendChild(el("strong", null, state.head));
  container.appendChild(header);

  const grid = el("div", "vis-grid");
  grid.appendChild(renderZone(t("zoneWorkingDirectory"), workingItems, t("zoneEmptyWorking")));
  grid.appendChild(renderZone(t("zoneStagingArea"), stagingItems, t("zoneEmptyStaging")));
  grid.appendChild(renderZone(t("zoneLocalRepository"), localItems, t("zoneEmptyLocal")));
  grid.appendChild(renderZone(t("zoneRemoteRepository"), remoteItems, t("zoneEmptyRemote")));
  container.appendChild(grid);
}
