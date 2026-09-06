// Git Learning Lab — Cheat Sheet (P2): CHEAT-001/002.
// Lists only commands actually implemented in shared/simulator-core.js, all
// traceable to docs/LEARNING_OBJECTIVES.md — no supplemental material.
const COMMANDS = [
  ["git init", "Creates a new, empty Git repository."],
  ["git status", "Shows which files are Untracked, Modified, Staged, or Committed."],
  ["git add <file>", "Stages a specific file."],
  ["git add .", "Stages every file in the Working Directory."],
  ["git add *.<ext>", "Stages every file matching a pattern."],
  ["git rm --cached <file>", "Removes a file from the Staging Area without deleting it from disk."],
  ["git commit -m \"<message>\"", "Records staged changes as a new commit."],
  ["git log", "Lists commit history, most recent first."],
  ["git log --oneline", "Lists commit history, one line per commit."],
  ["git diff", "Shows unstaged changes, removed lines vs. added lines."],
  ["git checkout <file>", "Reverts a file to its last committed version."],
  ["git reset --soft <commit>", "Moves the branch pointer back; undone changes become Staged."],
  ["git reset --mixed <commit>", "Moves the branch pointer back; undone changes become unstaged."],
  ["git reset --hard <commit>", "Moves the branch pointer back; undone changes are discarded."],
  ["git branch", "Lists branches."],
  ["git branch <name>", "Creates a new branch pointer at the current commit."],
  ["git branch -d <name>", "Deletes a branch pointer (not the commits it pointed to)."],
  ["git checkout <branch>", "Switches HEAD to another branch."],
  ["git checkout -b <branch>", "Creates and switches to a new branch in one step."],
  ["git merge <branch>", "Combines another branch's history into the current branch."],
  ["git push", "Sends local commits to the simulated Remote Repository."],
  ["git pull", "Fetches and merges Remote Repository commits into the local repository."],
  ["git clone", "Copies a Remote Repository's full history into a fresh local repository."],
];

export function renderCheatsheet(container) {
  container.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent = "Cheat Sheet";
  container.appendChild(heading);

  const table = document.createElement("table");
  table.className = "cheatsheet-table";
  const thead = document.createElement("thead");
  thead.innerHTML = ""; // structural only, no dynamic content
  const headRow = document.createElement("tr");
  ["Command", "What it does"].forEach((t) => {
    const th = document.createElement("th");
    th.textContent = t;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  COMMANDS.forEach(([cmd, desc]) => {
    const row = document.createElement("tr");
    const cmdCell = document.createElement("td");
    const code = document.createElement("code");
    code.textContent = cmd;
    cmdCell.appendChild(code);
    const descCell = document.createElement("td");
    descCell.textContent = desc;
    row.append(cmdCell, descCell);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}
