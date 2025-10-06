// backend/src/services/notificationService.ts
import { prisma } from "../prisma.js";

export interface NotificationPreferences {
  highMatchThreshold: number; // Default 75%
  deadlineReminderDays: number; // Default 30 days
  emailNotifications: boolean;
  deadlineReminders: boolean;
  newMatches: boolean;
  weeklyDigest: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  highMatchThreshold: 75,
  deadlineReminderDays: 30,
  emailNotifications: true,
  deadlineReminders: true,
  newMatches: true,
  weeklyDigest: false,
};

export interface NotificationPayload {
  type: 'high_match' | 'deadline_approaching' | 'deadline_urgent' | 'bookmark_reminder' | 'weekly_digest' | 'system_update' | 'grant_updated' | 'application_reminder';
  title: string;
  message: string;
  grantId?: string;
  grantTitle?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface PriorityConfig {
  low: {
    color: string;
    icon: string;
    sound: boolean;
    badge: boolean;
    email: boolean;
  };
  medium: {
    color: string;
    icon: string;
    sound: boolean;
    badge: boolean;
    email: boolean;
  };
  high: {
    color: string;
    icon: string;
    sound: boolean;
    badge: boolean;
    email: boolean;
  };
  critical: {
    color: string;
    icon: string;
    sound: boolean;
    badge: boolean;
    email: boolean;
  };
}

export const PRIORITY_CONFIG: PriorityConfig = {
  low: {
    color: 'blue',
    icon: 'info',
    sound: false,
    badge: false,
    email: false,
  },
  medium: {
    color: 'yellow',
    icon: 'bell',
    sound: true,
    badge: true,
    email: false,
  },
  high: {
    color: 'orange',
    icon: 'alert-triangle',
    sound: true,
    badge: true,
    email: true,
  },
  critical: {
    color: 'red',
    icon: 'alert-circle',
    sound: true,
    badge: true,
    email: true,
  },
};

/**
 * Create a notification for a user with priority-based handling
 */
export async function createNotification(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  try {
    // Get user preferences to determine if notification should be created
    const preferences = await getUserNotificationPreferences(userId);
    
    // Check if this type of notification is enabled
    if (!shouldCreateNotification(payload.type, preferences)) {
      return;
    }

    // Determine priority based on content and user preferences
    const finalPriority = determineNotificationPriority(payload, preferences);

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        payload: {
          title: payload.title,
          message: payload.message,
          grantId: payload.grantId,
          grantTitle: payload.grantTitle,
          priority: finalPriority,
          actionUrl: payload.actionUrl,
          metadata: {
            ...payload.metadata,
            priorityConfig: PRIORITY_CONFIG[finalPriority],
            expiresAt: payload.expiresAt,
          },
        },
      },
    });

    // Handle priority-based actions (email, sound, etc.)
    await handlePriorityActions(userId, notification, finalPriority, preferences);

  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Determine if a notification should be created based on user preferences
 */
function shouldCreateNotification(type: string, preferences: NotificationPreferences): boolean {
  switch (type) {
    case 'high_match':
      return preferences.newMatches;
    case 'deadline_approaching':
    case 'deadline_urgent':
      return preferences.deadlineReminders;
    case 'weekly_digest':
      return preferences.weeklyDigest;
    case 'bookmark_reminder':
    case 'grant_updated':
    case 'application_reminder':
      return true; // Always show these
    default:
      return true;
  }
}

/**
 * Determine the final priority of a notification
 */
function determineNotificationPriority(
  payload: NotificationPayload,
  preferences: NotificationPreferences
): 'low' | 'medium' | 'high' | 'critical' {
  // Critical priority for urgent deadlines (within 3 days)
  if (payload.type === 'deadline_urgent') {
    return 'critical';
  }

  // High priority for very high match scores (95%+)
  if (payload.type === 'high_match' && payload.metadata?.matchScore >= 95) {
    return 'high';
  }

  // High priority for approaching deadlines (7-14 days)
  if (payload.type === 'deadline_approaching' && payload.metadata?.daysUntilDeadline <= 14) {
    return 'high';
  }

  // Medium priority for high match scores (75-94%)
  if (payload.type === 'high_match' && payload.metadata?.matchScore >= 75) {
    return 'medium';
  }

  // Medium priority for deadlines (15-30 days)
  if (payload.type === 'deadline_approaching') {
    return 'medium';
  }

  // Low priority for everything else
  return 'low';
}

/**
 * Handle priority-based actions (email, sound, etc.)
 */
async function handlePriorityActions(
  userId: string,
  notification: any,
  priority: 'low' | 'medium' | 'high' | 'critical',
  preferences: NotificationPreferences
): Promise<void> {
  const config = PRIORITY_CONFIG[priority];

  // Send email if configured and enabled
  if (config.email && preferences.emailNotifications) {
    await sendEmailNotification(userId, notification, priority);
  }

  // Log for other integrations (push notifications, SMS, etc.)
  if (config.sound || config.badge) {
    console.log(`Priority notification created: ${priority} for user ${userId}`);
    // Here you would integrate with push notification services
  }
}

