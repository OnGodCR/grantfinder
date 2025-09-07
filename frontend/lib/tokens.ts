// frontend/lib/tokens.ts

// Split anything (string / array / object) into a flat list of lowercase tokens.
// Always returns string[] (no undefined), so TS is happy.
export function smartSplit(v: any): string[] {
  if (v == null) return [];

  if (Array.isArray(v)) {
    return v.flatMap(smartSplit);
  }

  if (typeof v === "string") {
    // split on commas, semicolons, pipes — then trim & filter empties
    return v
      .split(/[,;|]/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (typeof v === "object") {
    // for objects, tokenize each value
    return Object.values(v).flatMap(smartSplit);
  }

  // numbers, booleans, etc.
  return [String(v)];
}

// Normalize tokens: lowercase, strip punctuation, collapse internal spaces
export function normalizeTokens(list: string[]): string[] {
  return list
    .map((s) =>
      s
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s\-]+/gu, "") // keep letters/numbers/space/hyphen
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

// Build a deduped Set<string> from arbitrary input
function toTokenSet(v: any): Set<string> {
  return new Set(normalizeTokens(smartSplit(v)));
}

// Preference → tokens (kept very generic so it won’t break if fields change)
export function makePrefTokens(prefs: Record<string, any> | null | undefined): string[] {
  if (!prefs || typeof prefs !== "object") return [];
  const fieldsLikelyUseful = [
    "department",
    "position",
    "researchAreas",
    "keywords",
    "fundingCategories",
    "preferredSources",
    "fundingLevel",
    "projectDuration",
  ];

  const picked: any[] = [];
  for (const k of fieldsLikelyUseful) {
    if (k in prefs) picked.push(prefs[k]);
  }

  const set = toTokenSet(picked);
  return Array.from(set);
}

// Grant → tokens (title, summary/description, agency, topic-ish fields)
export function makeGrantTokens(grant: Record<string, any> | null | undefined): string[] {
  if (!grant || typeof grant !== "object") return [];
  const picked = [
    grant.title,
    grant.summary ?? grant.description,
    grant.agency?.name,
    grant.keywords,
    grant.categories,
    grant.topics,
  ];
  const set = toTokenSet(picked);
  return Array.from(set);
}

// Simple Jaccard similarity in [0, 1]
export function jaccard(a: string[] | Set<string>, b: string[] | Set<string>): number {
  const A = a instanceof Set ? a : new Set(a);
  const B = b instanceof Set ? b : new Set(b);
  if (A.size === 0 && B.size === 0) return 0;

  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  const uni = A.size + B.size - inter;
  return uni === 0 ? 0 : inter / uni;
}

// Convenience: percent string "0%"–"100%"
export function toPercent(x: number): string {
  const clamped = Math.max(0, Math.min(1, x));
  return `${Math.round(clamped * 100)}%`;
}
