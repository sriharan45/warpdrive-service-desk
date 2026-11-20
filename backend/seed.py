"""
WarpDrive Intelligent Service Desk - Safe Development Seed Script
Seeds departments, demo users for each role, realistic sample tickets across statuses,
conversation histories, internal notes, and audit logs.
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.core.security import hash_password
from backend.app.models.models import (
    Department,
    User,
    Ticket,
    Conversation,
    ConversationMessage,
    TicketStatusHistory,
    InternalNote,
    AuditLog
)

def seed_database():
    print("[Seed] Creating database tables if needed...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Departments
        departments_data = [
            ("IT Support", "Hardware, software, network, access, and workstation support"),
            ("Technical", "Bugs, backend issues, system defects, APIs, and infrastructure"),
            ("HR", "Leave requests, benefits, policies, attendance, and onboarding"),
            ("Accounts", "Salary, payroll, tax forms, reimbursements, and invoices"),
            ("Maintenance", "HVAC, electrical, plumbing, facilities, and office repairs")
        ]
        
        dept_map = {}
        for name, desc in departments_data:
            dept = db.query(Department).filter(Department.name == name).first()
            if not dept:
                dept = Department(name=name, description=desc)
                db.add(dept)
                db.commit()
                db.refresh(dept)
            dept_map[name] = dept

        print(f"[Seed] Departments verified: {list(dept_map.keys())}")

        # 2. Seed Users
        # (email, password, full_name, role, department)
        users_data = [
            # Employees
            ("employee@warpdrive.com", "EmployeePass123!", "Sarah Connor", "employee", "Engineering"),
            ("john.doe@warpdrive.com", "EmployeePass123!", "John Doe", "employee", "Operations"),
            
            # Domain Admins (One per department)
            ("admin.it@warpdrive.com", "AdminPass123!", "Alex Rivera", "domain_admin", "IT Support"),
            ("admin.tech@warpdrive.com", "AdminPass123!", "Elena Vance", "domain_admin", "Technical"),
            ("admin.hr@warpdrive.com", "AdminPass123!", "Marcus Chen", "domain_admin", "HR"),
            ("admin.accounts@warpdrive.com", "AdminPass123!", "Priya Sharma", "domain_admin", "Accounts"),
            ("admin.maint@warpdrive.com", "AdminPass123!", "David Miller", "domain_admin", "Maintenance"),
            
            # Organization Admin
            ("org.admin@warpdrive.com", "OrgAdminPass123!", "Diana Prince", "org_admin", "Executive")
        ]

        user_map = {}
        for email, password, full_name, role, dept_name in users_data:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    hashed_password=hash_password(password),
                    full_name=full_name,
                    role=role,
                    department=dept_name,
                    department_id=dept_map[dept_name].id if dept_name in dept_map else None,
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"[Seed] Created demo user: {email} ({role})")
            user_map[email] = user

        # 3. Seed Realistic Sample Tickets across departments and statuses
        now = datetime.now(timezone.utc)
        sarah = user_map["employee@warpdrive.com"]
        john = user_map["john.doe@warpdrive.com"]

        sample_tickets = [
            # IT Support
            {
                "code": "WD-2026-1001",
                "emp": sarah,
                "dept": "IT Support",
                "admin": user_map["admin.it@warpdrive.com"],
                "subject": "Wi-Fi disconnecting continuously on 3rd floor workstation",
                "desc": "My MacBook Pro keeps dropping the corporate Wi-Fi connection every 10-15 minutes while in the North Bay area on the 3rd floor. Tried forgetting network and rejoining.",
                "cat": "Network & Connectivity",
                "prio": "High",
                "conf": 0.94,
                "status": "Pending",
                "created_delta": 4,
                "res_note": None
            },
            {
                "code": "WD-2026-1002",
                "emp": john,
                "dept": "IT Support",
                "admin": user_map["admin.it@warpdrive.com"],
                "subject": "Need Docker Desktop and JetBrains license approval",
                "desc": "Requesting official license seat for Docker Desktop and IntelliJ IDEA Ultimate for the new cloud project.",
                "cat": "Software Licenses",
                "prio": "Medium",
                "conf": 0.89,
                "status": "In Progress",
                "created_delta": 18,
                "res_note": None
            },
            {
                "code": "WD-2026-1003",
                "emp": sarah,
                "dept": "IT Support",
                "admin": user_map["admin.it@warpdrive.com"],
                "subject": "Ergonomic keyboard and wireless mouse pairing failure",
                "desc": "The Logitech MX Keys keyboard provided by IT has stopped pairing with the Unifying USB receiver. Batteries tested OK.",
                "cat": "Hardware & Peripherals",
                "prio": "Medium",
                "conf": 0.91,
                "status": "Completed",
                "created_delta": 48,
                "res_note": "Replaced USB dongle with new Bluetooth paired receiver. Tested successfully at user desk."
            },

            # Technical
            {
                "code": "WD-2026-1004",
                "emp": sarah,
                "dept": "Technical",
                "admin": user_map["admin.tech@warpdrive.com"],
                "subject": "Microservice payment gateway throwing NullPointerException",
                "desc": "Production checkout gateway threw 500 status on 12 consecutive transactions when customer applied promo discount code with special characters.",
                "cat": "Software Defect",
                "prio": "Urgent",
                "conf": 0.96,
                "status": "In Progress",
                "created_delta": 8,
                "res_note": None
            },
            {
                "code": "WD-2026-1005",
                "emp": john,
                "dept": "Technical",
                "admin": user_map["admin.tech@warpdrive.com"],
                "subject": "Staging PostgreSQL migration script failed on column mismatch",
                "desc": "Alembic migration 0032_audit_table aborted with syntax error on foreign key constraint in staging environment.",
                "cat": "Database Issue",
                "prio": "High",
                "conf": 0.93,
                "status": "Pending",
                "created_delta": 12,
                "res_note": None
            },
            {
                "code": "WD-2026-1006",
                "emp": sarah,
                "dept": "Technical",
                "admin": user_map["admin.tech@warpdrive.com"],
                "subject": "API rate limiter throttling internal notification service",
                "desc": "Internal batch email sender was blocked by Envoy API gateway rate limiter after exceeding 100 req/sec threshold.",
                "cat": "DevOps & Infrastructure",
                "prio": "High",
                "conf": 0.92,
                "status": "Completed",
                "created_delta": 72,
                "res_note": "Adjusted Envoy rate limiter whitelist for internal CIDR blocks. Verified throughput reached 500 req/sec."
            },

            # HR
            {
                "code": "WD-2026-1007",
                "emp": john,
                "dept": "HR",
                "admin": user_map["admin.hr@warpdrive.com"],
                "subject": "Requesting paternity leave approval for two weeks in November",
                "desc": "Submitting formal application for two consecutive weeks of paid paternity leave from Nov 10 to Nov 24. Required hospital documentation attached.",
                "cat": "Leave & Attendance",
                "prio": "Medium",
                "conf": 0.95,
                "status": "In Progress",
                "created_delta": 24,
                "res_note": None
            },
            {
                "code": "WD-2026-1008",
                "emp": sarah,
                "dept": "HR",
                "admin": user_map["admin.hr@warpdrive.com"],
                "subject": "Discrepancy in annual privilege leave balance on HRMS portal",
                "desc": "My portal shows 6 days remaining, but based on tenure and carry-forward calculation, it should be 11 days. Requesting audit of leave accrual.",
                "cat": "Leave & Attendance",
                "prio": "Low",
                "conf": 0.92,
                "status": "Pending",
                "created_delta": 14,
                "res_note": None
            },
            {
                "code": "WD-2026-1009",
                "emp": john,
                "dept": "HR",
                "admin": user_map["admin.hr@warpdrive.com"],
                "subject": "Corporate medical health insurance e-card download issue",
                "desc": "Unable to generate cashless TPA card for my dependent spouse on the insurance portal due to missing policy endorsement number.",
                "cat": "Benefits & Insurance",
                "prio": "Medium",
                "conf": 0.94,
                "status": "Completed",
                "created_delta": 96,
                "res_note": "TPA insurer updated backend member registry. Download link verified and sent to employee."
            },

            # Accounts
            {
                "code": "WD-2026-1010",
                "emp": sarah,
                "dept": "Accounts",
                "admin": user_map["admin.accounts@warpdrive.com"],
                "subject": "Discrepancy in salary slip: 3 days pay deducted incorrectly",
                "desc": "My October payslip reflects 3 days loss-of-pay deduction, however my sick leaves were pre-approved by my manager in HRMS.",
                "cat": "Payroll & Compensation",
                "prio": "Urgent",
                "conf": 0.97,
                "status": "In Progress",
                "created_delta": 30,
                "res_note": None
            },
            {
                "code": "WD-2026-1011",
                "emp": john,
                "dept": "Accounts",
                "admin": user_map["admin.accounts@warpdrive.com"],
                "subject": "Reimbursement for customer on-site travel to Chicago pending",
                "desc": "Submitted expense claim EXP-2026-883 over two weeks ago with all receipts. Status still shows 'Under Review'.",
                "cat": "Expense Reimbursements",
                "prio": "Medium",
                "conf": 0.93,
                "status": "Pending",
                "created_delta": 36,
                "res_note": None
            },
            {
                "code": "WD-2026-1012",
                "emp": sarah,
                "dept": "Accounts",
                "admin": user_map["admin.accounts@warpdrive.com"],
                "subject": "Form 16 Part B tax computation statement request",
                "desc": "Need stamped digital copy of Form 16 Part B for mortgage pre-approval application.",
                "cat": "Tax & Form 16",
                "prio": "Low",
                "conf": 0.95,
                "status": "Completed",
                "created_delta": 120,
                "res_note": "Generated and digitally signed Form 16 Part B uploaded to employee tax vault."
            },

            # Maintenance
            {
                "code": "WD-2026-1013",
                "emp": sarah,
                "dept": "Maintenance",
                "admin": user_map["admin.maint@warpdrive.com"],
                "subject": "Conference room Apollo AC unit blowing hot air",
                "desc": "Thermostat in Room Apollo is reading 82°F despite being set to 68°F. Important client presentation scheduled at 3 PM today.",
                "cat": "HVAC & Temperature",
                "prio": "Urgent",
                "conf": 0.98,
                "status": "In Progress",
                "created_delta": 3,
                "res_note": None
            },
            {
                "code": "WD-2026-1014",
                "emp": john,
                "dept": "Maintenance",
                "admin": user_map["admin.maint@warpdrive.com"],
                "subject": "Water leaking from 4th floor pantry sink pipe",
                "desc": "A continuous trickle of water is pooling under the cabinet beneath the main pantry sink on the 4th floor.",
                "cat": "Plumbing & Restrooms",
                "prio": "High",
                "conf": 0.96,
                "status": "Pending",
                "created_delta": 6,
                "res_note": None
            },
            {
                "code": "WD-2026-1015",
                "emp": sarah,
                "dept": "Maintenance",
                "admin": user_map["admin.maint@warpdrive.com"],
                "subject": "Fluorescent lights flickering violently above workstation pod 4",
                "desc": "Two overhead ballast fixtures in pod 4 are strobing rapidly, causing severe glare and eye fatigue for team members.",
                "cat": "Electrical & Lighting",
                "prio": "Medium",
                "conf": 0.94,
                "status": "Completed",
                "created_delta": 80,
                "res_note": "Replaced bad electronic ballast and installed two new LED tube lamps. Tested flick-free."
            }
        ]

        for item in sample_tickets:
            t = db.query(Ticket).filter(Ticket.ticket_code == item["code"]).first()
            created_time = now - timedelta(hours=item["created_delta"])
            updated_time = now - timedelta(hours=max(0, item["created_delta"] - 2))

            if not t:
                # Create conversation
                conv = Conversation(
                    user_id=item["emp"].id,
                    title=item["subject"],
                    status="completed" if item["status"] == "Completed" else "active",
                    created_at=created_time,
                    updated_at=updated_time
                )
                db.add(conv)
                db.commit()
                db.refresh(conv)

                # Add conversation messages
                msg_user = ConversationMessage(
                    conversation_id=conv.id,
                    sender="user",
                    content=item["desc"],
                    created_at=created_time
                )
                db.add(msg_user)

                msg_asst = ConversationMessage(
                    conversation_id=conv.id,
                    sender="assistant",
                    content=f"I have classified your request under {item['dept']} with {round(item['conf']*100, 1)}% confidence. Ready to generate ticket.",
                    created_at=created_time + timedelta(seconds=25)
                )
                db.add(msg_asst)

                # Create Ticket
                t = Ticket(
                    ticket_code=item["code"],
                    employee_id=item["emp"].id,
                    employee_name=item["emp"].full_name,
                    employee_email=item["emp"].email,
                    department=item["dept"],
                    subject=item["subject"],
                    description=item["desc"],
                    category=item["cat"],
                    priority=item["prio"],
                    ml_predicted_department=item["dept"],
                    ml_confidence=item["conf"],
                    status=item["status"],
                    assigned_admin_id=item["admin"].id if item["status"] in ["In Progress", "Completed"] else None,
                    resolution_notes=item["res_note"],
                    conversation_id=conv.id,
                    created_at=created_time,
                    updated_at=updated_time
                )
                db.add(t)
                db.commit()
                db.refresh(t)

                # Add status history
                h1 = TicketStatusHistory(
                    ticket_id=t.id,
                    old_status="None",
                    new_status="Pending",
                    changed_by_id=item["emp"].id,
                    changed_by_name=item["emp"].full_name,
                    notes="Ticket submitted via WarpDrive AI Assistant",
                    created_at=created_time
                )
                db.add(h1)

                if item["status"] in ["In Progress", "Completed"]:
                    h2 = TicketStatusHistory(
                        ticket_id=t.id,
                        old_status="Pending",
                        new_status="In Progress",
                        changed_by_id=item["admin"].id,
                        changed_by_name=item["admin"].full_name,
                        notes="Domain admin accepted ticket into queue",
                        created_at=created_time + timedelta(hours=1)
                    )
                    db.add(h2)

                if item["status"] == "Completed":
                    h3 = TicketStatusHistory(
                        ticket_id=t.id,
                        old_status="In Progress",
                        new_status="Completed",
                        changed_by_id=item["admin"].id,
                        changed_by_name=item["admin"].full_name,
                        notes=item["res_note"] or "Issue resolved",
                        created_at=updated_time
                    )
                    db.add(h3)

                # Add Internal Note
                if item["status"] in ["In Progress", "Completed"]:
                    note = InternalNote(
                        ticket_id=t.id,
                        author_id=item["admin"].id,
                        author_name=item["admin"].full_name,
                        note=f"Assigned technician investigating ticket {t.ticket_code}. Initial verification complete.",
                        created_at=created_time + timedelta(minutes=45)
                    )
                    db.add(note)

                # Audit log
                audit = AuditLog(
                    action="DEMO_TICKET_SEEDED",
                    entity_type="ticket",
                    entity_id=str(t.id),
                    user_id=item["emp"].id,
                    user_email=item["emp"].email,
                    details=f"Demo ticket {t.ticket_code} ({t.status}) seeded in {t.department}",
                    created_at=created_time
                )
                db.add(audit)
                db.commit()

        print(f"[Seed] Successfully seeded {len(sample_tickets)} demo tickets with histories and notes!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
