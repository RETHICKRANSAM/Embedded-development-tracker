"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Search,
  Trash2,
  Layers,
  MessageSquare,
} from "lucide-react";
import { useProject } from "./providers";
import { formatDate } from "@/lib/utils";
import { apiService } from "@/lib/api-service";

const NOTE_CATEGORIES = [
  "Technical Decision",
  "Debugging",
  "Hardware",
  "Firmware",
  "Testing",
  "Bug",
  "Reference",
  "General",
];

export function NotesDrawer() {
  const {
    isNotesDrawerOpen,
    setIsNotesDrawerOpen,
    selectedProjectId,
    projects,
    activePhaseForNotes,
    setActivePhaseForNotes,
  } = useProject();

  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAdding, setIsAdding] = useState(false);

  // New Note state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [submitting, setSubmitting] = useState(false);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  const fetchNotes = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const data = await apiService.notes.list({
        projectId: selectedProjectId,
        phaseId: activePhaseForNotes || undefined,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        search: search.trim() || undefined,
      });
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes in drawer:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isNotesDrawerOpen && selectedProjectId) {
      fetchNotes();
    }
  }, [isNotesDrawerOpen, selectedProjectId, activePhaseForNotes, selectedCategory, search]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !selectedProjectId) return;

    setSubmitting(true);
    try {
      await apiService.notes.create({
        projectId: selectedProjectId,
        phaseId: activePhaseForNotes || activeProject?.currentPhaseId || undefined,
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
      });

      setNewTitle("");
      setNewContent("");
      setNewCategory("General");
      setIsAdding(false);
      fetchNotes();
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this technical note?")) return;
    try {
      await apiService.notes.delete(noteId);
      fetchNotes();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  if (!isNotesDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] md:w-[480px] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Updates & Notes
              {activeProject && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold border border-zinc-300 dark:border-zinc-700">
                  {activeProject.projectCode}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {activePhaseForNotes
                ? "Filtered to selected development phase"
                : "Project technical notes & debugging observations"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNotesDrawerOpen(false)}
          className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Contextual Phase Badge Filter */}
      {activePhaseForNotes && (
        <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-900 dark:text-zinc-100 font-semibold">
          <div className="flex items-center gap-1.5 truncate">
            <Layers className="w-3.5 h-3.5" />
            <span>Active Phase Filtered</span>
          </div>
          <button
            onClick={() => setActivePhaseForNotes(null)}
            className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 underline cursor-pointer"
          >
            Show All
          </button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 space-y-2 bg-white dark:bg-zinc-950">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white text-xs text-zinc-900 dark:text-zinc-100 rounded pl-8 pr-3 py-1.5 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-2.5 py-1 rounded font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === "All"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            All
          </button>
          {NOTE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950">
        {/* Quick Add Toggle / Composer */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full btn-secondary h-10 border-dashed"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Write Technical Note</span>
          </button>
        ) : (
          <form
            onSubmit={handleCreateNote}
            className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-sm space-y-3 animate-in fade-in duration-100"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                New Note
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-zinc-500 hover:text-zinc-900 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <input
              type="text"
              placeholder="Note title (e.g. UART Baudrate DMA Issue)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-2.5 py-1.5 focus:outline-hidden focus:border-black dark:focus:border-white"
            />

            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-2.5 py-1.5 focus:outline-hidden focus:border-black dark:focus:border-white"
            >
              {NOTE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <textarea
              rows={3}
              placeholder="Technical observation, register configs, workaround, oscilloscope measurements..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-2.5 py-1.5 focus:outline-hidden focus:border-black dark:focus:border-white font-mono"
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn-secondary h-8"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary h-8"
              >
                {submitting ? "Posting..." : "Post Note"}
              </button>
            </div>
          </form>
        )}

        {/* Note List */}
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Loading technical notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            No technical notes found for this filter.
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {n.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                    <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold border border-zinc-200 dark:border-zinc-700">
                      {n.category}
                    </span>
                    <span>{formatDate(n.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteNote(n.id)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-sans bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded border border-zinc-200 dark:border-zinc-800">
                {n.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
