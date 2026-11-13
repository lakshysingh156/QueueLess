from math import ceil


MINIMUM_WAIT_MINUTES = 5
INTAKE_BUFFER_MINUTES = 5

BASE_CAPACITY_PER_HOUR: dict[str, int] = {
    "general medicine": 28,
    "orthopedics": 18,
    "cardiology": 12,
    "dermatology": 24,
    "ophthalmology": 22,
    "dentistry": 18,
    "emergency": 36,
}

DEPARTMENT_DEMAND_FACTOR: dict[str, float] = {
    "general medicine": 1.0,
    "orthopedics": 0.78,
    "cardiology": 0.7,
    "dermatology": 0.62,
    "ophthalmology": 0.68,
    "dentistry": 0.48,
    "emergency": 0.66,
}


def hospital_demand_multiplier(hospital_id: int) -> float:
    """Return a stable synthetic demand adjustment for a demo hospital."""
    return round(0.64 + (hospital_id % 10) * 0.06, 2)


def service_capacity_per_hour(department_name: str, hospital_id: int) -> int:
    """Return a deterministic synthetic service capacity for demo projections."""
    department_key = department_name.strip().lower()
    base_capacity = BASE_CAPACITY_PER_HOUR.get(department_key, 10)
    hospital_factor = 0.9 + (hospital_id % 4) * 0.1
    return max(1, round(base_capacity * hospital_factor))


def queue_to_wait(
    queue_size: int,
    department_name: str = "General Medicine",
    hospital_id: int = 1,
) -> int:
    """Estimate minutes as queue workload divided by hourly service capacity."""
    queue = max(0, queue_size)
    capacity = service_capacity_per_hour(department_name, hospital_id)
    workload_minutes = ceil(queue * 60 / capacity)
    return max(MINIMUM_WAIT_MINUTES, INTAKE_BUFFER_MINUTES + workload_minutes)


def forecast_queue(hour: int, department_name: str, hospital_id: int, baseline: list[int]) -> int:
    """Scale the synthetic hourly baseline by hospital and department demand."""
    if not 0 <= hour < len(baseline):
        raise ValueError(f"hour must be between 0 and {len(baseline) - 1}")
    hospital_factor = hospital_demand_multiplier(hospital_id)
    department_factor = DEPARTMENT_DEMAND_FACTOR.get(department_name.strip().lower(), 0.75)
    return max(0, round(baseline[hour] * hospital_factor * department_factor))
