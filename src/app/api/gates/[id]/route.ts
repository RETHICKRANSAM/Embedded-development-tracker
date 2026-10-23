import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gate = await prisma.releaseGate.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectCode: true,
            status: true,
          },
        },
        items: {
          orderBy: { sequence: "asc" },
          include: {
            failures: {
              orderBy: { createdAt: "desc" },
            },
            attachments: true,
          },
        },
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!gate) {
      return NextResponse.json({ error: "Release gate not found" }, { status: 404 });
    }

    return NextResponse.json(gate);
  } catch (error: unknown) {
    console.error("Error fetching release gate:", error);
    return NextResponse.json({ error: "Failed to fetch gate" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const currentGate = await prisma.releaseGate.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!currentGate) {
      return NextResponse.json({ error: "Release gate not found" }, { status: 404 });
    }

    // Action: Mark Gate as Passed
    if (body.action === "pass") {
      // 1. Verify all mandatory items are "Passed"
      const incompleteMandatory = currentGate.items.filter(
        (item) => item.isMandatory && item.status !== "Passed"
      );
      if (incompleteMandatory.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot pass gate: ${incompleteMandatory.length} mandatory item(s) are incomplete or failed.`,
            incompleteItems: incompleteMandatory.map((i) => i.title),
          },
          { status: 400 }
        );
      }

      // 2. Check for unresolved blocking items
      const blockedItems = currentGate.items.filter((item) => item.status === "Blocked");
      if (blockedItems.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot pass gate: ${blockedItems.length} item(s) are blocked.`,
            blockedItems: blockedItems.map((i) => i.title),
          },
          { status: 400 }
        );
      }

      const fwVersion = body.firmwareVersion || currentGate.firmwareVersion || "v1.0.0";
      const hwRev = body.hardwareRevision || currentGate.hardwareRevision || "Rev A";
      const reviewNote = body.reviewNote || "All mandatory gate verifications confirmed and passed.";

      // Update gate to Passed
      const updatedGate = await prisma.releaseGate.update({
        where: { id },
        data: {
          status: "Passed",
          passedAt: new Date(),
          firmwareVersion: fwVersion,
          hardwareRevision: hwRev,
          reviewNote: reviewNote,
        },
      });

      // Record in GateHistory
      await prisma.gateHistory.create({
        data: {
          gateId: id,
          eventType: "PASSED",
          details: reviewNote,
          firmwareVersion: fwVersion,
          hardwareRevision: hwRev,
        },
      });

      return NextResponse.json(updatedGate);
    }

    // Action: Reopen Gate
    if (body.action === "reopen") {
      const reason = body.reason || "Reopened for re-verification.";
      const updatedGate = await prisma.releaseGate.update({
        where: { id },
        data: {
          status: "In Progress",
          passedAt: null,
        },
      });

      await prisma.gateHistory.create({
        data: {
          gateId: id,
          eventType: "REOPENED",
          details: reason,
          firmwareVersion: currentGate.firmwareVersion,
          hardwareRevision: currentGate.hardwareRevision,
        },
      });

      return NextResponse.json(updatedGate);
    }

    // Action: Update revisions or metadata
    const updatedGate = await prisma.releaseGate.update({
      where: { id },
      data: {
        firmwareVersion: body.firmwareVersion !== undefined ? body.firmwareVersion : undefined,
        hardwareRevision: body.hardwareRevision !== undefined ? body.hardwareRevision : undefined,
        reviewNote: body.reviewNote !== undefined ? body.reviewNote : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
    });

    // If revisions changed on an already passed gate, log warning history event
    if (
      currentGate.status === "Passed" &&
      ((body.firmwareVersion && body.firmwareVersion !== currentGate.firmwareVersion) ||
        (body.hardwareRevision && body.hardwareRevision !== currentGate.hardwareRevision))
    ) {
      await prisma.gateHistory.create({
        data: {
          gateId: id,
          eventType: "REVISION_CHANGED",
          details: `Configuration changed from FW:${currentGate.firmwareVersion}/HW:${currentGate.hardwareRevision} to FW:${body.firmwareVersion || currentGate.firmwareVersion}/HW:${body.hardwareRevision || currentGate.hardwareRevision}. Gate re-verification recommended.`,
          firmwareVersion: body.firmwareVersion || currentGate.firmwareVersion,
          hardwareRevision: body.hardwareRevision || currentGate.hardwareRevision,
        },
      });
    }

    return NextResponse.json(updatedGate);
  } catch (error: unknown) {
    console.error("Error updating release gate:", error);
    return NextResponse.json({ error: "Failed to update gate" }, { status: 500 });
  }
}
