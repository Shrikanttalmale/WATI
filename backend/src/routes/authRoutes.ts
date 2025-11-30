import { Router, Request, Response } from 'express';
import authService from '../services/authService';
import { authMiddleware } from '../middleware/authMiddleware';
import logger from '../utils/logger';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      });
    }

    const result = await authService.registerUser(email, password, name);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Signup error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const result = await authService.loginUser(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Login error', { error: error.message });
    res.status(401).json({ success: false, error: error.message });
  }
});

router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const user = await authService.getUser(req.user.userId);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    logger.error('Profile error', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
