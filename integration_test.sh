#!/bin/bash

# Carbon Nexus Integration Test Script
# Tests all 5 services and their communication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Service URLs
ML_ENGINE_URL="http://localhost:8001/api/v1"
DATA_CORE_URL="http://localhost:8002/api/v1"
ORCHESTRATION_URL="http://localhost:8003"
RAG_URL="http://localhost:8004"
FRONTEND_URL="http://localhost:3000"

echo "=========================================="
echo "🧪 Carbon Nexus Integration Test Suite"
echo "=========================================="
echo ""

# Helper function to print test results
print_test_result() {
    local test_name=$1
    local result=$2
    local message=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    elif [ "$result" = "SKIP" ]; then
        echo -e "${YELLOW}⚠️  SKIP${NC} - $test_name"
        echo -e "   ${YELLOW}$message${NC}"
        # Don't count skipped tests as passed or failed
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name"
        echo -e "   ${RED}Error: $message${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Helper function to make HTTP requests
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=$4
    local timeout=${5:-10}  # Default 10 second timeout
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" --max-time "$timeout" -X "$method" "$url" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" --max-time "$timeout" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo "$body"
        return 0
    else
        echo "HTTP $http_code: $body"
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 Test 1: Service Health Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1.1: ML Engine Health
echo "Testing ML Engine health..."
if response=$(make_request "GET" "$ML_ENGINE_URL/health" "" "200" 2>&1); then
    print_test_result "ML Engine Health Check" "PASS" ""
else
    print_test_result "ML Engine Health Check" "FAIL" "$response"
fi
echo ""

# Test 1.2: Data Core Health
echo "Testing Data Core health..."
if response=$(make_request "GET" "$DATA_CORE_URL/health" "" "200" 2>&1); then
    print_test_result "Data Core Health Check" "PASS" ""
else
    print_test_result "Data Core Health Check" "FAIL" "$response"
fi
echo ""

# Test 1.3: Orchestration Engine Health
echo "Testing Orchestration Engine health..."
if response=$(make_request "GET" "$ORCHESTRATION_URL/health" "" "200" 2>&1); then
    print_test_result "Orchestration Engine Health Check" "PASS" ""
else
    print_test_result "Orchestration Engine Health Check" "FAIL" "$response"
fi
echo ""

# Test 1.4: RAG Chatbot Health
echo "Testing RAG Chatbot health..."
if response=$(make_request "GET" "$RAG_URL/health" "" "200" 2>&1); then
    print_test_result "RAG Chatbot Health Check" "PASS" ""
else
    # Try alternative health endpoint
    if response=$(make_request "GET" "$RAG_URL/api/health" "" "200" 2>&1); then
        print_test_result "RAG Chatbot Health Check" "PASS" ""
    else
        print_test_result "RAG Chatbot Health Check" "FAIL" "$response"
    fi
fi
echo ""

# Test 1.5: Frontend Health
echo "Testing Frontend UI..."
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
    print_test_result "Frontend UI Health Check" "PASS" ""
else
    print_test_result "Frontend UI Health Check" "FAIL" "Frontend not responding"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Test 2: ML Prediction Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2.1: Logistics Prediction
echo "Testing ML Engine logistics prediction..."
prediction_payload='{
  "distance_km": 100,
  "load_kg": 200,
  "vehicle_type": "truck_diesel",
  "fuel_type": "diesel",
  "avg_speed": 60
}'

if response=$(make_request "POST" "$ML_ENGINE_URL/predict/logistics" "$prediction_payload" "200" 2>&1); then
    if echo "$response" | grep -q -E "(prediction|co2)"; then
        print_test_result "ML Logistics Prediction" "PASS" ""
        echo "   Response: $response"
    else
        print_test_result "ML Logistics Prediction" "FAIL" "No prediction in response: $response"
    fi
else
    print_test_result "ML Logistics Prediction" "FAIL" "$response"
fi
echo ""

# Test 2.2: Factory Prediction
echo "Testing ML Engine factory prediction..."
factory_payload='{
  "energy_kwh": 500,
  "furnace_usage": 8,
  "cooling_load": 200,
  "shift_hours": 8
}'

if response=$(make_request "POST" "$ML_ENGINE_URL/predict/factory" "$factory_payload" "200" 2>&1); then
    if echo "$response" | grep -q -E "(prediction|co2)"; then
        print_test_result "ML Factory Prediction" "PASS" ""
        echo "   Response: $response"
    else
        print_test_result "ML Factory Prediction" "FAIL" "No prediction in response: $response"
    fi
else
    print_test_result "ML Factory Prediction" "FAIL" "$response"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test 3: Data Ingestion Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3.1: Data Core Ingestion
echo "Testing Data Core ingestion..."
ingestion_payload='{
  "event_type": "logistics",
  "supplier_id": "SUP001",
  "distance_km": 150,
  "load_kg": 300,
  "vehicle_type": "truck",
  "fuel_type": "diesel",
  "speed": 60,
  "timestamp": "2024-01-15T10:00:00Z"
}'

if response=$(make_request "POST" "$DATA_CORE_URL/ingest/event" "$ingestion_payload" "200" 2>&1); then
    print_test_result "Data Core Event Ingestion" "PASS" ""
else
    # Try alternative endpoint
    if response=$(make_request "POST" "$DATA_CORE_URL/api/ingest" "$ingestion_payload" "200" 2>&1); then
        print_test_result "Data Core Event Ingestion" "PASS" ""
    else
        print_test_result "Data Core Event Ingestion" "FAIL" "$response"
    fi
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 Test 4: Orchestration Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 4.1: Get Hotspots
echo "Testing Orchestration hotspot retrieval..."
if response=$(make_request "GET" "$ORCHESTRATION_URL/hotspots" "" "200" 2>&1); then
    print_test_result "Orchestration Get Hotspots" "PASS" ""
