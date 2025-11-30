import axios from 'axios';
import logger from '../utils/logger';

export class WebJSService {
  private readonly apiBaseUrl = process.env.WEBJS_API_URL || 'http://localhost:3001';
  private sessions: Map<string, string> = new Map();

  async initializeSession(userId: string) {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/api/sessions/init`, {
        sessionId: `session_${userId}`,
        userId,
      });

      this.sessions.set(userId, response.data.sessionId);
      logger.info('Web JS session initialized', { userId });

      return { success: true, userId, sessionId: response.data.sessionId };
    } catch (error) {
      logger.error('Web JS initialization failed', { error, userId });
      throw error;
    }
  }

  async sendMessage(userId: string, phoneNumber: string, message: string) {
    try {
      const sessionId = this.sessions.get(userId);
      if (!sessionId) {
        throw new Error('Web JS session not initialized');
      }

      const response = await axios.post(`${this.apiBaseUrl}/api/messages/send`, {
        sessionId,
        phoneNumber,
        message,
      });

      logger.info('Message sent via Web JS', { userId, phoneNumber, messageId: response.data.messageId });

      return {
        success: true,
        messageId: response.data.messageId,
        timestamp: response.data.timestamp,
        deliveryMethod: 'web-js',
      };
    } catch (error) {
      logger.error('Web JS send failed', { error, userId, phoneNumber });
      throw error;
    }
  }

  async sendBulk(userId: string, messages: Array<{ phone: string; message: string }>) {
    try {
      const sessionId = this.sessions.get(userId);
      if (!sessionId) {
        throw new Error('Web JS session not initialized');
      }

      const response = await axios.post(`${this.apiBaseUrl}/api/messages/bulk-send`, {
        sessionId,
        messages,
      });

      logger.info('Bulk messages sent via Web JS', { userId, count: messages.length });

      return response.data.results;
    } catch (error) {
      logger.error('Web JS bulk send failed', { error, userId });
      throw error;
    }
  }

  async getStatus(userId: string) {
    try {
      const sessionId = this.sessions.get(userId);
      if (!sessionId) {
        return { status: 'not_connected', userId };
      }

      const response = await axios.get(`${this.apiBaseUrl}/api/sessions/${sessionId}/status`);

      return {
        status: response.data.status,
        userId,
        phone: response.data.phone,
      };
    } catch (error) {
      logger.error('Get Web JS status failed', { error, userId });
      return { status: 'error', userId, error: error.message };
    }
  }

  async disconnect(userId: string) {
    try {
      const sessionId = this.sessions.get(userId);
      if (sessionId) {
        await axios.post(`${this.apiBaseUrl}/api/sessions/${sessionId}/disconnect`, {});
        this.sessions.delete(userId);
        logger.info('Web JS disconnected', { userId });
      }
      return { success: true };
    } catch (error) {
      logger.error('Web JS disconnect failed', { error, userId });
      throw error;
    }
  }
}

export default new WebJSService();
