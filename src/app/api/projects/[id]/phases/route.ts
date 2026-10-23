import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const phases = await prisma.phase.findMany({
      where: { projectId: id },
      orderBy: { sequence: "asc" },
      include: {
        checklistItems: { orderBy: { sequence: "asc" } },
        tasks: true,
      },
    });
    return NextResponse.json(phases);
  } catch (error: unknown) {
    console.error("Error fetching phases:", error);
    return NextResponse.json({ error: "Failed to fetch phases" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: "Phase name is required" }, { status: 400 });
    }

    const lastPhase = await prisma.phase.findFirst({
      where: { projectId: id },
      orderBy: { sequence: "desc" },
    });
    const nextSeq = (lastPhase?.sequence ?? 0) + 1;

    const phase = await prisma.phase.create({
      data: {
        projectId: id,
        name: body.name,
        description: body.description || null,
        sequence: body.sequence ?? nextSeq,
        status: "Not Started",
      },
    });

    return NextResponse.json(phase, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating phase:", error);
    return NextResponse.json({ error: "Failed to create phase" }, { status: 500 });
  }
}
