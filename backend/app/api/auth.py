from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import verify_password, hash_password, create_access_token
from backend.app.models.models import User
from backend.app.schemas.schemas import Token, UserLogin, UserRegister, UserResponse
from backend.app.api.deps import get_current_user, require_roles
from backend.app.services.audit_service import log_action

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and issue JWT access token."""
    email_clean = login_data.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your user account is inactive. Please contact your organization administrator."
        )

    # Issue JWT
    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "name": user.full_name
    }
    access_token = create_access_token(token_payload)

    # Audit log login
    log_action(
        db=db,
        action="USER_LOGIN",
        entity_type="user",
        entity_id=str(user.id),
        user=user,
        details=f"User {user.email} logged in with role {user.role}"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve profile of currently authenticated user."""
    return current_user

@router.post("/register-employee", response_model=UserResponse)
def register_employee(
    user_data: UserRegister,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["org_admin"]))
):
    """Org Admin only: register a new employee or staff member."""
    existing = db.query(User).filter(User.email == user_data.email.strip().lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{user_data.email}' already exists."
        )
    
    new_user = User(
        email=user_data.email.strip().lower(),
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name.strip(),
        role=user_data.role,
        department=user_data.department,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_action(
        db=db,
        action="USER_REGISTERED",
        entity_type="user",
        entity_id=str(new_user.id),
        user=admin_user,
        details=f"Admin {admin_user.email} created user {new_user.email} with role {new_user.role}"
    )

    return new_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Log out current user and record audit."""
    log_action(
        db=db,
        action="USER_LOGOUT",
        entity_type="user",
        entity_id=str(current_user.id),
        user=current_user,
        details=f"User {current_user.email} logged out."
    )
    return {"message": "Successfully logged out."}

@router.post("/setup-demo")
def setup_demo_accounts(db: Session = Depends(get_db)):
    """Safe idempotent setup: ensures demo accounts exist and hashes match documented passwords."""
    try:
        from backend.seed import seed_database
        seed_database()
        return {
            "status": "success",
            "message": "Demo accounts and initial seed data verified successfully.",
            "accounts": [
                {"role": "Employee", "email": "employee@warpdrive.com", "name": "Sarah Connor"},
                {"role": "Employee", "email": "john.doe@warpdrive.com", "name": "John Doe"},
                {"role": "Domain Admin (IT Support)", "email": "admin.it@warpdrive.com", "name": "Alex Rivera"},
                {"role": "Domain Admin (Technical)", "email": "admin.tech@warpdrive.com", "name": "Elena Vance"},
                {"role": "Domain Admin (HR)", "email": "admin.hr@warpdrive.com", "name": "Marcus Chen"},
                {"role": "Domain Admin (Accounts)", "email": "admin.accounts@warpdrive.com", "name": "Priya Sharma"},
                {"role": "Domain Admin (Maintenance)", "email": "admin.maint@warpdrive.com", "name": "David Miller"},
                {"role": "Organization Admin", "email": "org.admin@warpdrive.com", "name": "Diana Prince"}
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to seed demo accounts: {str(e)}"
        )
