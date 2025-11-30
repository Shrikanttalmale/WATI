import logger from '../utils/logger';
import baileysService from './baileysService';
import webJsService from './webJsService';
import messageService from './messageService';

interface MessageJob {
  messageId: string;
  campaignId: string;
  userId: string;
  recipientPhone: string;
  recipientName: string;
  messageBody: string;
  delayType: string;
  deliveryMethod: 'baileys' | 'web-js';
  attempt: number;
}

export class QueueService {
  private processedCount = 0;
  private failedCount = 0;

  // In production, this would use Bull with Redis
  // For now, we''re simulating queue with in-memory processing
  async processMessageQueue(jobs: MessageJob[]): Promise<void> {
    try {
      logger.info('Processing message queue', { jobCount: jobs.length });

      for (const job of jobs) {
        await this.processMessageJob(job);
      }

      logger.info('Message queue processing completed', {
        processed: this.processedCount,
        failed: this.failedCount,
      });
    } catch (error) {
      logger.error('Process message queue failed', { error });
      throw error;
    }
  }

  private async processMessageJob(job: MessageJob): Promise<void> {
    try {
      logger.info('Processing message job', {
        messageId: job.messageId,
        recipientPhone: job.recipientPhone,
        deliveryMethod: job.deliveryMethod,
      });

      let result = { success: false, messageId: '', error: '' };

      // Try primary delivery method (Baileys)
      if (job.deliveryMethod === 'baileys' || job.attempt === 0) {
        result = await baileysService.sendMessage(
          job.userId,
          job.recipientPhone,
          job.messageBody,
          job.delayType
        );

        if (result.success) {
          await messageService.updateMessageStatus(job.messageId, 'sent', 'baileys');
          this.processedCount++;
          return;
        }
      }

      // Fallback to Web.js on Baileys failure
      logger.warn('Baileys delivery failed, trying Web.js fallback', {
        messageId: job.messageId,
        error: result.error,
      });

      result = await webJsService.sendMessage(
        job.userId,
        job.recipientPhone,
        job.messageBody,
        job.delayType
      );

      if (result.success) {
        await messageService.updateMessageStatus(job.messageId, 'sent', 'web-js');
        this.processedCount++;
      } else {
        // Both failed - schedule retry
        await messageService.retryMessage(job.messageId);
        this.failedCount++;
        logger.error('Both delivery methods failed, retrying', {
          messageId: job.messageId,
          error: result.error,
        });
      }
    } catch (error: any) {
      logger.error('Process message job failed', { error: error.message, messageId: job.messageId });
      await messageService.retryMessage(job.messageId);
      this.failedCount++;
    }
  }

  async addJobToQueue(messageJob: MessageJob): Promise<void> {
    try {
      // In production, this would add to Bull queue
      // For now, we''re simulating with immediate processing
      logger.info('Job added to queue', { messageId: messageJob.messageId });
      await this.processMessageJob(messageJob);
    } catch (error) {
      logger.error('Add job to queue failed', { error });
      throw error;
    }
  }

  async retryFailedMessages(limit: number = 10): Promise<void> {
    try {
      const failedMessages = await messageService.getMessagesByStatus('failed', limit);
      logger.info('Retrying failed messages', { count: failedMessages.length });

      for (const msg of failedMessages) {
        const retried = await messageService.retryMessage(msg.id);
        if (retried) {
          const job: MessageJob = {
            messageId: msg.id,
            campaignId: msg.campaignId,
            userId: msg.campaign.userId,
            recipientPhone: msg.recipientPhone,
            recipientName: msg.recipientName || '',
            messageBody: msg.messageBody,
            delayType: msg.campaign.delayType,
            deliveryMethod: retried.deliveryMethod as 'baileys' | 'web-js',
            attempt: retried.retryCount,
          };
          await this.addJobToQueue(job);
        }
      }
    } catch (error) {
      logger.error('Retry failed messages failed', { error });
      throw error;
    }
  }

  getQueueStats(): { processed: number; failed: number } {
    return {
      processed: this.processedCount,
      failed: this.failedCount,
    };
  }
}

export default new QueueService();
