FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json backend/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY backend ./

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
