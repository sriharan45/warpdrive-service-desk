"""
WarpDrive Intelligent Service Desk - AI Chat Service
Provides natural conversational ticket drafting with Gemini API integration
and reliable deterministic fallback.
"""

import os
import json
import re
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings
from backend.app.services.ml_service import ml_service

class ChatService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY.strip()
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[ChatService] Could not initialize google-genai client: {e}")

    def process_message(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Processes an incoming user message within a conversation.
        Returns:
            - reply (assistant message)
            - needs_clarification (bool)
            - confirmation_card (dict or None)
            - predicted_department (str)
            - confidence (float)
        """
        # Always run ML classification on the user message
        ml_result = ml_service.predict(user_message)
        dept = ml_result["department"]
        confidence = ml_result["confidence"]
        is_low_conf = ml_result["is_low_confidence"]

        # Check message length & clarity
        words = user_message.strip().split()
        is_too_brief = len(words) < 4
        
        # Determine priority/urgency
        priority = self._infer_priority(user_message)
        category = self._infer_category(user_message, dept)
        subject = self._generate_subject(user_message, dept)

        # Attempt Gemini conversational response if configured
        if self.client:
            try:
                gemini_res = self._call_gemini(user_message, conversation_history, dept, confidence)
                if gemini_res:
                    return gemini_res
            except Exception as e:
                print(f"[ChatService] Gemini API call failed, falling back to deterministic logic: {e}")

        # Deterministic Fallback Logic
        if is_too_brief:
            reply = (
                f"Hello! I noticed your request is quite brief. Could you please share a few more specifics "
                f"(such as any error messages, affected device/room, or what steps led to the issue)? "
                f"This will help us route your request to the right team immediately."
            )
            return {
                "reply": reply,
                "needs_clarification": True,
                "confirmation_card": None,
                "predicted_department": dept,
                "confidence": confidence
            }

        # If low confidence, ask for confirmation
        if is_low_conf:
            reply = (
                f"Thank you for describing the issue. Based on our analysis, this appears to be related to "
                f"**{dept}** ({round(confidence * 100, 1)}% confidence), though it could also involve {ml_result['ranked_departments'][1]['department']}. "
                f"I've prepared a ticket draft for your review below. Please confirm if this is correct or feel free to add more details."
            )
        else:
            reply = (
                f"I understand your issue regarding **{subject}**. I have analyzed the details using our "
                f"intelligent routing model and classified this under the **{dept}** department with {round(confidence * 100, 1)}% confidence.\n\n"
                f"Please review the summary below and click **'Confirm & Create Ticket'** to submit your request to the team."
            )

        confirmation_card = {
            "subject": subject,
            "description": user_message.strip(),
            "department": dept,
            "category": category,
            "priority": priority,
            "ml_confidence": confidence,
            "confidence_percentage": round(confidence * 100, 1),
            "is_ready_for_ticket": True
        }

        return {
            "reply": reply,
            "needs_clarification": False,
            "confirmation_card": confirmation_card,
            "predicted_department": dept,
            "confidence": confidence
        }

    def _infer_priority(self, text: str) -> str:
        t = text.lower()
        if any(w in t for w in ["urgent", "emergency", "immediately", "asap", "critical", "blocking", "severe", "spark", "smoke"]):
            return "Urgent"
        elif any(w in t for w in ["high", "cannot work", "deadline", "important", "failed", "crash", "leak"]):
            return "High"
        elif any(w in t for w in ["low", "minor", "suggestion", "when possible", "whenever"]):
            return "Low"
        return "Medium"

    def _infer_category(self, text: str, department: str) -> str:
        t = text.lower()
        if department == "IT Support":
            if any(w in t for w in ["wifi", "wi-fi", "internet", "network", "vpn"]):
                return "Network & Connectivity"
            if any(w in t for w in ["laptop", "monitor", "dock", "screen", "keyboard", "mouse"]):
                return "Hardware & Peripherals"
            if any(w in t for w in ["password", "login", "sso", "mfa", "locked", "access"]):
                return "Account & Access"
            if any(w in t for w in ["outlook", "email", "teams", "slack"]):
                return "Email & Collaboration"
            return "IT Service Request"
        elif department == "Technical":
            if any(w in t for w in ["crash", "bug", "500", "exception", "error"]):
                return "Software Defect"
            if any(w in t for w in ["database", "sql", "migration", "query"]):
                return "Database Issue"
            if any(w in t for w in ["api", "webhook", "integration", "gateway"]):
                return "API & Integration"
            if any(w in t for w in ["deploy", "pipeline", "docker", "k8s"]):
                return "DevOps & Infrastructure"
            return "Technical Defect"
        elif department == "HR":
            if any(w in t for w in ["leave", "holiday", "absence", "attendance"]):
                return "Leave & Attendance"
            if any(w in t for w in ["insurance", "medical", "claim", "benefit"]):
                return "Benefits & Insurance"
            if any(w in t for w in ["onboard", "offboard", "relieving", "resignation"]):
                return "Employee Lifecycle"
            return "HR Policy & Inquiries"
        elif department == "Accounts":
            if any(w in t for w in ["salary", "payslip", "deduction", "payroll"]):
                return "Payroll & Compensation"
            if any(w in t for w in ["tax", "tds", "form 16", "80c"]):
                return "Tax & Form 16"
            if any(w in t for w in ["reimburse", "expense", "receipt", "claim"]):
                return "Expense Reimbursements"
            if any(w in t for w in ["invoice", "vendor", "po", "bill"]):
                return "Vendor & Billing"
            return "Accounts Query"
        elif department == "Maintenance":
            if any(w in t for w in ["ac", "air condition", "heat", "cold", "vent", "thermostat"]):
                return "HVAC & Temperature"
            if any(w in t for w in ["light", "power", "switch", "socket", "wire"]):
                return "Electrical & Lighting"
            if any(w in t for w in ["tap", "plumb", "leak", "sink", "water", "restroom", "toilet"]):
                return "Plumbing & Restrooms"
            return "Facilities & Repairs"
        return "General Request"

    def _generate_subject(self, text: str, department: str) -> str:
        # Generate a concise title from the text
        first_line = text.strip().split("\n")[0]
        cleaned = re.sub(r"^(hi|hello|hey|urgent:?|support:?)\s*", "", first_line, flags=re.IGNORECASE).strip()
        if len(cleaned) > 70:
            cleaned = cleaned[:67] + "..."
        if len(cleaned) < 6:
            return f"{department} Request: {cleaned or 'Support Inquiry'}"
        return cleaned.capitalize()

    def _call_gemini(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        dept: str,
        confidence: float
    ) -> Optional[Dict[str, Any]]:
        prompt = f"""
You are the AI Service Desk Assistant for WarpDrive Tech Works.
The user is an employee who submitted the following message:
"{user_message}"

Our backend ML classification model determined:
- Predicted Department: {dept}
- Confidence Score: {round(confidence * 100, 1)}%

Respond professionally and courteously. If the user message is too vague, ask clarifying questions.
If it contains sufficient information, acknowledge their request, confirm the department routing, and explain that a ticket draft is prepared.

Respond with a JSON object containing:
{{
  "reply": "Your response to the employee in markdown format",
  "needs_clarification": false,
  "subject": "Concise issue subject title",
  "category": "Issue category",
  "priority": "Low|Medium|High|Urgent"
}}
"""
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        if response and response.text:
            text = response.text.strip()
            # Extract JSON block
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
                needs_clarification = data.get("needs_clarification", False)
                confirmation_card = None
                if not needs_clarification:
                    confirmation_card = {
                        "subject": data.get("subject", self._generate_subject(user_message, dept)),
                        "description": user_message.strip(),
                        "department": dept,
                        "category": data.get("category", self._infer_category(user_message, dept)),
                        "priority": data.get("priority", self._infer_priority(user_message)),
                        "ml_confidence": confidence,
                        "confidence_percentage": round(confidence * 100, 1),
                        "is_ready_for_ticket": True
                    }
                return {
                    "reply": data.get("reply", text),
                    "needs_clarification": needs_clarification,
                    "confirmation_card": confirmation_card,
                    "predicted_department": dept,
                    "confidence": confidence
                }
        return None

chat_service = ChatService()
