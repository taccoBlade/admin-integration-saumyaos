import { createSupabaseServerClient } from "./supabase/server";
import { createClient } from "@supabase/supabase-js";
import { Project, TimelineEvent, Skill } from "./types";

/**
 * Cookie-free Supabase client — safe to use in generateStaticParams,
 * generateMetadata at build time, and anywhere cookies() is unavailable.
 */
function createSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";
  return createClient(url, key);
}

interface SupabaseProjectRow {
  slug: string;
  title: string;
  description: string | null;
  overview: string | null;
  year: number;
  status_label: string;
  complexity_score: string | null;
  source_json: Record<string, unknown> | null;
}

function mapProject(row: SupabaseProjectRow): Project {
  const source = (row.source_json ?? {}) as Record<string, unknown>;
  const sourceStatus =
    source.status === "Completed" || source.status === "In Progress" || source.status === "Research"
      ? source.status
      : "Completed";
  const normalizedStatus =
    row.status_label === "Completed" || row.status_label === "In Progress" || row.status_label === "Research"
      ? row.status_label
      : null;
  const sourceComplexity =
    source.complexityScore === "Fundamental" ||
    source.complexityScore === "Intermediate" ||
    source.complexityScore === "Advanced"
      ? source.complexityScore
      : "Advanced";
  const normalizedComplexity =
    row.complexity_score === "Fundamental" ||
    row.complexity_score === "Intermediate" ||
    row.complexity_score === "Advanced"
      ? row.complexity_score
      : null;

  return {
    ...source,
    id: typeof source.id === "string" ? source.id : row.slug,
    title: row.title || (typeof source.title === "string" ? source.title : ""),
    description: row.description ?? (typeof source.description === "string" ? source.description : ""),
    year: row.year ?? (typeof source.year === "number" ? source.year : 0),
    domain: typeof source.domain === "string" ? source.domain : "Civil Engineering",
    technologies: Array.isArray(source.technologies) ? source.technologies.map(String) : [],
    status: normalizedStatus ?? sourceStatus,
    complexityScore: normalizedComplexity ?? sourceComplexity,
    overview: row.overview ?? (typeof source.overview === "string" ? source.overview : ""),
    gallery: Array.isArray(source.gallery) ? source.gallery.map(String) : [],
  } as Project;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("projects")
      .select("slug,title,description,overview,year,status_label,complexity_score,source_json")
      .eq("status", "published")
      .order("year", { ascending: false });

    if (error) throw error;

    const rows = (data ?? []) as SupabaseProjectRow[];

    return rows.map(mapProject).sort((a, b) => b.year - a.year);
  } catch (error) {
    console.error("Error reading projects from Supabase:", error);
    return [];
  }
}

/**
 * Build-time safe version of getProjects — uses a cookie-free public client.
 * Call this from generateStaticParams() to avoid the
 * "cookies() used inside generateStaticParams" error.
 */
export async function getProjectsPublic(): Promise<Project[]> {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select("slug,title,description,overview,year,status_label,complexity_score,source_json")
      .eq("status", "published")
      .order("year", { ascending: false });

    if (error) throw error;

    const rows = (data ?? []) as SupabaseProjectRow[];
    return rows.map(mapProject).sort((a, b) => b.year - a.year);
  } catch (error) {
    console.error("Error reading projects (public) from Supabase:", error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("projects")
      .select("slug,title,description,overview,year,status_label,complexity_score,source_json")
      .eq("slug", id)
      .eq("status", "published")
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return data ? mapProject(data as SupabaseProjectRow) : null;
  } catch (error) {
    console.error(`Error reading project ${id} from Supabase:`, error);
    return null;
  }
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const staticEvents: TimelineEvent[] = [
    {
      id: "edu-pdeu",
      year: 2024,
      title: "Started B.Tech in Civil Engineering — PDEU",
      description: "Began academic specialization in structural, geotechnical, transportation, and construction engineering.",
      type: "Education"
    },
    {
      id: "exp-brahmand",
      year: 2025,
      title: "Brahmand Club Content Writer & Creative Team",
      description: "Produced technical and promotional content for university events.",
      type: "Experience"
    },
    {
      id: "exp-cssi",
      year: 2025,
      title: "CSSI Internship",
      description: "Community development and social infrastructure initiatives.",
      type: "Experience"
    }
  ];

  let dbEvents: TimelineEvent[] = [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("timeline_events")
      .select("*")
      .eq("status", "published")
      .order("year", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      dbEvents = data.map((item) => ({
        id: item.id,
        year: item.year,
        title: item.title,
        description: item.description || undefined,
        type: item.type as TimelineEvent["type"],
        relatedProjectId: item.related_project_id || undefined
      }));
    }
  } catch (err) {
    console.error("Error reading timeline from Supabase, using fallback:", err);
  }

  const activeEvents = dbEvents.length > 0 ? dbEvents : staticEvents;

  const projects = await getProjects();
  const projectEvents: TimelineEvent[] = projects.map(proj => ({
    id: `timeline-${proj.id}`,
    year: proj.year,
    title: proj.title,
    description: proj.description,
    type: proj.status === "Research" ? "Research" : "Project",
    relatedProjectId: proj.id
  }));

  return [...activeEvents, ...projectEvents].sort((a, b) => a.year - b.year);
}

