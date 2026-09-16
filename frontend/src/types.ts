export interface Department {
  id: number;
  name: string;
  specialty: string | null;
  consultation_fee_min: number | null;
  consultation_fee_max: number | null;
  current_queue: number;
  available: boolean;
}

export interface Doctor {
  id: number;
  name: string;
  qualification: string | null;
  experience_years: number | null;
  available_today: boolean;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  emergency_available: boolean;
  departments: Department[];
}

export interface HospitalDetail extends Hospital {
  phone: string | null;
  facilities: string[] | null;
  doctors: Doctor[];
}

export interface SearchResult {
  hospital_id: number;
  hospital_name: string;
  department: string;
  distance_km: number;
  estimated_wait_min: number;
  consultation_fee_min: number | null;
  consultation_fee_max: number | null;
  available: boolean;
  emergency_available: boolean;
  score: number;
  rank: number;
  explanation: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  current_queue: number;
}

export interface SearchResponse {
  symptom: string;
  routed_department: string;
  is_emergency: boolean;
  results: SearchResult[];
}

export interface HourlyPrediction {
  hour: number;
  label: string;
  queue_size: number;
  estimated_wait_min: number;
}

export interface QueueResponse {
  hospital_id: number;
  department: string;
  current_queue: number;
  current_wait_min: number;
  suggested_hour: number;
  suggested_label: string;
  suggested_wait_min: number;
  hourly_predictions: HourlyPrediction[];
  disclaimer: string;
}
