// Git Learning Lab — Cheat Sheet (P2, Thai-first P3): CHEAT-001/002.
// Lists only commands actually implemented in shared/simulator-core.js, all
// traceable to docs/LEARNING_OBJECTIVES.md — no supplemental material (no
// git switch/restore/rebase/.gitignore/PR workflows). Grouped by learning
// purpose (Part G). Git commands themselves are never translated; the
// description column is Thai-first (Part A).
import { t } from "./i18n.js";

const GROUPS = [
  {
    titleKey: "cheatsheetGroupInit",
    commands: [["git init", "สร้าง Repository ใหม่ที่ว่างเปล่า"]],
  },
  {
    titleKey: "cheatsheetGroupFiles",
    commands: [
      ["git status", "แสดงว่าไฟล์แต่ละไฟล์อยู่ในสถานะ Untracked, Modified, Staged หรือ Committed"],
      ["git add <file>", "นำไฟล์ที่ระบุเข้าสู่ Staging Area"],
      ["git add .", "นำไฟล์ทุกไฟล์ในพื้นที่ทำงานเข้าสู่ Staging Area"],
      ["git add *.<ext>", "นำไฟล์ที่ตรงกับรูปแบบ (pattern) เข้าสู่ Staging Area"],
      ["git rm --cached <file>", "นำไฟล์ออกจาก Staging Area โดยไม่ลบออกจากดิสก์"],
    ],
  },
  {
    titleKey: "cheatsheetGroupCommit",
    commands: [
      ['git commit -m "<message>"', "บันทึกการเปลี่ยนแปลงที่เตรียมไว้เป็น Commit ใหม่"],
      ["git log", "แสดงประวัติ Commit ทั้งหมด เรียงจากล่าสุด"],
      ["git log --oneline", "แสดงประวัติ Commit แบบบรรทัดเดียวต่อ Commit"],
      ["git log --graph", "แสดงประวัติ Commit พร้อมโครงสร้างของสาขา (branch topology)"],
      ["git diff", "แสดงความต่างของไฟล์ที่ยังไม่ถูกเตรียม — บรรทัดที่ถูกลบและเพิ่มแยกกัน"],
    ],
  },
  {
    titleKey: "cheatsheetGroupUndo",
    commands: [
      ["git checkout <file>", "คืนค่าไฟล์กลับไปเป็นเวอร์ชันล่าสุดที่ Commit ไว้"],
      ["git reset --soft <commit>", "ย้ายตัวชี้ Commit กลับ — การเปลี่ยนแปลงที่ถูกยกเลิกจะไปอยู่ใน Staging Area"],
      ["git reset --mixed <commit>", "ย้ายตัวชี้ Commit กลับ — การเปลี่ยนแปลงที่ถูกยกเลิกจะไปอยู่ในพื้นที่ทำงาน (ไม่ staged)"],
      ["git reset --hard <commit>", "ย้ายตัวชี้ Commit กลับ — การเปลี่ยนแปลงที่ถูกยกเลิกจะถูกทิ้งไปทั้งหมด"],
    ],
  },
  {
    titleKey: "cheatsheetGroupBranch",
    commands: [
      ["git branch", "แสดงรายชื่อสาขาทั้งหมด"],
      ["git branch <name>", "สร้างสาขาใหม่ที่ Commit ปัจจุบัน โดยไม่ย้าย HEAD"],
      ["git branch -d <name>", "ลบตัวชี้สาขา (ไม่ลบ Commit ที่มันเคยชี้ไว้)"],
      ["git checkout <branch>", "ย้าย HEAD ไปยังอีกสาขาหนึ่ง"],
      ["git checkout -b <branch>", "สร้างสาขาใหม่แล้วย้าย HEAD ไปในขั้นตอนเดียว"],
      ["git merge <branch>", "รวมประวัติของอีกสาขาเข้ากับสาขาปัจจุบัน"],
    ],
  },
  {
    titleKey: "cheatsheetGroupRemote",
    commands: [
      ["git push", "ส่ง Commit จาก Local Repository ไปยัง Remote Repository จำลอง"],
      ["git pull", "ดึงและรวม Commit จาก Remote Repository เข้ากับ Local Repository"],
      ["git clone", "คัดลอกประวัติทั้งหมดของ Remote Repository มาเป็น Local Repository ใหม่"],
    ],
  },
];

export function renderCheatsheet(container) {
  container.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent = t("cheatsheetHeading");
  container.appendChild(heading);

  GROUPS.forEach((group) => {
    const groupHeading = document.createElement("h3");
    groupHeading.textContent = t(group.titleKey);
    container.appendChild(groupHeading);

    const table = document.createElement("table");
    table.className = "cheatsheet-table";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    [t("cheatsheetCommandCol"), t("cheatsheetDescCol")].forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    group.commands.forEach(([cmd, desc]) => {
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
  });
}
