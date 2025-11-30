import logger from '../utils/logger';

interface BaileysSession {
  phone: string;
  isConnected: boolean;
  lastSent: number;
}

export class BaileysService {
  private sessions: Map<string, BaileysSession> = new Map();
  private delayMap = {
    fast: { min: 2000, max: 5000 },
    balanced: { min: 5000, max: 10000 },
    safe: { min: 10000, max: 30000 },
  };

  async initializeSession(userId: string, sessionData?: string): Promise<boolean> {
    try {
      const sessionKey = `baileys_${userId}`;
      
      // In production, this would initialize Baileys with WhatsApp Web
      // For now, we''re creating a mock session that''s ready for Baileys integration
      const session: BaileysSession = {
        phone: '',
        isConnected: true,
        lastSent: Date.now(),
      };

      this.sessions.set(sessionKey, session);
      logger.info('Baileys session initialized', { userId, sessionKey });
      return true;
    } catch (error) {
      logger.error('Baileys initialization failed', { error, userId });
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
      const sessionKey = `baileys_${userId}`;
      const session = this.sessions.get(sessionKey);

      if (!session || !session.isConnected) {
        return {
          success: false,
          error: 'Session not connected or not found',
        };
      }

      // Apply delay based on delayType
      const delays = this.delayMap[delayType as keyof typeof this.delayMap] || this.delayMap.balanced;
      const randomDelay = Math.random() * (delays.max - delays.min) + delays.min;
      await this.sleep(randomDelay);

      // In production, this would call Baileys socket.sendMessage()
      // For now, we''re simulating successful send with mock messageId
      const messageId = `baileys_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      session.lastSent = Date.now();

      logger.info('Message sent via Baileys', { userId, recipientPhone, messageId, delayMs: Math.round(randomDelay) });

      return {
        success: true,
        messageId,
      };
    } catch (error: any) {
      logger.error('Baileys send message failed', { error: error.message, userId, recipientPhone });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getSessionStatus(userId: string): Promise<{ connected: boolean; lastSent?: number }> {
    try {
      const sessionKey = `baileys_${userId}`;
      const session = this.sessions.get(sessionKey);

      if (!session) {
        return { connected: false };
      }

      return {
        connected: session.isConnected,
        lastSent: session.lastSent,
      };
    } catch (error) {
      logger.error('Get session status failed', { error, userId });
      return { connected: false };
    }
  }

  async closeSession(userId: string): Promise<boolean> {
    try {
      const sessionKey = `baileys_${userId}`;
      this.sessions.delete(sessionKey);
      logger.info('Baileys session closed', { userId, sessionKey });
      return true;
    } catch (error) {
      logger.error('Close session failed', { error, userId });
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new BaileysService();
