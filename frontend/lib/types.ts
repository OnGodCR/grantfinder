// frontend/lib/types.ts
export type Grant = {
  id?: string | number;     // ← optional to support simple demo cards on / (home)
  title: string;
  summary?: string;
  agency?: string;
  source?: string;
  maxFunding?: number | string;
  deadline?: string;        // ISO date like "2025-10-01"
  daysRemaining?: number;
  matchScore?: number;      // 0..100
  tags?: string[];
  url?: string;
};
