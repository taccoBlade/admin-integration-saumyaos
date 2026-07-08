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

export async function getHeroAction() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Fetch the hero record and join media_assets to get the cover image public URL
    const { data, error } = await supabase
      .from("hero")
      .select("*, media_assets!cover_image_id(public_url)")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    // Seed default if empty
    if (!data) {
      const adminDb = createSupabaseAdminClient();
      const defaultHero = {
        title: "Saumya Parekh",
        tagline: "Civil Engineering & Infrastructure Systems",
        subtitle: "Computational Infrastructure Engineer",
        description: "Building intelligent infrastructure systems through civil engineering, data analysis, automation, and computational design. Specializing in concrete mix proportioning compliance and geotechnical site telemetry.",
        cta_text: "View Projects",
        cta_url: "#projects",
        secondary_cta_text: "Resume",
        secondary_cta_url: "#",
        status: "published" as const,
        version: 1,
      };
      
      const { data: seeded, error: seedErr } = await adminDb
        .from("hero")
        .insert(defaultHero)
        .select()
        .single();
      if (seedErr) throw seedErr;
      return { hero: seeded };
    }

    return {
      hero: {
        ...data,
        cover_image: (data.media_assets as Record<string, unknown> | null)?.public_url || "",
      }
    };
  } catch (err: unknown) {
    console.error("Get hero error:", err);
    return { error: err instanceof Error ? err.message : "Failed to load hero." };
  }
}

export async function updateHeroAction(heroId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const title = formData.get("title") as string;
  const tagline = formData.get("tagline") as string || "";
  const subtitle = formData.get("subtitle") as string || "";
  const description = formData.get("description") as string || "";
  const cta_text = formData.get("cta_text") as string || "";
  const cta_url = formData.get("cta_url") as string || "";
  const secondary_cta_text = formData.get("secondary_cta_text") as string || "";
  const secondary_cta_url = formData.get("secondary_cta_url") as string || "";
  const workflowStatus = formData.get("status") as string || "draft";
  const coverImage = formData.get("coverImage") as string || "";

  if (!title) {
    return { error: "Title is required." };
  }

  let dbStatus: "draft" | "published" | "archived" = "draft";
  if (workflowStatus === "published") dbStatus = "published";
  else if (workflowStatus === "archived") dbStatus = "archived";

  try {
    const adminDb = createSupabaseAdminClient();

    // 1. Resolve cover_image URL to media_assets id
    let resolvedCoverImageId: string | null = null;
    if (coverImage) {
      const { data: asset } = await adminDb
        .from("media_assets")
        .select("id")
        .eq("public_url", coverImage)
        .limit(1)
        .maybeSingle();
      if (asset) {
        resolvedCoverImageId = asset.id;
      }
    }

    // 2. Fetch current hero record to determine version increment
    const { data: currentHero, error: fetchErr } = await adminDb
      .from("hero")
      .select("version")
      .eq("id", heroId)
      .single();

    if (fetchErr) throw fetchErr;

    const nextVer = (currentHero?.version || 1) + 1;

    // 3. Perform DB update
    const { data: updatedHero, error: updateErr } = await adminDb
      .from("hero")
      .update({
        title,
        tagline,
        subtitle,
        description,
        cover_image_id: resolvedCoverImageId,
        cta_text,
        cta_url,
        secondary_cta_text,
        secondary_cta_url,
        status: dbStatus,
        version: nextVer,
      })
      .eq("id", heroId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 4. Create version snapshot in content_versions
    await adminDb.from("content_versions").insert({
      target_type: "hero",
      target_id: heroId,
      version_number: nextVer,
      snapshot_json: updatedHero,
      change_summary: `Hero update (status: ${workflowStatus})`,
      change_source: "manual",
      created_by_user_id: actorId,
    });

    // 5. Log activity
    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Updated hero details (status: ${workflowStatus})`,
      target_type: "hero",
      target_id: heroId,
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidateTag("hero", "default");
    return { success: true };
  } catch (err: unknown) {
    console.error("Update hero error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update hero." };
  }
}

export async function getHeroVersionsAction(heroId: string) {
  try {
    const adminDb = createSupabaseAdminClient();
    const { data, error } = await adminDb
      .from("content_versions")
      .select("id, version_number, change_source, change_summary, created_at")
      .eq("target_type", "hero")
      .eq("target_id", heroId)
      .order("version_number", { ascending: false });

    if (error) throw error;
    return { versions: data };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to load versions." };
  }
}

export async function rollbackHeroAction(heroId: string, versionId: string) {
  const supabase = await createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  try {
    const adminDb = createSupabaseAdminClient();

    // 1. Fetch target version
    const { data: targetVersion, error: verErr } = await adminDb
      .from("content_versions")
      .select("*")
      .eq("id", versionId)
      .single();

    if (verErr || !targetVersion) throw new Error("Target version snapshot not found.");

    const snapshot = targetVersion.snapshot_json as Record<string, unknown>;

    // 2. Fetch current hero record to determine version increment
    const { data: currentHero } = await adminDb
      .from("hero")
      .select("version")
      .eq("id", heroId)
      .single();

    const nextVer = (currentHero?.version || 1) + 1;

    // 3. Rollback the database record columns
    const { data: rolledBackHero, error: updateErr } = await adminDb
      .from("hero")
      .update({
        title: snapshot.title as string,
        tagline: snapshot.tagline as string,
        subtitle: snapshot.subtitle as string,
        description: snapshot.description as string,
        cover_image_id: snapshot.cover_image_id as string | null,
        cta_text: snapshot.cta_text as string,
        cta_url: snapshot.cta_url as string,
        secondary_cta_text: snapshot.secondary_cta_text as string,
        secondary_cta_url: snapshot.secondary_cta_url as string,
        status: snapshot.status as "draft" | "published" | "archived",
        version: nextVer,
      })
      .eq("id", heroId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 4. Create new rollback version snapshot in content_versions
    await adminDb.from("content_versions").insert({
      target_type: "hero",
      target_id: heroId,
      version_number: nextVer,
      snapshot_json: rolledBackHero,
      change_summary: `Rollback to version ${targetVersion.version_number}`,
      change_source: "rollback",
      created_by_user_id: actorId,
    });

    // 5. Log activity
    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Restored hero to version ${targetVersion.version_number}`,
      target_type: "hero",
      target_id: heroId,
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidateTag("hero", "default");
    return { success: true };
  } catch (err: unknown) {
    console.error("Rollback hero error:", err);
    return { error: err instanceof Error ? err.message : "Failed to perform rollback." };
  }
}
