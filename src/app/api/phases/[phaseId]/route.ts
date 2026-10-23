import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ phaseId: string }> }
) {
  try {
    const { phaseId } = await params;
    const body = await req.json();

    const updated = await prisma.phase.update({
      where: { id: phaseId },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        description: body.description !== undefined ? body.description : undefined,
        sequence: body.sequence !== undefined ? body.sequence : undefined,
        status: body.status !== undefined ? body.status : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        completedAt:
          body.status === "Completed"
            ? new Date()
            : body.status !== undefined
            ? null
            : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating phase:", error);
    return NextResponse.json({ error: "Failed to update phase" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ phaseId: string }> }
) {
  try {
    const { phaseId } = await params;
    await prisma.phase.delete({
      where: { id: phaseId },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting phase:", error);
    return NextResponse.json({ error: "Failed to delete phase" }, { status: 500 });
  }
}
