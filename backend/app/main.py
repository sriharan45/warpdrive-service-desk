import os
import sys

# Ensure repository root and backend directory are in sys.path
# This supports running from repo root (uvicorn backend.app.main:app)
# and running with Render Root Directory set to 'backend' (uvicorn app.main:app)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))     # .../backend/app
BACKEND_DIR = os.path.dirname(CURRENT_DIR)                   # .../backend
REPO_ROOT = os.path.dirname(BACKEND_DIR)                     # .../ (repo root)

for _path in [REPO_ROOT, BACKEND_DIR]:
    if _path not in sys.path:
        sys.path.insert(0, _path)

# If 'backend' is not in sys.modules, provide virtual module mapping to BACKEND_DIR
if 'backend' not in sys.modules:
    import types
    try:
        import backend
    except ImportError:
        _backend_mod = types.ModuleType('backend')
        _backend_mod.__path__ = [BACKEND_DIR]
        sys.modules['backend'] = _backend_mod

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.models.models import Department
from backend.app.services.ml_service import ml_service

from backend.app.api.auth import router as auth_router
from backend.app.api.tickets import router as tickets_router
from backend.app.api.chat import router as chat_router
from backend.app.api.ml import router as ml_router
from backend.app.api.admin import router as admin_router
from backend.app.api.health import router as health_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Initialize default departments if not present
    db: Session = SessionLocal()
    try:
        default_depts = [
            ("IT Support", "Hardware, software, network, access, and workstation support"),
            ("Technical", "Bugs, backend issues, system defects, APIs, and infrastructure"),
            ("HR", "Leave requests, benefits, policies, attendance, and onboarding"),
            ("Accounts", "Salary, payroll, tax forms, reimbursements, and invoices"),
            ("Maintenance", "HVAC, electrical, plumbing, facilities, and office repairs")
        ]
        for name, desc in default_depts:
            dept = db.query(Department).filter(Department.name == name).first()
            if not dept:
                db.add(Department(name=name, description=desc))
        db.commit()
    finally:
        db.close()

    # Pre-warm ML model
    if ml_service.is_ready():
        print("[MLService] ML Model loaded and ready for inference.")
    else:
        print("[MLService] Warning: ML model artifacts not found; fallback enabled.")

    yield

    # Shutdown
    print("[Server] Shutting down WarpDrive Service Desk API.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent enterprise service desk with ML routing, AI conversational assistant, and multi-tier RBAC.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS configuration with explicit Vercel support & preview regex
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Canonical routes under /api
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(tickets_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(ml_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(health_router, prefix=settings.API_V1_STR)

# Also mount at root without /api prefix for dual-compatibility
app.include_router(auth_router)
app.include_router(tickets_router)
app.include_router(chat_router)
app.include_router(ml_router)
app.include_router(admin_router)
app.include_router(health_router)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "organization": settings.ORGANIZATION_NAME,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
        "health": f"{settings.API_V1_STR}/health"
    }
