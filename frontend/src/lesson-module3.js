// Git Learning Lab — Module 3: The Git Workflow & Staging (P2's first real
// hands-on lesson). Content derived strictly from docs/LEARNING_OBJECTIVES.md
// Module 3 / docs/Git & GitHub.pdf pp.77-89 — no command or term beyond that
// scope (Engineering skill §9, §15).
//
// UX skill §6 protected Lesson Flow: Explanation → Demonstration → Practice
// → Feedback. Practice uses the real simulator terminal (this module teaches
// actual Git commands, so conceptual-only practice does not apply here).
import { computeStatus } from "../../shared/simulator-core.js";
import { createSimulatorWorkspace } from "./simulator-workspace.js";

function section(titleText, bodyNodes) {
  const section = document.createElement("section");
  section.className = "lesson-stage";
  const h3 = document.createElement("h3");
  h3.textContent = titleText;
  section.appendChild(h3);
  bodyNodes.forEach((n) => section.appendChild(n));
  return section;
}

function p(text) {
  const el = document.createElement("p");
  el.textContent = text;
  return el;
}

function codeLine(text) {
  const el = document.createElement("code");
  el.className = "demo-line";
  el.textContent = text;
  const wrap = document.createElement("div");
  wrap.appendChild(el);
  return wrap;
}

export function renderModule3(container, { api }) {
  container.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = "Module 3 — The Git Workflow & Staging";
  container.appendChild(heading);

  // ---- Explanation ---------------------------------------------------------
  container.appendChild(
    section("Explanation", [
      p(
        "A file in your project moves through four stages: the Working Directory, " +
          "the Staging Area, the Local Repository, and (later) a Remote Repository."
      ),
      p(
        "A file's tracked status is one of three things: Modified (edited, not yet staged), " +
          "Staged (marked for the next commit), or Committed (durably recorded). " +
          '"git status" is how you check which one applies to each file right now.'
      ),
      p(
        '"git add" moves a file into the Staging Area. "git rm --cached" removes a file ' +
          "from the Staging Area without deleting it from the Working Directory."
      ),
    ])
  );

  // ---- Demonstration --------------------------------------------------------
  container.appendChild(
    section("Demonstration", [
      p("A worked example — try reading through it before you practice below:"),
      codeLine("$ git init"),
      codeLine("Initialized empty Git repository"),
      codeLine("$ git status"),
      codeLine("On branch master ... Untracked files: app.js"),
      codeLine("$ git add app.js"),
      codeLine("$ git status"),
      codeLine("Changes to be committed: staged: app.js"),
      codeLine("$ git rm --cached app.js"),
      codeLine("$ git status"),
      codeLine("Untracked files: app.js"),
      p("Notice: rm --cached returned the file to Untracked — it was never deleted from disk."),
    ])
  );

  // ---- Practice + Feedback ---------------------------------------------------
  const practiceGoal = p(
    "Practice goal: create a file, stage it with \"git add\", then remove it from tracking with " +
      '"git rm --cached" — watch it return to Untracked.'
  );

  const checklist = document.createElement("ul");
  checklist.className = "practice-checklist";
  const checklistItems = {
    untracked: makeChecklistItem("Create a file in the Working Directory (it should show as Untracked)."),
    staged: makeChecklistItem('Stage it with "git add <file>" (it should show as Staged).'),
    backToUntracked: makeChecklistItem('Run "git rm --cached <file>" (it should return to Untracked).'),
  };
  Object.values(checklistItems).forEach((li) => checklist.appendChild(li.node));

  const feedback = document.createElement("p");
  feedback.className = "practice-feedback";
  feedback.setAttribute("role", "status");
  feedback.textContent = "Feedback appears here as you try commands.";

  const workspaceHost = document.createElement("div");

  const progress = { reachedUntracked: false, reachedStaged: false, reachedBackToUntracked: false, completedSent: false };

  createSimulatorWorkspace(workspaceHost, {
    onStateChange: (state) => {
      const labels = computeStatus(state).map((e) => e.label);
      if (labels.includes("untracked")) {
        progress.reachedUntracked = true;
        checklistItems.untracked.markDone();
      }
      if (labels.includes("staged")) {
        progress.reachedStaged = true;
        checklistItems.staged.markDone();
      }
      if (progress.reachedStaged && labels.includes("untracked")) {
        progress.reachedBackToUntracked = true;
        checklistItems.backToUntracked.markDone();
      }

      if (progress.reachedUntracked && progress.reachedStaged && progress.reachedBackToUntracked) {
        feedback.textContent = "Practice complete! You've seen a file move Untracked → Staged → Untracked again.";
        if (!progress.completedSent) {
          progress.completedSent = true;
          api.postProgress("module-3", "completed").catch(() => {});
        }
      } else if (progress.reachedStaged) {
        feedback.textContent = 'Staged. Now try "git rm --cached <file>" to untrack it again.';
      } else if (progress.reachedUntracked) {
        feedback.textContent = 'Untracked file created. Now try "git add <file>" to stage it.';
      }
    },
  });

  container.appendChild(section("Practice", [practiceGoal, checklist, workspaceHost]));
  container.appendChild(section("Feedback", [feedback]));

  api.postProgress("module-3", "started").catch(() => {});
}

function makeChecklistItem(labelText) {
  const li = document.createElement("li");
  li.className = "checklist-item";
  const marker = document.createElement("span");
  marker.className = "checklist-marker";
  marker.textContent = "☐";
  const label = document.createElement("span");
  label.textContent = " " + labelText;
  li.append(marker, label);
  return {
    node: li,
    markDone() {
      marker.textContent = "☑"; // never color-only (A11Y-003) — the glyph itself changes
      li.classList.add("checklist-item--done");
    },
  };
}
