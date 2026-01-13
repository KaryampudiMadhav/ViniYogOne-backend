import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  // OAuth fields
  googleId?: string;
  facebookId?: string;
  linkedinId?: string;
  twitterId?: string;
  instagramId?: string;
  profilePicture?: string;
  dateOfBirth?: Date;
  kycStatus?: 'pending' | 'submitted' | 'verified' | 'rejected';
  riskProfile?: 'conservative' | 'moderate' | 'aggressive';
  currentStreak?: number;
  longestStreak?: number;
  lastLoginDate?: Date;
  totalXP?: number;
  level?: number;
  streakFreezeCount?: number;
  credits?: number;
  badgesCount?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password?: string;
  public phoneNumber?: string;
  public isEmailVerified!: boolean;
  public isPhoneVerified!: boolean;
  // OAuth fields
  public googleId?: string;
  public facebookId?: string;
  public linkedinId?: string;
  public twitterId?: string;
  public instagramId?: string;
  public profilePicture?: string;
  public dateOfBirth?: Date;
  public kycStatus!: 'pending' | 'submitted' | 'verified' | 'rejected';
  public riskProfile?: 'conservative' | 'moderate' | 'aggressive';
  public currentStreak!: number;
  public longestStreak!: number;
  public lastLoginDate?: Date;
  public totalXP!: number;
  public level!: number;
  public streakFreezeCount!: number;
  public credits!: number;
  public badgesCount!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }

  public toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // OAuth fields
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    facebookId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    linkedinId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    twitterId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    instagramId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    profilePicture: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    kycStatus: {
      type: DataTypes.ENUM('pending', 'submitted', 'verified', 'rejected'),
      defaultValue: 'pending'
    },
    riskProfile: {
      type: DataTypes.ENUM('conservative', 'moderate', 'aggressive'),
      allowNull: true
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastLoginDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    totalXP: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    streakFreezeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
      validate: {
        min: 0
      },
      comment: 'User credits (coins) for gamification rewards'
    },
    badgesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      },
      comment: 'Total number of badges unlocked by the user'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      // OAuth indexes - COMMENTED OUT FOR NOW
      // { fields: ['googleId'] },
      // { fields: ['facebookId'] },
      // { fields: ['linkedinId'] },
      // { fields: ['twitterId'] },
      // { fields: ['instagramId'] },
      { fields: ['phoneNumber'] }
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

export default User;
