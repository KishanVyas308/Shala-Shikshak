import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';

const router = express.Router();

/**
 * Get analytics overview (admin only)
 * GET /api/analytics/overview
 */
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const overview = await AnalyticsService.getAnalyticsOverview(days);
    res.json(overview);
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get daily analytics for charts (admin only)
 * GET /api/analytics/daily
 */
router.get('/daily', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const dailyAnalytics = await AnalyticsService.getDailyAnalytics(days);
    res.json(dailyAnalytics);
  } catch (error) {
    console.error('Get daily analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
