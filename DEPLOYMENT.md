# Checkit - One-Click Deployment Guide

This project includes automated deployment scripts for easy and fast deployments to your server.

## 🚀 Quick Start

### First Time Setup
```bash
make setup
# or
./setup.sh
```

### Deploy Updates
```bash
make deploy
# or
./deploy.sh
```

That's it! 🎉

---

## 📋 Available Commands

### Using Make (Recommended)

```bash
# Show all available commands
make help

# Initial setup (first time only)
make setup

# Deploy to production
make deploy

# Quick restart (no rebuild)
make deploy-quick

# Full rebuild and deploy
make deploy-full

# View logs
make logs

# Follow logs in real-time
make logs-live

# Check status
make status

# Restart application
make restart

# Test deployment
make test

# Show access URLs
make urls
```

### Using Scripts Directly

```bash
# Initial setup
./setup.sh

# Deploy
./deploy.sh

# Quick deploy (restart only)
./deploy.sh --quick

# Full rebuild
./deploy.sh --full

# Dry run (see what would happen)
./deploy.sh --dry-run
```

---

## 📁 Deployment Files

### 1. `Makefile` - Easy Command Interface
One-line commands for all deployment tasks:
- `make deploy` - Deploy updates
- `make logs` - View logs
- `make status` - Check status
- `make restart` - Restart app
- And many more... (run `make help` to see all)

### 2. `deploy.sh` - Deployment Script
Automated deployment that handles:
- ✅ File transfer to server
- ✅ Cleaning macOS hidden files
- ✅ Docker container build
- ✅ Service restart
- ✅ Deployment verification

**Options:**
- `--quick` / `-q` - Fast restart without rebuild
- `--full` / `-f` - Full rebuild with no cache
- `--dry-run` / `-d` - Preview without executing

### 3. `setup.sh` - Initial Setup Script
First-time server configuration:
- ✅ Creates deployment directory
- ✅ Checks Docker/Docker Compose
- ✅ Transfers files
- ✅ Creates Docker configuration
- ✅ Configures Nginx
- ✅ Builds and starts application

---

## 🎯 Common Workflows

### Daily Development Workflow

1. **Make changes locally** (already done by you)
2. **Deploy to server:**
   ```bash
   make deploy
   ```
3. **Check if it's working:**
   ```bash
   make test
   ```

### Quick Restart (No Code Changes)

```bash
make restart
# or
make deploy-quick
```

### Full Rebuild (When Dependencies Change)

```bash
make deploy-full
```

### Debugging Issues

```bash
# Check status
make status

# View logs
make logs

# Follow logs in real-time
make logs-live

# View only errors
make logs-errors

# Test endpoints
make test
make test-api
```

---

## 🔍 What Happens During Deployment

### Standard Deployment (`make deploy`)

```
1. Pre-flight Checks
   ✓ Verify project directory
   ✓ Test SSH connection

2. Prepare Files
   ✓ Clean macOS hidden files
   ✓ Create archive (excluding node_modules, .git, etc.)

3. Transfer to Server
   ✓ Upload files via SSH + tar
   ✓ Extract on server

4. Build & Deploy
   ✓ Build Docker container
   ✓ Start services with docker compose

5. Verify
   ✓ Check container status
   ✓ Test frontend response
   ✓ Test API endpoints
```

### Quick Deploy (`make deploy-quick`)

```
1. SSH to server
2. Restart Docker container
3. Show status
```

**Time:** ~10 seconds (vs ~2-3 minutes for full deploy)

---

## 🌐 Access Your Deployment

After deployment, your application is available at:

| Type | URL |
|------|-----|
| **Domain (SSL)** | https://jetestemonsite.apdp.mc |
| **Direct** | http://82.97.8.94:3003 (development only) |

### Test API

```bash
curl https://jetestemonsite.apdp.mc/api/status?url=https://google.com
```

Or use the Makefile:
```bash
make test-api
```

---

## 🛠️ Troubleshooting

### Deployment Fails

```bash
# Check what's wrong
make logs-errors

# Try emergency restart
make emergency-restart
```

### SSH Connection Issues

```bash
# Test SSH manually
ssh sysadm@82.97.8.94

# Check SSH key
ls -la ~/.ssh/
```

### Container Won't Start

```bash
# Check logs
make logs

# Stop and start manually
make stop
sleep 5
make start

# Full rebuild
make deploy-full
```

### API Returns Errors

```bash
# Check backend logs
make logs | grep -i "backend\|express\|error"

# Test API directly
make test-api

# Check Nginx
make nginx-test
make nginx-logs
```

### Port Already in Use

If ports 3003 or 3004 are in use:

