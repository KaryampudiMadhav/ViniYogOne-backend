import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import OTP from '../models/OTP';
// import passport from '../config/passport';
// import { oauthStatus } from '../config/passport';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { sendOTPEmail, sendWelcomeEmail } from '../services/emailService';
import { generateOTP } from '../utils/otp';
import { logger } from '../utils/logger';

export class AuthController {
  // Signup
  async signup(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { firstName, lastName, email, password, otp } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Verify OTP
      const otpRecord = await OTP.findOne({
        where: {
          email,
          otp,
          purpose: 'signup',
          isUsed: false
        },
        order: [['createdAt', 'DESC']]
      });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }

      if (new Date() > otpRecord.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired'
        });
      }

      // Mark OTP as used
      await otpRecord.update({ isUsed: true });

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        isEmailVerified: true,
        credits: 100,
        badgesCount: 0,
        totalXP: 0,
        level: 1
      });

      // Send welcome email
      await sendWelcomeEmail(email, firstName);

      // Generate tokens
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          token,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Send OTP
  async sendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, purpose = 'signup' } = req.body;

      // For signup, check if user already exists
      if (purpose === 'signup') {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists. Please login instead.'
          });
        }
      }

      // Check if OTP was recently sent (prevent spam)
      const recentOTP = await OTP.findOne({
        where: {
          email,
          purpose,
          isUsed: false
        },
        order: [['createdAt', 'DESC']]
      });

      if (recentOTP) {
        const timeSinceLastOTP = Date.now() - new Date(recentOTP.createdAt).getTime();
        const cooldownPeriod = 60 * 1000; // 1 minute cooldown
        
        if (timeSinceLastOTP < cooldownPeriod && new Date() < recentOTP.expiresAt) {
          const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastOTP) / 1000);
          return res.status(429).json({
            success: false,
            message: `Please wait ${remainingSeconds} seconds before requesting a new OTP`,
            remainingSeconds
          });
        }
      }

      // Generate OTP
      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(
        expiresAt.getMinutes() + parseInt(process.env.OTP_EXPIRES_IN_MINUTES || '10')
      );

      // Save OTP to database
      await OTP.create({
        email,
        otp: otpCode,
        purpose,
        expiresAt
      });

      // Send OTP via email
      await sendOTPEmail(email, otpCode, purpose);

      logger.info(`OTP sent to ${email} for ${purpose}`);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: process.env.OTP_EXPIRES_IN_MINUTES + ' minutes'
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify OTP
  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email, otp, purpose } = req.body;

      const otpRecord = await OTP.findOne({
        where: {
          email,
          otp,
          purpose,
          isUsed: false
        },
        order: [['createdAt', 'DESC']]
      });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }

      if (new Date() > otpRecord.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired'
        });
      }

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email, password, otp } = req.body;

      // Find user
      const user = await User.findOne({ where: { email, isActive: true } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // If OTP is provided, verify OTP-based login
      if (otp) {
        const otpRecord = await OTP.findOne({
          where: {
            email,
            otp,
            purpose: 'login',
            isUsed: false
          },
          order: [['createdAt', 'DESC']]
        });

        if (!otpRecord) {
          return res.status(400).json({
            success: false,
            message: 'Invalid OTP'
          });
        }

        if (new Date() > otpRecord.expiresAt) {
          return res.status(400).json({
            success: false,
            message: 'OTP has expired'
          });
        }

        // Mark OTP as used
        await otpRecord.update({ isUsed: true });
      } else if (password) {
        // Password-based login
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either password or OTP is required'
        });
      }

      // Update last login and streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
      if (lastLogin) {
        lastLogin.setHours(0, 0, 0, 0);
      }

      let streakUpdate = {};
      if (!lastLogin || lastLogin.getTime() !== today.getTime()) {
        // Calculate streak
        const daysDiff = lastLogin
          ? Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
          : 1;

        if (daysDiff === 1) {
          // Continue streak
          const newStreak = user.currentStreak + 1;
          streakUpdate = {
            currentStreak: newStreak,
            longestStreak: Math.max(user.longestStreak, newStreak),
            totalXP: user.totalXP + 10,
            credits: user.credits + 10 // 10 credits for daily login
          };
        } else if (daysDiff > 1) {
          // Reset streak
          streakUpdate = {
            currentStreak: 1,
            totalXP: user.totalXP + 10,
            credits: user.credits + 10
          };
        }
      }

      await user.update({
        lastLoginDate: new Date(),
        ...streakUpdate
      });

      // Generate tokens
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      logger.info(`User logged in: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh Token
  async refreshToken(req: Request, res: Response, _next: NextFunction): Promise<any> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh-secret'
      ) as { userId: string };

      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const newToken = generateToken(user.id);
      const newRefreshToken = generateRefreshToken(user.id);

      res.status(200).json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
  }

  // Forgot Password
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Don't reveal if user exists
        return res.status(200).json({
          success: true,
          message: 'If the email exists, a password reset OTP has been sent'
        });
      }

      // Check if OTP was recently sent (prevent spam)
      const recentOTP = await OTP.findOne({
        where: {
          email,
          purpose: 'reset-password',
          isUsed: false
        },
        order: [['createdAt', 'DESC']]
      });

      if (recentOTP) {
        const timeSinceLastOTP = Date.now() - new Date(recentOTP.createdAt).getTime();
        const cooldownPeriod = 60 * 1000; // 1 minute cooldown
        
        if (timeSinceLastOTP < cooldownPeriod && new Date() < recentOTP.expiresAt) {
          const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastOTP) / 1000);
          return res.status(429).json({
            success: false,
            message: `Please wait ${remainingSeconds} seconds before requesting a new OTP`,
            remainingSeconds
          });
        }
      }

      // Generate and send OTP
      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(
        expiresAt.getMinutes() + parseInt(process.env.OTP_EXPIRES_IN_MINUTES || '10')
      );

      await OTP.create({
        email,
        otp: otpCode,
        purpose: 'reset-password',
        expiresAt
      });

      await sendOTPEmail(email, otpCode, 'reset-password');

      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset OTP has been sent'
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset Password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email, otp, newPassword } = req.body;

      // Verify OTP
      const otpRecord = await OTP.findOne({
        where: {
          email,
          otp,
          purpose: 'reset-password',
          isUsed: false
        },
        order: [['createdAt', 'DESC']]
      });

      if (!otpRecord || new Date() > otpRecord.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // Update password
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({ password: newPassword });
      await otpRecord.update({ isUsed: true });

      logger.info(`Password reset for user: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /*
  // Google OAuth - DISABLED
  googleAuth(req: Request, res: Response, next: NextFunction) {
    if (!oauthStatus.google) {
      return res.status(503).json({
        success: false,
        message: 'Google OAuth is not configured on this server'
      });
    }
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  }

  googleCallback(req: Request, res: Response, next: NextFunction) {
    if (!oauthStatus.google) {
      return res.status(503).json({
        success: false,
        message: 'Google OAuth is not configured on this server'
      });
    }
    passport.authenticate('google', { session: false }, async (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
      }

      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}`
      );
    })(req, res, next);
  }

  // Facebook OAuth - DISABLED
  facebookAuth(req: Request, res: Response, next: NextFunction) {
    if (!oauthStatus.facebook) {
      return res.status(503).json({
        success: false,
        message: 'Facebook OAuth is not configured on this server'
      });
    }
    passport.authenticate('facebook', {
      scope: ['email', 'public_profile']
    })(req, res, next);
  }

  facebookCallback(req: Request, res: Response, next: NextFunction) {
    if (!oauthStatus.facebook) {
      return res.status(503).json({
        success: false,
        message: 'Facebook OAuth is not configured on this server'
      });
    }
    passport.authenticate('facebook', { session: false }, async (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_auth_failed`);
      }

      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}`
      );
    })(req, res, next);
  }

  // LinkedIn OAuth - DISABLED
  linkedinAuth(req: Request, res: Response, next: NextFunction) {
    if (!oauthStatus.linkedin) {
      return res.status(503).json({
        success: false,
        message: 'LinkedIn OAuth is not configured on this server'
      });
    }
    passport.authenticate('linkedin', {
      scope: ['r_emailaddress', 'r_liteprofile']
    })(req, res, next);
  }

  linkedinCallback(req: Request, res: Response, next: NextFunction) {
    if (!oauthStatus.linkedin) {
      return res.status(503).json({
        success: false,
        message: 'LinkedIn OAuth is not configured on this server'
      });
    }
    passport.authenticate('linkedin', { session: false }, async (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=linkedin_auth_failed`);
      }

      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}`
      );
    })(req, res, next);
  }

  // Twitter OAuth - DISABLED
  twitterAuth(req: Request, res: Response, next: NextFunction) {
    if (!oauthStatus.twitter) {
      return res.status(503).json({
        success: false,
        message: 'Twitter OAuth is not configured on this server'
      });
    }
    passport.authenticate('twitter')(req, res, next);
  }

  twitterCallback(req: Request, res: Response, next: NextFunction) {
    if (!oauthStatus.twitter) {
      return res.status(503).json({
        success: false,
        message: 'Twitter OAuth is not configured on this server'
      });
    }
    passport.authenticate('twitter', { session: false }, async (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=twitter_auth_failed`);
      }

      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}`
      );
    })(req, res, next);
  }

  // Instagram OAuth - DISABLED
  instagramAuth(req: Request, res: Response, next: NextFunction) {
    if (!oauthStatus.instagram) {
      return res.status(503).json({
        success: false,
        message: 'Instagram OAuth is not configured on this server'
      });
    }
    passport.authenticate('instagram', {
      scope: ['user_profile']
    })(req, res, next);
  }

  instagramCallback(req: Request, res: Response, next: NextFunction) {
    if (!oauthStatus.instagram) {
      return res.status(503).json({
        success: false,
        message: 'Instagram OAuth is not configured on this server'
      });
    }
    passport.authenticate('instagram', { session: false }, async (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=instagram_auth_failed`);
      }

      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}`
      );
    })(req, res, next);
  }
  */

  // Logout
  async logout(_req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /*
  // Get OAuth Providers Status - DISABLED
  getOAuthStatus(_req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      data: {
        google: oauthStatus.google,
        facebook: oauthStatus.facebook,
        linkedin: oauthStatus.linkedin,
        twitter: oauthStatus.twitter,
        instagram: oauthStatus.instagram
      }
    });
  }
  */

  // Resend Verification Email
  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email } = req.body;

      // Check if user exists and is not verified
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        // Don't reveal if user exists for security
        return res.status(200).json({
          success: true,
          message: 'If the email is registered and unverified, a verification code has been sent'
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified. Please login.'
        });
      }

      // Generate new OTP
      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(
        expiresAt.getMinutes() + parseInt(process.env.OTP_EXPIRES_IN_MINUTES || '10')
      );

      // Save OTP to database
      await OTP.create({
        email,
        otp: otpCode,
        purpose: 'signup',
        expiresAt
      });

      // Send verification email
      const { sendVerificationEmail } = await import('../services/emailService');
      await sendVerificationEmail(email, otpCode, user.firstName);

      logger.info(`Verification email resent to ${email}`);

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
        expiresIn: process.env.OTP_EXPIRES_IN_MINUTES + ' minutes'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Current User
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const user = await User.findByPk((req as any).user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: { user: user.toJSON() }
      });
    } catch (error) {
      next(error);
    }
  }
}
