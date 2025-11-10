# Checkit Deployment Documentation

**Live at**: https://jetestemonsite.apdp.mc  
**Status**: ✅ Production Ready

---

## Quick Deploy

```bash
# Standard deployment
./deploy.sh

# Full rebuild (after dependency changes)
./deploy.sh --full

# Quick restart (code changes only)
./deploy.sh --quick
```

---

## Architecture

```
Internet (HTTPS)
       ↓
Nginx Reverse Proxy (443)
   SSL: *.apdp.mc
       ↓
   ┌───┴───┐
   │       │
Port 3003  Port 3004
   │       │
   ▼       ▼
Docker Container: Web-Check-Checkit
   │       │
Astro    Express
:4321    :3001
Frontend Backend
```

---

## Key Configuration

### Docker Setup
- **Image**: Custom `Dockerfile.dev`
- **Command**: `yarn dev` (same as local!)
- **Ports**: 3003→4321 (frontend), 3004→3001 (backend)
- **Mode**: Development in production (for hot reload)

### Nginx Setup
- **Domain**: jetestemonsite.apdp.mc
- **SSL**: Wildcard certificate `*.apdp.mc`
- **Config**: `/etc/nginx/sites-available/jetestemonsite_apdp_mc`
- **Frontend**: Proxy `/` to port 3003
- **Backend**: Proxy `/api` to port 3004

### Application Setup
- **Output Mode**: Hybrid (supports dynamic routes)
- **Network**: Bound to `0.0.0.0` with `--host` flag
- **SCSS**: All 8 files have proper imports
- **Configs**: Excluded from Docker image

---

## Files Modified for Deployment

### Docker Files
```
Dockerfile.dev           # Development mode Docker image
docker-compose.yml       # Container orchestration
.dockerignore            # Exclude config files
```

### Configuration Files
```
nginx-jetestemonsite.conf  # Nginx SSL proxy
deploy.sh                  # Automated deployment
setup.sh                   # Server setup
Makefile                   # Command shortcuts
```

### Application Files
```
package.json              # Added --host to dev:astro
astro.config.mjs         # Output: hybrid, domain updated

# SCSS imports added to these 8 files:
src/pages/account/index.astro
src/pages/web-check-api/index.astro
src/pages/self-hosted-setup.astro
src/components/homepage/HeroForm.astro
src/components/homepage/SponsorSegment.astro
src/components/homepage/Screenshots.astro
src/components/homepage/ButtonGroup.astro
src/components/scafold/Footer.astro
```

---

## Critical Fixes Applied

### 1. SCSS Module Imports ⚠️ IMPORTANT

**Every Astro file using `@include` directives must import media-queries**:

```scss
<style lang="scss">
  @import '@styles/global.scss';
  @import '@styles/media-queries.scss';  // ← REQUIRED!
  
  .my-class {
    @include mobile-down { ... }
  }
</style>
```

**Why**: `global.scss` uses `@use` with namespaces, not global imports

### 2. Network Binding ⚠️ IMPORTANT

**Astro must bind to all interfaces in Docker**:

```json
{
  "scripts": {
    "dev:astro": "astro dev --host"  // ← --host is REQUIRED
  }
}
```

**Why**: Without `--host`, Astro only listens on localhost inside container

### 3. Config File Exclusion ⚠️ IMPORTANT

**These files MUST be excluded via .dockerignore**:

```
postcss.config.js
vite.config.js
svelte.config.js
tailwind.config.js
```

**Why**: ES module syntax conflicts with runtime module loader

---

## Common Tasks

### View Logs
```bash
make logs
# or
ssh sysadm@82.97.8.94 'docker logs -f Web-Check-Checkit'
```

### Test Deployment
```bash
# Homepage
curl -I https://jetestemonsite.apdp.mc/

# API
curl https://jetestemonsite.apdp.mc/api/status?url=https://google.com
```

### Restart Container
```bash
ssh sysadm@82.97.8.94 'cd /opt/webcheck && docker compose restart'
```

### Full Rebuild
```bash
./deploy.sh --full
```

### Check Status
```bash
make status
# or
ssh sysadm@82.97.8.94 'docker ps | grep Web-Check-Checkit'
```

---

## Troubleshooting

### Container Won't Start

**Check logs**:
```bash
docker logs Web-Check-Checkit --tail 50
```

**Common issues**:
- Port already in use → Check for conflicting containers
- Build failed → Check SCSS imports and .dockerignore
- Missing dependencies → Run `./deploy.sh --full`

### 502 Bad Gateway

**Nginx can't reach container**:
```bash
# Check if container is up
docker ps | grep Web-Check-Checkit

# Check if Astro is listening on all interfaces
docker logs Web-Check-Checkit | grep "Network"
# Should show: Network  http://172.31.0.2:4321/

# If missing, check package.json has --host flag
```

### 500 Internal Server Error

**Astro SSR crash**:
```bash
# Watch logs in real-time
docker logs -f Web-Check-Checkit

# Make a request
curl https://jetestemonsite.apdp.mc/

# Check for errors in logs
```

**Common errors**:
- "Undefined mixin" → Missing SCSS import
- "Unexpected token 'export'" → Config file in image
- "Cannot use import statement" → ESM/CJS conflict

---

## Environment Variables

**Docker Container**:
```yaml
environment:
  - NODE_ENV=development
  - PORT=3001
  - PUBLIC_API_ENDPOINT=http://localhost:3001/api
  - CHROME_PATH=/usr/bin/chromium
```

**Astro Config**:
```javascript
const site = 'https://jetestemonsite.apdp.mc';
const output = 'hybrid';  // For dynamic routes
```

---

## Server Information

**SSH Access**:
```bash
ssh sysadm@82.97.8.94
```

**Application Path**:
```bash
cd /opt/webcheck
```

**Nginx Config**:
```bash
/etc/nginx/sites-available/jetestemonsite_apdp_mc
```

**SSL Certificate**:
```bash
/etc/ssl/certs/chatbot_apdp_mc.crt      # Wildcard *.apdp.mc
/etc/ssl/private/chatbot_apdp_mc.key
```

**Logs**:
```bash
# Application logs
docker logs -f Web-Check-Checkit

# Nginx logs
tail -f /var/log/nginx/jetestemonsite_apdp_mc_access.log
tail -f /var/log/nginx/jetestemonsite_apdp_mc_error.log
```

---

## Make Commands

```bash
make deploy    # Deploy application
make logs      # View container logs
make test      # Test endpoints
make status    # Check container status
make restart   # Restart container
make shell     # SSH into server
make urls      # Show access URLs
make help      # Show all commands
```

---

## Success Criteria

✅ Homepage loads (HTTP 200)  
✅ API responds with JSON  
✅ SSL certificate valid  
✅ No errors in logs  
✅ Container stays up (not restarting)  
✅ Both frontend and backend running  

**Current Status**: All criteria met! ✅

---

## Next Steps

### For Updates
1. Make changes locally
2. Test with `yarn dev`
3. Run `./deploy.sh`
4. Verify deployment

### For Issues
1. Check logs: `make logs`
2. Test endpoints: `make test`
3. Restart if needed: `make restart`
4. Full rebuild if broken: `./deploy.sh --full`

### For New Features
1. Develop and test locally
2. Update documentation
3. Deploy with `./deploy.sh`
4. Monitor logs for issues

---

**Last Updated**: November 9, 2025  
**Deployment**: Automated via deploy.sh  
**Monitoring**: docker logs + nginx logs  
**Backup**: Git repository (all changes committed)