export async function getSkills(): Promise<Skill[]> {
  const baseSkills: { name: string; category: Skill["category"]; baseStrength: number }[] = [
    { name: "Concrete Technology", category: "Core Engineering", baseStrength: 9 },
    { name: "Construction Materials", category: "Core Engineering", baseStrength: 8 },
    { name: "Concrete Mix Design", category: "Core Engineering", baseStrength: 9 },
    { name: "Surveying", category: "Core Engineering", baseStrength: 8 },
    { name: "Engineering Software", category: "Core Engineering", baseStrength: 8 },
    { name: "QGIS", category: "Core Engineering", baseStrength: 8 },
    { name: "Python", category: "Programming", baseStrength: 9 },
    { name: "Flask", category: "Programming", baseStrength: 8 },
    { name: "OpenCV", category: "Programming", baseStrength: 8 },
    { name: "Arduino", category: "Programming", baseStrength: 8 },
    { name: "Embedded Systems", category: "Research", baseStrength: 8 },
    { name: "Sensor Integration", category: "Research", baseStrength: 8 },
    { name: "IoT", category: "Research", baseStrength: 8 },
    { name: "Computer Vision", category: "Research", baseStrength: 8 },
    { name: "Infrastructure Automation", category: "Research", baseStrength: 8 },
    { name: "Photography", category: "Creative", baseStrength: 7 },
    { name: "Cinematography", category: "Creative", baseStrength: 8 },
    { name: "Video Editing", category: "Creative", baseStrength: 8 },
    { name: "Graphic Design", category: "Creative", baseStrength: 7 }
  ];

  const skillsMap = new Map<string, Skill>();

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("skills")
      .select("*, taxonomy_terms!category_term_id(name)")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      data.forEach((item) => {
        skillsMap.set(item.name.toLowerCase(), {
          id: item.id,
          name: item.name,
          category: (item.taxonomy_terms?.name as Skill["category"]) || "Core Engineering",
          relatedProjects: [],
          strength: item.base_strength
        });
      });
    }
  } catch (err) {
    console.error("Error reading skills from Supabase, using fallback:", err);
  }

  // Populate fallback if no database skills loaded
  if (skillsMap.size === 0) {
    baseSkills.forEach((s, idx) => {
      skillsMap.set(s.name.toLowerCase(), {
        id: `skill-${idx}`,
        name: s.name,
        category: s.category,
        relatedProjects: [],
        strength: s.baseStrength
      });
    });
  }

  const projects = await getProjects();

  projects.forEach(proj => {
    const projRecord = proj as unknown as Record<string, unknown>;
    const subdomain = typeof projRecord.subdomain === "string" ? projRecord.subdomain : "";
    const engineeringConcepts = Array.isArray(projRecord.engineering_concepts)
      ? projRecord.engineering_concepts.map(String)
      : [];
    const researchAreas = Array.isArray(projRecord.research_areas)
      ? projRecord.research_areas.map(String)
      : [];

    const projectText = [
      proj.title,
      proj.description,
      proj.domain,
      proj.overview,
      ...(proj.technologies || []),
      ...(proj.engineeringInsights || []),
      subdomain,
      ...engineeringConcepts,
      ...researchAreas
    ].join(" ").toLowerCase();

    skillsMap.forEach((skill) => {
      const name = skill.name.toLowerCase();
      let isMatch = false;

      if (projectText.includes(name)) {
        isMatch = true;
      } else {
        const keywordsMap: Record<string, string[]> = {
          "civil engineering": ["civil", "concrete", "soil", "compaction", "geotechnical"],
          "qgis and drone mapping": ["qgis", "drone", "gis", "mapping", "surveying", "aerial"],
          "concrete technology": ["concrete", "cement", "pro-mix"],
          "concrete mix design": ["mix design", "pro-mix", "10262"],
          "construction materials": ["materials", "aggregate", "sand", "cement", "concrete"],
          "surveying": ["surveying", "leveling", "theodolite", "gps", "drone", "gis"],
          "engineering drawing": ["drawing", "cad", "autocad", "drafting", "blueprint"],
          "research & development": ["research", "development", "thesis", "experiment", "novel"],
          "technical documentation": ["documentation", "report", "paper", "insights", "compliance"],
          "data interpretation": ["data", "analysis", "interpretation", "charts", "graph", "accuracy"],
          "problem solving": ["problem", "solving", "optimization", "engine", "algorithm"],
          "intelligent compaction": ["compaction", "roller", "highways", "soil"],
          "video editing": ["video", "editing", "premiere", "resolve"],
          "photography": ["photography", "photo", "camera"],
          "content creation": ["content", "creation", "writing", "blog", "logbook"]
        };

        const keywords = keywordsMap[name] || [];
        if (keywords.some(kw => projectText.includes(kw))) {
          isMatch = true;
        }
      }

      if (isMatch && !skill.relatedProjects.includes(proj.id)) {
        skill.relatedProjects.push(proj.id);
      }
    });
  });

  const finalSkills = Array.from(skillsMap.values()).map(skill => {
    const projectCount = skill.relatedProjects.length;
    const strength = Math.min(10, skill.strength + projectCount);
    return {
      ...skill,
      strength
    };
  });

  return finalSkills.sort((a, b) => b.strength - a.strength);
}

