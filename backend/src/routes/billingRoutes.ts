import express, { Request, Response } from 'express';
import { verifyAuth } from '../middleware/authMiddleware';
import billingService from '../services/billingService';
import logger from '../utils/logger';

const router = express.Router();

// GET /api/billing/plans - Get all plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await billingService.getAllPlans();
    res.json({ success: true, plans });
  } catch (error) {
    logger.error('Get plans failed', { error });
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

// GET /api/billing/current-plan - Get user's current plan
router.get('/current-plan', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const plan = await billingService.getUserPlan(userId);
    res.json({ success: true, plan });
  } catch (error) {
    logger.error('Get current plan failed', { error });
    res.status(500).json({ error: 'Failed to get plan' });
  }
});

// POST /api/billing/upgrade - Upgrade plan
router.post('/upgrade', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID required' });
    }

    const updated = await billingService.upgradePlan(userId, planId);
    res.json({ success: true, user: updated });
  } catch (error) {
    logger.error('Upgrade plan failed', { error });
    res.status(500).json({ error: 'Failed to upgrade plan' });
  }
});

// GET /api/billing/usage - Get usage statistics
router.get('/usage', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const usage = await billingService.trackUsage(userId, 0);
    res.json({ success: true, usage });
  } catch (error) {
    logger.error('Get usage failed', { error });
    res.status(500).json({ error: 'Failed to get usage' });
  }
});

// GET /api/billing/usage-limit - Check usage limit
router.get('/usage-limit', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = await billingService.checkUsageLimit(userId);
    res.json({ success: true, limit });
  } catch (error) {
    logger.error('Check usage limit failed', { error });
    res.status(500).json({ error: 'Failed to check usage limit' });
  }
});

// GET /api/billing/history - Get billing history
router.get('/history', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 10;
    const history = await billingService.getBillingHistory(userId, limit);
    res.json({ success: true, history });
  } catch (error) {
    logger.error('Get billing history failed', { error });
    res.status(500).json({ error: 'Failed to get billing history' });
  }
});

// POST /api/billing/invoice - Create invoice
router.post('/invoice', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { planId, amount } = req.body;

    if (!planId || !amount) {
      return res.status(400).json({ error: 'Plan ID and amount required' });
    }

    const invoice = await billingService.createInvoice(userId, planId, amount);
    res.json({ success: true, invoice });
  } catch (error) {
    logger.error('Create invoice failed', { error });
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

export default router;
