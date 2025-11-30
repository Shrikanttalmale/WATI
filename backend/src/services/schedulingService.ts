import cron from 'node-cron';
import logger from '../utils/logger';
import messageService from './messageService';
import queueService from './queueService';

export class SchedulingService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  // Schedule campaign send (cron expression or immediate)
  async scheduleCampaignSend(
    campaignId: string,
    scheduleTime: Date | null,
    messages: any[]
  ): Promise<string> {
    try {
      if (!scheduleTime || scheduleTime <= new Date()) {
        // Send immediately
        logger.info('Sending campaign immediately', { campaignId, messageCount: messages.length });
        await this.processCampaignMessages(campaignId, messages);
        return 'sent_immediately';
      }

      // Schedule for later
      const jobId = `campaign_${campaignId}`;
      const cronExpression = this.generateCronExpression(scheduleTime);

      const task = cron.schedule(cronExpression, async () => {
        logger.info('Executing scheduled campaign', { campaignId });
        await this.processCampaignMessages(campaignId, messages);
        task.stop();
        this.jobs.delete(jobId);
      });

      this.jobs.set(jobId, task);
      logger.info('Campaign scheduled', { campaignId, scheduleTime, jobId });

      return jobId;
    } catch (error) {
      logger.error('Schedule campaign send failed', { error, campaignId });
      throw error;
    }
  }

  // Schedule hourly retry of failed messages
  startRetryScheduler(): void {
    try {
      const task = cron.schedule('0 * * * *', async () => {
        logger.info('Running hourly retry scheduler');
        await queueService.retryFailedMessages(50);
      });

      this.jobs.set('retry_scheduler', task);
      logger.info('Retry scheduler started');
    } catch (error) {
      logger.error('Start retry scheduler failed', { error });
      throw error;
    }
  }

  // Schedule queue processor (every 5 minutes)
  startQueueProcessor(): void {
    try {
      const task = cron.schedule('*/5 * * * *', async () => {
        logger.info('Running queue processor');
        const pendingMessages = await messageService.getMessagesByStatus('pending', 500);
        
        for (const msg of pendingMessages) {
          await queueService.addJobToQueue({
            messageId: msg.id,
            campaignId: msg.campaignId,
            userId: msg.campaign.userId,
            recipientPhone: msg.recipientPhone,
            recipientName: msg.recipientName || '',
            messageBody: msg.messageBody,
            delayType: msg.campaign.delayType,
            deliveryMethod: (msg.deliveryMethod as any) || 'baileys',
            attempt: msg.retryCount,
          });
        }
      });

      this.jobs.set('queue_processor', task);
      logger.info('Queue processor started');
    } catch (error) {
      logger.error('Start queue processor failed', { error });
      throw error;
    }
  }

  // Stop a scheduled job
  stopJob(jobId: string): boolean {
    try {
      const task = this.jobs.get(jobId);
      if (task) {
        task.stop();
        this.jobs.delete(jobId);
        logger.info('Job stopped', { jobId });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Stop job failed', { error, jobId });
      return false;
    }
  }

  // Stop all jobs
  stopAllJobs(): void {
    try {
      for (const [jobId, task] of this.jobs) {
        task.stop();
        this.jobs.delete(jobId);
      }
      logger.info('All jobs stopped');
    } catch (error) {
      logger.error('Stop all jobs failed', { error });
    }
  }

  private async processCampaignMessages(campaignId: string, messages: any[]): Promise<void> {
    try {
      logger.info('Processing campaign messages', { campaignId, count: messages.length });

      for (const msg of messages) {
        await queueService.addJobToQueue({
          messageId: msg.id,
          campaignId,
          userId: msg.campaign.userId,
          recipientPhone: msg.recipientPhone,
          recipientName: msg.recipientName || '',
          messageBody: msg.messageBody,
          delayType: msg.campaign.delayType,
          deliveryMethod: 'baileys',
          attempt: 0,
        });
      }

      await messageService.updateCampaignStats(campaignId);
    } catch (error) {
      logger.error('Process campaign messages failed', { error, campaignId });
      throw error;
    }
  }

  private generateCronExpression(date: Date): string {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;

    return `${minute} ${hour} ${dayOfMonth} ${month} *`;
  }

  getScheduledJobs(): string[] {
    return Array.from(this.jobs.keys());
  }
}

export default new SchedulingService();
