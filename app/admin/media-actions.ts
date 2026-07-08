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

export async function checkDuplicateHashAction(hash: string) {
  try {
    const adminDb = createSupabaseAdminClient();
    const { data, error } = await adminDb
      .from("media_assets")
      .select("id, file_name, public_url, path, bucket, status")
      .eq("metadata_json->>sha256", hash)
      .maybeSingle();

    if (error) throw error;
    return { duplicate: data };
  } catch (err: unknown) {
    console.error("Error checking duplicate hash:", err);
    return { error: err instanceof Error ? err.message : "Failed to check duplicate hash." };
  }
}

export async function saveMediaAssetAction(data: {
  bucket: string;
  path: string;
  publicUrl: string;
  fileName: string;
  mimeType: string;
  mediaType: "image" | "video" | "audio" | "pdf" | "spreadsheet" | "archive" | "script" | "document" | "other";
  fileSize: number;
  width?: number;
  height?: number;
  hash: string;
  category: string;
  tags?: string[];
  altText?: string;
  caption?: string;
  sizes?: Record<string, string>;
}) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  try {
    const adminDb = createSupabaseAdminClient();
    const { data: inserted, error } = await adminDb
      .from("media_assets")
      .insert({
        bucket: data.bucket,
        path: data.path,
        public_url: data.publicUrl,
        file_name: data.fileName,
        mime_type: data.mimeType,
        media_type: data.mediaType,
        width: data.width || null,
        height: data.height || null,
        file_size_bytes: data.fileSize,
        alt_text: data.altText || "",
        caption: data.caption || "",
        metadata_json: {
          sha256: data.hash,
          category: data.category,
          tags: data.tags || [],
          sizes: data.sizes || {},
          uploaded_by: actorId
        },
        status: "published",
      })
      .select()
      .single();

    if (error) throw error;

    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Uploaded media: ${data.fileName}`,
      target_type: "media_asset",
      target_id: inserted.id
    });

    revalidatePath("/admin");
    return { success: true, asset: inserted };
  } catch (err: unknown) {
    console.error("Error saving media asset:", err);
    return { error: err instanceof Error ? err.message : "Failed to save media asset." };
  }
}

export async function updateMediaMetadataAction(
  id: string,
  fields: {
    altText?: string;
    caption?: string;
    title?: string;
    category?: string;
    tags?: string[];
    status?: "published" | "archived" | "draft";
  }
) {
  try {
    const adminDb = createSupabaseAdminClient();
    
    // Fetch existing metadata to merge
    const { data: current, error: getErr } = await adminDb
      .from("media_assets")
      .select("metadata_json, file_name, status, alt_text, caption")
      .eq("id", id)
      .single();

    if (getErr || !current) throw new Error("Media asset not found.");

    const currentMeta = (current.metadata_json || {}) as Record<string, unknown>;
    const nextMeta = {
      ...currentMeta,
      category: fields.category !== undefined ? fields.category : currentMeta.category,
      tags: fields.tags !== undefined ? fields.tags : currentMeta.tags,
      title: fields.title !== undefined ? fields.title : currentMeta.title,
    };

    const { error: updateErr } = await adminDb
      .from("media_assets")
      .update({
        alt_text: fields.altText !== undefined ? fields.altText : current.alt_text,
        caption: fields.caption !== undefined ? fields.caption : current.caption,
        file_name: fields.title !== undefined ? fields.title : current.file_name,
        status: fields.status !== undefined ? fields.status : current.status,
        metadata_json: nextMeta,
      })
      .eq("id", id);

    if (updateErr) throw updateErr;
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error updating media metadata:", err);
    return { error: err instanceof Error ? err.message : "Failed to update metadata." };
  }
}

export async function getMediaUsageAction(id: string) {
  try {
    const adminDb = createSupabaseAdminClient();
    const usageList: { type: string; name: string }[] = [];

    // 1. Query project_media table
    const { data: projectMedia } = await adminDb
      .from("project_media")
      .select("project_id, projects(title)")
      .eq("media_asset_id", id);

    if (projectMedia) {
      projectMedia.forEach((row: unknown) => {
        const r = row as { projects: { title: string } | null };
        const title = r.projects?.title || "Unnamed Project";
        usageList.push({ type: "Project Gallery", name: title });
      });
    }

    // 2. Query projects for cover image references
    const { data: coverProjects } = await adminDb
      .from("projects")
      .select("title, source_json")
      .or(`source_json->>cover_media_id.eq.${id}`);

    if (coverProjects) {
      coverProjects.forEach((row: unknown) => {
        const r = row as { title: string };
        usageList.push({ type: "Project Cover", name: r.title });
      });
    }

    return { usage: usageList };
  } catch (err: unknown) {
    console.error("Error fetching media usage:", err);
    return { error: err instanceof Error ? err.message : "Failed to fetch media usage." };
  }
}

export async function deleteMediaAssetAction(id: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const actorId = await getActorProfileId(supabase);
    const adminDb = createSupabaseAdminClient();

    // 1. Check if used
    const { usage, error: usageErr } = await getMediaUsageAction(id);
    if (usageErr) throw usageErr;
    if (usage && usage.length > 0) {
      return { error: `Cannot delete: Media asset is in use by ${usage.length} resources.` };
    }

    // 2. Fetch asset path & bucket
    const { data: asset, error: getErr } = await adminDb
      .from("media_assets")
      .select("bucket, path, file_name, metadata_json")
      .eq("id", id)
      .single();

    if (getErr || !asset) throw new Error("Media asset not found.");

    // 3. Delete DB record FIRST (Transactional Safety)
    const { error: deleteErr } = await adminDb
      .from("media_assets")
      .delete()
      .eq("id", id);

    if (deleteErr) throw deleteErr;

    // 4. Delete files from storage
    const storagePaths = [asset.path];
    const sizes = ((asset.metadata_json as Record<string, unknown>)?.sizes || {}) as Record<string, unknown>;
    Object.values(sizes).forEach((sizeUrl: unknown) => {
      // Extract path from public URL
      if (typeof sizeUrl === "string") {
        const parts = sizeUrl.split(`/storage/v1/object/public/${asset.bucket}/`);
        if (parts.length === 2) {
          storagePaths.push(parts[1]);
        }
      }
    });

    const { error: storageErr } = await adminDb.storage
      .from(asset.bucket)
      .remove(storagePaths);

    if (storageErr) {
      console.warn("Storage deletion failed, but DB record was removed:", storageErr);
      // We do not throw here, as the DB record is already deleted. The storage is effectively orphaned, 
      // but the app state remains consistent.
    }

    // 5. Activity Log
    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Deleted media: ${asset.file_name}`,
      target_type: "media_asset",
      target_id: id
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error deleting media asset:", err);
    return { error: err instanceof Error ? err.message : "Failed to delete media asset." };
  }
}
