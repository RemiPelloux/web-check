#!/bin/bash

###########################################
# Checkit Database Backup Script
###########################################
#
# Creates timestamped backups of the SQLite database
# both on the server and locally.
#
# Usage:
#   ./backup-db.sh           # Create backup
#   ./backup-db.sh --list    # List existing backups
#   ./backup-db.sh --clean   # Remove backups older than 30 days
#

# Configuration
REMOTE_USER="sysadm"
REMOTE_HOST="82.97.8.94"
REMOTE_DB_PATH="/opt/webcheck/database/checkit.db"
REMOTE_BACKUP_DIR="/opt/webcheck/database/backups"
LOCAL_BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../backups" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="checkit.db.${TIMESTAMP}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() { echo -e "\n${BLUE}==>${NC} ${1}"; }
print_success() { echo -e "${GREEN}✓${NC} ${1}"; }
print_error() { echo -e "${RED}✗${NC} ${1}"; }
print_warning() { echo -e "${YELLOW}⚠${NC} ${1}"; }

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   Checkit Database Backup Script       ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Parse arguments
case "${1}" in
  --list|-l)
    print_step "Listing backups..."
    echo -e "\n${BLUE}Server backups:${NC}"
    ssh ${REMOTE_USER}@${REMOTE_HOST} "ls -lh ${REMOTE_BACKUP_DIR}/ 2>/dev/null || echo '  No backups found'"
    echo -e "\n${BLUE}Local backups:${NC}"
    ls -lh ${LOCAL_BACKUP_DIR}/*.db* 2>/dev/null || echo "  No backups found"
    exit 0
    ;;
  --clean|-c)
    print_step "Cleaning old backups (>30 days)..."
    ssh ${REMOTE_USER}@${REMOTE_HOST} "find ${REMOTE_BACKUP_DIR} -name 'checkit.db.*' -mtime +30 -delete 2>/dev/null"
    find ${LOCAL_BACKUP_DIR} -name 'checkit.db.*' -mtime +30 -delete 2>/dev/null
    print_success "Old backups cleaned"
    exit 0
    ;;
  --help|-h)
    echo "Usage: ./backup-db.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --list, -l     List all existing backups"
    echo "  --clean, -c    Remove backups older than 30 days"
    echo "  --help, -h     Show this help message"
    echo ""
    echo "Without options: Creates a new timestamped backup"
    exit 0
    ;;
esac

# Pre-flight checks
print_step "Pre-flight checks..."

# Check SSH connection
if ! ssh -q -o BatchMode=yes -o ConnectTimeout=5 "${REMOTE_USER}@${REMOTE_HOST}" exit &>/dev/null; then
  print_error "Cannot connect to ${REMOTE_USER}@${REMOTE_HOST}"
  exit 1
fi
print_success "SSH connection OK"

# Check if database exists
if ! ssh ${REMOTE_USER}@${REMOTE_HOST} "test -f ${REMOTE_DB_PATH}"; then
  print_error "Database not found at ${REMOTE_DB_PATH}"
  exit 1
fi
print_success "Database found"

# Create backup directories if they don't exist
mkdir -p "${LOCAL_BACKUP_DIR}"
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_BACKUP_DIR}"

# Step 1: Create server-side backup
print_step "Creating server backup..."
if ssh ${REMOTE_USER}@${REMOTE_HOST} "cp ${REMOTE_DB_PATH} ${REMOTE_BACKUP_DIR}/${BACKUP_NAME}"; then
  SERVER_SIZE=$(ssh ${REMOTE_USER}@${REMOTE_HOST} "du -h ${REMOTE_BACKUP_DIR}/${BACKUP_NAME} | cut -f1")
  print_success "Server backup created: ${REMOTE_BACKUP_DIR}/${BACKUP_NAME} (${SERVER_SIZE})"
else
  print_error "Failed to create server backup"
  exit 1
fi

# Step 2: Download to local
print_step "Downloading to local..."
if scp -q ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_BACKUP_DIR}/${BACKUP_NAME} ${LOCAL_BACKUP_DIR}/${BACKUP_NAME}; then
  LOCAL_SIZE=$(du -h ${LOCAL_BACKUP_DIR}/${BACKUP_NAME} | cut -f1)
  print_success "Local backup created: ${LOCAL_BACKUP_DIR}/${BACKUP_NAME} (${LOCAL_SIZE})"
else
  print_error "Failed to download backup"
  exit 1
fi

# Summary
echo -e "\n${GREEN}╔════════════════════════════════════════╗"
echo "║       Backup Completed! 💾              ║"
echo "╚════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}Backup locations:${NC}"
echo "  • Server: ${REMOTE_BACKUP_DIR}/${BACKUP_NAME}"
echo "  • Local:  ${LOCAL_BACKUP_DIR}/${BACKUP_NAME}"

echo -e "\n${BLUE}Quick commands:${NC}"
echo "  • List backups:  ./backup-db.sh --list"
echo "  • Clean old:     ./backup-db.sh --clean"

# Count existing backups
SERVER_COUNT=$(ssh ${REMOTE_USER}@${REMOTE_HOST} "ls -1 ${REMOTE_BACKUP_DIR}/checkit.db.* 2>/dev/null | wc -l")
LOCAL_COUNT=$(ls -1 ${LOCAL_BACKUP_DIR}/checkit.db.* 2>/dev/null | wc -l)

echo -e "\n${BLUE}Total backups:${NC}"
echo "  • Server: ${SERVER_COUNT} backups"
echo "  • Local:  ${LOCAL_COUNT} backups"

echo ""


