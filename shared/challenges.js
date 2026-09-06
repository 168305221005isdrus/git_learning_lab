/**
 * Git Learning Lab — Challenge definitions (P3, ADR-013 / CHAL-001..005).
 *
 * PURE, environment-agnostic module — no DOM APIs, no Worker-specific APIs,
 * no `fetch`, no `eval` — imported UNMODIFIED by both the frontend (to show
 * a challenge's goal/hints and load its starting state into the simulator
 * workspace) and the Cloudflare Worker (to reconstruct the SAME authoritative
 * starting state and evaluate the SAME success condition when replaying a
 * submitted command transcript). This is what ADR-013 requires: there is
 * exactly one definition of "what state does this challenge start from" and
 * "what counts as passing" — never a second, independently-written copy for
 * server-side validation.
 *
 * A challenge NEVER trusts a client-reported final state or `passed` flag
 * (CHAL-002) — only `buildStartingState()` (authoritative, never
 * client-supplied) and `check(state, remoteState)` (derived purely from the
 * state the shared simulator core actually produced after replaying a
 * transcript) determine the result.
 *
 * `check` is graded on resulting STATE, not on matching one fixed transcript
 * (CHAL-005) — every challenge below accepts any valid command path that
 * reaches the described state, exactly like real Git accepts multiple valid
 * paths to the same result.
 */
import { createInitialState, createInitialRemoteState, applyCommand } from "./simulator-core.js";

function seed(commands) {
  let state = createInitialState();
  let remoteState = createInitialRemoteState();
  for (const cmd of commands) {
    if (typeof cmd === "function") {
      state = cmd(state);
      continue;
    }
    const result = applyCommand(state, cmd, { remoteState });
    if (result.error) {
      throw new Error(`challenge seed command failed unexpectedly: "${cmd}" -> ${result.error}`);
    }
    state = result.state;
    remoteState = result.remoteState;
  }
  return { state, remoteState };
}

// writeFile is imported lazily inside buildStartingState below via a small
// local helper to avoid a second import path; kept explicit for clarity.
import { writeFile } from "./simulator-core.js";

