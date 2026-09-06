// Git Learning Lab — Working Directory file editor (P2).
//
// This is NOT a Git command and is never routed through the terminal's
// parser (shared/simulator-core.js's SIM-014 grammar is unaffected) — it is
// the lesson/practice UI's own explicit way of simulating "editing a file in
// a text editor", the half of the workflow real Git doesn't itself provide.
// Calls shared/simulator-core.js's `writeFile` directly; never touches the
// DOM/state any other way.
import { writeFile } from "../../shared/simulator-core.js";

export function createFileEditor(container, { getState, onChange }) {
  container.innerHTML = "";
  container.classList.add("file-editor");

  const heading = document.createElement("h4");
  heading.textContent = "Working Directory file editor";
  container.appendChild(heading);

  const help = document.createElement("p");
  help.className = "file-editor-help";
  help.textContent = "This simulates using a text editor next to your terminal — it is not a Git command.";
  container.appendChild(help);

  const form = document.createElement("form");
  form.className = "file-editor-form";

  const nameLabel = document.createElement("label");
  nameLabel.textContent = "File name";
  nameLabel.setAttribute("for", "file-editor-name");
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.id = "file-editor-name";
  nameInput.placeholder = "e.g. app.js";
  nameInput.required = true;

  const contentLabel = document.createElement("label");
  contentLabel.textContent = "File content";
  contentLabel.setAttribute("for", "file-editor-content");
  const contentInput = document.createElement("textarea");
  contentInput.id = "file-editor-content";
  contentInput.rows = 3;

  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.textContent = "Save file";

  form.append(nameLabel, nameInput, contentLabel, contentInput, saveBtn);
  container.appendChild(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;
    const nextState = writeFile(getState(), name, contentInput.value);
    onChange(nextState);
  });
}
