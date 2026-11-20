# WarpDrive Intelligent Service Desk

Enterprise-grade AI-assisted service management platform built for **WarpDrive Tech Works**. Integrates real-time machine learning ticket classification, conversational issue diagnosis with explicit confirmation, strict role-based access control (RBAC), and multi-domain departmental workflow automation.

---

## Architecture Overview

```mermaid
flowchart TD
    subgraph Client["Frontend (React + Vite + TypeScript)"]
        UI["Tailwind CSS SaaS UI"]
        Chat["AI Assistant Chat Interface"]
        EmpPortal["Employee Portal"]
        DomAdminPortal["Domain Admin Portal (IT, Tech, HR, Accounts, Maint)"]
        OrgAdminPortal["Org Admin Global Dashboard (Monitor Only)"]
    end

    subgraph API["Backend (FastAPI + Python 3.12)"]
        Router["FastAPI REST Routers (/api)"]
        AuthMiddleware["JWT Authentication & RBAC Enforcer"]
        MLService["Scikit-Learn ML Prediction Service"]
        ChatService["AI Dialog Manager + Gemini REST Integration"]
        AuditService["Compliance Audit Logger"]
    end

    subgraph MLPipeline["Machine Learning Layer"]
        Dataset["600 Synthetic Enterprise Samples"]
        Vectorizer["TF-IDF N-Gram Vectorizer"]
        Classifier["Logistic Regression (97.5% Accuracy)"]
    end

    subgraph DataLayer["Persistence Layer"]
        NeonDB[("PostgreSQL (Neon) / SQLite (Dev)")]
        Alembic["Alembic Migrations"]
        Tables["Users | Tickets | Conversations | StatusHistory | AuditLogs"]
    end

    UI --> Router
    Router --> AuthMiddleware
    AuthMiddleware --> Router
    Router --> ChatService
    Router --> MLService
    Router --> AuditService

    ChatService --> MLService
    MLService --> Classifier
    Classifier --> Vectorizer
    Vectorizer --> Dataset

    Router --> NeonDB
    AuditService --> Tables
```

---

## Key Features

### 1. Conversational AI Ticket Drafting
- Heading: **"How can we assist you today?"**
- Natural language issue diagnosis with Google Gemini API backend integration and reliable deterministic fallback.
- Clarification questioning when issues are too brief.
- Generates a **Ticket Confirmation Card** with title, description, predicted department, confidence score, category, and priority.
- Explicit employee confirmation required before ticket generation.

### 2. Verified Machine Learning Routing
- Trained on 600 realistic enterprise tickets across 5 departments (120 per class).
- TF-IDF Vectorizer with unigram/bigram tokenization + Logistic Regression classifier.
- **97.5% Holdout Test Accuracy**, **97.5% Macro F1-Score**.
- Low-confidence handling asks clarifying questions or requests employee verification.
- Model performance inspector in Organization Admin portal with confusion matrix.

### 3. Strict 3-Tier Role-Based Access Control (RBAC)
- **Employee**: Can submit tickets via chat, view own tickets, and track status. Forbidden from accessing other employees' tickets.
- **Domain Administrator**: Assigned strictly to one of 5 departments (*IT Support, Technical, HR, Accounts, Maintenance*). Can only access and manage tickets for their authorized department.
- **Organization Administrator**: Global supervisory visibility across all departments, ticket trends, workload analysis, and audit logs. Strictly monitor-only: forbidden from modifying domain ticket statuses.

### 4. Ticket Lifecycle & Auditing
- Status lifecycle: `Pending` → `In Progress` → `Completed` → `Reopened`.
- Comprehensive status history tracking with timestamps, user identities, and resolution notes.
- System-wide immutable audit trail for governance and compliance.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, TypeScript 5, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyJWT, bcrypt |
| **Database** | PostgreSQL hosted on Neon (with local SQLite fallback) |
| **Database Migrations** | Alembic |
| **Machine Learning** | Scikit-learn, TF-IDF, Logistic Regression, Joblib |
| **Conversational AI** | Google Gemini API (`google-genai`) with fallback logic |
| **Deployment** | Vercel (Frontend SPA), Render (FastAPI Web Service) |

---

## Project Structure

```text
WarpDrive-Service-Desk/
├── backend/
│   ├── alembic/                  # Database migrations
│   ├── app/
│   │   ├── api/                  # FastAPI router endpoints
│   │   │   ├── admin.py          # Domain & Org Admin endpoints
│   │   │   ├── auth.py           # Login, profile, employee registration
│   │   │   ├── chat.py           # Conversational AI assistant
│   │   │   ├── deps.py           # JWT decoding & RBAC permission checks
│   │   │   ├── health.py         # Health checks (/api/health)
│   │   │   ├── ml.py             # ML inference & metrics endpoints
│   │   │   └── tickets.py        # Ticket CRUD & status workflows
│   │   ├── core/
│   │   │   ├── config.py         # Settings & environment variables
│   │   │   ├── database.py       # SQLAlchemy engine & session factory
│   │   │   └── security.py       # bcrypt hashing & JWT token management
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── services/             # ML, Chat, and Audit business logic
│   │   └── main.py               # FastAPI application entrypoint
│   ├── ml/
│   │   ├── artifacts/            # model.joblib, vectorizer.joblib, metrics.json
│   │   ├── dataset.csv           # 600 synthetic training examples
│   │   ├── dataset_generator.py  # Synthetic data generation script
│   │   └── train.py              # ML training and evaluation script
│   ├── tests/                    # Backend pytest test suite
│   ├── seed.py                   # Safe development seed script
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Reusable UI (Navbar, Sidebar, Badge, Button, Modal, Card)
│   │   │   ├── domain_admin/     # Department dashboard & ticket queue
│   │   │   ├── employee/         # Employee dashboard, AI chat, My tickets
│   │   │   ├── landing/          # Modern SaaS landing page with 1-click demo access
│   │   │   └── org_admin/        # Global dashboard, workload analytics, audit logs, ML inspector
│   │   ├── context/              # AuthContext, ThemeContext, ToastContext
│   │   ├── services/             # Typed API client
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── App.tsx               # Root application router
│   │   └── main.tsx              # App bootstrap
│   ├── package.json              # Frontend npm dependencies
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── vite.config.ts            # Vite bundler & reverse proxy setup
│   └── .env.example              # Frontend environment template
├── render.yaml                   # Render deployment configuration
├── vercel.json                   # Vercel SPA routing configuration
├── .gitignore
└── README.md
```

