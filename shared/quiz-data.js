/**
 * Git Learning Lab — Quiz question bank (P3, QUIZ-001..003; expanded P8).
 *
 * PURE data module — no DOM/Worker APIs — imported unmodified by both the
 * frontend (to render questions/choices) and the Cloudflare Worker (as the
 * trusted answer key a submitted set of answers is graded against —
 * QUIZ-002: scoring logic lives once, reused by every quiz; the Worker never
 * trusts a client-reported score).
 *
 * Content derived strictly from docs/LEARNING_OBJECTIVES.md / docs/Git &
 * GitHub.pdf — no command or concept beyond what each module actually
 * teaches (Engineering skill §9, §15). Thai-first per the P3 UI direction;
 * Git terminology that has no Thai equivalent in real use is kept in English
 * inline (e.g. "commit", "branch", "HEAD").
 *
 * P8 additions:
 *   - Each module's bank was expanded from 4 to 8 questions (Modules 1-6),
 *     mixing conceptual recognition, command-selection scenarios,
 *     state/workflow reasoning, common-mistake, and result-interpretation
 *     styles. Original question ids (m{n}-q1..q4) are UNCHANGED — existing
 *     production `quiz_results` rows reference no per-question id, only a
 *     quiz-level score, so this expansion cannot invalidate any existing
 *     learner's persisted result.
 *   - A new, OPTIONAL Module 7 capstone quiz ("module-7") was added. It is
 *     deliberately NOT referenced by shared/curriculum.js's quizId for
 *     module-7 (which stays `null`), so it can never affect course
 *     completion (QUIZ-001b, Should-Have; docs/LEARNING_OBJECTIVES.md's
 *     locked "assessment target: challenge only" note for Module 7).
 *   - `selectQuizQuestions`/`scoreQuizAttempt` implement a bounded, secure
 *     random subset per attempt (see the doc comment above them) — the
 *     original `scoreQuiz` (full-bank scoring) is unchanged and still used
 *     wherever the full bank is the correct unit (tests, and as the shared
 *     scoring primitive `scoreQuizAttempt` itself is built on).
 */

