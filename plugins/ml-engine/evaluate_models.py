#!/usr/bin/env python3
"""
Evaluate trained models and generate performance reports
"""
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import json

VEHICLE_TYPE_ENCODING = {
    "two_wheeler": 0, "mini_truck": 1, "truck_diesel": 2,
    "truck_cng": 3, "ev": 4, "van": 5
}

FUEL_TYPE_ENCODING = {
    "diesel": 0, "petrol": 1, "cng": 2, "electric": 3, "hybrid": 4
}

def evaluate_logistics():
    """Evaluate logistics model"""
    print("\n" + "="*60)
    print("LOGISTICS MODEL EVALUATION")
    print("="*60)
    
    # Load data
    df = pd.read_csv("data/logistics_emissions.csv")
    df['vehicle_type_encoded'] = df['vehicle_type'].map(VEHICLE_TYPE_ENCODING)
    df['fuel_type_encoded'] = df['fuel_type'].map(FUEL_TYPE_ENCODING)
    
    # Load model
    model = joblib.load("src/models/logistics_model.pkl")
    
    # Prepare features
    feature_cols = ['distance_km', 'load_kg', 'vehicle_type_encoded', 
                    'fuel_type_encoded', 'avg_speed', 'stop_events']
    X = df[feature_cols]
    y = df['co2_kg']
    
    # Predict
    y_pred = model.predict(X)
    
    # Metrics
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    mae = mean_absolute_error(y, y_pred)
    r2 = r2_score(y, y_pred)
    mape = np.mean(np.abs((y - y_pred) / y)) * 100
    
    print(f"Samples: {len(df)}")
    print(f"RMSE:    {rmse:.2f} kg CO2")
    print(f"MAE:     {mae:.2f} kg CO2")
    print(f"R²:      {r2:.4f}")
    print(f"MAPE:    {mape:.2f}%")
    
    # Sample predictions
    print("\nSample Predictions:")
    samples = df.sample(5)
    for idx, row in samples.iterrows():
        actual = row['co2_kg']
        pred = model.predict(X.loc[[idx]])[0]
        print(f"  {row['vehicle_type']:15} {row['distance_km']:6.1f}km → Actual: {actual:6.2f}, Pred: {pred:6.2f}")
    
    return {'rmse': rmse, 'mae': mae, 'r2': r2, 'mape': mape}

def evaluate_factory():
    """Evaluate factory model"""
    print("\n" + "="*60)
    print("FACTORY MODEL EVALUATION")
    print("="*60)
    
    df = pd.read_csv("data/factory_emissions.csv")
    model = joblib.load("src/models/factory_model.pkl")
    
    feature_cols = ['energy_kwh', 'machine_runtime_hours', 'furnace_usage',
                    'cooling_load', 'shift_hours']
    X = df[feature_cols]
    y = df['co2_kg']
    
    y_pred = model.predict(X)
    
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    mae = mean_absolute_error(y, y_pred)
    r2 = r2_score(y, y_pred)
    mape = np.mean(np.abs((y - y_pred) / y)) * 100
    
    print(f"Samples: {len(df)}")
    print(f"RMSE:    {rmse:.2f} kg CO2")
    print(f"MAE:     {mae:.2f} kg CO2")
    print(f"R²:      {r2:.4f}")
    print(f"MAPE:    {mape:.2f}%")
    
    print("\nSample Predictions:")
    samples = df.sample(5)
    for idx, row in samples.iterrows():
        actual = row['co2_kg']
        pred = model.predict(X.loc[[idx]])[0]
        print(f"  {row['energy_kwh']:7.0f} kWh, {row['shift_hours']:2.0f}h → Actual: {actual:7.2f}, Pred: {pred:7.2f}")
    
    return {'rmse': rmse, 'mae': mae, 'r2': r2, 'mape': mape}

