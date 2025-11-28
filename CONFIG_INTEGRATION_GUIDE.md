# Configuration Integration Guide

## ✅ Config Files Created

Configuration loaders have been created for all plugins to read environment variables from `.env` files.

---

## 📁 Files Created

### Python Plugins:
1. **plugins/ml-engine/src/utils/config.py**
2. **plugins/data-core/src/utils/config.py**
3. **plugins/orchestration-engine/src/utils/config.py**

### Node.js Plugin:
4. **plugins/rag_chatbot_plugin/src/config/env.ts**

### Frontend:
5. **frontend-ui/src/config/env.ts**

---

## 🔧 Usage

### Python Plugins (ml-engine, data-core, orchestration-engine)

**Import and use:**
```python
from src.utils.config import (
    ML_ENGINE_URL,
    DATA_CORE_URL,
    ORCHESTRATION_URL,
    RAG_URL,
    SUPABASE_URL,
    SUPABASE_KEY
)

# Example: Call ML Engine
import httpx

async def get_prediction(data):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ML_ENGINE_URL}/api/v1/predict/logistics",
            json=data
        )
        return response.json()
```

**Replace hardcoded URLs:**
```python
# Before:
response = requests.post("http://localhost:8001/api/v1/predict/logistics", ...)

# After:
from src.utils.config import ML_ENGINE_URL
response = requests.post(f"{ML_ENGINE_URL}/api/v1/predict/logistics", ...)
```

---

### Node.js Plugin (rag_chatbot_plugin)

**Import and use:**
```typescript
import {
  ML_ENGINE_URL,
  DATA_CORE_URL,
  ORCHESTRATION_URL,
  RAG_URL,
  SUPABASE_URL,
  SUPABASE_KEY
} from './config/env';

// Example: Call ML Engine
async function getPrediction(data: any) {
  const response = await fetch(`${ML_ENGINE_URL}/api/v1/predict/logistics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

**Or import default:**
```typescript
import config from './config/env';

console.log(config.ML_ENGINE_URL);
```

---

### Frontend UI (Vite/React)

**Import and use:**
```typescript
import { VITE_API_URL, ORCHESTRATION_URL } from './config/env';

// Example: Fetch from API
async function fetchEmissions() {
  const response = await fetch(`${VITE_API_URL}/api/emissions/current`);
  return response.json();
}
```

**In React components:**
```tsx
import { VITE_API_URL } from '@/config/env';

function Dashboard() {
  useEffect(() => {
    fetch(`${VITE_API_URL}/api/emissions/current`)
      .then(res => res.json())
      .then(data => setEmissions(data));
  }, []);
}
```

---

## 🔄 Environment Variables

### Python Plugins (.env)
```bash
ML_ENGINE_URL=http://localhost:8001
DATA_CORE_URL=http://localhost:8002
ORCHESTRATION_URL=http://localhost:8003
RAG_URL=http://localhost:8004
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Frontend (.env)
```bash
# Note: Vite requires VITE_ prefix
VITE_API_URL=http://localhost:8003
VITE_ML_ENGINE_URL=http://localhost:8001
VITE_DATA_CORE_URL=http://localhost:8002
VITE_ORCHESTRATION_URL=http://localhost:8003
VITE_RAG_URL=http://localhost:8004
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

---

## 📦 Dependencies

### Python Plugins
Add to `requirements.txt`:
```
python-dotenv==1.0.0
```

Install:
```bash
pip install python-dotenv
```

### Node.js Plugin
Add to `package.json`:
```json
{
  "dependencies": {
    "dotenv": "^16.3.1"
  }
}
```

Install:
```bash
npm install dotenv
```

### Frontend (Vite)
No additional dependencies needed - Vite handles env vars natively.

---

## 🔍 Finding Hardcoded URLs

To find and replace hardcoded URLs in your code:

```bash
# Search for hardcoded localhost URLs
grep -r "http://localhost:800" plugins/*/src --include="*.py" --include="*.ts"

# Search for specific service URLs
grep -r "localhost:8001" plugins/ml-engine/src
grep -r "localhost:8002" plugins/data-core/src
grep -r "localhost:8003" plugins/orchestration-engine/src
```

---

## ✅ Integration Checklist

### For Each Plugin:

- [ ] Install `python-dotenv` (Python) or `dotenv` (Node.js)
- [ ] Import config variables from the config file
- [ ] Replace hardcoded URLs with config variables
- [ ] Test that services can communicate
- [ ] Update `.env` with actual Supabase credentials

### Example Replacements:

**ML Engine:**
```python
# In any file that calls other services
from src.utils.config import DATA_CORE_URL, ORCHESTRATION_URL

# Replace:
# "http://localhost:8002/api/data"
# With:
f"{DATA_CORE_URL}/api/data"
```

**Data Core:**
```python
from src.utils.config import ML_ENGINE_URL, SUPABASE_URL

# Replace:
# "http://localhost:8001/api/v1/predict/logistics"
# With:
f"{ML_ENGINE_URL}/api/v1/predict/logistics"
```

**Orchestration Engine:**
```python
from src.utils.config import ML_ENGINE_URL, DATA_CORE_URL, RAG_URL

# Replace all hardcoded service URLs
```

**RAG Chatbot:**
```typescript
import { ML_ENGINE_URL, DATA_CORE_URL } from './config/env';

// Replace hardcoded URLs in fetch/axios calls
```

**Frontend:**
```typescript
import { VITE_API_URL } from './config/env';

// Replace all API calls to use VITE_API_URL
```

---

## 🚀 Testing Integration

After updating URLs:

```bash
# 1. Start all services
cd plugins/ml-engine && python run.py &
cd plugins/data-core && python run.py &
cd plugins/orchestration-engine && python run.py &
cd plugins/rag_chatbot_plugin && npm start &
cd frontend-ui && npm run dev &

# 2. Test inter-service communication
curl http://localhost:8003/api/health  # Should call other services

# 3. Check logs for connection errors
```

---

## 📝 Notes

1. **No existing files were modified** - only new config files added
2. **Config files auto-validate** on import and warn if variables are missing
3. **Default values provided** for all URLs (localhost)
4. **Frontend uses VITE_ prefix** as required by Vite
5. **All plugins use consistent variable names**

---

## 🎯 Next Steps

1. Install dependencies (`python-dotenv` or `dotenv`)
2. Import config in files that make HTTP calls
3. Replace hardcoded URLs with config variables
4. Fill in Supabase credentials in `.env` files
5. Test inter-service communication

**The configuration system is ready for integration!** 🎉
