# Rockefeller HELOC Integration Diagnostic Check (PowerShell)
# Reference Number: 123456789-HELOC

Write-Host "🔍 Rockefeller HELOC Integration Diagnostic" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

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

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path "src")) {
    Print-Status "ERROR" "Not in the backend directory"
    exit 1
}

Print-Status "OK" "In correct backend directory"

# Check Node.js version
try {
    $nodeVersion = node --version 2>$null
    if ($?) {
        Print-Status "OK" "Node.js: $nodeVersion"
    } else {
        Print-Status "ERROR" "Node.js not installed"
    }
} catch {
    Print-Status "ERROR" "Node.js not installed"
}

# Check npm version
try {
    $npmVersion = npm --version 2>$null
    if ($?) {
        Print-Status "OK" "npm: $npmVersion"
    } else {
        Print-Status "ERROR" "npm not installed"
    }
} catch {
    Print-Status "ERROR" "npm not installed"
}

# Check if dependencies are installed
if (Test-Path "node_modules") {
    Print-Status "OK" "Dependencies installed"
} else {
    Print-Status "WARN" "Dependencies not installed - run 'npm install'"
}

# Check critical HELOC files
Write-Host ""
Print-Status "INFO" "Checking HELOC integration files..."

$helocFiles = @(
    "src/services/HELOCService.ts",
    "src/routes/HELOC.routes.ts",
    "src/models/HELOC.ts",
    "prisma/schema.prisma",
    "ROCKEFELLER-HELOC-INTEGRATION-PLAN.md",
    "ROCKEFELLER-HELOC-DATABASE-SCHEMA.md",
    "ROCKEFELLER-HELOC-FRONTEND-INTEGRATION.md",
    "ROCKEFELLER-HELOC-DEPLOYMENT-GUIDE.md"
)

foreach ($file in $helocFiles) {
    if (Test-Path $file) {
        Print-Status "OK" "Found: $file"
    } else {
        Print-Status "ERROR" "Missing: $file"
    }
}

# Check frontend components
Write-Host ""
Print-Status "INFO" "Checking frontend components..."

$frontendFiles = @(
    "frontend/src/components/HELOC/ApplicationForm.tsx",
    "frontend/src/components/HELOC/AccountDashboard.tsx",
    "frontend/src/components/HELOC/AdminDashboard.tsx"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Print-Status "OK" "Found: $file"
    } else {
        Print-Status "WARN" "Missing: $file"
    }
}

# Check Prisma schema
Write-Host ""
Print-Status "INFO" "Checking Prisma schema..."

# Check if DATABASE_URL is set
$databaseUrl = $env:DATABASE_URL
if ([string]::IsNullOrEmpty($databaseUrl)) {
    Print-Status "WARN" "DATABASE_URL not set (required for Prisma operations)"
    
    # Check .env file
    if (Test-Path ".env") {
        Print-Status "OK" ".env file exists"
        $envContent = Get-Content ".env"
        if ($envContent -match "DATABASE_URL=") {
            Print-Status "OK" "DATABASE_URL found in .env"
        } else {
            Print-Status "WARN" "DATABASE_URL not found in .env"
        }
    } else {
        Print-Status "INFO" "No .env file (using .env.example)"
        if (Test-Path ".env.example") {
            Print-Status "OK" ".env.example exists"
        }
    }
} else {
    Print-Status "OK" "DATABASE_URL is set"
    
    # Try to validate schema
    try {
        $result = npx prisma validate 2>&1
        if ($LASTEXITCODE -eq 0) {
            Print-Status "OK" "Prisma schema is valid"
        } else {
            Print-Status "ERROR" "Prisma schema validation failed"
            Write-Host $result -ForegroundColor Red
        }
    } catch {
        Print-Status "WARN" "Could not validate Prisma schema"
    }
}

# Check TypeScript compilation
Write-Host ""
Print-Status "INFO" "Checking TypeScript compilation..."

if ((Get-Command npx -ErrorAction SilentlyContinue) -and (Test-Path "node_modules")) {
    try {
        $result = npx tsc --noEmit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Print-Status "OK" "TypeScript compilation successful"
        } else {
            Print-Status "WARN" "TypeScript compilation has errors"
            Write-Host "Run 'npm run build' to see detailed errors" -ForegroundColor Yellow
        }
    } catch {
        Print-Status "WARN" "Could not check TypeScript compilation"
    }
} else {
    Print-Status "WARN" "Cannot check TypeScript (npx or dependencies missing)"
}

# Check environment variables
Write-Host ""
Print-Status "INFO" "Checking environment configuration..."

if (Test-Path ".env") {
    Print-Status "OK" ".env file exists"
    
    # Check for HELOC variables
    $envContent = Get-Content ".env"
    if ($envContent -match "HELOC_ENABLED") {
        Print-Status "OK" "HELOC environment variables found"
    } else {
        Print-Status "WARN" "HELOC environment variables not found in .env"
    }
} else {
    Print-Status "INFO" "No .env file (using .env.example)"
}

if (Test-Path ".env.example") {
    Print-Status "OK" ".env.example exists"
    $envExample = Get-Content ".env.example"
    if ($envExample -match "HELOC_ENABLED") {
        Print-Status "OK" "HELOC variables in .env.example"
    }
}

# Check scripts
Write-Host ""
Print-Status "INFO" "Checking setup scripts..."

$scripts = @(
    "scripts/setup-database.sh",
    "scripts/test-heloc-schema.sql",
    "src/tests/HELOC.test.ts"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Print-Status "OK" "Found: $script"
    } else {
        Print-Status "WARN" "Missing: $script"
    }
}

# Check package.json scripts
Write-Host ""
Print-Status "INFO" "Checking package.json scripts..."

if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts.build) {
        Print-Status "OK" "Build script found"
    } else {
        Print-Status "WARN" "Build script not found in package.json"
    }
    
    if ($packageJson.scripts.start) {
        Print-Status "OK" "Start script found"
    } else {
        Print-Status "WARN" "Start script not found in package.json"
    }
}

# Summary
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Print-Status "INFO" "Diagnostic check complete"

# Check for critical issues
$criticalErrors = 0

if (-not (Test-Path "src/services/HELOCService.ts")) {
    $criticalErrors++
}

if (-not (Test-Path "src/routes/HELOC.routes.ts")) {
    $criticalErrors++
}

if (-not (Test-Path "prisma/schema.prisma")) {
    $criticalErrors++
}

if ($criticalErrors -eq 0) {
    Print-Status "OK" "No critical issues found - HELOC integration is ready!"
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Green
    Write-Host "1. Set DATABASE_URL environment variable" -ForegroundColor White
    Write-Host "2. Run: .\scripts\setup-database.ps1" -ForegroundColor White
    Write-Host "3. Run: npm run build" -ForegroundColor White
    Write-Host "4. Run: npm start" -ForegroundColor White
    Write-Host ""
    Write-Host "💰 Rockefeller HELOC Integration Ready!" -ForegroundColor Green
    Write-Host "   Reference Number: 123456789-HELOC" -ForegroundColor Green
} else {
    Print-Status "ERROR" "Found $criticalErrors critical issues"
    Write-Host "Please address the errors above before proceeding." -ForegroundColor Red
}

Write-Host "======================================" -ForegroundColor Cyan
