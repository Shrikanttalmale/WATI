import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import queueService from './queueService';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class ScheduleService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  async scheduleCampaign(campaignId: string, scheduledTime: Date) {
    try {
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const cronExpression = this.dateToCron(scheduledTime);
      const task = cron.schedule(cronExpression, async () => {
        logger.info('Running scheduled campaign', { campaignId });
        try {
          await queueService.addCampaign(campaignId, campaign.userId, 5000);
        } catch (error) {
          logger.error('Failed to queue scheduled campaign', { campaignId, error });
        }
      });

      this.jobs.set(campaignId, task);
      logger.info('Campaign scheduled', { campaignId, scheduledTime });

      return { success: true, campaignId, scheduledTime };
    } catch (error) {
      logger.error('Schedule campaign failed', { error, campaignId });
      throw error;
    }
  }

  async cancelSchedule(campaignId: string) {
    try {
      const task = this.jobs.get(campaignId);
      if (task) {
        task.stop();
        this.jobs.delete(campaignId);
        logger.info('Campaign schedule cancelled', { campaignId });
      }
      return { success: true };
    } catch (error) {
      logger.error('Cancel schedule failed', { error, campaignId });
      throw error;
    }
  }

  async getScheduledCampaigns(userId: string) {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: {
          userId,
          status: 'scheduled',
          scheduledFor: { not: null },
        },
        select: {
          id: true,
          name: true,
          scheduledFor: true,
          status: true,
        },
      });

      return campaigns;
    } catch (error) {
      logger.error('Get scheduled campaigns failed', { error, userId });
      throw error;
    }
  }

  private dateToCron(date: Date): string {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  }
}

export default new ScheduleService();
