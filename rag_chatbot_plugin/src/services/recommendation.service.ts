import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from 'langchain/prompts';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { getDatabase } from '../config/database';

export interface HotspotContext {
  supplier?: string;
  entity?: string;
  predicted: number;
  baseline: number;
  hotspot_reason?: string;
  event_type?: string;
  recent_events?: any[];
}

export interface RecommendationAction {
  title: string;
  description?: string;
  co2_reduction: number;
  cost_impact: string;
  feasibility: number;
  confidence?: number;
}

export interface RecommendationResponse {
  root_cause: string;
  actions: RecommendationAction[];
}

export class RecommendationService {
  private model: ChatGoogleGenerativeAI;
  private promptTemplate: PromptTemplate;
  
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: config.gemini.apiKey,
      modelName: config.gemini.model,
      temperature: 0.3,
      maxOutputTokens: 2048
    });
    
    this.promptTemplate = PromptTemplate.fromTemplate(`
You are a carbon emissions optimization expert for supply chain management.

Analyze the following hotspot and provide structured recommendations to reduce carbon emissions.

Hotspot Context:
- Entity: {entity}
- Current Emissions: {predicted} kg CO₂
- Baseline Emissions: {baseline} kg CO₂
- Percentage Above Baseline: {percentAbove}%
- Reason: {reason}

Your task:
1. Identify the root cause of the emission spike
2. Provide 3 actionable recommendations in JSON format

Each recommendation must include:
- title: Short, actionable title (max 60 chars)
- description: Brief explanation (max 200 chars)
- co2_reduction: Estimated CO₂ reduction in kg (number)
- cost_impact: Cost impact as percentage string (e.g., "+3%", "-2%", "0%")
- feasibility: Feasibility score from 1-10 (10 = most feasible)

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations.
Use this EXACT format (replace values but keep structure):
{{
  "root_cause": "Brief explanation here",
  "actions": [
    {{
      "title": "Action title here",
      "description": "Action description here",
      "co2_reduction": 25.5,
      "cost_impact": "+2%",
      "feasibility": 8
    }},
    {{
      "title": "Second action title",
      "description": "Second action description",
      "co2_reduction": 15.0,
      "cost_impact": "-1%",
      "feasibility": 7
    }}
  ]
}}

Rules:
- Use double quotes for all strings
- No line breaks inside string values
- Provide 2-3 actions
- Return ONLY the JSON object, nothing else`);
  }
  
  async generateRecommendations(context: HotspotContext): Promise<RecommendationResponse> {
    try {
      const percentAbove = ((context.predicted - context.baseline) / context.baseline * 100).toFixed(1);
      
      const prompt = await this.promptTemplate.format({
        entity: context.supplier || context.entity || 'Unknown',
        predicted: context.predicted,
        baseline: context.baseline,
        percentAbove,
        reason: context.hotspot_reason || 'Emissions spike detected'
      });
      
      const response = await this.model.invoke(prompt);
      const content = typeof response.content === 'string' 
        ? response.content 
        : response.content.toString();
      
      // Extract JSON from response (handle markdown code blocks and malformed JSON)
      let jsonStr = content.trim();
      
      // Remove markdown code blocks
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }
      
      // Clean up common JSON issues
      jsonStr = jsonStr.trim();
      
      // Remove any text before the first { or after the last }
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }
      
      // Fix common issues: replace smart quotes, fix line breaks in strings
      jsonStr = jsonStr
        .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
        .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes
        .replace(/\n/g, ' ')              // Remove newlines that break JSON
        .replace(/\r/g, '');              // Remove carriage returns
      
      logger.debug('Cleaned JSON string:', jsonStr.substring(0, 200));
      
      const recommendations: RecommendationResponse = JSON.parse(jsonStr);
      
      // Add confidence scores
      recommendations.actions = recommendations.actions.map(action => ({
        ...action,
        confidence: this.calculateConfidence(action.feasibility, context)
      }));
      
      logger.info('Generated structured recommendations');
      return recommendations;
    } catch (error) {
      logger.error('Failed to generate recommendations', error);
      
      // Fallback recommendations
      return {
        root_cause: 'Unable to determine root cause automatically',
        actions: [
          {
            title: 'Review supplier operations',
            description: 'Conduct detailed analysis of recent operational changes',
            co2_reduction: 10,
            cost_impact: '0%',
            feasibility: 8,
            confidence: 0.5
          }
        ]
      };
    }
  }
  
  async saveRecommendations(
    hotspotId: number | null,
    supplierId: string | null,
    recommendations: RecommendationResponse
  ): Promise<any[]> {
    const db = getDatabase();
    const savedRecommendations = [];
    
    for (const action of recommendations.actions) {
      const { data, error } = await db
        .from('recommendations')
        .insert({
          hotspot_id: hotspotId,
          supplier_id: supplierId,
          title: action.title,
          description: action.description || '',
          co2_reduction: action.co2_reduction,
          cost_impact: action.cost_impact,
          feasibility: action.feasibility,
          confidence: action.confidence || 0.7,
          root_cause: recommendations.root_cause,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Failed to save recommendation', error);
      } else {
        savedRecommendations.push(data);
      }
    }
    
    logger.info(`Saved ${savedRecommendations.length} recommendations`);
    return savedRecommendations;
  }
  
  private calculateConfidence(feasibility: number, context: HotspotContext): number {
    // Simple confidence calculation based on feasibility and data quality
    let confidence = feasibility / 10;
    
    // Adjust based on how far above baseline
    const percentAbove = (context.predicted - context.baseline) / context.baseline;
    if (percentAbove > 2) {
      confidence *= 0.9; // Less confident for extreme spikes
    }
    
    return Math.min(Math.max(confidence, 0.3), 0.95);
  }
}
