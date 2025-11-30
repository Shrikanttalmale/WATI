import Queue from 'bull';
import messageService from './messageService';
import logger from '../utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export class QueueService {
  private messageQueue: Queue.Queue;
  private campaignQueue: Queue.Queue;

  constructor() {
    this.messageQueue = new Queue('messages', redisUrl);
    this.campaignQueue = new Queue('campaigns', redisUrl);
    this.setupProcessors();
  }

  private setupProcessors() {
    this.messageQueue.process(async (job) => {
      const { userId, phoneNumber, message, campaignId } = job.data;

      try {
        const result = await messageService.sendMessage(userId, phoneNumber, message, campaignId);

        if (!result.success) {
          if (job.attemptsMade < job.opts.attempts) {
            throw new Error(result.error);
          }
        }

        return result;
      } catch (error) {
        logger.error('Queue message processing failed', {
          jobId: job.id,
          attempt: job.attemptsMade + 1,
          error,
        });
        throw error;
      }
    });

    this.messageQueue.on('completed', (job) => {
      logger.info('Message job completed', { jobId: job.id });
    });

    this.messageQueue.on('failed', (job, error) => {
      logger.error('Message job failed', { jobId: job.id, error: error.message });
    });

    this.campaignQueue.process(async (job) => {
      const { campaignId, userId, delayMs } = job.data;

      try {
        const result = await messageService.sendCampaignMessages(campaignId, userId, delayMs);
        return result;
      } catch (error) {
        logger.error('Campaign job failed', { jobId: job.id, campaignId, error });
        throw error;
      }
    });

    this.campaignQueue.on('progress', (job, progress) => {
      logger.info('Campaign job progress', { jobId: job.id, progress: \`\${progress}%\` });
    });
  }

  async addMessage(userId: string, phoneNumber: string, message: string, campaignId?: string) {
    try {
      const job = await this.messageQueue.add(
        { userId, phoneNumber, message, campaignId },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
        }
      );

      logger.info('Message added to queue', { jobId: job.id, userId, phoneNumber });
      return { jobId: job.id, success: true };
    } catch (error) {
      logger.error('Failed to add message to queue', { error, userId, phoneNumber });
      throw error;
    }
  }

  async addCampaign(campaignId: string, userId: string, delayMs: number = 5000) {
    try {
      const job = await this.campaignQueue.add(
        { campaignId, userId, delayMs },
        {
          priority: 1,
          removeOnComplete: true,
        }
      );

      logger.info('Campaign added to queue', { jobId: job.id, campaignId });
      return { jobId: job.id, success: true };
    } catch (error) {
      logger.error('Failed to add campaign to queue', { error, campaignId });
      throw error;
    }
  }

  async getJobStatus(jobId: string) {
    try {
      const job = await this.messageQueue.getJob(jobId);
      if (!job) {
        return null;
      }

      return {
        id: job.id,
        status: await job.getState(),
        progress: job.progress(),
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts,
      };
    } catch (error) {
      logger.error('Get job status failed', { error, jobId });
      throw error;
    }
  }

  async getQueueStats() {
    try {
      const messageStats = await this.messageQueue.getJobCounts();
      const campaignStats = await this.campaignQueue.getJobCounts();

      return {
        messages: messageStats,
        campaigns: campaignStats,
      };
    } catch (error) {
      logger.error('Get queue stats failed', { error });
      throw error;
    }
  }

  async clearQueue() {
    try {
      await this.messageQueue.clean(0, 'completed');
      await this.campaignQueue.clean(0, 'completed');
      logger.info('Queue cleaned');
      return { success: true };
    } catch (error) {
      logger.error('Clear queue failed', { error });
      throw error;
    }
  }
}

export default new QueueService();
