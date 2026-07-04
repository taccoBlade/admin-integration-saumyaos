"use client";

import React, { useState } from "react";
import { ArrowLeft, Sparkles, Plus, Trash2 } from "lucide-react";
import AIAssistantPanel from "./AIAssistantPanel";

interface FocusCard {
  title: string;
  description: string;
}

interface AboutEditorViewProps {
  initialTitle: string;
  initialEyebrow: string;
  initialFocusCards: FocusCard[];
  initialObsessions: string[];
  isPending: boolean;
  onBack: () => void;
  onSave: (formData: {
    title: string;
    eyebrow: string;
    focusCards: FocusCard[];
    obsessions: string[];
    publish: boolean;
  }) => void;
}

export default function AboutEditorView({
  initialTitle,
  initialEyebrow,
  initialFocusCards,
  initialObsessions,
  isPending,
  onBack,
  onSave,
}: AboutEditorViewProps) {
  const [title, setTitle] = useState(initialTitle);
  const [eyebrow, setEyebrow] = useState(initialEyebrow);
  const [focusCards, setFocusCards] = useState<FocusCard[]>(
    initialFocusCards.length > 0 ? initialFocusCards : [
      { title: "Engineering", description: "" },
      { title: "Markets", description: "" },
      { title: "Digital", description: "" }
    ]
  );
  
  const [obsessionsText, setObsessionsText] = useState(initialObsessions.join("\n"));
  const [aiOpen, setAiOpen] = useState(false);

  const handleApplyField = (field: string, value: string) => {
    if (field === "title") setTitle(value);
    else if (field === "eyebrow") setEyebrow(value);
    else if (field.startsWith("focus_card_desc_")) {
      const idx = parseInt(field.split("_").pop() || "0");
      const updated = [...focusCards];
      if (updated[idx]) {
        updated[idx].description = value;
        setFocusCards(updated);
      }
    }
  };

  const handleCardChange = (idx: number, field: keyof FocusCard, val: string) => {
    const updated = [...focusCards];
    updated[idx] = { ...updated[idx], [field]: val };
    setFocusCards(updated);
  };

  const addCard = () => {
    setFocusCards([...focusCards, { title: "New Card", description: "" }]);
  };

  const removeCard = (idx: number) => {
    setFocusCards(focusCards.filter((_, i) => i !== idx));
  };

  const handleSubmit = (publish: boolean) => {
    const obsessions = obsessionsText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onSave({
      title,
      eyebrow,
      focusCards,
      obsessions,
      publish,
    });
  };

  return (
    <div className="flex gap-6 max-w-5xl items-start font-mono text-xs select-none">
      <div className="flex-1 space-y-6 max-w-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-[var(--muted)] hover:text-white hover:bg-white/5 border border-white/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Edit About Section</h1>
              <p className="text-[10px] text-[var(--muted)]">MODULE WORKSPACE · ABOUT ME</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiOpen(!aiOpen)}
            className={`py-2 px-3 rounded-xl border transition-all flex items-center gap-1.5 ${
              aiOpen
                ? "bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold"
                : "border-white/5 text-[var(--muted)] hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {aiOpen ? "Close AI" : "Ask AI"}
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="border border-white/5 bg-[#0c0d12]/50 p-6 rounded-2xl space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Section Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Eyebrow Tag</label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] uppercase text-[var(--muted)]">Focus Cards (Engineering, Markets, etc.)</label>
              <button
                type="button"
                onClick={addCard}
                className="text-[9px] uppercase font-bold text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Focus Area
              </button>
            </div>

            {focusCards.map((card, idx) => (
              <div key={idx} className="p-4 bg-black/35 border border-white/5 rounded-xl space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => removeCard(idx)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="pr-8">
                  <input
                    type="text"
                    required
                    placeholder="Focus Title (e.g. Geotechnical)"
                    value={card.title}
                    onChange={(e) => handleCardChange(idx, "title", e.target.value)}
                    className="block w-full py-1.5 px-2 bg-[#0c0d12] border border-white/5 rounded-lg text-xs text-white focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    placeholder="Focus Description paragraph..."
                    value={card.description}
                    onChange={(e) => handleCardChange(idx, "description", e.target.value)}
                    className="block w-full py-1.5 px-2 bg-[#0c0d12] border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Current Obsessions (One per line)</label>
            <textarea
              rows={4}
              value={obsessionsText}
              onChange={(e) => setObsessionsText(e.target.value)}
              className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none leading-relaxed"
              placeholder="Deep Excavation Engineering&#10;Infrastructure Automation&#10;Portfolio Construction"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isPending}
              className="flex-1 py-3 px-4 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-xs disabled:opacity-50 transition-all"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isPending}
              className="flex-1 py-3 px-4 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-black font-semibold rounded-xl text-xs disabled:opacity-50 transition-all shadow-lg"
            >
              Publish Live
            </button>
          </div>
        </form>
      </div>

      {aiOpen && (
        <div className="sticky top-6 shrink-0 h-[500px]">
          <AIAssistantPanel
            context={{
              title,
              eyebrow,
              focusCardsDescription: focusCards.map((c) => `${c.title}: ${c.description}`).join("\n"),
              obsessions: obsessionsText,
            }}
            onApplyField={handleApplyField}
            onClose={() => setAiOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
