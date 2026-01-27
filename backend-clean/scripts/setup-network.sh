#!/bin/bash
# Rockefeller HELOC Internal Network Setup Script
# Reference Number: 123456789-HELOC

set -e

echo "🏗️  Setting up Rockefeller HELOC Internal Network..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_status "ERROR" "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_status "ERROR" "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "INFO" "Creating necessary directories..."
mkdir -p ./ssl/certs
mkdir -p ./ssl/private
mkdir -p ./logs
mkdir -p ./backups
mkdir -p ./monitoring/grafana/dashboards
mkdir -p ./monitoring/grafana/datasources
mkdir -p ./haproxy

# Generate SSL certificates
print_status "INFO" "Generating SSL certificates..."
if [ ! -f "./ssl/certs/rockefeller-heloc.crt" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ./ssl/private/rockefeller-heloc.key \
        -out ./ssl/certs/rockefeller-heloc.crt \
        -subj "/C=US/ST=NY/L=New York/O=Rockefeller/OU=HELOC/CN=rockefeller-heloc.com"
    print_status "OK" "SSL certificates generated"
else
    print_status "WARN" "SSL certificates already exist"
fi

# Create Redis configuration
print_status "INFO" "Creating Redis configuration..."
cat > ./redis.conf << EOF
# Rockefeller HELOC Redis Configuration
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir ./
slave-serve-stale-data yes
slave-serve-stale-data yes
slave-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
slave-priority 100
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
lua-time-limit 5000
slowlog-log-slower-than 10000
slowlog-max-len 128
latency-monitor-threshold 0
notify-keyspace-events ""
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit slave 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
aof-rewrite-incremental-fsync yes
EOF

# Create HAProxy configuration
print_status "INFO" "Creating HAProxy configuration..."
cat > ./haproxy/haproxy.cfg << EOF
global
    daemon
    maxconn 4096
    log stdout local0
    stats socket /run/haproxy.sock mode 660 level admin expose-fd listeners

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog
    option dontlognull
    retries 3

frontend http_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/rockefeller-heloc.crt
    redirect scheme https if !{ ssl_fc }
    default_backend api_backend

backend api_backend
    balance roundrobin
    option httpchk GET /health
    server api-gateway api-gateway:4000 check
    server frontend-gateway frontend-gateway:3000 check

backend heloc_backend
    balance roundrobin
    option httpchk GET /health
    server heloc-service heloc-service:4001 check

backend payment_backend
    balance roundrobin
    option httpchk GET /health
    server payment-service payment-service:4002 check

backend fraud_backend
    balance roundrobin
    option httpchk GET /health
    server fraud-service fraud-service:4003 check

backend notification_backend
    balance roundrobin
    option httpchk GET /health
    server notification-service notification-service:4004 check

backend ai_backend
    balance roundrobin
    option httpchk GET /health
    server ai-service ai-service:4005 check

listen stats
    bind *:8404
    stats enable
    stats uri /
    stats refresh 30s
    stats admin if TRUE
EOF

# Create Prometheus configuration
print_status "INFO" "Creating Prometheus configuration..."
cat > ./monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:4000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'heloc-service'
    static_configs:
      - targets: ['heloc-service:4001']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'payment-service'
    static_configs:
      - targets: ['payment-service:4002']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'fraud-service'
    static_configs:
      - targets: ['fraud-service:4003']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'notification-service'
    static_configs:
      - targets: ['notification-service:4004']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'ai-service'
    static_configs:
      - targets: ['ai-service:4005']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    metrics_path: '/metrics'
    scrape_interval: 15s
EOF

# Create Grafana datasource configuration
print_status "INFO" "Creating Grafana datasource configuration..."
cat > ./monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

# Create database initialization script
print_status "INFO" "Creating database initialization script..."
cat > ./scripts/init-db.sql << EOF
-- Rockefeller HELOC Database Initialization
-- Reference Number: 123456789-HELOC

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON "Wallet"(userId);
CREATE INDEX IF NOT EXISTS idx_transaction_user_id ON "Transaction"(userId);
CREATE INDEX IF NOT EXISTS idx_transaction_created_at ON "Transaction"(createdAt);
CREATE INDEX IF NOT EXISTS idx_heloc_application_user_id ON "HELOCApplication"(userId);
CREATE INDEX IF NOT EXISTS idx_heloc_account_user_id ON "HELOCAccount"(userId);
CREATE INDEX IF NOT EXISTS idx_heloc_draw_account_id ON "HELOCDraw"(accountId);
CREATE INDEX IF NOT EXISTS idx_heloc_repayment_account_id ON "HELOCRepayment"(accountId);

-- Create initial admin user
INSERT INTO "User" (
    id, 
    email, 
    password, 
    firstName, 
    lastName, 
    role, 
    status, 
    isEmailVerified, 
    isAdminApproved, 
    createdAt, 
    updatedAt
) VALUES (
    uuid_generate_v4(),
    'admin@rockefeller-heloc.com',
    '\$2b\$10\$YourHashedPasswordHere',
    'Admin',
    'User',
    'ADMIN',
    'ACTIVE',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create initial HELOC settings
INSERT INTO "HELOCSettings" (
    id,
    minCreditScore,
    maxLTVRatio,
    minLoanAmount,
    maxLoanAmount,
    baseInterestRate,
    createdAt,
    updatedAt
) VALUES (
    uuid_generate_v4(),
    680,
    0.85,
    25000,
    500000,
    7.5,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

COMMIT;
EOF

# Set up environment file
print_status "INFO" "Setting up environment file..."
if [ ! -f "./.env.production" ]; then
    cp .env.example .env.production
    print_status "OK" "Environment file created from template"
    print_status "WARN" "Please edit .env.production with your actual values"
else
    print_status "WARN" "Environment file already exists"
fi

# Create Docker network
print_status "INFO" "Creating Docker network..."
if ! docker network ls | grep -q "rockefeller-heloc-network"; then
    docker network create rockefeller-heloc-network \
        --driver bridge \
        --subnet=172.20.0.0/16 \
        --gateway=172.20.0.1
    print_status "OK" "Docker network created"
else
    print_status "WARN" "Docker network already exists"
fi

# Build and start services
print_status "INFO" "Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to start
print_status "INFO" "Waiting for services to start..."
sleep 30

# Run health checks
print_status "INFO" "Running health checks..."
./scripts/health-check.sh

echo ""
echo "=================================================="
print_status "OK" "Rockefeller HELOC Internal Network Setup Complete!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend:          http://localhost:3000"
echo "   API Gateway:       http://localhost:4000"
echo "   Grafana Dashboard: http://localhost:3001"
echo "   Prometheus:        http://localhost:9090"
echo "   HAProxy Stats:     http://localhost:8404"
echo ""
echo "🔌 Internal Services:"
echo "   HELOC Service:     http://localhost:4001"
echo "   Payment Service:   http://localhost:4002"
echo "   Fraud Service:     http://localhost:4003"
echo "   Notification:      http://localhost:4004"
echo "   AI Service:        http://localhost:4005"
echo ""
echo "🗄️ Database:"
echo "   PostgreSQL:        localhost:5432"
echo "   Redis:             localhost:6379"
echo ""
print_status "INFO" "Reference Number: 123456789-HELOC"
print_status "OK" "Network is ready for HELOC integration deployment!"
