# QueueLess

QueueLess is a demonstration hospital directory and care-navigation app. It lets people search for a department, compare nearby listed hospitals, and view estimated queues.

> **Notice:** QueueLess is not a medical service. It does not diagnose, assess emergencies, book appointments, or report live availability. Hospital, clinician, fee, phone, and emergency-service details are unverified demonstration data. Queue estimates and rankings are synthetic. For a medical emergency in India, call **108** or **112**; do not wait for this app.

## Run on Windows

Requirements: **Python 3.11 or newer**, **Node.js 20.19+ or 22.12+**, and npm.

From the project directory, run:

```powershell
.\scripts\run.ps1
```

If PowerShell blocks the script, allow scripts for the current terminal and run it again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\run.ps1
```

The launcher creates `backend\venv` if needed, installs the runtime dependencies, prepares the SQLite demonstration database, and starts the API and web app. Press **Ctrl+C** in that terminal to stop both services. The database is stored at `backend\queueless.db`; it does not require PostgreSQL.

- Web app: <http://127.0.0.1:5173>
- API documentation: <http://127.0.0.1:8000/docs>
- API health: <http://127.0.0.1:8000/api/health>

The launcher uses ports **8000** and **5173**. If either port is already in use, stop the other service before running the launcher.

## Screenshots

The screenshots show the hospital search and comparison pages. All facilities and estimates are demonstration data.

### Find care

![QueueLess Find Care page with location selection, symptom search, emergency call links, and specialty cards](docs/screenshots/find-care.png)

### Search results

![QueueLess search results with wait, distance, and consultation-fee comparisons](docs/screenshots/search-results.png)

## Sign in

Create an account with your name, email address, and a password of at least eight characters. You can also select **Continue with demo account** to sign in as **QueueLess Demo** without a password. The signed-in name appears in the workspace and public navigation.

Passwords are stored as salted scrypt hashes. The browser keeps the session token in session storage, and the API session expires after seven days. Signing out revokes the session. The demo account is shared. Do not enter medical or other sensitive information.

This is basic sign-in for a local demonstration, not production identity management. It does not include email verification, password recovery, or account roles.

## Run the services separately

In one PowerShell terminal:

```powershell
Set-Location backend
$env:DATABASE_URL = "sqlite:///./queueless.db"
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

In another terminal:

```powershell
Set-Location frontend
npm run dev
```

The launcher is preferred for first-time setup because it also checks requirements and prepares the database.

## Main user flow

1. Search for a supported symptom or browse the hospital directory.
2. Select an approximate search area, or grant permission to use device location.
3. Compare nearby listed facilities by estimated queue, straight-line distance, and fee range.
4. Open a hospital profile to review listed departments and an hourly queue estimate.
5. Use the emergency page for contact guidance. Emergency-service listings are unverified.

The seed data contains 28 directory entries, including 12 synthetic QueueLess care centres. Queue estimates use this simplified calculation:

```text
estimated wait = 5-minute intake buffer + ceil(60 × queue size / assumed hourly service capacity)
```

The queue calculation uses a synthetic daily demand curve, facility and department factors, and assumed service capacity. It does not use staffing levels, hospital history, or live queue data.

Search phrases are matched to departments using keyword rules. Unmatched phrases use General Medicine. These rules do not provide a diagnosis or determine whether care is urgent.

## Validation

Run these commands from the project directory:

```powershell
npm --prefix frontend run build
npm --prefix frontend run lint
Set-Location backend
.\venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\venv\Scripts\python.exe -m pytest tests -v
```

## Project structure

```text
backend/       FastAPI API, SQLAlchemy models, database seeder, and tests
frontend/      React and TypeScript application
docs/          Architecture, design, testing notes, and screenshots
scripts/       Windows PowerShell launcher
```

The seeder can be run again to add missing sample records. It does not delete existing data. The launcher selects the local SQLite database.

Keep `backend/.env`, `backend/queueless.db`, virtual environments, and build output out of commits. Use placeholder values in `.env.example`; do not store credentials there.

## Stack and design

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, and Lucide
- **API:** FastAPI, Pydantic, and SQLAlchemy
- **Database:** SQLite by default; `DATABASE_URL` can select another SQLAlchemy-supported database
- **Interface:** Light theme across public pages and the workspace

## Limitations

QueueLess is for demonstration use only, not for patient care or public deployment. Before deployment, it would need verified hospital data, maintained availability and queue integrations, reviewed emergency guidance, stronger account management, database migrations, monitoring, privacy controls, and security testing. Do not enter personal health information.
