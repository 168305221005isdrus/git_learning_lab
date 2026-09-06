// Git Learning Lab — Module 2: Git & GitHub Fundamentals.
// Conceptual module (docs/LEARNING_OBJECTIVES.md Module 2 / PDF pp.64-76).
// Practice is a conceptual classification activity (Git vs GitHub), not
// simulator/terminal practice — no Git commands are taught yet. No Challenge
// (CHAL-001: Modules 1-2 have no simulator challenge requirement).
import { section, p, STAGES } from "./lesson-helpers.js";
import { renderQuiz } from "./quiz-component.js";
import { t } from "./i18n.js";

const ITEMS = [
  { text: "เครื่องมือควบคุมเวอร์ชันที่ติดตั้งและทำงานอยู่บนเครื่องของคุณเอง", answer: "Git" },
  { text: "เว็บไซต์บริการโฮสต์ Repository ให้คนอื่นดูและร่วมงานได้ (เช่น เปิด Pull Request, Issue)", answer: "GitHub" },
  { text: "ทำงานและบันทึก Commit ได้แม้ไม่มีอินเทอร์เน็ตเลย", answer: "Git" },
  { text: "ต้องมีการเชื่อมต่ออินเทอร์เน็ตจึงจะเข้าถึงหน้าเว็บได้", answer: "GitHub" },
  { text: "เป็นระบบควบคุมเวอร์ชันแบบกระจาย (DVCS)", answer: "Git" },
  { text: "เป็นบริการที่ใช้โฮสต์ Repository ของ Git บนอินเทอร์เน็ต ไม่ใช่ตัว Git เอง", answer: "GitHub" },
];

function renderClassificationPractice(container, { onAllCorrect }) {
  const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
  const selections = new Array(shuffled.length).fill(null);
  const rows = [];

  const list = document.createElement("div");
  list.className = "classification-list";

  shuffled.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "classification-row";
    row.appendChild(Object.assign(document.createElement("span"), { className: "classification-text", textContent: item.text }));

    const group = document.createElement("div");
    group.className = "classification-options";
    ["Git", "GitHub"].forEach((option) => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `m2-classify-${index}`;
      radio.value = option;
      radio.addEventListener("change", () => (selections[index] = option));
      label.append(radio, document.createTextNode(" " + option));
      group.appendChild(label);
    });
    row.appendChild(group);

    const rowFeedback = document.createElement("span");
    rowFeedback.className = "classification-feedback";
    row.appendChild(rowFeedback);

    list.appendChild(row);
    rows.push({ item, rowFeedback });
  });
  container.appendChild(list);

  const checkBtn = document.createElement("button");
  checkBtn.type = "button";
  checkBtn.textContent = "ตรวจคำตอบ";
  const feedback = document.createElement("p");
  feedback.className = "practice-feedback";
  feedback.setAttribute("role", "status");

  checkBtn.addEventListener("click", () => {
    if (selections.some((s) => s === null)) {
      feedback.textContent = "กรุณาเลือกคำตอบให้ครบทุกข้อก่อน";
      return;
    }
    let correctCount = 0;
    rows.forEach(({ item, rowFeedback }, i) => {
      const correct = selections[i] === item.answer;
      if (correct) correctCount += 1;
      rowFeedback.textContent = correct ? "✓ ถูกต้อง" : `✖ ที่ถูกคือ ${item.answer}`;
    });
    const allCorrect = correctCount === rows.length;
    feedback.textContent = `ตอบถูก ${correctCount} จาก ${rows.length} ข้อ`;
    if (allCorrect && onAllCorrect) onAllCorrect();
  });

  container.appendChild(checkBtn);
  container.appendChild(feedback);
}

export function renderModule2(container, { api }) {
  container.innerHTML = "";
  container.appendChild(Object.assign(document.createElement("h2"), { textContent: t("moduleTitle2") }));

  container.appendChild(
    section(STAGES.explanation(), [
      p(
        "Git คือระบบควบคุมเวอร์ชันแบบกระจาย (DVCS) ที่ติดตามการเปลี่ยนแปลงของทุกตัวอักษร/บรรทัด/ไฟล์ พร้อมบันทึกว่าใครแก้ไข และเมื่อไร"
      ),
      p(
        "GitHub คือบริการเว็บที่ใช้โฮสต์ Repository ของ Git ให้คนอื่นเข้าถึงและร่วมงานได้ — GitHub ไม่ใช่ Git " +
          "Git ใช้งานได้แม้ไม่มี GitHub เลยก็ตาม"
      ),
      p(
        "หลักการทำงานของ Git: clone/copy Repository มาไว้ในเครื่อง → ทำงานแบบออฟไลน์ได้เต็มที่ → Check-In " +
          "(บันทึก) การเปลี่ยนแปลงเข้า Local Repository → ค่อย Sync (Pull/Merge/Push) กับ Remote ภายหลัง"
      ),
    ])
  );

  container.appendChild(
    section(STAGES.demonstration(), [
      p(
        '"Git vs. GitHub" — ลองนึกภาพ Git เหมือนโปรแกรมที่ทำงานอยู่ในเครื่องคุณ ส่วน GitHub เหมือนเว็บไซต์ที่เก็บสำเนา ' +
          "Repository ของคุณไว้ให้เพื่อนร่วมทีมเข้าถึงได้จากที่อื่น — คุณ commit งานลง Git ในเครื่องได้ตลอดเวลา " +
          "แม้ไม่ได้เชื่อมต่อ GitHub เลยก็ตาม แล้วค่อย push ขึ้นไปเมื่อพร้อม"
      ),
    ])
  );

  const practiceHost = document.createElement("div");
  const feedbackHost = document.createElement("p");
  feedbackHost.className = "practice-feedback";
  feedbackHost.setAttribute("role", "status");
  feedbackHost.textContent = 'จัดหมวดหมู่แต่ละข้อว่าเกี่ยวกับ "Git" หรือ "GitHub" แล้วกด "ตรวจคำตอบ"';

  renderClassificationPractice(practiceHost, {
    onAllCorrect: () => {
      feedbackHost.textContent = "เรียนจบหัวข้อนี้แล้ว! ลองทำแบบทดสอบด้านล่างเพื่อทบทวนความเข้าใจ";
      api.postProgress("module-2", "completed").catch(() => {});
    },
  });

  container.appendChild(section(STAGES.practice(), [practiceHost]));
  container.appendChild(section(STAGES.feedback(), [feedbackHost]));

  const quizHost = document.createElement("div");
  renderQuiz(quizHost, "module-2", { api });
  container.appendChild(section(t("navQuizzes"), [quizHost]));

  api.postProgress("module-2", "started").catch(() => {});
}
