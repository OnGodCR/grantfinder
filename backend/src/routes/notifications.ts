// backend/src/routes/notifications.ts
import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  checkHighMatchNotifications,
  checkDeadlineNotifications,
} from "../services/notificationService.js";

const router = Router();

// Get user's notifications
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const notifications = await getUserNotifications(userId, limit);

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.patch("/:notificationId/read", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { notificationId } = req.params;
    const success = await markNotificationAsRead(notificationId, userId);

    if (!success) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.patch("/read-all", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const success = await markAllNotificationsAsRead(userId);

    if (!success) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

// Get notification preferences
router.get("/preferences", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const preferences = await getUserNotificationPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    res.status(500).json({ error: "Failed to fetch notification preferences" });
  }
});

// Update notification preferences
router.put("/preferences", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const preferences = req.body;
    await updateUserNotificationPreferences(userId, preferences);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ error: "Failed to update notification preferences" });
  }
});

// Trigger notification checks (for testing or manual runs)
router.post("/check", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Run both notification checks
    await Promise.all([
      checkHighMatchNotifications(userId),
      checkDeadlineNotifications(userId),
    ]);

    res.json({ success: true, message: "Notification checks completed" });
  } catch (error) {
    console.error("Error running notification checks:", error);
    res.status(500).json({ error: "Failed to run notification checks" });
  }
});

export default router;
