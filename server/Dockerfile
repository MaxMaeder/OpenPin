# Use Node.js base image
FROM node:20-slim

# Install ffmpeg with lavfi support
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy root dependencies and install
COPY package*.json ./
RUN npm install

# Copy dashboard dependencies and install
COPY dashboard/package*.json ./dashboard/
RUN cd dashboard && npm install

# Copy all source files (after deps are installed to optimize caching)
COPY . .

# Build dashboard (Vite)
RUN cd dashboard && npm run build

# Build root app
RUN npm run build

# Expose port (adjust if needed)
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
