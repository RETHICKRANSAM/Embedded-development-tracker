import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gateId } = await params;
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const lastItem = await prisma.releaseGateItem.findFirst({
      where: { gateId },
      orderBy: { sequence: "desc" },
    });
    const nextSeq = (lastItem?.sequence ?? 0) + 1;

    const item = await prisma.releaseGateItem.create({
      data: {
        gateId,
        title: body.title,
        description: body.description || null,
        isMandatory: body.isMandatory !== undefined ? Boolean(body.isMandatory) : true,
        sequence: nextSeq,
        status: "Pending",
        notes: body.notes || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating release gate item:", error);
    return NextResponse.json({ error: "Failed to create gate item" }, { status: 500 });
  }
}
