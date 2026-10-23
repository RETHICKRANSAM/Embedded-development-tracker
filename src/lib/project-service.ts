import { prisma } from "./prisma";
import { DEFAULT_PHASES, DEFAULT_RELEASE_GATES } from "./default-data";

export interface CreateProjectInput {
  name: string;
  projectCode: string;
  description?: string;
  category?: string;
  hardwarePlatform?: string;
  mcu?: string;
  ide?: string;
  language?: string;
  rtos?: string;
  repositoryUrl?: string;
  startDate?: string | Date;
  targetDate?: string | Date;
}

export async function createProjectWithDefaults(input: CreateProjectInput) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the project
    const project = await tx.project.create({
      data: {
        name: input.name,
        projectCode: input.projectCode.trim().toUpperCase(),
        description: input.description || null,
        category: input.category || "Firmware",
        hardwarePlatform: input.hardwarePlatform || null,
        mcu: input.mcu || null,
        ide: input.ide || null,
        language: input.language || null,
        rtos: input.rtos || null,
        repositoryUrl: input.repositoryUrl || null,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
        status: "Active",
      },
    });

    // 2. Create the 7 default phases with their checklists
    let firstPhaseId: string | null = null;

    for (const phaseTmpl of DEFAULT_PHASES) {
      const createdPhase = await tx.phase.create({
        data: {
          projectId: project.id,
          name: phaseTmpl.name,
          description: phaseTmpl.description,
          sequence: phaseTmpl.sequence,
          status: phaseTmpl.sequence === 1 ? "In Progress" : "Not Started",
        },
      });

      if (phaseTmpl.sequence === 1) {
        firstPhaseId = createdPhase.id;
      }

      // Create checklist items for this phase
      for (let i = 0; i < phaseTmpl.checklistItems.length; i++) {
        const item = phaseTmpl.checklistItems[i];
        await tx.phaseChecklistItem.create({
          data: {
            projectId: project.id,
            phaseId: createdPhase.id,
            title: item.title,
            sequence: i + 1,
            isMandatory: item.isMandatory,
            status: "Pending",
          },
        });
      }
    }

    // 3. Update currentPhaseId to the first phase
    if (firstPhaseId) {
      await tx.project.update({
        where: { id: project.id },
        data: { currentPhaseId: firstPhaseId },
      });
    }

    // 4. Create the 3 default release gates with their checklist items
    for (const gateTmpl of DEFAULT_RELEASE_GATES) {
      const gate = await tx.releaseGate.create({
        data: {
          projectId: project.id,
          name: gateTmpl.name,
          gateType: gateTmpl.gateType,
          status: "Not Started",
        },
      });

      // Create gate items
      for (let i = 0; i < gateTmpl.items.length; i++) {
        const item = gateTmpl.items[i];
        await tx.releaseGateItem.create({
          data: {
            gateId: gate.id,
            title: item.title,
            sequence: i + 1,
            isMandatory: item.isMandatory,
            status: "Pending",
          },
        });
      }
    }

    return project;
  });
}
