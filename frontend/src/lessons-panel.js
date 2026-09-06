// Git Learning Lab — Lessons panel (P2): module navigation.
//
// LEARN-001: every module from docs/LEARNING_OBJECTIVES.md is listed, in
// order, as a distinct unit. Only Module 3 has real content this session —
// Modules 1, 2, 4-7 are honestly marked "content coming in a later phase",
// never marked complete (Engineering skill §21 scope discipline).
import { renderModule3 } from "./lesson-module3.js";

const MODULES = [
  { id: "module-1", title: "Module 1 — Version Control Foundations", implemented: false },
  { id: "module-2", title: "Module 2 — Git & GitHub Fundamentals", implemented: false },
  { id: "module-3", title: "Module 3 — The Git Workflow & Staging", implemented: true },
  { id: "module-4", title: "Module 4 — Commits, History, Diff & Undoing Changes", implemented: false },
  { id: "module-5", title: "Module 5 — Branching & Merging", implemented: false },
  { id: "module-6", title: "Module 6 — Remote Repositories: Push, Pull & Clone", implemented: false },
  { id: "module-7", title: "Module 7 — Integrated Git Workflow", implemented: false },
];

export async function renderLessonsPanel(container, { api }) {
  container.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent = "Lessons";
  container.appendChild(heading);

  const list = document.createElement("ul");
  list.className = "module-list";
  container.appendChild(list);

  const detail = document.createElement("div");
  detail.id = "module-detail";
  container.appendChild(detail);

  let progressByModule = {};
  const progressRes = await api.getProgress();
  if (progressRes.ok) {
    progressRes.data.progress.forEach((p) => {
      progressByModule[p.module_id] = p.status;
    });
  }

  MODULES.forEach((mod) => {
    const li = document.createElement("li");
    li.className = "module-list-item";

    const statusText = !mod.implemented
      ? "content coming in a later phase"
      : progressByModule[mod.id] === "completed"
      ? "completed"
      : progressByModule[mod.id] === "started"
      ? "in progress"
      : "not started";

    if (mod.implemented) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "module-open-btn";
      btn.textContent = mod.title;
      btn.addEventListener("click", () => {
        renderModule3(detail, { api });
        detail.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      li.appendChild(btn);
    } else {
      const span = document.createElement("span");
      span.className = "module-title-disabled";
      span.textContent = mod.title;
      li.appendChild(span);
    }

    const status = document.createElement("span");
    status.className = "module-status";
    status.textContent = ` — ${statusText}`;
    li.appendChild(status);

    list.appendChild(li);
  });
}
