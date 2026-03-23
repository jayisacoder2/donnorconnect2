#!/bin/bash

# EC2 Instance Setup Script
# Run this on the EC2 instance after connecting via SSH

set -e

echo "🚀 DonorConnect Setup on EC2"
echo "============================"

# Variables
APP_DIR="/home/ubuntu/donorconnect"
PORT=3000

# Step 1: Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Step 2: Install Node.js (v20 LTS)
echo "📦 Installing Node.js..."
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Step 3: Install pnpm
echo "📦 Installing pnpm..."
npm install -g pnpm

# Step 4: Install PostgreSQL client (for database connections)
echo "📦 Installing PostgreSQL client..."
sudo apt-get install -y postgresql-client

# Step 5: Install PM2 (process manager for running Node.js apps)
echo "📦 Installing PM2..."
npm install -g pm2

# Step 6: Verify installations
echo ""
echo "✅ Installed Versions:"
node --version
pnpm --version
postgres --version || echo "PostgreSQL client installed"
pm2 --version

# Step 7: Clone repository (if not already cloned)
if [ ! -d "$APP_DIR" ]; then
    echo ""
    echo "📝 Cloning DonorConnect repository..."
    git clone https://github.com/YOUR_GITHUB_USERNAME/donorconnect.git "$APP_DIR"
    cd "$APP_DIR"
else
    echo ""
    echo "✅ Repository already exists at $APP_DIR"
    cd "$APP_DIR"
    git pull
fi

# Step 8: Create environment file
echo ""
echo "📝 Setting up environment variables..."
if [ ! -f .env.local ]; then
    # Copy from example
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "⚠️  Please manual update .env.local with your configuration:"
        echo "     - DATABASE_URL: Your PostgreSQL connection string"
        echo "     - NEXTAUTH_SECRET: Generate with: openssl rand -base64 32"
    fi
fi

# Step 9: Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Step 10: Generate Prisma client
echo ""
echo "📝 Generating Prisma client..."
npx prisma generate

# Step 11: Build the app
echo ""
echo "🏗️  Building DonorConnect..."
pnpm build

# Step 12: Setup PM2 ecosystem file
echo ""
echo "📝 Setting up PM2 ecosystem..."
cat > ecosystem.config.js << 'ECOSYSTEM'
module.exports = {
  apps: [{
    name: 'donorconnect',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/donorconnect/error.log',
    out_file: '/var/log/donorconnect/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
ECOSYSTEM

# Step 13: Create log directory
echo "📁 Creating log directories..."
sudo mkdir -p /var/log/donorconnect
sudo chown ubuntu:ubuntu /var/log/donorconnect

# Step 14: Start with PM2
echo ""
echo "🚀 Starting DonorConnect with PM2..."
pm2 start ecosystem.config.js
pm2 save

# Step 15: Setup PM2 to start on boot
echo "⚙️  Setting up PM2 startup..."
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Step 16: Install Nginx (reverse proxy)
echo ""
echo "📦 Installing Nginx..."
sudo apt-get install -y nginx

# Step 17: Configure Nginx
echo "📝 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/donorconnect > /dev/null <<EOF
upstream donorconnect {
    server localhost:3000;
}

server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://donorconnect;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # WebSocket support
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
EOF

# Enable the Nginx site
sudo ln -sf /etc/nginx/sites-available/donorconnect /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx

# Step 18: Setup SSL with Let's Encrypt (optional)
echo ""
echo "📝 SSL Setup Instructions (optional):"
echo "   1. Point your domain to this instance IP"
echo "   2. Run: sudo apt-get install -y certbot python3-certbot-nginx"
echo "   3. Run: sudo certbot --nginx -d yourdomain.com"

# Summary
echo ""
echo "=================================="
echo "✅ EC2 SETUP COMPLETE"
echo "=================================="
echo ""
echo "📌 Application Information:"
echo "   App Directory: $APP_DIR"
echo "   Port: $PORT"
echo "   Process Manager: PM2"
echo "   Reverse Proxy: Nginx"
echo ""
echo "📋 Useful PM2 Commands:"
echo "   pm2 status                    # Check app status"
echo "   pm2 logs donorconnect         # View logs"
echo "   pm2 restart donorconnect      # Restart app"
echo "   pm2 stop donorconnect         # Stop app"
echo ""
echo "📋 Useful Nginx Commands:"
echo "   sudo systemctl status nginx   # Check Nginx status"
echo "   sudo systemctl restart nginx  # Restart Nginx"
echo ""
echo "⚠️  IMPORTANT - Before deploying to production:"
echo "   1. Update .env.local with production database URL"
echo "   2. Set up SSL certificate with Let's Encrypt"
echo "   3. Configure firewall rules"
echo "   4. Set up database backups"
echo "   5. Monitor app logs: pm2 logs"
echo ""
