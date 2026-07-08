import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Dynamic Layout Components for Intent
import CommercialLayout from "./CommercialLayout";
import InformationalLayout from "./InformationalLayout";

interface Props {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  
  const supabase = await createSupabaseServerClient();
  const { data: page } = await supabase
    .from("seo_pages")
    .select("id, title, page_metadata(*)")
    .eq("slug", fullSlug)
    .single();

  if (!page) return { title: "Not Found" };

  const meta = page.page_metadata?.[0] || {};
  
  return {
    title: meta.meta_title || page.title,
    description: meta.meta_description,
    openGraph: {
      title: meta.meta_title || page.title,
      description: meta.meta_description,
      images: meta.og_image ? [meta.og_image] : [],
    },
    alternates: {
      canonical: meta.canonical_url,
    }
  };
}

export default async function GrowthCatchAllPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const fullSlug = slug.join("/");

  const supabase = await createSupabaseServerClient();

  // 1. Fetch Page (Bypass status check if valid preview token)
  let query = supabase
    .from("seo_pages")
    .select("*, keywords(intent), page_metadata(schema_json)")
    .eq("slug", fullSlug);
    
  if (preview) {
    query = query.eq("preview_token", preview).gte("preview_expires_at", new Date().toISOString());
  } else {
    query = query.eq("status", "Published");
  }

  const { data: page } = await query.single();

  if (!page) {
    notFound();
  }

  // 2. Fetch computed related projects (simulated using weighting algorithm via RPC, or fetch all and filter in TS)
  // For production scale, you'd use a server action or RPC. We fetch all for demo.
  const { data: projects } = await supabase.from("projects").select("id, title, slug, source_json, cover_image");
  
  const pageTech = new Set(page.related_technologies || []);
  const pageInd = new Set(page.related_services || []);
  
  const relatedProjects = (projects || [])
    .map(project => {
      let score = 0;
      const pTech = (project.source_json as any)?.software_components || [];
      const pDom = (project.source_json as any)?.domain || "";
      pTech.forEach((t: string) => { if (pageTech.has(t)) score += 2; });
      if (pageInd.has(pDom)) score += 3;
      return { ...project, score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // 3. Determine Layout by Intent
  const intent = page.keywords?.intent || "Informational";
  const schemaJson = page.page_metadata?.[0]?.schema_json;

  return (
    <main className="min-h-screen bg-[#0a0514] text-purple-50">
      {/* JSON-LD Injection */}
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}

      {/* Dynamic Intent-based Layout Rendering */}
      {intent === "Commercial" || intent === "Transactional" ? (
        <CommercialLayout page={page} relatedProjects={relatedProjects} />
      ) : (
        <InformationalLayout page={page} relatedProjects={relatedProjects} />
      )}
    </main>
  );
}
