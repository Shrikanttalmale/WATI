import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, Events } = pkg;
import qrcode from 'qrcode';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../utils/prismaClient';

const prisma = getPrismaClient();

export class WhatsAppService {
  private clients: Map<string, any> = new Map();
  private qrCodes: Map<string, { qrData: string; expiresAt: Date }> = new Map();

  async generateQRCode(userId: string) {
    try {
      // Check for existing session
      const existingSession = await prisma.session.findFirst({
        where: { userId, isActive: true },
      });

      if (existingSession) {
        return {
          qrCode: existingSession.qrCode || '',
          sessionId: existingSession.id,
          status: 'already_connected',
          expiresIn: 0,
        };
      }

      // Create client with QR handler
      const client = new Client({
        authStrategy: new LocalAuth({ clientId: `user_${userId}` }),
      });

      let qrData = '';
      let qrImage = '';

      const qrPromise = new Promise<string>((resolve) => {
        client.on(Events.QR_RECEIVED, async (qr) => {
          logger.info('QR code received from Baileys', { userId });
          qrData = qr;
          try {
            qrImage = await qrcode.toDataURL(qr);
            resolve(qrImage);
          } catch (err) {
            logger.error('QR image generation failed', { error: err });
            resolve('');
          }
        });
      });

      client.on(Events.READY, () => {
        logger.info('WhatsApp client ready', { userId });
        this.clients.set(userId, client);
      });

      client.on(Events.AUTHENTICATED, () => {
        logger.info('WhatsApp authenticated', { userId });
      });

      client.on(Events.AUTH_FAILURE, () => {
        logger.warn('WhatsApp auth failure', { userId });
        this.clients.delete(userId);
      });

      client.on(Events.DISCONNECTED, () => {
        logger.warn('WhatsApp disconnected', { userId });
        this.clients.delete(userId);
      });

      // Initialize with timeout
      const initPromise = client.initialize();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('QR generation timeout')), 30000)
      );

      await Promise.race([initPromise, timeoutPromise]).catch((err) => {
        logger.error('Client initialization failed', { error: err.message, userId });
      });

      // Wait for QR with timeout
      const qrTimeout = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('QR timeout')), 25000)
      );

      const qr = await Promise.race([qrPromise, qrTimeout]);

      // Store QR with expiry
      const sessionId = `session_${userId}_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      this.qrCodes.set(sessionId, { qrData, expiresAt });

      logger.info('QR code generated', { userId, sessionId });

      return {
        qrCode: qr,
        sessionId,
        expiresIn: 300,
      };
    } catch (error: any) {
      logger.error('QR code generation failed', { error: error.message, userId });
      throw error;
    }
  }

  async verifyQRScan(userId: string, sessionId: string) {
    try {
      const client = this.clients.get(userId);

      if (!client) {
        throw new Error('Client not initialized');
      }

      const state = await client.getState?.();
      const isAuthenticated = state === 'CONNECTED' || client.info?.pushname;

      if (isAuthenticated) {
        // Save session to database
        const session = await prisma.session.findFirst({
          where: { userId },
        });

        if (!session) {
          await prisma.session.create({
            data: {
              userId,
              sessionName: `session_${userId}`,
              sessionData: 'verified', // Real session data would be serialized here
              isActive: true,
              qrCode: '',
            },
          });
        } else {
          await prisma.session.update({
            where: { id: session.id },
            data: { isActive: true, lastUsedAt: new Date() },
          });
        }

        // Clear QR
        this.qrCodes.delete(sessionId);

        logger.info('QR scan verified and session saved', { userId, sessionId });
        return { verified: true, sessionId, status: 'connected' };
      }

      return { verified: false, sessionId, status: 'pending' };
    } catch (error: any) {
      logger.error('QR verification failed', { error: error.message, userId });
      throw error;
    }
  }

  async getSessionStatus(userId: string) {
    try {
      const client = this.clients.get(userId);
      const dbSession = await prisma.session.findFirst({
        where: { userId, isActive: true },
      });

      let status = 'not_connected';
      let pushname = '';

      if (client) {
        status = client.info?.pushname ? 'connected' : 'connecting';
        pushname = client.info?.pushname || '';
      } else if (dbSession?.isActive) {
        status = 'connected_db';
      }

      return {
        status,
        userId,
        phoneNumber: pushname,
        hasActiveSession: !!dbSession?.isActive,
      };
    } catch (error: any) {
      logger.error('Get session status failed', { error: error.message, userId });
      return { status: 'error', userId, error: error.message };
    }
  }

  async sendMessage(userId: string, phoneNumber: string, message: string) {
    try {
      const client = this.clients.get(userId);

      if (!client) {
        throw new Error('WhatsApp session not initialized. Please scan QR code first');
      }

      if (!client.info?.pushname) {
        throw new Error('WhatsApp client not authenticated');
      }

      // Format phone number
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      const chatId = formattedPhone.length === 10 ? `91${formattedPhone}@c.us` : `${formattedPhone}@c.us`;

      // Send with timeout
      const sendPromise = client.sendMessage(chatId, message);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Send timeout')), 15000)
      );

      const response = await Promise.race([sendPromise, timeoutPromise]);

      logger.info('Message sent via WhatsApp', {
        userId,
        phoneNumber,
        messageId: response?.id?.id || response?.id,
      });

      return {
        success: true,
        messageId: response?.id?.id || response?.id,
        timestamp: response?.timestamp,
      };
    } catch (error: any) {
      logger.error('Send message failed', { error: error.message, userId, phoneNumber });
      throw error;
    }
  }

  async disconnectSession(userId: string) {
    try {
      const client = this.clients.get(userId);

      if (client) {
        await client.destroy();
        this.clients.delete(userId);
      }

      // Update database
      await prisma.session.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      logger.info('WhatsApp session disconnected', { userId });
      return { success: true };
    } catch (error: any) {
      logger.error('Disconnect session failed', { error: error.message, userId });
      throw error;
    }
  }
}

export default new WhatsAppService();
