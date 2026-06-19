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
      title: "Geotechnical Studies",
      description: "Deep excavation engineering and ground behavior analysis.",
      type: "Experience"
    },
    {
      id: "exp-markets",
      year: 2026,
      title: "Markets & Investing",
      description: "Portfolio construction and equity analysis.",
      type: "Experience"
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
    { name: "Civil Engineering", category: "Engineering", baseStrength: 8 },
    { name: "Geotechnical Engineering", category: "Engineering", baseStrength: 7 },
    { name: "Concrete Technology", category: "Engineering", baseStrength: 7 },
    { name: "Machine Learning", category: "Technology", baseStrength: 6 },
    { name: "Computer Vision", category: "Technology", baseStrength: 6 },
    { name: "Next.js", category: "Technology", baseStrength: 7 },
    { name: "ESP32", category: "Technology", baseStrength: 6 },
    { name: "IoT", category: "Technology", baseStrength: 6 },
    { name: "Portfolio Analysis", category: "Markets", baseStrength: 8 },
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

  // Helper to slugify tags
  const slugifyTag = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Process projects to map relationships and discover new skills
  projects.forEach(proj => {
    // Check technologies array
    proj.technologies.forEach(tech => {
      const key = tech.toLowerCase();
      if (skillsMap.has(key)) {
        const skill = skillsMap.get(key)!;
        if (!skill.relatedProjects.includes(proj.id)) {
          skill.relatedProjects.push(proj.id);
        }
      } else {
        // Dynamically add a new skill
        let category: Skill["category"] = "Technology";
        const civilTerms = ["civil", "concrete", "geotechnical", "soil", "mix design", "materials", "structures", "structural"];
        const marketTerms = ["market", "investing", "trading", "finance", "equity", "capital", "portfolio"];
        const creativeTerms = ["editing", "video", "photo", "writing", "story", "design", "cinematography"];

        if (civilTerms.some(t => key.includes(t))) category = "Engineering";
        else if (marketTerms.some(t => key.includes(t))) category = "Markets";
        else if (creativeTerms.some(t => key.includes(t))) category = "Creative";

        skillsMap.set(key, {
          id: `skill-dyn-${slugifyTag(tech)}`,
          name: tech,
          category,
          relatedProjects: [proj.id],
          strength: 5
        });
      }
    });

    // Check domain mapping
    const domainKey = proj.domain.toLowerCase();
    if (skillsMap.has(domainKey)) {
      const skill = skillsMap.get(domainKey)!;
      if (!skill.relatedProjects.includes(proj.id)) {
        skill.relatedProjects.push(proj.id);
      }
    }
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
