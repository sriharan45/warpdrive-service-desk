"""
WarpDrive Intelligent Service Desk - Audit Logging Service
Records auditable system events for governance and compliance.
"""

from typing import Optional
from sqlalchemy.orm import Session
from backend.app.models.models import AuditLog, User

def log_action(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    user: Optional[User] = None,
    details: Optional[str] = None
) -> AuditLog:
    """Creates a persistent audit log entry."""
    audit_entry = AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        user_id=user.id if user else None,
        user_email=user.email if user else "system",
        details=details
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
