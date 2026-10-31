"use client";

import { ThemeToggle } from "./ThemeToggle";
import { Server, Activity, ShieldAlert } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-16 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 flex items-center justify-between px-6 ml-64">
      <div className="flex items-center space-x-4">
        <span className="flex items-center text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Backend API Connected
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>Lab Environment: <strong className="text-slate-200 font-mono">Packet Tracer v8.2</strong></span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}