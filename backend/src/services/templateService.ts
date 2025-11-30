import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class TemplateService {
  async createTemplate(userId: string, name: string, content: string, category?: string) {
    try {
      const template = await prisma.template.create({
        data: {
          userId,
          name,
          content,
          category: category || 'promotional',
        },
      });
      logger.info('Template created', { templateId: template.id, userId });
      return template;
    } catch (error) {
      logger.error('Template creation failed', { error, userId, name });
      throw error;
    }
  }

  async getTemplates(userId: string, limit: number = 20, offset: number = 0) {
    try {
      const templates = await prisma.template.findMany({
        where: { userId },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });
      const total = await prisma.template.count({ where: { userId } });
      return { templates, total };
    } catch (error) {
      logger.error('Get templates failed', { error, userId });
      throw error;
    }
  }

  async getTemplate(templateId: string, userId: string) {
    try {
      const template = await prisma.template.findUnique({ where: { id: templateId } });
      if (!template || template.userId !== userId) throw new Error('Template not found');
      return template;
    } catch (error) {
      logger.error('Get template failed', { error, templateId });
      throw error;
    }
  }

  async updateTemplate(templateId: string, userId: string, name?: string, content?: string, category?: string) {
    try {
      const template = await prisma.template.findUnique({ where: { id: templateId } });
      if (!template || template.userId !== userId) throw new Error('Template not found');
      const updated = await prisma.template.update({
        where: { id: templateId },
        data: { name: name || template.name, content: content || template.content, category: category || template.category },
      });
      logger.info('Template updated', { templateId });
      return updated;
    } catch (error) {
      logger.error('Update template failed', { error, templateId });
      throw error;
    }
  }

  async deleteTemplate(templateId: string, userId: string) {
    try {
      const template = await prisma.template.findUnique({ where: { id: templateId } });
      if (!template || template.userId !== userId) throw new Error('Template not found');
      await prisma.template.delete({ where: { id: templateId } });
      logger.info('Template deleted', { templateId });
      return { success: true };
    } catch (error) {
      logger.error('Delete template failed', { error, templateId });
      throw error;
    }
  }

  async getTemplatesByCategory(userId: string, category: string) {
    try {
      const templates = await prisma.template.findMany({
        where: { userId, category },
        orderBy: { createdAt: 'desc' },
      });
      return templates;
    } catch (error) {
      logger.error('Get templates by category failed', { error, userId, category });
      throw error;
    }
  }

  async duplicateTemplate(templateId: string, userId: string, newName?: string) {
    try {
      const original = await prisma.template.findUnique({ where: { id: templateId } });
      if (!original || original.userId !== userId) throw new Error('Template not found');
      const duplicated = await prisma.template.create({
        data: {
          userId,
          name: newName || \ (Copy),
          content: original.content,
          category: original.category,
        },
      });
      logger.info('Template duplicated', { originalId: templateId, newId: duplicated.id });
      return duplicated;
    } catch (error) {
      logger.error('Duplicate template failed', { error, templateId });
      throw error;
    }
  }
}

export default new TemplateService();
