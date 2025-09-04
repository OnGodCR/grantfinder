// frontend/lib/types.ts
export type Grant = {
  id: string | number;
  title: string;
  summary?: string;
  agency?: string;
  source?: string;
  maxFunding?: number | string;
  deadline?: string;        // ISO date like "2025-10-01"
  daysRemaining?: number;   // optional; we'll compute if missing
  matchScore?: number;      // 0..100
  tags?: string[];
  url?: string;
};
