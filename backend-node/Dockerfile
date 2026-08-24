# Production-ready Dockerfile for Node.js Express Backend
FROM node:20-alpine AS base

WORKDIR /app

# Copy package manifests first for efficient layer caching
COPY package*.json ./

RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose server port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
