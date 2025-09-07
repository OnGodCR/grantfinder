// backend/src/prisma.ts
import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client (safe across dev hot-reloads),
 * with helpful logging in non-production and graceful shutdown hooks.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// If you ever want to override the datasource at runtime (e.g. different Neon branch),
// set PRISMA_DATASOURCE_URL; otherwise Prisma will use DATABASE_URL from schema.prisma.
const datasourceUrl = process.env.PRISMA_DATASOURCE_URL || undefined;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : (["query", "warn", "error"] as const),
  });

// Cache the client in dev to avoid creating many instances on HMR.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
const disconnect = async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // ignore
  }
};
process.on("beforeExit", disconnect);
process.on("SIGINT", async () => {
  await disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await disconnect();
  process.exit(0);
});
