// frontend/lib/me.ts

export type PreferencesPayload = {
  clerkId: string;
  department?: string;
  position?: string;
  researchAreas?: string[];
  keywords?: string[];
  fundingCategories?: string[];
  preferredSources?: string[];
  fundingLevel?: string;
  projectDuration?: string;
  deadlineFirst?: boolean;
  alertFrequency?: string;
  notificationMethod?: string;
};

// What the frontend uses after normalization
export type PreferencesResponse =
  | { exists: true; data: Record<string, any> }
  | { exists: false };

const API =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "https://grantfinder-production.up.railway.app/api";

// GET /me/preferences?clerkId=...
export async function getMyPreferences(
  clerkId: string
): Promise<PreferencesResponse> {
  const url = `${API}/me/preferences?clerkId=${encodeURIComponent(clerkId)}`;
  const res = await fetch(url, { method: "GET", credentials: "include" });

  if (res.status === 404) {
    // backend returns 404 when no prefs yet
    return { exists: false };
  }
  if (!res.ok) {
    // treat any other failure as “no prefs” but don’t crash builds
    return { exists: false };
  }

  // if backend returns the preference object
  const json = await res.json().catch(() => null);
  if (json && typeof json === "object") {
    return { exists: true, data: json as Record<string, any> };
  }
  return { exists: false };
}

// POST /me/preferences (create or update)
export async function saveMyPreferences(payload: PreferencesPayload) {
  const url = `${API}/me/preferences`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`saveMyPreferences failed: ${res.status} ${text}`);
  }
  return res.json().catch(() => ({}));
}
