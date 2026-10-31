from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.database.database import get_db_connection

router = APIRouter()

class ReviewAction(BaseModel):
    case_id: str
    status: str  # "APPROVED" | "REJECTED" | "EDITS_REQUIRED"
    reviewer_notes: Optional[str] = ""

@router.get("/pending")
def get_pending_reviews():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases LIMIT 10")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.post("/action")
def submit_review(action: ReviewAction):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE cases SET status = ? WHERE id = ?",
        (action.status, action.case_id)
    )
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Case {action.case_id} updated to {action.status}"}