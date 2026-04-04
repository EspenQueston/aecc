#!/bin/bash
# ============================================
# AECC Deployment Script for DigitalOcean VPS
# Domain: scholarquest.shop
# VPS IP: 165.227.77.180
# ============================================

set -e

echo "=== AECC Deployment Setup ==="

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PM2 globally
sudo npm install -g pm2

# 4. Install Nginx
sudo apt install -y nginx

# 5. Clone or pull the project
APP_DIR="/var/www/aecc"
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  sudo mkdir -p /var/www
  cd /var/www
  # Replace with your actual git repo URL
  git clone https://github.com/EspenQueston/aecc.git aecc
  cd "$APP_DIR"
fi

# 6. Install dependencies
npm install --production
cd client-react && npm install && npm run build && cd ..

# 7. Create uploads directory
mkdir -p uploads

# 8. Setup PM2
pm2 delete aecc 2>/dev/null || true
pm2 start server/server.js --name aecc --env production
pm2 save
pm2 startup

echo "=== Node app running on port 5000 ==="

# 9. Configure Nginx
sudo tee /etc/nginx/sites-available/scholarquest.shop > /dev/null <<'NGINX'
server {
    listen 80;
    server_name scholarquest.shop www.scholarquest.shop;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/scholarquest.shop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "=== Nginx configured ==="
echo ""
echo "NEXT STEPS:"
echo "1. In Cloudflare DNS, add an A record:"
echo "   Type: A | Name: @ | Content: 165.227.77.180 | Proxy: ON (orange cloud)"
echo "   Type: A | Name: www | Content: 165.227.77.180 | Proxy: ON (orange cloud)"
echo ""
echo "2. In Cloudflare SSL/TLS, set mode to 'Full'"
echo ""
echo "3. Copy .env file to $APP_DIR/.env"
echo ""
echo "4. Restart: pm2 restart aecc"
echo ""
echo "=== Deployment complete! ==="
