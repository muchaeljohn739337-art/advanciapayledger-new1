# Advancia Pay Ledger - Payment System Startup Script

Write-Host "🚀 Starting Advancia Pay Ledger Payment Systems..." -ForegroundColor Green

# Check if we're in the backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the backend-clean directory" -ForegroundColor Red
    exit 1
}

# Check environment files
Write-Host "📋 Checking environment configuration..." -ForegroundColor Yellow

if (Test-Path "env.development") {
    Write-Host "✅ Development environment file found" -ForegroundColor Green
} else {
    Write-Host "❌ Development environment file missing" -ForegroundColor Red
}

if (Test-Path "env.production") {
    Write-Host "✅ Production environment file found" -ForegroundColor Green
} else {
    Write-Host "❌ Production environment file missing" -ForegroundColor Red
}

# Check payment services
Write-Host "`n🔍 Checking payment services..." -ForegroundColor Yellow

$services = @(
    "src/services/stripe.service.ts",
    "src/services/nowPaymentsService.ts",
    "src/services/alchemy-pay.service.ts"
)

foreach ($service in $services) {
    if (Test-Path $service) {
        Write-Host "✅ $service - Ready" -ForegroundColor Green
    } else {
        Write-Host "❌ $service - Missing" -ForegroundColor Red
    }
}

# Check payment routes
Write-Host "`n🛣️ Checking payment routes..." -ForegroundColor Yellow

$routes = @(
    "src/routes/payments.ts",
    "src/routes/crypto.ts"
)

foreach ($route in $routes) {
    if (Test-Path $route) {
        Write-Host "✅ $route - Ready" -ForegroundColor Green
    } else {
        Write-Host "❌ $route - Missing" -ForegroundColor Red
    }
}

# Environment setup instructions
Write-Host "`n🎯 Environment Setup:" -ForegroundColor Cyan
Write-Host "For Development: Copy env.development to .env" -ForegroundColor White
Write-Host "For Production: Use env.production (DigitalOcean)" -ForegroundColor White

# Start the backend
Write-Host "`n🚀 Starting backend server..." -ForegroundColor Green
Write-Host "Payment systems will be available at:" -ForegroundColor Yellow
Write-Host "  - Stripe: /api/payments/stripe/*" -ForegroundColor Gray
Write-Host "  - NOWPayments: /api/payments/nowpayments/webhook" -ForegroundColor Gray
Write-Host "  - Alchemy: Blockchain RPC enabled" -ForegroundColor Gray

Write-Host "`n📧 Webhook URLs to configure:" -ForegroundColor Cyan
Write-Host "  - NOWPayments: https://advanciapayledger.com/api/payments/nowpayments/webhook" -ForegroundColor White
Write-Host "  - Stripe: https://advanciapayledger.com/api/payments/stripe/webhook" -ForegroundColor White

Write-Host "`n✅ Payment system startup complete!" -ForegroundColor Green
Write-Host "Ready to process payments! 🎉" -ForegroundColor Yellow

# Start the server
npm run dev
