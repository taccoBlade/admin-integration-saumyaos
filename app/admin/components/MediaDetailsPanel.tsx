"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Trash2, Archive, RefreshCw } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  updateMediaMetadataAction,
  deleteMediaAssetAction,
  getMediaUsageAction,
} from "../media-actions";

interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  public_url: string;
  file_name: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  file_size_bytes: number;
  alt_text: string | null;
  caption: string | null;
  status: string;
  created_at: string;
  metadata_json: Record<string, unknown>;
}

interface MediaDetailsPanelProps {
  selectedAsset: MediaAsset;
  onClose: () => void;
  onRefresh: () => void;
}

export default function MediaDetailsPanel({
  selectedAsset,
  onClose,
  onRefresh,
}: MediaDetailsPanelProps) {
  const [usages, setUsages] = useState<{ type: string; name: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editCategory, setEditCategory] = useState("Projects");
  const [editTags, setEditTags] = useState("");

  const supabase = createSupabaseBrowserClient();
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(selectedAsset.file_name || "");
    setEditAlt(selectedAsset.alt_text || "");
    setEditCaption(selectedAsset.caption || "");
    setEditCategory((selectedAsset.metadata_json?.category as string) || "Projects");
    setEditTags(
      Array.isArray(selectedAsset.metadata_json?.tags)
        ? selectedAsset.metadata_json.tags.join(", ")
        : ""
    );

    getMediaUsageAction(selectedAsset.id).then((res) => {
      setUsages(res.usage || []);
    });
  }, [selectedAsset]);

  const handleSaveMetadata = async () => {
    setIsSaving(true);
    try {
      const tagsArray = editTags
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await updateMediaMetadataAction(selectedAsset.id, {
        title: editTitle,
        altText: editAlt,
        caption: editCaption,
        category: editCategory,
        tags: tagsArray,
      });

      if (res.error) throw new Error(res.error);
      alert("Metadata saved successfully!");
      onRefresh();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Failed to save metadata: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveAsset = async () => {
    const confirmArchive = confirm("Archive this asset? It will be hidden from the picker.");
    if (!confirmArchive) return;
    try {
      const res = await updateMediaMetadataAction(selectedAsset.id, { status: "archived" });
      if (res.error) throw new Error(res.error);
      alert("Asset archived.");
      onClose();
      onRefresh();
    } catch (err: unknown) {
      const e = err as Error;
      alert(e.message);
    }
  };

  const handleDeleteAsset = async () => {
    const confirmDelete = confirm("Permanently delete this media asset?");
    if (!confirmDelete) return;
    try {
      const res = await deleteMediaAssetAction(selectedAsset.id);
      if (res.error) {
        alert(res.error);
        return;
      }
      alert("Asset deleted.");
      onClose();
      onRefresh();
    } catch (err: unknown) {
      const e = err as Error;
      alert(e.message);
    }
  };

  const computeSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const resizeImage = (file: File, maxWidth: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context null"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Blob null"))), file.type, 0.85);
      };
      img.onerror = (e) => reject(e);
    });
  };

  const handleReplaceFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsReplacing(true);

    try {
      const [thumbBlob, medBlob, lgBlob] = await Promise.all([
        resizeImage(file, 150),
        resizeImage(file, 600),
        resizeImage(file, 1200),
      ]);

      const dimensions = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => resolve({ w: img.width, h: img.height });
      });

      const hash = await computeSHA256(file);
      const bucketName = selectedAsset.bucket;

      const baseName = selectedAsset.path.replace(/\.[^/.]+$/, "");
      const ext = selectedAsset.path.split(".").pop();
      const thumbPath = `${baseName}_thumbnail.${ext}`;
      const medPath = `${baseName}_medium.${ext}`;
      const lgPath = `${baseName}_large.${ext}`;

      await Promise.all([
        supabase.storage.from(bucketName).upload(selectedAsset.path, file, { upsert: true }),
        supabase.storage.from(bucketName).upload(thumbPath, thumbBlob, { upsert: true }),
        supabase.storage.from(bucketName).upload(medPath, medBlob, { upsert: true }),
        supabase.storage.from(bucketName).upload(lgPath, lgBlob, { upsert: true }),
      ]);

      const nextMeta = {
        ...selectedAsset.metadata_json,
        sha256: hash,
      };

      const adminDb = createSupabaseAdminClient();
      const { error: updateErr } = await adminDb
        .from("media_assets")
        .update({
          width: dimensions.w,
          height: dimensions.h,
          file_size_bytes: file.size,
          mime_type: file.type,
          metadata_json: nextMeta,
        })
        .eq("id", selectedAsset.id);

      if (updateErr) throw updateErr;

      alert("Image replaced successfully!");
      onClose();
      onRefresh();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Replacement failed: ${e.message}`);
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <div className="w-80 bg-[#07080b] border border-white/5 rounded-3xl p-6 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-xs font-bold text-white uppercase">Asset Details</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="aspect-video bg-[#0c0d12] rounded-xl overflow-hidden border border-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selectedAsset.public_url} alt="Selected" className="w-full h-full object-contain" />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-[#0c0d12] border border-white/5 p-2 rounded-xl text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Alt Text</label>
            <input
              type="text"
              value={editAlt}
              onChange={(e) => setEditAlt(e.target.value)}
              className="w-full bg-[#0c0d12] border border-white/5 p-2 rounded-xl text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Caption</label>
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              className="w-full bg-[#0c0d12] border border-white/5 p-2 rounded-xl text-xs text-white"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/5 p-2 rounded-xl text-xs text-white"
              >
                <option value="Projects">Projects</option>
                <option value="Research">Research</option>
                <option value="Photography">Photography</option>
                <option value="Hero">Hero</option>
                <option value="Timeline">Timeline</option>
                <option value="About">About</option>
                <option value="Resume">Resume</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">Tags</label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Featured, iot"
                className="w-full bg-[#0c0d12] border border-white/5 p-2 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <button
            onClick={handleSaveMetadata}
            disabled={isSaving}
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold border border-white/5 transition-all"
          >
            Save Details
          </button>
        </div>

        <div className="border-t border-white/5 pt-3 space-y-1.5 text-[10px] text-slate-400">
          <p><span className="text-slate-500">MIME Type:</span> {selectedAsset.mime_type}</p>
          <p>
            <span className="text-slate-500">Dimensions:</span>{" "}
            {selectedAsset.width && selectedAsset.height
              ? `${selectedAsset.width} × ${selectedAsset.height} px`
              : "N/A"}
          </p>
          <p>
            <span className="text-slate-500">File Size:</span>{" "}
            {(selectedAsset.file_size_bytes / 1024).toFixed(1)} KB
          </p>
          <p>
            <span className="text-slate-500">Uploaded:</span>{" "}
            {new Date(selectedAsset.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="border-t border-white/5 pt-3 space-y-2">
          <h4 className="text-[10px] font-bold text-white uppercase">Usage Panel</h4>
          {usages.length === 0 ? (
            <p className="text-[10px] text-slate-500">Not used in any project/hero/timeline.</p>
          ) : (
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {usages.map((u, index) => (
                <div key={index} className="flex justify-between items-center text-[10px] bg-white/[0.01] border border-white/5 px-2 py-1 rounded-lg">
                  <span className="text-[var(--accent-blue)] truncate max-w-[120px]">{u.name}</span>
                  <span className="text-[9px] text-slate-500">{u.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-white/5">
        <button
          onClick={() => replaceInputRef.current?.click()}
          disabled={isReplacing}
          className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Replace Image File
        </button>
        <input
          type="file"
          ref={replaceInputRef}
          onChange={(e) => handleReplaceFile(e.target.files)}
          accept="image/*"
          className="hidden"
        />

        <div className="flex gap-2">
          <button
            onClick={handleArchiveAsset}
            className="flex-1 py-2 bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 border border-slate-500/20 rounded-xl font-semibold transition-all flex items-center justify-center gap-1"
          >
            <Archive className="w-3 h-3" />
            Archive
          </button>
          <button
            onClick={handleDeleteAsset}
            className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-semibold transition-all flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
