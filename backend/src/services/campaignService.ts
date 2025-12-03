import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { getPrismaClient } from '../utils/prismaClient';

const prisma = getPrismaClient();

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

      // ISSUE #10 FIX: Check for user-wide phone uniqueness, not just per campaign
      const userPhones = await prisma.contact.findMany({
        where: { userId },
        select: { phone: true },
      });
      const existingUserPhones = new Set(userPhones.map(c => c.phone));

      // Validate contacts
      const validatedContacts = [];
      let userWideDuplicates = 0;

      for (const c of contacts) {
        // Validate phone number
        if (!c.phone || typeof c.phone !== 'string') {
          logger.warn('Invalid phone in contact', { campaignId, contact: c });
          continue;
        }

        const phoneClean = c.phone.replace(/\D/g, '');
        if (phoneClean.length < 10) {
          logger.warn('Phone number too short', { campaignId, phone: c.phone });
          continue;
        }

        // ISSUE #10 FIX: Skip if phone already exists in ANY campaign for this user
        if (existingUserPhones.has(phoneClean)) {
          logger.warn('Phone already exists in another campaign for user', {
            campaignId,
            phone: phoneClean,
            userId,
          });
          userWideDuplicates++;
          continue;
        }

        // Validate metadata is valid JSON if provided
        if (c.metadata && typeof c.metadata === 'string') {
          try {
            JSON.parse(c.metadata);
          } catch {
            logger.warn('Invalid JSON metadata', { campaignId, phone: c.phone });
            continue;
          }
        }

        validatedContacts.push({
          campaignId,
          userId,
          phone: phoneClean,
          name: c.name || null,
          metadata: c.metadata ? JSON.stringify(c.metadata) : null,
          tags: c.tags || [],
        });

        // Add to checked set to prevent duplicates within this batch
        existingUserPhones.add(phoneClean);
      }

      if (validatedContacts.length === 0) {
        throw new Error('No valid contacts to add');
      }

      const createdContacts = await prisma.contact.createMany({
        data: validatedContacts,
        skipDuplicates: true,
      });

      // Verify count matches or warn about duplicates
      if (createdContacts.count < validatedContacts.length) {
        logger.warn('Some contacts were duplicates within campaign', {
          campaignId,
          requested: validatedContacts.length,
          created: createdContacts.count,
        });
      }

      if (userWideDuplicates > 0) {
        logger.info('Contacts skipped due to user-wide uniqueness check', {
          campaignId,
          userId,
          duplicateCount: userWideDuplicates,
        });
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { totalContacts: { increment: createdContacts.count } },
      });

      logger.info('Contacts added', {
        campaignId,
        count: createdContacts.count,
        validated: validatedContacts.length,
        userWideDuplicates,
      });

      return {
        count: createdContacts.count,
        validated: validatedContacts.length,
        userWideDuplicates,
      };
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

      // Aggregate actual stats from Message table for accuracy
      const messages = await prisma.message.groupBy({
        by: ['status'],
        where: { campaignId },
        _count: { id: true },
      });

      const stats: any = { pending: 0, sent: 0, delivered: 0, failed: 0, bounced: 0 };
      messages.forEach((msg: any) => {
        stats[msg.status] = msg._count.id;
      });

      const total = campaign.totalContacts || 1;
      return {
        totalContacts: campaign.totalContacts,
        sentCount: stats.sent,
        deliveredCount: stats.delivered,
        failedCount: stats.failed + stats.bounced,
        pendingCount: stats.pending,
        deliveryRate: (stats.sent + stats.delivered) > 0 ? ((stats.delivered / (stats.sent + stats.delivered)) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      logger.error('Get campaign stats failed', { error, campaignId });
      throw error;
    }
  }
}

export default new CampaignService();
