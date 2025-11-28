# Real-World Emissions Datasets

## Required Datasets for All 5 Models

### 1. Logistics/Transport Emissions
**Need:** Vehicle emissions data with distance, load, vehicle type, fuel type

**Potential Sources:**
- **UK NAEI (National Atmospheric Emissions Inventory)** - Real vehicle emissions
- **EPA Motor Vehicle Emissions Simulator (MOVES)** - US vehicle data
- **European Environment Agency (EEA)** - Transport emissions database
- **Kaggle**: "Vehicle CO2 Emissions" datasets
- **UCI ML Repository**: Automobile datasets

### 2. Factory/Industrial Emissions
**Need:** Factory energy consumption and emissions data

**Potential Sources:**
- **EPA Greenhouse Gas Reporting Program (GHGRP)** - US facility-level data
- **UK ESOS (Energy Savings Opportunity Scheme)** - Industrial energy data
- **EU ETS (Emissions Trading System)** - European industrial emissions
- **Kaggle**: "Steel Industry Energy Consumption" dataset
- **UCI ML Repository**: Industrial process datasets

### 3. Warehouse/Storage Emissions
**Need:** Warehouse energy, temperature, refrigeration data

**Potential Sources:**
- **Commercial Buildings Energy Consumption Survey (CBECS)** - US building data
- **UK Display Energy Certificates (DEC)** - Building energy ratings
- **Kaggle**: "Building Energy Benchmarking" datasets
- **ASHRAE Great Energy Predictor** - Building energy data

### 4. Delivery/Last-Mile Emissions
**Need:** Urban delivery routes, traffic, vehicle emissions

**Potential Sources:**
- **NYC Taxi & Limousine Commission** - Trip data (can adapt)
- **Uber Movement** - Urban mobility data
- **OpenStreetMap** - Route and traffic data
- **Kaggle**: "Food Delivery" or "Logistics" datasets

### 5. Time-Series Emissions
**Need:** Historical daily/hourly emissions data

**Potential Sources:**
- **EPA Air Quality System (AQS)** - Historical emissions
- **UK NAEI Time Series** - Historical UK emissions
- **European Environment Agency** - Time-series data
- **World Bank Climate Data** - Global emissions trends

## Action Plan

1. Download publicly available datasets
2. Clean and preprocess data
3. Ensure data quality and completeness
4. Retrain all 5 models with real data
5. Validate model performance

## Notes

- All datasets must be publicly available
- Prefer government/official sources (EPA, EEA, etc.)
- Ensure data is recent (2020+)
- Check data licenses for commercial use
