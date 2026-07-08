"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface GrowthKeyword {
  id: string;
  keyword: string;
  intent: string;
  volume: number;
  difficulty: number;
  status: string;
}

export interface GrowthPage {
  id: string;
  page_type: string;
  slug: string;
  title: string;
  content_blocks: any[];
  status: string;
  published_at: string | null;
  primary_keyword_id: string | null;
  parent_page_id: string | null;
  related_pages: string[];
  related_services: string[];
  related_technologies: string[];
  related_projects: string[];
  cluster_id?: string | null;
  preview_token?: string | null;
  preview_expires_at?: string | null;
}

export interface ContentCluster {
  id: string;
  name: string;
  slug: string;
  core_topic: string;
  description: string;
}

export interface GrowthPageVersion {
  id: string;
  page_id: string;
  editor_user_id: string;
  snapshot_json: any;
  change_summary: string;
  created_at: string;
}

export async function getKeywordsAction() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("keywords")
    .select("*")
    .order("volume", { ascending: false });

  if (error) throw error;
  return data as GrowthKeyword[];
}

export async function createKeywordAction(keywordData: Partial<GrowthKeyword>) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("keywords")
    .insert([keywordData]);
    
  if (error) throw error;
  revalidatePath("/admin/growth/keywords");
}

export async function getSeoPagesAction() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("seo_pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as GrowthPage[];
}

export async function getSeoPageAction(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("seo_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as GrowthPage;
}

export async function createSeoPageAction(pageData: Partial<GrowthPage>, editorId: string) {
  const supabase = createSupabaseAdminClient();
  
  const { data, error } = await supabase
    .from("seo_pages")
    .insert([pageData])
    .select()
    .single();
    
  if (error) throw error;

  // Create initial version
  await supabase.from("seo_page_versions").insert({
    page_id: data.id,
    editor_user_id: editorId,
    snapshot_json: data,
    change_summary: "Initial Creation",
  });

  revalidatePath("/admin/growth/pages");
  return data as GrowthPage;
}

export async function updateSeoPageAction(id: string, pageData: Partial<GrowthPage>, editorId: string, changeSummary: string = "Updated page") {
  const supabase = createSupabaseAdminClient();
  
  const { data, error } = await supabase
    .from("seo_pages")
    .update(pageData)
    .eq("id", id)
    .select()
    .single();
    
  if (error) throw error;

  // Save new version
  await supabase.from("seo_page_versions").insert({
    page_id: id,
    editor_user_id: editorId,
    snapshot_json: data,
    change_summary: changeSummary,
  });

  revalidatePath(`/admin/growth/pages/${id}`);
  revalidatePath("/admin/growth/pages");
  
  // Revalidate public route if slug is known
  if (data.slug) {
    const slugParts = data.slug.split('/');
    revalidatePath(`/${slugParts.join('/')}`);
  }
  
  return data as GrowthPage;
}

export async function getPageVersionsAction(pageId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("seo_page_versions")
    .select("*")
    .eq("page_id", pageId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as GrowthPageVersion[];
}

export async function restorePageVersionAction(versionId: string, editorId: string) {
  const supabase = createSupabaseAdminClient();
  
  // Fetch the version
  const { data: version, error: versionErr } = await supabase
    .from("seo_page_versions")
    .select("*")
    .eq("id", versionId)
    .single();
    
  if (versionErr) throw versionErr;
  
  const snapshot = version.snapshot_json;
  delete snapshot.id;
  delete snapshot.created_at;
  delete snapshot.updated_at;

  return await updateSeoPageAction(version.page_id, snapshot, editorId, `Restored from version ${versionId}`);
}

export async function getProjectsForDynamicMatchingAction() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, source_json")
    .order("year", { ascending: false });

  if (error) throw error;
  return data;
}

export async function generatePreviewUrlAction(pageId: string) {
  const supabase = createSupabaseAdminClient();
  const token = crypto.randomUUID();
  // Expires in 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from("seo_pages")
    .update({ preview_token: token, preview_expires_at: expiresAt })
    .eq("id", pageId)
    .select("slug, preview_token")
    .single();
    
  if (error) throw error;
  
  return {
    url: `/${data.slug}?preview=${data.preview_token}`,
    expiresAt
  };
}

export async function getClustersAction() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("content_clusters")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data as ContentCluster[];
}

export async function createClusterAction(clusterData: Partial<ContentCluster>) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("content_clusters")
    .insert([clusterData]);
    
  if (error) throw error;
  revalidatePath("/admin/growth/analytics"); // Dashboard route
}
