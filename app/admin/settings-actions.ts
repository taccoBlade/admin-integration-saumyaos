"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

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

// Admin client that bypasses RLS for system settings
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase admin credentials");
  return createClient(url, key);
}

export async function getGlobalThemeAction() {
  try {
    const supabase = getAdminClient();
    const { data: rows, error } = await supabase
      .from("site_settings")
      .select("theme_json")
      .limit(1);
    
    if (error) throw error;
    
    if (rows && rows.length > 0 && rows[0].theme_json && rows[0].theme_json.theme_accent) {
      return { success: true, theme: rows[0].theme_json.theme_accent };
    }
    
    return { success: true, theme: "212 175 55" };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function updateGlobalThemeAction(themeRGB: string) {
  try {
    const supabase = getAdminClient();
    
    const { data: rows, error: fetchErr } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1);
      
    if (fetchErr) throw fetchErr;
    
    if (rows && rows.length > 0) {
      const row = rows[0];
      const themeData = row.theme_json || {};
      themeData.theme_accent = themeRGB;
      
      const { error: updateErr } = await supabase
        .from("site_settings")
        .update({ theme_json: themeData, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from("site_settings")
        .insert({
          theme_json: { theme_accent: themeRGB },
          site_name: "Default Site",
          owner_name: "Saumya",
          base_url: "https://localhost:3000",
          updated_at: new Date().toISOString()
        });
      if (insertErr) throw insertErr;
    }
    
    // Revalidate the entire layout to apply the new theme color
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}
