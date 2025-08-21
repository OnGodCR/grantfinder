# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Generate Prisma client (safe without DB access)
RUN npm run generate || npx prisma generate

# Build TypeScript
RUN npm run build

# Expose app port
EXPOSE 4000

# Start the server
CMD ["node", "dist/index.js"]
