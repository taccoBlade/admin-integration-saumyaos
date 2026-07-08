"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, UploadCloud, Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { checkDuplicateHashAction, saveMediaAssetAction } from "../media-actions";

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

interface MediaPickerProps {
  onClose: () => void;
  onSelect: (assets: MediaAsset[]) => void;
  multiSelect?: boolean;
}

export default function MediaPicker({ onClose, onSelect, multiSelect = false }: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryToUpload, setCategoryToUpload] = useState("Projects");

  // Upload progress state
  const [uploadQueue, setUploadQueue] = useState<{
    id: string;
    name: string;
    progress: number;
    controller: AbortController;
  }[]>([]);

  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const query = supabase
        .from("media_assets")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Filter on category client-side/metadata-side
      const filtered = (data || []).filter((item: unknown) => {
        const a = item as MediaAsset;
        const cat = a.metadata_json?.category || "Other";
        if (categoryFilter === "all") return true;
        return typeof cat === "string" && cat.toLowerCase() === categoryFilter.toLowerCase();
      }) as MediaAsset[];

      setAssets(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, supabase]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleSelectAsset = (asset: MediaAsset) => {
    if (multiSelect) {
      setSelectedIds((prev) =>
        prev.includes(asset.id) ? prev.filter((id) => id !== asset.id) : [...prev, asset.id]
      );
    } else {
      setSelectedIds([asset.id]);
    }
  };

  const handleConfirmSelection = () => {
    const selected = assets.filter((a) => selectedIds.includes(a.id));
    onSelect(selected);
    onClose();
  };

  // Helper: compute SHA-256 hash of a file
  const computeSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // Helper: resize image using HTML5 Canvas
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

  const handleFilesUpload = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        alert("Only image uploads are supported currently.");
        continue;
      }

      const queueId = Math.random().toString(36).substring(7);
      const controller = new AbortController();

      setUploadQueue((prev) => [...prev, { id: queueId, name: file.name, progress: 0, controller }]);

      try {
        // 1. Compute Hash & Check Duplicate
        const hash = await computeSHA256(file);
        const dupRes = await checkDuplicateHashAction(hash);

        const duplicateAsset = dupRes.duplicate;
        if (duplicateAsset) {
          const action = confirm(
            `"${file.name}" already exists in the Media Library.\n\nClick OK to USE EXISTING asset, or CANCEL to upload a new copy anyway.`
          );
          if (action) {
            // Use existing
            setUploadQueue((prev) => prev.filter((item) => item.id !== queueId));
            setSelectedIds((prev) => (multiSelect ? [...prev, duplicateAsset.id] : [duplicateAsset.id]));
            loadAssets();
            continue;
          }
        }

        // 2. Generate Resized Versions client-side
        const [thumbBlob, medBlob, lgBlob] = await Promise.all([
          resizeImage(file, 150),
          resizeImage(file, 600),
          resizeImage(file, 1200),
        ]);

        // Get dimensions of original
        const dimensions = await new Promise<{ w: number; h: number }>((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => resolve({ w: img.width, h: img.height });
        });

        // 3. Upload to Supabase Storage (original + resized sizes)
        const bucketName = "project-media";
        const folder = `${categoryToUpload}/`;
        const timestamp = Date.now();
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const ext = file.name.split(".").pop();
        const cleanName = baseName.replace(/[^a-z0-9]/gi, "_").toLowerCase();

        const origPath = `${folder}${cleanName}_${timestamp}.${ext}`;
        const thumbPath = `${folder}${cleanName}_${timestamp}_thumbnail.${ext}`;
        const medPath = `${folder}${cleanName}_${timestamp}_medium.${ext}`;
        const lgPath = `${folder}${cleanName}_${timestamp}_large.${ext}`;

        // Custom XHR or simulate progress
        let uploadProgress = 0;
        const progressInterval = setInterval(() => {
          uploadProgress = Math.min(uploadProgress + 15, 90);
          setUploadQueue((prev) =>
            prev.map((item) => (item.id === queueId ? { ...item, progress: uploadProgress } : item))
          );
        }, 200);

        // Upload original
        const { error: origErr } = await supabase.storage
          .from(bucketName)
          .upload(
            origPath,
            file,
            { abortSignal: controller.signal } as unknown as Parameters<ReturnType<typeof supabase.storage.from>["upload"]>[2]
          );
        if (origErr) throw origErr;

        // Upload others
        await Promise.all([
          supabase.storage.from(bucketName).upload(thumbPath, thumbBlob),
          supabase.storage.from(bucketName).upload(medPath, medBlob),
          supabase.storage.from(bucketName).upload(lgPath, lgBlob),
        ]);

        clearInterval(progressInterval);
        setUploadQueue((prev) =>
          prev.map((item) => (item.id === queueId ? { ...item, progress: 100 } : item))
        );

        // Get public URLs
        const origUrl = supabase.storage.from(bucketName).getPublicUrl(origPath).data.publicUrl;
        const thumbUrl = supabase.storage.from(bucketName).getPublicUrl(thumbPath).data.publicUrl;
        const medUrl = supabase.storage.from(bucketName).getPublicUrl(medPath).data.publicUrl;
        const lgUrl = supabase.storage.from(bucketName).getPublicUrl(lgPath).data.publicUrl;

        // 4. Save to Database
        await saveMediaAssetAction({
          bucket: bucketName,
          path: origPath,
          publicUrl: origUrl,
          fileName: file.name,
          mimeType: file.type,
          mediaType: "image",
          fileSize: file.size,
          width: dimensions.w,
          height: dimensions.h,
          hash,
          category: categoryToUpload,
          sizes: {
            thumbnail: thumbUrl,
            medium: medUrl,
            large: lgUrl,
          },
        });

        // 5. Clean up queue and auto-select
        setUploadQueue((prev) => prev.filter((item) => item.id !== queueId));
        loadAssets();
      } catch (err: unknown) {
        const e = err as { name?: string; message?: string };
        if (e.name === "AbortError") {
          alert(`Upload of ${file.name} was cancelled.`);
        } else {
          console.error(e);
          alert(`Failed uploading ${file.name}: ${e.message || "Unknown error"}`);
        }
        setUploadQueue((prev) => prev.filter((item) => item.id !== queueId));
      }
    }
  };

  const handleCancelUpload = (id: string, controller: AbortController) => {
    controller.abort();
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredAssets = assets.filter((a) =>
    a.file_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] p-6 font-mono select-none">
      <div className="bg-[#0e0721] border border-white/10 w-full max-w-4xl h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/15 bg-[#090b0e]">
          <div>
            <h2 className="text-sm font-bold text-white uppercase">Choose Image</h2>
            <p className="text-[9px] text-[var(--muted)]">SELECT ASSETS FROM MEDIA LIBRARY</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-purple-500/15 text-[var(--muted)] hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters and Upload bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 border-b border-purple-500/15 bg-[#08090c]/50">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-purple-400/80" />
            <input
              type="text"
              placeholder="Search images..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#130a2a] border border-purple-500/15 py-2 pl-9 pr-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#130a2a] border border-purple-500/15 px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="all">All Folders</option>
              <option value="projects">Projects/</option>
              <option value="research">Research/</option>
              <option value="photography">Photography/</option>
              <option value="hero">Hero/</option>
              <option value="timeline">Timeline/</option>
              <option value="about">About/</option>
              <option value="resume">Resume/</option>
            </select>

            <select
              value={categoryToUpload}
              onChange={(e) => setCategoryToUpload(e.target.value)}
              className="bg-[#130a2a] border border-purple-500/15 px-3 py-2 rounded-xl text-xs text-amber-500 focus:outline-none"
            >
              <option value="Projects">Upload to: Projects/</option>
              <option value="Research">Upload to: Research/</option>
              <option value="Photography">Upload to: Photography/</option>
              <option value="Hero">Upload to: Hero/</option>
              <option value="Timeline">Upload to: Timeline/</option>
              <option value="About">Upload to: About/</option>
              <option value="Resume">Upload to: Resume/</option>
            </select>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-purple)]/90 rounded-xl text-xs font-semibold transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload New
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFilesUpload(e.target.files)}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Drag and Drop Zone & Grid */}
        <div
          className="flex-1 overflow-y-auto p-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFilesUpload(e.dataTransfer.files);
          }}
        >
          {/* Upload Queue Section */}
          {uploadQueue.length > 0 && (
            <div className="mb-6 border border-purple-500/15 bg-[#0a0c0f] rounded-2xl p-4 space-y-3">
              <h4 className="text-[10px] font-bold text-amber-500 uppercase">Active Uploads</h4>
              {uploadQueue.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs bg-white/[0.02] border border-purple-500/15 px-3 py-2 rounded-xl">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                      <span className="truncate max-w-[200px]">{item.name}</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-[var(--accent-blue)] h-full transition-all" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelUpload(item.id, item.controller)}
                    className="p-1 text-[var(--muted)] hover:text-red-400 hover:bg-white/5 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-purple-400/80 text-xs">
              <div className="animate-spin rounded-full h-5 w-5 border-t border-slate-500 border-r border-transparent mb-2" />
              Loading Media Assets...
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="border-2 border-dashed border-purple-500/15 flex flex-col items-center justify-center py-20 rounded-3xl text-purple-400/80">
              <UploadCloud className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-xs">Drag and drop images here, or browse files</p>
              <p className="text-[10px] opacity-50 mt-1">Organized under {categoryToUpload}/</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {filteredAssets.map((asset) => {
                const isSelected = selectedIds.includes(asset.id);
                const sizes = (asset.metadata_json?.sizes || {}) as Record<string, unknown>;
                const thumbUrl = (sizes.thumbnail as string) || asset.public_url;
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset)}
                    className={`relative aspect-square border rounded-2xl overflow-hidden cursor-pointer bg-[#0e1014] transition-all group select-none ${
                      isSelected
                        ? "border-[var(--accent-blue)] ring-1 ring-[var(--accent-blue)]/50 scale-[0.98]"
                        : "border-purple-500/15 hover:border-white/10 hover:scale-[1.02]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbUrl}
                      alt={asset.alt_text || asset.file_name}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="text-[9px] text-white truncate w-full">{asset.file_name}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[var(--accent-blue)] text-black p-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-purple-500/15 bg-[#090b0e]">
          <p className="text-[10px] text-[var(--muted)]">
            {selectedIds.length} file{selectedIds.length === 1 ? "" : "s"} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-purple-500/15 hover:bg-white/5 rounded-xl text-slate-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedIds.length === 0}
              className="px-4 py-2 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-black disabled:opacity-50 font-bold rounded-xl text-xs transition-all"
            >
              Use Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
