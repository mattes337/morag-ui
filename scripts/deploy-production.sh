#!/bin/bash
set -e

# Production deployment script for Morag UI
# This script handles the complete deployment process including:
# - Environment validation
# - Security checks
# - Database migrations
# - Application deployment
# - Health checks

echo "🚀 Starting Morag UI Production Deployment"
echo "=========================================="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handling
handle_error() {
    log_error "Deployment failed at step: $1"
    log_error "Check the logs above for details"
    exit 1
}

# Trap errors
trap 'handle_error "Unknown step"' ERR

# Step 1: Pre-deployment checks
log_info "Step 1: Running pre-deployment checks..."

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
    log_warning "Running as root is not recommended for production deployments"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check required files
required_files=("$ENV_FILE" "$COMPOSE_FILE" "Dockerfile" "package.json")
for file in "${required_files[@]}"; do
    if [ ! -f "$PROJECT_ROOT/$file" ]; then
        handle_error "Required file not found: $file"
    fi
done

# Check Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    handle_error "Docker is not installed or not in PATH"
fi

if ! command -v docker-compose &> /dev/null; then
    handle_error "Docker Compose is not installed or not in PATH"
fi

# Check Docker daemon
if ! docker info &> /dev/null; then
    handle_error "Docker daemon is not running"
fi

log_success "Pre-deployment checks passed"

# Step 2: Environment validation
log_info "Step 2: Validating environment configuration..."

# Source environment file
if [ -f "$PROJECT_ROOT/$ENV_FILE" ]; then
    source "$PROJECT_ROOT/$ENV_FILE"
else
    handle_error "Environment file not found: $ENV_FILE"
fi

# Check required environment variables
required_vars=("DATABASE_URL" "JWT_SECRET" "NEXTAUTH_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        handle_error "Required environment variable not set: $var"
    fi
done

# Validate JWT secret strength
if [ ${#JWT_SECRET} -lt 32 ]; then
    handle_error "JWT_SECRET must be at least 32 characters long"
fi

# Check for development values in production
if [[ "$CORS_ORIGINS" == *"localhost"* ]] && [ "$NODE_ENV" = "production" ]; then
    log_warning "CORS_ORIGINS contains localhost in production environment"
fi

log_success "Environment validation passed"

# Step 3: Security checks
log_info "Step 3: Running security checks..."

# Check file permissions
sensitive_files=("$ENV_FILE" "docker-compose.prod.yml")
for file in "${sensitive_files[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        perms=$(stat -c "%a" "$PROJECT_ROOT/$file")
        if [ "$perms" != "600" ] && [ "$perms" != "644" ]; then
            log_warning "File $file has permissive permissions: $perms"
        fi
    fi
done

# Check for secrets in environment file
if grep -q "password.*123\|secret.*test\|key.*demo" "$PROJECT_ROOT/$ENV_FILE"; then
    log_warning "Potential weak secrets detected in environment file"
fi

log_success "Security checks completed"

# Step 4: Create backup
log_info "Step 4: Creating backup..."

mkdir -p "$BACKUP_DIR"

# Backup database if running
if docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" ps mariadb | grep -q "Up"; then
    log_info "Creating database backup..."
    docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec -T mariadb \
        mysqldump -u root -p"$DB_ROOT_PASSWORD" --all-databases \
        > "$BACKUP_DIR/database_backup.sql" || log_warning "Database backup failed"
fi

# Backup environment file
cp "$PROJECT_ROOT/$ENV_FILE" "$BACKUP_DIR/" || log_warning "Environment backup failed"

# Backup uploads directory if exists
if [ -d "$PROJECT_ROOT/uploads" ]; then
    cp -r "$PROJECT_ROOT/uploads" "$BACKUP_DIR/" || log_warning "Uploads backup failed"
fi

log_success "Backup created at $BACKUP_DIR"

# Step 5: Build and deploy
log_info "Step 5: Building and deploying application..."

cd "$PROJECT_ROOT"

# Pull latest images
log_info "Pulling latest base images..."
docker-compose -f "$COMPOSE_FILE" pull

# Build application
log_info "Building application..."
docker-compose -f "$COMPOSE_FILE" build --no-cache app

# Stop existing services gracefully
log_info "Stopping existing services..."
docker-compose -f "$COMPOSE_FILE" down --timeout 30

# Start database first
log_info "Starting database..."
docker-compose -f "$COMPOSE_FILE" up -d mariadb

# Wait for database to be ready
log_info "Waiting for database to be ready..."
timeout=60
while [ $timeout -gt 0 ]; do
    if docker-compose -f "$COMPOSE_FILE" exec -T mariadb mysqladmin ping -h localhost --silent; then
        log_success "Database is ready"
        break
    fi
    sleep 2
    timeout=$((timeout - 2))
done

if [ $timeout -eq 0 ]; then
    handle_error "Database failed to start within 60 seconds"
fi

# Start application
log_info "Starting application..."
docker-compose -f "$COMPOSE_FILE" up -d app

log_success "Application deployed"

# Step 6: Health checks
log_info "Step 6: Running health checks..."

# Wait for application to start
log_info "Waiting for application to start..."
sleep 10

# Check application health
timeout=120
while [ $timeout -gt 0 ]; do
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log_success "Application health check passed"
        break
    fi
    sleep 5
    timeout=$((timeout - 5))
done

if [ $timeout -eq 0 ]; then
    handle_error "Application health check failed"
fi

# Check database connectivity
log_info "Checking database connectivity..."
if docker-compose -f "$COMPOSE_FILE" exec -T app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1\`.then(() => {
    console.log('Database connection successful');
    process.exit(0);
}).catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
});
"; then
    log_success "Database connectivity check passed"
else
    handle_error "Database connectivity check failed"
fi

# Step 7: Post-deployment tasks
log_info "Step 7: Running post-deployment tasks..."

# Clean up old Docker images
log_info "Cleaning up old Docker images..."
docker image prune -f

# Show deployment summary
log_info "Deployment Summary:"
echo "==================="
docker-compose -f "$COMPOSE_FILE" ps
echo ""

# Show resource usage
log_info "Resource Usage:"
echo "==============="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

log_success "🎉 Production deployment completed successfully!"
log_info "Application is available at: http://localhost:3000"
log_info "Health check endpoint: http://localhost:3000/api/health"
log_info "Backup created at: $BACKUP_DIR"

# Optional: Send deployment notification
if [ -n "$DEPLOYMENT_WEBHOOK_URL" ]; then
    log_info "Sending deployment notification..."
    curl -X POST "$DEPLOYMENT_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"Morag UI production deployment completed successfully\"}" \
        &> /dev/null || log_warning "Failed to send deployment notification"
fi

echo ""
log_info "Deployment logs are available with: docker-compose -f $COMPOSE_FILE logs -f"
log_info "To stop the application: docker-compose -f $COMPOSE_FILE down"
