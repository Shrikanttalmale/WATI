import express, { Request, Response } from 'express';
import { authMiddleware as verifyAuth } from '../middleware/authMiddleware';
import adminService from '../services/adminService';
import logger from '../utils/logger';

const router = express.Router();

// Middleware to check admin privileges
const checkAdmin = async (req: Request, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const isAdmin = await adminService.isAdmin(req.user.userId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
  } catch (error) {
    logger.error('Admin authorization check failed', { error });
    res.status(500).json({ success: false, error: 'Authorization check failed' });
  }
};

// GET /api/admin/dashboard - System dashboard
router.get('/dashboard', verifyAuth, checkAdmin, async (req: Request, res: Response) => {
  try {
    const dashboard = await adminService.getDashboard();
    res.json({ success: true, data: dashboard });
  } catch (error) {
    logger.error('Get admin dashboard failed', { error });
    res.status(500).json({ success: false, error: 'Failed to get dashboard' });
  }
});

// GET /api/admin/users - List all users
router.get('/users', verifyAuth, checkAdmin, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await adminService.getAllUsers(limit, offset);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Get users failed', { error });
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', verifyAuth, checkAdmin, async (req: Request, res: Response) => {
  try {
    const result = await adminService.getUserDetails(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Get user failed', { error });
    res.status(404).json({ success: false, error: 'User not found' });
  }
});

// POST /api/admin/users/:id/suspend - Suspend user
router.post('/users/:id/suspend', verifyAuth, checkAdmin, async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const user = await adminService.suspendUser(req.params.id, reason);
    res.json({ success: true });
  } catch (error) {
    logger.error('Suspend user failed', { error });
    res.status(500).json({ success: false, error: 'Failed to suspend user' });
  }
});

// POST /api/admin/users/:id/reactivate - Reactivate user
router.post('/users/:id/reactivate', verifyAuth, checkAdmin, async (req: Request, res: Response) => {
  try {
    const user = await adminService.reactivateUser(req.params.id);
    res.json({ success: true });
  } catch (error) {
    logger.error('Reactivate user failed', { error });
    res.status(500).json({ success: false, error: 'Failed to reactivate user' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', verifyAuth, checkAdmin, async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    await adminService.deleteUser(req.params.id, reason);
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete user failed', { error });
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// GET /api/admin/actions - Get admin actions log
router.get('/actions', verifyAuth, checkAdmin, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const actions = await adminService.getAdminActionsLog(limit);
    res.json({ success: true, actions });
  } catch (error) {
    logger.error('Get admin actions failed', { error });
    res.status(500).json({ error: 'Failed to get actions' });
  }
});

export default router;
