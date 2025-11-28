"""Test script for Orchestration Engine API."""
import requests
import json
from typing import Dict, Any


BASE_URL = "http://localhost:8003"


def print_response(title: str, response: requests.Response):
    """Print formatted response."""
    print(f"\n{'='*60}")
    print(f"TEST: {title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        data = response.json()
        print(f"Response:\n{json.dumps(data, indent=2)}")
    except:
        print(f"Response: {response.text}")


def test_health():
    """Test health endpoint."""
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)
    return response.status_code == 200


def test_root():
    """Test root endpoint."""
    response = requests.get(f"{BASE_URL}/")
    print_response("Root Endpoint", response)
    return response.status_code == 200


def test_current_emissions():
    """Test current emissions endpoint."""
    response = requests.get(f"{BASE_URL}/emissions/current")
    print_response("Current Emissions", response)
    return response.status_code == 200


def test_emissions_summary():
    """Test emissions summary endpoint."""
    response = requests.get(f"{BASE_URL}/emissions/summary")
    print_response("Emissions Summary", response)
    return response.status_code == 200


def test_forecast():
    """Test forecast endpoint."""
    response = requests.get(f"{BASE_URL}/emissions/forecast")
    print_response("7-Day Forecast", response)
    return response.status_code == 200


def test_hotspots():
    """Test hotspots endpoint."""
    response = requests.get(f"{BASE_URL}/hotspots")
    print_response("Get Hotspots", response)
    return response.status_code == 200


def test_hotspot_stats():
    """Test hotspot stats endpoint."""
    response = requests.get(f"{BASE_URL}/hotspots/stats")
    print_response("Hotspot Statistics", response)
    return response.status_code == 200


def test_hotspot_scan():
    """Test manual hotspot scan."""
    response = requests.post(f"{BASE_URL}/hotspots/scan")
    print_response("Manual Hotspot Scan", response)
    return response.status_code == 200


def test_recommendations():
    """Test recommendations endpoint."""
    response = requests.get(f"{BASE_URL}/recommendations")
    print_response("Get Recommendations", response)
    return response.status_code == 200


def test_recommendation_stats():
    """Test recommendation stats endpoint."""
    response = requests.get(f"{BASE_URL}/recommendations/stats")
    print_response("Recommendation Statistics", response)
    return response.status_code == 200


def test_alerts():
    """Test alerts endpoint."""
    response = requests.get(f"{BASE_URL}/alerts")
    print_response("Get Alerts", response)
    return response.status_code == 200


def test_alert_stats():
    """Test alert stats endpoint."""
    response = requests.get(f"{BASE_URL}/alerts/stats")
    print_response("Alert Statistics", response)
    return response.status_code == 200


def test_simulation():
    """Test what-if simulation."""
    payload = {
        "scenario_type": "logistics",
        "baseline_features": {
            "distance_km": 120,
            "load_kg": 450,
            "vehicle_type": "truck_diesel",
            "fuel_type": "diesel",
            "avg_speed": 50
        },
        "changes": {
            "vehicle_type": "truck_ev",
            "fuel_type": "electric"
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/simulate",
        json=payload
    )
    print_response("What-If Simulation", response)
    return response.status_code in [200, 400]  # 400 if ML Engine not available


def run_all_tests():
    """Run all tests."""
    print("\n" + "="*60)
    print("ORCHESTRATION ENGINE API TESTS")
    print("="*60)
    
    tests = [
        ("Health Check", test_health),
        ("Root Endpoint", test_root),
        ("Current Emissions", test_current_emissions),
        ("Emissions Summary", test_emissions_summary),
        ("7-Day Forecast", test_forecast),
        ("Get Hotspots", test_hotspots),
        ("Hotspot Stats", test_hotspot_stats),
        ("Manual Hotspot Scan", test_hotspot_scan),
        ("Get Recommendations", test_recommendations),
        ("Recommendation Stats", test_recommendation_stats),
        ("Get Alerts", test_alerts),
        ("Alert Stats", test_alert_stats),
        ("What-If Simulation", test_simulation),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            success = test_func()
            results.append((name, success))
        except Exception as e:
            print(f"\nERROR in {name}: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("="*60)


if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
    except Exception as e:
        print(f"\n\nFatal error: {e}")
