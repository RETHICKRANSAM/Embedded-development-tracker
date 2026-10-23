"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { apiService } from "@/lib/api-service";

type Theme = "dark" | "light";

interface ProjectContextType {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  projects: any[];
  refreshProjects: () => Promise<void>;
  isNotesDrawerOpen: boolean;
  setIsNotesDrawerOpen: (open: boolean) => void;
  activePhaseForNotes: string | null;
  setActivePhaseForNotes: (phaseId: string | null) => void;
}

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "dark",
  toggleTheme: () => {},
});

const ProjectContext = createContext<ProjectContextType>({
  selectedProjectId: null,
  setSelectedProjectId: () => {},
  projects: [],
  refreshProjects: async () => {},
  isNotesDrawerOpen: false,
  setIsNotesDrawerOpen: () => {},
  activePhaseForNotes: null,
  setActivePhaseForNotes: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function useProject() {
  return useContext(ProjectContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [activePhaseForNotes, setActivePhaseForNotes] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("edt_theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }

    const savedProjectId = localStorage.getItem("edt_active_project");
    if (savedProjectId) {
      setSelectedProjectId(savedProjectId);
    }

    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await apiService.projects.list();
      setProjects(data);
      if (data && data.length > 0 && !selectedProjectId) {
        const saved = localStorage.getItem("edt_active_project");
        if (saved && data.some((p: any) => p.id === saved)) {
          setSelectedProjectId(saved);
        } else {
          setSelectedProjectId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load projects in provider:", err);
    }
  };

  const handleSetSelectedProject = (id: string | null) => {
    setSelectedProjectId(id);
    if (id) {
      localStorage.setItem("edt_active_project", id);
    } else {
      localStorage.removeItem("edt_active_project");
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("edt_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ProjectContext.Provider
        value={{
          selectedProjectId,
          setSelectedProjectId: handleSetSelectedProject,
          projects,
          refreshProjects: fetchProjects,
          isNotesDrawerOpen,
          setIsNotesDrawerOpen,
          activePhaseForNotes,
          setActivePhaseForNotes,
        }}
      >
        {children}
      </ProjectContext.Provider>
    </ThemeContext.Provider>
  );
}
