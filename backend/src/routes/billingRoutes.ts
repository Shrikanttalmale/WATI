import express, { Request, Response } from 'express';
import { authMiddleware as verifyAuth } from '../middleware/authMiddleware';
import billingService from '../services/billingService';
import logger from '../utils/logger';

const router = express.Router();

// GET /api/billing/plans - Get all plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await billingService.getAllPlans();
    res.json({ success: true, data: plans });
  } catch (error) {
    logger.error('Get plans failed', { error });
    res.status(500).json({ success: false, error: 'Failed to get plans' });
  }
});

// GET /api/billing/current-plan - Get user's current plan
router.get('/current-plan', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const plan = await billingService.getUserPlan(req.user.userId);
    res.json({ success: true, data: plan });
  } catch (error) {
    logger.error('Get current plan failed', { error });
    res.status(500).json({ success: false, error: 'Failed to get plan' });
  }
});

// POST /api/billing/upgrade - Upgrade plan
router.post('/upgrade', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan ID required' });
    }

    const updated = await billingService.upgradePlan(req.user.userId, planId);
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Upgrade plan failed', { error });
    res.status(500).json({ success: false, error: 'Failed to upgrade plan' });
  }
});

// GET /api/billing/usage - Get usage statistics
router.get('/usage', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const usage = await billingService.trackUsage(req.user.userId, 0);
    res.json({ success: true, data: usage });
  } catch (error) {
    logger.error('Get usage failed', { error });
    res.status(500).json({ success: false, error: 'Failed to get usage' });
  }
});

// GET /api/billing/usage-limit - Check usage limit
router.get('/usage-limit', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const limit = await billingService.checkUsageLimit(req.user.userId);
    res.json({ success: true, data: limit });
  } catch (error) {
    logger.error('Check usage limit failed', { error });
    res.status(500).json({ success: false, error: 'Failed to check usage limit' });
  }
});

// GET /api/billing/history - Get billing history
router.get('/history', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const limit = parseInt(req.query.limit as string) || 10;
    const history = await billingService.getBillingHistory(req.user.userId, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    logger.error('Get billing history failed', { error });
    res.status(500).json({ success: false, error: 'Failed to get billing history' });
  }
});

// POST /api/billing/invoice - Create invoice
router.post('/invoice', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { planId, amount } = req.body;

    if (!planId || !amount) {
      return res.status(400).json({ success: false, error: 'Plan ID and amount required' });
    }

    const invoice = await billingService.createInvoice(req.user.userId, planId, amount);
    res.json({ success: true, data: invoice });
  } catch (error) {
    logger.error('Create invoice failed', { error });
    res.status(500).json({ success: false, error: 'Failed to create invoice' });
  }
});

// POST /api/billing/checkout - Create Razorpay order
router.post('/checkout', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan ID required' });
    }

    const plan = await billingService.getAllPlans().then(plans => 
      plans.find(p => p.id === planId)
    );
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    // Mock Razorpay order creation (for MVP)
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoice = await billingService.createInvoice(req.user.userId, planId, plan.price);

    res.json({ 
      success: true, 
      data: {
        orderId,
        amount: Math.round(plan.price * 100), // Razorpay expects amount in paise
        currency: 'INR',
        planId,
        invoiceId: invoice.id
      } 
    });
  } catch (error) {
    logger.error('Checkout failed', { error });
    res.status(500).json({ success: false, error: 'Failed to create checkout' });
  }
});

// POST /api/billing/verify - Verify Razorpay payment
router.post('/verify', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { orderId, paymentId, signature, planId } = req.body;

    if (!orderId || !planId) {
      return res.status(400).json({ success: false, error: 'Order ID and Plan ID required' });
    }

    // Mock payment verification (for MVP - in production, verify with Razorpay)
    const history = await billingService.getBillingHistory(req.user.userId, 1);
    const lastInvoice = history[0];
    
    if (!lastInvoice) {
      return res.status(400).json({ success: false, error: 'Invoice not found' });
    }

    // Update invoice status to completed
    const updated = await billingService.upgradePlan(req.user.userId, planId);

    logger.info('Payment verified', { userId: req.user.userId, orderId, planId });
    res.json({ 
      success: true, 
      data: { 
        message: 'Payment verified successfully',
        updated 
      } 
    });
  } catch (error) {
    logger.error('Payment verification failed', { error });
    res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
});

export default router;
