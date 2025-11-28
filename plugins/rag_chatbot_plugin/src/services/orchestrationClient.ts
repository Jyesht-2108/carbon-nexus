/**
 * Orchestration Engine HTTP Client
 * Provides functions to communicate with Orchestration Engine
 */
import axios, { AxiosInstance } from 'axios';
import { ORCHESTRATION_URL } from '../config/env';

interface HotspotData {
  entity: string;
  predicted: number;
  baseline: number;
  context?: any;
}

interface RecommendationResponse {
  root_cause: string;
  actions: Array<{
    title: string;
    co2_reduction: number;
    cost_impact: number;
    feasibility: number;
  }>;
}

class OrchestrationClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ORCHESTRATION_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Send recommendations to orchestration engine
   */
  async sendRecommendations(
    hotspotId: string,
    recommendations: RecommendationResponse
  ): Promise<any> {
    const response = await this.client.post('/api/recommendations', {
      hotspot_id: hotspotId,
      ...recommendations,
    });
    return response.data;
  }

  /**
   * Fetch hotspot data for analysis
   */
  async fetchHotspots(): Promise<HotspotData[]> {
    const response = await this.client.get('/api/hotspots');
    return response.data;
  }

  /**
   * Report analysis completion
   */
  async reportAnalysisComplete(
    hotspotId: string,
    analysisData: any
  ): Promise<any> {
    const response = await this.client.post('/api/analysis/complete', {
      hotspot_id: hotspotId,
      analysis: analysisData,
    });
    return response.data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    const response = await this.client.get('/api/health');
    return response.data;
  }
}

// Singleton instance
export const orchestrationClient = new OrchestrationClient();
export default orchestrationClient;
