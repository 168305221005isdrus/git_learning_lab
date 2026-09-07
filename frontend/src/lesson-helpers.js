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
 */
export function reinforcement(rememberItems, mistakeText) {
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

  if (mistakeText) {
    const mistake = document.createElement("p");
    mistake.className = "lesson-reinforcement-mistake";
    mistake.textContent = `${t("reinforcementMistakeLabel")} ${mistakeText}`;
    box.appendChild(mistake);
  }
  return box;
}
