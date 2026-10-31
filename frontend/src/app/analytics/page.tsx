"use client";

import { useEffect, useState } from "react";
import { fetchAnalytics } from "@/lib/api";
import { BarChart3, Activity, ShieldCheck, Clock, Zap } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-slate-400">Loading Analytics...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-cyan-400" /> Platform Analytics & Performance Metrics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time metrics on AI diagnostic accuracy, case volume, and classification distribution.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-medium">Total Cases</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{data.total_cases}</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-medium">Avg AI Confidence</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{data.avg_confidence}%</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-medium">Diagnostic Accuracy</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{data.accuracy_rate}%</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-medium">Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">{data.avg_resolution_time_sec}s</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Protocol Category Distribution</h2>
        <div className="space-y-3">
          {Object.entries(data.category_distribution || {}).map(([cat, count]: [string, any]) => (
            <div key={cat} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-mono font-medium">{cat}</span>
                <span className="text-slate-400">{count} cases</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full"
                  style={{ width: `${(count / data.total_cases) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}