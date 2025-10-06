// backend/src/routes/bookmarks.ts
import { Router, Request, Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Get user's bookmarks
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // For now, we'll use a simple approach and store bookmarks in a JSON field
    // In a real app, you'd have a proper bookmarks table
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { bookmarks: true }
    });

    const bookmarks = user?.bookmarks || [];
    res.json(bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// Add a bookmark
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { grantId, title, agency, deadline, fundingMin, fundingMax, currency, matchScore } = req.body;

    if (!grantId || !title) {
      return res.status(400).json({ error: "Grant ID and title are required" });
    }

    // Get current user and their bookmarks
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { bookmarks: true }
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          bookmarks: []
        },
        select: { bookmarks: true }
      });
    }

    const bookmarks = user.bookmarks || [];
    
    // Check if already bookmarked
    const existingBookmark = bookmarks.find((b: any) => b.grantId === grantId);
    if (existingBookmark) {
      return res.status(400).json({ error: "Grant already bookmarked" });
    }

    const newBookmark = {
      id: `bookmark_${Date.now()}_${grantId}`,
      grantId,
      title,
      agency,
      deadline,
      fundingMin,
      fundingMax,
      currency,
      matchScore,
      bookmarkedAt: new Date().toISOString()
    };

    const updatedBookmarks = [...bookmarks, newBookmark];

    await prisma.user.update({
      where: { clerkId: userId },
      data: { bookmarks: updatedBookmarks }
    });

    res.json(newBookmark);
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res.status(500).json({ error: "Failed to add bookmark" });
  }
});

// Remove a bookmark
router.delete("/:grantId", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { grantId } = req.params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { bookmarks: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const bookmarks = user.bookmarks || [];
    const updatedBookmarks = bookmarks.filter((b: any) => b.grantId !== grantId);

    if (updatedBookmarks.length === bookmarks.length) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    await prisma.user.update({
      where: { clerkId: userId },
      data: { bookmarks: updatedBookmarks }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

export default router;
