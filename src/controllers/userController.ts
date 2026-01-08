import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import Achievement from '../models/Achievement';
import StreakHistory from '../models/StreakHistory';
import { logger } from '../utils/logger';

export class UserController {
  // Get user profile
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<any> {
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
        data: { user: user.toJSON() }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = (req as any).user.userId;
      const { firstName, lastName, phoneNumber, dateOfBirth, profilePicture } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phoneNumber: phoneNumber || user.phoneNumber,
        dateOfBirth: dateOfBirth || user.dateOfBirth,
        profilePicture: profilePicture || user.profilePicture
      });

      logger.info(`Profile updated for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: user.toJSON() }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user stats
  async getStats(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = (req as any).user.userId;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const achievementCount = await Achievement.count({ where: { userId } });
      const totalStreakDays = await StreakHistory.count({ where: { userId } });

      // Calculate level progress
      const xpForNextLevel = user.level * 100; // 100 XP per level
      const currentLevelXP = user.totalXP % xpForNextLevel;
      const levelProgress = (currentLevelXP / xpForNextLevel) * 100;

      res.status(200).json({
        success: true,
        data: {
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          totalXP: user.totalXP,
          level: user.level,
          levelProgress: Math.round(levelProgress),
          xpForNextLevel,
          currentLevelXP,
          achievementCount,
          totalStreakDays,
          streakFreezeCount: user.streakFreezeCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user achievements
  async getAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;

      const achievements = await Achievement.findAll({
        where: { userId },
        order: [['unlockedAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: { achievements }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user preferences
  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = (req as any).user.userId;
      const { riskProfile } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({
        riskProfile: riskProfile || user.riskProfile
      });

      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: { user: user.toJSON() }
      });
    } catch (error) {
      next(error);
    }
  }
}
