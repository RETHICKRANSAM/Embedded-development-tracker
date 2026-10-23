"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Calendar,
  Trash2,
  ListCheck,
  CheckSquare,
  Square,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Columns,
  Table as TableIcon,
} from "lucide-react";
import { useProject } from "@/components/providers";
import { formatDate } from "@/lib/utils";
import { apiService, resolveApiUrl } from "@/lib/api-service";
import { StatusPill } from "@/components/monday/status-pill";
import { PriorityPill } from "@/components/monday/priority-pill";
import { StatusBatteryBar } from "@/components/monday/status-battery-bar";
import { MondayTabs } from "@/components/monday/monday-tabs";

export default function LifecyclePage() {
  const {
    selectedProjectId,
    setIsNotesDrawerOpen,
    setActivePhaseForNotes,
    refreshProjects,
  } = useProject();

  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("table");

  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Collapsed groups tracking (map of phaseId -> boolean)
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});

  // Quick inline task adding state per phase (map of phaseId -> title)
  const [inlineTaskTitles, setInlineTaskTitles] = useState<Record<string, string>>({});

  // Sub-items expanded tracking (map of taskId -> boolean)
  const [expandedSubItems, setExpandedSubItems] = useState<Record<string, boolean>>({});
  const [newSubItemInput, setNewSubItemInput] = useState<Record<string, string>>({});

  // Modals
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [modalTargetPhaseId, setModalTargetPhaseId] = useState<string | null>(null);
  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  // New phase form state
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseDesc, setNewPhaseDesc] = useState("");

  const fetchFullProject = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const data = await apiService.projects.get(selectedProjectId);
      setProjectData(data);
    } catch (err) {
      console.error("Failed to load project lifecycle:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullProject();
  }, [selectedProjectId]);

  // Toggle Phase collapse
  const togglePhaseCollapse = (phaseId: string) => {
    setCollapsedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  // Toggle Sub-items row
  const toggleSubItems = (taskId: string) => {
    setExpandedSubItems((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Status Change for Task
  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await apiService.tasks.update(taskId, { status: newStatus });
      fetchFullProject();
      refreshProjects();
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  // Priority Change for Task
  const handleTaskPriorityChange = async (taskId: string, newPriority: string) => {
    try {
      await apiService.tasks.update(taskId, { priority: newPriority });
      fetchFullProject();
    } catch (err) {
      console.error("Failed to update task priority:", err);
    }
  };

  // Move task to another phase
  const handleMoveTaskPhase = async (taskId: string, newPhaseId: string) => {
    try {
      await apiService.tasks.update(taskId, { phaseId: newPhaseId });
      fetchFullProject();
      refreshProjects();
    } catch (err) {
      console.error("Failed to move task:", err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await apiService.tasks.delete(taskId);
      fetchFullProject();
      refreshProjects();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  // Quick inline add task
  const handleQuickAddTask = async (phaseId: string) => {
    const title = (inlineTaskTitles[phaseId] || "").trim();
    if (!title || !selectedProjectId) return;

    try {
      await apiService.tasks.create({
        projectId: selectedProjectId,
        phaseId,
        title,
        status: "To Do",
        priority: "Medium",
      });
      setInlineTaskTitles((prev) => ({ ...prev, [phaseId]: "" }));
      fetchFullProject();
      refreshProjects();
    } catch (err) {
      console.error("Failed to create task inline:", err);
    }
  };

  // Add Task via Modal
  const handleModalAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !modalTargetPhaseId || !selectedProjectId) return;

    try {
      await apiService.tasks.create({
        projectId: selectedProjectId,
        phaseId: modalTargetPhaseId,
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || undefined,
        priority: newTaskPriority,
        dueDate: newTaskDueDate || undefined,
        status: "To Do",
      });

      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskPriority("Medium");
      setNewTaskDueDate("");
      setIsAddTaskModalOpen(false);
      fetchFullProject();
      refreshProjects();
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  // Add Sub-item Checklist to Task
  const handleAddSubItem = async (taskId: string) => {
    const title = (newSubItemInput[taskId] || "").trim();
    if (!title) return;

    try {
      await apiService.tasks.addChecklistItem(taskId, title);
      setNewSubItemInput((prev) => ({ ...prev, [taskId]: "" }));
      fetchFullProject();
    } catch (err) {
      console.error("Failed to add sub-item:", err);
    }
  };

  // Toggle Sub-item completion
  const handleToggleSubItem = async (taskId: string, itemId: string, currentVal: boolean) => {
    try {
      await apiService.tasks.updateChecklistItem(taskId, itemId, !currentVal);
      fetchFullProject();
    } catch (err) {
      console.error("Failed to toggle sub-item:", err);
    }
  };

  // Phase Checklist item toggle status
  const handleTogglePhaseChecklistItem = async (item: any) => {
    const nextStatus = item.status === "Passed" ? "Pending" : "Passed";
    try {
      await apiService.phaseItems.update(item.id, { status: nextStatus });
      fetchFullProject();
      refreshProjects();
    } catch (err) {
      console.error("Failed to update checklist item:", err);
    }
  };

  // Add Custom Phase
  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhaseName.trim() || !selectedProjectId) return;

    try {
      const res = await fetch(resolveApiUrl(`/api/projects/${selectedProjectId}/phases`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPhaseName.trim(),
          description: newPhaseDesc.trim(),
        }),
      });
      if (res.ok) {
        setNewPhaseName("");
        setNewPhaseDesc("");
        setIsAddPhaseModalOpen(false);
        fetchFullProject();
      }
    } catch (err) {
      console.error("Failed to add phase:", err);
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center mx-auto border border-zinc-300 dark:border-zinc-700">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          No Project Selected
        </h2>
        <p className="text-xs text-zinc-500">
          Please select an existing project from the topbar or create a new embedded project.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-zinc-950 dark:border-zinc-100 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-zinc-500">
            Loading lifecycle board...
          </span>
        </div>
      </div>
    );
  }

  const phases = projectData?.phases || [];

  // Filter tasks in phases
  const filteredPhases = phases.map((phase: any) => {
    const tasks = (phase.tasks || []).filter((task: any) => {
      const matchesSearch =
        search === "" ||
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "All" || task.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === "All" || task.priority.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return {
      ...phase,
      filteredTasks: tasks,
    };
  });

  const allBoardTasks = phases.flatMap((p: any) => p.tasks || []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Board Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {projectData?.name}
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
              {projectData?.projectCode}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
            <span>{projectData?.category}</span>
            {projectData?.mcu && <span>• Target MCU: {projectData?.mcu}</span>}
            {projectData?.rtos && <span>• {projectData?.rtos}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setModalTargetPhaseId(phases[0]?.id || null);
              setIsAddTaskModalOpen(true);
            }}
            className="btn-primary h-9"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
          <button
            onClick={() => setIsAddPhaseModalOpen(true)}
            className="btn-secondary h-9"
          >
            <Plus className="w-4 h-4" />
            <span>Add Phase</span>
          </button>
        </div>
      </div>

      {/* Monochrome Tabs */}
      <MondayTabs
        tabs={[
          { id: "table", label: "Main Table", icon: TableIcon, badge: allBoardTasks.length },
          { id: "kanban", label: "Kanban Board", icon: Columns },
          { id: "checklists", label: "Phase Audit Checklists", icon: CheckSquare },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks in this board..."
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
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked / Stuck</option>
            <option value="Done">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white text-xs text-zinc-900 dark:text-zinc-100 rounded px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Global Board Battery Bar */}
        <div className="flex items-center gap-2.5 w-64 self-end md:self-auto">
          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
            Board Progress:
          </span>
          <div className="flex-1">
            <StatusBatteryBar items={allBoardTasks} height={8} />
          </div>
        </div>
      </div>

      {/* TAB 1: MAIN TABLE (Monochrome Grouped Table) */}
      {activeTab === "table" && (
        <div className="space-y-6">
          {filteredPhases.map((phase: any) => {
            const isCollapsed = collapsedPhases[phase.id] || false;
            const tasks = phase.filteredTasks || [];

            return (
              <div
                key={phase.id}
                className="mono-card overflow-hidden shadow-2xs border border-zinc-200 dark:border-zinc-800"
              >
                {/* Monochrome Group Header */}
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 border-l-4 border-l-zinc-950 dark:border-l-zinc-100">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => togglePhaseCollapse(phase.id)}
                      className="p-1 rounded text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    <h3
                      className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:underline"
                      onClick={() => togglePhaseCollapse(phase.id)}
                    >
                      {phase.name}
                    </h3>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                      {tasks.length} items
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setModalTargetPhaseId(phase.id);
                        setIsAddTaskModalOpen(true);
                      }}
                      className="btn-secondary h-7 text-[11px]"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Task</span>
                    </button>
                    <button
                      onClick={() => {
                        setActivePhaseForNotes(phase.id);
                        setIsNotesDrawerOpen(true);
                      }}
                      className="p-1.5 rounded text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Open Notes for this Phase"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Group Content */}
                {!isCollapsed && (
                  <div>
                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-semibold text-[11px]">
                            <th className="py-2.5 px-4 min-w-[280px]">Task Name</th>
                            <th className="py-2.5 px-3 min-w-[140px]">Status</th>
                            <th className="py-2.5 px-3 min-w-[120px]">Priority</th>
                            <th className="py-2.5 px-3 min-w-[120px]">Due Date</th>
                            <th className="py-2.5 px-3 min-w-[90px] text-center">Sub-items</th>
                            <th className="py-2.5 px-3 min-w-[130px]">Move Phase</th>
                            <th className="py-2.5 px-3 w-10 text-center">Notes</th>
                            <th className="py-2.5 px-3 w-10 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                          {tasks.map((task: any) => {
                            const subItems = task.checklistItems || [];
                            const completedSub = subItems.filter((i: any) => i.isCompleted).length;
                            const isSubExpanded = expandedSubItems[task.id] || false;

                            return (
                              <React.Fragment key={task.id}>
                                <tr className="mono-table-row">
                                  {/* Task Name */}
                                  <td className="py-2.5 px-4">
                                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                      <span
                                        className={
                                          task.status === "Done"
                                            ? "line-through text-zinc-400 dark:text-zinc-500"
                                            : ""
                                        }
                                      >
                                        {task.title}
                                      </span>
                                    </div>
                                    {task.description && (
                                      <div className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-md">
                                        {task.description}
                                      </div>
                                    )}
                                  </td>

                                  {/* Status */}
                                  <td className="py-2.5 px-3">
                                    <StatusPill
                                      status={task.status}
                                      onChange={(s) => handleTaskStatusChange(task.id, s)}
                                      size="sm"
                                    />
                                  </td>

                                  {/* Priority */}
                                  <td className="py-2.5 px-3">
                                    <PriorityPill
                                      priority={task.priority}
                                      onChange={(p) => handleTaskPriorityChange(task.id, p)}
                                      size="sm"
                                    />
                                  </td>

                                  {/* Due Date */}
                                  <td className="py-2.5 px-3">
                                    {task.dueDate ? (
                                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
                                        <Calendar className="w-3 h-3 text-zinc-400" />
                                        <span>{formatDate(task.dueDate)}</span>
                                      </div>
                                    ) : (
                                      <span className="text-zinc-400 text-[11px]">—</span>
                                    )}
                                  </td>

                                  {/* Sub-items Badge */}
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => toggleSubItems(task.id)}
                                      className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 cursor-pointer"
                                    >
                                      {subItems.length > 0
                                        ? `${completedSub}/${subItems.length}`
                                        : "+ Sub"}
                                    </button>
                                  </td>

                                  {/* Move to another phase */}
                                  <td className="py-2.5 px-3">
                                    <select
                                      value={task.phaseId}
                                      onChange={(e) =>
                                        handleMoveTaskPhase(task.id, e.target.value)
                                      }
                                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-[11px] text-zinc-700 dark:text-zinc-300 rounded px-1.5 py-1"
                                    >
                                      {phases.map((ph: any) => (
                                        <option key={ph.id} value={ph.id}>
                                          {ph.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>

                                  {/* Notes Icon */}
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActivePhaseForNotes(phase.id);
                                        setIsNotesDrawerOpen(true);
                                      }}
                                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                                      title="Open notes"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </button>
                                  </td>

                                  {/* Delete Task */}
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                                      title="Delete task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>

                                {/* Sub-items Drawer Row */}
                                {isSubExpanded && (
                                  <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                    <td colSpan={8} className="py-3 px-8 space-y-2">
                                      <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                        <ListCheck className="w-3.5 h-3.5" />
                                        <span>Checklist Sub-items ({completedSub}/{subItems.length})</span>
                                      </div>

                                      <div className="space-y-1.5 max-w-xl">
                                        {subItems.map((item: any) => (
                                          <div
                                            key={item.id}
                                            className="flex items-center gap-2 text-xs text-zinc-800 dark:text-zinc-200"
                                          >
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleToggleSubItem(
                                                  task.id,
                                                  item.id,
                                                  item.isCompleted
                                                )
                                              }
                                              className="cursor-pointer"
                                            >
                                              {item.isCompleted ? (
                                                <CheckSquare className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                                              ) : (
                                                <Square className="w-4 h-4 text-zinc-400" />
                                              )}
                                            </button>
                                            <span
                                              className={
                                                item.isCompleted
                                                  ? "line-through text-zinc-400"
                                                  : ""
                                              }
                                            >
                                              {item.title}
                                            </span>
                                          </div>
                                        ))}

                                        {/* Add Sub-item inline */}
                                        <div className="flex items-center gap-2 pt-1">
                                          <input
                                            type="text"
                                            placeholder="+ Add new sub-item and press Enter..."
                                            value={newSubItemInput[task.id] || ""}
                                            onChange={(e) =>
                                              setNewSubItemInput((prev) => ({
                                                ...prev,
                                                [task.id]: e.target.value,
                                              }))
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddSubItem(task.id);
                                              }
                                            }}
                                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded px-2.5 py-1 focus:outline-hidden focus:border-black dark:focus:border-white"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => handleAddSubItem(task.id)}
                                            className="btn-primary h-7 px-3 text-xs"
                                          >
                                            Add
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}

                          {/* Monochrome Inline Add Item Row */}
                          <tr className="bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            <td colSpan={8} className="py-2.5 px-4">
                              <div className="flex items-center gap-2">
                                <Plus className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                <input
                                  type="text"
                                  placeholder="+ Add Task and press Enter..."
                                  value={inlineTaskTitles[phase.id] || ""}
                                  onChange={(e) =>
                                    setInlineTaskTitles((prev) => ({
                                      ...prev,
                                      [phase.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleQuickAddTask(phase.id);
                                    }
                                  }}
                                  className="w-full bg-transparent border-0 focus:outline-hidden text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                                />
                                {inlineTaskTitles[phase.id]?.trim() && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddTask(phase.id)}
                                    className="btn-primary h-7 px-3 text-xs shrink-0"
                                  >
                                    Save
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom Summary Bar for Group */}
                    <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {tasks.filter((t: any) => t.status === "Done").length}/{tasks.length} Done
                        </span>
                      </div>
                      <div className="w-48">
                        <StatusBatteryBar items={tasks} height={6} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: KANBAN BOARD (Monochrome) */}
      {activeTab === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {["To Do", "In Progress", "Pending", "Blocked", "Done"].map((colStatus) => {
            const colTasks = allBoardTasks.filter((t: any) => t.status === colStatus);

            return (
              <div
                key={colStatus}
                className="mono-card p-3 flex flex-col justify-between min-h-[500px]"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {colStatus}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold border border-zinc-300 dark:border-zinc-700">
                        {colTasks.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {colTasks.map((task: any) => (
                      <div
                        key={task.id}
                        className="p-3 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xs space-y-2 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                      >
                        <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {task.title}
                        </div>

                        {task.description && (
                          <div className="text-[11px] text-zinc-500 line-clamp-2">
                            {task.description}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <PriorityPill priority={task.priority} size="sm" />
                          <StatusPill
                            status={task.status}
                            onChange={(s) => handleTaskStatusChange(task.id, s)}
                            size="sm"
                          />
                        </div>

                        {task.phase && (
                          <div className="text-[10px] text-zinc-500 truncate pt-1 border-t border-zinc-100 dark:border-zinc-800">
                            {task.phase.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: PHASE AUDIT CHECKLISTS (Monochrome) */}
      {activeTab === "checklists" && (
        <div className="space-y-6">
          {phases.map((phase: any) => {
            const items = phase.checklistItems || [];
            const passedCount = items.filter((i: any) => i.status === "Passed").length;

            return (
              <div key={phase.id} className="mono-card overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 border-l-4 border-l-zinc-950 dark:border-l-zinc-100">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {phase.name} — Verification Checklist
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      {passedCount}/{items.length} checks passed
                    </p>
                  </div>
                  <div className="w-32">
                    <StatusBatteryBar items={items} height={6} />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-semibold text-[11px]">
                        <th className="py-2.5 px-4">Verification Check Item</th>
                        <th className="py-2.5 px-3">Mandatory</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {items.map((item: any) => (
                        <tr key={item.id} className="mono-table-row">
                          <td className="py-2.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                            {item.title}
                          </td>
                          <td className="py-2.5 px-3">
                            {item.isMandatory ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950">
                                MANDATORY
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-500">Optional</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <StatusPill
                              status={item.status}
                              onChange={(s) =>
                                apiService.phaseItems.update(item.id, { status: s }).then(() => {
                                  fetchFullProject();
                                  refreshProjects();
                                })
                              }
                              options={["Passed", "Pending", "Failed", "Blocked"]}
                              size="sm"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              type="button"
                              onClick={() => handleTogglePhaseChecklistItem(item)}
                              className="btn-secondary h-7 text-[11px]"
                            >
                              {item.status === "Passed" ? "Mark Pending" : "Mark Passed"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Add Sprint Task
              </h3>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalAddTask} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Target Phase
                </label>
                <select
                  value={modalTargetPhaseId || ""}
                  onChange={(e) => setModalTargetPhaseId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                >
                  {phases.map((ph: any) => (
                    <option key={ph.id} value={ph.id}>
                      {ph.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Task Title <span className="text-zinc-950 dark:text-zinc-50 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Configure SPI DMA circular buffer for sensor array"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
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
                  placeholder="Technical details, registers, baud rates, timing constraints..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="btn-secondary h-8"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary h-8"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Phase Modal */}
      {isAddPhaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Add Development Phase
              </h3>
              <button
                onClick={() => setIsAddPhaseModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPhase} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Phase Name <span className="text-zinc-950 dark:text-zinc-50 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Phase 8: Field Deployment Trial"
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
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
                  placeholder="Phase goals, activities, acceptance criteria..."
                  value={newPhaseDesc}
                  onChange={(e) => setNewPhaseDesc(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddPhaseModalOpen(false)}
                  className="btn-secondary h-8"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary h-8"
                >
                  Create Phase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
