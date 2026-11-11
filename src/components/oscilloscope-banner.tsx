"use client";

import React from "react";
import { Activity, Cpu, Radio, Zap } from "lucide-react";

export function OscilloscopeBanner() {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 overflow-hidden shadow-xs select-none">
      {/* Scope Header Control Bar */}
      <div className="px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-3">
          {/* Signal Indicator & Living Heartbeat LED */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 heartbeat-led shrink-0" />
            <span className="font-semibold text-emerald-400 tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 inline-block text-emerald-400" />
              <span>LIVE SIGNAL TELEMETRY</span>
            </span>
          </div>

          <span className="text-zinc-600 dark:text-zinc-500">|</span>

          {/* Channels */}
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              CH1: SYS_CLK (168MHz)
            </span>
            <span className="hidden sm:flex items-center gap-1 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              CH2: SPI/I2C DMA
            </span>
          </div>
        </div>

        {/* Scope Telemetry Metrics */}
        <div className="flex items-center gap-3 text-zinc-400">
          <span className="hidden md:inline text-zinc-500">
            TRIG: <strong className="text-zinc-300">AUTO · 500ns/div</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
            RTOS KERNEL: 1kHz TICK
          </span>
        </div>
      </div>

      {/* Scope Waveform Screen */}
      <div className="relative h-16 sm:h-20 bg-zinc-950 overflow-hidden flex items-center">
        {/* CRT Grid Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(16, 185, 129, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(16, 185, 129, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "28px 16px",
          }}
        />

        {/* Signal Waveform 1: Square Clock Wave (CH1 - Green) */}
        <div className="absolute inset-x-0 top-2 sm:top-2.5 h-6 overflow-hidden pointer-events-none">
          <div className="clock-wave-scroll flex items-center">
            <svg
              className="w-full shrink-0 h-6 stroke-emerald-400 fill-none"
              style={{ filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.6))" }}
              viewBox="0 0 600 24"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 20 L 25 20 L 25 4 L 50 4 L 50 20 L 75 20 L 75 4 L 100 4 L 100 20 L 125 20 L 125 4 L 150 4 L 150 20 L 175 20 L 175 4 L 200 4 L 200 20 L 225 20 L 225 4 L 250 4 L 250 20 L 275 20 L 275 4 L 300 4 L 300 20 L 325 20 L 325 4 L 350 4 L 350 20 L 375 20 L 375 4 L 400 4 L 400 20 L 425 20 L 425 4 L 450 4 L 450 20 L 475 20 L 475 4 L 500 4 L 500 20 L 525 20 L 525 4 L 550 4 L 550 20 L 575 20 L 575 4 L 600 4"
                strokeWidth="1.75"
              />
            </svg>
            <svg
              className="w-full shrink-0 h-6 stroke-emerald-400 fill-none"
              style={{ filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.6))" }}
              viewBox="0 0 600 24"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 20 L 25 20 L 25 4 L 50 4 L 50 20 L 75 20 L 75 4 L 100 4 L 100 20 L 125 20 L 125 4 L 150 4 L 150 20 L 175 20 L 175 4 L 200 4 L 200 20 L 225 20 L 225 4 L 250 4 L 250 20 L 275 20 L 275 4 L 300 4 L 300 20 L 325 20 L 325 4 L 350 4 L 350 20 L 375 20 L 375 4 L 400 4 L 400 20 L 425 20 L 425 4 L 450 4 L 450 20 L 475 20 L 475 4 L 500 4 L 500 20 L 525 20 L 525 4 L 550 4 L 550 20 L 575 20 L 575 4 L 600 4"
                strokeWidth="1.75"
              />
            </svg>
          </div>
        </div>

        {/* Signal Waveform 2: Telemetry Data Packet Wave (CH2 - Cyan) */}
        <div className="absolute inset-x-0 bottom-2 sm:bottom-2.5 h-6 overflow-hidden pointer-events-none">
          <div
            className="clock-wave-scroll flex items-center"
            style={{ animationDuration: "9s" }}
          >
            <svg
              className="w-full shrink-0 h-6 stroke-cyan-400 fill-none"
              style={{ filter: "drop-shadow(0 0 4px rgba(6, 182, 212, 0.6))" }}
              viewBox="0 0 600 24"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 20 L 40 20 L 40 5 L 80 5 L 80 20 L 100 20 L 100 5 L 120 5 L 120 20 L 170 20 L 170 5 L 230 5 L 230 20 L 280 20 L 280 5 L 310 5 L 310 20 L 340 20 L 340 5 L 420 5 L 420 20 L 450 20 L 450 5 L 510 5 L 510 20 L 600 20"
                strokeWidth="1.75"
              />
            </svg>
            <svg
              className="w-full shrink-0 h-6 stroke-cyan-400 fill-none"
              style={{ filter: "drop-shadow(0 0 4px rgba(6, 182, 212, 0.6))" }}
              viewBox="0 0 600 24"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 20 L 40 20 L 40 5 L 80 5 L 80 20 L 100 20 L 100 5 L 120 5 L 120 20 L 170 20 L 170 5 L 230 5 L 230 20 L 280 20 L 280 5 L 310 5 L 310 20 L 340 20 L 340 5 L 420 5 L 420 20 L 450 20 L 450 5 L 510 5 L 510 20 L 600 20"
                strokeWidth="1.75"
              />
            </svg>
          </div>
        </div>

        {/* Ambient CRT Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-pulse" />
      </div>
    </div>
  );
}

