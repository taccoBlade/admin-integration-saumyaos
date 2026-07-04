/**
 * test-browser.ts
 *
 * Local Playwright test runner.  Run via:  npm run test:browser
 *
 * Requires Playwright to be installed:
 *   npx playwright install --with-deps
 */
import { execSync } from "child_process";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

try {
  console.log("🌐  Starting cross-browser Playwright test suite…\n");
  execSync("npx playwright test", {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "test" },
  });
  console.log("\n✅  All Playwright tests passed.");
} catch (err) {
  console.error("\n❌  Some Playwright tests failed. Check output above.");
  process.exit(1);
}
