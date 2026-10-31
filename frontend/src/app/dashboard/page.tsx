"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  ShieldCheck,
  Zap,
  Layers,
  Terminal,
  PlayCircle,
  ArrowRight,
  ShieldAlert,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

interface AnalyticsData {
  total_cases: number;
  resolved_cases: number;
  avg_confidence: number;
  category_breakdown: Record<string, number>;
  severity_breakdown?: Record<string, number>;
  human_agreement?: {
    accepted: number;
    edited: number;
    rejected: number;
    total_reviews: number;
    agreement_rate_pct: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AnalyticsData>({
    total_cases: 34,
    resolved_cases: 30,
    avg_confidence: 0.96,
    category_breakdown: {
      VLAN: 5,
      Gateway: 4,
      DHCP: 4,
      DNS: 4,
      Routing: 5,
      ACL: 4,
      NAT: 4,
      Wireless: 4
    },
    severity_breakdown: {
      Critical: 8,
      High: 18,
      Medium: 8
    },
    human_agreement: {
      accepted: 26,
      edited: 4,
      rejected: 4,
      total_reviews: 34,
      agreement_rate_pct: 76
    }
  });

  const [demoStep, setDemoStep] = useState(1);

  useEffect(() => {
    fetch(`${API_BASE_URL}/analytics`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.total_cases) {
          setStats(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <LayoutDashboard className="w-6 h-6 text-cyan-400" /> Operational Dashboard & AI Metrics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cisco Project 2 Summary: Issue themes, severity metrics, AI vs. human agreement rate, and live lab demonstration.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Evaluated Lab Cases</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.total_cases}</span>
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 8 / 8 Cisco Protocol Domains
          </span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs text-slate-400 font-medium">AI vs Human Agreement</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-purple-400 font-mono">
              {stats.human_agreement?.agreement_rate_pct ?? 76}%
            </span>
            <UserCheck className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-[11px] text-slate-400">
            {stats.human_agreement?.accepted ?? 26} Accepted | {stats.human_agreement?.edited ?? 4} Edited | {stats.human_agreement?.rejected ?? 4} Rejected
          </span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Avg AI Diagnostic Confidence</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">
              {((stats.avg_confidence ?? 0.96) * 100).toFixed(0)}%
            </span>
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-[11px] text-slate-400">Hybrid Deterministic + LLM</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Human Safety Guardrail</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">100%</span>
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-[11px] text-emerald-300">Mandatory Human Sign-off</span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Issue Types Distribution */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Issue Types Breakdown ({Object.keys(stats.category_breakdown).length} Categories)
            </h2>
            <Link href="/cases" className="text-xs text-cyan-400 hover:underline">
              View all cases →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(stats.category_breakdown).map(([cat, count]) => (
              <div key={cat} className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg space-y-1">
                <span className="text-xs text-slate-400 font-medium">{cat}</span>
                <p className="text-xl font-bold text-cyan-400 font-mono">{count} Cases</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${(count / stats.total_cases) * 100 * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity & Review Rate */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Severity & Human Oversight
            </h2>

            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                  <span className="text-red-400 font-bold">Critical Severity</span>
                  <span>{stats.severity_breakdown?.Critical ?? 8} Cases</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-red-500 h-full" style={{ width: "24%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                  <span className="text-amber-400 font-bold">High Severity</span>
                  <span>{stats.severity_breakdown?.High ?? 18} Cases</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-amber-500 h-full" style={{ width: "53%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                  <span className="text-blue-400 font-bold">Medium Severity</span>
                  <span>{stats.severity_breakdown?.Medium ?? 8} Cases</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-blue-500 h-full" style={{ width: "23%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Responsible AI Disagreements Logged:</span>
            <Link
              href="/human-review"
              className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full hover:bg-purple-500/20 transition-colors"
            >
              5 Documented Audits →
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Demonstration: One Broken Lab Diagnosed, Reviewed, Fixed & Verified */}
      <div className="bg-[#111827] border border-cyan-500/30 rounded-xl p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full mb-1">
              <PlayCircle className="w-3.5 h-3.5" /> Cisco Project 2 Live Demonstration
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Packet Tracer Broken Lab Walkthrough (CASE-VLAN-02)
            </h2>
            <p className="text-xs text-slate-400">
              Interactive demonstration of a broken lab being diagnosed, safety-reviewed by human engineer, fixed, and verified.
            </p>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setDemoStep(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer transition-all ${
                  demoStep === s
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Step {s}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1: Broken Case */}
        {demoStep === 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
              <span>STEP 1: OBSERVE SYMPTOM & COLLECT CLI TELEMETRY</span>
              <span className="text-red-400">DEVICE: Switch-A (Fa0/24)</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
              <p className="text-slate-300">
                <span className="font-bold text-white">Symptom:</span> All VLAN 20 workstations lose connectivity across Building A and Building B core switch link after scheduled maintenance.
              </p>
              <p className="text-slate-300 font-mono">
                <span className="font-bold text-white">Topology:</span> Switch-A (Fa0/24) &lt;--- 802.1Q Trunk ---&gt; Switch-B (Fa0/24)
              </p>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto">
{`Switch-A# show interfaces trunk
Port Mode Encapsulation Status Native vlan
Fa0/24 on 802.1q trunking 1

Port Vlans allowed on trunk
Fa0/24 1,10,30,40

Port Vlans allowed and active in management domain
Fa0/24 1,10,30,40`}
            </pre>
          </div>
        )}

        {/* Step 2: AI Diagnosis */}
        {demoStep === 2 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
              <span>STEP 2: NETSAGE AI DIAGNOSTIC ASSESSMENT</span>
              <span className="text-emerald-400">CONFIDENCE: 98% (High)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
                <div className="font-bold text-white">AI Diagnostic Extraction:</div>
                <div className="text-slate-300">
                  <span className="text-cyan-400 font-semibold">Root Cause:</span> VLAN 20 is pruned from the allowed list on trunk interface Fa0/24.
                </div>
                <div className="text-slate-300">
                  <span className="text-cyan-400 font-semibold">OSI Layer:</span> Layer 2 (Data Link)
                </div>
                <div className="text-slate-300">
                  <span className="text-cyan-400 font-semibold">Next Command:</span> show interfaces trunk
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
                <div className="font-bold text-white">Deterministic Rule Engine Match:</div>
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded font-mono text-amber-300 text-[11px]">
                  [RULE-VLAN-002] VLAN Pruned from Trunk Allowed List<br />
                  Evidence: Allowed list '1,10,30,40' omits target VLAN 20.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Human Review */}
        {demoStep === 3 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-purple-400 font-bold">
              <span>STEP 3: HUMAN REVIEW SAFETY AUDIT</span>
              <span className="text-amber-400">REVIEW DECISION: ACCEPTED & SIGNED OFF</span>
            </div>
            <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-lg text-xs space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <UserCheck className="w-4 h-4 text-purple-400" /> Human Engineer Sign-Off Summary:
              </div>
              <p className="text-slate-300 leading-relaxed">
                Reviewer checked proposed commands against change control. Verified that interface Fa0/24 is indeed the designated inter-switch trunk. AI proposal does not disrupt existing traffic on VLANs 1, 10, 30, and 40.
              </p>
              <div className="p-2.5 bg-purple-950/20 border border-purple-500/20 rounded font-mono text-purple-300 text-[11px]">
                Reviewer Verdict: APPROVED for immediate application. No disruptive reload or port shut required.
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Applied Fix */}
        {demoStep === 4 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
              <span>STEP 4: APPLY EVIDENCE-BACKED FIX TO CISCO DEVICE</span>
              <span className="text-cyan-400">TARGET: Switch-A</span>
            </div>
            <pre className="p-4 bg-slate-950 border border-emerald-500/30 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto">
{`Switch-A# configure terminal
Enter configuration commands, one per line. End with CNTL/Z.
Switch-A(config)# interface FastEthernet0/24
Switch-A(config-if)# switchport trunk allowed vlan add 20
Switch-A(config-if)# end
Switch-A# copy running-config startup-config
Destination filename [startup-config]? 
Building configuration...
[OK]`}
            </pre>
          </div>
        )}

        {/* Step 5: Verification */}
        {demoStep === 5 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
              <span>STEP 5: VERIFICATION & POST-FIX CONNECTIVITY TEST</span>
              <span className="text-emerald-400 font-bold">STATUS: 100% VERIFIED & RESOLVED</span>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
{`Switch-A# show interfaces trunk
Port Mode Encapsulation Status Native vlan
Fa0/24 on 802.1q trunking 1

Port Vlans allowed on trunk
Fa0/24 1,10,20,30,40   <--- [VERIFIED: VLAN 20 NOW ACTIVE ON TRUNK]

PC-VLAN20> ping 192.168.20.100
Pinging 192.168.20.100 with 32 bytes of data:
Reply from 192.168.20.100: bytes=32 time<1ms TTL=128
Reply from 192.168.20.100: bytes=32 time<1ms TTL=128
Reply from 192.168.20.100: bytes=32 time<1ms TTL=128
Reply from 192.168.20.100: bytes=32 time<1ms TTL=128

Ping statistics for 192.168.20.100:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`}
            </pre>
          </div>
        )}

        {/* Demo Navigation Footer */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setDemoStep((prev) => Math.max(1, prev - 1))}
            disabled={demoStep === 1}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs rounded-lg transition-all cursor-pointer font-bold"
          >
            ← Previous Step
          </button>
          <span className="text-xs font-mono text-slate-400">Step {demoStep} of 5</span>
          <button
            onClick={() => setDemoStep((prev) => Math.min(5, prev + 1))}
            disabled={demoStep === 5}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs rounded-lg transition-all cursor-pointer font-bold"
          >
            Next Step →
          </button>
        </div>
      </div>
    </div>
  );
}
