"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Circle,
  ShieldCheck,
  MinusCircle,
  Check,
} from "lucide-react";

export interface StatusPillProps {
  status: string;
  onChange?: (newStatus: string) => void;
  options?: string[];
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DEFAULT_OPTIONS = ["To Do", "In Progress", "Pending", "Blocked", "Done"];

export function getStatusStyle(status: string): {
  className: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
} {
  const norm = (status || "").toLowerCase().trim();
  switch (norm) {
    case "done":
    case "passed":
    case "verified":
    case "fixed":
      return {
        className:
          "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold border border-transparent shadow-xs",
        label: status,
        icon: CheckCircle2,
      };
    case "in progress":
    case "working on it":
      return {
        className:
          "bg-zinc-200 text-zinc-900 border border-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 font-medium",
        label: status === "In Progress" ? "In Progress" : status,
        icon: Clock,
      };
    case "blocked":
    case "failed":
    case "stuck":
      return {
        className:
          "bg-zinc-100 text-zinc-950 border-2 border-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 dark:border-zinc-100 font-bold",
        label: status === "Blocked" ? "Blocked" : status,
        icon: AlertOctagon,
      };
    case "ready for review":
    case "review":
      return {
        className:
          "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900 font-semibold border border-transparent",
        label: "Ready for Review",
        icon: ShieldCheck,
      };
    case "skipped":
      return {
        className:
          "bg-zinc-100 text-zinc-600 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700",
        label: "Skipped",
        icon: MinusCircle,
      };
    case "to do":
    case "pending":
    case "not started":
    default:
      return {
        className:
          "bg-white text-zinc-700 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700 font-normal",
        label: status || "To Do",
        icon: Circle,
      };
  }
}

export function StatusPill({
  status,
  onChange,
  options = DEFAULT_OPTIONS,
  disabled = false,
  size = "md",
  className = "",
}: StatusPillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const styleConfig = getStatusStyle(status);
  const Icon = styleConfig.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] h-6",
    md: "px-2.5 py-1 text-xs h-7",
    lg: "px-3.5 py-1.5 text-xs h-8",
  }[size];

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled || !onChange}
        onClick={() => {
          if (!disabled && onChange) setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between gap-1.5 rounded transition-all select-none ${styleConfig.className} ${sizeClasses} ${
          !disabled && onChange
            ? "cursor-pointer hover:opacity-90 active:scale-98"
            : "cursor-default"
        }`}
        title={styleConfig.label}
      >
        <span className="flex items-center gap-1.5 truncate">
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{styleConfig.label}</span>
        </span>
        {!disabled && onChange && (
          <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-1 min-w-[150px] p-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 px-2 py-1 mb-0.5 border-b border-zinc-200 dark:border-zinc-800">
            Set Status
          </div>
          <div className="space-y-1 mt-1">
            {options.map((opt) => {
              const optStyle = getStatusStyle(opt);
              const OptIcon = optStyle.icon;
              const isSelected = opt.toLowerCase() === status.toLowerCase();

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange?.(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold"
                      : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <OptIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{optStyle.label}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
