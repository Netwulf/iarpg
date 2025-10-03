# Production image
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Build API
WORKDIR /app/apps/api
RUN rm -f tsconfig.tsbuildinfo && pnpm build && ls -laR dist/

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start from /app/apps/api (already set by previous WORKDIR)
CMD ["node", "dist/server.js"]