---

## Demo Credentials (Development Only)

All demo accounts can be launched with **one click** from the Landing Page or using the credentials below:

| Role | Department | Email | Password |
|---|---|---|---|
| **Employee** | Engineering | `employee@warpdrive.com` | `EmployeePass123!` |
| **Employee** | Operations | `john.doe@warpdrive.com` | `EmployeePass123!` |
| **Domain Admin** | IT Support | `admin.it@warpdrive.com` | `AdminPass123!` |
| **Domain Admin** | Technical | `admin.tech@warpdrive.com` | `AdminPass123!` |
| **Domain Admin** | HR | `admin.hr@warpdrive.com` | `AdminPass123!` |
| **Domain Admin** | Accounts | `admin.accounts@warpdrive.com` | `AdminPass123!` |
| **Domain Admin** | Maintenance | `admin.maint@warpdrive.com` | `AdminPass123!` |
| **Org Admin** | Executive | `org.admin@warpdrive.com` | `OrgAdminPass123!` |

---

## Machine Learning Model Evaluation

The classifier was trained on 600 stratified samples and evaluated on a holdout test split (20% = 120 samples):

- **Accuracy**: 97.50%
- **Macro Precision**: 97.53%
- **Macro Recall**: 97.50%
- **Macro F1-Score**: 97.50%
- **Weighted F1-Score**: 97.50%

### Classification Report (Holdout Test Set)

| Department | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **Accounts** | 0.96 | 1.00 | 0.98 | 24 |
| **HR** | 0.96 | 0.96 | 0.96 | 24 |
| **IT Support** | 0.96 | 0.96 | 0.96 | 24 |
| **Maintenance** | 1.00 | 1.00 | 1.00 | 24 |
| **Technical** | 1.00 | 0.96 | 0.98 | 24 |
| **Overall** | **0.98** | **0.97** | **0.97** | **120** |

---

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Git

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Re-train ML model if desired
python ml/train.py

# Seed database with demo accounts and tickets
python seed.py

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be available at `http://127.0.0.1:8000` with Swagger documentation at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

### Backend (`backend/.env`)
```ini
ENVIRONMENT=development
DATABASE_URL=postgresql://user:pass@ep-cool.neon.tech/warpdrive?sslmode=require
JWT_SECRET=your-secure-jwt-secret-key-at-least-32-characters
GEMINI_API_KEY=your_gemini_api_key_optional
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```ini
# Leave blank for local development (uses Vite proxy)
# In production, set to your Render backend API URL:
VITE_API_URL=https://warpdrive-service-desk-backend.onrender.com/api
```

---

## Running Automated Tests

Run backend integration and security test suite:
```bash
python -m pytest backend/tests/test_service_desk.py -v
```

Tests verify:
- Valid and invalid JWT authentication
- Strict employee ticket isolation
- Strict domain administrator department boundaries
- Organization administrator global visibility and status update prohibition
- Real-time ML prediction and evaluation metrics
- System health and database connectivity endpoints

Validate frontend TypeScript and bundle build:
```bash
cd frontend
npm run build
```

---

## Deployment Guide

### Backend: Render Deployment

You can deploy on Render using either **Blueprint (`render.yaml`)** or **Manual Web Service**:

#### Method A: Using Blueprint (`render.yaml` - Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com) > **Blueprints** > **New Blueprint Instance**.
2. Connect `sriharan45/warpdrive-service-desk`.
3. Render reads `render.yaml` automatically with `rootDir: backend`, build command `pip install -r requirements.txt && python seed.py`, and start command `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

#### Method B: Manual Web Service
1. In Render Dashboard, click **New +** > **Web Service**.
2. Connect `sriharan45/warpdrive-service-desk`.
3. Configure the settings:
   - **Language**: Python 3
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && python seed.py`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/health`
4. Set Environment Variables in Render:
   - `PYTHONPATH`: `.`
   - `ENVIRONMENT`: `production`
   - `DATABASE_URL`: Your Neon PostgreSQL connection string (`postgresql://...`)
   - `JWT_SECRET`: Random 64-character secret
   - `GEMINI_API_KEY`: Google Gemini API key (optional)
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://warpdrive-service-desk.vercel.app`)

### Frontend: Vercel
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Root Directory: `frontend`
3. Framework Preset: **Vite**
4. Set Environment Variable:
   - `VITE_API_URL`: `https://<your-render-backend-url>/api`
5. Deploy. SPA routing is automatically handled via `frontend/vercel.json`.

---

## Git Push to Private Repository

To push this complete codebase to `sriharan45/warpdrive-service-desk`:

```bash
git init
git add .
git commit -m "feat: complete full-stack WarpDrive Intelligent Service Desk with ML classification and multi-domain RBAC"
git branch -M main
git remote add origin https://github.com/sriharan45/warpdrive-service-desk.git
git push -u origin main
```
