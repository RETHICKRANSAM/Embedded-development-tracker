"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
}

export interface MondayTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MondayTabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: MondayTabsProps) {
  return (
    <div
      className={`flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 px-2 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs transition-all relative select-none cursor-pointer ${
              isActive
                ? "border-b-2 border-black dark:border-white text-black dark:text-white font-bold"
                : "border-b-2 border-transparent text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-t"
            }`}
          >
            {Icon && (
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? "text-black dark:text-white" : "text-zinc-400 dark:text-zinc-500"
                }`}
              />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isActive
                    ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold border border-zinc-300 dark:border-zinc-700"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
