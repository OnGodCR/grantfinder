// frontend/lib/me.ts

// Base URL of your backend API (no trailing slash)
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:4000/api";

// Optional bearer token if your backend requires it
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "";

function jsonHeaders(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (API_TOKEN) h.Authorization = `Bearer ${API_TOKEN}`;
  return h;
}

export type PreferencesPayload = {
  clerkId: string;

  // Section 1
  department?: string | null;
  position?: string | null;

  // Section 2
  researchAreas?: string[];
  keywords?: string[];
  fundingCategories?: string[];

  // Section 3
  preferredSources?: string[];
  fundingLevel?: string | null;
  projectDuration?: string | null;
  deadlineFirst?: boolean;

  // Section 4
  alertFrequency?: string | null;
  notificationMethod?: string | null;
};

export type PreferencesResponse = {
  ok: boolean;
  exists: boolean;
  profile?: any;
};

/** Read the current user's saved preferences */
export async function getMyPreferences(
  clerkId: string
): Promise<PreferencesResponse> {
  const url = `${API_BASE}/me/preferences?clerkId=${encodeURIComponent(
    clerkId
  )}`;
  const resp = await fetch(url, { headers: jsonHeaders(), cache: "no-store" });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `getMyPreferences failed: ${resp.status} ${resp.statusText} ${text}`
    );
  }
  return (await resp.json()) as PreferencesResponse;
}

/** Create or update the user's preferences */
export async function saveMyPreferences(
  payload: PreferencesPayload
): Promise<PreferencesResponse> {
  const resp = await fetch(`${API_BASE}/me/preferences`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `saveMyPreferences failed: ${resp.status} ${resp.statusText} ${text}`
    );
  }
  return (await resp.json()) as PreferencesResponse;
}
