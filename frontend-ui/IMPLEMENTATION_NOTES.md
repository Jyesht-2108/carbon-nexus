# Frontend Implementation Notes

## Updates Based on frontend_architecture_updated.md

### New Features Added

#### 1. Data Upload Page (`/ingest`)
- **FileUploadCard** - Drag & drop interface for CSV/XLSX files
- **UploadHistoryList** - Shows recent uploads with status
- Real-time progress tracking via WebSocket
- File validation and preview

**Components:**
- `src/pages/IngestPage.tsx`
- `src/components/upload/FileUploadCard.tsx`
- `src/components/upload/UploadHistoryList.tsx`

**API Endpoints:**
- `POST /api/ingest/upload` - Upload file (multipart/form-data)
- `GET /api/ingest/status/{jobId}` - Poll job status

**WebSocket Channel:**
- `ingest_jobs` - Real-time upload progress updates

---

#### 2. RAG Chatbot Assistant (`/chatbot`)
- **ChatWindow** - Streaming chat interface
- **MessageBubble** - User/assistant messages with typing animation
- **DocumentListSidebar** - Shows uploaded documents with status
- **CiteCard** - Source citations with page references
- File upload support (PDF, TXT, DOCX)

**Components:**
- `src/pages/ChatbotPage.tsx`
- `src/components/chat/ChatWindow.tsx`
- `src/components/chat/MessageBubble.tsx`
- `src/components/chat/DocumentListSidebar.tsx`
- `src/components/chat/CiteCard.tsx`

**API Endpoints:**
- `POST /api/rag/upload` - Upload document
- `GET /api/rag/documents` - List documents
- `POST /api/rag/query` - Query with optional docIds
- `DELETE /api/rag/documents/{docId}` - Delete document

**WebSocket Channel:**
- `rag_stream_{sessionId}` - Streaming responses (optional)

---

#### 3. Enhanced Design System

**Updated Design Tokens:**
- Primary color: `#0EA5A0` (teal) - HSL(174, 72%, 56%)
- Border radius: `1rem` (16px) for cards
- Shadows: `0 8px 24px rgba(8,12,18,0.06)` - soft multi-layer
- Glass-morphism: `backdrop-blur-sm` on cards
- Rounded corners: `rounded-2xl` for cards

**Typography:**
- Base: 14-18px
- Font: System fonts (Inter recommended)
- Spacing: 8px scale (8/12/16/24/32)

**Motion System:**
- Entrance: opacity 0→1 + y: 6→0 (360ms)
- Hover: subtle scale
- Focus: ring with offset
- Typing animation: 3-dot pulse

---

#### 4. WebSocket Integration

**Service:** `src/services/websocket.ts`
- Socket.IO client with auto-reconnect
- Channel-based pub/sub system
- Automatic connection management

**Hook:** `src/hooks/useWebSocket.ts`
- React hook for subscribing to channels
- Auto cleanup on unmount

**Channels:**
- `emissions` - Live emission rate updates
- `hotspots` - Hotspot changes
- `alerts` - New alerts
- `recommendations` - New recommendations
- `ingest_jobs` - Upload progress

**Usage in Dashboard:**
```tsx
useWebSocket('emissions', (data) => {
  queryClient.invalidateQueries({ queryKey: ['emissions'] });
});
```

---

### Updated Navigation

Sidebar now includes:
1. Dashboard (Home)
2. Activity
3. **Data Upload** (new)
4. **RAG Assistant** (new)
5. Goals
6. Settings

---

### File Structure Changes

```
src/
├── components/
│   ├── chat/              # NEW - Chat components
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── DocumentListSidebar.tsx
│   │   └── CiteCard.tsx
│   ├── upload/            # NEW - Upload components
│   │   ├── FileUploadCard.tsx
│   │   └── UploadHistoryList.tsx
├── hooks/
│   └── useWebSocket.ts    # NEW - WebSocket hook
├── pages/
│   ├── IngestPage.tsx     # NEW - Data upload page
│   └── ChatbotPage.tsx    # NEW - RAG chatbot page
├── services/
│   ├── websocket.ts       # NEW - WebSocket service
│   └── rag.ts             # NEW - RAG API client
```

---

### Dependencies Added

- `react-hook-form` - Form handling (for future enhancements)
- `socket.io-client` - WebSocket client
- `date-fns` - Date formatting

