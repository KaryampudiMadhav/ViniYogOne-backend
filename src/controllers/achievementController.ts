import { Request, Response, NextFunction } from 'express';
import Achievement from '../models/Achievement';
import { User } from '../models/User';

export class AchievementController {
  // Get all achievements for a user
  async getUserAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;

      const achievements = await Achievement.findAll({
        where: { userId },
        order: [['unlockedAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: { 
          achievements,
          total: achievements.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get achievement statistics
  async getAchievementStats(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = (req as any).user.userId;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const totalAchievements = await Achievement.count({ where: { userId } });
      const totalXPFromAchievements = await Achievement.sum('xpReward', { where: { userId } }) || 0;

      // Achievement categories
      const achievementsByType = await Achievement.findAll({
        where: { userId },
        attributes: ['achievementType'],
        group: ['achievementType']
      });

      res.status(200).json({
        success: true,
        data: {
          totalAchievements,
          totalXPFromAchievements,
          badgesCount: user.badgesCount,
          achievementTypes: achievementsByType.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
