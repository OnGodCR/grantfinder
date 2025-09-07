// frontend/lib/api.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://grantfinder-production.up.railway.app/api";

export async function fetchGrants(payload: any) {
  const res = await fetch(`${API_BASE}/internal/grants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fetchGrants failed: ${res.status}  ${text}`);
  }
  return res.json();
}
