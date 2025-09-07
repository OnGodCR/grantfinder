// frontend/lib/api.ts
export type FetchGrantsArgs = {
  q?: string;
  limit?: number;
  offset?: number;
  clerkId?: string | null | undefined;
  token?: string | undefined; // optional if your backend enforces a bearer token
};

const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "https://grantfinder-production.up.railway.app/api";

export async function fetchGrants(args: FetchGrantsArgs = {}) {
  const { q = "", limit = 24, offset = 0, clerkId, token } = args;

  const res = await fetch(`${BASE}/internal/grants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      q,
      limit,
      offset,
      // ✅ send clerkId so the backend can load preferences
      clerkId: clerkId ?? null,
    }),
    // If your backend is cross-origin, you may need:
    // credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fetchGrants failed: ${res.status}  ${text || res.statusText}`);
  }
  return res.json();
}
