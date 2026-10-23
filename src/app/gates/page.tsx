"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Plus,
  AlertOctagon,
  X,
  Download,
  Check,
  Bug,
} from "lucide-react";
import { useProject } from "@/components/providers";
import { formatDate } from "@/lib/utils";
import { apiService } from "@/lib/api-service";
import { StatusPill } from "@/components/monday/status-pill";
import { StatusBatteryBar } from "@/components/monday/status-battery-bar";
import { MondayTabs } from "@/components/monday/monday-tabs";

export default function ReleaseGatesPage() {
  const { selectedProjectId, refreshProjects } = useProject();

  const [projectData, setProjectData] = useState<any>(null);
  const [activeGateId, setActiveGateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passFwVersion, setPassFwVersion] = useState("");
  const [passHwRevision, setPassHwRevision] = useState("");
  const [passReviewNote, setPassReviewNote] = useState("");
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Failure Logging Modal
  const [failureModalItem, setFailureModalItem] = useState<any>(null);
  const [failDesc, setFailDesc] = useState("");
  const [failExpected, setFailExpected] = useState("");
  const [failActual, setFailActual] = useState("");
  const [failCorrective, setFailCorrective] = useState("");
  const [failCreateTask, setFailCreateTask] = useState(true);
  const [failSubmitting, setFailSubmitting] = useState(false);

  // Failure History / Retest Modal
  const [historyModalItem, setHistoryModalItem] = useState<any>(null);
  const [retestResult, setRetestResult] = useState("");
  const [retestStatus, setRetestStatus] = useState("Fixed");

  // Add Custom Gate Item Modal
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemMandatory, setNewItemMandatory] = useState(true);

  const fetchProjectGates = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const data = await apiService.projects.get(selectedProjectId);
      setProjectData(data);
      if (data.releaseGates?.length > 0) {
        if (!activeGateId || !data.releaseGates.some((g: any) => g.id === activeGateId)) {
          setActiveGateId(data.releaseGates[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load release gates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectGates();
  }, [selectedProjectId]);

  const activeGate = projectData?.releaseGates?.find((g: any) => g.id === activeGateId) || null;

  // Toggle item status between Passed / Pending
  const handleToggleItemStatus = async (item: any) => {
    const nextStatus = item.status === "Passed" ? "Pending" : "Passed";
    try {
      await apiService.gates.updateItem(item.id, { status: nextStatus });
      fetchProjectGates();
      refreshProjects();
    } catch (err) {
      console.error("Failed to toggle item status:", err);
    }
  };

  // Status dropdown change
  const handleItemStatusChange = async (itemId: string, status: string) => {
    try {
      await apiService.gates.updateItem(itemId, { status });
      fetchProjectGates();
      refreshProjects();
    } catch (err) {
      console.error("Failed to update gate item status:", err);
    }
  };

  // Submit Failure
  const handleSubmitFailure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!failureModalItem || !failDesc.trim()) return;

    setFailSubmitting(true);
    try {
      await apiService.gates.createFailure(failureModalItem.id, {
        description: failDesc.trim(),
        expectedBehavior: failExpected.trim() || undefined,
        actualBehavior: failActual.trim() || undefined,
        correctiveAction: failCorrective.trim() || undefined,
        createTask: failCreateTask,
      });

      setFailureModalItem(null);
      setFailDesc("");
      setFailExpected("");
      setFailActual("");
      setFailCorrective("");
      fetchProjectGates();
      refreshProjects();
    } catch (err) {
      console.error("Failed to log failure:", err);
    } finally {
      setFailSubmitting(false);
    }
  };

  // Submit Retest Update
  const handleUpdateRetest = async (failureId: string) => {
    if (!historyModalItem) return;

    try {
      await apiService.gates.updateFailure(historyModalItem.id, {
        failureId,
        status: retestStatus,
        retestResult: retestResult.trim() || undefined,
      });

      setHistoryModalItem(null);
      setRetestResult("");
      fetchProjectGates();
      refreshProjects();
    } catch (err) {
      console.error("Failed to update retest:", err);
    }
  };

  // Pass Gate Confirmation
  const handlePassGateConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGate) return;

    setPassSubmitting(true);
    setPassError(null);

    try {
      await apiService.gates.passGate(activeGate.id, {
        firmwareVersion: passFwVersion.trim() || undefined,
        hardwareRevision: passHwRevision.trim() || undefined,
        reviewNote: passReviewNote.trim() || undefined,
      });

      setIsPassModalOpen(false);
      setPassFwVersion("");
      setPassHwRevision("");
      setPassReviewNote("");
      fetchProjectGates();
      refreshProjects();
    } catch (err: any) {
      setPassError(err.message || "Failed to mark gate as passed.");
    } finally {
      setPassSubmitting(false);
    }
  };

  // Add Item to Gate
  const handleAddGateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGate || !newItemTitle.trim()) return;

    try {
      const res = await fetch(`/api/gates/${activeGate.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newItemTitle.trim(),
          isMandatory: newItemMandatory,
        }),
      });
      if (res.ok) {
        setNewItemTitle("");
        setIsAddItemOpen(false);
        fetchProjectGates();
      }
    } catch (err) {
      console.error("Failed to add gate item:", err);
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center mx-auto border border-zinc-300 dark:border-zinc-700">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          No Project Selected
        </h2>
        <p className="text-xs text-zinc-500">
          Please select an active project to view and verify its Product Release Gates.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-zinc-950 dark:border-zinc-100 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-zinc-500">
            Loading Release Gates suite...
          </span>
        </div>
      </div>
    );
  }

  const releaseGates = projectData?.releaseGates || [];
  const items = activeGate?.items || [];
  const totalItems = items.length;
  const passedItems = items.filter((i: any) => i.status === "Passed").length;
  const mandatoryItems = items.filter((i: any) => i.isMandatory);
  const mandatoryPassed = mandatoryItems.filter((i: any) => i.status === "Passed").length;
  const blockedItems = items.filter((i: any) => i.status === "Blocked" || i.status === "Failed").length;
  const completionPct = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0;

  const isReadyToPass =
    mandatoryItems.length > 0 &&
    mandatoryPassed === mandatoryItems.length &&
    blockedItems === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Product Release Gates Suite
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
              {projectData?.projectCode}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Strict gate criteria required before firmware freeze, demo delivery, pilot rollout, or production sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeGate?.status === "Passed" ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold border border-transparent">
              <ShieldCheck className="w-4 h-4" />
              <span>Gate Passed ({formatDate(activeGate.passedAt)})</span>
            </div>
          ) : (
            <button
              onClick={() => {
                setPassFwVersion(activeGate?.firmwareVersion || "v1.0.0");
                setPassHwRevision(activeGate?.hardwareRevision || "Rev A");
                setIsPassModalOpen(true);
              }}
              disabled={!isReadyToPass}
              className={`h-9 ${
                isReadyToPass ? "btn-primary" : "btn-secondary opacity-50 cursor-not-allowed"
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Sign Off & Pass Gate</span>
            </button>
          )}

          <a
            href={apiService.backup.exportData("csv", "gates", selectedProjectId)}
            className="btn-secondary h-9"
            title="Download Verification Audit CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Audit</span>
          </a>
        </div>
      </div>

      {/* Gate Tabs (Demo, Pilot, Production) */}
      <MondayTabs
        tabs={releaseGates.map((g: any) => ({
          id: g.id,
          label: g.name,
          icon: ShieldCheck,
          badge: g.status,
        }))}
        activeTab={activeGateId || ""}
        onTabChange={setActiveGateId}
      />

      {/* Gate Summary Card */}
      {activeGate && (
        <div className="mono-card p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold shrink-0 border border-zinc-800 dark:border-zinc-200">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {activeGate.name}
                  </h2>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                    {activeGate.gateType}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-zinc-500">
                  <span>
                    Status: <strong className="text-zinc-900 dark:text-zinc-100">{activeGate.status}</strong>
                  </span>
                  {activeGate.firmwareVersion && (
                    <span>• Target Firmware: <strong>{activeGate.firmwareVersion}</strong></span>
                  )}
                  {activeGate.hardwareRevision && (
                    <span>• Hardware Rev: <strong>{activeGate.hardwareRevision}</strong></span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end md:self-auto">
              <div className="text-right">
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {passedItems} / {totalItems} Passed ({completionPct}%)
                </div>
                <div className="text-[11px] text-zinc-500">
                  Mandatory: {mandatoryPassed}/{mandatoryItems.length} Confirmed
                </div>
              </div>
              <div className="w-36">
                <StatusBatteryBar items={items} height={10} />
              </div>
            </div>
          </div>

          {!isReadyToPass && activeGate.status !== "Passed" && (
            <div className="p-3 rounded border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-zinc-900 dark:text-zinc-100" />
                <span>
                  {mandatoryItems.length - mandatoryPassed} mandatory check(s) still pending before this gate can be marked Passed.
                </span>
              </span>
              <span className="text-[11px] font-mono uppercase">Enforcing Gate Rules</span>
            </div>
          )}
        </div>
      )}

      {/* Verification Checklist Table */}
      <div className="mono-card overflow-hidden">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Verification Checklist Items
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold border border-zinc-300 dark:border-zinc-700">
              {items.length} checks
            </span>
          </div>

          <button
            onClick={() => setIsAddItemOpen(true)}
            className="btn-secondary h-7 text-[11px]"
          >
            <Plus className="w-3 h-3" />
            <span>Add Verification Item</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-semibold text-[11px]">
                <th className="py-2.5 px-4 min-w-[320px]">Verification Requirement</th>
                <th className="py-2.5 px-3 min-w-[100px]">Type</th>
                <th className="py-2.5 px-3 min-w-[140px]">Verification Status</th>
                <th className="py-2.5 px-3 min-w-[130px]">Failure / Retest</th>
                <th className="py-2.5 px-4 text-right">Quick Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {items.map((item: any) => {
                const failures = item.failures || [];

                return (
                  <tr key={item.id} className="mono-table-row">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {item.isMandatory ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 border border-transparent">
                          MANDATORY
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500">Optional</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <StatusPill
                        status={item.status}
                        onChange={(s) => handleItemStatusChange(item.id, s)}
                        options={["Passed", "Pending", "Failed", "Blocked", "Skipped"]}
                        size="sm"
                      />
                    </td>

                    <td className="py-3 px-3">
                      {failures.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setHistoryModalItem(item)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 cursor-pointer"
                        >
                          <Bug className="w-3.5 h-3.5" />
                          <span>{failures.length} Issue(s)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setFailureModalItem(item)}
                          className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Bug className="w-3.5 h-3.5" />
                          <span>Log Failure</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleItemStatus(item)}
                        className="btn-secondary h-7 text-[11px]"
                      >
                        {item.status === "Passed" ? "Mark Pending" : "Mark Passed"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Summary Bar */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <span>Total Checks: {items.length}</span>
          <div className="w-48">
            <StatusBatteryBar items={items} height={6} />
          </div>
        </div>
      </div>

      {/* Log Failure Modal */}
      {failureModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold">
                <Bug className="w-4 h-4" />
                <h3 className="text-sm">
                  Record Verification Failure: {failureModalItem.title}
                </h3>
              </div>
              <button
                onClick={() => setFailureModalItem(null)}
                className="text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitFailure} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Failure Description <span className="text-zinc-950 dark:text-zinc-50 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Device crashes after 4 hours under high SPI bus load"
                  value={failDesc}
                  onChange={(e) => setFailDesc(e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Expected Behavior
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Continuous packet sampling without stack overflow..."
                    value={failExpected}
                    onChange={(e) => setFailExpected(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Actual Behavior
                  </label>
                  <textarea
                    rows={2}
                    placeholder="HardFault handler triggered with memory corruption..."
                    value={failActual}
                    onChange={(e) => setFailActual(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Corrective Action / Engineering Plan
                </label>
                <textarea
                  rows={2}
                  placeholder="Increase FreeRTOS task stack by 512 bytes and enable MPU..."
                  value={failCorrective}
                  onChange={(e) => setFailCorrective(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  id="createTask"
                  checked={failCreateTask}
                  onChange={(e) => setFailCreateTask(e.target.checked)}
                  className="rounded text-black"
                />
                <label htmlFor="createTask" className="cursor-pointer">
                  Automatically create a corrective engineering task on the Lifecycle Board
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFailureModalItem(null)}
                  className="btn-secondary h-8"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={failSubmitting}
                  className="btn-primary h-8"
                >
                  {failSubmitting ? "Logging..." : "Log Failure & Block Gate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Failure History & Retest Modal */}
      {historyModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Failure & Retest Tracking: {historyModalItem.title}
              </h3>
              <button
                onClick={() => setHistoryModalItem(null)}
                className="text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {(historyModalItem.failures || []).map((f: any) => (
                <div
                  key={f.id}
                  className="p-3.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      {f.description}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                      {f.status}
                    </span>
                  </div>

                  {f.expectedBehavior && (
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      <strong>Expected:</strong> {f.expectedBehavior}
                    </div>
                  )}
                  {f.actualBehavior && (
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      <strong>Actual:</strong> {f.actualBehavior}
                    </div>
                  )}
                  {f.correctiveAction && (
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      <strong>Corrective Action:</strong> {f.correctiveAction}
                    </div>
                  )}

                  {/* Retest Form */}
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={retestStatus}
                        onChange={(e) => setRetestStatus(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs rounded p-1.5 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="Fixed">Mark Fixed (Awaiting Retest)</option>
                        <option value="Verified">Mark Verified (Retest Passed)</option>
                        <option value="Failed">Still Failing</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Retest observations..."
                        value={retestResult}
                        onChange={(e) => setRetestResult(e.target.value)}
                        className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs rounded p-1.5 text-zinc-900 dark:text-zinc-100"
                      />

                      <button
                        type="button"
                        onClick={() => handleUpdateRetest(f.id)}
                        className="btn-primary h-7 px-3 text-xs"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setHistoryModalItem(null)}
                className="btn-secondary h-8"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formal Sign-Off Modal */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-sm">
                  Sign Off & Mark Release Gate as Passed
                </h3>
              </div>
              <button
                onClick={() => setIsPassModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passError && (
              <div className="p-3 rounded border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 text-xs font-semibold flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePassGateConfirm} className="space-y-3">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                All mandatory verification checks are confirmed. Please freeze the verified firmware and hardware builds.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Verified Firmware Version
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. v1.2.0-rc1"
                    value={passFwVersion}
                    onChange={(e) => setPassFwVersion(e.target.value)}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Verified Hardware Revision
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rev B"
                    value={passHwRevision}
                    onChange={(e) => setPassHwRevision(e.target.value)}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Verification Review Note
                </label>
                <textarea
                  rows={2}
                  placeholder="All required peripheral stress tests and power-fail recoveries verified."
                  value={passReviewNote}
                  onChange={(e) => setPassReviewNote(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPassModalOpen(false)}
                  className="btn-secondary h-9"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passSubmitting}
                  className="btn-primary h-9"
                >
                  {passSubmitting ? "Approving..." : "Confirm & Pass Gate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Gate Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Add Verification Check
              </h3>
              <button
                onClick={() => setIsAddItemOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGateItem} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Check Title <span className="text-zinc-950 dark:text-zinc-50 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verify SPI Flash checksum persistence on brownout"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 rounded p-2 focus:outline-hidden focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={newItemMandatory}
                  onChange={(e) => setNewItemMandatory(e.target.checked)}
                  className="rounded text-black"
                />
                <label htmlFor="mandatoryCheck" className="cursor-pointer">
                  Mandatory check (Required for gate approval)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="btn-secondary h-8"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary h-8"
                >
                  Add Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
