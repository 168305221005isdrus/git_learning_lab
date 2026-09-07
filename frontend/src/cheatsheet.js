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
    zoneKey: "cheatsheetZoneInit",
    commands: [["git init", "สร้าง Repository ใหม่ที่ว่างเปล่า", "ใช้ครั้งเดียวตอนเริ่มโปรเจกต์ใหม่ ก่อนคำสั่ง Git อื่นใดทั้งหมด"]],
  },
  {
    titleKey: "cheatsheetGroupFiles",
    zoneKey: "cheatsheetZoneFiles",
    commands: [
      ["git status", "แสดงว่าไฟล์แต่ละไฟล์อยู่ในสถานะ Untracked, Modified, Staged หรือ Committed", "ใช้บ่อย ๆ เพื่อตรวจสอบสถานะก่อนจะ add หรือ commit ทุกครั้งที่ไม่แน่ใจ"],
      ["git add <file>", "นำไฟล์ที่ระบุเข้าสู่ Staging Area", "ใช้เมื่อแก้ไฟล์เสร็จเฉพาะไฟล์นั้น ๆ และพร้อมเตรียม commit"],
      ["git add .", "นำไฟล์ทุกไฟล์ในพื้นที่ทำงานเข้าสู่ Staging Area", "ใช้เมื่อต้องการเตรียมทุกการเปลี่ยนแปลงในโฟลเดอร์ทั้งหมดพร้อมกัน"],
      ["git add *.<ext>", "นำไฟล์ที่ตรงกับรูปแบบ (pattern) เข้าสู่ Staging Area", "ใช้เมื่อต้องการเตรียมเฉพาะไฟล์ประเภทเดียว เช่น *.css โดยไม่แตะไฟล์อื่น"],
      ["git rm --cached <file>", "นำไฟล์ออกจาก Staging Area โดยไม่ลบออกจากดิสก์", "ใช้เมื่อ add ไฟล์ผิดพลาดไปแล้ว และยังไม่อยากให้ไฟล์นั้นถูกติดตาม"],
    ],
  },
  {
    titleKey: "cheatsheetGroupCommit",
    zoneKey: "cheatsheetZoneCommit",
    commands: [
      ['git commit -m "<message>"', "บันทึกการเปลี่ยนแปลงที่เตรียมไว้เป็น Commit ใหม่", "ใช้เมื่อ Staging Area พร้อมแล้ว และต้องการบันทึกเป็นจุดถาวรในประวัติ"],
      ["git log", "แสดงประวัติ Commit ทั้งหมด เรียงจากล่าสุด", "ใช้เมื่อต้องการดูรายละเอียดเต็มของแต่ละ Commit (ผู้เขียน เวลา ข้อความ)"],
      ["git log --oneline", "แสดงประวัติ Commit แบบบรรทัดเดียวต่อ Commit", "ใช้เมื่อต้องการภาพรวมประวัติแบบย่อ อ่านเร็ว หา Commit ID ได้ทันที"],
      ["git log --graph", "แสดงประวัติ Commit พร้อมโครงสร้างของสาขา (branch topology)", "ใช้เมื่อมีหลายสาขาและอยากเห็นว่าสาขาไหนแตกออกไป/รวมกลับมาตรงไหน"],
      ["git diff", "แสดงความต่างของไฟล์ที่ยังไม่ถูกเตรียม — บรรทัดที่ถูกลบและเพิ่มแยกกัน", "ใช้ก่อน add เพื่อตรวจทานสิ่งที่แก้ไปจริง ๆ ก่อนเตรียม commit"],
    ],
  },
  {
    titleKey: "cheatsheetGroupUndo",
    zoneKey: "cheatsheetZoneUndo",
    commands: [
      ["git checkout <file>", "คืนค่าไฟล์กลับไปเป็นเวอร์ชันล่าสุดที่ Commit ไว้", "ใช้เมื่อแก้ไฟล์ผิดพลาดและยังไม่ได้ add — ต้องการทิ้งการแก้ไขนั้นทั้งหมด"],
      ["git reset --soft <commit>", "ย้ายตัวชี้ Commit กลับ — การเปลี่ยนแปลงที่ถูกยกเลิกจะไปอยู่ใน Staging Area", "ใช้เมื่อ commit ผิดพลาดแต่อยากแก้ข้อความ/commit ใหม่ทันทีโดยไม่ต้อง add ซ้ำ"],
      ["git reset --mixed <commit>", "ย้ายตัวชี้ Commit กลับ — การเปลี่ยนแปลงที่ถูกยกเลิกจะไปอยู่ในพื้นที่ทำงาน (ไม่ staged)", "ใช้เมื่อต้องการยกเลิก commit แต่ยังอยากแก้ไขไฟล์เพิ่มก่อนจะ add ใหม่"],
      ["git reset --hard <commit>", "ย้ายตัวชี้ Commit กลับ — การเปลี่ยนแปลงที่ถูกยกเลิกจะถูกทิ้งไปทั้งหมด", "ใช้เฉพาะเมื่อแน่ใจว่าต้องการทิ้งการเปลี่ยนแปลงนั้นถาวร ไม่ต้องเก็บที่ใดเลย"],
    ],
  },
  {
    titleKey: "cheatsheetGroupBranch",
    zoneKey: "cheatsheetZoneBranch",
    commands: [
      ["git branch", "แสดงรายชื่อสาขาทั้งหมด", "ใช้เพื่อดูว่ามีสาขาอะไรบ้าง และกำลังอยู่ที่สาขาไหน"],
      ["git branch <name>", "สร้างสาขาใหม่ที่ Commit ปัจจุบัน โดยไม่ย้าย HEAD", "ใช้เมื่อต้องการเตรียมสาขาไว้ล่วงหน้าแต่ยังไม่สลับไปทำงานทันที"],
      ["git branch -d <name>", "ลบตัวชี้สาขา (ไม่ลบ Commit ที่มันเคยชี้ไว้)", "ใช้หลัง merge สาขานั้นเข้ากับ master เรียบร้อยแล้วและไม่ใช้งานต่อ"],
      ["git checkout <branch>", "ย้าย HEAD ไปยังอีกสาขาหนึ่ง", "ใช้เมื่อต้องการสลับไปทำงานที่สาขาอื่นที่มีอยู่แล้ว"],
      ["git checkout -b <branch>", "สร้างสาขาใหม่แล้วย้าย HEAD ไปในขั้นตอนเดียว", "ใช้เมื่อต้องการเริ่มฟีเจอร์ใหม่ทันที ไม่ต้องแยกสองคำสั่ง"],
      ["git merge <branch>", "รวมประวัติของอีกสาขาเข้ากับสาขาปัจจุบัน", "ใช้เมื่ออยู่บนสาขาที่จะ 'รับ' การเปลี่ยนแปลง (เช่น master) และพร้อมรวมงานจากสาขาอื่นแล้ว"],
    ],
  },
  {
    titleKey: "cheatsheetGroupRemote",
    zoneKey: "cheatsheetZoneRemote",
    commands: [
      ["git push", "ส่ง Commit จาก Local Repository ไปยัง Remote Repository จำลอง", "ใช้เมื่อ commit ในเครื่องพร้อมแล้ว และต้องการให้ทีมอื่นเห็นงานนี้"],
      ["git pull", "ดึงและรวม Commit จาก Remote Repository เข้ากับ Local Repository", "ใช้ก่อน push ทุกครั้งที่สงสัยว่า Remote อาจมีงานใหม่ที่เรายังไม่มี"],
      ["git clone", "คัดลอกประวัติทั้งหมดของ Remote Repository มาเป็น Local Repository ใหม่", "ใช้ตอนเริ่มทำงานกับโปรเจกต์ที่มีอยู่แล้วบน Remote เป็นครั้งแรก"],
    ],
  },
];

