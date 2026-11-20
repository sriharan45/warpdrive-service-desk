import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.models import User, Conversation, ConversationMessage
from backend.app.schemas.schemas import (
    MessageCreate,
    ChatAssistantResponse,
    ConversationResponse,
    ConfirmationCardPayload
)
from backend.app.api.deps import get_current_user
from backend.app.services.chat_service import chat_service
from backend.app.services.audit_service import log_action

router = APIRouter(prefix="/chat", tags=["AI Chat Support"])

@router.post("/message", response_model=ChatAssistantResponse)
def send_chat_message(
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Handle natural language employee inquiries.
    Runs ML classification, gathers details, and generates a ticket confirmation card.
    """
    content = msg_in.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Find or create conversation
    conv = None
    if msg_in.conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == msg_in.conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found.")
    else:
        # Create new conversation
        title = content[:50] + ("..." if len(content) > 50 else "")
        conv = Conversation(
            user_id=current_user.id,
            title=title,
            status="active"
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message
    user_msg = ConversationMessage(
        conversation_id=conv.id,
        sender="user",
        content=content
    )
    db.add(user_msg)
    db.commit()

    # Load recent conversation history
    history_msgs = (
        db.query(ConversationMessage)
        .filter(ConversationMessage.conversation_id == conv.id)
        .order_by(ConversationMessage.created_at.asc())
        .all()
    )
    history_payload = [
        {"role": m.sender, "content": m.content}
        for m in history_msgs
    ]

    # Process message through ChatService
    res = chat_service.process_message(content, history_payload)

    # Save assistant message
    metadata_str = None
    if res.get("confirmation_card"):
        metadata_str = json.dumps({
            "confirmation_card": res["confirmation_card"],
            "predicted_department": res.get("predicted_department"),
            "confidence": res.get("confidence")
        })

    assistant_msg = ConversationMessage(
        conversation_id=conv.id,
        sender="assistant",
        content=res["reply"],
        metadata_json=metadata_str
    )
    db.add(assistant_msg)
    db.commit()

    card_obj = None
    if res.get("confirmation_card"):
        card_obj = ConfirmationCardPayload(**res["confirmation_card"])

    return ChatAssistantResponse(
        conversation_id=conv.id,
        reply=res["reply"],
        needs_clarification=res["needs_clarification"],
        confirmation_card=card_obj,
        predicted_department=res.get("predicted_department"),
        confidence=res.get("confidence")
    )

@router.get("/conversations", response_model=List[ConversationResponse])
def get_user_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve list of past conversations for current user."""
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .limit(20)
        .all()
    )
    return convs

@router.get("/conversations/{conv_id}", response_model=ConversationResponse)
def get_conversation_details(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full conversation messages for the current user or domain/org admins."""
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    # Access control: Employee can only see own conversation. Domain/org admins can inspect associated ticket conversation.
    if current_user.role == "employee" and conv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot view another user's conversation.")
    
    return conv
