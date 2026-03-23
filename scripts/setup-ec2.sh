#!/bin/bash

# DonorConnect EC2 Initial Setup Script
# Run this on a fresh Ubuntu EC2 instance to prepare it for deployment
# Usage: bash setup-ec2.sh

set -e

echo "=========================================="
echo "DonorConnect EC2 Initial Setup"
echo "=========================================="
echo ""

# Update system
echo "1️⃣  Updating system packages..."
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# Install core dependencies
echo "2️⃣  Installing core dependencies..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    net-tools \
    htop

# Install Docker
echo "3️⃣  Installing Docker..."
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
echo "4️⃣  Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log Docker and Docker Compose versions
echo ""
echo "Installed versions:"
docker --version
docker-compose --version

# Create application directory
echo ""
echo "5️⃣  Creating application directory..."
mkdir -p /home/ubuntu/donorconnect
cd /home/ubuntu/donorconnect

# Create directories for logs
echo "6️⃣  Setting up directories..."
mkdir -p logs

# Configure Docker to use buildkit for faster builds
echo ""
echo "7️⃣  Configuring Docker..."
mkdir -p /etc/docker
cat | sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "features": {
    "buildkit": true
  }
}
EOF
sudo systemctl restart docker

echo ""
echo "=========================================="
echo "✅ EC2 Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next steps:"
echo "   1. Add GitHub SSH key: ssh-keygen -t ed25519"
echo "   2. Clone the repository: git clone <your-repo> /home/ubuntu/donorconnect"
echo "   3. GitHub Actions will handle deployment automatically"
echo ""
echo "📝 Important:"
echo "   - Log out and back in for Docker permissions to take effect"
echo "   - Verify: 'docker ps' should work without sudo"
echo ""
echo "=========================================="
