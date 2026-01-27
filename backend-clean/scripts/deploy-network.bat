@echo off
REM Rockefeller HELOC Internal Network Deployment Script (Windows)
REM Reference Number: 123456789-HELOC

echo 🏗️  Setting up Rockefeller HELOC Internal Network...
echo ==================================================

REM Colors for output (Windows doesn't support ANSI colors by default, so we'll use simple text)
setlocal enabledelayedexpansion

REM Function to print status
:print_status
set "status=%~1"
set "message=%~2"

if "%status%"=="OK" (
    echo ✅ %message%
) else if "%status%"=="WARN" (
    echo ⚠️  %message%
) else if "%status%"=="ERROR" (
    echo ❌ %message%
) else if "%status%"=="INFO" (
    echo ℹ️  %message%
)
goto :eof

REM Check if Docker is installed
echo ℹ️  Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)
echo ✅ Docker is installed

REM Check if Docker Compose is installed
echo ℹ️  Checking Docker Compose installation...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)
echo ✅ Docker Compose is installed

REM Create necessary directories
echo ℹ️  Creating necessary directories...
if not exist "ssl\certs" mkdir ssl\certs
if not exist "ssl\private" mkdir ssl\private
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups
if not exist "monitoring\grafana\dashboards" mkdir monitoring\grafana\dashboards
if not exist "monitoring\grafana\datasources" mkdir monitoring\grafana\datasources
if not exist "haproxy" mkdir haproxy
echo ✅ Directories created

REM Generate SSL certificates (requires OpenSSL)
echo ℹ️  Generating SSL certificates...
if not exist "ssl\certs\rockefeller-heloc.crt" (
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl\private\rockefeller-heloc.key -out ssl\certs\rockefeller-heloc.crt -subj "/C=US/ST=NY/L=New York/O=Rockefeller/OU=HELOC/CN=rockefeller-heloc.com" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ SSL certificates generated
    ) else (
        echo ⚠️  OpenSSL not found or SSL generation failed. Please install OpenSSL or generate certificates manually.
    )
) else (
    echo ⚠️  SSL certificates already exist
)

REM Create Redis configuration
echo ℹ️  Creating Redis configuration...
(
echo # Rockefeller HELOC Redis Configuration
echo bind 0.0.0.0
echo port 6379
echo timeout 0
echo tcp-keepalive 300
echo daemonize no
echo supervised no
echo pidfile /var/run/redis_6379.pid
echo loglevel notice
echo logfile ""
echo databases 16
echo save 900 1
echo save 300 10
echo save 60 10000
echo stop-writes-on-bgsave-error yes
echo rdbcompression yes
echo rdbchecksum yes
echo dbfilename dump.rdb
echo dir ./
echo slave-serve-stale-data yes
echo slave-read-only yes
echo repl-diskless-sync no
echo repl-diskless-sync-delay 5
echo slave-priority 100
echo maxmemory-policy allkeys-lru
echo appendonly yes
echo appendfilename "appendonly.aof"
echo appendfsync everysec
echo no-appendfsync-on-rewrite no
echo auto-aof-rewrite-percentage 100
echo auto-aof-rewrite-min-size 64mb
echo aof-load-truncated yes
echo lua-time-limit 5000
echo slowlog-log-slower-than 10000
echo slowlog-max-len 128
echo latency-monitor-threshold 0
echo notify-keyspace-events ""
echo hash-max-ziplist-entries 512
echo hash-max-ziplist-value 64
echo list-max-ziplist-size -2
echo list-compress-depth 0
echo set-max-intset-entries 512
echo zset-max-ziplist-entries 128
echo zset-max-ziplist-value 64
echo hll-sparse-max-bytes 3000
echo activerehashing yes
echo client-output-buffer-limit normal 0 0 0
echo client-output-buffer-limit slave 256mb 64mb 60
echo client-output-buffer-limit pubsub 32mb 8mb 60
echo hz 10
echo aof-rewrite-incremental-fsync yes
) > redis.conf
echo ✅ Redis configuration created

REM Create HAProxy configuration
echo ℹ️  Creating HAProxy configuration...
(
echo global
echo     daemon
echo     maxconn 4096
echo     log stdout local0
echo     stats socket /run/haproxy.sock mode 660 level admin expose-fd listeners
echo.
echo defaults
echo     mode http
echo     timeout connect 5000ms
echo     timeout client 50000ms
echo     timeout server 50000ms
echo     option httplog
echo     option dontlognull
echo     retries 3
echo.
echo frontend http_frontend
echo     bind *:80
echo     bind *:443 ssl crt /etc/ssl/certs/rockefeller-heloc.crt
echo     redirect scheme https if !{ ssl_fc }
echo     default_backend api_backend
echo.
echo backend api_backend
echo     balance roundrobin
echo     option httpchk GET /health
echo     server api-gateway api-gateway:4000 check
echo     server frontend-gateway frontend-gateway:3000 check
echo.
echo backend heloc_backend
echo     balance roundrobin
echo     option httpchk GET /health
echo     server heloc-service heloc-service:4001 check
echo.
echo backend payment_backend
echo     balance roundrobin
echo     option httpchk GET /health
echo     server payment-service payment-service:4002 check
echo.
echo backend fraud_backend
echo     balance roundrobin
echo     option httpchk GET /health
echo     server fraud-service fraud-service:4003 check
echo.
echo backend notification_backend
echo     balance roundrobin
echo     option httpchk GET /health
echo     server notification-service notification-service:4004 check
echo.
echo backend ai_backend
echo     balance roundrobin
echo     option httpchk GET /health
echo     server ai-service ai-service:4005 check
echo.
echo listen stats
echo     bind *:8404
echo     stats enable
echo     stats uri /
echo     stats refresh 30s
echo     stats admin if TRUE
) > haproxy\haproxy.cfg
echo ✅ HAProxy configuration created