export function renderCheatsheet(container) {
  container.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent = t("cheatsheetHeading");
  container.appendChild(heading);

  const intro = document.createElement("p");
  intro.className = "cheatsheet-intro";
  intro.textContent = t("cheatsheetIntro");
  container.appendChild(intro);

  GROUPS.forEach((group) => {
    const groupHeading = document.createElement("h3");
    groupHeading.textContent = t(group.titleKey);
    container.appendChild(groupHeading);

    if (group.zoneKey) {
      const zoneNote = document.createElement("p");
      zoneNote.className = "cheatsheet-zone-note";
      zoneNote.textContent = t(group.zoneKey);
      container.appendChild(zoneNote);
    }

    const table = document.createElement("table");
    table.className = "cheatsheet-table";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    [t("cheatsheetCommandCol"), t("cheatsheetDescCol"), t("cheatsheetWhenCol")].forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    group.commands.forEach(([cmd, desc, whenTo]) => {
      const row = document.createElement("tr");
      const cmdCell = document.createElement("td");
      const code = document.createElement("code");
      code.textContent = cmd;
      cmdCell.appendChild(code);
      const descCell = document.createElement("td");
      descCell.textContent = desc;
      const whenCell = document.createElement("td");
      whenCell.textContent = whenTo || "";
      row.append(cmdCell, descCell, whenCell);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  });
}
