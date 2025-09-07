// frontend/lib/me.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://grantfinder-production.up.railway.app/api";

export type Preferences = Record<string, any>;

export async function getMyPreferences(clerkId: string): Promise<Preferences | null> {
  if (!clerkId) return null;
  const url = `${API_BASE}/me/preferences?clerkId=${encodeURIComponent(clerkId)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) return null;

  const json = await res.json().catch(() => null);
  if (!json) return null;

  // Normalize possible shapes
  return json.preferences ?? json.record ?? json;
}
