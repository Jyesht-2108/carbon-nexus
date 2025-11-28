# Carbon Nexus Frontend

Real-time carbon intelligence dashboard built with React, TypeScript, and Vite.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Charts
- **React Query** - Server state management
- **React Router** - Routing

## Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── app/
│   ├── providers/     # React Query, etc.
│   └── routes/        # Route configuration
├── components/
│   ├── cards/         # Dashboard cards
│   ├── charts/        # Chart components
│   ├── layout/        # Layout components
│   └── ui/            # Base UI components
├── hooks/             # Custom hooks
├── lib/               # Utilities & animations
├── pages/             # Page components
├── services/          # API services
└── styles/            # Global styles
```

## Features

- ✅ Real-time emission monitoring with WebSocket updates
- ✅ Interactive donut & forecast charts
- ✅ Hotspot detection & alerts
- ✅ AI-powered recommendations
- ✅ Data quality tracking
- ✅ **CSV/XLSX data upload** with progress tracking
- ✅ **RAG Chatbot Assistant** with document upload
- ✅ Smooth animations with Framer Motion
- ✅ Glass-morphism design with soft shadows
- ✅ Responsive design

## API Integration

The frontend expects these backend endpoints:

### Dashboard APIs
- `GET /emissions/current` - Current emission data
- `GET /emissions/forecast` - 7-day forecast
- `GET /hotspots` - Active hotspots
- `GET /recommendations` - AI recommendations
- `GET /data-quality` - Data quality metrics
- `POST /simulate` - What-if simulation

### Data Upload APIs
- `POST /ingest/upload` - Upload CSV/XLSX files
- `GET /ingest/status/{jobId}` - Check upload job status

### RAG Chatbot APIs
- `POST /rag/upload` - Upload documents for RAG
- `GET /rag/documents` - List uploaded documents
- `POST /rag/query` - Query the RAG system
- `DELETE /rag/documents/{docId}` - Delete a document

### WebSocket Channels
- `emissions` - Real-time emission updates
- `hotspots` - Hotspot changes
- `alerts` - New alerts
- `recommendations` - New recommendations
- `ingest_jobs` - Upload job progress

Configure the API and WebSocket URLs in `.env`:

```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Development Notes

- Uses React Query for automatic refetching (5s for emissions, 10s for hotspots)
- Framer Motion provides smooth page transitions and card animations
- TailwindCSS with custom color scheme matching the design
- TypeScript strict mode enabled

## License

MIT
