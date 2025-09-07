// frontend/lib/me.ts
import api from "./api";

export type PreferencesPayload = {
  clerkId: string;

  // Section 1
  department?: string;
  position?: string;

  // Section 2
  researchAreas: string[];
  keywords: string[];
  fundingCategories: string[];

  // Section 3
  preferredSources: string[];
  fundingLevel?: string;
  projectDuration?: string;
  deadlineFirst?: boolean;

  // Section 4
  alertFrequency?: string;
  notificationMethod?: string;
};

export async function getMyPreferences(clerkId: string) {
  return api.get<{ exists: boolean; profile: any }>(`/me/preferences?clerkId=${encodeURIComponent(clerkId)}`);
}

export async function saveMyPreferences(payload: PreferencesPayload) {
  return api.post<{ ok: true; profile: any }>(`/me/preferences`, payload);
}
