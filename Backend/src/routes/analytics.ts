import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';

const router = express.Router();

/**
 * Track app open (no auth required)
 * POST /api/analytics/app-open
 */
router.post('/app-open', async (req, res) => {
  try {
    const { platform } = req.body;
    await AnalyticsService.trackAppOpen(platform || 'unknown');
    res.json({ success: true });
  } catch (error) {
    console.error('Track app open error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get simple analytics (admin only) - just total opens count
 * GET /api/analytics/stats
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await AnalyticsService.getSimpleStats();
    res.json(stats);
  } catch (error) {
    console.error('Get analytics stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
