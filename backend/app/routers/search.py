import math
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models

router = APIRouter()

# ── Rule-based symptom → department mapping ────────────────────────────────
# Ordered longest-phrase-first to avoid partial matches swallowing longer ones.
SYMPTOM_MAP: list[tuple[str, str]] = [
    # Emergency (checked separately via EMERGENCY_KEYWORDS but included for completeness)
    ("severe chest pain", "Emergency"),
    ("heart attack", "Emergency"),
    ("breathing difficulty", "Emergency"),
    ("severe bleeding", "Emergency"),
    # Orthopedics
    ("knee pain", "Orthopedics"),
    ("joint pain", "Orthopedics"),
    ("knee", "Orthopedics"),
    ("bone", "Orthopedics"),
    ("joint", "Orthopedics"),
    ("fracture", "Orthopedics"),
    ("back pain", "Orthopedics"),
    # Dermatology
    ("skin rash", "Dermatology"),
    ("rash", "Dermatology"),
    ("acne", "Dermatology"),
    ("eczema", "Dermatology"),
    ("psoriasis", "Dermatology"),
    ("skin", "Dermatology"),
    # Cardiology
    ("chest pain", "Cardiology"),
    ("chest", "Cardiology"),
    ("heart", "Cardiology"),
    ("cardiac", "Cardiology"),
    ("palpitation", "Cardiology"),
    # Ophthalmology
    ("eye problem", "Ophthalmology"),
    ("eye pain", "Ophthalmology"),
    ("vision", "Ophthalmology"),
    ("eye", "Ophthalmology"),
    # Dentistry
    ("dental pain", "Dentistry"),
    ("toothache", "Dentistry"),
    ("tooth", "Dentistry"),
    ("teeth", "Dentistry"),
    ("dental", "Dentistry"),
    ("gum", "Dentistry"),
    # General Medicine (fallback department also)
    ("fever", "General Medicine"),
    ("cold", "General Medicine"),
    ("flu", "General Medicine"),
    ("cough", "General Medicine"),
    ("headache", "General Medicine"),
    ("fatigue", "General Medicine"),
    ("vomiting", "General Medicine"),
    ("diarrhea", "General Medicine"),
    ("nausea", "General Medicine"),
]

EMERGENCY_KEYWORDS: frozenset[str] = frozenset({
    "severe chest pain", "heart attack", "unconscious", "stroke",
    "accident", "breathing difficulty", "severe bleeding", "seizure",
    "emergency", "not responding", "collapsed",
})


def detect_department(symptom: str) -> tuple[str, bool]:
    """Return (department_name, is_emergency).

    Priority order:
    1. Emergency keyword match
    2. Longest-first symptom phrase match
    3. Fallback to General Medicine
    """
    lower = symptom.lower().strip()

    # 1. Emergency check
    for kw in EMERGENCY_KEYWORDS:
        if kw in lower:
            return "Emergency", True

    # 2. Phrase match (longest first, list is ordered)
    for phrase, dept in SYMPTOM_MAP:
        if phrase in lower:
            return dept, False

    # 3. Fallback
    return "General Medicine", False


# ── Haversine distance ─────────────────────────────────────────────────────

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return great-circle distance in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


# ── Recommendation scoring ─────────────────────────────────────────────────

def compute_score(dept: models.Department, distance_km: float) -> float:
    """Lower score = better ranking.

    Weights: 40% wait, 30% distance, 30% cost.
    All components normalised 0–100 before weighting.
    """
    # Wait: 2 min/person, cap at 120 min
    wait_min = dept.current_queue * 2
    wait_score = min(wait_min / 120.0, 1.0) * 100.0

    # Distance: cap at 50 km
    distance_score = min(distance_km / 50.0, 1.0) * 100.0

    # Cost: average of min/max, cap at ₹3000
    fee_min = dept.consultation_fee_min or 0
    fee_max = dept.consultation_fee_max or 0
    avg_fee = (fee_min + fee_max) / 2.0  # fixed: was (0 + fee_max or 0) due to precedence
    cost_score = min(avg_fee / 3000.0, 1.0) * 100.0

    return (0.4 * wait_score) + (0.3 * distance_score) + (0.3 * cost_score)


