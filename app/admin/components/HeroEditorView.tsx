"use client";

import React, { useState } from "react";
import { ArrowLeft, Sparkles, Image as ImageIcon } from "lucide-react";
import AIAssistantPanel from "./AIAssistantPanel";
import MediaPicker from "./MediaPicker";

interface HeroEditorViewProps {
  initialTitle: string;
  initialTagline: string;
  initialSubtitle: string;
  initialDescription: string;
  initialCoverImage: string;
  initialCtaText: string;
  initialCtaUrl: string;
  initialSecondaryCtaText: string;
  initialSecondaryCtaUrl: string;
  isPending: boolean;
  onBack: () => void;
  onSave: (formData: {
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
  }) => void;
}

export default function HeroEditorView({
  initialTitle,
  initialTagline,
  initialSubtitle,
  initialDescription,
  initialCoverImage,
  initialCtaText,
  initialCtaUrl,
  initialSecondaryCtaText,
  initialSecondaryCtaUrl,
  isPending,
  onBack,
  onSave,
}: HeroEditorViewProps) {
  const [title, setTitle] = useState(initialTitle);
  const [tagline, setTagline] = useState(initialTagline);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [description, setDescription] = useState(initialDescription);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [ctaText, setCtaText] = useState(initialCtaText);
  const [ctaUrl, setCtaUrl] = useState(initialCtaUrl);
  const [secondaryCtaText, setSecondaryCtaText] = useState(initialSecondaryCtaText);
  const [secondaryCtaUrl, setSecondaryCtaUrl] = useState(initialSecondaryCtaUrl);

  const [aiOpen, setAiOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleApplyField = (field: string, value: string) => {
    if (field === "title") setTitle(value);
    else if (field === "tagline") setTagline(value);
    else if (field === "subtitle") setSubtitle(value);
    else if (field === "description") setDescription(value);
  };

  const handleSubmit = (publish: boolean) => {
    onSave({
      title,
      tagline,
      subtitle,
      description,
      coverImage,
      cta_text: ctaText,
      cta_url: ctaUrl,
      secondary_cta_text: secondaryCtaText,
      secondary_cta_url: secondaryCtaUrl,
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
              className="p-2 rounded-xl text-[var(--muted)] hover:text-white hover:bg-white/5 border border-purple-500/15 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Edit Hero</h1>
              <p className="text-[10px] text-[var(--muted)]">MODULE WORKSPACE · HERO</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiOpen(!aiOpen)}
            className={`py-2 px-3 rounded-xl border transition-all flex items-center gap-1.5 ${
              aiOpen
                ? "bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold"
                : "border-purple-500/15 text-[var(--muted)] hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {aiOpen ? "Close AI" : "Ask AI"}
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="border border-purple-500/15 bg-[#130a2a]/50 p-6 rounded-2xl space-y-4">
          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Main Title (Owner Name)</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Eyebrow Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Subtitle (Role/Specialization)</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Description Paragraph</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Primary CTA Text</label>
              <input
                type="text"
                placeholder="View Projects"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Primary CTA Link</label>
              <input
                type="text"
                placeholder="#projects"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Secondary CTA Text</label>
              <input
                type="text"
                placeholder="Resume"
                value={secondaryCtaText}
                onChange={(e) => setSecondaryCtaText(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Secondary CTA Link</label>
              <input
                type="text"
                placeholder="/resume.pdf"
                value={secondaryCtaUrl}
                onChange={(e) => setSecondaryCtaUrl(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Cover Background Image</label>
            {coverImage ? (
              <div className="relative w-40 h-24 border border-purple-500/15 rounded-xl overflow-hidden mb-2 group">
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 font-bold transition-all text-[10px]"
                >
                  REMOVE
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="py-2.5 px-4 bg-white/5 border border-purple-500/15 hover:bg-white/10 text-white rounded-xl transition-all mb-2 flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" /> Choose Image
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isPending}
              className="flex-1 py-3 px-4 bg-white/5 border border-purple-500/15 hover:bg-white/10 text-white font-semibold rounded-xl text-xs disabled:opacity-50 transition-all"
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
              tagline,
              subtitle,
              description,
            }}
            onApplyField={handleApplyField}
            onClose={() => setAiOpen(false)}
          />
        </div>
      )}

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-4xl max-h-[85vh] bg-[#130a2a] border border-purple-500/15 rounded-3xl p-6 relative overflow-hidden flex flex-col">
            <MediaPicker
              onClose={() => setPickerOpen(false)}
              onSelect={(assets) => {
                if (assets.length > 0) setCoverImage(assets[0].public_url);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
