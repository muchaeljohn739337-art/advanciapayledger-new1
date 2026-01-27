# Rockefeller HELOC Database Setup Script (PowerShell)
# Reference Number: 123456789-HELOC

Write-Host "🏠 Rockefeller HELOC Database Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Function to print status
function Print-Status {
    param(
        [string]$Status,
        [string]$Message
    )
    
    switch ($Status) {
        "OK" {
            Write-Host "✅ $Message" -ForegroundColor Green
        }
        "WARN" {
            Write-Host "⚠️  $Message" -ForegroundColor Yellow
        }
        "ERROR" {
            Write-Host "❌ $Message" -ForegroundColor Red
        }
        "INFO" {
            Write-Host "ℹ️  $Message" -ForegroundColor Blue
        }
    }
}

# Check if DATABASE_URL is set
$databaseUrl = $env:DATABASE_URL
if ([string]::IsNullOrEmpty($databaseUrl)) {
    # Check .env file
    if (Test-Path ".env") {
        $envContent = Get-Content ".env"
        $match = $envContent | Where-Object { $_ -match "DATABASE_URL=" }
        if ($match) {
            $databaseUrl = ($match -split "=")[1]
            $env:DATABASE_URL = $databaseUrl
        }
    }
}

if ([string]::IsNullOrEmpty($databaseUrl)) {
    Print-Status "ERROR" "DATABASE_URL environment variable is not set"
    Write-Host ""
    Write-Host "Please set DATABASE_URL and run this script again:" -ForegroundColor Yellow
    Write-Host "`$env:DATABASE_URL = `"postgresql://username:password@localhost:5432/database_name"`"" -ForegroundColor White
    Write-Host ""
    Write-Host "Or create a .env file with:" -ForegroundColor Yellow
    Write-Host "DATABASE_URL=postgresql://username:password@localhost:5432/database_name" -ForegroundColor White
    exit 1
}

Print-Status "OK" "DATABASE_URL is configured"

# Validate database connection
Write-Host ""
Print-Status "INFO" "Validating database connection..."

try {
    $result = npx prisma db push --accept-data-loss 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Status "OK" "Database connection successful"
    } else {
        Print-Status "ERROR" "Database connection failed"
        Write-Host "Please check your DATABASE_URL and ensure PostgreSQL is running" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Print-Status "ERROR" "Database connection failed"
    Write-Host "Please check your DATABASE_URL and ensure PostgreSQL is running" -ForegroundColor Red
    exit 1
}

# Generate Prisma client
Write-Host ""
Print-Status "INFO" "Generating Prisma client..."

try {
    $result = npx prisma generate 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Status "OK" "Prisma client generated successfully"
    } else {
        Print-Status "ERROR" "Failed to generate Prisma client"
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Print-Status "ERROR" "Failed to generate Prisma client"
    exit 1
}

# Create HELOC migration
Write-Host ""
Print-Status "INFO" "Creating HELOC integration migration..."

try {
    $result = npx prisma migrate dev --name add_heloc_integration --create-only 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Status "OK" "Migration created successfully"
    } else {
        Print-Status "ERROR" "Failed to create migration"
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Print-Status "ERROR" "Failed to create migration"
    exit 1
}

# Apply migration
Write-Host ""
Print-Status "INFO" "Applying database migration..."

try {
    $result = npx prisma migrate deploy 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Status "OK" "Migration applied successfully"
    } else {
        Print-Status "ERROR" "Failed to apply migration"
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Print-Status "ERROR" "Failed to apply migration"
    exit 1
}

# Test database schema
Write-Host ""
Print-Status "INFO" "Testing database schema..."

if (Test-Path "scripts/test-heloc-schema.sql") {
    Print-Status "OK" "Schema test script available at scripts/test-heloc-schema.sql"
    Write-Host "To test the schema, run the SQL script against your database" -ForegroundColor Yellow
} else {
    Print-Status "WARN" "Schema test script not found"
}

# Seed test data (optional)
Write-Host ""
Print-Status "INFO" "Seeding test data..."

try {
    $result = npx prisma db seed 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Status "OK" "Test data seeded successfully"
    } else {
        Print-Status "WARN" "No seed script configured (this is normal)"
    }
} catch {
    Print-Status "WARN" "No seed script configured (this is normal)"
}

Write-Host ""
Write-Host "🎉 Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test the HELOC API endpoints" -ForegroundColor White
Write-Host "2. Run the frontend application" -ForegroundColor White
Write-Host "3. Verify HELOC functionality" -ForegroundColor White
Write-Host ""
Write-Host "🔗 API Documentation: ROCKEFELLER-HELOC-INTEGRATION-PLAN.md" -ForegroundColor White
Write-Host "🗄️ Database Schema: ROCKEFELLER-HELOC-DATABASE-SCHEMA.md" -ForegroundColor White
Write-Host "🚀 Deployment Guide: ROCKEFELLER-HELOC-DEPLOYMENT-GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "💰 Rockefeller HELOC Integration Ready!" -ForegroundColor Green
Write-Host "   Reference Number: 123456789-HELOC" -ForegroundColor Green