export const QUIZZES = {
  "module-1": {
    id: "module-1",
    moduleId: "module-1",
    title: "แบบทดสอบ Module 1 — รากฐานการควบคุมเวอร์ชัน",
    questions: [
      {
        id: "m1-q1",
        text: 'เหตุผลหลักที่ระบบควบคุมเวอร์ชัน (Version Control) ถูกสร้างขึ้นมาคืออะไร?',
        choices: [
          "เพื่อทำให้ไฟล์มีขนาดเล็กลง",
          "เพื่อแก้ปัญหาการตั้งชื่อไฟล์สำรองแบบสับสน (เช่น projectv2_final_fix) และช่วยติดตามการเปลี่ยนแปลงของทีม",
          "เพื่อให้โปรแกรมรันเร็วขึ้น",
          "เพื่อเข้ารหัสไฟล์ให้ปลอดภัย",
        ],
        correctIndex: 1,
        explanation:
          "Version Control เกิดขึ้นเพื่อแก้ปัญหาการสำรองไฟล์ด้วยมือที่สับสน (ตั้งชื่อไฟล์ซ้ำซ้อน) และช่วยให้ทีมทำงานร่วมกันโดยติดตามการเปลี่ยนแปลงได้อย่างเป็นระบบ",
      },
      {
        id: "m1-q2",
        text: "เรียงลำดับวิวัฒนาการของระบบควบคุมเวอร์ชันให้ถูกต้อง",
        choices: [
          "DVCS → CVCS → Local VCS → Patch → Copy File & Folder",
          "Copy File & Folder → Patch → Local VCS → CVCS → DVCS",
          "Patch → Copy File & Folder → CVCS → Local VCS → DVCS",
          "Local VCS → Copy File & Folder → Patch → DVCS → CVCS",
        ],
        correctIndex: 1,
        explanation:
          "ลำดับวิวัฒนาการคือ: คัดลอกไฟล์/โฟลเดอร์ (Copy File & Folder) → ส่ง Patch → ระบบควบคุมเวอร์ชันแบบ Local (Local VCS) → แบบรวมศูนย์ (CVCS) → แบบกระจาย (DVCS)",
      },
      {
        id: "m1-q3",
        text: 'จุดอ่อนสำคัญของ Centralized Version Control System (CVCS) คืออะไร?',
        choices: [
          "ไม่สามารถเก็บประวัติไฟล์ได้เลย",
          "หากเซิร์ฟเวอร์กลางล่ม ทีมทั้งหมดจะทำงานต่อไม่ได้ (single point of failure)",
          "ใช้พื้นที่เก็บข้อมูลมากกว่า DVCS เสมอ",
          "รองรับผู้ใช้ได้แค่คนเดียว",
        ],
        correctIndex: 1,
        explanation:
          "CVCS พึ่งพาเซิร์ฟเวอร์กลางเพียงจุดเดียว — ถ้าเซิร์ฟเวอร์นั้นล่มหรือเข้าถึงไม่ได้ ทุกคนในทีมจะทำงานต่อไม่ได้จนกว่าเซิร์ฟเวอร์จะกลับมา",
      },
      {
        id: "m1-q4",
        text: 'นักเรียนคนหนึ่งทำงานบนเครื่องที่ไม่มีอินเทอร์เน็ต แต่ยังต้องการบันทึกความคืบหน้าของงานเป็นระยะ ระบบแบบใดที่รองรับสถานการณ์นี้ได้ดีที่สุด?',
        choices: [
          "Local VCS เท่านั้น เพราะไม่รองรับการซิงก์เลย",
          "CVCS เพราะบันทึกได้เฉพาะบนเซิร์ฟเวอร์กลาง",
          "DVCS เพราะแต่ละเครื่องมีสำเนา Repository ครบถ้วน ทำงานและบันทึกได้แบบออฟไลน์ก่อนค่อยซิงก์ภายหลัง",
          "ต้องเชื่อมอินเทอร์เน็ตเสมอไม่ว่าระบบใดก็ตาม",
        ],
        correctIndex: 2,
        explanation:
          "DVCS (เช่น Git) ให้แต่ละเครื่องมี Repository ที่สมบูรณ์ในตัวเอง จึงทำงานและบันทึกการเปลี่ยนแปลงได้แบบออฟไลน์ แล้วค่อย sync กับที่อื่นภายหลัง",
      },
      {
        id: "m1-q5",
        text: 'ในระบบ Local Version Control System (Local VCS) ยุคแรก คำว่า "Check-Out" หมายถึงอะไร?',
        choices: [
          "การลบไฟล์ทิ้งอย่างถาวร",
          "การดึงไฟล์เวอร์ชันหนึ่งออกมาเพื่อเริ่มแก้ไข",
          "การส่งไฟล์ขึ้นอินเทอร์เน็ต",
          "การเข้ารหัสไฟล์ก่อนจัดเก็บ",
        ],
        correctIndex: 1,
        explanation: '"Check-Out" ใน Local VCS หมายถึงการดึงไฟล์เวอร์ชันหนึ่งออกมาเพื่อเริ่มแก้ไข ส่วน "Check-In" คือการบันทึกกลับเข้าระบบหลังแก้ไขเสร็จ',
      },
      {
        id: "m1-q6",
        text: 'นักศึกษาคนหนึ่งเก็บงานของตัวเองด้วยไฟล์ชื่อ "thesis_final.docx", "thesis_final2.docx", "thesis_final_realfinal.docx" ปัญหานี้คือปัญหาแบบใดที่ระบบควบคุมเวอร์ชันถูกออกแบบมาเพื่อแก้โดยเฉพาะ?',
        choices: [
          "ปัญหาความเร็วของฮาร์ดดิสก์",
          "ปัญหาการตั้งชื่อไฟล์สำรองด้วยมือที่สับสนและไม่มีระบบติดตามการเปลี่ยนแปลงที่แท้จริง",
          "ปัญหาการเชื่อมต่อเครือข่าย",
          "ปัญหาลิขสิทธิ์ซอฟต์แวร์",
        ],
        correctIndex: 1,
        explanation: "นี่คือตัวอย่างคลาสสิกของปัญหาที่ Version Control แก้: การตั้งชื่อไฟล์สำรองด้วยมือแทนที่จะมีระบบติดตามเวอร์ชัน/การเปลี่ยนแปลงอย่างเป็นระบบ",
      },
      {
        id: "m1-q7",
        text: "ถ้าเซิร์ฟเวอร์กลางของระบบ CVCS ล่มกลางดึก จะเกิดอะไรขึ้นกับนักพัฒนาที่ใช้ DVCS (เช่น Git) เทียบกับนักพัฒนาที่ใช้ CVCS?",
        choices: [
          "ทั้งสองฝ่ายทำงานต่อไม่ได้เหมือนกัน",
          "ผู้ใช้ DVCS ทำงานในเครื่องตัวเองต่อได้ตามปกติ เพราะมี Repository ครบถ้วนอยู่แล้ว ส่วนผู้ใช้ CVCS จะติดขัดเพราะต้องพึ่งเซิร์ฟเวอร์กลาง",
          "ผู้ใช้ CVCS จะไม่ได้รับผลกระทบใด ๆ",
          "DVCS จะสูญเสียประวัติ Commit ทั้งหมดทันที",
        ],
        correctIndex: 1,
        explanation: "จุดแข็งของ DVCS คือแต่ละเครื่องมีสำเนา Repository สมบูรณ์ในตัว จึงทำงานต่อได้แม้เซิร์ฟเวอร์กลาง (ถ้ามี) จะล่ม ต่างจาก CVCS ที่ต้องพึ่งเซิร์ฟเวอร์กลางตลอดเวลา",
      },
      {
        id: "m1-q8",
        text: 'ก่อนจะมี Local Version Control System ทีมพัฒนาซอฟต์แวร์ในขั้น "Patch" ส่งต่อการเปลี่ยนแปลงระหว่างกันด้วยวิธีใด?',
        choices: [
          "ส่งไฟล์ที่บันทึกเฉพาะส่วนที่เปลี่ยนแปลง (Patch) ให้กันเพื่อนำไปปะกับไฟล์ต้นฉบับ",
          "อัปโหลดขึ้นบริการคลาวด์อัตโนมัติ",
          "ใช้ระบบควบคุมเวอร์ชันแบบกระจายเต็มรูปแบบ",
          "ไม่มีการส่งต่อการเปลี่ยนแปลงเลยในยุคนั้น",
        ],
        correctIndex: 0,
        explanation: 'ขั้น "Patch" คือการส่งไฟล์ที่บันทึกเฉพาะส่วนต่าง (diff) ให้ผู้อื่นนำไปปะรวมกับไฟล์ต้นฉบับของตัวเอง ก่อนที่จะมีระบบ Local VCS ที่ทำเรื่องนี้ให้อัตโนมัติ',
      },
    ],
  },

  "module-2": {
    id: "module-2",
    moduleId: "module-2",
    title: "แบบทดสอบ Module 2 — Git และ GitHub",
    questions: [
      {
        id: "m2-q1",
        text: "ข้อใดอธิบายความสัมพันธ์ระหว่าง Git กับ GitHub ได้ถูกต้องที่สุด?",
        choices: [
          "Git และ GitHub คือสิ่งเดียวกัน ใช้แทนกันได้เสมอ",
          "Git คือระบบควบคุมเวอร์ชันแบบ DVCS ส่วน GitHub คือบริการที่ให้เช่าพื้นที่โฮสต์ Repository ของ Git บนเว็บ",
          "GitHub คือโปรแกรมที่ต้องติดตั้งก่อนจึงจะใช้ Git ได้",
          "Git ทำงานได้เฉพาะเมื่อเชื่อมต่อกับ GitHub เท่านั้น",
        ],
        correctIndex: 1,
        explanation:
          "Git คือตัวระบบควบคุมเวอร์ชันแบบกระจาย (DVCS) ส่วน GitHub เป็นบริการเว็บที่ใช้โฮสต์ Repository ของ Git — Git ใช้งานได้โดยไม่ต้องมี GitHub เลยก็ได้",
      },
      {
        id: "m2-q2",
        text: 'ทำไม Git จึงถูกเรียกว่าเป็นระบบแบบ "offline-first"?',
        choices: [
          "เพราะ Git ห้ามเชื่อมต่ออินเทอร์เน็ตเด็ดขาด",
          "เพราะการ commit งานเข้า Local Repository ทำได้โดยไม่ต้องเชื่อมต่อเครือข่ายเลย มีแค่การ sync กับ Remote เท่านั้นที่ต้องใช้เครือข่าย",
          "เพราะ Git ทำงานได้ดีกว่าเมื่อไม่มีอินเทอร์เน็ต",
          "เพราะ GitHub ไม่รองรับการเชื่อมต่อออนไลน์",
        ],
        correctIndex: 1,
        explanation:
          "งานส่วนใหญ่ของ Git (แก้ไข, ดูประวัติ, commit เข้า Local Repository) ทำได้แบบออฟไลน์ทั้งหมด — มีเพียงขั้นตอน sync กับ Remote Repository (push/pull) เท่านั้นที่ต้องใช้อินเทอร์เน็ต",
      },
      {
        id: "m2-q3",
        text: 'ข้อใดคือลำดับหลักการทำงานของ Git ตามที่ Module 2 อธิบายไว้?',
        choices: [
          "Push ก่อน แล้วค่อย Clone ทีหลัง",
          "Clone/Copy Repository มาไว้ในเครื่อง → ทำงานแบบออฟไลน์ → Check-In เข้า Local Repository → ค่อย Sync (Pull/Merge/Push) กับ Remote ภายหลัง",
          "ต้อง Sync กับ Remote ทุกครั้งก่อนแก้ไขไฟล์แม้แต่บรรทัดเดียว",
          "แก้ไขไฟล์บน Remote โดยตรงเสมอ ไม่มี Local Repository",
        ],
        correctIndex: 1,
        explanation:
          "หลักการของ Git คือ clone/copy repository มาไว้ในเครื่อง ทำงานออฟไลน์ได้เต็มที่ บันทึก (Check-In) เข้า Local Repository ก่อน แล้วค่อยเลือกเวลา sync กับ Remote ภายหลัง",
      },
      {
        id: "m2-q4",
        text: '"Local Repository" กับ "Remote Repository" ต่างกันอย่างไร?',
        choices: [
          "Local Repository อยู่ในเครื่องของผู้ใช้เอง ส่วน Remote Repository คือสำเนาที่โฮสต์ไว้ที่อื่น (เช่นบน GitHub) และทั้งสองจะซิงก์กันก็ต่อเมื่อมีคำสั่งชัดเจนเท่านั้น",
          "ทั้งสองคือที่เดียวกัน ซิงก์กันอัตโนมัติตลอดเวลา",
          "Remote Repository เท่านั้นที่เก็บประวัติ Commit ได้",
          "Local Repository ใช้ได้กับ GitHub เท่านั้น",
        ],
        correctIndex: 0,
        explanation:
          "Local และ Remote Repository เป็นสำเนาที่เป็นอิสระต่อกันอย่างแท้จริง จะซิงก์กันก็ต่อเมื่อมีการสั่งอย่างชัดเจน (เช่น push/pull) เท่านั้น — ไม่มีการซิงก์อัตโนมัติเบื้องหลัง",
      },
      {
        id: "m2-q5",
        text: 'ในหลักการทำงานของ Git คำว่า "Check-In" หมายถึงขั้นตอนใด?',
        choices: [
          "การส่งงานขึ้น Remote Repository โดยตรง",
          "การบันทึกการเปลี่ยนแปลงเข้าสู่ Local Repository (commit)",
          "การดาวน์โหลด Git มาติดตั้งครั้งแรก",
          "การลบ Repository ทิ้ง",
        ],
        correctIndex: 1,
        explanation: '"Check-In" ในบริบทของ Git คือการบันทึกการเปลี่ยนแปลงเข้าสู่ Local Repository ผ่านการ commit — ยังไม่เกี่ยวกับ Remote จนกว่าจะ sync',
      },
      {
        id: "m2-q6",
        text: "ผู้ใช้ต้องการเผยแพร่โค้ดโอเพนซอร์สให้คนอื่นดูและมีส่วนร่วมได้ผ่านเว็บเบราว์เซอร์ ควรใช้บริการใดร่วมกับ Git?",
        choices: ["ไม่ต้องใช้บริการใดเพิ่มเติมเลย ใช้ git init อย่างเดียวพอ", "GitHub", "โปรแกรมแก้ไขข้อความทั่วไป", "ไม่มีบริการใดรองรับสิ่งนี้"],
        correctIndex: 1,
        explanation: "GitHub คือบริการเว็บที่ใช้โฮสต์ Repository ของ Git ให้เข้าถึงและมีส่วนร่วมได้ผ่านเบราว์เซอร์ — ตรงตามบทบาทของ GitHub ที่ Module 2 อธิบายไว้",
      },
      {
        id: "m2-q7",
        text: "การใช้ git init และ commit งานในเครื่องของตัวเอง จำเป็นต้องมีบัญชี GitHub ก่อนหรือไม่?",
        choices: [
          "จำเป็นเสมอ ไม่มี GitHub จะใช้ Git ไม่ได้เลย",
          "ไม่จำเป็น เพราะ Git ทำงานได้อย่างสมบูรณ์ในเครื่องเดียวโดยไม่ต้องมี GitHub หรืออินเทอร์เน็ต",
          "จำเป็นเฉพาะตอน commit เท่านั้น",
          "จำเป็นเฉพาะตอน git status เท่านั้น",
        ],
        correctIndex: 1,
        explanation: "Git เป็นระบบที่ทำงานได้ครบในเครื่องเดียว ไม่ต้องมีบัญชี GitHub หรืออินเทอร์เน็ตเลยก็ init/add/commit ได้ตามปกติ — GitHub เป็นบริการแยกต่างหากที่จำเป็นเฉพาะตอนต้องการ sync กับ Remote",
      },
      {
        id: "m2-q8",
        text: "ถ้าไม่เคย push งานขึ้น Remote Repository เลยสักครั้ง งานที่ commit ไว้ใน Local Repository จะเป็นอย่างไร?",
        choices: [
          "จะหายไปโดยอัตโนมัติหลังผ่านไประยะหนึ่ง",
          "ยังคงอยู่ครบถ้วนใน Local Repository ของเครื่องนั้น แต่ยังไม่มีสำเนาอยู่บน Remote เลย",
          "จะถูกซิงก์ขึ้น Remote โดยอัตโนมัติเมื่อเชื่อมอินเทอร์เน็ตครั้งถัดไป",
          "Git จะปฏิเสธไม่ให้ commit ต่อจนกว่าจะ push",
        ],
        correctIndex: 1,
        explanation: "Local และ Remote Repository เป็นอิสระต่อกันจนกว่าจะมีคำสั่ง sync ที่ชัดเจน — งานที่ commit ไว้ในเครื่องจะปลอดภัยและอยู่ครบในเครื่องนั้น แต่จะไม่ปรากฏบน Remote จนกว่าจะ push",
      },
    ],
  },

  "module-3": {
    id: "module-3",
    moduleId: "module-3",
    title: "แบบทดสอบ Module 3 — Git Workflow และ Staging",
    questions: [
      {
        id: "m3-q1",
        text: "ไฟล์ที่ถูกแก้ไขแล้ว แต่ยังไม่ได้ถูกเตรียมด้วย git add จะมีสถานะใด?",
        choices: ["Staged", "Modified", "Committed", "Untracked เสมอ"],
        correctIndex: 1,
        explanation: 'ไฟล์ที่ถูกแก้ไขแล้วแต่ยังไม่ผ่าน "git add" มีสถานะ Modified (แก้ไขแล้ว แต่ยังไม่ถูกเตรียม Commit)',
      },
      {
        id: "m3-q2",
        text: 'คำสั่งใดที่นำไฟล์ทุกไฟล์ในพื้นที่ทำงานเข้าสู่ Staging Area ในครั้งเดียว?',
        choices: ["git add *", "git add .", "git commit -a", "git status --all"],
        correctIndex: 1,
        explanation: '"git add ." คือคำสั่งที่เตรียมไฟล์ทั้งหมดในพื้นที่ทำงานเข้าสู่ Staging Area',
      },
      {
        id: "m3-q3",
        text: 'ถ้าใช้ "git rm --cached app.js" จะเกิดอะไรขึ้น?',
        choices: [
          "ไฟล์ app.js จะถูกลบออกจากดิสก์ถาวร",
          "ไฟล์ app.js จะถูกนำออกจากการติดตาม/Staging Area เท่านั้น แต่ยังอยู่ในพื้นที่ทำงานตามเดิม",
          "ไฟล์ app.js จะถูก Commit ทันที",
          "คำสั่งนี้ใช้ไม่ได้กับ Git",
        ],
        correctIndex: 1,
        explanation:
          '"git rm --cached" นำไฟล์ออกจากการติดตาม/Staging Area เท่านั้น — ไฟล์จริงในพื้นที่ทำงานยังอยู่เหมือนเดิม ไม่ถูกลบ',
      },
      {
        id: "m3-q4",
        text: '"git status" ใช้ทำอะไร?',
        choices: [
          "ลบไฟล์ที่ไม่ได้ใช้งาน",
          "แสดงว่าไฟล์แต่ละไฟล์อยู่ในสถานะ Untracked, Modified, Staged หรือ Committed",
          "สร้าง Commit ใหม่ทันที",
          "ส่งงานไปยัง Remote Repository",
        ],
        correctIndex: 1,
        explanation: '"git status" คือเครื่องมือตรวจสอบสถานะของแต่ละไฟล์ในไปป์ไลน์ของ Git ณ ขณะนั้น',
      },
      {
        id: "m3-q5",
        text: "ต้องการเพิ่มเฉพาะไฟล์ที่ลงท้ายด้วย .css ทั้งหมดเข้า Staging Area ในครั้งเดียว ควรใช้คำสั่งใด?",
        choices: ["git add .css", "git add *.css", "git status *.css", "git commit *.css"],
        correctIndex: 1,
        explanation: '"git add *.css" ใช้รูปแบบ (pattern) เพื่อเลือกเฉพาะไฟล์ที่ลงท้ายด้วย .css เข้าสู่ Staging Area',
      },
      {
        id: "m3-q6",
        text: "ไฟล์ที่เพิ่งสร้างใหม่ในพื้นที่ทำงาน และไม่เคยถูก git add เลยสักครั้ง จะมีสถานะใดตาม git status?",
        choices: ["Staged", "Committed", "Untracked", "Modified"],
        correctIndex: 2,
        explanation: "ไฟล์ใหม่ที่ Git ยังไม่เคยรู้จัก/ติดตามมาก่อนจะมีสถานะ Untracked จนกว่าจะถูก git add",
      },
      {
        id: "m3-q7",
        text: "ถ้าลืมรัน git add ก่อนจะ git commit จะเกิดอะไรขึ้นกับการเปลี่ยนแปลงที่ยังไม่ได้ staged?",
        choices: [
          "Git จะ commit ทุกการเปลี่ยนแปลงในพื้นที่ทำงานให้อัตโนมัติ",
          "การเปลี่ยนแปลงที่ยังไม่ได้ staged จะไม่ถูกรวมเข้า Commit นั้นเลย เพราะ commit บันทึกเฉพาะสิ่งที่อยู่ใน Staging Area",
          "Git จะลบการเปลี่ยนแปลงนั้นทิ้ง",
          "Git จะปฏิเสธไม่ให้ commit ไฟล์อื่นเลยจนกว่าจะ add ไฟล์นี้",
        ],
        correctIndex: 1,
        explanation: "Commit บันทึกเฉพาะสิ่งที่อยู่ใน Staging Area ณ ขณะนั้น — การเปลี่ยนแปลงที่ยังไม่ได้ add จะไม่ถูกรวมเข้าไปเลย นี่คือความผิดพลาดที่ผู้เริ่มต้นพบบ่อย",
      },
      {
        id: "m3-q8",
        text: 'หลังรัน "git add report.docx" แล้ว หากเปิด git status ควรเห็นสถานะใดสำหรับ report.docx?',
        choices: ["Untracked", "Modified", "Staged", "ไม่ปรากฏในรายการเลย"],
        correctIndex: 2,
        explanation: 'เมื่อไฟล์ถูก "git add" แล้ว จะเปลี่ยนสถานะเป็น Staged (เตรียมไว้สำหรับ Commit ถัดไป)',
      },
    ],
  },

  "module-4": {
    id: "module-4",
    moduleId: "module-4",
    title: "แบบทดสอบ Module 4 — Commit, ประวัติ, Diff และการย้อนกลับ",
    questions: [
      {
        id: "m4-q1",
        text: 'ถ้ารัน "git commit -m \\"test\\"" โดยที่ยังไม่มีอะไรอยู่ใน Staging Area เลย จะเกิดอะไรขึ้น?',
        choices: [
          "ระบบจะสร้าง Commit เปล่าให้ทันที",
          "ระบบจะปฏิเสธ ไม่สร้าง Commit ใหม่ และแจ้งว่าไม่มีอะไรจะ commit",
          "ระบบจะ commit ไฟล์ทั้งหมดในพื้นที่ทำงานโดยอัตโนมัติ",
          "ระบบจะลบ Staging Area ทิ้ง",
        ],
        correctIndex: 1,
        explanation:
          'Git (และเครื่องจำลองนี้) ปฏิเสธคำสั่ง commit เมื่อไม่มีอะไรถูกเตรียมไว้ใน Staging Area เลย แม้ข้อความ commit จะถูกต้องก็ตาม — นี่คือกรณีสำคัญที่สุดของ "nothing to commit"',
      },
      {
        id: "m4-q2",
        text: '"git diff" แสดงผลอย่างไร?',
        choices: [
          "แสดงเฉพาะบรรทัดที่เพิ่มเข้ามา (+) เท่านั้น",
          "แสดงบรรทัดที่ถูกลบออก (-) และบรรทัดที่เพิ่มเข้ามา (+) แยกจากกันอย่างชัดเจน",
          "แสดงรายชื่อไฟล์ทั้งหมดใน Repository",
          "ลบความแตกต่างระหว่างสองเวอร์ชันโดยอัตโนมัติ",
        ],
        correctIndex: 1,
        explanation: '"git diff" แสดงบรรทัดที่ถูกลบ (มักแทนด้วย -) และบรรทัดที่เพิ่มใหม่ (มักแทนด้วย +) แยกจากกันให้เห็นความต่างชัดเจน',
      },
      {
        id: "m4-q3",
        text: 'ถ้าต้องการยกเลิก Commit ล่าสุด แต่ต้องการให้การเปลี่ยนแปลงนั้นกลับไปอยู่ใน Staging Area (พร้อม commit ใหม่ได้ทันที) ควรใช้คำสั่งใด?',
        choices: ["git reset --hard", "git reset --mixed", "git reset --soft", "git checkout <file>"],
        correctIndex: 2,
        explanation:
          '"git reset --soft" ย้ายตัวชี้ Commit กลับ แต่เก็บการเปลี่ยนแปลงไว้ใน Staging Area — ต่างจาก --mixed (ไปที่พื้นที่ทำงาน) และ --hard (ทิ้งไปเลย)',
      },
      {
        id: "m4-q4",
        text: '"git checkout <file>" (รูปแบบคืนค่าไฟล์) ทำอะไร?',
        choices: [
          "ย้าย HEAD ไปยังสาขาอื่น",
          "คืนค่าไฟล์ที่ยังไม่ได้ commit กลับไปเป็นเวอร์ชันล่าสุดที่ commit ไว้ โดยไม่ย้าย HEAD หรือสลับสาขา",
          "ลบไฟล์นั้นออกจาก Repository ถาวร",
          "สร้างสาขาใหม่จากไฟล์นั้น",
        ],
        correctIndex: 1,
        explanation:
          '"git checkout <file>" คืนค่าการเปลี่ยนแปลงที่ยังไม่ได้ commit ของไฟล์นั้นกลับไปเป็นเวอร์ชันล่าสุดใน Commit — ไม่เกี่ยวกับการย้าย HEAD หรือสลับสาขา (นั่นคือรูปแบบอื่นของ checkout ที่สอนใน Module 5)',
      },
      {
        id: "m4-q5",
        text: "ต้องการดูประวัติ Commit แบบย่อ บรรทัดเดียวต่อหนึ่ง Commit ควรใช้คำสั่งใด?",
        choices: ["git log", "git log --oneline", "git diff --oneline", "git status --oneline"],
        correctIndex: 1,
        explanation: '"git log --oneline" แสดงประวัติ Commit แบบย่อ บรรทัดเดียวต่อหนึ่ง Commit ต่างจาก "git log" เปล่าที่แสดงรายละเอียดครบทุกช่อง',
      },
      {
        id: "m4-q6",
        text: "ถ้าต้องการยกเลิก Commit ล่าสุดและทิ้งการเปลี่ยนแปลงนั้นไปทั้งหมด โดยไม่เก็บไว้ทั้งใน Staging Area และพื้นที่ทำงานเลย ควรใช้โหมดใดของ reset?",
        choices: ["--soft", "--mixed", "--hard", "ไม่มีโหมดใดทำได้"],
        correctIndex: 2,
        explanation: '"git reset --hard" ย้ายตัวชี้ Commit กลับและทิ้งการเปลี่ยนแปลงที่ถูกยกเลิกไปทั้งหมด ไม่เก็บไว้ที่ใดเลย',
      },
      {
        id: "m4-q7",
        text: '"git checkout <file>" กับ "git checkout <branch>" ใช้คำสั่งต้นเดียวกันแต่ทำงานต่างกันอย่างไร?',
        choices: [
          "ทั้งสองแบบทำสิ่งเดียวกันทุกประการ",
          "แบบแรกคืนค่าไฟล์กลับไปเป็นเวอร์ชันล่าสุดที่ commit (ไม่ย้าย HEAD) ส่วนแบบหลังย้าย HEAD ไปยังสาขาอื่น (สลับสาขา)",
          "แบบแรกลบไฟล์ ส่วนแบบหลังลบสาขา",
          "แบบแรกใช้ได้เฉพาะกับ Remote Repository เท่านั้น",
        ],
        correctIndex: 1,
        explanation: "checkout มีสองรูปแบบตามอาร์กิวเมนต์: คืนค่าไฟล์ (ไม่ย้าย HEAD, สอนใน Module 4) และสลับสาขา (ย้าย HEAD, สอนใน Module 5) — เป็นความสับสนที่พบบ่อยสำหรับผู้เริ่มต้น",
      },
      {
        id: "m4-q8",
        text: "Commit ID (SHA-1 hash) ที่ใช้อ้างอิงในทางปฏิบัติ (เช่นใน git reset) มักถูกอ้างด้วยกี่ตัวอักษรแรก?",
        choices: ["3 ตัวอักษร", "7 ตัวอักษร", "20 ตัวอักษร", "ต้องพิมพ์เต็มความยาวเสมอ"],
        correctIndex: 1,
        explanation: "แม้ Commit ID จริงจะเป็น SHA-1 hash ความยาวเต็ม แต่ในทางปฏิบัติมักอ้างอิงด้วย 7 ตัวอักษรแรก ซึ่งเพียงพอต่อการระบุ Commit อย่างไม่กำกวมในโปรเจกต์ทั่วไป",
      },
    ],
  },

  "module-5": {
    id: "module-5",
    moduleId: "module-5",
    title: "แบบทดสอบ Module 5 — Branching และ Merging",
    questions: [
      {
        id: "m5-q1",
        text: "Branch ใน Git คืออะไรกันแน่?",
        choices: [
          "สำเนาไฟล์ทั้งหมดของโปรเจกต์ที่แยกออกไปอีกชุดหนึ่ง",
          "ตัวชี้ (pointer) ที่ชี้ไปยัง Commit หนึ่งใน Commit Graph — ไม่ใช่การคัดลอกไฟล์",
          "โฟลเดอร์ย่อยที่ต้องสร้างเองใน Working Directory",
          "ไฟล์การตั้งค่าของ GitHub เท่านั้น",
        ],
        correctIndex: 1,
        explanation: "Branch คือตัวชี้ (pointer) ที่ชี้ไปยัง commit หนึ่งในกราฟ commit เท่านั้น ไม่ใช่การคัดลอกไฟล์ทั้งโปรเจกต์",
      },
      {
        id: "m5-q2",
        text: "ถ้า commit บน Feature Branch แล้ว โดยยังไม่ merge กลับ master จะเกิดอะไรขึ้นกับ master?",
        choices: [
          "master จะได้รับการเปลี่ยนแปลงนั้นทันที",
          "master จะไม่มีการเปลี่ยนแปลงใด ๆ เลย จนกว่าจะมีการ merge",
          "master จะถูกลบไปโดยอัตโนมัติ",
          "Feature Branch จะกลายเป็น master ทันที",
        ],
        correctIndex: 1,
        explanation: "การ commit บน Feature Branch จะไม่ส่งผลต่อ master เลยจนกว่าจะมีการ merge กลับเข้าไปอย่างชัดเจน",
      },
      {
        id: "m5-q3",
        text: '"git checkout -b feature" ทำสิ่งใดในขั้นตอนเดียว?',
        choices: [
          "สร้างสาขาชื่อ feature และย้าย HEAD ไปที่สาขานั้นทันที",
          "ลบสาขาชื่อ feature",
          "รวม (merge) สาขา feature เข้ากับสาขาปัจจุบัน",
          "แสดงรายชื่อสาขาทั้งหมด",
        ],
        correctIndex: 0,
        explanation: '"git checkout -b <name>" รวมสองขั้นตอนไว้ในคำสั่งเดียว: สร้างสาขาใหม่ แล้วย้าย HEAD ไปที่สาขานั้นทันที',
      },
      {
        id: "m5-q4",
        text: "HEAD คืออะไร?",
        choices: [
          "ชื่อของ commit แรกสุดเสมอ",
          "ตัวชี้ที่บอกว่าตอนนี้กำลังอยู่ที่สาขา (หรือ commit) ใด และย้ายไปมาเมื่อสลับสาขา",
          "ไฟล์การตั้งค่าความปลอดภัยของ Git",
          "ชื่อเรียกของ Remote Repository",
        ],
        correctIndex: 1,
        explanation: "HEAD คือตัวชี้ที่บอกตำแหน่งปัจจุบันของคุณในกราฟ commit — มันย้ายไปมาเมื่อสลับสาขาด้วย checkout",
      },
      {
        id: "m5-q5",
        text: 'ต้องการลบสาขาชื่อ "old-feature" ที่ merge เสร็จเรียบร้อยแล้วและไม่ใช้งานต่อ ควรใช้คำสั่งใด?',
        choices: ["git branch old-feature", "git checkout old-feature", "git branch -d old-feature", "git merge -d old-feature"],
        correctIndex: 2,
        explanation: '"git branch -d <name>" ลบตัวชี้สาขาที่ระบุ (ไม่ลบ Commit ที่มันเคยชี้ไว้ ถ้ายังเข้าถึงได้จากสาขาอื่น)',
      },
      {
        id: "m5-q6",
        text: "ก่อนจะ merge สาขา feature เข้ากับ master ควรอยู่ที่สาขาใด (HEAD ควรชี้ที่ใด)?",
        choices: ["feature", "master (สาขาที่จะรับการรวมเข้า)", "ไม่สำคัญว่าจะอยู่สาขาใด", "ต้องลบ master ก่อน"],
        correctIndex: 1,
        explanation: '"git merge <branch>" รวมประวัติของสาขาที่ระบุเข้ากับสาขาปัจจุบัน ดังนั้นต้อง checkout ไปที่ master ก่อน แล้วจึง merge feature เข้ามา',
      },
      {
        id: "m5-q7",
        text: 'ถ้ารัน "git merge feature" ขณะที่ HEAD ยังอยู่ที่สาขา feature เอง (ยังไม่ได้ checkout master) จะเกิดอะไรขึ้น?',
        choices: [
          "จะเกิดการรวมที่มีความหมายเหมือนเดิม",
          "จะไม่เกิดการรวมที่ตั้งใจไว้ เพราะไม่ได้อยู่บนสาขาเป้าหมาย (master) ที่ต้องการรับการเปลี่ยนแปลง",
          "Git จะสลับไปที่ master ให้อัตโนมัติก่อน merge",
          "สาขา feature จะถูกลบทิ้ง",
        ],
        correctIndex: 1,
        explanation: "merge รวมสาขาที่ระบุเข้ากับสาขาปัจจุบันเสมอ — ถ้ายังอยู่บน feature การสั่ง merge feature เข้าตัวเองจะไม่ทำให้ master ได้รับการเปลี่ยนแปลงตามที่ตั้งใจ",
      },
      {
        id: "m5-q8",
        text: "หลัง merge สาขา feature เข้ากับ master แบบไม่ fast-forward (มีการแตกสายจริง) สำเร็จ Commit ใหม่ที่เกิดขึ้นจะมีกี่ Parent?",
        choices: ["0", "1", "2", "ไม่มี Commit ใหม่เกิดขึ้นเลย"],
        correctIndex: 2,
        explanation: "การ merge แบบไม่ fast-forward สร้าง Commit ใหม่ที่มี 2 Parent — หนึ่งจากแต่ละสาขาที่ถูกรวมเข้าด้วยกัน",
      },
    ],
  },

  "module-6": {
    id: "module-6",
    moduleId: "module-6",
    title: "แบบทดสอบ Module 6 — Remote Repositories",
    questions: [
      {
        id: "m6-q1",
        text: '"git push" ทำอะไร?',
        choices: [
          "ดึง Commit จาก Remote Repository เข้ามาที่เครื่อง",
          "ส่ง Commit จาก Local Repository ไปยัง Remote Repository",
          "ลบ Commit ทั้งหมดออกจาก Remote",
          "สร้าง Repository ใหม่บนเครื่อง",
        ],
        correctIndex: 1,
        explanation: '"git push" ส่ง commit ที่มีอยู่ใน Local Repository ไปยัง Remote Repository',
      },
      {
        id: "m6-q2",
        text: '"git clone" แตกต่างจากการดาวน์โหลดไฟล์ล่าสุดของโปรเจกต์อย่างไร?',
        choices: [
          "ไม่ต่างกันเลย ได้ผลลัพธ์เดียวกัน",
          "git clone คัดลอกประวัติ Commit ทั้งหมดของ Remote Repository มาไว้ในเครื่อง ไม่ใช่แค่ไฟล์เวอร์ชันล่าสุด",
          "git clone ใช้ได้เฉพาะไฟล์ขนาดเล็กเท่านั้น",
          "git clone จะลบ Repository ต้นทางทิ้งหลังคัดลอกเสร็จ",
        ],
        correctIndex: 1,
        explanation: '"git clone" คัดลอกทั้ง Repository — รวมถึงประวัติ Commit ทั้งหมด — ไม่ใช่แค่สแนปช็อตไฟล์ล่าสุด',
      },
      {
        id: "m6-q3",
        text: "ก่อนจะมีการ push/pull/clone เกิดขึ้น Local Repository กับ Remote Repository มีความสัมพันธ์กันอย่างไร?",
        choices: [
          "เป็น Repository เดียวกัน ซิงก์กันตลอดเวลาโดยอัตโนมัติ",
          "เป็นกราฟ Commit ที่เป็นอิสระต่อกันอย่างแท้จริง จนกว่าจะมีการ sync อย่างชัดเจน",
          "Remote Repository จะคัดลอกทุกการเปลี่ยนแปลงจาก Local ทันทีที่ save ไฟล์",
          "Local Repository ใช้งานไม่ได้จนกว่าจะเชื่อมกับ Remote ก่อน",
        ],
        correctIndex: 1,
        explanation: "Local และ Remote Repository เป็นกราฟ commit ที่แยกจากกันโดยสิ้นเชิง จนกว่าจะมีการ push/pull/clone มาซิงก์กันอย่างชัดเจน (ตรงกับหลักการ DVCS ใน Module 2)",
      },
      {
        id: "m6-q4",
        text: '"git pull" ทำหน้าที่ใด?',
        choices: [
          "ดึง Commit จาก Remote Repository มาไว้ในเครื่อง แล้วรวม (merge) เข้ากับ Local Repository ปัจจุบัน",
          "ส่งไฟล์จากเครื่องไปยัง Remote เท่านั้น",
          "ลบสาขาปัจจุบันทิ้ง",
          "สร้าง Repository ใหม่จากศูนย์เสมอ",
        ],
        correctIndex: 0,
        explanation: '"git pull" ดึง commit ใหม่จาก Remote Repository เข้ามา แล้ว merge เข้ากับสาขาปัจจุบันในเครื่อง',
      },
      {
        id: "m6-q5",
        text: "เครื่อง B ต้องการเริ่มทำงานกับโปรเจกต์ที่มีอยู่แล้วบน Remote Repository ตั้งแต่ต้น (ยังไม่เคยมี Repository นี้ในเครื่องเลย) ควรใช้คำสั่งใด?",
        choices: ["git init", "git pull", "git clone", "git push"],
        correctIndex: 2,
        explanation: '"git clone" คือวิธีเริ่มต้น Repository ใหม่ในเครื่องจาก Remote ที่มีอยู่แล้ว โดยได้ประวัติ Commit ทั้งหมดมาด้วย — ใช้ได้แม้ยังไม่เคย git init มาก่อน',
      },
      {
        id: "m6-q6",
        text: "หลังจาก push commit ใหม่ขึ้น Remote สำเร็จแล้ว Local Repository กับ Remote Repository (บนสาขานั้น) มีความสัมพันธ์กันอย่างไร?",
        choices: [
          "ยังคงแยกจากกันเหมือนเดิมทุกประการ",
          "ตรงกัน (ซิงก์แล้ว) เพราะเพิ่ง push การเปลี่ยนแปลงล่าสุดขึ้นไป",
          "Remote จะมี Commit มากกว่า Local เสมอ",
          "Local จะถูกลบไปหลัง push",
        ],
        correctIndex: 1,
        explanation: "การ push ที่สำเร็จจะซิงก์ Commit ล่าสุดของสาขานั้นจาก Local ไปยัง Remote จนตรงกัน — เป็นการ sync แบบตั้งใจ ตรงข้ามกับสถานะอิสระต่อกันตามปกติ",
      },
      {
        id: "m6-q7",
        text: "ถ้ามีคนอื่น push commit ใหม่ขึ้น Remote ไปก่อนแล้ว แต่เรายังไม่ได้ pull เข้ามา ควรทำอย่างไรก่อนจะ push งานของเราเอง?",
        choices: [
          "push ทับไปได้เลยโดยไม่ต้องทำอะไรก่อน",
          "pull (ดึงและรวม) การเปลี่ยนแปลงล่าสุดจาก Remote เข้ามาก่อน แล้วจึง push งานของเราต่อ",
          "ลบ Local Repository แล้ว clone ใหม่ทุกครั้ง",
          "ไม่มีทางแก้ ต้องรอผู้อื่นลบ commit ของเขาก่อน",
        ],
        correctIndex: 1,
        explanation: "เมื่อ Local และ Remote แยกออกจากกัน (diverge) ควร pull เพื่อดึงและรวมการเปลี่ยนแปลงล่าสุดเข้ามาก่อน จึงจะ push งานของเราต่อได้อย่างสอดคล้องกับประวัติล่าสุด",
      },
      {
        id: "m6-q8",
        text: "ทำไม 'git clone' จึงต่างจากการดาวน์โหลดไฟล์ ZIP ของโปรเจกต์เวอร์ชันล่าสุด?",
        choices: [
          "clone ทำงานได้เร็วกว่าเสมอไม่ว่าขนาดโปรเจกต์จะเป็นเท่าใด",
          "clone ได้ประวัติ Commit ทั้งหมดของ Repository มาด้วย ไม่ใช่แค่สแนปช็อตไฟล์ปัจจุบันแบบไฟล์ ZIP",
          "ไฟล์ ZIP จะรวมประวัติ Commit มาให้ด้วยเสมอเช่นกัน",
          "clone ใช้ได้เฉพาะบน GitHub เท่านั้น",
        ],
        correctIndex: 1,
        explanation: "ไฟล์ ZIP ให้เพียงสแนปช็อตไฟล์ ณ ปัจจุบัน ส่วน git clone คัดลอกทั้ง Repository — รวมประวัติ Commit ทั้งหมด — มาไว้ในเครื่องใหม่",
      },
    ],
  },

  "module-7": {
    id: "module-7",
    moduleId: "module-7",
    // P8: optional/enrichment capstone quiz (QUIZ-001b, Should-Have). NOT
    // referenced by shared/curriculum.js's quizId for module-7 — see this
    // file's header comment — so it can never affect course completion.
    title: "แบบทดสอบ Module 7 — Capstone (ไม่บังคับ/เสริม)",
    optional: true,
    questions: [
      {
        id: "m7-q1",
        text: "เรียงลำดับ 4 ขั้นตอนหลักของไปป์ไลน์ Git ตั้งแต่แก้ไขไฟล์จนถึงส่งขึ้น Remote ให้ถูกต้อง",
        choices: [
          "Staging Area → Working Directory → Local Repository → Remote Repository",
          "Working Directory → Staging Area → Local Repository → Remote Repository",
          "Local Repository → Staging Area → Working Directory → Remote Repository",
          "Remote Repository → Local Repository → Staging Area → Working Directory",
        ],
        correctIndex: 1,
        explanation: "ไปป์ไลน์ของ Git คือ Working Directory → Staging Area (git add) → Local Repository (git commit) → Remote Repository (git push) ตามลำดับ",
      },
      {
        id: "m7-q2",
        text: "มีไฟล์ใหม่สองไฟล์ในพื้นที่ทำงาน และต้องการบันทึกทั้งสองไฟล์เป็น Commit เดียว ควรทำตามลำดับใด?",
        choices: [
          "git commit -m ก่อน แล้วค่อย git add ทีหลัง",
          "git add ไฟล์ทั้งสอง (หรือ git add .) แล้วตามด้วย git commit -m",
          "git push ทั้งสองไฟล์โดยตรงโดยไม่ต้อง add หรือ commit",
          "git branch ไฟล์ทั้งสองแยกกันคนละสาขา",
        ],
        correctIndex: 1,
        explanation: "ต้อง add ไฟล์เข้า Staging Area ก่อนเสมอ จากนั้นจึง commit — ลำดับนี้ตายตัวตามไปป์ไลน์ของ Git",
      },
      {
        id: "m7-q3",
        text: "ทีมต้องการพัฒนาฟีเจอร์ใหม่โดยไม่กระทบโค้ดหลักจนกว่าจะทดสอบเสร็จเรียบร้อย ควรใช้แนวทางใด?",
        choices: [
          "แก้ไขโค้ดบน master โดยตรงเสมอ",
          "สร้าง Feature Branch แยกออกจาก master แล้วค่อย merge กลับเมื่อพร้อม",
          "ลบ master แล้วสร้างใหม่ทุกครั้งที่มีฟีเจอร์ใหม่",
          "push งานที่ยังไม่เสร็จขึ้น Remote ทันทีที่เริ่มเขียน",
        ],
        correctIndex: 1,
        explanation: "การสร้าง Feature Branch ทำให้ทำงานแยกจาก master ได้อย่างปลอดภัย โดย master จะไม่ได้รับผลกระทบใด ๆ จนกว่าจะมีการ merge กลับเข้าไป",
      },
      {
        id: "m7-q4",
        text: "หลังจาก merge สาขา feature เข้ากับ master ในเครื่องเรียบร้อยแล้ว ต้องทำขั้นตอนใดต่อเพื่อให้ทีมอื่นเห็นผลลัพธ์นี้บน Remote Repository?",
        choices: ["git status", "git push", "git branch -d feature เท่านั้น", "ไม่ต้องทำอะไรเพิ่ม ทีมอื่นจะเห็นเองอัตโนมัติ"],
        correctIndex: 1,
        explanation: "การ merge ในเครื่องมีผลเฉพาะ Local Repository เท่านั้น — ต้อง git push เพื่อส่งผลลัพธ์ล่าสุดขึ้น Remote Repository ให้ทีมอื่นเห็น",
      },
      {
        id: "m7-q5",
        text: "ระหว่างทำงานบน Feature Branch คุณ commit ผิดพลาดไปสองครั้งติดกัน (ยังไม่ push) และต้องการยกเลิกทั้งสอง Commit นั้น โดยเก็บโค้ดที่เปลี่ยนแปลงไว้ในพื้นที่ทำงานเพื่อแก้ไขใหม่ (ไม่ใช่ Staging Area) ควรใช้คำสั่งใด?",
        choices: [
          "git reset --soft <commit ก่อนหน้าสองครั้งนั้น>",
          "git reset --mixed <commit ก่อนหน้าสองครั้งนั้น>",
          "git reset --hard <commit ก่อนหน้าสองครั้งนั้น>",
          "git checkout <file>",
        ],
        correctIndex: 1,
        explanation: '"git reset --mixed" ย้ายตัวชี้ Commit กลับและนำการเปลี่ยนแปลงไปไว้ที่พื้นที่ทำงาน (ไม่ staged) — ตรงกับความต้องการ "เก็บไว้แก้ไขใหม่" ในโจทย์นี้',
      },
      {
        id: "m7-q6",
        text: "ในวงจรการทำงานแบบเต็มรูปแบบ (init → add → commit → branch → merge → push) ขั้นตอนใดเป็นขั้นตอนเดียวที่ต้องพึ่งพาการเชื่อมต่อกับ Remote Repository?",
        choices: ["init", "add และ commit", "push (และ pull/clone)", "branch และ merge"],
        correctIndex: 2,
        explanation: "สอดคล้องกับหลักการ offline-first ของ Git (Module 2) — init/add/commit/branch/merge ทำงานในเครื่องล้วน ๆ มีเพียง push/pull/clone เท่านั้นที่ต้องซิงก์กับ Remote",
      },
      {
        id: "m7-q7",
        text: "ลำดับใดต่อไปนี้จะทำให้ git commit ล้มเหลว (ไม่มีอะไรถูกบันทึกเป็น Commit ใหม่)?",
        choices: [
          "แก้ไขไฟล์ → git add → git commit -m",
          "แก้ไขไฟล์ → git commit -m ทันที โดยไม่ git add ก่อน",
          "git add . → git commit -m",
          "git add <file> → git commit -m",
        ],
        correctIndex: 1,
        explanation: 'ถ้า commit โดยไม่มีอะไรอยู่ใน Staging Area เลย (ลืม git add) คำสั่ง commit จะถูกปฏิเสธ — นี่คือกรณี "nothing to commit" ที่ Module 4 สอนไว้',
      },
      {
        id: "m7-q8",
        text: "ก่อนจะ push งานสุดท้ายของ Capstone นี้ไปยัง Remote Repository จำลอง Local Repository และ Remote Repository มีความสัมพันธ์กันอย่างไร?",
        choices: [
          "ซิงก์กันอัตโนมัติอยู่แล้วตลอดเวลาที่ทำงาน",
          "เป็นอิสระต่อกันอย่างแท้จริง จนกว่าจะมีคำสั่ง push จึงจะซิงก์กัน",
          "Remote Repository จะถูกสร้างขึ้นก็ต่อเมื่อ push เท่านั้น ไม่มีอยู่ก่อนเลย",
          "ไม่มีความสัมพันธ์กันเลยแม้จะ push แล้วก็ตาม",
        ],
        correctIndex: 1,
        explanation: "ตรงกับหลักการ DVCS ที่เรียนมาตั้งแต่ Module 2 และ 6 — Local และ Remote Repository เป็นกราฟ Commit อิสระต่อกันจนกว่าจะมีการ sync (เช่น push) อย่างชัดเจน",
      },
    ],
  },
};

