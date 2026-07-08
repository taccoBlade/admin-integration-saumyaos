"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, UploadCloud, FolderGit2, History, RotateCcw, 
  CheckCircle2, AlertCircle, FileCode2, Search, ArrowLeft
} from "lucide-react";
import { 
  getVaultDashboardsAction, 
  getVaultVersionsAction, 
  uploadVaultVersionAction, 
  restoreVaultVersionAction 
} from "../vault-actions";

export default function VaultView() {
  const [dashboards, setDashboards] = useState<string[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);
  
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [search, setSearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDashboards();
  }, []);

  useEffect(() => {
    if (selectedDashboard) {
      loadVersions(selectedDashboard);
    }
  }, [selectedDashboard]);

  async function loadDashboards() {
    setLoading(true);
    const res = await getVaultDashboardsAction();
    setDashboards(res);
    setLoading(false);
  }

  async function loadVersions(dashboard: string) {
    const res = await getVaultVersionsAction(dashboard);
    setVersions(res);
  }

  const handleUploadFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedDashboard) return;

    setUploading(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Typecast for standard webkitRelativePath
      const relativePath = (file as any).webkitRelativePath; 
      if (relativePath) {
        // webkitRelativePath usually starts with the top level folder name (e.g. "my-folder/index.html")
        // We want to strip the top-level folder name so we deploy exactly the contents inside the folder.
        const pathParts = relativePath.split('/');
        pathParts.shift(); // Remove top level folder name
        const cleanPath = pathParts.join('/');
        
        if (cleanPath) {
          formData.append(`file_${i}`, file);
          formData.append(`path_file_${i}`, cleanPath);
        }
      }
    }

    try {
      const result = await uploadVaultVersionAction(selectedDashboard, formData);
      if (result.error) {
        alert(result.error);
      } else {
        alert("New version uploaded and deployed successfully! Previous version was backed up.");
        await loadVersions(selectedDashboard);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRestore = async (timestamp: string) => {
    if (!selectedDashboard) return;
    if (!confirm("Are you sure you want to restore this version? The current live version will be overwritten (but automatically backed up).")) return;

    setRestoring(true);
    try {
      const result = await restoreVaultVersionAction(selectedDashboard, timestamp);
      if (result.error) {
        alert(result.error);
      } else {
        alert("Version restored successfully!");
        await loadVersions(selectedDashboard);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to restore version.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-white sm:text-3xl flex items-center gap-3">
            <Terminal className="w-8 h-8 text-cyan-400" />
            Code Vault
          </h2>
          <p className="mt-2 text-sm text-cyan-300/70">
            Version control for static mockups and Terminal Vault dashboards.
          </p>
        </div>
        
        {!selectedDashboard && (
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search dashboards..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 bg-white/[0.02] border border-cyan-500/20 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {!selectedDashboard ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {loading && <div className="text-cyan-400 font-mono">Loading codebases...</div>}
            {!loading && dashboards.length === 0 && (
              <div className="col-span-full p-12 border border-dashed border-cyan-500/30 rounded-xl text-center text-cyan-400">
                No dashboards found in public/dashboards.
              </div>
            )}
            
            {dashboards.filter(d => d.includes(search)).map(dashboard => (
              <div 
                key={dashboard}
                onClick={() => setSelectedDashboard(dashboard)}
                className="group cursor-pointer rounded-xl border border-cyan-500/20 bg-white/[0.02] p-5 hover:border-cyan-500/40 hover:bg-white/[0.04] transition-all relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-500/10 blur-2xl rounded-full translate-x-8 -translate-y-8" />
                <div className="flex justify-between items-start mb-4">
                  <FolderGit2 className="w-6 h-6 text-cyan-500/70 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1 truncate">{dashboard}</h3>
                <p className="text-xs font-mono text-cyan-400 truncate">/public/dashboards/{dashboard}</p>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedDashboard(null)}
                className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors border border-transparent hover:border-cyan-500/20 text-cyan-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-medium text-white font-mono">{selectedDashboard}</h3>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Upload Panel */}
              <div className="lg:col-span-1 space-y-4">
                <div className="border border-cyan-500/20 bg-[#0a0514] rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-50" />
                  
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-cyan-400" /> New Iteration
                  </h4>
                  <p className="text-xs text-cyan-100/60 mb-6 leading-relaxed">
                    Upload a new version of this dashboard. Missing files will be added, existing files will be replaced, and the current codebase will be backed up.
                  </p>
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleUploadFolder}
                      disabled={uploading}
                      // @ts-ignore - webkitdirectory is non-standard but widely supported
                      webkitdirectory="true" 
                      directory="true"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed ${uploading ? 'border-orange-500/50 bg-orange-500/5' : 'border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10'} rounded-xl transition-colors`}>
                      {uploading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mb-2" />
                          <span className="text-xs font-mono text-orange-400 font-bold">Uploading & Replacing...</span>
                        </>
                      ) : (
                        <>
                          <FolderGit2 className="w-8 h-8 text-cyan-400 mb-2" />
                          <span className="text-xs font-mono text-cyan-300 font-bold">Select Updated Folder</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-[11px] text-emerald-200/70">
                    Live changes are applied instantly. Static files are served directly from Next.js public directory.
                  </p>
                </div>
              </div>

              {/* Version History Panel */}
              <div className="lg:col-span-2 border border-purple-500/20 bg-white/[0.02] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6 border-b border-purple-500/10 pb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-400" /> Version History
                  </h4>
                  <button onClick={() => loadVersions(selectedDashboard)} className="text-xs text-purple-400 hover:text-white">Refresh</button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                  {versions.length === 0 && (
                    <div className="text-center p-8 text-purple-300/50 text-sm font-mono border border-dashed border-purple-500/20 rounded-xl">
                      No backups found. Upload a new version to create the first backup.
                    </div>
                  )}
                  {versions.map((v, i) => (
                    <div key={v.timestamp} className="flex items-center justify-between p-4 bg-black/40 border border-purple-500/10 rounded-xl hover:border-purple-500/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                          <FileCode2 className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {i === 0 ? "Previous Version" : `Backup ${versions.length - i}`}
                            {v.timestamp.startsWith('auto_') && <span className="ml-2 text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">Auto Safety Backup</span>}
                          </p>
                          <p className="text-xs font-mono text-purple-400 mt-0.5">{v.date}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRestore(v.timestamp)}
                        disabled={restoring}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded text-xs font-mono transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
