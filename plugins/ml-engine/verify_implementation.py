#!/usr/bin/env python3
"""
Comprehensive verification script for ML Engine implementation
"""
import os
from pathlib import Path
import json

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if Path(filepath).exists():
        print(f"  ✅ {description}")
        return True
    else:
        print(f"  ❌ {description} - MISSING")
        return False

def check_directory_exists(dirpath, description):
    """Check if a directory exists"""
    if Path(dirpath).is_dir():
        print(f"  ✅ {description}")
        return True
    else:
        print(f"  ❌ {description} - MISSING")
        return False

def verify_structure():
    """Verify project structure"""
    print("\n" + "="*60)
    print("1. PROJECT STRUCTURE VERIFICATION")
    print("="*60)
    
    checks = [
        ("src/app.py", "Main FastAPI application"),
        ("src/api/routes.py", "API routes"),
        ("src/api/batch_routes.py", "Batch prediction routes"),
        ("src/ml/logistics_predictor.py", "Logistics predictor"),
        ("src/ml/factory_predictor.py", "Factory predictor"),
        ("src/ml/warehouse_predictor.py", "Warehouse predictor"),
        ("src/ml/delivery_predictor.py", "Delivery predictor"),
        ("src/ml/forecast_engine.py", "Forecast engine"),
        ("src/utils/preprocessing.py", "Preprocessing utilities"),
        ("requirements.txt", "Python dependencies"),
        ("Dockerfile", "Docker configuration"),
        ("docker-compose.yml", "Docker Compose configuration"),
        ("README.md", "Main documentation"),
        ("DEPLOYMENT.md", "Deployment guide"),
        ("IMPLEMENTATION_SUMMARY.md", "Implementation summary"),
    ]
    
    passed = sum(check_file_exists(f, desc) for f, desc in checks)
    print(f"\nStructure Check: {passed}/{len(checks)} files present")
    return passed == len(checks)

def verify_data():
    """Verify training data"""
    print("\n" + "="*60)
    print("2. TRAINING DATA VERIFICATION")
    print("="*60)
    
    datasets = [
        ("data/logistics_emissions.csv", "Logistics dataset"),
        ("data/factory_emissions.csv", "Factory dataset"),
        ("data/warehouse_emissions.csv", "Warehouse dataset"),
        ("data/delivery_emissions.csv", "Delivery dataset"),
        ("data/timeseries_emissions.csv", "Time-series dataset"),
    ]
    
    passed = 0
    for filepath, desc in datasets:
        if check_file_exists(filepath, desc):
            # Check file size
            size = Path(filepath).stat().st_size
            if size > 1000:  # At least 1KB
                passed += 1
            else:
                print(f"    ⚠️  File too small ({size} bytes)")
    
    print(f"\nData Check: {passed}/{len(datasets)} datasets valid")
    return passed == len(datasets)

def verify_models():
    """Verify trained models"""
    print("\n" + "="*60)
    print("3. TRAINED MODELS VERIFICATION")
    print("="*60)
    
    models = [
        ("src/models/logistics_model.pkl", "Logistics model (XGBoost)"),
        ("src/models/factory_model.pkl", "Factory model (LightGBM)"),
        ("src/models/warehouse_model.pkl", "Warehouse model (XGBoost)"),
        ("src/models/delivery_model.pkl", "Delivery model (LightGBM)"),
        ("src/models/forecast_model.pkl", "Forecast model"),
    ]
    
    passed = 0
    for filepath, desc in models:
        if check_file_exists(filepath, desc):
            # Check file size
            size = Path(filepath).stat().st_size
            if size > 100:  # At least 100 bytes
                passed += 1
                print(f"    Size: {size / 1024:.1f} KB")
            else:
                print(f"    ⚠️  Model file too small ({size} bytes)")
    
    print(f"\nModels Check: {passed}/{len(models)} models trained")
    return passed == len(models)

def verify_evaluation():
    """Verify model evaluation"""
    print("\n" + "="*60)
    print("4. MODEL EVALUATION VERIFICATION")
    print("="*60)
    
    if check_file_exists("model_evaluation_report.json", "Evaluation report"):
        try:
            with open("model_evaluation_report.json") as f:
                report = json.load(f)
            
            print("\n  Model Performance:")
            for model_name, metrics in report.get('models', {}).items():
                r2 = metrics.get('r2', 0)
                status = "✅" if r2 > 0.95 else "⚠️"
                print(f"    {status} {model_name.capitalize()}: R² = {r2:.4f}")
            
            avg_r2 = sum(m.get('r2', 0) for m in report.get('models', {}).values()) / len(report.get('models', {}))
            print(f"\n  Average R²: {avg_r2:.4f}")
            
            if avg_r2 > 0.95:
                print("  ✅ Excellent model performance!")
                return True
            else:
                print("  ⚠️  Models need improvement")
                return False
        except Exception as e:
            print(f"  ❌ Error reading report: {e}")
            return False
    else:
        print("  ⚠️  Run: python evaluate_models.py")
        return False

