import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Projects overview
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        phases: {
          orderBy: { sequence: "asc" },
          select: { id: true, name: true, sequence: true, status: true },
        },
        tasks: {
          select: { id: true, status: true, priority: true, dueDate: true },
        },
        phaseChecklistItems: {
          select: { id: true, status: true, isMandatory: true },
        },
        releaseGates: {
          select: {
            id: true,
            name: true,
            gateType: true,
            status: true,
            passedAt: true,
            items: {
              select: { id: true, status: true, isMandatory: true, title: true },
            },
          },
        },
      },
    });

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "Active").length;
    const completedProjects = projects.filter((p) => p.status === "Completed").length;
    const onHoldProjects = projects.filter((p) => p.status === "On Hold").length;

    // 2. All Tasks aggregation
    const allTasks = await prisma.task.findMany({
      include: {
        project: { select: { id: true, name: true, projectCode: true } },
        phase: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    });

    const tasksDueToday = allTasks.filter((t) => {
      if (!t.dueDate || t.status === "Done") return false;
      const d = new Date(t.dueDate);
      return d >= today && d < tomorrow;
    });

    const overdueTasks = allTasks.filter((t) => {
      if (!t.dueDate || t.status === "Done") return false;
      const d = new Date(t.dueDate);
      return d < today;
    });

    const pendingTasks = allTasks.filter((t) => t.status === "Pending" || t.status === "To Do");
    const blockedTasks = allTasks.filter((t) => t.status === "Blocked");

    // 3. Projects per phase distribution
    const phaseDistribution: Record<string, number> = {
      "Phase 1: Requirements and Planning": 0,
      "Phase 2: Hardware Study and Bring-up": 0,
      "Phase 3: Firmware Architecture and Development": 0,
      "Phase 4: Unit and Integration Testing": 0,
      "Phase 5: System Validation and Stress Testing": 0,
      "Phase 6: Demo or Pilot Preparation": 0,
      "Phase 7: Post-Demo Review": 0,
    };

    projects.forEach((p) => {
      if (p.status !== "Completed" && p.status !== "Archived") {
        const currentPh = p.phases.find((ph) => ph.id === p.currentPhaseId) || p.phases[0];
        if (currentPh) {
          phaseDistribution[currentPh.name] = (phaseDistribution[currentPh.name] || 0) + 1;
        }
      }
    });

    // 4. Incomplete Release Gates across projects
    const incompleteGates: Array<{
      id: string;
      name: string;
      gateType: string;
      status: string;
      projectId: string;
      projectName: string;
      projectCode: string;
      totalItems: number;
      completedItems: number;
      incompleteItems: number;
      blockedItems: number;
    }> = [];

    projects.forEach((p) => {
      p.releaseGates.forEach((g) => {
        if (g.status !== "Passed") {
          const totalItems = g.items.length;
          const completedItems = g.items.filter((i) => i.status === "Passed").length;
          const blockedItems = g.items.filter((i) => i.status === "Blocked" || i.status === "Failed").length;
          incompleteGates.push({
            id: g.id,
            name: g.name,
            gateType: g.gateType,
            status: g.status,
            projectId: p.id,
            projectName: p.name,
            projectCode: p.projectCode,
            totalItems,
            completedItems,
            incompleteItems: totalItems - completedItems,
            blockedItems,
          });
        }
      });
    });

    // 5. Recent projects with calculated dev progress and release readiness
    const recentProjects = projects.slice(0, 5).map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === "Done").length;
      const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const totalChecklists = p.phaseChecklistItems.length;
      const passedChecklists = p.phaseChecklistItems.filter((i) => i.status === "Passed").length;
      const checklistProgress =
        totalChecklists > 0 ? Math.round((passedChecklists / totalChecklists) * 100) : 0;

      let devProgress = 0;
      if (totalTasks > 0 && totalChecklists > 0) {
        devProgress = Math.round((taskProgress + checklistProgress) / 2);
      } else if (totalTasks > 0) {
        devProgress = taskProgress;
      } else if (totalChecklists > 0) {
        devProgress = checklistProgress;
      }

      const totalGates = p.releaseGates.length;
      const passedGates = p.releaseGates.filter((g) => g.status === "Passed").length;
      const currentPhase = p.phases.find((ph) => ph.id === p.currentPhaseId) || p.phases[0] || null;

      return {
        id: p.id,
        name: p.name,
        projectCode: p.projectCode,
        category: p.category,
        hardwarePlatform: p.hardwarePlatform,
        mcu: p.mcu,
        status: p.status,
        updatedAt: p.updatedAt,
        currentPhaseName: currentPhase?.name ?? "Requirements",
        totalTasks,
        completedTasks,
        devProgress,
        totalGates,
        passedGates,
        releaseReady: p.releaseGates.some((g) => g.status === "Passed"),
      };
    });

    return NextResponse.json({
      metrics: {
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        tasksDueTodayCount: tasksDueToday.length,
        overdueTasksCount: overdueTasks.length,
        pendingTasksCount: pendingTasks.length,
        blockedTasksCount: blockedTasks.length,
      },
      tasksDueToday: tasksDueToday.slice(0, 6),
      overdueTasks: overdueTasks.slice(0, 6),
      blockedTasks: blockedTasks.slice(0, 6),
      phaseDistribution,
      incompleteGates: incompleteGates.slice(0, 8),
      recentProjects,
    });
  } catch (error: unknown) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
