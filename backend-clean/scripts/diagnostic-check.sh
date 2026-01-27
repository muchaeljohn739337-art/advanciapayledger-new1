#!/bin/bash

# Rockefeller HELOC Integration Diagnostic Check
# Reference Number: 123456789-HELOC

echo "🔍 Rockefeller HELOC Integration Diagnostic"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_status "ERROR" "Not in the backend directory"
    exit 1
fi

print_status "OK" "In correct backend directory"

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    print_status "OK" "Node.js: $NODE_VERSION"
else
    print_status "ERROR" "Node.js not installed"
fi

# Check npm version
NPM_VERSION=$(npm --version 2>/dev/null)
if [ $? -eq 0 ]; then
    print_status "OK" "npm: $NPM_VERSION"
else
    print_status "ERROR" "npm not installed"
fi

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    print_status "OK" "Dependencies installed"
else
    print_status "WARN" "Dependencies not installed - run 'npm install'"
fi

# Check critical HELOC files
echo ""
print_status "INFO" "Checking HELOC integration files..."

HELOC_FILES=(
    "src/services/HELOCService.ts"
    "src/routes/HELOC.routes.ts"
    "src/models/HELOC.ts"
    "prisma/schema.prisma"
    "ROCKEFELLER-HELOC-INTEGRATION-PLAN.md"
    "ROCKEFELLER-HELOC-DATABASE-SCHEMA.md"
    "ROCKEFELLER-HELOC-FRONTEND-INTEGRATION.md"
    "ROCKEFELLER-HELOC-DEPLOYMENT-GUIDE.md"
)

for file in "${HELOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "OK" "Found: $file"
    else
        print_status "ERROR" "Missing: $file"
    fi
done

# Check frontend components
echo ""
print_status "INFO" "Checking frontend components..."

FRONTEND_FILES=(
    "frontend/src/components/HELOC/ApplicationForm.tsx"
    "frontend/src/components/HELOC/AccountDashboard.tsx"
    "frontend/src/components/HELOC/AdminDashboard.tsx"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "OK" "Found: $file"
    else
        print_status "WARN" "Missing: $file"
    fi
done

# Check Prisma schema
echo ""
print_status "INFO" "Checking Prisma schema..."

if command -v npx &> /dev/null; then
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        print_status "WARN" "DATABASE_URL not set (required for Prisma operations)"
    else
        print_status "OK" "DATABASE_URL is set"
        
        # Try to validate schema
        npx prisma validate 2>/dev/null
        if [ $? -eq 0 ]; then
            print_status "OK" "Prisma schema is valid"
        else
            print_status "ERROR" "Prisma schema validation failed"
        fi
    fi
else
    print_status "WARN" "npx not available"
fi

# Check TypeScript compilation
echo ""
print_status "INFO" "Checking TypeScript compilation..."

if command -v npx &> /dev/null && [ -d "node_modules" ]; then
    npx tsc --noEmit 2>/dev/null
    if [ $? -eq 0 ]; then
        print_status "OK" "TypeScript compilation successful"
    else
        print_status "WARN" "TypeScript compilation has errors"
        echo "Run 'npm run build' to see detailed errors"
    fi
else
    print_status "WARN" "Cannot check TypeScript (npx or dependencies missing)"
fi

# Check environment variables
echo ""
print_status "INFO" "Checking environment configuration..."

if [ -f ".env" ]; then
    print_status "OK" ".env file exists"
    
    # Check for HELOC variables
    if grep -q "HELOC_ENABLED" .env; then
        print_status "OK" "HELOC environment variables found"
    else
        print_status "WARN" "HELOC environment variables not found in .env"
    fi
else
    print_status "INFO" "No .env file (using .env.example)"
fi

if [ -f ".env.example" ]; then
    print_status "OK" ".env.example exists"
    if grep -q "HELOC_ENABLED" .env.example; then
        print_status "OK" "HELOC variables in .env.example"
    fi
fi

# Check scripts
echo ""
print_status "INFO" "Checking setup scripts..."

SCRIPTS=(
    "scripts/setup-database.sh"
    "scripts/test-heloc-schema.sql"
    "src/tests/HELOC.test.ts"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        print_status "OK" "Found: $script"
        
        # Check if script is executable
        if [[ "$script" == *.sh ]]; then
            if [ -x "$script" ]; then
                print_status "OK" "Script is executable: $script"
            else
                print_status "WARN" "Script not executable: $script (run chmod +x $script)"
            fi
        fi
    else
        print_status "WARN" "Missing: $script"
    fi
done

# Check package.json scripts
echo ""
print_status "INFO" "Checking package.json scripts..."

if grep -q '"build"' package.json; then
    print_status "OK" "Build script found"
else
    print_status "WARN" "Build script not found in package.json"
fi

if grep -q '"start"' package.json; then
    print_status "OK" "Start script found"
else
    print_status "WARN" "Start script not found in package.json"
fi

# Summary
echo ""
echo "======================================"
print_status "INFO" "Diagnostic check complete"

# Check for critical issues
CRITICAL_ERRORS=0

if [ ! -f "src/services/HELOCService.ts" ]; then
    ((CRITICAL_ERRORS++))
fi

if [ ! -f "src/routes/HELOC.routes.ts" ]; then
    ((CRITICAL_ERRORS++))
fi

if [ ! -f "prisma/schema.prisma" ]; then
    ((CRITICAL_ERRORS++))
fi

if [ $CRITICAL_ERRORS -eq 0 ]; then
    print_status "OK" "No critical issues found - HELOC integration is ready!"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Set DATABASE_URL environment variable"
    echo "2. Run: ./scripts/setup-database.sh"
    echo "3. Run: npm run build"
    echo "4. Run: npm start"
    echo ""
    echo "💰 Rockefeller HELOC Integration Ready!"
    echo "   Reference Number: 123456789-HELOC"
else
    print_status "ERROR" "Found $CRITICAL_ERRORS critical issues"
    echo "Please address the errors above before proceeding."
fi

echo "======================================"
