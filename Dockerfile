# ==============================================================================
# Multi-stage production Dockerfile for SmartAttend AI
# Compatible with AWS App Runner, Amazon ECS Fargate, and Amazon EKS
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./
RUN npm ci

# Copy full application source code
COPY . .

# Build Vite React SPA into /app/dist
RUN npm run build

# Stage 2: Production Server Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy compiled backend and built static assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src

# Expose port 3000 for AWS App Runner / ALB
EXPOSE 3000

# Healthcheck for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start production server using tsx
CMD ["npx", "tsx", "server.ts"]
