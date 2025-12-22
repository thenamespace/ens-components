# Build stage
FROM node:20-alpine AS builder

# Install build dependencies for native modules (if needed)
# Python and build tools are required for some optional native dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
# Using npm ci for faster, reliable, reproducible builds
RUN npm ci --legacy-peer-deps

# Copy source code and configuration
COPY . .

# Build Storybook with verbose output to catch any issues
RUN npm run build-storybook 2>&1 | tee /tmp/build.log || (cat /tmp/build.log && exit 1)

# Verify storybook-static directory was created and has content
RUN test -d storybook-static && test -f storybook-static/index.html || (echo "Storybook build failed - no output directory" && exit 1)

# List built stories JSON to verify all stories were included
RUN if [ -f storybook-static/index.json ]; then echo "=== Stories in build ===" && cat storybook-static/index.json | head -100; fi

# Production stage
FROM nginx:alpine

# Set ownership and permissions for nginx directories
# The nginx user already exists in nginx:alpine image (UID 101)
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid && \
    chmod 755 /var/cache/nginx && \
    chmod 755 /var/log/nginx

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown nginx:nginx /etc/nginx/conf.d/default.conf

# Copy the built Storybook static files from builder stage
COPY --from=builder /app/storybook-static /usr/share/nginx/html

# Set ownership of copied files
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user (nginx user with UID 101)
USER nginx

# Expose port 3000 (doesn't require root privileges since it's > 1024)
EXPOSE 3000

# Start nginx as non-root user
CMD ["nginx", "-g", "daemon off;"]
