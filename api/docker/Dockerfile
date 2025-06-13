# Stage 1: Build
FROM node:23-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code and build the app
COPY . .
RUN npm run build

# Stage 2: Production Image
FROM node:23-alpine

# Set the working directory
WORKDIR /app

# Copy package files and node_modules from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application code
COPY --from=builder /app/dist/src ./dist/src

# Start the application
CMD ["npm", "start"]
