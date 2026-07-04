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

export async function getResearchEntriesAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("research_entries")
      .select("*, media_assets!download_media_id(id, public_url, file_name)")
      .order("publication_date", { ascending: false });

    if (error) throw error;
    return { entries: data };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function createResearchEntryAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const title = (formData.get("title") as string) || "";
  const slug = (formData.get("slug") as string) || "";
  const authorsRaw = (formData.get("authors") as string) || "";
  const abstract = (formData.get("abstract") as string) || "";
  const journal = (formData.get("journal") as string) || "";
  const pubDate = (formData.get("pubDate") as string) || null;
  const downloadMediaId = (formData.get("downloadMediaId") as string) || null;
  const status = (formData.get("status") as string) || "draft";

  if (!title || !slug) {
    return { error: "Title and Slug are required." };
  }

  const authors = authorsRaw
    ? authorsRaw.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
    : [];

  try {
    const adminDb = createSupabaseAdminClient();

    const insertData = {
      title,
      slug,
      authors,
      abstract,
      publication_journal: journal,
      publication_date: pubDate ? pubDate : null,
      download_media_id: downloadMediaId ? downloadMediaId : null,
      status,
      version: 1,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await adminDb
      .from("research_entries")
      .insert(insertData)
      .select("id")
      .single();

    if (error) throw error;

    // Snapshot version
    await adminDb.from("content_versions").insert({
      target_type: "research_entry",
      target_id: data.id,
      version_number: 1,
      snapshot_json: insertData,
      change_source: "admin",
      change_summary: `Created research entry: ${title}`,
      created_by: actorId
    });

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "create",
      target_type: "research_entry",
      target_id: data.id,
      details_json: { title, slug, status }
    });

    revalidatePath("/");
    return { success: true, id: data.id };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function updateResearchEntryAction(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const title = (formData.get("title") as string) || "";
  const slug = (formData.get("slug") as string) || "";
  const authorsRaw = (formData.get("authors") as string) || "";
  const abstract = (formData.get("abstract") as string) || "";
  const journal = (formData.get("journal") as string) || "";
  const pubDate = (formData.get("pubDate") as string) || null;
  const downloadMediaId = (formData.get("downloadMediaId") as string) || null;
  const status = (formData.get("status") as string) || "draft";

  if (!title || !slug) {
    return { error: "Title and Slug are required." };
  }

  const authors = authorsRaw
    ? authorsRaw.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
    : [];

  try {
    const adminDb = createSupabaseAdminClient();

    // Fetch current to increment version
    let currentVersion = 1;
    const { data: current } = await adminDb.from("research_entries").select("version").eq("id", id).maybeSingle();
    if (current) currentVersion = (current.version || 1) + 1;

    const updateData = {
      title,
      slug,
      authors,
      abstract,
      publication_journal: journal,
      publication_date: pubDate ? pubDate : null,
      download_media_id: downloadMediaId ? downloadMediaId : null,
      status,
      version: currentVersion,
      updated_at: new Date().toISOString()
    };

    const { error } = await adminDb
      .from("research_entries")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    // Snapshot version
    await adminDb.from("content_versions").insert({
      target_type: "research_entry",
      target_id: id,
      version_number: currentVersion,
      snapshot_json: updateData,
      change_source: "admin",
      change_summary: `Updated research entry: ${title} to v${currentVersion}`,
      created_by: actorId
    });

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "update",
      target_type: "research_entry",
      target_id: id,
      details_json: { title, slug, status, version: currentVersion }
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function deleteResearchEntryAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  try {
    const adminDb = createSupabaseAdminClient();

    const { data: entry } = await adminDb.from("research_entries").select("title").eq("id", id).maybeSingle();

    const { error } = await adminDb
      .from("research_entries")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "delete",
      target_type: "research_entry",
      target_id: id,
      details_json: { title: entry?.title || "Unknown research" }
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}
