import express, { Request, Response } from 'express';
import { authMiddleware as verifyAuth } from '../middleware/authMiddleware';
import templateService from '../services/templateService';
import logger from '../utils/logger';

const router = express.Router();

// POST /api/templates - Create template
router.post('/', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { name, content, category } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content required' });
    }

    const template = await templateService.createTemplate(req.user.userId, name, content, category);
    res.json({ success: true, template });
  } catch (error) {
    logger.error('Create template failed', { error });
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// GET /api/templates - List templates
router.get('/', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await templateService.getTemplates(req.user.userId, limit, offset);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Get templates failed', { error });
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// GET /api/templates/:id - Get template
router.get('/:id', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const template = await templateService.getTemplate(req.params.id, req.user.userId);
    res.json({ success: true, template });
  } catch (error) {
    logger.error('Get template failed', { error });
    res.status(404).json({ error: 'Template not found' });
  }
});

// PUT /api/templates/:id - Update template
router.put('/:id', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { name, content, category } = req.body;
    const updated = await templateService.updateTemplate(req.params.id, req.user.userId, name, content, category);
    res.json({ success: true, template: updated });
  } catch (error) {
    logger.error('Update template failed', { error });
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// DELETE /api/templates/:id - Delete template
router.delete('/:id', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await templateService.deleteTemplate(req.params.id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete template failed', { error });
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// GET /api/templates/category/:category - Get templates by category
router.get('/category/:category', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const templates = await templateService.getTemplatesByCategory(req.user.userId, req.params.category);
    res.json({ success: true, templates });
  } catch (error) {
    logger.error('Get templates by category failed', { error });
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// POST /api/templates/:id/duplicate - Duplicate template
router.post('/:id/duplicate', verifyAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { name } = req.body;
    const duplicated = await templateService.duplicateTemplate(req.params.id, req.user.userId, name);
    res.json({ success: true, template: duplicated });
  } catch (error) {
    logger.error('Duplicate template failed', { error });
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

export default router;
