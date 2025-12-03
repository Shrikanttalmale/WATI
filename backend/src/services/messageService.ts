import { PrismaClient } from '@prisma/client';
import baileysService from './baileysService';
import webJsService from './webJsService';
import logger from '../utils/logger';
import { getPrismaClient } from '../utils/prismaClient';

const prisma = getPrismaClient();

export class MessageService {
  async sendMessage(userId: string, phoneNumber: string, message: string, campaignId?: string) {
    let messageId = `msg_${Date.now()}`;
    let deliveryMethod = 'baileys';

    try {
      try {
        const result = await baileysService.sendMessage(userId, phoneNumber, message);
        messageId = result.messageId;
        deliveryMethod = 'baileys';

        if (campaignId) {
          await prisma.message.create({
            data: {
              campaignId,
              recipientPhone: phoneNumber,
              messageBody: message,
              deliveryMethod: 'baileys',
              status: 'sent',
              sentAt: new Date(),
            },
          });
        }

        logger.info('Message delivered via Baileys', { userId, phoneNumber, messageId });
        return { success: true, messageId, deliveryMethod: 'baileys' };
      } catch (baileysError) {
        logger.warn('Baileys failed, falling back to Web JS', { userId, phoneNumber, error: baileysError });

        const webJsResult = await webJsService.sendMessage(userId, phoneNumber, message);
        messageId = webJsResult.messageId;
        deliveryMethod = 'web-js';

        if (campaignId) {
          await prisma.message.create({
            data: {
              campaignId,
              recipientPhone: phoneNumber,
              messageBody: message,
              deliveryMethod: 'web-js',
              status: 'sent',
              sentAt: new Date(),
            },
          });
        }

        logger.info('Message delivered via Web JS fallback', { userId, phoneNumber, messageId });
        return { success: true, messageId, deliveryMethod: 'web-js' };
      }
    } catch (error) {
      logger.error('Message delivery failed completely', { error, userId, phoneNumber });

      if (campaignId) {
        await prisma.message.create({
          data: {
            campaignId,
            recipientPhone: phoneNumber,
            messageBody: message,
            status: 'failed',
            failedReason: error.message,
            failedAt: new Date(),
          },
        });
      }

      return { success: false, error: error.message };
    }
  }

  async sendCampaignMessages(campaignId: string, userId: string, delayMs: number = 5000) {
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

      let sentCount = 0;
      let failedCount = 0;

      for (const contact of campaign.contacts) {
        try {
          await this.sendMessage(userId, contact.phone, campaign.messageBody, campaignId);
          sentCount++;
        } catch (error) {
          failedCount++;
          logger.error('Campaign message failed', { campaignId, phone: contact.phone, error });
        }

        await this.delay(delayMs);
      }

      // Update campaign with accurate counts from message table
      const messages = await prisma.message.groupBy({
        by: ['status'],
        where: { campaignId },
        _count: { id: true },
      });

      const msgStats: any = {};
      messages.forEach((msg: any) => {
        msgStats[msg.status] = msg._count.id;
      });

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'sent',
          completedAt: new Date(),
          sentCount: msgStats.sent || 0,
          deliveredCount: msgStats.delivered || 0,
          failedCount: (msgStats.failed || 0) + (msgStats.bounced || 0),
        },
      });

      logger.info('Campaign completed', { campaignId, sentCount, failedCount });
      return { success: true, sentCount, failedCount };
    } catch (error) {
      logger.error('Send campaign messages failed', { error, campaignId });
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async updateMessageStatus(campaignId: string, phoneNumber: string, messageId: string, data: any) {
    try {
      const updated = await prisma.message.updateMany({
        where: {
          campaignId,
          recipientPhone: phoneNumber,
        },
        data,
      });

      logger.info('Message status updated', { campaignId, phoneNumber, messageId, data });

      // Update campaign stats if message delivered
      if (data.status === 'delivered') {
        const messages = await prisma.message.groupBy({
          by: ['status'],
          where: { campaignId },
          _count: { id: true },
        });

        const stats: any = { pending: 0, sent: 0, delivered: 0, failed: 0, bounced: 0 };
        messages.forEach((msg: any) => {
          stats[msg.status] = msg._count.id;
        });

        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            deliveredCount: stats.delivered,
            sentCount: stats.sent,
            failedCount: (stats.failed || 0) + (stats.bounced || 0),
          },
        });

        logger.info('Campaign stats updated', { campaignId, ...stats });
      }

      return updated;
    } catch (error) {
      logger.error('Update message status failed', { error, campaignId, phoneNumber, messageId });
      throw error;
    }
  }

  async getMessageStats(campaignId: string, userId: string) {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.userId !== userId) {
        throw new Error('Unauthorized: Campaign does not belong to this user');
      }

      // Get actual message counts from database
      const messages = await prisma.message.groupBy({
        by: ['status'],
        where: { campaignId },
        _count: { id: true },
      });

      const msgStats: any = { pending: 0, sent: 0, delivered: 0, failed: 0, bounced: 0 };
      messages.forEach((msg: any) => {
        msgStats[msg.status] = msg._count.id;
      });

      const stats = {
        total: campaign.totalContacts,
        sent: msgStats.sent,
        delivered: msgStats.delivered,
        failed: msgStats.failed + msgStats.bounced,
        pending: msgStats.pending,
      };

      return stats;
    } catch (error) {
      logger.error('Get message stats failed', { error, campaignId });
      throw error;
    }
  }
}

export default new MessageService();
