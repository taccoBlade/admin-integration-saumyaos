import Link from "next/link";
import { getProject, getProjects } from "@/lib/content";
import { ArrowLeft, Globe, Calendar, Briefcase, Award, Zap, Lightbulb, Download } from "lucide-react";
import { ArchitectureVisualizer, TreeNode } from "@/components/architecture-visualizer";
import { DashboardEmbed } from "@/components/dashboard-embed";
import React from "react";

const PROJECT_DASHBOARD_MAP: Record<string, {
  port: number;
  title: string;
  mockupDescription: string;
  keyFeatures: string[];
}> = {
  "automated-soil-strain-and-settlement-analysis-system-with-iot-integration": {
    port: 8085,
    title: "Geotechnical Soil Strain & Settlement Analysis",
    mockupDescription: "Interactive real-time soil telemetry console tracking strain gauge values, analog-to-digital converter (ADC) signals, and settlement profiles under varying compaction loads.",
    keyFeatures: ["Real-time sensor calibration", "Telemetry charts with ADC filtering", "Consolidation settlement forecasts", "Continuous live telemetry stream"]
  },
  "promix-concrete-mix-design-compliance-dashboard": {
    port: 5001,
    title: "ProMix Concrete Mix Proportioning & Compliance Auditor",
    mockupDescription: "Automated concrete mix design console executing proportioning calculations according to IS 10262:2019 and validating against IS 456 durability limits.",
    keyFeatures: ["Automated IS 10262:2019 proportioning", "Multi-binder SCM blend calculations", "IS 456 durability limit validation", "Detailed mix proportions report export"]
  },
  "automation-intelligent-machine-guided-construction": {
    port: 5002,
    title: "NHAI Intelligent Compaction & Roller Tracking Map",
    mockupDescription: "Intelligent compaction monitoring dashboard displaying live heavy roller trajectories, pass counts, soil temperature gradients, and compaction value mappings in real-time.",
    keyFeatures: ["Live roller trajectory tracking", "Pass count map visualizer", "Compaction stiffness value profiles", "Simulated Socket.IO telemetry feeds"]
  },
  "soil-analysis-project-with-iot-integration": {
    port: 5003,
    title: "Precision Agricultural Crop Recommendation & Profit Engine",
    mockupDescription: "IoT-driven agricultural analytics dashboard that consumes N-P-K soil composition levels, temperature, and moisture telemetry to generate crop recommendations and economic revenue forecasts.",
    keyFeatures: ["Crop classifier using vector-distance", "Economic revenue & cost estimation", "Telemetry inputs for soil metrics", "Text-to-speech advisor recommendations"]
  }
};


interface PageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  const projects = getProjects();
  return projects.map(proj => ({
    id: proj.id,
  }));
}

