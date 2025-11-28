#!/bin/bash

# Carbon Nexus Docker Stop Script
# This script stops all services

set -e

echo "🛑 Stopping Carbon Nexus Platform"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    exit 1
fi

# Stop services
echo "Stopping all services..."
docker-compose down

echo ""
echo "✅ All services stopped"
echo ""
echo "To remove volumes as well, run:"
echo "  docker-compose down -v"
echo ""
echo "To remove images as well, run:"
echo "  docker-compose down --rmi all"
