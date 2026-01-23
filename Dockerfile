# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package and config files
COPY package*.json ./
COPY tsconfig*.json nest-cli.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code
COPY src ./src

# Build NestJS application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy environment file if exists
# (Cloud Run will provide env vars at runtime, so this is optional)
RUN if [ -f .env.production ]; then cp .env.production .env; fi

# Cloud Run sets PORT environment variable (default 8080), but we can override it
ENV PORT=8080

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]
