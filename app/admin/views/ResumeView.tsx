"use client";

import React, { useState, useEffect, useTransition } from "react";
import { FileText, Plus, Check, Star, Trash2, AlertTriangle, X, Eye } from "lucide-react";
import { getResumeVersionsAction, createResumeVersionAction, updateResumeVersionAction, deleteResumeVersionAction, setCurrentResumeVersionAction } from "../resume-actions";
import { FormField, FormSelect } from "../components/FormFields";
import MediaPicker from "../components/MediaPicker";

interface MediaAsset {
  id: string;
  public_url: string;
  file_name: string;
  file_size_bytes?: number;
}

interface ResumeVersion {
  id: string;
  version_string: string;
  file_media_id: string;
  is_current: boolean;
  status: string;
  created_at: string;
  media_assets?: MediaAsset | null;
}

export default function ResumeView() {
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<ResumeVersion | null>(null);

  // Form State
  const [formVersionString, setFormVersionString] = useState("");
  const [formStatus, setFormStatus] = useState("draft");
  const [formIsCurrent, setFormIsCurrent] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);

  const fetchResumes = async () => {
    setIsLoading(true);
    const res = await getResumeVersionsAction();
    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.resumes) {
      setResumes(res.resumes);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const openCreateModal = () => {
    setEditingResume(null);
    setFormVersionString(`v${new Date().getFullYear()}.${(new Date().getMonth() + 1).toString().padStart(2, "0")}`);
    setFormStatus("draft");
    setFormIsCurrent(false);
    setSelectedMedia(null);
    setModalOpen(true);
  };

  const openEditModal = (resume: ResumeVersion) => {
    setEditingResume(resume);
    setFormVersionString(resume.version_string);
    setFormStatus(resume.status);
    setFormIsCurrent(resume.is_current);
    setSelectedMedia(resume.media_assets || null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVersionString) {
      alert("Version string is required.");
      return;
    }
    if (!selectedMedia) {
      alert("Please select a PDF document from the Media Library.");
      return;
    }

    startTransition(async () => {
      let res;
      if (editingResume) {
        res = await updateResumeVersionAction(
          editingResume.id,
          formVersionString,
          selectedMedia.id,
          formIsCurrent,
          formStatus
        );
      } else {
        res = await createResumeVersionAction(
          formVersionString,
          selectedMedia.id,
          formIsCurrent,
          formStatus
        );
      }

      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        setModalOpen(false);
        fetchResumes();
      }
    });
  };

  const handleMakeCurrent = async (id: string) => {
    startTransition(async () => {
      const res = await setCurrentResumeVersionAction(id);
      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        fetchResumes();
      }
    });
  };

  const handleDelete = async (id: string, ver: string) => {
    if (!confirm(`Are you sure you want to delete resume version "${ver}"?`)) return;

    startTransition(async () => {
      const res = await deleteResumeVersionAction(id);
      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        fetchResumes();
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
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="admin-section-title">Workspace registry</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Resume</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Version
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
            <FileText className="h-4 w-4 text-cyan-300" />
            <span className="admin-section-title">Resume index</span>
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
            {resumes.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-500">Loading resume registry...</div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025]">
              <FileText className="h-5 w-5 text-slate-500" />
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-slate-500">
              No resumes found in the database. Link your PDF files from the media library to activate.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.01] text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3 font-semibold w-32">Version</th>
                  <th className="px-6 py-3 font-semibold">Attached Document</th>
                  <th className="px-6 py-3 font-semibold text-center w-24">Active</th>
                  <th className="px-6 py-3 font-semibold text-center w-24">Status</th>
                  <th className="px-6 py-3 font-semibold text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {resumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-white/[0.015] transition-all">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-1.5">
                      {resume.version_string}
                      {resume.is_current && <Star className="w-3.5 h-3.5 fill-cyan-300 text-cyan-300" />}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200 block truncate max-w-md">
                          {resume.media_assets?.file_name || "Unknown PDF Document"}
                        </span>
                        {resume.media_assets?.file_size_bytes && (
                          <span className="text-[10px] text-slate-500">
                            {(resume.media_assets.file_size_bytes / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {resume.is_current ? (
                        <span className="inline-flex rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-500/20">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMakeCurrent(resume.id)}
                          className="hover:underline text-cyan-300 font-semibold"
                        >
                          Make Active
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-semibold border ${
                        resume.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : resume.status === "archived"
                          ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {resume.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {resume.media_assets?.public_url && (
                          <a
                            href={resume.media_assets.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(resume)}
                          className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-all"
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
                          onClick={() => handleDelete(resume.id, resume.version_string)}
                          className="p-1.5 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400 transition-all"
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
          <div className="w-full max-w-md border border-white/5 bg-[#0c0d12] rounded-3xl p-6 flex flex-col justify-between font-mono text-xs text-slate-350 select-none shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="text-sm font-bold text-white uppercase">
                {editingResume ? "Edit Resume" : "Add Resume Version"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <FormField
                label="Version Identifier"
                name="version"
                required
                value={formVersionString}
                onChange={(e) => setFormVersionString(e.target.value)}
                placeholder="e.g. v2026.07 or v4.2"
              />

              {/* Document Picker */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  PDF DOCUMENT <span className="text-red-400">*</span>
                </label>
                {selectedMedia ? (
                  <div className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.015] rounded-xl">
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
                    className="w-full text-center border border-dashed border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.025] py-4 rounded-xl text-slate-400 font-bold transition-all"
                  >
                    Select PDF from Media Library
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="current"
                  checked={formIsCurrent}
                  onChange={(e) => setFormIsCurrent(e.target.checked)}
                  className="rounded border-white/15 bg-white/5 text-cyan-300 focus:ring-cyan-300 focus:ring-opacity-20 cursor-pointer w-4 h-4"
                />
                <label htmlFor="current" className="text-slate-350 cursor-pointer font-bold select-none uppercase tracking-wider text-[10px]">
                  Set as Active Current Resume version
                </label>
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
          onSelect={(assets) => {
            if (assets.length > 0) {
              const file = assets[0];
              if (file.mime_type !== "application/pdf" && !file.file_name.endsWith(".pdf")) {
                alert("Please select a valid PDF file. Other media types are not supported for resumes.");
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
