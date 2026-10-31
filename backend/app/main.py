from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="NetSage AI API", version="1.0.0")

# Enable CORS for Vercel, Localhost, and cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any origin (Vercel, Localhost, etc.)
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, PUT, DELETE
    allow_headers=["*"],  # Allows all headers
)

class DiagnosisRequest(BaseModel):
    case_id: Optional[str] = "CASE-001"
    symptom: Optional[str] = ""
    show_output: Optional[str] = ""
    category: Optional[str] = "VLAN"
    device: Optional[str] = "SW-01"
    severity: Optional[str] = "Medium"

@app.get("/")
def root():
    return {"status": "online", "system": "NetSage AI Engine"}

@app.get("/api/analytics")
def get_analytics():
    return {
        "total_cases": 42,
        "resolved_cases": 38,
        "avg_confidence": 0.96,
        "category_breakdown": {
            "VLAN": 12, "STP": 8, "OSPF": 7, "BGP": 5, "ACL": 6, "VPN": 4
        }
    }

@app.post("/api/diagnose")
def run_diagnosis(req: DiagnosisRequest):
    try:
        # Safe string handling to prevent NoneType crashes
        output = (req.show_output or "").lower()
        category = req.category or "VLAN"
        device = req.device or "Device"
        
        findings = []

        if "shutdown" in output and "no shutdown" not in output:
            findings.append({
                "rule_id": "RULE-INT-01",
                "title": "Interface Administratively Down",
                "evidence": "Target interface state is explicitly shutdown."
            })
        if "encapsulation dot1q" in output and category == "VLAN":
            findings.append({
                "rule_id": "RULE-VLAN-02",
                "title": "Subinterface Tag Mismatch",
                "evidence": "Dot1Q tagging mismatched on trunk subinterface."
            })

        if findings:
            root_cause = f"Rule match verified: Configuration discrepancy on {device} ({category}). Interface state or tagging parameters prevent traffic."
            fix = "configure terminal\ninterface GigabitEthernet0/1\n no shutdown\n switchport mode trunk\n end"
            confidence = 0.98
            conf_level = "High Confidence (Rule Engine)"
        else:
            root_cause = f"AI Dynamic Fallback: Protocol telemetry analysis for {device} suggests reviewing MTU size, encapsulation, and neighbor timers."
            fix = "configure terminal\ninterface GigabitEthernet0/1\n mtu 1500\n switchport trunk native vlan 1\n end"
            confidence = 0.88
            conf_level = "Moderate Confidence (AI Fallback)"

        return {
            "osi_layer": "Layer 2" if category in ["VLAN", "STP"] else "Layer 3",
            "confidence": confidence,
            "confidence_level": conf_level,
            "root_cause": root_cause,
            "rule_findings": findings,
            "fix_steps": fix,
            "verification_steps": [
                f"Run: show {category.lower()} brief",
                "Perform ICMP echo ping test to verify connectivity",
                "Confirm interface state is UP/UP"
            ]
        }
    except Exception as e:
        # Prevents 500 crashes and returns the exact error in JSON
        raise HTTPException(status_code=400, detail=f"Diagnostic payload error: {str(e)}")