export function getQuiz(id) {
  return QUIZZES[id] || null;
}

/**
 * Scores a list of questions against a set of selected choice indices
 * (aligned by position). Private scoring primitive shared by `scoreQuiz`
 * (full bank) and `scoreQuizAttempt` (bounded random subset) so there is
 * exactly one place that decides "correct or not" (QUIZ-002).
 */
function scoreAgainstQuestions(questions, answers) {
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return { ok: false, error: "invalid_answers" };
  }
  const results = questions.map((q, i) => {
    const selected = answers[i];
    const correct = selected === q.correctIndex;
    return {
      questionId: q.id,
      correct,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    };
  });
  const correctCount = results.filter((r) => r.correct).length;
  return {
    ok: true,
    total: questions.length,
    correctCount,
    percent: questions.length ? Math.round((correctCount / questions.length) * 100) : 0,
    results,
  };
}

/**
 * Scores a set of answers against a quiz's FULL question bank (trusted
 * answer key). `answers` is an array of selected choice indices, aligned by
 * position to `quiz.questions`. Never trusts a client-reported score — this
 * function IS the score, computed fresh from the answer key every time.
 * Kept for the full-bank case (used directly by existing tests and as the
 * base every module's bank-size regression checks against); production quiz
 * submission uses `scoreQuizAttempt` below (P8's bounded random subset).
 */
