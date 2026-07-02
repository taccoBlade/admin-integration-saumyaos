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

export async function updateProjectAction(projectId: string, formData: FormData) {
  const supabase = createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  const title = formData.get("title") as string;
  const year = parseInt(formData.get("year") as string) || new Date().getFullYear();
  const description = formData.get("description") as string;
  const overview = formData.get("overview") as string;
  
  // Custom workflow status ('draft' | 'review' | 'scheduled' | 'published' | 'archived')
  const workflowStatus = formData.get("status") as string; 

  if (!title) {
    return { error: "Title is required." };
  }

  // Map workflow status to DB enum: draft, published, archived
  let dbStatus: "draft" | "published" | "archived" = "draft";
  if (workflowStatus === "published") dbStatus = "published";
  else if (workflowStatus === "archived") dbStatus = "archived";

  const scheduledAt = workflowStatus === "scheduled" ? new Date().toISOString() : null;

  try {
    const adminDb = createSupabaseAdminClient();

    // 1. Fetch current project to check if anything changed
    const { data: currentProject, error: fetchErr } = await adminDb
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (fetchErr) throw fetchErr;

    // 2. Perform DB update
    const { data: updatedProject, error: updateErr } = await adminDb
      .from("projects")
      .update({
        title,
        year,
        description,
        overview,
        status: dbStatus,
        scheduled_at: scheduledAt,
        source_json: {
          ...(currentProject.source_json as object),
          workflow_status: workflowStatus,
          title,
          year,
          description,
          overview
        }
      })
      .eq("id", projectId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 3. Determine next version number
    const { data: latestVer } = await adminDb
      .from("content_versions")
      .select("version_number")
      .eq("target_type", "project")
      .eq("target_id", projectId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVer = (latestVer?.version_number || 0) + 1;

    // 4. Create new version snapshot
    await adminDb.from("content_versions").insert({
      target_type: "project",
      target_id: projectId,
      version_number: nextVer,
      snapshot_json: updatedProject,
      change_summary: `Manual update to project fields (status: ${workflowStatus})`,
      change_source: "manual",
      created_by_user_id: actorId,
    });

    // 5. Log activity
    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Updated project details (status: ${workflowStatus})`,
      target_type: "project",
      target_id: projectId,
    });

    revalidatePath("/admin");
    revalidatePath(`/projects/${currentProject.slug}`);
    return { success: true };
  } catch (err: unknown) {
    console.error("Update project error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update project." };
  }
}

export async function rollbackProjectAction(projectId: string, versionId: string) {
  const supabase = createSupabaseServerClient();
  const actorId = await getActorProfileId(supabase);

  try {
    const adminDb = createSupabaseAdminClient();

    // 1. Fetch the target version
    const { data: targetVersion, error: verErr } = await adminDb
      .from("content_versions")
      .select("*")
      .eq("id", versionId)
      .single();

    if (verErr || !targetVersion) throw new Error("Target version snapshot not found.");

    const snapshot = targetVersion.snapshot_json as Record<string, unknown>;

    // 2. Rollback the database record columns
    const { data: rolledBackProject, error: updateErr } = await adminDb
      .from("projects")
      .update({
        title: snapshot.title as string,
        year: snapshot.year as number,
        description: snapshot.description as string,
        overview: snapshot.overview as string,
        status: snapshot.status as "draft" | "published" | "archived",
        scheduled_at: snapshot.scheduled_at as string | null,
        source_json: snapshot.source_json as Record<string, unknown>
      })
      .eq("id", projectId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 3. Increment version number
    const { data: latestVer } = await adminDb
      .from("content_versions")
      .select("id, version_number")
      .eq("target_type", "project")
      .eq("target_id", projectId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVer = (latestVer?.version_number || 0) + 1;

    // 4. Create rollback version snapshot
    const { data: newVer } = await adminDb
      .from("content_versions")
      .insert({
        target_type: "project",
        target_id: projectId,
        version_number: nextVer,
        snapshot_json: rolledBackProject,
        change_summary: `Rollback to version ${targetVersion.version_number}`,
        change_source: "rollback",
        created_by_user_id: actorId,
      })
      .select()
      .single();

    // 5. Record rollback event
    if (latestVer && newVer) {
      await adminDb.from("rollback_events").insert({
        target_type: "project",
        target_id: projectId,
        from_version_id: latestVer.id,
        to_version_id: targetVersion.id,
        reason: `Admin requested restore to version ${targetVersion.version_number}`,
      });
    }

    // 6. Log activity
    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Restored project to version ${targetVersion.version_number}`,
      target_type: "project",
      target_id: projectId,
    });

    revalidatePath("/admin");
    revalidatePath(`/projects/${rolledBackProject.slug}`);
    return { success: true };
  } catch (err: unknown) {
    console.error("Rollback error:", err);
    return { error: err instanceof Error ? err.message : "Failed to perform rollback." };
  }
}

export async function getProjectVersionsAction(projectId: string) {
  try {
    const adminDb = createSupabaseAdminClient();
    const { data, error } = await adminDb
      .from("content_versions")
      .select("id, version_number, change_source, change_summary, created_at")
      .eq("target_type", "project")
      .eq("target_id", projectId)
      .order("version_number", { ascending: false });

    if (error) throw error;
    return { versions: data };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to load versions." };
  }
}
