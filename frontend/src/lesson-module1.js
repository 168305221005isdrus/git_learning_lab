// Git Learning Lab — Module 1: Version Control Foundations.
// Conceptual module — no Git commands taught yet (docs/LEARNING_OBJECTIVES.md
// Module 1 / docs/Git & GitHub.pdf pp.2-63). Practice is a conceptual
// interactive activity (sequencing), not simulator/terminal practice, per
// UX skill §6's explicit allowance for Modules 1-2. No Challenge — nothing to
// simulate yet (CHAL-001).
import { section, p, STAGES } from "./lesson-helpers.js";
import { renderQuiz } from "./quiz-component.js";
import { t } from "./i18n.js";

const CANONICAL_ORDER = ["Copy File & Folder", "Patch", "Local VCS", "CVCS", "DVCS"];
const STAGE_LABELS = {
  "Copy File & Folder": "คัดลอกไฟล์และโฟลเดอร์ (Copy File & Folder) — สำรองงานด้วยการคัดลอกทั้งโฟลเดอร์ด้วยมือ",
  Patch: "ส่ง Patch — ส่งเฉพาะส่วนที่เปลี่ยนแปลงแทนที่จะส่งทั้งไฟล์",
  "Local VCS": "ระบบควบคุมเวอร์ชันแบบ Local (Local VCS) — เก็บประวัติการเปลี่ยนแปลงไว้ในเครื่องเดียว",
  CVCS: "ระบบควบคุมเวอร์ชันแบบรวมศูนย์ (CVCS) — ทุกคนเชื่อมต่อไปยังเซิร์ฟเวอร์กลางเพียงจุดเดียว",
  DVCS: "ระบบควบคุมเวอร์ชันแบบกระจาย (DVCS) — ทุกเครื่องมี Repository ที่สมบูรณ์ในตัวเอง เช่น Git",
};

function renderSequencingPractice(container, { onCorrect }) {
  const shuffled = [...CANONICAL_ORDER].sort(() => Math.random() - 0.5);
  const list = document.createElement("ol");
  list.className = "sequencing-list";

  function render() {
    list.innerHTML = "";
    shuffled.forEach((key, index) => {
      const li = document.createElement("li");
      li.className = "sequencing-item";
      li.appendChild(Object.assign(document.createElement("span"), { textContent: STAGE_LABELS[key] }));

      const upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.textContent = "▲";
      upBtn.setAttribute("aria-label", `เลื่อน "${key}" ขึ้น`);
      upBtn.disabled = index === 0;
      upBtn.addEventListener("click", () => {
        [shuffled[index - 1], shuffled[index]] = [shuffled[index], shuffled[index - 1]];
        render();
      });

      const downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.textContent = "▼";
      downBtn.setAttribute("aria-label", `เลื่อน "${key}" ลง`);
      downBtn.disabled = index === shuffled.length - 1;
      downBtn.addEventListener("click", () => {
        [shuffled[index], shuffled[index + 1]] = [shuffled[index + 1], shuffled[index]];
        render();
      });

      li.append(upBtn, downBtn);
      list.appendChild(li);
    });
  }
  render();
  container.appendChild(list);

  const checkBtn = document.createElement("button");
  checkBtn.type = "button";
  checkBtn.textContent = "ตรวจคำตอบ";
  const feedback = document.createElement("p");
  feedback.className = "practice-feedback";
  feedback.setAttribute("role", "status");

  checkBtn.addEventListener("click", () => {
    const isCorrect = shuffled.every((k, i) => k === CANONICAL_ORDER[i]);
    feedback.textContent = isCorrect
      ? "ถูกต้อง! นี่คือลำดับวิวัฒนาการของระบบควบคุมเวอร์ชัน"
      : "ยังไม่ถูกต้อง — ลองสังเกตว่าระบบแบบไหนต้องพึ่งเซิร์ฟเวอร์กลาง (CVCS) และแบบไหนที่แต่ละเครื่องมีสำเนาสมบูรณ์ (DVCS) แล้วลองจัดลำดับใหม่";
    feedback.classList.toggle("practice-feedback--correct", isCorrect);
    if (isCorrect && onCorrect) onCorrect();
  });

  container.appendChild(checkBtn);
  container.appendChild(feedback);
}

