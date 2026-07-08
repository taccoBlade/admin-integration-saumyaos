"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Search, 
  FileText, 
  Plus, 
  Wand2,
  AlertCircle,
  CheckCircle2,
  LayoutTemplate,
  BarChart3,
  Lightbulb,
  Target,
  Database,
  Link as LinkIcon,
  Zap,
  Globe,
  Settings,
  ListTodo,
  Bot,
  RefreshCw,
  Share2,
  Cpu,
  Clock
} from "lucide-react";
import { 
  getKeywordsAction, 
  getSeoPagesAction, 
  getClustersAction,
  GrowthKeyword, 
  GrowthPage,
  ContentCluster
} from "../growth-actions";

import GrowthEditor from "./GrowthEditor";

interface GrowthViewProps {
  projects: any[];
}

type Category = "dashboard" | "strategy" | "content" | "optimization" | "automation";
type SubCategory = 
  | "intelligence" | "opportunities" 
  | "keywords" | "clusters"
  | "seo-pages" | "project-links"
  | "ai-queue" | "bulk-gen" | "internal-links" | "metadata"
  | "publishing" | "indexing" | "sitemap";

const SIDEBAR_NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    subTabs: [
      { id: "intelligence", label: "Intelligence", icon: TrendingUp },
      { id: "opportunities", label: "Opportunities", icon: Lightbulb },
    ]
  },
  {
    id: "strategy",
    label: "Strategy",
    icon: Target,
    subTabs: [
      { id: "keywords", label: "Keywords", icon: Search },
      { id: "clusters", label: "Clusters", icon: LayoutTemplate },
    ]
  },
  {
    id: "content",
    label: "Content Engine",
    icon: Database,
    subTabs: [
      { id: "seo-pages", label: "SEO Pages", icon: FileText },
      { id: "project-links", label: "Project Linking", icon: LinkIcon },
    ]
  },
  {
    id: "optimization",
    label: "Optimization (AI)",
    icon: Zap,
    subTabs: [
      { id: "ai-queue", label: "AI Queue", icon: Bot },
      { id: "bulk-gen", label: "Bulk Generation", icon: Cpu },
      { id: "internal-links", label: "Internal Linking", icon: Share2 },
      { id: "metadata", label: "Metadata & Schema", icon: Globe },
    ]
  },
  {
    id: "automation",
    label: "Automation",
    icon: Settings,
    subTabs: [
      { id: "publishing", label: "Publishing Queue", icon: Clock },
      { id: "indexing", label: "Indexing Queue", icon: RefreshCw },
      { id: "sitemap", label: "Sitemap Queue", icon: ListTodo },
    ]
  }
];

