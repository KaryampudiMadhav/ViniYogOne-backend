import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { authValidation } from '../validators/authValidator';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

// Public routes with rate limiting
router.post(
  '/signup',
  rateLimiter.signup,
  validateRequest(authValidation.signup),
  authController.signup
);

router.post(
  '/send-otp',
  rateLimiter.otp,
  validateRequest(authValidation.sendOTP),
  authController.sendOTP
);

router.post(
  '/verify-otp',
  rateLimiter.otp,
  validateRequest(authValidation.verifyOTP),
  authController.verifyOTP
);

router.post(
  '/login',
  rateLimiter.login,
  validateRequest(authValidation.login),
  authController.login
);

router.post(
  '/refresh-token',
  validateRequest(authValidation.refreshToken),
  authController.refreshToken
);

router.post(
  '/forgot-password',
  rateLimiter.otp,
  validateRequest(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest(authValidation.resetPassword),
  authController.resetPassword
);

router.post(
  '/resend-verification',
  rateLimiter.otp,
  validateRequest(authValidation.resendVerification),
  authController.resendVerification
);

// Get OAuth providers status
router.get('/oauth-status', authController.getOAuthStatus);

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Facebook OAuth routes
router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', authController.facebookCallback);

// LinkedIn OAuth routes
router.get('/linkedin', authController.linkedinAuth);
router.get('/linkedin/callback', authController.linkedinCallback);

// Twitter OAuth routes
router.get('/twitter', authController.twitterAuth);
router.get('/twitter/callback', authController.twitterCallback);

// Instagram OAuth routes
router.get('/instagram', authController.instagramAuth);
router.get('/instagram/callback', authController.instagramCallback);

// Protected routes
router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

router.get(
  '/me',
  authenticateToken,
  authController.getCurrentUser
);

export default router;
