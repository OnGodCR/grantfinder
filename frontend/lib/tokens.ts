// frontend/lib/tokens.ts
function smartSplit(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap(smartSplit);
  if (typeof v === "string") {
    const s = v.trim();
    if ((s.startsWith("[") && s.endsWith("]")) ||
