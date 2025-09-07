export type PreferencesPayload = {
  clerkId: string;
  department?: string | null;
  position?: string | null;
  researchAreas?: string[];
  keywords?: string[];
  fundingCategories?: string[];
  preferredSources?: string[];
  fundingLevel?: string | null;
  projectDuration?: string | null;
  deadlineFirst?: boolean;
  alertFrequency?: string | null;
  notificationMethod?: string | null;
};

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") ||
  "https://grantfinder-production.up.railway.app";

export async function getMyPreferences(clerkId: string) {
  const url = `${BASE}/api/me/preferences?clerkId=${encodeURIComponent(clerkId)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`get prefs failed: ${res.status}`);
  return res.json() as Promise<{ exists: boolean; profile: any }>;
}

export async function saveMyPreferences(payload: PreferencesPayload) {
  const res = await fetch(`${BASE}/api/me/preferences`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`save prefs failed: ${res.status}`);
  return res.json() as Promise<{ ok: true; profile: any }>;
}
