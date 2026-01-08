import { CronJob } from 'cron';
import { User } from '../models/User';
import { Op } from 'sequelize';
import { logger } from '../utils/logger';

// Reset streaks for users who haven't logged in
export const startStreakResetCron = () => {
  // Run every day at midnight
  const job = new CronJob(
    '0 0 * * *', // Cron expression: midnight every day
    async () => {
      try {
        logger.info('Running streak reset cron job...');

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        twoDaysAgo.setHours(0, 0, 0, 0);

        // Find users whose last login was more than 1 day ago
        const usersToReset = await User.findAll({
          where: {
            lastLoginDate: {
              [Op.lt]: yesterday
            },
            currentStreak: {
              [Op.gt]: 0
            },
            isActive: true
          }
        });

        logger.info(`Found ${usersToReset.length} users with expired streaks`);

        // Reset streaks for users who haven't used a streak freeze
        for (const user of usersToReset) {
          const maxFreezes = parseInt(process.env.MAX_STREAK_FREEZE_DAYS || '3');
          
          if (user.streakFreezeCount < maxFreezes) {
            // User has freeze available, use it
            await user.update({
              streakFreezeCount: user.streakFreezeCount + 1
            });
            logger.info(`Streak freeze auto-applied for user ${user.email}`);
          } else {
            // Reset streak
            await user.update({
              currentStreak: 0,
              streakFreezeCount: 0 // Reset freeze count for new streak
            });
            logger.info(`Streak reset for user ${user.email}`);
          }
        }

        logger.info('Streak reset cron job completed');
      } catch (error) {
        logger.error('Error in streak reset cron job:', error);
      }
    },
    null,
    true, // Start immediately
    'America/New_York' // Timezone
  );

  job.start();
  logger.info('Streak reset cron job scheduled');
};
