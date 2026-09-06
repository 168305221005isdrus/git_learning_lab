/**
 * Git Learning Lab — Quiz question bank (P3, QUIZ-001..003).
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
    ],
  },

  "module-4": {
    id: "module-4",
    moduleId: "module-4",
    title: "แบบทดสอบ Module 4 — Commit, History, Diff และการย้อนกลับ",
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
    ],
  },
};

export function getQuiz(id) {
  return QUIZZES[id] || null;
}

/**
 * Scores a set of answers against a quiz's trusted answer key (QUIZ-002:
 * one scoring implementation, reused everywhere — never a per-quiz
 * hand-rolled scorer). `answers` is an array of selected choice indices,
 * aligned by position to `quiz.questions`. Never trusts a client-reported
 * score — this function IS the score, computed fresh from the answer key
 * every time (frontend for instant local feedback, Worker for the
 * persisted, authoritative result).
 */
export function scoreQuiz(quizId, answers) {
  const quiz = getQuiz(quizId);
  if (!quiz) return { ok: false, error: "unknown_quiz" };
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    return { ok: false, error: "invalid_answers" };
  }

  const results = quiz.questions.map((q, i) => {
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
    total: quiz.questions.length,
    correctCount,
    percent: Math.round((correctCount / quiz.questions.length) * 100),
    results,
  };
}
