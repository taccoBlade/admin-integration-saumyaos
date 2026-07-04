import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ─── Guard: only runs in development ────────────────────────────────────────
if (process.env.NODE_ENV !== "development") {
  console.error(
    "[set-test-password] This script must only run in NODE_ENV=development. Aborting."
  );
  process.exit(1);
}

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"']|['"']$/g, "");
    if (!process.env[key]) process.env[key] = value; // don't override shell env
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.ADMIN_TEST_USER_ID;
const password = process.env.ADMIN_TEST_PASSWORD;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "[set-test-password] Missing required env vars: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

if (!userId || !password) {
  console.error(
    "[set-test-password] Missing required env vars: ADMIN_TEST_USER_ID, ADMIN_TEST_PASSWORD."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log(`[set-test-password] Updating password for user ${userId}…`);
  const { error } = await supabase.auth.admin.updateUserById(userId!, { password });
  if (error) {
    console.error("[set-test-password] Error:", error.message);
    process.exit(1);
  }
  console.log("[set-test-password] Password updated successfully.");
}

main().catch((err) => {
  console.error("[set-test-password] Unexpected error:", err);
  process.exit(1);
});
