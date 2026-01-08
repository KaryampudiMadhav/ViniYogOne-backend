import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendOTPEmail = async (
  email: string,
  otp: string,
  purpose: string
): Promise<void> => {
  try {
    const purposeText = {
      'signup': 'complete your registration',
      'login': 'verify your login',
      'reset-password': 'reset your password'
    }[purpose] || 'verify your account';

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@viniyogone.com',
      to: email,
      subject: `ViniyogOne - Your OTP Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ViniyogOne</h1>
              <p>Your AI-Powered Financial Companion</p>
            </div>
            <div class="content">
              <h2>Verification Code</h2>
              <p>Hello,</p>
              <p>Use the following OTP to ${purposeText}:</p>
              <div class="otp-box">${otp}</div>
              <p><strong>This code will expire in ${process.env.OTP_EXPIRES_IN_MINUTES || '10'} minutes.</strong></p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ViniyogOne. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

export const sendVerificationEmail = async (
  email: string,
  otp: string,
  firstName?: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@viniyogone.com',
      to: email,
      subject: `ViniyogOne - Verify Your Email`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ViniyogOne</h1>
              <p>Your AI-Powered Financial Companion</p>
            </div>
            <div class="content">
              <h2>Email Verification</h2>
              <p>Hello${firstName ? ' ' + firstName : ''},</p>
              <p>Thank you for signing up with ViniyogOne! To complete your registration, please verify your email address using the OTP below:</p>
              <div class="otp-box">${otp}</div>
              <p><strong>This code will expire in ${process.env.OTP_EXPIRES_IN_MINUTES || '10'} minutes.</strong></p>
              <p>If you didn't create an account with ViniyogOne, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ViniyogOne. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@viniyogone.com',
      to: email,
      subject: 'Welcome to ViniyogOne! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ViniyogOne!</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}! 👋</h2>
              <p>Welcome to ViniyogOne - Your AI-Powered Financial Companion!</p>
              <p><strong>🎁 You've been awarded 100 credits to get started!</strong></p>
              <p>We're excited to have you on board. Here's what you can do:</p>
              <ul>
                <li>📊 Track your investments and portfolio</li>
                <li>🤖 Get AI-powered financial advice</li>
                <li>💰 Open bank accounts and invest in SIPs</li>
                <li>📚 Learn financial literacy through our courses</li>
                <li>🎯 Set and achieve your financial goals</li>
                <li>🏆 Earn credits and badges as you learn and invest</li>
              </ul>
              <a href="${process.env.FRONTEND_URL}" class="button">Get Started</a>
              <p><strong>Pro Tip:</strong> Login daily to maintain your streak and earn bonus credits!</p>
              <p>Start your financial journey today and watch your knowledge (and rewards) grow!</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending welcome email:', error);
  }
};
