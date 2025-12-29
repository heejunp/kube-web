# Step 1: Build the React Application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and lock files
COPY package.json package-lock.json ./

# Install dependencies (using clean install for consistency)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the app (Vite outputs to /app/dist by default)
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Add custom Nginx config if needed for SPA routing (React Router)
# For this simple project, default config might suffice, but it's good practice to handle try_files
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
