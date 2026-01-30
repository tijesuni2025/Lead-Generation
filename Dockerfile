# ============================================================================
# Bluestarai LeadGen Pro - Production Dockerfile
# Multi-stage build for optimized container image
# ============================================================================

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG VITE_APP_VERSION=latest
ARG VITE_BUILD_TIME
ARG VITE_API_URL

ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_BUILD_TIME=$VITE_BUILD_TIME
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Stage 3: Production runner with Nginx
FROM nginx:alpine AS runner

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Labels for container metadata
LABEL org.opencontainers.image.title="Bluestarai LeadGen Pro"
LABEL org.opencontainers.image.description="AI-Powered Lead Management Platform"
LABEL org.opencontainers.image.vendor="BluestarAI World Inc."
LABEL org.opencontainers.image.version="${VITE_APP_VERSION}"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
