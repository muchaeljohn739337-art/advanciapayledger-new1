#!/bin/bash
# Rockefeller HELOC Layered Network Setup Script
# Reference Number: 123456789-HELOC
# Three-Layer Architecture: Structural → Information → Control

set -e

echo "🏗️  Setting up Rockefeller HELOC Layered Network Architecture"
echo "============================================================"
echo "Layer 1: Structural (Infrastructure)"
echo "Layer 2: Information (Data Processing)"
echo "Layer 3: Control (Business Logic & User Interface)"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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
        "STRUCTURAL")
            echo -e "${PURPLE}🏗️  $message${NC}"
            ;;
        "INFORMATION")
            echo -e "${CYAN}📊 $message${NC}"
            ;;
        "CONTROL")
            echo -e "${GREEN}🎛️  $message${NC}"
            ;;
        "GATEWAY")
            echo -e "${YELLOW}🚪 $message${NC}"
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    print_status "INFO" "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_status "ERROR" "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_status "ERROR" "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "OK" "Prerequisites check passed"
}

# Create layer-specific directories
create_layer_directories() {
    print_status "INFO" "Creating layer-specific directories..."
    
    # Structural Layer Directories
    mkdir -p ./structural/ssl/certs
    mkdir -p ./structural/ssl/private
    mkdir -p ./structural/config
    mkdir -p ./structural/logs
    
    # Information Layer Directories
    mkdir -p ./information/data
    mkdir -p ./information/config
    mkdir -p ./information/logs
    mkdir -p ./information/validation-rules
    
    # Control Layer Directories
    mkdir -p ./control/user-data
    mkdir -p ./control/config
    mkdir -p ./control/logs
    mkdir -p ./control/business-rules
    
    # Gateway Layer Directories
    mkdir -p ./gateway/config
    mkdir -p ./gateway/logs
    mkdir -p ./gateway/policies
    
    # Monitoring Directories
    mkdir -p ./monitoring/structural
    mkdir -p ./monitoring/information
    mkdir -p ./monitoring/control
    
    # Redis Configurations
    mkdir -p ./redis/structural
    mkdir -p ./redis/information
    mkdir -p ./redis/control
    
    print_status "OK" "Layer directories created"
}

