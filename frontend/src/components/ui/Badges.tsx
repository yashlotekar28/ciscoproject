import React from "react";
import { Severity, Status } from "@/lib/types";

export function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    critical: "bg-red-500/10 text-red-400 border-red-500/30",
    high: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    low: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${styles[severity] || styles.low}`}>
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    edited: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    rejected: "bg-red-500/10 text-red-400 border-red-500/30",
    verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}