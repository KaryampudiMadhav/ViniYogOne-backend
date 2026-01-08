// Central model export with associations
import { User } from './User';
import Achievement from './Achievement';
import StreakHistory from './StreakHistory';
import OTP from './OTP';

// Define associations
User.hasMany(Achievement, {
  foreignKey: 'userId',
  as: 'achievements',
  onDelete: 'CASCADE'
});

Achievement.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(StreakHistory, {
  foreignKey: 'userId',
  as: 'streakHistory',
  onDelete: 'CASCADE'
});

StreakHistory.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Export all models
export {
  User,
  Achievement,
  StreakHistory,
  OTP
};
