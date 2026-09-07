// Git Learning Lab — shared lesson-rendering helpers (P3).
// Every command-teaching module (3-7) uses the same Explanation →
// Demonstration → Practice → Feedback stage markup (UX skill §6 protected
// Lesson Flow) — this file is the one place that renders a stage section, a
// paragraph, a demo code line, and a practice checklist item, so six lesson
// modules don't each duplicate the same DOM-building code.
import { t } from "./i18n.js";

export function section(titleText, bodyNodes) {
  const sec = document.createElement("section");
  sec.className = "lesson-stage";
  const h3 = document.createElement("h3");
  h3.textContent = titleText;
  sec.appendChild(h3);
  bodyNodes.forEach((n) => sec.appendChild(n));
  return sec;
}

export function p(text) {
  const el = document.createElement("p");
  el.textContent = text;
  return el;
}

export function codeLine(text) {
  const el = document.createElement("code");
  el.className = "demo-line";
  el.textContent = text;
  const wrap = document.createElement("div");
  wrap.appendChild(el);
  return wrap;
}

export function makeChecklistItem(labelText) {
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

/** Standard stage-title set (Thai-first, UX skill §6). */
export const STAGES = {
  explanation: () => t("stageExplanation"),
  demonstration: () => t("stageDemonstration"),
  practice: () => t("stagePractice"),
  feedback: () => t("stageFeedback"),
};

/**
 * P8 (Learning Reinforcement): a short end-of-module "จำให้ได้" summary plus
 * an optional common-mistake callout — lightweight, text-only reinforcement,
 * never gamification (points/badges/streaks are explicitly out of scope,
 * UX skill §27). Used by every lesson module (1-7) after its quiz/challenge
 * section.
 *
 * `mistakes` accepts either a single string (original P8 shape — rendered as
 * one italic line) or an array of strings (P12: a short "ข้อผิดพลาดที่พบบ่อย"
 * list, for modules where more than one distinct beginner mistake is worth
 * naming) — both render from the same reusable box, so callers pick whichever
 * shape actually fits the module's content instead of forcing every module
 * into one mistake.
 */
export function reinforcement(rememberItems, mistakes) {
  const box = document.createElement("div");
  box.className = "lesson-reinforcement";
  const heading = document.createElement("h4");
  heading.textContent = t("reinforcementHeading");
  box.appendChild(heading);

  const ul = document.createElement("ul");
  rememberItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });
  box.appendChild(ul);

  const mistakeList = Array.isArray(mistakes) ? mistakes.filter(Boolean) : mistakes ? [mistakes] : [];
  if (mistakeList.length === 1) {
    const mistake = document.createElement("p");
    mistake.className = "lesson-reinforcement-mistake";
    mistake.textContent = `${t("reinforcementMistakeLabel")} ${mistakeList[0]}`;
    box.appendChild(mistake);
  } else if (mistakeList.length > 1) {
    const label = document.createElement("p");
    label.className = "lesson-reinforcement-mistake-label";
    label.textContent = t("reinforcementMistakeLabel");
    box.appendChild(label);
    const mistakeUl = document.createElement("ul");
    mistakeUl.className = "lesson-reinforcement-mistakes";
    mistakeList.forEach((m) => {
      const li = document.createElement("li");
      li.textContent = m;
      mistakeUl.appendChild(li);
    });
    box.appendChild(mistakeUl);
  }
  return box;
}

/**
 * P12: a short end-of-module transition line ("บทถัดไปจะนำสิ่งนี้ไปใช้กับ...")
 * connecting this module's content to the next one — closes the abrupt jump
 * between modules without lengthening the lesson itself (one sentence).
 * Omitted on Module 7 (capstone, nothing comes after it).
 */
export function bridgeNote(text) {
  const box = document.createElement("div");
  box.className = "lesson-bridge";
  const label = document.createElement("strong");
  label.textContent = t("bridgeHeading") + " ";
  box.appendChild(label);
  box.appendChild(document.createTextNode(text));
  return box;
}

/**
 * P12: a small comparison table (e.g. the three `git reset` modes, or
 * push/pull/clone) — reuses the existing `.progress-table` styling (already
 * responsive: `overflow-x: auto` on its own wrapper, RESP-001/002) instead of
 * introducing a second table component. `headers` and each row in `rows` are
 * plain strings rendered via textContent (SEC-002).
 */
export function compareTable(headers, rows) {
  const wrap = document.createElement("table");
  wrap.className = "progress-table lesson-compare-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  wrap.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((cells) => {
    const tr = document.createElement("tr");
    cells.forEach((cellText) => {
      const td = document.createElement("td");
      td.textContent = cellText;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  wrap.appendChild(tbody);

  return wrap;
}
