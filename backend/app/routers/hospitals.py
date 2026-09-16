from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models

router = APIRouter()


class DepartmentOut(BaseModel):
    id: int
    name: str
    specialty: Optional[str]
    consultation_fee_min: Optional[int]
    consultation_fee_max: Optional[int]
    current_queue: int
    available: bool

    class Config:
        from_attributes = True


class DoctorOut(BaseModel):
    id: int
    name: str
    qualification: Optional[str]
    experience_years: Optional[int]
    available_today: bool

    class Config:
        from_attributes = True


class HospitalListItem(BaseModel):
    id: int
    name: str
    address: str
    city: str
    latitude: float
    longitude: float
    emergency_available: bool
    departments: List[DepartmentOut]

    class Config:
        from_attributes = True


class HospitalDetail(HospitalListItem):
    phone: Optional[str]
    facilities: Optional[list]
    doctors: List[DoctorOut]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[HospitalListItem])
def list_hospitals(db: Session = Depends(get_db)):
    hospitals = db.query(models.Hospital).all()
    return hospitals


@router.get("/{hospital_id}", response_model=HospitalDetail)
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital
