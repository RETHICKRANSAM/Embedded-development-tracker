// Centralized API Service Layer for Embedded Dev Tracker
// Connects frontend to existing Next.js App Router API endpoints
// Falls back to demo data when running as a static export (GitHub Pages)

import { demoApi } from "./demo-data";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

/**
 * Detect whether we are running in static/demo mode.
 * Static mode is active when there is no API base URL configured AND
 * we are not running on localhost (i.e. we are on GitHub Pages or a static host).
 */
function isStaticMode(): boolean {
  if (typeof window === "undefined") return false;
  // If an explicit API URL is configured, always use the real API
  if (API_BASE) return false;
  // On localhost with a dev server, the API routes are available
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return false;
  // Otherwise we're on a static host (e.g. GitHub Pages)
  return true;
}

/** Exported so other modules can check demo mode */
export const IS_DEMO_MODE =
  typeof window !== "undefined" ? isStaticMode() : false;

export function resolveApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const fullUrl = resolveApiUrl(url);
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // Ignore json parse error
    }
    throw new Error(errorMsg);
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return {} as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withDemo<T extends (...args: any[]) => any>(
  realFn: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  demoFn: (...args: any[]) => any
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((...args: any[]) => {
    if (isStaticMode()) {
      // Demo methods are synchronous — wrap in a resolved promise for consistency
      const result = demoFn(...args);
      return Promise.resolve(result);
    }
    return realFn(...args);
  }) as T;
}

