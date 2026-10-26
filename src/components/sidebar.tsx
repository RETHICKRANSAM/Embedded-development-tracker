"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  GitFork,
  ShieldCheck,
  BookOpen,
  Settings,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen,
  Database,
  Eye,
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects Board", href: "/projects", icon: FolderGit2 },
  { name: "Lifecycle & Tasks", href: "/lifecycle", icon: GitFork },
  { name: "Product Release Gates", href: "/gates", icon: ShieldCheck },
  { name: "Engineering Notes", href: "/notes", icon: BookOpen },
  { name: "Settings & Backup", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Detect demo mode: on static hosts (not localhost) with no API URL
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    const host = window.location.hostname;
    if (!apiBase && host !== "localhost" && host !== "127.0.0.1") {
      setIsDemo(true);
    }
  }, []);

  return (
    <aside
      className={`flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between select-none transition-all duration-200 z-30 ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      <div>
        {/* Workspace Brand Header */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-zinc-200 dark:border-zinc-800">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shrink-0 border border-zinc-700 dark:border-zinc-300">
                <Cpu className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  Embedded Dev Tracker
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  Engineering Suite
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shrink-0 border border-zinc-700 dark:border-zinc-300" title="Embedded Dev Tracker">
                <Cpu className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition-colors ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-900 font-medium"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? "text-white dark:text-zinc-950 stroke-[2.2]"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: Database / Demo Mode Indicator */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-2 py-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              {isDemo ? (
                <Eye className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Database className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              )}
              <span>{isDemo ? "Demo Mode" : "SQLite dev.db"}</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-800 dark:text-zinc-200 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${isDemo ? "bg-amber-500" : "bg-zinc-900 dark:bg-zinc-100"}`} />
              {isDemo ? "Read-only" : "Offline"}
            </span>
          </div>
        ) : (
          <div className="flex justify-center py-1" title={isDemo ? "Demo Mode (Read-only)" : "SQLite dev.db Connected (Offline)"}>
            <span className={`w-2 h-2 rounded-full ${isDemo ? "bg-amber-500" : "bg-zinc-900 dark:bg-zinc-100"}`} />
          </div>
        )}
      </div>
    </aside>
  );
}