export interface HeroData {
  id: string;
  title: string;
  tagline: string;
  subtitle: string;
  description: string;
  cover_image?: string;
  cta_text?: string;
  cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  status: string;
  version: number;
}

export async function getHero(): Promise<HeroData> {
  const fallbackHero: HeroData = {
    id: "default",
    title: "Saumya Parekh",
    tagline: "Civil Engineering & Infrastructure Systems",
    subtitle: "Computational Infrastructure Engineer",
    description: "Building intelligent infrastructure systems through civil engineering, data analysis, automation, and computational design. Specializing in concrete mix proportioning compliance and geotechnical site telemetry.",
    cta_text: "View Projects",
    cta_url: "#projects",
    secondary_cta_text: "Resume",
    secondary_cta_url: "#",
    status: "published",
    version: 1,
  };

  try {
    const resumeUrl = await getResumeUrl();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("hero")
      .select("*, media_assets!cover_image_id(public_url)")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ...fallbackHero, secondary_cta_url: resumeUrl };
    return {
      ...data,
      cover_image: (data.media_assets as Record<string, unknown> | null)?.public_url || "",
      secondary_cta_url: data.secondary_cta_url || resumeUrl
    } as HeroData;
  } catch (error) {
    console.error("Error reading hero from Supabase:", error);
    return fallbackHero;
  }
}

export async function getResumeUrl(): Promise<string> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("resume_versions")
      .select("media_assets!media_asset_id(public_url)")
      .eq("is_current", true)
      .eq("status", "published")
      .maybeSingle();
    return (data?.media_assets as any)?.public_url || "#";
  } catch {
    return "#";
  }
}

export interface ResearchEntryData {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  abstract?: string;
  publication_journal?: string;
  publication_date?: string;
  download_url?: string;
  status: string;
}

