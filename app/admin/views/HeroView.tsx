"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Image from "next/image";
import { Edit, History, ExternalLink } from "lucide-react";
import { getHeroAction, updateHeroAction, getHeroVersionsAction, rollbackHeroAction } from "../hero-actions";
import HeroHistoryView from "../components/HeroHistoryView";
import HeroEditorView from "../components/HeroEditorView";

interface HeroItem {
  id: string;
  title: string;
  tagline: string;
  subtitle: string;
  description: string;
  cover_image?: string;
  cta_text?: string;
  cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  status: string;
  version: number;
  updated_at: string;
}

interface HeroVersion {
  id: string;
  version_number: number;
  change_source: string;
  change_summary: string;
  created_at: string;
}

export default function HeroView() {
  const [viewState, setViewState] = useState<"list" | "edit" | "history">("list");
  const [hero, setHero] = useState<HeroItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // History state
  const [versions, setVersions] = useState<HeroVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const loadHero = useCallback(async () => {
    setIsLoading(true);
    const res = await getHeroAction();
    if (res.hero) {
      setHero(res.hero as HeroItem);
    } else if (res.error) {
      alert(res.error);
    }
    setIsLoading(false);
  }, []);

  const loadVersions = useCallback(async () => {
    if (!hero) return;
    setLoadingVersions(true);
    const res = await getHeroVersionsAction(hero.id);
    if (res.versions) {
      setVersions(res.versions);
    } else if (res.error) {
      alert(res.error);
    }
    setLoadingVersions(false);
  }, [hero]);

  useEffect(() => {
    loadHero();
  }, [loadHero]);

  useEffect(() => {
    if (viewState === "history") {
      loadVersions();
    }
  }, [viewState, loadVersions]);

  const handleSave = (formData: {
    title: string;
    tagline: string;
    subtitle: string;
    description: string;
    coverImage: string;
    cta_text: string;
    cta_url: string;
    secondary_cta_text: string;
    secondary_cta_url: string;
    publish: boolean;
  }) => {
    if (!hero) return;
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, String(val));
    });
    data.set("status", formData.publish ? "published" : "draft");

    startTransition(async () => {
      const res = await updateHeroAction(hero.id, data);
      if (res.error) {
        alert(res.error);
      } else {
        alert(formData.publish ? "Hero published successfully!" : "Hero draft saved!");
        await loadHero();
        setViewState("list");
      }
    });
  };

  const handleRollback = (ver: HeroVersion) => {
    if (!hero) return;
    if (!confirm(`Are you sure you want to rollback Hero to version ${ver.version_number}?`)) return;

    startTransition(async () => {
      const res = await rollbackHeroAction(hero.id, ver.id);
      if (res.error) {
        alert(res.error);
      } else {
        alert(`Successfully restored version ${ver.version_number}!`);
        await loadHero();
        setViewState("list");
      }
    });
  };

  if (isLoading) {
    return <div className="py-8 text-center text-xs font-mono text-[var(--muted)]">Loading Hero module...</div>;
  }

  if (viewState === "edit" && hero) {
    return (
      <HeroEditorView
        initialTitle={hero.title || ""}
        initialTagline={hero.tagline || ""}
        initialSubtitle={hero.subtitle || ""}
        initialDescription={hero.description || ""}
        initialCoverImage={hero.cover_image || ""}
        initialCtaText={hero.cta_text || ""}
        initialCtaUrl={hero.cta_url || ""}
        initialSecondaryCtaText={hero.secondary_cta_text || ""}
        initialSecondaryCtaUrl={hero.secondary_cta_url || ""}
        isPending={isPending}
        onBack={() => setViewState("list")}
        onSave={handleSave}
      />
    );
  }

  if (viewState === "history" && hero) {
    return (
      <HeroHistoryView
        versions={versions}
        loading={loadingVersions}
        isPending={isPending}
        onBack={() => setViewState("list")}
        onRollback={handleRollback}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-4xl font-mono select-none text-xs">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-mono text-white">Hero Module</h1>
          <p className="text-xs font-mono text-[var(--muted)]">WEBSITE IDENTITY SECTION</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewState("history")}
            className="flex items-center gap-1.5 px-4 py-2 border border-white/5 bg-white/[0.01] hover:bg-white/5 rounded-xl text-slate-200 transition-all font-mono"
          >
            <History className="w-3.5 h-3.5" /> History
          </button>
          <button
            onClick={() => setViewState("edit")}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-black font-semibold rounded-xl transition-all font-mono"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Section
          </button>
        </div>
      </div>

      <div className="border border-white/5 bg-[#0c0d12]/50 p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--muted)]">WORKFLOW STATUS</span>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${hero?.status === "published" ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className={`font-bold ${hero?.status === "published" ? "text-emerald-400" : "text-amber-400"} uppercase`}>
                {hero?.status}
              </span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[10px] text-[var(--muted)]">SNAPSHOT VERSION</span>
            <p className="text-white font-bold">v{hero?.version}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase block mb-1">Title (Owner Name)</span>
              <p className="text-white font-bold text-sm bg-black/20 p-3 border border-white/5 rounded-xl">{hero?.title}</p>
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase block mb-1">Eyebrow Tagline</span>
              <p className="text-slate-300 bg-black/20 p-3 border border-white/5 rounded-xl">{hero?.tagline || "N/A"}</p>
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase block mb-1">Subtitle (Role)</span>
              <p className="text-slate-300 bg-black/20 p-3 border border-white/5 rounded-xl">{hero?.subtitle || "N/A"}</p>
            </div>
            {hero?.cover_image && (
              <div>
                <span className="text-[10px] text-[var(--muted)] uppercase block mb-1">Cover background image</span>
                <div className="relative w-full max-w-xs h-32 overflow-hidden border border-white/5 rounded-xl">
                  <Image
                    src={hero.cover_image}
                    alt="Cover Preview"
                    fill
                    className="object-cover"
                    sizes="320px"
                    unoptimized={hero.cover_image.startsWith("blob:")}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase block mb-1">Description Paragraph</span>
              <p className="text-slate-300 leading-relaxed bg-black/20 p-3 border border-white/5 rounded-xl whitespace-pre-wrap">
                {hero?.description || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-[var(--muted)] uppercase block mb-1">Primary CTA Button</span>
                <p className="text-slate-300 bg-black/20 p-3 border border-white/5 rounded-xl text-center truncate">
                  {hero?.cta_text || "N/A"} <span className="text-[9px] text-slate-500 block">({hero?.cta_url})</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted)] uppercase block mb-1">Secondary CTA Button</span>
                <p className="text-slate-300 bg-black/20 p-3 border border-white/5 rounded-xl text-center truncate">
                  {hero?.secondary_cta_text || "N/A"} <span className="text-[9px] text-slate-500 block">({hero?.secondary_cta_url})</span>
                </p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <a
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline"
              >
                View live website <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
