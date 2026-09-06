# Scope — Git Learning Lab v0.9 Classroom MVP

Defines the boundary for the release due **Saturday, September 12, 2026**. When in doubt, the
narrower reading wins — this document exists specifically to prevent scope creep under deadline
pressure. See `skills/git_learning_lab/engineering/SKILL.md` §21 for the process rule this document
implements.

---

## IN SCOPE

### Must Have (release-blocking — MVP does not ship without these)

- **Structured lessons** covering the curriculum in `docs/LEARNING_OBJECTIVES.md`, following the
  protected Lesson → Demonstration → Practice → Feedback flow (UX skill §6).
- **Git simulator**: a deterministic, browser-side JavaScript state machine covering the commands in
  scope (`docs/LEARNING_OBJECTIVES.md`; `docs/REQUIREMENTS.md` SIM-xxx).
- **Visualizer**: renders Working Directory / Staging Area / Local Repository / Remote Repository as
  four distinct, always-legible zones, plus branch/HEAD/commit-graph rendering (UX skill §9–§10).
- **Simulated terminal**: keyboard-navigable command input with input/output distinction and
  specific, explanatory error feedback (UX skill §7, §18).
- **Challenges**: at least one practice challenge for each of Modules 3–7 (Modules 1–2 are conceptual
  and introduce no simulator commands, so no challenge is required there — see
  `docs/LEARNING_OBJECTIVES.md`). Validated server-side: the Cloudflare Worker replays the learner's
  submitted command transcript through the shared simulator core against a Worker-reconstructed
  authoritative starting state, and derives pass/fail itself — never by trusting a client-reported
  final state or `completed`/`passed` flag (`docs/ARCHITECTURE_DECISIONS.md` ADR-013).
- **Quizzes**: at least one quiz for each of Modules 1–6, with per-question feedback (not just an
  aggregate score). Module 7's quiz is Should-Have, not required.
- **Learner progress persistence**: accounts, sign-in, and progress/quiz/challenge results persisted
  in Cloudflare D1, surviving sign-out/sign-in and device changes.
- **Three-role account model**: Student, Teacher, Admin, exactly as locked in
  `docs/PROJECT_CONTEXT.md` §5.
- **Admin-mediated password recovery**: exactly the flow locked in `docs/PROJECT_CONTEXT.md` §6.
- **Cheat sheet**: a reference page listing the in-scope commands with PDF-consistent terminology.
- **Responsive behavior**: usable at narrow (~375–420px), medium (~768px), and wide (~1280px+)
  viewports (UX skill §11.D).
- **Practical accessibility baseline**: keyboard operability, visible focus, semantic markup, no
  color-only status signaling (UX skill §12).
- **Security baseline**: authentication, password hashing, cross-user/cross-role data isolation, XSS
  prevention, CSRF mitigation appropriate to the chosen auth design, no real shell/eval execution
  from any input (Engineering skill §17).
- **Cloud deployment**: live on a Cloudflare `*.pages.dev` URL, deployed from the GitHub repository,
  within free-tier limits.
- **Testing**: a transition-test corpus for the simulator (happy-path + invalid-sequence per
  in-scope command, Engineering skill §12) and basic regression coverage for auth/data-isolation.

### Should Have (build if the Must-Have list completes with time to spare — never at the expense of a Must Have)

- A slightly larger challenge/quiz bank than the per-module minimum defined in
  `docs/REQUIREMENTS.md` (CHAL-001, QUIZ-001).
- Module 7's optional capstone quiz (QUIZ-001b).
- Minor visual polish to the visualizer's animations (e.g., a HEAD-movement transition) beyond the
  functional minimum.
- A small number of additional worked examples per lesson, drawn from the PDF's own examples.

If a Should-Have item would put the Sept 12 date at risk, it is deferred — no exceptions without a
fresh Owner Decision.

---

## OUT OF SCOPE / DEFERRED (post-v0.9)

- Full Teacher Dashboard / classroom analytics tooling (the Teacher **account/role** itself is in
  scope; the dashboard is not).
- Complex analytics infrastructure beyond a learner viewing their own progress.
- Self-service email password reset, and any email-delivery provider integration.
- Social features, leaderboards, or extensive gamification (points, badges, streaks).
- Any Git command or GitHub workflow not covered by `docs/Git & GitHub.pdf` (e.g., `git switch`,
  `git restore`, `git rebase`, `.gitignore`, Pull Request workflows) — each requires a fresh, explicit
  Owner Decision before it can be added.
- Any authorization model beyond the three explicit v0.9 roles.
- Paid hosting, a paid domain, or any infrastructure exceeding Cloudflare free-tier limits.
- Multi-class / multi-teacher / multi-organization support — v0.9 assumes one class.
- Real shell/process execution in any form — this is a permanent prohibition, not a deferral.

---

## NON-GOALS

Things this project deliberately does not attempt to be, now or later, unless a future Owner
Decision explicitly changes the product's identity:

- Not a general-purpose Learning Management System (LMS) — no course marketplace, no
  multi-subject support, no generic quiz-authoring platform for non-Git content.
- Not a full Git GUI client or IDE plugin.
- Not a replacement for real Git/GitHub usage — it is a teaching simulator; it does not aim to
  support every real-world Git workflow, only the PDF's curriculum.
- Not a social coding platform — no public profiles, following, comments, or sharing features.

---

## RELEASE-BLOCKING CAPABILITIES

The MVP does not ship to real students unless **all** of the following are true:

1. A Student can sign in, complete at least one full module (lesson → demonstration → practice →
   feedback), and see their progress persist across a sign-out/sign-in cycle.
2. The simulator correctly rejects at least the canonical invalid case (`git commit` with nothing
   staged produces no commit) and every in-scope command has a passing happy-path test.
3. A Teacher account can sign in and use the learner experience (no dashboard required).
4. An Admin can issue a temporary password to a locked-out user, and that user can sign in and set a
   new password.
5. No learner can view or modify another learner's progress, quiz results, or challenge results.
6. No user input reaches a real shell, `eval`, or filesystem-executing API, verified by the
   command-parser boundary (Engineering skill §10).
7. The application is live on a Cloudflare `*.pages.dev` URL, deployed from the GitHub repository,
   and a core flow (sign-in → one lesson → one simulator command) is smoke-tested on that URL.
8. Infrastructure cost is 0 THB (free tier only).
9. A forged challenge-completion request (a fabricated `passed=true` or final-state payload with no
   valid, replayable command transcript) is rejected by the Worker, not silently accepted
   (`docs/ARCHITECTURE_DECISIONS.md` ADR-013; `docs/REQUIREMENTS.md` CHAL-002, TEST-006).
