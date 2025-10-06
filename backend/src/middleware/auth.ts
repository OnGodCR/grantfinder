// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";
import { env } from "../env.js";

// Extend Request type to include Clerk user
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
      };
    }
  }
}

export async function requireAuthOrSkip(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") {
    return next();
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    // Allow unauthenticated requests for public endpoints
    return next();
  }

  try {
    // Verify the Clerk JWT token
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    // Attach user info to request
    req.auth = {
      userId: payload.sub,
      sessionId: payload.sid,
    };

    return next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Require authentication - returns 401 if no valid token
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") {
    return next();
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    req.auth = {
      userId: payload.sub,
      sessionId: payload.sid,
    };

    return next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Internal token auth for scraper/system requests
export function requireInternalToken(req: Request, res: Response, next: NextFunction) {
  const headerToken = req.headers["x-internal-token"];
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  
  const token = headerToken || bearerToken;
  if (!token || token !== env.INTERNAL_API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized (internal)" });
  }
  return next();
}

function timeSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let acc = 0;
  for (let i = 0; i < a.length; i++) acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return acc === 0;
}