```bash
# Check what's using the port
ssh sysadm@82.97.8.94 'sudo lsof -i :3003'
ssh sysadm@82.97.8.94 'sudo lsof -i :3004'

# Modify docker-compose.yml to use different ports
```

---

## 📊 Monitoring

### Real-time Monitoring

```bash
# Follow logs
make logs-live

# Monitor resource usage
make monitor

# Watch both logs and resources (separate terminals)
make logs-live
# In another terminal:
make monitor
```

### Health Checks

```bash
# Quick health check
make status

# Detailed test
make test

# Check specific components
make test-api      # Test API
make test-dns      # Test DNS endpoint
make nginx-test    # Test Nginx config
```

---

## 🔐 Configuration

### Server Configuration

Edit these variables in `Makefile`, `deploy.sh`, and `setup.sh`:

```bash
REMOTE_USER="sysadm"
REMOTE_HOST="82.97.8.94"
REMOTE_PATH="/opt/webcheck"
```

### Port Mappings

Defined in `docker-compose.yml`:

```yaml
ports:
  - "3003:4321"  # Frontend (host:container)
  - "3004:3001"  # Backend API (host:container)
```

### Nginx Configuration

Located at: `/etc/nginx/sites-available/jetestemonsite_apdp_mc`

Update with:
```bash
make nginx-reload
```

---

## 📦 What Gets Deployed

### Included:
- ✅ Source code (`src/`, `api/`)
- ✅ Configuration files (astro.config.mjs, etc.)
- ✅ Package files (package.json, yarn.lock)
- ✅ Public assets
- ✅ Docker configuration

### Excluded:
- ❌ `node_modules/`
- ❌ `.git/`
- ❌ `.vite/`
- ❌ `dist/`
- ❌ `.astro/`
- ❌ `._*` (macOS hidden files)
- ❌ `.DS_Store`
- ❌ Log files

---

## ⚡ Performance Tips

### Speed Up Deployments

1. **Use Quick Deploy** when only code changes:
   ```bash
   make deploy-quick  # ~10 seconds
   ```

2. **Use Standard Deploy** when dependencies change:
   ```bash
   make deploy  # ~2-3 minutes
   ```

3. **Use Full Rebuild** only when Docker cache is corrupted:
   ```bash
   make deploy-full  # ~5-10 minutes
   ```

### Optimize Transfer Speed

The deployment script automatically:
- Compresses files with `tar`
- Excludes large directories (node_modules, .git)
- Removes macOS hidden files
- Uses efficient SSH transfer

---

## 🔄 CI/CD Integration

You can integrate these scripts into your CI/CD pipeline:

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan 82.97.8.94 >> ~/.ssh/known_hosts
      
      - name: Deploy
        run: ./deploy.sh
```

---

## 📝 Script Output Example

```
╔════════════════════════════════════════╗
║   Checkit Deployment Script v1.0       ║
║   BeCompliant - OpenPro                ║
╚════════════════════════════════════════╝

==> Running pre-flight checks...
✓ Project directory verified
✓ SSH connection verified

==> Step 1/6: Cleaning macOS hidden files...
✓ Removed macOS hidden files

==> Step 2/6: Transferring files to server...
Creating archive and transferring...
✓ Files transferred successfully

==> Step 3/6: Cleaning server-side hidden files...
✓ Cleaned server-side hidden files

==> Step 4/6: Building Docker container...
✓ Docker build completed

==> Step 5/6: Starting services...
✓ Services started

==> Step 6/6: Verifying deployment...

Container Status:
CONTAINER ID   IMAGE   STATUS   PORTS
abc123def456   ...     Up       0.0.0.0:3003->4321/tcp, 0.0.0.0:3004->3001/tcp

Recent Logs (last 15 lines):
astro  v4.7.1 ready in 1076 ms
┃ Local    http://localhost:4321/
┃ Network  http://172.31.0.2:4321/

Testing Frontend:
✓ Frontend is responding

Testing API:
✓ API is responding correctly

╔════════════════════════════════════════╗
║       Deployment Completed! 🚀         ║
╚════════════════════════════════════════╝

Access URLs:
  • Domain: https://jetestemonsite.apdp.mc
  • Direct: http://82.97.8.94:3003 (development only)
```

---

## 🎓 Learn More

For detailed technical documentation:
- Architecture details: See main documentation
- Troubleshooting: Check error logs with `make logs-errors`
- Nginx configuration: `make nginx-test`

---

## 🆘 Quick Help

```bash
# Show all commands
make help

# Show access URLs
make urls

# Show deployment info
make info

# Get help with scripts
./deploy.sh --help
```

---

## 📞 Support

If you encounter issues:

1. Check logs: `make logs-errors`
2. Test connection: `make test`
3. Try emergency restart: `make emergency-restart`
4. Check this guide for common issues

---

**Happy Deploying! 🚀**




