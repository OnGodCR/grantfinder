// frontend/lib/api.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:4000/api";

const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "";

function jsonHeaders(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (API_TOKEN) h.Authorization = `Bearer ${API_TOKEN}`;
  return h;
}

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
  matchScore?: number | null; // if you added matching on backend
};

export async function fetchGrants(params: {
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: GrantItem[]; count: number }> {
  const body = {
    q: params.q ?? "",
    limit: params.limit ?? 24,
    offset: params.offset ?? 0,
  };

  const resp = await fetch(`${API_BASE}/internal/grants`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`fetchGrants failed: ${resp.status}  ${text}`);
  }

  const data = await resp.json();
  return { items: data.items ?? [], count: data.count ?? 0 };
}