export const CHALLENGES = {
  "challenge-module-3": {
    id: "challenge-module-3",
    moduleId: "module-3",
    title: "แบบฝึกท้าทาย: จัดการ Staging Area อย่างเจาะจง",
    goal:
      'มีไฟล์ a.txt, b.txt, c.log และ d.txt อยู่ในพื้นที่ทำงาน (d.txt ถูกเตรียมไว้ใน Staging Area แล้วล่วงหน้า) ' +
      "เป้าหมาย: (1) ให้เฉพาะ a.txt และ b.txt อยู่ใน พื้นที่เตรียม Commit (Staging Area) — ห้ามมี c.log อยู่ในนั้น " +
      "(2) นำ d.txt ออกจากพื้นที่เตรียม Commit โดยที่ไฟล์ยังคงอยู่ในพื้นที่ทำงานตามเดิม",
    hints: [
      'ใช้ "git add" กับไฟล์ที่ต้องการทีละไฟล์ หรือใช้รูปแบบ pattern เช่น *.txt เพื่อเลือกเฉพาะไฟล์ที่ลงท้ายแบบนั้น',
      'การนำไฟล์ออกจาก Staging Area โดยไม่ลบออกจากดิสก์ ใช้คำสั่ง "git rm --cached <file>"',
    ],
    buildStartingState() {
      const { state, remoteState } = seed([
        "git init",
        (s) => writeFile(s, "a.txt", "1"),
        (s) => writeFile(s, "b.txt", "1"),
        (s) => writeFile(s, "c.log", "x"),
        (s) => writeFile(s, "d.txt", "1"),
        "git add d.txt",
      ]);
      return { state, remoteState };
    },
    check(state) {
      const staged = state.stagingArea;
      const hasA = Object.prototype.hasOwnProperty.call(staged, "a.txt");
      const hasB = Object.prototype.hasOwnProperty.call(staged, "b.txt");
      const noLog = !Object.prototype.hasOwnProperty.call(staged, "c.log");
      const dStillWorking = Object.prototype.hasOwnProperty.call(state.workingDirectory, "d.txt");
      const dNotStaged = !Object.prototype.hasOwnProperty.call(staged, "d.txt");
      return hasA && hasB && noLog && dStillWorking && dNotStaged;
    },
  },

  "challenge-module-4": {
    id: "challenge-module-4",
    moduleId: "module-4",
    title: "แบบฝึกท้าทาย: ยกเลิก Commit แบบเจาะจงผล",
    goal:
      'มี Commit อยู่แล้ว 2 ครั้งบน master (แก้ไข app.js จาก "1" เป็น "2") ' +
      'เป้าหมาย: ยกเลิก Commit ล่าสุด โดยให้การเปลี่ยนแปลงของมัน (app.js = "2") กลับไปอยู่ใน ' +
      "พื้นที่เตรียม Commit (Staging Area) — ไม่ใช่แค่พื้นที่ทำงาน และไม่ใช่ถูกทิ้งไปทั้งหมด",
    hints: [
      'มีคำสั่งเดียวที่ย้อนกลับ Commit ล่าสุดแล้วนำการเปลี่ยนแปลงไปไว้ใน Staging Area โดยตรง — ลองนึกถึงสามโหมดของ "git reset"',
      'ใช้ "git log --oneline" เพื่อดู Commit ID ของ Commit แรก แล้วรัน "git reset --soft <commit-id>"',
    ],
    buildStartingState() {
      const { state, remoteState } = seed([
        "git init",
        (s) => writeFile(s, "app.js", "1"),
        "git add app.js",
        'git commit -m "v1"',
        (s) => writeFile(s, "app.js", "2"),
        "git add app.js",
        'git commit -m "v2"',
      ]);
      return { state, remoteState };
    },
    check(state) {
      if (state.commits.length !== 1) return false;
      const headId = state.branches[state.head];
      if (!headId || headId !== state.commits[0].id) return false;
      return state.stagingArea["app.js"] === "2";
    },
  },

  "challenge-module-5": {
    id: "challenge-module-5",
    moduleId: "module-5",
    title: "แบบฝึกท้าทาย: แตกสาขา แก้ไขคู่ขนาน แล้วรวมกลับ",
    goal:
      "จาก master ที่มี Commit แรกอยู่แล้ว (index.html) เป้าหมาย: สร้าง Feature Branch ชื่อ feature, " +
      "commit การแก้ไขบน feature, กลับมาที่ master แล้ว commit การแก้ไขอื่นบน master ด้วย (ให้ประวัติแตกออกจริง), " +
      "จากนั้น merge feature กลับเข้า master ให้เกิดเป็น Commit ที่รวมทั้งสองสาย",
    hints: [
      '"git branch <name>" สร้างสาขาโดยไม่ย้าย HEAD ส่วน "git checkout <name>" ย้าย HEAD ไปสาขานั้น (หรือใช้ "git checkout -b <name>" รวบสองขั้นตอน)',
      'หลังจากมี Commit ทั้งบน master และ feature แยกกันแล้ว กลับมาที่ master แล้วรัน "git merge feature"',
    ],
    buildStartingState() {
      const { state, remoteState } = seed([
        "git init",
        (s) => writeFile(s, "index.html", "v1"),
        "git add index.html",
        'git commit -m "initial"',
      ]);
      return { state, remoteState };
    },
    check(state) {
      const masterId = state.branches.master;
      const featureId = state.branches.feature;
      if (!masterId || !featureId) return false;
      const masterCommit = state.commits.find((c) => c.id === masterId);
      if (!masterCommit || !masterCommit.parentId2) return false; // a real (non-fast-forward) merge occurred
      return state.head === "master";
    },
  },

  "challenge-module-6": {
    id: "challenge-module-6",
    moduleId: "module-6",
    title: "แบบฝึกท้าทาย: Clone ประวัติทั้งหมดจาก Remote",
    goal:
      "Remote Repository จำลองนี้มีประวัติ Commit อยู่แล้วหลายครั้ง เป้าหมาย: clone repository นี้ลงเครื่อง " +
      "แล้วตรวจสอบว่าคุณได้รับประวัติ Commit ทั้งหมด ไม่ใช่แค่ไฟล์เวอร์ชันล่าสุด",
    hints: [
      "มีคำสั่งเดียวที่คัดลอกทั้ง Repository (รวมประวัติ Commit ทั้งหมด) จาก Remote มาเป็น Local Repository ใหม่",
      '"git clone" ใช้ได้แม้ยังไม่มีการ "git init" มาก่อน เพราะมันคือวิธีเริ่มต้น Repository จาก Remote',
    ],
    buildStartingState() {
      // Build the remote's history via a throwaway local repo, then discard
      // that local state — the CHALLENGE's local repo starts uninitialized.
      const seeded = seed([
        "git init",
        (s) => writeFile(s, "site.html", "v1"),
        "git add site.html",
        'git commit -m "first"',
        (s) => writeFile(s, "site.html", "v2"),
        "git add site.html",
        'git commit -m "second"',
      ]);
      const pushed = applyCommand(seeded.state, "git push", { remoteState: seeded.remoteState });
      return { state: createInitialState(), remoteState: pushed.remoteState };
    },
    check(state, remoteState) {
      if (!state.initialized) return false;
      const remoteId = remoteState.branches.master;
      const localId = state.branches.master;
      if (!remoteId || localId !== remoteId) return false;
      return state.commits.length === remoteState.commits.length;
    },
  },

  "capstone-module-7": {
    id: "capstone-module-7",
    moduleId: "module-7",
    title: "Capstone: วงจร Git แบบเต็มรูปแบบ",
    goal:
      "เริ่มจาก Repository ว่างเปล่า: init เก็บไฟล์ด้วย add/commit, สร้างและ merge Feature Branch เข้ากับ master, " +
      "แล้ว push ผลลัพธ์สุดท้ายไปยัง Remote Repository จำลอง — ใช้คำสั่งจาก Module 3-6 เท่านั้น ไม่มีคำสั่งใหม่ " +
      "(ตรวจผลจากสถานะสุดท้าย ไม่ใช่ลำดับคำสั่งที่ตายตัว — เดินตามลำดับของคุณเองได้)",
    hints: [
      "ลำดับที่แนะนำ: git init → สร้างไฟล์ → git add → git commit → git checkout -b <feature> → แก้ไข/commit → git checkout master → git merge <feature> → git push",
      "ตรวจสอบด้วย git log --graph ว่าเกิด Commit ที่มีสองพาเรนต์ (merge) แล้วก่อน push",
    ],
    buildStartingState() {
      return { state: createInitialState(), remoteState: createInitialRemoteState() };
    },
    check(state, remoteState) {
      if (!state.initialized) return false;
      if (state.commits.length < 2) return false;
      const masterId = state.branches.master;
      if (!masterId) return false;
      const hasMergeCommit = state.commits.some((c) => c.parentId2);
      if (!hasMergeCommit) return false;
      const remoteId = remoteState.branches.master;
      return !!remoteId && remoteId === masterId;
    },
  },
};

