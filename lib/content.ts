import fs from "fs";
import path from "path";
import { Project, TimelineEvent, Skill } from "./types";

const contentDir = path.join(process.cwd(), "content");
const generatedProjectsDir = path.join(contentDir, "projects", "generated");

// Helper to safely read JSON files
function readJsonFile<T>(filePath: string): T | null {
  try {
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf8");
      return JSON.parse(fileContents) as T;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return null;
}

export function getProjects(): Project[] {
  try {
    if (!fs.existsSync(generatedProjectsDir)) return [];
    
    const files = fs.readdirSync(generatedProjectsDir);
    const projects: Project[] = [];
    
    for (const file of files) {
      if (file.endsWith(".json")) {
        const project = readJsonFile<Project>(path.join(generatedProjectsDir, file));
        if (project) projects.push(project);
      }
    }
    
    return projects.sort((a, b) => b.year - a.year);
  } catch (error) {
    console.error("Error reading projects:", error);
    return [];
  }
}

export function getProject(id: string): Project | null {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
}

export function getTimelineEvents(): TimelineEvent[] {
  const staticEvents: TimelineEvent[] = [
    {
      id: "edu-pdeu",
      year: 2024,
      title: "Started Civil Engineering at PDEU",
      description: "Began formal education in civil and geotechnical engineering.",
      type: "Education"
    },
    {
      id: "exp-brahmand",
      year: 2025,
      title: "Brahmand Club Content Writing",
      description: "Began digital content creation and storytelling.",
      type: "Experience"
    },
    {
      id: "exp-cssi",
      year: 2025,
      title: "CSSI Internship",
      description: "Community Development Work.",
      type: "Experience"
    },
    {
      id: "exp-geotech",
      year: 2026,
      title: "Advanced Coursework in Geotechnical Engineering",
      description: "Deep excavation engineering and ground behavior analysis.",
      type: "Education"
    }
  ];

  const projects = getProjects();
  const projectEvents: TimelineEvent[] = projects.map(proj => ({
    id: `timeline-${proj.id}`,
    year: proj.year,
    title: proj.title,
    description: proj.description,
    type: proj.status === "Research" ? "Research" : "Project",
    relatedProjectId: proj.id
  }));

  // Combine and sort chronologically (ascending)
  return [...staticEvents, ...projectEvents].sort((a, b) => a.year - b.year);
}

export function getSkills(): Skill[] {
  const baseSkills: { name: string; category: Skill["category"]; baseStrength: number }[] = [
    { name: "Concrete Technology", category: "Core Engineering", baseStrength: 9 },
    { name: "Geotechnical Engineering", category: "Core Engineering", baseStrength: 9 },
    { name: "Surveying", category: "Core Engineering", baseStrength: 8 },
    { name: "Transportation Engineering", category: "Core Engineering", baseStrength: 8 },
    { name: "Concrete Mix Design", category: "Core Engineering", baseStrength: 9 },
    { name: "Construction Materials", category: "Core Engineering", baseStrength: 8 },
    { name: "AutoCAD", category: "Technical Tools", baseStrength: 8 },
    { name: "Civil 3D", category: "Technical Tools", baseStrength: 7 },
    { name: "QGIS", category: "Technical Tools", baseStrength: 8 },
    { name: "STAAD Pro", category: "Technical Tools", baseStrength: 7 },
    { name: "ETABS", category: "Technical Tools", baseStrength: 7 },
    { name: "Python", category: "Programming", baseStrength: 9 },
    { name: "Flask", category: "Programming", baseStrength: 8 },
    { name: "OpenCV", category: "Programming", baseStrength: 8 },
    { name: "Arduino", category: "Programming", baseStrength: 8 },
    { name: "Data Interpretation", category: "Programming", baseStrength: 8 },
    { name: "Problem Solving", category: "Programming", baseStrength: 8 },
    { name: "Photography", category: "Creative", baseStrength: 7 },
    { name: "Cinematography", category: "Creative", baseStrength: 8 },
    { name: "Graphic Design", category: "Creative", baseStrength: 7 },
    { name: "Video Editing", category: "Creative", baseStrength: 8 }
  ];

  const projects = getProjects();
  const skillsMap = new Map<string, Skill>();

  // Initialize base skills
  baseSkills.forEach((s, idx) => {
    skillsMap.set(s.name.toLowerCase(), {
      id: `skill-${idx}`,
      name: s.name,
      category: s.category,
      relatedProjects: [],
      strength: s.baseStrength
    });
  });

  // Process projects to map relationships
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
        // Custom keyword mapping to match projects to skills
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

      if (isMatch) {
        if (!skill.relatedProjects.includes(proj.id)) {
          skill.relatedProjects.push(proj.id);
        }
      }
    });
  });

  // Re-calculate strength based on the number of related projects
  const finalSkills = Array.from(skillsMap.values()).map(skill => {
    const projectCount = skill.relatedProjects.length;
    // Increase strength by 1 for every project utilizing it, capped at 10
    const strength = Math.min(10, skill.strength + projectCount);
    return {
      ...skill,
      strength
    };
  });

  // Sort by strength descending
  return finalSkills.sort((a, b) => b.strength - a.strength);
}

