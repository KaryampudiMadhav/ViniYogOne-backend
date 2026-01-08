import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface AchievementAttributes {
  id?: string;
  userId: string;
  achievementType: string;
  achievementName: string;
  description: string;
  badgeIcon: string;
  xpReward: number;
  unlockedAt: Date;
  createdAt?: Date;
}

export class Achievement extends Model<AchievementAttributes> implements AchievementAttributes {
  public id!: string;
  public userId!: string;
  public achievementType!: string;
  public achievementName!: string;
  public description!: string;
  public badgeIcon!: string;
  public xpReward!: number;
  public unlockedAt!: Date;
  public readonly createdAt!: Date;
}

Achievement.init(
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
    achievementType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    achievementName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    badgeIcon: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    xpReward: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    unlockedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'achievements',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['achievementType'] }
    ]
  }
);

export default Achievement;
