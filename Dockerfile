# Production image
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Set working directory
WORKDIR /app/apps/api

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Use tsx to run TypeScript directly (handles monorepo imports)
CMD ["npx", "tsx", "src/server.ts"]
