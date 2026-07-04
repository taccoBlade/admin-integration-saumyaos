"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowLeft, ArrowRight, Check, X, Edit, Send } from "lucide-react";
import { AIService } from "@/lib/ai-service";

interface AIAssistantPanelProps {
  context: Record<string, unknown>;
  onApplyField: (field: string, value: string) => void;
  onClose?: () => void;
}

export default function AIAssistantPanel({ context, onApplyField, onClose }: AIAssistantPanelProps) {
  const [activeField, setActiveField] = useState("overview");
  const [customPrompt, setCustomPrompt] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Suggestion History
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // In-place edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleAction = async (templateType: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setSuggestion("");
    setIsEditing(false);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    const targetVal = String(context[activeField] || "");
    let prompt = "";
    const systemInstruction = "You are the AI Editorial Assistant for Saumya's Portfolio CMS (SAUMYA.OS). Return only the refined content with no conversational introductions.";

    switch (templateType) {
      case "recruiter":
        prompt = `Rewrite this ${activeField} to highlight technical skills, engineering accomplishments, and details that appeal directly to engineering recruiters:\n\n${targetVal}`;
        break;
      case "technical":
        prompt = `Make this ${activeField} highly technical, emphasizing engineering concepts, specifications, and architecture:\n\n${targetVal}`;
        break;
      case "academic":
        prompt = `Rewrite this ${activeField} in a scholarly, academic tone focusing on methodology and research principles:\n\n${targetVal}`;
        break;
      case "investor":
        prompt = `Rewrite this ${activeField} to highlight metrics, cost-efficiency, project outcomes, and business impact:\n\n${targetVal}`;
        break;
      case "short":
        prompt = `Shorten this ${activeField} to a concise 1-2 sentence executive summary:\n\n${targetVal}`;
        break;
      case "long":
        prompt = `Expand this ${activeField} to add comprehensive technical details and engineering specifications:\n\n${targetVal}`;
        break;
      case "grammar":
        prompt = `Fix any spelling, grammar, or phrasing errors in this ${activeField} while keeping its original meaning and style:\n\n${targetVal}`;
        break;
      case "tags":
        prompt = `Analyze this project (Title: ${context.title}, Overview: ${context.overview}) and suggest 5-8 relevant comma-separated tags. Reuse existing tags where possible. Return only comma-separated values:`;
        break;
      case "seo":
        prompt = `Generate an optimized SEO title and meta description (max 160 characters) for this project:\nTitle: ${context.title}\nDescription: ${context.description}`;
        break;
      case "alt_text":
        prompt = `Generate a descriptive accessibility alt text (max 100 characters) for an image associated with this field or context:\nTitle: ${context.title}\nDescription: ${context.description}`;
        break;
      case "layout":
        prompt = `Based on the project (Title: ${context.title}, Description: ${context.description}), suggest a modern, premium grid layout or bento-style design pattern for displaying this content. Suggest layout sections, column spans, and visual alignment.`;
        break;
      case "typography":
        prompt = `Suggest a premium typography combination (font families, weights, letter spacing, and line heights) matching the brand and aesthetic of this project:\nTitle: ${context.title}\nDescription: ${context.description}`;
        break;
      case "case_study":
        prompt = `Build a comprehensive engineering case study structure for this project (Title: ${context.title}, Overview: ${context.overview}). Structure it with the sections: Executive Summary, Technical Architecture, Key Challenges, Computational Solutions, Validation & Testing, and Future Improvements. Make it detailed, highly analytical, and tailored to senior technical readers.`;
        break;
      case "custom":
        if (!customPrompt.trim()) return;
        prompt = `For the field "${activeField}" with current value:\n"${targetVal}"\n\nPerform this instruction: ${customPrompt}`;
        break;
    }

    let tempSuggestion = "";
    await AIService.generateStream(
      prompt,
      systemInstruction,
      {
        projectTitle: context.title,
        currentTags: context.tags,
        currentTechnologies: context.technologies,
      },
      (chunk) => {
        tempSuggestion += chunk;
        setSuggestion(tempSuggestion);
      },
      () => {
        setIsGenerating(false);
        if (tempSuggestion.trim()) {
          const nextHistory = [...history.slice(0, historyIndex + 1), tempSuggestion];
          setHistory(nextHistory);
          setHistoryIndex(nextHistory.length - 1);
        }
      },
      (err) => {
        setIsGenerating(false);
        alert(err.message);
      },
      abortControllerRef.current.signal
    );
  };

  const handleAccept = () => {
    const finalVal = isEditing ? editText : suggestion;
    if (finalVal) {
      onApplyField(activeField, finalVal);
      alert(`Applied suggestion to "${activeField}". Remember to click Save to persist changes.`);
      handleReject();
    }
  };

  const handleReject = () => {
    setSuggestion("");
    setIsEditing(false);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const handleHistoryNav = (dir: "prev" | "next") => {
    const nextIdx = dir === "prev" ? historyIndex - 1 : historyIndex + 1;
    if (nextIdx >= 0 && nextIdx < history.length) {
      setHistoryIndex(nextIdx);
      setSuggestion(history[nextIdx]);
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    setEditText(suggestion);
    setIsEditing(true);
  };

  const templates = [
    { id: "recruiter", label: "Recruiter" },
    { id: "technical", label: "Technical" },
    { id: "academic", label: "Academic" },
    { id: "investor", label: "Investor" },
    { id: "short", label: "Short" },
    { id: "long", label: "Long" },
    { id: "grammar", label: "Grammar" },
    { id: "tags", label: "Suggest Tags" },
    { id: "seo", label: "Generate SEO" },
    { id: "alt_text", label: "Generate Alt Text" },
    { id: "layout", label: "Suggest Layout" },
    { id: "typography", label: "Suggest Typography" },
    { id: "case_study", label: "Build Case Study" },
  ];

  const fieldOptions = [
    { value: "overview", label: "Detailed Overview" },
    { value: "description", label: "Short Description" },
    { value: "title", label: "Project Title" },
    { value: "technologies", label: "Technologies" },
    { value: "tags", label: "Tags" },
  ];

  return (
    <div className="w-80 bg-[#07080b] border border-white/5 rounded-3xl p-6 flex flex-col justify-between h-full font-mono text-xs text-slate-300 select-none">
      <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2 text-white font-bold">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="uppercase text-[10px]">AI Assistant</h3>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Target Field Select */}
        <div>
          <label className="block text-[10px] text-slate-500 uppercase mb-1">Target Field</label>
          <select
            value={activeField}
            onChange={(e) => {
              setActiveField(e.target.value);
              handleReject();
            }}
            className="w-full bg-[#0c0d12] border border-white/5 p-2 rounded-xl text-xs text-white"
          >
            {fieldOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Suggestion Card */}
        {suggestion && (
          <div className="border border-white/5 bg-[#0a0b0d] p-4 rounded-xl flex flex-col space-y-3 overflow-hidden shrink-0">
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <span className="text-[9px] text-slate-500 uppercase">Suggestion</span>
              {history.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={historyIndex === 0}
                    onClick={() => handleHistoryNav("prev")}
                    className="p-0.5 hover:bg-white/5 rounded disabled:opacity-30"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <span className="text-[9px] text-slate-400">{historyIndex + 1}/{history.length}</span>
                  <button
                    disabled={historyIndex === history.length - 1}
                    onClick={() => handleHistoryNav("next")}
                    className="p-0.5 hover:bg-white/5 rounded disabled:opacity-30"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/5 p-2 rounded-lg text-[10px] text-white focus:outline-none"
                rows={4}
              />
            ) : (
              <div className="max-h-36 overflow-y-auto text-[10px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                {suggestion}
                {isGenerating && <span className="inline-block w-1.5 h-3 bg-purple-400 animate-pulse ml-0.5" />}
              </div>
            )}

            {!isGenerating && (
              <div className="flex gap-1.5 pt-1.5 border-t border-white/5">
                <button
                  onClick={handleAccept}
                  className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-1 font-bold text-[10px]"
                >
                  <Check className="w-3 h-3" />
                  Accept
                </button>
                <button
                  onClick={isEditing ? () => setIsEditing(false) : startEditing}
                  className="px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 rounded-lg flex items-center justify-center gap-1 text-[10px]"
                >
                  <Edit className="w-3 h-3" />
                  {isEditing ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={handleReject}
                  className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center"
                >
                  <Trash2Icon />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Templates Grid */}
        <div className="space-y-1.5 flex-1 overflow-y-auto max-h-56">
          <label className="block text-[10px] text-slate-500 uppercase">Preset Templates</label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleAction(t.id)}
                disabled={isGenerating}
                className="py-2 px-2 border border-white/5 bg-[#0c0d12]/30 hover:bg-white/5 rounded-xl text-slate-300 hover:text-white transition-all text-left text-[10px] truncate"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Prompt Box */}
      <div className="pt-4 border-t border-white/5 space-y-2 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask AI (e.g. rewrite overview)..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAction("custom")}
            className="w-full bg-[#0c0d12] border border-white/5 py-2 pl-3 pr-9 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 text-white"
          />
          <button
            onClick={() => handleAction("custom")}
            className="absolute right-2 top-2 text-[var(--muted)] hover:text-purple-400"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Trash2Icon() {
  return <X className="w-3.5 h-3.5" />;
}
