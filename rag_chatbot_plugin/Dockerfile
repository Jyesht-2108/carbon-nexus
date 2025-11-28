# RAG Chatbot Plugin Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY public ./public

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8004

# Start the application
CMD ["npm", "start"]
