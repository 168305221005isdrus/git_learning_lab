// Git Learning Lab — P13: per-test-file D1 setup for the Worker-runtime suite.
//
// @cloudflare/vitest-plugin resets each binding's storage after every test
// FILE (not every individual test), so migrations are (re-)applied here via
// a Vitest `setupFiles` entry, which runs once before each test file — this
// guarantees every file starts from a clean, fully-migrated, empty schema,
// with no cross-file state leakage and no dependency on run order.
import { env } from "cloudflare:workers";
import { applyD1Migrations } from "cloudflare:test";

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
