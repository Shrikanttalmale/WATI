import { Router, Request, Response } from 'express';
import whatsappService from '../services/whatsappService';
import { authMiddleware } from '../middleware/authMiddleware';
import logger from '../utils/logger';

const router = Router();

router.get('/qr', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await whatsappService.generateQRCode(req.user.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Generate QR error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify-scan', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { sessionId } = req.body;
    const result = await whatsappService.verifyQRScan(req.user.userId, sessionId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Verify scan error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await whatsappService.getSessionStatus(req.user.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Get status error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
