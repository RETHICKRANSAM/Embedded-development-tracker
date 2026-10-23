import { PrismaClient } from "@prisma/client";
import { DEFAULT_PHASES, DEFAULT_RELEASE_GATES } from "../src/lib/default-data";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.project.count();
  if (existing > 0) {
    console.log("Database already has projects, skipping seed.");
    return;
  }

  console.log("Seeding initial embedded projects...");

  // Project 1: STM32 Gateway
  const p1 = await prisma.project.create({
    data: {
      name: "STM32 Smart Sensor Gateway",
      projectCode: "STM32-GW",
      description: "Low-power environmental sensor concentrator using RS485 Modbus and SPI flash storage.",
      category: "Industrial Firmware",
      hardwarePlatform: "Nucleo-F401RE + Custom Shield",
      mcu: "STM32F401RE (ARM Cortex-M4 @ 84MHz)",
      ide: "STM32CubeIDE 1.15",
      language: "C99 / CMSIS",
      rtos: "FreeRTOS v10.4.3",
      repositoryUrl: "https://github.com/embedded-eng/stm32-sensor-gateway",
      status: "Active",
      startDate: new Date("2026-09-01"),
      targetDate: new Date("2026-11-15"),
    },
  });

  // Create default phases for STM32
  let p1Phase1Id = "";
  let p1Phase2Id = "";
  let p1Phase3Id = "";
  for (const ph of DEFAULT_PHASES) {
    const createdPhase = await prisma.phase.create({
      data: {
        projectId: p1.id,
        name: ph.name,
        description: ph.description,
        sequence: ph.sequence,
        status: ph.sequence < 3 ? "Completed" : ph.sequence === 3 ? "In Progress" : "Not Started",
      },
    });

    if (ph.sequence === 1) p1Phase1Id = createdPhase.id;
    if (ph.sequence === 2) p1Phase2Id = createdPhase.id;
    if (ph.sequence === 3) p1Phase3Id = createdPhase.id;

    for (let i = 0; i < ph.checklistItems.length; i++) {
      const it = ph.checklistItems[i];
      // Mark phase 1 and 2 items as passed
      const itemStatus = ph.sequence < 3 ? "Passed" : ph.sequence === 3 && i < 4 ? "Passed" : "Pending";
      await prisma.phaseChecklistItem.create({
        data: {
          projectId: p1.id,
          phaseId: createdPhase.id,
          title: it.title,
          sequence: i + 1,
          isMandatory: it.isMandatory,
          status: itemStatus,
        },
      });
    }
  }

  await prisma.project.update({
    where: { id: p1.id },
    data: { currentPhaseId: p1Phase3Id },
  });

  // Create release gates for STM32
  for (const gateTmpl of DEFAULT_RELEASE_GATES) {
    const gate = await prisma.releaseGate.create({
      data: {
        projectId: p1.id,
        name: gateTmpl.name,
        gateType: gateTmpl.gateType,
        status: gateTmpl.gateType === "DEMO" ? "In Progress" : "Not Started",
        firmwareVersion: "v0.3.1-beta",
        hardwareRevision: "Rev B",
      },
    });

    for (let i = 0; i < gateTmpl.items.length; i++) {
      const git = gateTmpl.items[i];
      await prisma.releaseGateItem.create({
        data: {
          gateId: gate.id,
          title: git.title,
          sequence: i + 1,
          isMandatory: git.isMandatory,
          status: gateTmpl.gateType === "DEMO" && i < 5 ? "Passed" : "Pending",
        },
      });
    }
  }

  // Create tasks for STM32
  await prisma.task.create({
    data: {
      projectId: p1.id,
      phaseId: p1Phase3Id,
      title: "Implement DMA circular buffer for UART2 Modbus transceiver",
      description: "Use DMA stream 6 with half-transfer and transfer-complete interrupts to handle asynchronous telemetry frames.",
      status: "In Progress",
      priority: "High",
      dueDate: new Date(Date.now() + 86400000 * 2),
      checklistItems: {
        create: [
          { title: "Configure USART2 baud rate to 115200bps 8E1", isCompleted: true, sequence: 1 },
          { title: "Hook up IDLE line interrupt for variable length frame detection", isCompleted: true, sequence: 2 },
          { title: "Verify frame boundary under burst noise", isCompleted: false, sequence: 3 },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      projectId: p1.id,
      phaseId: p1Phase3Id,
      title: "Write SPI flash wear-leveling log storage driver (W25Q64)",
      description: "SPI1 prescaler /4 (21MHz). Sector erase handling and checksum verification per 256-byte page.",
      status: "To Do",
      priority: "Medium",
      dueDate: new Date(Date.now() + 86400000 * 5),
    },
  });

  // Create engineering notes
  await prisma.note.create({
    data: {
      projectId: p1.id,
      phaseId: p1Phase2Id,
      title: "Clock configuration: HSI vs HSE 8MHz Crystal",
      content: "Found external 8MHz crystal load capacitor needs 18pF instead of 22pF. Clock PLL locked cleanly at 84MHz with M=8, N=336, P=4. Verified MCO1 pin output on oscilloscope.",
      category: "Hardware",
    },
  });

  await prisma.note.create({
    data: {
      projectId: p1.id,
      phaseId: p1Phase3Id,
      title: "FreeRTOS stack overflow mitigation on SensorTask",
      content: "SensorTask stack depth increased from 256 to 512 words due to sprintf floating point formatting in debug builds. Using uxTaskGetStackHighWaterMark() to verify watermark headroom (currently 180 words free).",
      category: "Firmware",
    },
  });

  // Project 2: ESP32 Matter
  const p2 = await prisma.project.create({
    data: {
      name: "ESP32-S3 Matter Smart Energy Monitor",
      projectCode: "ESP32-MATTER",
      description: "Matter-over-Wi-Fi smart plug energy monitor reading voltage, current, and true power over ADE7953 SPI.",
      category: "IoT / Edge AI",
      hardwarePlatform: "ESP32-S3-DevKitC-1 + ADE7953 breakout",
      mcu: "ESP32-S3 Dual Core Xtensa LX7 @ 240MHz",
      ide: "VS Code + ESP-IDF 5.2.1",
      language: "C / C++20",
      rtos: "FreeRTOS (ESP-IDF SMP)",
      repositoryUrl: "https://github.com/embedded-eng/esp32-matter-energy",
      status: "Active",
      startDate: new Date("2026-09-15"),
      targetDate: new Date("2026-12-01"),
    },
  });

  let p2Phase1Id = "";
  for (const ph of DEFAULT_PHASES) {
    const createdPhase = await prisma.phase.create({
      data: {
        projectId: p2.id,
        name: ph.name,
        description: ph.description,
        sequence: ph.sequence,
        status: ph.sequence === 1 ? "In Progress" : "Not Started",
      },
    });

    if (ph.sequence === 1) p2Phase1Id = createdPhase.id;

    for (let i = 0; i < ph.checklistItems.length; i++) {
      const it = ph.checklistItems[i];
      await prisma.phaseChecklistItem.create({
        data: {
          projectId: p2.id,
          phaseId: createdPhase.id,
          title: it.title,
          sequence: i + 1,
          isMandatory: it.isMandatory,
          status: ph.sequence === 1 && i < 3 ? "Passed" : "Pending",
        },
      });
    }
  }

  await prisma.project.update({
    where: { id: p2.id },
    data: { currentPhaseId: p2Phase1Id },
  });

  for (const gateTmpl of DEFAULT_RELEASE_GATES) {
    const gate = await prisma.releaseGate.create({
      data: {
        projectId: p2.id,
        name: gateTmpl.name,
        gateType: gateTmpl.gateType,
        status: "Not Started",
        firmwareVersion: "v0.1.0-alpha",
        hardwareRevision: "Rev A",
      },
    });

    for (let i = 0; i < gateTmpl.items.length; i++) {
      const git = gateTmpl.items[i];
      await prisma.releaseGateItem.create({
        data: {
          gateId: gate.id,
          title: git.title,
          sequence: i + 1,
          isMandatory: git.isMandatory,
          status: "Pending",
        },
      });
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
