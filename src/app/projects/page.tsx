"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Search,
  Cpu,
  Layers,
  ShieldCheck,
  Edit2,
  Archive,
  Trash2,
  GitFork,
  X,
  LayoutGrid,
  Table as TableIcon,
  ExternalLink,
} from "lucide-react";
import { useProject } from "@/components/providers";
import { CreateProjectModal } from "@/components/create-project-modal";
import { formatDate } from "@/lib/utils";
import { apiService } from "@/lib/api-service";
import { StatusPill } from "@/components/monday/status-pill";
import { StatusBatteryBar } from "@/components/monday/status-battery-bar";

export default function ProjectsPage() {
  const { setSelectedProjectId, refreshProjects } = useProject();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await apiService.projects.list();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      await apiService.projects.update(editingProject.id, editingProject);
      setEditingProject(null);
      fetchProjects();
      refreshProjects();
    } catch (err) {
      console.error("Failed to update project:", err);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      await apiService.projects.update(projectId, { status: newStatus });
      fetchProjects();
      refreshProjects();
    } catch (err) {
      console.error("Failed to update project status:", err);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete project '${name}' and all its phases, tasks, checklists, and release gates?`
      )
    ) {
      return;
    }

    try {
      await apiService.projects.delete(id);
      fetchProjects();
      refreshProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleArchiveProject = async (proj: any) => {
    const nextStatus = proj.status === "Archived" ? "Active" : "Archived";
    try {
      await apiService.projects.update(proj.id, { status: nextStatus });
      fetchProjects();
      refreshProjects();
    } catch (err) {
      console.error("Failed to toggle archive:", err);
    }
  };

  // Filter projects
  const filtered = projects.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      (p.mcu && p.mcu.toLowerCase().includes(search.toLowerCase())) ||
      (p.hardwarePlatform && p.hardwarePlatform.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" || p.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "All" || (p.category && p.category === categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Embedded Projects Board</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold border border-zinc-300 dark:border-zinc-700">
              {projects.length} PROJECTS
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage target hardware specs, lifecycle progress, and verification gate status across all devices.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary h-9"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Filter & View Toolbar */}
      <div className="mono-card p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, code, MCU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white text-xs text-zinc-900 dark:text-zinc-100 rounded pl-8 pr-3 py-1.5 focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white text-xs text-zinc-900 dark:text-zinc-100 rounded px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white text-xs text-zinc-900 dark:text-zinc-100 rounded px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-zinc-300 dark:border-zinc-700 rounded p-0.5 self-end md:self-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded text-xs flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
            }`}
            title="Table View"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded text-xs flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="mono-card p-12 text-center text-xs text-zinc-500">
          Loading projects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="mono-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center mx-auto border border-zinc-300 dark:border-zinc-700">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            No projects matched your criteria
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search terms or filters, or create a new embedded project.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* Monochrome Table View */
        <div className="mono-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Project Name & Code</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">MCU / Platform</th>
                  <th className="py-2.5 px-3">RTOS & IDE</th>
                  <th className="py-2.5 px-3">Current Phase</th>
                  <th className="py-2.5 px-3">Task Progress</th>
                  <th className="py-2.5 px-3">Release Gates</th>
                  <th className="py-2.5 px-3">Target Date</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filtered.map((p) => (
                  <tr key={p.id} className="mono-table-row">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Link
                          href="/lifecycle"
                          onClick={() => setSelectedProjectId(p.id)}
                          className="hover:underline"
                        >
                          {p.name}
                        </Link>
                        {p.repositoryUrl && (
                          <a
                            href={p.repositoryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            title="Repository Link"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                        <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">
                          {p.projectCode}
                        </span>
                        {p.category && (
                          <span className="text-zinc-500">
                            • {p.category}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <StatusPill
                        status={p.status}
                        onChange={(s) => handleStatusChange(p.id, s)}
                        options={["Active", "On Hold", "Completed", "Archived"]}
                        size="sm"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                        {p.mcu || "—"}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                        {p.hardwarePlatform || "—"}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-xs text-zinc-800 dark:text-zinc-200">
                        {p.rtos || "Bare-Metal"}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {p.ide || "—"}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 inline-block truncate max-w-[150px]">
                        {p.currentPhaseName}
                      </span>
                    </td>

                    <td className="py-3 px-3 min-w-[130px]">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {p.completedTasks}/{p.totalTasks} Done
                        </span>
                        <span className="font-mono text-zinc-500">
                          {p.overallProgress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-zinc-950 dark:bg-zinc-100 rounded-full transition-all"
                          style={{ width: `${p.overallProgress}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {p.passedGates > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
                          <ShieldCheck className="w-3 h-3" />
                          {p.passedGates}/{p.totalGates} Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                          0/{p.totalGates} Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                      {p.targetDate ? formatDate(p.targetDate) : "—"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href="/lifecycle"
                          onClick={() => setSelectedProjectId(p.id)}
                          className="btn-secondary h-7 px-2 text-[11px]"
                          title="Open Lifecycle Board"
                        >
                          <GitFork className="w-3 h-3" />
                          <span>Board</span>
                        </Link>
                        <button
                          onClick={() => setEditingProject(p)}
                          className="p-1 rounded text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleArchiveProject(p)}
                          className="p-1 rounded text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                          title={p.status === "Archived" ? "Unarchive" : "Archive"}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id, p.name)}
                          className="p-1 rounded text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Table Summary Bar */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>Total Projects: {filtered.length}</span>
            <div className="w-48">
              <StatusBatteryBar
                items={filtered.map((p) => ({ status: p.status }))}
                height={6}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Monochrome Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="mono-card p-4.5 space-y-3 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                      {p.projectCode}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                      {p.name}
                    </h3>
                  </div>
                  <StatusPill
                    status={p.status}
                    onChange={(s) => handleStatusChange(p.id, s)}
                    options={["Active", "On Hold", "Completed", "Archived"]}
                    size="sm"
                  />
                </div>

                {p.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2">
                    {p.description}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
                  {p.mcu && (
                    <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                      <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{p.mcu}</span>
                    </div>
                  )}
                  {p.currentPhaseName && (
                    <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <Layers className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{p.currentPhaseName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Task Progress</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {p.overallProgress}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-zinc-950 dark:bg-zinc-100 rounded-full"
                    style={{ width: `${p.overallProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    href="/lifecycle"
                    onClick={() => setSelectedProjectId(p.id)}
                    className="btn-secondary h-7 text-[11px]"
                  >
                    <span>Open Board</span>
                    <GitFork className="w-3 h-3" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingProject(p)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(p.id, p.name)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Edit Project: [{editingProject.projectCode}] {editingProject.name}
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Project Name
                </label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, name: e.target.value })
                  }
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingProject.description || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Target MCU
                  </label>
                  <input
                    type="text"
                    value={editingProject.mcu || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, mcu: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Hardware Platform
                  </label>
                  <input
                    type="text"
                    value={editingProject.hardwarePlatform || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, hardwarePlatform: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Status
                  </label>
                  <select
                    value={editingProject.status}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, status: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={
                      editingProject.targetDate
                        ? new Date(editingProject.targetDate).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, targetDate: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="btn-secondary h-8"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary h-8"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateProjectModal
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}
