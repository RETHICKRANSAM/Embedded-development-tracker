// Demo/mock data for static GitHub Pages deployment (no backend API)
// Provides realistic embedded engineering project data for showcase purposes

import { DEFAULT_PHASES, DEFAULT_RELEASE_GATES } from "./default-data";

// ─── Utility ──────────────────────────────────────────────────────────────────
let _id = 0;
function uid(prefix = "demo") {
  return `${prefix}-${String(++_id).padStart(4, "0")}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// ─── Phase Templates ─────────────────────────────────────────────────────────
function buildPhases(projectId: string) {
  return DEFAULT_PHASES.map((pt, idx) => {
    const phaseId = uid("phase");
    const checklistItems = pt.checklistItems.map((ci) => ({
      id: uid("pci"),
      phaseId,
      projectId,
      title: ci.title,
      description: ci.description || null,
      isMandatory: ci.isMandatory,
      status: idx < 2 ? "Passed" : idx === 2 ? "In Progress" : "Not Started",
      verifiedAt: idx < 2 ? daysAgo(10 - idx * 3) : null,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(idx < 2 ? 5 : 20),
    }));
    return {
      id: phaseId,
      projectId,
      name: pt.name,
      description: pt.description,
      sequence: pt.sequence,
      status: idx < 2 ? "Completed" : idx === 2 ? "In Progress" : "Not Started",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(5),
      checklistItems,
    };
  });
}

// ─── Release Gates ───────────────────────────────────────────────────────────
function buildGates(projectId: string) {
  return DEFAULT_RELEASE_GATES.map((gt, gIdx) => {
    const gateId = uid("gate");
    const items = gt.items.map((gi, iIdx) => {
      let status = "Not Started";
      if (gIdx === 0 && iIdx < 8) status = "Passed";
      else if (gIdx === 0 && iIdx === 8) status = "In Progress";
      return {
        id: uid("gi"),
        releaseGateId: gateId,
        title: gi.title,
        description: gi.description || null,
        isMandatory: gi.isMandatory,
        status,
        verifiedAt: status === "Passed" ? daysAgo(5) : null,
        notes: null,
        failures: [],
        createdAt: daysAgo(30),
        updatedAt: daysAgo(3),
      };
    });
    return {
      id: gateId,
      projectId,
      name: gt.name,
      gateType: gt.gateType,
      status: gIdx === 0 ? "In Progress" : "Not Started",
      passedAt: null,
      firmwareVersion: null,
      hardwareRevision: null,
      reviewNote: null,
      items,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(2),
    };
  });
}

// ─── Demo Projects ───────────────────────────────────────────────────────────
const PROJECT_SEEDS = [
  {
    name: "Smart Sensor Hub — STM32",
    projectCode: "PROJ-SENSOR",
    description: "Multi-sensor fusion hub with BLE and LoRa uplink for industrial monitoring. Collects temperature, humidity, vibration, and air quality data.",
    category: "IoT / Industrial",
    hardwarePlatform: "STM32 Nucleo-144",
    mcu: "STM32H743ZI",
    ide: "STM32CubeIDE",
    language: "C / FreeRTOS",
    rtos: "FreeRTOS",
    repositoryUrl: "https://github.com/example/sensor-hub",
    status: "Active",
  },
  {
    name: "Motor Controller — ESP32",
    projectCode: "PROJ-MOTOR",
    description: "BLDC motor controller with FOC algorithm, CAN bus feedback, and OTA firmware update capability.",
    category: "Motor Control",
    hardwarePlatform: "ESP32-S3-DevKitC",
    mcu: "ESP32-S3",
    ide: "ESP-IDF / VS Code",
    language: "C",
    rtos: "FreeRTOS (ESP-IDF)",
    repositoryUrl: "https://github.com/example/motor-ctrl",
    status: "Active",
  },
  {
    name: "Battery Management System",
    projectCode: "PROJ-BMS",
    description: "6-cell Li-ion BMS with cell balancing, SOC estimation, CAN reporting, and safety cutoff logic.",
    category: "Power Systems",
    hardwarePlatform: "Custom PCB Rev2",
    mcu: "STM32G474RE",
    ide: "STM32CubeIDE",
    language: "C",
    rtos: "Bare-metal",
    repositoryUrl: "",
    status: "Active",
  },
];

function buildDemoProjects() {
  return PROJECT_SEEDS.map((seed, pIdx) => {
    const projectId = uid("proj");
    const phases = buildPhases(projectId);
    const gates = buildGates(projectId);

    // Build tasks for the first 3 phases
    const tasks: any[] = [];
    const taskTitles: Record<number, string[]> = {
      0: [
        "Define system architecture and block diagram",
        "Finalize BOM and component selection",
        "Create pinout allocation spreadsheet",
        "Document power budget analysis",
        "Set up version control repository",
      ],
      1: [
        "Verify 3.3V and 5V power rails",
        "Test crystal oscillator with scope",
        "Validate SWD debugger connection",
        "Verify UART console output at 115200",
        "Test I2C bus pull-ups and addressing",
      ],
      2: [
        "Implement HAL initialization sequence",
        "Write SPI flash driver",
        "Implement sensor data acquisition pipeline",
        "Set up DMA for ADC channels",
        "Create communication protocol handler",
        "Add watchdog timer configuration",
      ],
    };

    [0, 1, 2].forEach((phIdx) => {
      const titles = taskTitles[phIdx] || [];
      titles.forEach((title, tIdx) => {
        const isDone = phIdx < 2 || (phIdx === 2 && tIdx < 2);
        const isInProgress = phIdx === 2 && tIdx === 2;
        tasks.push({
          id: uid("task"),
          projectId,
          phaseId: phases[phIdx].id,
          title,
          description: `Engineering task for ${phases[phIdx].name}`,
          status: isDone ? "Done" : isInProgress ? "In Progress" : "To Do",
          priority: tIdx === 0 ? "Critical" : tIdx < 3 ? "High" : "Medium",
          dueDate: isDone ? daysAgo(10 - tIdx) : daysFromNow(tIdx * 2 + 1),
          createdAt: daysAgo(25),
          updatedAt: daysAgo(isDone ? 8 : 1),
          project: { id: projectId, name: seed.name, projectCode: seed.projectCode },
          phase: { id: phases[phIdx].id, name: phases[phIdx].name },
          checklistItems: [],
        });
      });
    });

    // Add an overdue task for the first project
    if (pIdx === 0) {
      tasks.push({
        id: uid("task"),
        projectId,
        phaseId: phases[2].id,
        title: "Fix I2C NAK error on sensor read",
        description: "Intermittent NAK on address 0x48 after 500ms timeout",
        status: "In Progress",
        priority: "Critical",
        dueDate: daysAgo(2),
        createdAt: daysAgo(10),
        updatedAt: daysAgo(1),
        project: { id: projectId, name: seed.name, projectCode: seed.projectCode },
        phase: { id: phases[2].id, name: phases[2].name },
        checklistItems: [],
      });
    }

    // Add a blocked task for the second project
    if (pIdx === 1) {
      tasks.push({
        id: uid("task"),
        projectId,
        phaseId: phases[2].id,
        title: "Waiting for revised motor driver PCB",
        description: "Current board has thermal issue on MOSFET gate driver — Rev B needed",
        status: "Blocked",
        priority: "Critical",
        dueDate: daysFromNow(5),
        createdAt: daysAgo(7),
        updatedAt: daysAgo(1),
        project: { id: projectId, name: seed.name, projectCode: seed.projectCode },
        phase: { id: phases[2].id, name: phases[2].name },
        checklistItems: [],
      });
    }

    return {
      id: projectId,
      name: seed.name,
      projectCode: seed.projectCode,
      description: seed.description,
      category: seed.category,
      hardwarePlatform: seed.hardwarePlatform,
      mcu: seed.mcu,
      ide: seed.ide,
      language: seed.language,
      rtos: seed.rtos,
      repositoryUrl: seed.repositoryUrl,
      status: seed.status,
      startDate: daysAgo(30),
      targetDate: daysFromNow(60),
      currentPhaseId: phases[2].id,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
      phases,
      tasks,
      releaseGates: gates,
      phaseChecklistItems: phases.flatMap((ph) => ph.checklistItems),
    };
  });
}

// ─── Demo Notes ──────────────────────────────────────────────────────────────
function buildDemoNotes(projects: any[]) {
  const proj = projects[0];
  return [
    {
      id: uid("note"),
      projectId: proj.id,
      phaseId: proj.phases[1].id,
      title: "I2C bus pull-up resistor selection",
      content:
        "Measured I2C rise time with 4.7kΩ pull-ups at 400kHz — rise time ~300ns which is within spec.\n\nSwitched to 2.2kΩ for the high-speed segment with 3 devices. Scope capture saved to `docs/i2c_rise_time.png`.\n\nKey takeaway: at 3.3V VDD and 10pF bus capacitance, 4.7kΩ works for standard mode but marginal for fast mode.",
      category: "Hardware",
      createdAt: daysAgo(15),
      updatedAt: daysAgo(15),
      project: { id: proj.id, name: proj.name, projectCode: proj.projectCode },
      phase: { id: proj.phases[1].id, name: proj.phases[1].name },
    },
    {
      id: uid("note"),
      projectId: proj.id,
      phaseId: proj.phases[2].id,
      title: "FreeRTOS task priority assignment",
      content:
        "Task priorities (higher = more urgent):\n\n- `Task_SensorRead`: Priority 4 (highest) — 10ms period\n- `Task_CommHandler`: Priority 3 — event-driven\n- `Task_DataFusion`: Priority 2 — 50ms period\n- `Task_Display`: Priority 1 — 200ms period\n- `Task_Idle`: Priority 0\n\nUsing `configUSE_TIME_SLICING = 0` so equal-priority tasks don't preempt each other.",
      category: "Technical Decision",
      createdAt: daysAgo(10),
      updatedAt: daysAgo(8),
      project: { id: proj.id, name: proj.name, projectCode: proj.projectCode },
      phase: { id: proj.phases[2].id, name: proj.phases[2].name },
    },
    {
      id: uid("note"),
      projectId: projects[1].id,
      phaseId: projects[1].phases[2].id,
      title: "FOC algorithm tuning notes",
      content:
        "PI controller gains for torque loop:\n- Kp = 0.8, Ki = 200\n- Current loop bandwidth: ~2kHz\n- PWM frequency: 20kHz\n\nSpeed loop:\n- Kp = 0.05, Ki = 1.0\n- Speed loop bandwidth: ~50Hz\n\nObserved oscillation at high speed (>3000 RPM) — reduced Kp to 0.03. Needs further tuning with actual load.",
      category: "Firmware",
      createdAt: daysAgo(5),
      updatedAt: daysAgo(3),
      project: { id: projects[1].id, name: projects[1].name, projectCode: projects[1].projectCode },
      phase: { id: projects[1].phases[2].id, name: projects[1].phases[2].name },
    },
    {
      id: uid("note"),
      projectId: proj.id,
      phaseId: null,
      title: "Debugging: Hard fault on DMA transfer complete ISR",
      content:
        "Root cause: stack overflow in `DMA1_Stream5_IRQHandler` due to printf() call inside ISR.\n\nFix: replaced printf with a flag + deferred logging in a low-priority task.\n\nLesson: Never call blocking or heap-allocating functions from ISR context. Added a static analysis rule to catch this.",
      category: "Debugging",
      createdAt: daysAgo(7),
      updatedAt: daysAgo(7),
      project: { id: proj.id, name: proj.name, projectCode: proj.projectCode },
      phase: null,
    },
  ];
}

// ─── Singleton Cache ─────────────────────────────────────────────────────────
let _demoProjects: any[] | null = null;
let _demoNotes: any[] | null = null;

function getDemoProjects() {
  if (!_demoProjects) _demoProjects = buildDemoProjects();
  return _demoProjects;
}

function getDemoNotes() {
  if (!_demoNotes) _demoNotes = buildDemoNotes(getDemoProjects());
  return _demoNotes;
}

// ─── Public Demo API (mirrors real API service interface) ─────────────────────
export const demoApi = {
  dashboard: {
    get: (): any => {
      const projects = getDemoProjects();
      const allTasks = projects.flatMap((p) => p.tasks);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tasksDueToday = allTasks.filter((t: any) => {
        if (!t.dueDate || t.status === "Done") return false;
        const d = new Date(t.dueDate);
        return d >= today && d < tomorrow;
      });
      const overdueTasks = allTasks.filter((t: any) => {
        if (!t.dueDate || t.status === "Done") return false;
        return new Date(t.dueDate) < today;
      });
      const blockedTasks = allTasks.filter((t: any) => t.status === "Blocked");

      const phaseDistribution: Record<string, number> = {
        "Phase 1: Requirements and Planning": 0,
        "Phase 2: Hardware Study and Bring-up": 0,
        "Phase 3: Firmware Architecture and Development": 0,
        "Phase 4: Unit and Integration Testing": 0,
        "Phase 5: System Validation and Stress Testing": 0,
        "Phase 6: Demo or Pilot Preparation": 0,
        "Phase 7: Post-Demo Review": 0,
      };

      projects.forEach((p: any) => {
        const currentPh = p.phases.find((ph: any) => ph.id === p.currentPhaseId) || p.phases[0];
        if (currentPh) {
          phaseDistribution[currentPh.name] = (phaseDistribution[currentPh.name] || 0) + 1;
        }
      });

      const incompleteGates: any[] = [];
      projects.forEach((p: any) => {
        p.releaseGates.forEach((g: any) => {
          if (g.status !== "Passed") {
            const totalItems = g.items.length;
            const completedItems = g.items.filter((i: any) => i.status === "Passed").length;
            incompleteGates.push({
              id: g.id,
              name: g.name,
              gateType: g.gateType,
              status: g.status,
              projectId: p.id,
              projectName: p.name,
              projectCode: p.projectCode,
              totalItems,
              completedItems,
              incompleteItems: totalItems - completedItems,
              blockedItems: g.items.filter((i: any) => i.status === "Blocked" || i.status === "Failed").length,
            });
          }
        });
      });

      const recentProjects = projects.map((p: any) => {
        const totalTasks = p.tasks.length;
        const completedTasks = p.tasks.filter((t: any) => t.status === "Done").length;
        const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const totalChecklists = p.phaseChecklistItems.length;
        const passedChecklists = p.phaseChecklistItems.filter((i: any) => i.status === "Passed").length;
        const checklistProgress = totalChecklists > 0 ? Math.round((passedChecklists / totalChecklists) * 100) : 0;
        let devProgress = 0;
        if (totalTasks > 0 && totalChecklists > 0) {
          devProgress = Math.round((taskProgress + checklistProgress) / 2);
        } else if (totalTasks > 0) {
          devProgress = taskProgress;
        } else if (totalChecklists > 0) {
          devProgress = checklistProgress;
        }

        const totalGates = p.releaseGates.length;
        const passedGates = p.releaseGates.filter((g: any) => g.status === "Passed").length;
        const currentPhase = p.phases.find((ph: any) => ph.id === p.currentPhaseId) || p.phases[0];

        return {
          id: p.id,
          name: p.name,
          projectCode: p.projectCode,
          category: p.category,
          hardwarePlatform: p.hardwarePlatform,
          mcu: p.mcu,
          status: p.status,
          updatedAt: p.updatedAt,
          currentPhaseName: currentPhase?.name ?? "Requirements",
          totalTasks,
          completedTasks,
          devProgress,
          totalGates,
          passedGates,
          releaseReady: p.releaseGates.some((g: any) => g.status === "Passed"),
        };
      });

      return {
        metrics: {
          totalProjects: projects.length,
          activeProjects: projects.filter((p: any) => p.status === "Active").length,
          completedProjects: 0,
          onHoldProjects: 0,
          tasksDueTodayCount: tasksDueToday.length,
          overdueTasksCount: overdueTasks.length,
          pendingTasksCount: allTasks.filter((t: any) => t.status === "To Do").length,
          blockedTasksCount: blockedTasks.length,
        },
        tasksDueToday: tasksDueToday.slice(0, 6),
        overdueTasks: overdueTasks.slice(0, 6),
        blockedTasks: blockedTasks.slice(0, 6),
        phaseDistribution,
        incompleteGates: incompleteGates.slice(0, 8),
        recentProjects,
      };
    },
  },

  projects: {
    list: (): any[] => {
      return getDemoProjects().map((p) => ({
        id: p.id,
        name: p.name,
        projectCode: p.projectCode,
        description: p.description,
        category: p.category,
        hardwarePlatform: p.hardwarePlatform,
        mcu: p.mcu,
        ide: p.ide,
        language: p.language,
        rtos: p.rtos,
        repositoryUrl: p.repositoryUrl,
        status: p.status,
        startDate: p.startDate,
        targetDate: p.targetDate,
        currentPhaseId: p.currentPhaseId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        _count: { tasks: p.tasks.length },
        phases: p.phases.map((ph: any) => ({
          id: ph.id,
          name: ph.name,
          sequence: ph.sequence,
          status: ph.status,
        })),
        releaseGates: p.releaseGates.map((g: any) => ({
          id: g.id,
          name: g.name,
          gateType: g.gateType,
          status: g.status,
        })),
      }));
    },

    get: (id: string): any => {
      const p = getDemoProjects().find((p) => p.id === id);
      if (!p) return null;
      return {
        ...p,
        _count: { tasks: p.tasks.length },
      };
    },

    create: (_data: any): any => {
      console.warn("[Demo Mode] Create project is read-only in static deployment.");
      return { id: uid("proj"), ...(_data || {}), createdAt: new Date().toISOString() };
    },

    update: (id: string, _data: any): any => {
      console.warn("[Demo Mode] Update project is read-only in static deployment.");
      const p = getDemoProjects().find((p) => p.id === id);
      return { ...(p || {}), ...(_data || {}) };
    },

    delete: (_id: string): any => {
      console.warn("[Demo Mode] Delete is read-only in static deployment.");
      return { success: true };
    },
  },

  tasks: {
    list: (params?: any): any[] => {
      let tasks = getDemoProjects().flatMap((p) => p.tasks);
      if (params?.projectId) tasks = tasks.filter((t: any) => t.projectId === params.projectId);
      if (params?.phaseId) tasks = tasks.filter((t: any) => t.phaseId === params.phaseId);
      if (params?.status) tasks = tasks.filter((t: any) => t.status === params.status);
      return tasks;
    },

    get: (id: string): any => {
      return getDemoProjects().flatMap((p) => p.tasks).find((t: any) => t.id === id) || null;
    },

    create: (_data: any): any => {
      console.warn("[Demo Mode] Create task is read-only in static deployment.");
      return { id: uid("task"), ...(_data || {}) };
    },

    update: (id: string, _data: any): any => {
      console.warn("[Demo Mode] Update task is read-only in static deployment.");
      const t = getDemoProjects().flatMap((p) => p.tasks).find((t: any) => t.id === id);
      return { ...(t || {}), ...(_data || {}) };
    },

    delete: (_id: string): any => {
      console.warn("[Demo Mode] Delete task is read-only in static deployment.");
      return { success: true };
    },

    addChecklistItem: (_taskId: string, title: string): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { id: uid("cli"), title, isCompleted: false };
    },

    updateChecklistItem: (_taskId: string, _itemId: string, _isCompleted: boolean): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { success: true };
    },

    deleteChecklistItem: (_taskId: string, _itemId: string): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { success: true };
    },
  },

  phaseItems: {
    create: (_data: any): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { id: uid("pci"), ...(_data || {}) };
    },
    update: (_id: string, _data: any): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { success: true };
    },
    delete: (_id: string): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { success: true };
    },
  },

  gates: {
    get: (id: string): any => {
      const allGates = getDemoProjects().flatMap((p) => p.releaseGates);
      return allGates.find((g: any) => g.id === id) || null;
    },
    update: (_id: string, _data: any): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { success: true };
    },
    passGate: (_id: string, _data: any): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { success: true };
    },
    updateItem: (_itemId: string, _data: any): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { success: true };
    },
    createFailure: (_gateItemId: string, _data: any): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { id: uid("fail") };
    },
    updateFailure: (_gateItemId: string, _data: any): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { success: true };
    },
  },

  notes: {
    list: (params?: any): any[] => {
      let notes = getDemoNotes();
      if (params?.projectId && params.projectId !== "All") {
        notes = notes.filter((n: any) => n.projectId === params.projectId);
      }
      if (params?.category && params.category !== "All") {
        notes = notes.filter((n: any) => n.category === params.category);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        notes = notes.filter(
          (n: any) =>
            n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
        );
      }
      return notes;
    },

    create: (_data: any): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { id: uid("note"), ...(_data || {}) };
    },

    update: (_id: string, _data: any): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { success: true };
    },

    delete: (_id: string): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { success: true };
    },
  },

  backup: {
    downloadDbUrl: "#",
    exportJsonUrl: "#",
    restore: (_data: any): any => {
      console.warn("[Demo Mode] Read-only in static deployment.");
      return { success: true, restoredCount: 0 };
    },
    exportData: (_format: string, _type: string, _projectId?: string): string => "#",
  },
};
