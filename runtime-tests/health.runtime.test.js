import { describe, it, expect } from "vitest";
import { apiRequest } from "./helpers.js";

describe("GET /api/health (real Worker runtime)", () => {
  it("returns 200 with the expected body", async () => {
    const res = await apiRequest("/api/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, service: "git-learning-lab-api" });
  });
});
