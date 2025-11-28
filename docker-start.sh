#!/bin/bash

# Carbon Nexus Docker Startup Script
# This script starts all services using Docker Compose

set -e

echo "🚀 Starting Carbon Nexus Platform with Docker Compose"
echo "======================================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose is not installed"
    echo "Please install Docker Compose and try again"
    exit 1
fi

# Check for .env files
echo "📋 Checking environment files..."
MISSING_ENV=0

for env_file in \
    "plugins/ml-engine/.env" \
    "plugins/data-core/.env" \
    "plugins/orchestration-engine/.env" \
    "rag_chatbot_plugin/.env" \
    "frontend-ui/.env"
do
    if [ ! -f "$env_file" ]; then
        echo "⚠️  Warning: $env_file not found"
        MISSING_ENV=1
    else
        echo "✅ Found: $env_file"
    fi
done

if [ $MISSING_ENV -eq 1 ]; then
    echo ""
    echo "⚠️  Some .env files are missing. Services may not start correctly."
    echo "Copy .env.example files to .env and configure them."
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🏗️  Building and starting services..."
echo ""

# Start services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be healthy..."
echo ""

# Wait for services to be healthy
sleep 10

# Check service status
echo "📊 Service Status:"
echo ""
docker-compose ps

echo ""
echo "🎉 Carbon Nexus Platform is starting!"
echo ""
echo "Service URLs:"
echo "  • ML Engine:          http://localhost:8001"
echo "  • Data Core:          http://localhost:8002"
echo "  • Orchestration:      http://localhost:8003"
echo "  • RAG Chatbot:        http://localhost:8004"
echo "  • Frontend UI:        http://localhost:5173"
echo ""
echo "WebSocket Endpoints:"
echo "  • Hotspots:           ws://localhost:8003/ws/hotspots"
echo "  • Alerts:             ws://localhost:8003/ws/alerts"
echo "  • Recommendations:    ws://localhost:8003/ws/recommendations"
echo ""
echo "Useful Commands:"
echo "  • View logs:          docker-compose logs -f"
echo "  • Stop services:      docker-compose down"
echo "  • Restart service:    docker-compose restart [service-name]"
echo ""
echo "📖 For more information, see DOCKER_DEPLOYMENT.md"
