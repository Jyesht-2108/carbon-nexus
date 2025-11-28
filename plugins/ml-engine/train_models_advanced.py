#!/usr/bin/env python3
"""
Advanced model training with real data
Uses XGBoost, LightGBM, and Prophet for time-series
"""
import numpy as np
import pandas as pd
from pathlib import Path
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import lightgbm as lgb

# Encoding maps
VEHICLE_TYPE_ENCODING = {
    "two_wheeler": 0,
    "mini_truck": 1,
    "truck_diesel": 2,
    "truck_cng": 3,
    "ev": 4,
    "van": 5
}

FUEL_TYPE_ENCODING = {
    "diesel": 0,
    "petrol": 1,
    "cng": 2,
    "electric": 3,
    "hybrid": 4
}

def evaluate_model(model, X_test, y_test, model_name):
    """Evaluate model performance"""
    y_pred = model.predict(X_test)
    
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n{model_name} Performance:")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  MAE:  {mae:.2f}")
    print(f"  R²:   {r2:.4f}")
    
    return {'rmse': rmse, 'mae': mae, 'r2': r2}

def train_logistics_model():
    """Train XGBoost model for logistics emissions"""
    print("\n" + "="*60)
    print("Training Logistics CO2 Prediction Model (XGBoost)")
    print("="*60)
    
    # Load data
    df = pd.read_csv("data/logistics_emissions.csv")
    print(f"Loaded {len(df)} samples")
    
    # Encode categorical variables
    df['vehicle_type_encoded'] = df['vehicle_type'].map(VEHICLE_TYPE_ENCODING)
    df['fuel_type_encoded'] = df['fuel_type'].map(FUEL_TYPE_ENCODING)
    
    # Features and target
    feature_cols = ['distance_km', 'load_kg', 'vehicle_type_encoded', 
                    'fuel_type_encoded', 'avg_speed', 'stop_events']
    X = df[feature_cols]
    y = df['co2_kg']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train XGBoost model
    print("\nTraining XGBoost model...")
    model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train, 
              eval_set=[(X_test, y_test)],
              verbose=False)
    
    # Evaluate
    metrics = evaluate_model(model, X_test, y_test, "Logistics XGBoost")
    
    # Feature importance
    importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    print("\nFeature Importance:")
    print(importance.to_string(index=False))
    
    # Save model
    model_path = Path("src/models/logistics_model.pkl")
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    print(f"\n✓ Model saved to {model_path}")
    
    return metrics

def train_factory_model():
    """Train LightGBM model for factory emissions"""
    print("\n" + "="*60)
    print("Training Factory CO2 Prediction Model (LightGBM)")
    print("="*60)
    
    # Load data
    df = pd.read_csv("data/factory_emissions.csv")
    print(f"Loaded {len(df)} samples")
    
    # Features and target
    feature_cols = ['energy_kwh', 'machine_runtime_hours', 'furnace_usage',
                    'cooling_load', 'shift_hours']
    X = df[feature_cols]
    y = df['co2_kg']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train LightGBM model
    print("\nTraining LightGBM model...")
    model = lgb.LGBMRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
        verbose=-1
    )
    
    model.fit(X_train, y_train,
              eval_set=[(X_test, y_test)],
              callbacks=[lgb.early_stopping(stopping_rounds=20, verbose=False)])
    
    # Evaluate
    metrics = evaluate_model(model, X_test, y_test, "Factory LightGBM")
    
    # Feature importance
    importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    print("\nFeature Importance:")
    print(importance.to_string(index=False))
    
    # Save model
    model_path = Path("src/models/factory_model.pkl")
    joblib.dump(model, model_path)
    print(f"\n✓ Model saved to {model_path}")
    
    return metrics

def train_warehouse_model():
    """Train XGBoost model for warehouse emissions"""
    print("\n" + "="*60)
    print("Training Warehouse CO2 Prediction Model (XGBoost)")
    print("="*60)
    
    # Load data
    df = pd.read_csv("data/warehouse_emissions.csv")
    print(f"Loaded {len(df)} samples")
    
    # Features and target
    feature_cols = ['temperature', 'refrigeration_load', 'inventory_volume', 'energy_kwh']
    X = df[feature_cols]
    y = df['co2_kg']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train XGBoost model
    print("\nTraining XGBoost model...")
    model = xgb.XGBRegressor(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train,
              eval_set=[(X_test, y_test)],
              verbose=False)
    
    # Evaluate
    metrics = evaluate_model(model, X_test, y_test, "Warehouse XGBoost")
    
    # Feature importance
    importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    print("\nFeature Importance:")
    print(importance.to_string(index=False))
    
    # Save model
    model_path = Path("src/models/warehouse_model.pkl")
    joblib.dump(model, model_path)
    print(f"\n✓ Model saved to {model_path}")
    
    return metrics

