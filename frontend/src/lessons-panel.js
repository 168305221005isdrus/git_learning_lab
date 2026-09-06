// Git Learning Lab — Lessons panel (P2, expanded P3): module navigation.
//
// LEARN-001: every module from docs/LEARNING_OBJECTIVES.md is listed, in
// order, as a distinct unit. P3 implements real content for Modules 1, 2, 4,
// 5, 6 (Module 3 was P2's first real module; Module 7 is the capstone).
import { renderModule1 } from "./lesson-module1.js";
import { renderModule2 } from "./lesson-module2.js";
import { renderModule3 } from "./lesson-module3.js";
import { renderModule4 } from "./lesson-module4.js";
import { renderModule5 } from "./lesson-module5.js";
import { renderModule6 } from "./lesson-module6.js";
import { renderModule7 } from "./lesson-module7.js";
import { MODULES, moduleTitle } from "./modules-meta.js";
import { t } from "./i18n.js";

const RENDERERS = {
  "module-1": renderModule1,
  "module-2": renderModule2,
  "module-3": renderModule3,
  "module-4": renderModule4,
  "module-5": renderModule5,
  "module-6": renderModule6,
  "module-7": renderModule7,
};

export async function renderLessonsPanel(container, { api }) {
  container.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent = t("lessonsHeading");
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
      ? t("statusComingLater")
      : progressByModule[mod.id] === "completed"
      ? t("statusCompleted")
      : progressByModule[mod.id] === "started"
      ? t("statusStarted")
      : t("statusNotStarted");

    if (mod.implemented) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "module-open-btn";
      btn.textContent = moduleTitle(mod);
      btn.addEventListener("click", () => {
        RENDERERS[mod.id](detail, { api });
        detail.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      li.appendChild(btn);
    } else {
      const span = document.createElement("span");
      span.className = "module-title-disabled";
      span.textContent = moduleTitle(mod);
      li.appendChild(span);
    }

    const status = document.createElement("span");
    status.className = "module-status";
    status.textContent = ` — ${statusText}`;
    li.appendChild(status);

    list.appendChild(li);
  });
}
