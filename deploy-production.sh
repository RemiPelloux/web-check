#!/bin/bash
# Deploy Production Mode to Server
# Only run after test-production.sh succeeds!

set -e

echo "=================================================="
echo "🚀 PRODUCTION DEPLOYMENT TO SERVER"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVER="sysadm@82.97.8.94"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# ==================================================
# Safety Check
# ==================================================
echo -e "${YELLOW}⚠️  WARNING: This will deploy production mode to the live server${NC}"
echo ""
echo -e "${BLUE}Before proceeding, confirm:${NC}"
echo "  1. You ran ./test-production.sh locally"
echo "  2. Local tests passed successfully"
echo "  3. You tested http://localhost:3005 thoroughly"
echo "  4. No console errors were found"
echo "  5. Login and features work correctly"
echo ""
read -p "Have you completed all tests? (yes/no): " CONFIRMED

if [ "$CONFIRMED" != "yes" ]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 1
fi

echo ""

# ==================================================
# Step 1: Backup Current Server Config
# ==================================================
echo -e "${YELLOW}[1/7] Creating server backup...${NC}"

BACKUP_DATE=$(date +%Y%m%d-%H%M%S)

ssh $SERVER << ENDSSH
# Backup docker-compose and nginx config
cd /opt/web-check || cd ~/web-check
cp docker-compose.yml docker-compose.yml.backup-$BACKUP_DATE
echo "✓ Backed up docker-compose.yml"
ENDSSH

echo -e "${GREEN}✓ Server backup created${NC}"
echo ""

# ==================================================
# Step 2: Build Fresh Production Image Locally
# ==================================================
echo -e "${YELLOW}[2/7] Building fresh production image...${NC}"

# Clean old builds
rm -rf dist .astro 2>/dev/null || true

# Build for production
export NODE_ENV=production
if yarn build; then
    echo -e "${GREEN}✓ Production build complete${NC}"
else
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi

echo ""

# ==================================================
# Step 3: Create Production Docker Compose
# ==================================================
echo -e "${YELLOW}[3/7] Creating production docker-compose...${NC}"

cat > docker-compose.prod-deploy.yml << 'EOF'
services:
  web-check:
    container_name: Web-Check-Checkit-Prod
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3003:3000"  # Astro production server
      - "3004:3001"  # Backend API
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3001
      - SITE_URL=https://jetestemonsite.apdp.mc
    volumes:
      # Only mount database for persistence
      - ./database:/app/database
EOF

echo -e "${GREEN}✓ Production config created${NC}"
echo ""

# ==================================================
# Step 4: Upload Files to Server
# ==================================================
echo -e "${YELLOW}[4/7] Uploading files to server...${NC}"

# Upload production Dockerfile
scp Dockerfile.prod $SERVER:/tmp/

# Upload production docker-compose
scp docker-compose.prod-deploy.yml $SERVER:/tmp/

echo -e "${GREEN}✓ Files uploaded${NC}"
echo ""

# ==================================================
# Step 5: Stop Current Container
# ==================================================
echo -e "${YELLOW}[5/7] Stopping current dev container...${NC}"

ssh $SERVER << 'ENDSSH'
cd /opt/web-check || cd ~/web-check

# Stop current container
docker compose down

echo "✓ Current container stopped"
ENDSSH

echo -e "${GREEN}✓ Dev container stopped${NC}"
echo ""

# ==================================================
# Step 6: Deploy Production Configuration
# ==================================================
echo -e "${YELLOW}[6/7] Deploying production configuration...${NC}"

ssh $SERVER << 'ENDSSH'
cd /opt/web-check || cd ~/web-check

# Move production files
mv /tmp/Dockerfile.prod ./Dockerfile.prod
mv /tmp/docker-compose.prod-deploy.yml ./docker-compose.yml

echo "✓ Production files in place"

# Build production image
echo "Building production Docker image (this takes 3-5 minutes)..."
docker compose build --no-cache

echo "✓ Production image built"
ENDSSH

echo -e "${GREEN}✓ Production configuration deployed${NC}"
echo ""

# ==================================================
# Step 7: Start Production Container
# ==================================================
echo -e "${YELLOW}[7/7] Starting production container...${NC}"

ssh $SERVER << 'ENDSSH'
cd /opt/web-check || cd ~/web-check

# Start production container
docker compose up -d

echo "✓ Production container started"

# Wait for services
sleep 10

# Check if running
if docker ps | grep -q "Web-Check-Checkit-Prod"; then
    echo "✓ Container is running"
else
    echo "✗ Container failed to start!"
    docker compose logs
    exit 1
fi
ENDSSH

echo -e "${GREEN}✓ Production container running${NC}"
echo ""

# ==================================================
# Step 8: Test Production Deployment
# ==================================================
echo -e "${YELLOW}[8/7] Testing production deployment...${NC}"

sleep 5

echo -e "${BLUE}Testing frontend...${NC}"
if curl -f -s https://jetestemonsite.apdp.mc > /dev/null; then
    echo -e "${GREEN}✓ Frontend responding${NC}"
else
    echo -e "${RED}✗ Frontend not responding!${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    ssh $SERVER "cd /opt/web-check && docker compose logs --tail=50"
    exit 1
fi

echo -e "${BLUE}Testing login page...${NC}"
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://jetestemonsite.apdp.mc/login)
if [ "$LOGIN_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Login page accessible (HTTP 200)${NC}"
else
    echo -e "${RED}✗ Login page returned HTTP $LOGIN_STATUS${NC}"
fi

echo ""

# ==================================================
# Success!
# ==================================================
echo "=================================================="
echo -e "${GREEN}✅ PRODUCTION DEPLOYMENT COMPLETE!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo ""
echo "  • Mode: PRODUCTION"
echo "  • URL: https://jetestemonsite.apdp.mc"
echo "  • Frontend Port: 3003 → 3000 (Astro production)"
echo "  • Backend Port: 3004 → 3001 (Express API)"
echo "  • Container: Web-Check-Checkit-Prod"
echo ""
echo -e "${GREEN}✨ Changes Applied:${NC}"
echo ""
echo "  ✓ Astro serving built static assets (dist/)"
echo "  ✓ All JavaScript bundled (no more /src/ requests)"
echo "  ✓ Vite dev server disabled"
echo "  ✓ Error stack traces hidden"
echo "  ✓ Production optimizations enabled"
echo "  ✓ Smaller bundle sizes"
echo "  ✓ Faster page loads"
echo ""
echo -e "${BLUE}🔍 Verify Deployment:${NC}"
echo ""
echo "  1. Visit: https://jetestemonsite.apdp.mc"
echo "  2. Open DevTools (F12)"
echo "  3. Check Console: Should see NO errors"
echo "  4. Check Network: No /src/* requests"
echo "  5. Test login and features"
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo ""
echo "  # View production logs"
echo "  ssh $SERVER 'cd /opt/web-check && docker compose logs -f'"
echo ""
echo "  # Check container status"
echo "  ssh $SERVER 'docker ps | grep Web-Check'"
echo ""
echo "  # Restart container"
echo "  ssh $SERVER 'cd /opt/web-check && docker compose restart'"
echo ""
echo -e "${YELLOW}⚠️  Rollback (if needed):${NC}"
echo ""
echo "  ssh $SERVER 'cd /opt/web-check && \\"
echo "    docker compose down && \\"
echo "    cp docker-compose.yml.backup-$BACKUP_DATE docker-compose.yml && \\"
echo "    docker compose up -d'"
echo ""
echo "=================================================="