export async function getResearchEntries(): Promise<ResearchEntryData[]> {
  const fallbackLiterature = [
    { id: "ref-1", slug: "ref-1", title: "Theoretical Soil Mechanics", authors: ["Terzaghi, K."], publication_journal: "Academic Literature", publication_date: "1943", abstract: "One-dimensional consolidation calculations and pore pressure deflection equations." },
    { id: "ref-2", slug: "ref-2", title: "Properties of Concrete", authors: ["Neville, A. M."], publication_journal: "Academic Literature", publication_date: "2011", abstract: "Water-cement ratio parameters, aggregate grading limits, and geopolymerization boundaries." },
    { id: "ref-3", slug: "ref-3", title: "IRC:37-2018 Flexible Pavement Design", authors: ["Indian Roads Congress"], publication_journal: "Academic Literature", publication_date: "2018", abstract: "Resilient modulus (MR) mapping of subgrade soil compaction characteristics." }
  ];

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("research_entries")
      .select("*, media_assets!download_media_id(public_url)")
      .eq("status", "published")
      .order("publication_date", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return fallbackLiterature as any[];
    return data.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      authors: item.authors,
      abstract: item.abstract || "",
      publication_journal: item.publication_journal || "",
      publication_date: item.publication_date || "",
      download_url: (item.media_assets as any)?.public_url || ""
    })) as ResearchEntryData[];
  } catch (error) {
    console.error("Error reading research from Supabase:", error);
    return fallbackLiterature as any[];
  }
}

import { SpreadData, SpreadTemplate, PhotoData, EditorialRole } from "@/data/photos";

export async function getPhotoSpreads(): Promise<SpreadData[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: spreads, error: spreadsErr } = await supabase
      .from("photo_spreads")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (spreadsErr) throw spreadsErr;
    if (!spreads || spreads.length === 0) {
      const { editorialSpreads } = await import("@/data/photos");
      return editorialSpreads;
    }

    const { data: items, error: itemsErr } = await supabase
      .from("photo_spread_items")
      .select("*, media_assets!media_asset_id(public_url, alt_text)")
      .order("sort_order", { ascending: true });

    if (itemsErr) throw itemsErr;

    return spreads.map((spread) => {
      const spreadItems = (items || []).filter((item) => item.photo_spread_id === spread.id);
      return {
        id: spread.id,
        title: spread.title || undefined,
        template: (spread.template_type || spread.template) as SpreadTemplate,
        diaryEntry: spread.diary_entry || undefined,
        photos: spreadItems.map(item => ({
          src: (item.media_assets as any)?.public_url || "",
          role: item.role as EditorialRole,
          alt: item.alt_text || (item.media_assets as any)?.alt_text || "Editorial Image"
        }))
      };
    });
  } catch (error) {
    console.error("Error reading photography spreads from Supabase:", error);
    const { editorialSpreads } = await import("@/data/photos");
    return editorialSpreads;
  }
}

export interface AboutData {
  id: string;
  title: string;
  eyebrow: string;
  focus_cards_json: { title: string; description: string }[];
  obsessions_json: string[];
  status: string;
  version: number;
}

export async function getAbout(): Promise<AboutData> {
  const fallbackAbout: AboutData = {
    id: "default",
    title: "Current Focus",
    eyebrow: "Now",
    focus_cards_json: [
      { title: "Engineering", description: "Analyzing geotechnical engineering trends and deep excavations. Focusing on soil mechanics and infrastructure automation." },
      { title: "Markets", description: "Managing equity portfolios and mutual fund investments. Exploring market trajectories and risk allocation strategies." },
      { title: "Digital", description: "Exploring video clipping and content curation. Building automated portfolio systems and visual storytelling workflows." }
    ],
    obsessions_json: [
      "Deep Excavation Engineering",
      "Infrastructure Automation",
      "Portfolio Construction",
      "Visual Storytelling",
      "Human Performance (210kg Deadlift)"
    ],
    status: "published",
    version: 1,
  };

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("about")
      .select("*")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return fallbackAbout;
    return data as AboutData;
  } catch (error) {
    console.error("Error reading about from Supabase:", error);
    return fallbackAbout;
  }
}