REM Create Prometheus configuration
echo ℹ️  Creating Prometheus configuration...
(
echo global:
echo   scrape_interval: 15s
echo   evaluation_interval: 15s
echo.
echo rule_files:
echo   # - "first_rules.yml"
echo   # - "second_rules.yml"
echo.
echo scrape_configs:
echo   - job_name: 'prometheus'
echo     static_configs:
echo       - targets: ['localhost:9090']
echo.
echo   - job_name: 'api-gateway'
echo     static_configs:
echo       - targets: ['api-gateway:4000']
echo     metrics_path: '/metrics'
echo     scrape_interval: 15s
echo.
echo   - job_name: 'heloc-service'
echo     static_configs:
echo       - targets: ['heloc-service:4001']
echo     metrics_path: '/metrics'
echo     scrape_interval: 15s
echo.
echo   - job_name: 'payment-service'
echo     static_configs:
echo       - targets: ['payment-service:4002']
echo     metrics_path: '/metrics'
echo     scrape_interval: 15s
echo.
echo   - job_name: 'fraud-service'
echo     static_configs:
echo       - targets: ['fraud-service:4003']
echo     metrics_path: '/metrics'
echo     scrape_interval: 15s
echo.
echo   - job_name: 'notification-service'
echo     static_configs:
echo       - targets: ['notification-service:4004']
echo     metrics_path: '/metrics'
echo     scrape_interval: 15s
echo.
echo   - job_name: 'ai-service'
echo     static_configs:
echo       - targets: ['ai-service:4005']
echo     metrics_path: '/metrics'
echo     scrape_interval: 15s
) > monitoring\prometheus.yml
echo ✅ Prometheus configuration created

REM Create Grafana datasource configuration
echo ℹ️  Creating Grafana datasource configuration...
(
echo apiVersion: 1
echo.
echo datasources:
echo   - name: Prometheus
echo     type: prometheus
echo     access: proxy
echo     url: http://prometheus:9090
echo     isDefault: true
echo     editable: true
) > monitoring\grafana\datasources\prometheus.yml
echo ✅ Grafana datasource configuration created

REM Set up environment file
echo ℹ️  Setting up environment file...
if not exist ".env.production" (
    copy .env.example .env.production >nul
    echo ✅ Environment file created from template
    echo ⚠️  Please edit .env.production with your actual values
) else (
    echo ⚠️  Environment file already exists
)

REM Create Docker network
echo ℹ️  Creating Docker network...
docker network ls | findstr "rockefeller-heloc-network" >nul
if %errorlevel% neq 0 (
    docker network create rockefeller-heloc-network --driver bridge --subnet=172.20.0.0/16 --gateway=172.20.0.1
    echo ✅ Docker network created
) else (
    echo ⚠️  Docker network already exists
)

REM Build and start services
echo ℹ️  Building and starting services...
docker-compose -f docker-compose.prod.yml up -d --build

REM Wait for services to start
echo ℹ️  Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Run health checks
echo ℹ️  Running health checks...
if exist "scripts\health-check.bat" (
    call scripts\health-check.bat
) else (
    echo ⚠️  Health check script not found
)

echo.
echo ==================================================
echo ✅ Rockefeller HELOC Internal Network Setup Complete!
echo.
echo 🌐 Access Points:
echo    Frontend:          http://localhost:3000
echo    API Gateway:       http://localhost:4000
echo    Grafana Dashboard: http://localhost:3001
echo    Prometheus:        http://localhost:9090
echo    HAProxy Stats:     http://localhost:8404
echo.
echo 🔌 Internal Services:
echo    HELOC Service:     http://localhost:4001
echo    Payment Service:   http://localhost:4002
echo    Fraud Service:     http://localhost:4003
echo    Notification:      http://localhost:4004
echo    AI Service:        http://localhost:4005
echo.
echo 🗄️ Database:
echo    PostgreSQL:        localhost:5432
echo    Redis:             localhost:6379
echo.
echo ℹ️  Reference Number: 123456789-HELOC
echo ✅ Network is ready for HELOC integration deployment!
echo ==================================================

pause
