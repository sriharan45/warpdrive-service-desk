import random
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from backend.app.core.database import get_db
from backend.app.models.models import (
    User,
    Ticket,
    Conversation,
    TicketStatusHistory,
    InternalNote
)
from backend.app.schemas.schemas import (
    TicketCreate,
    TicketCreateFromChat,
    TicketResponse,
    TicketDetailResponse,
    TicketListResponse,
    TicketUpdateStatus,
    InternalNoteCreate,
    InternalNoteResponse,
    TicketStatusHistoryResponse
)
from backend.app.api.deps import (
    get_current_user,
    verify_ticket_read_access,
    verify_ticket_write_access
)
from backend.app.services.ml_service import ml_service
from backend.app.services.audit_service import log_action

router = APIRouter(prefix="/tickets", tags=["Tickets"])

def generate_ticket_code(db: Session) -> str:
    """Generate a clean, professional enterprise ticket ID code (e.g. WD-2026-1042)."""
    year = datetime.now(timezone.utc).year
    # Find last ticket count
    count = db.query(Ticket).count() + 1
    # Random suffix salt to avoid collision in concurrent tests
    salt = random.randint(10, 99)
    return f"WD-{year}-{count:04d}{salt}"

@router.post("", response_model=TicketResponse)
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Standard ticket creation endpoint for employees.
    Uses ML classifier for department routing if not supplied.
    """
    dept = ticket_in.department
    ml_conf = None
    ml_pred = None

    # Predict department if not explicitly set
    combined_text = f"{ticket_in.subject}. {ticket_in.description}"
    ml_res = ml_service.predict(combined_text)
    ml_pred = ml_res["department"]
    ml_conf = ml_res["confidence"]
    
    if not dept:
        dept = ml_pred

    ticket_code = generate_ticket_code(db)

    ticket = Ticket(
        ticket_code=ticket_code,
        employee_id=current_user.id,
        employee_name=current_user.full_name,
        employee_email=current_user.email,
        department=dept,
        subject=ticket_in.subject.strip(),
        description=ticket_in.description.strip(),
        category=ticket_in.category or "General",
        priority=ticket_in.priority or "Medium",
        ml_predicted_department=ml_pred,
        ml_confidence=ml_conf,
        status="Pending",
        conversation_id=ticket_in.conversation_id
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # Initial status history record
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status="None",
        new_status="Pending",
        changed_by_id=current_user.id,
        changed_by_name=current_user.full_name,
        notes="Ticket created"
    )
    db.add(history)
    db.commit()

    log_action(
        db=db,
        action="TICKET_CREATED",
        entity_type="ticket",
        entity_id=str(ticket.id),
        user=current_user,
        details=f"Ticket {ticket.ticket_code} created by {current_user.email} in {dept}"
    )

    return ticket

@router.post("/create-from-chat", response_model=TicketResponse)
def create_ticket_from_chat(
    payload: TicketCreateFromChat,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create ticket after employee explicitly reviews and confirms the AI chat confirmation card.
    """
    # Verify conversation exists and belongs to current user
    conv = db.query(Conversation).filter(
        Conversation.id == payload.conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation session not found.")

    ticket_code = generate_ticket_code(db)

    ticket = Ticket(
        ticket_code=ticket_code,
        employee_id=current_user.id,
        employee_name=current_user.full_name,
        employee_email=current_user.email,
        department=payload.department,
        subject=payload.subject.strip(),
        description=payload.description.strip(),
        category=payload.category,
        priority=payload.priority,
        ml_predicted_department=payload.department,
        ml_confidence=payload.ml_confidence,
        status="Pending",
        conversation_id=conv.id
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # Create history
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status="None",
        new_status="Pending",
        changed_by_id=current_user.id,
        changed_by_name=current_user.full_name,
        notes="Ticket confirmed and created via AI Support Assistant"
    )
    db.add(history)
    db.commit()

    log_action(
        db=db,
        action="TICKET_CREATED_FROM_CHAT",
        entity_type="ticket",
        entity_id=str(ticket.id),
        user=current_user,
        details=f"Ticket {ticket.ticket_code} created from AI chat by {current_user.email}"
    )

    return ticket

@router.get("/my", response_model=TicketListResponse)
def get_my_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List tickets belonging ONLY to the currently logged in employee."""
    query = db.query(Ticket).filter(Ticket.employee_id == current_user.id)

    if status_filter:
        query = query.filter(Ticket.status == status_filter)
    if priority_filter:
        query = query.filter(Ticket.priority == priority_filter)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Ticket.ticket_code.ilike(search_fmt),
                Ticket.subject.ilike(search_fmt),
                Ticket.description.ilike(search_fmt),
                Ticket.department.ilike(search_fmt)
            )
        )

    total = query.count()
    items = query.order_by(desc(Ticket.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{ticket_id}", response_model=TicketDetailResponse)
def get_ticket_detail(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get full ticket details.
    Backend strictly enforces:
    - Employee can only view their own tickets.
    - Domain Admin can only view tickets belonging to their authorized department.
    - Org Admin can view any department ticket (read-only supervisor).
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")

    verify_ticket_read_access(ticket, current_user)
    return ticket

@router.post("/{ticket_id}/status", response_model=TicketDetailResponse)
def update_ticket_status(
    ticket_id: int,
    payload: TicketUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update ticket status.
    Backend strictly enforces:
    - Domain Admin ONLY of that department.
    - Org Admin is strictly FORBIDDEN (monitor-only role).
    - Employee is strictly FORBIDDEN.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")

    verify_ticket_write_access(ticket, current_user)

    old_status = ticket.status
    new_status = payload.status

    valid_statuses = ["Pending", "In Progress", "Completed", "Reopened"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{new_status}'. Allowed values: {valid_statuses}"
        )

    if old_status == new_status:
        return ticket

    # Update ticket status
    ticket.status = new_status
    if new_status == "In Progress" and not ticket.assigned_admin_id:
        ticket.assigned_admin_id = current_user.id
    if new_status == "Completed" and payload.resolution_notes:
        ticket.resolution_notes = payload.resolution_notes.strip()

    ticket.updated_at = datetime.now(timezone.utc)

    # Record status transition history
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status=old_status,
        new_status=new_status,
        changed_by_id=current_user.id,
        changed_by_name=current_user.full_name,
        notes=payload.notes or payload.resolution_notes or f"Status changed from {old_status} to {new_status}"
    )
    db.add(history)
    db.commit()
    db.refresh(ticket)

    log_action(
        db=db,
        action="TICKET_STATUS_UPDATED",
        entity_type="ticket",
        entity_id=str(ticket.id),
        user=current_user,
        details=f"Ticket {ticket.ticket_code} status changed from {old_status} to {new_status} by {current_user.email}"
    )

    return ticket

@router.post("/{ticket_id}/notes", response_model=InternalNoteResponse)
def add_internal_note(
    ticket_id: int,
    note_in: InternalNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add internal note to ticket.
    Backend strictly enforces that only the authorized Domain Admin can add internal notes.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")

    verify_ticket_write_access(ticket, current_user)

    note = InternalNote(
        ticket_id=ticket.id,
        author_id=current_user.id,
        author_name=current_user.full_name,
        note=note_in.note.strip()
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    log_action(
        db=db,
        action="INTERNAL_NOTE_ADDED",
        entity_type="ticket",
        entity_id=str(ticket.id),
        user=current_user,
        details=f"Internal note added to {ticket.ticket_code} by {current_user.email}"
    )

    return note
