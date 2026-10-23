import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const format = searchParams.get("format") || "json"; // "json" | "csv_gates" | "csv_checklists"

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          phases: {
            include: {
              checklistItems: true,
              tasks: { include: { checklistItems: true } },
              notes: true,
            },
          },
          releaseGates: {
            include: {
              items: { include: { failures: true } },
              history: true,
            },
          },
          notes: true,
        },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      if (format === "csv_gates") {
        const rows: string[] = [
          "Gate Name,Gate Type,Gate Status,Item Title,Mandatory,Item Status,Notes,Failures Count",
        ];
        project.releaseGates.forEach((g) => {
          g.items.forEach((item) => {
            const cleanTitle = `"${(item.title || "").replace(/"/g, '""')}"`;
            const cleanNotes = `"${(item.notes || "").replace(/"/g, '""')}"`;
            rows.push(
              `"${g.name}","${g.gateType}","${g.status}",${cleanTitle},${item.isMandatory ? "YES" : "NO"},"${item.status}",${cleanNotes},${item.failures.length}`
            );
          });
        });
        const csvContent = rows.join("\n");
        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${project.projectCode}_release_gates.csv"`,
          },
        });
      }

      if (format === "csv_checklists") {
        const rows: string[] = [
          "Phase Name,Item Title,Mandatory,Status,Notes",
        ];
        project.phases.forEach((ph) => {
          ph.checklistItems.forEach((item) => {
            const cleanTitle = `"${(item.title || "").replace(/"/g, '""')}"`;
            const cleanNotes = `"${(item.notes || "").replace(/"/g, '""')}"`;
            rows.push(
              `"${ph.name}",${cleanTitle},${item.isMandatory ? "YES" : "NO"},"${item.status}",${cleanNotes}`
            );
          });
        });
        const csvContent = rows.join("\n");
        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${project.projectCode}_phase_checklists.csv"`,
          },
        });
      }

      // Default: JSON export
      const jsonContent = JSON.stringify(project, null, 2);
      return new NextResponse(jsonContent, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${project.projectCode}_export.json"`,
        },
      });
    }

    // Export all projects JSON
    const allProjects = await prisma.project.findMany({
      include: {
        phases: {
          include: {
            checklistItems: true,
            tasks: { include: { checklistItems: true } },
            notes: true,
          },
        },
        releaseGates: {
          include: {
            items: { include: { failures: true } },
            history: true,
          },
        },
        notes: true,
      },
    });

    const fullExport = JSON.stringify(allProjects, null, 2);
    return new NextResponse(fullExport, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="embedded_dev_all_projects_${Date.now()}.json"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error exporting data:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
