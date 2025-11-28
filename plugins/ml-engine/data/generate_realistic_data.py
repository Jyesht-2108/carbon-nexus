#!/usr/bin/env python3
"""
Generate realistic training data based on real emission factors
Sources: EPA, UK DEFRA, IPCC emission factors
"""
import numpy as np
import pandas as pd
from pathlib import Path

# Real emission factors from EPA and DEFRA
VEHICLE_EMISSION_FACTORS = {
    # kg CO2 per km per tonne of load
    'two_wheeler': {'base': 0.084, 'load_factor': 0.02},  # Motorcycle
    'mini_truck': {'base': 0.171, 'load_factor': 0.08},   # Light commercial vehicle
    'truck_diesel': {'base': 0.267, 'load_factor': 0.12}, # Heavy diesel truck
    'truck_cng': {'base': 0.198, 'load_factor': 0.09},    # CNG truck (cleaner)
    'ev': {'base': 0.053, 'load_factor': 0.03},           # Electric vehicle
    'van': {'base': 0.143, 'load_factor': 0.06}           # Delivery van
}

FUEL_MULTIPLIERS = {
    'diesel': 1.0,
    'petrol': 0.95,
    'cng': 0.74,      # CNG is cleaner
    'electric': 0.20,  # Much cleaner (depends on grid)
    'hybrid': 0.65
}

# Factory emission factors (kg CO2 per kWh by source)
ELECTRICITY_EMISSION_FACTOR = 0.475  # kg CO2 per kWh (US average)
FURNACE_EMISSION_FACTOR = 2.68       # kg CO2 per unit furnace usage
COOLING_EMISSION_FACTOR = 0.385      # kg CO2 per kWh cooling

# Warehouse factors
REFRIGERATION_FACTOR = 1.45  # kg CO2 per unit refrigeration load
STORAGE_FACTOR = 0.012       # kg CO2 per cubic meter

def generate_logistics_data(n_samples=5000):
    """Generate realistic logistics/transport emission data"""
    np.random.seed(42)
    
    data = []
    vehicle_types = list(VEHICLE_EMISSION_FACTORS.keys())
    fuel_types = list(FUEL_MULTIPLIERS.keys())
    
    for _ in range(n_samples):
        # Random parameters
        distance_km = np.random.gamma(shape=2, scale=50)  # Realistic distance distribution
        load_kg = np.random.gamma(shape=3, scale=300)     # Realistic load distribution
        vehicle_type = np.random.choice(vehicle_types)
        fuel_type = np.random.choice(fuel_types)
        avg_speed = np.random.normal(55, 15)              # Average speed
        avg_speed = np.clip(avg_speed, 20, 100)
        stop_events = int(np.random.poisson(distance_km / 50))  # Stops based on distance
        
        # Calculate CO2 using real emission factors
        vehicle_factor = VEHICLE_EMISSION_FACTORS[vehicle_type]
        base_emission = vehicle_factor['base']
        load_factor = vehicle_factor['load_factor']
        fuel_multiplier = FUEL_MULTIPLIERS[fuel_type]
        
        # Speed efficiency (optimal at 60-80 km/h)
        speed_efficiency = 1.0
        if avg_speed < 40:
            speed_efficiency = 1.2  # Less efficient at low speeds
        elif avg_speed > 90:
            speed_efficiency = 1.15  # Less efficient at high speeds
        
        # Stop penalty (each stop adds emissions)
        stop_penalty = stop_events * 0.5
        
        # Final calculation
        co2_kg = (
            distance_km * base_emission * 
            (1 + load_kg / 1000 * load_factor) * 
            fuel_multiplier * 
            speed_efficiency
        ) + stop_penalty
        
        # Add realistic noise (±5%)
        co2_kg *= np.random.normal(1.0, 0.05)
        
        data.append({
            'distance_km': round(distance_km, 2),
            'load_kg': round(load_kg, 2),
            'vehicle_type': vehicle_type,
            'fuel_type': fuel_type,
            'avg_speed': round(avg_speed, 2),
            'stop_events': stop_events,
            'co2_kg': round(max(0, co2_kg), 2)
        })
    
    return pd.DataFrame(data)

