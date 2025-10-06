/**
 * Notifications API Service
 * 
 * Handles fetching and managing notifications from the backend
 */

export interface Notification {
  id: string;
  type: 'high_match' | 'deadline_approaching' | 'deadline_urgent' | 'bookmark_reminder' | 'weekly_digest' | 'system_update' | 'grant_updated' | 'application_reminder';
  title: string;
  message: string;
  grantId?: string;
  grantTitle?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    matchScore?: number;
    daysUntilDeadline?: number;
    deadline?: string;
    agency?: string;
    fundingRange?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    priorityConfig?: {
      color: string;
      icon: string;
      sound: boolean;
      badge: boolean;
      email: boolean;
    };
  };
}

export interface NotificationPreferences {
  highMatchThreshold: number;
  deadlineReminderDays: number;
  emailNotifications: boolean;
  deadlineReminders: boolean;
  newMatches: boolean;
  weeklyDigest: boolean;
}

const API_BASE = "https://grantfinder-production.up.railway.app/api";

/**
 * Get user's notifications
 */
export async function getNotifications(token?: string, limit: number = 50): Promise<Notification[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/notifications?limit=${limit}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string, token?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(token?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(token?: string): Promise<NotificationPreferences> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/notifications/preferences`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notification preferences: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return {
      highMatchThreshold: 75,
      deadlineReminderDays: 30,
      emailNotifications: true,
      deadlineReminders: true,
      newMatches: true,
      weeklyDigest: false,
    };
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>,
  token?: string
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/notifications/preferences`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(preferences),
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}

/**
 * Get priority color for UI display
 */
export function getPriorityColor(priority: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (priority) {
    case 'low':
      return 'border-blue-500 bg-blue-500/10';
    case 'medium':
      return 'border-yellow-500 bg-yellow-500/10';
    case 'high':
      return 'border-orange-500 bg-orange-500/10';
    case 'critical':
      return 'border-red-500 bg-red-500/10';
    default:
      return 'border-slate-500 bg-slate-500/10';
  }
}

/**
 * Get priority icon for UI display
 */
export function getPriorityIcon(priority: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (priority) {
    case 'low':
      return 'info';
    case 'medium':
      return 'bell';
    case 'high':
      return 'alert-triangle';
    case 'critical':
      return 'alert-circle';
    default:
      return 'bell';
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(token?: string): Promise<number> {
  try {
    const notifications = await getNotifications(token, 100);
    return notifications.filter(n => !n.read).length;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}
