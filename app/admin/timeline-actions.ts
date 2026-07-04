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

export async function getTimelineEventsAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("timeline_events")
      .select("*")
      .order("year", { ascending: false })
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return { events: data };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function createTimelineEventAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const year = parseInt(formData.get("year") as string) || new Date().getFullYear();
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const type = (formData.get("type") as string) || "Experience";
  const status = (formData.get("status") as string) || "draft";
  const relatedProjectId = (formData.get("relatedProjectId") as string) || null;

  if (!title) {
    return { error: "Title is required." };
  }

  try {
    const adminDb = createSupabaseAdminClient();

    const insertData = {
      year,
      title,
      description,
      type,
      status,
      related_project_id: relatedProjectId ? relatedProjectId : null,
      version: 1,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await adminDb
      .from("timeline_events")
      .insert(insertData)
      .select("id")
      .single();

    if (error) throw error;

    // Snapshot version
    await adminDb.from("content_versions").insert({
      target_type: "timeline_event",
      target_id: data.id,
      version_number: 1,
      snapshot_json: insertData,
      change_source: "admin",
      change_summary: `Created timeline event: ${title}`,
      created_by: actorId
    });

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "create",
      target_type: "timeline_event",
      target_id: data.id,
      details_json: { title, type, status }
    });

    revalidatePath("/");
    return { success: true, id: data.id };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function updateTimelineEventAction(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const year = parseInt(formData.get("year") as string) || new Date().getFullYear();
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const type = (formData.get("type") as string) || "Experience";
  const status = (formData.get("status") as string) || "draft";
  const relatedProjectId = (formData.get("relatedProjectId") as string) || null;

  if (!title) {
    return { error: "Title is required." };
  }

  try {
    const adminDb = createSupabaseAdminClient();

    // Fetch current to increment version
    let currentVersion = 1;
    const { data: current } = await adminDb.from("timeline_events").select("version").eq("id", id).maybeSingle();
    if (current) currentVersion = (current.version || 1) + 1;

    const updateData = {
      year,
      title,
      description,
      type,
      status,
      related_project_id: relatedProjectId ? relatedProjectId : null,
      version: currentVersion,
      updated_at: new Date().toISOString()
    };

    const { error } = await adminDb
      .from("timeline_events")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    // Snapshot version
    await adminDb.from("content_versions").insert({
      target_type: "timeline_event",
      target_id: id,
      version_number: currentVersion,
      snapshot_json: updateData,
      change_source: "admin",
      change_summary: `Updated timeline event: ${title} to v${currentVersion}`,
      created_by: actorId
    });

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "update",
      target_type: "timeline_event",
      target_id: id,
      details_json: { title, type, status, version: currentVersion }
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function deleteTimelineEventAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  try {
    const adminDb = createSupabaseAdminClient();

    const { data: event } = await adminDb.from("timeline_events").select("title").eq("id", id).maybeSingle();

    const { error } = await adminDb
      .from("timeline_events")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "delete",
      target_type: "timeline_event",
      target_id: id,
      details_json: { title: event?.title || "Unknown event" }
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}
