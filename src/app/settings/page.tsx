"use client";

import React, { useState } from "react";
import {
  Settings,
  Database,
  Download,
  Upload,
  HardDrive,
  FileJson,
  FileSpreadsheet,
  ShieldCheck,
  Terminal,
  Sun,
  Moon,
  CheckCircle2,
} from "lucide-react";
import { useProject, useTheme } from "@/components/providers";
import { apiService, resolveApiUrl } from "@/lib/api-service";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { refreshProjects } = useProject();

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const payload = Array.isArray(parsed) ? parsed : [parsed];
      const data = await apiService.backup.restore(payload);

      setImportResult(`Successfully imported ${data.restoredCount} project(s)!`);
      refreshProjects();
    } catch (err: any) {
      setImportResult(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <span>System Settings & Data Persistence</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Manage local SQLite storage, export engineering archives, database backups, and interface preferences.
        </p>
      </div>

      {/* Local Persistence Status */}
      <div className="mono-card p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 shadow-xs">
          <HardDrive className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Local SQLite Engine
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              100% OFFLINE & PERSISTENT
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            All projects, development phases, tasks, checklist items, engineering notes, and product release gate history are stored locally in <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">dev.db</code>. No external cloud account or third-party paid service is needed.
          </p>
        </div>
      </div>

      {/* Backup & Export Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Database Backup & Restore */}
        <div className="mono-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              SQLite Database Backup
            </h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Directly download the binary <code className="font-mono text-zinc-900 dark:text-zinc-100">dev.db</code> file. Keep regular backups of your personal engineering tracker.
          </p>

          <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
            <a
              href={resolveApiUrl("/api/backup")}
              download
              className="btn-primary flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download dev.db Copy
            </a>

            <label className="btn-secondary flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md cursor-pointer transition-colors shadow-xs">
              <Upload className="w-4 h-4" />
              <span>{importing ? "Importing..." : "Restore JSON"}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>

          {importResult && (
            <div className="p-3 rounded-md text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono">
              {importResult}
            </div>
          )}
        </div>

        {/* Data Exports */}
        <div className="mono-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Data Exports & Audit Reports
            </h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Export structured engineering data as JSON archives or spreadsheet-ready CSV tables for design reviews.
          </p>

          <div className="space-y-2 pt-1">
            <a
              href={resolveApiUrl("/api/export")}
              download
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:border-black dark:hover:border-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                All Projects JSON Archive
              </span>
              <Download className="w-3.5 h-3.5 text-zinc-500" />
            </a>

            <a
              href={resolveApiUrl("/api/export?format=csv_gates")}
              download
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:border-black dark:hover:border-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Release Gate Checklists & Failures (CSV)
              </span>
              <Download className="w-3.5 h-3.5 text-zinc-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Interface Theme Preference */}
      <div className="mono-card p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Display Appearance
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Switch between clean monochrome light mode and sleek engineering dark theme.
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="btn-secondary flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold cursor-pointer shadow-xs"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4" />
              <span>Dark Theme Active (Switch to Light)</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span>Light Theme Active (Switch to Dark)</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Admin Reference */}
      <div className="mono-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Terminal Admin Commands
          </h2>
        </div>

        <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
          <p>
            You can manage, backup, or restore the database directly in PowerShell or bash:
          </p>

          <div className="space-y-2 font-mono text-[11px]">
            <div>
              <div className="text-zinc-500 mb-1"># Backup SQLite database:</div>
              <pre className="p-2.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                Copy-Item dev.db dev_backup.db
              </pre>
            </div>

            <div>
              <div className="text-zinc-500 mb-1"># Run database migrations:</div>
              <pre className="p-2.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                npm run db:migrate
              </pre>
            </div>

            <div>
              <div className="text-zinc-500 mb-1"># Seed initial example embedded projects:</div>
              <pre className="p-2.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                npm run seed
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
