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

export async function createProjectAction(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const yearStr = formData.get("year") as string;
  const domain = formData.get("domain") as string;
  const workflowStatus = formData.get("status") as string;
  const description = formData.get("description") as string;
  const overview = formData.get("overview") as string;

  const technologiesRaw = formData.get("technologies") as string;
  const conceptsRaw = formData.get("concepts") as string;
  const researchRaw = formData.get("research") as string;
  const tagsRaw = formData.get("tags") as string;

  const coverImage = formData.get("coverImage") as string;
  const galleryRaw = formData.get("galleryImages") as string;

  const githubUrl = formData.get("githubUrl") as string;
  const liveUrl = formData.get("liveUrl") as string;
  const researchPaperUrl = formData.get("researchPaperUrl") as string;
  const documentationUrl = formData.get("documentationUrl") as string;

  if (!title || !slug || !workflowStatus || !yearStr || !overview) {
    return { error: "Title, Slug, Workflow Status, Year, and Overview are required." };
  }

  const year = parseInt(yearStr) || new Date().getFullYear();

  let dbStatus: "draft" | "published" | "archived" = "draft";
  if (workflowStatus === "published") dbStatus = "published";
  else if (workflowStatus === "archived") dbStatus = "archived";

  const scheduledAt = workflowStatus === "scheduled" ? new Date().toISOString() : null;

  const parseList = (str: string) =>
    str ? str.split(",").map((s) => s.trim()).filter((s) => s.length > 0) : [];

  const technologies = parseList(technologiesRaw);
  const concepts = parseList(conceptsRaw);
  const researchAreas = parseList(researchRaw);
  const tags = parseList(tagsRaw);
  const gallery = parseList(galleryRaw);

  try {
    const adminDb = createSupabaseAdminClient();

    // Check if slug is unique
    const { data: existing } = await adminDb
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return { error: `Project with slug '${slug}' already exists. Please choose a unique slug.` };
    }

    // Insert new project
    const { data: newProject, error: insertErr } = await adminDb
      .from("projects")
      .insert({
        slug,
        title,
        description,
        overview,
        year,
        subdomain: domain,
        status: dbStatus,
        scheduled_at: scheduledAt,
        engineering_concepts_json: concepts,
        research_areas_json: researchAreas,
        source_json: {
          title,
          slug,
          year,
          domain,
          workflow_status: workflowStatus,
          description,
          overview,
          technologies,
          gallery,
          cover_image: coverImage,
          githubUrl,
          liveUrl,
          researchPaperUrl,
          documentationUrl,
          tags
        }
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // Create v1 content version
    await adminDb.from("content_versions").insert({
      target_type: "project",
      target_id: newProject.id,
      version_number: 1,
      snapshot_json: newProject,
      change_summary: "Initial project creation",
      change_source: "manual",
      created_by_user_id: actorId,
    });

    // Log activity
    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Created new project (status: ${workflowStatus})`,
      target_type: "project",
      target_id: newProject.id,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    console.error("Create project error:", err);
    return { error: err instanceof Error ? err.message : "Failed to create project." };
  }
}
