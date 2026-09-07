// Git Learning Lab — Module 6: Remote Repositories (Push, Pull & Clone).
// Content derived strictly from docs/LEARNING_OBJECTIVES.md Module 6 /
// docs/Git & GitHub.pdf pp.134-137 (Engineering skill §9, §15).
//
// Scope note (documented simplification, not a silent shortcut): the
// two-machine explanation below is presented conceptually (Machine A /
// Remote / Machine B) via narrative text, not as two simultaneously-driven
// terminal instances — the locked P2 simulator-workspace architecture models
// one local repository + one remote per workspace instance, and building
// genuine dual-terminal synchronized state is a real architecture expansion,
// not a copy change (Engineering skill §22 STOP: architecture changes are
// raised, not silently built). The hands-on Practice below still exercises
// real push against a real simulated remote, and the Module 6 Challenge
// (challenge-module-6) exercises a real clone with full history.
import { createSimulatorWorkspace } from "./simulator-workspace.js";
import { writeFile, createInitialState, createInitialRemoteState, applyCommand } from "../../shared/simulator-core.js";
import { section, p, codeLine, makeChecklistItem, STAGES, reinforcement } from "./lesson-helpers.js";
import { renderQuiz } from "./quiz-component.js";
import { renderChallenge } from "./challenge-component.js";
import { t } from "./i18n.js";

function seededStartingState() {
  let state = createInitialState();
  state = applyCommand(state, "git init").state;
  state = writeFile(state, "site.html", "hello");
  state = applyCommand(state, "git add site.html").state;
  state = applyCommand(state, 'git commit -m "first version"').state;
  return { state, remoteState: createInitialRemoteState() };
}

export function renderModule6(container, { api, user }) {
  container.innerHTML = "";
  container.appendChild(Object.assign(document.createElement("h2"), { textContent: t("moduleTitle6") }));

  container.appendChild(
    section(STAGES.explanation(), [
      p(
        "Local Repository และ Remote Repository เป็นกราฟ Commit ที่เป็นอิสระต่อกันอย่างแท้จริง " +
          "จนกว่าจะมีการ sync กันอย่างชัดเจน (ตรงกับหลักการ DVCS ที่เรียนใน Module 2)"
      ),
      p('"git push" ส่ง Commit จาก Local Repository ไปยัง Remote Repository'),
      p('"git pull" ดึง Commit ใหม่จาก Remote Repository เข้ามา แล้วรวม (merge) เข้ากับสาขาปัจจุบันในเครื่อง'),
      p('"git clone" คัดลอกทั้ง Repository — รวมถึงประวัติ Commit ทั้งหมด ไม่ใช่แค่ไฟล์เวอร์ชันล่าสุด — มาเป็น Local Repository ใหม่'),
    ])
  );

  container.appendChild(
    section(STAGES.demonstration(), [
      p("ลองจินตนาการสองเครื่อง (Machine A และ Machine B) ที่ใช้ Remote Repository เดียวกัน:"),
      codeLine("[Machine A] $ git push          # ส่งงานของ A ขึ้น Remote"),
      codeLine("[Machine B] $ git pull          # B ดึงงานของ A เข้ามารวมกับของตัวเอง"),
      codeLine("[Machine B ใหม่] $ git clone     # เครื่องใหม่คัดลอกประวัติทั้งหมดจาก Remote ไปเริ่มงานต่อ"),
      p("งานของ A จะไม่ปรากฏที่ B จนกว่า A จะ push และ B จะ pull — Remote คือจุดกลางที่ทั้งสองฝั่งซิงก์ผ่านเท่านั้น"),
    ])
  );

  const practiceGoal = p('ฝึก: มี Commit อยู่แล้ว 1 ครั้งในเครื่อง (site.html) — ลองใช้ "git push" ส่งมันไปยัง Remote Repository จำลอง');
  const checklist = document.createElement("ul");
  checklist.className = "practice-checklist";
  const checklistItems = {
    pushed: makeChecklistItem('Push commit ไปยัง Remote สำเร็จ ("git push")'),
  };
  Object.values(checklistItems).forEach((li) => checklist.appendChild(li.node));

  const feedback = document.createElement("p");
  feedback.className = "practice-feedback";
  feedback.setAttribute("role", "status");
  feedback.textContent = "ผลตอบรับจะแสดงที่นี่ขณะที่คุณลองพิมพ์คำสั่ง";

  const workspaceHost = document.createElement("div");
  const { state: seededState, remoteState: seededRemote } = seededStartingState();
  let completedSent = false;

  createSimulatorWorkspace(workspaceHost, {
    initialState: seededState,
    initialRemoteState: seededRemote,
    onStateChange: (state, remoteState) => {
      const localId = state.branches[state.head];
      const remoteId = remoteState.branches[state.head];
      const pushed = !!localId && localId === remoteId;
      if (pushed) checklistItems.pushed.markDone();
      if (pushed) {
        feedback.textContent = "ฝึกสำเร็จ! Commit ของคุณตอนนี้อยู่ทั้งใน Local และ Remote Repository แล้ว";
        if (!completedSent) {
          completedSent = true;
          api.postProgress("module-6", "completed").catch(() => {});
        }
      }
    },
  });

  container.appendChild(section(STAGES.practice(), [practiceGoal, checklist, workspaceHost]));
  container.appendChild(section(STAGES.feedback(), [feedback]));

  const quizHost = document.createElement("div");
  renderQuiz(quizHost, "module-6", { api, user });
  container.appendChild(section(t("navQuizzes"), [quizHost]));

  const challengeHost = document.createElement("div");
  renderChallenge(challengeHost, "challenge-module-6", { api });
  container.appendChild(section(t("navChallenges"), [challengeHost]));

  container.appendChild(
    reinforcement(
      [
        "Local และ Remote Repository เป็นกราฟ commit อิสระต่อกัน จนกว่าจะ push/pull/clone จึงจะซิงก์กัน",
        "push ส่งงานจาก Local ขึ้น Remote; pull ดึงและรวมงานจาก Remote เข้ามา; clone คัดลอกทั้งประวัติมาเป็น Local ใหม่",
        "clone ต่างจากการดาวน์โหลดไฟล์ล่าสุด เพราะได้ประวัติ Commit ทั้งหมดมาด้วย ไม่ใช่แค่สแนปช็อตปัจจุบัน",
      ],
      "push ทับโดยไม่ pull ก่อน เมื่อ Remote มีการเปลี่ยนแปลงใหม่ที่เรายังไม่มี — ควร pull มารวมก่อนเสมอ"
    )
  );

  api.postProgress("module-6", "started").catch(() => {});
}