export default function ProjectPage({ params }: PageProps) {
  const project = getProject(params.id);
  const dashboardConfig = project ? PROJECT_DASHBOARD_MAP[project.id] : undefined;


  if (!project) {
    return (
      <main className="min-h-screen bg-[#08090b] text-slate-200 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-cyan-500 mb-4 font-mono">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">Project Not Found</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            The project configuration `content/projects/generated/{params.id}.json` does not exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Profile</span>
          </Link>
        </div>
      </main>
    );
  }

  // Parse related projects
  const allProjects = getProjects();
  const relatedProjects = allProjects
    .filter(p => p.id !== project.id && (p.domain === project.domain || p.technologies.some(t => project.technologies.includes(t))))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#08090b] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-5 py-8 sm:px-8 lg:px-12 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Professional Profile</span>
        </Link>
        <div className="text-xs font-mono text-slate-500">
          Project Ref: {project.id}
        </div>
      </header>

      {/* Hero / Header Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-5 pt-8 pb-16 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs font-bold font-mono px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-md">
                {project.domain}
              </span>
              <span className="text-xs font-bold font-mono px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-md">
                {project.year}
              </span>
              <span className={`text-xs font-bold font-mono px-3 py-1 rounded-md border ${
                project.status === "Completed" 
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : project.status === "In Progress"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              }`}>
                {project.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              {project.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl leading-relaxed">
              {project.description}
            </p>
            
            {/* Github / Live Links */}
            {(project.githubUrl || project.liveUrl) && (
              <div className="flex flex-wrap gap-4 pt-2">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all font-mono text-sm text-white"
                  >
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.08-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.18 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                    </svg>
                    <span>View Source Code</span>
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all font-mono text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Live Demonstration</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Project Details Cards */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-6">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">
              PROJECT DETAILS
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  TIMEFRAME
                </span>
                <p className="text-sm font-semibold font-mono text-slate-200">{project.year}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                  DOMAIN
                </span>
                <p className="text-sm font-semibold font-mono text-slate-200 truncate">{project.domain}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  COMPLEXITY
                </span>
                <p className="text-sm font-semibold font-mono text-slate-200">{project.complexityScore}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  STATUS
                </span>
                <p className="text-sm font-semibold font-mono text-slate-200">{project.status}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">TECHNOLOGY STACK</span>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map(tech => (
                  <span key={tech} className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/5 text-slate-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-5 pb-32 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left column: Overview, File Tree Visualizer, Gallery */}
        <div className="lg:col-span-8 space-y-16">
          {/* Detailed Overview */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400 border-b border-white/5 pb-2">
              TECHNICAL DOCUMENTATION
            </h2>
            <div className="prose prose-invert max-w-none text-slate-300">
              {renderMarkdown(project.detailedOverview || project.overview)}
            </div>
          </div>

          {/* Live Interactive Dashboard */}
          {dashboardConfig && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400 border-b border-white/5 pb-2">
                LIVE INTERACTIVE DASHBOARD
              </h2>
              <p className="text-sm text-slate-405 leading-relaxed">
                Interact with the real-time computational system dashboard. Simulated sensor networks and feedback loops execute fully client-side.
              </p>
              <div className="pt-2">
                <DashboardEmbed
                  port={dashboardConfig.port}
                  title={dashboardConfig.title}
                  mockupDescription={dashboardConfig.mockupDescription}
                  keyFeatures={dashboardConfig.keyFeatures}
                />
              </div>
            </div>
          )}


          {/* Interactive File Tree Visualizer */}
          {!!project.architectureTree && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400 border-b border-white/5 pb-2">
                SYSTEM BLUEPRINT
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Explore the repository layout of the computational system.
              </p>
              <ArchitectureVisualizer tree={project.architectureTree as TreeNode} />
            </div>
          )}

          {/* Screenshot Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400 border-b border-white/5 pb-2">
                EMPIRICAL EVIDENCE GALLERY
              </h2>
              <div className="editorial-gallery-grid">
                {project.gallery.map((img, idx) => (
                  <div key={idx} className="editorial-gallery-card group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={img} 
                      alt={`${project.title} - Asset ${idx + 1}`} 
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded font-mono text-[9px] text-slate-400 border border-white/5 z-10">
                      ASSET_{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Outcomes, Lessons, Related Projects */}
        <div className="lg:col-span-4 space-y-12">
          {/* Key Outcomes */}
          <div className="p-6 rounded-2xl bg-[#08090b] border border-green-500/10 hover:border-green-500/20 transition-colors space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-green-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              KEY OUTCOMES
            </h3>
            <ul className="space-y-3 font-mono text-xs">
              {project.keyOutcomes?.map((outcome, idx) => (
                <li key={idx} className="flex gap-2 items-start text-slate-300 leading-relaxed">
                  <span className="text-green-500 mt-0.5">[✓]</span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lessons Learned */}
          <div className="p-6 rounded-2xl bg-[#08090b] border border-amber-500/10 hover:border-amber-500/20 transition-colors space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              LESSONS LEARNED
            </h3>
            <ul className="space-y-3 font-mono text-xs">
              {project.lessonsLearned?.map((lesson, idx) => (
                <li key={idx} className="flex gap-2 items-start text-slate-300 leading-relaxed">
                  <span className="text-amber-500 mt-0.5">[!]</span>
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Download solver card template */}
          <div className="p-6 rounded-2xl bg-[#08090b] border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              CALCULATIONS SOLVER
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download the computational solver files, Excel compliance sheets, or Python EKF scripts associated with this validation process.
            </p>
            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-cyan-500/20 hover:border-cyan-500 bg-cyan-500/5 hover:bg-cyan-500/15 text-cyan-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Download Calculations (ZIP)</span>
            </button>
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">
                RELATED PROJECTS
              </h3>
              <div className="space-y-3">
                {relatedProjects.map(rel => (
                  <Link
                    key={rel.id}
                    href={`/projects/${rel.id}`}
                    className="block p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.03] transition-all"
                  >
                    <span className="text-[10px] font-mono text-cyan-400 block mb-1">{rel.domain}</span>
                    <h4 className="text-sm font-semibold text-white truncate mb-1">{rel.title}</h4>
                    <p className="text-xs text-slate-400 truncate">{rel.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// Simple and robust custom styled markdown converter supporting inline/block LaTeX equations
function renderMarkdown(md: string): React.ReactNode {
  if (!md) return null;
  const lines = md.split("\n");
  let inList = false;
  let inCode = false;
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let codeLines: string[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc space-y-2 my-4 pl-5 text-slate-350 text-sm md:text-base">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushCode = (key: number) => {
    if (codeLines.length > 0) {
      elements.push(
        <pre key={`code-${key}`} className="bg-black/50 border border-white/10 rounded-xl p-4 my-4 font-mono text-xs sm:text-sm overflow-x-auto text-cyan-300">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      codeLines = [];
      inCode = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle block LaTeX equations starting and ending with $$
    if (line.startsWith("$$") && line.endsWith("$$")) {
      flushList(i);
      flushCode(i);
      const eq = line.substring(2, line.length - 2);
      elements.push(
        <div key={i} className="my-6 p-5 rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.01] text-center font-mono text-xs sm:text-sm md:text-base text-cyan-400 overflow-x-auto">
          {eq}
        </div>
      );
      continue;
    }

    if (line.startsWith("```")) {
      if (inCode) {
        flushCode(i);
      } else {
        flushList(i);
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    const listMatch = line.match(/^\s*[-\*+]\s+(.+)$/) || line.match(/^\s*\d+\.\s+(.+)$/);
    if (listMatch) {
      inList = true;
      listItems.push(listMatch[1]);
      continue;
    } else if (inList && line.trim() === "") {
      // empty lines in list
    } else if (inList) {
      flushList(i);
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-2xl sm:text-3xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2">
          {line.substring(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl sm:text-2xl font-semibold text-white mt-6 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-cyan-500 rounded-full inline-block" />
          {line.substring(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-base sm:text-lg font-medium text-slate-200 mt-4 mb-2">
          {line.substring(4)}
        </h3>
      );
    } else if (line.trim() !== "") {
      // Split by backticks for code blocks and then by dollar signs for inline math
      const parts = line.split("`");
      const renderedLine = parts.flatMap((part, idx) => {
        if (idx % 2 === 1) {
          return [<code key={`code-${idx}`} className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-cyan-300 text-[11px]">{part}</code>];
        }
        
        const mathParts = part.split("$");
        return mathParts.map((mPart, mIdx) => {
          if (mIdx % 2 === 1) {
            return <span key={`math-${idx}-${mIdx}`} className="font-mono text-cyan-300 italic px-1 bg-white/[0.02] rounded">{mPart}</span>;
          }
          return mPart;
        });
      });

      elements.push(
        <p key={i} className="text-slate-350 leading-relaxed text-sm md:text-base mb-4">
          {renderedLine}
        </p>
      );
    }
  }

  flushList(lines.length);
  flushCode(lines.length);

  return <div className="space-y-4">{elements}</div>;
}
