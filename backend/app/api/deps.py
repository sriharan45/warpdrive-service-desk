from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.app.core.database import SessionLocal
from backend.app.core.security import decode_access_token
from backend.app.models.models import User, Ticket

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    return user

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of the following roles: {allowed_roles}"
            )
        return current_user
    return role_checker

def verify_ticket_read_access(ticket: Ticket, current_user: User):
    """
    Enforces strict access control for viewing a ticket:
    - Employee: Only their own tickets.
    - Domain Admin: Only tickets within their assigned department.
    - Org Admin: All tickets (read-only supervisor).
    """
    if current_user.role == "employee":
        if ticket.employee_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not authorized to view tickets submitted by other employees."
            )
    elif current_user.role == "domain_admin":
        if ticket.department != current_user.department:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Domain administrators for '{current_user.department}' cannot access tickets for '{ticket.department}'."
            )
    elif current_user.role == "org_admin":
        # Org admin has global read visibility
        pass
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized role.")

def verify_ticket_write_access(ticket: Ticket, current_user: User):
    """
    Enforces strict access control for updating ticket status or adding internal notes:
    - Domain Admin: ONLY domain admin of that specific department can modify status or add internal notes.
    - Org Admin: Strictly FORBIDDEN (monitor-only role).
    - Employee: Strictly FORBIDDEN from modifying administrative ticket status.
    """
    if current_user.role == "org_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Organization administrators have monitor/supervisor privileges only and cannot alter domain ticket statuses."
        )
    elif current_user.role == "domain_admin":
        if ticket.department != current_user.department:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: You are only authorized to manage tickets for '{current_user.department}'."
            )
    elif current_user.role == "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Employees cannot modify administrative ticket statuses."
        )
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized role.")
