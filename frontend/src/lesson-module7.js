// Git Learning Lab — Module 7: Integrated Git Workflow (Capstone).
// No new commands or concepts — pure synthesis of Modules 3-6
// (docs/LEARNING_OBJECTIVES.md Module 7). Assessment target is a Challenge
// only (a capstone quiz is Should-Have, not required, since Modules 1-6
// already assessed every underlying concept individually).
import { section, p, STAGES } from "./lesson-helpers.js";
import { renderChallenge } from "./challenge-component.js";
import { t } from "./i18n.js";

export function renderModule7(container, { api }) {
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

  api.postProgress("module-7", "started").catch(() => {});
}
