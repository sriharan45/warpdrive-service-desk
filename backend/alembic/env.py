import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Add repository root and backend directory to path
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_repo_root = os.path.abspath(os.path.join(_backend_dir, ".."))
for _p in [_repo_root, _backend_dir]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

if 'backend' not in sys.modules:
    import types
    try:
        import backend
    except ImportError:
        _backend_mod = types.ModuleType('backend')
        _backend_mod.__path__ = [_backend_dir]
        sys.modules['backend'] = _backend_mod

from backend.app.core.config import settings
from backend.app.core.database import Base
from backend.app.models.models import *  # Import all models

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = settings.normalized_database_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = settings.normalized_database_url

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
