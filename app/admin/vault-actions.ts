"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const PUBLIC_DASHBOARDS_DIR = path.join(process.cwd(), "public", "dashboards");
const BACKUPS_DIR = path.join(PUBLIC_DASHBOARDS_DIR, "_backups");

async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function copyDir(src: string, dest: string) {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "_backups") continue; // Don't copy backups into backups
    
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export async function getVaultDashboardsAction() {
  try {
    await ensureDir(PUBLIC_DASHBOARDS_DIR);
    const entries = await fs.readdir(PUBLIC_DASHBOARDS_DIR, { withFileTypes: true });
    
    const dashboards = entries
      .filter(entry => entry.isDirectory() && entry.name !== "_backups")
      .map(entry => entry.name);
      
    return dashboards;
  } catch (err) {
    console.error("Failed to read dashboards directory", err);
    return [];
  }
}

export async function getVaultVersionsAction(dashboardId: string) {
  try {
    const dashboardBackupsDir = path.join(BACKUPS_DIR, dashboardId);
    await ensureDir(dashboardBackupsDir);
    
    const entries = await fs.readdir(dashboardBackupsDir, { withFileTypes: true });
    const versions = entries
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        timestamp: entry.name,
        date: new Date(parseInt(entry.name)).toLocaleString()
      }))
      .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp)); // Newest first
      
    return versions;
  } catch (err) {
    console.error("Failed to read backups directory", err);
    return [];
  }
}

export async function uploadVaultVersionAction(dashboardId: string, formData: FormData) {
  try {
    const liveDir = path.join(PUBLIC_DASHBOARDS_DIR, dashboardId);
    const timestamp = Date.now().toString();
    const backupDir = path.join(BACKUPS_DIR, dashboardId, timestamp);
    
    // 1. Ensure live dir exists
    await ensureDir(liveDir);
    
    // 2. Backup current live dir
    try {
      await copyDir(liveDir, backupDir);
    } catch (err) {
      console.warn("Could not backup (maybe empty directory)", err);
    }

    // 3. Write uploaded files
    const fileEntries = Array.from(formData.entries());
    for (const [key, value] of fileEntries) {
      if (key.startsWith("file_") && value instanceof File) {
        // The path relative to the dashboard root (e.g. "index.html" or "css/style.css")
        const relativePath = formData.get(`path_${key}`) as string;
        if (!relativePath) continue;

        const destPath = path.join(liveDir, relativePath);
        
        // Ensure parent directories exist
        await ensureDir(path.dirname(destPath));
        
        // Write file
        const buffer = Buffer.from(await value.arrayBuffer());
        await fs.writeFile(destPath, buffer);
      }
    }
    
    return { success: true, timestamp };
  } catch (err: any) {
    console.error("Upload failed", err);
    return { error: err.message || "Failed to upload new version" };
  }
}

export async function restoreVaultVersionAction(dashboardId: string, backupTimestamp: string) {
  try {
    const liveDir = path.join(PUBLIC_DASHBOARDS_DIR, dashboardId);
    const backupToRestore = path.join(BACKUPS_DIR, dashboardId, backupTimestamp);
    
    // 1. Verify backup exists
    try {
      await fs.access(backupToRestore);
    } catch {
      return { error: "Backup version not found" };
    }
    
    // 2. Backup current live state before restoring (safety net)
    const newTimestamp = Date.now().toString();
    const safetyBackupDir = path.join(BACKUPS_DIR, dashboardId, `auto_${newTimestamp}`);
    try {
      await copyDir(liveDir, safetyBackupDir);
    } catch (err) {
      console.warn("Could not create safety backup", err);
    }
    
    // 3. Clear live directory (delete all contents)
    const liveEntries = await fs.readdir(liveDir, { withFileTypes: true });
    for (const entry of liveEntries) {
      const entryPath = path.join(liveDir, entry.name);
      await fs.rm(entryPath, { recursive: true, force: true });
    }
    
    // 4. Copy backup to live
    await copyDir(backupToRestore, liveDir);
    
    return { success: true };
  } catch (err: any) {
    console.error("Restore failed", err);
    return { error: err.message || "Failed to restore version" };
  }
}