export function getChallenge(id) {
  return CHALLENGES[id] || null;
}

export function listChallengesForModule(moduleId) {
  return Object.values(CHALLENGES).filter((c) => c.moduleId === moduleId);
}

/**
 * Replays a learner-submitted command transcript against a challenge's
 * authoritative starting state, using ONLY the shared simulator core's
 * `applyCommand` — the same function the browser used live. Never accepts
 * anything about the transcript's outcome from the caller; the caller only
 * supplies the challenge id and the ordered command strings (CHAL-002).
 * Used identically by the Worker (server-authoritative) and by the
 * frontend's own optimistic "did I pass?" pre-check (display-only; the
 * Worker's own re-run of this exact function is what's ever persisted).
 */
export function replayChallenge(challengeId, transcript) {
  const challenge = getChallenge(challengeId);
  if (!challenge) return { ok: false, error: "unknown_challenge" };
  if (!Array.isArray(transcript) || transcript.some((c) => typeof c !== "string")) {
    return { ok: false, error: "invalid_transcript" };
  }

  let { state, remoteState } = challenge.buildStartingState();
  for (const command of transcript) {
    const result = applyCommand(state, command, { remoteState });
    state = result.state;
    remoteState = result.remoteState;
  }

  const passed = challenge.check(state, remoteState);
  return { ok: true, passed, state, remoteState };
}
