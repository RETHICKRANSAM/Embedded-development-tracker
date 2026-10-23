import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.projectId || !body.phaseId || !body.title) {
      return NextResponse.json(
        { error: "projectId, phaseId, and title are required" },
        { status: 400 }
      );
    }

    const lastItem = await prisma.phaseChecklistItem.findFirst({
      where: { phaseId: body.phaseId },
      orderBy: { sequence: "desc" },
    });
    const nextSeq = (lastItem?.sequence ?? 0) + 1;

    const item = await prisma.phaseChecklistItem.create({
      data: {
        projectId: body.projectId,
        phaseId: body.phaseId,
        title: body.title,
        description: body.description || null,
        isMandatory: body.isMandatory !== undefined ? Boolean(body.isMandatory) : true,
        sequence: body.sequence ?? nextSeq,
        status: body.status || "Pending",
        notes: body.notes || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating phase checklist item:", error);
    return NextResponse.json({ error: "Failed to create checklist item" }, { status: 500 });
  }
}
