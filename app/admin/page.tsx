import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminShell from "./components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch admin profile
  const { data: profile } = await supabase
    .from("admin_profile")
    .select("display_name, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Fetch projects
  const { data: projectsData } = await supabase
    .from("projects")
    .select("id, slug, title, year, description, overview, status, source_json")
    .order("year", { ascending: false });

  const resolvedProfile = {
    display_name: profile?.display_name || user.email?.split("@")[0] || "Saumya",
    email: profile?.email || user.email || "",
  };

  const resolvedProjects = (projectsData || []).map((proj) => ({
    id: proj.id,
    slug: proj.slug,
    title: proj.title,
    year: proj.year,
    description: proj.description || "",
    overview: proj.overview || "",
    status: ((proj.source_json as Record<string, unknown>)?.workflow_status as string) || proj.status,
  }));

  return (
    <AdminShell
      profile={resolvedProfile}
      projects={resolvedProjects}
    />
  );
}
