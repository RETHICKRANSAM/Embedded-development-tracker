"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  StickyNote,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  X,
  MessageSquare,
  Cpu,
} from "lucide-react";
import { useProject } from "@/components/providers";
import { formatDate } from "@/lib/utils";
import { apiService } from "@/lib/api-service";

const NOTE_CATEGORIES = [
  "All",
  "Technical Decision",
  "Debugging",
  "Hardware",
  "Firmware",
  "Testing",
  "Bug",
  "Reference",
  "General",
];

export default function EngineeringNotesPage() {
  const { selectedProjectId, projects } = useProject();

  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState<string>("All");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  // Form states
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("Technical Decision");
  const [noteProjectId, setNoteProjectId] = useState(selectedProjectId || "");
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await apiService.notes.list({
        projectId: projectFilter !== "All" ? projectFilter : undefined,
        category: categoryFilter !== "All" ? categoryFilter : undefined,
        search: search.trim() || undefined,
      });
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [projectFilter, categoryFilter, search]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim() || !noteProjectId) return;

    setSubmitting(true);
    try {
      await apiService.notes.create({
        projectId: noteProjectId,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
      });

      setNoteTitle("");
      setNoteContent("");
      setIsAddOpen(false);
      fetchNotes();
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    try {
      await apiService.notes.update(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        category: editingNote.category,
      });

      setEditingNote(null);
      fetchNotes();
    } catch (err) {
      console.error("Failed to update note:", err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this technical note?")) return;
    try {
      await apiService.notes.delete(id);
      fetchNotes();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Engineering Notebook & Docs</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 font-bold">
              {notes.length} NOTES
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Preserve technical decisions, debugging observations, register configurations, and reference links.
          </p>
        </div>

        <button
          onClick={() => {
            setNoteProjectId(selectedProjectId || projects[0]?.id || "");
            setIsAddOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ Write Technical Note</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="mono-card p-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes by keyword or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white text-xs text-zinc-900 dark:text-zinc-100 rounded pl-8 pr-3 py-1.5 focus:outline-hidden"
            />
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Project:</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white text-xs text-zinc-900 dark:text-zinc-100 rounded px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="All">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.projectCode}] {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {NOTE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                categoryFilter === cat
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white hover:border-zinc-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="mono-card p-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Loading technical notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="mono-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            No technical notes found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Document your embedded firmware observations, debugging steps, or hardware bring-up notes.
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="mono-card p-4 space-y-3 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                      {note.category}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {note.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingNote(note)}
                      className="p-1 text-zinc-500 hover:text-black dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Edit note"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-zinc-500 hover:text-black dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-sans bg-zinc-50 dark:bg-zinc-900/80 p-3 rounded-md border border-zinc-200 dark:border-zinc-800 max-h-48 overflow-y-auto leading-relaxed">
                  {note.content}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {note.project?.projectCode}
                  </span>
                  {note.phase && <span className="text-zinc-400 dark:text-zinc-600">• {note.phase.name}</span>}
                </div>
                <span>{formatDate(note.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Write Technical Note
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Target Project
                </label>
                <select
                  value={noteProjectId}
                  onChange={(e) => setNoteProjectId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.projectCode}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Note Title <span className="text-zinc-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DMA Circular Buffer Overrun"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Category
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  >
                    {NOTE_CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Technical Content
                </label>
                <textarea
                  rows={5}
                  placeholder="Record observations, register settings, clock tree configurations, or oscilloscope notes..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="btn-secondary px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Edit Note
              </h3>
              <button
                onClick={() => setEditingNote(null)}
                className="p-1 rounded text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateNote} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Note Title
                  </label>
                  <input
                    type="text"
                    value={editingNote.title}
                    onChange={(e) =>
                      setEditingNote({ ...editingNote, title: e.target.value })
                    }
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Category
                  </label>
                  <select
                    value={editingNote.category}
                    onChange={(e) =>
                      setEditingNote({ ...editingNote, category: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  >
                    {NOTE_CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Technical Content
                </label>
                <textarea
                  rows={5}
                  value={editingNote.content}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, content: e.target.value })
                  }
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="btn-secondary px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer"
                >
                  Update Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
