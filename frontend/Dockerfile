# Use an official Node.js image as the builder stage
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Build the Next.js app for production
RUN npm run build

# Use a smaller image for the final production container
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the default Next.js port
EXPOSE 3000

# Run the application in production mode
CMD ["npm", "run", "start"]
