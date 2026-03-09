# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files with backend/ prefix
COPY backend/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy node modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY backend/ .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]