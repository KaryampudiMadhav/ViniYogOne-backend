import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { userValidation } from '../validators/userValidator';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put(
  '/profile',
  validateRequest(userValidation.updateProfile),
  userController.updateProfile
);

// Get user stats
router.get('/stats', userController.getStats);

// Get user achievements
router.get('/achievements', userController.getAchievements);

// Update user preferences
router.put(
  '/preferences',
  validateRequest(userValidation.updatePreferences),
  userController.updatePreferences
);

export default router;
