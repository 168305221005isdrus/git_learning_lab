/**
 * Git Learning Lab — bootstrap account seeding (P2).
 *
 * Generates the MINIMUM safe set of accounts needed to verify the role
 * system end-to-end — 1 ADMIN + 1 STUDENT (a TEACHER account is added too,
 * since verifying ROLE-003's "Teacher uses the same learner experience" is
 * part of this P2 session's acceptance criteria) — NOT the full 31-account
 * classroom roster (that's explicitly deferred past P2).
 *
 * Passwords are randomly generated here and NEVER committed to Git:
 *   - This script writes the real INSERT statements to
 *     tools/bootstrap-accounts/seed.local.sql (gitignored).
 *   - It writes the plaintext credentials, once, to
 *     tools/bootstrap-accounts/credentials.local.txt (gitignored) — read it,
 *     then delete it once you've noted the values down somewhere safe.
 *
 * Usage:
 *   node tools/bootstrap-accounts/seed.mjs
 *   npx wrangler d1 execute git-learning-lab-db --local  --config worker/wrangler.toml --file=tools/bootstrap-accounts/seed.local.sql
 *   npx wrangler d1 execute git-learning-lab-db --remote --config worker/wrangler.toml --file=tools/bootstrap-accounts/seed.local.sql
 */
import { writeFileSync } from "node:fs";
import { derivePasswordHash, randomHex } from "../../worker/src/crypto.js";

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const accounts = [
  { identifier: "admin", role: "ADMIN" },
  { identifier: "teacher1", role: "TEACHER" },
  { identifier: "student1", role: "STUDENT" },
];

const lines = [];
const credentialLines = ["Git Learning Lab — bootstrap account credentials (P2)", "Generated: " + new Date().toISOString(), "", "Relay these to each person out-of-band, then delete this file.", ""];

for (const account of accounts) {
  const password = randomHex(9); // 18 hex characters — random, typeable, not committed
  const { hash, salt, iterations } = await derivePasswordHash(password);
  lines.push(
    `INSERT INTO users (identifier, role, password_hash, password_salt, password_iterations, must_change_password) VALUES (${sqlString(
      account.identifier
    )}, ${sqlString(account.role)}, ${sqlString(hash)}, ${sqlString(salt)}, ${iterations}, 0);`
  );
  credentialLines.push(`${account.role.padEnd(8)} identifier=${account.identifier}  password=${password}`);
}

writeFileSync(new URL("./seed.local.sql", import.meta.url), lines.join("\n") + "\n");
writeFileSync(new URL("./credentials.local.txt", import.meta.url), credentialLines.join("\n") + "\n");

console.log("Wrote tools/bootstrap-accounts/seed.local.sql (SQL, gitignored)");
console.log("Wrote tools/bootstrap-accounts/credentials.local.txt (plaintext, gitignored, READ ONCE THEN DELETE)");
console.log("");
console.log("Next: apply with wrangler d1 execute (see this file's header comment for the exact commands).");
