import Queue from 'bull';
import messageService from './messageService';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Redis configuration with fallback
const redisUrl = process.env.REDIS_URL;
const redisConfig = redisUrl 
  ? { url: redisUrl }
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };

export class QueueService {
  private messageQueue: Queue.Queue;
  private campaignQueue: Queue.Queue;
  private deadLetterQueue: Queue.Queue;

  constructor() {
    try {
      this.messageQueue = new Queue('messages', redisConfig);
      this.campaignQueue = new Queue('campaigns', redisConfig);
      this.deadLetterQueue = new Queue('dead-letter', redisConfig);

      this.setupProcessors();
      this.setupQueueEvents();
      logger.info('Queue service initialized with Redis connection');
    } catch (error) {
      logger.error('Failed to initialize queue service', { error });
      throw error;
    }
  }

  private setupQueueEvents() {
    // Message queue events
    this.messageQueue.on('error', (error) => {
      logger.error('Message queue error', { error });
    });

    this.messageQueue.on('connected', () => {
      logger.info('Message queue connected to Redis');
    });

    this.messageQueue.on('waiting', (jobId) => {
      logger.debug('Message job waiting', { jobId });
    });

    // Campaign queue events
    this.campaignQueue.on('error', (error) => {
      logger.error('Campaign queue error', { error });
    });

    this.campaignQueue.on('connected', () => {
      logger.info('Campaign queue connected to Redis');
    });
  }

  private setupProcessors() {
    // Message queue processor with exponential backoff
    this.messageQueue.process(10, async (job) => {
      const { userId, phoneNumber, message, campaignId } = job.data;
      const maxRetries = 3;

      try {
        logger.info('Processing message job', { jobId: job.id, phoneNumber, attempt: job.attemptsMade + 1 });

        const result = await messageService.sendMessage(userId, phoneNumber, message, campaignId);

        if (!result.success) {
          const error = new Error(result.error);
          (error as any).isRetryable = result.error?.includes('timeout') || result.error?.includes('connection');
          throw error;
        }

        // Update message status in database
        if (campaignId) {
          await prisma.message.updateMany({
            where: {
              campaignId,
              recipientPhone: phoneNumber,
              status: 'pending',
            },
            data: {
              status: 'sent',
              sentAt: new Date(),
            },
          });
        }

        return { success: true, messageId: result.messageId };
      } catch (error: any) {
        logger.warn('Message job failed', {
          jobId: job.id,
          attempt: job.attemptsMade + 1,
          maxRetries,
          error: error.message,
        });

        if (job.attemptsMade >= maxRetries - 1) {
          // Move to dead-letter queue after max retries
          await this.deadLetterQueue.add(
            { ...job.data, originalJobId: job.id, failureReason: error.message },
            { removeOnComplete: true }
          );

          // Update message status as failed
          if (campaignId) {
            await prisma.message.updateMany({
              where: {
                campaignId,
                recipientPhone: phoneNumber,
                status: 'pending',
              },
              data: {
                status: 'failed',
                failedReason: error.message,
                failedAt: new Date(),
              },
            });
          }

          logger.error('Message moved to dead-letter queue', { jobId: job.id, reason: error.message });
        }

        throw error;
      }
    });

    this.messageQueue.on('completed', (job) => {
      logger.info('Message job completed successfully', { jobId: job.id });
    });

    this.messageQueue.on('failed', (job, error) => {
      logger.error('Message job permanently failed', { jobId: job.id, attempts: job.attemptsMade, error: error.message });
    });

    // Campaign queue processor
    this.campaignQueue.process(2, async (job) => {
      const { campaignId, userId, delayMs = 5000 } = job.data;

      try {
        logger.info('Processing campaign job', { jobId: job.id, campaignId });

        // Update campaign status
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: 'sending' },
        });

        const result = await messageService.sendCampaignMessages(campaignId, userId, delayMs);

        // Update campaign completion
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: 'sent',
            completedAt: new Date(),
          },
        });

        return result;
      } catch (error: any) {
        logger.error('Campaign job failed', { jobId: job.id, campaignId, error: error.message });

        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: 'failed' },
        }).catch((err) => logger.error('Failed to update campaign status', { campaignId, error: err }));

        throw error;
      }
    });

    this.campaignQueue.on('progress', (job, progress) => {
      logger.info('Campaign job progress', { jobId: job.id, progress: `${progress}%` });
    });

    this.campaignQueue.on('completed', (job) => {
      logger.info('Campaign job completed', { jobId: job.id });
    });

    this.campaignQueue.on('failed', (job, error) => {
      logger.error('Campaign job failed', { jobId: job.id, error: error.message });
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
