import { Router } from 'express';
import { AchievementController } from '../controllers/achievementController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const achievementController = new AchievementController();

// All achievement routes require authentication
router.use(authenticateToken);

// Get all achievements for user
router.get('/', achievementController.getUserAchievements);

// Get achievement statistics
router.get('/stats', achievementController.getAchievementStats);

export default router;
