// Git Learning Lab — simulated terminal component (P2).
//
// UX skill §7: Up/Down recalls history, Enter submits, input/output are
// visually distinct, focus returns to the input after every command, and an
// unrecognized/precondition-failing command gets specific, legible feedback
// right in the terminal (never a silent no-op).
//
// SECURITY: `onCommand` is the ONLY thing ever invoked with the learner's
// text, and it is always shared/simulator-core.js's `applyCommand` (directly
// or via a thin wrapper) — never `eval`, never a real shell. This module
// itself contains no command-execution logic of its own (Engineering skill
// §10) — it only renders whatever applyCommand already decided.
//
// XSS (SEC-002): every piece of learner-controlled or simulator-derived text
// (typed commands, output, error text, file/branch/commit content) is
// rendered via `textContent`, never `innerHTML` — inert even if it contains
// HTML-looking characters.

import { t } from "./i18n.js";

export function createTerminal(container, { onCommand, ariaLabel = "Git command terminal" }) {
  const history = [];
  let historyIndex = -1;

  container.innerHTML = "";
  container.classList.add("terminal");

  const log = document.createElement("div");
  log.className = "terminal-log";
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");
  log.setAttribute("aria-label", ariaLabel + " output");

  const form = document.createElement("form");
  form.className = "terminal-form";
  form.setAttribute("aria-label", ariaLabel + " input");

  const prompt = document.createElement("span");
  prompt.className = "terminal-prompt";
  prompt.textContent = "$";
  prompt.setAttribute("aria-hidden", "true");

  const inputLabel = document.createElement("label");
  inputLabel.className = "sr-only";
  inputLabel.setAttribute("for", "terminal-input");
  inputLabel.textContent = t("terminalInputLabel");

  const input = document.createElement("input");
  input.type = "text";
  input.id = "terminal-input";
  input.className = "terminal-input";
  input.autocomplete = "off";
  input.spellcheck = false;

  const runBtn = document.createElement("button");
  runBtn.type = "submit";
  runBtn.className = "terminal-run-btn";
  runBtn.textContent = t("terminalRun");

  form.append(inputLabel, prompt, input, runBtn);
  container.append(log, form);

  function appendLine(text, className) {
    const line = document.createElement("div");
    line.className = className;
    line.textContent = text; // never innerHTML — SEC-002
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  function submit(commandText) {
    const trimmed = commandText.trim();
    if (!trimmed) return;

    appendLine(`$ ${trimmed}`, "terminal-line terminal-line--input");
    history.push(trimmed);
    historyIndex = history.length;

    const { output, error } = onCommand(trimmed);
    if (output) appendLine(output, "terminal-line terminal-line--output");
    if (error) appendLine(error, "terminal-line terminal-line--error");
    if (!output && !error) appendLine(t("terminalNoOutput"), "terminal-line terminal-line--output");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = "";
    submit(value);
    input.focus(); // UX skill §7: focus never silently lost after a command
  });

  // Mobile virtual-keyboard defensiveness (P4): on a normal mobile browser
  // the page already reflows enough to keep the focused input visible, but
  // some in-app browsers (e.g. Instagram's) let the keyboard overlap the
  // terminal instead. Scrolling the input into view on focus, and again
  // whenever the visual viewport actually resizes (the keyboard opening),
  // costs nothing on desktop (visualViewport rarely fires there) and does
  // not change any command-handling behavior.
  input.addEventListener("focus", () => {
    setTimeout(() => input.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      if (document.activeElement === input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      // Explicit, robust submission — some input methods don't reliably
      // trigger a form's implicit submission from a keydown alone.
      e.preventDefault();
      form.requestSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] ?? "";
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] ?? "";
    }
  });

  return {
    focus: () => input.focus(),
    printSystemMessage: (text) => appendLine(text, "terminal-line terminal-line--system"),
    runCommand: submit,
  };
}
