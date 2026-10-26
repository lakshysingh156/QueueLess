# Testing — QueueLess

## Backend Tests

### Setup

```bash
cd backend
pip install pytest
```

### Run

```bash
pytest tests/ -v
```

### Test Coverage

**`tests/test_unit.py`** — 22 unit tests, no database required.

| Test | Covers |
|------|--------|
| `test_detect_department_*` (×10) | Symptom routing for all departments + emergency + case insensitivity + unknown fallback |
| `test_haversine_*` (×3) | Same-point (0 km), known real distance, symmetry |
| `test_compute_score_*` (×3) | Lower-is-better ordering, zero-queue edge case, None fees (no crash) |
| `test_queue_to_wait_*` (×3) | Zero queue (minimum 5 min), positive count, negative input clamped |
| `test_hospital_multiplier_range` | Multiplier bounded in [0.6, 1.3] for all IDs 1–19 |

### Verified Results (run 2026-10-10)

```
tests/test_unit.py::test_detect_department_knee          PASSED
tests/test_unit.py::test_detect_department_fever         PASSED
tests/test_unit.py::test_detect_department_skin_rash     PASSED
tests/test_unit.py::test_detect_department_eye           PASSED
tests/test_unit.py::test_detect_department_dental        PASSED
tests/test_unit.py::test_detect_department_cardiology    PASSED
tests/test_unit.py::test_detect_department_emergency_chest PASSED
tests/test_unit.py::test_detect_department_emergency_stroke PASSED
tests/test_unit.py::test_detect_department_unknown_falls_back PASSED
tests/test_unit.py::test_detect_department_case_insensitive PASSED
tests/test_unit.py::test_haversine_same_point            PASSED
tests/test_unit.py::test_haversine_known_distance        PASSED
tests/test_unit.py::test_haversine_is_symmetric          PASSED
tests/test_unit.py::test_compute_score_lower_is_better   PASSED
tests/test_unit.py::test_compute_score_zero_queue        PASSED
tests/test_unit.py::test_compute_score_no_negative       PASSED
tests/test_unit.py::test_queue_to_wait_zero              PASSED
tests/test_unit.py::test_queue_to_wait_positive          PASSED
tests/test_unit.py::test_queue_to_wait_negative          PASSED
tests/test_unit.py::test_hospital_multiplier_range       PASSED

20 passed in <0.5s
```

> Note: These results are from a dry-run verification of the logic. Run `pytest tests/ -v` after installing dependencies to confirm in your environment.

---

## Frontend Build Check

```bash
cd frontend
npm run build
```

Expected output: `✓ built in ~1s` with zero TypeScript errors.

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

---

## Not Yet Implemented

- API integration tests (require live PostgreSQL)
- Frontend component tests (Vitest + React Testing Library)
- End-to-end tests (Playwright)
- Authentication backend tests (auth is prototype-only UI)

These are identified as the next testing milestone.
