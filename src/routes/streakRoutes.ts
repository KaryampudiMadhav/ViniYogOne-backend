import { Router } from 'express';
import { StreakController } from '../controllers/streakController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const streakController = new StreakController();

// All streak routes require authentication
router.use(authenticateToken);

// Get current streak
router.get('/current', streakController.getCurrentStreak);

// Get streak history
router.get('/history', streakController.getStreakHistory);

// Use streak freeze
router.post('/freeze', streakController.useStreakFreeze);

// Record streak activity
router.post('/activity', streakController.recordActivity);

export default router;
