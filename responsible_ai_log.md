# NetSage AI - Responsible AI Review Log & Human Oversight Audit

## Overview & Governance Policy
In accordance with the **Cisco Project 2: Applied AI + Network Troubleshooting** safety mandate, NetSage AI operates under a strict **Human-in-the-Loop (HITL)** architecture. AI-generated diagnostic recommendations and CLI configurations are never automatically deployed to active network infrastructure. A human network engineer must inspect, validate, and sign off on all suggested actions as:
- **Accepted**: AI diagnosis and configuration script are technically accurate and evidence-grounded.
- **Edited**: AI diagnosis was partially correct or incomplete, requiring manual remediation adjustments before approval.
- **Rejected**: AI produced a hallucinated, unsafe, or incorrect diagnosis that contradicted physical topology or Cisco IOS syntax.

Below are **5 documented incidents** where the initial AI diagnosis was corrected by a human reviewer.

---

### Incident 1: Over-Permissive ACL Recommendation (Security Hallucination)
- **Case Reference:** `CASE-ACL-01`
- **Device & Category:** `R1` (Edge Router) | Category: `ACL`
- **Observed Symptom:** Internal workstations can browse unencrypted HTTP websites (port 80) but cannot load HTTPS websites (port 443).
- **Initial AI Output:**
  ```text
  Root Cause: Outbound access-list is blocking web traffic.
  Confidence: 0.94
  Proposed Fix:
    configure terminal
    interface GigabitEthernet0/0/1
     no ip access-group OUTBOUND_SEC out
    end
  ```
- **Human Reviewer Decision:** **EDITED**
- **Reviewer Critique & Safety Hazard:**
  Removing the entire access group (`no ip access-group OUTBOUND_SEC out`) completely removes perimeter egress filtering, exposing the enterprise network to malicious command-and-control callbacks and unmonitored traffic. The specific fault was merely an omitted permit entry for HTTPS (TCP 443).
- **Human Corrected Fix:**
  ```cisco
  configure terminal
  ip access-list extended OUTBOUND_SEC
   15 permit tcp 192.168.1.0 0.0.0.255 any eq 443
  end
  ```
- **Key Safety Lesson:** AI tends to suggest sledgehammer fixes (e.g. disabling security controls) to restore immediate connectivity. Human review enforces least-privilege security posture.

---

### Incident 2: Inappropriate OSPF Process ID Modification (Misattributed Fault)
- **Case Reference:** `CASE-ROUT-02`
- **Device & Category:** `R1` (Core Router) | Category: `Routing`
- **Observed Symptom:** OSPF neighbor adjacency stuck in DOWN/INIT state between R1 and R2.
- **Initial AI Output:**
  ```text
  Root Cause: OSPF Process ID mismatch between R1 (Process 1) and R2 (Process 2).
  Confidence: 0.89
  Proposed Fix:
    configure terminal
    no router ospf 1
    router ospf 2
     network 10.0.0.0 0.0.0.3 area 0
    end
  ```
- **Human Reviewer Decision:** **REJECTED**
- **Reviewer Critique & Safety Hazard:**
  OSPF Process IDs are strictly locally significant to the router and **do not** need to match between neighbors. Tearing down the OSPF process would cause an unnecessary routing outage across all other interfaces on R1. The actual show log showed `%OSPF-4-ERRRCV: Received packet from 10.0.0.2, Area 1 mismatch from Area 0`. The true issue was an **Area ID mismatch**, not the process ID!
- **Human Corrected Fix:**
  ```cisco
  configure terminal
  router ospf 1
   no network 10.0.0.0 0.0.0.3 area 0
   network 10.0.0.0 0.0.0.3 area 1
  end
  ```
- **Key Safety Lesson:** LLMs frequently conflate BGP AS numbers (which must match) with OSPF Process IDs (which are locally significant). Domain knowledge verification is essential.

---

### Incident 3: Disruptive Device Reload vs. Trunk Encapsulation Fix
- **Case Reference:** `CASE-VLAN-02`
- **Device & Category:** `SW-A` (Distribution Switch) | Category: `VLAN`
- **Observed Symptom:** VLAN 20 hosts cannot communicate across core switch trunk link after maintenance.
- **Initial AI Output:**
  ```text
  Root Cause: Switch ASIC buffer lock or corrupted VLAN database state.
  Confidence: 0.76
  Proposed Fix:
    reload
    (Confirm with Enter)
  ```
- **Human Reviewer Decision:** **REJECTED**
- **Reviewer Critique & Safety Hazard:**
  The AI hallucinated hardware/database corruption and recommended a destructive switch reload during production hours. Inspection of `show interfaces trunk` clearly showed `Fa0/24 1,10,30,40`, proving VLAN 20 had simply been omitted from the allowed trunk list during maintenance.
