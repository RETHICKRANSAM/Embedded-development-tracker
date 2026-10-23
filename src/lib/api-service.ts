// Centralized API Service Layer for Embedded Dev Tracker
// Connects frontend to existing Next.js App Router API endpoints

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
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

export const apiService = {
  // Dashboard
  dashboard: {
    get: () => request<any>("/api/dashboard"),
  },

  // Projects
  projects: {
    list: () => request<any[]>("/api/projects"),
    get: (id: string) => request<any>(`/api/projects/${id}`),
    create: (data: {
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
    update: (id: string, data: Partial<any>) =>
      request<any>(`/api/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/projects/${id}`, {
        method: "DELETE",
      }),
  },

  // Tasks
  tasks: {
    list: (params?: { projectId?: string; phaseId?: string; status?: string; priority?: string }) => {
      const sp = new URLSearchParams();
      if (params?.projectId) sp.set("projectId", params.projectId);
      if (params?.phaseId) sp.set("phaseId", params.phaseId);
      if (params?.status) sp.set("status", params.status);
      if (params?.priority) sp.set("priority", params.priority);
      const q = sp.toString();
      return request<any[]>(`/api/tasks${q ? `?${q}` : ""}`);
    },
    get: (id: string) => request<any>(`/api/tasks/${id}`),
    create: (data: {
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
    update: (id: string, data: Partial<any>) =>
      request<any>(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/tasks/${id}`, {
        method: "DELETE",
      }),
    addChecklistItem: (taskId: string, title: string) =>
      request<any>(`/api/tasks/${taskId}/checklist`, {
        method: "POST",
        body: JSON.stringify({ title }),
      }),
    updateChecklistItem: (taskId: string, itemId: string, isCompleted: boolean) =>
      request<any>(`/api/tasks/${taskId}/checklist`, {
        method: "PUT",
        body: JSON.stringify({ itemId, isCompleted }),
      }),
    deleteChecklistItem: (taskId: string, itemId: string) =>
      request<{ success: boolean }>(`/api/tasks/${taskId}/checklist`, {
        method: "DELETE",
        body: JSON.stringify({ itemId }),
      }),
  },

  // Phase Checklist Items
  phaseItems: {
    create: (data: {
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
    update: (id: string, data: Partial<any>) =>
      request<any>(`/api/phase-items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/phase-items/${id}`, {
        method: "DELETE",
      }),
  },

  // Release Gates
  gates: {
    get: (id: string) => request<any>(`/api/gates/${id}`),
    update: (id: string, data: Partial<any>) =>
      request<any>(`/api/gates/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    passGate: (id: string, data: { firmwareVersion?: string; hardwareRevision?: string; reviewNote?: string }) =>
      request<any>(`/api/gates/${id}`, {
        method: "PUT",
        body: JSON.stringify({ action: "pass", ...data }),
      }),
    updateItem: (itemId: string, data: Partial<any>) =>
      request<any>(`/api/gate-items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    createFailure: (gateItemId: string, data: {
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
    updateFailure: (gateItemId: string, data: {
      failureId: string;
      status: string;
      retestResult?: string;
      correctiveAction?: string;
    }) =>
      request<any>(`/api/gate-items/${gateItemId}/failures`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Engineering Notes
  notes: {
    list: (params?: { projectId?: string; phaseId?: string; category?: string; search?: string }) => {
      const sp = new URLSearchParams();
      if (params?.projectId) sp.set("projectId", params.projectId);
      if (params?.phaseId) sp.set("phaseId", params.phaseId);
      if (params?.category) sp.set("category", params.category);
      if (params?.search) sp.set("search", params.search);
      const q = sp.toString();
      return request<any[]>(`/api/notes${q ? `?${q}` : ""}`);
    },
    create: (data: {
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
    update: (id: string, data: Partial<any>) =>
      request<any>(`/api/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/notes/${id}`, {
        method: "DELETE",
      }),
  },

  // Backup & Export
  backup: {
    downloadDbUrl: "/api/backup?action=download",
    exportJsonUrl: "/api/backup?action=export_json",
    exportData: (format: "json" | "csv", type: "project" | "gates" | "tasks", projectId?: string) => {
      const sp = new URLSearchParams({ format, type });
      if (projectId) sp.set("projectId", projectId);
      return `/api/export?${sp.toString()}`;
    },
  },
};
