import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        phases: {
          orderBy: { sequence: "asc" },
          include: {
            checklistItems: {
              orderBy: { sequence: "asc" },
            },
            tasks: {
              orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
              include: {
                checklistItems: { orderBy: { sequence: "asc" } },
                attachments: true,
              },
            },
            notes: {
              orderBy: { createdAt: "desc" },
              include: { attachments: true },
            },
            attachments: true,
          },
        },
        releaseGates: {
          orderBy: { createdAt: "asc" },
          include: {
            items: {
              orderBy: { sequence: "asc" },
              include: {
                failures: {
                  orderBy: { createdAt: "desc" },
                },
                attachments: true,
              },
            },
            history: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
          include: { attachments: true },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error: unknown) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // If currentPhaseId is changing, update the previous phase and new phase status if applicable
    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        description: body.description !== undefined ? body.description : undefined,
        category: body.category !== undefined ? body.category : undefined,
        hardwarePlatform: body.hardwarePlatform !== undefined ? body.hardwarePlatform : undefined,
        mcu: body.mcu !== undefined ? body.mcu : undefined,
        ide: body.ide !== undefined ? body.ide : undefined,
        language: body.language !== undefined ? body.language : undefined,
        rtos: body.rtos !== undefined ? body.rtos : undefined,
        repositoryUrl: body.repositoryUrl !== undefined ? body.repositoryUrl : undefined,
        status: body.status !== undefined ? body.status : undefined,
        currentPhaseId: body.currentPhaseId !== undefined ? body.currentPhaseId : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.project.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
