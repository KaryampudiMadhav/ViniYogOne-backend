import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { logger } from './utils/logger';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import session from 'express-session';
// import passport from './config/passport'; // OAuth disabled
import { startStreakResetCron } from './services/cronJobs';
// Import models to establish associations
import './models';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 5000;

// Trust proxy for AWS ELB
app.set('trust proxy', 1);

// Middleware
app.use(helmet());

// CORS configuration for Vercel frontend
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  // Add your Vercel domain(s) here - they'll be auto-allowed via regex below
];

// Allow Vercel preview and production deployments
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Allow all Vercel deployments (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport initialization - DISABLED (OAuth not in use)
// app.use(passport.initialize());
// app.use(passport.session());

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      services: {
        api: 'healthy',
        database: 'healthy'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'disconnected',
      error: 'Database connection failed'
    });
  }
});

// API Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    logger.info('🔄 Starting server initialization...');
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`📍 Port: ${PORT}`);
    
    // Test database connection with retry
    logger.info('🔄 Testing database connection...');
    const { testConnection } = await import('./config/database');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      throw new Error('Database connection failed. Check your AWS RDS configuration and security groups.');
    }

    // Sync database models (ONLY in development)
    if (process.env.NODE_ENV === 'development') {
      logger.info('🔄 Synchronizing database models...');
      await sequelize.sync({ alter: true });
      logger.info('✅ Database models synchronized');
    } else {
      // In production, use migrations instead of sync
      logger.info('⚠️  Production mode: Skipping auto-sync. Use migrations for schema changes.');
    }

    // Start cron jobs
    logger.info('🔄 Starting background jobs...');
    startStreakResetCron();
    logger.info('✅ Cron jobs started');

    // Start HTTP server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info('✅ Server started successfully');
      logger.info(`🚀 Server listening on 0.0.0.0:${PORT}`);
      logger.info(`🔗 API available at http://localhost:${PORT}/api`);
      logger.info(`💊 Health check: http://localhost:${PORT}/health`);
      logger.info(`📊 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: initiating graceful shutdown`);
      
      server.close(async () => {
        logger.info('✅ HTTP server closed');
        
        try {
          const { closeConnection } = await import('./config/database');
          await closeConnection();
          logger.info('✅ All connections closed gracefully');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error: any) {
    logger.error('❌ Unable to start server:', {
      error: error.message,
      stack: error.stack
    });
    
    // Exit with error code
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('🔥 Unhandled Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('🔥 Uncaught Exception:', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Start the server
startServer();

export default app;
