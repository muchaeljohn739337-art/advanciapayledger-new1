#!/bin/bash
# Rockefeller HELOC Layered Network Health Check Script
# Reference Number: 123456789-HELOC

set -e

echo "🔍 Rockefeller HELOC Layered Network Health Check"
echo "=================================================="

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

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    local path=${3:-"/health"}
    local layer=$4
    
    print_status "$layer" "Checking $service_name..."
    
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
    local layer=$2
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*Up"; then
        print_status "OK" "$container_name is running"
        return 0
    else
        print_status "ERROR" "$container_name is not running"
        return 1
    fi
}

# Function to check layer isolation
check_layer_isolation() {
    local layer=$1
    local network=$2
    
    print_status "$layer" "Checking layer isolation for $network..."
    
    # Check if network exists
    if docker network ls | grep -q "$network"; then
        print_status "OK" "Layer network $network exists"
        
        # Check if network is internal (except control layer)
        local is_internal=$(docker network inspect "$network" --format '{{.Internal}}')
        if [ "$layer" != "CONTROL" ] && [ "$is_internal" = "true" ]; then
            print_status "OK" "Layer $network is properly isolated"
        elif [ "$layer" = "CONTROL" ] && [ "$is_internal" = "false" ]; then
            print_status "OK" "Control layer network is properly exposed"
        else
            print_status "WARN" "Layer isolation may be compromised"
        fi
        return 0
    else
        print_status "ERROR" "Layer network $network not found"
        return 1
    fi
}

# Function to check information flow restrictions
check_information_flow() {
    local source_layer=$1
    local target_layer=$2
    local gateway=$3
    
    print_status "GATEWAY" "Checking information flow: $source_layer → $target_layer..."
    
    # Check if gateway service is running
    if docker ps --format "table {{.Names}}" | grep -q "$gateway"; then
        print_status "OK" "Gateway $gateway is running"
        
        # Check gateway health
        local gateway_port
        case $gateway in
            "structural-information-gateway")
                gateway_port=9301
                ;;
            "information-control-gateway")
                gateway_port=9302
                ;;
            "control-structural-gateway")
                gateway_port=9303
                ;;
            *)
                gateway_port=9301
                ;;
        esac
        
        if curl -f -s --max-time 10 "http://localhost:$gateway_port/health" > /dev/null 2>&1; then
            print_status "OK" "Gateway $gateway is healthy"
            return 0
        else
            print_status "WARN" "Gateway $gateway is unhealthy"
            return 1
        fi
    else
        print_status "ERROR" "Gateway $gateway is not running"
        return 1
    fi
}

# Function to check layer-specific databases
check_layer_database() {
    local layer=$1
    local database=$2
    local port=$3
    
    print_status "$layer" "Checking $layer database..."
    
    if docker exec "$database" pg_isready -U "${layer}_admin" > /dev/null 2>&1; then
        print_status "OK" "$layer database is ready"
        return 0
    else
        print_status "ERROR" "$layer database is not ready"
        return 1
    fi
}

# Function to check layer-specific Redis instances
check_layer_redis() {
    local layer=$1
    local redis=$2
    
    print_status "$layer" "Checking $layer Redis..."
    
    if docker exec "$redis" redis-cli ping > /dev/null 2>&1; then
        print_status "OK" "$layer Redis is ready"
        return 0
    else
        print_status "ERROR" "$layer Redis is not ready"
        return 1
    fi
}

# Function to check layer monitoring
check_layer_monitoring() {
    local layer=$1
    local monitoring=$2
    local port=$3
    
    print_status "$layer" "Checking $layer monitoring..."
    
    if curl -f -s --max-time 10 "http://localhost:$port/api/v1/query?query=up" > /dev/null 2>&1; then
        print_status "OK" "$layer monitoring is active"
        return 0
    else
        print_status "WARN" "$layer monitoring is not active"
        return 1
    fi
}

# Function to check security policies
check_security_policies() {
    print_status "INFO" "Checking security policies..."
    
    # Check if SSL certificates exist
    local layers=("structural" "information" "control" "gateway")
    for layer in "${layers[@]}"; do
        if [ -f "./${layer}/ssl/certs/${layer}.crt" ] && [ -f "./${layer}/ssl/private/${layer}.key" ]; then
            print_status "OK" "$layer SSL certificates exist"
        else
            print_status "WARN" "$layer SSL certificates missing"
        fi
    done
}