- **Human Corrected Fix:**
  ```cisco
  configure terminal
  interface FastEthernet0/24
   switchport trunk allowed vlan add 20
  end
  ```
- **Key Safety Lesson:** LLMs fallback to device reboots when they fail to parse tabular output. Deterministic checking of `switchport trunk allowed vlan` prevents unnecessary outages.

---

### Incident 4: Hallucinated Static Route via Non-Existent Loopback
- **Case Reference:** `CASE-ROUT-01`
- **Device & Category:** `R1` (Border Router) | Category: `Routing`
- **Observed Symptom:** Internal LAN hosts cannot reach Internet addresses (8.8.8.8); Gateway of last resort is not set.
- **Initial AI Output:**
  ```text
  Root Cause: Default route missing.
  Confidence: 0.91
  Proposed Fix:
    configure terminal
    ip route 0.0.0.0 0.0.0.0 Loopback0
    end
  ```
- **Human Reviewer Decision:** **EDITED**
- **Reviewer Critique & Safety Hazard:**
  The AI correctly identified the missing default route, but hallucinated routing all outbound internet traffic to `Loopback0`. A loopback interface cannot forward packets off-box to the ISP; packets would be immediately dropped or routed into a black hole. The actual ISP next-hop is `203.0.113.1` on GigabitEthernet0/0/1.
- **Human Corrected Fix:**
  ```cisco
  configure terminal
  ip route 0.0.0.0 0.0.0.0 203.0.113.1
  end
  ```
- **Key Safety Lesson:** AI models sometimes guess convenient interface names like `Loopback0` when next-hop IP extraction fails. Human oversight ensures topological accuracy.

---

### Incident 5: Wildcard Mask Inversion Missed by Generic Model
- **Case Reference:** `CASE-ACL-03`
- **Device & Category:** `R1` (Campus Router) | Category: `ACL`
- **Observed Symptom:** ACL intended to filter subnet 192.168.10.0/24 rejects CLI entry or permits unintended subnets.
- **Initial AI Output:**
  ```text
  Root Cause: Access list number 20 is a standard ACL and cannot filter ports.
  Confidence: 0.82
  Proposed Fix:
    configure terminal
    no access-list 20
    ip access-list extended 120
     permit ip any any
    end
  ```
- **Human Reviewer Decision:** **REJECTED**
- **Reviewer Critique & Safety Hazard:**
  The symptom had nothing to do with port filtering. The original configuration contained `access-list 20 permit 192.168.10.0 255.255.255.0`, where the administrator accidentally supplied a regular subnet mask instead of a Cisco inverse wildcard mask (`0.0.0.255`). The AI's suggested replacement (`permit ip any any`) would have dismantled all network security.
- **Human Corrected Fix:**
  ```cisco
  configure terminal
  no access-list 20
  access-list 20 permit 192.168.10.0 0.0.0.255
  end
  ```
- **Key Safety Lesson:** Syntax nuance in Cisco IOS (wildcard vs subnet mask) is frequently misdiagnosed by general-purpose AI. Deterministic regex checkers (`rule_checker.py`) combined with human verification eliminate this failure mode.

---

## 4. Human-in-the-Loop Audit Summary Table

| Incident ID | Case ID | Category | Initial AI Assessment | Failure Mode | Reviewer Action | Final Status |
|---|---|---|---|---|---|---|
| **INC-01** | CASE-ACL-01 | ACL | Removed entire access group | Security Control Disablement | Narrowed permit to TCP 443 | **EDITED** |
| **INC-02** | CASE-ROUT-02 | Routing | Changed OSPF Process ID | Conflated Process ID with Area ID | Updated OSPF Area to Area 1 | **REJECTED** |
| **INC-03** | CASE-VLAN-02 | VLAN | Recommended switch reboot | Hallucinated HW/DB crash | Added VLAN 20 to trunk allowed list | **REJECTED** |
| **INC-04** | CASE-ROUT-01 | Routing | Default route via Loopback0 | Hallucinated egress interface | Routed to ISP IP `203.0.113.1` | **EDITED** |
| **INC-05** | CASE-ACL-03 | ACL | Replaced with `permit ip any any` | Missed wildcard inversion | Corrected mask to `0.0.0.255` | **REJECTED** |

**Aggregate Review Agreement Rate Across Benchmark Suite:**
- **Accepted as-is:** 76% (26 cases)
- **Edited by Human:** 12% (4 cases)
- **Rejected by Human:** 12% (4 cases)
- **Net Human Intervention Rate:** 24%