export function scoreQuiz(quizId, answers) {
  const quiz = getQuiz(quizId);
  if (!quiz) return { ok: false, error: "unknown_quiz" };
  return scoreAgainstQuestions(quiz.questions, answers);
}

// ---------------------------------------------------------------------------
// P8: bounded random subset per attempt (Owner spec §3), stateless & secure.
//
// Design (see docs/PROJECT_CONTEXT.md's P8 report for the full rationale):
//   - `selectQuizQuestions(quizId, seedKey, count)` deterministically shuffles
//     a quiz's FULL bank using a seeded PRNG and returns the first `count`
//     questions — same seedKey always yields the same subset (SIM-013-style
//     determinism), different seedKey yields a different subset.
//   - The Worker (worker/src/routes/quiz.js) computes `seedKey` itself, from
//     data it alone reads (the authenticated user's id, from the session —
//     never client-supplied — and that user's own PREVIOUS quiz_results row
//     for this quiz, if any, via its `updated_at`). The frontend computes the
//     identical seedKey the same way (reading its own already-fetched
//     GET /api/quiz-results — never anything the learner can edit to change
//     the outcome) purely so it can render the SAME subset the Worker will
//     independently score — the frontend's computation is never trusted for
//     scoring.
//   - Because the Worker recomputes the subset itself and never accepts a
//     client-declared question list, a learner cannot choose which questions
//     get served (cannot "pick only the easy ones") and cannot forge which
//     questions were served — the Worker's own recomputation is the only
//     thing that ever determines what is scored (mirrors ADR-013's replay
//     model: one authoritative computation, never a client-supplied claim).
//   - No new D1 table/column and no signed token/session state was needed —
//     this reuses data already persisted for an unrelated reason (the
//     existing latest-attempt row), which is why this stays a "simpler
//     deterministic rotation" rather than the server-side attempt/session
//     table the Owner brief explicitly said to avoid inventing.
//   - Because the seed is not different on every single page load (only
//     after a real submission changes the previous row's timestamp), a
//     same-day reload without submitting shows the same subset — this is the
//     accepted "simpler deterministic rotation" tradeoff, not true
//     per-page-load randomness, and is stated as such rather than
//     oversold as a stronger guarantee than it is.

