"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";

export interface PriorityPillProps {
  priority: string;
  onChange?: (newPriority: string) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];

export function getPriorityStyle(priority: string): {
  className: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
} {
  const norm = (priority || "").toLowerCase().trim();
  switch (norm) {
    case "critical":
      return {
        className:
          "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border border-transparent shadow-xs",
        label: "Critical",
        icon: AlertTriangle,
      };
    case "high":
      return {
        className:
          "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900 font-semibold border border-transparent",
        label: "High",
        icon: ArrowUp,
      };
    case "medium":
      return {
        className:
          "bg-zinc-200 text-zinc-900 border border-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 font-medium",
        label: "Medium",
        icon: ArrowRight,
      };
    case "low":
    default:
      return {
        className:
          "bg-white text-zinc-600 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700 font-normal",
        label: "Low",
        icon: ArrowDown,
      };
  }
}

export function PriorityPill({
  priority,
  onChange,
  disabled = false,
  size = "md",
  className = "",
}: PriorityPillProps) {
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

  const styleConfig = getPriorityStyle(priority);
  const Icon = styleConfig.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] h-6",
    md: "px-2.5 py-1 text-xs h-7",
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
        title={`Priority: ${styleConfig.label}`}
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
        <div className="absolute z-50 left-0 mt-1 min-w-[130px] p-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 px-2 py-1 mb-0.5 border-b border-zinc-200 dark:border-zinc-800">
            Set Priority
          </div>
          <div className="space-y-1 mt-1">
            {PRIORITY_OPTIONS.map((opt) => {
              const optStyle = getPriorityStyle(opt);
              const OptIcon = optStyle.icon;
              const isSelected = opt.toLowerCase() === (priority || "").toLowerCase();

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
                  <span className="flex items-center gap-2">
                    <OptIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{opt}</span>
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