def evaluate_warehouse():
    """Evaluate warehouse model"""
    print("\n" + "="*60)
    print("WAREHOUSE MODEL EVALUATION")
    print("="*60)
    
    df = pd.read_csv("data/warehouse_emissions.csv")
    model = joblib.load("src/models/warehouse_model.pkl")
    
    feature_cols = ['temperature', 'refrigeration_load', 'inventory_volume', 'energy_kwh']
    X = df[feature_cols]
    y = df['co2_kg']
    
    y_pred = model.predict(X)
    
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    mae = mean_absolute_error(y, y_pred)
    r2 = r2_score(y, y_pred)
    mape = np.mean(np.abs((y - y_pred) / y)) * 100
    
    print(f"Samples: {len(df)}")
    print(f"RMSE:    {rmse:.2f} kg CO2")
    print(f"MAE:     {mae:.2f} kg CO2")
    print(f"R²:      {r2:.4f}")
    print(f"MAPE:    {mape:.2f}%")
    
    print("\nSample Predictions:")
    samples = df.sample(5)
    for idx, row in samples.iterrows():
        actual = row['co2_kg']
        pred = model.predict(X.loc[[idx]])[0]
        print(f"  {row['temperature']:5.1f}°C, {row['energy_kwh']:7.0f} kWh → Actual: {actual:6.2f}, Pred: {pred:6.2f}")
    
    return {'rmse': rmse, 'mae': mae, 'r2': r2, 'mape': mape}

def evaluate_delivery():
    """Evaluate delivery model"""
    print("\n" + "="*60)
    print("DELIVERY MODEL EVALUATION")
    print("="*60)
    
    df = pd.read_csv("data/delivery_emissions.csv")
    df['vehicle_type_encoded'] = df['vehicle_type'].map(VEHICLE_TYPE_ENCODING)
    model = joblib.load("src/models/delivery_model.pkl")
    
    feature_cols = ['route_length', 'traffic_score', 'vehicle_type_encoded', 'delivery_count']
    X = df[feature_cols]
    y = df['co2_kg']
    
    y_pred = model.predict(X)
    
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    mae = mean_absolute_error(y, y_pred)
    r2 = r2_score(y, y_pred)
    mape = np.mean(np.abs((y - y_pred) / y)) * 100
    
    print(f"Samples: {len(df)}")
    print(f"RMSE:    {rmse:.2f} kg CO2")
    print(f"MAE:     {mae:.2f} kg CO2")
    print(f"R²:      {r2:.4f}")
    print(f"MAPE:    {mape:.2f}%")
    
    print("\nSample Predictions:")
    samples = df.sample(5)
    for idx, row in samples.iterrows():
        actual = row['co2_kg']
        pred = model.predict(X.loc[[idx]])[0]
        print(f"  {row['vehicle_type']:15} {row['route_length']:5.1f}km → Actual: {actual:5.2f}, Pred: {pred:5.2f}")
    
    return {'rmse': rmse, 'mae': mae, 'r2': r2, 'mape': mape}

def generate_report(results):
    """Generate evaluation report"""
    print("\n" + "="*60)
    print("MODEL PERFORMANCE SUMMARY")
    print("="*60)
    
    report = {
        'timestamp': pd.Timestamp.now().isoformat(),
        'models': results
    }
    
    # Print summary table
    print(f"\n{'Model':<15} {'R²':<8} {'RMSE':<10} {'MAE':<10} {'MAPE':<8}")
    print("-" * 60)
    for model_name, metrics in results.items():
        print(f"{model_name.capitalize():<15} {metrics['r2']:<8.4f} {metrics['rmse']:<10.2f} {metrics['mae']:<10.2f} {metrics['mape']:<8.2f}%")
    
    # Save report
    report_path = Path("model_evaluation_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✓ Report saved to {report_path}")
    
    # Overall assessment
    avg_r2 = np.mean([m['r2'] for m in results.values()])
    print(f"\nOverall Average R²: {avg_r2:.4f}")
    
    if avg_r2 > 0.95:
        print("✅ Excellent model performance!")
    elif avg_r2 > 0.90:
        print("✅ Good model performance")
    elif avg_r2 > 0.80:
        print("⚠️  Acceptable model performance")
    else:
        print("❌ Models need improvement")

def main():
    print("\n" + "="*70)
    print(" "*20 + "MODEL EVALUATION REPORT")
    print("="*70)
    
    results = {}
    
    try:
        results['logistics'] = evaluate_logistics()
        results['factory'] = evaluate_factory()
        results['warehouse'] = evaluate_warehouse()
        results['delivery'] = evaluate_delivery()
        
        generate_report(results)
        
    except Exception as e:
        print(f"\n❌ Error during evaluation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
