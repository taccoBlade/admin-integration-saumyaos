import { createSupabaseServerClient } from "./supabase/server";
import { Project, TimelineEvent, Skill } from "./types";

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
    const supabase = createSupabaseServerClient();
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

export async function getProject(id: string): Promise<Project | null> {
  try {
    const supabase = createSupabaseServerClient();
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
      title: "Started B.Tech in Civil Engineering â€” PDEU",
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

  const projects = await getProjects();
  const projectEvents: TimelineEvent[] = projects.map(proj => ({
    id: `timeline-${proj.id}`,
    year: proj.year,
    title: proj.title,
    description: proj.description,
    type: proj.status === "Research" ? "Research" : "Project",
    relatedProjectId: proj.id
  }));

  return [...staticEvents, ...projectEvents].sort((a, b) => a.year - b.year);
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

  const projects = await getProjects();
  const skillsMap = new Map<string, Skill>();

  baseSkills.forEach((s, idx) => {
    skillsMap.set(s.name.toLowerCase(), {
      id: `skill-${idx}`,
      name: s.name,
      category: s.category,
      relatedProjects: [],
      strength: s.baseStrength
    });
  });

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
