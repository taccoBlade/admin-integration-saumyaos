import Link from "next/link";
import { getProject, getProjects } from "@/lib/content";
import { ArrowLeft, Globe, Briefcase, Zap, Lightbulb, Download, Users, Clock, ShieldCheck } from "lucide-react";
import { ArchitectureVisualizer, TreeNode } from "@/components/home/architecture-visualizer";
import { MetricsGrid } from "@/components/personal/metrics-grid";
import React from "react";

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


  if (!project) {
    return (
      <main className="min-h-screen bg-[#08090b] text-slate-200 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-attention-500 mb-4 font-mono">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">Project Not Found</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            The project configuration `content/projects/generated/{params.id}.json` does not exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-attention-500/10 border border-attention-500/30 text-attention-400 hover:bg-attention-500/20 hover:border-attention-500/50 transition-all text-sm font-semibold"
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
    <main className="min-h-screen bg-[#08090b] text-slate-200 font-sans selection:bg-attention-500/30 overflow-x-hidden relative">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-attention-500/[0.02] to-transparent pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-5 py-8 sm:px-8 lg:px-12 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group text-sm font-mono text-slate-400 hover:text-attention-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Professional Profile</span>
        </Link>
        <div className="text-xs font-mono text-slate-500">
          Project Ref: {project.id}
        </div>
      </header>

      <section className="relative z-10 w-full max-w-7xl mx-auto px-5 pt-4 pb-8 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-12 space-y-6">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs font-bold font-mono px-3 py-1 bg-attention-500/10 border border-attention-500/20 text-attention-400 rounded-md">
                {project.domain}
              </span>
              <span className="text-xs font-bold font-mono px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-md">
                {project.year}
              </span>
              <span className={`text-xs font-bold font-mono px-3 py-1 rounded-md border ${
                project.status === "Completed" 
                  ? "bg-attention-500/10 border-attention-500/20 text-attention-400"
                  : project.status === "In Progress"
                    ? "bg-attention-500/10 border-attention-500/20 text-attention-400"
                    : "bg-attention-500/10 border-attention-500/20 text-attention-400"
              }`}>
                {project.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-attention-500/10 border border-attention-500/30 text-attention-400 hover:bg-attention-500/20 hover:border-attention-500/50 transition-all font-mono text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Live Demonstration</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Project At A Glance Grid */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-5 pb-8 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white/[0.01] border border-white/5">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-attention-400" />
              Role
            </span>
            <p className="text-sm font-semibold font-mono text-slate-200">{project.role || "Lead Engineer"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 uppercase">
              <Clock className="w-3.5 h-3.5 text-attention-400" />
              Duration
            </span>
            <p className="text-sm font-semibold font-mono text-slate-200">{project.duration || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 uppercase">
              <Users className="w-3.5 h-3.5 text-attention-400" />
              Team
            </span>
            <p className="text-sm font-semibold font-mono text-slate-200">{project.teamSize || "Solo"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 uppercase">
              <Briefcase className="w-3.5 h-3.5 text-attention-400" />
              Domain
            </span>
            <p className="text-sm font-semibold font-mono text-slate-200">{project.domain}</p>
          </div>
        </div>

        {/* Technology Stack Inline */}
        <div className="flex flex-wrap items-center gap-2 pt-6">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider pr-2 border-r border-white/10">STACK</span>
          {project.technologies.map(tech => (
            <span key={tech} className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/5 text-slate-300">
              {tech}
            </span>
          ))}
        </div>

        {/* Metrics */}
        <div className="mt-8 space-y-8">
          {project.metrics && project.metrics.length > 0 && <MetricsGrid metrics={project.metrics} />}
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-5 pb-32 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left column: Overview, File Tree Visualizer, Gallery */}
        <div className="lg:col-span-8 space-y-16">
          {/* 1. Overview */}
          {project.overview && (
            <div className="space-y-4">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-500 pb-2">
                OVERVIEW
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300">
                {renderMarkdown(project.overview)}
              </div>
            </div>
          )}

          {/* 2. Problem */}
          {project.problem && (
            <div className="space-y-4">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-500 pb-2">
                THE PROBLEM
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300">
                {renderMarkdown(project.problem)}
              </div>
            </div>
          )}

          {/* 3. My Solution */}
          {project.mySolution && (
            <div className="space-y-4">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-500 pb-2">
                MY SOLUTION
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300">
                {renderMarkdown(project.mySolution)}
              </div>
            </div>
          )}

          {/* 4. Architecture */}
          {project.architecture && (
            <div className="space-y-4">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-500 pb-2">
                ARCHITECTURE
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300">
                {renderMarkdown(project.architecture)}
              </div>
              
              {/* Architecture Blueprint Tree */}
              {!!project.architectureTree && (
                <div className="pt-4">
                  <ArchitectureVisualizer tree={project.architectureTree as TreeNode} />
                </div>
              )}
            </div>
          )}

          {/* 5. Implementation */}
          {project.implementation && (
            <div className="space-y-4">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-500 pb-2">
                IMPLEMENTATION
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300">
                {renderMarkdown(project.implementation)}
              </div>
            </div>
          )}

          {/* 6. Screenshots */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-500 pb-2">
                SCREENSHOTS
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

          {/* 7. Challenges I Faced */}
          {project.challenges && (
            <div className="space-y-4">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-500 pb-2">
                CHALLENGES I FACED
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300">
                {renderMarkdown(project.challenges)}
              </div>
            </div>
          )}

          {/* 8. What I Learned */}
          {project.whatILearned && (
            <div className="space-y-4">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-500 pb-2">
                WHAT I LEARNED
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300">
                {renderMarkdown(project.whatILearned)}
              </div>
            </div>
          )}

          {/* 9. Current Status */}
          {project.currentStatus && (
            <div className="space-y-4">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-500 pb-2">
                CURRENT STATUS
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300">
                {renderMarkdown(project.currentStatus)}
              </div>
            </div>
          )}

          {/* 10. Future Improvements */}
          {project.futureImprovements && (
            <div className="space-y-4">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-500 pb-2">
                FUTURE IMPROVEMENTS
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300">
                {renderMarkdown(project.futureImprovements)}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Outcomes, Lessons, Related Projects */}
        <div className="lg:col-span-4 space-y-12">
          {/* Key Outcomes */}
          <div className="p-6 rounded-2xl bg-[#08090b] border border-attention-500/10 hover:border-attention-500/20 transition-colors space-y-4">
            <h3 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-attention-400" />
              KEY OUTCOMES
            </h3>
            <ul className="space-y-3 font-mono text-xs">
              {project.keyOutcomes?.map((outcome, idx) => (
                <li key={idx} className="flex gap-2 items-start text-slate-300 leading-relaxed">
                  <span className="text-attention-500 mt-0.5">[✓]</span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lessons Learned */}
          <div className="p-6 rounded-2xl bg-[#08090b] border border-attention-500/10 hover:border-attention-500/20 transition-colors space-y-4">
            <h3 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-attention-400" />
              LESSONS LEARNED
            </h3>
            <ul className="space-y-3 font-mono text-xs">
              {project.lessonsLearned?.map((lesson, idx) => (
                <li key={idx} className="flex gap-2 items-start text-slate-300 leading-relaxed">
                  <span className="text-attention-500 mt-0.5">[!]</span>
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Download solver card template */}
          <div className="p-6 rounded-2xl bg-[#08090b] border border-white/5 space-y-4">
            <h3 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
              <Download className="w-3.5 h-3.5 text-attention-400" />
              CALCULATIONS SOLVER
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download the computational solver files, Excel compliance sheets, or Python EKF scripts associated with this validation process.
            </p>
            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-attention-500/20 hover:border-attention-500 bg-attention-500/5 hover:bg-attention-500/15 text-attention-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer">
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
                    className="block p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:border-attention-500/20 hover:bg-white/[0.03] transition-all"
                  >
                    <span className="text-[10px] font-mono text-attention-400 block mb-1">{rel.domain}</span>
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
function parseInlineContent(text: string): React.ReactNode {
  if (!text) return "";
  
  // Match link, bold, italic, code, math
  const tokenRegex = /(\[[^\]]+\]\(.+?\))|(\*\*.*?\*\*)|(\*.*?\*)|(`.*?`)|(\$.*?\$)/g;
  const parts = text.split(tokenRegex);
  
  if (parts.length === 1) return text;
  
  return (
    <>
      {parts.filter(p => p !== undefined).map((part, idx) => {
        // Link: [label](url)
        if (part.startsWith("[") && part.includes("](")) {
          const match = part.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            const [, label, url] = match;
            return (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-attention-400 hover:text-attention-hover hover:underline transition-colors inline-flex items-center gap-0.5 font-mono text-[13px] font-semibold"
              >
                {label}
                <span className="text-[10px] font-sans">↗</span>
              </a>
            );
          }
        }
        
        // Bold: **text**
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={idx} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        
        // Italic: *text*
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={idx} className="italic text-slate-200">{part.slice(1, -1)}</em>;
        }
        
        // Inline code: `code`
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={idx} className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-attention-300 text-[11px] select-all">
              {part.slice(1, -1)}
            </code>
          );
        }
        
        // Inline math: $math$
        if (part.startsWith("$") && part.endsWith("$")) {
          return (
            <span key={idx} className="font-mono text-attention-400 italic px-1 bg-attention-500/5 rounded">
              {part.slice(1, -1)}
            </span>
          );
        }
        
        return part;
      })}
    </>
  );
}

function renderTable(tableLines: string[], key: number): React.ReactNode {
  const parsedRows = tableLines.map(line => {
    return line
      .split("|")
      .map(cell => cell.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
  });
  
  if (parsedRows.length < 2) return null;
  
  const headers = parsedRows[0];
  const separator = parsedRows[1];
  
  const isSeparator = separator.every(cell => /^[:-]+$/.test(cell));
  const rows = isSeparator ? parsedRows.slice(2) : parsedRows.slice(1);
  
  return (
    <div key={`table-${key}`} className="my-8 overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01] backdrop-blur-sm shadow-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                {parseInlineContent(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-white/[0.01] transition-colors">
              {row.map((cell, cIdx) => {
                const cleanCell = cell.replace(/\s/g, '');
                const isNumeric = /^[₹0-9.,\-+±%xX\/]+$/.test(cleanCell);
                return (
                  <td key={cIdx} className="px-4 py-3 text-sm text-slate-350 font-light">
                    <span className={isNumeric ? 'font-mono text-xs text-attention-300 font-medium' : ''}>
                      {parseInlineContent(cell)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBlockquote(bqLines: string[], key: number): React.ReactNode {
  const text = bqLines.map(line => {
    const trimmed = line.trim();
    return trimmed.startsWith(">") ? trimmed.slice(1).trim() : trimmed;
  }).join("\n");
  
  const alertMatch = text.match(/^\[!(NOTE|IMPORTANT|WARNING|TIP|CAUTION)\]/i);
  let alertType = "";
  let contentText = text;
  
  if (alertMatch) {
    alertType = alertMatch[1].toUpperCase();
    contentText = text.replace(/^\[!(NOTE|IMPORTANT|WARNING|TIP|CAUTION)\]\s*/i, "");
  }
  
  let borderClass = "border-attention-500/20";
  let bgClass = "bg-attention-500/[0.02]";
  let textClass = "text-attention-400";
  let title = "NOTE";
  
  if (alertType === "WARNING" || alertType === "CAUTION") {
    borderClass = "border-red-500/30";
    bgClass = "bg-red-500/[0.02]";
    textClass = "text-red-400";
    title = "WARNING";
  } else if (alertType === "IMPORTANT") {
    borderClass = "border-attention-500/40";
    bgClass = "bg-attention-500/[0.03]";
    textClass = "text-attention-300";
    title = "IMPORTANT";
  } else if (alertType === "TIP") {
    borderClass = "border-emerald-500/30";
    bgClass = "bg-emerald-500/[0.02]";
    textClass = "text-emerald-400";
    title = "TIP";
  }
  
  return (
    <div key={`bq-${key}`} className={`my-6 p-5 rounded-2xl border ${borderClass} ${bgClass} backdrop-blur-sm relative overflow-hidden shadow-sm`}>
      {alertType && (
        <div className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-2 ${textClass}`}>
          [{title}]
        </div>
      )}
      <div className="prose prose-invert max-w-none text-slate-300 font-light italic leading-relaxed text-[15px]">
        {renderMarkdown(contentText)}
      </div>
    </div>
  );
}

function renderMarkdown(md: string): React.ReactNode {
  if (!md) return null;
  const processedMd = md.replace(/\\n/g, '\n');
  const lines = processedMd.split("\n");
  const elements: React.ReactNode[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // 1. Block LaTeX equations
    if (line.trim().startsWith("$$") && line.trim().endsWith("$$") && line.trim().length > 2) {
      const eq = line.trim().substring(2, line.trim().length - 2);
      elements.push(
        <div key={`eq-${i}`} className="my-6 p-5 rounded-2xl border border-attention-500/15 bg-attention-500/[0.02] text-center font-mono text-xs sm:text-sm md:text-base text-attention-400 overflow-x-auto shadow-sm">
          {eq}
        </div>
      );
      i++;
      continue;
    }
    
    // 2. Code blocks
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre key={`code-${i}`} className="bg-black/40 border border-white/5 rounded-xl p-4 my-6 font-mono text-xs sm:text-sm overflow-x-auto text-attention-300 shadow-glass">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }
    
    // 3. Tables
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const tableNode = renderTable(tableLines, i);
      if (tableNode) {
        elements.push(tableNode);
      }
      continue;
    }
    
    // 4. Blockquotes
    if (line.trim().startsWith(">")) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        bqLines.push(lines[i]);
        i++;
      }
      elements.push(renderBlockquote(bqLines, i));
      continue;
    }
    
    // 5. Lists
    const listMatch = line.match(/^\s*[-\*+]\s+(.+)$/) || line.match(/^\s*\d+\.\s+(.+)$/);
    if (listMatch) {
      const listItems: string[] = [];
      while (i < lines.length) {
        const currLine = lines[i];
        const currMatch = currLine.match(/^\s*[-\*+]\s+(.+)$/) || currLine.match(/^\s*\d+\.\s+(.+)$/);
        if (currMatch) {
          listItems.push(currMatch[1]);
          i++;
        } else if (currLine.trim() === "") {
          i++;
        } else {
          break;
        }
      }
      elements.push(
        <ul key={`list-${i}`} className="space-y-2.5 my-5 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-slate-350 font-light leading-relaxed text-[15px]">
              <span className="text-attention-500 select-none font-mono text-xs mt-1.5">▪</span>
              <div className="flex-1">{parseInlineContent(item)}</div>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    
    // 6. Horizontal Rule
    if (line.trim() === "---") {
      elements.push(
        <hr key={`hr-${i}`} className="my-8 border-t border-dashed border-white/10" />
      );
      i++;
      continue;
    }
    
    // 7. Headings
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2 tracking-tight">
          {parseInlineContent(line.substring(2))}
        </h1>
      );
      i++;
      continue;
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-semibold text-white mt-6 mb-3 flex items-center gap-2 tracking-tight">
          <span className="w-1.5 h-5 bg-attention-500 rounded-full inline-block" />
          {parseInlineContent(line.substring(3))}
        </h2>
      );
      i++;
      continue;
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base sm:text-lg font-medium text-slate-200 mt-4 mb-2 tracking-tight">
          {parseInlineContent(line.substring(4))}
        </h3>
      );
      i++;
      continue;
    }
    
    // 8. Normal Paragraph
    if (line.trim() !== "") {
      elements.push(
        <p key={`p-${i}`} className="text-slate-350 font-light leading-relaxed text-[15px] mb-6">
          {parseInlineContent(line)}
        </p>
      );
    }
    
    i++;
  }
  
  return <div className="space-y-4">{elements}</div>;
}

