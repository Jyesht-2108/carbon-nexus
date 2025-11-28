# Training Data

This directory contains datasets for training the ML models.

## Required Datasets

### 1. Logistics/Transport Emissions
- Vehicle emissions data
- Distance, load, vehicle type, fuel type
- Sources: EPA, UK DEFRA, or transport emission databases

### 2. Factory/Industrial Emissions
- Energy consumption and emissions
- Machine runtime, furnace usage, cooling loads
- Sources: Industrial emission databases, energy consumption datasets

### 3. Warehouse Emissions
- Cold storage and warehouse energy data
- Temperature, refrigeration, inventory
- Sources: Commercial building energy datasets

### 4. Delivery/Last-Mile Emissions
- Urban delivery emissions
- Route length, traffic, vehicle type
- Sources: Urban logistics datasets

### 5. Time-Series Emissions
- Historical daily emission data for forecasting
- Sources: Any of the above aggregated daily

## Data Format

All datasets should be CSV files with appropriate column names matching the model features.
