"use client";

import React, { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Image as ImageIcon, Plus, RefreshCw } from "lucide-react";
import MediaPicker from "./MediaPicker";

interface ProjectGalleryEditorProps {
  galleryUrls: string[];
  onUrlsChange: (urls: string[]) => void;
  coverUrl: string;
  onCoverUrlChange: (url: string) => void;
}

export default function ProjectGalleryEditor({
  galleryUrls,
  onUrlsChange,
  coverUrl,
  onCoverUrlChange,
}: ProjectGalleryEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"cover" | "gallery" | "replace">("gallery");
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  const handleOpenPicker = (mode: "cover" | "gallery" | "replace", index: number | null = null) => {
    setPickerMode(mode);
    setReplaceIndex(index);
    setPickerOpen(true);
  };

  const handleMediaSelect = (assets: { public_url: string }[]) => {
    if (assets.length === 0) return;

    if (pickerMode === "cover") {
      onCoverUrlChange(assets[0].public_url);
    } else if (pickerMode === "replace" && replaceIndex !== null) {
      const updated = [...galleryUrls];
      updated[replaceIndex] = assets[0].public_url;
      onUrlsChange(updated);
    } else if (pickerMode === "gallery") {
      const newUrls = assets.map((a) => a.public_url);
      onUrlsChange([...galleryUrls, ...newUrls]);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= galleryUrls.length) return;

    const updated = [...galleryUrls];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    onUrlsChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = galleryUrls.filter((_, i) => i !== index);
    onUrlsChange(updated);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-slate-300">
      {/* Cover Image Selector */}
      <div className="border border-white/5 bg-[#0a0b0d] p-5 rounded-2xl space-y-3">
        <h4 className="text-white font-bold uppercase text-[10px]">Project Cover Image</h4>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-[#121318] border border-white/5 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-slate-600" />
            )}
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleOpenPicker("cover")}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-semibold rounded-xl transition-all"
            >
              Choose Cover Image
            </button>
            <p className="text-[9px] text-slate-500">Visible on cards and headers</p>
          </div>
        </div>
      </div>

      {/* Gallery Selector */}
      <div className="border border-white/5 bg-[#0a0b0d] p-5 rounded-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <h4 className="text-white font-bold uppercase text-[10px]">Project Image Gallery</h4>
          <button
            type="button"
            onClick={() => handleOpenPicker("gallery")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-purple)] hover:bg-[var(--accent-purple)]/90 text-white rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Images
          </button>
        </div>

        {galleryUrls.length === 0 ? (
          <div className="text-center py-8 text-slate-500 border border-dashed border-white/5 rounded-xl">
            No gallery images selected. Click Add Images above.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {galleryUrls.map((url, index) => {
              const isCover = url === coverUrl;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[#121318]/40 border border-white/5 p-2 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black border border-white/5 rounded-lg overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{url.split("/").pop()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onCoverUrlChange(url)}
                      disabled={isCover}
                      className={`px-2 py-1 rounded text-[9px] font-bold ${
                        isCover
                          ? "bg-[var(--accent-blue)] text-black cursor-default"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {isCover ? "Cover Image" : "Make Cover"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === galleryUrls.length - 1}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenPicker("replace", index)}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-amber-400"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pickerOpen && (
        <MediaPicker
          onClose={() => setPickerOpen(false)}
          onSelect={handleMediaSelect}
          multiSelect={pickerMode === "gallery"}
        />
      )}
    </div>
  );
}
