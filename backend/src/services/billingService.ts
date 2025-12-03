import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class BillingService {
  // Get user's current plan
  async getUserPlan(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true },
      });
      if (!user) throw new Error('User not found');
      return user.plan;
    } catch (error) {
      logger.error('Get user plan failed', { error, userId });
      throw error;
    }
  }

  // Get all available plans
  async getAllPlans() {
    try {
      const plans = await prisma.plan.findMany({
        orderBy: { price: 'asc' },
      });
      return plans;
    } catch (error) {
      logger.error('Get all plans failed', { error });
      throw error;
    }
  }

  // Upgrade to new plan
  async upgradePlan(userId: string, newPlanId: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const newPlan = await prisma.plan.findUnique({ where: { id: newPlanId } });
      if (!newPlan) throw new Error('Plan not found');

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { planId: newPlanId },
      });

      await prisma.billingHistory.create({
        data: {
          userId,
          planId: newPlanId,
          amount: newPlan.price,
          razorpayOrderId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'completed',
        },
      });

      logger.info('Plan upgraded', { userId, newPlanId, amount: newPlan.price });
      return updated;
    } catch (error) {
      logger.error('Upgrade plan failed', { error, userId });
      throw error;
    }
  }

  // Track usage
  async trackUsage(userId: string, messagesUsed: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true },
      });
      if (!user || !user.plan) throw new Error('User or plan not found');

      // Efficiently aggregate using Prisma aggregation
      const result = await prisma.campaign.aggregate({
        where: { userId },
        _sum: { sentCount: true },
      });

      const totalMessages = result._sum.sentCount || 0;
      const usage = (totalMessages / user.plan.messagesPerMonth) * 100;

      return { usage: usage.toFixed(2), limit: user.plan.messagesPerMonth, used: totalMessages };
    } catch (error) {
      logger.error('Track usage failed', { error, userId });
      throw error;
    }
  }

  // Get billing history
  async getBillingHistory(userId: string, limit: number = 10) {
    try {
      const history = await prisma.billingHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return history;
    } catch (error) {
      logger.error('Get billing history failed', { error, userId });
      throw error;
    }
  }

  // Create invoice
  async createInvoice(userId: string, planId: string, amount: number) {
    try {
      const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const history = await prisma.billingHistory.create({
        data: {
          userId,
          planId,
          amount,
          razorpayOrderId: invoiceId,
          status: 'pending',
        },
      });
      logger.info('Invoice created', { userId, amount });
      return history;
    } catch (error) {
      logger.error('Create invoice failed', { error, userId });
      throw error;
    }
  }

  // Enforce usage limits
  async checkUsageLimit(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true },
      });
      if (!user || !user.plan) throw new Error('User or plan not found');

      // Use efficient aggregation
      const result = await prisma.campaign.aggregate({
        where: { userId },
        _sum: { sentCount: true },
      });

      const totalMessages = result._sum.sentCount || 0;

      return {
        withinLimit: totalMessages <= user.plan.messagesPerMonth,
        used: totalMessages,
        limit: user.plan.messagesPerMonth,
        remaining: Math.max(0, user.plan.messagesPerMonth - totalMessages),
      };
    } catch (error) {
      logger.error('Check usage limit failed', { error, userId });
      throw error;
    }
  }
}

export default new BillingService();
