import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.main import app
from backend.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    seed_database()

@pytest.fixture
def client():
    return TestClient(app)

def login_user(client: TestClient, email: str, password: str = "AdminPass123!") -> dict:
    if "employee" in email or "john" in email:
        password = "EmployeePass123!"
    elif "org.admin" in email:
        password = "OrgAdminPass123!"

    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    data = resp.json()
    return {
        "headers": {"Authorization": f"Bearer {data['access_token']}"},
        "user": data["user"]
    }

# ----------------- 1. Authentication Tests -----------------
def test_auth_success_and_failure(client: TestClient):
    # Success
    resp = client.post("/api/auth/login", json={"email": "employee@warpdrive.com", "password": "EmployeePass123!"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()
    assert resp.json()["user"]["role"] == "employee"

    # Bad password
    resp = client.post("/api/auth/login", json={"email": "employee@warpdrive.com", "password": "WrongPassword"})
    assert resp.status_code == 401

    # Current user profile
    headers = {"Authorization": f"Bearer {resp.json().get('access_token', '')}"}
    # With valid token
    valid_login = login_user(client, "employee@warpdrive.com")
    me_resp = client.get("/api/auth/me", headers=valid_login["headers"])
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "employee@warpdrive.com"

# ----------------- 2. Employee Ticket Isolation Tests -----------------
def test_employee_ticket_isolation(client: TestClient):
    sarah_auth = login_user(client, "employee@warpdrive.com")
    john_auth = login_user(client, "john.doe@warpdrive.com")

    # Sarah creates a ticket
    create_resp = client.post(
        "/api/tickets",
        headers=sarah_auth["headers"],
        json={
            "subject": "Sarah Private Workstation Monitor Broken",
            "description": "My secondary Dell monitor is showing lines and no signal.",
            "category": "Hardware & Peripherals",
            "priority": "High"
        }
    )
    assert create_resp.status_code == 200
    ticket_id = create_resp.json()["id"]

    # Sarah can read her own ticket
    sarah_read = client.get(f"/api/tickets/{ticket_id}", headers=sarah_auth["headers"])
    assert sarah_read.status_code == 200
    assert sarah_read.json()["id"] == ticket_id

    # John CANNOT read Sarah's ticket -> must be 403 Forbidden
    john_read = client.get(f"/api/tickets/{ticket_id}", headers=john_auth["headers"])
    assert john_read.status_code == 403
    assert "Access denied" in john_read.json()["detail"]

    # Employee CANNOT call domain admin endpoints
    admin_call = client.get("/api/admin/domain/tickets", headers=sarah_auth["headers"])
    assert admin_call.status_code == 403

# ----------------- 3. Domain Administrator Isolation Tests -----------------
def test_domain_admin_department_isolation(client: TestClient):
    it_admin_auth = login_user(client, "admin.it@warpdrive.com")
    tech_admin_auth = login_user(client, "admin.tech@warpdrive.com")
    sarah_auth = login_user(client, "employee@warpdrive.com")

    # Create an IT Support ticket
    it_ticket_resp = client.post(
        "/api/tickets",
        headers=sarah_auth["headers"],
        json={
            "subject": "Office Wi-Fi Gateway Reset Needed",
            "description": "The 3rd floor Wi-Fi access point needs a reboot.",
            "department": "IT Support",
            "priority": "Medium"
        }
    )
    assert it_ticket_resp.status_code == 200
    it_ticket_id = it_ticket_resp.json()["id"]

    # IT Admin can view this IT ticket
    it_read = client.get(f"/api/tickets/{it_ticket_id}", headers=it_admin_auth["headers"])
    assert it_read.status_code == 200
    assert it_read.json()["department"] == "IT Support"

    # Technical Admin CANNOT view this IT Support ticket -> must be 403 Forbidden
    tech_read = client.get(f"/api/tickets/{it_ticket_id}", headers=tech_admin_auth["headers"])
    assert tech_read.status_code == 403
    assert "Domain administrators for 'Technical' cannot access tickets for 'IT Support'" in tech_read.json()["detail"]

    # Technical Admin CANNOT modify IT Support ticket status -> must be 403 Forbidden
    tech_update = client.post(
        f"/api/tickets/{it_ticket_id}/status",
        headers=tech_admin_auth["headers"],
        json={"status": "In Progress"}
    )
    assert tech_update.status_code == 403

    # IT Admin CAN update status: Pending -> In Progress
    it_update = client.post(
        f"/api/tickets/{it_ticket_id}/status",
        headers=it_admin_auth["headers"],
        json={"status": "In Progress"}
    )
    assert it_update.status_code == 200
    assert it_update.json()["status"] == "In Progress"

    # IT Admin can add internal notes
    note_resp = client.post(
        f"/api/tickets/{it_ticket_id}/notes",
        headers=it_admin_auth["headers"],
        json={"note": "Technician dispatched to check AP on ceiling."}
    )
    assert note_resp.status_code == 200
    assert note_resp.json()["author_name"] == "Alex Rivera"

    # IT Admin can mark ticket Completed with resolution notes
    comp_resp = client.post(
        f"/api/tickets/{it_ticket_id}/status",
        headers=it_admin_auth["headers"],
        json={
            "status": "Completed",
            "resolution_notes": "Access point power-cycled and firmware updated."
        }
    )
    assert comp_resp.status_code == 200
    assert comp_resp.json()["status"] == "Completed"
    assert "power-cycled" in comp_resp.json()["resolution_notes"]

# ----------------- 4. Organization Administrator Tests -----------------
def test_org_admin_permissions(client: TestClient):
    org_admin_auth = login_user(client, "org.admin@warpdrive.com")
    it_admin_auth = login_user(client, "admin.it@warpdrive.com")
    sarah_auth = login_user(client, "employee@warpdrive.com")

    # Create a ticket
    ticket_resp = client.post(
        "/api/tickets",
        headers=sarah_auth["headers"],
        json={
            "subject": "Restroom Door Lock Broken",
            "description": "2nd floor restroom door latch is completely stuck.",
            "department": "Maintenance",
            "priority": "High"
        }
    )
    ticket_id = ticket_resp.json()["id"]

    # Org Admin CAN view this ticket across departments
    org_read = client.get(f"/api/tickets/{ticket_id}", headers=org_admin_auth["headers"])
    assert org_read.status_code == 200
    assert org_read.json()["id"] == ticket_id

    # Org Admin CANNOT modify ticket status -> MUST BE 403 Forbidden (supervisor/monitor only)
    org_modify = client.post(
        f"/api/tickets/{ticket_id}/status",
        headers=org_admin_auth["headers"],
        json={"status": "Completed"}
    )
    assert org_modify.status_code == 403
    assert "Organization administrators have monitor/supervisor privileges only" in org_modify.json()["detail"]

    # Org Admin CAN view global metrics
    metrics_resp = client.get("/api/admin/org/metrics", headers=org_admin_auth["headers"])
    assert metrics_resp.status_code == 200
    assert "total_tickets" in metrics_resp.json()
    assert len(metrics_resp.json()["department_distribution"]) == 5

    # Org Admin CAN view audit logs
    audit_resp = client.get("/api/admin/org/audit-logs", headers=org_admin_auth["headers"])
    assert audit_resp.status_code == 200
    assert isinstance(audit_resp.json(), list)

# ----------------- 5. ML Prediction & Metrics Tests -----------------
def test_ml_endpoints(client: TestClient):
    sarah_auth = login_user(client, "employee@warpdrive.com")

    # Predict department
    pred_resp = client.post(
        "/api/ml/predict",
        headers=sarah_auth["headers"],
        json={"text": "Air conditioning unit is blowing hot air in the conference room"}
    )
    assert pred_resp.status_code == 200
    data = pred_resp.json()
    assert data["department"] == "Maintenance"
    assert data["confidence"] > 0.5
    assert len(data["ranked_departments"]) == 5

    # Get ML metrics
    metrics_resp = client.get("/api/ml/metrics", headers=sarah_auth["headers"])
    assert metrics_resp.status_code == 200
    metrics = metrics_resp.json()
    assert metrics["accuracy"] >= 0.90
    assert "Accounts" in metrics["classes"]
    assert "IT Support" in metrics["classes"]

# ----------------- 6. Health Check Tests -----------------
def test_health_endpoints(client: TestClient):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["database"] == "ok"
