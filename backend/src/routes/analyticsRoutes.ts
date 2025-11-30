import express, { Request, Response } from 'express';
import { verifyAuth } from '../middleware/authMiddleware';
import analyticsService from '../services/analyticsService';
import logger from '../utils/logger';

const router = express.Router();

// GET /api/analytics/delivery-dashboard - Get delivery analytics
router.get('/delivery-dashboard', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const dashboard = await analyticsService.getDeliveryDashboard(userId);
    res.json({ success: true, dashboard });
  } catch (error) {
    logger.error('Get delivery dashboard failed', { error });
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// GET /api/analytics/message/:campaignId - Get message analytics
router.get('/message/:campaignId', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const analytics = await analyticsService.getMessageAnalytics(req.params.campaignId, userId);
    res.json({ success: true, analytics });
  } catch (error) {
    logger.error('Get message analytics failed', { error });
    res.status(500).json({ error: 'Failed to get message analytics' });
  }
});

// POST /api/analytics/date-range - Get analytics by date range
router.post('/date-range', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start and end dates required' });
    }

    const analytics = await analyticsService.getAnalyticsByDateRange(
      userId,
      new Date(startDate),
      new Date(endDate)
    );
    res.json({ success: true, analytics });
  } catch (error) {
    logger.error('Get analytics by date range failed', { error });
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// GET /api/analytics/ban-risk - Get ban risk events
router.get('/ban-risk', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const events = await analyticsService.getBanRiskEvents(userId);
    res.json({ success: true, events });
  } catch (error) {
    logger.error('Get ban risk events failed', { error });
    res.status(500).json({ error: 'Failed to get ban risk events' });
  }
});

// GET /api/analytics/safety-score - Get account safety score
router.get('/safety-score', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const score = await analyticsService.getAccountSafetyScore(userId);
    res.json({ success: true, score });
  } catch (error) {
    logger.error('Get safety score failed', { error });
    res.status(500).json({ error: 'Failed to get safety score' });
  }
});

export default router;
