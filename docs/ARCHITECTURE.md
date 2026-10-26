# Architecture — QueueLess

## System Overview

```
Browser (React SPA)
       │
       │  HTTP (Vite proxy → localhost:8000)
       ▼
FastAPI Application (Python)
       │
       │  SQLAlchemy ORM
       ▼
PostgreSQL Database
```

QueueLess is a three-tier web application. The frontend is a React single-page application served by Vite's dev server. In production it would be built to static files and served by a web server (e.g. Nginx). The backend is a FastAPI application. The database is PostgreSQL accessed via SQLAlchemy.

---

## Frontend

**Framework:** React 18 + TypeScript + Vite
**Styling:** Tailwind CSS v4 + inline styles for the dark hero
**Routing:** React Router v6 (client-side)
**HTTP:** Fetch API via `src/api.ts`

### Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `Home.tsx` | Landing page with cinematic dark hero, 3D wireframe terrain canvas, and Fernand-style interactive preview |
| `/search` | `SearchPage.tsx` | Free-text symptom input + department directory |
| `/results` | `Results.tsx` | Ranked hospital list with sort/filter and explainable scores |
| `/hospital/:id` | `HospitalDetail.tsx` | Full hospital profile with hourly queue chart |
| `/emergency` | `Emergency.tsx` | Emergency care mode with 108/112 call buttons |
| `/login` | `Login.tsx` | Sign in / sign up (demonstration UI with transparent academic disclaimer) |

### Data flow

```
User types symptom
  → Selects an approximate supported area or explicitly shares device location
  → GET /api/search/?symptom=...&lat=...&lon=...
  → SearchResponse { routed_department, is_emergency, results[] }
  → Results page renders ranked HospitalCard components
  → User clicks card → GET /api/hospitals/:id + GET /api/queue/:id
  → HospitalDetail renders queue section with hourly bars
```

The selected coordinates are kept in React Router history state rather than the URL and are sent to the search API only when a search is run. Manual area choices use approximate city-centre coordinates. The current hospital dataset covers Delhi-NCR, Chandigarh, and Patiala. Search results are limited to 50 km from the selected location, and distances are straight-line estimates rather than road routes. The database seeder adds missing demo entries by hospital name and does not delete existing records.

---

## Backend

**Framework:** FastAPI + Pydantic v2
**ORM:** SQLAlchemy 2 (declarative)
**Configuration:** pydantic-settings reading from `.env`

### Routers

| Module | Prefix | Responsibility |
|--------|--------|----------------|
| `hospitals.py` | `/api/hospitals` | CRUD read for hospitals and detail |
| `search.py` | `/api/search` | Symptom routing + recommendation ranking |
| `queue.py` | `/api/queue` | Queue estimates + hourly predictions |

### Recommendation Algorithm

```
Score = 0.4 × wait_score + 0.3 × distance_score + 0.3 × cost_score

where:
  wait_score     = min(queue * 2 / 120, 1) × 100
  distance_score = min(distance_km / 50, 1) × 100
  cost_score     = min(avg_fee / 3000, 1) × 100

Lower score = better rank.
```

### Queue Estimation

```
wait_min = max(5, queue_size × 2 + 5)

Hourly queue = HOURLY_PATTERN[hour] × hospital_multiplier(id)
hospital_multiplier(id) = 0.64 + (id % 10) × 0.06  ∈ [0.64, 1.18]
```

---

## Database Schema

### Entity Relationship

```
Hospital (1) ──── (N) Department
Hospital (1) ──── (N) Doctor
Hospital (1) ──── (N) QueueRecord
Department (1) ─── (N) Doctor
Scheme (standalone lookup)
User (standalone — auth prototype)
```

### Tables

**hospitals** — id, name, address, city, latitude, longitude, phone, emergency_available, facilities (JSON), image_url

**departments** — id, hospital_id (FK), name, specialty, consultation_fee_min, consultation_fee_max, current_queue, available

**doctors** — id, hospital_id (FK), department_id (FK), name, qualification, experience_years, available_today

**queue_records** — id, hospital_id (FK), department_name, hour, day_of_week, avg_queue_size, avg_wait_minutes (synthetic historical data)

**schemes** — id, name, description, eligible_departments (JSON), coverage_amount

**users** — id, email (unique), name, hashed_password, created_at

---

## CORS

Backend allows requests from `http://localhost:5173` and `http://127.0.0.1:5173`. In production, update `allow_origins` in `app/main.py` to match the deployed frontend URL.

---

## Security Considerations

- Authentication UI exists but is prototype-only (no real session or token)
- No secrets are committed; `.env` is gitignored
- `DATABASE_URL` is loaded at runtime from environment
- No admin or write endpoints are exposed publicly
