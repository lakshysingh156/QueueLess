import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models

router = APIRouter()

# ── Baseline hourly queue pattern ──────────────────────────────────────────
# Index = hour of day (0–23). Values represent average queue depth
# observed in the synthetic dataset for a mid-week day.
HOURLY_PATTERN: list[int] = [
    5, 3, 2, 2, 3, 8, 20, 45, 68, 72, 60, 48,
    35, 27, 21, 30, 42, 55, 50, 40, 30, 20, 12, 7,
]


def queue_to_wait(queue_size: int) -> int:
    """Convert queue depth to estimated wait time in minutes.

    Formula: base_time + 2 min per person.
    Minimum 5 min (administrative overhead).
    """
    if queue_size <= 0:
        return 5
    return max(5, queue_size * 2 + 5)


def hospital_multiplier(hospital_id: int) -> float:
    """Per-hospital demand scaling factor for variety in synthetic data.

    Returns a value in [0.64, 1.18] based on hospital ID.
    """
    return round(0.64 + (hospital_id % 10) * 0.06, 2)


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
    multiplier: float = hospital_multiplier(hospital_id)

    # Build hourly predictions for operating hours (8 AM – 8 PM)
    hourly: list[HourlyPrediction] = []
    for h in range(8, 21):
        q = int(HOURLY_PATTERN[h] * multiplier)
        w = queue_to_wait(q)
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
        current_wait_min=queue_to_wait(current_queue),
        suggested_hour=best.hour,
        suggested_label=best.label,
        suggested_wait_min=best.estimated_wait_min,
        hourly_predictions=hourly,
        disclaimer=(
            "Wait times are estimated from a synthetic hourly demand baseline "
            "scaled per hospital. This is not real-time hospital data."
        ),
    )
