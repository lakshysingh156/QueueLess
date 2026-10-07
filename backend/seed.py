"""
Seed the database with realistic hospital demo data.
Run from backend/ directory: python seed.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, SessionLocal
from app import models

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Clear existing data
db.query(models.QueueRecord).delete()
db.query(models.Doctor).delete()
db.query(models.Department).delete()
db.query(models.Hospital).delete()
db.query(models.Scheme).delete()
db.commit()

hospitals_data = [
    {
        "name": "All India Institute of Medical Sciences (AIIMS)",
        "address": "Ansari Nagar East, New Delhi",
        "city": "New Delhi",
        "latitude": 28.5672,
        "longitude": 77.2100,
        "phone": "+91-11-26588500",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "MRI", "CT Scan", "Pharmacy", "Ambulance", "X-Ray", "Laboratory"],
        "departments": [
            {"name": "General Medicine", "specialty": "Internal Medicine", "fee_min": 200, "fee_max": 500, "queue": 68},
            {"name": "Orthopedics", "specialty": "Bone & Joint", "fee_min": 300, "fee_max": 700, "queue": 42},
            {"name": "Cardiology", "specialty": "Heart & Vascular", "fee_min": 500, "fee_max": 1200, "queue": 55},
            {"name": "Dermatology", "specialty": "Skin & Hair", "fee_min": 200, "fee_max": 500, "queue": 30},
            {"name": "Ophthalmology", "specialty": "Eye Care", "fee_min": 200, "fee_max": 600, "queue": 25},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 500, "fee_max": 2000, "queue": 18},
        ],
        "doctors": [
            {"name": "Dr. Rajesh Sharma", "dept": "Orthopedics", "qual": "MBBS, MS Ortho, AIIMS", "exp": 18},
            {"name": "Dr. Priya Mehta", "dept": "Cardiology", "qual": "MBBS, MD, DM Cardiology", "exp": 22},
            {"name": "Dr. Ankit Gupta", "dept": "General Medicine", "qual": "MBBS, MD Internal Medicine", "exp": 12},
        ],
    },
    {
        "name": "Safdarjung Hospital",
        "address": "Ansari Nagar West, New Delhi",
        "city": "New Delhi",
        "latitude": 28.5685,
        "longitude": 77.2022,
        "phone": "+91-11-26165060",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "MRI", "CT Scan", "Pharmacy", "Ambulance"],
        "departments": [
            {"name": "General Medicine", "specialty": "Internal Medicine", "fee_min": 100, "fee_max": 300, "queue": 80},
            {"name": "Orthopedics", "specialty": "Bone & Joint", "fee_min": 150, "fee_max": 400, "queue": 55},
            {"name": "Dermatology", "specialty": "Skin & Hair", "fee_min": 100, "fee_max": 300, "queue": 40},
            {"name": "Ophthalmology", "specialty": "Eye Care", "fee_min": 100, "fee_max": 350, "queue": 35},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 200, "fee_max": 1500, "queue": 30},
        ],
        "doctors": [
            {"name": "Dr. Sunita Rao", "dept": "Orthopedics", "qual": "MBBS, MS Ortho", "exp": 14},
            {"name": "Dr. Vivek Sharma", "dept": "General Medicine", "qual": "MBBS, MD", "exp": 10},
        ],
    },
    {
        "name": "Fortis Hospital Vasant Kunj",
        "address": "Sector B, Pocket 1, Vasant Kunj, New Delhi",
        "city": "New Delhi",
        "latitude": 28.5236,
        "longitude": 77.1579,
        "phone": "+91-11-42776222",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "MRI", "CT Scan", "Pharmacy", "Ambulance", "Robotic Surgery", "Cath Lab"],
        "departments": [
            {"name": "Cardiology", "specialty": "Heart & Vascular", "fee_min": 800, "fee_max": 2000, "queue": 22},
            {"name": "Orthopedics", "specialty": "Bone & Joint", "fee_min": 700, "fee_max": 1800, "queue": 18},
            {"name": "General Medicine", "specialty": "Internal Medicine", "fee_min": 600, "fee_max": 1200, "queue": 15},
            {"name": "Dermatology", "specialty": "Skin & Hair", "fee_min": 500, "fee_max": 1000, "queue": 10},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 1000, "fee_max": 5000, "queue": 8},
        ],
        "doctors": [
            {"name": "Dr. Anil Kapoor", "dept": "Cardiology", "qual": "MBBS, MD, DM Cardiology, FACC", "exp": 25},
            {"name": "Dr. Meera Singh", "dept": "Orthopedics", "qual": "MBBS, MS Ortho, Fellowship Joint Replacement", "exp": 20},
        ],
    },
    {
        "name": "Apollo Hospital Sarita Vihar",
        "address": "Mathura Road, Sarita Vihar, New Delhi",
        "city": "New Delhi",
        "latitude": 28.5421,
        "longitude": 77.2865,
        "phone": "+91-11-71791090",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "MRI", "CT Scan", "Pharmacy", "Ambulance", "Proton Therapy", "Da Vinci Robot"],
        "departments": [
            {"name": "Cardiology", "specialty": "Heart & Vascular", "fee_min": 900, "fee_max": 2500, "queue": 20},
            {"name": "Orthopedics", "specialty": "Bone & Joint", "fee_min": 800, "fee_max": 2000, "queue": 15},
            {"name": "Ophthalmology", "specialty": "Eye Care", "fee_min": 600, "fee_max": 1500, "queue": 12},
            {"name": "Dermatology", "specialty": "Skin & Hair", "fee_min": 500, "fee_max": 1200, "queue": 8},
            {"name": "Dentistry", "specialty": "Dental & Oral Health", "fee_min": 500, "fee_max": 3000, "queue": 6},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 1500, "fee_max": 6000, "queue": 5},
        ],
        "doctors": [
            {"name": "Dr. Ravi Batra", "dept": "Cardiology", "qual": "MBBS, MD, DM, FESC", "exp": 30},
            {"name": "Dr. Neha Joshi", "dept": "Ophthalmology", "qual": "MBBS, MS Ophthalmology", "exp": 15},
            {"name": "Dr. Sanjay Verma", "dept": "Orthopedics", "qual": "MBBS, MS, DNB Ortho", "exp": 18},
        ],
    },
    {
        "name": "Max Super Speciality Hospital Saket",
        "address": "Press Enclave Road, Saket, New Delhi",
        "city": "New Delhi",
        "latitude": 28.5245,
        "longitude": 77.2180,
        "phone": "+91-11-26515050",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "PET-CT", "MRI 3T", "Pharmacy", "Ambulance", "NICU"],
        "departments": [
            {"name": "Orthopedics", "specialty": "Bone & Joint", "fee_min": 700, "fee_max": 1800, "queue": 28},
            {"name": "Cardiology", "specialty": "Heart & Vascular", "fee_min": 800, "fee_max": 2000, "queue": 32},
            {"name": "Ophthalmology", "specialty": "Eye Care", "fee_min": 500, "fee_max": 1200, "queue": 18},
            {"name": "General Medicine", "specialty": "Internal Medicine", "fee_min": 500, "fee_max": 1000, "queue": 25},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 1000, "fee_max": 4000, "queue": 12},
        ],
        "doctors": [
            {"name": "Dr. Deepak Jain", "dept": "Orthopedics", "qual": "MBBS, MS Ortho, FRCS", "exp": 22},
            {"name": "Dr. Kavita Sharma", "dept": "General Medicine", "qual": "MBBS, MD", "exp": 16},
        ],
    },
    {
        "name": "RML Hospital (Ram Manohar Lohia)",
        "address": "Baba Kharak Singh Marg, New Delhi",
        "city": "New Delhi",
        "latitude": 28.6321,
        "longitude": 77.2100,
        "phone": "+91-11-23404499",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "MRI", "CT Scan", "Pharmacy", "Ambulance"],
        "departments": [
            {"name": "General Medicine", "specialty": "Internal Medicine", "fee_min": 50, "fee_max": 200, "queue": 90},
            {"name": "Orthopedics", "specialty": "Bone & Joint", "fee_min": 100, "fee_max": 250, "queue": 65},
            {"name": "Ophthalmology", "specialty": "Eye Care", "fee_min": 50, "fee_max": 200, "queue": 55},
            {"name": "Dermatology", "specialty": "Skin & Hair", "fee_min": 50, "fee_max": 200, "queue": 45},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 100, "fee_max": 1000, "queue": 35},
        ],
        "doctors": [
            {"name": "Dr. Rakesh Kumar", "dept": "General Medicine", "qual": "MBBS, MD", "exp": 8},
            {"name": "Dr. Pooja Aggarwal", "dept": "Orthopedics", "qual": "MBBS, MS Ortho", "exp": 12},
        ],
    },
    {
        "name": "Lok Nayak Hospital",
        "address": "Jawaharlal Nehru Marg, New Delhi",
        "city": "New Delhi",
        "latitude": 28.6386,
        "longitude": 77.2397,
        "phone": "+91-11-23232400",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "CT Scan", "Pharmacy", "Ambulance", "Dialysis"],
        "departments": [
            {"name": "General Medicine", "specialty": "Internal Medicine", "fee_min": 50, "fee_max": 150, "queue": 95},
            {"name": "Dermatology", "specialty": "Skin & Hair", "fee_min": 50, "fee_max": 150, "queue": 60},
            {"name": "Dentistry", "specialty": "Dental & Oral Health", "fee_min": 100, "fee_max": 500, "queue": 40},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 100, "fee_max": 800, "queue": 40},
        ],
        "doctors": [
            {"name": "Dr. Manoj Yadav", "dept": "General Medicine", "qual": "MBBS, MD", "exp": 10},
            {"name": "Dr. Asha Mishra", "dept": "Dermatology", "qual": "MBBS, MD Dermatology", "exp": 9},
        ],
    },
    {
        "name": "Sir Ganga Ram Hospital",
        "address": "Rajinder Nagar, New Delhi",
        "city": "New Delhi",
        "latitude": 28.6439,
        "longitude": 77.1930,
        "phone": "+91-11-25750000",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "PET Scan", "MRI", "CT Scan", "Pharmacy", "Ambulance", "Cath Lab"],
        "departments": [
            {"name": "Cardiology", "specialty": "Heart & Vascular", "fee_min": 700, "fee_max": 1800, "queue": 24},
            {"name": "Orthopedics", "specialty": "Bone & Joint", "fee_min": 600, "fee_max": 1500, "queue": 20},
            {"name": "Ophthalmology", "specialty": "Eye Care", "fee_min": 500, "fee_max": 1200, "queue": 14},
            {"name": "Dentistry", "specialty": "Dental & Oral Health", "fee_min": 400, "fee_max": 2000, "queue": 10},
            {"name": "Dermatology", "specialty": "Skin & Hair", "fee_min": 400, "fee_max": 1000, "queue": 12},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 800, "fee_max": 4000, "queue": 8},
        ],
        "doctors": [
            {"name": "Dr. Sushil Azad", "dept": "Cardiology", "qual": "MBBS, MD, DM Cardiology", "exp": 24},
            {"name": "Dr. Nidhi Saxena", "dept": "Ophthalmology", "qual": "MBBS, MS, DNB Ophthalmology", "exp": 14},
        ],
    },
    {
        "name": "Indraprastha Apollo Hospital",
        "address": "Delhi Mathura Road, Jasola Vihar, New Delhi",
        "city": "New Delhi",
        "latitude": 28.5450,
        "longitude": 77.2887,
        "phone": "+91-11-71791090",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "PET-CT", "MRI 3T", "Robotic Surgery", "Pharmacy", "Ambulance", "Cath Lab", "NICU"],
        "departments": [
            {"name": "Cardiology", "specialty": "Heart & Vascular", "fee_min": 1000, "fee_max": 3000, "queue": 16},
            {"name": "Orthopedics", "specialty": "Bone & Joint", "fee_min": 900, "fee_max": 2500, "queue": 12},
            {"name": "Ophthalmology", "specialty": "Eye Care", "fee_min": 700, "fee_max": 1800, "queue": 10},
            {"name": "Dentistry", "specialty": "Dental & Oral Health", "fee_min": 600, "fee_max": 3500, "queue": 7},
            {"name": "Dermatology", "specialty": "Skin & Hair", "fee_min": 600, "fee_max": 1500, "queue": 9},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 2000, "fee_max": 8000, "queue": 4},
        ],
        "doctors": [
            {"name": "Dr. Ashok Seth", "dept": "Cardiology", "qual": "MBBS, MD, DM, FACC, FESC", "exp": 35},
            {"name": "Dr. Satnam Arora", "dept": "Ophthalmology", "qual": "MBBS, MS, FRCS Ophthalmology", "exp": 28},
        ],
    },
    {
        "name": "Hindu Rao Hospital",
        "address": "Malka Ganj, North Delhi",
        "city": "New Delhi",
        "latitude": 28.6811,
        "longitude": 77.2000,
        "phone": "+91-11-23946971",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "CT Scan", "Pharmacy", "Ambulance"],
        "departments": [
            {"name": "General Medicine", "specialty": "Internal Medicine", "fee_min": 50, "fee_max": 150, "queue": 75},
            {"name": "Orthopedics", "specialty": "Bone & Joint", "fee_min": 100, "fee_max": 300, "queue": 50},
            {"name": "Dermatology", "specialty": "Skin & Hair", "fee_min": 50, "fee_max": 200, "queue": 40},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 100, "fee_max": 900, "queue": 28},
        ],
        "doctors": [
            {"name": "Dr. Rekha Patel", "dept": "General Medicine", "qual": "MBBS, MD", "exp": 11},
        ],
    },
    {
        "name": "Medanta – The Medicity",
        "address": "CH Baktawar Singh Road, Sector 38, Gurugram",
        "city": "Gurugram",
        "latitude": 28.4500,
        "longitude": 77.0400,
        "phone": "+91-124-4141414",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "PET-CT", "MRI 3T", "Robotic Surgery", "Pharmacy", "Ambulance", "Transplant Center", "Cath Lab"],
        "departments": [
            {"name": "Cardiology", "specialty": "Heart & Vascular", "fee_min": 1200, "fee_max": 3500, "queue": 18},
            {"name": "Orthopedics", "specialty": "Bone & Joint", "fee_min": 1000, "fee_max": 2800, "queue": 14},
            {"name": "Ophthalmology", "specialty": "Eye Care", "fee_min": 800, "fee_max": 2000, "queue": 8},
            {"name": "Dermatology", "specialty": "Skin & Hair", "fee_min": 700, "fee_max": 1800, "queue": 7},
            {"name": "General Medicine", "specialty": "Internal Medicine", "fee_min": 700, "fee_max": 1500, "queue": 12},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 2000, "fee_max": 9000, "queue": 3},
        ],
        "doctors": [
            {"name": "Dr. Naresh Trehan", "dept": "Cardiology", "qual": "MBBS, MS, FACS, FRCS", "exp": 40},
            {"name": "Dr. Ashok Kumar", "dept": "Orthopedics", "qual": "MBBS, MS Ortho, Fellowship USA", "exp": 22},
        ],
    },
    {
        "name": "Venkateshwar Hospital",
        "address": "Sector 18A, Dwarka, New Delhi",
        "city": "New Delhi",
        "latitude": 28.5830,
        "longitude": 77.0380,
        "phone": "+91-11-45000000",
        "emergency_available": True,
        "facilities": ["ICU", "Blood Bank", "MRI", "CT Scan", "Pharmacy", "Ambulance"],
        "departments": [
            {"name": "General Medicine", "specialty": "Internal Medicine", "fee_min": 400, "fee_max": 900, "queue": 30},
            {"name": "Orthopedics", "specialty": "Bone & Joint", "fee_min": 400, "fee_max": 1000, "queue": 22},
            {"name": "Ophthalmology", "specialty": "Eye Care", "fee_min": 300, "fee_max": 800, "queue": 15},
            {"name": "Dermatology", "specialty": "Skin & Hair", "fee_min": 300, "fee_max": 700, "queue": 12},
            {"name": "Dentistry", "specialty": "Dental & Oral Health", "fee_min": 300, "fee_max": 1500, "queue": 10},
            {"name": "Emergency", "specialty": "Emergency Medicine", "fee_min": 700, "fee_max": 3000, "queue": 9},
        ],
        "doctors": [
            {"name": "Dr. Sameer Bhati", "dept": "Orthopedics", "qual": "MBBS, MS Ortho", "exp": 16},
            {"name": "Dr. Ritu Sharma", "dept": "General Medicine", "qual": "MBBS, MD", "exp": 13},
            {"name": "Dr. Pankaj Gupta", "dept": "Dentistry", "qual": "BDS, MDS Oral Surgery", "exp": 10},
        ],
    },
]

schemes_data = [
    {
        "name": "Ayushman Bharat PM-JAY",
        "description": "Government health insurance scheme providing ₹5 lakh coverage per family per year for secondary and tertiary care hospitalization.",
        "eligible_departments": ["General Medicine", "Orthopedics", "Cardiology", "Emergency"],
        "coverage_amount": 500000,
    },
    {
        "name": "Delhi Arogya Kosh",
        "description": "Delhi government scheme providing financial assistance for serious illnesses to residents of Delhi.",
        "eligible_departments": ["Cardiology", "Emergency", "General Medicine"],
        "coverage_amount": 200000,
    },
    {
        "name": "ESI Scheme",
        "description": "Employee State Insurance scheme for organized sector workers and their dependents.",
        "eligible_departments": ["General Medicine", "Orthopedics", "Dermatology", "Ophthalmology", "Dentistry"],
        "coverage_amount": 0,
    },
]

# Insert hospitals
dept_name_map = {}
for h_data in hospitals_data:
    hospital = models.Hospital(
        name=h_data["name"],
        address=h_data["address"],
        city=h_data["city"],
        latitude=h_data["latitude"],
        longitude=h_data["longitude"],
        phone=h_data["phone"],
        emergency_available=h_data["emergency_available"],
        facilities=h_data["facilities"],
    )
    db.add(hospital)
    db.flush()

    dept_objects = {}
    for d in h_data["departments"]:
        dept = models.Department(
            hospital_id=hospital.id,
            name=d["name"],
            specialty=d["specialty"],
            consultation_fee_min=d["fee_min"],
            consultation_fee_max=d["fee_max"],
            current_queue=d["queue"],
            available=True,
        )
        db.add(dept)
        db.flush()
        dept_objects[d["name"]] = dept

    for doc in h_data["doctors"]:
        dept_obj = dept_objects.get(doc["dept"])
        if dept_obj:
            doctor = models.Doctor(
                hospital_id=hospital.id,
                department_id=dept_obj.id,
                name=doc["name"],
                qualification=doc["qual"],
                experience_years=doc["exp"],
                available_today=True,
            )
            db.add(doctor)

# Insert schemes
for s_data in schemes_data:
    scheme = models.Scheme(
        name=s_data["name"],
        description=s_data["description"],
        eligible_departments=s_data["eligible_departments"],
        coverage_amount=s_data["coverage_amount"],
    )
    db.add(scheme)

db.commit()
db.close()
print("✅ Database seeded with 12 hospitals, departments, doctors, and schemes.")
