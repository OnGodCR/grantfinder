// frontend/lib/me.ts
import { UserProfile } from './matchScore';

export type PreferencesPayload = {
  clerkId: string;
  department?: string;
  position?: string;
  researchAreas?: string[];
  keywords?: string[];
  fundingCategories?: string[];
  preferredSources?: string[];
  fundingLevel?: string;
  projectDuration?: string;
  deadlineFirst?: boolean;
  alertFrequency?: string;
  notificationMethod?: string;
};

// Database UserProfile format
export type DatabaseUserProfile = {
  id: string;
  clerkId: string;
  department?: string;
  position?: string;
  researchAreas: string[];
  keywords: string[];
  fundingCategories: string[];
  preferredSources: string[];
  fundingLevel?: string;
  projectDuration?: string;
  deadlineFirst: boolean;
  alertFrequency?: string;
  notificationMethod?: string;
  createdAt: string;
  updatedAt: string;
};

// What the frontend uses after normalization
export type PreferencesResponse =
  | { exists: true; profile: DatabaseUserProfile }
  | { exists: false };

const API =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "https://grantfinder-production.up.railway.app/api";

// GET /me/preferences (supports both authenticated and clerkId parameter)
export async function getMyPreferences(
  token?: string,
  clerkId?: string
): Promise<PreferencesResponse> {
  const url = clerkId 
    ? `${API}/me/preferences?clerkId=${encodeURIComponent(clerkId)}`
    : `${API}/me/preferences`;
    
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  
  const res = await fetch(url, { 
    method: "GET", 
    headers,
    credentials: "include" 
  });

  if (res.status === 404) {
    // backend returns 404 when no prefs yet
    return { exists: false };
  }
  if (!res.ok) {
    // treat any other failure as "no prefs" but don't crash builds
    return { exists: false };
  }

  // if backend returns the preference object
  const json = await res.json().catch(() => null);
  if (json && json.profile && typeof json.profile === "object") {
    return { exists: true, profile: json.profile as DatabaseUserProfile };
  }
  return { exists: false };
}

// Convert database profile to match algorithm format
export function convertToMatchProfile(dbProfile: DatabaseUserProfile): UserProfile {
  // Extract funding range from fundingLevel string
  const getFundingRange = (fundingLevel?: string) => {
    if (!fundingLevel) return { min: 50000, max: 500000 };
    
    // Parse common funding level formats like "50000-250000" or "Large (>1M)"
    const match = fundingLevel.match(/(\d+)(?:-(\d+))?/);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min * 2;
      return { min, max };
    }
    
    // Default ranges based on common funding levels
    const level = fundingLevel.toLowerCase();
    if (level.includes('small') || level.includes('seed')) return { min: 10000, max: 50000 };
    if (level.includes('medium') || level.includes('standard')) return { min: 50000, max: 250000 };
    if (level.includes('large') || level.includes('major')) return { min: 250000, max: 1000000 };
    if (level.includes('mega') || level.includes('center')) return { min: 1000000, max: 10000000 };
    
    return { min: 50000, max: 500000 }; // Default
  };

  // Map department/position to experience level
  const getExperienceLevel = (position?: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
    if (!position) return 'intermediate';
    
    const pos = position.toLowerCase();
    if (pos.includes('student') || pos.includes('undergraduate') || pos.includes('phd student')) return 'beginner';
    if (pos.includes('postdoc') || pos.includes('assistant') || pos.includes('junior')) return 'intermediate';
    if (pos.includes('associate') || pos.includes('senior') || pos.includes('lead')) return 'advanced';
    if (pos.includes('professor') || pos.includes('director') || pos.includes('principal') || pos.includes('chief')) return 'expert';
    
    return 'intermediate'; // Default
  };

  return {
    researchInterests: [...dbProfile.researchAreas, ...dbProfile.keywords],
    fundingRange: getFundingRange(dbProfile.fundingLevel),
    preferredAgencies: dbProfile.preferredSources,
    preferredGrantTypes: dbProfile.fundingCategories,
    location: 'United States', // Default - could be added to database later
    experienceLevel: getExperienceLevel(dbProfile.position),
    deadlineBuffer: dbProfile.deadlineFirst ? 60 : 30, // More time if deadline-focused
  };
}

// POST /me/preferences (create or update)
export async function saveMyPreferences(payload: PreferencesPayload) {
  const url = `${API}/me/preferences`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`saveMyPreferences failed: ${res.status} ${text}`);
  }
  return res.json().catch(() => ({}));
}
