import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface OTPAttributes {
  id?: string;
  email: string;
  otp: string;
  purpose: 'signup' | 'login' | 'reset-password';
  expiresAt: Date;
  isUsed?: boolean;
  createdAt?: Date;
}

export class OTP extends Model<OTPAttributes> implements OTPAttributes {
  public id!: string;
  public email!: string;
  public otp!: string;
  public purpose!: 'signup' | 'login' | 'reset-password';
  public expiresAt!: Date;
  public isUsed!: boolean;
  public readonly createdAt!: Date;
}

OTP.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    purpose: {
      type: DataTypes.ENUM('signup', 'login', 'reset-password'),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'otps',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['email', 'purpose'] },
      { fields: ['expiresAt'] }
    ]
  }
);

export default OTP;
