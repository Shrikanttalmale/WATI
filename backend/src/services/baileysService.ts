import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, Events } = pkg;
import logger from '../utils/logger';

export class BaileysService {
  private clients: Map<string, any> = new Map();

  async initializeSession(userId: string) {
    try {
      const client = new Client({
        authStrategy: new LocalAuth({ clientId: `user_${userId}` }),
      });

      client.on(Events.QR_RECEIVED, (qr) => {
        logger.info('QR code received', { userId });
      });

      client.on(Events.AUTHENTICATED, () => {
        logger.info('WhatsApp authenticated', { userId });
      });

      client.on(Events.READY, () => {
        logger.info('WhatsApp client ready', { userId });
        this.clients.set(userId, client);
      });

      client.on(Events.MESSAGE_RECEIVED, (msg) => {
        logger.info('Message received', { userId, from: msg.from });
      });

      await client.initialize();
      return { success: true, userId };
    } catch (error) {
      logger.error('Baileys initialization failed', { error, userId });
      throw error;
    }
  }

  async sendMessage(userId: string, phoneNumber: string, message: string) {
    try {
      const client = this.clients.get(userId);
      if (!client) {
        throw new Error('WhatsApp session not initialized');
      }

      const chatId = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
      const response = await client.sendMessage(chatId, message);

      logger.info('Message sent via Baileys', { userId, phoneNumber, messageId: response.id.id });

      return {
        success: true,
        messageId: response.id.id,
        timestamp: response.timestamp,
        deliveryMethod: 'baileys',
      };
    } catch (error) {
      logger.error('Baileys send failed', { error, userId, phoneNumber });
      throw error;
    }
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
