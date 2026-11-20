from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, asc

from backend.app.core.database import get_db
from backend.app.models.models import (
    User,
    Ticket,
    Department,
    AuditLog,
    TicketStatusHistory
)
from backend.app.schemas.schemas import (
    TicketResponse,
    TicketListResponse,
    DomainAdminMetrics,
    OrgAdminMetrics,
    DepartmentDistribution,
    TrendDataPoint,
    AuditLogResponse,
    DepartmentResponse
)
from backend.app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/admin", tags=["Administration"])

# ----------------- Domain Admin Endpoints -----------------

@router.get("/domain/metrics", response_model=DomainAdminMetrics)
def get_domain_admin_metrics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["domain_admin"]))
):
    """
    Returns live metrics for the Domain Admin's authorized department only.
    """
    dept = admin_user.department
    if not dept:
        raise HTTPException(
            status_code=400,
            detail="Domain administrator has no authorized department assigned."
        )

    total = db.query(Ticket).filter(Ticket.department == dept).count()
    pending = db.query(Ticket).filter(Ticket.department == dept, Ticket.status == "Pending").count()
    in_progress = db.query(Ticket).filter(Ticket.department == dept, Ticket.status == "In Progress").count()
    completed = db.query(Ticket).filter(Ticket.department == dept, Ticket.status == "Completed").count()
    urgent = db.query(Ticket).filter(
        Ticket.department == dept,
        Ticket.priority == "Urgent",
        Ticket.status.in_(["Pending", "In Progress", "Reopened"])
    ).count()

    # Calculate average resolution time for completed tickets in this department
    completed_tickets = db.query(Ticket).filter(
        Ticket.department == dept,
        Ticket.status == "Completed"
    ).all()

    avg_hours = 0.0
    if completed_tickets:
        durations = [
            (t.updated_at - t.created_at).total_seconds() / 3600.0
            for t in completed_tickets
            if t.updated_at and t.created_at
        ]
        if durations:
            avg_hours = round(sum(durations) / len(durations), 1)

    return DomainAdminMetrics(
        department=dept,
        total_tickets=total,
        pending_tickets=pending,
        in_progress_tickets=in_progress,
        completed_tickets=completed,
        urgent_tickets=urgent,
        avg_resolution_time_hours=avg_hours
    )

@router.get("/domain/tickets", response_model=TicketListResponse)
def get_domain_admin_tickets(
    queue: Optional[str] = Query(None, description="'Pending', 'In Progress', 'Completed', or None for All"),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["domain_admin"]))
):
    """
    List tickets strictly belonging to the Domain Admin's authorized department.
    Backend guarantees a domain admin cannot query or receive other departments' tickets.
    """
    dept = admin_user.department
    query = db.query(Ticket).filter(Ticket.department == dept)

    if queue and queue != "All":
        query = query.filter(Ticket.status == queue)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Ticket.ticket_code.ilike(s),
                Ticket.subject.ilike(s),
                Ticket.description.ilike(s),
                Ticket.employee_name.ilike(s),
                Ticket.employee_email.ilike(s)
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

# ----------------- Org Admin Endpoints -----------------

@router.get("/org/metrics", response_model=OrgAdminMetrics)
def get_org_admin_metrics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["org_admin"]))
):
    """
    Organization-wide overview metrics across all departments.
    """
    total = db.query(Ticket).count()
    pending = db.query(Ticket).filter(Ticket.status == "Pending").count()
    in_progress = db.query(Ticket).filter(Ticket.status == "In Progress").count()
    completed = db.query(Ticket).filter(Ticket.status == "Completed").count()
    urgent = db.query(Ticket).filter(
        Ticket.priority == "Urgent",
        Ticket.status.in_(["Pending", "In Progress", "Reopened"])
    ).count()

    res_rate = round((completed / total * 100), 1) if total > 0 else 0.0

    # Department distribution
    depts = ["IT Support", "Technical", "HR", "Accounts", "Maintenance"]
    dist_list = []
    for d in depts:
        d_total = db.query(Ticket).filter(Ticket.department == d).count()
        d_pending = db.query(Ticket).filter(Ticket.department == d, Ticket.status == "Pending").count()
        d_inp = db.query(Ticket).filter(Ticket.department == d, Ticket.status == "In Progress").count()
        d_comp = db.query(Ticket).filter(Ticket.department == d, Ticket.status == "Completed").count()
        dist_list.append(DepartmentDistribution(
            department=d,
            total=d_total,
            pending=d_pending,
            in_progress=d_inp,
            completed=d_comp
        ))

    # Recent 7 days trend
    trend_list = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_str = day_date.strftime("%b %d")
        created_count = db.query(Ticket).filter(
            func.date(Ticket.created_at) == day_date
        ).count()
        completed_count = db.query(Ticket).filter(
            Ticket.status == "Completed",
            func.date(Ticket.updated_at) == day_date
        ).count()
        trend_list.append(TrendDataPoint(date=day_str, created=created_count, completed=completed_count))

    total_employees = db.query(User).filter(User.role == "employee").count()
    total_admins = db.query(User).filter(User.role.in_(["domain_admin", "org_admin"])).count()

    return OrgAdminMetrics(
        total_tickets=total,
        pending_tickets=pending,
        in_progress_tickets=in_progress,
        completed_tickets=completed,
        urgent_tickets=urgent,
        resolution_rate_percentage=res_rate,
        department_distribution=dist_list,
        recent_trend=trend_list,
        total_employees=total_employees,
        total_admins=total_admins
    )

@router.get("/org/tickets", response_model=TicketListResponse)
def get_org_admin_tickets(
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["org_admin"]))
):
    """
    Global ticket queue for Organization Administrator across all departments.
    Monitor-only role: status changes must not be performed here.
    """
    query = db.query(Ticket)

    if department and department != "All":
        query = query.filter(Ticket.department == department)
    if status and status != "All":
        query = query.filter(Ticket.status == status)
    if priority and priority != "All":
        query = query.filter(Ticket.priority == priority)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Ticket.ticket_code.ilike(s),
                Ticket.subject.ilike(s),
                Ticket.description.ilike(s),
                Ticket.employee_name.ilike(s),
                Ticket.employee_email.ilike(s),
                Ticket.department.ilike(s)
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

@router.get("/org/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["org_admin"]))
):
    """Retrieve system activity and security audit trail."""
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit).all()
    return logs

@router.get("/departments", response_model=List[DepartmentResponse])
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all authorized departments in WarpDrive Tech Works."""
    return db.query(Department).all()
