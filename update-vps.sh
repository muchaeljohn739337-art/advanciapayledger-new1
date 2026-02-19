#!/bin/bash
# Quick update script - run this to deploy code changes
# Usage: ./update-vps.sh

set -e

APP_DIR="/var/www/advancia/app"

echo "🔄 Updating Advancia Pay Ledger..."

cd ${APP_DIR}

# Pull latest code
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
cd backend-clean
npm install

# Generate Prisma client
echo "🗄️ Updating database..."
npx prisma generate
npx prisma migrate deploy

# Build
echo "🔨 Building..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart advancia-backend
pm2 save

echo "✅ Update complete!"
echo "📊 Status:"
pm2 status
