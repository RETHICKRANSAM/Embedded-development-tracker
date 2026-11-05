"use client";

import React, { useState } from "react";
import {
  Settings,
  HardDrive,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  ShieldCheck,
  Sun,
  Moon,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { useProject, useTheme } from "@/components/providers";
import { storage } from "@/lib/storage";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { refreshProjects, selectedProjectId } = useProject();

  const [importing, setImporting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Export all data as JSON
  const handleExportAllJson = async () => {
    try {
      const jsonContent = await storage.backup.exportJson();
      const dateStr = new Date().toISOString().slice(0, 10);
      const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `embedded_dev_tracker_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedbackMessage({
        type: "success",
        text: "Backup exported successfully!",
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: `Export failed: ${err.message}`,
      });
    }
  };

  // Import / Restore JSON
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setFeedbackMessage(null);

    try {
      const text = await file.text();
      const result = await storage.backup.importJson(text);
      await refreshProjects();

      setFeedbackMessage({
        type: "success",
        text: `Successfully restored ${result.restoredCount} project(s) into local storage!`,
      });
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: `Restore failed: ${err.message}`,
      });
    } finally {
      setImporting(false);
      e.target.value = "";
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  // Reset to default sample projects
  const handleResetAllData = async () => {
    const confirmed = confirm(
      "Are you sure you want to reset all data?\n\nThis will restore the original demo embedded engineering projects. Any unsaved custom projects in this browser will be replaced."
    );
    if (!confirmed) return;

    try {
      await storage.backup.resetAll();
      await refreshProjects();
      setFeedbackMessage({
        type: "success",
        text: "All local data has been reset to default demo embedded projects.",
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: `Reset failed: ${err.message}`,
      });
    }
  };

  // Export Gates CSV Client-Side
  const handleExportGatesCsv = async () => {
    try {
      const csv = await storage.backup.exportGatesCsv(selectedProjectId || undefined);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "release_gates_audit.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedbackMessage({
        type: "success",
        text: "Release gate audit CSV exported successfully!",
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: `CSV export failed: ${err.message}`,
      });
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
          Manage browser local storage, backup engineering snapshots, export audit tables, and configure interface preferences.
        </p>
      </div>

      {/* Storage Status Card */}
      <div className="mono-card p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 shadow-xs">
          <HardDrive className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Browser Local Storage
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              LOCAL STORAGE ACTIVE
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            All projects, development phases, tasks, checklist items, engineering notes, and product release gate history are stored locally in your browser (localStorage). Data is stored in this browser and should be exported regularly.
          </p>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-md text-xs font-mono border flex items-center gap-2.5 transition-all ${
            feedbackMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Backup & Export Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* JSON Backup & Restore Card */}
        <div className="mono-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                JSON Backup & Restore
              </h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Export an archive of all your embedded projects, lifecycle phases, and notes, or import from a previous JSON backup file.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleExportAllJson}
                className="btn-primary flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export all data (JSON)</span>
              </button>

              <label className="btn-secondary flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md cursor-pointer transition-colors shadow-xs">
                <Upload className="w-4 h-4" />
                <span>{importing ? "Importing..." : "Import / Restore (JSON)"}</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  disabled={importing}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleResetAllData}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-md border border-zinc-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-900 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all data (Reload sample projects)</span>
            </button>
          </div>
        </div>

        {/* Data Exports & Audit Reports Card */}
        <div className="mono-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Data Exports & Audit Reports
              </h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Export structured engineering records directly in your browser as JSON or spreadsheet-ready CSV tables for design reviews.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleExportAllJson}
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:border-black dark:hover:border-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                All Projects JSON Archive
              </span>
              <Download className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            <button
              type="button"
              onClick={handleExportGatesCsv}
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:border-black dark:hover:border-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Release Gate Checklists & Failures (CSV)
              </span>
              <Download className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Interface Theme Preference Card */}
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
    </div>
  );
}
