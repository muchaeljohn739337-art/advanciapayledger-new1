@echo off
REM Rockefeller HELOC Integration Diagnostic Check (Windows Batch)
REM Reference Number: 123456789-HELOC

echo.
echo 🔍 Rockefeller HELOC Integration Diagnostic
echo ======================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Not in the backend directory
    exit /b 1
)

if not exist "src" (
    echo ❌ Not in the backend directory
    exit /b 1
)

echo ✅ In correct backend directory

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not installed
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js: %%i
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not installed
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm: %%i
)

REM Check dependencies
if exist "node_modules" (
    echo ✅ Dependencies installed
) else (
    echo ⚠️  Dependencies not installed - run 'npm install'
)

REM Check HELOC files
echo.
echo ℹ️  Checking HELOC integration files...

if exist "src\services\HELOCService.ts" (
    echo ✅ Found: src\services\HELOCService.ts
) else (
    echo ❌ Missing: src\services\HELOCService.ts
)

if exist "src\routes\HELOC.routes.ts" (
    echo ✅ Found: src\routes\HELOC.routes.ts
) else (
    echo ❌ Missing: src\routes\HELOC.routes.ts
)

if exist "src\models\HELOC.ts" (
    echo ✅ Found: src\models\HELOC.ts
) else (
    echo ❌ Missing: src\models\HELOC.ts
)

if exist "prisma\schema.prisma" (
    echo ✅ Found: prisma\schema.prisma
) else (
    echo ❌ Missing: prisma\schema.prisma
)

if exist "ROCKEFELLER-HELOC-INTEGRATION-PLAN.md" (
    echo ✅ Found: ROCKEFELLER-HELOC-INTEGRATION-PLAN.md
) else (
    echo ❌ Missing: ROCKEFELLER-HELOC-INTEGRATION-PLAN.md
)

if exist "ROCKEFELLER-HELOC-DATABASE-SCHEMA.md" (
    echo ✅ Found: ROCKEFELLER-HELOC-DATABASE-SCHEMA.md
) else (
    echo ❌ Missing: ROCKEFELLER-HELOC-DATABASE-SCHEMA.md
)

if exist "ROCKEFELLER-HELOC-FRONTEND-INTEGRATION.md" (
    echo ✅ Found: ROCKEFELLER-HELOC-FRONTEND-INTEGRATION.md
) else (
    echo ❌ Missing: ROCKEFELLER-HELOC-FRONTEND-INTEGRATION.md
)

if exist "ROCKEFELLER-HELOC-DEPLOYMENT-GUIDE.md" (
    echo ✅ Found: ROCKEFELLER-HELOC-DEPLOYMENT-GUIDE.md
) else (
    echo ❌ Missing: ROCKEFELLER-HELOC-DEPLOYMENT-GUIDE.md
)

REM Check frontend components
echo.
echo ℹ️  Checking frontend components...

if exist "frontend\src\components\HELOC\ApplicationForm.tsx" (
    echo ✅ Found: frontend\src\components\HELOC\ApplicationForm.tsx
) else (
    echo ⚠️  Missing: frontend\src\components\HELOC\ApplicationForm.tsx
)

if exist "frontend\src\components\HELOC\AccountDashboard.tsx" (
    echo ✅ Found: frontend\src\components\HELOC\AccountDashboard.tsx
) else (
    echo ⚠️  Missing: frontend\src\components\HELOC\AccountDashboard.tsx
)

if exist "frontend\src\components\HELOC\AdminDashboard.tsx" (
    echo ✅ Found: frontend\src\components\HELOC\AdminDashboard.tsx
) else (
    echo ⚠️  Missing: frontend\src\components\HELOC\AdminDashboard.tsx
)

REM Check Prisma
echo.
echo ℹ️  Checking Prisma schema...

REM Check DATABASE_URL
if defined DATABASE_URL (
    echo ✅ DATABASE_URL is set
) else (
    echo ⚠️  DATABASE_URL not set (required for Prisma operations)
    
    if exist ".env" (
        echo ✅ .env file exists
        findstr /C:"DATABASE_URL=" .env >nul
        if %errorlevel% equ 0 (
            echo ✅ DATABASE_URL found in .env
        ) else (
            echo ⚠️  DATABASE_URL not found in .env
        )
    ) else (
        echo ℹ️  No .env file (using .env.example)
        if exist ".env.example" (
            echo ✅ .env.example exists
        )
    )
)

REM Check TypeScript
echo.
echo ℹ️  Checking TypeScript compilation...

if exist "node_modules" (
    npx tsc --noEmit >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ TypeScript compilation successful
    ) else (
        echo ⚠️  TypeScript compilation has errors
        echo Run 'npm run build' to see detailed errors
    )
) else (
    echo ⚠️  Cannot check TypeScript (dependencies missing)
)

REM Check environment files
echo.
echo ℹ️  Checking environment configuration...

if exist ".env" (
    echo ✅ .env file exists
    findstr /C:"HELOC_ENABLED" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ HELOC environment variables found
    ) else (
        echo ⚠️  HELOC environment variables not found in .env
    )
) else (
    echo ℹ️  No .env file (using .env.example)
)

if exist ".env.example" (
    echo ✅ .env.example exists
    findstr /C:"HELOC_ENABLED" .env.example >nul
    if %errorlevel% equ 0 (
        echo ✅ HELOC variables in .env.example
    )
)

REM Check scripts
echo.
echo ℹ️  Checking setup scripts...

if exist "scripts\setup-database.bat" (
    echo ✅ Found: scripts\setup-database.bat
) else (
    echo ⚠️  Missing: scripts\setup-database.bat
)

if exist "scripts\test-heloc-schema.sql" (
    echo ✅ Found: scripts\test-heloc-schema.sql
) else (
    echo ⚠️  Missing: scripts\test-heloc-schema.sql
)

if exist "src\tests\HELOC.test.ts" (
    echo ✅ Found: src\tests\HELOC.test.ts
) else (
    echo ⚠️  Missing: src\tests\HELOC.test.ts
)

REM Check package.json
echo.
echo ℹ️  Checking package.json scripts...

if exist "package.json" (
    findstr /C:"\"build\"" package.json >nul
    if %errorlevel% equ 0 (
        echo ✅ Build script found
    ) else (
        echo ⚠️  Build script not found in package.json
    )
    
    findstr /C:"\"start\"" package.json >nul
    if %errorlevel% equ 0 (
        echo ✅ Start script found
    ) else (
        echo ⚠️  Start script not found in package.json
    )
)

REM Summary
echo.
echo ======================================
echo ℹ️  Diagnostic check complete

REM Count critical errors
set critical_errors=0

if not exist "src\services\HELOCService.ts" set /a critical_errors+=1
if not exist "src\routes\HELOC.routes.ts" set /a critical_errors+=1
if not exist "prisma\schema.prisma" set /a critical_errors+=1

if %critical_errors% equ 0 (
    echo ✅ No critical issues found - HELOC integration is ready!
    echo.
    echo 🚀 Next Steps:
    echo 1. Set DATABASE_URL environment variable
    echo 2. Run: scripts\setup-database.bat
    echo 3. Run: npm run build
    echo 4. Run: npm start
    echo.
    echo 💰 Rockefeller HELOC Integration Ready!
    echo    Reference Number: 123456789-HELOC
) else (
    echo ❌ Found %critical_errors% critical issues
    echo Please address the errors above before proceeding.
)

echo ======================================
pause
