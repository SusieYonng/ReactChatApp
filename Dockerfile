# Use Node base image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies (including frontend & backend)
RUN npm install

# Build frontend using Vite
RUN npm run build

# Start backend (which also serves frontend)
CMD ["node", "server/server.js"]