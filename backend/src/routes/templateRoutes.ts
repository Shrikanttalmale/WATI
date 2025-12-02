import express, { Request, Response } from 'express';
import { authMiddleware as verifyAuth } from '../middleware/authMiddleware';
import templateService from '../services/templateService';
import logger from '../utils/logger';

const router = express.Router();

// POST /api/templates - Create template
router.post('/', verifyAuth, async (req: Request, res: Response) => {
  try {
    const { name, content, category } = req.body;
    const userId = (req as any).userId;

    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content required' });
    }

    const template = await templateService.createTemplate(userId, name, content, category);
    res.json({ success: true, template });
  } catch (error) {
    logger.error('Create template failed', { error });
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// GET /api/templates - List templates
router.get('/', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await templateService.getTemplates(userId, limit, offset);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Get templates failed', { error });
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// GET /api/templates/:id - Get template
router.get('/:id', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const template = await templateService.getTemplate(req.params.id, userId);
    res.json({ success: true, template });
  } catch (error) {
    logger.error('Get template failed', { error });
    res.status(404).json({ error: 'Template not found' });
  }
});

// PUT /api/templates/:id - Update template
router.put('/:id', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, content, category } = req.body;
    const updated = await templateService.updateTemplate(req.params.id, userId, name, content, category);
    res.json({ success: true, template: updated });
  } catch (error) {
    logger.error('Update template failed', { error });
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// DELETE /api/templates/:id - Delete template
router.delete('/:id', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await templateService.deleteTemplate(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete template failed', { error });
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// GET /api/templates/category/:category - Get templates by category
router.get('/category/:category', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const templates = await templateService.getTemplatesByCategory(userId, req.params.category);
    res.json({ success: true, templates });
  } catch (error) {
    logger.error('Get templates by category failed', { error });
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// POST /api/templates/:id/duplicate - Duplicate template
router.post('/:id/duplicate', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name } = req.body;
    const duplicated = await templateService.duplicateTemplate(req.params.id, userId, name);
    res.json({ success: true, template: duplicated });
  } catch (error) {
    logger.error('Duplicate template failed', { error });
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

export default router;
