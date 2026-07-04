"use client";

import React, { useState, useTransition } from "react";
import { Sparkles, X, RefreshCw } from "lucide-react";
import { runProjectAudit, runEngineeringReview, runSEOAudit, runMediaAudit } from "../ai-audit-actions";
import ProjectQualityCard from "./ProjectQualityCard";
import MissingChecklist from "./MissingChecklist";
import EngineeringReviewCard from "./EngineeringReviewCard";
import SEOReviewCard from "./SEOReviewCard";
import MediaReviewCard from "./MediaReviewCard";

interface AIAuditPanelProps {
  projectFields: Record<string, unknown>;
  onClose?: () => void;
}

export default function AIAuditPanel({ projectFields, onClose }: AIAuditPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [audited, setAudited] = useState(false);

  // Audit data state
  const [overallData, setOverallData] = useState<{ overallScore: number; missing: string[]; suggestions: string[] }>({
    overallScore: 0,
    missing: [],
    suggestions: [],
  });

  const [engineeringData, setEngineeringData] = useState<{ engineeringScore: number; critique: string; suggestions: string[] }>({
    engineeringScore: 0,
    critique: "",
    suggestions: [],
  });

  const [seoData, setSeoData] = useState<{ seoScore: number; seoTitle: string; metaDescription: string; critique: string; suggestions: string[] }>({
    seoScore: 0,
    seoTitle: "",
    metaDescription: "",
    critique: "",
    suggestions: [],
  });

  const [mediaData, setMediaData] = useState<{ mediaScore: number; critique: string; suggestions: string[] }>({
    mediaScore: 0,
    critique: "",
    suggestions: [],
  });

  const handleRunAudit = () => {
    startTransition(async () => {
      // Execute all audits in parallel
      const [overallRes, engineeringRes, seoRes, mediaRes] = await Promise.all([
        runProjectAudit(projectFields),
        runEngineeringReview(projectFields),
        runSEOAudit(projectFields),
        runMediaAudit(projectFields),
      ]);

      if (overallRes.error) {
        alert(overallRes.error);
      } else {
        setOverallData({
          overallScore: overallRes.overallScore || 0,
          missing: overallRes.missing || [],
          suggestions: overallRes.suggestions || [],
        });
      }

      if (engineeringRes.error) {
        alert(engineeringRes.error);
      } else {
        setEngineeringData({
          engineeringScore: engineeringRes.engineeringScore || 0,
          critique: engineeringRes.critique || "",
          suggestions: engineeringRes.suggestions || [],
        });
      }

      if (seoRes.error) {
        alert(seoRes.error);
      } else {
        setSeoData({
          seoScore: seoRes.seoScore || 0,
          seoTitle: seoRes.seoTitle || "",
          metaDescription: seoRes.metaDescription || "",
          critique: seoRes.critique || "",
          suggestions: seoRes.suggestions || [],
        });
      }

      if (mediaRes.error) {
        alert(mediaRes.error);
      } else {
        setMediaData({
          mediaScore: mediaRes.mediaScore || 0,
          critique: mediaRes.critique || "",
          suggestions: mediaRes.suggestions || [],
        });
      }

      setAudited(true);
    });
  };

  return (
    <div className="w-80 bg-[#07080b] border border-white/5 rounded-3xl p-6 flex flex-col justify-between h-full font-mono text-xs text-slate-300 select-none overflow-hidden">
      <div className="space-y-4 flex-1 flex flex-col overflow-y-auto pr-1">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
          <div className="flex items-center gap-2 text-white font-bold">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="uppercase text-[10px] font-mono">AI Reviewer</h3>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {!audited ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20 text-center">
            <Sparkles className="w-8 h-8 text-purple-400/40 animate-pulse" />
            <div className="space-y-1">
              <p className="text-white font-bold font-mono">Ready to Audit</p>
              <p className="text-[10px] text-slate-500 max-w-[200px] leading-normal font-mono">
                Analyze completeness, SEO, media, and engineering rigor.
              </p>
            </div>
            <button
              onClick={handleRunAudit}
              disabled={isPending}
              className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl font-bold text-white transition-all w-full flex items-center justify-center gap-2 disabled:opacity-50 font-mono"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Auditing Project...
                </>
              ) : (
                "Run Project Audit"
              )}
            </button>
          </div>
        ) : isPending ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-3 font-mono">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-slate-400">Running full analysis...</span>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            <ProjectQualityCard
              overall={overallData.overallScore}
              engineering={engineeringData.engineeringScore}
              seo={seoData.seoScore}
              media={mediaData.mediaScore}
            />

            <MissingChecklist missing={overallData.missing} />

            <EngineeringReviewCard
              score={engineeringData.engineeringScore}
              critique={engineeringData.critique}
              suggestions={engineeringData.suggestions}
            />

            <SEOReviewCard
              score={seoData.seoScore}
              seoTitle={seoData.seoTitle}
              metaDescription={seoData.metaDescription}
              critique={seoData.critique}
              suggestions={seoData.suggestions}
            />

            <MediaReviewCard
              score={mediaData.mediaScore}
              critique={mediaData.critique}
              suggestions={mediaData.suggestions}
            />

            <button
              onClick={handleRunAudit}
              className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-300 font-bold hover:text-white transition-all w-full flex items-center justify-center gap-1.5 font-mono"
            >
              <RefreshCw className="w-3 h-3" />
              Re-run Audit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
