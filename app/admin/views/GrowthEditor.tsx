"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Save, Sparkles, LayoutTemplate, History, Check, AlertCircle,
  Plus, Trash2, Calendar, Activity, Link as LinkIcon, FileJson, Link2, Globe
} from "lucide-react";
import { 
  getSeoPageAction, 
  createSeoPageAction, 
  updateSeoPageAction, 
  GrowthPage, 
  getPageVersionsAction,
  restorePageVersionAction,
  generatePreviewUrlAction,
  getClustersAction,
  ContentCluster
} from "../growth-actions";
import { generateSeoReviewAction, generateContentBlockDraftAction, analyzeContentHealthAction, AiContentBrief } from "../growth-ai-actions";

export default function GrowthEditor({ pageId, onBack }: { pageId: string, onBack: () => void }) {
  const [page, setPage] = useState<Partial<GrowthPage>>({
    title: "", slug: "", page_type: "hire", status: "Draft", content_blocks: [], related_projects: []
  });
  const [loading, setLoading] = useState(pageId !== "new");
  const [saving, setSaving] = useState(false);
  
  // URL Manager state
  const [urlManagerOpen, setUrlManagerOpen] = useState(false);

  // AI Sidebar state
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true);
  const [seoReview, setSeoReview] = useState<{ score: number, suggestions: any[] } | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [draftingBlock, setDraftingBlock] = useState<any>(null); // To show preview diff
  
  // Version History state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);

  // Content Health state
  const [contentHealth, setContentHealth] = useState<any>(null);
  const [healthChecking, setHealthChecking] = useState(false);

  // Preview URL state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Content Relationships state
  const [clusters, setClusters] = useState<ContentCluster[]>([]);
  
  // AI Content Brief state
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [activeDraftType, setActiveDraftType] = useState("");
  const [brief, setBrief] = useState<AiContentBrief>({
    targetKeyword: "", intent: "Informational", audience: "Engineers", 
    readingLevel: "Advanced", competitors: "", tone: "Professional"
  });

  useEffect(() => {
    if (pageId !== "new") {
      getSeoPageAction(pageId).then((data: any) => {
        setPage(data);
        setLoading(false);
      });
    }
    getClustersAction().then(setClusters);
  }, [pageId]);

  const handleSave = async (status: string = page.status || "Draft") => {
    setSaving(true);
    try {
      const dataToSave = { ...page, status } as GrowthPage;
      if (pageId === "new") {
        const newPage = await createSeoPageAction(dataToSave, "admin_user");
        setPage(newPage);
      } else {
        await updateSeoPageAction(pageId, dataToSave, "admin_user");
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRunSeoReview = async () => {
    setReviewing(true);
    const result = await generateSeoReviewAction(page as GrowthPage);
    setSeoReview(result);
    setReviewing(false);
  };

  const handleRunHealthCheck = async () => {
    setHealthChecking(true);
    const result = await analyzeContentHealthAction(page as GrowthPage);
    setContentHealth(result);
    setHealthChecking(false);
  };

  const handleGeneratePreview = async () => {
    if (pageId === "new") return;
    try {
      const res = await generatePreviewUrlAction(pageId);
      setPreviewUrl(res.url);
    } catch (e) {
      console.error(e);
    }
  };

  const openBriefModal = (type: string) => {
    setActiveDraftType(type);
    setShowBriefModal(true);
  };

  const submitGenerateBlock = async () => {
    setShowBriefModal(false);
    const draft = await generateContentBlockDraftAction(
      activeDraftType, 
      { title: page.title, slug: page.slug }, 
      page.content_blocks || [],
      brief
    );
    setDraftingBlock(draft);
  };

  const applyDraftBlock = () => {
    if (draftingBlock) {
      setPage((prev: Partial<GrowthPage>) => ({
        ...prev,
        content_blocks: [...(prev.content_blocks || []), draftingBlock]
      }));
      setDraftingBlock(null);
    }
  };

  const removeBlock = (index: number) => {
    setPage((prev: Partial<GrowthPage>) => {
      const newBlocks = [...(prev.content_blocks || [])];
      newBlocks.splice(index, 1);
      return { ...prev, content_blocks: newBlocks };
    });
  };

  if (loading) {
    return <div className="p-8 text-purple-300 font-mono">Loading Editor...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Main Editor Area */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
        <div className="flex items-center justify-between sticky top-0 bg-[#08090b] z-10 pb-4 border-b border-purple-500/10">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-purple-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                getPageVersionsAction(pageId).then((v: any[]) => {
                  setVersions(v);
                  setHistoryOpen(true);
                });
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-500/20 text-xs font-mono text-purple-300 hover:bg-white/[0.02]"
            >
              <History className="w-3.5 h-3.5" /> History
            </button>
            <button 
              onClick={handleGeneratePreview}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-500/20 text-xs font-mono text-purple-300 hover:bg-white/[0.02]"
            >
              <Check className="w-3.5 h-3.5" /> Preview
            </button>
            <button 
              onClick={() => handleSave("Draft")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border border-purple-500/30 text-sm font-medium text-white hover:bg-white/[0.05]"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button 
              onClick={() => handleSave("Published")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500 text-emerald-950 text-sm font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400"
            >
              <Check className="w-4 h-4" /> Publish Now
            </button>
          </div>
        </div>

        {/* Core Metadata Fields */}
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Page Title (e.g. Next.js Developer for Hire)"
            value={page.title || ""}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
            className="col-span-2 w-full bg-white/[0.02] border border-purple-500/20 rounded-lg px-4 py-3 text-lg font-medium text-white focus:outline-none focus:border-emerald-500/50"
          />
          <div className="col-span-2 grid grid-cols-3 gap-2">
            <select
              value={page.page_type}
              onChange={(e) => setPage({ ...page, page_type: e.target.value })}
              className="bg-white/[0.02] border border-purple-500/20 rounded-lg px-4 py-3 text-purple-200 focus:outline-none"
            >
              <option value="hire">Hire Role</option>
              <option value="service">Service</option>
              <option value="technology">Technology</option>
              <option value="industry">Industry</option>
            </select>
            
            <div className="col-span-2 relative">
              <input 
                type="text" 
                placeholder="Slug (e.g. hire/nextjs-developer)"
                value={page.slug || ""}
                onChange={(e) => setPage({ ...page, slug: e.target.value })}
                className="w-full bg-white/[0.02] border border-purple-500/20 rounded-lg pl-4 pr-12 py-3 text-white focus:outline-none focus:border-emerald-500/50"
              />
              <button 
                onClick={() => setUrlManagerOpen(!urlManagerOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                title="Advanced URL Manager"
              >
                <Link2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {urlManagerOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="col-span-2 grid grid-cols-2 gap-4 p-4 border border-purple-500/20 rounded-xl bg-black/40"
            >
              <div>
                <label className="text-xs font-mono text-purple-400">Canonical URL</label>
                <input type="text" placeholder="e.g. https://saumya.os/hire/nextjs" className="w-full mt-1 bg-white/[0.02] border border-purple-500/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs font-mono text-purple-400">Redirect URL (301)</label>
                <input type="text" placeholder="Leaves page active but redirects" className="w-full mt-1 bg-white/[0.02] border border-purple-500/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="col-span-2 flex items-center justify-between bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                <span className="text-xs font-mono text-orange-400">Duplicate Content Detection: <strong className="text-emerald-400">Unique (94%)</strong></span>
                <button className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded">Re-scan Hash</button>
              </div>
            </motion.div>
          )}
          
          <select
            value={page.cluster_id || ""}
            onChange={(e) => setPage({ ...page, cluster_id: e.target.value || null })}
            className="bg-white/[0.02] border border-purple-500/20 rounded-lg px-4 py-3 text-purple-200 focus:outline-none"
          >
            <option value="">No Cluster Assigned</option>
            {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          {/* Project Linking Multi-Select (Scaffold) */}
          <div className="bg-white/[0.02] border border-purple-500/20 rounded-lg px-4 py-3 text-purple-200 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-colors">
            <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-emerald-400" /> Link Portfolio Projects</span>
            <span className="text-xs font-mono bg-purple-500/20 px-2 py-0.5 rounded">{page.related_projects?.length || 0} Linked</span>
          </div>

          {previewUrl && (
            <div className="col-span-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">Preview URL (valid for 24h):</span>
              <a href={previewUrl} target="_blank" rel="noreferrer" className="text-xs font-mono text-white underline hover:text-emerald-300">{previewUrl}</a>
            </div>
          )}
        </div>

        {/* Content Blocks Builder */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
            <h3 className="text-lg font-light text-white flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-cyan-400" />
              Content Blocks
            </h3>
            <div className="flex gap-2 flex-wrap justify-end">
              {['Hero', 'Problem', 'Solution', 'Case Study', 'Tech Stack', 'Related Projects', 'FAQ', 'CTA'].map(type => (
                <button
                  key={type}
                  onClick={() => setPage({ ...page, content_blocks: [...(page.content_blocks || []), { type, data: {} }] })}
                  className="text-xs font-mono text-purple-300 hover:text-white px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20"
                >
                  + {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {page.content_blocks?.length === 0 && (
              <div className="p-8 text-center border border-dashed border-purple-500/30 rounded-xl text-purple-400">
                No content blocks yet. Click above to add manual blocks, or use the AI Generator to build the page programmatically.
              </div>
            )}
            
            {page.content_blocks?.map((block: any, idx: number) => (
              <div key={idx} className="relative group border border-purple-500/20 bg-white/[0.01] rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                    {block.type} BLOCK
                  </span>
                  <button onClick={() => removeBlock(idx)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={JSON.stringify(block.data, null, 2)}
                  onChange={(e) => {
                    try {
                      const newData = JSON.parse(e.target.value);
                      const newBlocks = [...(page.content_blocks || [])];
                      newBlocks[idx] = { ...block, data: newData };
                      setPage({ ...page, content_blocks: newBlocks });
                    } catch (err) {
                      // Allow invalid json while typing
                    }
                  }}
                  className="w-full h-32 bg-[#0a0514] border border-purple-500/10 rounded-lg p-3 text-xs font-mono text-purple-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI & SEO Sidebar */}
      <AnimatePresence>
        {aiSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-80 space-y-4 overflow-y-auto pr-2 scrollbar-hide pb-12"
          >
            {/* Draft Preview Modal / Area */}
            {draftingBlock && (
              <div className="p-4 border border-emerald-500/40 bg-emerald-500/5 rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Draft: {draftingBlock.type}
                </h4>
                <pre className="text-[10px] font-mono text-emerald-100/70 bg-[#0a0514] p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(draftingBlock.data, null, 2)}
                </pre>
                <div className="flex gap-2">
                  <button onClick={applyDraftBlock} className="flex-1 bg-emerald-500 text-emerald-950 text-xs font-bold py-1.5 rounded hover:bg-emerald-400">Accept</button>
                  <button onClick={() => setDraftingBlock(null)} className="flex-1 border border-red-500/40 text-red-400 text-xs py-1.5 rounded hover:bg-red-500/10">Reject</button>
                </div>
              </div>
            )}

            {/* AI Action Menu */}
            <div className="border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white flex items-center justify-between mb-4">
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> AI Actions</span>
              </h3>
              <div className="space-y-1.5">
                {[
                  { id: "Full Draft", icon: LayoutTemplate, label: "Generate First Draft" },
                  { id: "Rewrite", icon: Sparkles, label: "Rewrite & Improve SEO" },
                  { id: "FAQ", icon: FileJson, label: "Generate FAQ + Schema" },
                  { id: "Meta", icon: Globe, label: "Create Meta Title/Desc" }
                ].map(action => (
                  <button 
                    key={action.id}
                    onClick={() => openBriefModal(action.id)} 
                    className="w-full flex items-center gap-2 text-left text-xs font-mono text-purple-300 hover:text-white hover:bg-white/[0.05] p-2 rounded transition-colors border border-transparent hover:border-purple-500/30"
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Health Panel */}
            <div className="border border-purple-500/20 bg-white/[0.02] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white flex items-center justify-between mb-4">
                <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /> Content Health</span>
                <button onClick={handleRunHealthCheck} disabled={healthChecking} className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 px-2 py-1 rounded">
                  {healthChecking ? 'Analyzing...' : 'Run Analysis'}
                </button>
              </h3>
              
              {contentHealth ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-[#0a0514] border border-purple-500/10 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-purple-400 font-mono uppercase tracking-wider mb-1">Health</div>
                      <div className="text-2xl text-emerald-400 font-light">{contentHealth.headingStructureScore}%</div>
                    </div>
                    <div className="bg-[#0a0514] border border-purple-500/10 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-purple-400 font-mono uppercase tracking-wider mb-1">Reading</div>
                      <div className="text-2xl text-white font-light">{contentHealth.readingTimeMinutes}m</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {contentHealth.issues.map((issue: any, i: number) => (
                      <li key={i} className="flex flex-col gap-1 text-[11px] text-purple-200 border-l-2 border-orange-500/50 pl-2">
                        <span className="font-bold text-orange-300">{issue.type}</span>
                        <span className="text-purple-300/80 leading-relaxed">{issue.message}</span>
                      </li>
                    ))}
                    {contentHealth.issues.length === 0 && (
                      <li className="text-[11px] text-emerald-400 flex gap-2"><Check className="w-3.5 h-3.5" /> Perfect Content Health!</li>
                    )}
                  </ul>
                </div>
              ) : (
                <p className="text-[11px] text-purple-400 leading-relaxed">Analyze readability, heading structures, Flesch score, and accessibility.</p>
              )}
            </div>
            
            {/* SEO Validation */}
            <div className="border border-purple-500/20 bg-white/[0.02] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white flex items-center justify-between mb-4">
                <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-400" /> SEO Review</span>
                <button onClick={handleRunSeoReview} disabled={reviewing} className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 px-2 py-1 rounded">
                  {reviewing ? 'Running...' : 'Run Check'}
                </button>
              </h3>
              
              {seoReview ? (
                <div className="space-y-3">
                  <div className="flex items-end gap-2 mb-4 border-b border-purple-500/10 pb-3">
                    <span className="text-3xl font-light text-white leading-none">{seoReview.score}</span>
                    <span className="text-xs font-mono text-purple-400 pb-1">/100</span>
                  </div>
                  <ul className="space-y-2">
                    {seoReview.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 text-[11px] text-purple-200 leading-relaxed">
                        {s.status === 'fail' && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />}
                        {s.status === 'warn' && <AlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />}
                        {s.status === 'pass' && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                        <span>{s.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-[11px] text-purple-400 leading-relaxed">Run an AI SEO check to validate headings, word counts, and keyword density before publishing.</p>
              )}
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Version History Modal */}
      <AnimatePresence>
        {historyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl border border-purple-500/20 bg-[#0a0514] rounded-xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-white">Version History</h3>
                <button onClick={() => setHistoryOpen(false)} className="text-purple-400 hover:text-white">Close</button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
                {versions.length === 0 && <p className="text-sm text-purple-400">No versions found.</p>}
                {versions.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-4 border border-purple-500/10 rounded-xl hover:bg-white/[0.02]">
                    <div>
                      <p className="text-sm font-medium text-white">{v.change_summary}</p>
                      <p className="text-xs font-mono text-purple-400 mt-1">{new Date(v.created_at).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={async () => {
                        await restorePageVersionAction(v.id, "admin_user");
                        setHistoryOpen(false);
                        const refreshed = await getSeoPageAction(pageId);
                        setPage(refreshed);
                      }}
                      className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded hover:bg-cyan-400/20"
                    >
                      Restore Backup
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Content Brief Modal */}
      <AnimatePresence>
        {showBriefModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg border border-purple-500/20 bg-[#0a0514] rounded-xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400"/> AI Content Brief</h3>
                <button onClick={() => setShowBriefModal(false)} className="text-purple-400 hover:text-white">Close</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-purple-400">Target Keyword</label>
                  <input type="text" value={brief.targetKeyword} onChange={e => setBrief({...brief, targetKeyword: e.target.value})} className="w-full mt-1 bg-white/[0.02] border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-purple-400">Audience</label>
                    <input type="text" value={brief.audience} onChange={e => setBrief({...brief, audience: e.target.value})} className="w-full mt-1 bg-white/[0.02] border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-purple-400">Tone</label>
                    <input type="text" value={brief.tone} onChange={e => setBrief({...brief, tone: e.target.value})} className="w-full mt-1 bg-white/[0.02] border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono text-purple-400">Competitors / References</label>
                  <input type="text" value={brief.competitors} onChange={e => setBrief({...brief, competitors: e.target.value})} className="w-full mt-1 bg-white/[0.02] border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" placeholder="e.g. Vercel, Supabase..." />
                </div>
                
                <button onClick={submitGenerateBlock} className="w-full mt-6 bg-emerald-500 text-emerald-950 font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-emerald-400 transition-colors">
                  Generate "{activeDraftType}"
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
