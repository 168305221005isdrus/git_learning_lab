// Git Learning Lab — Module 5: Branching & Merging.
// Content derived strictly from docs/LEARNING_OBJECTIVES.md Module 5 /
// docs/Git & GitHub.pdf pp.102-133 (Engineering skill §9, §15).
import { createSimulatorWorkspace } from "./simulator-workspace.js";
import { section, p, codeLine, makeChecklistItem, STAGES, reinforcement, bridgeNote } from "./lesson-helpers.js";
import { renderQuiz } from "./quiz-component.js";
import { renderChallenge } from "./challenge-component.js";
import { t } from "./i18n.js";

export function renderModule5(container, { api, user }) {
  container.innerHTML = "";
  container.appendChild(Object.assign(document.createElement("h2"), { textContent: t("moduleTitle5") }));

  container.appendChild(
    section(STAGES.explanation(), [
      p('"master" คือสาขาหลักที่ถูกสร้างขึ้นอัตโนมัติเมื่อ "git init" — Branch คือตัวชี้ (pointer) ไปยัง Commit หนึ่งเท่านั้น ไม่ใช่การคัดลอกไฟล์ทั้งโปรเจกต์'),
      p("HEAD คือตัวชี้ที่บอกว่าตอนนี้คุณอยู่ที่สาขา (หรือ commit) ใด — มันย้ายเมื่อคุณสลับสาขาด้วย checkout"),
      p("การ commit บน Feature Branch จะไม่ส่งผลต่อ master เลย จนกว่าจะมีการ merge กลับเข้าไปอย่างชัดเจน"),
      p(
        "การ merge แบบไม่ขัดแย้ง (non-conflicting) จะสำเร็จโดยอัตโนมัติ ส่วนแบบขัดแย้งต้องมีการตัดสินใจ " +
          "(เครื่องจำลองนี้ตรวจจับและรายงานความขัดแย้งได้ แต่ยังไม่รองรับการแก้ไขข้อขัดแย้งเอง)"
      ),
      p(
        "merge แบบไม่ขัดแย้งมี 2 ลักษณะที่ต่างกัน: ถ้า master ไม่มี Commit ใหม่เลยตั้งแต่แตกสาขาออกไป การ merge จะแค่ " +
          '"เลื่อนตัวชี้ master ตามไปที่ปลายของ feature" (fast-forward — ไม่มี Commit รวมใหม่เกิดขึ้น) ' +
          "แต่ถ้า master มี Commit ใหม่ของตัวเองด้วย (แตกสายจริง) การ merge จะสร้าง Commit ใหม่ที่มี 2 Parent " +
          '(สังเกตได้จากป้าย "(merge)" ใน Local Repository)'
      ),
    ])
  );

  container.appendChild(
    section(STAGES.demonstration(), [
      p("ตัวอย่างจาก PDF: สร้าง Feature Branch, commit บนสาขานั้น, กลับมาที่ master แล้ว merge:"),
      codeLine("$ git checkout -b feature"),
      codeLine("Switched to a new branch 'feature'"),
      codeLine('$ git add bugfix.js && git commit -m "fix bug"'),
      codeLine("$ git checkout master"),
      codeLine("$ git merge feature"),
      codeLine("Merge made by the 'recursive' strategy."),
    ])
  );

  const practiceGoal = p(
    "ฝึก: สร้างสาขาใหม่ (feature), แก้ไข/commit บนสาขานั้น, กลับมาที่ master แล้ว commit อีกอย่างหนึ่งด้วย " +
      "(ให้ประวัติแตกออกจริง) จากนั้น merge feature กลับเข้า master แล้วสังเกตกราฟใน Local Repository"
  );
  const checklist = document.createElement("ul");
  checklist.className = "practice-checklist";
  const checklistItems = {
    branchCreated: makeChecklistItem('สร้างสาขาใหม่ด้วย "git branch" หรือ "git checkout -b"'),
    merged: makeChecklistItem("Merge สาขานั้นกลับเข้า master สำเร็จ (เห็น Commit ที่มีสองพาเรนต์ในกราฟ)"),
  };
  Object.values(checklistItems).forEach((li) => checklist.appendChild(li.node));

  const feedback = document.createElement("p");
  feedback.className = "practice-feedback";
  feedback.setAttribute("role", "status");
  feedback.textContent = "ผลตอบรับจะแสดงที่นี่ขณะที่คุณลองพิมพ์คำสั่ง";

  const workspaceHost = document.createElement("div");
  let completedSent = false;

  createSimulatorWorkspace(workspaceHost, {
    onStateChange: (state) => {
      const branchCreated = Object.keys(state.branches).length > 1;
      const merged = state.commits.some((c) => c.parentId2);
      if (branchCreated) checklistItems.branchCreated.markDone();
      if (merged) checklistItems.merged.markDone();

      if (branchCreated && merged) {
        feedback.textContent = "ฝึกสำเร็จ! คุณสร้างสาขา แก้ไขคู่ขนาน แล้ว merge กลับสำเร็จแล้ว — ลองดูกราฟใน Local Repository";
        if (!completedSent) {
          completedSent = true;
          api.postProgress("module-5", "completed").catch(() => {});
        }
      } else if (branchCreated) {
        feedback.textContent = 'สร้างสาขาแล้ว ลอง commit บนแต่ละสาขาแยกกัน แล้วกลับมา master เพื่อ "git merge <branch>"';
      }
    },
  });

  container.appendChild(section(STAGES.practice(), [practiceGoal, checklist, workspaceHost]));
  container.appendChild(section(STAGES.feedback(), [feedback]));

  const quizHost = document.createElement("div");
  renderQuiz(quizHost, "module-5", { api, user });
  container.appendChild(section(t("navQuizzes"), [quizHost]));

  const challengeHost = document.createElement("div");
  renderChallenge(challengeHost, "challenge-module-5", { api });
  container.appendChild(section(t("navChallenges"), [challengeHost]));

  container.appendChild(
    reinforcement(
      [
        "Branch คือตัวชี้ (pointer) ไปยัง commit หนึ่ง — ไม่ใช่การคัดลอกไฟล์ทั้งโปรเจกต์",
        "HEAD ชี้ตำแหน่งปัจจุบันเสมอ และย้ายเมื่อสลับสาขาด้วย checkout",
        "merge ต้องอยู่บนสาขาที่จะ 'รับ' การรวมเข้า (เช่น master) ก่อนสั่ง merge สาขาอื่นเข้ามา",
      ],
      [
        "สั่ง git merge feature ขณะยังอยู่บนสาขา feature เอง — ต้อง checkout master ก่อนเสมอจึงจะรวมเข้ามาที่ master ได้จริง",
        "คิดว่า git branch <name> คัดลอกไฟล์ทั้งโปรเจกต์ไปอีกชุด — ที่จริงมันแค่สร้างตัวชี้ใหม่ ไม่มีการคัดลอกไฟล์เลย",
      ]
    )
  );

  container.appendChild(
    bridgeNote(
      "โมดูลถัดไปจะนำ Local Repository ที่มี Branch/Merge นี้ไปซิงก์กับ Remote Repository ด้วย push, pull และ clone"
    )
  );

  api.postProgress("module-5", "started").catch(() => {});
}
