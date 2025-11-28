import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';

const router = Router();
const controller = new RecommendationController();

/**
 * POST /api/rag/recommend
 * Generate structured recommendations for a hotspot
 * 
 * Body:
 * {
 *   "supplier": "Supplier A",
 *   "predicted": 120,
 *   "baseline": 60,
 *   "hotspot_reason": "High load + diesel fleet",
 *   "hotspot_id": 123,  // optional
 *   "save_to_db": true  // optional, default true
 * }
 */
router.post('/rag/recommend', controller.generateRecommendations);

/**
 * GET /api/recommendations
 * Get all recommendations
 * 
 * Query params:
 * - status: pending|approved|rejected|implemented
 * - supplier_id: filter by supplier
 * - limit: max results (default 50)
 */
router.get('/recommendations', controller.getRecommendations);

/**
 * PATCH /api/recommendations/:id
 * Update recommendation status
 * 
 * Body:
 * {
 *   "status": "approved|rejected|implemented"
 * }
 */
router.patch('/recommendations/:id', controller.updateRecommendation);

export default router;
