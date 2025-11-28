#!/usr/bin/env python3
"""
Test advanced ML Engine features
"""
import requests
import json

BASE_URL = "http://localhost:8001/api/v1"

def test_batch_predictions():
    """Test batch prediction endpoints"""
    print("\n" + "="*60)
    print("Testing Batch Predictions")
    print("="*60)
    
    # Batch logistics
    print("\n1. Batch Logistics Predictions:")
    batch_data = {
        "predictions": [
            {"distance_km": 100, "load_kg": 400, "vehicle_type": "truck_diesel", "fuel_type": "diesel"},
            {"distance_km": 50, "load_kg": 200, "vehicle_type": "ev", "fuel_type": "electric"},
            {"distance_km": 150, "load_kg": 600, "vehicle_type": "van", "fuel_type": "diesel"}
        ]
    }
    
    response = requests.post(f"{BASE_URL}/batch/logistics", json=batch_data)
    if response.status_code == 200:
        result = response.json()
        print(f"   ✓ Processed {result['count']} predictions")
        for i, item in enumerate(result['results'][:2], 1):
            print(f"   {i}. {item['input']['vehicle_type']:15} {item['input']['distance_km']:6.0f}km → {item['prediction']['co2_kg']:6.2f} kg CO2")
    else:
        print(f"   ✗ Error: {response.status_code}")
    
    # Batch factory
    print("\n2. Batch Factory Predictions:")
    batch_data = {
        "predictions": [
            {"energy_kwh": 5000, "shift_hours": 8, "furnace_usage": 2.0, "cooling_load": 300},
            {"energy_kwh": 8000, "shift_hours": 12, "furnace_usage": 3.5, "cooling_load": 500}
        ]
    }
    
    response = requests.post(f"{BASE_URL}/batch/factory", json=batch_data)
    if response.status_code == 200:
        result = response.json()
        print(f"   ✓ Processed {result['count']} predictions")
        for i, item in enumerate(result['results'], 1):
            print(f"   {i}. {item['input']['energy_kwh']:7.0f} kWh → {item['prediction']['co2_kg']:7.2f} kg CO2")
    else:
        print(f"   ✗ Error: {response.status_code}")

def test_model_comparison():
    """Compare predictions across different vehicle types"""
    print("\n" + "="*60)
    print("Vehicle Type Comparison (100km, 500kg load)")
    print("="*60)
    
    vehicles = ["two_wheeler", "mini_truck", "truck_diesel", "truck_cng", "ev", "van"]
    fuels = ["petrol", "diesel", "diesel", "cng", "electric", "diesel"]
    
    results = []
    for vehicle, fuel in zip(vehicles, fuels):
        data = {
            "distance_km": 100,
            "load_kg": 500,
            "vehicle_type": vehicle,
            "fuel_type": fuel,
            "avg_speed": 60
        }
        response = requests.post(f"{BASE_URL}/predict/logistics", json=data)
        if response.status_code == 200:
            co2 = response.json()['co2_kg']
            results.append((vehicle, co2))
    
    # Sort by emissions
    results.sort(key=lambda x: x[1])
    
    print(f"\n{'Vehicle Type':<20} {'CO2 Emissions (kg)':<20}")
    print("-" * 40)
    for vehicle, co2 in results:
        bar = "█" * int(co2 / 2)
        print(f"{vehicle:<20} {co2:>6.2f}  {bar}")
    
    print(f"\n✓ Most efficient: {results[0][0]} ({results[0][1]:.2f} kg)")
    print(f"✗ Least efficient: {results[-1][0]} ({results[-1][1]:.2f} kg)")
    print(f"Difference: {results[-1][1] - results[0][1]:.2f} kg CO2 ({((results[-1][1] / results[0][1] - 1) * 100):.1f}% more)")

