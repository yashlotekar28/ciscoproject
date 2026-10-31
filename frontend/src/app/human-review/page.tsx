"use client";

import { useState, useEffect } from "react";
import { UserCheck, CheckCircle2, Edit3, XCircle, ShieldAlert, AlertTriangle, FileText, Send, Sparkles } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface ReviewItem {
  id?: number | string;
  case_id: string;
  device: string;
  category: string;
  status: "Pending" | "Accepted" | "Edited" | "Rejected";
  original_fix: string;
  edited_fix?: string;
  reviewer_notes?: string;
}

export default function HumanReviewPage() {
  const [queue, setQueue] = useState<ReviewItem[]>([
    {
      id: "REV-101",
      case_id: "CASE-ACL-01",
      device: "R1",
      category: "ACL",
      status: "Edited",
      original_fix: "configure terminal\ninterface GigabitEthernet0/0/1\n no ip access-group OUTBOUND_SEC out\nend",
      edited_fix: "configure terminal\nip access-list extended OUTBOUND_SEC\n 15 permit tcp 192.168.1.0 0.0.0.255 any eq 443\nend",
      reviewer_notes: "AI removed entire ACL which disables security perimeter. Corrected to specifically permit TCP port 443 (HTTPS)."
    },
    {
      id: "REV-102",
      case_id: "CASE-ROUT-02",
      device: "R1",
      category: "Routing",
      status: "Rejected",
      original_fix: "configure terminal\nno router ospf 1\nrouter ospf 2\n network 10.0.0.0 0.0.0.3 area 0\nend",
      edited_fix: "configure terminal\nrouter ospf 1\n no network 10.0.0.0 0.0.0.3 area 0\n network 10.0.0.0 0.0.0.3 area 1\nend",
      reviewer_notes: "AI confused OSPF process ID with Area ID. Corrected Area ID to match peer Area 1."
    },
    {
      id: "REV-103",
      case_id: "CASE-VLAN-02",
      device: "SW-A",
      category: "VLAN",
      status: "Rejected",
      original_fix: "reload\n(Confirm with Enter)",
      edited_fix: "configure terminal\ninterface FastEthernet0/24\n switchport trunk allowed vlan add 20\nend",
      reviewer_notes: "AI hallucinated switch database crash and recommended destructive reload. Corrected to add missing VLAN 20 to trunk allowed list."
    },
    {
      id: "REV-104",
      case_id: "CASE-ROUT-01",
      device: "R1",
      category: "Routing",
      status: "Edited",
      original_fix: "configure terminal\nip route 0.0.0.0 0.0.0.0 Loopback0\nend",
      edited_fix: "configure terminal\nip route 0.0.0.0 0.0.0.0 203.0.113.1\nend",
      reviewer_notes: "AI routed default route to Loopback0 black hole. Corrected next-hop to actual ISP gateway 203.0.113.1."
    },
    {
      id: "REV-105",
      case_id: "CASE-ACL-03",
      device: "R1",
      category: "ACL",
      status: "Rejected",
      original_fix: "configure terminal\nno access-list 20\nip access-list extended 120\n permit ip any any\nend",
      edited_fix: "configure terminal\nno access-list 20\naccess-list 20 permit 192.168.10.0 0.0.0.255\nend",
      reviewer_notes: "AI replaced standard ACL with open permit any any. Corrected inverse wildcard mask from 255.255.255.0 to 0.0.0.255."
    },
    {
      id: "REV-106",
      case_id: "CASE-GW-01",
      device: "PC-01",
      category: "Gateway",
      status: "Pending",
      original_fix: "On PC-01 IP Configuration:\nSet Default Gateway: 192.168.10.1",
      reviewer_notes: ""
    },
    {
      id: "REV-107",
      case_id: "CASE-DHCP-02",
      device: "MSW-1",
      category: "DHCP",
      status: "Pending",
      original_fix: "configure terminal\ninterface Vlan30\n ip helper-address 10.10.10.100\nend",
      reviewer_notes: ""
    }
  ]);

  const [activeTab, setActiveTab] = useState<"all" | "pending" | "corrected">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [notesBuffer, setNotesBuffer] = useState("");

  const handleDecision = async (id: string | number, decision: "Accepted" | "Rejected") => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
    );
    const target = queue.find((q) => q.id === id);
    if (target) {
      try {
        await fetch(`${API_BASE_URL}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            case_id: target.case_id,
            device: target.device,
            category: target.category,
            decision: decision,
            original_fix: target.original_fix,
            edited_fix: target.edited_fix || target.original_fix,
            reviewer_notes: decision === "Accepted" ? "Verified technically sound." : "Rejected by human reviewer."
          })
        });
      } catch (e) {
        // Silent local fallback
      }
    }
  };

  const startEditing = (item: ReviewItem) => {
    setEditingId(String(item.id));
    setEditBuffer(item.edited_fix || item.original_fix);
    setNotesBuffer(item.reviewer_notes || "");
  };

  const saveEdit = async (item: ReviewItem) => {
    setQueue((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? {
              ...q,
              status: "Edited",
              edited_fix: editBuffer,
              reviewer_notes: notesBuffer || "Corrected syntax/topology alignment by human reviewer."
            }
          : q
      )
    );
    setEditingId(null);
    try {
      await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: item.case_id,
          device: item.device,
          category: item.category,
          decision: "Edited",
          original_fix: item.original_fix,
          edited_fix: editBuffer,
          reviewer_notes: notesBuffer
        })
      });
    } catch (e) {}
  };

  const displayedQueue = queue.filter((item) => {
    if (activeTab === "pending") return item.status === "Pending";
    if (activeTab === "corrected") return item.status === "Edited" || item.status === "Rejected";
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-purple-400" /> Human Review & Responsible AI Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Cisco Project 2 Safety Gate: A human engineer must inspect, edit, or reject AI diagnoses before execution.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "all" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            All Reviews ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "pending" ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Pending Actions ({queue.filter((q) => q.status === "Pending").length})
          </button>
          <button
            onClick={() => setActiveTab("corrected")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "corrected" ? "bg-red-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Responsible AI Log (5 Corrected)
          </button>
        </div>
      </div>

      {/* Review Queue Items */}
      <div className="space-y-5">
        {displayedQueue.map((item) => (
          <div
            key={item.id}
            className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-bold">
                  {item.id}
                </span>
                <span className="text-sm font-bold text-white">
                  {item.case_id} — Device: <span className="text-cyan-400 font-mono">{item.device}</span> ({item.category})
                </span>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border font-mono w-fit ${
                  item.status === "Accepted"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : item.status === "Edited"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : item.status === "Rejected"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-slate-700/30 text-slate-300 border-slate-700"
                }`}
              >
                Status: {item.status}
              </span>
            </div>

            {/* Original Fix vs Edited Fix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Original AI Generated Fix
                  </span>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-cyan-300 font-mono overflow-x-auto min-h-[90px]">
                  {item.original_fix}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Human Corrected / Approved Fix
                  </span>
                  {item.edited_fix && (
                    <span className="text-[10px] text-amber-400 font-mono font-medium">Verified by Engineer</span>
                  )}
                </div>

                {editingId === String(item.id) ? (
                  <div className="space-y-2">
                    <textarea
                      value={editBuffer}
                      onChange={(e) => setEditBuffer(e.target.value)}
                      rows={4}
                      className="w-full p-2.5 bg-slate-950 border border-amber-500/40 rounded-lg text-xs text-amber-300 font-mono focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Explain why AI was corrected (Responsible AI rationale)..."
                      value={notesBuffer}
                      onChange={(e) => setNotesBuffer(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(item)}
                        className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded hover:bg-amber-400 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Save Edited Fix
                      </button>
                    </div>
                  </div>
                ) : (
                  <pre
                    className={`p-3 bg-slate-950 border rounded-lg text-xs font-mono overflow-x-auto min-h-[90px] ${
                      item.edited_fix
                        ? "border-amber-500/30 text-amber-300"
                        : "border-slate-800 text-slate-500 italic"
                    }`}
                  >
                    {item.edited_fix || "No manual modifications made yet."}
                  </pre>
                )}
              </div>
            </div>

            {/* Critique Notes */}
            {item.reviewer_notes && (
              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg text-xs text-purple-300 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-purple-200">Responsible AI Reviewer Notes: </span>
                  {item.reviewer_notes}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500">
                Safety Mandate: CLI changes require human sign-off prior to lab deployment.
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEditing(item)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit Fix
                </button>

                <button
                  onClick={() => handleDecision(item.id!, "Rejected")}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <XCircle className="w-3.5 h-3.5 text-red-400" /> Reject
                </button>

                <button
                  onClick={() => handleDecision(item.id!, "Accepted")}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accept Fix
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
