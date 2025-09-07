// frontend/lib/api.ts
export async function fetchGrants({
  q = "",
  limit = 24,
  offset = 0,
  clerkId,
  token,
}: {
  q?: string;
  limit?: number;
  offset?: number;
  clerkId?: string;
  token?: string; // backend API token
}) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  const url = `${base}/internal/grants${clerkId ? `?clerkId=${encodeURIComponent(clerkId)}` : ""}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ q, limit, offset }),
    // Ensure no caching issues
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`fetchGrants failed: ${res.status}  ${body}`);
  }
  const data = await res.json();

  // Normalize: guarantee matchScore exists
  const items = Array.isArray(data?.items) ? data.items : [];
  for (const it of items) {
    if (typeof it.matchScore !== "number") it.matchScore = 0;
  }
  return { ...data, items };
}
