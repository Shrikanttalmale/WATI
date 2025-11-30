#!/bin/bash

# BROADCASTER DEPLOYMENT SCRIPT
# Run this on your VPS (Ubuntu 20.04+)

set -e

echo " Broadcaster Deployment Started..."

# Update system
echo "� Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
echo " Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

# Install Redis
echo " Installing Redis..."
sudo apt-get install -y redis-server

# Install Docker
echo " Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo " Installing Docker Compose..."
sudo apt-get install -y docker-compose

# Install Nginx
echo " Installing Nginx..."
sudo apt-get install -y nginx

# Install PM2 globally
echo " Installing PM2..."
sudo npm install -g pm2

# Create application directory
echo " Creating application directory..."
sudo mkdir -p /var/www/broadcaster
cd /var/www/broadcaster

# Clone repository
echo " Cloning repository..."
git clone https://github.com/Shrikanttalmale/WATI.git .

# Setup environment
echo "  Setting up environment..."
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit environment variables
echo "  Please edit the following files with your settings:"
echo "   - backend/.env (DATABASE_URL, JWT_SECRET, REDIS_URL)"
echo "   - frontend/.env (VITE_API_URL)"
read -p "Press Enter when done..."

# Install dependencies
echo " Installing dependencies..."
npm install

# Build frontend
echo " Building frontend..."
cd frontend
npm run build
cd ..

# Setup database
echo "  Setting up database..."
cd backend
npm run prisma:migrate
cd ..

# Start services with PM2
echo " Starting services..."
pm2 delete broadcaster-backend || true
pm2 delete broadcaster-frontend || true
pm2 delete broadcaster-redis || true

pm2 start "redis-server" --name "broadcaster-redis"
pm2 start "node dist/server.js" --name "broadcaster-backend" --cwd backend
pm2 start "serve -s dist -l 3000" --name "broadcaster-frontend" --cwd frontend

# Setup SSL with Let'\''s Encrypt
echo " Setting up SSL..."
sudo apt-get install -y certbot python3-certbot-nginx
# Note: Run this manually:
# sudo certbot certonly --standalone -d yourdomain.com
# And update Nginx configuration with your domain

# Configure Nginx
echo "  Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx

# Setup Nginx as reverse proxy for PM2 apps
echo " Setting up Nginx configuration..."
sudo tee /etc/nginx/sites-available/broadcaster > /dev/null <<EOL
upstream backend {
    server localhost:3000;
}

upstream frontend {
    server localhost:3001;
}

server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
EOL

sudo ln -sf /etc/nginx/sites-available/broadcaster /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Setup PM2 startup
echo "  Configuring PM2 startup..."
pm2 startup
pm2 save

# Setup monitoring
echo " Setting up monitoring..."
pm2 monit

# Create cron job for backups
echo " Setting up database backups..."
sudo tee /var/www/broadcaster/backup.sh > /dev/null <<'\''EOL'\''
#!/bin/bash
BACKUP_DIR="/var/www/broadcaster/backups"
mkdir -p $BACKUP_DIR
pg_dump broadcaster | gzip > $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql.gz
# Keep only last 7 days of backups
find $BACKUP_DIR -mtime +7 -delete
EOL

sudo chmod +x /var/www/broadcaster/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/broadcaster/backup.sh") | crontab -

echo " Deployment complete!"
echo ""
echo " Summary:"
echo "  - Backend running on http://localhost:3000"
echo "  - Frontend running on http://localhost:3001"
echo "  - Nginx reverse proxy on http://yourdomain.com"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo " Next steps:"
echo "  1. Configure SSL certificate (certbot)"
echo "  2. Update Nginx with your domain"
echo "  3. Setup firewall rules"
echo "  4. Enable monitoring with PM2"
echo ""
echo " Useful commands:"
echo "  - pm2 status       (Check service status)"
echo "  - pm2 logs         (View logs)"
echo "  - pm2 restart all  (Restart all services)"
echo "  - pm2 delete all   (Stop all services)"
