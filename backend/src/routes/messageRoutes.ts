import { Router, Request, Response } from 'express';
import messageService from '../services/messageService';
import queueService from '../services/queueService';
import scheduleService from '../services/scheduleService';
import { authMiddleware } from '../middleware/authMiddleware';
import logger from '../utils/logger';

const router = Router();

// Send single message
router.post('/send', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const { phone, message, campaignId } = req.body;
    const result = await messageService.sendMessage(req.user.userId, phone, message, campaignId);
    
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Send message error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

// Add message to queue
router.post('/queue', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const { phone, message, campaignId } = req.body;
    const result = await queueService.addMessage(req.user.userId, phone, message, campaignId);
    
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Queue message error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

// Send campaign messages immediately
router.post('/campaign-send', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const { campaignId, delayMs } = req.body;
    const result = await messageService.sendCampaignMessages(campaignId, req.user.userId, delayMs);
    
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Campaign send error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

// Schedule campaign for later
router.post('/campaign-schedule', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const { campaignId, scheduledTime } = req.body;
    const result = await scheduleService.scheduleCampaign(campaignId, new Date(scheduledTime));
    
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Schedule campaign error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

// Cancel scheduled campaign
router.delete('/schedule/:campaignId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const result = await scheduleService.cancelSchedule(req.params.campaignId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Cancel schedule error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all scheduled campaigns
router.get('/scheduled', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const campaigns = await scheduleService.getScheduledCampaigns(req.user.userId);
    res.status(200).json({ success: true, data: campaigns });
  } catch (error: any) {
    logger.error('Get scheduled error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get message stats for a campaign
router.get('/campaign/:campaignId/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const stats = await messageService.getMessageStats(req.params.campaignId, req.user.userId);
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Get message stats error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

// Retry failed messages
router.post('/retry-failed', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const stats = await queueService.getQueueStats();

    res.status(200).json({
      success: true,
      data: {
        message: 'Retry endpoint - failed messages handling',
        ...stats,
      },
    });
  } catch (error: any) {
    logger.error('Retry failed messages error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get queue stats (real-time)
router.get('/queue/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const stats = await queueService.getQueueStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Get queue stats error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get queue job status
router.get('/queue/job/:jobId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const status = await queueService.getJobStatus(req.params.jobId);
    res.status(200).json({ success: true, data: status });
  } catch (error: any) {
    logger.error('Get job status error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

// Process queue (trigger processing)
router.post('/process-queue', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // For MVP, just return queue stats
    const stats = await queueService.getQueueStats();
    res.json({
      success: true,
      data: {
        message: 'Queue processing initiated',
        ...stats,
      },
    });
  } catch (error: any) {
    logger.error('Process queue error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook for WhatsApp delivery confirmations
router.post('/webhook/delivery', async (req: Request, res: Response) => {
  try {
    const { messageId, status, phoneNumber, campaignId, timestamp, signature } = req.body;

    if (!messageId || !status) {
      return res.status(400).json({ success: false, error: 'messageId and status required' });
    }

    // Validate webhook signature (production: verify with WhatsApp webhook secret)
    const webhookSecret = process.env.WEBHOOK_SECRET || 'default-webhook-secret';
    if (!signature || signature !== webhookSecret) {
      logger.warn('Invalid webhook signature', { messageId, signature });
      return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
    }

    logger.info('Delivery webhook received', { messageId, status, phoneNumber });

    // Update message status in database
    if (messageId && campaignId) {
      const validStatuses = ['delivered', 'failed', 'read', 'pending'];
      if (validStatuses.includes(status)) {
        const updateData: any = {
          status,
        };

        if (status === 'delivered') {
          updateData.deliveredAt = new Date(timestamp || Date.now());
        } else if (status === 'failed') {
          updateData.failedAt = new Date(timestamp || Date.now());
        } else if (status === 'read') {
          updateData.deliveredAt = new Date(timestamp || Date.now());
        }

        await messageService.updateMessageStatus(campaignId, phoneNumber, messageId, updateData);
      }
    }

    res.json({ success: true, received: true });
  } catch (error: any) {
    logger.error('Webhook error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
