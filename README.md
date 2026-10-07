# QueueLess — Healthcare Navigation Prototype

> B.Tech Software Engineering Project

QueueLess helps patients decide **where to go for healthcare and when to go**, by comparing hospitals across department availability, estimated wait time, distance, and cost.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, React Router, Lucide Icons |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL |

---

## Project Structure

```
QueueLess/
├── frontend/          # React + Vite frontend
│   └── src/
│       ├── pages/     # Home, Search, Results, HospitalDetail, Emergency, Login
│       ├── components/ # Navbar, Footer
│       ├── api.ts     # API client
│       └── types.ts   # TypeScript types
└── backend/           # FastAPI backend
    ├── app/
    │   ├── main.py    # FastAPI app
    │   ├── models.py  # SQLAlchemy models
    │   ├── database.py
    │   ├── config.py
    │   └── routers/   # hospitals, search, queue
    ├── seed.py        # Database seeder (12 hospitals)
    └── requirements.txt
```

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Edit DATABASE_URL
python seed.py               # Seed 12 hospitals
uvicorn app.main:app --reload
```

API available at: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: `http://localhost:5173`

---

## Demo Flow

### Normal flow
Home → Enter "knee pain" → Orthopedics → Hospital list → Sort by wait/distance/cost → Open hospital → View queue → Hourly predictions → Suggested visit time

### Emergency flow
Emergency → Enter "severe chest pain" → Emergency hospitals ranked → Queue status → Alternative suggested

---

## Features (Step 1)

- ✅ Homepage with search, quick-select symptoms, emergency banner
- ✅ Symptom-to-department routing (rule-based)
- ✅ Hospital results with weighted recommendation score
- ✅ Sort by distance / wait time / cost
- ✅ Hospital detail page with departments, doctors, facilities
- ✅ Queue section with hourly wait-time predictions
- ✅ Suggested visit time (lowest predicted wait)
- ✅ Emergency mode with 108 call button
- ✅ Login/signup UI

---

## Data

All hospital data is **simulated demo data** seeded from `backend/seed.py`. Queue and wait times are not real hospital data.

> **Disclaimer:** QueueLess is a navigation prototype for a B.Tech project. It does not provide medical diagnosis. For a real medical emergency, contact emergency services (108/112) immediately.
