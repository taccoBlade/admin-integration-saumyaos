"use client";

import { useState } from "react";
import { Folder, FolderOpen, File, FileCode, ChevronRight, ChevronDown, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface TreeNode {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: TreeNode[];
}

interface VisualizerProps {
  tree: TreeNode;
}

export function ArchitectureVisualizer({ tree }: VisualizerProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  if (!tree) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-white/10 rounded-2xl bg-black/20 text-slate-500 font-mono text-sm">
        <Terminal className="w-8 h-8 mb-2 opacity-50" />
        <span>No architecture tree available for this project.</span>
      </div>
    );
  }

  return (
    <div className="border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md overflow-hidden flex flex-col md:flex-row h-[500px]">
      {/* File Tree Panel */}
      <div className="w-full md:w-1/2 border-r border-white/10 p-5 overflow-y-auto select-none scrollbar-thin">
        <div className="flex items-center gap-2 mb-4 text-xs font-mono text-attention-400 border-b border-white/5 pb-2">
          <Terminal className="w-3.5 h-3.5" />
          <span>PROJECT ARCHITECTURE FILES</span>
        </div>
        <div className="space-y-1 font-mono text-sm text-slate-300">
          <FileNode node={tree} depth={0} onSelectFile={setSelectedFile} activeFile={selectedFile} />
        </div>
      </div>

      {/* Code Inspector / Blueprint Metadata Panel */}
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-black/20">
        <div>
          <div className="text-xs font-mono text-slate-500 mb-4 uppercase tracking-wider">SYSTEM INSPECTOR</div>
          {selectedFile ? (
            <motion.div
              key={selectedFile}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-attention-400 font-mono">
                <FileCode className="w-5 h-5" />
                <span className="font-semibold break-all">{selectedFile.split("/").pop()}</span>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-500">Path:</div>
                <div className="text-sm font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 break-all text-slate-300">
                  {selectedFile}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-500">Type Inferred:</div>
                <div className="text-sm font-mono text-slate-300">
                  {getFileTypeDescription(selectedFile)}
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 text-xs text-slate-500 font-mono leading-relaxed">
                This asset is part of the operational blueprint. It was ingested dynamically from the zip package and registered within the local index.
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center font-mono text-sm border border-dashed border-white/5 rounded-xl">
              <Terminal className="w-6 h-6 mb-2 opacity-30 animate-pulse text-attention-500" />
              <span>Select a file node to inspect its telemetry data.</span>
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>STATUS: SECURE_LINK</span>
          <span>SYS_REV: v2.1.0</span>
        </div>
      </div>
    </div>
  );
}

function FileNode({
  node,
  depth,
  onSelectFile,
  activeFile
}: {
  node: TreeNode;
  depth: number;
  onSelectFile: (path: string) => void;
  activeFile: string | null;
}) {
  const [isOpen, setIsOpen] = useState(depth === 0); // Open the root by default
  const isDirectory = node.type === "directory";

  const handleToggle = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node.path);
    }
  };

  // Get file icons
  const getIcon = () => {
    if (isDirectory) {
      return isOpen ? (
        <FolderOpen className="w-4 h-4 text-attention-400 flex-shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-attention-500/80 flex-shrink-0" />
      );
    }
    const ext = node.name.split(".").pop()?.toLowerCase();
    if (["ts", "tsx", "js", "jsx"].includes(ext || "")) {
      return <FileCode className="w-4 h-4 text-attention-400 flex-shrink-0" />;
    }
    if (["py", "ipynb"].includes(ext || "")) {
      return <FileCode className="w-4 h-4 text-attention-400 flex-shrink-0" />;
    }
    return <File className="w-4 h-4 text-slate-400 flex-shrink-0" />;
  };

  const isActive = activeFile === node.path && !isDirectory;

  return (
    <div>
      <div
        onClick={handleToggle}
        style={{ paddingLeft: `${depth * 16}px` }}
        className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition-colors group ${
          isActive 
            ? "bg-attention-500/10 text-attention-300 border border-attention-500/20" 
            : "hover:bg-white/5 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isDirectory && (
            <span>
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </span>
          )}
          {!isDirectory && <span className="w-3.5" />}
          {getIcon()}
          <span className="truncate break-all">{node.name}</span>
        </div>
      </div>

      <AnimatePresence>
        {isDirectory && isOpen && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child, idx) => (
              <FileNode
                key={`${child.path}-${idx}`}
                node={child}
                depth={depth + 1}
                onSelectFile={onSelectFile}
                activeFile={activeFile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getFileTypeDescription(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    // Web technologies
    case "tsx":
      return "React TypeScript Component (Client/Server View)";
    case "ts":
      return "TypeScript Module / Configuration Logic";
    case "jsx":
      return "React Component File";
    case "js":
      return "JavaScript File";
    case "css":
      return "Cascading Style Sheets (CSS Design System)";
    case "json":
      return "Structured Configuration / Data Asset";
    // Python/Data science
    case "py":
      return "Python Script (Automation / Machine Learning Engine)";
    case "ipynb":
      return "Jupyter Notebook (Experimental Analytics Sandbox)";
    case "txt":
      if (filename.endsWith("requirements.txt")) return "Python Environment Dependencies Config";
      return "Plain Text / Environment Log Entry";
    // Materials / Civil / Hardware
    case "ino":
      return "Arduino / ESP32 Microcontroller Source Code";
    case "cpp":
    case "h":
      return "C/C++ Source / Header (Low-level Hardware Telemetry)";
    // Documents
    case "md":
      return "Markdown Documentation File";
    case "pdf":
      return "Portable Document Format (Engineering Report)";
    default:
      return "Unclassified System Asset File";
  }
}
