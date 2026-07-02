import { createSupabaseAdminClient } from "../lib/supabase/admin";
import fs from "fs";
import path from "path";
import readline from "readline";

function loadLocalEnv() {
  const root = process.cwd();
  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(root, fileName);
    if (!fs.existsSync(filePath)) continue;

    const contents = fs.readFileSync(filePath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  }
}

function promptQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function main() {
  loadLocalEnv();

  // Validate environment variables are present
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
    process.exit(1);
  }

  let email = process.argv[2]?.trim() || process.env.ADMIN_EMAIL?.trim();
  if (!email) {
    email = await promptQuestion("Enter the admin email address (must already exist in Supabase Auth): ");
  }

  if (!email) {
    console.error("Error: Email address is required.");
    process.exit(1);
  }

  const supabase = createSupabaseAdminClient();

  console.log(`Connecting to Supabase at ${supabaseUrl}...`);
  console.log(`Searching for Auth user with email: ${email}...`);

  const { data: userData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing auth users:", listError.message);
    process.exit(1);
  }

  const authUser = userData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!authUser) {
    console.error(`\nError: No user found in Supabase Auth with email '${email}'.`);
    console.error("Please create the user first in your Supabase Dashboard under Authentication > Users.");
    process.exit(1);
  }

  console.log(`Found Auth User! ID: ${authUser.id}`);

  // Check if admin_profile row already exists
  const { data: existingProfile, error: selectError } = await supabase
    .from("admin_profile")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (selectError) {
    console.error("Error checking existing admin_profile:", selectError.message);
    process.exit(1);
  }

  if (existingProfile) {
    console.log(`\nAn admin_profile already exists for this user (ID: ${existingProfile.id}).`);
    console.log("Details:", {
      id: existingProfile.id,
      email: existingProfile.email,
      display_name: existingProfile.display_name,
      role: existingProfile.role,
    });
    process.exit(0);
  }

  let displayName = process.argv[3]?.trim() || process.env.ADMIN_DISPLAY_NAME?.trim();
  if (!displayName) {
    const defaultName = authUser.email?.split("@")[0] || "Admin";
    displayName = await promptQuestion(`Enter display name [default: ${defaultName}]: `);
    if (!displayName) displayName = defaultName;
  }

  console.log(`Inserting admin_profile row for user ID ${authUser.id}...`);

  const { data: newProfile, error: insertError } = await supabase
    .from("admin_profile")
    .insert({
      auth_user_id: authUser.id,
      email: authUser.email!,
      display_name: displayName,
      role: "owner",
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error inserting admin_profile:", insertError.message);
    process.exit(1);
  }

  console.log("\nSuccess! Admin profile created successfully:");
  console.log(newProfile);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
