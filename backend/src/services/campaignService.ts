import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class CampaignService {
  async createCampaign(userId: string, name: string, messageBody: string, delayType: string = 'balanced') {
    try {
      const campaign = await prisma.campaign.create({
        data: {
          userId,
          name,
          messageBody,
          delayType,
          status: 'draft',
        },
      });

      logger.info('Campaign created', { campaignId: campaign.id, userId });
      return campaign;
    } catch (error) {
      logger.error('Campaign creation failed', { error, userId, name });
      throw error;
    }
  }

  async getCampaigns(userId: string, limit: number = 10, offset: number = 0) {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: { userId },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.campaign.count({ where: { userId } });
      return { campaigns, total };
    } catch (error) {
      logger.error('Get campaigns failed', { error, userId });
      throw error;
    }
  }

  async getCampaign(campaignId: string, userId: string) {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          contacts: true,
          messages: { take: 10 },
        },
      });

      if (!campaign || campaign.userId !== userId) {
        throw new Error('Campaign not found');
      }

      return campaign;
    } catch (error) {
      logger.error('Get campaign failed', { error, campaignId, userId });
      throw error;
    }
  }

  async addContacts(campaignId: string, userId: string, contacts: any[]) {
    try {
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign || campaign.userId !== userId) {
        throw new Error('Campaign not found');
      }

      const createdContacts = await prisma.contact.createMany({
        data: contacts.map((c) => ({
          campaignId,
          userId,
          phone: c.phone,
          name: c.name,
          metadata: c.metadata ? JSON.stringify(c.metadata) : null,
          tags: c.tags || [],
        })),
        skipDuplicates: true,
      });

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { totalContacts: { increment: createdContacts.count } },
      });

      logger.info('Contacts added', { campaignId, count: createdContacts.count });
      return { count: createdContacts.count };
    } catch (error) {
      logger.error('Add contacts failed', { error, campaignId });
      throw error;
    }
  }

  async sendCampaign(campaignId: string, userId: string) {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { contacts: true },
      });

      if (!campaign || campaign.userId !== userId) {
        throw new Error('Campaign not found');
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'sending', startedAt: new Date() },
      });

      logger.info('Campaign sending started', { campaignId, contactCount: campaign.contacts.length });
      return { status: 'sending', contactCount: campaign.contacts.length };
    } catch (error) {
      logger.error('Send campaign failed', { error, campaignId });
      throw error;
    }
  }

  async deleteCampaign(campaignId: string, userId: string) {
    try {
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign || campaign.userId !== userId) {
        throw new Error('Campaign not found');
      }

      await prisma.campaign.delete({ where: { id: campaignId } });
      logger.info('Campaign deleted', { campaignId });
      return { success: true };
    } catch (error) {
      logger.error('Delete campaign failed', { error, campaignId });
      throw error;
    }
  }

  async getCampaignStats(campaignId: string, userId: string) {
    try {
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign || campaign.userId !== userId) {
        throw new Error('Campaign not found');
      }

      const total = campaign.totalContacts || 1;
      return {
        totalContacts: campaign.totalContacts,
        sentCount: campaign.sentCount,
        deliveredCount: campaign.deliveredCount,
        failedCount: campaign.failedCount,
        pendingCount: total - campaign.sentCount,
        deliveryRate: total > 0 ? ((campaign.deliveredCount / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      logger.error('Get campaign stats failed', { error, campaignId });
      throw error;
    }
  }
}

export default new CampaignService();
