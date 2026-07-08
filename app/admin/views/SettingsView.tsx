import React, { useState, useEffect } from "react";
import { ShieldCheck, Play, Download, CheckCircle, AlertTriangle, Palette } from "lucide-react";
import { runDiagnosticsAction, triggerBackupAction, getGlobalThemeAction, updateGlobalThemeAction } from "../settings-actions";

interface SettingsViewProps {
  displayName: string;
  email: string;
}

// Convert "212, 175, 55" to "#d4af37"
function rgbStringToHex(rgbStr: string) {
  const parts = rgbStr.split(",").map(p => parseInt(p.trim()));
  if (parts.length !== 3 || parts.some(isNaN)) return "#d4af37";
  return "#" + parts.map(p => p.toString(16).padStart(2, "0")).join("");
}

// Convert "#d4af37" to "212, 175, 55"
function hexToRgbString(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default function SettingsView({ displayName, email }: SettingsViewProps) {
  const [diagResult, setDiagResult] = useState<any>(null);
  const [diagRunning, setDiagRunning] = useState(false);
  const [backupPending, setBackupPending] = useState(false);
  
  const [themeHex, setThemeHex] = useState("#d4af37");
  const [themeSaving, setThemeSaving] = useState(false);

  useEffect(() => {
    getGlobalThemeAction().then(res => {
      if (res.theme) {
        setThemeHex(res.theme.startsWith("#") ? res.theme : rgbStringToHex(res.theme));
      }
    });
  }, []);

  const handleSaveTheme = async () => {
    setThemeSaving(true);
    // Save the hex directly to the database
    await updateGlobalThemeAction(themeHex);
    setThemeSaving(false);
    // Optionally trigger a reload or show toast
    alert("Theme saved! Refresh the page to see changes.");
  };

  const handleRunDiagnostics = async () => {
    setDiagRunning(true);
    setDiagResult(null);
    try {
      const res = await runDiagnosticsAction();
      setDiagResult(res);
    } catch (e: any) {
      setDiagResult({ success: false, error: e.message });
    } finally {
      setDiagRunning(false);
    }
  };

  const handleDownloadBackup = async () => {
    setBackupPending(true);
    try {
      const res = await triggerBackupAction();
      if (res.error) {
        alert(`Backup failed: ${res.error}`);
      } else if (res.backup) {
        const blob = new Blob([res.backup], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        a.download = `saumya_os_backup_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      alert(`Backup failed: ${e.message}`);
    } finally {
      setBackupPending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-xl font-mono text-xs select-none">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-xs text-[var(--muted)]">SYSTEM & PROFILE PARAMETERS</p>
      </div>

      <div className="border border-purple-500/15 bg-[#130a2a]/50 p-6 rounded-2xl space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-purple-500/15">
            <span className="text-[var(--muted)]">Display Name</span>
            <span className="text-purple-50">{displayName}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-purple-500/15">
            <span className="text-[var(--muted)]">Email</span>
            <span className="text-purple-50">{email}</span>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[var(--muted)]">System Release</span>
            <div className="p-4 bg-white/[0.02] border border-purple-500/15 rounded-xl space-y-1">
              <p className="text-purple-50 font-semibold">SAUMYA.OS</p>
              <p className="text-emerald-400 font-bold">v0.7</p>
              <p className="text-[var(--muted)] mt-1">Current Phase: AI Revisions & Diagnostics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Vibe Setting */}
      <div className="border border-purple-500/15 bg-[#130a2a]/50 p-6 rounded-2xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--accent-amber)]" />
            Global Vibe
          </h2>
          <p className="text-[10px] text-[var(--muted)]">SET THE ACCENT COLOR FOR THE ENTIRE OPERATING SYSTEM</p>
        </div>

        <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-purple-500/15 rounded-xl">
          <input 
            type="color" 
            value={themeHex} 
            onChange={(e) => setThemeHex(e.target.value)}
            className="w-12 h-12 rounded cursor-pointer border-0 p-0 bg-transparent"
          />
          <div className="flex flex-col flex-1">
            <span className="text-[var(--muted)]">Primary Accent Color</span>
            <span className="text-purple-50 font-bold uppercase">{themeHex}</span>
          </div>
          <button
            onClick={handleSaveTheme}
            disabled={themeSaving}
            className="px-4 py-2 bg-[var(--accent-amber)] hover:bg-[var(--accent-amber)]/90 text-black rounded-lg transition-all font-semibold disabled:opacity-50"
          >
            {themeSaving ? "Saving..." : "Save Theme"}
          </button>
        </div>
      </div>

      {/* Diagnostics & Maintenance Suite */}
      <div className="border border-purple-500/15 bg-[#130a2a]/50 p-6 rounded-2xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-white font-bold uppercase tracking-wider">Diagnostics & Maintenance</h2>
          <p className="text-[10px] text-[var(--muted)]">MANAGE CLOUD CONNECTIONS AND CONTENT BACKUPS</p>
        </div>

        <div className="space-y-4">
          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleRunDiagnostics}
              disabled={diagRunning}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-purple-500/15 text-purple-50 rounded-xl transition-all font-semibold disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              {diagRunning ? "Checking..." : "Run Diagnostics"}
            </button>
            <button
              onClick={handleDownloadBackup}
              disabled={backupPending}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-black rounded-xl transition-all font-semibold disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {backupPending ? "Packaging..." : "Backup Content"}
            </button>
          </div>

          {/* Diagnostics Display */}
          {diagResult && (
            <div className="p-4 rounded-xl border border-purple-500/15 bg-[#0e0721] space-y-3">
              <div className="flex items-center gap-2">
                {diagResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
                <span className="text-white font-bold uppercase">
                  {diagResult.success ? "System Health Nominal" : "System Alert"}
                </span>
              </div>
              <p className="text-[10px] text-slate-350">{diagResult.checks?.details || diagResult.error}</p>
              {diagResult.checks && (
                <div className="grid grid-cols-3 gap-2 text-[10px] pt-1.5 border-t border-purple-500/15">
                  <div>
                    <span className="text-[var(--muted)] block">Database:</span>
                    <span className={diagResult.checks.database ? "text-emerald-400" : "text-rose-400"}>
                      {diagResult.checks.database ? "PASS" : "FAIL"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block">Auth Status:</span>
                    <span className={diagResult.checks.auth ? "text-emerald-400" : "text-rose-400"}>
                      {diagResult.checks.auth ? "PASS" : "FAIL"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block">Storage:</span>
                    <span className={diagResult.checks.storage ? "text-emerald-400" : "text-rose-400"}>
                      {diagResult.checks.storage ? "PASS" : "FAIL"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