export function renderModule1(container, { api }) {
  container.innerHTML = "";
  container.appendChild(Object.assign(document.createElement("h2"), { textContent: t("moduleTitle1") }));

  container.appendChild(
    section(STAGES.explanation(), [
      p(
        "ระบบควบคุมเวอร์ชัน (Version Control / Source Control) คือเครื่องมือที่ติดตามการเปลี่ยนแปลงของไฟล์ตามเวลา " +
          "มันถูกสร้างขึ้นมาเพื่อแก้ปัญหาการสำรองไฟล์ด้วยมือที่สับสน เช่น การตั้งชื่อไฟล์ว่า projectv2_final_fix " +
          "และเพื่อให้ทีมทำงานร่วมกันโดยไม่เขียนทับงานของกันและกัน"
      ),
      p(
        "วิวัฒนาการของระบบควบคุมเวอร์ชันมี 5 ขั้น: คัดลอกไฟล์และโฟลเดอร์ (Copy File & Folder) → ส่ง Patch → " +
          "ระบบแบบ Local (Local VCS) → ระบบแบบรวมศูนย์ (CVCS) → ระบบแบบกระจาย (DVCS)"
      ),
      p(
        'ระบบ Local VCS ยุคแรกใช้คำว่า Check-In (บันทึกงานเข้าระบบ) และ Check-Out (ดึงงานออกมาแก้ไข) ' +
          "ซึ่งเป็นต้นแบบของแนวคิด Commit ในปัจจุบัน"
      ),
      p(
        "จุดอ่อนสำคัญของ CVCS คือมันมีเซิร์ฟเวอร์กลางเพียงจุดเดียว (single point of failure) — ถ้าเซิร์ฟเวอร์ล่ม ทุกคนทำงานต่อไม่ได้ " +
          "DVCS แก้ปัญหานี้โดยให้ทุกเครื่องมี Repository ที่สมบูรณ์ในตัวเอง (คัดลอก/clone มาทั้งหมด) จึงทำงานต่อได้แม้ออฟไลน์"
      ),
    ])
  );

  container.appendChild(
    section(STAGES.demonstration(), [
      p(
        'สถานการณ์: นักศึกษาคนหนึ่งเก็บวิทยานิพนธ์ไว้บนเซิร์ฟเวอร์กลางของมหาวิทยาลัยเพียงที่เดียว (แบบ CVCS) ' +
          "วันหนึ่งเซิร์ฟเวอร์ล่มกะทันหันและกู้คืนไม่ได้ นักศึกษาจึงทำงานต่อไม่ได้เลยจนกว่าเซิร์ฟเวอร์จะกลับมา"
      ),
      p(
        "ถ้าใช้ระบบแบบ DVCS แทน (เช่น Git) นักศึกษาจะมีสำเนา Repository ที่สมบูรณ์อยู่ในเครื่องตัวเองอยู่แล้ว " +
          "แม้เซิร์ฟเวอร์กลางจะล่ม งานและประวัติทั้งหมดก็ยังอยู่ครบในเครื่องของนักศึกษาเอง"
      ),
    ])
  );

  const practiceHost = document.createElement("div");
  const feedbackHost = document.createElement("p");
  feedbackHost.className = "practice-feedback";
  feedbackHost.setAttribute("role", "status");
  feedbackHost.textContent = "จัดลำดับ 5 ขั้นตอนให้ถูกต้อง แล้วกด \"ตรวจคำตอบ\"";

  renderSequencingPractice(practiceHost, {
    onCorrect: () => {
      feedbackHost.textContent = "เรียนจบหัวข้อนี้แล้ว! ลองทำแบบทดสอบด้านล่างเพื่อทบทวนความเข้าใจ";
      api.postProgress("module-1", "completed").catch(() => {});
    },
  });

  container.appendChild(section(STAGES.practice(), [practiceHost]));
  container.appendChild(section(STAGES.feedback(), [feedbackHost]));

  const quizHost = document.createElement("div");
  renderQuiz(quizHost, "module-1", { api });
  container.appendChild(section(t("navQuizzes"), [quizHost]));

  api.postProgress("module-1", "started").catch(() => {});
}
