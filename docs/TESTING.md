# QueueLess verification

## One-command local run

From the repository root in PowerShell:

```powershell
.\scripts\run.ps1
```

The script checks Python/Node versions, creates the backend virtual environment if needed, installs missing dependencies, seeds the local SQLite demonstration database, and starts the backend and Vite frontend. It reports when both services respond and cleans up its server processes on Ctrl+C. See the root [README](../README.md) for requirements and URLs.

## Automated checks

```powershell
npm --prefix frontend run build
npm --prefix frontend run lint
Set-Location backend
.\venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\venv\Scripts\python.exe -m pytest tests -v
```

The backend tests cover symptom routing, emergency-phrase handling, coordinate distance and local-radius filtering, wait-estimate consistency, department-specific service capacity, unavailable departments, ranking, and hourly queue calculations.

## Manual end-to-end smoke test

1. Start the project with `.\scripts\run.ps1`.
2. Visit `/` and confirm the hospital preview and forecast load from the local API.
3. Use **Hospitals** to filter by a city, specialty, or emergency-service flag; open a hospital profile.
4. Search **knee pain**, select a result, and confirm the search and profile show the same workload-based wait estimate and model explanation.
5. Search **Difficulty breathing** and confirm the result page provides direct call links and an emergency-routing notice.
6. Open a hospital profile and verify the hourly queue curve, current estimate, and suggested lowest-estimate hour are visible and explicitly labelled synthetic.
7. Open the directory and confirm the added QueueLess Demo Care Centre entries are labelled as demo data and can be filtered.
8. Open `/login`, submit the form, and verify it explicitly says no account is created and no credentials are sent.
9. Test the menu at a narrow viewport and confirm the directory, symptom search, and emergency pages remain reachable.

## Scope not yet validated

- Automated browser/end-to-end tests across browsers and devices
- Accessibility audit with assistive technology
- Production deployment, migration, authentication, and security testing
- Validation against real hospitals: the dataset and queue model are demonstration-only
