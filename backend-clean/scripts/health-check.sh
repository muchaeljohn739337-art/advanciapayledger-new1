#!/bin/bash
# Rockefeller HELOC Network Health Check Script
# Reference Number: 123456789-HELOC

set -e

echo "🔍 Rockefeller HELOC Network Health Check"
echo "========================================"

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

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    local path=${3:-"/health"}
    
    print_status "INFO" "Checking $service_name..."
    
    if curl -f -s --max-time 10 "http://localhost:$port$path" > /dev/null 2>&1; then
        print_status "OK" "$service_name is healthy"
        return 0
    else
        print_status "ERROR" "$service_name is unhealthy"
        return 1
    fi
}

# Function to check Docker container status
check_container() {
    local container_name=$1
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*Up"; then
        print_status "OK" "$container_name is running"
        return 0
    else
        print_status "ERROR" "$container_name is not running"
        return 1
    fi
}

# Function to check database connection
check_database() {
    print_status "INFO" "Checking PostgreSQL connection..."
    
    if docker exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_status "OK" "PostgreSQL is ready"
        return 0
    else
        print_status "ERROR" "PostgreSQL is not ready"
        return 1
    fi
}

# Function to check Redis connection
check_redis() {
    print_status "INFO" "Checking Redis connection..."
    
    if docker exec redis redis-cli ping > /dev/null 2>&1; then
        print_status "OK" "Redis is ready"
        return 0
    else
        print_status "ERROR" "Redis is not ready"
        return 1
    fi
}

# Function to check SSL certificates
check_ssl() {
    print_status "INFO" "Checking SSL certificates..."
    
    if [ -f "./ssl/certs/rockefeller-heloc.crt" ] && [ -f "./ssl/private/rockefeller-heloc.key" ]; then
        print_status "OK" "SSL certificates exist"
        
        # Check certificate validity
        if openssl x509 -in ./ssl/certs/rockefeller-heloc.crt -noout -checkend 86400 > /dev/null 2>&1; then
            print_status "OK" "SSL certificates are valid"
            return 0
        else
            print_status "WARN" "SSL certificates are expiring soon"
            return 1
        fi
    else
        print_status "ERROR" "SSL certificates not found"
        return 1
    fi
}

