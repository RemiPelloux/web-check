#!/bin/bash

###########################################
# Checkit One-Click Deployment Script
###########################################
#
# This script automates the deployment of Checkit to the remote server.
# It handles file transfer, Docker build, and service restart.
#
# Usage:
#   ./deploy.sh           # Deploy to production
#   ./deploy.sh --quick   # Skip rebuild, just restart
#   ./deploy.sh --full    # Full rebuild with no cache
#

# Configuration
REMOTE_USER="sysadm"
REMOTE_HOST="82.97.8.94"
REMOTE_PATH="/opt/webcheck"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
QUICK_MODE=false
FULL_MODE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --quick|-q)
      QUICK_MODE=true
      shift
      ;;
    --full|-f)
      FULL_MODE=true
      shift
      ;;
    --dry-run|-d)
      DRY_RUN=true
      shift
      ;;
    --help|-h)
      echo "Usage: ./deploy.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --quick, -q      Quick restart without rebuild"
      echo "  --full, -f       Full rebuild with no cache"
      echo "  --dry-run, -d    Show what would be done without executing"
      echo "  --help, -h       Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Helper functions
print_step() {
  echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
  echo -e "${GREEN}✓${NC} ${1}"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} ${1}"
}

print_error() {
  echo -e "${RED}✗${NC} ${1}"
}

run_command() {
  local cmd="$1"
  local description="$2"
  
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN]${NC} $description"
    echo "  Command: $cmd"
    return 0
  fi
  
  if eval "$cmd"; then
    print_success "$description"
    return 0
  else
    print_error "$description failed"
    return 1
  fi
}

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   Checkit Deployment Script v1.0       ║"
echo "║   BeCompliant - L'APDP                 ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Pre-flight checks
print_step "Running pre-flight checks..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
  print_error "package.json not found. Run this script from the project root."
  exit 1
fi
print_success "Project directory verified"

# Check SSH connection
if ! ssh -q -o BatchMode=yes -o ConnectTimeout=5 "${REMOTE_USER}@${REMOTE_HOST}" exit &>/dev/null; then
  print_error "Cannot connect to ${REMOTE_USER}@${REMOTE_HOST}"
  print_warning "Make sure SSH keys are configured"
  exit 1
fi
print_success "SSH connection verified"

# Quick mode - just restart
if [ "$QUICK_MODE" = true ]; then
  print_step "Quick mode: Restarting services..."
  run_command "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && docker compose restart'" \
    "Restarting Docker container"
  
  print_step "Checking status..."
  ssh ${REMOTE_USER}@${REMOTE_HOST} "docker ps | grep Checkit"
  
  print_success "Quick restart complete!"
  exit 0
fi

# Step 1: Clean local macOS hidden files
print_step "Step 1/7: Cleaning macOS hidden files..."
run_command "find . -name '._*' -delete 2>/dev/null; find . -name '.DS_Store' -delete 2>/dev/null || true" \
  "Removed macOS hidden files"
# Also clean on server before transfer
run_command "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && find . -name \"._*\" -delete 2>/dev/null || true'" \
  "Cleaned server-side hidden files (pre-transfer)"

# Step 2: Transfer files to server
print_step "Step 2/7: Transferring files to server..."

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}[DRY RUN]${NC} Would transfer files to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
else
  echo "Creating archive and transferring..."
  # Use COPYFILE_DISABLE to prevent macOS resource forks
  COPYFILE_DISABLE=1 tar czf - \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.vite' \
    --exclude='dist' \
    --exclude='.astro' \
    --exclude='._*' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    --exclude='checkit.db' \
    . | ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && tar xzf -"
  
  if [ $? -eq 0 ]; then
    print_success "Files transferred successfully"
  else
    print_error "File transfer failed"
    exit 1
  fi
fi

# Step 3: Remove any remaining hidden files on server
print_step "Step 3/7: Cleaning server-side hidden files..."
run_command "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && find . -name \"._*\" -delete 2>/dev/null || true'" \
  "Cleaned server-side hidden files"

# Step 4: Build Docker container
print_step "Step 4/7: Building Docker container..."

