// Git Learning Lab — Progress panel (P2): PROG-003.
export async function renderProgressPanel(container, { api }) {
  container.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent = "Progress";
  container.appendChild(heading);

  const res = await api.getProgress();
  if (!res.ok) {
    container.appendChild(Object.assign(document.createElement("p"), { textContent: "Could not load progress right now." }));
    return;
  }

  if (res.data.progress.length === 0) {
    container.appendChild(Object.assign(document.createElement("p"), { textContent: "No progress recorded yet — start Module 3 to see it appear here." }));
    return;
  }

  const list = document.createElement("ul");
  list.className = "progress-list";
  res.data.progress.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.module_id}: ${p.status} (updated ${p.updated_at})`;
    list.appendChild(li);
  });
  container.appendChild(list);
}