def generate_factory_data(n_samples=5000):
    """Generate realistic factory emission data"""
    np.random.seed(43)
    
    data = []
    
    for _ in range(n_samples):
        # Factory parameters
        shift_hours = np.random.choice([8, 12, 16, 24])
        energy_kwh = np.random.gamma(shape=5, scale=800) * (shift_hours / 8)
        machine_runtime_hours = np.random.uniform(0.5, 1.0) * shift_hours
        furnace_usage = np.random.exponential(scale=1.5)
        cooling_load = np.random.gamma(shape=2, scale=150)
        
        # Calculate CO2 using real factors
        electricity_co2 = energy_kwh * ELECTRICITY_EMISSION_FACTOR
        furnace_co2 = furnace_usage * FURNACE_EMISSION_FACTOR * shift_hours
        cooling_co2 = cooling_load * COOLING_EMISSION_FACTOR
        
        # Process efficiency factor (longer shifts may be less efficient)
        efficiency = 1.0 + (shift_hours - 8) * 0.02
        
        co2_kg = (electricity_co2 + furnace_co2 + cooling_co2) * efficiency
        
        # Add noise
        co2_kg *= np.random.normal(1.0, 0.05)
        
        data.append({
            'energy_kwh': round(energy_kwh, 2),
            'machine_runtime_hours': round(machine_runtime_hours, 2),
            'furnace_usage': round(furnace_usage, 2),
            'cooling_load': round(cooling_load, 2),
            'shift_hours': shift_hours,
            'co2_kg': round(max(0, co2_kg), 2)
        })
    
    return pd.DataFrame(data)

def generate_warehouse_data(n_samples=5000):
    """Generate realistic warehouse emission data"""
    np.random.seed(44)
    
    data = []
    
    for _ in range(n_samples):
        # Warehouse parameters
        temperature = np.random.normal(15, 10)  # Can be cold storage or ambient
        temperature = np.clip(temperature, -20, 30)
        inventory_volume = np.random.gamma(shape=3, scale=200)
        refrigeration_load = 0
        
        # Cold storage needs refrigeration
        if temperature < 10:
            refrigeration_load = np.random.gamma(shape=2, scale=2) * (10 - temperature) / 10
        
        # Energy consumption depends on temperature control
        base_energy = inventory_volume * 0.5  # Base lighting and systems
        cooling_energy = max(0, (25 - temperature)) * 15  # Cooling needs
        refrigeration_energy = refrigeration_load * 100
        
        energy_kwh = base_energy + cooling_energy + refrigeration_energy
        energy_kwh *= np.random.normal(1.0, 0.1)
        energy_kwh = max(50, energy_kwh)
        
        # Calculate CO2
        electricity_co2 = energy_kwh * ELECTRICITY_EMISSION_FACTOR
        refrigeration_co2 = refrigeration_load * REFRIGERATION_FACTOR
        storage_co2 = inventory_volume * STORAGE_FACTOR
        
        co2_kg = electricity_co2 + refrigeration_co2 + storage_co2
        
        # Add noise
        co2_kg *= np.random.normal(1.0, 0.05)
        
        data.append({
            'temperature': round(temperature, 2),
            'refrigeration_load': round(refrigeration_load, 2),
            'inventory_volume': round(inventory_volume, 2),
            'energy_kwh': round(energy_kwh, 2),
            'co2_kg': round(max(0, co2_kg), 2)
        })
    
    return pd.DataFrame(data)

def generate_delivery_data(n_samples=5000):
    """Generate realistic last-mile delivery emission data"""
    np.random.seed(45)
    
    data = []
    vehicle_types = list(VEHICLE_EMISSION_FACTORS.keys())
    
    for _ in range(n_samples):
        # Delivery parameters
        route_length = np.random.gamma(shape=2, scale=8)  # Urban routes are shorter
        traffic_score = np.random.randint(1, 11)  # 1-10 scale
        vehicle_type = np.random.choice(vehicle_types, p=[0.3, 0.2, 0.1, 0.05, 0.15, 0.2])
        delivery_count = int(np.random.gamma(shape=3, scale=10))
        
        # Base emission
        vehicle_factor = VEHICLE_EMISSION_FACTORS[vehicle_type]
        base_emission = vehicle_factor['base']
        
        # Traffic impact (higher traffic = more emissions)
        traffic_multiplier = 1.0 + (traffic_score - 5) * 0.06
        
        # Delivery stops (each stop adds emissions)
        stop_penalty = delivery_count * 0.15
        
        # Urban driving is less efficient
        urban_penalty = 1.15
        
        co2_kg = (
            route_length * base_emission * 
            traffic_multiplier * 
            urban_penalty
        ) + stop_penalty
        
        # Add noise
        co2_kg *= np.random.normal(1.0, 0.05)
        
        data.append({
            'route_length': round(route_length, 2),
            'traffic_score': traffic_score,
            'vehicle_type': vehicle_type,
            'delivery_count': delivery_count,
            'co2_kg': round(max(0, co2_kg), 2)
        })
    
    return pd.DataFrame(data)

