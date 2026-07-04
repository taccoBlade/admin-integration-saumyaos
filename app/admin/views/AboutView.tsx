"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { Edit, History, ExternalLink } from "lucide-react";
import { getAboutAction, updateAboutAction, getAboutVersionsAction, rollbackAboutAction } from "../about-actions";
import AboutHistoryView from "../components/AboutHistoryView";
import AboutEditorView from "../components/AboutEditorView";

interface FocusCard {
  title: string;
  description: string;
}

interface AboutItem {
  id: string;
  title: string;
  eyebrow: string;
  focus_cards_json: FocusCard[];
  obsessions_json: string[];
  status: string;
  version: number;
  updated_at: string;
}

interface AboutVersion {
  id: string;
  version_number: number;
  change_source: string;
  change_summary: string;
  created_at: string;
}

export default function AboutView() {
  const [viewState, setViewState] = useState<"list" | "edit" | "history">("list");
  const [about, setAbout] = useState<AboutItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // History state
  const [versions, setVersions] = useState<AboutVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const loadAbout = useCallback(async () => {
    setIsLoading(true);
    const res = await getAboutAction();
    if (res.about) {
      setAbout(res.about as AboutItem);
    } else if (res.error) {
      console.log("No about record found, loading fresh editor state.");
    }
    setIsLoading(false);
  }, []);

  const loadVersions = useCallback(async () => {
    if (!about) return;
    setLoadingVersions(true);
    const res = await getAboutVersionsAction(about.id);
    if (res.versions) {
      setVersions(res.versions);
    } else if (res.error) {
      alert(res.error);
    }
    setLoadingVersions(false);
  }, [about]);

  useEffect(() => {
    loadAbout();
  }, [loadAbout]);

  useEffect(() => {
    if (viewState === "history") {
      loadVersions();
    }
  }, [viewState, loadVersions]);

  const handleSave = (formData: {
    title: string;
    eyebrow: string;
    focusCards: FocusCard[];
    obsessions: string[];
    publish: boolean;
  }) => {
    const data = new FormData();
    data.set("title", formData.title);
    data.set("eyebrow", formData.eyebrow);
    data.set("focus_cards", JSON.stringify(formData.focusCards));
    data.set("obsessions", JSON.stringify(formData.obsessions));
    data.set("status", formData.publish ? "published" : "draft");

    const recordId = about?.id || "new";

    startTransition(async () => {
      const res = await updateAboutAction(recordId, data);
      if (res.error) {
        alert(res.error);
      } else {
        alert(formData.publish ? "About content published successfully!" : "About draft saved!");
        await loadAbout();
        setViewState("list");
      }
    });
  };

  const handleRollback = (ver: AboutVersion) => {
    if (!about) return;
    if (!confirm(`Are you sure you want to rollback About to version ${ver.version_number}?`)) return;

    startTransition(async () => {
      const res = await rollbackAboutAction(about.id, ver.id);
      if (res.error) {
        alert(res.error);
      } else {
        alert(`Successfully restored version ${ver.version_number}!`);
        await loadAbout();
        setViewState("list");
      }
    });
  };

  if (isLoading) {
    return <div className="py-8 text-center text-xs font-mono text-[var(--muted)]">Loading About module...</div>;
  }

  const titleVal = about?.title || "Current Focus";
  const eyebrowVal = about?.eyebrow || "Now";
  const focusCardsVal = about?.focus_cards_json || [];
  const obsessionsVal = about?.obsessions_json || [];

  if (viewState === "edit") {
    return (
      <AboutEditorView
        initialTitle={titleVal}
        initialEyebrow={eyebrowVal}
        initialFocusCards={focusCardsVal}
        initialObsessions={obsessionsVal}
        isPending={isPending}
        onBack={() => setViewState("list")}
        onSave={handleSave}
      />
    );
  }

  if (viewState === "history" && about) {
    return (
      <AboutHistoryView
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
          <h1 className="text-xl font-mono text-white">About Module</h1>
          <p className="text-xs font-mono text-[var(--muted)]">WEBSITE IDENTITY SECTION</p>
        </div>
        <div className="flex gap-2">
          {about && (
            <button
              onClick={() => setViewState("history")}
              className="flex items-center gap-1.5 px-4 py-2 border border-white/5 bg-white/[0.01] hover:bg-white/5 rounded-xl text-slate-200 transition-all font-mono"
            >
              <History className="w-3.5 h-3.5" /> History
            </button>
          )}
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
              <span className={`h-2 w-2 rounded-full ${about?.status === "published" ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className={`font-bold ${about?.status === "published" ? "text-emerald-400" : "text-amber-400"} uppercase`}>
                {about?.status || "draft"}
              </span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[10px] text-[var(--muted)]">SNAPSHOT VERSION</span>
            <p className="text-white font-bold">v{about?.version || 1}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase block mb-1">Section Title</span>
              <p className="text-white font-bold text-sm bg-black/20 p-3 border border-white/5 rounded-xl">{titleVal}</p>
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase block mb-1">Eyebrow Tag</span>
              <p className="text-slate-350 bg-black/20 p-3 border border-white/5 rounded-xl">{eyebrowVal}</p>
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase block mb-1">Focus Cards</span>
              <div className="space-y-2">
                {focusCardsVal.map((card, idx) => (
                  <div key={idx} className="bg-black/20 p-3 border border-white/5 rounded-xl">
                    <strong className="text-white block mb-1">{card.title}</strong>
                    <span className="text-slate-400 leading-normal">{card.description || "No description provided."}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase block mb-1">Current Obsessions</span>
              <ul className="list-disc pl-5 text-slate-300 space-y-1 bg-black/20 p-4 border border-white/5 rounded-xl">
                {obsessionsVal.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="pt-2 text-right">
              <a
                href="/#about"
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
