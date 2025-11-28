#!/usr/bin/env python3
"""
Download and prepare real-world emissions datasets
"""
import pandas as pd
import numpy as np
from pathlib import Path
import requests
from io import StringIO

def download_vehicle_emissions():
    """
    Download real vehicle emissions data
    Source: Kaggle/UCI or government databases
    """
    print("\n1. Downloading Vehicle Emissions Data...")
    
    # Option 1: Try to download from a public source
    # For now, we'll use a well-known public dataset
    
    try:
        # Example: EPA Vehicle Fuel Economy Data
        # This is a real dataset from fueleconomy.gov
        url = "https://www.fueleconomy.gov/feg/epadata/vehicles.csv"
        
        print(f"   Attempting to download from: {url}")
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            df = pd.read_csv(StringIO(response.text))
            print(f"   ✓ Downloaded {len(df)} records")
            
            # Process and save
            # We'll need to transform this to our format
            return df
        else:
            print(f"   ✗ Failed to download (Status: {response.status_code})")
            return None
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return None

def download_building_energy():
    """
    Download real building/warehouse energy data
    """
    print("\n2. Downloading Building Energy Data...")
    
    try:
        # Example: NYC Building Energy Benchmarking
        # This is real data from NYC Open Data
        url = "https://data.cityofnewyork.us/resource/7x5e-2fxh.csv?$limit=5000"
        
        print(f"   Attempting to download from NYC Open Data...")
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            df = pd.read_csv(StringIO(response.text))
            print(f"   ✓ Downloaded {len(df)} records")
            return df
        else:
            print(f"   ✗ Failed to download (Status: {response.status_code})")
            return None
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return None

def download_industrial_emissions():
    """
    Download real industrial/factory emissions data
    """
    print("\n3. Downloading Industrial Emissions Data...")
    
    try:
        # Example: EPA Facility Level GHG Emissions
        # Note: This requires API key or direct download
        print("   Checking for EPA GHGRP data...")
        
        # For demonstration, we'll note that this requires manual download
        print("   ⚠️  EPA GHGRP data requires manual download from:")
        print("      https://www.epa.gov/ghgreporting/ghg-reporting-program-data-sets")
        
        return None
        
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return None

def download_kaggle_datasets():
    """
    Download datasets from Kaggle
    Requires Kaggle API credentials
    """
    print("\n4. Checking Kaggle Datasets...")
    
    try:
        import kaggle
        
        datasets = [
            "debajyotipodder/co2-emission-by-vehicles",
            "epa/fuel-economy",
            "mrmorj/steel-industry-energy-consumption"
        ]
        
        for dataset in datasets:
            print(f"   Downloading: {dataset}")
            kaggle.api.dataset_download_files(dataset, path='data/kaggle', unzip=True)
            print(f"   ✓ Downloaded {dataset}")
        
        return True
        
    except ImportError:
        print("   ⚠️  Kaggle API not installed")
        print("      Install: pip install kaggle")
        print("      Setup: https://www.kaggle.com/docs/api")
        return False
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

def check_local_datasets():
    """
    Check if datasets already exist locally
    """
    print("\n5. Checking Local Datasets...")
    
    data_dir = Path("data")
    datasets = {
        "logistics": "logistics_emissions_real.csv",
        "factory": "factory_emissions_real.csv",
        "warehouse": "warehouse_emissions_real.csv",
        "delivery": "delivery_emissions_real.csv",
        "timeseries": "timeseries_emissions_real.csv"
    }
    
    found = {}
    for name, filename in datasets.items():
        filepath = data_dir / filename
        if filepath.exists():
            df = pd.read_csv(filepath)
            print(f"   ✓ Found {name}: {len(df)} records")
            found[name] = df
        else:
            print(f"   ✗ Missing: {filename}")
    
    return found

def provide_manual_instructions():
    """
    Provide instructions for manually downloading datasets
    """
    print("\n" + "="*70)
    print("MANUAL DATASET DOWNLOAD INSTRUCTIONS")
    print("="*70)
    
    instructions = """
1. VEHICLE EMISSIONS DATA
   Source: EPA Fuel Economy Data
   URL: https://www.fueleconomy.gov/feg/download.shtml
   File: Download "vehicles.csv"
   Save as: data/vehicles_epa.csv

2. BUILDING ENERGY DATA
   Source: NYC Building Energy Benchmarking
   URL: https://data.cityofnewyork.us/Environment/Energy-and-Water-Data-Disclosure-for-Local-Law-84-/7x5e-2fxh
   Action: Export as CSV
   Save as: data/buildings_nyc.csv

3. INDUSTRIAL EMISSIONS DATA
   Source: EPA Greenhouse Gas Reporting Program
   URL: https://www.epa.gov/ghgreporting/ghg-reporting-program-data-sets
   File: Download "Direct Emitters" dataset
   Save as: data/industrial_epa.csv

4. STEEL INDUSTRY DATA (for Factory model)
   Source: Kaggle - Steel Industry Energy Consumption
   URL: https://www.kaggle.com/datasets/csafrit2/steel-industry-energy-consumption
   Action: Download dataset
   Save as: data/steel_industry.csv

5. VEHICLE CO2 DATA (Alternative)
   Source: Kaggle - CO2 Emission by Vehicles
   URL: https://www.kaggle.com/datasets/debajyotipodder/co2-emission-by-vehicles
   Action: Download dataset
   Save as: data/vehicles_co2.csv

ALTERNATIVE: Use Kaggle API
   1. Install: pip install kaggle
   2. Setup credentials: https://www.kaggle.com/docs/api
   3. Run: python data/download_real_datasets.py --kaggle

After downloading, run:
   python data/prepare_real_datasets.py
"""
    
    print(instructions)
    
    # Save instructions to file
    with open("data/DOWNLOAD_INSTRUCTIONS.txt", "w") as f:
        f.write(instructions)
    
    print("\n✓ Instructions saved to: data/DOWNLOAD_INSTRUCTIONS.txt")

def main():
    print("="*70)
    print("REAL-WORLD EMISSIONS DATASET DOWNLOADER")
    print("="*70)
    
    # Check what we have locally
    local_data = check_local_datasets()
    
    if len(local_data) == 5:
        print("\n✓ All datasets found locally!")
        print("Run: python data/prepare_real_datasets.py")
        return
    
    # Try automatic downloads
    print("\nAttempting automatic downloads...")
    
    vehicle_data = download_vehicle_emissions()
    building_data = download_building_energy()
    industrial_data = download_industrial_emissions()
    
    # Try Kaggle
    kaggle_success = download_kaggle_datasets()
    
    # Provide manual instructions
    provide_manual_instructions()
    
    print("\n" + "="*70)
    print("NEXT STEPS")
    print("="*70)
    print("""
1. Download datasets manually using instructions above
2. Place CSV files in the data/ directory
3. Run: python data/prepare_real_datasets.py
4. Run: python train_models_advanced.py
    """)

if __name__ == "__main__":
    main()
