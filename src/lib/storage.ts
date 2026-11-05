// Centralized Client-Side Storage Module for Embedded Dev Tracker
// Completely replaces backend API / SQLite dev.db with robust browser localStorage persistence
// Designed with async functions so it can be swapped for IndexedDB seamlessly

import { DEFAULT_PHASES, DEFAULT_RELEASE_GATES } from "./default-data";

const STORAGE_KEY = "edt_data_v1";

export interface Project {
  id: string;
  name: string;
  projectCode: string;
  description?: string | null;
  category?: string | null;
  hardwarePlatform?: string | null;
  mcu?: string | null;
  ide?: string | null;
  language?: string | null;
  rtos?: string | null;
  repositoryUrl?: string | null;
  status: string;
  startDate?: string;
  targetDate?: string | null;
  createdAt: string;
  updatedAt: string;
  phases: Phase[];
  tasks: Task[];
  releaseGates: ReleaseGate[];
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  sequence: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  checklistItems: PhaseChecklistItem[];
}

export interface PhaseChecklistItem {
  id: string;
  phaseId: string;
  projectId: string;
  title: string;
  description?: string | null;
  isMandatory: boolean;
  status: string;
  verifiedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  phaseId: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string; projectCode: string };
  phase?: { id: string; name: string };
  checklistItems: TaskChecklistItem[];
}

export interface TaskChecklistItem {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
}

export interface ReleaseGate {
  id: string;
  projectId: string;
  name: string;
  gateType: string;
  status: string;
  passedAt?: string | null;
  firmwareVersion?: string | null;
  hardwareRevision?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  updatedAt: string;
  items: ReleaseGateItem[];
  history: GateHistory[];
}

export interface ReleaseGateItem {
  id: string;
  releaseGateId: string;
  title: string;
  description?: string | null;
  isMandatory: boolean;
  status: string;
  verifiedAt?: string | null;
  notes?: string | null;
  failures: GateFailure[];
  createdAt: string;
  updatedAt: string;
}

export interface GateFailure {
  id: string;
  gateItemId: string;
  description: string;
  expectedBehavior?: string | null;
  actualBehavior?: string | null;
  correctiveAction?: string | null;
  status: string;
  retestResult?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GateHistory {
  id: string;
  releaseGateId: string;
  action: string;
  status: string;
  firmwareVersion?: string | null;
  hardwareRevision?: string | null;
  reviewNote?: string | null;
  createdAt: string;
}

export interface Note {
  id: string;
  projectId: string;
  phaseId?: string | null;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string; projectCode: string };
  phase?: { id: string; name: string } | null;
}

export interface StorageData {
  projects: Project[];
  notes: Note[];
}

// ─── UUID & Date Helpers ───────────────────────────────────────────────────────
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2, 11) + "-" + Date.now().toString(36);
}

