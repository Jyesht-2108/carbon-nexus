# Frontend Plugin — Updated Architecture (frontend-ui)

**Purpose:** polished, production-feeling frontend architecture for Carbon Nexus. This document is an edited continuation of your original frontend architecture and focuses on improved UI/UX, the new **Data Upload** workflow for real-data testing, and a **RAG Chatbot Assistant** with file uploads. It's written so frontend engineers (Kiro/Cursor) can start implementing high-fidelity UI components immediately.

Reference: original frontend_architecture.md. fileciteturn1file0

---

## Overview — What changed

1. Added **Data Upload** page & components so users can upload CSV/XLSX to feed the Data Core and trigger the full pipeline.
2. Added **RAG Chatbot Assistant** page with PDF/DOCX upload + chat experience tied to your existing RAG service.
3. Upgraded UI/UX guidelines: refined design tokens, motion choreography, accessibility rules, improved component API contracts, and polished visuals (glass cards, soft shadows, consistent spacing and typography).
4. Added WebSocket channels to support upload job updates and RAG streaming.

The rest of the original architecture (dashboard, charts, heatmap, what-if modal, recommendation queue) remains and integrates with these additions.

---

## Tech Stack (unchanged, with additions)

- **React 18 + TypeScript** (Vite)
- **TailwindCSS + ShadCN** primitives
- **Framer Motion** (animations & motion system)
- **React Query** (server state) + Zustand/Context for UI state
- **Recharts** / **Visx** for charts (Visx recommended for custom visuals)
- **react-map-gl (Mapbox)** for heatmap
- **React Hook Form** for forms and uploads
- **Socket.IO client** (recommended) for robust real-time streams
- **PDF preview**: `pdfjs-dist` for client-side thumbnails and previews

---

## Folder structure (minor update)

```
plugins/frontend-ui/
  ├── src/
  │   ├── app/
  │   │   ├── routes/
  │   │   │   ├── dashboard/
  │   │   │   ├── ingest/        <-- New
  │   │   │   └── chatbot/       <-- New
  │   │   └── providers/
  │   ├── components/
  │   │   ├── charts/
  │   │   ├── cards/
  │   │   ├── heatmap/
  │   │   ├── upload/           <-- FileUploadCard, Dropzone
  │   │   ├── chat/             <-- ChatWindow, MessageBubble
  │   │   ├── layout/
  │   │   └── ui/
  │   ├── hooks/
  │   ├── lib/
  │   ├── pages/
  │   │   ├── DashboardPage.tsx
  │   │   ├── IngestPage.tsx     <-- New
  │   │   ├── ChatbotPage.tsx    <-- New
  │   │   ├── ActivityPage.tsx
  │   │   ├── AlertsPage.tsx
  │   │   └── SettingsPage.tsx
  │   ├── services/
  │   │   ├── api.ts
  │   │   ├── websocket.ts
  │   │   └── rag.ts             <-- small adaptor for chat endpoints
  │   ├── store/
  │   ├── styles/
  │   └── main.tsx
  └── index.html
```

---

## New pages & components (detailed)

### Ingest Page (`/ingest`) — Data Upload Panel

**Purpose:** allow demo users to feed real files into the system and watch the pipeline process them in real-time.

**Key Components:**
- `FileUploadCard` — main dropzone with accepted types and quick schema hints
- `FileSchemaPreview` — shows first 5 rows, auto-detected headers, quick column-map UI
- `UploadProgressBar` — animated progress + cancel
- `UploadHistoryList` — shows recent uploads, statuses, row counts
- `UploadResultDialog` — shows errors, warnings, and link to inspect normalized rows

**UX Flow:**
1. User drags file → client validates headers and types (light validation)
2. User confirms mapping if headers mismatch (map columns dropdowns)
3. `POST /ingest/upload` (multipart) → returns `{ jobId }`
4. Frontend subscribes to `ingest_jobs` channel via WS or polls `GET /ingest/status/{jobId}`
5. On completion, show toast + link to view affected rows and refreshed dashboard

**API Contracts (frontend-facing):**
- `POST /ingest/upload` (multipart) → `{ jobId, message }`
- `GET /ingest/status/{jobId}` → `{ status, rowsProcessed, errors[] }`

**Accessibility:** keyboard file select, aria-live regions for progress, color-contrast compliant messages


