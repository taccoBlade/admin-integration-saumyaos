"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";
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

export async function getPhotoSpreadsAction() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Fetch spreads
    const { data: spreads, error: spreadsErr } = await supabase
      .from("photo_spreads")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (spreadsErr) throw spreadsErr;

    // Fetch all spread items with media details
    const { data: items, error: itemsErr } = await supabase
      .from("photo_spread_items")
      .select("*, media_assets!media_asset_id(id, public_url, file_name, mime_type)")
      .order("sort_order", { ascending: true });

    if (itemsErr) throw itemsErr;

    // Group items by spread ID
    const grouped = (spreads || []).map((spread) => {
      const spreadItems = (items || []).filter((item) => item.photo_spread_id === spread.id);
      return {
        ...spread,
        items: spreadItems
      };
    });

    return { spreads: grouped };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function createPhotoSpreadAction(
  formData: FormData, 
  items: { mediaAssetId: string; role: string; sortOrder: number }[]
) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const title = (formData.get("title") as string) || "";
  const diaryEntry = (formData.get("diaryEntry") as string) || "";
  const templateType = (formData.get("templateType") as string) || "Photo Dump";
  const status = (formData.get("status") as string) || "draft";
  const featured = formData.get("featured") === "true";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  try {
    const adminDb = createSupabaseAdminClient();

    const insertData = {
      title: title || null,
      diary_entry: diaryEntry || null,
      template_type: templateType,
      status,
      featured,
      sort_order: sortOrder,
      version: 1,
      updated_at: new Date().toISOString()
    };

    const { data: spread, error: spreadErr } = await adminDb
      .from("photo_spreads")
      .insert(insertData)
      .select("id")
      .single();

    if (spreadErr) throw spreadErr;

    // Insert items
    if (items.length > 0) {
      const itemRows = items.map((item) => ({
        photo_spread_id: spread.id,
        media_asset_id: item.mediaAssetId,
        role: item.role,
        sort_order: item.sortOrder
      }));

      const { error: itemsErr } = await adminDb
        .from("photo_spread_items")
        .insert(itemRows);

      if (itemsErr) throw itemsErr;
    }

    // Versioning
    await adminDb.from("content_versions").insert({
      target_type: "photo_spread",
      target_id: spread.id,
      version_number: 1,
      snapshot_json: { ...insertData, items },
      change_source: "admin",
      change_summary: `Created photography spread: ${title || templateType}`,
      created_by: actorId
    });

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "create",
      target_type: "photo_spread",
      target_id: spread.id,
      details_json: { title, templateType, status }
    });

    revalidatePath("/personal");
    revalidateTag("photography", "default");
    return { success: true, id: spread.id };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function updatePhotoSpreadAction(
  id: string,
  formData: FormData,
  items: { mediaAssetId: string; role: string; sortOrder: number }[]
) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const title = (formData.get("title") as string) || "";
  const diaryEntry = (formData.get("diaryEntry") as string) || "";
  const templateType = (formData.get("templateType") as string) || "Photo Dump";
  const status = (formData.get("status") as string) || "draft";
  const featured = formData.get("featured") === "true";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  try {
    const adminDb = createSupabaseAdminClient();

    // Version increment
    let currentVersion = 1;
    const { data: current } = await adminDb.from("photo_spreads").select("version").eq("id", id).maybeSingle();
    if (current) currentVersion = (current.version || 1) + 1;

    const updateData = {
      title: title || null,
      diary_entry: diaryEntry || null,
      template_type: templateType,
      status,
      featured,
      sort_order: sortOrder,
      version: currentVersion,
      updated_at: new Date().toISOString()
    };

    const { error: spreadErr } = await adminDb
      .from("photo_spreads")
      .update(updateData)
      .eq("id", id);

    if (spreadErr) throw spreadErr;

    // Delete old items and insert new ones
    await adminDb.from("photo_spread_items").delete().eq("photo_spread_id", id);

    if (items.length > 0) {
      const itemRows = items.map((item) => ({
        photo_spread_id: id,
        media_asset_id: item.mediaAssetId,
        role: item.role,
        sort_order: item.sortOrder
      }));

      const { error: itemsErr } = await adminDb
        .from("photo_spread_items")
        .insert(itemRows);

      if (itemsErr) throw itemsErr;
    }

    // Versioning
    await adminDb.from("content_versions").insert({
      target_type: "photo_spread",
      target_id: id,
      version_number: currentVersion,
      snapshot_json: { ...updateData, items },
      change_source: "admin",
      change_summary: `Updated photography spread: ${title || templateType} to v${currentVersion}`,
      created_by: actorId
    });

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "update",
      target_type: "photo_spread",
      target_id: id,
      details_json: { title, templateType, status, version: currentVersion }
    });

    revalidatePath("/personal");
    revalidateTag("photography", "default");
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function deletePhotoSpreadAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  try {
    const adminDb = createSupabaseAdminClient();

    const { data: spread } = await adminDb.from("photo_spreads").select("title, template_type").eq("id", id).maybeSingle();

    // Delete spread (items will cascade delete if foreign key has cascade delete, otherwise delete manually first)
    await adminDb.from("photo_spread_items").delete().eq("photo_spread_id", id);

    const { error: spreadErr } = await adminDb
      .from("photo_spreads")
      .delete()
      .eq("id", id);

    if (spreadErr) throw spreadErr;

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "delete",
      target_type: "photo_spread",
      target_id: id,
      details_json: { title: spread?.title || spread?.template_type || "Unknown spread" }
    });

    revalidatePath("/personal");
    revalidateTag("photography", "default");
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}
