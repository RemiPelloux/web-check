.PHONY: help setup deploy deploy-quick deploy-full status logs restart stop clean test ssh

# Configuration
REMOTE_USER := sysadm
REMOTE_HOST := 82.97.8.94
REMOTE_PATH := /opt/webcheck

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

help: ## Show this help message
	@echo "$(BLUE)Checkit Deployment Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)Examples:$(NC)"
	@echo "  make deploy        # Deploy to production"
	@echo "  make logs          # View application logs"
	@echo "  make status        # Check deployment status"
	@echo "  make restart       # Quick restart"

setup: ## Initial server setup (first time only)
	@echo "$(YELLOW)Running initial setup...$(NC)"
	@chmod +x setup.sh
	@./setup.sh

deploy: ## Deploy application to server
	@echo "$(YELLOW)Deploying to production...$(NC)"
	@chmod +x deploy.sh
	@./deploy.sh

deploy-quick: ## Quick deployment (restart only, no rebuild)
	@echo "$(YELLOW)Quick restart...$(NC)"
	@chmod +x deploy.sh
	@./deploy.sh --quick

deploy-full: ## Full deployment (rebuild with no cache)
	@echo "$(YELLOW)Full rebuild and deploy...$(NC)"
	@chmod +x deploy.sh
	@./deploy.sh --full

status: ## Check deployment status
	@echo "$(BLUE)Container Status:$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'docker ps | grep Checkit'
	@echo ""
	@echo "$(BLUE)Resource Usage:$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'docker stats Web-Check-Checkit --no-stream'

logs: ## View application logs (last 50 lines)
	@echo "$(BLUE)Application Logs:$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'docker logs Web-Check-Checkit --tail 50'

logs-live: ## Follow application logs in real-time
	@echo "$(BLUE)Following logs... (Ctrl+C to stop)$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'docker logs -f Web-Check-Checkit'

logs-errors: ## View only error logs
	@echo "$(BLUE)Error Logs:$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'docker logs Web-Check-Checkit 2>&1 | grep -i "error\|fail\|cannot"'

restart: ## Restart the application
	@echo "$(YELLOW)Restarting application...$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'cd $(REMOTE_PATH) && docker compose restart'
	@echo "$(GREEN)✓ Application restarted$(NC)"

stop: ## Stop the application
	@echo "$(YELLOW)Stopping application...$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'cd $(REMOTE_PATH) && docker compose down'
	@echo "$(GREEN)✓ Application stopped$(NC)"

start: ## Start the application
	@echo "$(YELLOW)Starting application...$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'cd $(REMOTE_PATH) && docker compose up -d'
	@echo "$(GREEN)✓ Application started$(NC)"

rebuild: ## Rebuild Docker containers
	@echo "$(YELLOW)Rebuilding containers...$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'cd $(REMOTE_PATH) && docker compose build'
	@echo "$(GREEN)✓ Rebuild complete$(NC)"

clean: ## Clean up Docker resources
	@echo "$(YELLOW)Cleaning Docker resources...$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'docker system prune -f'
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

test: ## Test the deployment
	@echo "$(BLUE)Testing Frontend:$(NC)"
	@curl -s -o /dev/null -w "  Status: %{http_code}\n" http://$(REMOTE_HOST):3003
	@echo ""
	@echo "$(BLUE)Testing API:$(NC)"
	@curl -s http://$(REMOTE_HOST):3004/api/status?url=https://google.com | head -100
	@echo ""
	@echo "$(BLUE)Testing Through Nginx:$(NC)"
	@curl -s https://jetestemonsite.apdp.mc/api/status?url=https://google.com | head -100

test-api: ## Test specific API endpoint
	@echo "$(BLUE)Testing API endpoint:$(NC)"
	@curl -s https://jetestemonsite.apdp.mc/api/status?url=https://google.com
	@echo ""

test-dns: ## Test DNS API endpoint
	@echo "$(BLUE)Testing DNS endpoint:$(NC)"
	@curl -s https://jetestemonsite.apdp.mc/api/dns?url=https://google.com | head -200
	@echo ""

ssh: ## SSH into the server
	@ssh $(REMOTE_USER)@$(REMOTE_HOST)

ssh-container: ## SSH into the Docker container
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'docker exec -it Web-Check-Checkit bash'

nginx-test: ## Test Nginx configuration
	@echo "$(BLUE)Testing Nginx configuration:$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'sudo nginx -t'

nginx-reload: ## Reload Nginx
	@echo "$(YELLOW)Reloading Nginx...$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'sudo systemctl reload nginx'
	@echo "$(GREEN)✓ Nginx reloaded$(NC)"

nginx-logs: ## View Nginx logs
	@echo "$(BLUE)Nginx Access Logs:$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'tail -20 /var/log/nginx/access.log'
	@echo ""
	@echo "$(BLUE)Nginx Error Logs:$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'tail -20 /var/log/nginx/error.log'

backup: ## Backup the deployment
	@echo "$(YELLOW)Creating backup...$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'tar czf /tmp/webcheck-backup-$$(date +%Y%m%d-%H%M%S).tar.gz $(REMOTE_PATH)'
	@echo "$(GREEN)✓ Backup created in /tmp/$(NC)"

urls: ## Show access URLs
	@echo "$(BLUE)Access URLs:$(NC)"
	@echo "  • Domain:  https://jetestemonsite.apdp.mc"
	@echo "  • Direct:  http://$(REMOTE_HOST):3003 (development only)"
	@echo ""
	@echo "$(BLUE)API Test:$(NC)"
	@echo "  curl https://jetestemonsite.apdp.mc/api/status?url=https://google.com"

info: ## Show deployment information
	@echo "$(BLUE)Deployment Information:$(NC)"
	@echo "  Server:   $(REMOTE_USER)@$(REMOTE_HOST)"
	@echo "  Path:     $(REMOTE_PATH)"
	@echo ""
	@echo "$(BLUE)Container Status:$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'docker ps | grep Checkit'
	@echo ""
	@echo "$(BLUE)Port Mappings:$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'docker port Web-Check-Checkit'

monitor: ## Monitor resource usage
	@echo "$(BLUE)Monitoring resource usage... (Ctrl+C to stop)$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'docker stats Web-Check-Checkit'

emergency-restart: ## Emergency full restart
	@echo "$(RED)EMERGENCY RESTART - Stopping all services$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'cd $(REMOTE_PATH) && docker compose down'
	@sleep 2
	@echo "$(YELLOW)Building containers...$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'cd $(REMOTE_PATH) && docker compose build --no-cache'
	@echo "$(YELLOW)Starting services...$(NC)"
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) 'cd $(REMOTE_PATH) && docker compose up -d'
	@sleep 10
	@echo "$(GREEN)✓ Emergency restart complete$(NC)"
	@make status




