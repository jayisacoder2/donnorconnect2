#!/bin/bash

# DonorConnect Deployment Script for Ubuntu EC2
# This script pulls the latest Docker image and deploys the application
# Usage: bash scripts/deploy.sh <GHCR_USERNAME> <IMAGE_TAG>

set -e

GHCR_USERNAME="${1:-}"
IMAGE_TAG="${2:-latest}"
APP_DIR="${3:-/home/ubuntu/donorconnect}"

if [ -z "$GHCR_USERNAME" ]; then
    echo "Error: GHCR_USERNAME is required"
    echo "Usage: bash scripts/deploy.sh <GHCR_USERNAME> <IMAGE_TAG>"
    exit 1
fi

echo "=========================================="
echo "DonorConnect Deployment"
echo "=========================================="
echo "Image: ghcr.io/$GHCR_USERNAME/donorconnect:$IMAGE_TAG"
echo "App Directory: $APP_DIR"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    sudo apt-get update -y
    sudo apt-get install -y docker.io curl wget
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo "Please re-run this script after Docker installation (log out and back in)"
    exit 0
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create app directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    echo "Creating application directory..."
    mkdir -p "$APP_DIR"
fi

cd "$APP_DIR"

# Create .env file from environment variables passed from GitHub Actions
echo "Setting up environment variables..."
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=$DATABASE_URL
SESSION_SECRET=$SESSION_SECRET
OPENAI_API_KEY=$OPENAI_API_KEY
NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
EOF

echo "Environment variables configured"

# Create docker-compose.prod.yml if it doesn't exist
echo "Setting up docker-compose configuration..."
cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    image: ghcr.io/$GHCR_USERNAME/donorconnect:$IMAGE_TAG
    container_name: donorconnect-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - SESSION_SECRET=\${SESSION_SECRET}
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - NEXT_PUBLIC_APP_URL=\${NEXT_PUBLIC_APP_URL}
    volumes:
      - app-data:/app/public
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

volumes:
  app-data:
    driver: local
EOF

# Stop running containers
echo "Stopping current containers..."
docker-compose down || true

# Pull the latest image
echo "Pulling Docker image from GitHub Container Registry..."
docker pull "ghcr.io/$GHCR_USERNAME/donorconnect:$IMAGE_TAG"

# Start services
echo "Starting application..."
docker-compose up -d

# Run database migrations
echo "Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy || true

# Clean up unused Docker images
echo "Cleaning up unused Docker images..."
docker image prune -f

# Wait for app to be healthy
echo "Waiting for application to be ready..."
timeout=300
elapsed=0
while ! curl -f http://localhost:3000/api/health 2>/dev/null; do
  if [ $elapsed -ge $timeout ]; then
    echo "❌ Application failed to become healthy within $timeout seconds"
    docker-compose logs
    exit 1
  fi
  echo "⏳ Application starting... (${elapsed}s/$timeout)"
  sleep 5
  elapsed=$((elapsed + 5))
done

echo ""
echo "=========================================="
echo "✅ Deployment completed successfully!"
echo "=========================================="
echo "Application is running at: http://$(hostname -I | awk '{print $1}'):3000"
echo "Image: ghcr.io/$GHCR_USERNAME/donorconnect:$IMAGE_TAG"
echo "=========================================="
