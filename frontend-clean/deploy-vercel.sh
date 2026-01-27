#!/bin/bash

# ============================================================================
# ADVANCIA PAYLEDGER - VERCEL DEPLOYMENT SCRIPT
# ============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

clear
echo -e "${CYAN}${BOLD}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║         🚀 DEPLOYING TO VERCEL - ADVANCIA PAYLEDGER 🚀           ║
║                                                                    ║
║   Production deployment for global financial platform             ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}${BOLD}Preparing frontend for Vercel deployment...${NC}"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run from frontend-clean directory.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${CYAN}Installing dependencies...${NC}"
npm install

# Build the project
echo -e "${CYAN}Building production version...${NC}"
npm run build

# Check if build was successful
if [ ! -d ".next" ]; then
    echo -e "${RED}Error: Build failed. .next directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Deploy to Vercel
echo -e "${CYAN}Deploying to Vercel...${NC}"
echo ""

echo -e "${YELLOW}${BOLD}Choose deployment option:${NC}"
echo ""
echo "  ${BOLD}1${NC} - Deploy to production (advanciapayledger.vercel.app)"
echo "  ${BOLD}2${NC} - Deploy to preview (random URL)"
echo "  ${BOLD}3${NC} - Link to existing project"
echo "  ${BOLD}4${NC} - Exit"
echo ""

read -p "$(echo -e ${CYAN}${BOLD}Select option [1-4]:${NC} )" -n 1 -r
echo
echo

case $REPLY in
    1)
        echo -e "${GREEN}Deploying to PRODUCTION...${NC}"
        vercel --prod
        ;;
    2)
        echo -e "${GREEN}Deploying to PREVIEW...${NC}"
        vercel
        ;;
    3)
        echo -e "${GREEN}Linking to existing project...${NC}"
        vercel link
        vercel --prod
        ;;
    4)
        echo -e "${YELLOW}Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid selection${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}${BOLD}✅ Deployment complete!${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "1. Update your backend API URL in Vercel environment variables"
echo "2. Set NEXT_PUBLIC_API_URL to your backend domain"
echo "3. Test the deployed application"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "- Make sure your backend is accessible from the internet"
echo "- Configure CORS to allow your Vercel domain"
echo "- Update any hardcoded URLs in your backend"
echo ""

echo -e "${GREEN}${BOLD}🚀 Advancia PayLedger is now live on Vercel!${NC}"
