import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, Events } = pkg;
import logger from '../utils/logger';

interface ClientState {
  client: any;
  status: 'initializing' | 'ready' | 'error' | 'disconnected';
  lastError?: string;
  lastUsedAt: Date;
}

export class BaileysService {
  private clients: Map<string, ClientState> = new Map();
  private clientReadyPromises: Map<string, Promise<any>> = new Map();

  async initializeSession(userId: string) {
    try {
      // Check if client already initialized
      const existing = this.clients.get(userId);
      if (existing && existing.status === 'ready') {
        logger.info('WhatsApp session already initialized', { userId });
        return { success: true, userId, status: 'ready' };
      }

      // Mark as initializing
      this.clients.set(userId, {
        client: null,
        status: 'initializing',
        lastUsedAt: new Date(),
      });

      const client = new Client({
        authStrategy: new LocalAuth({ clientId: `user_${userId}` }),
      });

      let readyResolver: any;
      const readyPromise = new Promise((resolve) => {
        readyResolver = resolve;
      });

      client.on(Events.QR_RECEIVED, (qr) => {
        logger.info('QR code received', { userId });
      });

      client.on(Events.AUTHENTICATED, () => {
        logger.info('WhatsApp authenticated', { userId });
      });

      client.on(Events.READY, () => {
        logger.info('WhatsApp client ready', { userId });
        this.clients.set(userId, {
          client,
          status: 'ready',
          lastUsedAt: new Date(),
        });
        readyResolver(true);
      });

      client.on(Events.DISCONNECTED, () => {
        logger.warn('WhatsApp disconnected', { userId });
        const state = this.clients.get(userId);
        if (state) {
          state.status = 'disconnected';
          state.lastUsedAt = new Date();
        }
      });

      client.on(Events.MESSAGE_RECEIVED, (msg) => {
        logger.debug('Message received', { userId, from: msg.from });
      });

      client.on('error', (error) => {
        logger.error('Client error', { userId, error: error.message });
        const state = this.clients.get(userId);
        if (state) {
          state.status = 'error';
          state.lastError = error.message;
          state.lastUsedAt = new Date();
        }
      });

      await client.initialize();

      // Wait for ready event with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Client ready timeout')), 30000)
      );

      await Promise.race([readyPromise, timeoutPromise]);

      return { success: true, userId, status: 'ready' };
    } catch (error: any) {
      logger.error('Baileys initialization failed', { error: error.message, userId });
      const state = this.clients.get(userId);
      if (state) {
        state.status = 'error';
        state.lastError = error.message;
      }
      throw error;
    }
  }

  // Validate and format phone number
  private validatePhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 10) {
      throw new Error(`Invalid phone number: ${phoneNumber}`);
    }
    // Add country code if missing (assuming India +91)
    const formatted = cleaned.length === 10 ? `91${cleaned}` : cleaned;
    return `${formatted}@c.us`;
  }

  async sendMessage(userId: string, phoneNumber: string, message: string) {
    let retries = 3;
    let lastError: any;

    while (retries > 0) {
      try {
        const state = this.clients.get(userId);

        if (!state) {
          throw new Error('WhatsApp session not initialized');
        }

        if (state.status === 'error' || state.status === 'disconnected') {
          throw new Error(`Client is ${state.status}`);
        }

        if (state.status !== 'ready') {
          logger.warn('Waiting for client to be ready', { userId });
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }

        const client = state.client;
        if (!client) {
          throw new Error('Client instance not found');
        }

        // Validate and format phone number
        const chatId = this.validatePhoneNumber(phoneNumber);

        // Send with timeout
        const sendPromise = client.sendMessage(chatId, message);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Send message timeout')), 15000)
        );

        const response = await Promise.race([sendPromise, timeoutPromise]);

        state.lastUsedAt = new Date();

        logger.info('Message sent via Baileys', {
          userId,
          phoneNumber,
          messageId: response?.id?.id || response?.id,
        });

        return {
          success: true,
          messageId: response?.id?.id || response?.id,
          timestamp: response?.timestamp,
          deliveryMethod: 'baileys',
        };
      } catch (error: any) {
        lastError = error;
        retries--;
        logger.warn('Baileys send attempt failed', {
          userId,
          phoneNumber,
          retriesLeft: retries,
          error: error.message,
        });

        if (retries > 0) {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }
    }

    logger.error('Baileys send failed after retries', {
      userId,
      phoneNumber,
      error: lastError?.message,
    });
    throw lastError;
  }

  async sendBulk(userId: string, messages: Array<{ phone: string; message: string }>) {
    try {
      const results = [];
      for (const msg of messages) {
        try {
          const result = await this.sendMessage(userId, msg.phone, msg.message);
          results.push({ phone: msg.phone, success: true, ...result });
        } catch (error: any) {
          results.push({ phone: msg.phone, success: false, error: error.message });
          logger.warn('Bulk message failed for phone', { phone: msg.phone, error: error.message });
        }
      }
      return results;
    } catch (error) {
      logger.error('Bulk send failed', { error, userId });
      throw error;
    }
  }

  async getStatus(userId: string) {
    try {
      const client = this.clients.get(userId);
      if (!client) {
        return { status: 'not_connected', userId };
      }

      const state = client.info?.pushname ? 'connected' : 'connecting';
      return {
        status: state,
        userId,
        phone: client.info?.pushname,
      };
    } catch (error) {
      logger.error('Get status failed', { error, userId });
      return { status: 'error', userId, error: error.message };
    }
  }

  async disconnect(userId: string) {
    try {
      const client = this.clients.get(userId);
      if (client) {
        await client.destroy();
        this.clients.delete(userId);
        logger.info('WhatsApp disconnected', { userId });
      }
      return { success: true };
    } catch (error) {
      logger.error('Disconnect failed', { error, userId });
      throw error;
    }
  }
}

export default new BaileysService();
