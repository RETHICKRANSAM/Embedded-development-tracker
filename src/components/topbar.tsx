"use client";

import React, { useState } from "react";
import {
  Plus,
  StickyNote,
  Sun,
  Moon,
  Cpu,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useProject, useTheme } from "./providers";
import { CreateProjectModal } from "./create-project-modal";

export function Topbar() {
  const {
    selectedProjectId,
    setSelectedProjectId,
    projects,
    isNotesDrawerOpen,
    setIsNotesDrawerOpen,
  } = useProject();
  const { theme, toggleTheme } = useTheme();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <>
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
        {/* Left: Project Switcher & Metadata */}
        <div className="flex items-center gap-2.5 min-w-0">
          {projects.length > 0 ? (
            <div className="flex items-center gap-2 min-w-0">
              {/* Project Switcher Select */}
              <div className="relative flex items-center">
                <select
                  value={selectedProjectId || ""}
                  onChange={(e) => setSelectedProjectId(e.target.value || null)}
                  className="appearance-none bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-medium rounded-md pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:border-black dark:focus:border-white transition-colors max-w-[260px] sm:max-w-[320px] truncate"
                  title="Switch Active Project"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.projectCode}] {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2 pointer-events-none" />
              </div>
            </div>
          ) : (
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Embedded Dev Tracker
            </span>
          )}
        </div>

        {/* Right: Primary Action, Drawer, Theme, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Primary Create Project Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary h-8 px-3 text-xs"
            title="Create a new embedded project"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Create Project</span>
          </button>

          {/* Slide-over Notes Toggle */}
          <button
            onClick={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
            className={`btn-secondary h-8 px-2.5 sm:px-3 text-xs ${
              isNotesDrawerOpen
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold border-transparent"
                : ""
            }`}
            title="Toggle Engineering Notes Updates Panel"
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notes</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn-secondary h-8 px-2.5 text-xs"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            aria-label="Toggle display theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-zinc-200" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-800" />
            )}
          </button>

          {/* User Profile Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center text-xs font-bold shrink-0 select-none border border-zinc-700 dark:border-zinc-300"
            title="User Profile: Embedded Systems Engineer"
          >
            EE
          </div>
        </div>
      </header>

      {/* Create Project Modal */}
      {isCreateOpen && (
        <CreateProjectModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </>
  );
}
