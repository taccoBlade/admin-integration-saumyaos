"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function runDiagnosticsAction() {
  const start = Date.now();
  const checks = {
    database: false,
    auth: false,
    storage: false,
    latencyMs: 0,
    buckets: [] as string[],
    details: ""
  };

  try {
    const supabase = await createSupabaseServerClient();
    
    // 1. Check Database connection
    const { data: dbTest, error: dbErr } = await supabase
      .from("projects")
      .select("id")
      .limit(1)
      .maybeSingle();
      
    if (dbErr) throw dbErr;
    checks.database = true;

    // 2. Check Auth
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr) throw authErr;
    checks.auth = !!user;

    // 3. Check Storage buckets
    const { data: buckets, error: storageErr } = await supabase.storage.listBuckets();
    if (storageErr) throw storageErr;
    checks.storage = true;
    checks.buckets = (buckets || []).map(b => b.name);

    checks.latencyMs = Date.now() - start;
    checks.details = `All checks passed. Supabase connection is healthy (${checks.latencyMs}ms).`;
    return { success: true, checks };
  } catch (err: unknown) {
    const e = err as Error;
    checks.latencyMs = Date.now() - start;
    checks.details = `Check failed: ${e.message}`;
    return { success: false, error: e.message, checks };
  }
}

export async function triggerBackupAction() {
  try {
    const supabase = await createSupabaseServerClient();

    // Fetch projects
    const { data: projects } = await supabase
      .from("projects")
      .select("*");

    // Fetch timeline events
    const { data: timeline } = await supabase
      .from("timeline_events")
      .select("*");

    // Fetch skills
    const { data: skills } = await supabase
      .from("skills")
      .select("*");

    // Fetch hero settings
    const { data: hero } = await supabase
      .from("hero")
      .select("*");

    // Fetch about settings
    const { data: about } = await supabase
      .from("about")
      .select("*");

    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      content: {
        projects: projects || [],
        timeline: timeline || [],
        skills: skills || [],
        hero: hero || [],
        about: about || []
      }
    };

    return { success: true, backup: JSON.stringify(backupData, null, 2) };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}
