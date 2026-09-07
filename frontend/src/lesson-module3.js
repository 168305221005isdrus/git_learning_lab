// Git Learning Lab — Module 3: The Git Workflow & Staging.
// Content derived strictly from docs/LEARNING_OBJECTIVES.md Module 3 /
// docs/Git & GitHub.pdf pp.77-89 — no command or term beyond that scope
// (Engineering skill §9, §15). Thai-first (P3 Part A); Git commands
// themselves are never translated.
//
// UX skill §6 protected Lesson Flow: Explanation → Demonstration → Practice
// → Feedback. Practice uses the real simulator terminal (this module teaches
// actual Git commands, so conceptual-only practice does not apply here).
// A Quiz and a Challenge follow the protected flow, per
// docs/LEARNING_OBJECTIVES.md's own Module 3 assessment target.
import { computeStatus } from "../../shared/simulator-core.js";
import { createSimulatorWorkspace } from "./simulator-workspace.js";
import { section, p, codeLine, makeChecklistItem, STAGES, reinforcement, bridgeNote } from "./lesson-helpers.js";
import { renderQuiz } from "./quiz-component.js";
import { renderChallenge } from "./challenge-component.js";
import { t } from "./i18n.js";
import { moduleTitle } from "./modules-meta.js";

export function renderModule3(container, { api, user }) {
  container.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = t("moduleTitle3");
  container.appendChild(heading);

  // ---- Explanation ---------------------------------------------------------
  container.appendChild(
    section(STAGES.explanation(), [
      p(
        "ไฟล์ในโปรเจกต์ของคุณจะเคลื่อนผ่าน 4 ขั้นตอน: พื้นที่ทำงาน (Working Directory), " +
          "พื้นที่เตรียม Commit (Staging Area), Repository ในเครื่อง (Local Repository) และ " +
          "(ในภายหลัง) Repository ระยะไกล (Remote Repository)"
      ),
      p(
        "สถานะการติดตามของไฟล์มี 3 แบบ: Modified (แก้ไขแล้วแต่ยังไม่ได้เตรียม), " +
          "Staged (เตรียมไว้สำหรับ Commit ครั้งถัดไป) และ Committed (บันทึกถาวรแล้ว) " +
          '"git status" คือเครื่องมือตรวจสอบว่าไฟล์แต่ละไฟล์อยู่ในสถานะใด ณ ขณะนั้น'
      ),
      p(
        "คำสั่งของ Module นี้ทีละคำสั่ง — แต่ละคำสั่งทำอะไร เปลี่ยนสถานะอย่างไร และข้อเข้าใจผิดที่พบบ่อย:"
      ),
      p('"git init" — เริ่มต้น Repository ในโฟลเดอร์ปัจจุบัน (ทำครั้งเดียวต่อโปรเจกต์) ' +
        "ก่อนหน้านี้ไฟล์ไม่มีสถานะ Git เลย หลังรันแล้วโฟลเดอร์จะเริ่มมีทั้ง 4 โซนให้ใช้งาน " +
        "ข้อเข้าใจผิดที่พบบ่อย: คิดว่าต้อง git init ทุกครั้งที่เปิดโปรเจกต์เดิม — ที่จริงทำครั้งเดียวพอ"),
      p('"git status" — ตรวจสอบว่าไฟล์แต่ละไฟล์อยู่ในสถานะใด (Untracked/Modified/Staged/Committed) ' +
        "ไม่เปลี่ยนสถานะของไฟล์ใดเลย เป็นแค่เครื่องมือ 'ดู' เท่านั้น " +
        "ข้อเข้าใจผิดที่พบบ่อย: คิดว่า git status ต้องรันก่อนคำสั่งอื่นเสมอ — ที่จริงรันเมื่อไรก็ได้เพื่อดูสถานะปัจจุบัน"),
      p('"git add <file>" นำไฟล์ที่ระบุเข้าสู่ Staging Area, "git add *.<นามสกุล>" นำไฟล์ตามรูปแบบเข้าไปพร้อมกัน, ' +
        '"git add ." นำทุกไฟล์ในพื้นที่ทำงานเข้าไปในครั้งเดียว — ทั้งสามแบบเปลี่ยนไฟล์จาก Untracked/Modified ให้เป็น Staged ' +
        "ข้อเข้าใจผิดที่พบบ่อย: คิดว่า git add บันทึกไฟล์ถาวรแล้ว — ที่จริงยังไม่ถาวรจนกว่าจะ commit"),
      p('"git rm --cached <file>" นำไฟล์ออกจากการติดตาม/Staging Area เท่านั้น ไฟล์จริงในพื้นที่ทำงานไม่ถูกแตะต้องเลย ' +
        "(ไฟล์จะกลับไปแสดงเป็น Untracked) " +
        'ข้อเข้าใจผิดที่พบบ่อย: กลัวว่า "git rm --cached" จะลบไฟล์ทิ้งจากเครื่อง — คำสั่งนี้ไม่ลบไฟล์จริงเด็ดขาด ' +
        '(คนละคำสั่งกับ "git rm" เฉยๆ ที่ไม่ได้อยู่ในขอบเขตบทเรียนนี้)'),
    ])
  );

  // ---- Demonstration --------------------------------------------------------
  container.appendChild(
    section(STAGES.demonstration(), [
      p("ตัวอย่างการใช้งานจริง — ลองอ่านให้เข้าใจก่อนฝึกด้านล่าง:"),
      codeLine("$ git init"),
      codeLine("Initialized empty Git repository"),
      codeLine("$ git status"),
      codeLine("On branch master ... Untracked files: app.js"),
      codeLine("$ git add app.js"),
      codeLine("$ git status"),
      codeLine("Changes to be committed: staged: app.js"),
      codeLine("$ git rm --cached app.js"),
      codeLine("$ git status"),
      codeLine("Untracked files: app.js"),
      p('สังเกต: "git rm --cached" ทำให้ไฟล์กลับไปเป็น Untracked — ไฟล์ไม่เคยถูกลบออกจากดิสก์เลย'),
    ])
  );

  // ---- Practice + Feedback ---------------------------------------------------
  const practiceGoal = p(
    'เป้าหมายการฝึก: สร้างไฟล์ 1 ไฟล์ แล้วเตรียมด้วย "git add" จากนั้นนำออกจากการติดตามด้วย ' +
      '"git rm --cached" — สังเกตว่ามันกลับไปเป็น Untracked'
  );
  const predictNote = p(
    'ก่อนพิมพ์แต่ละคำสั่ง ลองคิดก่อนว่า: "ไฟล์จะย้ายไปอยู่สถานะไหน?" แล้วค่อยรันดูใน Visualizer ว่าตรงกับที่คิดไว้หรือไม่'
  );
  predictNote.className = "practice-predict-note";

  const checklist = document.createElement("ul");
  checklist.className = "practice-checklist";
  const checklistItems = {
    untracked: makeChecklistItem("สร้างไฟล์ในพื้นที่ทำงาน (ควรแสดงเป็น Untracked)"),
    staged: makeChecklistItem('เตรียมไฟล์ด้วย "git add <file>" (ควรแสดงเป็น Staged)'),
    backToUntracked: makeChecklistItem('รัน "git rm --cached <file>" (ควรกลับไปเป็น Untracked)'),
  };
  Object.values(checklistItems).forEach((li) => checklist.appendChild(li.node));

  const feedback = document.createElement("p");
  feedback.className = "practice-feedback";
  feedback.setAttribute("role", "status");
  feedback.textContent = "ผลตอบรับจะแสดงที่นี่ขณะที่คุณลองพิมพ์คำสั่ง";

  const workspaceHost = document.createElement("div");

  const progress = { reachedUntracked: false, reachedStaged: false, reachedBackToUntracked: false, completedSent: false };

  createSimulatorWorkspace(workspaceHost, {
    onStateChange: (state) => {
      const labels = computeStatus(state).map((e) => e.label);
      if (labels.includes("untracked")) {
        progress.reachedUntracked = true;
        checklistItems.untracked.markDone();
      }
      if (labels.includes("staged")) {
        progress.reachedStaged = true;
        checklistItems.staged.markDone();
      }
      if (progress.reachedStaged && labels.includes("untracked")) {
        progress.reachedBackToUntracked = true;
        checklistItems.backToUntracked.markDone();
      }

      if (progress.reachedUntracked && progress.reachedStaged && progress.reachedBackToUntracked) {
        feedback.textContent = 'ฝึกสำเร็จ! คุณเห็นไฟล์เคลื่อนจาก Untracked → Staged → Untracked อีกครั้งแล้ว';
        if (!progress.completedSent) {
          progress.completedSent = true;
          api.postProgress("module-3", "completed").catch(() => {});
        }
      } else if (progress.reachedStaged) {
        feedback.textContent = 'เตรียมไฟล์แล้ว ลองรัน "git rm --cached <file>" เพื่อนำออกจากการติดตาม';
      } else if (progress.reachedUntracked) {
        feedback.textContent = 'สร้างไฟล์ Untracked แล้ว ลองรัน "git add <file>" เพื่อเตรียมไฟล์';
      }
    },
  });

  container.appendChild(section(STAGES.practice(), [practiceGoal, predictNote, checklist, workspaceHost]));
  container.appendChild(section(STAGES.feedback(), [feedback]));

  // ---- Quiz + Challenge -------------------------------------------------------
  const quizHost = document.createElement("div");
  renderQuiz(quizHost, "module-3", { api, user });
  container.appendChild(section(t("navQuizzes"), [quizHost]));

  const challengeHost = document.createElement("div");
  renderChallenge(challengeHost, "challenge-module-3", { api });
  container.appendChild(section(t("navChallenges"), [challengeHost]));

  container.appendChild(
    reinforcement(
      [
        "ไปป์ไลน์: Working Directory → Staging Area (git add) → Local Repository (git commit) → Remote Repository (git push)",
        "สถานะไฟล์มี 3 แบบ: Modified (แก้ไขแล้ว ยังไม่ staged), Staged (เตรียม commit แล้ว), Committed (บันทึกถาวรแล้ว)",
        "git rm --cached นำไฟล์ออกจากการติดตามเท่านั้น ไม่ลบไฟล์จริงออกจากดิสก์",
      ],
      [
        "คิดว่า git add บันทึกไฟล์ถาวรแล้ว — ที่จริงยังไม่ถาวรจนกว่าจะ commit (สอนใน Module 4)",
        "กลัวว่า git rm --cached จะลบไฟล์ทิ้งจากเครื่อง — ไม่ลบ ไฟล์ยังอยู่ในพื้นที่ทำงานเหมือนเดิม แค่หลุดจากการติดตาม",
      ]
    )
  );

  container.appendChild(
    bridgeNote(
      'โมดูลถัดไปจะพาไปทำให้การเปลี่ยนแปลงใน Staging Area นี้ "ถาวร" ด้วย git commit แล้วเรียนรู้วิธีย้อนกลับเมื่อทำผิดพลาด'
    )
  );

  api.postProgress("module-3", "started").catch(() => {});
}
