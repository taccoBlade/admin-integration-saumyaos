import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Simple env parser
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split("=");
    const key = parts[0].trim();
    const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const BUCKETS = [
  "images",
  "project-media",
  "photography",
  "documents",
  "datasets",
  "dashboards",
  "audio",
  "archives",
  "seo"
];

async function main() {
  console.log("Connecting to Supabase Storage at:", supabaseUrl);
  
  // 1. List existing buckets
  const { data: existing, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error("Error listing buckets:", listErr);
    process.exit(1);
  }

  const existingIds = new Set((existing || []).map(b => b.id));
  console.log("Existing buckets:", Array.from(existingIds));

  // 2. Create missing buckets
  for (const bucketName of BUCKETS) {
    if (existingIds.has(bucketName)) {
      console.log(`Bucket "${bucketName}" already exists.`);
      continue;
    }

    console.log(`Creating bucket "${bucketName}"...`);
    const { error: createErr } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });

    if (createErr) {
      console.error(`Failed to create bucket "${bucketName}":`, createErr.message);
    } else {
      console.log(`Successfully created public bucket "${bucketName}".`);
    }
  }

  console.log("Bucket check complete.");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
