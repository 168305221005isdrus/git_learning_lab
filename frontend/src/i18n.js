// Git Learning Lab — Thai-first UI strings (P3, Part A/Translation Discipline).
//
// Lightweight, centralized string table — NOT an i18n framework. Per the P3
// session brief: "do NOT build a large internationalization framework, do
// NOT add a heavy i18n dependency, do NOT build English language switching."
// This file exists only to avoid scattering duplicate Thai strings across
// every component; it is a plain object, looked up via `t(key)`.
//
// Rule (Engineering skill §9, §15 applied to language): Git commands
// themselves (`git add`, `git commit`, ...) are NEVER translated or given
// invented Thai equivalents — only the surrounding explanation is Thai. Real
// Git terminology a learner will meet outside this app (English) is kept
// alongside its Thai explanation wherever it first appears, so the learner
// becomes familiar with the vocabulary they'll actually see.

export const STRINGS = {
  // Top-level nav / app shell
  appTitle: "Git Learning Lab",
  tagline: "เรียน Git และ GitHub ด้วยการลงมือทำจริง",
  navLessons: "บทเรียน",
  navSimulator: "เครื่องจำลอง Git",
  navChallenges: "แบบฝึกท้าทาย",
  navQuizzes: "แบบทดสอบ",
  navProgress: "ความคืบหน้า",
  navCheatsheet: "สรุปคำสั่ง Git",
  navHowTo: "วิธีใช้งาน",
  navAdmin: "ผู้ดูแลระบบ",
  navDashboard: "หน้าหลัก",
  navHistory: "ประวัติการเรียน",
  signIn: "เข้าสู่ระบบ",
  signOut: "ออกจากระบบ",
  username: "ชื่อผู้ใช้",
  password: "รหัสผ่าน",
  showPassword: "แสดงรหัสผ่าน",
  hidePassword: "ซ่อนรหัสผ่าน",
  signedInAs: (identifier, role) => `เข้าสู่ระบบในชื่อ ${identifier} (${roleLabel(role)})`,
  invalidCredentials: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
  recoveryExpired: "รหัสผ่านชั่วคราวหมดอายุแล้ว กรุณาติดต่อผู้ดูแลระบบเพื่อขอรหัสใหม่",
  setNewPassword: "ตั้งรหัสผ่านใหม่",
  temporaryCredentialNotice: "บัญชีของคุณกำลังใช้รหัสผ่านชั่วคราว กรุณาตั้งรหัสผ่านใหม่ก่อนใช้งานต่อ",
  newPasswordMin: "รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)",
  passwordTooShort: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
  couldNotSetPassword: "ไม่สามารถตั้งรหัสผ่านใหม่ได้ กรุณาลองใหม่",
  apiHealthLabel: "สถานะ API:",
  apiHealthReachable: "เชื่อมต่อได้ ✓",
  apiHealthUnreachable: "เชื่อมต่อไม่ได้",
  apiHealthNotOk: "เชื่อมต่อได้ แต่ระบบตอบว่าไม่ปกติ",

  // Register (P4)
  registerHeading: "สมัครสมาชิก (นักเรียน)",
  registerIntro: "การสมัครสมาชิกนี้ใช้สำหรับนักเรียนเท่านั้น บัญชีครู/ผู้ดูแลระบบต้องให้ผู้ดูแลระบบเป็นผู้สร้างให้",
  registerFullName: "ชื่อ-นามสกุล",
  registerUsername: "ชื่อผู้ใช้ (ใช้เข้าสู่ระบบ)",
  registerUsernameHelp: "ตัวอักษรภาษาอังกฤษ ตัวเลข จุด ขีดกลาง หรือขีดล่าง 3-32 ตัวอักษร",
  registerStudentId: "รหัสนักศึกษา",
  registerEmail: "อีเมลมหาวิทยาลัย (ไม่บังคับ)",
  registerEmailHelp: "หากกรอก ต้องเป็นอีเมล @rmutsb.ac.th เท่านั้น",
  registerPassword: "รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)",
  registerConfirmPassword: "ยืนยันรหัสผ่าน",
  registerSubmit: "สมัครสมาชิก",
  registerSubmitting: "กำลังสมัครสมาชิก...",
  registerHaveAccount: "มีบัญชีอยู่แล้ว?",
  registerGoToLogin: "เข้าสู่ระบบ",
  registerNoAccount: "ยังไม่มีบัญชี?",
  registerGoToRegister: "สมัครสมาชิก (นักเรียน)",
  registerSuccess: "สมัครสมาชิกสำเร็จ กำลังเข้าสู่ระบบ...",
  regErrFullNameRequired: "กรุณากรอกชื่อ-นามสกุล",
  regErrInvalidUsername: "ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ/ตัวเลข 3-32 ตัวอักษร (ใช้ . _ - ได้)",
  regErrUsernameTaken: "มีผู้ใช้ชื่อนี้อยู่แล้ว กรุณาเลือกชื่อผู้ใช้อื่น",
  regErrInvalidStudentId: "รูปแบบรหัสนักศึกษาไม่ถูกต้อง",
  regErrStudentIdTaken: "มีรหัสนักศึกษานี้ในระบบอยู่แล้ว",
  regErrPasswordTooShort: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
  regErrPasswordsDoNotMatch: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
  regErrInvalidEmailDomain: "อีเมลต้องเป็น @rmutsb.ac.th เท่านั้น",
  regErrEmailTaken: "มีอีเมลนี้ในระบบอยู่แล้ว",
  regErrConflict: "ไม่สามารถสมัครสมาชิกได้ในขณะนี้ กรุณาลองใหม่",
  regErrGeneric: "ไม่สามารถสมัครสมาชิกได้ กรุณาตรวจสอบข้อมูลแล้วลองใหม่",

  // Roles
  roleStudent: "นักเรียน",
  roleTeacher: "ครูผู้สอน",
  roleAdmin: "ผู้ดูแลระบบ",

  // Module titles (Thai-first, English term kept alongside per Translation Discipline)
  moduleTitle1: "Module 1 — รากฐานการควบคุมเวอร์ชัน (Version Control Foundations)",
  moduleTitle2: "Module 2 — Git และ GitHub เบื้องต้น",
  moduleTitle3: "Module 3 — Git Workflow และ Staging",
  moduleTitle4: "Module 4 — Commit, ประวัติ, Diff และการย้อนกลับ",
  moduleTitle5: "Module 5 — Branching และ Merging",
  moduleTitle6: "Module 6 — Remote Repositories",
  moduleTitle7: "Module 7 — Capstone: วงจร Git แบบเต็มรูปแบบ",

  // Lessons panel
  lessonsHeading: "บทเรียน",
  statusNotStarted: "ยังไม่เริ่ม",
  statusStarted: "กำลังเรียน",
  statusCompleted: "เรียนจบแล้ว",
  statusComingLater: "เนื้อหาจะมาในเฟสถัดไป",
  quizStatusLabel: "แบบทดสอบ",
  challengeStatusLabel: "แบบฝึกท้าทาย",

  // Lesson flow section titles (protected 4-stage flow, UX skill §6)
  stageExplanation: "อธิบาย",
  stageDemonstration: "ตัวอย่าง",
  stagePractice: "ฝึกปฏิบัติ",
  stageFeedback: "ผลตอบรับ",

  // Onboarding
  onboardingHeading: "วิธีใช้งาน",
  onboardingIntro:
    "แพลตฟอร์มนี้สอน Git และ GitHub ผ่านบทเรียน เครื่องจำลอง Git และแบบฝึกหัด — คุณไม่จำเป็นต้องมีครูอธิบายก่อนก็เริ่มเรียนได้",
  onboardingSimulatorNotice:
    '⚠ "เครื่องจำลอง Git" (Terminal) ในหน้านี้ไม่ได้รันคำสั่งบนคอมพิวเตอร์จริงของคุณ — มันจำลองพฤติกรรมของ Git อย่างถูกต้อง เพื่อให้คุณฝึกได้อย่างปลอดภัย',
  onboardingEditorNotice:
    '"ตัวแก้ไขไฟล์" (File Editor) ใช้จำลองการสร้าง/แก้ไขไฟล์ในพื้นที่ทำงาน (Working Directory) — Git เองไม่มีคำสั่งสร้างไฟล์ นี่คือส่วนเสริมของแอปเพื่อให้คุณฝึกได้ครบวงจร',
  onboardingOneCommandNotice: "พิมพ์คำสั่ง Git ครั้งละ 1 คำสั่งเสมอ แล้วกด Enter",
  onboardingEnglishNotice:
    "คำสั่ง Git (เช่น git add, git commit) ยังคงเป็นภาษาอังกฤษเสมอ เพราะเป็นไวยากรณ์จริงของ Git ที่คุณจะใช้ในโลกจริง",
  onboardingSteps: [
    "อ่านเนื้อหา",
    "ดูตัวอย่าง",
    "สร้างหรือแก้ไฟล์จำลองเมื่อบทเรียนกำหนด",
    "พิมพ์คำสั่ง Git ใน Terminal",
    "ดูการเปลี่ยนแปลงใน Visualizer",
    "รับ Feedback",
    "ทำ Quiz / Challenge",
    "ดูความคืบหน้า",
  ],

  // Simulator workspace / hints
  simulatorHeading: "เครื่องจำลอง Git",
  simulatorFreePlayNotice: "โหมดฝึกอิสระ — ลองคำสั่ง Git อะไรก็ได้ที่คุณเรียนมาแล้ว",
  fileEditorHeading: "ตัวแก้ไขไฟล์ในพื้นที่ทำงาน (Working Directory)",
  fileEditorHelp: "จำลองการใช้โปรแกรมแก้ไขข้อความคู่กับ Terminal ของคุณ — นี่ไม่ใช่คำสั่ง Git",
  fileEditorName: "ชื่อไฟล์",
  fileEditorContent: "เนื้อหาไฟล์",
  fileEditorSave: "บันทึกไฟล์",
  hintStart: 'เริ่มด้วย "git init"',
  hintOneAtATime: "พิมพ์คำสั่งครั้งละ 1 คำสั่ง",
  hintAfterAdd: 'หลัง "git add" ให้สังเกตไฟล์ใน พื้นที่เตรียม Commit (Staging Area)',
  hintNoCommand: "ไม่ทราบว่าจะพิมพ์อะไร? ลองดูตัวอย่างในหัวข้อ Demonstration ด้านบน",

  // Terminal
  terminalHeadingSuffix: " (Terminal จำลอง — ไม่ใช่ Terminal จริงของเครื่องคุณ)",
  terminalInputLabel: "พิมพ์คำสั่ง Git",
  terminalRun: "รัน",
  terminalNoOutput: "(ไม่มีผลลัพธ์)",

  // Visualizer zones (protected four-zone contract, UX skill §9)
  zoneWorkingDirectory: "พื้นที่ทำงาน (Working Directory)",
  zoneStagingArea: "พื้นที่เตรียม Commit (Staging Area)",
  zoneLocalRepository: "Repository ในเครื่อง (Local Repository)",
  zoneRemoteRepository: "Repository ระยะไกล (Remote Repository)",
  zoneEmptyWorking: "ยังไม่มีไฟล์ — ลองรัน \"git init\" เพื่อเริ่มต้น",
  zoneEmptyStaging: "ยังไม่มีอะไรถูกเตรียมไว้",
  zoneEmptyLocal: "ยังไม่มี Commit",
  zoneEmptyRemote: "Remote ยังว่างอยู่จนกว่าจะ push",
  branchLabel: "สาขา (Branch): ",
  headMarker: " ← HEAD",
  fileStatusUntracked: "ยังไม่ถูกติดตาม (Untracked)",
  fileStatusModified: "ถูกแก้ไข (Modified)",
  fileStatusStaged: "เตรียมพร้อม (Staged)",
  fileStatusCommitted: "บันทึกแล้ว (Committed)",

  // Cheat sheet
  cheatsheetHeading: "สรุปคำสั่ง Git",
  cheatsheetGroupInit: "เริ่ม Repository",
  cheatsheetGroupFiles: "จัดการไฟล์",
  cheatsheetGroupCommit: "Commit / History",
  cheatsheetGroupUndo: "ย้อนกลับ (Undo)",
  cheatsheetGroupBranch: "Branch",
  cheatsheetGroupRemote: "Remote",
  cheatsheetCommandCol: "คำสั่ง",
  cheatsheetDescCol: "คำอธิบาย",

  // Progress
  progressHeading: "ความคืบหน้า",
  progressLoadError: "ไม่สามารถโหลดความคืบหน้าได้ในขณะนี้",
  progressEmpty: "ยังไม่มีความคืบหน้าที่บันทึกไว้ — เริ่มเรียนบทเรียนใดบทเรียนหนึ่งเพื่อดูที่นี่",
  progressModuleCol: "บทเรียน",
  progressLessonCol: "สถานะบทเรียน",
  progressQuizCol: "แบบทดสอบ",
  progressChallengeCol: "แบบฝึกท้าทาย",
  progressUpdated: (date) => `อัปเดตล่าสุด ${date}`,
  progressNoQuiz: "—",
  progressNoChallenge: "—",

  // Dashboard (P4)
  dashboardWelcome: (identifier) => `สวัสดี, ${identifier}`,
  dashboardSubtitle: "นี่คือภาพรวมความคืบหน้าของคุณ",
  dashboardOverallLabel: "ความคืบหน้าโดยรวม",
  dashboardOverallSummary: (done, total) => `เรียนจบแล้ว ${done} จาก ${total} บทเรียน`,
  dashboardContinue: "ทำต่อ",
  dashboardStart: "เริ่มเรียน",
  dashboardReview: "ทบทวนอีกครั้ง",
  dashboardModulesHeading: "บทเรียนทั้งหมด",
  dashboardEmptyTitle: "ยินดีต้อนรับ! คุณยังไม่เริ่มเรียนบทเรียนใดเลย",
  dashboardEmptyBody: "เริ่มจาก Module 1 เพื่อปูพื้นฐานก่อนได้เลย",
  dashboardEmptyCta: "เริ่มเรียน Module 1",
  dashboardQuizBadge: (percent) => `แบบทดสอบ ${percent}%`,
  dashboardChallengePassedBadge: "แบบฝึกท้าทายผ่านแล้ว",
  dashboardChallengeNotPassedBadge: "แบบฝึกท้าทายยังไม่ผ่าน",
  dashboardComingLater: "เนื้อหาจะมาในเฟสถัดไป",

  // Learning History (P4)
  historyHeading: "ประวัติการเรียน",
  historyIntro: "รายการนี้แสดงเฉพาะกิจกรรมการเรียนของคุณเองเท่านั้น",
  historyLastActivity: (date) => `กิจกรรมล่าสุด: ${date}`,
  historyEmpty: "ยังไม่มีประวัติการเรียน — เริ่มเรียนบทเรียนใดบทเรียนหนึ่งเพื่อดูที่นี่",
  historyLoadError: "ไม่สามารถโหลดประวัติการเรียนได้ในขณะนี้",
  historyEventModuleStarted: (title) => `เริ่มเรียน: ${title}`,
  historyEventModuleCompleted: (title) => `เรียนจบแล้ว: ${title}`,
  historyEventQuiz: (title, correct, total, percent) => `ทำแบบทดสอบ: ${title} — ถูก ${correct}/${total} (${percent}%)`,
  historyEventChallengePassed: (title) => `ผ่านแบบฝึกท้าทาย: ${title}`,
  historyEventChallengeFailed: (title) => `ทำแบบฝึกท้าทาย (ยังไม่ผ่าน): ${title}`,

  // Dashboard course-completion banner (P5)
  dashboardCourseCompleteTitle: "🎉 ยินดีด้วย! คุณเรียนจบหลักสูตรครบทุกข้อกำหนดแล้ว",
  dashboardCourseCompleteBody: "คุณทำครบทุกบทเรียน แบบทดสอบ และแบบฝึกท้าทายที่จำเป็นแล้ว สามารถขอรับใบประกาศนียบัตรได้เลย",
  dashboardGoToCertificate: "ไปที่หน้าใบประกาศนียบัตร",

  // Progress panel completion summary (P5)
  progressCompletionSummary: (done, total, percent) => `ความคืบหน้ารวมของหลักสูตร: เสร็จแล้ว ${done}/${total} โมดูล (${percent}%)`,
  progressCompletionDone: "🎉 คุณทำครบทุกข้อกำหนดของหลักสูตรแล้ว — ขอรับใบประกาศนียบัตรได้ที่เมนู \"ใบประกาศนียบัตร\"",

  // Certificate panel (P5)
  certificateHeading: "ใบประกาศนียบัตร",
  certificateIntro: "ใบประกาศนียบัตรจะออกให้หลังจากคุณทำครบทุกข้อกำหนดของหลักสูตรนี้เท่านั้น ระบบตรวจสอบความครบถ้วนจากฝั่งเซิร์ฟเวอร์เสมอ",
  certificateLoadError: "ไม่สามารถโหลดข้อมูลใบประกาศนียบัตรได้ในขณะนี้",
  certificateProgressLabel: "ความคืบหน้าของหลักสูตร",
  certificateCompleteBanner: "คุณทำครบทุกข้อกำหนดของหลักสูตรแล้ว",
  certificateIssueButton: "ออกใบประกาศนียบัตร",
  certificateIssuing: "กำลังออกใบประกาศนียบัตร...",
  certErrStudentOnly: "ใบประกาศนียบัตรออกให้เฉพาะบัญชีนักเรียนเท่านั้น",
  certErrNotComplete: "คุณยังทำไม่ครบตามข้อกำหนดของหลักสูตร",
  certificateIssueError: "ไม่สามารถออกใบประกาศนียบัตรได้ในขณะนี้ กรุณาลองใหม่",
  certificateNotEligibleNotice: "ใบประกาศนียบัตรจะพร้อมใช้งานเมื่อคุณทำครบทุกข้อกำหนดของหลักสูตรด้านล่างนี้",
  certificateRemainingHeading: "สิ่งที่ต้องทำให้ครบก่อนขอใบประกาศนียบัตร",
  certificateMissingLesson: "เรียนบทเรียนให้จบ",
  certificateMissingQuiz: "ทำแบบทดสอบ",
  certificateMissingChallenge: "ผ่านแบบฝึกท้าทาย",
  certificateMissingModuleLine: (title, items) => `${title} — ยังไม่เสร็จ: ${items}`,
  certificateKicker: "Git Learning Lab",
  certificateStatementIntro: "ใบประกาศนียบัตรฉบับนี้มอบให้แก่",
  certificateStatement: "เพื่อรับรองว่าได้สำเร็จหลักสูตร Git Learning Lab ตามข้อกำหนดของหลักสูตรครบถ้วนทุกประการ",
  certificateIssuedDateLabel: "วันที่ออกใบประกาศนียบัตร",
  certificateIdLabel: "รหัสใบประกาศนียบัตร (Certificate ID)",
  certificateVerifyUrlLabel: "ลิงก์สำหรับตรวจสอบใบประกาศนียบัตร",
  certificatePrintButton: "พิมพ์ / บันทึกเป็น PDF",
  certificateCopyLinkButton: "คัดลอกลิงก์ตรวจสอบ",
  certificateCopyLinkSuccess: "คัดลอกลิงก์แล้ว ✓",
  certificateViewVerifyButton: "เปิดหน้าตรวจสอบใบประกาศนียบัตรสาธารณะ",

  // Public certificate verification screen (P5)
  verifyHeading: "ตรวจสอบใบประกาศนียบัตร",
  verifyIntro: "กรอกรหัสใบประกาศนียบัตร (Certificate ID) เพื่อตรวจสอบความถูกต้อง — ไม่ต้องเข้าสู่ระบบ",
  verifyInputLabel: "รหัสใบประกาศนียบัตร",
  verifyButton: "ตรวจสอบ",
  verifyCheckingLabel: "กำลังตรวจสอบ...",
  verifyResultValidHeading: "✓ ใบประกาศนียบัตรนี้ถูกต้อง",
  verifyResultInvalidHeading: "✖ ไม่พบใบประกาศนียบัตรนี้ หรือรหัสไม่ถูกต้อง",
  verifyLearnerNameLabel: "ชื่อผู้สำเร็จหลักสูตร",
  verifyCourseNameLabel: "หลักสูตร",
  verifyIssuedDateLabel: "วันที่ออกใบประกาศนียบัตร",
  verifyBackToLogin: "กลับไปหน้าเข้าสู่ระบบ",

  // Quiz
  quizSubmit: "ส่งคำตอบ",
  quizRetake: "ทำแบบทดสอบอีกครั้ง",
  quizCorrectCount: (correct, total) => `ตอบถูก ${correct} จาก ${total} ข้อ`,
  quizScorePercent: (pct) => `คิดเป็น ${pct}%`,
  quizYourAnswerCorrect: "✓ ถูกต้อง",
  quizYourAnswerWrong: "✖ ไม่ถูกต้อง",
  quizExplanationLabel: "คำอธิบาย: ",
  quizPickOne: "กรุณาเลือกคำตอบให้ครบทุกข้อก่อนส่ง",
  quizLoadError: "ไม่สามารถโหลดแบบทดสอบได้ในขณะนี้",

  // Challenges
  challengeGoalLabel: "เป้าหมาย",
  challengeHintLabel: "คำใบ้",
  challengeShowHint: "แสดงคำใบ้",
  challengeSubmit: "ส่งเพื่อตรวจ",
  challengeReset: "เริ่มแบบฝึกนี้ใหม่",
  challengePassed: "ผ่านแล้ว! 🎉",
  challengeFailed: "ยังไม่ผ่าน — ลองอีกครั้งได้เลย",
  challengeSubmitting: "กำลังตรวจสอบ...",
  challengeLoadError: "ไม่สามารถโหลดแบบฝึกท้าทายนี้ได้ในขณะนี้",
  challengeNetworkError: "ส่งไม่สำเร็จ ตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง",

  // Admin
  adminHeading: "ผู้ดูแลระบบ",
  adminAccountsHeading: "บัญชีผู้ใช้",
  adminLoadError: "ไม่สามารถโหลดบัญชีผู้ใช้ได้",
  adminIssueHeading: "ออกรหัสผ่านชั่วคราว",
  adminIssueButton: "ออกรหัสผ่านชั่วคราว",
  adminUserNotFound: "ไม่พบบัญชีผู้ใช้นี้",
  adminIssueError: "ไม่สามารถออกรหัสผ่านชั่วคราวได้",
};

function roleLabel(role) {
  if (role === "STUDENT") return STRINGS.roleStudent;
  if (role === "TEACHER") return STRINGS.roleTeacher;
  if (role === "ADMIN") return STRINGS.roleAdmin;
  return role;
}

/** Looks up a string by key; throws loudly on a typo rather than silently
 * rendering "undefined" to a learner (better caught in dev/tests than in a
 * classroom). Non-function values are returned as-is; function values are
 * called with the given args (for the small number of parameterized strings
 * above). */
export function t(key, ...args) {
  if (!(key in STRINGS)) {
    throw new Error(`i18n: missing Thai string for key "${key}"`);
  }
  const value = STRINGS[key];
  return typeof value === "function" ? value(...args) : value;
}
