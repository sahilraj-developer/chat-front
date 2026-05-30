# Stage 1: Build the React/Vite app
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Pass environment variable for Vite build
ARG VITE_BACKEND_URL=http://localhost:5000
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
# Vite builds to 'dist' by default
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