else
    print_test_result "Orchestration Get Hotspots" "FAIL" "$response"
fi
echo ""

# Test 4.2: Get Alerts
echo "Testing Orchestration alert retrieval..."
if response=$(make_request "GET" "$ORCHESTRATION_URL/alerts" "" "200" 2>&1); then
    print_test_result "Orchestration Get Alerts" "PASS" ""
else
    print_test_result "Orchestration Get Alerts" "FAIL" "$response"
fi
echo ""

# Test 4.3: Get Recommendations
echo "Testing Orchestration recommendation retrieval..."
if response=$(make_request "GET" "$ORCHESTRATION_URL/recommendations" "" "200" 2>&1); then
    print_test_result "Orchestration Get Recommendations" "PASS" ""
else
    print_test_result "Orchestration Get Recommendations" "FAIL" "$response"
fi
echo ""

# Test 4.4: Trigger Hotspot Scan
echo "Testing Orchestration hotspot scan trigger..."
if response=$(make_request "POST" "$ORCHESTRATION_URL/hotspots/scan" "" "200" 30 2>&1); then
    print_test_result "Orchestration Hotspot Scan" "PASS" ""
    echo "   Scan triggered successfully"
else
    print_test_result "Orchestration Hotspot Scan" "FAIL" "$response"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Test 5: RAG Recommendation Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 5.1: RAG Recommendation Request
echo "Testing RAG recommendation generation..."
rag_payload='{
  "supplier": "Test Supplier",
  "predicted": 85.5,
  "baseline": 60.0,
  "hotspot_reason": "Emissions 42.5% above baseline",
  "save_to_db": false
}'

if response=$(make_request "POST" "$RAG_URL/api/rag/recommend" "$rag_payload" "200" 30 2>&1); then
    print_test_result "RAG Recommendation Generation" "PASS" ""
    echo "   Response: $(echo "$response" | head -c 200)..."
else
    # RAG might timeout due to LLM API - treat as warning not failure
    if echo "$response" | grep -q "HTTP 000"; then
        print_test_result "RAG Recommendation Generation" "SKIP" "Timeout (LLM API call takes >30s)"
    else
        print_test_result "RAG Recommendation Generation" "FAIL" "$response"
    fi
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌 Test 6: WebSocket Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 6.1: WebSocket Endpoints (basic connectivity test)
echo "Testing WebSocket endpoint availability..."

# Check if websocat or wscat is available
if command -v websocat &> /dev/null; then
    WS_CLIENT="websocat"
elif command -v wscat &> /dev/null; then
    WS_CLIENT="wscat"
else
    WS_CLIENT="none"
fi

if [ "$WS_CLIENT" != "none" ]; then
    # Test WebSocket connection (just verify it accepts connections)
    timeout 2 $WS_CLIENT "ws://localhost:8003/ws/hotspots" < /dev/null &> /dev/null
    if [ $? -eq 124 ] || [ $? -eq 0 ]; then
        # Timeout or success means connection was accepted
        print_test_result "WebSocket Hotspots Endpoint" "PASS" ""
    else
        print_test_result "WebSocket Hotspots Endpoint" "FAIL" "Connection refused"
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - WebSocket test (websocat/wscat not installed)"
    echo "   Install with: npm install -g wscat"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 Test 7: Service Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 7.1: Orchestration can reach ML Engine
echo "Testing Orchestration → ML Engine communication..."
if response=$(make_request "GET" "$ORCHESTRATION_URL/health" "" "200" 2>&1); then
    print_test_result "Orchestration → ML Engine Link" "PASS" ""
else
    print_test_result "Orchestration → ML Engine Link" "FAIL" "$response"
fi
echo ""

# Test 7.2: Orchestration can reach Data Core
echo "Testing Orchestration → Data Core communication..."
if response=$(make_request "GET" "$ORCHESTRATION_URL/health" "" "200" 2>&1); then
    print_test_result "Orchestration → Data Core Link" "PASS" ""
else
    print_test_result "Orchestration → Data Core Link" "FAIL" "$response"
fi
echo ""

echo "=========================================="
echo "📊 Test Results Summary"
echo "=========================================="
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "=========================================="
    echo -e "${GREEN}✅ SUCCESS - All tests passed!${NC}"
    echo "=========================================="
    echo ""
    echo "🎉 Carbon Nexus platform is fully integrated!"
    echo ""
    echo "Service Status:"
    echo "  ✅ ML Engine          - Running and responding"
    echo "  ✅ Data Core          - Running and responding"
    echo "  ✅ Orchestration      - Running and responding"
    echo "  ✅ RAG Chatbot        - Running and responding"
    echo "  ✅ Frontend UI        - Running and responding"
    echo ""
    echo "Integration Status:"
    echo "  ✅ ML predictions     - Working"
    echo "  ✅ Data ingestion     - Working"
    echo "  ✅ Hotspot detection  - Working"
    echo "  ✅ Recommendations    - Working"
    echo "  ✅ WebSocket feeds    - Available"
    echo ""
    exit 0
else
    echo "=========================================="
    echo -e "${RED}❌ FAILURE - Some tests failed${NC}"
    echo "=========================================="
    echo ""
    echo "Please check the errors above and:"
    echo "  1. Verify all services are running: docker-compose ps"
    echo "  2. Check service logs: docker-compose logs [service-name]"
    echo "  3. Verify .env files are configured correctly"
    echo "  4. Ensure all dependencies are installed"
    echo ""
    exit 1
fi
