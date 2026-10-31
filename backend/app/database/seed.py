import os
import sys
import csv
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "netsage.db")
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", "..", ".."))
CSV_PATH = os.path.join(PROJECT_ROOT, "cases.csv")
if not os.path.exists(CSV_PATH):
    CSV_PATH = os.path.join(os.path.dirname(BASE_DIR), "cases.csv")
if not os.path.exists(CSV_PATH):
    CSV_PATH = os.path.join(BASE_DIR, "cases.csv")

def seed_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS cases")
    cursor.execute("""
    CREATE TABLE cases (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        symptom TEXT NOT NULL,
        topology_notes TEXT,
        device TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        osi_layer TEXT,
        concept TEXT,
        show_output TEXT NOT NULL,
        expected_fault TEXT,
        expected_next_command TEXT,
        expected_fix TEXT,
        status TEXT DEFAULT 'pending',
        ai_confidence REAL DEFAULT 0.95,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("DELETE FROM cases")

    if not os.path.exists(CSV_PATH):
        print(f"Error: {CSV_PATH} not found.")
        return

    with open(CSV_PATH, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            cursor.execute("""
            INSERT INTO cases (
                id, title, symptom, topology_notes, device, category, severity,
                osi_layer, concept, show_output, expected_fault, expected_next_command, expected_fix, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row["case_id"],
                row["title"],
                row["symptom"],
                row.get("topology_notes", ""),
                row["device"],
                row["category"],
                row["severity"],
                row.get("osi_layer", "Layer 2"),
                row.get("concept", "General"),
                row["show_output"],
                row.get("expected_fault", ""),
                row.get("expected_next_command", "show running-config"),
                row.get("expected_fix", ""),
                "pending"
            ))
            count += 1

    conn.commit()
    conn.close()
    print(f"Successfully seeded {count} cases from {CSV_PATH} into {DB_PATH}")

if __name__ == "__main__":
    seed_db()
