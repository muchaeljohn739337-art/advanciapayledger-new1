# ============================================================
# Advancia PayLedger - Deploy to Hostinger VPS
# Run from project root: .\DEPLOY-HOSTINGER.ps1
# ============================================================

# UPDATE THIS with your Hostinger VPS IP
$VPS_IP = "YOUR_HOSTINGER_VPS_IP"
$VPS_USER = "root"
$APP_DIR = "/var/www/advancia"

if ($VPS_IP -eq "YOUR_HOSTINGER_VPS_IP") {
  Write-Host "ERROR: Set your Hostinger VPS IP in DEPLOY-HOSTINGER.ps1 (line 7)" -ForegroundColor Red
  exit 1
}

Write-Host "Deploying to Hostinger VPS: $VPS_IP" -ForegroundColor Cyan

# ---- 1. Copy files to VPS ----
Write-Host "`n[1/4] Uploading files..." -ForegroundColor Yellow

# Build frontend first
Write-Host "Building frontend..."
Set-Location frontend-clean
npm run build 2>&1 | Select-Object -Last 5
Set-Location ..

# Sync backend
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p ${APP_DIR}/backend ${APP_DIR}/frontend"
scp -r backend-clean/dist            "${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/"
scp    backend-clean/package.json    "${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/"
scp    backend-clean/package-lock.json "${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/"
scp -r backend-clean/prisma          "${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/"
scp    backend-clean/.env.production "${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/.env"

# Sync frontend build
scp -r frontend-clean/.next          "${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/"
scp -r frontend-clean/public         "${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/"
scp    frontend-clean/package.json   "${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/"
scp    frontend-clean/package-lock.json "${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/" 2>$null
scp    frontend-clean/.env.production "${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/.env.local"
scp    frontend-clean/next.config.js "${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/" 2>$null
scp    frontend-clean/next.config.ts "${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/" 2>$null

Write-Host "[1/4] Upload complete" -ForegroundColor Green

# ---- 2. Install + start on VPS ----
Write-Host "`n[2/4] Installing dependencies and starting services..." -ForegroundColor Yellow

ssh "${VPS_USER}@${VPS_IP}" @"
set -e

# Install Node.js 20 if not present
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

# Install PM2 globally if not present
npm install -g pm2 2>/dev/null || true

# Install Redis if not present
if ! command -v redis-server &>/dev/null; then
  apt install -y redis-server
  systemctl enable redis-server
  systemctl start redis-server
fi

# Backend setup
cd ${APP_DIR}/backend
npm install --omit=dev
npx prisma generate 2>/dev/null || true
pm2 delete advancia-backend 2>/dev/null || true
pm2 start dist/index.js --name advancia-backend --env production
pm2 save

# Frontend setup
cd ${APP_DIR}/frontend
npm install --omit=dev
pm2 delete advancia-frontend 2>/dev/null || true
pm2 start npm --name advancia-frontend -- start
pm2 save

pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo "Services started"
"@

Write-Host "[2/4] Services started" -ForegroundColor Green

# ---- 3. Nginx config ----
Write-Host "`n[3/4] Configuring Nginx..." -ForegroundColor Yellow

$nginxConf = @"
server {
    listen 80;
    server_name advanciapayledger.com www.advanciapayledger.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_cache_bypass `$http_upgrade;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
}
server {
    listen 80;
    server_name api.advanciapayledger.com;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_cache_bypass `$http_upgrade;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
}
"@

ssh "${VPS_USER}@${VPS_IP}" @"
apt install -y nginx certbot python3-certbot-nginx 2>/dev/null || true
cat > /etc/nginx/sites-available/advancia << 'NGINX'
${nginxConf}
NGINX
ln -sf /etc/nginx/sites-available/advancia /etc/nginx/sites-enabled/advancia
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "Nginx configured"
"@

Write-Host "[3/4] Nginx configured" -ForegroundColor Green

# ---- 4. SSL ----
Write-Host "`n[4/4] Setting up SSL (Let's Encrypt)..." -ForegroundColor Yellow
Write-Host "Run this on the VPS after DNS is pointed to ${VPS_IP}:" -ForegroundColor Cyan
Write-Host "  certbot --nginx -d advanciapayledger.com -d www.advanciapayledger.com -d api.advanciapayledger.com" -ForegroundColor White

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "  Frontend: http://advanciapayledger.com" -ForegroundColor White
Write-Host "  Backend:  http://api.advanciapayledger.com" -ForegroundColor White
Write-Host "  VPS IP:   $VPS_IP" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Green
