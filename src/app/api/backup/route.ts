import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dbPath = path.resolve(process.cwd(), "dev.db");
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "Database file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/x-sqlite3",
        "Content-Disposition": `attachment; filename="dev_backup_${new Date().toISOString().slice(0, 10)}.db"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error backing up database:", error);
    return NextResponse.json({ error: "Failed to backup database" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid backup format: expected array of projects" },
        { status: 400 }
      );
    }

    let restoredCount = 0;
    for (const projectData of body) {
      if (!projectData.name || !projectData.projectCode) continue;

      // Check if project exists by projectCode
      const existing = await prisma.project.findUnique({
        where: { projectCode: projectData.projectCode },
      });

      if (existing) {
        continue; // skip existing to prevent overwriting accidentally
      }

      await prisma.project.create({
        data: {
          name: projectData.name,
          projectCode: projectData.projectCode,
          description: projectData.description || null,
          category: projectData.category || null,
          hardwarePlatform: projectData.hardwarePlatform || null,
          mcu: projectData.mcu || null,
          ide: projectData.ide || null,
          language: projectData.language || null,
          rtos: projectData.rtos || null,
          repositoryUrl: projectData.repositoryUrl || null,
          status: projectData.status || "Active",
          startDate: projectData.startDate ? new Date(projectData.startDate) : null,
          targetDate: projectData.targetDate ? new Date(projectData.targetDate) : null,
          phases: projectData.phases?.length
            ? {
                create: projectData.phases.map((ph: any) => ({
                  name: ph.name,
                  description: ph.description || null,
                  sequence: ph.sequence || 1,
                  status: ph.status || "Not Started",
                  checklistItems: ph.checklistItems?.length
                    ? {
                        create: ph.checklistItems.map((ci: any) => ({
                          title: ci.title,
                          description: ci.description || null,
                          sequence: ci.sequence || 1,
                          isMandatory: ci.isMandatory !== undefined ? ci.isMandatory : true,
                          status: ci.status || "Pending",
                          notes: ci.notes || null,
                        })),
                      }
                    : undefined,
                  tasks: ph.tasks?.length
                    ? {
                        create: ph.tasks.map((t: any) => ({
                          projectId: projectData.id,
                          title: t.title,
                          description: t.description || null,
                          status: t.status || "To Do",
                          priority: t.priority || "Medium",
                          dueDate: t.dueDate ? new Date(t.dueDate) : null,
                        })),
                      }
                    : undefined,
                })),
              }
            : undefined,
          releaseGates: projectData.releaseGates?.length
            ? {
                create: projectData.releaseGates.map((g: any) => ({
                  name: g.name,
                  gateType: g.gateType,
                  status: g.status || "Not Started",
                  firmwareVersion: g.firmwareVersion || null,
                  hardwareRevision: g.hardwareRevision || null,
                  reviewNote: g.reviewNote || null,
                  items: g.items?.length
                    ? {
                        create: g.items.map((gi: any) => ({
                          title: gi.title,
                          description: gi.description || null,
                          isMandatory: gi.isMandatory !== undefined ? gi.isMandatory : true,
                          status: gi.status || "Pending",
                          notes: gi.notes || null,
                          sequence: gi.sequence || 1,
                        })),
                      }
                    : undefined,
                })),
              }
            : undefined,
        },
      });
      restoredCount++;
    }

    return NextResponse.json({ success: true, restoredCount });
  } catch (error: unknown) {
    console.error("Error restoring backup:", error);
    return NextResponse.json({ error: "Failed to restore backup" }, { status: 500 });
  }
}
