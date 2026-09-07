// Git Learning Lab — P13: Worker-runtime integration test configuration.
//
// This is a SEPARATE, additive test layer (docs/ARCHITECTURE_DECISIONS.md
// ADR-014 amendment, P13) — it does not replace the existing 191 `node:test`
// unit tests (`npm test`, tests/**/*.test.js), which remain the fast,
// primary suite. This layer runs a small, deliberately bounded set of
// high-value scenarios against the REAL worker/src/index.js Worker code,
// executing inside an actual Miniflare/workerd runtime (not a hand-written
// fake-D1), against an isolated local D1 instance (worker/wrangler.test.toml)
// that is never the production `git-learning-lab-db` binding.
import { defineConfig } from "vitest/config";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";

const migrations = await readD1Migrations("./migrations");

export default defineConfig({
  test: {
    // Only this suite's own files — never picks up tests/**/*.test.js (the
    // node:test suite uses a different test-registration API entirely and
    // is invoked separately via `npm test`).
    include: ["runtime-tests/**/*.test.js"],
    setupFiles: ["./runtime-tests/setup.js"],
  },
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./worker/wrangler.test.toml" },
      miniflare: {
        // Passed through to the Worker's `env` as env.TEST_MIGRATIONS so
        // runtime-tests/setup.js can apply them from inside the Worker
        // runtime (D1 migrations can only be applied via a binding call
        // running in-isolate, not from Node.js directly).
        bindings: { TEST_MIGRATIONS: migrations },
      },
    }),
  ],
});
