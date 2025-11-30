import logger from '../utils/logger';

interface WebJSSession {
  browserHandle?: string;
  isConnected: boolean;
  lastSent: number;
}

export class WebJSService {
  private sessions: Map<string, WebJSSession> = new Map();
  private delayMap = {
    fast: { min: 3000, max: 6000 },
    balanced: { min: 6000, max: 12000 },
    safe: { min: 12000, max: 40000 },
  };

  async initializeSession(userId: string): Promise<boolean> {
    try {
      const sessionKey = `webjs_${userId}`;

      // In production, this would initialize puppeteer + whatsapp-web.js
      // For now, we''re creating a mock session
      const session: WebJSSession = {
        browserHandle: `browser_${userId}_${Date.now()}`,
        isConnected: true,
        lastSent: Date.now(),
      };

      this.sessions.set(sessionKey, session);
      logger.info('Web.js session initialized', { userId, sessionKey });
      return true;
    } catch (error) {
      logger.error('Web.js initialization failed', { error, userId });
      return false;
    }
  }

  async sendMessage(
    userId: string,
    recipientPhone: string,
    messageBody: string,
    delayType: string = 'balanced'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const sessionKey = `webjs_${userId}`;
      const session = this.sessions.get(sessionKey);

      if (!session || !session.isConnected) {
        return {
          success: false,
          error: 'Web.js session not connected or not found',
        };
      }

      // Apply delay based on delayType (slightly longer than Baileys for safety)
      const delays = this.delayMap[delayType as keyof typeof this.delayMap] || this.delayMap.balanced;
      const randomDelay = Math.random() * (delays.max - delays.min) + delays.min;
      await this.sleep(randomDelay);

      // In production, this would call client.sendMessage()
      const messageId = `webjs_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      session.lastSent = Date.now();

      logger.info('Message sent via Web.js', { userId, recipientPhone, messageId, delayMs: Math.round(randomDelay) });

      return {
        success: true,
        messageId,
      };
    } catch (error: any) {
      logger.error('Web.js send message failed', { error: error.message, userId, recipientPhone });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getSessionStatus(userId: string): Promise<{ connected: boolean; lastSent?: number }> {
    try {
      const sessionKey = `webjs_${userId}`;
      const session = this.sessions.get(sessionKey);

      if (!session) {
        return { connected: false };
      }

      return {
        connected: session.isConnected,
        lastSent: session.lastSent,
      };
    } catch (error) {
      logger.error('Get Web.js session status failed', { error, userId });
      return { connected: false };
    }
  }

  async closeSession(userId: string): Promise<boolean> {
    try {
      const sessionKey = `webjs_${userId}`;
      const session = this.sessions.get(sessionKey);

      if (session && session.browserHandle) {
        // In production, would close browser: await browser.close()
        logger.info('Closing browser handle', { browserHandle: session.browserHandle });
      }

      this.sessions.delete(sessionKey);
      logger.info('Web.js session closed', { userId, sessionKey });
      return true;
    } catch (error) {
      logger.error('Close Web.js session failed', { error, userId });
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new WebJSService();
