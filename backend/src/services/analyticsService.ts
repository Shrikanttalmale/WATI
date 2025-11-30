import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class AnalyticsService {
  // Get message-level analytics
  async getMessageAnalytics(campaignId: string, userId: string) {
    try {
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign || campaign.userId !== userId) throw new Error('Campaign not found');

      const messages = await prisma.message.groupBy({
        by: ['status', 'deliveryMethod'],
        where: { campaignId },
        _count: { id: true },
      });

      return { campaignId, messageStats: messages };
    } catch (error) {
      logger.error('Get message analytics failed', { error, campaignId });
      throw error;
    }
  }

  // Get delivery analytics dashboard
  async getDeliveryDashboard(userId: string) {
    try {
      const campaigns = await prisma.campaign.findMany({ where: { userId } });
      
      const stats = await Promise.all(campaigns.map(async (c) => {
        const messages = await prisma.message.groupBy({
          by: ['status'],
          where: { campaignId: c.id },
          _count: { id: true },
        });
        return { campaignId: c.id, campaignName: c.name, messageStats: messages };
      }));

      const totalCampaigns = campaigns.length;
      const totalMessages = campaigns.reduce((sum, c) => sum + c.totalContacts, 0);
      const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
      const totalDelivered = campaigns.reduce((sum, c) => sum + c.deliveredCount, 0);

      return {
        totalCampaigns,
        totalMessages,
        totalSent,
        totalDelivered,
        campaignStats: stats,
        overallDeliveryRate: totalMessages > 0 ? ((totalDelivered / totalMessages) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      logger.error('Get delivery dashboard failed', { error, userId });
      throw error;
    }
  }

  // Get analytics by date range
  async getAnalyticsByDateRange(userId: string, startDate: Date, endDate: Date) {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
      });

      const totalContacts = campaigns.reduce((sum, c) => sum + c.totalContacts, 0);
      const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
      const totalDelivered = campaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
      const totalFailed = campaigns.reduce((sum, c) => sum + c.failedCount, 0);

      return { totalCampaigns: campaigns.length, totalContacts, totalSent, totalDelivered, totalFailed };
    } catch (error) {
      logger.error('Get analytics by date range failed', { error, userId });
      throw error;
    }
  }

  // Get ban risk events
  async getBanRiskEvents(userId: string, limit: number = 10) {
    try {
      const events = await prisma.banRiskEvent.findMany({
        where: {
          user: { id: userId },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return events;
    } catch (error) {
      logger.error('Get ban risk events failed', { error, userId });
      throw error;
    }
  }

  // Log ban risk event
  async logBanRiskEvent(userId: string, reason: string, severity: string) {
    try {
      const event = await prisma.banRiskEvent.create({
        data: { userId, reason, severity },
      });
      logger.warn('Ban risk event logged', { userId, reason, severity });
      return event;
    } catch (error) {
      logger.error('Log ban risk event failed', { error, userId });
      throw error;
    }
  }

  // Check account safety score
  async getAccountSafetyScore(userId: string) {
    try {
      const events = await prisma.banRiskEvent.findMany({ where: { userId } });
      const campaigns = await prisma.campaign.count({ where: { userId } });
      const failedMessages = await prisma.message.count({
        where: { campaign: { userId }, status: 'failed' },
      });

      let score = 100;
      score -= events.length * 10;
      score -= failedMessages * 0.1;
      score = Math.max(0, Math.min(100, score));

      return { score, riskLevel: score > 80 ? 'low' : score > 50 ? 'medium' : 'high', details: { events: events.length, campaigns, failedMessages } };
    } catch (error) {
      logger.error('Get account safety score failed', { error, userId });
      throw error;
    }
  }
}

export default new AnalyticsService();
