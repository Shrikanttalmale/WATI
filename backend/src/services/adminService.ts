import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class AdminService {
  // Verify admin privilege
  async isAdmin(userId: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return user?.role === 'admin';
    } catch (error) {
      logger.error('Is admin check failed', { error, userId });
      return false;
    }
  }

  // Get all users (admin only)
  async getAllUsers(limit: number = 20, offset: number = 0) {
    try {
      const users = await prisma.user.findMany({
        take: limit,
        skip: offset,
        select: { id: true, email: true, name: true, status: true, createdAt: true, plan: true },
        orderBy: { createdAt: 'desc' },
      });
      const total = await prisma.user.count();
      return { users, total };
    } catch (error) {
      logger.error('Get all users failed', { error });
      throw error;
    }
  }

  // Get user details and analytics
  async getUserDetails(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true, campaigns: true, billingHistory: true },
      });
      if (!user) throw new Error('User not found');

      const campaignCount = user.campaigns.length;
      const totalMessages = user.campaigns.reduce((sum, c) => sum + c.totalContacts, 0);
      const totalRevenue = user.billingHistory.reduce((sum, h) => sum + h.amount, 0);

      return { user, stats: { campaignCount, totalMessages, totalRevenue } };
    } catch (error) {
      logger.error('Get user details failed', { error, userId });
      throw error;
    }
  }

  // Suspend user account
  async suspendUser(userId: string, reason?: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { status: 'suspended' },
      });

      await prisma.adminAction.create({
        data: { userId, action: 'suspend', reason, performedBy: 'admin' },
      });

      logger.warn('User suspended', { userId, reason });
      return user;
    } catch (error) {
      logger.error('Suspend user failed', { error, userId });
      throw error;
    }
  }

  // Reactivate user
  async reactivateUser(userId: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { status: 'active' },
      });

      await prisma.adminAction.create({
        data: { userId, action: 'reactivate', performedBy: 'admin' },
      });

      logger.info('User reactivated', { userId });
      return user;
    } catch (error) {
      logger.error('Reactivate user failed', { error, userId });
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId: string, reason?: string) {
    try {
      await prisma.campaign.deleteMany({ where: { userId } });
      const user = await prisma.user.delete({ where: { id: userId } });

      logger.info('User deleted', { userId, reason });
      return { success: true };
    } catch (error) {
      logger.error('Delete user failed', { error, userId });
      throw error;
    }
  }

  // Get system dashboard
  async getDashboard() {
    try {
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({ where: { status: 'active' } });
      const suspendedUsers = await prisma.user.count({ where: { status: 'suspended' } });
      const totalCampaigns = await prisma.campaign.count();
      const totalMessages = await prisma.message.count();
      const successfulMessages = await prisma.message.count({ where: { status: 'delivered' } });

      const totalRevenue = await prisma.billingHistory.aggregate({
        _sum: { amount: true },
      });

      return {
        users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers },
        campaigns: totalCampaigns,
        messages: { total: totalMessages, successful: successfulMessages },
        revenue: totalRevenue._sum.amount || 0,
        deliveryRate: totalMessages > 0 ? ((successfulMessages / totalMessages) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      logger.error('Get dashboard failed', { error });
      throw error;
    }
  }

  // Get admin actions log
  async getAdminActionsLog(limit: number = 20) {
    try {
      const actions = await prisma.adminAction.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return actions;
    } catch (error) {
      logger.error('Get admin actions log failed', { error });
      throw error;
    }
  }
}

export default new AdminService();
