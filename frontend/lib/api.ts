// frontend/lib/api.ts

// Where your backend lives, WITHOUT a trailing slash, e.g.
// https://grantfinder-production.up.railway.app/api
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:4000/api";

// Optional bearer token if your backend requires Authorization.
// If your backend is running with SKIP_AUTH=1 you can omit this.
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "";

export type FetchGrantsParams = {
  q?: string;
  limit?: number;
  offset?: number;
  clerkId?: string | null; // forwarded so backend can personalize matchScore (optional)
};

export type GrantItem = {
  id: string;
  title: string;
  summary: string;
  url: string | null;
  agency: string | null;
  deadline: string | null;
  currency: string | null;
  fundingMin: number | null;
  fundingMax: number | null;
  matchScore?: number | null; // backend will send this
};

export type FetchGrantsResponse = {
  ok: boolean;
  query: string;
  items: GrantItem[];
  count: number;
};

function headersJSON(): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_TOKEN) h.Authorization = `Bearer ${API_TOKEN}`;
  return h;
}

/**
 * Fetch paged grants + (optional) personalized match scores.
 * Hits POST {API_BASE}/internal/grants
 */
export async function fetchGrants(
  params: FetchGrantsParams = {}
): Promise<FetchGrantsResponse> {
  const body = {
    q: params.q ?? "",
    limit: params.limit ?? 24,
    offset: params.offset ?? 0,
    clerkId: params.clerkId ?? null,
  };

  const resp = await fetch(`${API_BASE}/internal/grants`, {
    method: "POST",
    headers: headersJSON(),
    body: JSON.stringify(body),
    // IMPORTANT: Next app router runs on the server; this ensures it can call cross-origin APIs.
    // You can flip to "no-store" if you want to disable caching.
    cache: "no-store",
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `fetchGrants failed: ${resp.status} ${resp.statusText} ${text}`
    );
  }

  const data = (await resp.json()) as FetchGrantsResponse;
  // keep a stable shape
  return {
    ok: !!data.ok,
    query: data.query ?? "",
    items: Array.isArray(data.items) ? data.items : [],
    count: Number(data.count ?? 0),
  };
}
