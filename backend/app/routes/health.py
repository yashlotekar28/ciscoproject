from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "NetSage AI Core API",
        "version": "1.0.0",
        "database": "SQLite (Connected)"
    }