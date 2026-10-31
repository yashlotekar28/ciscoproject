import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "netsage.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Cases Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        symptom TEXT NOT NULL,
        topology_notes TEXT NOT NULL,
        device TEXT NOT NULL,
        show_output TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        expected_fault TEXT,
        osi_layer TEXT,
        concept TEXT,
        expected_next_command TEXT,
        expected_fix TEXT,
        status TEXT DEFAULT 'pending',
        ai_confidence REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Diagnoses Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS diagnoses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT NOT NULL,
        root_cause TEXT NOT NULL,
        confidence REAL NOT NULL,
        confidence_level TEXT NOT NULL,
        osi_layer TEXT NOT NULL,
        severity TEXT NOT NULL,
        evidence TEXT NOT NULL,
        alternative_causes TEXT NOT NULL,
        next_commands TEXT NOT NULL,
        fix_steps TEXT NOT NULL,
        verification_steps TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases (id)
    )
    ''')

    # Reviews Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT NOT NULL UNIQUE,
        decision TEXT NOT NULL,
        root_cause TEXT NOT NULL,
        osi_layer TEXT,
        severity TEXT,
        fix_steps TEXT,
        reviewer_notes TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases (id)
    )
    ''')

    # Verification Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS verification_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT NOT NULL,
        status TEXT NOT NULL,
        checks TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases (id)
    )
    ''')

    conn.commit()
    conn.close()
    seed_initial_cases()

def seed_initial_cases():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM cases")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    sample_cases = [
        {
            "id": "CASE-VLAN-01",
            "title": "VLAN 30 Inter-VLAN Access Denied",
            "symptom": "PC-101 in VLAN 30 receives IP 192.168.30.10 via DHCP but cannot ping Server in VLAN 10.",
            "topology_notes": "PC-101 -> Access Switch (SW-1) -> Trunk -> Core Router (R-1) -> Server-10",
            "device": "SW-1",
            "show_output": "SW-1# show vlan brief\nVLAN Name Status Ports\n---- -------------------------------- --------- -------------------\n1 default active Fa0/1, Fa0/2\n10 Accounting active Fa0/5\n30 Engineering active\n\nSW-1# show interfaces FastEthernet 0/3 switchport\nAccess Mode VLAN: 1 (default)",
            "category": "VLAN",
            "severity": "high",
            "expected_fault": "Interface Fa0/3 assigned to default VLAN 1 instead of VLAN 30",
            "osi_layer": "Layer 2",
            "concept": "Access Port Assignment",
            "expected_next_command": "show interfaces Fa0/3 switchport",
            "expected_fix": "interface FastEthernet0/3\n switchport mode access\n switchport access vlan 30",
            "status": "pending"
        },
        {
            "id": "CASE-VLAN-02",
            "title": "Trunk Allowed List Missing Target VLAN",
            "symptom": "VLAN 20 hosts lose connectivity across core switch link after maintenance.",
            "topology_notes": "Switch-A (Fa0/24) <---> (Fa0/24) Switch-B",
            "device": "Switch-A",
            "show_output": "Switch-A# show interfaces trunk\nPort Mode Encapsulation Status Native vlan\nFa0/24 on 802.1q trunking 1\nPort Vlans allowed on trunk\nFa0/24 1,10,30",
            "category": "VLAN",
            "severity": "critical",
            "expected_fault": "VLAN 20 omitted from switchport trunk allowed vlan list",
            "osi_layer": "Layer 2",
            "concept": "Trunk Encapsulation & Pruning",
            "expected_next_command": "show interfaces trunk",
            "expected_fix": "interface FastEthernet0/24\n switchport trunk allowed vlan add 20",
            "status": "pending"
        },
        {
            "id": "CASE-ROUT-01",
            "title": "Missing Default Static Route on Edge Router",
            "symptom": "Internal LAN PCs can reach local subnets but cannot reach public IP addresses (8.8.8.8).",
            "topology_notes": "Router-Edge -> ISP Gateway (203.0.113.1)",
            "device": "Router-Edge",
            "show_output": "Router-Edge# show ip route\nCodes: C - connected, S - static\nGateway of last resort is not set\n192.168.1.0/24 is directly connected, GigabitEthernet0/0\n10.0.0.0/30 is directly connected, GigabitEthernet0/1",
            "category": "Routing",
            "severity": "critical",
            "expected_fault": "Missing default static route (0.0.0.0/0) pointing to ISP gateway",
            "osi_layer": "Layer 3",
            "concept": "Default Gateway Routing",
            "expected_next_command": "show ip route",
            "expected_fix": "ip route 0.0.0.0 0.0.0.0 203.0.113.1",
            "status": "pending"
        },
        {
            "id": "CASE-DHCP-01",
            "title": "DHCP Pool IP Address Exhaustion",
            "symptom": "New clients connecting to Wi-Fi receive APIPA addresses (169.254.x.x).",
            "topology_notes": "Core Router acting as DHCP Server for LAN-Pool",
            "device": "R-Core",
            "show_output": "R-Core# show ip dhcp pool LAN-Pool\nPool LAN-Pool :\n Utilization mark (high/low) : 100 / 0\n Subnet size (leases/total) : 254 / 254\n Leased addresses : 254\n Pending event : none",
            "category": "DHCP",
            "severity": "critical",
            "expected_fault": "DHCP address pool exhausted (100% lease utilization)",
            "osi_layer": "Layer 7",
            "concept": "DHCP Scope Management",
            "expected_next_command": "show ip dhcp pool",
            "expected_fix": "ip dhcp pool LAN-Pool\n lease 0 8",
            "status": "pending"
        }
    ]

    for case in sample_cases:
        cursor.execute('''
        INSERT INTO cases (
            id, title, symptom, topology_notes, device, show_output, 
            category, severity, expected_fault, osi_layer, concept, 
            expected_next_command, expected_fix, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            case["id"], case["title"], case["symptom"], case["topology_notes"],
            case["device"], case["show_output"], case["category"], case["severity"],
            case["expected_fault"], case["osi_layer"], case["concept"],
            case["expected_next_command"], case["expected_fix"], case["status"]
        ))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()