/**
 * lint-accessibility.js
 *
 * Runs ESLint with jsx-a11y plugin over the app and components directories,
 * writes a plain-text report to reports/a11y-report.txt, and exits with the
 * lint exit code so CI can gate on failures.
 *
 * Usage:  node scripts/lint-accessibility.js
 *         npm run lint:accessibility
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REPORTS_DIR = path.join(ROOT, "reports");
const REPORT_PATH = path.join(REPORTS_DIR, "a11y-report.txt");
const TARGETS = ["app", "components"].join(" ");

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const cmd =
  `npx eslint ${TARGETS} ` +
  `--ext .tsx,.ts,.jsx,.js ` +
  `--plugin jsx-a11y ` +
  `--rule 'jsx-a11y/alt-text: warn' ` +
  `--rule 'jsx-a11y/aria-props: error' ` +
  `--rule 'jsx-a11y/aria-role: error' ` +
  `--rule 'jsx-a11y/interactive-supports-focus: warn' ` +
  `--rule 'jsx-a11y/no-noninteractive-element-interactions: warn' ` +
  `--rule 'jsx-a11y/label-has-associated-control: warn' ` +
  `--format stylish`;

let output = "";
let exitCode = 0;

try {
  output = execSync(cmd, { cwd: ROOT, encoding: "utf-8" });
  console.log("✅ Accessibility lint passed — no errors.");
} catch (err) {
  output = err.stdout || err.message;
  exitCode = err.status ?? 1;
  console.error("⚠️  Accessibility lint found issues. See report for details.");
}

const timestamp = new Date().toISOString();
const header = `# Accessibility Lint Report\nGenerated: ${timestamp}\n${"─".repeat(60)}\n\n`;
fs.writeFileSync(REPORT_PATH, header + output, "utf-8");
console.log(`\nReport written to: ${path.relative(ROOT, REPORT_PATH)}`);

process.exit(exitCode);