function nowIso(): string {
  return new Date().toISOString();
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// ─── Default Templates & Seed Factory ──────────────────────────────────────────
export function createDefaultPhases(projectId: string): Phase[] {
  return DEFAULT_PHASES.map((pt) => {
    const phaseId = generateId();
    const checklistItems: PhaseChecklistItem[] = pt.checklistItems.map((ci) => ({
      id: generateId(),
      phaseId,
      projectId,
      title: ci.title,
      description: ci.description || null,
      isMandatory: ci.isMandatory,
      status: "Not Started",
      verifiedAt: null,
      notes: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }));

    return {
      id: phaseId,
      projectId,
      name: pt.name,
      description: pt.description,
      sequence: pt.sequence,
      status: pt.sequence === 1 ? "In Progress" : "Not Started",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      checklistItems,
    };
  });
}

export function createDefaultGates(projectId: string): ReleaseGate[] {
  return DEFAULT_RELEASE_GATES.map((gt) => {
    const gateId = generateId();
    const items: ReleaseGateItem[] = gt.items.map((gi) => ({
      id: generateId(),
      releaseGateId: gateId,
      title: gi.title,
      description: gi.description || null,
      isMandatory: gi.isMandatory,
      status: "Not Started",
      verifiedAt: null,
      notes: null,
      failures: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }));

    return {
      id: gateId,
      projectId,
      name: gt.name,
      gateType: gt.gateType,
      status: "Not Started",
      passedAt: null,
      firmwareVersion: null,
      hardwareRevision: null,
      reviewNote: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      items,
      history: [],
    };
  });
}

function generateSeedData(): StorageData {
  const p1Id = generateId();
  const p2Id = generateId();

  // Project 1: STM32 Smart Sensor Hub
  const p1Phases = createDefaultPhases(p1Id);
  // Mark Phase 1 & 2 as passed/completed in seed
  p1Phases[0].status = "Completed";
  p1Phases[0].checklistItems.forEach((ci) => {
    ci.status = "Passed";
    ci.verifiedAt = daysAgo(12);
  });
  p1Phases[1].status = "Completed";
  p1Phases[1].checklistItems.forEach((ci, idx) => {
    ci.status = idx < 6 ? "Passed" : "In Progress";
    if (idx < 6) ci.verifiedAt = daysAgo(4);
  });
  p1Phases[2].status = "In Progress";
  p1Phases[2].checklistItems[0].status = "Passed";
  p1Phases[2].checklistItems[1].status = "In Progress";

  const p1Gates = createDefaultGates(p1Id);
  p1Gates[0].status = "In Progress";
  p1Gates[0].items.slice(0, 8).forEach((item) => {
    item.status = "Passed";
    item.verifiedAt = daysAgo(3);
  });

  const p1Tasks: Task[] = [
    {
      id: generateId(),
      projectId: p1Id,
      phaseId: p1Phases[2].id,
      title: "Implement I2C sensor data acquisition pipeline",
      description: "Sample BME680 and LSM6DSO every 100ms via DMA with ring buffer storage",
      status: "In Progress",
      priority: "High",
      dueDate: daysFromNow(2),
      createdAt: daysAgo(10),
      updatedAt: daysAgo(1),
      project: { id: p1Id, name: "Smart Sensor Hub — STM32", projectCode: "PROJ-SENSOR" },
      phase: { id: p1Phases[2].id, name: p1Phases[2].name },
      checklistItems: [
        { id: generateId(), taskId: "", title: "Configure I2C1 fast mode (400kHz)", isCompleted: true },
        { id: generateId(), taskId: "", title: "Implement non-blocking DMA interrupt handler", isCompleted: true },
        { id: generateId(), taskId: "", title: "Add timeout recovery logic", isCompleted: false },
      ],
    },
    {
      id: generateId(),
      projectId: p1Id,
      phaseId: p1Phases[2].id,
      title: "Fix I2C NAK timeout on high-speed read",
      description: "Intermittent bus hang when reading accelerometer registers at 400kHz",
      status: "In Progress",
      priority: "Critical",
      dueDate: daysAgo(1),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
      project: { id: p1Id, name: "Smart Sensor Hub — STM32", projectCode: "PROJ-SENSOR" },
      phase: { id: p1Phases[2].id, name: p1Phases[2].name },
      checklistItems: [],
    },
    {
      id: generateId(),
      projectId: p1Id,
      phaseId: p1Phases[1].id,
      title: "Verify 3.3V and 1.8V board power rails with oscilloscope",
      description: "Check ripple voltage and power-on ramp under full RF transmission load",
      status: "Done",
      priority: "Critical",
      dueDate: daysAgo(8),
      createdAt: daysAgo(18),
      updatedAt: daysAgo(7),
      project: { id: p1Id, name: "Smart Sensor Hub — STM32", projectCode: "PROJ-SENSOR" },
      phase: { id: p1Phases[1].id, name: p1Phases[1].name },
      checklistItems: [],
    },
  ];

  // Project 2: Motor Controller — ESP32
  const p2Phases = createDefaultPhases(p2Id);
  p2Phases[0].status = "Completed";
  p2Phases[0].checklistItems.forEach((ci) => {
    ci.status = "Passed";
    ci.verifiedAt = daysAgo(15);
  });
  p2Phases[1].status = "In Progress";

  const p2Gates = createDefaultGates(p2Id);
  p2Gates[0].status = "In Progress";

  const p2Tasks: Task[] = [
    {
      id: generateId(),
      projectId: p2Id,
      phaseId: p2Phases[1].id,
      title: "Calibrate current sensing shunt resistors",
      description: "Verify op-amp gain error and ADC offset under ambient temperature",
      status: "Blocked",
      priority: "High",
      dueDate: daysFromNow(4),
      createdAt: daysAgo(6),
      updatedAt: daysAgo(1),
      project: { id: p2Id, name: "Motor Controller — ESP32", projectCode: "PROJ-MOTOR" },
      phase: { id: p2Phases[1].id, name: p2Phases[1].name },
      checklistItems: [],
    },
  ];

  const projects: Project[] = [
    {
      id: p1Id,
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
      startDate: daysAgo(30),
      targetDate: daysFromNow(60),
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
      phases: p1Phases,
      tasks: p1Tasks,
      releaseGates: p1Gates,
    },
    {
      id: p2Id,
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
      startDate: daysAgo(20),
      targetDate: daysFromNow(45),
      createdAt: daysAgo(20),
      updatedAt: daysAgo(2),
      phases: p2Phases,
      tasks: p2Tasks,
      releaseGates: p2Gates,
    },
  ];

  const notes: Note[] = [
    {
      id: generateId(),
      projectId: p1Id,
      phaseId: p1Phases[1].id,
      title: "I2C bus pull-up resistor selection",
      content:
        "Measured I2C rise time with 4.7kΩ pull-ups at 400kHz — rise time was ~300ns which is within spec.\n\nSwitched to 2.2kΩ for the high-speed segment with 3 slave sensors connected. Scope capture saved.\n\nTakeaway: At 3.3V VDD and 15pF total bus capacitance, 2.2kΩ provides cleaner edges with zero bit errors.",
      category: "Hardware",
      createdAt: daysAgo(12),
      updatedAt: daysAgo(12),
      project: { id: p1Id, name: projects[0].name, projectCode: projects[0].projectCode },
      phase: { id: p1Phases[1].id, name: p1Phases[1].name },
    },
    {
      id: generateId(),
      projectId: p1Id,
      phaseId: p1Phases[2].id,
      title: "FreeRTOS task priority & stack sizing",
      content:
        "Configured task priority map:\n- Task_SensorRead: Priority 4 (highest) — Stack: 512 words\n- Task_CommHandler: Priority 3 — Stack: 1024 words\n- Task_Telemetry: Priority 2 — Stack: 512 words\n\nSet configCHECK_FOR_STACK_OVERFLOW = 2 with vApplicationStackOverflowHook defined.",
      category: "Technical Decision",
      createdAt: daysAgo(8),
      updatedAt: daysAgo(8),
      project: { id: p1Id, name: projects[0].name, projectCode: projects[0].projectCode },
      phase: { id: p1Phases[2].id, name: p1Phases[2].name },
    },
    {
      id: generateId(),
      projectId: p2Id,
      phaseId: p2Phases[1].id,
      title: "FOC algorithm current sensing offset",
      content:
        "Noticed DC offset on ADC channel 3 during motor idle. Calibrating zero-current reference during boot solved the low-RPM vibration issue.",
      category: "Debugging",
      createdAt: daysAgo(4),
      updatedAt: daysAgo(3),
      project: { id: p2Id, name: projects[1].name, projectCode: projects[1].projectCode },
      phase: { id: p2Phases[1].id, name: p2Phases[1].name },
    },
  ];

  return { projects, notes };
}

// ─── LocalStorage Low-Level Read / Write ─────────────────────────────────────────
function readStorage(): StorageData {
  if (typeof window === "undefined") {
    return { projects: [], notes: [] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = generateSeedData();
      writeStorage(seed);
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.projects)) {
      console.warn("Storage data corrupted or invalid format. Resetting to seed data.");
      const seed = generateSeedData();
      writeStorage(seed);
      return seed;
    }
    return {
      projects: parsed.projects || [],
      notes: parsed.notes || [],
    };
  } catch (err) {
    console.error("Failed to read localStorage:", err);
    return generateSeedData();
  }
}

