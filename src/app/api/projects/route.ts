import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProjectWithDefaults } from "@/lib/project-service";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        phases: {
          orderBy: { sequence: "asc" },
          select: {
            id: true,
            name: true,
            sequence: true,
            status: true,
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
        phaseChecklistItems: {
          select: {
            id: true,
            status: true,
            isMandatory: true,
          },
        },
        releaseGates: {
          select: {
            id: true,
            name: true,
            gateType: true,
            status: true,
            passedAt: true,
            firmwareVersion: true,
            hardwareRevision: true,
            items: {
              select: {
                id: true,
                status: true,
                isMandatory: true,
              },
            },
          },
        },
      },
    });

    const enriched = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === "Done").length;
      const blockedTasks = p.tasks.filter((t) => t.status === "Blocked").length;
      const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const totalChecklists = p.phaseChecklistItems.length;
      const passedChecklists = p.phaseChecklistItems.filter((i) => i.status === "Passed").length;
      const checklistProgress =
        totalChecklists > 0 ? Math.round((passedChecklists / totalChecklists) * 100) : 0;

      // Overall development progress (weighted evenly between tasks and checklist items if both exist)
      let overallProgress = 0;
      if (totalTasks > 0 && totalChecklists > 0) {
        overallProgress = Math.round((taskProgress + checklistProgress) / 2);
      } else if (totalTasks > 0) {
        overallProgress = taskProgress;
      } else if (totalChecklists > 0) {
        overallProgress = checklistProgress;
      }

      // Gate stats
      const totalGates = p.releaseGates.length;
      const passedGates = p.releaseGates.filter((g) => g.status === "Passed").length;

      const currentPhase = p.phases.find((ph) => ph.id === p.currentPhaseId) || p.phases[0] || null;

      return {
        ...p,
        currentPhaseName: currentPhase?.name ?? "Requirements",
        totalTasks,
        completedTasks,
        blockedTasks,
        taskProgress,
        totalChecklists,
        passedChecklists,
        checklistProgress,
        overallProgress,
        totalGates,
        passedGates,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: unknown) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.projectCode) {
      return NextResponse.json(
        { error: "Project name and project code are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findUnique({
      where: { projectCode: body.projectCode.trim().toUpperCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A project with this project code already exists" },
        { status: 400 }
      );
    }

    const project = await createProjectWithDefaults({
      name: body.name,
      projectCode: body.projectCode,
      description: body.description,
      category: body.category,
      hardwarePlatform: body.hardwarePlatform,
      mcu: body.mcu,
      ide: body.ide,
      language: body.language,
      rtos: body.rtos,
      repositoryUrl: body.repositoryUrl,
      startDate: body.startDate,
      targetDate: body.targetDate,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