export const QUIZ_ATTEMPT_SIZE = 5;

function hashSeed(str) {
  // FNV-1a 32-bit — deterministic, no crypto dependency needed for a
  // fairness/rotation mechanism (not a security-sensitive secret).
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(array, seedStr) {
  const rand = mulberry32(hashSeed(seedStr));
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Builds the deterministic seed string shared by the frontend (display) and
 * the Worker (authoritative scoring) — see the design note above. `userId`
 * is always server-resolved (session) on the Worker side; the frontend has
 * its own already-authenticated user id available the same way it already
 * has for every other per-user display. `previousUpdatedAt` is the existing
 * quiz_results row's `updated_at` for this (user, quiz), or null/undefined
 * if the learner has never attempted this quiz before.
 */
export function buildQuizAttemptSeed(userId, quizId, previousUpdatedAt) {
  return `${userId}:${quizId}:${previousUpdatedAt || "first-attempt"}`;
}

/**
 * Deterministically selects a bounded subset of a quiz's question bank for
 * one attempt. Returns the full bank (in original order) when the bank is
 * not larger than `count` — there is nothing meaningful to subset in that
 * case. Returns null for an unknown quiz id.
 */
export function selectQuizQuestions(quizId, seedKey, count = QUIZ_ATTEMPT_SIZE) {
  const quiz = getQuiz(quizId);
  if (!quiz) return null;
  if (quiz.questions.length <= count) return quiz.questions.slice();
  return seededShuffle(quiz.questions, `${quizId}:${seedKey}`).slice(0, count);
}

/** Display-only shape (never includes correctIndex/explanation) for rendering an attempt. */
export function questionsForDisplay(questions) {
  return questions.map((q) => ({ id: q.id, text: q.text, choices: q.choices }));
}

/**
 * Scores a submitted answers array against the SAME deterministically-
 * selected subset the seedKey implies — never against anything the caller
 * claims was served. `answers` must align by position to the subset
 * `selectQuizQuestions` would itself produce for this exact seedKey.
 */
export function scoreQuizAttempt(quizId, seedKey, answers, count = QUIZ_ATTEMPT_SIZE) {
  const subset = selectQuizQuestions(quizId, seedKey, count);
  if (!subset) return { ok: false, error: "unknown_quiz" };
  return scoreAgainstQuestions(subset, answers);
}
