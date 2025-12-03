import { PrismaClient } from '@prisma/client';
import baileysService from './baileysService';
import logger from '../utils/logger';
import { getPrismaClient } from '../utils/prismaClient';

const prisma = getPrismaClient();

export class DeliveryPollingService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly POLL_INTERVAL = 30000; // 30 seconds

  startPolling() {
    if (this.pollingInterval) {
      logger.info('Delivery polling already running');
      return;
    }

    logger.info('Starting delivery polling service');
    this.pollingInterval = setInterval(() => this.pollDeliveryStatus(), this.POLL_INTERVAL);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      logger.info('Delivery polling service stopped');
    }
  }

  private async pollDeliveryStatus() {
    try {
      // Get pending messages from last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const pendingMessages = await prisma.message.findMany({
        where: {
          status: 'sent',
          sentAt: { gte: oneDayAgo },
        },
        include: { campaign: true },
        take: 100, // Process in batches
      });

      logger.debug('Polling delivery status', { count: pendingMessages.length });

      for (const message of pendingMessages) {
        try {
          // In production, check actual delivery status from WhatsApp API
          // For now, mark old messages as delivered
          const hoursOld = (Date.now() - (message.sentAt?.getTime() || 0)) / (1000 * 60 * 60);
          
          if (hoursOld > 1) {
            // Messages older than 1 hour are assumed delivered
            await prisma.message.update({
              where: { id: message.id },
              data: {
                status: 'delivered',
                deliveredAt: new Date(),
              },
            });

            // ISSUE #6 FIX: Sync denormalized campaign stats from actual Message table
            // Query all messages for this campaign and compute accurate counts
            const allMessages = await prisma.message.findMany({
              where: { campaignId: message.campaignId },
              select: { status: true },
            });

            const statsCounts = {
              sent: 0,
              delivered: 0,
              failed: 0,
              bounced: 0,
              pending: 0,
            };

            allMessages.forEach((msg: any) => {
              if (msg.status in statsCounts) {
                (statsCounts as any)[msg.status]++;
              }
            });

            // Update campaign denormalized fields with accurate counts
            await prisma.campaign.update({
              where: { id: message.campaignId },
              data: {
                deliveredCount: statsCounts.delivered,
                sentCount: statsCounts.sent,
                failedCount: statsCounts.failed + statsCounts.bounced,
              },
            });
          }
        } catch (error) {
          logger.warn('Failed to poll message delivery', { messageId: message.id, error });
        }
      }
    } catch (error) {
      logger.error('Delivery polling failed', { error });
    }
  }
}

export default new DeliveryPollingService();
