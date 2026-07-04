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

export async function getResumeVersionsAction() {
  try {
    const supabase = await createSupabaseServerClient();
    // Note: media_asset_id is the original FK column; file_media_id is added by migration 004.
    // The join uses media_asset_id (always present) for safety.
    const { data, error } = await supabase
      .from("resume_versions")
      .select("*, media_assets!media_asset_id(id, public_url, file_name, file_size_bytes)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { resumes: data };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function createResumeVersionAction(
  versionString: string, 
  fileMediaId: string, 
  isCurrent: boolean,
  status: string
) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  if (!versionString || !fileMediaId) {
    return { error: "Version label and Resume PDF media asset are required." };
  }

  try {
    const adminDb = createSupabaseAdminClient();

    if (isCurrent) {
      // Toggle off other current versions
      await adminDb
        .from("resume_versions")
        .update({ is_current: false })
        .eq("is_current", true);
    }

    const insertData = {
      version_label: versionString,
      version_string: versionString,
      file_media_id: fileMediaId,
      is_current: isCurrent,
      status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await adminDb
      .from("resume_versions")
      .insert(insertData)
      .select("id")
      .single();

    if (error) throw error;

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Created resume version: ${versionString}`,
      target_type: "resume_version",
      target_id: data.id
    });

    revalidatePath("/");
    return { success: true, id: data.id };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function updateResumeVersionAction(
  id: string,
  versionString: string, 
  fileMediaId: string, 
  isCurrent: boolean,
  status: string
) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  if (!versionString || !fileMediaId) {
    return { error: "Version label and Resume PDF media asset are required." };
  }

  try {
    const adminDb = createSupabaseAdminClient();

    if (isCurrent) {
      // Toggle off other current versions
      await adminDb
        .from("resume_versions")
        .update({ is_current: false })
        .eq("is_current", true);
    }

    const updateData = {
      version_label: versionString,
      version_string: versionString,
      file_media_id: fileMediaId,
      is_current: isCurrent,
      status,
      updated_at: new Date().toISOString()
    };

    const { error } = await adminDb
      .from("resume_versions")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Updated resume version: ${versionString}`,
      target_type: "resume_version",
      target_id: id
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function setCurrentResumeVersionAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  try {
    const adminDb = createSupabaseAdminClient();

    // 1. Toggle off all other current versions
    await adminDb
      .from("resume_versions")
      .update({ is_current: false })
      .eq("is_current", true);

    // 2. Set this one to true and make status published
    const { data: resume, error } = await adminDb
      .from("resume_versions")
      .update({ is_current: true, status: "published" })
      .eq("id", id)
      .select("version_label")
      .single();

    if (error) throw error;

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Set resume version as current: ${resume?.version_label}`,
      target_type: "resume_version",
      target_id: id
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function deleteResumeVersionAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  try {
    const adminDb = createSupabaseAdminClient();

    const { data: resume } = await adminDb.from("resume_versions").select("version_label").eq("id", id).maybeSingle();

    const { error } = await adminDb
      .from("resume_versions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Deleted resume version: ${resume?.version_label || "Unknown"}`,
      target_type: "resume_version",
      target_id: id
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}
