#!/bin/bash

# 502 Error Page Setup Script for APDP Checkit
# This script configures the beautiful 502 maintenance page

set -e

echo "=========================================="
echo "  502 Maintenance Page Setup"
echo "  APDP Monaco - Checkit"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/checkit"
PUBLIC_DIR="${PROJECT_DIR}/public"
NGINX_CONF="/etc/nginx/sites-available/jetestemonsite.apdp.mc"
NGINX_ENABLED="/etc/nginx/sites-enabled/jetestemonsite.apdp.mc"

echo -e "${BLUE}==>${NC} Checking prerequisites..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}✗${NC} Please run this script with sudo"
    echo "Usage: sudo bash setup-502.sh"
    exit 1
fi

echo -e "${GREEN}✓${NC} Running with appropriate permissions"

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}✗${NC} Project directory not found: $PROJECT_DIR"
    exit 1
fi

echo -e "${GREEN}✓${NC} Project directory verified"

echo ""
echo -e "${BLUE}==>${NC} Step 1: Creating public directory..."

# Create public directory if it doesn't exist
if [ ! -d "$PUBLIC_DIR" ]; then
    mkdir -p "$PUBLIC_DIR"
    echo -e "${GREEN}✓${NC} Created: $PUBLIC_DIR"
else
    echo -e "${GREEN}✓${NC} Directory already exists: $PUBLIC_DIR"
fi

echo ""
echo -e "${BLUE}==>${NC} Step 2: Copying 502.html..."

# Copy 502.html to public directory
if [ -f "${PROJECT_DIR}/public/502.html" ]; then
    cp "${PROJECT_DIR}/public/502.html" "${PUBLIC_DIR}/502.html"
    echo -e "${GREEN}✓${NC} Copied 502.html"
else
    echo -e "${RED}✗${NC} Source file not found: ${PROJECT_DIR}/public/502.html"
    echo "Please ensure you've deployed the latest code first."
    exit 1
fi

# Set proper permissions
chown www-data:www-data "${PUBLIC_DIR}/502.html"
chmod 644 "${PUBLIC_DIR}/502.html"
echo -e "${GREEN}✓${NC} Set proper permissions (www-data:www-data, 644)"

echo ""
echo -e "${BLUE}==>${NC} Step 3: Updating nginx configuration..."

# Backup existing nginx config
if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✓${NC} Backed up existing nginx config"
fi

# Copy new nginx config
if [ -f "${PROJECT_DIR}/nginx-jetestemonsite.conf" ]; then
    cp "${PROJECT_DIR}/nginx-jetestemonsite.conf" "$NGINX_CONF"
    echo -e "${GREEN}✓${NC} Updated nginx configuration"
    
    # Create symlink if it doesn't exist
    if [ ! -L "$NGINX_ENABLED" ]; then
        ln -s "$NGINX_CONF" "$NGINX_ENABLED"
        echo -e "${GREEN}✓${NC} Created nginx enabled symlink"
    fi
else
    echo -e "${YELLOW}⚠${NC} nginx-jetestemonsite.conf not found in project directory"
    echo "Skipping nginx update. You may need to update manually."
fi

echo ""
echo -e "${BLUE}==>${NC} Step 4: Testing nginx configuration..."

# Test nginx config
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓${NC} Nginx configuration is valid"
else
    echo -e "${RED}✗${NC} Nginx configuration test failed!"
    echo "Restoring backup..."
    if [ -f "${NGINX_CONF}.backup."* ]; then
        latest_backup=$(ls -t ${NGINX_CONF}.backup.* | head -1)
        cp "$latest_backup" "$NGINX_CONF"
        echo -e "${GREEN}✓${NC} Backup restored"
    fi
    exit 1
fi

echo ""
echo -e "${BLUE}==>${NC} Step 5: Reloading nginx..."

# Reload nginx
systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Nginx reloaded successfully"
else
    echo -e "${RED}✗${NC} Failed to reload nginx"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  ✓ Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "The 502 maintenance page is now configured and will display:"
echo "  • During deployments"
echo "  • When Docker container is restarting"
echo "  • When backend services are unavailable"
echo ""
echo "To test the 502 page:"
echo "  cd /var/www/checkit"
echo "  docker compose stop"
echo "  # Visit https://jetestemonsite.apdp.mc in browser"
echo "  docker compose start"
echo ""
echo -e "${BLUE}Files created/updated:${NC}"
echo "  ✓ ${PUBLIC_DIR}/502.html"
echo "  ✓ ${NGINX_CONF}"
echo ""
echo -e "${BLUE}Logs to monitor:${NC}"
echo "  sudo tail -f /var/log/nginx/jetestemonsite_apdp_mc_error.log"
echo ""

