"use client";

import React from "react";

export interface StatusBatteryBarProps {
  items: Array<{ status: string }>;
  height?: number;
  className?: string;
  showLabels?: boolean;
}

export function StatusBatteryBar({
  items,
  height = 8,
  className = "",
  showLabels = false,
}: StatusBatteryBarProps) {
  if (!items || items.length === 0) {
    return (
      <div
        className={`w-full rounded bg-zinc-200 dark:bg-zinc-800 ${className}`}
        style={{ height }}
      />
    );
  }

  // Count occurrences
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    const s = item.status || "To Do";
    counts[s] = (counts[s] || 0) + 1;
  });

  const total = items.length;

  function getMonoSegmentClass(status: string): { bgClass: string; label: string } {
    const norm = status.toLowerCase().trim();
    switch (norm) {
      case "done":
      case "passed":
      case "verified":
      case "fixed":
        return {
          bgClass: "bg-zinc-950 dark:bg-zinc-100",
          label: "Done",
        };
      case "in progress":
      case "working on it":
        return {
          bgClass: "bg-zinc-500 dark:bg-zinc-500",
          label: "In Progress",
        };
      case "blocked":
      case "failed":
      case "stuck":
        return {
          bgClass: "bg-zinc-800 dark:bg-zinc-300 ring-1 ring-inset ring-black/20",
          label: "Blocked",
        };
      case "ready for review":
      case "review":
        return {
          bgClass: "bg-zinc-600 dark:bg-zinc-400",
          label: "Review",
        };
      case "to do":
      case "pending":
      case "not started":
      default:
        return {
          bgClass: "bg-zinc-200 dark:bg-zinc-800 border-l border-zinc-300 dark:border-zinc-700",
          label: "Pending",
        };
    }
  }

  const segments = Object.entries(counts).map(([status, count]) => {
    const pct = Math.round((count / total) * 100);
    const conf = getMonoSegmentClass(status);
    return {
      status,
      count,
      pct,
      bgClass: conf.bgClass,
      label: conf.label,
    };
  });

  // Sort order: Done first, then In Progress, Blocked, etc., and Pending last
  const order = ["done", "passed", "in progress", "working on it", "ready for review", "blocked", "failed", "pending", "to do", "not started"];
  segments.sort((a, b) => {
    const idxA = order.indexOf(a.status.toLowerCase());
    const idxB = order.indexOf(b.status.toLowerCase());
    return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
  });

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      <div
        className="w-full flex rounded overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 shadow-2xs"
        style={{ height }}
      >
        {segments.map((seg, i) => (
          <div
            key={seg.status + i}
            title={`${seg.label}: ${seg.count} (${seg.pct}%)`}
            style={{ width: `${(seg.count / total) * 100}%` }}
            className={`h-full transition-all duration-200 cursor-pointer ${seg.bgClass}`}
          />
        ))}
      </div>

      {showLabels && (
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-600 dark:text-zinc-400">
          {segments.map((seg) => (
            <div key={seg.status} className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full inline-block ${seg.bgClass}`}
              />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {seg.label}
              </span>
              <span>
                {seg.count} ({seg.pct}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
