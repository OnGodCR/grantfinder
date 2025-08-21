# ---------- BUILD STAGE ----------
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Copy manifests + prisma first, so if postinstall runs it sees the schema
COPY package*.json ./
COPY prisma ./prisma

# Install deps INCLUDING devDependencies (needed for Prisma CLI)
# If you keep a postinstall, prisma generate will work now because prisma/ exists
RUN npm install --include=dev

# Copy the rest of the source
COPY . .

# Generate Prisma client explicitly (safe even if postinstall already ran)
RUN npx prisma generate --schema=prisma/schema.prisma

# Build TypeScript
RUN npm run build

# Prune dev deps for runtime image
RUN npm prune --production


# ---------- RUNTIME STAGE ----------
FROM node:20-bullseye-slim

WORKDIR /app

# Copy production artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 4000
CMD ["node", "dist/index.js"]
