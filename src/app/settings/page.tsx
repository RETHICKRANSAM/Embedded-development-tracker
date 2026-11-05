"use client";

import React, { useState, useEffect } from "react";
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
  Key,
  Server,
  Eye,
  EyeOff,
  Wifi,
  RefreshCw,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useProject, useTheme } from "@/components/providers";
import {
  apiService,
  getApiKey,
  setApiKey,
  getApiBaseUrl,
  setApiBaseUrl,
  isStaticMode,
  getForceMode,
  setForceMode,
} from "@/lib/api-service";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { refreshProjects } = useProject();

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  // API Connection & Auth State
  const [apiUrl, setApiUrlState] = useState("");
  const [apiKey, setApiKeyState] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: number;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [staticFallback, setStaticFallback] = useState(false);
  const [forceMode, setForceModeState] = useState<"auto" | "live" | "demo">("auto");

  useEffect(() => {
    setApiUrlState(getApiBaseUrl());
    setApiKeyState(getApiKey());
    setStaticFallback(isStaticMode());
    setForceModeState(getForceMode());
  }, []);

  const handleSaveApiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(apiUrl);
    setApiKey(apiKey);
    setSaveNotice("API settings saved successfully!");
    setStaticFallback(isStaticMode());
    refreshProjects();
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleModeChange = (newMode: "auto" | "live" | "demo") => {
    setForceMode(newMode);
    setForceModeState(newMode);
    setStaticFallback(isStaticMode());
    setSaveNotice(`Switched data mode to: ${newMode.toUpperCase()}`);
    refreshProjects();
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await apiService.connection.test(apiUrl, apiKey);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 0,
        message: err.message || "Failed to initiate test connection",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleResetApiConfig = () => {
    setApiBaseUrl(null);
    setApiKey(null);
    setApiUrlState(getApiBaseUrl());
    setApiKeyState(getApiKey());
    setTestResult(null);
    setSaveNotice("Reset to environment defaults.");
    setStaticFallback(isStaticMode());
    refreshProjects();
    setTimeout(() => setSaveNotice(null), 3000);
  };

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
          Manage backend connection, API Key security, local SQLite storage, export engineering archives, and interface preferences.
        </p>
      </div>

      {/* Backend API & API Key Authentication Card */}
      <div className="mono-card p-5 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Backend Connection & API Key</span>
                {apiKey ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Key Configured
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
                    No Key (Open Access)
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Connect the frontend to your Next.js API or remote server using secure API Key authentication.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span
              className={`text-[11px] font-mono px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                !staticFallback
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              }`}
            >
              {!staticFallback ? "🟢 Live SQLite Database (dev.db)" : "🟠 Static Demo Data"}
            </span>

            <div className="inline-flex rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => handleModeChange("live")}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  forceMode === "live"
                    ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
                }`}
              >
                Force Live DB
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("auto")}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  forceMode === "auto"
                    ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("demo")}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  forceMode === "demo"
                    ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
                }`}
              >
                Force Demo
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveApiConfig} className="space-y-3.5 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Backend URL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                Backend API URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrlState(e.target.value)}
                placeholder="Leave blank for same-origin (/api) or enter https://..."
                className="w-full px-3 py-2 text-xs font-mono rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
              />
              <p className="text-[11px] text-zinc-500">
                Default: current origin (/api). Override when calling a remote backend.
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  API Key (Secret Token)
                </span>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {showApiKey ? (
                    <>
                      <EyeOff className="w-3 h-3" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" /> Show
                    </>
                  )}
                </button>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKeyState(e.target.value)}
                  placeholder="Enter API Key (sent via x-api-key & Bearer header)"
                  className="w-full px-3 py-2 text-xs font-mono rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                Sent via <code className="font-mono">x-api-key</code> and <code className="font-mono">Authorization: Bearer &lt;key&gt;</code>.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="submit"
              className="btn-primary inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Save & Apply
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="btn-secondary inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  Test Connection
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetApiConfig}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 py-2 cursor-pointer transition-colors"
            >
              Reset to Env Defaults
            </button>

            {saveNotice && (
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {saveNotice}
              </span>
            )}
          </div>
        </form>

        {/* Test Result Display */}
        {testResult && (
          <div
            className={`p-3 rounded-md text-xs border font-mono flex items-start gap-2.5 ${
              testResult.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : testResult.status === 401
                ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <div className="font-bold">
                {testResult.success
                  ? `Connection Verified (HTTP ${testResult.status})`
                  : `Connection Failed (HTTP ${testResult.status || "0"})`}
              </div>
              <div className="text-[11px] opacity-90">{testResult.message}</div>
            </div>
          </div>
        )}
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
              href={apiService.backup.downloadDbUrl}
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
              href={apiService.backup.exportData("json", "project")}
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
              href={apiService.backup.exportData("csv", "gates")}
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