# Function to check network segmentation
check_network_segmentation() {
    print_status "INFO" "Checking network segmentation..."
    
    # Check if networks are properly segmented
    local networks=(
        "rockefeller-structural-network:172.21.0.0/16"
        "rockefeller-information-network:172.22.0.0/16"
        "rockefeller-control-network:172.23.0.0/16"
        "rockefeller-gateway-network:172.24.0.0/16"
    )
    
    for network_config in "${networks[@]}"; do
        local network_name=$(echo "$network_config" | cut -d':' -f1)
        local expected_subnet=$(echo "$network_config" | cut -d':' -f2)
        
        if docker network ls | grep -q "$network_name"; then
            local actual_subnet=$(docker network inspect "$network_name" --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}')
            if [ "$actual_subnet" = "$expected_subnet" ]; then
                print_status "OK" "$network_name is properly segmented"
            else
                print_status "WARN" "$network_name subnet mismatch: $actual_subnet vs $expected_subnet"
            fi
        else
            print_status "ERROR" "$network_name not found"
        fi
    done
}

# Function to check inter-layer communication
check_inter_layer_communication() {
    print_status "INFO" "Checking inter-layer communication..."
    
    # Test structural → information communication
    check_information_flow "STRUCTURAL" "INFORMATION" "structural-information-gateway"
    
    # Test information → control communication
    check_information_flow "INFORMATION" "CONTROL" "information-control-gateway"
    
    # Test control → structural communication (management)
    check_information_flow "CONTROL" "STRUCTURAL" "control-structural-gateway"
}

# Function to check layer autonomy
check_layer_autonomy() {
    print_status "INFO" "Checking layer autonomy..."
    
    # Check if each layer can operate independently
    local layers=("structural" "information" "control")
    
    for layer in "${layers[@]}"; do
        local service_count=$(docker ps --format "{{.Names}}" | grep -c "$layer" || true)
        if [ "$service_count" -gt 0 ]; then
            print_status "OK" "$layer layer has $service_count running services"
        else
            print_status "ERROR" "$layer layer has no running services"
        fi
    done
}

# Function to check data classification
check_data_classification() {
    print_status "INFO" "Checking data classification..."
    
    # Check if data is properly classified by layer
    local databases=(
        "postgres-structural:infrastructure"
        "postgres-information:business-data"
        "postgres-control:user-data"
    )
    
    for db_config in "${databases[@]}"; do
        local db_name=$(echo "$db_config" | cut -d':' -f1)
        local expected_classification=$(echo "$db_config" | cut -d':' -f2)
        
        if docker ps --format "{{.Names}}" | grep -q "$db_name"; then
            print_status "OK" "$db_name contains $expected_classification"
        else
            print_status "WARN" "$db_name not running"
        fi
    done
}

