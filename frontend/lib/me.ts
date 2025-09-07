// frontend/lib/me.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://grantfinder-production.up.railway.app/api";

/** What we POST to save preferences. Keep it flexible. */
export type PreferencesPayload = {
  clerkId: string;
  // Everything else is optional/flexible so the backend can accept current shape
  [key: string]: any;
};

/** Normalized shape we return to the app after GET. */
export type Preferences = Record<string, any> | null;

/** Fetch the current user's saved preferences. */
export async function getMyPreferences(clerkId: string): Promise<Preferences> {
  if (!clerkId) return null;
  const url = `${API_BASE}/me/preferences?clerkId=${encodeURIComponent(clerkId)}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) return null;

  const json = await res.json().catch(() => null);
  if (!json) return null;

  // Support a few possible backend response shapes
  return json.preferences ?? json.record ?? json.data ?? json;
}

/** Create/update the current user's preferences. */
export async function saveMyPreferences(payload: PreferencesPayload): Promise<Preferences> {
  if (!payload?.clerkId) throw new Error("saveMyPreferences: missing clerkId");

  const res = await fetch(`${API_BASE}/me/preferences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`saveMyPreferences failed: ${res.status} ${text}`);
  }

  const json = await res.json().catch(() => null);
  // Normalize return just like GET
  return json?.preferences ?? json?.record ?? json?.data ?? json;
}