def verify_tests():
    """Verify test scripts"""
    print("\n" + "="*60)
    print("5. TEST SCRIPTS VERIFICATION")
    print("="*60)
    
    tests = [
        ("test_api.py", "Basic API tests"),
        ("test_advanced_features.py", "Advanced feature tests"),
        ("evaluate_models.py", "Model evaluation"),
        ("data/generate_realistic_data.py", "Data generation"),
        ("train_models_advanced.py", "Model training"),
    ]
    
    passed = sum(check_file_exists(f, desc) for f, desc in tests)
    print(f"\nTest Scripts: {passed}/{len(tests)} present")
    return passed == len(tests)

def verify_documentation():
    """Verify documentation"""
    print("\n" + "="*60)
    print("6. DOCUMENTATION VERIFICATION")
    print("="*60)
    
    docs = [
        ("README.md", "Main README"),
        ("QUICKSTART.md", "Quick start guide"),
        ("DEPLOYMENT.md", "Deployment guide"),
        ("IMPLEMENTATION_SUMMARY.md", "Implementation summary"),
        ("data/README.md", "Data documentation"),
    ]
    
    passed = 0
    for filepath, desc in docs:
        if check_file_exists(filepath, desc):
            # Check file size
            size = Path(filepath).stat().st_size
            if size > 500:  # At least 500 bytes
                passed += 1
            else:
                print(f"    ⚠️  Documentation too short ({size} bytes)")
    
    print(f"\nDocumentation: {passed}/{len(docs)} complete")
    return passed == len(docs)

def verify_docker():
    """Verify Docker configuration"""
    print("\n" + "="*60)
    print("7. DOCKER CONFIGURATION VERIFICATION")
    print("="*60)
    
    docker_files = [
        ("Dockerfile", "Dockerfile"),
        ("docker-compose.yml", "Docker Compose"),
        (".dockerignore", "Docker ignore"),
    ]
    
    passed = sum(check_file_exists(f, desc) for f, desc in docker_files)
    print(f"\nDocker Config: {passed}/{len(docker_files)} files present")
    return passed == len(docker_files)

def generate_summary(results):
    """Generate final summary"""
    print("\n" + "="*70)
    print(" "*20 + "VERIFICATION SUMMARY")
    print("="*70)
    
    categories = [
        ("Project Structure", results[0]),
        ("Training Data", results[1]),
        ("Trained Models", results[2]),
        ("Model Evaluation", results[3]),
        ("Test Scripts", results[4]),
        ("Documentation", results[5]),
        ("Docker Config", results[6]),
    ]
    
    print()
    for category, passed in categories:
        status = "✅" if passed else "❌"
        print(f"  {status} {category}")
    
    total_passed = sum(results)
    total_checks = len(results)
    
    print(f"\n{'='*70}")
    print(f"  Overall: {total_passed}/{total_checks} checks passed")
    print(f"{'='*70}")
    
    if total_passed == total_checks:
        print("\n  🎉 ALL CHECKS PASSED! ML Engine is ready for deployment!")
        print("\n  Next steps:")
        print("    1. Start service: python run.py")
        print("    2. Test API: python test_api.py")
        print("    3. Run advanced tests: python test_advanced_features.py")
        print("    4. Deploy: docker-compose up -d")
    else:
        print("\n  ⚠️  Some checks failed. Please review the issues above.")
        print("\n  Common fixes:")
        print("    - Missing data: python data/generate_realistic_data.py")
        print("    - Missing models: python train_models_advanced.py")
        print("    - Missing evaluation: python evaluate_models.py")

def main():
    print("\n" + "="*70)
    print(" "*15 + "ML ENGINE IMPLEMENTATION VERIFICATION")
    print("="*70)
    print("\nVerifying Carbon Nexus ML Engine implementation...")
    
    results = [
        verify_structure(),
        verify_data(),
        verify_models(),
        verify_evaluation(),
        verify_tests(),
        verify_documentation(),
        verify_docker(),
    ]
    
    generate_summary(results)

if __name__ == "__main__":
    main()