export default function GrowthView({ projects }: GrowthViewProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("dashboard");
  const [activeSubTab, setActiveSubTab] = useState<SubCategory>("intelligence");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  
  const [keywords, setKeywords] = useState<GrowthKeyword[]>([]);
  const [pages, setPages] = useState<GrowthPage[]>([]);
  const [clusters, setClusters] = useState<ContentCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [kws, pgs, cls] = await Promise.all([
          getKeywordsAction(),
          getSeoPagesAction(),
          getClustersAction()
        ]);
        setKeywords(kws);
        setPages(pgs);
        setClusters(cls);
      } catch (err) {
        console.error("Failed to load growth data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (editingPageId) {
    return <GrowthEditor pageId={editingPageId} onBack={() => setEditingPageId(null)} />;
  }

  const renderPlaceholder = (title: string, desc: string) => (
    <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-purple-500/20 rounded-xl bg-white/[0.01]">
      <Wand2 className="w-12 h-12 text-purple-500/40 mb-4" />
      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-purple-300/60 max-w-md">{desc}</p>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-64 shrink-0 flex flex-col gap-6 overflow-y-auto pr-4 scrollbar-hide">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-white flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Growth OS
          </h2>
          <p className="text-xs text-purple-300/70 leading-relaxed">
            Programmatic SEO & AI Automation Hub
          </p>
        </div>

        <div className="space-y-6">
          {SIDEBAR_NAV.map((category) => (
            <div key={category.id} className="space-y-1">
              <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-purple-500/70 mb-2 px-2">
                <category.icon className="w-3.5 h-3.5" />
                {category.label}
              </h3>
              <div className="space-y-0.5">
                {category.subTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveCategory(category.id as Category);
                      setActiveSubTab(tab.id as SubCategory);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeSubTab === tab.id
                        ? "bg-purple-500/20 text-emerald-400 border border-purple-500/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]"
                        : "text-purple-300/70 hover:bg-white/[0.04] hover:text-purple-200 border border-transparent"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col bg-white/[0.02] border border-purple-500/20 rounded-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/10 bg-white/[0.01]">
          <h3 className="text-lg font-medium text-white capitalize flex items-center gap-2">
            {activeSubTab.replace("-", " ")}
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-64 bg-black/40 border border-purple-500/30 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* DASHBOARD -> INTELLIGENCE */}
              {activeSubTab === "intelligence" && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-purple-500/20 bg-black/20 p-5">
                      <p className="text-xs font-mono text-purple-400 uppercase tracking-wider">Total Clicks (30d)</p>
                      <p className="mt-2 text-3xl font-light text-white">4,201</p>
                    </div>
                    <div className="rounded-xl border border-purple-500/20 bg-black/20 p-5">
                      <p className="text-xs font-mono text-purple-400 uppercase tracking-wider">Impressions</p>
                      <p className="mt-2 text-3xl font-light text-white">128.5k</p>
                    </div>
                    <div className="rounded-xl border border-purple-500/20 bg-black/20 p-5">
                      <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Avg CTR</p>
                      <p className="mt-2 text-3xl font-light text-emerald-200">3.2%</p>
                    </div>
                    <div className="rounded-xl border border-purple-500/20 bg-black/20 p-5">
                      <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Avg Position</p>
                      <p className="mt-2 text-3xl font-light text-cyan-200">14.2</p>
                    </div>
                  </div>
                  {renderPlaceholder("Search Console Graph", "A beautiful area chart showing clicks and impressions over time will be rendered here once the GSC API is connected.")}
                </div>
              )}

              {/* DASHBOARD -> OPPORTUNITIES */}
              {activeSubTab === "opportunities" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-orange-400 mb-4">Actionable SEO Tasks</h4>
                  <div className="grid gap-3">
                    {[
                      { msg: "8 pages missing FAQ schema", type: "warning" },
                      { msg: "12 keywords identified without target pages", type: "info" },
                      { msg: "3 pages with low content health scores", type: "critical" },
                      { msg: "6 pages haven't been updated in 6+ months", type: "warning" },
                      { msg: "2 newly published pages not yet indexed", type: "info" },
                    ].map((opt, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-purple-500/20 bg-black/20 hover:border-purple-500/40 transition-colors">
                        <div className="flex items-center gap-3">
                          {opt.type === 'critical' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <Lightbulb className="w-5 h-5 text-orange-400" />}
                          <span className="text-sm text-purple-100">{opt.msg}</span>
                        </div>
                        <button className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/30 hover:bg-emerald-500/20">
                          Auto-Fix
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STRATEGY -> KEYWORDS */}
              {activeSubTab === "keywords" && (
                <div className="rounded-xl border border-purple-500/20 bg-black/20 overflow-hidden">
                  <table className="w-full text-left text-sm text-purple-200">
                    <thead className="border-b border-purple-500/20 bg-white/[0.02]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Keyword</th>
                        <th className="px-4 py-3 font-medium">Intent</th>
                        <th className="px-4 py-3 font-medium">Volume</th>
                        <th className="px-4 py-3 font-medium">Difficulty</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {keywords.length === 0 && !loading && (
                        <tr><td colSpan={5} className="p-8 text-center text-purple-400">No keywords found.</td></tr>
                      )}
                      {keywords.map(kw => (
                        <tr key={kw.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-medium text-white">{kw.keyword}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300">{kw.intent}</span></td>
                          <td className="px-4 py-3 font-mono">{kw.volume}</td>
                          <td className="px-4 py-3 font-mono">{kw.difficulty}</td>
                          <td className="px-4 py-3 text-emerald-400">{kw.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* STRATEGY -> CLUSTERS */}
              {activeSubTab === "clusters" && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {clusters.length === 0 && !loading && (
                    <div className="col-span-full p-12 border border-dashed border-purple-500/30 rounded-xl text-center text-purple-400">
                      No Content Clusters found.
                    </div>
                  )}
                  {clusters.map(cluster => {
                    const clusterPages = pages.filter(p => p.cluster_id === cluster.id);
                    return (
                      <div key={cluster.id} className="rounded-xl border border-purple-500/20 bg-black/20 p-5 relative overflow-hidden group">
                        <h3 className="text-xl font-medium text-white mb-2">{cluster.name}</h3>
                        <p className="text-sm text-purple-300/70 mb-4">{cluster.description}</p>
                        <div className="border-t border-purple-500/10 pt-4">
                          <p className="text-xs font-mono text-cyan-400 mb-2">{clusterPages.length} pages</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CONTENT ENGINE -> SEO PAGES */}
              {activeSubTab === "seo-pages" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setEditingPageId("new")}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      <Plus className="w-4 h-4" />
                      New SEO Page
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pages.length === 0 && !loading && (
                      <div className="col-span-full p-12 border border-dashed border-purple-500/30 rounded-xl text-center text-purple-400">
                        No SEO pages created yet.
                      </div>
                    )}
                    {pages.map(page => (
                      <div 
                        key={page.id}
                        onClick={() => setEditingPageId(page.id)}
                        className="group cursor-pointer rounded-xl border border-purple-500/20 bg-black/20 p-5 hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all relative"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${page.status === 'Published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'}`}>
                            {page.status}
                          </span>
                          <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            Updated 180d ago
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1 truncate">{page.title}</h3>
                        <p className="text-xs font-mono text-purple-400 truncate mb-4">/{page.slug}</p>
                        <div className="flex justify-between border-t border-purple-500/10 pt-3">
                          <span className="text-xs text-purple-300 flex items-center gap-1">Health: <strong className="text-emerald-400">88</strong></span>
                          <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Refresh
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTENT ENGINE -> PROJECT LINKS */}
              {activeSubTab === "project-links" && renderPlaceholder("Project Linking Engine", "Automatically maps SEO pages to specific portfolio projects to generate context-aware 'Related Projects' sections.")}

              {/* OPTIMIZATION (AI) */}
              {activeSubTab === "ai-queue" && renderPlaceholder("AI Action Queue", "View and manage background AI tasks (generating drafts, writing meta tags, building schemas).")}
              {activeSubTab === "bulk-gen" && renderPlaceholder("Bulk Programmatic Generation", "Select a cluster and generate 100+ pages instantly using programmatic variables (e.g., {{city}}, {{industry}}).")}
              {activeSubTab === "internal-links" && renderPlaceholder("Internal Link Graph", "AI analyzes your entire content graph to automatically suggest missing internal links and fix orphan pages.")}
              {activeSubTab === "metadata" && renderPlaceholder("Metadata & Schema Editor", "Bulk-edit Meta Titles, Descriptions, and FAQ/Article JSON-LD schema across your entire site.")}

              {/* AUTOMATION */}
              {activeSubTab === "publishing" && renderPlaceholder("Scheduled Publishing", "Drip-feed your newly generated SEO pages over time to simulate organic content growth.")}
              {activeSubTab === "indexing" && renderPlaceholder("Google Indexing API", "Automatically ping Google Indexing API whenever a new page is published or an old page is AI-refreshed.")}
              {activeSubTab === "sitemap" && renderPlaceholder("Sitemap Manager", "Automatically rebuild and submit XML sitemaps to Search Console when clusters change.")}
              
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