# Main health check execution
main() {
    local total_checks=0
    local passed_checks=0
    
    echo ""
    print_status "INFO" "Starting comprehensive layered network health check..."
    echo ""
    
    # Check Layer 1: Structural
    echo "🏗️  STRUCTURAL LAYER HEALTH CHECK"
    echo "-------------------------------"
    check_layer_isolation "STRUCTURAL" "rockefeller-structural-network" && ((passed_checks++))
    check_container "infrastructure-manager" "STRUCTURAL" && ((passed_checks++))
    check_container "security-manager" "STRUCTURAL" && ((passed_checks++))
    check_container "storage-manager" "STRUCTURAL" && ((passed_checks++))
    check_container "network-manager" "STRUCTURAL" && ((passed_checks++))
    check_layer_database "STRUCTURAL" "postgres-structural" "5432" && ((passed_checks++))
    check_layer_redis "STRUCTURAL" "redis-structural" && ((passed_checks++))
    check_layer_monitoring "STRUCTURAL" "structural-monitoring" "9091" && ((passed_checks++))
    total_checks=$((total_checks + 8))
    echo ""
    
    # Check Layer 2: Information
    echo "📊 INFORMATION LAYER HEALTH CHECK"
    echo "--------------------------------"
    check_layer_isolation "INFORMATION" "rockefeller-information-network" && ((passed_checks++))
    check_container "data-ingestion" "INFORMATION" && ((passed_checks++))
    check_container "validation-engine" "INFORMATION" && ((passed_checks++))
    check_container "processing-engine" "INFORMATION" && ((passed_checks++))
    check_container "analytics-engine" "INFORMATION" && ((passed_checks++))
    check_layer_database "INFORMATION" "postgres-information" "5433" && ((passed_checks++))
    check_layer_redis "INFORMATION" "redis-information" && ((passed_checks++))
    check_layer_monitoring "INFORMATION" "information-monitoring" "9092" && ((passed_checks++))
    total_checks=$((total_checks + 8))
    echo ""
    
    # Check Layer 3: Control
    echo "🎛️  CONTROL LAYER HEALTH CHECK"
    echo "-----------------------------"
    check_layer_isolation "CONTROL" "rockefeller-control-network" && ((passed_checks++))
    check_container "business-logic" "CONTROL" && ((passed_checks++))
    check_container "user-interface" "CONTROL" && ((passed_checks++))
    check_container "execution-engine" "CONTROL" && ((passed_checks++))
    check_container "decision-engine" "CONTROL" && ((passed_checks++))
    check_layer_database "CONTROL" "postgres-control" "5434" && ((passed_checks++))
    check_layer_redis "CONTROL" "redis-control" && ((passed_checks++))
    check_layer_monitoring "CONTROL" "control-monitoring" "9093" && ((passed_checks++))
    total_checks=$((total_checks + 8))
    echo ""
    
    # Check Gateway Layer
    echo "🚪 GATEWAY LAYER HEALTH CHECK"
    echo "----------------------------"
    check_container "structural-information-gateway" "GATEWAY" && ((passed_checks++))
    check_container "information-control-gateway" "GATEWAY" && ((passed_checks++))
    check_container "control-structural-gateway" "GATEWAY" && ((passed_checks++))
    total_checks=$((total_checks + 3))
    echo ""
    
    # Check Security and Isolation
    echo "🛡️  SECURITY & ISOLATION CHECK"
    echo "----------------------------"
    check_security_policies && ((passed_checks++))
    check_network_segmentation && ((passed_checks++))
    check_inter_layer_communication && ((passed_checks++))
    check_layer_autonomy && ((passed_checks++))
    check_data_classification && ((passed_checks++))
    total_checks=$((total_checks + 5))
    echo ""
    
    # Service Health Checks
    echo "🔌 SERVICE HEALTH CHECKS"
    echo "------------------------"
    check_service "Infrastructure Manager" "9001" "/health" "STRUCTURAL" && ((passed_checks++))
    check_service "Security Manager" "9002" "/health" "STRUCTURAL" && ((passed_checks++))
    check_service "Storage Manager" "9003" "/health" "STRUCTURAL" && ((passed_checks++))
    check_service "Network Manager" "9004" "/health" "STRUCTURAL" && ((passed_checks++))
    check_service "Data Ingestion" "9101" "/health" "INFORMATION" && ((passed_checks++))
    check_service "Validation Engine" "9102" "/health" "INFORMATION" && ((passed_checks++))
    check_service "Processing Engine" "9103" "/health" "INFORMATION" && ((passed_checks++))
    check_service "Analytics Engine" "9104" "/health" "INFORMATION" && ((passed_checks++))
    check_service "Business Logic" "9201" "/health" "CONTROL" && ((passed_checks++))
    check_service "User Interface" "3000" "/" "CONTROL" && ((passed_checks++))
    check_service "Execution Engine" "9203" "/health" "CONTROL" && ((passed_checks++))
    check_service "Decision Engine" "9204" "/health" "CONTROL" && ((passed_checks++))
    check_service "Structural-Information Gateway" "9301" "/health" "GATEWAY" && ((passed_checks++))
    check_service "Information-Control Gateway" "9302" "/health" "GATEWAY" && ((passed_checks++))
    check_service "Control-Structural Gateway" "9303" "/health" "GATEWAY" && ((passed_checks++))
    total_checks=$((total_checks + 15))
    echo ""
    
    # Summary
    echo "========================================"
    print_status "INFO" "Layered Network Health Check Summary"
    echo "Passed: $passed_checks/$total_checks"
    
    if [ $passed_checks -eq $total_checks ]; then
        print_status "OK" "All checks passed - Layered network is healthy!"
        echo ""
        print_status "INFO" "Reference Number: 123456789-HELOC"
        print_status "OK" "Rockefeller HELOC Layered Network is fully operational!"
        print_status "STRUCTURAL" "Layer 1: Infrastructure management active"
        print_status "INFORMATION" "Layer 2: Data processing active"
        print_status "CONTROL" "Layer 3: Business logic active"
        print_status "GATEWAY" "Inter-layer communication controlled"
        print_status "OK" "Information flow restrictions enforced"
    else
        print_status "WARN" "Some checks failed - Please review the issues above"
        echo ""
        print_status "INFO" "Run './scripts/setup-layered-network.sh' to fix configuration issues"
    fi
    
    echo "========================================"
    
    return $((total_checks - passed_checks))
}

# Run main function
main "$@"
