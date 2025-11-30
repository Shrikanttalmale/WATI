import { Router, Request, Response } from 'express';
import messageService from '../services/messageService';
import queueService from '../services/queueService';
import scheduleService from '../services/scheduleService';
import { authMiddleware } from '../middleware/authMiddleware';
import logger from '../utils/logger';

const router = Router();

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

export default router;
