import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// AWS RDS Configuration for EC2 (VPC Private Connection)
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  
  // Connection Pool - Critical for AWS RDS
  pool: {
    max: 20,                    // Maximum connections (adjust based on RDS instance)
    min: 5,                     // Minimum connections to keep alive
    acquire: 60000,             // 60s - Time to acquire connection before timeout
    idle: 10000,                // 10s - Max time connection can be idle
    evict: 10000,               // 10s - Time to check for idle connections
  },
  
  // Retry logic for connection failures
  retry: {
    max: 3,                     // Retry 3 times before failing
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNREFUSED/,
      /ENOTFOUND/
    ]
  },
  
  // AWS RDS Specific Options
  dialectOptions: {
    // SSL is REQUIRED for AWS RDS connections
    ssl: {
      require: true,
      rejectUnauthorized: false  // AWS RDS uses Amazon RDS certificates
    },
    
    // Connection timeout
    connectTimeout: 60000,       // 60 seconds
    
    // Statement timeout
    statement_timeout: 30000,    // 30 seconds per query
    
    // Keep alive for long-running connections
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
  },
  
  // Force SSL mode
  ssl: true,
  
  // Query options
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: false
  },
  
  // Timezone
  timezone: '+00:00'
});

// Test connection helper
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    logger.info(`📊 Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    return true;
  } catch (error: any) {
    logger.error('❌ Unable to connect to database:', {
      error: error.message,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      code: error.original?.code
    });
    return false;
  }
};

// Graceful shutdown
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('✅ Database connection closed gracefully');
  } catch (error: any) {
    logger.error('❌ Error closing database connection:', error.message);
  }
};

export default sequelize;