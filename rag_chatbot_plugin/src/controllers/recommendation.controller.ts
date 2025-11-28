import { Request, Response } from 'express';
import { RecommendationService, HotspotContext } from '../services/recommendation.service';
import { logger } from '../config/logger';

export class RecommendationController {
  private recommendationService = new RecommendationService();
  
  /**
   * POST /api/rag/recommend
   * Generate structured recommendations for a hotspot
   */
  generateRecommendations = async (req: Request, res: Response) => {
    try {
      const context: HotspotContext = req.body;
      
      // Validate required fields
      if (!context.predicted || !context.baseline) {
        return res.status(400).json({ 
          error: 'Missing required fields: predicted and baseline are required' 
        });
      }
      
      logger.info('Generating recommendations for hotspot', { 
        entity: context.supplier || context.entity,
        predicted: context.predicted,
        baseline: context.baseline
      });
      
      // Generate recommendations using LLM
      const recommendations = await this.recommendationService.generateRecommendations(context);
      
      // Optionally save to database if hotspot_id is provided
      let savedRecommendations = null;
      if (req.body.save_to_db !== false) {
        const hotspotId = req.body.hotspot_id || null;
        const supplierId = context.supplier || null;
        
        savedRecommendations = await this.recommendationService.saveRecommendations(
          hotspotId,
          supplierId,
          recommendations
        );
      }
      
      res.json({
        ...recommendations,
        saved: savedRecommendations ? savedRecommendations.length : 0,
        recommendations: savedRecommendations
      });
    } catch (error) {
      logger.error('Failed to generate recommendations', error);
      res.status(500).json({ 
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  /**
   * GET /api/recommendations
   * Get all recommendations (optionally filtered)
   */
  getRecommendations = async (req: Request, res: Response) => {
    try {
      const { status, supplier_id, limit = 50 } = req.query;
      
      const db = require('../config/database').getDatabase();
      let query = db.from('recommendations').select('*');
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (supplier_id) {
        query = query.eq('supplier_id', supplier_id);
      }
      
      query = query.order('created_at', { ascending: false }).limit(parseInt(limit as string));
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      res.json({ recommendations: data || [] });
    } catch (error) {
      logger.error('Failed to fetch recommendations', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  };
  
  /**
   * PATCH /api/recommendations/:id
   * Update recommendation status
   */
  updateRecommendation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'approved', 'rejected', 'implemented'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const db = require('../config/database').getDatabase();
      const { data, error } = await db
        .from('recommendations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      logger.info(`Updated recommendation ${id} to status ${status}`);
      res.json({ recommendation: data });
    } catch (error) {
      logger.error('Failed to update recommendation', error);
      res.status(500).json({ error: 'Failed to update recommendation' });
    }
  };
}