/**
 * Send email notification (placeholder for email service integration)
 */
async function sendEmailNotification(
  userId: string,
  notification: any,
  priority: 'low' | 'medium' | 'high' | 'critical'
): Promise<void> {
  // This would integrate with your email service (SendGrid, AWS SES, etc.)
  console.log(`Email notification sent: ${priority} - ${notification.payload.title}`);
}

/**
 * Get user's notification preferences
 */
export async function getUserNotificationPreferences(clerkId: string): Promise<NotificationPreferences> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { notificationPreferences: true }
    });

    if (user?.notificationPreferences) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(user.notificationPreferences as any) };
    }

    return DEFAULT_NOTIFICATION_PREFERENCES;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * Update user's notification preferences
 */
export async function updateUserNotificationPreferences(
  clerkId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  try {
    const currentPrefs = await getUserNotificationPreferences(clerkId);
    const updatedPrefs = { ...currentPrefs, ...preferences };

    await prisma.user.upsert({
      where: { clerkId },
      update: { notificationPreferences: updatedPrefs },
      create: {
        clerkId,
        notificationPreferences: updatedPrefs,
      },
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
  }
}

/**
 * Check for high match score grants and create notifications
 */
export async function checkHighMatchNotifications(clerkId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { matches: { include: { grant: true } } }
    });

    if (!user) return;

    const preferences = await getUserNotificationPreferences(clerkId);
    if (!preferences.newMatches) return;

    // Get recent high matches (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentHighMatches = user.matches.filter(match => 
      match.score >= preferences.highMatchThreshold &&
      match.createdAt >= yesterday
    );

    for (const match of recentHighMatches) {
      // Check if notification already exists
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          type: 'high_match',
          payload: {
            path: ['grantId'],
            equals: match.grantId
          }
        }
      });

      if (!existingNotification) {
        await createNotification(user.id, {
          type: 'high_match',
          title: 'New High-Match Grant Found',
          message: `${match.grant.title} matches ${Math.round(match.score)}% of your profile`,
          grantId: match.grantId,
          grantTitle: match.grant.title,
          priority: match.score >= 95 ? 'high' : match.score >= 85 ? 'medium' : 'low',
          actionUrl: `/grants/${match.grantId}`,
          metadata: { 
            matchScore: match.score,
            agency: match.grant.agency?.name || 'Unknown Agency',
            fundingRange: {
              min: match.grant.fundingMin,
              max: match.grant.fundingMax,
              currency: match.grant.currency
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error checking high match notifications:', error);
  }
}

/**
 * Check for approaching deadlines and create notifications
 */
export async function checkDeadlineNotifications(clerkId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { 
        matches: { 
          where: {
            grant: {
              deadline: { not: null }
            }
          },
          include: { 
            grant: true
          } 
        } 
      }
    });

    if (!user) return;

    const preferences = await getUserNotificationPreferences(clerkId);
    if (!preferences.deadlineReminders) return;

    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + preferences.deadlineReminderDays);

    for (const match of user.matches) {
      if (!match.grant.deadline) continue;

      const deadline = new Date(match.grant.deadline);
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline <= preferences.deadlineReminderDays && daysUntilDeadline > 0) {
        // Check if notification already exists for this deadline
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            type: daysUntilDeadline <= 7 ? 'deadline_urgent' : 'deadline_approaching',
            payload: {
              path: ['grantId'],
              equals: match.grantId
            }
          }
        });

        if (!existingNotification) {
          const isUrgent = daysUntilDeadline <= 3;
          const isHighPriority = daysUntilDeadline <= 7;
          
          await createNotification(user.id, {
            type: isUrgent ? 'deadline_urgent' : 'deadline_approaching',
            title: isUrgent ? '🚨 URGENT: Grant Deadline Approaching' : 
                   isHighPriority ? '⚠️ Grant Deadline Reminder' : '📅 Grant Deadline Notice',
            message: `${match.grant.title} deadline is in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'}`,
            grantId: match.grantId,
            grantTitle: match.grant.title,
            priority: isUrgent ? 'critical' : isHighPriority ? 'high' : 'medium',
            actionUrl: `/grants/${match.grantId}`,
            metadata: { 
              daysUntilDeadline,
              deadline: match.grant.deadline.toISOString(),
              agency: match.grant.agency?.name,
              fundingRange: {
                min: match.grant.fundingMin,
                max: match.grant.fundingMax,
                currency: match.grant.currency
              }
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking deadline notifications:', error);
  }
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(clerkId: string, limit: number = 50): Promise<any[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) return [];

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt,
      ...notification.payload as any,
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, clerkId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) return false;

    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: { read: true },
    });

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(clerkId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) return false;

    await prisma.notification.updateMany({
      where: { userId: user.id },
      data: { read: true },
    });

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}
