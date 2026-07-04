"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Calendar, Plus, Edit2, Trash2, AlertTriangle, X, Link2 } from "lucide-react";
import { getTimelineEventsAction, createTimelineEventAction, updateTimelineEventAction, deleteTimelineEventAction } from "../timeline-actions";
import { FormField, FormTextarea, FormSelect } from "../components/FormFields";

interface ProjectItem {
  id: string;
  title: string;
}

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string | null;
  type: string;
  related_project_id: string | null;
  status: string;
  sort_order: number | null;
}

interface TimelineViewProps {
  projects?: ProjectItem[];
}

export default function TimelineView({ projects = [] }: TimelineViewProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  // Form State
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState("Experience");
  const [formStatus, setFormStatus] = useState("draft");
  const [formRelatedProject, setFormRelatedProject] = useState("");

  const fetchEvents = async () => {
    setIsLoading(true);
    const res = await getTimelineEventsAction();
    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.events) {
      setEvents(res.events);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormYear(new Date().getFullYear().toString());
    setFormTitle("");
    setFormDescription("");
    setFormType("Experience");
    setFormStatus("draft");
    setFormRelatedProject("");
    setModalOpen(true);
  };

  const openEditModal = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormYear(event.year.toString());
    setFormTitle(event.title);
    setFormDescription(event.description || "");
    setFormType(event.type);
    setFormStatus(event.status);
    setFormRelatedProject(event.related_project_id || "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formYear) {
      alert("Title and Year are required.");
      return;
    }

    const formData = new FormData();
    formData.set("year", formYear);
    formData.set("title", formTitle);
    formData.set("description", formDescription);
    formData.set("type", formType);
    formData.set("status", formStatus);
    formData.set("relatedProjectId", formRelatedProject);

    startTransition(async () => {
      let res;
      if (editingEvent) {
        res = await updateTimelineEventAction(editingEvent.id, formData);
      } else {
        res = await createTimelineEventAction(formData);
      }

      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        setModalOpen(false);
        fetchEvents();
      }
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteTimelineEventAction(id);
      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        fetchEvents();
      }
    });
  };

  const types = [
    { value: "Experience", label: "Experience (Career)" },
    { value: "Education", label: "Education (Academic)" },
    { value: "Project", label: "Project Launch" },
    { value: "Research", label: "Research Publication" }
  ];

  const statuses = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" }
  ];

  const projectOptions = [
    { value: "", label: "No Related Project" },
    ...projects.map((p) => ({ value: p.id, label: p.title }))
  ];

  return (
    <div className="space-y-8 font-mono select-none text-xs">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="admin-section-title">Workspace registry</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Timeline</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Event
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
            <Calendar className="h-4 w-4 text-cyan-300" />
            <span className="admin-section-title">Timeline milestones</span>
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
            {events.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-500">Loading timeline events...</div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025]">
              <Calendar className="h-5 w-5 text-slate-500" />
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-slate-500">
              No timeline events found in the database. Add career milestones or education history above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.01] text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3 font-semibold w-24">Year</th>
                  <th className="px-6 py-3 font-semibold w-36">Type</th>
                  <th className="px-6 py-3 font-semibold">Title</th>
                  <th className="px-6 py-3 font-semibold text-center w-24">Status</th>
                  <th className="px-6 py-3 font-semibold text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.015] transition-all">
                    <td className="px-6 py-4 font-bold text-cyan-300">{event.year}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                        event.type === "Experience"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : event.type === "Education"
                          ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                          : event.type === "Research"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      <div className="space-y-1">
                        <p className="font-semibold">{event.title}</p>
                        {event.description && (
                          <p className="text-[10px] text-slate-450 line-clamp-1">{event.description}</p>
                        )}
                        {event.related_project_id && (
                          <div className="flex items-center gap-1 text-[9px] text-cyan-400">
                            <Link2 className="w-3 h-3" />
                            <span>Linked to project profile</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-semibold border ${
                        event.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : event.status === "archived"
                          ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {event.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
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
                {editingEvent ? "Edit Timeline Event" : "Add Timeline Event"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <FormField
                    label="Year"
                    name="year"
                    type="number"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <FormSelect
                    label="Type"
                    name="type"
                    value={formType}
                    options={types}
                    onChange={(e) => setFormType(e.target.value)}
                  />
                </div>
              </div>

              <FormField
                label="Event Title / Role"
                name="title"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Master of Technology or Lead Engineer"
              />

              <FormTextarea
                label="Description"
                name="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Details about achievements, courses, or roles..."
                rows={4}
              />

              <FormSelect
                label="Linked Project"
                name="relatedProject"
                value={formRelatedProject}
                options={projectOptions}
                onChange={(e) => setFormRelatedProject(e.target.value)}
              />

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
    </div>
  );
}
