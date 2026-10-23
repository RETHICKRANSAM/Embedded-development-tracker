"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  AlertOctagon,
  GitFork,
  CheckCircle2,
  Cpu,
  Layers,
} from "lucide-react";
import { useProject } from "@/components/providers";
import { formatDate } from "@/lib/utils";
import { apiService } from "@/lib/api-service";
import { StatusPill } from "@/components/monday/status-pill";

const LIFECYCLE_STAGES = [
  {
    step: 1,
    shortName: "Requirements",
    fullName: "Phase 1: Requirements and Planning",
    description: "System architecture, BOM constraints, power budget, pinout allocations, and communication specs.",
  },
  {
    step: 2,
    shortName: "HW Bring-up",
    fullName: "Phase 2: Hardware Study and Bring-up",
    description: "Board power rail bring-up, crystal oscillator verification, bus integrity, and initial test points probing.",
  },
  {
    step: 3,
    shortName: "Firmware Arch",
    fullName: "Phase 3: Firmware Architecture and Development",
    description: "Peripheral drivers, RTOS task structures, HAL configuration, DMA buffers, and core logic implementation.",
  },
  {
    step: 4,
    shortName: "Integration",
    fullName: "Phase 4: Unit and Integration Testing",
    description: "Hardware-in-the-loop tests, protocol stress validation, peripheral error handling, and register state dumps.",
  },
  {
    step: 5,
    shortName: "Validation",
    fullName: "Phase 5: System Validation and Stress Testing",
    description: "Long-term thermal soak tests, power consumption profiling, EMI compliance, and memory leak analysis.",
  },
  {
    step: 6,
    shortName: "Pilot Prep",
    fullName: "Phase 6: Demo or Pilot Preparation",
    description: "Pilot firmware staging, flash write protection, device provisioning, and field demonstration readiness.",
  },
  {
    step: 7,
    shortName: "Post-Demo",
    fullName: "Phase 7: Post-Demo Review",
    description: "Field feedback consolidation, errata documentation, PCB revision planning, and roadmap updates.",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { setSelectedProjectId, refreshProjects } = useProject();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStageStep, setSelectedStageStep] = useState<number>(1);

  const fetchDashboardData = async () => {
    try {
      const json = await apiService.dashboard.get();
      setData(json);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTaskStatusToggle = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Done" ? "To Do" : "Done";
    try {
      await apiService.tasks.update(taskId, { status: nextStatus });
      fetchDashboardData();
      refreshProjects();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent animate-spin" />
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Loading dashboard data...
          </span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentProjects = data?.recentProjects || [];
  const tasksDueToday = data?.tasksDueToday || [];
  const overdueTasks = data?.overdueTasks || [];
  const blockedTasks = data?.blockedTasks || [];
  const phaseDistribution = data?.phaseDistribution || {};
  const incompleteGates = data?.incompleteGates || [];

  const urgentTasks = [
    ...overdueTasks,
    ...tasksDueToday.filter((t: any) => !overdueTasks.some((ot: any) => ot.id === t.id)),
  ];

  const selectedStage = LIFECYCLE_STAGES.find((s) => s.step === selectedStageStep) || LIFECYCLE_STAGES[0];
  const selectedStageCount = Number(phaseDistribution[selectedStage.fullName] || 0);

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    router.push("/lifecycle");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-7 select-none">
      {/* 1. Page Header (Single clean heading, no duplicate create buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Embedded Engineering Dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Overview of active projects, sprint execution, and release verification gates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/lifecycle"
            className="btn-secondary h-8 px-3 text-xs"
            title="Open Lifecycle & Task Board"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Lifecycle Board</span>
          </Link>
          <Link
            href="/projects"
            className="btn-secondary h-8 px-3 text-xs"
            title="View All Projects"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>All Projects</span>
          </Link>
        </div>
      </div>

      {/* 2. Compact 4-Metric Summary Bar (Hairline divided, no card overload) */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
        {/* Projects */}
        <div className="p-3.5 px-5">
          <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Active Projects</span>
            <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {metrics.activeProjects ?? 0}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              of {metrics.totalProjects ?? 0} total
            </span>
          </div>
        </div>

        {/* Due Today */}
        <div className="p-3.5 px-5">
          <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Due Today</span>
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {metrics.tasksDueTodayCount ?? 0}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              tasks scheduled
            </span>
          </div>
        </div>

        {/* Overdue */}
        <div className="p-3.5 px-5">
          <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Overdue Tasks</span>
            <AlertOctagon className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {metrics.overdueTasksCount ?? 0}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              require action
            </span>
          </div>
        </div>

        {/* Open Release Gates */}
        <div className="p-3.5 px-5">
          <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Open Release Gates</span>
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {incompleteGates.length}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              pending sign-off
            </span>
          </div>
        </div>
      </div>

      {/* 3. Compact 7-Stage Lifecycle Stepper (No scrollbar, responsive, integrated) */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            Lifecycle Pipeline Stages
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Click a stage to inspect details
          </span>
        </div>

        {/* Stepper Track */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-1 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
          {LIFECYCLE_STAGES.map((s) => {
            const count = Number(phaseDistribution[s.fullName] || 0);
            const isSelected = selectedStageStep === s.step;
            const hasProjects = count > 0;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setSelectedStageStep(s.step)}
                className={`flex flex-col items-center text-center p-2 rounded-md transition-all cursor-pointer ${
                  isSelected
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-colors mb-1 ${
                    hasProjects
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                      : isSelected
                      ? "border-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                      : "border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {s.step}
                </div>
                <span className="text-[11px] font-medium truncate w-full">
                  {s.shortName}
                </span>
                {hasProjects && (
                  <span className="mt-0.5 text-[10px] font-mono px-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold">
                    {count} {count === 1 ? "proj" : "projs"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              Stage 0{selectedStage.step}:
            </span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {selectedStage.fullName.replace(/Phase \d+: /, "")}
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {selectedStageCount} active {selectedStageCount === 1 ? "project" : "projects"}
            </span>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden md:block max-w-md truncate">
            {selectedStage.description}
          </p>

          <Link
            href="/lifecycle"
            className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View Tasks in Board</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 4. Primary Content Area: My Projects (2/3) + Urgent Tasks & Blockers (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: My Active Projects (2/3 width) */}
        <div className="lg:col-span-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                My Projects
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {recentProjects.length} ACTIVE
              </span>
            </div>
            <Link
              href="/projects"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 flex items-center gap-1"
            >
              <span>All Projects</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-medium text-[11px] whitespace-nowrap">
                  <th className="py-2.5 pl-4 pr-2 font-medium">Project</th>
                  <th className="py-2.5 px-2 font-medium">Hardware Target</th>
                  <th className="py-2.5 px-2 font-medium">Lifecycle Phase</th>
                  <th className="py-2.5 px-2 font-medium">Task Progress</th>
                  <th className="py-2.5 pr-4 pl-2 text-center font-medium">Release Gate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {recentProjects.map((p: any) => (
                  <tr
                    key={p.id}
                    onClick={() => handleProjectClick(p.id)}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors"
                    title={`Click to open ${p.name} in Lifecycle workspace`}
                  >
                    <td className="py-3 pl-4 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800">
                          <Cpu className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
                            {p.name}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            {p.projectCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      <span className="truncate max-w-[130px] inline-block">
                        {p.mcu || p.hardwarePlatform || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 truncate max-w-[140px]">
                        {p.currentPhaseName ? p.currentPhaseName.replace(/Phase \d+: /, "") : "Requirements"}
                      </span>
                    </td>
                    <td className="py-3 px-2 min-w-[100px]">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {p.completedTasks}/{p.totalTasks}
                        </span>
                        <span className="font-mono text-zinc-500">
                          {p.devProgress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all"
                          style={{ width: `${p.devProgress}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 pr-4 pl-2 text-center whitespace-nowrap">
                      {p.releaseReady ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
                          <ShieldCheck className="w-3 h-3" />
                          Passed ({p.passedGates}/{p.totalGates})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                          <ShieldAlert className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Urgent Tasks & Blockers (1/3 width, compact list) */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Urgent Tasks
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              {urgentTasks.length + blockedTasks.length} ITEMS
            </span>
          </div>

          {/* Blocked Tasks Alert (compact notification) */}
          {blockedTasks.length > 0 && (
            <div className="p-2.5 px-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-xs text-zinc-900 dark:text-zinc-100 font-medium">
              <AlertOctagon className="w-4 h-4 shrink-0 text-zinc-900 dark:text-zinc-100" />
              <span>{blockedTasks.length} task(s) currently marked as Stuck / Blocked</span>
            </div>
          )}

          <div className="p-3 divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[380px] overflow-y-auto">
            {urgentTasks.length === 0 && blockedTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 space-y-1.5">
                <CheckCircle2 className="w-6 h-6 text-zinc-400 mx-auto" />
                <p>No urgent tasks or blockers.</p>
                <p className="text-[11px] text-zinc-400">All sprint tasks are on schedule.</p>
              </div>
            ) : (
              <>
                {/* Blocked Tasks First */}
                {blockedTasks.map((t: any) => (
                  <div key={t.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                        {t.title}
                      </span>
                      <StatusPill
                        status={t.status}
                        onChange={(s) => handleTaskStatusToggle(t.id, s)}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                        {t.project?.projectCode} • {t.phase?.name?.replace(/Phase \d+: /, "")}
                      </span>
                      <span className="font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-wider">
                        Blocker
                      </span>
                    </div>
                  </div>
                ))}

                {/* Overdue / Due Today */}
                {urgentTasks.map((t: any) => (
                  <div key={t.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {t.title}
                      </span>
                      <StatusPill
                        status={t.status}
                        onChange={(s) => handleTaskStatusToggle(t.id, s)}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">
                        {t.project?.projectCode} • {t.phase?.name?.replace(/Phase \d+: /, "")}
                      </span>
                      {t.dueDate && (
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {formatDate(t.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5. Product Release Gates (Lower Section, Clear & Organized) */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Product Release Gates Verification
              </h2>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Mandatory verification checks prior to firmware freeze, pilot rollout, or customer delivery.
            </p>
          </div>

          <Link
            href="/gates"
            className="btn-secondary h-8 px-3 text-xs inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Open Release Gates Suite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-medium text-[11px]">
                <th className="py-2.5 px-4 font-medium">Release Gate</th>
                <th className="py-2.5 px-3 font-medium">Target Project</th>
                <th className="py-2.5 px-3 font-medium">Gate Type</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Verification Progress</th>
                <th className="py-2.5 px-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {incompleteGates.slice(0, 5).map((g: any) => {
                const pct = g.totalItems > 0 ? Math.round((g.completedItems / g.totalItems) * 100) : 0;
                return (
                  <tr key={g.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {g.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        [{g.projectCode}]
                      </span>{" "}
                      <span className="text-zinc-600 dark:text-zinc-400">{g.projectName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 font-medium">
                        {g.gateType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusPill status={g.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 min-w-[130px]">
                      <div className="flex items-center justify-between text-[10px] mb-1 text-zinc-500">
                        <span>
                          {g.completedItems}/{g.totalItems} Passed
                        </span>
                        <span className="font-mono text-zinc-800 dark:text-zinc-200 font-medium">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href="/gates"
                        onClick={() => setSelectedProjectId(g.projectId)}
                        className="btn-secondary h-7 px-2.5 text-[11px]"
                      >
                        Inspect & Sign-off
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
