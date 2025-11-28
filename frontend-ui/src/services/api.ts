/**
 * API Client for Frontend
 * Communicates with Orchestration Engine (main backend API)
 */
import { VITE_API_URL } from '../config/env';

// Base API URL (defaults to Orchestration Engine)
const API_BASE_URL = VITE_API_URL;

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Emissions API
 */
export const emissionsApi = {
  /**
   * Get current emissions data
   */
  async getCurrent() {
    return apiFetch('/emissions/current');
  },

  /**
   * Get emissions forecast
   */
  async getForecast() {
    return apiFetch('/emissions/forecast');
  },

  /**
   * Get emissions by category
   */
  async getByCategory() {
    return apiFetch('/emissions/by-category');
  },
};

/**
 * Hotspots API
 */
export const hotspotsApi = {
  /**
   * Get all hotspots
   */
  async getAll() {
    return apiFetch('/hotspots');
  },

  /**
   * Get hotspot by ID
   */
  async getById(id: string) {
    return apiFetch(`/hotspots/${id}`);
  },
};

/**
 * Recommendations API
 */
export const recommendationsApi = {
  /**
   * Get all recommendations
   */
  async getAll() {
    return apiFetch('/recommendations');
  },

  /**
   * Approve a recommendation
   */
  async approve(id: string) {
    return apiFetch(`/recommendations/${id}/approve`, {
      method: 'POST',
    });
  },

  /**
   * Dismiss a recommendation
   */
  async dismiss(id: string) {
    return apiFetch(`/recommendations/${id}/dismiss`, {
      method: 'POST',
    });
  },
};

/**
 * Alerts API
 */
export const alertsApi = {
  /**
   * Get all alerts
   */
  async getAll() {
    return apiFetch('/alerts');
  },

  /**
   * Acknowledge an alert
   */
  async acknowledge(id: string) {
    return apiFetch(`/alerts/${id}/acknowledge`, {
      method: 'POST',
    });
  },
};

/**
 * Simulation API
 */
export const simulationApi = {
  /**
   * Run what-if simulation
   */
  async simulate(scenario: any) {
    return apiFetch('/simulate', {
      method: 'POST',
      body: JSON.stringify(scenario),
    });
  },
};

/**
 * Data Quality API
 */
export const dataQualityApi = {
  /**
   * Get data quality metrics
   */
  async getMetrics() {
    return apiFetch('/data-quality');
  },

  /**
   * Get data quality by supplier
   */
  async getBySupplier(supplierId: string) {
    return apiFetch(`/data-quality/${supplierId}`);
  },
};

/**
 * Health Check
 */
export const healthApi = {
  /**
   * Check API health
   */
  async check() {
    return apiFetch('/health');
  },
};

// Export all APIs as default
export default {
  emissions: emissionsApi,
  hotspots: hotspotsApi,
  recommendations: recommendationsApi,
  alerts: alertsApi,
  simulation: simulationApi,
  dataQuality: dataQualityApi,
  health: healthApi,
};
