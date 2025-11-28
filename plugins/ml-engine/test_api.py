#!/usr/bin/env python3
"""
Basic API test suite for ML Engine
"""
import requests
import json

BASE_URL = "http://localhost:8001/api/v1"

def test_health():
    """Test health endpoint"""
    print("\n1. Testing Health Endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Service: {data['service']}")
        print(f"   Status: {data['status']}")
        print(f"   Models Loaded: {sum(data['models_loaded'].values())}/5")
        print("   ✅ Health check passed")
    else:
        print("   ❌ Health check failed")

def test_logistics():
    """Test logistics prediction"""
    print("\n2. Testing Logistics Prediction...")
    data = {
        "distance_km": 120,
        "load_kg": 450,
        "vehicle_type": "truck_diesel",
        "fuel_type": "diesel",
        "avg_speed": 50
    }
    response = requests.post(f"{BASE_URL}/predict/logistics", json=data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"   CO2: {result['co2_kg']} kg")
        print(f"   Confidence: {result['confidence']}")
        print("   ✅ Logistics prediction passed")
    else:
        print(f"   ❌ Failed: {response.text}")

def test_factory():
    """Test factory prediction"""
    print("\n3. Testing Factory Prediction...")
    data = {
        "energy_kwh": 5200,
        "shift_hours": 8,
        "furnace_usage": 1.2,
        "cooling_load": 300
    }
    response = requests.post(f"{BASE_URL}/predict/factory", json=data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"   CO2: {result['co2_kg']} kg")
        print(f"   Confidence: {result['confidence']}")
        print("   ✅ Factory prediction passed")
    else:
        print(f"   ❌ Failed: {response.text}")

def test_warehouse():
    """Test warehouse prediction"""
    print("\n4. Testing Warehouse Prediction...")
    data = {
        "temperature": 20,
        "energy_kwh": 830,
        "refrigeration_load": 2.1,
        "inventory_volume": 450
    }
    response = requests.post(f"{BASE_URL}/predict/warehouse", json=data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"   CO2: {result['co2_kg']} kg")
        print(f"   Confidence: {result['confidence']}")
        print("   ✅ Warehouse prediction passed")
    else:
        print(f"   ❌ Failed: {response.text}")

def test_delivery():
    """Test delivery prediction"""
    print("\n5. Testing Delivery Prediction...")
    data = {
        "route_length": 12,
        "vehicle_type": "two_wheeler",
        "traffic_score": 4,
        "delivery_count": 23
    }
    response = requests.post(f"{BASE_URL}/predict/delivery", json=data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"   CO2: {result['co2_kg']} kg")
        print(f"   Confidence: {result['confidence']}")
        print("   ✅ Delivery prediction passed")
    else:
        print(f"   ❌ Failed: {response.text}")

def test_forecast():
    """Test 7-day forecast"""
    print("\n6. Testing 7-Day Forecast...")
    data = {
        "history": [120, 121, 118, 130, 150, 140, 135, 142]
    }
    response = requests.post(f"{BASE_URL}/forecast/7d", json=data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"   Forecast Days: {result['horizon_days']}")
        print(f"   First Day: {result['forecast'][0]} kg")
        print(f"   Last Day: {result['forecast'][-1]} kg")
        print("   ✅ Forecast passed")
    else:
        print(f"   ❌ Failed: {response.text}")

if __name__ == "__main__":
    print("=" * 60)
    print("ML Engine API Test Suite")
    print("=" * 60)
    
    try:
        test_health()
        test_logistics()
        test_factory()
        test_warehouse()
        test_delivery()
        test_forecast()
        
        print("\n" + "=" * 60)
        print("✅ All tests completed!")
        print("=" * 60)
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to ML Engine API")
        print("Make sure the service is running: python run.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")
