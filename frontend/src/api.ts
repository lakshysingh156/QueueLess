import type { SearchResponse, HospitalDetail, QueueResponse } from './types';

const BASE = '/api';

export async function searchHospitals(
  symptom: string,
  lat = 28.6139,
  lon = 77.209
): Promise<SearchResponse> {
  const params = new URLSearchParams({ symptom, lat: String(lat), lon: String(lon) });
  const res = await fetch(`${BASE}/search/?${params}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getHospital(id: number): Promise<HospitalDetail> {
  const res = await fetch(`${BASE}/hospitals/${id}`);
  if (!res.ok) throw new Error('Hospital not found');
  return res.json();
}

export async function getQueue(hospitalId: number, department: string): Promise<QueueResponse> {
  const params = new URLSearchParams({ department });
  const res = await fetch(`${BASE}/queue/${hospitalId}?${params}`);
  if (!res.ok) throw new Error('Queue fetch failed');
  return res.json();
}
