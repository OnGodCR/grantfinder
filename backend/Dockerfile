# ---------- BUILD STAGE ----------
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# System deps for Prisma and TLS
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates curl gnupg \
  && update-ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy manifests + prisma first so any postinstall or generate sees the schema
COPY package*.json ./
COPY prisma ./prisma

# Install deps INCLUDING devDependencies (needed for Prisma CLI)
RUN npm install --include=dev

# (Debug sanity checks — safe to keep)
RUN node -v && npm -v
RUN ls -la && ls -la prisma
RUN npx prisma validate --schema=prisma/schema.prisma
RUN npx prisma --version
RUN npx prisma generate --schema=prisma/schema.prisma --print

# Actually generate Prisma client
RUN npx prisma generate --schema=prisma/schema.prisma --log-level debug

# Copy the rest of the source and build TS
COPY . .
RUN npm run build

# Prune dev deps for runtime
RUN npm prune --production


# ---------- RUNTIME STAGE ----------
FROM node:20-bullseye-slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 4000
CMD ["node", "dist/index.js"]
