import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface StreakHistoryAttributes {
  id?: string;
  userId: string;
  date: Date;
  streakCount: number;
  xpEarned: number;
  actionType: 'login' | 'investment' | 'learning' | 'quiz' | 'challenge';
  createdAt?: Date;
}

export class StreakHistory extends Model<StreakHistoryAttributes> implements StreakHistoryAttributes {
  public id!: string;
  public userId!: string;
  public date!: Date;
  public streakCount!: number;
  public xpEarned!: number;
  public actionType!: 'login' | 'investment' | 'learning' | 'quiz' | 'challenge';
  public readonly createdAt!: Date;
}

StreakHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    streakCount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    xpEarned: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    actionType: {
      type: DataTypes.ENUM('login', 'investment', 'learning', 'quiz', 'challenge'),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'streak_history',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['userId', 'date'] },
      { fields: ['userId'] }
    ]
  }
);

export default StreakHistory;
