#!/bin/bash

###########################################
# Checkit Initial Setup Script
###########################################
#
# This script sets up the server for the first time deployment.
# It installs dependencies, configures Nginx, and prepares Docker.
#
# Usage:
#   ./setup.sh
#

# Configuration
REMOTE_USER="sysadm"
REMOTE_HOST="82.97.8.94"
REMOTE_PATH="/opt/webcheck"
DOMAIN="jetestemonsite.apdp.mc"
SSL_CERT="/etc/ssl/certs/chatbot_apdp_mc.crt"
SSL_KEY="/etc/ssl/private/chatbot_apdp_mc.key"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
  echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
  echo -e "${GREEN}✓${NC} ${1}"
}

print_error() {
  echo -e "${RED}✗${NC} ${1}"
}

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   Checkit Initial Setup Script         ║"
echo "║   Server Configuration                 ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Confirm before proceeding
echo -e "${YELLOW}This will configure the server at ${REMOTE_USER}@${REMOTE_HOST}${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Setup cancelled"
  exit 1
fi

# Step 1: Create deployment directory
print_step "Step 1/7: Creating deployment directory..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_PATH}"
print_success "Directory created at ${REMOTE_PATH}"

# Step 2: Check Docker installation
print_step "Step 2/7: Checking Docker installation..."
if ssh ${REMOTE_USER}@${REMOTE_HOST} "command -v docker &> /dev/null"; then
  print_success "Docker is installed"
else
  print_error "Docker is not installed"
  echo "Please install Docker first: https://docs.docker.com/engine/install/"
  exit 1
fi

# Step 3: Check Docker Compose
print_step "Step 3/7: Checking Docker Compose..."
if ssh ${REMOTE_USER}@${REMOTE_HOST} "docker compose version &> /dev/null"; then
  print_success "Docker Compose is available"
else
  print_error "Docker Compose is not available"
  echo "Please install Docker Compose plugin"
  exit 1
fi

# Step 4: Transfer initial files
print_step "Step 4/7: Transferring project files..."
tar czf - \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.vite' \
  --exclude='dist' \
  --exclude='.astro' \
  --exclude='._*' \
  --exclude='.DS_Store' \
  . | ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && tar xzf -"
print_success "Project files transferred"

# Step 5: Create Docker files
print_step "Step 5/7: Creating Docker configuration..."

# Create Dockerfile.dev
ssh ${REMOTE_USER}@${REMOTE_HOST} "cat > ${REMOTE_PATH}/Dockerfile.dev << 'DOCKERFILE_EOF'
FROM node:21-bullseye

WORKDIR /app

# Install system dependencies for Chromium
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    chromium \
    traceroute \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --network-timeout 100000

# Copy source code
COPY . .

# Set environment
ENV CHROME_PATH=\"/usr/bin/chromium\"
ENV NODE_ENV=development

# Expose ports
EXPOSE 3001 4321

# Use custom start script with --host
CMD [\"bash\", \"start-dev.sh\"]
DOCKERFILE_EOF"

# Create start-dev.sh
ssh ${REMOTE_USER}@${REMOTE_HOST} "cat > ${REMOTE_PATH}/start-dev.sh << 'STARTDEV_EOF'
#!/bin/bash
# Start backend API
DISABLE_GUI=true PORT=3001 yarn nodemon server &

# Start frontend WITHOUT hardcoded localhost API endpoint
NODE_OPTIONS=\"--max-old-space-size=4096\" yarn astro dev --host &

# Wait for all processes
wait
STARTDEV_EOF"

ssh ${REMOTE_USER}@${REMOTE_HOST} "chmod +x ${REMOTE_PATH}/start-dev.sh"

# Create docker-compose.yml
ssh ${REMOTE_USER}@${REMOTE_HOST} "cat > ${REMOTE_PATH}/docker-compose.yml << 'COMPOSE_EOF'
services:
  web-check:
    container_name: Web-Check-Checkit
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - \"3003:4321\"
      - \"3004:3001\"
    restart: unless-stopped
    environment:
      - NODE_ENV=development
COMPOSE_EOF"

# Create .dockerignore
ssh ${REMOTE_USER}@${REMOTE_HOST} "cat > ${REMOTE_PATH}/.dockerignore << 'DOCKERIGNORE_EOF'
node_modules
.git
.env
.DS_Store
._*
.vite
dist
.astro
DOCKERIGNORE_EOF"

print_success "Docker configuration created"

# Step 6: Configure Nginx
print_step "Step 6/7: Configuring Nginx with SSL..."

# Transfer Nginx configuration file
scp ${PROJECT_DIR}/nginx-jetestemonsite.conf ${REMOTE_USER}@${REMOTE_HOST}:/tmp/jetestemonsite_apdp_mc.conf

# Move to sites-available and enable
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo mv /tmp/jetestemonsite_apdp_mc.conf /etc/nginx/sites-available/jetestemonsite_apdp_mc"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo ln -sf /etc/nginx/sites-available/jetestemonsite_apdp_mc /etc/nginx/sites-enabled/"

# Test and reload Nginx
if ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo nginx -t"; then
  ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo systemctl reload nginx"
  print_success "Nginx configured with SSL and reloaded"
else
  print_error "Nginx configuration test failed"
  exit 1
fi

# Step 7: Build and start
print_step "Step 7/7: Building and starting application..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && docker compose build && docker compose up -d"
print_success "Application built and started"

# Wait for startup
echo "Waiting for application to start..."
sleep 15

# Show status
echo -e "\n${BLUE}Container Status:${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker ps | grep Checkit'

echo -e "\n${BLUE}Recent Logs:${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker logs Web-Check-Checkit --tail 20'

# Setup complete
echo -e "\n${GREEN}╔════════════════════════════════════════╗"
echo "║       Setup Completed! 🎉              ║"
echo "╚════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}Access URLs:${NC}"
echo "  • Domain (SSL): https://${DOMAIN}"
echo "  • Direct: http://${REMOTE_HOST}:3003 (development only)"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "  1. Test the deployment:"
echo "     curl https://${DOMAIN}/api/status?url=https://google.com"
echo ""
echo "  2. For future deployments, use:"
echo "     ./deploy.sh"
echo ""
echo "  3. View logs:"
echo "     ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker logs -f Web-Check-Checkit'"

echo ""




