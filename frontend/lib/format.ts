// frontend/lib/format.ts
export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function daysUntil(dateISO?: string | null) {
  if (!dateISO) return null;
  const now = new Date();
  const d = new Date(dateISO);
  const ms = d.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function currency(x?: number | string, fallback = '—') {
  if (x === undefined || x === null || x === '') return fallback;
  const n = typeof x === 'string' ? Number(x) : x;
  if (Number.isNaN(n)) return String(x);
  return Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function shortDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
