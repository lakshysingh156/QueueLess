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


@pytest.mark.parametrize(
    "symptom",
    ["Difficulty breathing", "Severe bleeding or trauma", "Head injury with confusion"],
)
def test_emergency_page_conditions_route_to_emergency(symptom):
    from app.routers.search import detect_department

    department, is_emergency = detect_department(symptom)
    assert department == "Emergency"
    assert is_emergency is True


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


def test_haversine_antipodal_points_are_finite():
    from app.routers.search import haversine

    distance = haversine(0, 0, 0, 180)
    assert math.isfinite(distance)
    assert 20_000 < distance < 20_100


# ── Scoring tests ──────────────────────────────────────────────────────────

class _FakeDept:
    def __init__(self, queue, fee_min, fee_max, available=True):
        self.name = "Orthopedics"
        self.current_queue = queue
        self.consultation_fee_min = fee_min
        self.consultation_fee_max = fee_max
        self.available = available


class _FakeQuery:
    def __init__(self, rows):
        self.rows = rows

    def all(self):
        return self.rows


class _FakeSearchDB:
    def __init__(self, hospitals):
        self.hospitals = hospitals

    def query(self, _model):
        return _FakeQuery(self.hospitals)


def test_compute_score_lower_is_better():
    from app.routers.search import compute_score
    good = _FakeDept(queue=5, fee_min=100, fee_max=300)
    bad = _FakeDept(queue=80, fee_min=1500, fee_max=3000)
    assert compute_score(good, 2.0) < compute_score(bad, 20.0)


def test_compute_score_zero_queue():
    from app.routers.search import compute_score
    dept = _FakeDept(queue=0, fee_min=0, fee_max=0)
    score = compute_score(dept, 0.0)
    assert score == pytest.approx((5 / 120) * 40)


def test_compute_score_no_negative():
    from app.routers.search import compute_score
    dept = _FakeDept(queue=0, fee_min=None, fee_max=None)
    score = compute_score(dept, 0.0)
    assert score == pytest.approx(15 + (5 / 120) * 40)


def test_search_only_returns_hospitals_within_local_radius():
    from types import SimpleNamespace
    from app.routers.search import MAX_SEARCH_DISTANCE_KM, search

    hospitals = [
        SimpleNamespace(
            id=1,
            name="Chandigarh Hospital",
            address="Sector 12",
            city="Chandigarh",
            latitude=30.7649,
            longitude=76.7753,
            emergency_available=True,
            departments=[_FakeDept(queue=20, fee_min=None, fee_max=None)],
        ),
        SimpleNamespace(
            id=2,
            name="Delhi Hospital",
            address="New Delhi",
            city="New Delhi",
            latitude=28.5672,
            longitude=77.2100,
            emergency_available=True,
            departments=[_FakeDept(queue=20, fee_min=None, fee_max=None)],
        ),
    ]

    response = search(
        symptom="knee pain",
        lat=30.7333,
        lon=76.7794,
        db=_FakeSearchDB(hospitals),
    )

    assert [item.hospital_name for item in response.results] == ["Chandigarh Hospital"]
    assert response.results[0].distance_km <= MAX_SEARCH_DISTANCE_KM


def test_search_wait_matches_the_shared_estimate():
    from types import SimpleNamespace
    from app.queue_estimates import queue_to_wait
    from app.routers.search import search

    department = _FakeDept(queue=20, fee_min=100, fee_max=300)
    hospital = SimpleNamespace(
        id=1,
        name="Nearby Hospital",
        address="Central area",
        city="New Delhi",
        latitude=28.6139,
        longitude=77.209,
        emergency_available=False,
        departments=[department],
    )
    response = search(
        symptom="knee pain",
        lat=28.6139,
        lon=77.209,
        db=_FakeSearchDB([hospital]),
    )

    assert response.results[0].estimated_wait_min == queue_to_wait(
        department.current_queue,
        department.name,
        hospital.id,
    )


def test_search_excludes_unavailable_department():
    from types import SimpleNamespace
    from app.routers.search import search

    hospital = SimpleNamespace(
        id=1,
        name="Nearby Hospital",
        address="Central area",
        city="New Delhi",
        latitude=28.6139,
        longitude=77.209,
        emergency_available=False,
        departments=[_FakeDept(queue=10, fee_min=100, fee_max=300, available=False)],
    )
    response = search(
        symptom="knee pain",
        lat=28.6139,
        lon=77.209,
        db=_FakeSearchDB([hospital]),
    )

    assert response.results == []


# ── Queue calculation tests ────────────────────────────────────────────────

def test_queue_to_wait_zero():
    from app.routers.queue import queue_to_wait
    assert queue_to_wait(0) == 5  # minimum


def test_queue_to_wait_positive():
    from app.routers.queue import queue_to_wait
    assert queue_to_wait(10, "General Medicine", 1) == 27


def test_queue_to_wait_negative():
    from app.routers.queue import queue_to_wait
    assert queue_to_wait(-5) == 5  # clamped to min


def test_queue_wait_accounts_for_department_capacity():
    from app.queue_estimates import queue_to_wait

    assert queue_to_wait(20, "Cardiology", 1) > queue_to_wait(20, "General Medicine", 1)


def test_queue_wait_is_deterministic_for_hospital_capacity():
    from app.queue_estimates import queue_to_wait

    estimate = queue_to_wait(20, "Orthopedics", 8)
    assert estimate == queue_to_wait(20, "Orthopedics", 8)
    assert estimate >= 5


def test_forecast_queue_scales_by_department_and_hospital():
    from app.queue_estimates import forecast_queue

    baseline = [0, 0, 0, 0, 0, 0, 0, 0, 60]
    general_queue = forecast_queue(8, "General Medicine", 1, baseline)
    dental_queue = forecast_queue(8, "Dentistry", 1, baseline)
    assert general_queue > dental_queue > 0


def test_forecast_queue_rejects_out_of_range_hours():
    from app.queue_estimates import forecast_queue

    with pytest.raises(ValueError):
        forecast_queue(10, "General Medicine", 1, [0, 0, 0])


def test_hospital_multiplier_range():
    from app.routers.queue import hospital_multiplier
    for hid in range(1, 20):
        m = hospital_multiplier(hid)
        assert 0.6 <= m <= 1.3, f"Multiplier out of range for id={hid}: {m}"
