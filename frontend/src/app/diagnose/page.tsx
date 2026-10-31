"use client";

import { useState } from "react";
import { Stethoscope, Play, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";

interface DiagnosisResponse {
  osi_layer: string;
  confidence: number;
  confidence_level: string;
  root_cause: string;
  rule_findings: { rule_id: string; title: string; evidence: string }[];
  fix_steps: string;
  verification_steps: string[];
}

export default function DiagnosePage() {
  const [formData, setFormData] = useState({
    case_id: "CASE-001",
    symptom: "Interface down / packet drop detected",
    show_output: "interface GigabitEthernet0/1\n shutdown\n encapsulation dot1q 10",
    category: "VLAN",
    device: "SW-01",
    severity: "High",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunDiagnosis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Backend server error");
      const data: DiagnosisResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError("Failed to connect to backend at http://127.0.0.1:8000/api/diagnose. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Stethoscope className="w-6 h-6 text-cyan-400" /> AI Diagnostic Studio
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Submit Cisco device command output for deterministic rule validation and automated root-cause extraction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Controls */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Telemetry Input Parameters</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Device Name</label>
              <input
                type="text"
                value={formData.device}
                onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="VLAN">VLAN</option>
                <option value="Gateway">Gateway</option>
                <option value="DHCP">DHCP</option>
                <option value="DNS">DNS</option>
                <option value="Routing">Routing</option>
                <option value="ACL">ACL</option>
                <option value="NAT">NAT</option>
                <option value="Wireless">Wireless</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium">Observed Symptom</label>
            <input
              type="text"
              value={formData.symptom}
              onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium">Cisco Terminal Output (`show` logs)</label>
            <textarea
              rows={8}
              value={formData.show_output}
              onChange={(e) => setFormData({ ...formData, show_output: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400 mt-1 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleRunDiagnosis}
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {loading ? "Analyzing Output..." : "Run AI Diagnosis"}
          </button>
        </div>

        {/* Diagnostic Output View */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Diagnostic Assessment Report</span>
              {result && (
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {result.osi_layer}
                </span>
              )}
            </h2>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!result && !error && (
              <div className="text-xs text-slate-500 italic py-24 text-center">
                Click "Run AI Diagnosis" to send telemetry payload to the FastAPI engine.
              </div>
            )}

            {result && (
              <div className="space-y-4 mt-4 text-xs">
                {/* Confidence Badge */}
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Confidence Score:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="w-4 h-4" /> {(result.confidence * 100).toFixed(0)}% ({result.confidence_level})
                  </span>
                </div>

                {/* Root Cause */}
                <div className="space-y-1">
                  <p className="font-bold text-slate-300">Root Cause Explanation:</p>
                  <p className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-200">{result.root_cause}</p>
                </div>

                {/* Rule Findings */}
                {result.rule_findings.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-bold text-slate-300">Triggered Rules:</p>
                    {result.rule_findings.map((rf, i) => (
                      <div key={i} className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-amber-400">
                        <span className="font-mono font-bold">{rf.rule_id}</span> — {rf.title}: <span className="text-slate-300">{rf.evidence}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fix Steps */}
                <div className="space-y-1">
                  <p className="font-bold text-slate-300">Suggested Remediation CLI:</p>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-emerald-400 overflow-x-auto">
                    {result.fix_steps}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}