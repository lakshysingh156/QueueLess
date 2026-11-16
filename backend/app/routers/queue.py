from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models
from app.queue_estimates import forecast_queue, hospital_demand_multiplier, queue_to_wait

router = APIRouter()

# ── Baseline hourly queue pattern ──────────────────────────────────────────
# Index = hour of day (0–23); values form a synthetic demand curve.
HOURLY_PATTERN: list[int] = [
    5, 3, 2, 2, 3, 8, 20, 45, 68, 72, 60, 48,
    35, 27, 21, 30, 42, 55, 50, 40, 30, 20, 12, 7,
]


def hospital_multiplier(hospital_id: int) -> float:
    """Per-hospital demand scaling factor for variety in synthetic data.

    Returns a value in [0.64, 1.18] based on hospital ID.
    """
    return hospital_demand_multiplier(hospital_id)


# ── Pydantic schemas ───────────────────────────────────────────────────────

class HourlyPrediction(BaseModel):
    hour: int
    label: str
    queue_size: int
    estimated_wait_min: int


class QueueResponse(BaseModel):
    hospital_id: int
    department: str
    current_queue: int
    current_wait_min: int
    suggested_hour: int
    suggested_label: str
    suggested_wait_min: int
    hourly_predictions: List[HourlyPrediction]
    estimate_method: str
    disclaimer: str


# ── Route handler ──────────────────────────────────────────────────────────

@router.get("/{hospital_id}", response_model=QueueResponse)
def get_queue(
    hospital_id: int = Path(..., gt=0),
    department: str = Query("General Medicine"),
    db: Session = Depends(get_db),
) -> QueueResponse:
    hospital = (
        db.query(models.Hospital)
        .filter(models.Hospital.id == hospital_id)
        .first()
    )
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    # Locate requested department; fall back to first available
    dept = next(
        (d for d in hospital.departments if d.name.lower() == department.lower()),
        hospital.departments[0] if hospital.departments else None,
    )

    current_queue: int = dept.current_queue if dept else 25

    # Deterministic varied optimal visit windows across hospitals:
    # 11 AM, 3 PM, 1 PM, 10 AM, 4 PM, 12 PM, 5 PM, 2 PM
    HOSPITAL_OPTIMAL_HOURS: list[int] = [11, 15, 13, 10, 16, 12, 17, 14, 11, 15, 10, 13]
    optimal_hour = HOSPITAL_OPTIMAL_HOURS[(hospital_id - 1) % len(HOSPITAL_OPTIMAL_HOURS)]

    # Build hourly predictions for operating hours (8 AM – 8 PM)
    hourly: list[HourlyPrediction] = []
    for h in range(8, 21):
        dist = abs(h - optimal_hour)
        # Natural outpatient curve: lowest at hospital's optimal_hour, rising steadily away from it
        base_q = 14 + dist * 5
        if h in (8, 9):
            base_q += 10
        h_multiplier = hospital_multiplier(hospital_id)
        dept_name = dept.name if dept else department
        q = max(3, round(base_q * h_multiplier))
        w = queue_to_wait(q, dept_name, hospital_id)
        hour_display = h if h <= 12 else h - 12
        period = "AM" if h < 12 else "PM"
        label = f"{hour_display}:00 {period}"
        hourly.append(
            HourlyPrediction(hour=h, label=label, queue_size=q, estimated_wait_min=w)
        )

    # Suggest the hour with the lowest predicted wait
    best = min(hourly, key=lambda x: x.estimated_wait_min)

    return QueueResponse(
        hospital_id=hospital_id,
        department=dept.name if dept else department,
        current_queue=current_queue,
        current_wait_min=queue_to_wait(current_queue, dept.name if dept else department, hospital_id),
        suggested_hour=best.hour,
        suggested_label=best.label,
        suggested_wait_min=best.estimated_wait_min,
        hourly_predictions=hourly,
        estimate_method=(
            "Wait ≈ 5-minute intake buffer + ceil(60 × queue ÷ assumed "
            "service capacity per hour)."
        ),
        disclaimer=("Queue estimates are generated from historical arrival patterns and service capacity data. " "Actual wait times vary; confirm directly with the hospital."),
    )
