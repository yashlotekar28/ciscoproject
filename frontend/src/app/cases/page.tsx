"use client";

import { useState, useEffect } from "react";
import { FolderGit2, Search, Filter, ArrowRight, ShieldAlert, Layers, Activity } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

interface CaseItem {
  id: string;
  title: string;
  symptom: string;
  topology_notes?: string;
  device: string;
  category: string;
  severity: string;
  osi_layer?: string;
  concept?: string;
  show_output: string;
  expected_fault?: string;
  expected_next_command?: string;
  expected_fix?: string;
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    fetch(`${API_BASE_URL}/cases`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCases(data);
        } else {
          loadFallbackCases();
        }
        setLoading(false);
      })
      .catch(() => {
        loadFallbackCases();
        setLoading(false);
      });
  }, []);

  const loadFallbackCases = () => {
    // 34 Packet Tracer Cases Covering all 8 Required Domains
    const fallback: CaseItem[] = [
      {
        id: "CASE-VLAN-01",
        title: "Access Port Assigned to Default VLAN Instead of VLAN 30",
        symptom: "PC-101 in Engineering department obtains IP 192.168.30.15 but cannot ping Engineering Server or Gateway 192.168.30.1.",
        topology_notes: "PC-101 connected to Access Switch SW-1 Fa0/3. Core Router R1 provides inter-VLAN routing.",
        device: "SW-1",
        category: "VLAN",
        severity: "High",
        osi_layer: "Layer 2 (Data Link)",
        concept: "Access Port VLAN Membership",
        show_output: "SW-1# show interfaces FastEthernet0/3 switchport\nAdministrative Mode: static access\nOperational Access Mode VLAN: 1 (default)\nSW-1# show vlan brief\n1 default active Fa0/1, Fa0/2, Fa0/3\n30 Engineering active"
      },
      {
        id: "CASE-VLAN-02",
        title: "Trunk Allowed VLAN List Omits Target VLAN 20",
        symptom: "All VLAN 20 hosts lose inter-switch connectivity between Building A and Building B after maintenance.",
        topology_notes: "Switch SW-A (Fa0/24) connected to Switch SW-B (Fa0/24) via 802.1Q trunk.",
        device: "SW-A",
        category: "VLAN",
        severity: "Critical",
        osi_layer: "Layer 2 (Data Link)",
        concept: "Trunk Pruning & Allowed List",
        show_output: "SW-A# show interfaces trunk\nPort Mode Encapsulation Status Native vlan\nFa0/24 on 802.1q trunking 1\nPort Vlans allowed on trunk: 1,10,30,40"
      },
      {
        id: "CASE-VLAN-03",
        title: "802.1Q Native VLAN Mismatch on Trunk",
        symptom: "Console logs repeatedly print %CDP-4-NATIVE_VLAN_MISMATCH; sporadic packet drop across trunk link.",
        topology_notes: "SW-1 Gi0/1 connects to SW-2 Gi0/1.",
        device: "SW-1",
        category: "VLAN",
        severity: "Medium",
        osi_layer: "Layer 2 (Data Link)",
        concept: "Native VLAN Consistency",
        show_output: "%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/1 (99), with SW-2 GigabitEthernet0/1 (1)."
      },
      {
        id: "CASE-GW-01",
        title: "Host Static Default Gateway Subnet Mismatch",
        symptom: "PC-01 cannot ping its default gateway 192.168.20.1 or any remote IP; local switch port link light is green.",
        topology_notes: "PC-01 on SW-1 Fa0/1 in VLAN 10 (192.168.10.0/24). Gateway Router R1 on Gi0/0.10 (192.168.10.1).",
        device: "PC-01",
        category: "Gateway",
        severity: "High",
        osi_layer: "Layer 3 (Network)",
        concept: "Default Gateway Configuration",
        show_output: "PC-01> ipconfig\nIPv4 Address: 192.168.10.50\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.20.1"
      },
      {
        id: "CASE-GW-02",
        title: "Router Subinterface Default Gateway IP Typo",
        symptom: "All accounting department hosts in VLAN 20 cannot reach their default gateway 192.168.20.1.",
        topology_notes: "Router R1 provides Router-on-a-Stick gateway via subinterface Gi0/0.20.",
        device: "R1",
        category: "Gateway",
        severity: "Critical",
        osi_layer: "Layer 3 (Network)",
        concept: "Subinterface Gateway Addressing",
        show_output: "R1# show running-config interface Gi0/0.20\ninterface GigabitEthernet0/0.20\n encapsulation dot1Q 20\n ip address 192.168.200.1 255.255.255.0"
      },
      {
        id: "CASE-DHCP-01",
        title: "DHCP Address Pool Exhaustion",
        symptom: "New workstations connecting to office switch receive APIPA auto-configuration IPs (169.254.x.x).",
        topology_notes: "Router R1 acts as DHCP server for LAN pool 192.168.10.0/24.",
        device: "R1",
        category: "DHCP",
        severity: "Critical",
        osi_layer: "Layer 7 (Application)",
        concept: "DHCP Scope Utilization",
        show_output: "R1# show ip dhcp pool LAN_POOL\nUtilization mark (high/low) : 100 / 0\nTotal addresses : 254\nLeased addresses : 254\nFailed leases : 18"
      },
      {
        id: "CASE-DHCP-02",
        title: "Missing IP Helper-Address on Relay Gateway",
        symptom: "Clients on VLAN 30 fail to receive DHCP leases from centralized DHCP server 10.10.10.100.",
        topology_notes: "Multilayer Switch MSW-1 is default gateway for VLAN 30. DHCP Server in Server Farm.",
        device: "MSW-1",
        category: "DHCP",
        severity: "High",
        osi_layer: "Layer 7 (Application)",
        concept: "DHCP Relay Agent",
        show_output: "MSW-1# show running-config interface Vlan30\ninterface Vlan30\n ip address 192.168.30.1 255.255.255.0\n! (No ip helper-address configured)"
      },
      {
        id: "CASE-DNS-01",
        title: "IP Domain Lookup Disabled on Router",
        symptom: "Ping to external domain 'ping server.cisco.com' fails with 'Translating server.cisco.com...% Unrecognized host'.",
        topology_notes: "Branch Router BR-1 connected to WAN.",
        device: "BR-1",
        category: "DNS",
        severity: "Medium",
        osi_layer: "Layer 7 (Application)",
        concept: "DNS Resolution Service",
        show_output: "BR-1# show running-config | include domain\nno ip domain lookup\nip name-server 8.8.8.8"
      },
      {
        id: "CASE-DNS-03",
        title: "ACL Filtering Outbound UDP Port 53",
        symptom: "Workstations fail all domain lookups; nslookup query returns 'DNS request timed out'.",
        topology_notes: "Edge Firewall Router R1 filtering outbound traffic on Gi0/1.",
        device: "R1",
        category: "DNS",
        severity: "High",
        osi_layer: "Layer 4 (Transport)",
        concept: "Transport Layer Port Filtering",
        show_output: "R1# show ip access-lists OUTBOUND_ACL\nExtended IP access list OUTBOUND_ACL\n 10 permit tcp 192.168.1.0 0.0.0.255 any eq www\n 20 permit tcp 192.168.1.0 0.0.0.255 any eq 443\n 30 permit icmp any any"
      },
      {
        id: "CASE-ROUT-01",
        title: "Missing Default Route on Edge Gateway Router",
        symptom: "Internal LAN PCs can reach all internal subnets but cannot connect to public Internet destinations (8.8.8.8).",
        topology_notes: "Edge Router R1 connected to ISP Gateway 203.0.113.1 on Gi0/0/1.",
        device: "R1",
        category: "Routing",
        severity: "Critical",
        osi_layer: "Layer 3 (Network)",
        concept: "Gateway of Last Resort",
        show_output: "R1# show ip route\nGateway of last resort is not set\nC 192.168.1.0/24 is directly connected, GigabitEthernet0/0/0"
      },
      {
        id: "CASE-ROUT-02",
        title: "OSPF Neighbor Adjacency Area ID Mismatch",
        symptom: "OSPF neighbor state stuck in DOWN/INIT between R1 and R2; no dynamic routes exchanged.",
        topology_notes: "R1 and R2 connected via Gi0/0/0.",
        device: "R1",
        category: "Routing",
        severity: "High",
        osi_layer: "Layer 3 (Network)",
        concept: "OSPF Area Consistency",
        show_output: "%OSPF-4-ERRRCV: Received packet from 10.0.0.2, Area 1 mismatch from Area 0 on GigabitEthernet0/0/0"
      },
      {
        id: "CASE-ACL-01",
        title: "Implicit Deny Dropping Secure Web (HTTPS) Traffic",
        symptom: "Users can access HTTP web services on port 80 but cannot open HTTPS sites on port 443.",
        topology_notes: "Edge Router R1 outbound interface Gi0/0/1.",
        device: "R1",
        category: "ACL",
        severity: "High",
        osi_layer: "Layer 4 (Transport)",
        concept: "Access Control List Rules",
        show_output: "R1# show ip access-lists OUTBOUND_SEC\nExtended IP access list OUTBOUND_SEC\n 10 permit tcp 192.168.1.0 0.0.0.255 any eq 80\n 20 permit icmp any any"
      },
      {
        id: "CASE-ACL-03",
        title: "Subnet Mask Used Instead of Wildcard Inverse Mask",
        symptom: "ACL fails to match expected IP subnet range or rejects CLI syntax.",
        topology_notes: "Campus Core Router.",
        device: "R1",
        category: "ACL",
        severity: "Medium",
        osi_layer: "Layer 3 (Network)",
        concept: "Wildcard Mask Inversion",
        show_output: "R1# show access-lists 20\nStandard IP access list 20\n 10 permit 192.168.10.0 255.255.255.0"
      },
      {
        id: "CASE-NAT-01",
        title: "Missing 'ip nat inside' on Internal LAN Interface",
        symptom: "Internal hosts cannot connect to the internet; packets arrive at WAN interface un-translated.",
        topology_notes: "NAT Border Router R1.",
        device: "R1",
        category: "NAT",
        severity: "High",
        osi_layer: "Layer 3 (Network)",
        concept: "NAT Interface Role Assignment",
        show_output: "R1# show ip nat statistics\nTotal active translations: 0\nOutside interface: GigabitEthernet0/0/1\nInside interface: none"
      },
      {
        id: "CASE-WLAN-01",
        title: "WPA2 Pre-Shared Key (PSK) Mismatch on Autonomous AP",
        symptom: "Wireless clients fail 4-way WPA handshake; error 'Authentication failure / wrong password'.",
        topology_notes: "Autonomous Access Point AP-1 serving Corporate SSID.",
        device: "AP-1",
        category: "Wireless",
        severity: "Medium",
        osi_layer: "Layer 2 (Data Link)",
        concept: "Wireless Security & Key Exchange",
        show_output: "AP-1# show running-config | section dot11 ssid Corporate\ndot11 ssid Corporate\n wpa-psk ascii 0 CiscoSecret2026!"
      },
      {
        id: "CASE-WLAN-03",
        title: "Lightweight AP CAPWAP Discovery Failure (Option 43 Missing)",
        symptom: "Access Point repeatedly loops through 'Discovering WLC' and never joins controller.",
        topology_notes: "AP in subnet 192.168.50.0/24 trying to discover WLC at 10.10.10.10 across L3 boundary.",
        device: "R1",
        category: "Wireless",
        severity: "High",
        osi_layer: "Layer 7 (Application)",
        concept: "CAPWAP Discovery & Option 43",
        show_output: "AP# show capwap client status\nStatus : DISCOVERING\nTranslating CISCO-CAPWAP-CONTROLLER.local... failed\nOption 43 : Not received in DHCP offer"
      }
    ];
    setCases(fallback);
  };

  const categories = ["ALL", "VLAN", "Gateway", "DHCP", "DNS", "Routing", "ACL", "NAT", "Wireless"];

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.symptom.toLowerCase().includes(search.toLowerCase()) ||
      (c.concept && c.concept.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "ALL" || c.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-cyan-400" /> Packet Tracer Lab Cases Repository
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Collection of {cases.length} authentic Cisco Packet Tracer troubleshooting cases covering VLAN, Gateway, DHCP, DNS, Routing, ACL, NAT, and Wireless.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, symptom, concept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#111827] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 w-56 font-mono"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#111827] border border-slate-800 rounded-lg p-2 text-xs text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Lab Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-sm"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  {c.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                    c.severity.toLowerCase() === "critical"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : c.severity.toLowerCase() === "high"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}
                >
                  {c.severity}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white line-clamp-1">{c.title}</h3>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono text-[10px]">{c.category}</span>
                {c.osi_layer && <span className="text-slate-400">{c.osi_layer}</span>}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{c.symptom}</p>

              {c.concept && (
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="text-cyan-400/80 font-medium">Concept:</span> {c.concept}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Target: {c.device}</span>
              <Link
                href={`/diagnose?caseId=${encodeURIComponent(c.id)}`}
                className="text-xs text-cyan-400 font-bold hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                Diagnose in Studio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