def generate_timeseries_data(n_days=365):
    """Generate realistic time-series emission data for forecasting"""
    np.random.seed(46)
    
    # Base emission level
    base = 1000
    
    # Trend (slight increase over time)
    trend = np.linspace(0, 100, n_days)
    
    # Seasonal pattern (weekly cycle)
    seasonal = 150 * np.sin(2 * np.pi * np.arange(n_days) / 7)
    
    # Random noise
    noise = np.random.normal(0, 50, n_days)
    
    # Occasional spikes (special events)
    spikes = np.zeros(n_days)
    spike_days = np.random.choice(n_days, size=int(n_days * 0.05), replace=False)
    spikes[spike_days] = np.random.uniform(200, 400, len(spike_days))
    
    # Combine all components
    emissions = base + trend + seasonal + noise + spikes
    emissions = np.maximum(emissions, 0)
    
    dates = pd.date_range(start='2024-01-01', periods=n_days, freq='D')
    
    df = pd.DataFrame({
        'date': dates,
        'daily_co2_kg': emissions.round(2)
    })
    
    return df

def main():
    """Generate all datasets"""
    print("=" * 60)
    print("Generating Realistic Training Datasets")
    print("Based on EPA, DEFRA, and IPCC emission factors")
    print("=" * 60 + "\n")
    
    # Create data directory
    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)
    
    # Generate logistics data
    print("1. Generating logistics/transport data...")
    logistics_df = generate_logistics_data(5000)
    logistics_df.to_csv(data_dir / "logistics_emissions.csv", index=False)
    print(f"   ✓ Generated {len(logistics_df)} samples")
    print(f"   CO2 range: {logistics_df['co2_kg'].min():.2f} - {logistics_df['co2_kg'].max():.2f} kg")
    print(f"   Mean CO2: {logistics_df['co2_kg'].mean():.2f} kg\n")
    
    # Generate factory data
    print("2. Generating factory emissions data...")
    factory_df = generate_factory_data(5000)
    factory_df.to_csv(data_dir / "factory_emissions.csv", index=False)
    print(f"   ✓ Generated {len(factory_df)} samples")
    print(f"   CO2 range: {factory_df['co2_kg'].min():.2f} - {factory_df['co2_kg'].max():.2f} kg")
    print(f"   Mean CO2: {factory_df['co2_kg'].mean():.2f} kg\n")
    
    # Generate warehouse data
    print("3. Generating warehouse emissions data...")
    warehouse_df = generate_warehouse_data(5000)
    warehouse_df.to_csv(data_dir / "warehouse_emissions.csv", index=False)
    print(f"   ✓ Generated {len(warehouse_df)} samples")
    print(f"   CO2 range: {warehouse_df['co2_kg'].min():.2f} - {warehouse_df['co2_kg'].max():.2f} kg")
    print(f"   Mean CO2: {warehouse_df['co2_kg'].mean():.2f} kg\n")
    
    # Generate delivery data
    print("4. Generating delivery emissions data...")
    delivery_df = generate_delivery_data(5000)
    delivery_df.to_csv(data_dir / "delivery_emissions.csv", index=False)
    print(f"   ✓ Generated {len(delivery_df)} samples")
    print(f"   CO2 range: {delivery_df['co2_kg'].min():.2f} - {delivery_df['co2_kg'].max():.2f} kg")
    print(f"   Mean CO2: {delivery_df['co2_kg'].mean():.2f} kg\n")
    
    # Generate time-series data
    print("5. Generating time-series data for forecasting...")
    timeseries_df = generate_timeseries_data(365)
    timeseries_df.to_csv(data_dir / "timeseries_emissions.csv", index=False)
    print(f"   ✓ Generated {len(timeseries_df)} days of data")
    print(f"   CO2 range: {timeseries_df['daily_co2_kg'].min():.2f} - {timeseries_df['daily_co2_kg'].max():.2f} kg")
    print(f"   Mean CO2: {timeseries_df['daily_co2_kg'].mean():.2f} kg\n")
    
    print("=" * 60)
    print("✅ All datasets generated successfully!")
    print("=" * 60)
    print("\nDataset files created in 'data/' directory:")
    print("  - logistics_emissions.csv")
    print("  - factory_emissions.csv")
    print("  - warehouse_emissions.csv")
    print("  - delivery_emissions.csv")
    print("  - timeseries_emissions.csv")

if __name__ == "__main__":
    main()
