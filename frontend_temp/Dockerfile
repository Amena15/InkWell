# Development stage
FROM node:18-alpine AS development

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.6.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application, excluding node_modules
COPY --chown=node:node . .

# Expose the port the app runs on
EXPOSE 3000

# Start the development server
CMD ["pnpm", "dev"]

# Production stage
FROM development AS production

# Build the application
RUN pnpm run build

# Start the production server
CMD ["pnpm", "start"]
