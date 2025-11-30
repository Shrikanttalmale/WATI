import { PrismaClient } from '@prisma/client';
import baileysService from './baileysService';
import webJsService from './webJsService';
import logger from '../utils/logger';

const prisma = new PrismaClient();

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

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'sent',
          completedAt: new Date(),
          sentCount,
          failedCount,
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

  async getMessageStats(campaignId: string, userId: string) {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign || campaign.userId !== userId) {
        throw new Error('Campaign not found');
      }

      const messages = await prisma.message.groupBy({
        by: ['status'],
        where: { campaignId },
        _count: true,
      });

      const stats = {
        total: campaign.totalContacts,
        sent: campaign.sentCount,
        delivered: campaign.deliveredCount,
        failed: campaign.failedCount,
        pending: campaign.totalContacts - campaign.sentCount,
      };

      return stats;
    } catch (error) {
      logger.error('Get message stats failed', { error, campaignId });
      throw error;
    }
  }
}

export default new MessageService();
