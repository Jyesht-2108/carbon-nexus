# Test UI Guide

## 🎯 Overview

A beautiful, interactive web UI for testing all RAG plugin features:
- 📄 Document Upload (PDF)
- 💬 Chat Query (Q&A)
- 💡 Recommendation Generation
- 🏥 Health Check

## 🚀 Quick Start

### 1. Start the Services

```bash
# Start Docker services (Qdrant, Redis)
./start-carbon-nexus.ps1

# Start RAG service
npm run dev
```

### 2. Open Test UI

Open your browser and go to:
```
http://localhost:4000
```

The test UI will automatically load!

## 📋 Features

### 1. Document Upload 📄

**Purpose:** Upload PDF documents for RAG processing

**How to use:**
1. Click the upload area
2. Select a PDF file (max 10MB)
3. Select Document Type (Supplier Report, Compliance Doc, etc.)
4. Enter Supplier/Entity name (optional)
5. Click "Upload Document"

**What happens:**
- File is uploaded to the server
- Text is extracted from PDF
- Content is chunked and embedded
- Vectors are stored in Qdrant
- Document is ready for querying

**Success Response:**
```
✓ Upload Successful!
Upload ID: 123
Document Type: supplier_report
Supplier/Entity: Supplier A
Status: pending
Document is being processed...
```

---

### 2. Chat Query 💬

**Purpose:** Ask questions about uploaded documents

**How to use:**
1. Upload a document first (see above)
2. Type your question in the text area
3. Click "Send Query"

**Example Questions:**
- "What is the main topic of this document?"
- "Summarize the key points"
- "What are the recommendations mentioned?"

**What happens:**
- Question is embedded
- Similar chunks are retrieved from Qdrant
- Gemini generates answer with context
- Citations are shown with sources

**Success Response:**
```
Answer: [AI-generated answer based on document]

Sources:
📄 document.pdf (Page 3)
"Relevant excerpt from the document..."
```

---

### 3. Generate Recommendations 💡

**Purpose:** Generate structured recommendations for carbon hotspots

**How to use:**
1. Enter Supplier/Entity name
2. Enter Predicted Emissions (kg CO₂)
3. Enter Baseline Emissions (kg CO₂)
4. Enter Hotspot Reason (optional)
5. Click "Generate Recommendations"

**Example Input:**
```
Supplier: Supplier A
Predicted: 120 kg CO₂
Baseline: 60 kg CO₂
Reason: High load + diesel fleet
```

**What happens:**
- Context is sent to Gemini
- AI analyzes the hotspot
- Structured recommendations are generated
- Results are saved to Supabase

**Success Response:**
```
✓ Recommendations Generated!

Root Cause: Higher order volumes increased load

Recommended Actions:
1. Shift 20% load to Supplier B
   CO₂ Reduction: 22.5 kg
   Cost Impact: +3%
   Feasibility: 9/10

2. Switch diesel fleet to CNG
   CO₂ Reduction: 15.2 kg
   Cost Impact: -1%
   Feasibility: 7/10
```

---

### 4. Health Check 🏥

**Purpose:** Verify the RAG service is running

**How to use:**
1. Click "Check Service Health"

**Success Response:**
```
✓ Service is Healthy
Status: ok
Timestamp: 11/28/2025, 12:00:00 PM
```

**Error Response:**
```
✗ Service is Down
Error: Failed to fetch
Make sure the RAG service is running on port 4000
```

---

## 🎨 UI Features

### Beautiful Design
- Modern gradient background
- Card-based layout
- Smooth animations
- Responsive design

### Real-time Feedback
- Loading spinners
- Success/error messages
- Color-coded responses
- Auto-scrolling chat

### Interactive Elements
- Drag-and-drop file upload
- Live chat interface
- Recommendation cards with metrics
- Citation display

---

## 🧪 Testing Scenarios

### Scenario 1: Full RAG Flow

1. **Upload a PDF document**
   - Use any PDF (technical doc, report, etc.)
   - Wait for "Upload Successful" message

2. **Ask questions about it**
   - "What is this document about?"
   - "Summarize the main points"
   - Check citations in responses

3. **Verify data in Supabase**
   - Check `uploads` table
   - Check `ingestion_jobs` table

### Scenario 2: Recommendation Generation

1. **Generate recommendations**
   - Use default values or customize
   - Click "Generate Recommendations"

2. **Review results**
   - Check root cause analysis
   - Review recommended actions
   - Note CO₂ reduction estimates

3. **Verify in Supabase**
   - Check `recommendations` table
   - Verify all fields are populated

### Scenario 3: Multiple Documents

1. **Upload multiple PDFs**
   - Upload document 1
   - Upload document 2
   - Upload document 3

2. **Query across documents**
   - Ask general questions
   - System searches all documents
   - Returns best matches

---

## 🔧 Troubleshooting

### Issue 1: "Service is Down"

**Solution:**
```bash
# Check if service is running
curl http://localhost:4000/health

# If not, start it
npm run dev
```

### Issue 2: Upload Fails

**Possible causes:**
- File too large (max 10MB)
- Not a PDF file
- Service not running

**Solution:**
- Check file size and type
- Verify service is running
- Check console for errors

### Issue 3: Query Returns No Results

**Possible causes:**
- No documents uploaded
- Document still processing
- Qdrant not running

**Solution:**
```bash
# Check Qdrant
curl http://localhost:6334/

# Check if collection exists
curl http://localhost:6334/collections/carbon_nexus_docs
```

### Issue 4: CORS Error

**Solution:**
The service already has CORS enabled. If you still see errors:
- Make sure you're accessing via `http://localhost:4000`
- Not `http://127.0.0.1:4000`
- Check browser console for details

---

## 📊 API Endpoints Used

The test UI calls these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/upload` | POST | Upload PDF |
| `/api/query` | POST | Ask questions |
| `/api/rag/recommend` | POST | Generate recommendations |

---

## 🎯 Best Practices

### For Document Upload:
- Use clear, well-formatted PDFs
- Keep files under 10MB
- Use descriptive filenames

### For Queries:
- Ask specific questions
- Reference document content
- Check citations for accuracy

### For Recommendations:
- Use realistic emission values
- Provide context in "reason" field
- Review feasibility scores

---

## 🚀 Next Steps

After testing with the UI:

1. **Integrate with Orchestration Engine**
   - Use the same API endpoints
   - Handle responses programmatically

2. **Connect to Frontend**
   - Use the UI as reference
   - Implement in React/Vue/Angular

3. **Deploy to Production**
   - Add authentication
   - Enable HTTPS
   - Configure CORS properly

---

## 📝 Notes

- **Mock Authentication:** The UI uses a mock token for testing
- **Auto Health Check:** Health check runs automatically on page load
- **Local Storage:** No data is stored in browser (all server-side)
- **Real-time:** All operations are real-time (no polling)

---

## 🎉 Enjoy Testing!

The test UI provides a complete, interactive way to test all RAG features. Use it to:
- Verify functionality
- Demo to stakeholders
- Debug issues
- Understand API behavior

**Access:** http://localhost:4000

Happy testing! 🚀
