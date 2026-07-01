import fs from "fs";
import path from "path";
import { createSupabaseAdminClient } from "../lib/supabase/admin";

type JsonRecord = Record<string, unknown>;

interface ProjectSource extends JsonRecord {
  id: string;
  title: string;
  description?: string;
  overview?: string;
  year: number;
  domain: string;
  status?: string;
  complexityScore?: string;
  subdomain?: string;
  timeline?: string;
  role?: string;
  teamSize?: string;
  problem?: string;
  mySolution?: string;
  architecture?: string;
  implementation?: string;
  challenges?: string;
  outcomes?: string;
  whatILearned?: string;
  currentStatus?: string;
  futureImprovements?: string;
  lessonsLearned?: string[];
  metrics?: unknown;
  githubUrl?: string;
  liveUrl?: string;
  hardware_components?: string[];
  software_components?: string[];
  engineering_concepts?: string[];
  research_areas?: string[];
  architectureTree?: unknown;
  validationData?: unknown;
}

interface SupabaseProjectRow {
  id: string;
  slug: string;
  title: string;
  year: number;
  source_json: ProjectSource;
}

const root = process.cwd();
const generatedProjectsDir = path.join(root, "content", "projects", "generated");

function loadLocalEnv() {
  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(root, fileName);
    if (!fs.existsSync(filePath)) continue;

    const contents = fs.readFileSync(filePath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] ??= value;
    }
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function buildLinksJson(project: ProjectSource) {
  const links: Array<{ type: string; label: string; url: string }> = [];
  if (project.githubUrl) links.push({ type: "github", label: "Source Code", url: project.githubUrl });
  if (project.liveUrl) links.push({ type: "live_demo", label: "Live Demo", url: project.liveUrl });
  return links;
}

function buildMetricsJson(project: ProjectSource) {
  if (Array.isArray(project.metrics)) return project.metrics;
  if (project.metrics && typeof project.metrics === "object") {
    return Object.entries(project.metrics as Record<string, unknown>).map(([key, value]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      value: String(value),
    }));
  }
  return [];
}

function projectPayload(project: ProjectSource, domainTermId: string | null, sortOrder: number) {
  return {
    slug: project.id,
    title: project.title,
    short_title: typeof project.project_name === "string" ? project.project_name : null,
    description: project.description ?? null,
    overview: project.overview ?? null,
    year: project.year,
    domain_term_id: domainTermId,
    subdomain: project.subdomain ?? null,
    status_label: project.status ?? "Completed",
    complexity_score: project.complexityScore ?? null,
    timeline_label: project.timeline ?? null,
    role: project.role ?? null,
    team_size: project.teamSize ?? null,
    problem: project.problem ?? null,
    solution: project.mySolution ?? null,
    architecture: project.architecture ?? null,
    implementation: project.implementation ?? null,
    challenges: project.challenges ?? null,
    outcomes: project.outcomes ?? null,
    lessons_learned_json: project.lessonsLearned ?? [],
    current_status: project.currentStatus ?? null,
    future_improvements: project.futureImprovements ?? null,
    metrics_json: buildMetricsJson(project),
    links_json: buildLinksJson(project),
    hardware_components_json: asArray(project.hardware_components),
    software_components_json: asArray(project.software_components),
    engineering_concepts_json: asArray(project.engineering_concepts),
    research_areas_json: asArray(project.research_areas),
    architecture_tree_json: project.architectureTree ?? null,
    validation_data_json: project.validationData ?? null,
    content_sections_json: {
      detailedOverview: project.detailedOverview ?? null,
      keyOutcomes: project.keyOutcomes ?? [],
      engineeringInsights: project.engineeringInsights ?? [],
    },
    source_json: project,
    featured: true,
    sort_order: sortOrder,
    status: "published",
    published_at: new Date().toISOString(),
  };
}

function readProjects() {
  const files = fs
    .readdirSync(generatedProjectsDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  return files.map((file) => {
    const filePath = path.join(generatedProjectsDir, file);
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as ProjectSource;
  });
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as JsonRecord)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${stableStringify(child)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function main() {
  loadLocalEnv();

  const supabase = createSupabaseAdminClient();
  const projects = readProjects();

  const domains = Array.from(new Set(projects.map((project) => project.domain))).sort();
  const { data: domainRows, error: domainError } = await supabase
    .from("taxonomy_terms")
    .upsert(
      domains.map((domain, index) => ({
      taxonomy_type: "domain",
      slug: slugify(domain),
      name: domain,
      sort_order: index,
      })),
      { onConflict: "taxonomy_type,slug" }
    )
    .select("id,name,slug");

  if (domainError) throw domainError;

  const domainIdByName = new Map((domainRows ?? []).map((row) => [row.name, row.id]));
  const projectRows = projects.map((project, index) =>
    projectPayload(project, domainIdByName.get(project.domain) ?? null, index)
  );

  const { error: projectError } = await supabase
    .from("projects")
    .upsert(projectRows, { onConflict: "slug" });

  if (projectError) throw projectError;

  const { data: insertedRows, error: compareError } = await supabase
    .from("projects")
    .select("id,slug,title,year,source_json")
    .in("slug", projects.map((project) => project.id));

  if (compareError) throw compareError;

  const insertedBySlug = new Map(((insertedRows ?? []) as SupabaseProjectRow[]).map((row) => [row.slug, row]));
  const mismatches: string[] = [];

  for (const project of projects) {
    const inserted = insertedBySlug.get(project.id);
    if (!inserted) {
      mismatches.push(`${project.id}: missing after insert`);
      continue;
    }
    if (inserted.title !== project.title || inserted.year !== project.year) {
      mismatches.push(`${project.id}: scalar mismatch`);
      continue;
    }
    if (stableStringify(inserted.source_json) !== stableStringify(project)) {
      mismatches.push(`${project.id}: source_json mismatch`);
    }
  }

  if (mismatches.length > 0) {
    console.error("Comparison failed:");
    for (const mismatch of mismatches) console.error(`- ${mismatch}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Inserted and verified ${projects.length} projects in Supabase.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
