"use client";

import { useState } from "react";
import { UserCheck, CheckCircle2, XCircle, ShieldCheck, Terminal } from "lucide-react";

export default function HumanReviewPage() {
  const [queue, setQueue] = useState([
    {
      id: "REV-101",
      case_id: "CASE-002",
      device: "SW-1",
      layer: "Layer 2",
      recommendation: "interface GigabitEthernet0/1\n switchport trunk allowed vlan add 20",
      status: "Pending"
    },
    {
      id: "REV-102",
      case_id: "CASE-007",
      device: "RTR-2",
      layer: "Layer 3",
      recommendation: "router ospf 1\n network 10.1.1.0 0.0.0.255 area 0",
      status: "Pending"
    }
  ]);

  const handleDecision = (id: string, decision: "Approved" | "Rejected") => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <UserCheck className="w-6 h-6 text-purple-400" /> Human-in-the-Loop Approval Queue
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review and sign off on AI-generated remediation scripts before pushing CLI updates to production network hardware.
        </p>
      </div>

      <div className="space-y-4">
        {queue.map((item) => (
          <div key={item.id} className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full">
                  {item.id}
                </span>
                <span className="text-sm font-bold text-white">{item.case_id} — Target: {item.device}</span>
                <span className="text-xs text-slate-400 font-mono">({item.layer})</span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border font-mono ${
                item.status === "Approved"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : item.status === "Rejected"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}>
                {item.status}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Proposed Remediation Script
              </label>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-400 font-mono">
                {item.recommendation}
              </pre>
            </div>

            {item.status === "Pending" && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleDecision(item.id, "Rejected")}
                  className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-red-400" /> Reject Script
                </button>
                <button
                  onClick={() => handleDecision(item.id, "Approved")}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 fill-current" /> Approve & Apply Fix
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}