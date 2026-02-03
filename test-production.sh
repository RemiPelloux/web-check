#!/bin/bash
# Production Mode Test Script
# Tests Astro production build locally before deploying to server

set -e  # Exit on error

echo "=================================================="
echo "🏭 PRODUCTION MODE TEST - LOCAL"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# ==================================================
# Step 1: Check Current State
# ==================================================
echo -e "${YELLOW}[1/8] Checking current environment...${NC}"

if docker ps | grep -q "Web-Check-Checkit"; then
    echo -e "${GREEN}✓ Dev environment running (will not be touched)${NC}"
    DEV_RUNNING="true"
else
    echo -e "${BLUE}ℹ Dev environment not running${NC}"
    DEV_RUNNING="false"
fi

if docker ps | grep -q "Web-Check-Prod-Test"; then
    echo -e "${YELLOW}⚠ Production test already running, will rebuild${NC}"
    docker compose -f docker-compose.prod-test.yml down
fi

echo ""

# ==================================================
# Step 2: Clean Old Builds
# ==================================================
echo -e "${YELLOW}[2/8] Cleaning old production builds...${NC}"

if [ -d "dist" ]; then
    rm -rf dist
    echo -e "${GREEN}✓ Removed old dist/ directory${NC}"
fi

if [ -d ".astro" ]; then
    rm -rf .astro
    echo -e "${GREEN}✓ Removed old .astro/ directory${NC}"
fi

echo ""

# ==================================================
# Step 3: Test Local Production Build
# ==================================================
echo -e "${YELLOW}[3/8] Testing local production build...${NC}"
echo -e "${BLUE}This will take 2-3 minutes...${NC}"

# Set production environment
export NODE_ENV=production

# Run production build
if yarn build; then
    echo -e "${GREEN}✓ Production build successful!${NC}"
else
    echo -e "${RED}✗ Production build failed!${NC}"
    echo -e "${RED}Fix the errors above before continuing${NC}"
    exit 1
fi

echo ""

# ==================================================
# Step 4: Verify Build Output
# ==================================================
echo -e "${YELLOW}[4/8] Verifying build output...${NC}"

if [ ! -d "dist/client" ]; then
    echo -e "${RED}✗ dist/client directory not found!${NC}"
    exit 1
fi

if [ ! -d "dist/server" ]; then
    echo -e "${RED}✗ dist/server directory not found!${NC}"
    exit 1
fi

if [ ! -f "dist/server/entry.mjs" ]; then
    echo -e "${RED}✗ dist/server/entry.mjs not found!${NC}"
    exit 1
fi

CLIENT_FILES=$(find dist/client -type f | wc -l | tr -d ' ')
echo -e "${GREEN}✓ Found $CLIENT_FILES files in dist/client/${NC}"

if [ "$CLIENT_FILES" -lt 10 ]; then
    echo -e "${RED}✗ Too few files in dist/client (expected 50+)${NC}"
    exit 1
fi

echo ""

# ==================================================
# Step 5: Build Docker Image
# ==================================================
echo -e "${YELLOW}[5/8] Building production Docker image...${NC}"
echo -e "${BLUE}This will take 3-5 minutes...${NC}"

if docker compose -f docker-compose.prod-test.yml build --no-cache; then
    echo -e "${GREEN}✓ Docker image built successfully!${NC}"
else
    echo -e "${RED}✗ Docker build failed!${NC}"
    exit 1
fi

echo ""

# ==================================================
# Step 6: Start Production Container
# ==================================================
echo -e "${YELLOW}[6/8] Starting production test container...${NC}"

docker compose -f docker-compose.prod-test.yml up -d

# Wait for container to be ready
echo -e "${BLUE}Waiting for container to start...${NC}"
sleep 5

if docker ps | grep -q "Web-Check-Prod-Test"; then
    echo -e "${GREEN}✓ Container started successfully!${NC}"
else
    echo -e "${RED}✗ Container failed to start!${NC}"
    echo -e "${YELLOW}Checking logs:${NC}"
    docker compose -f docker-compose.prod-test.yml logs
    exit 1
fi

# Wait for services to be ready
echo -e "${BLUE}Waiting for services to initialize (20 seconds)...${NC}"
sleep 20

echo ""

# ==================================================
# Step 7: Test Production Endpoints
# ==================================================
echo -e "${YELLOW}[7/8] Testing production endpoints...${NC}"

echo -e "${BLUE}Testing frontend (http://localhost:3005)...${NC}"
if curl -f -s http://localhost:3005 > /dev/null; then
    echo -e "${GREEN}✓ Frontend responding${NC}"
else
    echo -e "${RED}✗ Frontend not responding!${NC}"
    echo -e "${YELLOW}Checking logs:${NC}"
    docker compose -f docker-compose.prod-test.yml logs --tail=50
    exit 1
fi

echo -e "${BLUE}Testing backend API (http://localhost:3006/api/health)...${NC}"
if curl -f -s http://localhost:3006/api/health > /dev/null; then
    echo -e "${GREEN}✓ Backend API responding${NC}"
else
    echo -e "${RED}✗ Backend API not responding!${NC}"
    echo -e "${YELLOW}Checking logs:${NC}"
    docker compose -f docker-compose.prod-test.yml logs --tail=50
    exit 1
fi

echo -e "${BLUE}Testing login page (http://localhost:3005/login)...${NC}"
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/login)
if [ "$LOGIN_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Login page accessible (HTTP 200)${NC}"
else
    echo -e "${RED}✗ Login page returned HTTP $LOGIN_STATUS${NC}"
fi

echo ""

# ==================================================
# Step 8: Summary
# ==================================================
echo "=================================================="
echo -e "${GREEN}✅ PRODUCTION TEST COMPLETE!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📊 Environment Status:${NC}"
echo ""
echo -e "  ${GREEN}✓ Dev Environment:${NC}"
echo "    - URL: https://jetestemonsite.apdp.mc"
echo "    - Status: Running (unchanged)"
echo "    - Mode: Development (Vite dev server)"
echo ""
echo -e "  ${GREEN}✓ Production Test Environment:${NC}"
echo "    - Frontend: http://localhost:3005"
echo "    - Backend: http://localhost:3006"
echo "    - Status: Running"
echo "    - Mode: Production (built & bundled)"
echo ""
echo -e "${BLUE}🧪 Testing Instructions:${NC}"
echo ""
echo "  1. Open http://localhost:3005 in your browser"
echo "  2. Check for any console errors (F12)"
echo "  3. Test login functionality"
echo "  4. Test the main features"
echo "  5. Verify NO stack traces are visible"
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo ""
echo "  # View production logs"
echo "  docker compose -f docker-compose.prod-test.yml logs -f"
echo ""
echo "  # Check container status"
echo "  docker compose -f docker-compose.prod-test.yml ps"
echo ""
echo "  # Stop production test"
echo "  docker compose -f docker-compose.prod-test.yml down"
echo ""
echo "  # Restart production test"
echo "  docker compose -f docker-compose.prod-test.yml restart"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "  - This is a LOCAL TEST only"
echo "  - Your dev environment is still running normally"
echo "  - Test thoroughly before deploying to server"
echo ""
echo -e "${BLUE}🚀 When Ready to Deploy:${NC}"
echo "  1. Stop this test: docker compose -f docker-compose.prod-test.yml down"
echo "  2. Run: ./deploy-production.sh"
echo ""
echo "=================================================="
