"use client";

import React, { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Save, Send, X } from "lucide-react";
import { createProjectAction } from "../project-create-action";
import { FormField, FormTextarea, FormSelect } from "../components/FormFields";

interface ProjectWizardProps {
  onBack: () => void;
}

export default function ProjectWizard({ onBack }: ProjectWizardProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Unified form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    year: new Date().getFullYear().toString(),
    domain: "Geotechnical Engineering",
    status: "draft",
    description: "",
    overview: "",
    technologies: "",
    concepts: "",
    research: "",
    category: "General",
    tags: "",
    coverImage: "",
    galleryImages: "",
    githubUrl: "",
    liveUrl: "",
    researchPaperUrl: "",
    documentationUrl: "",
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-generate slug from title if not manually edited
      if (name === "title" && !slugManuallyEdited) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return next;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step === 1 && (!formData.title || !formData.slug)) {
      alert("Project Title and Slug are required.");
      return;
    }
    if (step === 2 && !formData.overview) {
      alert("Overview is required.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((prev) => prev - 1);
  };

  const handleSubmitAction = (publish: boolean) => {
    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      dataToSend.append(key, val);
    });
    // Force status depending on whether Save Draft or Publish was clicked
    dataToSend.set("status", publish ? "published" : "draft");

    startTransition(async () => {
      const res = await createProjectAction(dataToSend);
      if (res.error) {
        alert(res.error);
      } else {
        alert(publish ? "Project published successfully!" : "Draft project saved successfully!");
        onBack();
      }
    });
  };

  const domains = [
    { value: "Civil Engineering", label: "Civil Engineering" },
    { value: "Geotechnical Engineering", label: "Geotechnical Engineering" },
    { value: "Infrastructure Automation", label: "Infrastructure Automation" },
    { value: "Precision Agriculture", label: "Precision Agriculture" },
    { value: "Markets & Investing", label: "Markets & Investing" },
    { value: "Content Creation", label: "Content Creation" },
  ];

  const statuses = [
    { value: "draft", label: "Draft" },
    { value: "review", label: "Review" },
    { value: "scheduled", label: "Scheduled" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];

  return (
    <div className="space-y-6 max-w-xl font-mono text-xs select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-white hover:bg-white/5 border border-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Create New Project</h1>
            <p className="text-[10px] text-[var(--muted)]">CREATION WIZARD · STEP {step} OF 6</p>
          </div>
        </div>
      </div>

      <div className="border border-white/5 bg-[#0c0d12]/50 p-6 rounded-2xl space-y-6">
        {/* Progress bar */}
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div
            className="bg-[var(--accent-blue)] h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Step contents */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2">Step 1 — Basic Information</h3>
            <FormField label="Project Title" name="title" required defaultValue={formData.title} onChange={handleInputChange} />
            <FormField label="Slug" name="slug" required defaultValue={formData.slug} onChange={handleSlugChange} />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Release Year" name="year" type="number" required defaultValue={formData.year} onChange={handleInputChange} />
              <FormSelect label="Domain" name="domain" defaultValue={formData.domain} options={domains} onChange={handleInputChange} />
            </div>
            <FormSelect label="Workflow Status" name="status" defaultValue={formData.status} options={statuses} onChange={handleInputChange} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2">Step 2 — Description</h3>
            <FormTextarea label="Short Description" name="description" defaultValue={formData.description} placeholder="A short 1-2 sentence description..." onChange={handleInputChange} />
            <FormTextarea label="Detailed Overview" name="overview" required defaultValue={formData.overview} placeholder="A comprehensive engineering overview of the system..." rows={5} onChange={handleInputChange} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2">Step 3 — Technical Information</h3>
            <p className="text-[10px] text-[var(--muted)] mb-2">Separate multiple items with commas.</p>
            <FormField label="Technologies" name="technologies" defaultValue={formData.technologies} placeholder="Python, ESP32, React, MQTT" onChange={handleInputChange} />
            <FormField label="Engineering Concepts" name="concepts" defaultValue={formData.concepts} placeholder="Telemetry, Compaction Analysis, Soil Mechanics" onChange={handleInputChange} />
            <FormField label="Research Areas" name="research" defaultValue={formData.research} placeholder="IoT Sensors, Machine Learning" onChange={handleInputChange} />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category" name="category" defaultValue={formData.category} onChange={handleInputChange} />
              <FormField label="Tags" name="tags" defaultValue={formData.tags} placeholder="featured, iot, dashboard" onChange={handleInputChange} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2">Step 4 — Images</h3>
            <FormField label="Cover Image URL" name="coverImage" defaultValue={formData.coverImage} placeholder="https://example.com/cover.jpg" onChange={handleInputChange} />
            <FormField label="Gallery Images (comma separated URLs)" name="galleryImages" defaultValue={formData.galleryImages} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" onChange={handleInputChange} />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2">Step 5 — Links</h3>
            <FormField label="GitHub Repository" name="githubUrl" defaultValue={formData.githubUrl} placeholder="https://github.com/..." onChange={handleInputChange} />
            <FormField label="Live Demo URL" name="liveUrl" defaultValue={formData.liveUrl} placeholder="https://..." onChange={handleInputChange} />
            <FormField label="Research Paper URL" name="researchPaperUrl" defaultValue={formData.researchPaperUrl} placeholder="https://..." onChange={handleInputChange} />
            <FormField label="Documentation URL" name="documentationUrl" defaultValue={formData.documentationUrl} placeholder="https://..." onChange={handleInputChange} />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2">Step 6 — Review & Publish</h3>
            <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-3 text-[10px] text-slate-300">
              <p><strong className="text-white">Title:</strong> {formData.title}</p>
              <p><strong className="text-white">Slug:</strong> {formData.slug}</p>
              <p><strong className="text-white">Year:</strong> {formData.year} · <strong className="text-white">Domain:</strong> {formData.domain}</p>
              <p><strong className="text-white">Workflow Status:</strong> <span className="text-amber-400">{formData.status.toUpperCase()}</span></p>
              <p><strong className="text-white">Description:</strong> {formData.description || "N/A"}</p>
              <p className="truncate"><strong className="text-white">Overview:</strong> {formData.overview}</p>
              <p><strong className="text-white">Technologies:</strong> {formData.technologies || "N/A"}</p>
              <p><strong className="text-white">Cover Image:</strong> {formData.coverImage || "N/A"}</p>
              <p><strong className="text-white">Links:</strong> {formData.githubUrl || formData.liveUrl ? "Configured" : "None"}</p>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2 border border-white/5 hover:bg-white/5 rounded-xl text-slate-300 transition-all font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-4 py-2 border border-white/5 hover:bg-white/5 rounded-xl text-red-400 transition-all font-mono"
            >
              Cancel
            </button>
          )}

          {step < 6 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white transition-all font-mono ml-auto"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmitAction(false)}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 border border-white/5 hover:bg-white/5 rounded-xl text-slate-200 transition-all font-mono disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                Save Draft
              </button>
              <button
                onClick={() => handleSubmitAction(true)}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-black font-semibold rounded-xl transition-all font-mono disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Publish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
