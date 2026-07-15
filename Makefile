.PHONY: help \
	db-up db-down db-logs db-shell \
	up down build logs ps shell migrate \
	dev dev-up dev-down dev-build dev-rebuild dev-logs dev-shell dev-migrate dev-content-reset \
	staging-migrate staging-up staging-down staging-logs staging-build \
	prod-migrate prod-up prod-down prod-logs prod-build prod-deploy prod-messages \
	clean clean-dev clean-staging clean-prod

COMPOSE := $(shell docker compose version >/dev/null 2>&1 && echo "docker compose" || echo "docker-compose")
BASE    := -f docker-compose.yml
DEV     := $(BASE) -f docker-compose.dev.yml
STAGING := $(BASE) -f docker-compose.staging.yml
PROD    := $(BASE) -f docker-compose.prod.yml

.DEFAULT_GOAL := help

help: ## Show available targets
	@echo "Usage: make <target>"
	@echo ""
	@grep -E '^[a-zA-Z0-9_.-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# --- Database only (local dev with host pnpm) ---

db-up: ## Start PostgreSQL only
	$(COMPOSE) $(BASE) up db -d

db-down: ## Stop PostgreSQL
	$(COMPOSE) $(BASE) stop db

db-logs: ## Follow PostgreSQL logs
	$(COMPOSE) $(BASE) logs -f db

db-shell: ## Open psql in the database container
	$(COMPOSE) $(BASE) exec db psql -U $${POSTGRES_USER:-werkscode} -d $${POSTGRES_DB:-werkscode}

# --- Default stack (production image) ---

up: ## Start default stack in foreground
	$(COMPOSE) $(BASE) up

down: ## Stop default stack
	$(COMPOSE) $(BASE) down

build: ## Build default stack images
	$(COMPOSE) $(BASE) build

logs: ## Follow default stack logs
	$(COMPOSE) $(BASE) logs -f

ps: ## Show container status
	$(COMPOSE) $(BASE) ps -a

shell: ## Shell into default app container
	$(COMPOSE) $(BASE) exec app sh

migrate: ## Run database migrations (default stack)
	$(COMPOSE) $(BASE) --profile migrate up migrate

# --- Development (hot reload) ---

dev: ## Start dev stack in foreground
	$(COMPOSE) $(DEV) up

dev-up: ## Start dev stack in background
	$(COMPOSE) $(DEV) up -d

dev-down: ## Stop dev stack
	$(COMPOSE) $(DEV) down

dev-build: ## Build dev images
	$(COMPOSE) $(DEV) build

dev-rebuild: dev-build ## Rebuild image and restart dev (after package.json changes)
	$(COMPOSE) $(DEV) up -d --force-recreate --renew-anon-volumes app

dev-logs: ## Follow dev stack logs
	$(COMPOSE) $(DEV) logs -f

dev-shell: ## Shell into dev app container
	@$(COMPOSE) $(DEV) ps --status running -q app | grep -q . \
		|| (echo "App is not running. Start it with: make dev-up  (or rebuild after dependency changes: make dev-rebuild)" && exit 1)
	$(COMPOSE) $(DEV) exec app sh

dev-migrate: ## Run database migrations (dev stack)
	$(COMPOSE) $(DEV) --profile migrate up migrate

dev-content-reset: ## Clear @nuxt/content cache and restart dev app
	@$(COMPOSE) $(DEV) ps --status running -q app | grep -q . \
		|| (echo "App is not running. Start it with: make dev-up" && exit 1)
	$(COMPOSE) $(DEV) exec app sh -c 'rm -rf /app/.data/content'
	$(COMPOSE) $(DEV) restart app

# --- Staging ---

staging-migrate: ## Run database migrations (staging)
	$(COMPOSE) $(STAGING) --profile migrate up migrate

staging-up: ## Start staging stack in background
	$(COMPOSE) $(STAGING) up -d

staging-down: ## Stop staging stack
	$(COMPOSE) $(STAGING) down

staging-build: ## Build staging images
	$(COMPOSE) $(STAGING) build

staging-logs: ## Follow staging stack logs
	$(COMPOSE) $(STAGING) logs -f

# --- Production ---

prod-migrate: ## Run database migrations (production)
	$(COMPOSE) $(PROD) --profile migrate up migrate

prod-up: ## Start production stack in background
	$(COMPOSE) $(PROD) up -d

prod-down: ## Stop production stack
	$(COMPOSE) $(PROD) down

prod-build: ## Build production images
	$(COMPOSE) $(PROD) build

prod-deploy: ## Pull, migrate, rebuild, and restart app (run on server)
	./scripts/deploy-prod.sh

prod-logs: ## Follow production stack logs
	$(COMPOSE) $(PROD) logs -f

prod-messages: ## Show last 20 contact messages (production DB)
	$(COMPOSE) $(PROD) exec db psql -U $${POSTGRES_USER:-werkscode} -d $${POSTGRES_DB:-werkscode} -c "SELECT created_at, name, email, left(message, 80) AS message FROM contact_messages ORDER BY created_at DESC LIMIT 20;"

# --- Cleanup ---

clean: ## Stop default stack and remove volumes
	$(COMPOSE) $(BASE) down -v

clean-dev: ## Stop dev stack and remove volumes
	$(COMPOSE) $(DEV) down -v

clean-staging: ## Stop staging stack and remove volumes
	$(COMPOSE) $(STAGING) down -v

clean-prod: ## Stop production stack and remove volumes
	$(COMPOSE) $(PROD) down -v
