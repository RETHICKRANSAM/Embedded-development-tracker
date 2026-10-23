import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const phaseId = searchParams.get("phaseId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (phaseId) where.phaseId = phaseId;
    if (category && category !== "All") where.category = category;
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { content: { contains: search.trim() } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        project: { select: { id: true, name: true, projectCode: true } },
        phase: { select: { id: true, name: true } },
        attachments: true,
      },
    });

    return NextResponse.json(notes);
  } catch (error: unknown) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.projectId || !body.title || !body.content) {
      return NextResponse.json(
        { error: "projectId, title, and content are required" },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        projectId: body.projectId,
        phaseId: body.phaseId || null,
        title: body.title,
        content: body.content,
        category: body.category || "General",
      },
      include: {
        project: { select: { id: true, name: true, projectCode: true } },
        phase: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
