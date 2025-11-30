import { Router, Request, Response } from 'express';
import campaignService from '../services/campaignService';
import { authMiddleware } from '../middleware/authMiddleware';
import logger from '../utils/logger';

const router = Router();

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { name, messageBody, delayType } = req.body;
    const campaign = await campaignService.createCampaign(req.user.userId, name, messageBody, delayType);
    res.status(201).json({ success: true, data: campaign });
  } catch (error: any) {
    logger.error('Create campaign error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await campaignService.getCampaigns(req.user.userId, limit, (page - 1) * limit);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Get campaigns error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const campaign = await campaignService.getCampaign(req.params.id, req.user.userId);
    res.status(200).json({ success: true, data: campaign });
  } catch (error: any) {
    logger.error('Get campaign error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/:id/contacts', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { contacts } = req.body;
    const result = await campaignService.addContacts(req.params.id, req.user.userId, contacts);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Add contacts error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/:id/send', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const result = await campaignService.sendCampaign(req.params.id, req.user.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Send campaign error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/:id/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const stats = await campaignService.getCampaignStats(req.params.id, req.user.userId);
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Get stats error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const result = await campaignService.deleteCampaign(req.params.id, req.user.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Delete campaign error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
