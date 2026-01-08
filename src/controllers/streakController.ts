import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import StreakHistory from '../models/StreakHistory';
import Achievement from '../models/Achievement';
import { Op } from 'sequelize';
import { logger } from '../utils/logger';

export class StreakController {
  // Get current streak
  async getCurrentStreak(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = (req as any).user.userId;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastLoginDate: user.lastLoginDate,
          streakFreezeCount: user.streakFreezeCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get streak history
  async getStreakHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { startDate, endDate, limit = 30 } = req.query;

      const whereClause: any = { userId };

      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) whereClause.date[Op.gte] = new Date(startDate as string);
        if (endDate) whereClause.date[Op.lte] = new Date(endDate as string);
      }

      const history = await StreakHistory.findAll({
        where: whereClause,
        order: [['date', 'DESC']],
        limit: parseInt(limit as string)
      });

      res.status(200).json({
        success: true,
        data: { history }
      });
    } catch (error) {
      next(error);
    }
  }

  // Use streak freeze
  async useStreakFreeze(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = (req as any).user.userId;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const maxFreezes = parseInt(process.env.MAX_STREAK_FREEZE_DAYS || '3');
      if (user.streakFreezeCount >= maxFreezes) {
        return res.status(400).json({
          success: false,
          message: `Maximum streak freeze limit (${maxFreezes}) reached`
        });
      }

      await user.update({
        streakFreezeCount: user.streakFreezeCount + 1
      });

      logger.info(`Streak freeze used by user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Streak freeze activated',
        data: {
          streakFreezeCount: user.streakFreezeCount,
          remainingFreezes: maxFreezes - user.streakFreezeCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Record streak activity
  async recordActivity(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = (req as any).user.userId;
      const { actionType } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const today = new Date().toISOString().split('T')[0];

      // Check if activity already recorded today
      const existingActivity = await StreakHistory.findOne({
        where: {
          userId,
          date: today,
          actionType
        }
      });

      if (existingActivity) {
        return res.status(200).json({
          success: true,
          message: 'Activity already recorded today'
        });
      }

      // Award XP based on action type
      const xpRewards: { [key: string]: number } = {
        login: 10,
        investment: 50,
        learning: 25,
        quiz: 30,
        challenge: 40
      };

      const xpEarned = xpRewards[actionType] || 10;

      // Record activity
      await StreakHistory.create({
        userId,
        date: new Date(),
        streakCount: user.currentStreak,
        xpEarned,
        actionType
      });

      // Update user XP and level
      const newTotalXP = user.totalXP + xpEarned;
      const newLevel = Math.floor(newTotalXP / 100) + 1;

      await user.update({
        totalXP: newTotalXP,
        level: newLevel
      });

      // Check for achievements
      await this.checkAndAwardAchievements(user, actionType);

      res.status(200).json({
        success: true,
        message: 'Activity recorded successfully',
        data: {
          xpEarned,
          totalXP: newTotalXP,
          level: newLevel,
          leveledUp: newLevel > user.level
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper method to check and award achievements
  private async checkAndAwardAchievements(user: User, _actionType: string) {
    const achievements: any[] = [];

    // First Login Achievement
    if (user.currentStreak === 1) {
      const existingAchievement = await Achievement.findOne({
        where: { userId: user.id, achievementType: 'first-login' }
      });

      if (!existingAchievement) {
        achievements.push({
          userId: user.id,
          achievementType: 'first-login',
          achievementName: 'Welcome Aboard!',
          description: 'Completed your first login',
          badgeIcon: '🎉',
          xpReward: 50,
          unlockedAt: new Date()
        });
      }
    }

    // 7-Day Streak Achievement
    if (user.currentStreak === 7) {
      const existingAchievement = await Achievement.findOne({
        where: { userId: user.id, achievementType: '7-day-streak' }
      });

      if (!existingAchievement) {
        achievements.push({
          userId: user.id,
          achievementType: '7-day-streak',
          achievementName: 'Week Warrior',
          description: 'Maintained a 7-day login streak',
          badgeIcon: '🔥',
          xpReward: 100,
          unlockedAt: new Date()
        });
      }
    }

    // 30-Day Streak Achievement
    if (user.currentStreak === 30) {
      const existingAchievement = await Achievement.findOne({
        where: { userId: user.id, achievementType: '30-day-streak' }
      });

      if (!existingAchievement) {
        achievements.push({
          userId: user.id,
          achievementType: '30-day-streak',
          achievementName: 'Monthly Master',
          description: 'Maintained a 30-day login streak',
          badgeIcon: '🏆',
          xpReward: 500,
          unlockedAt: new Date()
        });
      }
    }

    // Create achievements
    if (achievements.length > 0) {
      await Achievement.bulkCreate(achievements);
      
      // Award XP
      const totalXPReward = achievements.reduce((sum, a) => sum + a.xpReward, 0);
      await user.update({
        totalXP: user.totalXP + totalXPReward
      });

      logger.info(`Achievements awarded to user ${user.email}: ${achievements.map(a => a.achievementName).join(', ')}`);
    }
  }
}
