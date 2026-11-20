from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

# Engine setup with appropriate pooling for Postgres vs SQLite
db_url = settings.normalized_database_url

if db_url.startswith("sqlite"):
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL (Neon or Render)
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
