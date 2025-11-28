#!/usr/bin/env python3
"""Test WebSocket connections to orchestration engine."""
import asyncio
import websockets
import json

ORCHESTRATION_URL = "ws://localhost:8003"

async def test_websocket(endpoint: str):
    """Test a WebSocket endpoint."""
    url = f"{ORCHESTRATION_URL}/ws/{endpoint}"
    print(f"\n🔌 Testing {url}...")
    
    try:
        async with websockets.connect(url) as websocket:
            print(f"✅ Connected to {endpoint}")
            
            # Wait for messages for 5 seconds
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(message)
                print(f"📨 Received message: {data}")
            except asyncio.TimeoutError:
                print(f"⏱️  No messages received (this is normal if no events are being generated)")
            
    except Exception as e:
        print(f"❌ Error connecting to {endpoint}: {e}")

async def main():
    """Test all WebSocket endpoints."""
    print("🚀 Testing Orchestration Engine WebSocket Endpoints")
    print("=" * 60)
    
    endpoints = ["hotspots", "alerts", "recommendations"]
    
    for endpoint in endpoints:
        await test_websocket(endpoint)
    
    print("\n" + "=" * 60)
    print("✅ WebSocket test complete!")

if __name__ == "__main__":
    asyncio.run(main())
