import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const currentItem = await prisma.releaseGateItem.findUnique({
      where: { id },
      include: { gate: { include: { items: true } } },
    });

    if (!currentItem) {
      return NextResponse.json({ error: "Gate item not found" }, { status: 404 });
    }

    const updatedItem = await prisma.releaseGateItem.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        status: body.status !== undefined ? body.status : undefined,
        isMandatory: body.isMandatory !== undefined ? Boolean(body.isMandatory) : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
    });

    // Check overall gate items to dynamically update gate status if gate is not yet "Passed"
    if (currentItem.gate.status !== "Passed") {
      const allItems = await prisma.releaseGateItem.findMany({
        where: { gateId: currentItem.gateId },
      });

      const mandatoryItems = allItems.filter((i) => i.isMandatory);
      const allMandatoryPassed =
        mandatoryItems.length > 0 &&
        mandatoryItems.every((i) => i.status === "Passed");
      const hasBlocked = allItems.some((i) => i.status === "Blocked" || i.status === "Failed");

      let newGateStatus = currentItem.gate.status;
      if (hasBlocked) {
        newGateStatus = "Blocked";
      } else if (allMandatoryPassed) {
        newGateStatus = "Ready for Review";
      } else if (allItems.some((i) => i.status === "Passed" || i.status === "In Progress")) {
        newGateStatus = "In Progress";
      } else {
        newGateStatus = "Not Started";
      }

      if (newGateStatus !== currentItem.gate.status) {
        await prisma.releaseGate.update({
          where: { id: currentItem.gateId },
          data: { status: newGateStatus },
        });
      }
    }

    return NextResponse.json(updatedItem);
  } catch (error: unknown) {
    console.error("Error updating gate item:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.releaseGateItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting gate item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
