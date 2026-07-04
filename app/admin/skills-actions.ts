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

async function resolveCategoryTermId(adminDb: SupabaseClient, categoryName: string): Promise<string> {
  const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  
  // Try to fetch existing
  const { data: existing } = await adminDb
    .from("taxonomy_terms")
    .select("id")
    .eq("taxonomy_type", "skill_category")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return existing.id;

  // Insert new
  const { data: inserted, error } = await adminDb
    .from("taxonomy_terms")
    .insert({
      slug,
      name: categoryName,
      taxonomy_type: "skill_category"
    })
    .select("id")
    .single();

  if (error) throw error;
  return inserted.id;
}

export async function getSkillsAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("skills")
      .select("*, taxonomy_terms!category_term_id(id, name)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { skills: data };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function createSkillAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const name = (formData.get("name") as string) || "";
  const slug = (formData.get("slug") as string) || "";
  const category = (formData.get("category") as string) || "Core Engineering";
  const baseStrength = parseInt(formData.get("baseStrength") as string) || 5;
  const displayStrength = parseInt(formData.get("displayStrength") as string) || baseStrength;
  const featured = formData.get("featured") === "true";
  const status = (formData.get("status") as string) || "draft";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  if (!name || !slug) {
    return { error: "Name and Slug are required." };
  }

  try {
    const adminDb = createSupabaseAdminClient();

    // Resolve category ID
    const categoryTermId = await resolveCategoryTermId(adminDb, category);

    const insertData = {
      name,
      slug,
      category_term_id: categoryTermId,
      base_strength: baseStrength,
      display_strength: displayStrength,
      featured,
      status,
      sort_order: sortOrder,
      version: 1,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await adminDb
      .from("skills")
      .insert(insertData)
      .select("id")
      .single();

    if (error) throw error;

    // Snapshot version
    await adminDb.from("content_versions").insert({
      target_type: "skills",
      target_id: data.id,
      version_number: 1,
      snapshot_json: insertData,
      change_source: "admin",
      change_summary: `Created skill: ${name}`,
      created_by: actorId
    });

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "create",
      target_type: "skills",
      target_id: data.id,
      details_json: { name, category, status }
    });

    revalidatePath("/");
    return { success: true, id: data.id };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function updateSkillAction(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const name = (formData.get("name") as string) || "";
  const slug = (formData.get("slug") as string) || "";
  const category = (formData.get("category") as string) || "Core Engineering";
  const baseStrength = parseInt(formData.get("baseStrength") as string) || 5;
  const displayStrength = parseInt(formData.get("displayStrength") as string) || baseStrength;
  const featured = formData.get("featured") === "true";
  const status = (formData.get("status") as string) || "draft";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  if (!name || !slug) {
    return { error: "Name and Slug are required." };
  }

  try {
    const adminDb = createSupabaseAdminClient();

    // Resolve category ID
    const categoryTermId = await resolveCategoryTermId(adminDb, category);

    // Fetch current version
    let currentVersion = 1;
    const { data: current } = await adminDb.from("skills").select("version").eq("id", id).maybeSingle();
    if (current) currentVersion = (current.version || 1) + 1;

    const updateData = {
      name,
      slug,
      category_term_id: categoryTermId,
      base_strength: baseStrength,
      display_strength: displayStrength,
      featured,
      status,
      sort_order: sortOrder,
      version: currentVersion,
      updated_at: new Date().toISOString()
    };

    const { error } = await adminDb
      .from("skills")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    // Snapshot version
    await adminDb.from("content_versions").insert({
      target_type: "skills",
      target_id: id,
      version_number: currentVersion,
      snapshot_json: updateData,
      change_source: "admin",
      change_summary: `Updated skill: ${name} to v${currentVersion}`,
      created_by: actorId
    });

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "update",
      target_type: "skills",
      target_id: id,
      details_json: { name, category, status, version: currentVersion }
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}

export async function deleteSkillAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  try {
    const adminDb = createSupabaseAdminClient();

    const { data: skill } = await adminDb.from("skills").select("name").eq("id", id).maybeSingle();

    const { error } = await adminDb
      .from("skills")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Activity Log
    await adminDb.from("activity_log").insert({
      actor_id: actorId,
      action_type: "delete",
      target_type: "skills",
      target_id: id,
      details_json: { name: skill?.name || "Unknown skill" }
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { error: e.message };
  }
}
