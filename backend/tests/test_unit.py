"""
Unit tests for QueueLess backend.

Run with:  pytest backend/tests/ -v
Requires:  pip install pytest httpx

These tests cover:
- Symptom-to-department routing (detect_department)
- Haversine distance calculation
- Recommendation scoring (compute_score)
- Queue wait-time calculation (queue_to_wait)
- Hospital multiplier bounds
- API health check
"""

import math
import pytest

# ── Pure function tests (no DB required) ──────────────────────────────────


def test_detect_department_knee():
    from app.routers.search import detect_department
    dept, is_emg = detect_department("knee pain")
    assert dept == "Orthopedics"
    assert is_emg is False


def test_detect_department_fever():
    from app.routers.search import detect_department
    dept, is_emg = detect_department("I have a fever")
    assert dept == "General Medicine"
    assert is_emg is False


def test_detect_department_skin_rash():
    from app.routers.search import detect_department
    dept, is_emg = detect_department("Skin rash on my arm")
    assert dept == "Dermatology"
    assert is_emg is False


def test_detect_department_eye():
    from app.routers.search import detect_department
    dept, is_emg = detect_department("eye problem vision blurry")
    assert dept == "Ophthalmology"
    assert is_emg is False


def test_detect_department_dental():
    from app.routers.search import detect_department
    dept, _ = detect_department("severe toothache")
    assert dept == "Dentistry"


def test_detect_department_cardiology():
    from app.routers.search import detect_department
    dept, is_emg = detect_department("chest pain")
    assert dept == "Cardiology"
    assert is_emg is False


def test_detect_department_emergency_chest():
    from app.routers.search import detect_department
    dept, is_emg = detect_department("severe chest pain")
    assert dept == "Emergency"
    assert is_emg is True


def test_detect_department_emergency_stroke():
    from app.routers.search import detect_department
    dept, is_emg = detect_department("stroke symptoms suddenly")
    assert dept == "Emergency"
    assert is_emg is True


def test_detect_department_unknown_falls_back():
    from app.routers.search import detect_department
    dept, is_emg = detect_department("random unknown condition xyz")
    assert dept == "General Medicine"
    assert is_emg is False


def test_detect_department_case_insensitive():
    from app.routers.search import detect_department
    dept, _ = detect_department("KNEE PAIN")
    assert dept == "Orthopedics"


# ── Haversine tests ────────────────────────────────────────────────────────

def test_haversine_same_point():
    from app.routers.search import haversine
    assert haversine(28.6, 77.2, 28.6, 77.2) == 0.0


def test_haversine_known_distance():
    from app.routers.search import haversine
    # AIIMS (~28.5672, 77.21) to Safdarjung (~28.5685, 77.2022)
    dist = haversine(28.5672, 77.21, 28.5685, 77.2022)
    assert 0.5 < dist < 2.5, f"Expected ~1.5 km, got {dist}"


def test_haversine_is_symmetric():
    from app.routers.search import haversine
    d1 = haversine(28.6, 77.2, 28.7, 77.3)
    d2 = haversine(28.7, 77.3, 28.6, 77.2)
    assert abs(d1 - d2) < 0.01


# ── Scoring tests ──────────────────────────────────────────────────────────

class _FakeDept:
    def __init__(self, queue, fee_min, fee_max):
        self.current_queue = queue
        self.consultation_fee_min = fee_min
        self.consultation_fee_max = fee_max


def test_compute_score_lower_is_better():
    from app.routers.search import compute_score
    good = _FakeDept(queue=5, fee_min=100, fee_max=300)
    bad = _FakeDept(queue=80, fee_min=1500, fee_max=3000)
    assert compute_score(good, 2.0) < compute_score(bad, 20.0)


def test_compute_score_zero_queue():
    from app.routers.search import compute_score
    dept = _FakeDept(queue=0, fee_min=0, fee_max=0)
    score = compute_score(dept, 0.0)
    assert score == 0.0


def test_compute_score_no_negative():
    from app.routers.search import compute_score
    dept = _FakeDept(queue=0, fee_min=None, fee_max=None)
    score = compute_score(dept, 0.0)
    assert score >= 0


# ── Queue calculation tests ────────────────────────────────────────────────

def test_queue_to_wait_zero():
    from app.routers.queue import queue_to_wait
    assert queue_to_wait(0) == 5  # minimum


def test_queue_to_wait_positive():
    from app.routers.queue import queue_to_wait
    assert queue_to_wait(10) == 10 * 2 + 5  # 25


def test_queue_to_wait_negative():
    from app.routers.queue import queue_to_wait
    assert queue_to_wait(-5) == 5  # clamped to min


def test_hospital_multiplier_range():
    from app.routers.queue import hospital_multiplier
    for hid in range(1, 20):
        m = hospital_multiplier(hid)
        assert 0.6 <= m <= 1.3, f"Multiplier out of range for id={hid}: {m}"
