"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Wrench, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { getSkillsAction, createSkillAction, updateSkillAction, deleteSkillAction } from "../skills-actions";
import { FormField, FormTextarea, FormSelect } from "../components/FormFields";

interface SkillItem {
  id: string;
  slug: string;
  name: string;
  base_strength: number;
  display_strength: number;
  featured: boolean;
  sort_order: number;
  status: string;
  taxonomy_terms?: {
    id: string;
    name: string;
  } | null;
}

export default function SkillsView() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Core Engineering");
  const [formStrength, setFormStrength] = useState("5");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState("draft");
  const [formSortOrder, setFormSortOrder] = useState("0");

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const fetchSkills = async () => {
    setIsLoading(true);
    const res = await getSkillsAction();
    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.skills) {
      setSkills(res.skills);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openCreateModal = () => {
    setEditingSkill(null);
    setFormName("");
    setFormSlug("");
    setFormCategory("Core Engineering");
    setFormStrength("5");
    setFormFeatured(false);
    setFormStatus("draft");
    setFormSortOrder("0");
    setSlugManuallyEdited(false);
    setModalOpen(true);
  };

  const openEditModal = (skill: SkillItem) => {
    setEditingSkill(skill);
    setFormName(skill.name);
    setFormSlug(skill.slug);
    setFormCategory(skill.taxonomy_terms?.name || "Core Engineering");
    setFormStrength(skill.base_strength.toString());
    setFormFeatured(skill.featured);
    setFormStatus(skill.status);
    setFormSortOrder(skill.sort_order.toString());
    setSlugManuallyEdited(true);
    setModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (!slugManuallyEdited) {
      setFormSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSlug) {
      alert("Name and Slug are required.");
      return;
    }

    const formData = new FormData();
    formData.set("name", formName);
    formData.set("slug", formSlug);
    formData.set("category", formCategory);
    formData.set("baseStrength", formStrength);
    formData.set("displayStrength", formStrength);
    formData.set("featured", formFeatured ? "true" : "false");
    formData.set("status", formStatus);
    formData.set("sortOrder", formSortOrder);

    startTransition(async () => {
      let res;
      if (editingSkill) {
        res = await updateSkillAction(editingSkill.id, formData);
      } else {
        res = await createSkillAction(formData);
      }

      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        setModalOpen(false);
        fetchSkills();
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    startTransition(async () => {
      const res = await deleteSkillAction(id);
      if (res.error) {
        alert(`Error: ${res.error}`);
      } else {
        fetchSkills();
      }
    });
  };

  const categories = [
    { value: "Core Engineering", label: "Core Engineering" },
    { value: "Technical Tools", label: "Technical Tools" },
    { value: "Programming", label: "Programming" },
    { value: "Creative", label: "Creative" },
    { value: "Research", label: "Research" }
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
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Skills</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Skill
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
            <Wrench className="h-4 w-4 text-cyan-300" />
            <span className="admin-section-title">Skills inventory</span>
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
            {skills.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-500">Loading skills registry...</div>
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025]">
              <Wrench className="h-5 w-5 text-slate-500" />
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-slate-500">
              No skills found in the database. Add technical or engineering skills using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.01] text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold text-center">Strength</th>
                  <th className="px-6 py-3 font-semibold text-center">Featured</th>
                  <th className="px-6 py-3 font-semibold text-center">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-white/[0.015] transition-all">
                    <td className="px-6 py-4 font-semibold text-white">{skill.name}</td>
                    <td className="px-6 py-4 text-slate-400">{skill.taxonomy_terms?.name || "Core Engineering"}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-cyan-300 font-bold">{skill.base_strength}</span>
                        <span className="text-slate-600">/10</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {skill.featured ? (
                        <span className="inline-flex rounded-full bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-500/20">
                          Yes
                        </span>
                      ) : (
                        <span className="text-slate-650">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-semibold border ${
                        skill.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : skill.status === "archived"
                          ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {skill.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(skill)}
                          className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id, skill.name)}
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
                {editingSkill ? "Edit Skill" : "Add New Skill"}
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
                label="Skill Name"
                name="name"
                required
                value={formName}
                onChange={handleNameChange}
                placeholder="e.g. Concrete Technology"
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

              <FormSelect
                label="Category"
                name="category"
                value={formCategory}
                options={categories}
                onChange={(e) => setFormCategory(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                    Strength: <span className="text-cyan-300 font-bold">{formStrength}/10</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formStrength}
                    onChange={(e) => setFormStrength(e.target.value)}
                    className="w-full h-1.5 bg-white/5 border border-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-300"
                  />
                </div>
                <FormField
                  label="Sort Order"
                  name="sortOrder"
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded border-white/15 bg-white/5 text-cyan-300 focus:ring-cyan-300 focus:ring-opacity-20 cursor-pointer w-4 h-4"
                />
                <label htmlFor="featured" className="text-slate-350 cursor-pointer font-bold select-none uppercase tracking-wider text-[10px]">
                  Featured Skill (Displays prominently)
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
    </div>
  );
}