function writeStorage(data: StorageData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to write to localStorage:", err);
  }
}

// ─── Main Storage Module API ───────────────────────────────────────────────────
export const storage = {
  // ── Dashboard Data ─────────────────────────────────────────────────────────
  dashboard: {
    async get(): Promise<any> {
      const data = readStorage();
      const projects = data.projects;
      const allTasks = projects.flatMap((p) => p.tasks || []);
      const allGates = projects.flatMap((p) =>
        (p.releaseGates || []).map((g) => ({ ...g, project: { id: p.id, name: p.name, projectCode: p.projectCode } }))
      );

      const todayStr = new Date().toISOString().slice(0, 10);

      const activeProjects = projects.filter((p) => p.status === "Active");
      const tasksDueToday = allTasks.filter((t) => t.dueDate && t.dueDate.slice(0, 10) === todayStr);
      const overdueTasks = allTasks.filter(
        (t) => t.dueDate && t.dueDate.slice(0, 10) < todayStr && t.status !== "Done"
      );
      const blockedTasks = allTasks.filter((t) => t.status === "Blocked");

      const completedGates = allGates.filter((g) => g.status === "Passed");

      // Calculate phase distribution
      const phaseDistribution: Record<string, number> = {};
      DEFAULT_PHASES.forEach((dp) => {
        phaseDistribution[dp.name] = 0;
      });

      projects.forEach((p) => {
        // Find current active phase (first non-completed phase)
        const activePhase = p.phases.find((ph) => ph.status === "In Progress") || p.phases[0];
        if (activePhase && phaseDistribution[activePhase.name] !== undefined) {
          phaseDistribution[activePhase.name] = (phaseDistribution[activePhase.name] || 0) + 1;
        }
      });

      // Calculate average progress
      let totalItems = 0;
      let completedItems = 0;
      projects.forEach((p) => {
        p.phases.forEach((ph) => {
          (ph.checklistItems || []).forEach((ci) => {
            totalItems++;
            if (ci.status === "Passed") completedItems++;
          });
        });
      });

      const averageProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      // Recent projects enriched with task counts and progress
      const recentProjects = [...projects]
        .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
        .slice(0, 5)
        .map((p) => {
          const pTasks = p.tasks || [];
          const completedTasks = pTasks.filter((t) => t.status === "Done").length;
          const totalTasks = pTasks.length;
          const devProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          const pGates = p.releaseGates || [];
          const passedGates = pGates.filter((g) => g.status === "Passed").length;
          const totalGates = pGates.length;
          const releaseReady = totalGates > 0 && passedGates === totalGates;

          const activePhase = p.phases.find((ph) => ph.status === "In Progress") || p.phases[0];

          return {
            ...p,
            completedTasks,
            totalTasks,
            devProgress,
            passedGates,
            totalGates,
            releaseReady,
            currentPhaseName: activePhase ? activePhase.name : "Requirements",
          };
        });

      // Incomplete gates with pending mandatory counts and progress metrics
      const incompleteGates = allGates
        .filter((g) => g.status !== "Passed")
        .map((g) => {
          const items = g.items || [];
          const totalItems = items.length;
          const completedItems = items.filter((i) => i.status === "Passed").length;
          const pendingMandatory = items.filter((i) => i.isMandatory && i.status !== "Passed").length;
          const unresolvedFailures = items.flatMap((i) => i.failures || []).filter(
            (f) => f.status === "Open" || f.status === "In Progress"
          ).length;

          return {
            id: g.id,
            name: g.name,
            gateType: g.gateType,
            status: g.status,
            projectId: g.project?.id || g.projectId,
            projectCode: g.project?.projectCode || "",
            projectName: g.project?.name || "",
            project: g.project,
            totalItems,
            completedItems,
            pendingMandatoryCount: pendingMandatory,
            unresolvedFailuresCount: unresolvedFailures,
          };
        });

      return {
        metrics: {
          totalProjects: projects.length,
          activeProjects: activeProjects.length,
          tasksDueTodayCount: tasksDueToday.length,
          overdueTasksCount: overdueTasks.length,
          blockedTasksCount: blockedTasks.length,
          completedGatesCount: completedGates.length,
          totalGatesCount: allGates.length,
          averageProgress,
        },
        recentProjects,
        tasksDueToday,
        overdueTasks,
        blockedTasks,
        phaseDistribution,
        incompleteGates,
      };
    },
  },

  // ── Projects ───────────────────────────────────────────────────────────────
  projects: {
    async list(): Promise<Project[]> {
      const data = readStorage();
      return data.projects;
    },

    async get(id: string): Promise<Project | null> {
      const data = readStorage();
      const p = data.projects.find((proj) => proj.id === id);
      return p ? JSON.parse(JSON.stringify(p)) : null;
    },

    async create(input: {
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
      startDate?: string;
      targetDate?: string;
    }): Promise<Project> {
      const data = readStorage();
      const newId = generateId();

      const phases = createDefaultPhases(newId);
      const gates = createDefaultGates(newId);

      const newProject: Project = {
        id: newId,
        name: input.name.trim(),
        projectCode: input.projectCode.trim().toUpperCase(),
        description: input.description?.trim() || null,
        category: input.category?.trim() || "Firmware",
        hardwarePlatform: input.hardwarePlatform?.trim() || null,
        mcu: input.mcu?.trim() || null,
        ide: input.ide?.trim() || null,
        language: input.language?.trim() || "C / C++",
        rtos: input.rtos?.trim() || null,
        repositoryUrl: input.repositoryUrl?.trim() || null,
        status: "Active",
        startDate: input.startDate || nowIso(),
        targetDate: input.targetDate || null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        phases,
        tasks: [],
        releaseGates: gates,
      };

      data.projects.unshift(newProject);
      writeStorage(data);
      return newProject;
    },

    async update(id: string, updates: Partial<Project>): Promise<Project> {
      const data = readStorage();
      const idx = data.projects.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Project not found");

      const existing = data.projects[idx];
      const updated: Project = {
        ...existing,
        ...updates,
        updatedAt: nowIso(),
      };

      data.projects[idx] = updated;
      writeStorage(data);
      return updated;
    },

    async delete(id: string): Promise<{ success: boolean }> {
      const data = readStorage();
      data.projects = data.projects.filter((p) => p.id !== id);
      // Clean up notes for this project
      data.notes = data.notes.filter((n) => n.projectId !== id);
      writeStorage(data);
      return { success: true };
    },
  },

  // ── Phases ─────────────────────────────────────────────────────────────────
  phases: {
    async create(input: {
      projectId: string;
      name: string;
      description?: string;
    }): Promise<Phase> {
      const data = readStorage();
      const project = data.projects.find((p) => p.id === input.projectId);
      if (!project) throw new Error("Project not found");

      const phaseId = generateId();
      const newPhase: Phase = {
        id: phaseId,
        projectId: input.projectId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        sequence: (project.phases.length || 0) + 1,
        status: "Not Started",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        checklistItems: [],
      };

      project.phases.push(newPhase);
      project.updatedAt = nowIso();
      writeStorage(data);
      return newPhase;
    },
  },

  // ── Phase Checklist Items ──────────────────────────────────────────────────
  phaseItems: {
    async create(input: {
      projectId: string;
      phaseId: string;
      title: string;
      description?: string;
      isMandatory?: boolean;
    }): Promise<PhaseChecklistItem> {
      const data = readStorage();
      const project = data.projects.find((p) => p.id === input.projectId);
      if (!project) throw new Error("Project not found");

      const phase = project.phases.find((ph) => ph.id === input.phaseId);
      if (!phase) throw new Error("Phase not found");

      const newItem: PhaseChecklistItem = {
        id: generateId(),
        phaseId: input.phaseId,
        projectId: input.projectId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        isMandatory: input.isMandatory !== undefined ? input.isMandatory : true,
        status: "Not Started",
        verifiedAt: null,
        notes: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };

      phase.checklistItems.push(newItem);
      project.updatedAt = nowIso();
      writeStorage(data);
      return newItem;
    },

    async update(id: string, updates: Partial<PhaseChecklistItem>): Promise<PhaseChecklistItem> {
      const data = readStorage();
      let foundItem: PhaseChecklistItem | null = null;
      let parentProject: Project | null = null;
      let parentPhase: Phase | null = null;

      for (const p of data.projects) {
        for (const ph of p.phases) {
          const item = ph.checklistItems?.find((ci) => ci.id === id);
          if (item) {
            foundItem = item;
            parentProject = p;
            parentPhase = ph;
            break;
          }
        }
        if (foundItem) break;
      }

      if (!foundItem || !parentProject || !parentPhase) {
        throw new Error("Phase checklist item not found");
      }

      Object.assign(foundItem, updates, { updatedAt: nowIso() });
      if (updates.status === "Passed" && !foundItem.verifiedAt) {
        foundItem.verifiedAt = nowIso();
      }

      // Automatically recalculate parent phase status
      const mandatoryItems = parentPhase.checklistItems.filter((ci) => ci.isMandatory);
      const allPassed = mandatoryItems.length > 0 && mandatoryItems.every((ci) => ci.status === "Passed");
      const anyInProgress = parentPhase.checklistItems.some((ci) => ci.status === "Passed" || ci.status === "In Progress");

      if (allPassed) {
        parentPhase.status = "Completed";
      } else if (anyInProgress) {
        parentPhase.status = "In Progress";
      }

      parentPhase.updatedAt = nowIso();
      parentProject.updatedAt = nowIso();
      writeStorage(data);
      return foundItem;
    },

    async delete(id: string): Promise<{ success: boolean }> {
      const data = readStorage();
      let deleted = false;

      for (const p of data.projects) {
        for (const ph of p.phases) {
          const initialLen = ph.checklistItems.length;
          ph.checklistItems = ph.checklistItems.filter((ci) => ci.id !== id);
          if (ph.checklistItems.length !== initialLen) {
            deleted = true;
            ph.updatedAt = nowIso();
            p.updatedAt = nowIso();
            break;
          }
        }
        if (deleted) break;
      }

      writeStorage(data);
      return { success: deleted };
    },
  },

  // ── Tasks ──────────────────────────────────────────────────────────────────
  tasks: {
    async list(params?: {
      projectId?: string;
      phaseId?: string;
      status?: string;
      priority?: string;
    }): Promise<Task[]> {
      const data = readStorage();
      let allTasks = data.projects.flatMap((p) => p.tasks || []);

      if (params?.projectId && params.projectId !== "All") {
        allTasks = allTasks.filter((t) => t.projectId === params.projectId);
      }
      if (params?.phaseId && params.phaseId !== "All") {
        allTasks = allTasks.filter((t) => t.phaseId === params.phaseId);
      }
      if (params?.status && params.status !== "All") {
        allTasks = allTasks.filter((t) => t.status === params.status);
      }
      if (params?.priority && params.priority !== "All") {
        allTasks = allTasks.filter((t) => t.priority === params.priority);
      }

      return allTasks;
    },

    async get(id: string): Promise<Task | null> {
      const data = readStorage();
      for (const p of data.projects) {
        const task = (p.tasks || []).find((t) => t.id === id);
        if (task) return task;
      }
      return null;
    },

    async create(input: {
      projectId: string;
      phaseId: string;
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
      checklistItems?: { title: string }[];
    }): Promise<Task> {
      const data = readStorage();
      const project = data.projects.find((p) => p.id === input.projectId);
      if (!project) throw new Error("Project not found");

      const phase = project.phases.find((ph) => ph.id === input.phaseId);
      const taskId = generateId();

      const checklistItems: TaskChecklistItem[] = (input.checklistItems || []).map((ci) => ({
        id: generateId(),
        taskId,
        title: ci.title,
        isCompleted: false,
      }));

      const newTask: Task = {
        id: taskId,
        projectId: input.projectId,
        phaseId: input.phaseId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        status: input.status || "To Do",
        priority: input.priority || "Medium",
        dueDate: input.dueDate || null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        project: { id: project.id, name: project.name, projectCode: project.projectCode },
        phase: phase ? { id: phase.id, name: phase.name } : undefined,
        checklistItems,
      };

      if (!project.tasks) project.tasks = [];
      project.tasks.unshift(newTask);
      project.updatedAt = nowIso();

      writeStorage(data);
      return newTask;
    },

    async update(id: string, updates: Partial<Task>): Promise<Task> {
      const data = readStorage();
      let foundTask: Task | null = null;
      let parentProject: Project | null = null;

      for (const p of data.projects) {
        const task = (p.tasks || []).find((t) => t.id === id);
        if (task) {
          foundTask = task;
          parentProject = p;
          break;
        }
      }

      if (!foundTask || !parentProject) throw new Error("Task not found");

      Object.assign(foundTask, updates, { updatedAt: nowIso() });
      if (updates.phaseId && updates.phaseId !== foundTask.phaseId) {
        const newPhase = parentProject.phases.find((ph) => ph.id === updates.phaseId);
        if (newPhase) {
          foundTask.phase = { id: newPhase.id, name: newPhase.name };
        }
      }

      parentProject.updatedAt = nowIso();
      writeStorage(data);
      return foundTask;
    },

    async delete(id: string): Promise<{ success: boolean }> {
      const data = readStorage();
      let deleted = false;

      for (const p of data.projects) {
        const initialLen = (p.tasks || []).length;
        p.tasks = (p.tasks || []).filter((t) => t.id !== id);
        if (p.tasks.length !== initialLen) {
          deleted = true;
          p.updatedAt = nowIso();
          break;
        }
      }

      writeStorage(data);
      return { success: deleted };
    },

    async addChecklistItem(taskId: string, title: string): Promise<TaskChecklistItem> {
      const data = readStorage();
      for (const p of data.projects) {
        const task = (p.tasks || []).find((t) => t.id === taskId);
        if (task) {
          const item: TaskChecklistItem = {
            id: generateId(),
            taskId,
            title: title.trim(),
            isCompleted: false,
          };
          if (!task.checklistItems) task.checklistItems = [];
          task.checklistItems.push(item);
          task.updatedAt = nowIso();
          p.updatedAt = nowIso();
          writeStorage(data);
          return item;
        }
      }
      throw new Error("Task not found");
    },

    async updateChecklistItem(taskId: string, itemId: string, isCompleted: boolean): Promise<{ success: boolean }> {
      const data = readStorage();
      for (const p of data.projects) {
        const task = (p.tasks || []).find((t) => t.id === taskId);
        if (task) {
          const item = (task.checklistItems || []).find((ci) => ci.id === itemId);
          if (item) {
            item.isCompleted = isCompleted;
            task.updatedAt = nowIso();
            p.updatedAt = nowIso();
            writeStorage(data);
            return { success: true };
          }
        }
      }
      return { success: false };
    },

    async deleteChecklistItem(taskId: string, itemId: string): Promise<{ success: boolean }> {
      const data = readStorage();
      for (const p of data.projects) {
        const task = (p.tasks || []).find((t) => t.id === taskId);
        if (task) {
          task.checklistItems = (task.checklistItems || []).filter((ci) => ci.id !== itemId);
          task.updatedAt = nowIso();
          p.updatedAt = nowIso();
          writeStorage(data);
          return { success: true };
        }
      }
      return { success: false };
    },
  },

  // ── Release Gates ──────────────────────────────────────────────────────────
  gates: {
    async get(id: string): Promise<ReleaseGate | null> {
      const data = readStorage();
      for (const p of data.projects) {
        const gate = (p.releaseGates || []).find((g) => g.id === id);
        if (gate) return gate;
      }
      return null;
    },

    async update(id: string, updates: Partial<ReleaseGate>): Promise<ReleaseGate> {
      const data = readStorage();
      for (const p of data.projects) {
        const gate = (p.releaseGates || []).find((g) => g.id === id);
        if (gate) {
          Object.assign(gate, updates, { updatedAt: nowIso() });
          p.updatedAt = nowIso();
          writeStorage(data);
          return gate;
        }
      }
      throw new Error("Gate not found");
    },

    async addItem(
      gateId: string,
      input: { title: string; description?: string; isMandatory?: boolean }
    ): Promise<ReleaseGateItem> {
      const data = readStorage();
      for (const p of data.projects) {
        const gate = (p.releaseGates || []).find((g) => g.id === gateId);
        if (gate) {
          const newItem: ReleaseGateItem = {
            id: generateId(),
            releaseGateId: gateId,
            title: input.title.trim(),
            description: input.description?.trim() || null,
            isMandatory: input.isMandatory !== undefined ? input.isMandatory : true,
            status: "Not Started",
            verifiedAt: null,
            notes: null,
            failures: [],
            createdAt: nowIso(),
            updatedAt: nowIso(),
          };

          if (!gate.items) gate.items = [];
          gate.items.push(newItem);
          gate.updatedAt = nowIso();
          p.updatedAt = nowIso();
          writeStorage(data);
          return newItem;
        }
      }
      throw new Error("Gate not found");
    },

    async updateItem(itemId: string, updates: Partial<ReleaseGateItem>): Promise<ReleaseGateItem> {
      const data = readStorage();
      let foundItem: ReleaseGateItem | null = null;
      let parentGate: ReleaseGate | null = null;
      let parentProject: Project | null = null;

      for (const p of data.projects) {
        for (const g of p.releaseGates || []) {
          const item = (g.items || []).find((it) => it.id === itemId);
          if (item) {
            foundItem = item;
            parentGate = g;
            parentProject = p;
            break;
          }
        }
        if (foundItem) break;
      }

      if (!foundItem || !parentGate || !parentProject) throw new Error("Gate item not found");

      Object.assign(foundItem, updates, { updatedAt: nowIso() });
      if (updates.status === "Passed" && !foundItem.verifiedAt) {
        foundItem.verifiedAt = nowIso();
      }

      // Check gate status: if any item has open failure -> Blocked / In Progress
      const hasOpenFailures = (parentGate.items || []).some((it) =>
        (it.failures || []).some((f) => f.status === "Open" || f.status === "In Progress")
      );
      if (hasOpenFailures && parentGate.status !== "Blocked") {
        parentGate.status = "In Progress";
      }

      parentGate.updatedAt = nowIso();
      parentProject.updatedAt = nowIso();
      writeStorage(data);
      return foundItem;
    },

    async passGate(
      gateId: string,
      dataInput: { firmwareVersion?: string; hardwareRevision?: string; reviewNote?: string }
    ): Promise<{ success: boolean; gate: ReleaseGate }> {
      const data = readStorage();
      let foundGate: ReleaseGate | null = null;
      let parentProject: Project | null = null;

      for (const p of data.projects) {
        const g = (p.releaseGates || []).find((gate) => gate.id === gateId);
        if (g) {
          foundGate = g;
          parentProject = p;
          break;
        }
      }

      if (!foundGate || !parentProject) throw new Error("Gate not found");

      // Verify all mandatory items are passed
      const unpassedMandatory = (foundGate.items || []).filter((i) => i.isMandatory && i.status !== "Passed");
      if (unpassedMandatory.length > 0) {
        throw new Error(
          `Cannot pass gate: ${unpassedMandatory.length} mandatory item(s) are not yet passed.`
        );
      }

      // Verify no unresolved blocking failures
      const unresolvedFailures = (foundGate.items || []).flatMap((i) => i.failures || []).filter(
        (f) => f.status === "Open" || f.status === "In Progress"
      );
      if (unresolvedFailures.length > 0) {
        throw new Error(
          `Cannot pass gate: ${unresolvedFailures.length} unresolved defect failure(s) must be closed first.`
        );
      }

      const passTime = nowIso();
      foundGate.status = "Passed";
      foundGate.passedAt = passTime;
      foundGate.firmwareVersion = dataInput.firmwareVersion || null;
      foundGate.hardwareRevision = dataInput.hardwareRevision || null;
      foundGate.reviewNote = dataInput.reviewNote || null;
      foundGate.updatedAt = passTime;

      if (!foundGate.history) foundGate.history = [];
      foundGate.history.unshift({
        id: generateId(),
        releaseGateId: gateId,
        action: "Gate Passed & Approved",
        status: "Passed",
        firmwareVersion: dataInput.firmwareVersion || null,
        hardwareRevision: dataInput.hardwareRevision || null,
        reviewNote: dataInput.reviewNote || null,
        createdAt: passTime,
      });

      parentProject.updatedAt = passTime;
      writeStorage(data);
      return { success: true, gate: foundGate };
    },

    async createFailure(
      gateItemId: string,
      input: {
        description: string;
        expectedBehavior?: string;
        actualBehavior?: string;
        correctiveAction?: string;
        createTask?: boolean;
      }
    ): Promise<{ success: boolean; failure: GateFailure }> {
      const data = readStorage();
      let foundItem: ReleaseGateItem | null = null;
      let parentGate: ReleaseGate | null = null;
      let parentProject: Project | null = null;

      for (const p of data.projects) {
        for (const g of p.releaseGates || []) {
          const item = (g.items || []).find((it) => it.id === gateItemId);
          if (item) {
            foundItem = item;
            parentGate = g;
            parentProject = p;
            break;
          }
        }
        if (foundItem) break;
      }

      if (!foundItem || !parentGate || !parentProject) throw new Error("Gate item not found");

      const failureId = generateId();
      const newFailure: GateFailure = {
        id: failureId,
        gateItemId,
        description: input.description.trim(),
        expectedBehavior: input.expectedBehavior?.trim() || null,
        actualBehavior: input.actualBehavior?.trim() || null,
        correctiveAction: input.correctiveAction?.trim() || null,
        status: "Open",
        retestResult: null,
        resolvedAt: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };

      if (!foundItem.failures) foundItem.failures = [];
      foundItem.failures.unshift(newFailure);
      foundItem.status = "Failed";
      foundItem.updatedAt = nowIso();

      if (parentGate.status === "Passed") {
        parentGate.status = "In Progress";
      }

      // Automatically create a tracking task if requested
      if (input.createTask) {
        const activePhase = parentProject.phases.find((ph) => ph.status === "In Progress") || parentProject.phases[0];
        const taskTitle = `[Defect Fix] ${input.description.trim()}`;
        if (!parentProject.tasks) parentProject.tasks = [];
        parentProject.tasks.unshift({
          id: generateId(),
          projectId: parentProject.id,
          phaseId: activePhase.id,
          title: taskTitle,
          description: `Corrective Action: ${input.correctiveAction || "Triage and fix defect"}\nExpected: ${
            input.expectedBehavior || "N/A"
          }\nActual: ${input.actualBehavior || "N/A"}`,
          status: "To Do",
          priority: "Critical",
          dueDate: daysFromNow(3),
          createdAt: nowIso(),
          updatedAt: nowIso(),
          project: { id: parentProject.id, name: parentProject.name, projectCode: parentProject.projectCode },
          phase: { id: activePhase.id, name: activePhase.name },
          checklistItems: [],
        });
      }

      parentGate.updatedAt = nowIso();
      parentProject.updatedAt = nowIso();
      writeStorage(data);
      return { success: true, failure: newFailure };
    },

    async updateFailure(
      gateItemId: string,
      input: {
        failureId: string;
        status: string;
        retestResult?: string;
        correctiveAction?: string;
      }
    ): Promise<{ success: boolean }> {
      const data = readStorage();
      let foundFailure: GateFailure | null = null;
      let foundItem: ReleaseGateItem | null = null;
      let parentProject: Project | null = null;

      for (const p of data.projects) {
        for (const g of p.releaseGates || []) {
          const item = (g.items || []).find((it) => it.id === gateItemId);
          if (item) {
            const fail = (item.failures || []).find((f) => f.id === input.failureId);
            if (fail) {
              foundFailure = fail;
              foundItem = item;
              parentProject = p;
              break;
            }
          }
        }
        if (foundFailure) break;
      }

      if (!foundFailure || !foundItem || !parentProject) throw new Error("Failure record not found");

      foundFailure.status = input.status;
      if (input.retestResult) foundFailure.retestResult = input.retestResult;
      if (input.correctiveAction) foundFailure.correctiveAction = input.correctiveAction;
      if (input.status === "Resolved" || input.status === "Fixed" || input.status === "Closed") {
        foundFailure.resolvedAt = nowIso();
      }
      foundFailure.updatedAt = nowIso();

      // Check if all failures on this item are resolved
      const hasUnresolved = (foundItem.failures || []).some(
        (f) => f.status === "Open" || f.status === "In Progress"
      );
      if (!hasUnresolved && foundItem.status === "Failed") {
        foundItem.status = "In Progress";
      }

      foundItem.updatedAt = nowIso();
      parentProject.updatedAt = nowIso();
      writeStorage(data);
      return { success: true };
    },
  },

  // ── Notes ──────────────────────────────────────────────────────────────────
  notes: {
    async list(params?: {
      projectId?: string;
      phaseId?: string;
      category?: string;
      search?: string;
    }): Promise<Note[]> {
      const data = readStorage();
      let list = data.notes || [];

      if (params?.projectId && params.projectId !== "All") {
        list = list.filter((n) => n.projectId === params.projectId);
      }
      if (params?.phaseId && params.phaseId !== "All") {
        list = list.filter((n) => n.phaseId === params.phaseId);
      }
      if (params?.category && params.category !== "All") {
        list = list.filter((n) => n.category === params.category);
      }
      if (params?.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase();
        list = list.filter(
          (n) => (n.title || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q)
        );
      }

      return [...list].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    },

    async create(input: {
      projectId: string;
      phaseId?: string;
      title: string;
      content: string;
      category?: string;
    }): Promise<Note> {
      const data = readStorage();
      const project = data.projects.find((p) => p.id === input.projectId);
      const phase = project?.phases.find((ph) => ph.id === input.phaseId);

      const newNote: Note = {
        id: generateId(),
        projectId: input.projectId,
        phaseId: input.phaseId || null,
        title: input.title.trim(),
        content: input.content.trim(),
        category: input.category || "General",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        project: project ? { id: project.id, name: project.name, projectCode: project.projectCode } : undefined,
        phase: phase ? { id: phase.id, name: phase.name } : null,
      };

      if (!data.notes) data.notes = [];
      data.notes.unshift(newNote);
      writeStorage(data);
      return newNote;
    },

    async update(id: string, updates: Partial<Note>): Promise<Note> {
      const data = readStorage();
      const note = (data.notes || []).find((n) => n.id === id);
      if (!note) throw new Error("Note not found");

      Object.assign(note, updates, { updatedAt: nowIso() });
      writeStorage(data);
      return note;
    },

    async delete(id: string): Promise<{ success: boolean }> {
      const data = readStorage();
      data.notes = (data.notes || []).filter((n) => n.id !== id);
      writeStorage(data);
      return { success: true };
    },
  },

  // ── Backup, JSON Export / Restore & CSV Generation ───────────────────────────
  backup: {
    async exportJson(): Promise<string> {
      const data = readStorage();
      return JSON.stringify(
        {
          version: "1.0",
          schema: "embedded-dev-tracker",
          exportedAt: nowIso(),
          projects: data.projects,
          notes: data.notes,
        },
        null,
        2
      );
    },

    async importJson(jsonString: string): Promise<{ success: boolean; restoredCount: number }> {
      try {
        const parsed = JSON.parse(jsonString);
        let projectsToImport: Project[] = [];
        let notesToImport: Note[] = [];

        if (Array.isArray(parsed)) {
          projectsToImport = parsed;
        } else if (parsed && Array.isArray(parsed.projects)) {
          projectsToImport = parsed.projects;
          notesToImport = parsed.notes || [];
        } else if (parsed && parsed.id && parsed.name) {
          projectsToImport = [parsed];
        } else {
          throw new Error("Invalid backup file: Must contain an array of projects or a valid backup object.");
        }

        // Validate basic integrity of imported projects
        for (const p of projectsToImport) {
          if (!p.id || !p.name || !p.projectCode) {
            throw new Error(`Invalid project entry: Missing id, name, or projectCode in "${p.name || "Unknown"}"`);
          }
          if (!Array.isArray(p.phases)) {
            p.phases = createDefaultPhases(p.id);
          }
          if (!Array.isArray(p.releaseGates)) {
            p.releaseGates = createDefaultGates(p.id);
          }
          if (!Array.isArray(p.tasks)) {
            p.tasks = [];
          }
        }

        const data: StorageData = {
          projects: projectsToImport,
          notes: notesToImport,
        };

        writeStorage(data);
        return { success: true, restoredCount: projectsToImport.length };
      } catch (err: any) {
        throw new Error(err.message || "Failed to parse import JSON file.");
      }
    },

    async resetAll(): Promise<void> {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      const seed = generateSeedData();
      writeStorage(seed);
    },

    async exportGatesCsv(projectId?: string): Promise<string> {
      const data = readStorage();
      let projects = data.projects;
      if (projectId && projectId !== "All") {
        projects = projects.filter((p) => p.id === projectId);
      }

      const rows: string[] = [
        "Project Code,Project Name,Gate Name,Gate Type,Gate Status,Item Title,Mandatory,Item Status,Notes,Failures Count",
      ];

      projects.forEach((p) => {
        (p.releaseGates || []).forEach((g) => {
          (g.items || []).forEach((item) => {
            const cleanTitle = `"${(item.title || "").replace(/"/g, '""')}"`;
            const cleanNotes = `"${(item.notes || "").replace(/"/g, '""')}"`;
            const failuresCount = (item.failures || []).length;
            rows.push(
              `"${p.projectCode}","${p.name}","${g.name}","${g.gateType}","${g.status}",${cleanTitle},${
                item.isMandatory ? "YES" : "NO"
              },"${item.status}",${cleanNotes},${failuresCount}`
            );
          });
        });
      });

      return rows.join("\n");
    },
  },
};

// Aliases for seamless drop-in compatibility
export const apiService = storage;
