import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gateItemId } = await params;
    const body = await req.json();

    if (!body.description) {
      return NextResponse.json({ error: "Failure description is required" }, { status: 400 });
    }

    const gateItem = await prisma.releaseGateItem.findUnique({
      where: { id: gateItemId },
      include: { gate: { include: { project: { include: { phases: true } } } } },
    });

    if (!gateItem) {
      return NextResponse.json({ error: "Gate item not found" }, { status: 404 });
    }

    // 1. Create the GateFailure record
    const failure = await prisma.gateFailure.create({
      data: {
        gateItemId,
        description: body.description,
        expectedBehavior: body.expectedBehavior || null,
        actualBehavior: body.actualBehavior || null,
        correctiveAction: body.correctiveAction || null,
        status: "Failed",
      },
    });

    // 2. Set GateItem status to "Failed"
    await prisma.releaseGateItem.update({
      where: { id: gateItemId },
      data: { status: "Failed" },
    });

    // 3. Set Gate status to "Blocked"
    await prisma.releaseGate.update({
      where: { id: gateItem.gateId },
      data: { status: "Blocked" },
    });

    // 4. Optionally create a corrective Task
    let createdTask = null;
    if (body.createTask && body.correctiveAction) {
      const targetPhaseId =
        gateItem.gate.project.currentPhaseId ||
        gateItem.gate.project.phases[0]?.id;

      if (targetPhaseId) {
        createdTask = await prisma.task.create({
          data: {
            projectId: gateItem.gate.projectId,
            phaseId: targetPhaseId,
            title: `[Fix Gate Failure] ${gateItem.title}`,
            description: `Corrective action for failed gate check '${gateItem.title}':\n\n${body.correctiveAction}\n\nActual Behavior: ${body.actualBehavior || "N/A"}\nExpected: ${body.expectedBehavior || "N/A"}`,
            priority: "Critical",
            status: "To Do",
          },
        });
      }
    }

    return NextResponse.json({ failure, createdTask }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error logging gate failure:", error);
    return NextResponse.json({ error: "Failed to log failure" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gateItemId } = await params;
    const body = await req.json();
    const { failureId, status, correctiveAction, retestResult, markItemPassed } = body;

    if (!failureId) {
      return NextResponse.json({ error: "failureId is required" }, { status: 400 });
    }

    const updatedFailure = await prisma.gateFailure.update({
      where: { id: failureId },
      data: {
        status: status !== undefined ? status : undefined,
        correctiveAction: correctiveAction !== undefined ? correctiveAction : undefined,
        retestResult: retestResult !== undefined ? retestResult : undefined,
        resolvedAt: status === "Verified" ? new Date() : undefined,
      },
    });

    // If verified and user chose to mark the gate item as passed
    if (status === "Verified" && markItemPassed) {
      await prisma.releaseGateItem.update({
        where: { id: gateItemId },
        data: { status: "Passed" },
      });

      // Recalculate gate status
      const gateItem = await prisma.releaseGateItem.findUnique({
        where: { id: gateItemId },
        include: { gate: { include: { items: true } } },
      });

      if (gateItem && gateItem.gate.status !== "Passed") {
        const allItems = await prisma.releaseGateItem.findMany({
          where: { gateId: gateItem.gateId },
        });
        const mandatoryItems = allItems.filter((i) => i.isMandatory);
        const allPassed =
          mandatoryItems.length > 0 &&
          mandatoryItems.every((i) => i.status === "Passed");
        const hasBlocked = allItems.some((i) => i.status === "Blocked" || i.status === "Failed");

        await prisma.releaseGate.update({
          where: { id: gateItem.gateId },
          data: {
            status: hasBlocked
              ? "Blocked"
              : allPassed
              ? "Ready for Review"
              : "In Progress",
          },
        });
      }
    }

    return NextResponse.json(updatedFailure);
  } catch (error: unknown) {
    console.error("Error updating failure:", error);
    return NextResponse.json({ error: "Failed to update failure" }, { status: 500 });
  }
}
