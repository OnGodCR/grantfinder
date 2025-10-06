// frontend/lib/api.ts
import { auth } from '@clerk/nextjs';

const API_BASE = "https://grantfinder-production.up.railway.app/api";

export async function fetchGrants(payload: any, token?: string) {
  const headers: Record<string, string> = { 
    "Content-Type": "application/json" 
  };
  
  // Add Clerk token if available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/grants`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fetchGrants failed: ${res.status}  ${text}`);
  }
  return res.json();
}

// Server-side function for API routes
export async function fetchGrantsServer(payload: any) {
  const { getToken } = auth();
  const token = await getToken();
  
  return fetchGrants(payload, token || undefined);
}