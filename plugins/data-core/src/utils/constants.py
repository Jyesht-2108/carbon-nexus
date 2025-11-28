# Required columns for event data
REQUIRED_COLUMNS = [
    "timestamp",
    "supplier_id",
    "event_type"
]

# Optional columns
OPTIONAL_COLUMNS = [
    "distance_km",
    "load_kg",
    "vehicle_type",
    "fuel_type",
    "energy_kwh",
    "temperature",
    "route_id",
    "warehouse_id",
    "factory_id",
    "speed",
    "stop_events"
]

# Vehicle type mappings
VEHICLE_TYPE_MAPPING = {
    "2W": "two_wheeler",
    "bike": "two_wheeler",
    "motorcycle": "two_wheeler",
    "truck": "truck",
    "mini_truck": "mini_truck",
    "van": "van",
    "ev": "electric_vehicle",
    "electric": "electric_vehicle"
}

# Fuel type mappings
FUEL_TYPE_MAPPING = {
    "diesel": "diesel",
    "petrol": "petrol",
    "gasoline": "petrol",
    "electric": "electric",
    "ev": "electric",
    "cng": "cng",
    "lpg": "lpg"
}

# Event types
EVENT_TYPES = [
    "logistics",
    "factory",
    "warehouse",
    "delivery"
]

# Gap fillable fields
GAP_FILLABLE_FIELDS = [
    "distance_km",
    "energy_kwh",
    "load_kg",
    "speed"
]
