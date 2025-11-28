import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface EmissionCurrent {
  current_rate: number;
  trend: number;
  categories: Record<string, number>;
  total_today: number;
  target: number;
}

export interface Hotspot {
  id: number;
  entity: string;
  entity_type: string;
  predicted: number;
  baseline: number;
  percent_above: number;
  severity: 'info' | 'warning' | 'critical';
}

export interface Recommendation {
  id: number;
  title: string;
  body: string;
  co2_impact: number;
  cost_estimate: number;
  feasibility_score: number;
  status: 'pending' | 'approved' | 'dismissed';
}

export interface Alert {
  id: number;
  level: 'info' | 'warning' | 'critical';
  message: string;
  hotspot_id?: number;
  acknowledged_at?: string;
  created_at: string;
}

export interface ForecastData {
  dates: string[];
  forecast: number[];
  confidence_low: number[];
  confidence_high: number[];
}

export interface DataQuality {
  completeness_pct: number;
  predicted_pct: number;
  anomalies_count: number;
}

export interface SimulationRequest {
  vehicle_type?: string;
  route?: string;
  load_change?: number;
}

export interface SimulationResponse {
  new_value: number;
  delta: number;
}

export const emissionsApi = {
  getCurrent: () => api.get<EmissionCurrent>('/emissions/current'),
  getForecast: () => api.get<ForecastData>('/emissions/forecast'),
};

export const hotspotsApi = {
  getAll: () => api.get<Hotspot[]>('/hotspots'),
};

export const recommendationsApi = {
  getAll: () => api.get<Recommendation[]>('/recommendations'),
  approve: (id: number) => api.post(`/recommendations/${id}/approve`),
  dismiss: (id: number) => api.post(`/recommendations/${id}/dismiss`),
};

export const alertsApi = {
  getAll: () => api.get<Alert[]>('/alerts'),
  acknowledge: (id: number) => api.post(`/alerts/${id}/acknowledge`),
};

export const dataQualityApi = {
  get: () => api.get<DataQuality>('/data-quality'),
};

export const simulationApi = {
  simulate: (data: SimulationRequest) => api.post<SimulationResponse>('/simulate', data),
};
