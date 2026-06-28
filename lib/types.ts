export type ProjectDomain = 
  | "Civil Engineering"
  | "Geotechnical Engineering"
  | "Infrastructure Automation"
  | "Precision Agriculture"
  | "Markets & Investing"
  | "Content Creation";

export interface Project {
  id: string;
  title: string;
  description: string;
  year: number;
  domain: ProjectDomain;
  technologies: string[];
  status: "Completed" | "In Progress" | "Research";
  complexityScore: "Fundamental" | "Intermediate" | "Advanced";
  overview: string;
  gallery: string[];
  githubUrl?: string;
  liveUrl?: string;
  engineeringInsights?: string[];
  relatedProjectIds?: string[];
  detailedOverview?: string;
  keyOutcomes?: string[];
  lessonsLearned?: string[];
  architectureTree?: unknown;
  // New fields for Project Case Study redesign
  role?: string;
  duration?: string;
  teamSize?: string;
  metrics?: { value: string; label: string }[];
  heroVisualType?: "dashboard" | "image" | "architecture" | "none";
  validationData?: {
    accuracy?: string;
    meanError?: string;
    samples?: number;
    standard?: string;
    comparison?: { reference: string; measured: string; deviation: string }[];
  };
  
  // New Narrative Structure Fields
  problem?: string;
  mySolution?: string;
  architecture?: string;
  implementation?: string;
  challenges?: string;
  whatILearned?: string;
  currentStatus?: string;
  futureImprovements?: string;
}

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  type: "Education" | "Experience" | "Project" | "Research";
  relatedProjectId?: string;
}

export interface LogbookEntry {
  id: string;
  title: string;
  date: string;
  category: 
    | "Deep Excavations" 
    | "Ground Improvement" 
    | "Concrete Technology" 
    | "Infrastructure Innovation" 
    | "Markets & Risk" 
    | "Content Systems";
  tags: string[];
  content: string; // Markdown content
}

export interface Skill {
  id: string;
  name: string;
  category: "Core Engineering" | "Technical Tools" | "Programming" | "Creative";
  relatedProjects: string[];
  strength: number; // 1 to 10
}

export interface ResearchNote {
  id: string;
  title: string;
  date: string;
  domain: ProjectDomain;
  abstract: string;
  downloadUrl?: string;
}
