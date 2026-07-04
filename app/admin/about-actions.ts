"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { SupabaseClient } from "@supabase/supabase-js";

async function getActorProfileId(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("admin_profile")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return profile?.id || null;
}

export async function getAboutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("about")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return { about: data };
  } catch (err: unknown) {
    console.error("Error fetching about data:", err);
    return { error: err instanceof Error ? err.message : "Failed to fetch About data." };
  }
}

export async function updateAboutAction(aboutId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const title = (formData.get("title") as string) || "Current Focus";
  const eyebrow = (formData.get("eyebrow") as string) || "Now";
  const status = (formData.get("status") as string) || "draft";

  const focusCardsRaw = (formData.get("focus_cards") as string) || "[]";
  const obsessionsRaw = (formData.get("obsessions") as string) || "[]";

  let focusCards = [];
  let obsessions = [];

  try {
    focusCards = JSON.parse(focusCardsRaw);
    obsessions = JSON.parse(obsessionsRaw);
  } catch {
    return { error: "Invalid JSON format for focus cards or obsessions." };
  }

  try {
    const adminDb = createSupabaseAdminClient();

    // 1. Fetch current to check version
    let currentVersion = 1;
    if (aboutId && aboutId !== "new") {
      const { data: current } = await adminDb.from("about").select("version").eq("id", aboutId).maybeSingle();
      if (current) currentVersion = (current.version || 1) + 1;
    }

    // 2. Perform upsert
    const upsertData: Record<string, unknown> = {
      title,
      eyebrow,
      focus_cards_json: focusCards,
      obsessions_json: obsessions,
      status,
      version: currentVersion,
      updated_at: new Date().toISOString(),
    };

    let resultId = aboutId;
    if (!aboutId || aboutId === "new" || aboutId === "default") {
      const { data: inserted, error: insErr } = await adminDb
        .from("about")
        .insert({ ...upsertData, version: 1 })
        .select("id")
        .single();
      if (insErr) throw insErr;
      resultId = inserted.id;
    } else {
      const { error: updErr } = await adminDb
        .from("about")
        .update(upsertData)
        .eq("id", aboutId);
      if (updErr) throw updErr;
    }

    // 3. Log version snapshot
    await adminDb.from("content_versions").insert({
      target_type: "about",
      target_id: resultId,
      version_number: currentVersion,
      snapshot_json: upsertData,
      change_source: "admin",
      change_summary: `Updated About content to version ${currentVersion} (${status})`,
      created_by: actorId,
    });

    // 4. Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "update",
      target_type: "about",
      target_id: resultId,
      details_json: { title, status, version: currentVersion },
    });

    revalidatePath("/");
    return { success: true, id: resultId };
  } catch (err: unknown) {
    console.error("Error updating About:", err);
    return { error: err instanceof Error ? err.message : "Failed to update About content." };
  }
}

export async function getAboutVersionsAction(aboutId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_versions")
      .select("*")
      .eq("target_type", "about")
      .eq("target_id", aboutId)
      .order("version_number", { ascending: false });

    if (error) throw error;
    return { versions: data };
  } catch (err: unknown) {
    console.error("Error fetching About versions:", err);
    return { error: err instanceof Error ? err.message : "Failed to fetch About version history." };
  }
}

export async function rollbackAboutAction(aboutId: string, versionId: string) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  try {
    const adminDb = createSupabaseAdminClient();

    // 1. Fetch snapshot
    const { data: versionNode, error: verErr } = await adminDb
      .from("content_versions")
      .select("*")
      .eq("id", versionId)
      .single();

    if (verErr) throw verErr;

    const snapshot = versionNode.snapshot_json as Record<string, unknown>;
    const nextVersion = versionNode.version_number;

    // 2. Restore to about table
    const { error: restoreErr } = await adminDb
      .from("about")
      .update({
        title: snapshot.title,
        eyebrow: snapshot.eyebrow,
        focus_cards_json: snapshot.focus_cards_json,
        obsessions_json: snapshot.obsessions_json,
        status: "published", // Automatically publish on rollback
        version: nextVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", aboutId);

    if (restoreErr) throw restoreErr;

    // 3. Log Rollback Event
    await adminDb.from("rollback_events").insert({
      target_type: "about",
      target_id: aboutId,
      from_version: nextVersion, // approximate
      to_version: nextVersion,
      restored_version_id: versionId,
      trigger_source: "admin",
      triggered_by: actorId,
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error rolling back About:", err);
    return { error: err instanceof Error ? err.message : "Failed to rollback About content." };
  }
}
