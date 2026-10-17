# ==============================================================================
# CareFlow Backend API - Production Multi-Stage Dockerfile
# Stage 1: Build TypeScript source and generate Prisma Client
# Stage 2: Minimal hardened Node.js 20 Alpine runtime
# ==============================================================================

# Stage 1: Build and Compile
FROM node:20-alpine AS builder

# OpenSSL is required by Prisma CLI engine
RUN apk add --no-cache openssl

WORKDIR /app

# Install all dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci --silent

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and build TypeScript
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

# Install OpenSSL for Prisma engine and curl for Docker health check
RUN apk add --no-cache openssl curl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies + tsx for seeding
COPY package*.json ./
RUN npm ci --silent

# Copy generated Prisma engine, compiled JS distribution, and schema
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy startup entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Ensure storage directories exist with write access
RUN mkdir -p /app/storage/private /app/prisma && chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 5000

# Container Healthcheck targeting CareFlow /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