export const apiService = {
  // Dashboard
  dashboard: {
    get: withDemo(
      () => request<any>("/api/dashboard"),
      () => demoApi.dashboard.get()
    ),
  },

  // Projects
  projects: {
    list: withDemo(
      () => request<any[]>("/api/projects"),
      () => demoApi.projects.list()
    ),
    get: withDemo(
      (id: string) => request<any>(`/api/projects/${id}`),
      (id: string) => demoApi.projects.get(id)
    ),
    create: withDemo(
      (data: {
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
      }) =>
        request<any>("/api/projects", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      (data: any) => demoApi.projects.create(data)
    ),
    update: withDemo(
      (id: string, data: Partial<any>) =>
        request<any>(`/api/projects/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      (id: string, data: any) => demoApi.projects.update(id, data)
    ),
    delete: withDemo(
      (id: string) =>
        request<{ success: boolean }>(`/api/projects/${id}`, {
          method: "DELETE",
        }),
      (id: string) => demoApi.projects.delete(id)
    ),
  },

  // Tasks
  tasks: {
    list: withDemo(
      (params?: { projectId?: string; phaseId?: string; status?: string; priority?: string }) => {
        const sp = new URLSearchParams();
        if (params?.projectId) sp.set("projectId", params.projectId);
        if (params?.phaseId) sp.set("phaseId", params.phaseId);
        if (params?.status) sp.set("status", params.status);
        if (params?.priority) sp.set("priority", params.priority);
        const q = sp.toString();
        return request<any[]>(`/api/tasks${q ? `?${q}` : ""}`);
      },
      (params?: any) => demoApi.tasks.list(params)
    ),
    get: withDemo(
      (id: string) => request<any>(`/api/tasks/${id}`),
      (id: string) => demoApi.tasks.get(id)
    ),
    create: withDemo(
      (data: {
        projectId: string;
        phaseId: string;
        title: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
        checklistItems?: { title: string }[];
      }) =>
        request<any>("/api/tasks", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      (data: any) => demoApi.tasks.create(data)
    ),
    update: withDemo(
      (id: string, data: Partial<any>) =>
        request<any>(`/api/tasks/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      (id: string, data: any) => demoApi.tasks.update(id, data)
    ),
    delete: withDemo(
      (id: string) =>
        request<{ success: boolean }>(`/api/tasks/${id}`, {
          method: "DELETE",
        }),
      (id: string) => demoApi.tasks.delete(id)
    ),
    addChecklistItem: withDemo(
      (taskId: string, title: string) =>
        request<any>(`/api/tasks/${taskId}/checklist`, {
          method: "POST",
          body: JSON.stringify({ title }),
        }),
      (taskId: string, title: string) => demoApi.tasks.addChecklistItem(taskId, title)
    ),
    updateChecklistItem: withDemo(
      (taskId: string, itemId: string, isCompleted: boolean) =>
        request<any>(`/api/tasks/${taskId}/checklist`, {
          method: "PUT",
          body: JSON.stringify({ itemId, isCompleted }),
        }),
      (taskId: string, itemId: string, isCompleted: boolean) =>
        demoApi.tasks.updateChecklistItem(taskId, itemId, isCompleted)
    ),
    deleteChecklistItem: withDemo(
      (taskId: string, itemId: string) =>
        request<{ success: boolean }>(`/api/tasks/${taskId}/checklist`, {
          method: "DELETE",
          body: JSON.stringify({ itemId }),
        }),
      (taskId: string, itemId: string) => demoApi.tasks.deleteChecklistItem(taskId, itemId)
    ),
  },

  // Phase Checklist Items
  phaseItems: {
    create: withDemo(
      (data: {
        projectId: string;
        phaseId: string;
        title: string;
        description?: string;
        isMandatory?: boolean;
      }) =>
        request<any>("/api/phase-items", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      (data: any) => demoApi.phaseItems.create(data)
    ),
    update: withDemo(
      (id: string, data: Partial<any>) =>
        request<any>(`/api/phase-items/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      (id: string, data: any) => demoApi.phaseItems.update(id, data)
    ),
    delete: withDemo(
      (id: string) =>
        request<{ success: boolean }>(`/api/phase-items/${id}`, {
          method: "DELETE",
        }),
      (id: string) => demoApi.phaseItems.delete(id)
    ),
  },

  // Release Gates
  gates: {
    get: withDemo(
      (id: string) => request<any>(`/api/gates/${id}`),
      (id: string) => demoApi.gates.get(id)
    ),
    update: withDemo(
      (id: string, data: Partial<any>) =>
        request<any>(`/api/gates/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      (id: string, data: any) => demoApi.gates.update(id, data)
    ),
    passGate: withDemo(
      (id: string, data: { firmwareVersion?: string; hardwareRevision?: string; reviewNote?: string }) =>
        request<any>(`/api/gates/${id}`, {
          method: "PUT",
          body: JSON.stringify({ action: "pass", ...data }),
        }),
      (id: string, data: any) => demoApi.gates.passGate(id, data)
    ),
    updateItem: withDemo(
      (itemId: string, data: Partial<any>) =>
        request<any>(`/api/gate-items/${itemId}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      (itemId: string, data: any) => demoApi.gates.updateItem(itemId, data)
    ),
    createFailure: withDemo(
      (gateItemId: string, data: {
        description: string;
        expectedBehavior?: string;
        actualBehavior?: string;
        correctiveAction?: string;
        createTask?: boolean;
      }) =>
        request<any>(`/api/gate-items/${gateItemId}/failures`, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      (gateItemId: string, data: any) => demoApi.gates.createFailure(gateItemId, data)
    ),
    updateFailure: withDemo(
      (gateItemId: string, data: {
        failureId: string;
        status: string;
        retestResult?: string;
        correctiveAction?: string;
      }) =>
        request<any>(`/api/gate-items/${gateItemId}/failures`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      (gateItemId: string, data: any) => demoApi.gates.updateFailure(gateItemId, data)
    ),
  },

  // Engineering Notes
  notes: {
    list: withDemo(
      (params?: { projectId?: string; phaseId?: string; category?: string; search?: string }) => {
        const sp = new URLSearchParams();
        if (params?.projectId) sp.set("projectId", params.projectId);
        if (params?.phaseId) sp.set("phaseId", params.phaseId);
        if (params?.category) sp.set("category", params.category);
        if (params?.search) sp.set("search", params.search);
        const q = sp.toString();
        return request<any[]>(`/api/notes${q ? `?${q}` : ""}`);
      },
      (params?: any) => demoApi.notes.list(params)
    ),
    create: withDemo(
      (data: {
        projectId: string;
        phaseId?: string;
        title: string;
        content: string;
        category?: string;
      }) =>
        request<any>("/api/notes", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      (data: any) => demoApi.notes.create(data)
    ),
    update: withDemo(
      (id: string, data: Partial<any>) =>
        request<any>(`/api/notes/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      (id: string, data: any) => demoApi.notes.update(id, data)
    ),
    delete: withDemo(
      (id: string) =>
        request<{ success: boolean }>(`/api/notes/${id}`, {
          method: "DELETE",
        }),
      (id: string) => demoApi.notes.delete(id)
    ),
  },

  // Backup & Export
  backup: {
    get downloadDbUrl() {
      return isStaticMode() ? "#" : resolveApiUrl("/api/backup?action=download");
    },
    get exportJsonUrl() {
      return isStaticMode() ? "#" : resolveApiUrl("/api/backup?action=export_json");
    },
    restore: withDemo(
      (projectsData: any[]) =>
        request<{ success: boolean; restoredCount: number }>("/api/backup", {
          method: "POST",
          body: JSON.stringify(projectsData),
        }),
      (data: any) => demoApi.backup.restore(data)
    ),
    exportData: (format: "json" | "csv", type: "project" | "gates" | "tasks", projectId?: string) => {
      if (isStaticMode()) return "#";
      const sp = new URLSearchParams({ format, type });
      if (projectId) sp.set("projectId", projectId);
      return resolveApiUrl(`/api/export?${sp.toString()}`);
    },
  },
};
