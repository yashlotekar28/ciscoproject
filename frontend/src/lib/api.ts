export interface NetworkCase {
  id: string;
  title: string;
  symptom: string;
  topology_notes: string;
  device: string;
  show_output: string;
  category: string;
  severity: string;
  expected_fault?: string;
  osi_layer?: string;
  concept?: string;
  expected_next_command?: string;
  expected_fix?: string;
  status?: string;
}

const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function fetchCases(): Promise<NetworkCase[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/cases`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    // Normalize data structure in case backend wraps responses
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.cases)) return data.cases;
    if (Array.isArray(data.data)) return data.data;
    
    return [];
  } catch (err) {
    console.error("fetchCases error:", err);
    return [];
  }
}

export async function createCase(newCaseData: Partial<NetworkCase>): Promise<NetworkCase> {
  const res = await fetch(`${API_BASE_URL}/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newCaseData),
  });
  if (!res.ok) throw new Error("Failed to create new lab case");
  return await res.json();
}

export async function runDiagnosis(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Diagnosis request failed");
  return await res.json();
}

export async function fetchAnalytics(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchAnalytics error:", err);
    return {
      total_cases: 30,
      resolved_cases: 24,
      avg_confidence: 0.94,
      category_breakdown: { VLAN: 6, STP: 4, Routing: 1, OSPF: 4, BGP: 3, DHCP: 2, NAT: 2, DNS: 2, ACL: 4, VPN: 2 },
      recent_activity: []
    };
  }
}