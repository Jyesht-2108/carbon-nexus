#!/usr/bin/env python3
"""
Simple script to test the data-core API endpoints
"""
import requests
import json
import time

BASE_URL = "http://localhost:8002/api/v1"


def test_health():
    """Test health check"""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")


def test_single_event():
    """Test single event ingestion"""
    print("Testing single event ingestion...")
    
    event = {
        "timestamp": "2025-11-28T12:00:00Z",
        "supplier_id": "S-TEST-1",
        "event_type": "logistics",
        "distance_km": 120,
        "load_kg": 450,
        "vehicle_type": "truck",
        "fuel_type": "diesel",
        "speed": 55
    }
    
    response = requests.post(f"{BASE_URL}/ingest/event", json=event)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")


def test_csv_upload():
    """Test CSV file upload"""
    print("Testing CSV upload...")
    
    with open("sample_data.csv", "rb") as f:
        files = {"file": ("sample_data.csv", f, "text/csv")}
        response = requests.post(f"{BASE_URL}/ingest/csv", files=files)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")


def test_upload_with_tracking():
    """Test file upload with job tracking"""
    print("Testing upload with job tracking...")
    
    with open("sample_data.csv", "rb") as f:
        files = {"file": ("sample_data.csv", f, "text/csv")}
        response = requests.post(f"{BASE_URL}/ingest/upload", files=files)
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if "jobId" in result:
        job_id = result["jobId"]
        print(f"\nChecking job status for {job_id}...")
        time.sleep(1)
        
        status_response = requests.get(f"{BASE_URL}/ingest/status/{job_id}")
        print(f"Job Status: {json.dumps(status_response.json(), indent=2)}\n")


def test_data_quality():
    """Test data quality endpoint"""
    print("Testing data quality endpoint...")
    
    response = requests.get(f"{BASE_URL}/data-quality/S-1")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")


if __name__ == "__main__":
    print("=" * 60)
    print("Data Core API Test Suite")
    print("=" * 60 + "\n")
    
    try:
        test_health()
        test_single_event()
        test_csv_upload()
        test_upload_with_tracking()
        test_data_quality()
        
        print("=" * 60)
        print("All tests completed!")
        print("=" * 60)
    
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to the API.")
        print("Make sure the data-core service is running on port 8002")
    except Exception as e:
        print(f"ERROR: {e}")