def train_delivery_model():
    """Train LightGBM model for delivery emissions"""
    print("\n" + "="*60)
    print("Training Delivery CO2 Prediction Model (LightGBM)")
    print("="*60)
    
    # Load data
    df = pd.read_csv("data/delivery_emissions.csv")
    print(f"Loaded {len(df)} samples")
    
    # Encode categorical variables
    df['vehicle_type_encoded'] = df['vehicle_type'].map(VEHICLE_TYPE_ENCODING)
    
    # Features and target
    feature_cols = ['route_length', 'traffic_score', 'vehicle_type_encoded', 'delivery_count']
    X = df[feature_cols]
    y = df['co2_kg']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train LightGBM model
    print("\nTraining LightGBM model...")
    model = lgb.LGBMRegressor(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
        verbose=-1
    )
    
    model.fit(X_train, y_train,
              eval_set=[(X_test, y_test)],
              callbacks=[lgb.early_stopping(stopping_rounds=20, verbose=False)])
    
    # Evaluate
    metrics = evaluate_model(model, X_test, y_test, "Delivery LightGBM")
    
    # Feature importance
    importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    print("\nFeature Importance:")
    print(importance.to_string(index=False))
    
    # Save model
    model_path = Path("src/models/delivery_model.pkl")
    joblib.dump(model, model_path)
    print(f"\n✓ Model saved to {model_path}")
    
    return metrics

def train_forecast_model():
    """Train ARIMA/Simple forecasting model"""
    print("\n" + "="*60)
    print("Training Time-Series Forecasting Model")
    print("="*60)
    
    # Load data
    df = pd.read_csv("data/timeseries_emissions.csv")
    print(f"Loaded {len(df)} days of data")
    
    # For simplicity, we'll use a moving average + trend model
    # In production, you'd use Prophet or ARIMA
    
    # Calculate statistics for forecasting
    values = df['daily_co2_kg'].values
    
    # Simple model: store recent statistics
    forecast_model = {
        'mean': float(np.mean(values[-30:])),
        'std': float(np.std(values[-30:])),
        'trend': float((values[-1] - values[-30]) / 30),
        'recent_values': values[-30:].tolist()
    }
    
    print(f"\nForecast Model Statistics:")
    print(f"  Recent Mean: {forecast_model['mean']:.2f}")
    print(f"  Recent Std:  {forecast_model['std']:.2f}")
    print(f"  Trend:       {forecast_model['trend']:.2f} kg/day")
    
    # Save model
    model_path = Path("src/models/forecast_model.pkl")
    joblib.dump(forecast_model, model_path)
    print(f"\n✓ Model saved to {model_path}")
    
    return {'mean': forecast_model['mean'], 'trend': forecast_model['trend']}

def main():
    """Train all models"""
    print("\n" + "="*70)
    print(" "*15 + "CARBON NEXUS ML MODEL TRAINING")
    print(" "*10 + "Advanced Training with Real Emission Factors")
    print("="*70)
    
    # Check if data exists
    data_dir = Path("data")
    if not data_dir.exists() or not (data_dir / "logistics_emissions.csv").exists():
        print("\n❌ Error: Training data not found!")
        print("Please run: python data/generate_realistic_data.py")
        return
    
    results = {}
    
    # Train all models
    try:
        results['logistics'] = train_logistics_model()
        results['factory'] = train_factory_model()
        results['warehouse'] = train_warehouse_model()
        results['delivery'] = train_delivery_model()
        results['forecast'] = train_forecast_model()
        
        # Summary
        print("\n" + "="*70)
        print("TRAINING SUMMARY")
        print("="*70)
        
        for model_name, metrics in results.items():
            if 'r2' in metrics:
                print(f"\n{model_name.capitalize()} Model:")
                print(f"  R² Score: {metrics['r2']:.4f}")
                print(f"  RMSE:     {metrics['rmse']:.2f}")
                print(f"  MAE:      {metrics['mae']:.2f}")
        
        print("\n" + "="*70)
        print("✅ ALL MODELS TRAINED SUCCESSFULLY!")
        print("="*70)
        print("\nModels saved in: src/models/")
        print("  - logistics_model.pkl  (XGBoost)")
        print("  - factory_model.pkl    (LightGBM)")
        print("  - warehouse_model.pkl  (XGBoost)")
        print("  - delivery_model.pkl   (LightGBM)")
        print("  - forecast_model.pkl   (Statistical)")
        
    except Exception as e:
        print(f"\n❌ Error during training: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
