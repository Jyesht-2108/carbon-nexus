# Frontend Plugin Architecture (frontend-ui)

This document defines the complete architecture for the **Carbon Nexus Frontend Plugin**, designed for implementation inside **Kiro / Cursor** environments. It contains folder structure, component structure, UI libraries, motion + animation guidelines, data flow, API contracts, and all conventions required to implement the entire UI plugin independently.

The goal: **A modern, clean, professional dashboard UI**, similar to the provided reference image, using:
- **React + TypeScript**
- **Vite** (recommended)
- **TailwindCSS** for styling
- **ShadCN UI** for components
- **Framer Motion** for animations
- **Recharts** for charts
- **Mapbox / React-Map-GL** for heatmap
- **React Query** for server state management
- **Socket.IO Client** or **Native WebSocket** for real-time data

This plugin is *completely independent* and communicates only through REST + WebSocket endpoints provided by the backend.

---

# 1. Goals of the Frontend Plugin

The frontend must:

1. Display **real-time emissions dashboard** (donut, gauge, trends, hotspots)
2. Display **animated heatmap** for carbon hotspots
3. Provide **recommendation queue** with action cards
4. Render **7-day forecast graph**
5. Provide **What-if simulator modal**
6. Display **alerts, activity feed, and breakdown cards**
7. Support **dark/light theme (optional)**
8. Use **beautiful animations via Framer Motion**
9. Be pixel-perfect and responsive

This FE plugin must be ready to integrate once backend plugins expose APIs.

---

# 2. Tech Stack

| Area | Library |
|------|---------|
| Core Framework | **React 18 + TypeScript** |
| Build | **Vite** |
| Styling | **TailwindCSS**, ShadCN UI |
| Components | ShadCN + Custom components |
| Charts | **Recharts** (lightweight + beautiful) |
| Map / Heatmap | **react-map-gl** or **mapbox-gl-react** |
| Animations | **Framer Motion** |
| State Management | **React Query** (server state) + Context for UI state |
| Forms | React Hook Form |
| Icons | Lucide Icons |
| Realtime | **Socket.IO Client** or WebSocket API |

---

# 3. Folder Structure

```
plugins/frontend-ui/
  ├── src/
  │   ├── app/
  │   │   ├── routes/
  │   │   └── providers/
  │   ├── components/
  │   │   ├── charts/
  │   │   ├── cards/
  │   │   ├── heatmap/
  │   │   ├── layout/
  │   │   ├── ui/ (shadcn components)
  │   ├── hooks/
  │   ├── lib/
  │   ├── pages/
  │   │   ├── DashboardPage.tsx
  │   │   ├── ActivityPage.tsx
  │   │   ├── AlertsPage.tsx
  │   │   ├── SettingsPage.tsx
  │   ├── services/
  │   │   ├── api.ts
  │   │   ├── websocket.ts
  │   ├── store/
  │   ├── styles/
  │   └── main.tsx
  └── index.html
```

---

# 4. UI Pages Breakdown

### **Dashboard Page (Main UI)**
Components:
- **Top Navbar**: Date picker, notifications, profile
- **Donut Chart Card** (CO₂ by category)
- **Gauge / Goal Meter Card**
- **Alert Summary Card**
- **Heatmap View** (interactive)
- **Critical Hotspots List**
- **Latest Activity List**
- **Forecast Line Chart**
- **Recommendation Queue**
- **Data Quality Widget**

### **Activity Page**
- History of emissions
- Timeline entries
- Animated transitions

### **Alerts Page**
- List of all alerts
- Acknowledge button
- Framer-motion list animations

### **Settings Page**
- User profile
- Theme toggle
- Threshold configuration

---

# 5. Components List (to be built)

## **Cards**
- `EmissionDonutCard`
- `GaugeProgressCard`
- `AlertSummaryCard`
- `HotspotCard`
- `RecommendationCard`
- `ActivityItem`
- `DataQualityBadge`

## **Charts**
- `CO2DonutChart`
- `ForecastLineChart`
- `HotspotBarChart`

## **Heatmap**
- `CarbonHeatmap` using react-map-gl

## **Modals**
- `WhatIfModal`
- `AlertDetailModal`

## **Layout Components**
- `Sidebar`
- `Topbar`
- `AppShell`

---

# 6. Animations (Framer Motion Guidelines)

### Use Motion For:
- Page transitions
- Card fade/scale on load
- Heatmap marker pulses
- Sliding recommendation panel
- Hover enlargements

### Motion Presets
- `fadeIn`
- `slideUp`
- `scaleIn`
- `pulse`

Example reusable variant:
```ts
export const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};
```

---

# 7. Data Flow Architecture

### **React Query** handles:
- Fetching predictions
- Fetching hotspots
- Fetching recommendations
- Fetching data-quality states

### **WebSocket Client** handles:
- Live emissions updates
- Live hotspot updates
- Live alerts
- Live recommendation push

Front-end only needs:
```ts
ws.on('hotspots', (data) => updateQueryCache(data));
```

---

# 8. API Contracts (Frontend Expectations)
These are the expected backend routes (orchestration engine):

### GET `/emissions/current`
Returns:
```json
{
  "current_rate": 1450,
  "categories": { "energy": 345, "shopping": 653 },
  "breakdown": [...]
}
```

### GET `/hotspots`
```json
[
  { "id": 1, "entity": "Supplier A", "percent": 120 }
]
```

### GET `/recommendations`
```json
[
  {
    "id": 23,
    "title": "Shift Supplier A to Supplier B",
    "co2_impact": -28,
    "costImpact": 3,
    "feasibility": 9
  }
]
```

### POST `/simulate`
Input:
```json
{ "vehicle": "EV", "route": "R12" }
```

Output:
```json
{ "delta": -32, "new_value": 120 }
```

---

# 9. Styling Guidelines

### Tailwind Base Rules:
- Rounded cards: `rounded-xl`
- Smooth shadows: `shadow-lg shadow-black/5`
- Background: teal/dark gradient
- Card background: white with subtle border

### ShadCN Components to Use:
- Card
- Button
- Dialog
- Select
- Tabs
- Tooltip

---

# 10. Heatmap Guidelines

Use **react-map-gl** with a simple heat layer.

- Data passed as GeoJSON
- Hotspot intensity → heatmap weight
- Pulse animation on red zones
- Zoom & pan enabled

---

# 11. Development Standards

### Required
- TypeScript strict mode
- ESLint + Prettier
- Component-driven development
- Reusable motion variants

### Optional Enhancements
- Dark mode
- Responsive layout

---

# 12. Deliverables

### Minimum for Hackathon
- Dashboard page fully functional
- Donut chart
- Gauge card
- Heatmap (mock data OK initially)
- Recommendations list
- Forecast chart
- Alerts widget
- What-if modal

### Stretch Goals
- Multi-theme
- Animations everywhere
- Breadcrumb navigation

---

# 13. Summary

This **frontend-ui plugin** is a standalone, professional-grade dashboard built with React + TS + Tailwind + ShadCN + Framer Motion. It cleanly consumes backend data through REST + WebSockets and provides a visually rich, modern interface.

Kiro / Cursor can automatically scaffold this plugin, generate components, create animations, and help connect APIs when other plugins become available.

---

**When you want, say:**
> "Generate the folder skeleton for frontend-ui" or
> "Create code for DashboardPage" or
> "Generate all UI components"

