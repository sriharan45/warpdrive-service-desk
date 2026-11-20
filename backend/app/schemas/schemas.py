from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# ----------------- Auth Schemas -----------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: str = Field(default="employee")
    department: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    is_active: bool
    created_at: datetime

# ----------------- Department Schemas -----------------
class DepartmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None

# ----------------- Ticket Schemas -----------------
class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    category: Optional[str] = "General"
    priority: Optional[str] = "Medium"
    department: Optional[str] = None  # If omitted, inferred from ML
    conversation_id: Optional[int] = None

class TicketCreateFromChat(BaseModel):
    conversation_id: int
    subject: str
    description: str
    category: str
    priority: str
    department: str
    ml_confidence: Optional[float] = None

class TicketUpdateStatus(BaseModel):
    status: str = Field(..., description="'In Progress', 'Completed', 'Reopened'")
    resolution_notes: Optional[str] = None
    notes: Optional[str] = None

class InternalNoteCreate(BaseModel):
    note: str = Field(..., min_length=2)

class InternalNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    author_id: int
    author_name: str
    note: str
    created_at: datetime

class TicketStatusHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    old_status: str
    new_status: str
    changed_by_name: str
    notes: Optional[str] = None
    created_at: datetime

class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_code: str
    employee_id: int
    employee_name: str
    employee_email: str
    department: str
    subject: str
    description: str
    category: str
    priority: str
    ml_predicted_department: Optional[str] = None
    ml_confidence: Optional[float] = None
    status: str
    assigned_admin_id: Optional[int] = None
    resolution_notes: Optional[str] = None
    conversation_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class TicketDetailResponse(TicketResponse):
    model_config = ConfigDict(from_attributes=True)

    status_history: List[TicketStatusHistoryResponse] = []
    internal_notes: List[InternalNoteResponse] = []
    conversation: Optional["ConversationResponse"] = None

class TicketListResponse(BaseModel):
    items: List[TicketResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ----------------- Chat / Conversation Schemas -----------------
class MessageCreate(BaseModel):
    content: str
    conversation_id: Optional[int] = None

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    sender: str
    content: str
    metadata_json: Optional[str] = None
    created_at: datetime

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    status: str
    created_at: datetime
    messages: List[MessageResponse] = []

class ConfirmationCardPayload(BaseModel):
    subject: str
    description: str
    department: str
    category: str
    priority: str
    ml_confidence: float
    confidence_percentage: float
    is_ready_for_ticket: bool

class ChatAssistantResponse(BaseModel):
    conversation_id: int
    reply: str
    needs_clarification: bool
    confirmation_card: Optional[ConfirmationCardPayload] = None
    predicted_department: Optional[str] = None
    confidence: Optional[float] = None

# ----------------- ML Schemas -----------------
class MLPredictRequest(BaseModel):
    text: str = Field(..., min_length=3)

class DepartmentRank(BaseModel):
    department: str
    confidence: float

class MLPredictResponse(BaseModel):
    department: str
    confidence: float
    confidence_percentage: float
    is_low_confidence: bool
    probabilities: Dict[str, float]
    ranked_departments: List[DepartmentRank]

class MLMetricsResponse(BaseModel):
    model_type: str
    sample_count: int
    train_samples: int
    test_samples: int
    classes: List[str]
    accuracy: float
    macro_precision: float
    macro_recall: float
    macro_f1: float
    weighted_f1: float
    classification_report: Dict[str, Any]
    confusion_matrix: List[List[int]]

# ----------------- Audit Schemas -----------------
class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

# ----------------- Dashboard Metrics Schemas -----------------
class DomainAdminMetrics(BaseModel):
    department: str
    total_tickets: int
    pending_tickets: int
    in_progress_tickets: int
    completed_tickets: int
    urgent_tickets: int
    avg_resolution_time_hours: Optional[float] = 0.0

class DepartmentDistribution(BaseModel):
    department: str
    total: int
    pending: int
    in_progress: int
    completed: int

class TrendDataPoint(BaseModel):
    date: str
    created: int
    completed: int

class OrgAdminMetrics(BaseModel):
    total_tickets: int
    pending_tickets: int
    in_progress_tickets: int
    completed_tickets: int
    urgent_tickets: int
    resolution_rate_percentage: float
    department_distribution: List[DepartmentDistribution]
    recent_trend: List[TrendDataPoint]
    total_employees: int
    total_admins: int

# Resolve forward references
Token.model_rebuild()
TicketDetailResponse.model_rebuild()
