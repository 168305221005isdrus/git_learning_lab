// Git Learning Lab — P13: ADR-013 (challenge replay) + quiz-authority +
// completion/certificate runtime proof. This is the highest-value part of
// the runtime suite: it proves, against the REAL Worker code running in a
// REAL Workers runtime (not fake-D1), that forged client input is ignored
// and the server derives every result itself.
import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import { apiRequest, registerStudent } from "./helpers.js";

describe("ADR-013: challenge results are decided by server-side transcript replay, never trusted client fields", () => {
  it("a forged passed:true / fabricated finalState is ignored — only the transcript decides", async () => {
    const { cookie } = await registerStudent();

    const forged = await apiRequest("/api/challenge/submit", {
      method: "POST",
      cookie,
      body: {
        challengeId: "challenge-module-3",
        transcript: [], // did nothing
        passed: true, // forged — must be ignored
        finalState: { stagingArea: { "a.txt": "1", "b.txt": "1" } }, // forged — must be ignored
      },
    });
    expect(forged.status).toBe(200);
    const forgedBody = await forged.json();
    expect(forgedBody.passed).toBe(false); // an empty transcript cannot pass challenge-module-3

    const real = await apiRequest("/api/challenge/submit", {
      method: "POST",
      cookie,
      body: {
        challengeId: "challenge-module-3",
        transcript: ["git add a.txt", "git add b.txt", "git rm --cached d.txt"],
      },
    });
    expect(real.status).toBe(200);
    const realBody = await real.json();
    expect(realBody.passed).toBe(true); // only a real, correct transcript passes
  });

  it("a non-array transcript is rejected before any replay is attempted", async () => {
    const { cookie } = await registerStudent();
    const res = await apiRequest("/api/challenge/submit", {
      method: "POST",
      cookie,
      body: { challengeId: "challenge-module-3", transcript: "git add a.txt", passed: true },
    });
    expect(res.status).toBe(400);
  });
});

describe("Quiz authority: server recomputes the score from a server-selected subset (real Worker runtime)", () => {
  it("rejects an answers array shaped like the full 8-question bank instead of the served 5-question subset", async () => {
    const { cookie } = await registerStudent();
    const res = await apiRequest("/api/quiz/submit", {
      method: "POST",
      cookie,
      body: { quizId: "module-1", answers: [0, 0, 0, 0, 0, 0, 0, 0] },
    });
    expect(res.status).toBe(400);
  });

  it("scores a correctly-shaped submission server-side, not from any client-reported score", async () => {
    const { cookie } = await registerStudent();
    const res = await apiRequest("/api/quiz/submit", {
      method: "POST",
      cookie,
      body: { quizId: "module-1", answers: [0, 0, 0, 0, 0], percent: 100, correctCount: 5 }, // forged fields ignored
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.total).toBe(5);
    // The Worker computed this from the real answer key — an all-zero guess
    // is very unlikely to be a perfect score, proving it wasn't just echoed
    // back from the forged `percent: 100` in the request body.
    expect(body.percent).not.toBe(100);
  });
});

describe("Completion is derived server-side from persisted rows (real Worker runtime)", () => {
  it("a brand-new learner with no activity is not complete", async () => {
    const { cookie } = await registerStudent();
    const res = await apiRequest("/api/completion", { cookie });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.completion.isComplete).toBe(false);
  });
});

describe("Certificate issuance/verification (real Worker runtime)", () => {
  it("an incomplete learner cannot issue a certificate", async () => {
    const { cookie } = await registerStudent();
    const res = await apiRequest("/api/certificate/issue", { method: "POST", cookie });
    expect(res.status).toBe(403);
  });

  it("public verification of an unknown id leaks no information and no private fields", async () => {
    const res = await apiRequest("/api/certificate/verify?id=" + "0".repeat(32));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, valid: false });
  });

  it("public verification of a real certificate returns only the public fields — no user id, status, or row id", async () => {
    await env.DB.prepare(
      `INSERT INTO users (identifier, role, password_hash, password_salt, password_iterations, must_change_password, full_name)
       VALUES ('rt_cert_student', 'STUDENT', 'x', 'x', 10000, 0, 'Runtime Test Learner')`
    ).run();
    const user = await env.DB.prepare("SELECT id FROM users WHERE identifier = 'rt_cert_student'").first();
    const verificationId = "ab".repeat(16); // 32 lowercase hex chars, matches VERIFICATION_ID_RE
    await env.DB.prepare(
      `INSERT INTO certificates (user_id, course_id, verification_id, learner_name) VALUES (?, 'git-learning-lab', ?, 'Runtime Test Learner')`
    )
      .bind(user.id, verificationId)
      .run();

    const res = await apiRequest("/api/certificate/verify?id=" + verificationId);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.certificate).toEqual({
      learnerName: "Runtime Test Learner",
      courseName: "Git Learning Lab",
      issuedAt: body.certificate.issuedAt,
      verificationId,
    });
    expect(Object.keys(body.certificate).sort()).toEqual(["courseName", "issuedAt", "learnerName", "verificationId"]);
  });
});
