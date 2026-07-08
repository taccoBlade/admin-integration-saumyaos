"use client";

import React, { useState, useEffect, useTransition } from "react";
import { BookOpen, Plus, Edit2, Trash2, AlertTriangle, X, FileDown, Calendar } from "lucide-react";
import { getResearchEntriesAction, createResearchEntryAction, updateResearchEntryAction, deleteResearchEntryAction } from "../research-actions";
import { FormField, FormTextarea, FormSelect } from "../components/FormFields";
import MediaPicker from "../components/MediaPicker";

interface MediaAsset {
  id: string;
  public_url: string;
  file_name: string;
}

interface ResearchEntry {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  abstract: string | null;
  publication_journal: string | null;
  publication_date: string | null;
  download_media_id: string | null;
  status: string;
  media_assets?: MediaAsset | null;
}

export default function ResearchView() {
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ResearchEntry | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formAuthors, setFormAuthors] = useState("");
  const [formAbstract, setFormAbstract] = useState("");
  const [formJournal, setFormJournal] = useState("");
  const [formPubDate, setFormPubDate] = useState("");
  const [formStatus, setFormStatus] = useState("draft");
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const fetchEntries = async () => {
    setIsLoading(true);
    const res = await getResearchEntriesAction();
    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.entries) {
      setEntries(res.entries);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const openCreateModal = () => {
    setEditingEntry(null);
    setFormTitle("");
    setFormSlug("");
    setFormAuthors("Saumya");
    setFormAbstract("");
    setFormJournal("");
    setFormPubDate(new Date().toISOString().split("T")[0]);
    setFormStatus("draft");
    setSelectedMedia(null);
    setSlugManuallyEdited(false);
    setModalOpen(true);
  };

  const openEditModal = (entry: ResearchEntry) => {
    setEditingEntry(entry);
    setFormTitle(entry.title);
    setFormSlug(entry.slug);
    setFormAuthors((entry.authors || []).join(", "));
    setFormAbstract(entry.abstract || "");
    setFormJournal(entry.publication_journal || "");
    setFormPubDate(entry.publication_date || "");
    setFormStatus(entry.status);
    setSelectedMedia(entry.media_assets || null);
    setSlugManuallyEdited(true);
    setModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormTitle(val);
    if (!slugManuallyEdited) {
      setFormSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSlug) {
      alert("Title and Slug are required.");
      return;
    }

    const formData = new FormData();
    formData.set("title", formTitle);
    formData.set("slug", formSlug);
    formData.set("authors", formAuthors);
    formData.set("abstract", formAbstract);
    formData.set("journal", formJournal);
    formData.set("pubDate", formPubDate);
    formData.set("status", formStatus);
    formData.set("downloadMediaId", selectedMedia?.id || "");

    startTransition(async () => {
      let res;
      if (editingEntry) {
        res = await updateResearchEntryAction(editingEntry.id, formData);
      } else {
        res = await createResearchEntryAction(formData);
      }

      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        setModalOpen(false);
        fetchEntries();
      }
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete research entry "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteResearchEntryAction(id);
      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        fetchEntries();
      }
    });
  };

  const statuses = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" }
  ];

  return (
    <div className="space-y-8 font-mono select-none text-xs">
      <div className="flex flex-col gap-4 border-b border-purple-500/20 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="admin-section-title">Workspace registry</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Research</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Publication
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-350 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="admin-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-purple-500/20 px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-cyan-300" />
            <span className="admin-section-title">Research Publications</span>
          </div>
          <span className="rounded-full border border-purple-500/20 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-purple-400/80">
            {entries.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-purple-400/80">Loading research publications...</div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025]">
              <BookOpen className="h-5 w-5 text-purple-400/80" />
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-purple-400/80">
              No research entries found in the database. Add your publications or journal articles above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-purple-500/20 bg-white/[0.01] text-[10px] uppercase tracking-wider text-purple-400/80">
                  <th className="px-6 py-3 font-semibold w-32">Date</th>
                  <th className="px-6 py-3 font-semibold">Publication Details</th>
                  <th className="px-6 py-3 font-semibold w-48">Journal / Conference</th>
                  <th className="px-6 py-3 font-semibold text-center w-24">Status</th>
                  <th className="px-6 py-3 font-semibold text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/[0.015] transition-all">
                    <td className="px-6 py-4 font-semibold text-purple-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-400/80" />
                        <span>{entry.publication_date || "Undated"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">
                      <div className="space-y-1">
                        <p className="font-semibold text-purple-50">{entry.title}</p>
                        <p className="text-[10px] text-purple-400/80">
                          Authors: {(entry.authors || []).join(", ")}
                        </p>
                        {entry.abstract && (
                          <p className="text-[10px] text-slate-450 line-clamp-1 italic">
                            {entry.abstract}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-semibold">{entry.publication_journal || "N/A"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-semibold border ${
                        entry.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : entry.status === "archived"
                          ? "bg-slate-500/10 text-purple-300 border-slate-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {entry.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {entry.media_assets?.public_url && (
                          <a
                            href={entry.media_assets.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-white/5 rounded text-purple-300 hover:text-white transition-all"
                            title="Download PDF"
                          >
                            <FileDown className="w-3.5 h-3.5 text-cyan-300" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(entry)}
                          className="p-1.5 hover:bg-white/5 rounded text-purple-300 hover:text-white transition-all"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id, entry.title)}
                          className="p-1.5 hover:bg-red-500/10 rounded text-purple-400/80 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-purple-500/15 bg-[#130a2a] rounded-3xl p-6 flex flex-col justify-between font-mono text-xs text-slate-350 select-none shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-500/15 pb-4 mb-4">
              <h3 className="text-sm font-bold text-white uppercase">
                {editingEntry ? "Edit Publication" : "Add New Publication"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <FormField
                label="Publication Title"
                name="title"
                required
                value={formTitle}
                onChange={handleTitleChange}
                placeholder="e.g. Real-Time Computational Soil Compaction Monitoring"
              />
              <FormField
                label="Slug"
                name="slug"
                required
                value={formSlug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setFormSlug(e.target.value);
                }}
              />

              <FormField
                label="Authors (Comma-separated)"
                name="authors"
                value={formAuthors}
                onChange={(e) => setFormAuthors(e.target.value)}
                placeholder="Saumya, Advisor Name, etc."
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Journal / Publisher"
                  name="journal"
                  value={formJournal}
                  onChange={(e) => setFormJournal(e.target.value)}
                  placeholder="IEEE or Springer"
                />
                <FormField
                  label="Publication Date"
                  name="pubDate"
                  type="date"
                  value={formPubDate}
                  onChange={(e) => setFormPubDate(e.target.value)}
                />
              </div>

              <FormTextarea
                label="Abstract"
                name="abstract"
                value={formAbstract}
                onChange={(e) => setFormAbstract(e.target.value)}
                placeholder="Brief summary of research methodology and findings..."
                rows={4}
              />

              {/* PDF Document Picker */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-purple-400/80">
                  Research PDF File
                </label>
                {selectedMedia ? (
                  <div className="flex items-center justify-between p-3 border border-purple-500/15 bg-white/[0.015] rounded-xl">
                    <span className="truncate text-white font-semibold max-w-[200px]">
                      {selectedMedia.file_name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="text-cyan-300 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="w-full text-center border border-dashed border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.025] py-3 rounded-xl text-purple-300 font-bold transition-all"
                  >
                    Select PDF Document
                  </button>
                )}
              </div>

              <FormSelect
                label="Workflow Status"
                name="status"
                value={formStatus}
                options={statuses}
                onChange={(e) => setFormStatus(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-4 border-t border-purple-500/15">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-purple-500/15 hover:bg-white/5 rounded-xl text-slate-300 font-semibold"
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
          onSelect={(assets) => {
            if (assets.length > 0) {
              const file = assets[0];
              if (file.mime_type !== "application/pdf" && !file.file_name.endsWith(".pdf")) {
                alert("Please select a valid PDF file. Other media types are not supported for publication downloads.");
                return;
              }
              setSelectedMedia({
                id: file.id,
                public_url: file.public_url,
                file_name: file.file_name
              });
            }
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
