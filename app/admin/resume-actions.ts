"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import { SupabaseClient } from "@supabase/supabase-js";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

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

export const getResumeVersionsAction = actionClient
  .schema(z.void().optional()) // z.void() or empty object. For no-args, omitting schema is fine in latest, but we use .optional() or z.object({})
  .action(async () => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("resume_versions")
      .select("*, media_assets!media_asset_id(id, public_url, file_name, file_size_bytes)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { resumes: data };
  });

const resumeVersionSchema = z.object({
  versionString: z.string().min(1, "Version label is required"),
  fileMediaId: z.string().min(1, "Resume PDF media asset is required"),
  isCurrent: z.boolean(),
  status: z.string()
});

export const createResumeVersionAction = actionClient
  .schema(resumeVersionSchema)
  .action(async ({ parsedInput: { versionString, fileMediaId, isCurrent, status } }) => {
    const supabase = await createSupabaseServerClient();
    const actorId = await getActorProfileId(supabase);
    const adminDb = createSupabaseAdminClient();

    if (isCurrent) {
      await adminDb
        .from("resume_versions")
        .update({ is_current: false })
        .eq("is_current", true);
    }

    const insertData = {
      title: versionString,
      version_label: versionString,
      version_string: versionString,
      file_media_id: fileMediaId,
      media_asset_id: fileMediaId,
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

    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Created resume version: ${versionString}`,
      target_type: "resume_version",
      target_id: data.id
    });

    revalidatePath("/");
    revalidateTag("resume", "default");
    return { success: true, id: data.id };
  });

export const updateResumeVersionAction = actionClient
  .schema(resumeVersionSchema.extend({ id: z.string() }))
  .action(async ({ parsedInput: { id, versionString, fileMediaId, isCurrent, status } }) => {
    const supabase = await createSupabaseServerClient();
    const actorId = await getActorProfileId(supabase);
    const adminDb = createSupabaseAdminClient();

    if (isCurrent) {
      await adminDb
        .from("resume_versions")
        .update({ is_current: false })
        .eq("is_current", true);
    }

    const updateData = {
      title: versionString,
      version_label: versionString,
      version_string: versionString,
      file_media_id: fileMediaId,
      media_asset_id: fileMediaId,
      is_current: isCurrent,
      status,
      updated_at: new Date().toISOString()
    };

    const { error } = await adminDb
      .from("resume_versions")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Updated resume version: ${versionString}`,
      target_type: "resume_version",
      target_id: id
    });

    revalidatePath("/");
    revalidateTag("resume", "default");
    return { success: true };
  });

export const setCurrentResumeVersionAction = actionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    const supabase = await createSupabaseServerClient();
    const actorId = await getActorProfileId(supabase);
    const adminDb = createSupabaseAdminClient();

    await adminDb
      .from("resume_versions")
      .update({ is_current: false })
      .eq("is_current", true);

    const { data: resume, error } = await adminDb
      .from("resume_versions")
      .update({ is_current: true, status: "published" })
      .eq("id", id)
      .select("version_label")
      .single();

    if (error) throw error;

    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Set resume version as current: ${resume?.version_label}`,
      target_type: "resume_version",
      target_id: id
    });

    revalidatePath("/");
    revalidateTag("resume", "default");
    return { success: true };
  });

export const deleteResumeVersionAction = actionClient
  .schema(z.object({ id: z.string(), adminPassword: z.string() }))
  .action(async ({ parsedInput: { id, adminPassword } }) => {
    const supabase = await createSupabaseServerClient();
    const actorId = await getActorProfileId(supabase);
    
    // Verify password
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || !user.email) {
      throw new Error("Authentication failed. Could not determine current admin user.");
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: adminPassword,
    });
    if (signInError) {
      throw new Error("Incorrect admin password. Deletion denied.");
    }

    const adminDb = createSupabaseAdminClient();
    const { data: resume } = await adminDb.from("resume_versions").select("version_label, media_asset_id").eq("id", id).maybeSingle();

    if (!resume) throw new Error("Resume version not found");

    const { error } = await adminDb
      .from("resume_versions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    if (resume.media_asset_id) {
      // Clean up the associated media asset and physical storage file safely
      const { deleteMediaAssetAction } = await import("./media-actions");
      await deleteMediaAssetAction(resume.media_asset_id);
    }

    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Deleted resume version: ${resume?.version_label || "Unknown"}`,
      target_type: "resume_version",
      target_id: id
    });

    revalidatePath("/");
    revalidateTag("resume", "default");
    return { success: true };
  });

export const compileLatexAndSaveAction = actionClient
  .schema(z.object({
    latexCode: z.string().min(1, "LaTeX code is required"),
    versionString: z.string().min(1, "Version label is required"),
    isCurrent: z.boolean(),
    status: z.string()
  }))
  .action(async ({ parsedInput: { latexCode, versionString, isCurrent, status } }) => {
    const supabase = await createSupabaseServerClient();
    const actorId = await getActorProfileId(supabase);
    const adminDb = createSupabaseAdminClient();

    const formData = new FormData();
    formData.append("filecontents[]", latexCode);
    formData.append("filename[]", "document.tex");
    formData.append("engine", "pdflatex");
    formData.append("return", "pdf");

    const response = await fetch("https://texlive.net/cgi-bin/latexcgi", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("LaTeX compilation failed. Please check your syntax for errors.");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `resume_${Date.now()}.pdf`;
    const bucket = "documents";
    const path = `resumes/${fileName}`;
    
    const { error: uploadError } = await adminDb.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: "application/pdf",
        upsert: true
      });

    if (uploadError) throw uploadError;

    const publicUrl = adminDb.storage.from(bucket).getPublicUrl(path).data.publicUrl;

    const { data: mediaAsset, error: mediaError } = await adminDb
      .from("media_assets")
      .insert({
        bucket,
        path,
        public_url: publicUrl,
        file_name: fileName,
        mime_type: "application/pdf",
        media_type: "pdf",
        file_size_bytes: buffer.length,
        status: "published"
      })
      .select("id")
      .single();

    if (mediaError) {
      // Rollback storage if DB insert fails
      await adminDb.storage.from(bucket).remove([path]);
      throw mediaError;
    }

    if (isCurrent) {
      await adminDb
        .from("resume_versions")
        .update({ is_current: false })
        .eq("is_current", true);
    }

    const insertData = {
      title: versionString,
      version_label: versionString,
      version_string: versionString,
      file_media_id: mediaAsset.id,
      media_asset_id: mediaAsset.id,
      is_current: isCurrent,
      status,
      description: latexCode,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await adminDb
      .from("resume_versions")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      // Rollback media asset and storage if resume insert fails
      const { deleteMediaAssetAction } = await import("./media-actions");
      await deleteMediaAssetAction(mediaAsset.id);
      throw error;
    }

    await adminDb.from("activity_log").insert({
      actor_user_id: actorId,
      actor_label: "Admin",
      action: `Generated & compiled LaTeX resume: ${versionString}`,
      target_type: "resume_version",
      target_id: data.id
    });

    revalidatePath("/");
    revalidateTag("resume", "default");
    return { success: true, id: data.id };
  });
