"""
WarpDrive Intelligent Service Desk - Backend Root Entrypoint Shim
Enables running uvicorn directly from the backend/ directory:
  uvicorn main:app --host 0.0.0.0 --port $PORT
or
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
"""
import os
import sys

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(BACKEND_DIR)

for _p in [REPO_ROOT, BACKEND_DIR]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

if 'backend' not in sys.modules:
    import types
    try:
        import backend
    except ImportError:
        _backend_mod = types.ModuleType('backend')
        _backend_mod.__path__ = [BACKEND_DIR]
        sys.modules['backend'] = _backend_mod

from backend.app.main import app

__all__ = ["app"]
