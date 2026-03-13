# Deployment Ready

This repo is not the canonical production source. Use it as a migration/reference copy inside this workspace. The canonical production layout is documented in `..\WORKSPACE_CONTROL_TOWER.md`.

## ✅ What's Done

1. ✅ **DNS Setup** - Cloudflare configured
   - Root domain points to Hostinger VPS
   - API subdomain configured
   
2. ✅ **Code Ready** - All systems prepared
   - Backend cleaned and optimized (dead code removed)
   - Frontend built and ready (Next.js 14)
   - Environment variables configured
   - Prisma config migrated to prisma.config.ts

3. ✅ **Documentation** - Comprehensive guides created
   - DEPLOY-FRONTEND-NOW.md (deployment options)
   - quick-deploy.sh (automated deployment script)

4. ✅ **Codebase Cleanup Complete**
   - DigitalOcean references removed
   - Duplicate files removed (28 dead files deleted)
   - Hardcoded credentials removed from server.ts
   - Docker Compose paths fixed
   - TypeScript deprecations resolved

---

## Immediate Next Steps

### Recommended: Hostinger VPS As The Only Production Origin

```bash
# Set your Hostinger VPS IP
export VPS_IP="YOUR_HOSTINGER_VPS_IP"

# Upload the deploy script
scp quick-deploy.sh root@$VPS_IP:/tmp/

# SSH to server
ssh root@$VPS_IP

# Run deployment
chmod +x /tmp/quick-deploy.sh
/tmp/quick-deploy.sh
```

**Time: 15-20 minutes** ⚡

---

### Alternative: Manual Hostinger Deploy

#### A. Deploy Backend

```bash
export VPS_IP="YOUR_HOSTINGER_VPS_IP"
ssh root@$VPS_IP
mkdir -p /opt/backend-clean
# Upload backend files
cd /opt/backend-clean
npm install
npx prisma migrate deploy
pm2 start npm -- start
```

#### B. Deploy Frontend

```bash
# On same server
mkdir -p /opt/frontend-clean
# Upload frontend files
cd /opt/frontend-clean
npm install --production
npm run build
pm2 start "node .next/standalone/server.js" --name "frontend"
```

#### C. Setup Nginx

```bash
apt-get install -y nginx
# Configure reverse proxy to localhost:3000 and :3001
nginx -t
systemctl restart nginx
```

**Time: 30-45 minutes** ⏱️

---

### Alternative: Docker Deploy

```bash
# On your Hostinger VPS
docker-compose up -d
```

**Time: 10-15 minutes** 🐳

---

## Core Active Routes

| Route | Purpose |
| ------- | --------- |
| `/api/auth/*` | Authentication & registration |
| `/api/payments/*` | Payment processing (Stripe, crypto) |
| `/api/crypto/*` | Cryptocurrency operations |
| `/api/dashboard/*` | Dashboard data |
| `/api/kpi/*` | KPI metrics |
| `/api/cards/*` | Virtual cards |
| `/api/admin/*` | Admin analytics & activity |
| `/api/security/*` | Security controls |
| `/api/email/*` | Email service |
| `/api/blockchain/*` | Blockchain integration |

---

## What You'll Have After Deployment

- ✅ Frontend running at <https://advanciapayledger.com>
- ✅ Backend API running at <https://api.advanciapayledger.com>
- ✅ Automatic SSL certificates (Let's Encrypt)
- ✅ Automatic service restart on failure
- ✅ Nginx reverse proxy configured
- ✅ PM2 monitoring all services

---

## Quick Reference

- **Canonical source**: `modullar-advancia` for PayLedger, `advancia-healthcare1` for the separate healthcare app
- **VPS Provider**: Hostinger
- **Frontend Domain**: advanciapayledger.com
- **API Domain**: api.advanciapayledger.com
- **View logs**: `pm2 logs`
- **Monitor**: `pm2 status`
- **Restart all**: `pm2 restart all`

---

## Status

Use this repo only if you are intentionally deploying this variant. Otherwise deploy from the canonical repos above.