# Generate layer-specific SSL certificates
generate_ssl_certificates() {
    print_status "INFO" "Generating layer-specific SSL certificates..."
    
    # Structural Layer Certificate
    if [ ! -f "./structural/ssl/certs/structural.crt" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ./structural/ssl/private/structural.key \
            -out ./structural/ssl/certs/structural.crt \
            -subj "/C=US/ST=NY/L=New York/O=Rockefeller/OU=Structural/CN=structural.rockefeller-heloc.com"
        print_status "STRUCTURAL" "Structural layer SSL certificate generated"
    fi
    
    # Information Layer Certificate
    if [ ! -f "./information/ssl/certs/information.crt" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ./information/ssl/private/information.key \
            -out ./information/ssl/certs/information.crt \
            -subj "/C=US/ST=NY/L=New York/O=Rockefeller/OU=Information/CN=information.rockefeller-heloc.com"
        print_status "INFORMATION" "Information layer SSL certificate generated"
    fi
    
    # Control Layer Certificate
    if [ ! -f "./control/ssl/certs/control.crt" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ./control/ssl/private/control.key \
            -out ./control/ssl/certs/control.crt \
            -subj "/C=US/ST=NY/L=New York/O=Rockefeller/OU=Control/CN=control.rockefeller-heloc.com"
        print_status "CONTROL" "Control layer SSL certificate generated"
    fi
    
    # Gateway Certificate
    if [ ! -f "./gateway/ssl/certs/gateway.crt" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ./gateway/ssl/private/gateway.key \
            -out ./gateway/ssl/certs/gateway.crt \
            -subj "/C=US/ST=NY/L=New York/O=Rockefeller/OU=Gateway/CN=gateway.rockefeller-heloc.com"
        print_status "GATEWAY" "Gateway SSL certificate generated"
    fi
}

# Create layer-specific Redis configurations
create_redis_configurations() {
    print_status "INFO" "Creating layer-specific Redis configurations..."
    
    # Structural Layer Redis Configuration
    cat > ./redis/structural/redis.conf << EOF
# Rockefeller HELOC Structural Layer Redis Configuration
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_structural.pid
loglevel notice
logfile ""
databases 8
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename structural.rdb
dir ./
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "structural.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
lua-time-limit 5000
slowlog-log-slower-than 10000
slowlog-max-len 128
latency-monitor-threshold 0
notify-keyspace-events "Ex"
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

    # Information Layer Redis Configuration
    cat > ./redis/information/redis.conf << EOF
# Rockefeller HELOC Information Layer Redis Configuration
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_information.pid
loglevel notice
logfile ""
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename information.rdb
dir ./
maxmemory-policy volatile-lru
appendonly yes
appendfilename "information.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
lua-time-limit 5000
slowlog-log-slower-than 10000
slowlog-max-len 128
latency-monitor-threshold 0
notify-keyspace-events "KEA"
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

    # Control Layer Redis Configuration
    cat > ./redis/control/redis.conf << EOF
# Rockefeller HELOC Control Layer Redis Configuration
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_control.pid
loglevel notice
logfile ""
databases 32
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename control.rdb
dir ./
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "control.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
lua-time-limit 5000
slowlog-log-slower-than 10000
slowlog-max-len 128
latency-monitor-threshold 0
notify-keyspace-events "KEA"
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

    print_status "OK" "Redis configurations created"
}

# Create layer-specific monitoring configurations
create_monitoring_configurations() {
    print_status "INFO" "Creating layer-specific monitoring configurations..."
    
    # Structural Layer Prometheus Configuration
    cat > ./monitoring/structural/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "structural_rules.yml"

scrape_configs:
  - job_name: 'structural-infrastructure'
    static_configs:
      - targets: ['infrastructure-manager:9001']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'structural-security'
    static_configs:
      - targets: ['security-manager:9002']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'structural-storage'
    static_configs:
      - targets: ['storage-manager:9003']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'structural-network'
    static_configs:
      - targets: ['network-manager:9004']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'structural-postgres'
    static_configs:
      - targets: ['postgres-structural:5432']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'structural-redis'
    static_configs:
      - targets: ['redis-structural:6379']
    metrics_path: '/metrics'
    scrape_interval: 15s
EOF

    # Information Layer Prometheus Configuration
    cat > ./monitoring/information/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "information_rules.yml"

scrape_configs:
  - job_name: 'information-data-ingestion'
    static_configs:
      - targets: ['data-ingestion:9101']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'information-validation'
    static_configs:
      - targets: ['validation-engine:9102']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'information-processing'
    static_configs:
      - targets: ['processing-engine:9103']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'information-analytics'
    static_configs:
      - targets: ['analytics-engine:9104']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'information-postgres'
    static_configs:
      - targets: ['postgres-information:5432']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'information-redis'
    static_configs:
      - targets: ['redis-information:6379']
    metrics_path: '/metrics'
    scrape_interval: 15s
EOF

    # Control Layer Prometheus Configuration
    cat > ./monitoring/control/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "control_rules.yml"

scrape_configs:
  - job_name: 'control-business-logic'
    static_configs:
      - targets: ['business-logic:9201']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'control-user-interface'
    static_configs:
      - targets: ['user-interface:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'control-execution'
    static_configs:
      - targets: ['execution-engine:9203']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'control-decision'
    static_configs:
      - targets: ['decision-engine:9204']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'control-postgres'
    static_configs:
      - targets: ['postgres-control:5432']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'control-redis'
    static_configs:
      - targets: ['redis-control:6379']
    metrics_path: '/metrics'
    scrape_interval: 15s
EOF

    print_status "OK" "Monitoring configurations created"
}

# Create layer-specific database initialization scripts
create_database_init_scripts() {
    print_status "INFO" "Creating layer-specific database initialization scripts..."
    
    # Structural Layer Database Init
    cat > ./scripts/init-structural-db.sql << EOF
-- Rockefeller HELOC Structural Layer Database Initialization
-- Reference Number: 123456789-HELOC

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Infrastructure tables
CREATE TABLE IF NOT EXISTS infrastructure_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type VARCHAR(50) NOT NULL,
    resource_name VARCHAR(100) NOT NULL,
    resource_status VARCHAR(20) DEFAULT 'ACTIVE',
    resource_config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    event_severity VARCHAR(20) DEFAULT 'MEDIUM',
    event_description TEXT,
    event_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS network_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    network_name VARCHAR(100) NOT NULL,
    network_type VARCHAR(50) NOT NULL,
    network_config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_infrastructure_resources_type ON infrastructure_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_infrastructure_resources_status ON infrastructure_resources(resource_status);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(event_severity);
CREATE INDEX IF NOT EXISTS idx_network_configurations_type ON network_configurations(network_type);

COMMIT;
EOF

    # Information Layer Database Init
    cat > ./scripts/init-information-db.sql << EOF
-- Rockefeller HELOC Information Layer Database Initialization
-- Reference Number: 123456789-HELOC

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Data processing tables
CREATE TABLE IF NOT EXISTS data_ingestion_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_system VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    ingestion_status VARCHAR(20) DEFAULT 'PENDING',
    validation_status VARCHAR(20) DEFAULT 'PENDING',
    data_volume BIGINT DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS validation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    rule_config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS processing_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(100) NOT NULL,
    workflow_type VARCHAR(50) NOT NULL,
    workflow_status VARCHAR(20) DEFAULT 'PENDING',
    input_data JSONB,
    output_data JSONB,
    processing_steps JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC,
    metric_unit VARCHAR(20),
    metric_timestamp TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_data_ingestion_logs_status ON data_ingestion_logs(ingestion_status);
CREATE INDEX IF NOT EXISTS idx_data_ingestion_logs_created_at ON data_ingestion_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_validation_rules_active ON validation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_processing_workflows_status ON processing_workflows(workflow_status);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name ON analytics_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_timestamp ON analytics_metrics(metric_timestamp);

COMMIT;
EOF

    # Control Layer Database Init
    cat > ./scripts/init-control-db.sql << EOF
-- Rockefeller HELOC Control Layer Database Initialization
-- Reference Number: 123456789-HELOC

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Business logic tables
CREATE TABLE IF NOT EXISTS heloc_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    application_status VARCHAR(20) DEFAULT 'PENDING',
    application_data JSONB,
    risk_assessment JSONB,
    approval_decision JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    session_status VARCHAR(20) DEFAULT 'ACTIVE',
    session_metadata JSONB,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(100) NOT NULL,
    workflow_type VARCHAR(50) NOT NULL,
    execution_status VARCHAR(20) DEFAULT 'PENDING',
    execution_context JSONB,
    execution_steps JSONB,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decision_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_type VARCHAR(50) NOT NULL,
    decision_context JSONB,
    decision_result JSONB,
    decision_confidence NUMERIC,
    ai_model_used VARCHAR(100),
    human_review_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_heloc_applications_status ON heloc_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_heloc_applications_user_id ON heloc_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(execution_status);
CREATE INDEX IF NOT EXISTS idx_decision_logs_type ON decision_logs(decision_type);
CREATE INDEX IF NOT EXISTS idx_decision_logs_created_at ON decision_logs(created_at);

COMMIT;
EOF

    print_status "OK" "Database initialization scripts created"
}

# Create layer-specific Dockerfiles
create_layer_dockerfiles() {
    print_status "INFO" "Creating layer-specific Dockerfiles..."
    
    # Structural Layer Dockerfile
    cat > ./Dockerfile.structural << EOF
FROM node:18-alpine

# Layer identification
LABEL layer="structural"
LABEL purpose="infrastructure-management"
LABEL authority="infrastructure-admin"

WORKDIR /app

# Copy structural layer specific files
COPY package*.json ./
COPY src/structural/ ./src/structural/
COPY src/shared/ ./src/shared/

# Install dependencies
RUN npm ci --only=production

# Build structural services
RUN npm run build:structural

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:\${PORT:-9001}/health || exit 1

EXPOSE 9001-9004

CMD ["npm", "run", "start:structural"]
EOF

    # Information Layer Dockerfile
    cat > ./Dockerfile.information << EOF
FROM node:18-alpine

# Layer identification
LABEL layer="information"
LABEL purpose="data-processing"
LABEL authority="data-processor"

WORKDIR /app

# Copy information layer specific files
COPY package*.json ./
COPY src/information/ ./src/information/
COPY src/shared/ ./src/shared/

# Install dependencies
RUN npm ci --only=production

# Build information services
RUN npm run build:information

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:\${PORT:-9101}/health || exit 1

EXPOSE 9101-9104

CMD ["npm", "run", "start:information"]
EOF

    # Control Layer Dockerfile
    cat > ./Dockerfile.control << EOF
FROM node:18-alpine

# Layer identification
LABEL layer="control"
LABEL purpose="business-logic"
LABEL authority="business-executor"

WORKDIR /app

# Copy control layer specific files
COPY package*.json ./
COPY src/control/ ./src/control/
COPY src/shared/ ./src/shared/

# Install dependencies
RUN npm ci --only=production

# Build control services
RUN npm run build:control

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:\${PORT:-9201}/health || exit 1

EXPOSE 9201-9204

CMD ["npm", "run", "start:control"]
EOF

    # Gateway Layer Dockerfile
    cat > ./Dockerfile.gateway << EOF
FROM node:18-alpine

# Layer identification
LABEL layer="gateway"
LABEL purpose="inter-layer-communication"
LABEL authority="gateway-operator"

WORKDIR /app

# Copy gateway layer specific files
COPY package*.json ./
COPY src/gateway/ ./src/gateway/
COPY src/shared/ ./src/shared/

# Install dependencies
RUN npm ci --only=production

# Build gateway services
RUN npm run build:gateway

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:\${PORT:-9301}/health || exit 1

EXPOSE 9301-9303

CMD ["npm", "run", "start:gateway"]
EOF

    print_status "OK" "Layer-specific Dockerfiles created"
}

# Create environment configuration
create_environment_config() {
    print_status "INFO" "Creating environment configuration..."
    
    cat > .env.layered << EOF
# Rockefeller HELOC Layered Network Environment Configuration
# Reference Number: 123456789-HELOC

# Layer 1: Structural Layer Configuration
STRUCTURAL_DB_PASSWORD=structural_secure_password_123
STRUCTURAL_REDIS_PASSWORD=structural_redis_password_123

# Layer 2: Information Layer Configuration
INFORMATION_DB_PASSWORD=information_secure_password_123
INFORMATION_REDIS_PASSWORD=information_redis_password_123

# Layer 3: Control Layer Configuration
CONTROL_DB_PASSWORD=control_secure_password_123
CONTROL_REDIS_PASSWORD=control_redis_password_123

# Gateway Configuration
GATEWAY_SECRET_KEY=gateway_secret_key_123456789
GATEWAY_ENCRYPTION_KEY=gateway_encryption_key_123456789

# Security Configuration
JWT_SECRET=rockefeller_heloc_jwt_secret_123456789
JWT_EXPIRATION=24h

# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Payment Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Email Configuration
EMAIL_SERVICE_KEY=your_email_service_key_here
EMAIL_FROM_ADDRESS=noreply@rockefeller-heloc.com

# Monitoring Configuration
GRAFANA_PASSWORD=grafana_admin_password_123
PROMETHEUS_RETENTION=200h

# Network Configuration
STRUCTURAL_SUBNET=172.21.0.0/16
INFORMATION_SUBNET=172.22.0.0/16
CONTROL_SUBNET=172.23.0.0/16
GATEWAY_SUBNET=172.24.0.0/16

# Layer Isolation Configuration
ENABLE_LAYER_ISOLATION=true
ENABLE_INTER_LAYER_GATEWAY=true
ENABLE_STRICT_INFORMATION_FLOW=true
ENABLE_AUDIT_LOGGING=true

# Resilience Configuration
ENABLE_CIRCUIT_BREAKER=true
ENABLE_RETRY_MECHANISM=true
ENABLE_BULKHEAD_PATTERN=true
ENABLE_AUTO_SCALING=true
EOF

    print_status "OK" "Environment configuration created"
}

# Create layer networks
create_layer_networks() {
    print_status "INFO" "Creating layer-specific networks..."
    
    # Create networks if they don't exist
    if ! docker network ls | grep -q "rockefeller-structural-network"; then
        docker network create rockefeller-structural-network \
            --driver bridge \
            --subnet=172.21.0.0/16 \
            --gateway=172.21.0.1 \
            --label layer=structural \
            --label purpose=infrastructure-management
        print_status "STRUCTURAL" "Structural layer network created"
    fi
    
    if ! docker network ls | grep -q "rockefeller-information-network"; then
        docker network create rockefeller-information-network \
            --driver bridge \
            --subnet=172.22.0.0/16 \
            --gateway=172.22.0.1 \
            --label layer=information \
            --label purpose=data-processing
        print_status "INFORMATION" "Information layer network created"
    fi
    
    if ! docker network ls | grep -q "rockefeller-control-network"; then
        docker network create rockefeller-control-network \
            --driver bridge \
            --subnet=172.23.0.0/16 \
            --gateway=172.23.0.1 \
            --label layer=control \
            --label purpose=business-logic
        print_status "CONTROL" "Control layer network created"
    fi
    
    if ! docker network ls | grep -q "rockefeller-gateway-network"; then
        docker network create rockefeller-gateway-network \
            --driver bridge \
            --subnet=172.24.0.0/16 \
            --gateway=172.24.0.1 \
            --label layer=gateway \
            --label purpose=inter-layer-communication
        print_status "GATEWAY" "Gateway network created"
    fi
}

# Deploy layered network
deploy_layered_network() {
    print_status "INFO" "Deploying Rockefeller HELOC layered network..."
    
    # Load environment variables
    if [ -f .env.layered ]; then
        export $(cat .env.layered | grep -v '^#' | xargs)
        print_status "OK" "Environment variables loaded"
    else
        print_status "WARN" "Environment file not found, using defaults"
    fi
    
    # Deploy using layered docker-compose
    docker-compose -f docker-compose.layered.yml up -d --build
    
    print_status "OK" "Layered network deployment initiated"
}

# Wait for services to start
wait_for_services() {
    print_status "INFO" "Waiting for services to start..."
    sleep 45
    
    print_status "INFO" "Checking service health..."
    
    # Check structural layer services
    if curl -f -s http://localhost:9001/health > /dev/null 2>&1; then
        print_status "STRUCTURAL" "Infrastructure Manager is healthy"
    else
        print_status "WARN" "Infrastructure Manager not ready yet"
    fi
    
    # Check information layer services
    if curl -f -s http://localhost:9101/health > /dev/null 2>&1; then
        print_status "INFORMATION" "Data Ingestion is healthy"
    else
        print_status "WARN" "Data Ingestion not ready yet"
    fi
    
    # Check control layer services
    if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
        print_status "CONTROL" "User Interface is healthy"
    else
        print_status "WARN" "User Interface not ready yet"
    fi
    
    # Check gateway services
    if curl -f -s http://localhost:9301/health > /dev/null 2>&1; then
        print_status "GATEWAY" "Structural-Information Gateway is healthy"
    else
        print_status "WARN" "Gateway not ready yet"
    fi
}

# Display network information
display_network_info() {
    echo ""
    echo "============================================================"
    print_status "OK" "Rockefeller HELOC Layered Network Setup Complete!"
    echo ""
    echo "🏗️  LAYER 1: STRUCTURAL (Infrastructure)"
    echo "   Infrastructure Manager: http://localhost:9001"
    echo "   Security Manager:        http://localhost:9002"
    echo "   Storage Manager:         http://localhost:9003"
    echo "   Network Manager:         http://localhost:9004"
    echo "   Structural Monitoring:   http://localhost:9091"
    echo ""
    echo "📊 LAYER 2: INFORMATION (Data Processing)"
    echo "   Data Ingestion:          http://localhost:9101"
    echo "   Validation Engine:       http://localhost:9102"
    echo "   Processing Engine:       http://localhost:9103"
    echo "   Analytics Engine:        http://localhost:9104"
    echo "   Information Monitoring:  http://localhost:9092"
    echo ""
    echo "🎛️  LAYER 3: CONTROL (Business Logic & User Interface)"
    echo "   Business Logic:          http://localhost:9201"
    echo "   User Interface:          http://localhost:3000"
    echo "   Execution Engine:        http://localhost:9203"
    echo "   Decision Engine:         http://localhost:9204"
    echo "   Control Monitoring:      http://localhost:9093"
    echo ""
    echo "🚪 GATEWAY LAYER (Inter-Layer Communication)"
    echo "   Structural-Information:  http://localhost:9301"
    echo "   Information-Control:     http://localhost:9302"
    echo "   Control-Structural:      http://localhost:9303"
    echo ""
    echo "🗄️  DATABASE ACCESS:"
    echo "   Structural PostgreSQL:    localhost:5432 (structural_layer)"
    echo "   Information PostgreSQL:   localhost:5433 (information_layer)"
    echo "   Control PostgreSQL:       localhost:5434 (control_layer)"
    echo ""
    echo "🔍 NETWORK SEGMENTS:"
    echo "   Structural Network:       172.21.0.0/16"
    echo "   Information Network:      172.22.0.0/16"
    echo "   Control Network:          172.23.0.0/16"
    echo "   Gateway Network:          172.24.0.0/16"
    echo ""
    print_status "INFO" "Reference Number: 123456789-HELOC"
    print_status "OK" "Layered network with restricted information flow is ready!"
    echo "============================================================"
}

# Main execution
main() {
    echo "Starting Rockefeller HELOC Layered Network Setup..."
    echo ""
    
    check_prerequisites
    create_layer_directories
    generate_ssl_certificates
    create_redis_configurations
    create_monitoring_configurations
    create_database_init_scripts
    create_layer_dockerfiles
    create_environment_config
    create_layer_networks
    deploy_layered_network
    wait_for_services
    display_network_info
    
    echo ""
    print_status "OK" "Layered network setup completed successfully!"
    print_status "INFO" "Run './scripts/health-check-layered.sh' to verify all services"
}

# Run main function
main "$@"
