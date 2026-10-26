# QueueLess — Healthcare Navigation

QueueLess is an intelligent healthcare navigation platform that assists patients in deciding **where to go** and **when to arrive** for non-emergency and emergency conditions. It routes presenting symptoms to medical departments, calculates travel distance, evaluates estimated queue wait times and consultation fees, and projects hourly queue demand across operating hours.

---

## Key Capabilities

- **Symptom-to-Department Routing**: Deterministic rule-based engine mapping natural symptom descriptions (knee pain, fever, chest pain, rash, eye discomfort, toothache) to medical departments.
- **Explainable Recommendation Scoring**: Deterministic multi-criteria scoring algorithm weighting wait time (40%), physical distance (30%), and consultation cost (30%).
- **Hourly Queue Predictions**: 13-hour forecast window (8:00 AM to 8:00 PM) scaled per hospital, with automated identification of the lowest-wait arrival slot.
- **Emergency Priority Workflow**: Dedicated safety mode with one-tap dialing for **108** (Ambulance) and **112** (National Emergency), filtering for 24/7 accredited emergency trauma centers.
- **Clinical Profiles**: Comprehensive hospital detail pages displaying departments, consulting fee ranges, physician credentials, facility accreditations, and coverage under Indian healthcare schemes (Ayushman Bharat PM-JAY, ESI, Delhi Arogya Kosh).
- **Fernand-Inspired Craft & Aesthetics**: Clean, calm, high-contrast healthcare design system built with Tailwind CSS, custom design tokens, and a procedural 3D wireframe terrain canvas. Zero emojis, zero artificial decoration, and zero unsupported diagnostic claims.

---

## Technology Stack

| Tier | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4, React Router v6, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2 |
| **Database** | PostgreSQL (or SQLite local fallback supported via SQLAlchemy ORM) |
| **Design System** | Custom tokens in `src/index.css`, Inter typography, accessible focus states |

---

## Project Structure

```
QueueLess/
├── frontend/
│   ├── src/
│   │   ├── components/     Navbar, Footer, TerrainCanvas
│   │   ├── pages/          Home, SearchPage, Results, HospitalDetail, Emergency, Login
│   │   ├── api.ts          Typed fetch client with error handling
│   │   ├── types.ts        TypeScript interfaces matching FastAPI schemas
│   │   └── index.css       Fernand-inspired design system tokens
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py         FastAPI application & CORS middleware
│   │   ├── models.py       SQLAlchemy ORM models
│   │   ├── database.py     Engine and SessionLocal factory
│   │   ├── config.py       Environment settings via pydantic-settings
│   │   └── routers/
│   │       ├── hospitals.py  Hospital listing & detail endpoints
│   │       ├── search.py     Symptom routing & recommendation scoring
│   │       └── queue.py      Hourly queue prediction & lowest-wait calculation
│   ├── tests/
│   │   └── test_unit.py    Pytest suite (20 unit tests, 100% pass)
│   ├── seed.py             Database seeder (12 Delhi-NCR hospitals)
│   └── requirements.txt
└── docs/
    ├── ARCHITECTURE.md     System architecture, data flows, and ER diagrams
    ├── DESIGN_SYSTEM.md    Fernand-inspired visual principles and tokens
    ├── DECISIONS.md        Architectural Decision Records (ADRs)
    └── TESTING.md          Verification guide & reproducible test commands
```

---

## Running the Application Locally (Windows)

### Terminal 1: Backend API

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed demonstration database (12 Delhi-NCR hospitals)
python seed.py

# Start FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive Swagger Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### Terminal 2: Frontend Web Client

```powershell
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```

- Web Client: `http://localhost:5173`

---

## Reproducible Testing & Verification

### Run Backend Unit Tests

```powershell
cd backend
.\venv\Scripts\pytest tests/ -v
```

Expected result: **20 passed** covering symptom routing, great-circle haversine calculation, weighted scoring logic, queue conversion, and multiplier bounds.

### Run Frontend Production Build

```powershell
cd frontend
npm run build
```

Expected result: **Built in ~1s with 0 errors**.

---

## Verified Primary User Journeys

1. **Standard Care Discovery**:
   `Home Search / Chips ("knee pain")` &rarr; `Routing to Orthopedics` &rarr; `Ranked Results (AIIMS, Safdarjung, Max)` &rarr; `Hospital Detail Profile` &rarr; `Queue & Hourly Prediction Inspection` &rarr; `Best Visit Hour Identified`

2. **Emergency Trauma Journey**:
   `Emergency Priority Banner / Nav` &rarr; `Direct Call Guidance (108 / 112)` &rarr; `Filtered 24/7 Emergency Hospitals` &rarr; `Immediate Trauma Center Coordinates`

---

## Academic Scope & Limitations Disclosure

- **Simulated Queue Data**: Real-time hospital queue APIs are not publicly accessible in India. Queue counts and wait times are generated using synthetic baseline demand patterns scaled per facility. This is explicitly disclosed across all user-facing views.
- **Non-Diagnostic Notice**: QueueLess provides routing and directional guidance only. It does not perform clinical diagnosis or replace medical practitioners.
- **Authentication**: Registration and sign-in interfaces demonstrate the user journey; server-side JWT issuance and password hashing are identified as future production milestones.
