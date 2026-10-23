import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const phaseId = searchParams.get("phaseId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (phaseId) where.phaseId = phaseId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        checklistItems: { orderBy: { sequence: "asc" } },
        phase: { select: { id: true, name: true, sequence: true } },
        project: { select: { id: true, name: true, projectCode: true } },
        attachments: true,
      },
    });

    return NextResponse.json(tasks);
  } catch (error: unknown) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.projectId || !body.phaseId || !body.title) {
      return NextResponse.json(
        { error: "projectId, phaseId, and title are required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        projectId: body.projectId,
        phaseId: body.phaseId,
        title: body.title,
        description: body.description || null,
        status: body.status || "To Do",
        priority: body.priority || "Medium",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        checklistItems: body.checklistItems?.length
          ? {
              create: body.checklistItems.map((item: { title: string }, index: number) => ({
                title: item.title,
                sequence: index + 1,
                isCompleted: false,
              })),
            }
          : undefined,
      },
      include: {
        checklistItems: true,
        phase: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
