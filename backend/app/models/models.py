from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    users = relationship("User", back_populates="department_rel")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, index=True)  # 'employee', 'domain_admin', 'org_admin'
    department = Column(String(100), nullable=True, index=True)  # Associated department
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    department_rel = relationship("Department", back_populates="users")
    tickets_created = relationship("Ticket", foreign_keys="Ticket.employee_id", back_populates="employee")
    tickets_assigned = relationship("Ticket", foreign_keys="Ticket.assigned_admin_id", back_populates="assigned_admin")
    conversations = relationship("Conversation", back_populates="user")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_code = Column(String(50), unique=True, nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    employee_name = Column(String(255), nullable=False)
    employee_email = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, default="General")
    priority = Column(String(20), nullable=False, default="Medium")  # Low, Medium, High, Urgent
    ml_predicted_department = Column(String(100), nullable=True)
    ml_confidence = Column(Float, nullable=True)
    status = Column(String(30), nullable=False, default="Pending", index=True)  # Pending, In Progress, Completed, Reopened
    assigned_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    employee = relationship("User", foreign_keys=[employee_id], back_populates="tickets_created")
    assigned_admin = relationship("User", foreign_keys=[assigned_admin_id], back_populates="tickets_assigned")
    conversation = relationship("Conversation", back_populates="ticket")
    status_history = relationship("TicketStatusHistory", back_populates="ticket", cascade="all, delete-orphan", order_by="TicketStatusHistory.created_at.desc()")
    internal_notes = relationship("InternalNote", back_populates="ticket", cascade="all, delete-orphan", order_by="InternalNote.created_at.desc()")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Service Desk Chat")
    status = Column(String(30), default="active")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ConversationMessage.created_at.asc()")
    ticket = relationship("Ticket", back_populates="conversation", uselist=False)

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    metadata_json = Column(Text, nullable=True)  # Serialized JSON for confirmation cards, ML scores
    created_at = Column(DateTime(timezone=True), default=utc_now)

    conversation = relationship("Conversation", back_populates="messages")

class TicketStatusHistory(Base):
    __tablename__ = "ticket_status_history"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False, index=True)
    old_status = Column(String(30), nullable=False)
    new_status = Column(String(30), nullable=False)
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    changed_by_name = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    ticket = relationship("Ticket", back_populates="status_history")

class InternalNote(Base):
    __tablename__ = "internal_notes"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String(255), nullable=False)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    ticket = relationship("Ticket", back_populates="internal_notes")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., 'TICKET_CREATED', 'STATUS_CHANGE', 'NOTE_ADDED'
    entity_type = Column(String(50), nullable=False)  # 'ticket', 'user', 'session'
    entity_id = Column(String(50), nullable=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)
