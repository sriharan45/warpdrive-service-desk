from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.core.database import get_db
from backend.app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    """Comprehensive service and database health check."""
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "ok" else "degraded",
        "service": settings.PROJECT_NAME,
        "organization": settings.ORGANIZATION_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status
    }

@router.get("/db")
def db_health_check(db: Session = Depends(get_db)):
    """Specific database connection check."""
    try:
        db.execute(text("SELECT 1"))
        return {"status": "connected", "database_type": "PostgreSQL/SQLite"}
    except Exception as e:
        return {"status": "error", "error": str(e)}
