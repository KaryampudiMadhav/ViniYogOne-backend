import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import streakRoutes from './streakRoutes';
import achievementRoutes from './achievementRoutes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/streaks', streakRoutes);
router.use('/achievements', achievementRoutes);

// API documentation endpoint
router.get('/', (_req, res) => {
  res.json({
    message: 'ViniyogOne API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      streaks: '/api/streaks',
      achievements: '/api/achievements'
    },
    documentation: '/api/docs'
  });
});

export default router;
