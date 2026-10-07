from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String(20))
    emergency_available = Column(Boolean, default=False)
    image_url = Column(String(500))
    facilities = Column(JSON)  # list of facility strings
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    departments = relationship("Department", back_populates="hospital")
    doctors = relationship("Doctor", back_populates="hospital")
    queue_records = relationship("QueueRecord", back_populates="hospital")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    name = Column(String(100), nullable=False)
    specialty = Column(String(100))
    consultation_fee_min = Column(Integer)
    consultation_fee_max = Column(Integer)
    current_queue = Column(Integer, default=0)
    available = Column(Boolean, default=True)

    hospital = relationship("Hospital", back_populates="departments")
    doctors = relationship("Doctor", back_populates="department")


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    name = Column(String(100), nullable=False)
    qualification = Column(String(200))
    experience_years = Column(Integer)
    available_today = Column(Boolean, default=True)

    hospital = relationship("Hospital", back_populates="doctors")
    department = relationship("Department", back_populates="doctors")


class QueueRecord(Base):
    __tablename__ = "queue_records"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    department_name = Column(String(100), nullable=False)
    hour = Column(Integer, nullable=False)  # 0-23
    day_of_week = Column(Integer, nullable=False)  # 0=Mon, 6=Sun
    avg_queue_size = Column(Integer, nullable=False)
    avg_wait_minutes = Column(Integer, nullable=False)

    hospital = relationship("Hospital", back_populates="queue_records")


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    eligible_departments = Column(JSON)  # list of department names
    coverage_amount = Column(Integer)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
