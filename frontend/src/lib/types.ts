export type Severity = "critical" | "high" | "medium" | "low";
export type Status = "pending" | "reviewed" | "accepted" | "edited" | "rejected" | "verified";

export interface NetworkCase {
  id: string;
  title: string;
  symptom: string;
  topology_notes: string;
  device: string;
  show_output: string;
  category: string;
  severity: Severity;
  expected_fault?: string;
  osi_layer?: string;
  status: Status;
  ai_confidence?: number;
  created_at: string;
}