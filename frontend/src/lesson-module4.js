// Git Learning Lab — Module 4: Commits, History, Diff & Undoing Changes.
// Content derived strictly from docs/LEARNING_OBJECTIVES.md Module 4 /
// docs/Git & GitHub.pdf pp.90-101 (Engineering skill §9, §15).
import { createSimulatorWorkspace } from "./simulator-workspace.js";
import { section, p, codeLine, makeChecklistItem, STAGES, reinforcement } from "./lesson-helpers.js";
import { renderQuiz } from "./quiz-component.js";
import { renderChallenge } from "./challenge-component.js";
import { t } from "./i18n.js";

export function renderModule4(container, { api, user }) {
  container.innerHTML = "";
  container.appendChild(Object.assign(document.createElement("h2"), { textContent: t("moduleTitle4") }));

  container.appendChild(
    section(STAGES.explanation(), [
      p(
        'Commit คือสแนปช็อตที่บันทึกถาวร มี Commit ID เป็นแฮช SHA-1 (ในทางปฏิบัติมักอ้างอิงด้วย 7 ตัวอักษรแรก) ' +
          "แต่ละ Commit ใหม่จะมี Commit ก่อนหน้าเป็น Parent เสมอ"
      ),
      p('"git diff" แสดงบรรทัดที่ถูกลบ (-) และบรรทัดที่เพิ่มใหม่ (+) แยกจากกันให้เห็นความต่างชัดเจน'),
      p(
        '"git checkout <file>" (รูปแบบคืนค่าไฟล์) คืนค่าไฟล์ที่ยังไม่ commit กลับไปเป็นเวอร์ชันล่าสุดที่บันทึกไว้ ' +
          "โดยไม่ย้าย HEAD หรือสลับสาขา — ต่างจากรูปแบบสลับสาขาที่จะสอนใน Module 5"
      ),
      p(
        '"git reset" มี 3 โหมด ต่างกันที่ปลายทางของการเปลี่ยนแปลงที่ถูกยกเลิก: --soft (ไปที่ Staging Area), ' +
          "--mixed (ไปที่พื้นที่ทำงาน) และ --hard (ถูกทิ้งไปทั้งหมด)"
      ),
    ])
  );

  container.appendChild(
    section(STAGES.demonstration(), [
      p('กรณีสำคัญ: ถ้ายังไม่มีอะไรเตรียมไว้ใน Staging Area แล้วรัน commit ระบบจะปฏิเสธเสมอ แม้ข้อความจะถูกต้อง:'),
      codeLine('$ git commit -m "test"'),
      codeLine("nothing to commit, working tree clean"),
      p("ตัวอย่างการดูประวัติแบบมีโครงสร้างสาขา:"),
      codeLine("$ git log --graph --oneline"),
      codeLine("* a1b2c3d (HEAD -> master) second commit"),
      codeLine("* 9f8e7d6 first commit"),
    ])
  );

  const practiceGoal = p(
    'ฝึก: สร้างไฟล์ แล้ว commit อย่างน้อย 2 ครั้ง (แก้ไขไฟล์ระหว่างกลาง) จากนั้นลองใช้ "git log --oneline" หรือ ' +
      '"git log --graph" ดูประวัติ แล้วลองใช้ "git reset" โหมดใดก็ได้เพื่อย้อนกลับ commit ล่าสุด'
  );
  const checklist = document.createElement("ul");
  checklist.className = "practice-checklist";
  const checklistItems = {
    twoCommits: makeChecklistItem("สร้าง Commit อย่างน้อย 2 ครั้ง"),
    usedReset: makeChecklistItem('ใช้ "git reset" โหมดใดโหมดหนึ่งเพื่อย้อนกลับ Commit'),
  };
  Object.values(checklistItems).forEach((li) => checklist.appendChild(li.node));

  const feedback = document.createElement("p");
  feedback.className = "practice-feedback";
  feedback.setAttribute("role", "status");
  feedback.textContent = "ผลตอบรับจะแสดงที่นี่ขณะที่คุณลองพิมพ์คำสั่ง";

  const workspaceHost = document.createElement("div");
  let maxCommits = 0;
  let completedSent = false;

  createSimulatorWorkspace(workspaceHost, {
    onStateChange: (state) => {
      maxCommits = Math.max(maxCommits, state.commits.length);
      if (state.commits.length >= 2) checklistItems.twoCommits.markDone();
      if (maxCommits >= 2 && state.commits.length < maxCommits) checklistItems.usedReset.markDone();

      const twoCommitsDone = state.commits.length >= 2 || maxCommits >= 2;
      const resetDone = maxCommits >= 2 && state.commits.length < maxCommits;
      if (twoCommitsDone && resetDone) {
        feedback.textContent = "ฝึกสำเร็จ! คุณได้ commit หลายครั้งและใช้ reset ย้อนกลับประวัติแล้ว";
        if (!completedSent) {
          completedSent = true;
          api.postProgress("module-4", "completed").catch(() => {});
        }
      } else if (twoCommitsDone) {
        feedback.textContent = 'มี Commit ครบ 2 ครั้งแล้ว ลองใช้ "git log --oneline" ดูประวัติ แล้วใช้ "git reset" ย้อนกลับ';
      }
    },
  });

  container.appendChild(section(STAGES.practice(), [practiceGoal, checklist, workspaceHost]));
  container.appendChild(section(STAGES.feedback(), [feedback]));

  const quizHost = document.createElement("div");
  renderQuiz(quizHost, "module-4", { api, user });
  container.appendChild(section(t("navQuizzes"), [quizHost]));

  const challengeHost = document.createElement("div");
  renderChallenge(challengeHost, "challenge-module-4", { api });
  container.appendChild(section(t("navChallenges"), [challengeHost]));

  container.appendChild(
    reinforcement(
      [
        "commit สร้าง snapshot ถาวรที่มี Commit ID (SHA-1, มักอ้างด้วย 7 ตัวอักษรแรก) และ parent ชี้ไปยัง commit ก่อนหน้า",
        "reset สามโหมดส่งการเปลี่ยนแปลงไปคนละที่: --soft → Staging Area, --mixed → พื้นที่ทำงาน, --hard → ทิ้งไปเลย",
        "checkout <file> คืนค่าไฟล์ (ไม่ย้าย HEAD) ต่างจาก checkout <branch> ที่สลับสาขา (ย้าย HEAD) — สอนใน Module 5",
      ],
      'git commit -m "test" โดยไม่มีอะไร staged จะถูกปฏิเสธเสมอ แม้ข้อความจะถูกต้องก็ตาม'
    )
  );

  api.postProgress("module-4", "started").catch(() => {});
}