# Function to check network connectivity
check_network() {
    print_status "INFO" "Checking network connectivity..."
    
    # Check if Docker network exists
    if docker network ls | grep -q "rockefeller-heloc-network"; then
        print_status "OK" "Docker network exists"
        return 0
    else
        print_status "ERROR" "Docker network not found"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    print_status "INFO" "Checking disk space..."
    
    local disk_usage=$(df . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        print_status "OK" "Disk space is sufficient (${disk_usage}% used)"
        return 0
    elif [ "$disk_usage" -lt 90 ]; then
        print_status "WARN" "Disk space is getting low (${disk_usage}% used)"
        return 1
    else
        print_status "ERROR" "Disk space is critically low (${disk_usage}% used)"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    print_status "INFO" "Checking memory usage..."
    
    if command -v free &> /dev/null; then
        local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        
        if [ "$memory_usage" -lt 80 ]; then
            print_status "OK" "Memory usage is normal (${memory_usage}% used)"
            return 0
        elif [ "$memory_usage" -lt 90 ]; then
            print_status "WARN" "Memory usage is getting high (${memory_usage}% used)"
            return 1
        else
            print_status "ERROR" "Memory usage is critically high (${memory_usage}% used)"
            return 1
        fi
    else
        print_status "WARN" "Memory check not available on this system"
        return 0
    fi
}

# Function to check port availability
check_ports() {
    print_status "INFO" "Checking port availability..."
    
    local ports=("3000" "4000" "4001" "4002" "4003" "4004" "4005" "5432" "6379" "9090" "3001" "8404")
    local port_names=("Frontend" "API Gateway" "HELOC Service" "Payment Service" "Fraud Service" "Notification Service" "AI Service" "PostgreSQL" "Redis" "Prometheus" "Grafana" "HAProxy Stats")
    
    for i in "${!ports[@]}"; do
        local port=${ports[$i]}
        local name=${port_names[$i]}
        
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            print_status "OK" "$name (port $port) is listening"
        else
            print_status "WARN" "$name (port $port) is not listening"
        fi
    done
}

# Function to check Docker images
check_docker_images() {
    print_status "INFO" "Checking Docker images..."
    
    local images=("postgres:15-alpine" "redis:7-alpine" "prom/prometheus:latest" "grafana/grafana:latest" "haproxy:2.8-alpine")
    
    for image in "${images[@]}"; do
        if docker images --format "table {{.Repository}}:{{.Tag}}" | grep -q "$image"; then
            print_status "OK" "Docker image $image is available"
        else
            print_status "ERROR" "Docker image $image is not available"
        fi
    done
}

# Function to check environment variables
check_environment() {
    print_status "INFO" "Checking environment variables..."
    
    local env_file="./.env.production"
    
    if [ -f "$env_file" ]; then
        local required_vars=("DATABASE_URL" "JWT_SECRET" "STRIPE_SECRET_KEY" "EMAIL_SERVICE_KEY")
        local missing_vars=()
        
        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" "$env_file"; then
                missing_vars+=("$var")
            fi
        done
        
        if [ ${#missing_vars[@]} -eq 0 ]; then
            print_status "OK" "All required environment variables are set"
            return 0
        else
            print_status "WARN" "Missing environment variables: ${missing_vars[*]}"
            return 1
        fi
    else
        print_status "ERROR" "Environment file not found"
        return 1
    fi
}

# Main health check execution
main() {
    local total_checks=0
    local passed_checks=0
    
    echo ""
    print_status "INFO" "Starting comprehensive health check..."
    echo ""
    
    # Check Docker containers
    echo "🐳 Docker Containers:"
    check_container "frontend-gateway" && ((passed_checks++))
    check_container "api-gateway" && ((passed_checks++))
    check_container "heloc-service" && ((passed_checks++))
    check_container "payment-service" && ((passed_checks++))
    check_container "fraud-service" && ((passed_checks++))
    check_container "notification-service" && ((passed_checks++))
    check_container "ai-service" && ((passed_checks++))
    check_container "postgres" && ((passed_checks++))
    check_container "redis" && ((passed_checks++))
    check_container "prometheus" && ((passed_checks++))
    check_container "grafana" && ((passed_checks++))
    check_container "haproxy" && ((passed_checks++))
    total_checks=$((total_checks + 12))
    echo ""
    
    # Check service health
    echo "🔌 Service Health:"
    check_service "Frontend Gateway" "3000" && ((passed_checks++))
    check_service "API Gateway" "4000" && ((passed_checks++))
    check_service "HELOC Service" "4001" && ((passed_checks++))
    check_service "Payment Service" "4002" && ((passed_checks++))
    check_service "Fraud Service" "4003" && ((passed_checks++))
    check_service "Notification Service" "4004" && ((passed_checks++))
    check_service "AI Service" "4005" && ((passed_checks++))
    total_checks=$((total_checks + 7))
    echo ""
    
    # Check database connections
    echo "🗄️ Database Connections:"
    check_database && ((passed_checks++))
    check_redis && ((passed_checks++))
    total_checks=$((total_checks + 2))
    echo ""
    
    # Check network and security
    echo "🛡️ Network & Security:"
    check_network && ((passed_checks++))
    check_ssl && ((passed_checks++))
    check_environment && ((passed_checks++))
    total_checks=$((total_checks + 3))
    echo ""
    
    # Check system resources
    echo "💻 System Resources:"
    check_disk_space && ((passed_checks++))
    check_memory && ((passed_checks++))
    total_checks=$((total_checks + 2))
    echo ""
    
    # Check ports
    echo "🔌 Port Availability:"
    check_ports
    echo ""
    
    # Check Docker images
    echo "🐳 Docker Images:"
    check_docker_images
    echo ""
    
    # Summary
    echo "========================================"
    print_status "INFO" "Health Check Summary"
    echo "Passed: $passed_checks/$total_checks"
    
    if [ $passed_checks -eq $total_checks ]; then
        print_status "OK" "All checks passed - Network is healthy!"
        echo ""
        print_status "INFO" "Reference Number: 123456789-HELOC"
        print_status "OK" "Rockefeller HELOC Network is ready for production!"
    else
        print_status "WARN" "Some checks failed - Please review the issues above"
        echo ""
        print_status "INFO" "Run './scripts/setup-network.sh' to fix configuration issues"
    fi
    
    echo "========================================"
    
    return $((total_checks - passed_checks))
}

# Run main function
main "$@"
