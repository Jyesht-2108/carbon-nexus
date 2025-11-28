#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Starting All Carbon Nexus Services                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "This will start all services in the background."
echo "Press Ctrl+C to stop all services."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    echo "All services stopped."
    exit 0
}

trap cleanup INT TERM

# Start ML Engine
echo "🚀 Starting ML Engine (port 8001)..."
cd plugins/ml-engine
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
python run.py > ../../logs/ml-engine.log 2>&1 &
ML_PID=$!
cd ../..
echo "   PID: $ML_PID"

# Wait a bit
sleep 2

# Start Data Core
echo "🚀 Starting Data Core (port 8002)..."
cd plugins/data-core
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
python run.py > ../../logs/data-core.log 2>&1 &
DC_PID=$!
cd ../..
echo "   PID: $DC_PID"

sleep 2

# Start Orchestration Engine
echo "🚀 Starting Orchestration Engine (port 8003)..."
cd plugins/orchestration-engine
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
python run.py > ../../logs/orchestration.log 2>&1 &
ORCH_PID=$!
cd ../..
echo "   PID: $ORCH_PID"

sleep 2

# Start RAG Chatbot
echo "🚀 Starting RAG Chatbot (port 8004)..."
cd plugins/rag_chatbot_plugin
npm start > ../../logs/rag.log 2>&1 &
RAG_PID=$!
cd ../..
echo "   PID: $RAG_PID"

sleep 2

# Start Frontend
echo "🚀 Starting Frontend (port 5173)..."
cd frontend-ui
npm run dev > ../logs/frontend.log 2>&1 &
FE_PID=$!
cd ..
echo "   PID: $FE_PID"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ All services started!"
echo ""
echo "Services:"
echo "  • ML Engine:        http://localhost:8001"
echo "  • Data Core:        http://localhost:8002"
echo "  • Orchestration:    http://localhost:8003"
echo "  • RAG Chatbot:      http://localhost:8004"
echo "  • Frontend:         http://localhost:5173"
echo ""
echo "Logs are in: ./logs/"
echo ""
echo "To test: ./test_integration.sh"
echo ""
echo "Press Ctrl+C to stop all services..."
echo ""

# Wait for all background jobs
wait
