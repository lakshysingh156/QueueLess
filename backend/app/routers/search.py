import math
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models

router = APIRouter()

# Rule-based symptom → department mapping
SYMPTOM_MAP = {
    "knee pain": "Orthopedics",
    "knee": "Orthopedics",
    "bone": "Orthopedics",
    "joint": "Orthopedics",
    "fracture": "Orthopedics",
    "skin rash": "Dermatology",
    "rash": "Dermatology",
    "acne": "Dermatology",
    "eczema": "Dermatology",
    "skin": "Dermatology",
    "fever": "General Medicine",
    "cold": "General Medicine",
    "flu": "General Medicine",
    "cough": "General Medicine",
    "headache": "General Medicine",
    "fatigue": "General Medicine",
    "eye": "Ophthalmology",
    "vision": "Ophthalmology",
    "eye problem": "Ophthalmology",
    "dental": "Dentistry",
    "tooth": "Dentistry",
    "teeth": "Dentistry",
    "toothache": "Dentistry",
    "dental pain": "Dentistry",
    "chest pain": "Cardiology",
    "chest": "Cardiology",
    "heart": "Cardiology",
    "cardiac": "Cardiology",
    "severe chest pain": "Emergency",
    "breathing": "Emergency",
    "unconscious": "Emergency",
    "stroke": "Emergency",
    "accident": "Emergency",
}

EMERGENCY_KEYWORDS = {
    "severe chest pain", "heart attack", "unconscious", "stroke", "accident",
    "breathing difficulty", "severe bleeding", "seizure", "emergency"
}


def detect_department(symptom: str) -> tuple[str, bool]:
    """Returns (department_name, is_emergency)"""
    lower = symptom.lower().strip()
    for kw in EMERGENCY_KEYWORDS:
        if kw in lower:
            return "Emergency", True
    for kw, dept in SYMPTOM_MAP.items():
        if kw in lower:
            return dept, dept == "Emergency"
    return "General Medicine", False


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def compute_score(dept: models.Department, distance_km: float) -> float:
    """Lower score = better rank. Weighted formula."""
    wait = dept.current_queue * 2  # 2 min per person approx
    cost = (dept.consultation_fee_min or 0 + dept.consultation_fee_max or 0) / 2
    # Normalise cost to 0-100 scale (max ₹2000)
    cost_score = min(cost / 2000, 1) * 100
    distance_score = min(distance_km / 50, 1) * 100
    wait_score = min(wait / 120, 1) * 100
    return (0.3 * distance_score) + (0.4 * wait_score) + (0.3 * cost_score)


def explain(dept_name: str, distance_km: float, wait_min: int, cost_min: int, rank: int) -> str:
    parts = []
    if rank == 1:
        parts.append(f"Best overall match for {dept_name}")
    else:
        parts.append(f"Good match for {dept_name}")
    if distance_km < 5:
        parts.append("very close by")
    elif distance_km < 15:
        parts.append("moderate distance")
    else:
        parts.append("further away")
    if wait_min < 20:
        parts.append("with a short estimated wait")
    elif wait_min < 45:
        parts.append("with a moderate estimated wait")
    else:
        parts.append("with a longer estimated wait")
    return " — ".join(parts[:1]) + " (" + ", ".join(parts[1:]) + ")."


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


@router.get("/", response_model=SearchResponse)
def search(
    symptom: str = Query(..., description="User symptom input"),
    lat: float = Query(28.6139, description="User latitude"),
    lon: float = Query(77.2090, description="User longitude"),
    db: Session = Depends(get_db),
):
    dept_name, is_emergency = detect_department(symptom)

    hospitals = db.query(models.Hospital).all()

    results = []
    for hospital in hospitals:
        # Find matching department
        dept = next(
            (d for d in hospital.departments if d.name.lower() == dept_name.lower()),
            None,
        )
        if is_emergency:
            if not hospital.emergency_available:
                continue
            dept = dept or next((d for d in hospital.departments), None)
        else:
            if not dept:
                continue

        distance = haversine(lat, lon, hospital.latitude, hospital.longitude)
        wait = dept.current_queue * 2 if dept else 0
        score = compute_score(dept, distance) if dept else 999

        results.append(
            {
                "hospital_id": hospital.id,
                "hospital_name": hospital.name,
                "department": dept.name if dept else dept_name,
                "distance_km": distance,
                "estimated_wait_min": wait,
                "consultation_fee_min": dept.consultation_fee_min if dept else None,
                "consultation_fee_max": dept.consultation_fee_max if dept else None,
                "available": dept.available if dept else False,
                "emergency_available": hospital.emergency_available,
                "score": score,
                "rank": 0,
                "explanation": "",
                "city": hospital.city,
                "address": hospital.address,
                "latitude": hospital.latitude,
                "longitude": hospital.longitude,
                "current_queue": dept.current_queue if dept else 0,
            }
        )

    results.sort(key=lambda x: x["score"])
    for i, r in enumerate(results):
        r["rank"] = i + 1
        r["explanation"] = explain(
            r["department"], r["distance_km"], r["estimated_wait_min"],
            r["consultation_fee_min"] or 0, r["rank"]
        )

    return SearchResponse(
        symptom=symptom,
        routed_department=dept_name,
        is_emergency=is_emergency,
        results=[SearchResult(**r) for r in results],
    )
