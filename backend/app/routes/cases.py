from fastapi import APIRouter
from ..database import get_db_connection

router = APIRouter()

@router.get("/cases")
def get_cases():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases")
    cases = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return cases