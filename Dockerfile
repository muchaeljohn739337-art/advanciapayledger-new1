# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend-clean/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY backend-clean/ .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY backend-clean/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma schema for migrations
COPY backend-clean/prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
