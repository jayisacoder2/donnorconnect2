#!/bin/bash

# Deployment script for DonorConnect on EC2
# This script handles the complete setup and deployment on a fresh EC2 instance

set -e

echo "Starting deployment on EC2..."

# Update system packages
echo "Updating system packages..."
sudo yum update -y

# Install Docker
echo "Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git if not present
echo "Installing Git..."
sudo yum install -y git

# Create app directory
echo "Setting up application directory..."
sudo mkdir -p /opt/donorconnect
sudo chown $USER:$USER /opt/donorconnect
cd /opt/donorconnect

# Clone or update repository
if [ ! -d ".git" ]; then
    echo "Cloning repository..."
    git clone https://github.com/YOUR_USERNAME/donorconnect.git .
else
    echo "Updating repository..."
    git pull origin main
fi

# Create .env file with production secrets
echo "Setting up environment variables..."
cat > .env << EOF
DATABASE_URL=${DATABASE_URL_PROD}
SESSION_SECRET=${SESSION_SECRET}
OPENAI_API_KEY=${OPENAI_API_KEY}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)}
NODE_ENV=production
EOF

# Pull latest images
echo "Pulling latest Docker images..."
docker-compose pull

# Run database migrations
echo "Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Seed the database
echo "Seeding database..."
docker-compose exec -T app npx prisma db seed

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for app to be healthy
echo "Waiting for app to be healthy..."
timeout=300
elapsed=0
while ! curl -f http://localhost/api/health 2>/dev/null; do
  if [ $elapsed -ge $timeout ]; then
    echo "App failed to become healthy within $timeout seconds"
    exit 1
  fi
  echo "Waiting for app to be ready..."
  sleep 10
  elapsed=$((elapsed + 10))
done

echo "Deployment completed successfully!"
echo "App is running at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"