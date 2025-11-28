# ML Engine Deployment Guide

## Production Deployment Checklist

### 1. Environment Setup

```bash
# Install system dependencies (macOS)
brew install libomp

# Install system dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y build-essential libgomp1

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Data Generation & Model Training

```bash
# Generate realistic training data
python data/generate_realistic_data.py

# Train all models
python train_models_advanced.py

# Evaluate models
python evaluate_models.py
```

Expected output:
- All models with R² > 0.98
- Models saved in `src/models/`

### 3. Configuration

Create `.env` file:
```bash
PORT=8001
HOST=0.0.0.0
LOG_LEVEL=INFO
```

### 4. Testing

```bash
# Start service
python run.py

# In another terminal, run tests
python test_api.py
python test_advanced_features.py
```

### 5. Docker Deployment

```bash
# Build image
docker build -t carbon-nexus-ml-engine:latest .

# Run container
docker run -d \
  --name ml-engine \
  -p 8001:8001 \
  -v $(pwd)/src/models:/app/src/models \
  -v $(pwd)/logs:/app/logs \
  carbon-nexus-ml-engine:latest

# Check logs
docker logs -f ml-engine

# Health check
curl http://localhost:8001/api/v1/health
```

### 6. Docker Compose (Recommended)

```bash
# Start service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop service
docker-compose down
```

## Production Considerations

### Performance Optimization

1. **Model Loading**: Models are loaded once at startup and kept in memory
2. **Batch Predictions**: Use batch endpoints for multiple predictions
3. **Caching**: Consider adding Redis for frequently requested predictions

### Monitoring

1. **Health Endpoint**: `/api/v1/health` - Check service status
2. **Logs**: Structured JSON logs in `logs/` directory
3. **Metrics**: Track prediction latency and throughput

### Security

1. **API Keys**: Add authentication middleware for production
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **CORS**: Configure CORS for your frontend domain only

### Scaling

**Horizontal Scaling**:
```bash
# Run multiple instances behind a load balancer
docker-compose up --scale ml-engine=3
```

**Kubernetes Deployment**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-engine
  template:
    metadata:
      labels:
        app: ml-engine
    spec:
      containers:
      - name: ml-engine
        image: carbon-nexus-ml-engine:latest
        ports:
        - containerPort: 8001
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
```

## Integration with Other Services

### Orchestration Engine

The orchestration engine calls ML Engine for predictions:

```python
import httpx

async def get_prediction(event_data):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://ml-engine:8001/api/v1/predict/logistics",
            json=event_data
        )
        return response.json()
```

### Data Core

Data core provides clean data for predictions:

```python
# Data core normalizes data
normalized_event = normalize_event(raw_event)

# Send to ML Engine
prediction = await ml_client.predict(normalized_event)

# Store prediction
await db.insert_prediction(prediction)
```

## Troubleshooting

### Models Not Loading

```bash
# Check if model files exist
ls -lh src/models/

# Retrain if missing
python train_models_advanced.py
```

### High Memory Usage

- Models are loaded in memory (~100MB total)
- Consider using model quantization for production
- Use smaller batch sizes

### Slow Predictions

- Check if models are loaded (not using fallback formulas)
- Use batch endpoints for multiple predictions
- Consider GPU acceleration for LSTM models

### XGBoost Import Error (macOS)

```bash
# Install OpenMP
brew install libomp

# Reinstall XGBoost
pip uninstall xgboost
pip install xgboost
```

## Maintenance

### Model Retraining

Schedule periodic retraining with new data:

```bash
# Backup old models
cp -r src/models src/models.backup.$(date +%Y%m%d)

# Retrain with new data
python train_models_advanced.py

# Evaluate new models
python evaluate_models.py

# If performance is good, restart service
docker-compose restart
```

### Log Rotation

Logs are automatically rotated daily and kept for 7 days.

Manual cleanup:
```bash
find logs/ -name "*.log" -mtime +7 -delete
```

## Performance Benchmarks

Tested on: MacBook Pro M1, 16GB RAM

| Endpoint | Avg Latency | Throughput |
|----------|-------------|------------|
| Single Prediction | 5-10ms | ~100 req/s |
| Batch (10 items) | 15-25ms | ~40 batches/s |
| Forecast | 10-20ms | ~50 req/s |

## Support

For issues or questions:
1. Check logs: `docker-compose logs ml-engine`
2. Verify health: `curl http://localhost:8001/api/v1/health`
3. Review API docs: `http://localhost:8001/docs`