BUILD_CMD="cd ${REMOTE_PATH} && docker compose build"
if [ "$FULL_MODE" = true ]; then
  BUILD_CMD="${BUILD_CMD} --no-cache"
  print_warning "Full rebuild mode: This will take longer"
fi

run_command "ssh ${REMOTE_USER}@${REMOTE_HOST} '${BUILD_CMD}'" \
  "Docker build completed"

# Step 5: Start services
print_step "Step 5/7: Starting services..."
run_command "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && docker compose up -d'" \
  "Services started"

# Clean hidden files in mounted volumes (they get picked up by nodemon)
run_command "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && find ./src ./server ./api ./public -name \"._*\" -delete 2>/dev/null || true'" \
  "Cleaned hidden files in mounted volumes"

# Wait for nodemon to restart after volume changes
echo "Waiting for services to stabilize..."
sleep 5

# Step 6: Run database migrations (Symfony-style)
print_step "Step 6/7: Running database migrations..."

if [ "$DRY_RUN" = false ]; then
  echo "Using APDP Checkit Migration System (like Symfony Doctrine)"
  echo ""
  
  # First show migration status
  echo -e "${BLUE}Migration Status:${NC}"
  ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && docker exec Web-Check-Checkit node database/migrate.js --status" 2>&1 | while IFS= read -r line; do
    echo "  $line"
  done
  
  echo ""
  echo "Running pending migrations..."
  
  # Run migrations only (wiki seeding is manual via admin or first-time setup)
  MIGRATION_OUTPUT=$(ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && docker exec Web-Check-Checkit node database/migrate.js" 2>&1)
  MIGRATION_EXIT=$?
  
  echo "$MIGRATION_OUTPUT" | while IFS= read -r line; do
    echo "  $line"
  done
  
  if [ $MIGRATION_EXIT -eq 0 ]; then
    print_success "Database migrations completed successfully"
  else
    print_warning "Some migrations may have failed, check logs above"
    # Don't exit - let deployment continue
  fi
else
  echo -e "${YELLOW}[DRY RUN]${NC} Would run database/migrate.js --seed"
fi

# Step 7: Verify deployment
print_step "Step 7/7: Verifying deployment..."

if [ "$DRY_RUN" = false ]; then
  echo "Waiting for services to start..."
  sleep 10
  
  # Check container status
  echo -e "\n${BLUE}Container Status:${NC}"
  ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker ps | grep Checkit'
  
  # Check recent logs
  echo -e "\n${BLUE}Recent Logs (last 15 lines):${NC}"
  ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker logs Web-Check-Checkit --tail 15'
  
  # Test frontend
  echo -e "\n${BLUE}Testing Frontend:${NC}"
  if curl -s -o /dev/null -w "%{http_code}" "http://${REMOTE_HOST}:3003" | grep -q "200\|301\|302"; then
    print_success "Frontend is responding"
  else
    print_warning "Frontend may not be ready yet"
  fi
  
  # Test API
  echo -e "\n${BLUE}Testing API:${NC}"
  API_RESPONSE=$(curl -s "http://${REMOTE_HOST}:3004/api/status?url=https://google.com")
  if echo "$API_RESPONSE" | grep -q "isUp"; then
    print_success "API is responding correctly"
    echo "  Response: ${API_RESPONSE:0:100}..."
  else
    print_warning "API may not be ready yet or returned unexpected response"
  fi
fi

# Deployment summary
echo -e "\n${GREEN}╔════════════════════════════════════════╗"
echo "║       Deployment Completed! 🚀         ║"
echo "╚════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}Access URLs:${NC}"
echo "  • Domain: https://jetestemonsite.apdp.mc"
echo "  • Direct: http://${REMOTE_HOST}:3003 (development only)"

echo -e "\n${BLUE}Useful Commands:${NC}"
echo "  • View logs: ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker logs -f Web-Check-Checkit'"
echo "  • Quick restart: ./deploy.sh --quick"
echo "  • Full rebuild: ./deploy.sh --full"

echo -e "\n${BLUE}API Test:${NC}"
echo "  curl https://jetestemonsite.apdp.mc/api/status?url=https://google.com"

echo ""




