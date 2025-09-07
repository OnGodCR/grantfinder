// frontend/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE || "";

async function http<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    // Important: no credentials; CORS on backend is configured for header auth-less calls.
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} – ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => http<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    http<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
};

export default api;
