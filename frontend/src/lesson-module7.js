// Git Learning Lab — Module 7: Integrated Git Workflow (Capstone).
// No new commands or concepts — pure synthesis of Modules 3-6
// (docs/LEARNING_OBJECTIVES.md Module 7). Assessment target is a Challenge
// only (a capstone quiz is Should-Have, not required, since Modules 1-6
// already assessed every underlying concept individually).
import { section, p, STAGES, reinforcement } from "./lesson-helpers.js";
import { renderChallenge } from "./challenge-component.js";
import { renderQuiz } from "./quiz-component.js";
import { t } from "./i18n.js";

export function renderModule7(container, { api, user }) {
  container.innerHTML = "";
  container.appendChild(Object.assign(document.createElement("h2"), { textContent: t("moduleTitle7") }));

  container.appendChild(
    section(STAGES.explanation(), [
      p(
        "โมดูลนี้ไม่มีคำสั่งหรือแนวคิดใหม่ — เป็นการรวบยอดสิ่งที่เรียนมาทั้งหมดจาก Module 3 ถึง 6 " +
          "เข้าด้วยกันเป็นวงจรการทำงานจริงหนึ่งรอบ: เริ่ม Repository → เตรียมและ commit ไฟล์ → " +
          "สร้างและ merge Feature Branch → push ผลลัพธ์ไปยัง Remote"
      ),
      p("เป้าหมายคือทำทุกขั้นตอนด้วยตัวเองโดยไม่มีใครบอกทีละคำสั่ง — เลือกลำดับของคุณเองได้ ตราบใดที่ผลลัพธ์สุดท้ายถูกต้อง"),
    ])
  );

  container.appendChild(
    section(STAGES.demonstration(), [
      p(
        "ทบทวนสั้น ๆ: init/status/add/rm --cached (Module 3) → commit/log/diff/reset (Module 4) → " +
          "branch/checkout/merge (Module 5) → push/pull/clone (Module 6) — Capstone นี้ใช้ชุดคำสั่งเดียวกันทั้งหมด " +
          'ตรวจผลจากสถานะสุดท้ายของ Repository ไม่ใช่ลำดับคำสั่งที่ตายตัว (เหมือนที่ Git จริงยอมรับหลายวิธีไปสู่ผลลัพธ์เดียวกัน)'
      ),
    ])
  );

  const capstoneHost = document.createElement("div");
  renderChallenge(capstoneHost, "capstone-module-7", {
    api,
    onResult: ({ passed }) => {
      if (passed) api.postProgress("module-7", "completed").catch(() => {});
    },
  });
  container.appendChild(section(STAGES.practice() + " / " + STAGES.feedback(), [capstoneHost]));

  // P8: optional/enrichment capstone quiz (QUIZ-001b) — never required for
  // completion (shared/curriculum.js's module-7 entry keeps quizId: null;
  // this is a display-layer addition only, see shared/quiz-data.js's
  // "module-7" entry and modules-meta.js's OPTIONAL_QUIZ_IDS).
  const quizHost = document.createElement("div");
  renderQuiz(quizHost, "module-7", { api, user });
  container.appendChild(section(t("navQuizzes"), [quizHost]));

  container.appendChild(
    reinforcement(
      [
        "Capstone ไม่มีคำสั่งใหม่ — เป็นการรวบยอด init/add/commit (Module 3-4), branch/merge (Module 5), push (Module 6)",
        "ตรวจผลจากสถานะสุดท้ายของ Repository เสมอ ไม่ใช่ลำดับคำสั่งที่ตายตัว — มีหลายลำดับที่ถูกต้องได้",
        "ก่อน push ให้ทบทวนว่า merge สำเร็จแล้วจริงบน master ก่อนค่อยส่งขึ้น Remote",
      ],
      "ลืม push เป็นขั้นตอนสุดท้าย — merge ในเครื่องสำเร็จแล้วไม่ได้แปลว่า Remote Repository เห็นผลลัพธ์นั้นแล้ว"
    )
  );

  api.postProgress("module-7", "started").catch(() => {});
}
