#!/bin/bash
# ============================================================================
# Advancia Pay Ledger - Hostinger VPS Deployment Script
# Run this on your VPS as root or with sudo
# ============================================================================

set -e

echo "🚀 Advancia Pay Ledger VPS Deployment"
echo "======================================"

# Configuration - UPDATE THESE
DOMAIN="advanciapayledger.com"
APP_USER="advancia"
APP_DIR="/var/www/advancia"
REPO_URL="git@github.com:muchaeljohn739337-art/advanciapayledger-new1.git"
NODE_VERSION="20"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  error "Please run as root (sudo ./deploy-vps.sh)"
fi

# ============================================================================
# 1. System Updates
# ============================================================================
log "Updating system packages..."
apt update && apt upgrade -y

# ============================================================================
# 2. Install Dependencies
# ============================================================================
log "Installing dependencies..."
apt install -y curl git nginx certbot python3-certbot-nginx ufw

# Install Node.js
log "Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# Install PM2 globally
log "Installing PM2..."
npm install -g pm2

# ============================================================================
# 3. Install PostgreSQL
# ============================================================================
log "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
log "Setting up PostgreSQL database..."
DB_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)
sudo -u postgres psql <<EOF
CREATE USER advancia WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE advancia_payledger OWNER advancia;
GRANT ALL PRIVILEGES ON DATABASE advancia_payledger TO advancia;
EOF

echo "DATABASE_URL=postgresql://advancia:${DB_PASSWORD}@localhost:5432/advancia_payledger" > /tmp/db_credentials.txt
log "Database credentials saved to /tmp/db_credentials.txt"

# ============================================================================
# 4. Create Application User
# ============================================================================
log "Creating application user..."
if ! id "${APP_USER}" &>/dev/null; then
  useradd -m -s /bin/bash ${APP_USER}
fi

# ============================================================================
# 5. Setup Application Directory
# ============================================================================
log "Setting up application directory..."
mkdir -p ${APP_DIR}
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

# Clone repository
log "Cloning repository..."
sudo -u ${APP_USER} git clone ${REPO_URL} ${APP_DIR}/app || {
  warn "Clone failed, trying to pull instead..."
  cd ${APP_DIR}/app && sudo -u ${APP_USER} git pull
}

# ============================================================================
# 6. Setup Environment Variables
# ============================================================================
log "Setting up environment variables..."
cat > ${APP_DIR}/app/backend-clean/.env <<EOF
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://advancia:${DB_PASSWORD}@localhost:5432/advancia_payledger

# Security (Generate new ones for production)
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
SESSION_SECRET=$(openssl rand -base64 64 | tr -d '\n')
API_KEY=$(openssl rand -base64 32 | tr -d '\n')
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Email - Postmark
POSTMARK_API_KEY=YOUR_POSTMARK_API_KEY
EMAIL_FROM=admin@${DOMAIN}

# Stripe
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET

# NOWPayments (Crypto)
NOWPAYMENTS_API_KEY=YOUR_NOWPAYMENTS_API_KEY
NOWPAYMENTS_IPN_SECRET=YOUR_NOWPAYMENTS_IPN_SECRET

# Alchemy
ALCHEMY_PAY_API_KEY=YOUR_ALCHEMY_API_KEY

# App URLs
APP_URL=https://${DOMAIN}
CORS_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}
EOF

chown ${APP_USER}:${APP_USER} ${APP_DIR}/app/backend-clean/.env
chmod 600 ${APP_DIR}/app/backend-clean/.env

warn "⚠️  UPDATE ${APP_DIR}/app/backend-clean/.env with your actual API keys!"

# ============================================================================
# 7. Install Dependencies & Build
# ============================================================================
log "Installing dependencies and building..."
cd ${APP_DIR}/app/backend-clean
sudo -u ${APP_USER} npm install
sudo -u ${APP_USER} npx prisma generate
sudo -u ${APP_USER} npx prisma migrate deploy
sudo -u ${APP_USER} npm run build

# ============================================================================
# 8. Setup PM2
# ============================================================================
log "Setting up PM2..."
cat > ${APP_DIR}/app/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'advancia-backend',
    cwd: '${APP_DIR}/app/backend-clean',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '${APP_DIR}/logs/error.log',
    out_file: '${APP_DIR}/logs/out.log',
    time: true,
    max_memory_restart: '500M',
    exp_backoff_restart_delay: 100
  }]
};
EOF

mkdir -p ${APP_DIR}/logs
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

# Start with PM2
cd ${APP_DIR}/app
sudo -u ${APP_USER} pm2 start ecosystem.config.js
sudo -u ${APP_USER} pm2 save

# Setup PM2 startup
pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}

# ============================================================================
# 9. Configure Nginx
# ============================================================================
log "Configuring Nginx..."
cat > /etc/nginx/sites-available/advancia <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    # Stripe webhooks
    location /api/webhooks/stripe {
        proxy_pass http://127.0.0.1:3000/api/webhooks/stripe;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

ln -sf /etc/nginx/sites-available/advancia /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ============================================================================
# 10. Setup SSL with Let's Encrypt
# ============================================================================
log "Setting up SSL certificate..."
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m admin@${DOMAIN} || {
  warn "SSL setup failed. Run manually: certbot --nginx -d ${DOMAIN}"
}

# ============================================================================
# 11. Configure Firewall
# ============================================================================
log "Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# ============================================================================
# 12. Setup Auto-renewal for SSL
# ============================================================================
log "Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -

# ============================================================================
# Done!
# ============================================================================
echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=============================================="
echo ""
echo "📝 Next steps:"
echo "1. Update API keys in: ${APP_DIR}/app/backend-clean/.env"
echo "2. Restart the app: pm2 restart advancia-backend"
echo "3. Check status: pm2 status"
echo "4. View logs: pm2 logs advancia-backend"
echo ""
echo "🔐 Database credentials saved to: /tmp/db_credentials.txt"
echo "   (Delete after copying to .env)"
echo ""
echo "🌐 Your app should be live at: https://${DOMAIN}"
echo ""
