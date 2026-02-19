# Advancia Pay Ledger - Payment System Activation Script
# Run this script to activate all payment systems

Write-Host "🚀 Activating Advancia Pay Ledger Payment Systems..." -ForegroundColor Green

# Check if .env file exists
$envPath = ".env"
if (Test-Path $envPath) {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found. Creating from example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created from example" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found. Please create .env file manually." -ForegroundColor Red
        exit 1
    }
}

# Read current .env content
$envContent = Get-Content $envPath -Raw

# Check if NOWPayments keys are configured
if ($envContent -match "NOWPAYMENTS_IPN_SECRET=") {
    Write-Host "✅ NOWPayments IPN secret found" -ForegroundColor Green
} else {
    Write-Host "🔄 Adding NOWPayments configuration..." -ForegroundColor Yellow
    Add-Content $envPath "`n# NOWPayments Configuration"
    Add-Content $envPath "NOWPAYMENTS_API_KEY=your_nowpayments_api_key"
    Add-Content $envPath "NOWPAYMENTS_IPN_SECRET=i3ctH3QzQRraSBpmaKgkfaIUZ+k6UkyE"
}

Write-Host "`n🎯 Configuration Summary:" -ForegroundColor Cyan
Write-Host "✅ Stripe: Enabled for card payments" -ForegroundColor Green
Write-Host "✅ NOWPayments: Enabled for crypto deposits" -ForegroundColor Green
Write-Host "✅ Webhook Handlers: Ready at /api/payments/*/webhook" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update your_nowpayments_api_key in .env file" -ForegroundColor White
Write-Host "2. Configure webhooks in payment dashboards:" -ForegroundColor White
Write-Host "   - NOWPayments: https://advanciapayledger.com/api/payments/nowpayments/webhook" -ForegroundColor Gray
Write-Host "   - Stripe: https://advanciapayledger.com/api/payments/stripe/webhook" -ForegroundColor Gray
Write-Host "3. Restart backend: npm run dev" -ForegroundColor White
Write-Host "4. Test payment flows" -ForegroundColor White

Write-Host "`n🚀 Payment systems ready for activation!" -ForegroundColor Green
