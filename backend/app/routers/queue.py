from typing import List
from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models

router = APIRouter()

# Realistic hourly queue pattern (index = hour 0-23)
HOURLY_PATTERN = [
    5, 3, 2, 2, 3, 8, 20, 45, 68, 72, 60, 48,
    35, 27, 21, 30, 42, 55, 50, 40, 30, 20, 12, 7
]


def queue_to_wait(queue_size: int) -> int:
    """Convert queue size to estimated wait minutes using 2 min/person + 5 min base."""
    return max(5, queue_size * 2 + 5)


def predict_wait(hospital_multiplier: float, hour: int) -> int:
    base = HOURLY_PATTERN[hour % 24]
    adjusted = int(base * hospital_multiplier)
    return queue_to_wait(adjusted)


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


@router.get("/{hospital_id}", response_model=QueueResponse)
def get_queue(
    hospital_id: int = Path(...),
    department: str = Query("General Medicine"),
    db: Session = Depends(get_db),
):
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not hospital:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Hospital not found")

    dept = next(
        (d for d in hospital.departments if d.name.lower() == department.lower()),
        hospital.departments[0] if hospital.departments else None,
    )

    current_queue = dept.current_queue if dept else 25
    # Hospital multiplier based on id for variety
    multiplier = 0.7 + (hospital_id % 10) * 0.06

    import datetime
    current_hour = datetime.datetime.now().hour

    hourly = []
    for h in range(8, 21):  # 8 AM to 8 PM
        q = int(HOURLY_PATTERN[h] * multiplier)
        w = queue_to_wait(q)
        label = f"{h if h <= 12 else h - 12}:00 {'AM' if h < 12 else 'PM'}"
        hourly.append(HourlyPrediction(hour=h, label=label, queue_size=q, estimated_wait_min=w))

    # Suggest time with lowest wait
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
        disclaimer="Estimated wait times are based on simulated demo data and historical patterns. Not real hospital data.",
    )
