# backend/Dockerfile
FROM node:20-bullseye-slim

# 1) System packages Prisma needs
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2) Install Node deps (include devDeps so prisma is available)
COPY package*.json ./
RUN npm install

# 3) Copy the rest (brings in prisma/schema.prisma)
COPY . .

# 4) Generate Prisma client (now that schema exists + deps installed)
#    (explicit schema path is just to be safe)
RUN npx prisma generate --schema=prisma/schema.prisma

# 5) Build TypeScript
RUN npm run build

EXPOSE 4000

# 6) Start
CMD ["node", "dist/index.js"]