def test_temperature_impact():
    """Test warehouse emissions at different temperatures"""
    print("\n" + "="*60)
    print("Temperature Impact on Warehouse Emissions")
    print("="*60)
    
    temperatures = [-20, -10, 0, 5, 10, 15, 20, 25]
    results = []
    
    for temp in temperatures:
        data = {
            "temperature": temp,
            "energy_kwh": 1000,
            "refrigeration_load": 3.0 if temp < 10 else 0,
            "inventory_volume": 500
        }
        response = requests.post(f"{BASE_URL}/predict/warehouse", json=data)
        if response.status_code == 200:
            co2 = response.json()['co2_kg']
            results.append((temp, co2))
    
    print(f"\n{'Temperature (°C)':<20} {'CO2 Emissions (kg)':<20}")
    print("-" * 50)
    for temp, co2 in results:
        bar = "█" * int(co2 / 20)
        print(f"{temp:>5}°C              {co2:>6.2f}  {bar}")
    
    print(f"\nColdest storage (-20°C): {results[0][1]:.2f} kg CO2")
    print(f"Ambient storage (25°C):   {results[-1][1]:.2f} kg CO2")
    print(f"Savings: {results[0][1] - results[-1][1]:.2f} kg CO2 by using ambient storage")

def test_forecast_accuracy():
    """Test forecast with realistic data"""
    print("\n" + "="*60)
    print("7-Day Forecast Test")
    print("="*60)
    
    # Simulate 30 days of historical data with trend
    history = [1000 + i * 2 + (i % 7) * 50 for i in range(30)]
    
    data = {"history": history}
    response = requests.post(f"{BASE_URL}/forecast/7d", json=data)
    
    if response.status_code == 200:
        result = response.json()
        forecast = result['forecast']
        conf_low = result['confidence_low']
        conf_high = result['confidence_high']
        
        print(f"\nHistorical average (last 7 days): {sum(history[-7:]) / 7:.2f} kg CO2/day")
        print(f"\nForecast for next 7 days:")
        print(f"{'Day':<8} {'Forecast':<12} {'Confidence Range':<30}")
        print("-" * 50)
        
        for i, (f, low, high) in enumerate(zip(forecast, conf_low, conf_high), 1):
            print(f"Day {i:<4} {f:>8.2f}     [{low:>7.2f} - {high:>7.2f}]")
        
        avg_forecast = sum(forecast) / len(forecast)
        print(f"\nAverage forecast: {avg_forecast:.2f} kg CO2/day")
        print(f"Trend: {'Increasing' if avg_forecast > history[-1] else 'Decreasing'}")
    else:
        print(f"✗ Error: {response.status_code}")

def test_load_impact():
    """Test how load affects emissions"""
    print("\n" + "="*60)
    print("Load Impact on Logistics Emissions (100km, diesel truck)")
    print("="*60)
    
    loads = [0, 250, 500, 750, 1000, 1500, 2000]
    results = []
    
    for load in loads:
        data = {
            "distance_km": 100,
            "load_kg": load,
            "vehicle_type": "truck_diesel",
            "fuel_type": "diesel",
            "avg_speed": 60
        }
        response = requests.post(f"{BASE_URL}/predict/logistics", json=data)
        if response.status_code == 200:
            co2 = response.json()['co2_kg']
            results.append((load, co2))
    
    print(f"\n{'Load (kg)':<15} {'CO2 (kg)':<15} {'Increase':<15}")
    print("-" * 45)
    base_co2 = results[0][1]
    for load, co2 in results:
        increase = ((co2 / base_co2 - 1) * 100) if base_co2 > 0 else 0
        print(f"{load:<15} {co2:<15.2f} +{increase:.1f}%")

def main():
    print("\n" + "="*70)
    print(" "*15 + "ML ENGINE ADVANCED FEATURES TEST")
    print("="*70)
    
    try:
        # Check if service is running
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("\n❌ ML Engine service is not running!")
            print("Start it with: python run.py")
            return
        
        test_batch_predictions()
        test_model_comparison()
        test_temperature_impact()
        test_load_impact()
        test_forecast_accuracy()
        
        print("\n" + "="*70)
        print("✅ All advanced feature tests completed!")
        print("="*70)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to ML Engine API")
        print("Make sure the service is running on http://localhost:8001")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
