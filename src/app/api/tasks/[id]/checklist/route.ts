import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const lastItem = await prisma.taskChecklistItem.findFirst({
      where: { taskId },
      orderBy: { sequence: "desc" },
    });
    const nextSeq = (lastItem?.sequence ?? 0) + 1;

    const item = await prisma.taskChecklistItem.create({
      data: {
        taskId,
        title: body.title,
        sequence: nextSeq,
        isCompleted: false,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating task checklist item:", error);
    return NextResponse.json({ error: "Failed to add checklist item" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params; // consume params
    const body = await req.json();
    const { itemId, isCompleted, title } = body;

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const updated = await prisma.taskChecklistItem.update({
      where: { id: itemId },
      data: {
        title: title !== undefined ? title : undefined,
        isCompleted: isCompleted !== undefined ? isCompleted : undefined,
        completedAt: isCompleted === true ? new Date() : isCompleted === false ? null : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating task checklist item:", error);
    return NextResponse.json({ error: "Failed to update checklist item" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    await prisma.taskChecklistItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting task checklist item:", error);
    return NextResponse.json({ error: "Failed to delete checklist item" }, { status: 500 });
  }
}