### Chatbot Page (`/chatbot`) — RAG Assistant

**Purpose:** let users upload documents and query them in natural language; answers combine uploaded docs and system data (hotspots, recommendations).

**Key Components:**
- `ChatWindow` — streaming responses, input box with history
- `MessageBubble` — supports text + citations (file name + page/paragraph)
- `DocumentListSidebar` — uploaded docs with preview and processing status
- `FileUploadButton` — small drop/upload control in chat to attach docs
- `CiteCard` — shows the snippet / page reference used by the RAG answer

**UX Flow:**
1. User uploads PDF/TXT/DOCX → `POST /rag/upload` returns `{ docId, status }`
2. Document is processed by RAG backend (vectorized) — frontend shows progress in sidebar
3. User asks question → `POST /rag/query` with optional `{ docIds: [...] }`
4. Server streams or returns answer + sources
5. Provide quick-actions in chat: "Create recommendation" → calls orchestration `POST /recommendations/create` (optional)

**API Contracts:**
- `POST /rag/upload` (multipart) → `{ docId, status }`
- `GET  /rag/documents` → list of docs & statuses
- `POST /rag/query` → streams answer; final JSON: `{ text, sources: [{docId, snippet, page}] }`

**Polish:** streaming typing animation, progressive text, responsive layout for mobile.


---

## UI/UX Polishing — Design tokens, Motion & Feel

### Visual language
- **Cards:** glass-like white cards with soft border, subtle blur, `rounded-2xl`
- **Shadows:** multi-layer shadows for depth: `0 8px 24px rgba(8,12,18,0.06)`
- **Palette:** `--primary: #0EA5A0` (teal), `--muted: #6B7280`, `--danger: #ef4444`, `--warning: #f59e0b`
- **Typography:** Inter variable for UI, 14–18px base, strong hierarchy for headings
- **Spacing:** 8px scale (8 / 12 / 16 / 24 / 32)

### Motion choreography (Framer Motion)
- Use a small motion system with named variants: `enter`, `exit`, `hover`, `focus`
- Example: entrance = `opacity: 0 → 1` + `y: 6 → 0` (duration 360ms)
- Heatmap marker pulse = small scale + opacity loop (use CSS variables to control timing)

### Micro-interactions
- Buttons animate subtle scale on press
- Upload progress uses color gradient and easing
- Tooltip delays 120ms, fast hide at 80ms

### Accessibility
- High-contrast mode toggle
- All interactive elements focus-visible styled
- Proper ARIA roles for live regions and dialogs

---

## Real-time & WebSocket channels (added)

Channels to implement:
- `emissions` — live rate updates
- `hotspots` — new/removed hotspots
- `alerts` — alerts stream
- `recommendations` — new recommendations
- `ingest_jobs` — upload job progress
- `rag_stream_{sessionId}` — streamed chatbot response

**Best practice:** use Socket.IO with namespaces per channel and JWT auth for secure demo.

---

## Small UX details & Edge cases

- **Schema mapping:** if column names mismatch, allow manual mapping and save mapping presets per supplier
- **Partial failures:** if some rows fail validation, show line-level errors and allow re-upload of only failed rows
- **Rate limits:** disable upload button while job pending; show ETA
- **Large file handling:** for files > 10MB, do chunked upload with resumable support

---

## Testing & Demo readiness

- Provide mock endpoints and mock WS server for local UI dev
- E2E demo script: auto-upload dataset → trigger hotspot scenario → open `/dashboard` → show recommendation
- Unit tests: snapshot tests for major components; integration tests for upload flow

---

## Deliverables (updated)

**Minimum (hackathon-ready):**
- Dashboard (live metrics, heatmap, recommendations)
- File upload page → full pipeline demo (UI → data-core → dashboard update)
- Chatbot page with file upload & query (RAG integration)
- Polished design tokens, motions, and theme

**Stretch:**
- Column mapping presets
- "Create recommendation" action from chat
- File preview with page-level citations

---

## Next steps I can generate for you

1. Folder skeleton with new pages (`/ingest`, `/chatbot`) and components
2. React code for `FileUploadCard` + `UploadProgressBar` (with mock API)
3. React Chat UI scaffold (`ChatWindow`, streaming mock)
4. WebSocket client implementation (Socket.IO example)

Tell me which one to generate next and I’ll produce code scaffolding immediately.

