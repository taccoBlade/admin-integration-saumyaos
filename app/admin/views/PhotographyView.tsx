"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Camera, Plus, Edit2, Trash2, AlertTriangle, X, Image as ImageIcon, Sparkles, MoveUp, MoveDown } from "lucide-react";
import { getPhotoSpreadsAction, createPhotoSpreadAction, updatePhotoSpreadAction, deletePhotoSpreadAction } from "../photography-actions";
import { FormField, FormTextarea, FormSelect } from "../components/FormFields";
import MediaPicker from "../components/MediaPicker";

interface MediaAsset {
  id: string;
  public_url: string;
  file_name: string;
  mime_type: string;
}

interface PhotoSpreadItem {
  id: string;
  photo_spread_id: string;
  media_asset_id: string;
  role: string;
  sort_order: number;
  media_assets: MediaAsset;
}

interface PhotoSpread {
  id: string;
  title: string | null;
  diary_entry: string | null;
  template_type: string;
  featured: boolean;
  sort_order: number;
  status: string;
  items: PhotoSpreadItem[];
}

export default function PhotographyView() {
  const [spreads, setSpreads] = useState<PhotoSpread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingSpread, setEditingSpread] = useState<PhotoSpread | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDiaryEntry, setFormDiaryEntry] = useState("");
  const [formTemplateType, setFormTemplateType] = useState("Photo Dump");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [formStatus, setFormStatus] = useState("draft");
  const [selectedPhotos, setSelectedPhotos] = useState<{
    id?: string;
    mediaAssetId: string;
    role: string;
    sortOrder: number;
    publicUrl: string;
    fileName: string;
  }[]>([]);

  const fetchSpreads = async () => {
    setIsLoading(true);
    const res = await getPhotoSpreadsAction();
    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.spreads) {
      setSpreads(res.spreads);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSpreads();
  }, []);

  const openCreateModal = () => {
    setEditingSpread(null);
    setFormTitle("");
    setFormDiaryEntry("");
    setFormTemplateType("Photo Dump");
    setFormFeatured(false);
    setFormSortOrder("0");
    setFormStatus("draft");
    setSelectedPhotos([]);
    setModalOpen(true);
  };

  const openEditModal = (spread: PhotoSpread) => {
    setEditingSpread(spread);
    setFormTitle(spread.title || "");
    setFormDiaryEntry(spread.diary_entry || "");
    setFormTemplateType(spread.template_type);
    setFormFeatured(spread.featured);
    setFormSortOrder(spread.sort_order.toString());
    setFormStatus(spread.status);
    setSelectedPhotos(
      spread.items.map((item) => ({
        id: item.id,
        mediaAssetId: item.media_asset_id,
        role: item.role,
        sortOrder: item.sort_order,
        publicUrl: item.media_assets?.public_url || "",
        fileName: item.media_assets?.file_name || ""
      }))
    );
    setModalOpen(true);
  };

  const handleAddPhotos = (assets: any[]) => {
    const newPhotos = assets
      .filter(asset => asset.mime_type?.startsWith("image/"))
      .map((asset, index) => ({
        mediaAssetId: asset.id,
        role: "Portrait",
        sortOrder: selectedPhotos.length + index,
        publicUrl: asset.public_url,
        fileName: asset.file_name
      }));
    setSelectedPhotos((prev) => [...prev, ...newPhotos]);
    setPickerOpen(false);
  };

  const handlePhotoRoleChange = (idx: number, role: string) => {
    setSelectedPhotos((prev) => {
      const next = [...prev];
      next[idx].role = role;
      return next;
    });
  };

  const handleRemovePhoto = (idx: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMovePhoto = (idx: number, dir: "up" | "down") => {
    setSelectedPhotos((prev) => {
      if (dir === "up" && idx === 0) return prev;
      if (dir === "down" && idx === prev.length - 1) return prev;
      
      const next = [...prev];
      const targetIdx = dir === "up" ? idx - 1 : idx + 1;
      
      // Swap items
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;

      // Re-assign sort orders
      return next.map((item, i) => ({ ...item, sortOrder: i }));
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPhotos.length === 0) {
      alert("At least one photo must be added to the spread.");
      return;
    }

    const formData = new FormData();
    formData.set("title", formTitle);
    formData.set("diaryEntry", formDiaryEntry);
    formData.set("templateType", formTemplateType);
    formData.set("featured", formFeatured ? "true" : "false");
    formData.set("sortOrder", formSortOrder);
    formData.set("status", formStatus);

    const itemsToSend = selectedPhotos.map((photo, i) => ({
      mediaAssetId: photo.mediaAssetId,
      role: photo.role,
      sortOrder: i
    }));

    startTransition(async () => {
      let res;
      if (editingSpread) {
        res = await updatePhotoSpreadAction(editingSpread.id, formData, itemsToSend);
      } else {
        res = await createPhotoSpreadAction(formData, itemsToSend);
      }

      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        setModalOpen(false);
        fetchSpreads();
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete photography spread "${name}"?`)) return;

    startTransition(async () => {
      const res = await deletePhotoSpreadAction(id);
      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        fetchSpreads();
      }
    });
  };

  const templates = [
    { value: "Photo Dump", label: "Photo Dump (Standard Grid)" },
    { value: "Hero Intro", label: "Hero Intro (Banner + Grid)" },
    { value: "Offset", label: "Offset (Alternating Bento)" },
    { value: "Cinematic Widescreen", label: "Cinematic Widescreen (Letterbox)" },
    { value: "Lookbook", label: "Lookbook (Editorial Magazine)" },
    { value: "Minimalist Horizon", label: "Minimalist Horizon (Full Width Scroll)" }
  ];

  const photoRoles = [
    { value: "Hero", label: "Hero / Banner" },
    { value: "Portrait", label: "Portrait (Standard)" },
    { value: "Landscape", label: "Landscape (Horizontal)" },
    { value: "Scene Setter", label: "Scene Setter (Context)" },
    { value: "Detail", label: "Detail Macro" }
  ];

  const statuses = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" }
  ];

  return (
    <div className="space-y-8 font-mono select-none text-xs">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="admin-section-title">Workspace registry</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Photography</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Spread
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-350 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="admin-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-cyan-300" />
            <span className="admin-section-title">Photography lookbook spreads</span>
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
            {spreads.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-500">Loading lookbook spreads...</div>
        ) : spreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025]">
              <Camera className="h-5 w-5 text-slate-500" />
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-slate-500">
              No photography spreads found in the database. Add photographic entries to your travel or creative journal above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.01] text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3 font-semibold w-64">Cover / Title</th>
                  <th className="px-6 py-3 font-semibold">Template Layout</th>
                  <th className="px-6 py-3 font-semibold text-center w-24">Photos</th>
                  <th className="px-6 py-3 font-semibold text-center w-24">Status</th>
                  <th className="px-6 py-3 font-semibold text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {spreads.map((spread) => {
                  const heroPhoto = spread.items.find(i => i.role === "Hero") || spread.items[0];
                  return (
                    <tr key={spread.id} className="hover:bg-white/[0.015] transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {heroPhoto?.media_assets?.public_url ? (
                            <img
                              src={heroPhoto.media_assets.public_url}
                              alt={spread.title || "Spread cover"}
                              className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center text-slate-500 shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-slate-200 block truncate max-w-xs">
                              {spread.title || "Untitled Diary Spreads"}
                            </span>
                            {spread.diary_entry && (
                              <span className="text-[10px] text-slate-500 block truncate max-w-xs italic">
                                {spread.diary_entry}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white">{spread.template_type}</span>
                        {spread.featured && (
                          <span className="ml-2 inline-flex rounded-full bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-500/20">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-300">
                        {spread.items?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-semibold border ${
                          spread.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : spread.status === "archived"
                            ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {spread.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(spread)}
                            className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(spread.id, spread.title || spread.template_type)}
                            className="p-1.5 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl border border-white/5 bg-[#0c0d12] rounded-3xl p-6 flex flex-col justify-between font-mono text-xs text-slate-350 select-none shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="text-sm font-bold text-white uppercase">
                {editingSpread ? "Edit Photo Spread" : "Add Photo Spread"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Diary Title (Optional)"
                  name="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Flight Lines or Himalayan Passes"
                />
                <FormSelect
                  label="Layout Template"
                  name="templateType"
                  value={formTemplateType}
                  options={templates}
                  onChange={(e) => setFormTemplateType(e.target.value)}
                />
              </div>

              <FormTextarea
                label="Diary Text / Context Summary"
                name="diaryEntry"
                value={formDiaryEntry}
                onChange={(e) => setFormDiaryEntry(e.target.value)}
                placeholder="Write a small journal context for this photo collection..."
                rows={3}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  label="Spread Sort Order"
                  name="sortOrder"
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                />
                <div className="col-span-2 space-y-1.5 pt-2">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Flags</span>
                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="rounded border-white/15 bg-white/5 text-cyan-300 focus:ring-cyan-300 focus:ring-opacity-20 cursor-pointer w-4 h-4"
                    />
                    <label htmlFor="featured" className="text-slate-350 cursor-pointer font-bold select-none uppercase tracking-wider text-[10px]">
                      Featured Spread (Prominent personal page display)
                    </label>
                  </div>
                </div>
              </div>

              {/* Photo spread item list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                    Photos in Spread ({selectedPhotos.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-cyan-300 font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Select Photos
                  </button>
                </div>

                {selectedPhotos.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-white/5 rounded-xl text-slate-500">
                    No photos added to this spread. Click select photos to attach images.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {selectedPhotos.map((photo, index) => (
                      <div
                        key={photo.mediaAssetId + "-" + index}
                        className="flex items-center gap-4 p-2 rounded-xl border border-white/5 bg-white/[0.015]"
                      >
                        <img
                          src={photo.publicUrl}
                          alt="Thumbnail"
                          className="h-12 w-12 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-white block truncate max-w-[150px]">
                            {photo.fileName}
                          </span>
                          <span className="text-[9px] text-slate-500 block">Position {index + 1}</span>
                        </div>

                        {/* Image Role Selector */}
                        <div className="w-36">
                          <FormSelect
                            label=""
                            name={`role-${index}`}
                            value={photo.role}
                            options={photoRoles}
                            onChange={(e) => handlePhotoRoleChange(index, e.target.value)}
                          />
                        </div>

                        {/* Reorder and Delete Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMovePhoto(index, "up")}
                            className="p-1 hover:bg-white/5 rounded text-slate-400 disabled:opacity-20"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === selectedPhotos.length - 1}
                            onClick={() => handleMovePhoto(index, "down")}
                            className="p-1 hover:bg-white/5 rounded text-slate-400 disabled:opacity-20"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="p-1 hover:bg-red-500/10 rounded text-red-400 ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <FormSelect
                label="Workflow Status"
                name="status"
                value={formStatus}
                options={statuses}
                onChange={(e) => setFormStatus(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-white/5 hover:bg-white/5 rounded-xl text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-cyan-300 hover:bg-cyan-200 text-slate-950 font-bold rounded-xl disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Portal */}
      {pickerOpen && (
        <MediaPicker
          onClose={() => setPickerOpen(false)}
          onSelect={handleAddPhotos}
          multiSelect={true}
        />
      )}
    </div>
  );
}
