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

// P9: a small inline icon per zone (presentation-only, aria-hidden) so the
// four-zone identity (UX skill §9) is recognizable at a glance, not just by
// reading the label text. Kept as plain literal SVG markup (no learner data
// ever flows through this path — SEC-002 is about learner-supplied text,
// which never reaches innerHTML anywhere in this file).
const ZONE_ICON_PATHS = {
  working: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h5l1.5 1.8h6A1.5 1.5 0 0 1 18.5 8.3v6.2A1.5 1.5 0 0 1 17 16H4.5A1.5 1.5 0 0 1 3 14.5z"/>',
  staging: '<path d="M4 14 8 5h4l4 9"/><path d="M6.2 10.5h7.6"/>',
  local: '<circle cx="10" cy="6" r="2.4"/><circle cx="10" cy="15" r="2.4"/><path d="M10 8.4v4.2"/>',
  remote: '<path d="M10 3.5a5.7 5.7 0 0 1 0 13.4M10 3.5a5.7 5.7 0 0 0 0 13.4M4.3 10.2h11.4" /><ellipse cx="10" cy="10.2" rx="2.6" ry="5.7"/>',
};

function zoneIcon(kind) {
  const wrap = document.createElement("span");
  wrap.className = "vis-zone-icon";
  wrap.setAttribute("aria-hidden", "true");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  // Fixed, hardcoded path data only (ZONE_ICON_PATHS above) — never
  // learner-controlled text, so this narrow innerHTML use carries no
  // SEC-002 risk unlike commit/file text, which stays textContent-only.
  svg.innerHTML = ZONE_ICON_PATHS[kind] || "";
  wrap.appendChild(svg);
  return wrap;
}

function renderZone(kind, title, items, emptyText) {
  const zone = el("div", `vis-zone vis-zone--${kind}`);
  const titleEl = el("h4", "vis-zone-title");
  titleEl.appendChild(zoneIcon(kind));
  titleEl.appendChild(document.createTextNode(title));
  zone.appendChild(titleEl);
  if (items.length === 0) {
    zone.appendChild(el("p", "vis-empty", emptyText));
  } else {
    const list = el("ul", "vis-list");
    items.forEach((item) => list.appendChild(item));
    zone.appendChild(list);
  }
  return zone;
}

// Flow-arrow separator between zones (§12 — teaches Working → Staging →
// Local → Remote direction). Purely decorative, aria-hidden, never carries
// state; CSS rotates it to a downward chevron once the grid stacks to a
// single column on narrow viewports.
function flowArrow() {
  const wrap = el("div", "vis-flow-arrow");
  wrap.setAttribute("aria-hidden", "true");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.innerHTML = '<path d="M4 10h11M11 5.5 15.5 10 11 14.5"/>';
  wrap.appendChild(svg);
  return wrap;
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
    triggerUpdatePulse(container);
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
  grid.appendChild(renderZone("working", t("zoneWorkingDirectory"), workingItems, t("zoneEmptyWorking")));
  grid.appendChild(flowArrow());
  grid.appendChild(renderZone("staging", t("zoneStagingArea"), stagingItems, t("zoneEmptyStaging")));
  grid.appendChild(flowArrow());
  grid.appendChild(renderZone("local", t("zoneLocalRepository"), localItems, t("zoneEmptyLocal")));
  grid.appendChild(flowArrow());
  grid.appendChild(renderZone("remote", t("zoneRemoteRepository"), remoteItems, t("zoneEmptyRemote")));
  container.appendChild(grid);

  triggerUpdatePulse(container);
}

// Representational "Git state just changed" motion (P9 §12): a single
// gentle pulse on the whole visualizer surface after every render, rather
// than tracking which individual DOM node moved (which the four-zone
// contract's full-rerender-per-command architecture makes brittle to do
// literally). CSS's prefers-reduced-motion block already neutralizes the
// underlying animation, so no JS-side check is needed here.
function triggerUpdatePulse(container) {
  container.classList.remove("vis-updated");
  // Force a reflow so re-adding the class retriggers the CSS animation even
  // when two renders happen back-to-back with the class still present.
  void container.offsetWidth;
  container.classList.add("vis-updated");
}
