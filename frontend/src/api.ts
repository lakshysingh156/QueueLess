import type { SearchResponse, Hospital, HospitalDetail, QueueResponse } from './types';

const BASE = '/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthSession {
  access_token: string;
  token_type: 'bearer';
  user: AuthUser;
}

async function authRequest(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${BASE}/auth${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: unknown } | null;
    const message = typeof body?.detail === 'string' ? body.detail : 'Authentication request failed';
    throw new Error(message);
  }
  return response;
}

export async function registerAccount(name: string, email: string, password: string): Promise<AuthSession> {
  const response = await authRequest('/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  return response.json() as Promise<AuthSession>;
}

export async function loginAccount(email: string, password: string): Promise<AuthSession> {
  const response = await authRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return response.json() as Promise<AuthSession>;
}

export async function loginDemoAccount(): Promise<AuthSession> {
  const response = await authRequest('/demo', { method: 'POST' });
  return response.json() as Promise<AuthSession>;
}

export async function logoutAccount(token: string): Promise<void> {
  await authRequest('/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function searchHospitals(
  symptom: string,
  lat: number,
  lon: number
): Promise<SearchResponse> {
  const params = new URLSearchParams({ symptom, lat: String(lat), lon: String(lon) });
  const res = await fetch(`${BASE}/search/?${params}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function listHospitals(): Promise<Hospital[]> {
  const res = await fetch(`${BASE}/hospitals/`);
  if (!res.ok) throw new Error('Hospital directory is unavailable');
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
