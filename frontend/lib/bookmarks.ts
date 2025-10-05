/**
 * Bookmark Management System
 * 
 * Handles storing and retrieving bookmarked grants using localStorage
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
  bookmarkedAt: string;
  matchScore?: number;
}

const BOOKMARKS_KEY = 'grantfinder_bookmarks';

/**
 * Get all bookmarked grants
 */
export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return [];
  }
}

/**
 * Add a grant to bookmarks
 */
export function addBookmark(grant: any): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const bookmarks = getBookmarks();
    const existingIndex = bookmarks.findIndex(b => b.grantId === grant.id);
    
    if (existingIndex >= 0) {
      return false; // Already bookmarked
    }
    
    const bookmark: Bookmark = {
      id: `bookmark_${Date.now()}_${grant.id}`,
      grantId: grant.id,
      title: grant.title,
      agency: grant.agency,
      deadline: grant.deadline,
      fundingMin: grant.fundingMin,
      fundingMax: grant.fundingMax,
      currency: grant.currency,
      bookmarkedAt: new Date().toISOString(),
      matchScore: grant.matchScore,
    };
    
    bookmarks.push(bookmark);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return true;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
}

/**
 * Remove a grant from bookmarks
 */
export function removeBookmark(grantId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(b => b.grantId !== grantId);
    
    if (filtered.length === bookmarks.length) {
      return false; // Not found
    }
    
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
}

/**
 * Check if a grant is bookmarked
 */
export function isBookmarked(grantId: string): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.grantId === grantId);
}

/**
 * Get bookmark count
 */
export function getBookmarkCount(): number {
  return getBookmarks().length;
}

/**
 * Clear all bookmarks
 */
export function clearBookmarks(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
    return false;
  }
}
