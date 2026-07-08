"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { UploadCloud, Search } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { checkDuplicateHashAction, saveMediaAssetAction } from "../media-actions";
import MediaDetailsPanel from "../components/MediaDetailsPanel";

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

export default function MediaView() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

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

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const isPdf = file.type === "application/pdf";
    if (!file.type.startsWith("image/") && !isPdf) {
      alert("Only images and PDFs are supported.");
      return;
    }

    try {
      const hash = await computeSHA256(file);
      const dupRes = await checkDuplicateHashAction(hash);

      const duplicateAsset = dupRes.duplicate;
      if (duplicateAsset) {
        const action = confirm(
          `"${file.name}" already exists.\n\nClick OK to USE EXISTING asset, or CANCEL to upload anyway.`
        );
        if (action) {
          setSelectedAsset(assets.find((a) => a.id === duplicateAsset.id) || null);
          return;
        }
      }

      let thumbBlob: Blob | null = null;
      let medBlob: Blob | null = null;
      let lgBlob: Blob | null = null;
      let dimensions = { w: 0, h: 0 };

      if (!isPdf) {
        [thumbBlob, medBlob, lgBlob] = await Promise.all([
          resizeImage(file, 150),
          resizeImage(file, 600),
          resizeImage(file, 1200),
        ]);

        dimensions = await new Promise<{ w: number; h: number }>((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => resolve({ w: img.width, h: img.height });
        });
      }

      const bucketName = "project-media";
      const catName = isPdf ? "Resume" : "Projects";
      const folder = `${catName}/`;
      const timestamp = Date.now();
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const ext = file.name.split(".").pop();
      const cleanName = baseName.replace(/[^a-z0-9]/gi, "_").toLowerCase();

      const origPath = `${folder}${cleanName}_${timestamp}.${ext}`;
      
      const uploadPromises = [supabase.storage.from(bucketName).upload(origPath, file)];
      
      let thumbPath, medPath, lgPath;
      if (!isPdf && thumbBlob && medBlob && lgBlob) {
        thumbPath = `${folder}${cleanName}_${timestamp}_thumbnail.${ext}`;
        medPath = `${folder}${cleanName}_${timestamp}_medium.${ext}`;
        lgPath = `${folder}${cleanName}_${timestamp}_large.${ext}`;
        
        uploadPromises.push(
          supabase.storage.from(bucketName).upload(thumbPath, thumbBlob),
          supabase.storage.from(bucketName).upload(medPath, medBlob),
          supabase.storage.from(bucketName).upload(lgPath, lgBlob)
        );
      }

      await Promise.all(uploadPromises);

      const origUrl = supabase.storage.from(bucketName).getPublicUrl(origPath).data.publicUrl;
      let thumbUrl = null, medUrl = null, lgUrl = null;
      if (!isPdf && thumbPath && medPath && lgPath) {
        thumbUrl = supabase.storage.from(bucketName).getPublicUrl(thumbPath).data.publicUrl;
        medUrl = supabase.storage.from(bucketName).getPublicUrl(medPath).data.publicUrl;
        lgUrl = supabase.storage.from(bucketName).getPublicUrl(lgPath).data.publicUrl;
      }

      const saveRes = await saveMediaAssetAction({
        bucket: bucketName,
        path: origPath,
        publicUrl: origUrl,
        fileName: file.name,
        mimeType: file.type,
        mediaType: isPdf ? "document" : "image",
        fileSize: file.size,
        width: dimensions.w || undefined,
        height: dimensions.h || undefined,
        hash,
        category: catName,
        sizes: isPdf ? {} : {
          thumbnail: thumbUrl || "",
          medium: medUrl || "",
          large: lgUrl || "",
        },
      });

      if (saveRes.error) throw new Error(saveRes.error);
      alert(isPdf ? "PDF uploaded successfully!" : "Image uploaded successfully!");
      loadAssets();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Upload failed: ${e.message}`);
    }
  };

  const filteredAssets = assets.filter((a) =>
    a.file_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-6 h-[78vh] font-mono text-xs text-slate-300 select-none">
      <div className="flex-1 flex flex-col bg-[#0e0721] border border-purple-500/15 rounded-3xl p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-purple-400/80" />
            <input
              type="text"
              placeholder="Search media library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#130a2a] border border-purple-500/15 py-2.5 pl-9 pr-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)] text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#130a2a] border border-purple-500/15 px-3 py-2.5 rounded-xl text-white focus:outline-none"
            >
              <option value="all">All folders</option>
              <option value="projects">Projects/</option>
              <option value="research">Research/</option>
              <option value="photography">Photography/</option>
              <option value="hero">Hero/</option>
              <option value="timeline">Timeline/</option>
              <option value="about">About/</option>
              <option value="resume">Resume/</option>
            </select>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-purple)]/90 rounded-xl font-semibold transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              accept="image/*,application/pdf"
              className="hidden"
            />
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20 text-purple-400/80">
              Loading assets...
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="border border-dashed border-purple-500/15 rounded-3xl flex flex-col items-center justify-center py-24 text-purple-400/80">
              <UploadCloud className="w-8 h-8 opacity-30 mb-2" />
              <p>Drag & drop image files to upload</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                const sizes = (asset.metadata_json?.sizes || {}) as Record<string, unknown>;
                const thumbUrl = (sizes.thumbnail as string) || asset.public_url;
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`aspect-square border rounded-2xl overflow-hidden cursor-pointer bg-[#0e1014] transition-all group ${
                      isSelected
                        ? "border-[var(--accent-blue)] scale-[0.98] ring-1 ring-[var(--accent-blue)]/30"
                        : "border-purple-500/15 hover:border-white/10 hover:scale-[1.02]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbUrl}
                      alt={asset.alt_text || asset.file_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedAsset && (
        <MediaDetailsPanel
          selectedAsset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onRefresh={loadAssets}
        />
      )}
    </div>
  );
}
