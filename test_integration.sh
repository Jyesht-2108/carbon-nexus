#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Carbon Nexus Integration Test                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test ML Engine
echo "1️⃣  Testing ML Engine (port 8001)..."
if curl -s http://localhost:8001/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ML Engine OK${NC}"
    ML_STATUS=$(curl -s http://localhost:8001/api/v1/health | jq -r '.status' 2>/dev/null)
    echo "   Status: $ML_STATUS"
else
    echo -e "${RED}❌ ML Engine FAILED${NC}"
    echo "   Make sure ML Engine is running: cd plugins/ml-engine && python run.py"
fi
echo ""

# Test Data Core
echo "2️⃣  Testing Data Core (port 8002)..."
if curl -s http://localhost:8002/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Data Core OK${NC}"
else
    echo -e "${RED}❌ Data Core FAILED${NC}"
    echo "   Make sure Data Core is running: cd plugins/data-core && python run.py"
fi
echo ""

# Test Orchestration
echo "3️⃣  Testing Orchestration Engine (port 8003)..."
if curl -s http://localhost:8003/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Orchestration OK${NC}"
else
    echo -e "${RED}❌ Orchestration FAILED${NC}"
    echo "   Make sure Orchestration is running: cd plugins/orchestration-engine && python run.py"
fi
echo ""

# Test RAG
echo "4️⃣  Testing RAG Chatbot (port 8004)..."
if curl -s http://localhost:8004/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ RAG OK${NC}"
else
    echo -e "${RED}❌ RAG FAILED${NC}"
    echo "   Make sure RAG is running: cd plugins/rag_chatbot_plugin && npm start"
fi
echo ""

# Test Frontend
echo "5️⃣  Testing Frontend (port 5173)..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend OK${NC}"
else
    echo -e "${RED}❌ Frontend FAILED${NC}"
    echo "   Make sure Frontend is running: cd frontend-ui && npm run dev"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test ML Engine prediction
echo "🧪 Testing ML Engine Prediction..."
PREDICTION=$(curl -s -X POST http://localhost:8001/api/v1/predict/logistics \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 100,
    "load_kg": 500,
    "vehicle_type": "truck_diesel",
    "fuel_type": "diesel"
  }' 2>/dev/null)

if [ ! -z "$PREDICTION" ]; then
    CO2=$(echo $PREDICTION | jq -r '.co2_kg' 2>/dev/null)
    if [ ! -z "$CO2" ] && [ "$CO2" != "null" ]; then
        echo -e "${GREEN}✅ ML Prediction Working${NC}"
        echo "   Predicted CO2: $CO2 kg"
    else
        echo -e "${YELLOW}⚠️  ML Engine responding but prediction format unexpected${NC}"
    fi
else
    echo -e "${RED}❌ ML Prediction Failed${NC}"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Integration Test Complete                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📖 For detailed testing guide, see: INTEGRATION_TESTING_GUIDE.md"
echo ""
