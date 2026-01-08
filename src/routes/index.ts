import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import streakRoutes from './streakRoutes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/streaks', streakRoutes);

// API documentation endpoint
router.get('/', (_req, res) => {
  res.json({
    message: 'ViniyogOne API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      streaks: '/api/streaks'
    },
    documentation: '/api/docs'
  });
});

export default router;
