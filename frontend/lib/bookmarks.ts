/**
 * Bookmark Management System
 * 
 * Handles storing and retrieving bookmarked grants using the backend API
 */

export interface Bookmark {
  id: string;
  grantId: string;
  title: string;
  agency?: string;
  deadline?: string;
  fundingMin?: number;
  fundingMax?: number;
  currency?: string;
  matchScore?: number;
  bookmarkedAt?: string;
}

const API_BASE = "https://grantfinder-production.up.railway.app/api";

/**
 * Get all bookmarked grants from the API
 */
export async function getBookmarks(token?: string): Promise<Bookmark[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/bookmarks`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookmarks: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return [];
  }
}

/**
 * Add a grant to bookmarks via API
 */
export async function addBookmark(grant: any, token?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/bookmarks`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        grantId: grant.id,
        title: grant.title,
        agency: grant.agency,
        deadline: grant.deadline,
        fundingMin: grant.fundingMin,
        fundingMax: grant.fundingMax,
        currency: grant.currency,
        matchScore: grant.matchScore,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 400 && errorData.error?.includes('already bookmarked')) {
        return false; // Already bookmarked
      }
      throw new Error(`Failed to add bookmark: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
}

/**
 * Remove a grant from bookmarks via API
 */
export async function removeBookmark(grantId: string, token?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/bookmarks/${grantId}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove bookmark: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
}

/**
 * Check if a grant is bookmarked (requires fetching all bookmarks)
 */
export async function isBookmarked(grantId: string, token?: string): Promise<boolean> {
  try {
    const bookmarks = await getBookmarks(token);
    return bookmarks.some(b => b.grantId === grantId);
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
}