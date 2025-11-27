#!/bin/bash

# 502 Error Page Setup Script for APDP Checkit
# Run this script ON THE SERVER after deployment

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
NC='\033[0m'

# Configuration - adjust these paths as needed
PROJECT_DIR="/opt/webcheck"
PUBLIC_DIR="${PROJECT_DIR}/public"

echo -e "${BLUE}==>${NC} Step 1: Creating public directory..."

# Create public directory
sudo mkdir -p "$PUBLIC_DIR"
echo -e "${GREEN}✓${NC} Created: $PUBLIC_DIR"

echo ""
echo -e "${BLUE}==>${NC} Step 2: Checking if 502.html exists..."

if [ -f "${PROJECT_DIR}/public/502.html" ]; then
    echo -e "${GREEN}✓${NC} 502.html found in project"
    sudo cp "${PROJECT_DIR}/public/502.html" "${PUBLIC_DIR}/502.html"
else
    echo -e "${YELLOW}⚠${NC} 502.html not found, creating it..."
    # Create the 502.html inline
    sudo tee "${PUBLIC_DIR}/502.html" > /dev/null << 'HTMLEOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Maintenance en cours - APDP Monaco</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            width: 100%;
            background: rgba(26, 35, 50, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(220, 38, 38, 0.2);
            border-radius: 24px;
            padding: 48px 32px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: white;
            border: 3px solid #dc2626;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 40px;
            animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .icon { font-size: 48px; margin-bottom: 20px; }
        h1 { font-size: 28px; font-weight: 700; margin-bottom: 12px; }
        .subtitle { font-size: 16px; color: #94a3b8; margin-bottom: 24px; line-height: 1.6; }
        .badge {
            display: inline-block;
            background: rgba(220, 38, 38, 0.15);
            border: 1px solid rgba(220, 38, 38, 0.3);
            color: #fca5a5;
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
        }
        .progress {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 24px;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #dc2626, #ef4444, #dc2626);
            background-size: 200% 100%;
            animation: progress 1.5s ease-in-out infinite;
        }
        @keyframes progress {
            0% { width: 0%; background-position: 0% 50%; }
            50% { width: 70%; background-position: 100% 50%; }
            100% { width: 0%; background-position: 0% 50%; }
        }
        .info { font-size: 14px; color: #cbd5e1; margin-bottom: 24px; }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4); }
        .spinner {
            width: 14px; height: 14px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .footer { font-size: 12px; color: #64748b; margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🏛️</div>
        <div class="icon">🔧</div>
        <h1>Mise à jour en cours</h1>
        <p class="subtitle">Nous déployons des améliorations pour vous offrir une meilleure expérience.</p>
        <div class="badge">Déploiement en cours</div>
        <div class="progress"><div class="progress-bar"></div></div>
        <p class="info">Le service sera disponible dans quelques instants.</p>
        <button class="btn" onclick="window.location.reload()">
            <span class="spinner"></span>
            <span>Actualiser</span>
        </button>
        <div class="footer">Outil d'analyse de la sécurité<br><strong>APDP Monaco</strong></div>
    </div>
    <script>setTimeout(function() { window.location.reload(); }, 5000);</script>
</body>
</html>
HTMLEOF
    echo -e "${GREEN}✓${NC} Created 502.html"
fi

# Set permissions
sudo chown www-data:www-data "${PUBLIC_DIR}/502.html" 2>/dev/null || sudo chown nginx:nginx "${PUBLIC_DIR}/502.html" 2>/dev/null || true
sudo chmod 644 "${PUBLIC_DIR}/502.html"
echo -e "${GREEN}✓${NC} Set permissions"

echo ""
echo -e "${BLUE}==>${NC} Step 3: Updating nginx configuration..."

# Find nginx config
NGINX_CONF=""
if [ -f "/etc/nginx/sites-available/jetestemonsite.apdp.mc" ]; then
    NGINX_CONF="/etc/nginx/sites-available/jetestemonsite.apdp.mc"
elif [ -f "/etc/nginx/conf.d/default.conf" ]; then
    NGINX_CONF="/etc/nginx/conf.d/default.conf"
elif [ -f "/etc/nginx/nginx.conf" ]; then
    NGINX_CONF="/etc/nginx/nginx.conf"
fi

if [ -n "$NGINX_CONF" ]; then
    echo -e "${BLUE}Found nginx config: $NGINX_CONF${NC}"
    
    # Backup
    sudo cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✓${NC} Backed up nginx config"
    
    # Check if error_page directive already exists
    if grep -q "error_page 502" "$NGINX_CONF"; then
        echo -e "${YELLOW}⚠${NC} error_page 502 already configured"
    else
        echo -e "${BLUE}Adding error_page directive...${NC}"
        # Add error page configuration
        sudo sed -i '/server {/a\    # Custom 502 error page\n    error_page 502 503 504 /502.html;\n    location = /502.html {\n        root '"${PUBLIC_DIR}"';\n        internal;\n    }' "$NGINX_CONF"
        echo -e "${GREEN}✓${NC} Added error_page directive"
    fi
    
    # Add proxy_intercept_errors if not present
    if ! grep -q "proxy_intercept_errors" "$NGINX_CONF"; then
        sudo sed -i 's/proxy_pass/proxy_intercept_errors on;\n        proxy_pass/g' "$NGINX_CONF"
        echo -e "${GREEN}✓${NC} Added proxy_intercept_errors"
    fi
else
    echo -e "${YELLOW}⚠${NC} Could not find nginx config automatically"
    echo "Please add these lines to your nginx server block manually:"
    echo ""
    echo "    error_page 502 503 504 /502.html;"
    echo "    location = /502.html {"
    echo "        root ${PUBLIC_DIR};"
    echo "        internal;"
    echo "    }"
fi

echo ""
echo -e "${BLUE}==>${NC} Step 4: Testing nginx configuration..."

if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓${NC} Nginx configuration is valid"
    
    echo ""
    echo -e "${BLUE}==>${NC} Step 5: Reloading nginx..."
    sudo systemctl reload nginx || sudo nginx -s reload
    echo -e "${GREEN}✓${NC} Nginx reloaded"
else
    echo -e "${RED}✗${NC} Nginx configuration test failed!"
    echo "Please check the configuration manually."
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  ✓ Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "The 502 page is now at: ${PUBLIC_DIR}/502.html"
echo ""
echo "To test: stop the Docker container and visit the site"
echo ""

