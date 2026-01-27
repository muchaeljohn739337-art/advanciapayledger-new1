# ============================================================================
# ADVANCIA PAYLEDGER - VERCEL DEPLOYMENT SCRIPT (PowerShell)
# ============================================================================

Write-Host "🚀 DEPLOYING TO VERCEL - ADVANCIA PAYLEDGER" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Yellow

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run from frontend-clean directory." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Blue
npm install

# Build the project
Write-Host "Building production version..." -ForegroundColor Blue
npm run build

# Check if build was successful
if (-not (Test-Path ".next")) {
    Write-Host "Error: Build failed. .next directory not found." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Check for Vercel CLI
try {
    vercel --version | Out-Null
    Write-Host "Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy options
Write-Host "Choose deployment option:" -ForegroundColor Yellow
Write-Host "1 - Deploy to production"
Write-Host "2 - Deploy to preview"
Write-Host "3 - Link to existing project"
Write-Host "4 - Exit"

$choice = Read-Host "Select option [1-4]"

switch ($choice) {
    "1" {
        Write-Host "Deploying to PRODUCTION..." -ForegroundColor Green
        vercel --prod
    }
    "2" {
        Write-Host "Deploying to PREVIEW..." -ForegroundColor Green
        vercel
    }
    "3" {
        Write-Host "Linking to existing project..." -ForegroundColor Green
        vercel link
        vercel --prod
    }
    "4" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid selection" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update your backend API URL in Vercel environment variables"
Write-Host "2. Set NEXT_PUBLIC_API_URL to your backend domain"
Write-Host "3. Test the deployed application"
Write-Host ""
Write-Host "🚀 Advancia PayLedger is now live on Vercel!" -ForegroundColor Green
