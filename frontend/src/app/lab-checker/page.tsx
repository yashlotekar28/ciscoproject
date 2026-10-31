"use client";

import { useState } from "react";
import { Network, RefreshCw } from "lucide-react";

export default function LabCheckerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [nodes, setNodes] = useState([
    { id: "SW-1", role: "Core Switch", ip: "10.1.1.1", status: "Healthy", latency: "2ms" },
    { id: "SW-2", role: "Access Switch", ip: "10.1.1.2", status: "Warning", latency: "14ms" },
    { id: "RTR-1", role: "Edge Router", ip: "10.1.1.254", status: "Healthy", latency: "4ms" },
    { id: "FW-1", role: "Firewall", ip: "10.1.2.1", status: "Critical", latency: "Timeout" },
  ]);

  const runHealthCheck = () => {
    setIsScanning(true);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          status: Math.random() > 0.3 ? "Healthy" : "Warning",
          latency: `${Math.floor(Math.random() * 15) + 2}ms`,
        }))
      );
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Network className="w-6 h-6 text-emerald-400" /> Topology Lab Health Checker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit hardware nodes, management connectivity, and link latencies.
          </p>
        </div>
        <button
          onClick={runHealthCheck}
          disabled={isScanning}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
          {isScanning ? "Scanning..." : "Run Health Audit"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((node) => (
          <div key={node.id} className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-sm font-bold text-white">{node.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                node.status === "Healthy"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : node.status === "Warning"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                {node.status}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-slate-400">Role: <span className="text-slate-200">{node.role}</span></p>
              <p className="text-slate-400">Management IP: <span className="text-cyan-400 font-mono">{node.ip}</span></p>
              <p className="text-slate-400">Latency: <span className="text-emerald-400 font-mono">{node.latency}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}