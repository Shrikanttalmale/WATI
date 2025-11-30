import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const TRIAL_DURATION_DAYS = 7;

export class AuthService {
  async registerUser(email: string, password: string, name: string) {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + TRIAL_DURATION_DAYS);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          trialStartedAt: new Date(),
          trialExpiresAt,
          status: 'active',
        },
      });

      logger.info('User registered successfully', { email });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          trialExpiresAt: user.trialExpiresAt?.toISOString(),
        },
        token,
      };
    } catch (error) {
      logger.error('Registration failed', { error, email });
      throw error;
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      if (user.trialExpiresAt && user.trialExpiresAt < new Date()) {
        throw new Error('Trial period has expired. Please upgrade your plan');
      }

      logger.info('User logged in successfully', { email });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          trialExpiresAt: user.trialExpiresAt?.toISOString(),
        },
        token,
      };
    } catch (error) {
      logger.error('Login failed', { error, email });
      throw error;
    }
  }

  async getUser(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          companyName: true,
          trialExpiresAt: true,
          createdAt: true,
          status: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user failed', { error, userId });
      throw error;
    }
  }
}

export default new AuthService();
