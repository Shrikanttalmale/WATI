import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class MessageService {
  async createMessage(
    campaignId: string,
    recipientPhone: string,
    recipientName: string,
    messageBody: string
  ) {
    try {
      const message = await prisma.message.create({
        data: {
          campaignId,
          recipientPhone,
          recipientName,
          messageBody,
          status: 'pending',
          deliveryMethod: 'baileys',
          maxRetries: 3,
          retryCount: 0,
        },
      });

      logger.info('Message created', { messageId: message.id, recipientPhone });
      return message;
    } catch (error) {
      logger.error('Create message failed', { error, campaignId });
      throw error;
    }
  }

  async getMessagesByStatus(status: string, limit: number = 100) {
    try {
      const messages = await prisma.message.findMany({
        where: { status },
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          campaign: {
            select: { userId: true, delayType: true },
          },
        },
      });

      return messages;
    } catch (error) {
      logger.error('Get messages by status failed', { error });
      throw error;
    }
  }

  async updateMessageStatus(
    messageId: string,
    status: string,
    deliveryMethod: string = 'baileys',
    failedReason?: string
  ) {
    try {
      const updateData: any = {
        status,
        deliveryMethod,
        updatedAt: new Date(),
      };

      if (status === 'sent') {
        updateData.sentAt = new Date();
      } else if (status === 'delivered') {
        updateData.deliveredAt = new Date();
      } else if (status === 'failed') {
        updateData.failedAt = new Date();
        if (failedReason) updateData.failedReason = failedReason;
      }

      const message = await prisma.message.update({
        where: { id: messageId },
        data: updateData,
      });

      logger.info('Message status updated', { messageId, status });
      return message;
    } catch (error) {
      logger.error('Update message status failed', { error, messageId });
      throw error;
    }
  }

  async retryMessage(messageId: string) {
    try {
      const message = await prisma.message.findUnique({ where: { id: messageId } });

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.retryCount >= message.maxRetries) {
        await this.updateMessageStatus(messageId, 'failed', message.deliveryMethod, 'Max retries exceeded');
        return null;
      }

      // Switch delivery method on retry
      const newDeliveryMethod = message.deliveryMethod === 'baileys' ? 'web-js' : 'baileys';

      const updated = await prisma.message.update({
        where: { id: messageId },
        data: {
          status: 'pending',
          retryCount: { increment: 1 },
          deliveryMethod: newDeliveryMethod,
          updatedAt: new Date(),
        },
      });

      logger.info('Message retry initiated', { messageId, retryCount: updated.retryCount, newMethod: newDeliveryMethod });
      return updated;
    } catch (error) {
      logger.error('Retry message failed', { error, messageId });
      throw error;
    }
  }

  async updateCampaignStats(campaignId: string) {
    try {
      const messages = await prisma.message.findMany({
        where: { campaignId },
      });

      const stats = {
        sentCount: messages.filter((m) => m.status === 'sent' || m.status === 'delivered').length,
        deliveredCount: messages.filter((m) => m.status === 'delivered').length,
        failedCount: messages.filter((m) => m.status === 'failed').length,
      };

      const campaign = await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          sentCount: stats.sentCount,
          deliveredCount: stats.deliveredCount,
          failedCount: stats.failedCount,
        },
      });

      logger.info('Campaign stats updated', { campaignId, ...stats });
      return campaign;
    } catch (error) {
      logger.error('Update campaign stats failed', { error, campaignId });
      throw error;
    }
  }

  async getMessageStats(campaignId: string) {
    try {
      const messages = await prisma.message.findMany({
        where: { campaignId },
      });

      return {
        total: messages.length,
        pending: messages.filter((m) => m.status === 'pending').length,
        sent: messages.filter((m) => m.status === 'sent').length,
        delivered: messages.filter((m) => m.status === 'delivered').length,
        failed: messages.filter((m) => m.status === 'failed').length,
        successRate: messages.length > 0 ? ((messages.filter((m) => m.status === 'delivered').length / messages.length) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      logger.error('Get message stats failed', { error, campaignId });
      throw error;
    }
  }
}

export default new MessageService();
