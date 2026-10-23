import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const phaseId = formData.get("phaseId") as string | null;
    const taskId = formData.get("taskId") as string | null;
    const gateItemId = formData.get("gateItemId") as string | null;
    const noteId = formData.get("noteId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sanitizedFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadsDir, sanitizedFileName);

    fs.writeFileSync(filePath, buffer);

    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.name,
        fileUrl: `/uploads/${sanitizedFileName}`,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        projectId: projectId || null,
        phaseId: phaseId || null,
        taskId: taskId || null,
        gateItemId: gateItemId || null,
        noteId: noteId || null,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error: unknown) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
