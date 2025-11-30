import { Router, Request, Response } from 'express';
import messageService from '../services/messageService';
import queueService from '../services/queueService';
import { authMiddleware } from '../middleware/authMiddleware';
import logger from '../utils/logger';

const router = Router();

// Send pending messages (trigger queue processing)
router.post('/process-queue', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // Get all pending messages for this user''s campaigns
    const pendingMessages = await messageService.getMessagesByStatus('pending', 1000);
    const userMessages = pendingMessages.filter((msg) => msg.campaign.userId === req.user.userId);

    logger.info('Processing queue for user', { userId: req.user.userId, messageCount: userMessages.length });

    // Process each message
    for (const msg of userMessages) {
      await queueService.addJobToQueue({
        messageId: msg.id,
        campaignId: msg.campaignId,
        userId: msg.campaign.userId,
        recipientPhone: msg.recipientPhone,
        recipientName: msg.recipientName || '',
        messageBody: msg.messageBody,
        delayType: msg.campaign.delayType,
        deliveryMethod: (msg.deliveryMethod as any) || 'baileys',
        attempt: msg.retryCount,
      });
    }

    const stats = queueService.getQueueStats();
    res.status(200).json({
      success: true,
      data: {
        messagesProcessed: userMessages.length,
        ...stats,
      },
    });
  } catch (error: any) {
    logger.error('Process queue error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get message stats for a campaign
router.get('/campaign/:campaignId/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const stats = await messageService.getMessageStats(req.params.campaignId);
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

    await queueService.retryFailedMessages(10);
    const stats = queueService.getQueueStats();

    res.status(200).json({
      success: true,
      data: {
        message: 'Failed messages scheduled for retry',
        ...stats,
      },
    });
  } catch (error: any) {
    logger.error('Retry failed messages error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get queue stats
router.get('/queue-stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const stats = queueService.getQueueStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Get queue stats error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