# ── Human-readable explanation ─────────────────────────────────────────────

def build_explanation(dept_name: str, distance_km: float, wait_min: int, rank: int) -> str:
    prefix = "Best overall match" if rank == 1 else "Good match"

    if distance_km < 5:
        dist_part = "very close"
    elif distance_km < 15:
        dist_part = "moderate distance"
    else:
        dist_part = "further away"

    if wait_min < 20:
        wait_part = "short estimated wait"
    elif wait_min < 45:
        wait_part = "moderate estimated wait"
    else:
        wait_part = "longer estimated wait"

    return f"{prefix} for {dept_name}. {dist_part.capitalize()}, {wait_part}."


# ── Pydantic schemas ───────────────────────────────────────────────────────

class SearchResult(BaseModel):
    hospital_id: int
    hospital_name: str
    department: str
    distance_km: float
    estimated_wait_min: int
    consultation_fee_min: Optional[int]
    consultation_fee_max: Optional[int]
    available: bool
    emergency_available: bool
    score: float
    rank: int
    explanation: str
    city: str
    address: str
    latitude: float
    longitude: float
    current_queue: int


class SearchResponse(BaseModel):
    symptom: str
    routed_department: str
    is_emergency: bool
    results: List[SearchResult]


# ── Route handler ──────────────────────────────────────────────────────────

@router.get("/", response_model=SearchResponse)
def search(
    symptom: str = Query(..., min_length=1, description="User symptom or condition"),
    lat: float = Query(28.6139, ge=-90, le=90, description="User latitude"),
    lon: float = Query(77.2090, ge=-180, le=180, description="User longitude"),
    db: Session = Depends(get_db),
) -> SearchResponse:
    dept_name, is_emergency = detect_department(symptom)

    hospitals = db.query(models.Hospital).all()

    raw: list[dict] = []
    for hospital in hospitals:
        # Locate matching department
        dept = next(
            (d for d in hospital.departments if d.name.lower() == dept_name.lower()),
            None,
        )

        if is_emergency:
            if not hospital.emergency_available:
                continue
            # Use the emergency dept if available, otherwise first dept
            dept = dept or next((d for d in hospital.departments if d.name == "Emergency"), None)
            dept = dept or (hospital.departments[0] if hospital.departments else None)
        else:
            if not dept:
                continue

        if dept is None:
            continue

        distance = haversine(lat, lon, hospital.latitude, hospital.longitude)
        wait_min = dept.current_queue * 2
        score = compute_score(dept, distance)

        raw.append({
            "hospital_id": hospital.id,
            "hospital_name": hospital.name,
            "department": dept.name,
            "distance_km": distance,
            "estimated_wait_min": wait_min,
            "consultation_fee_min": dept.consultation_fee_min,
            "consultation_fee_max": dept.consultation_fee_max,
            "available": dept.available,
            "emergency_available": hospital.emergency_available,
            "score": score,
            "rank": 0,
            "explanation": "",
            "city": hospital.city,
            "address": hospital.address,
            "latitude": hospital.latitude,
            "longitude": hospital.longitude,
            "current_queue": dept.current_queue,
        })

    raw.sort(key=lambda x: x["score"])

    for i, r in enumerate(raw):
        r["rank"] = i + 1
        r["explanation"] = build_explanation(
            r["department"],
            r["distance_km"],
            r["estimated_wait_min"],
            r["rank"],
        )

    return SearchResponse(
        symptom=symptom,
        routed_department=dept_name,
        is_emergency=is_emergency,
        results=[SearchResult(**r) for r in raw],
    )
