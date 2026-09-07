// Git Learning Lab — P13 §8: automated proof that migrations/*.sql apply
// cleanly, in order, to a fresh isolated D1 instance, and that the resulting
// schema has the tables/columns the Worker's queries (worker/src/db.js)
// actually depend on. This is exactly what runtime-tests/setup.js already
// does before every test file in this suite (via applyD1Migrations) — this
// file just asserts on the result explicitly instead of only relying on it
// implicitly succeeding.
import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";

async function columnNames(table) {
  const { results } = await env.DB.prepare(`PRAGMA table_info(${table})`).all();
  return results.map((r) => r.name).sort();
}

describe("D1 migration chain (0001-0005) applies cleanly to a fresh isolated database", () => {
  it("users has every column every migration adds, in one final schema", async () => {
    const columns = await columnNames("users");
    expect(columns).toEqual(
      [
        "created_at",
        "email",
        "full_name",
        "id",
        "identifier",
        "must_change_password",
        "password_hash",
        "password_iterations",
        "password_salt",
        "recovery_expires_at",
        "role",
        "student_id",
      ].sort()
    );
  });

  it("sessions, progress, quiz_results, challenge_results, and certificates all exist with their expected columns", async () => {
    expect(await columnNames("sessions")).toEqual(["created_at", "expires_at", "id", "token_hash", "user_id"].sort());
    expect(await columnNames("progress")).toEqual(["id", "module_id", "status", "updated_at", "user_id"].sort());
    expect(await columnNames("quiz_results")).toEqual(
      ["correct_count", "id", "percent", "quiz_id", "total", "updated_at", "user_id"].sort()
    );
    expect(await columnNames("challenge_results")).toEqual(
      ["challenge_id", "id", "passed", "updated_at", "user_id"].sort()
    );
    expect(await columnNames("certificates")).toEqual(
      ["course_id", "id", "issued_at", "learner_name", "status", "user_id", "verification_id"].sort()
    );
  });

  it("the named indexes each migration creates (lookup + the two UNIQUE registration indexes) are present", async () => {
    const { results } = await env.DB.prepare(
      `SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name IN ('users','progress','quiz_results','challenge_results','certificates')`
    ).all();
    const names = results.map((r) => r.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "idx_users_student_id",
        "idx_users_email",
        "idx_progress_user_id",
        "idx_quiz_results_user_id",
        "idx_challenge_results_user_id",
        "idx_certificates_user_id",
      ])
    );
  });
});