---

### Environment Variables

Update `.env`:
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_MAPBOX_TOKEN=your_token_here
```

---

### Testing Checklist

- [ ] Upload CSV file and see progress
- [ ] View upload history with status
- [ ] Upload document to RAG
- [ ] Ask questions in chatbot
- [ ] See source citations
- [ ] Real-time dashboard updates via WebSocket
- [ ] Smooth animations on all pages
- [ ] Responsive layout on mobile

---

### Next Steps (Optional Enhancements)

1. **Column Mapping UI** - Allow users to map CSV columns
2. **File Preview** - Show first 5 rows before upload
3. **Partial Upload Recovery** - Re-upload failed rows
4. **Streaming Chat Responses** - Progressive text rendering
5. **Create Recommendation from Chat** - Quick action button
6. **High Contrast Mode** - Accessibility toggle
7. **Mock WebSocket Server** - For local development

---

### Backend Integration Notes

The frontend is ready to integrate with backend services. Ensure:

1. **CORS** is configured for `http://localhost:3000`
2. **WebSocket** endpoint is at `/ws` or configure `VITE_WS_URL`
3. **Multipart uploads** are supported for file endpoints
4. **JWT auth** (optional) can be added to WebSocket connection
5. **Rate limiting** on upload endpoints

---

### Design Polish Applied

✅ Glass-morphism cards with backdrop blur
✅ Soft multi-layer shadows
✅ Consistent 8px spacing scale
✅ Smooth entrance animations
✅ Typing indicators in chat
✅ Progress bars with gradient
✅ Color-coded status indicators
✅ Hover micro-interactions
✅ Focus-visible states for accessibility

---

## Summary

The frontend now includes:
- **Data Upload workflow** with drag & drop
- **RAG Chatbot** with document upload and citations
- **Real-time updates** via WebSocket
- **Enhanced design system** with glass-morphism
- **Production-ready** component architecture

All components follow the updated architecture spec and are ready for backend integration.


---

## Carbon Emission 3D Effects & Theme System Update

### Theme System
- **Default theme**: Dark mode (changed from light)
- **Theme toggle**: Available in top-right corner of Topbar
- **Theme persistence**: Stored in localStorage
- **Dynamic theme detection**: MutationObserver watches for theme changes

### 3D Carbon Molecular Models

#### CO2 Molecules (70% of molecules)
- Linear structure: O=C=O
- Carbon atom: Dark gray/black with cyan glow
- Oxygen atoms: Red with emission glow
- Double bonds: Cyan glowing cylinders (2 per side)
- Accurate molecular geometry

#### CO Molecules (30% of molecules)
- Linear structure: C≡O
- Carbon atom: Dark gray/black with cyan glow
- Oxygen atom: Red with emission glow
- Triple bond: Three cyan glowing cylinders
- Accurate molecular geometry

### Theme-Aware 3D Effects

All 3D components adapt to theme:

**MovingStars**
- Dark mode: Cyan/teal/white stars
- Light mode: Black/dark gray stars

**CarbonMolecules**
- Dark mode: Bright colors with strong emission
- Light mode: Darker colors for visibility

**EmissionParticles**
- Dark mode: Cyan/orange/red particles
- Light mode: Dark blue/dark orange/dark red particles

**CarbonVisualization**
- Dark mode: Bright neon colors
- Light mode: Muted colors for contrast

### UI Visibility Improvements

**Light Mode:**
- White background (#FFFFFF)
- Dark text (#1a1a1a)
- High-opacity cards (98%)
- Stronger borders and shadows
- Darker gradient colors

**Dark Mode:**
- Gradient background (preserved)
- Light text (#F8FAFC)
- Glass-morphism cards (3% opacity)
- Neon glows and effects
- Bright gradient colors

### Components Updated
- `Background3D.tsx` - Theme detection and prop passing
- `CarbonMolecules.tsx` - Accurate CO2/CO molecular structures
- `MovingStars.tsx` - Theme-aware star colors
- `EmissionParticles.tsx` - Theme-aware particle colors
- `CarbonVisualization.tsx` - Theme-aware visualization
- `useTheme.ts` - Default changed to dark
- `globals.css` - Enhanced contrast for both themes

### Features Preserved
- Moving starfield background (unchanged)
- All existing UI components
- WebSocket functionality
- Upload and chat features
- Animations and transitions
