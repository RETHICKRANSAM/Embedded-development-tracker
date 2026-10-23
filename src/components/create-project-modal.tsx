"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Cpu, AlertOctagon } from "lucide-react";
import { useProject } from "./providers";
import { apiService } from "@/lib/api-service";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: any) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: CreateProjectModalProps) {
  const { refreshProjects, setSelectedProjectId } = useProject();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    projectCode: "",
    description: "",
    category: "Firmware",
    hardwarePlatform: "",
    mcu: "",
    ide: "",
    language: "C / C++",
    rtos: "",
    repositoryUrl: "",
    startDate: "",
    targetDate: "",
  });

  useEffect(() => {
    if (!formData.startDate) {
      setFormData((prev) => ({
        ...prev,
        startDate: new Date().toISOString().slice(0, 10),
      }));
    }
  }, [formData.startDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.projectCode.trim()) {
      setError("Project Name and Project Code are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.projects.create(formData);
      await refreshProjects();
      setSelectedProjectId(data.id);
      if (onProjectCreated) onProjectCreated(data);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while creating project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Create New Embedded Project
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Initializes 7 development phases and 3 release gate checklists automatically.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 text-xs font-semibold flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Project Name <span className="text-zinc-950 dark:text-zinc-50 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. STM32 Smart Sensor Gateway"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-3 py-2 focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Project Code <span className="text-zinc-950 dark:text-zinc-50 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. STM32-GW"
                value={formData.projectCode}
                onChange={(e) =>
                  setFormData({ ...formData, projectCode: e.target.value.toUpperCase() })
                }
                required
                className="w-full font-mono bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-3 py-2 focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Summary of project goals, hardware specs, sensors, and protocols..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-3 py-2 focus:outline-hidden focus:border-black dark:focus:border-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Target MCU / SoC
              </label>
              <input
                type="text"
                placeholder="e.g. STM32F401RE, ESP32-S3, nRF52840"
                value={formData.mcu}
                onChange={(e) => setFormData({ ...formData, mcu: e.target.value })}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-3 py-2 focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Hardware Platform / Board
              </label>
              <input
                type="text"
                placeholder="e.g. Nucleo-64, Custom PCB Rev A"
                value={formData.hardwarePlatform}
                onChange={(e) => setFormData({ ...formData, hardwarePlatform: e.target.value })}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-3 py-2 focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-3 py-2 focus:outline-hidden focus:border-black dark:focus:border-white"
              >
                <option value="Industrial Firmware">Industrial Firmware</option>
                <option value="IoT Device">IoT Device</option>
                <option value="Consumer Electronics">Consumer Electronics</option>
                <option value="Robotics / Edge AI">Robotics / Edge AI</option>
                <option value="Automotive / CAN">Automotive / CAN</option>
                <option value="Medical Device">Medical Device</option>
                <option value="Firmware Driver">Firmware Driver</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                RTOS / OS
              </label>
              <input
                type="text"
                placeholder="e.g. FreeRTOS, Zephyr, Bare-Metal"
                value={formData.rtos}
                onChange={(e) => setFormData({ ...formData, rtos: e.target.value })}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-3 py-2 focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                IDE & Toolchain
              </label>
              <input
                type="text"
                placeholder="e.g. STM32CubeIDE, VS Code, Keil"
                value={formData.ide}
                onChange={(e) => setFormData({ ...formData, ide: e.target.value })}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-3 py-2 focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-3 py-2 focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Target Completion Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-3 py-2 focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Repository URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://github.com/embedded-eng/my-device"
              value={formData.repositoryUrl}
              onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded px-3 py-2 focus:outline-hidden focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary h-9"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary h-9"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? "Creating..." : "Create Project"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
