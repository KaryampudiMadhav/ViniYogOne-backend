import passport from 'passport';
import { User } from '../models/User';
import { logger } from '../utils/logger';

// Track which OAuth providers are enabled
export const oauthStatus = {
  google: false,
  facebook: false,
  linkedin: false,
  twitter: false,
  instagram: false
};

const enableGoogleOAuth =
  !!process.env.GOOGLE_CLIENT_ID &&
  !!process.env.GOOGLE_CLIENT_SECRET;

if (enableGoogleOAuth) {
  try {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL:
            process.env.GOOGLE_CALLBACK_URL ||
            'http://localhost:5000/api/auth/google/callback',
        },
        async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
          try {
            let user = await User.findOne({
              where: { googleId: profile.id },
            });

            if (!user) {
              user = await User.findOne({
                where: { email: profile.emails?.[0]?.value },
              });

              if (user) {
                await user.update({ googleId: profile.id });
              } else {
                user = await User.create({
                  googleId: profile.id,
                  email: profile.emails?.[0]?.value || '',
                  firstName: profile.name?.givenName || '',
                  lastName: profile.name?.familyName || '',
                  profilePicture: profile.photos?.[0]?.value || '',
                  isEmailVerified: true,
                  credits: 100, // Initial signup bonus
                  totalXP: 0,
                  level: 1,
                  currentStreak: 1,
                  longestStreak: 1,
                  lastLoginDate: new Date()
                });
                logger.info(`New user registered via Google: ${user.email}`);
                return done(null, user);
              }
            }

            // Update streak for existing user
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
            if (lastLogin) {
              lastLogin.setHours(0, 0, 0, 0);
            }

            let streakUpdate: any = {};
            if (!lastLogin || lastLogin.getTime() !== today.getTime()) {
              const daysDiff = lastLogin
                ? Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
                : 1;

              if (daysDiff === 1) {
                // Continue streak - consecutive login after 24 hours
                const newStreak = user.currentStreak + 1;
                streakUpdate = {
                  currentStreak: newStreak,
                  longestStreak: Math.max(user.longestStreak, newStreak),
                  totalXP: user.totalXP + 10,
                  credits: user.credits + 10, // Reward 10 credits for daily login
                  lastLoginDate: new Date()
                };
                logger.info(`User ${user.email} maintained ${newStreak}-day streak, earned 10 credits`);
              } else if (daysDiff > 1) {
                // Missed days - reset streak
                streakUpdate = {
                  currentStreak: 1,
                  totalXP: user.totalXP + 10,
                  credits: user.credits + 10,
                  lastLoginDate: new Date()
                };
                logger.info(`User ${user.email} streak reset, earned 10 credits`);
              }

              await user.update(streakUpdate);
              // Reload to get updated values
              await user.reload();
            }

            return done(null, user);
          } catch (err) {
            logger.error('Google OAuth error', err);
            return done(err, null);
          }
        }
      )
    );

    oauthStatus.google = true;
    logger.info('✅ Google OAuth ENABLED');
  } catch (error) {
    logger.error('Failed to initialize Google OAuth:', error);
    logger.warn('⚠️ Google OAuth DISABLED (initialization failed)');
  }
} else {
  logger.warn('⚠️ Google OAuth DISABLED (env vars missing)');
}

/* 
// Facebook OAuth Strategy
const enableFacebookOAuth =
  !!process.env.FACEBOOK_APP_ID &&
  !!process.env.FACEBOOK_APP_SECRET;

if (enableFacebookOAuth) {
  try {
    const FacebookStrategy = require('passport-facebook').Strategy;

    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL:
            process.env.FACEBOOK_CALLBACK_URL ||
            'http://localhost:5000/api/auth/facebook/callback',
          profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
        },
        async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
          try {
            let user = await User.findOne({
              where: { facebookId: profile.id },
            });

            if (!user) {
              user = await User.findOne({
                where: { email: profile.emails?.[0]?.value },
              });

              if (user) {
                await user.update({ facebookId: profile.id });
              } else {
                user = await User.create({
                  facebookId: profile.id,
                  email: profile.emails?.[0]?.value || '',
                  firstName: profile.name?.givenName || '',
                  lastName: profile.name?.familyName || '',
                  profilePicture: profile.photos?.[0]?.value || '',
                  isEmailVerified: true,
                });
              }
            }

            return done(null, user);
          } catch (err) {
            logger.error('Facebook OAuth error', err);
            return done(err, null);
          }
        }
      )
    );

    oauthStatus.facebook = true;
    logger.info('✅ Facebook OAuth ENABLED');
  } catch (error) {
    logger.error('Failed to initialize Facebook OAuth:', error);
    logger.warn('⚠️ Facebook OAuth DISABLED (initialization failed)');
  }
} else {
  logger.warn('⚠️ Facebook OAuth DISABLED (env vars missing)');
}

// LinkedIn OAuth Strategy
const enableLinkedInOAuth =
  !!process.env.LINKEDIN_CLIENT_ID &&
  !!process.env.LINKEDIN_CLIENT_SECRET;

if (enableLinkedInOAuth) {
  try {
    const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

    passport.use(
      new LinkedInStrategy(
        {
          clientID: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          callbackURL:
            process.env.LINKEDIN_CALLBACK_URL ||
            'http://localhost:5000/api/auth/linkedin/callback',
          scope: ['r_emailaddress', 'r_liteprofile'],
        },
        async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
          try {
            let user = await User.findOne({
              where: { linkedinId: profile.id },
            });

            if (!user) {
              user = await User.findOne({
                where: { email: profile.emails?.[0]?.value },
              });

              if (user) {
                await user.update({ linkedinId: profile.id });
              } else {
                user = await User.create({
                  linkedinId: profile.id,
                  email: profile.emails?.[0]?.value || '',
                  firstName: profile.name?.givenName || '',
                  lastName: profile.name?.familyName || '',
                  profilePicture: profile.photos?.[0]?.value || '',
                  isEmailVerified: true,
                });
              }
            }

            return done(null, user);
          } catch (err) {
            logger.error('LinkedIn OAuth error', err);
            return done(err, null);
          }
        }
      )
    );

    oauthStatus.linkedin = true;
    logger.info('✅ LinkedIn OAuth ENABLED');
  } catch (error) {
    logger.error('Failed to initialize LinkedIn OAuth:', error);
    logger.warn('⚠️ LinkedIn OAuth DISABLED (initialization failed)');
  }
} else {
  logger.warn('⚠️ LinkedIn OAuth DISABLED (env vars missing)');
}

// Twitter/X OAuth Strategy
const enableTwitterOAuth =
  !!process.env.TWITTER_CONSUMER_KEY &&
  !!process.env.TWITTER_CONSUMER_SECRET;

if (enableTwitterOAuth) {
  try {
    const TwitterStrategy = require('passport-twitter').Strategy;

    passport.use(
      new TwitterStrategy(
        {
          consumerKey: process.env.TWITTER_CONSUMER_KEY,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
          callbackURL:
            process.env.TWITTER_CALLBACK_URL ||
            'http://localhost:5000/api/auth/twitter/callback',
          includeEmail: true,
        },
        async (_token: any, _tokenSecret: any, profile: any, done: any) => {
          try {
            let user = await User.findOne({
              where: { twitterId: profile.id },
            });

            if (!user) {
              user = await User.findOne({
                where: { email: profile.emails?.[0]?.value },
              });

              if (user) {
                await user.update({ twitterId: profile.id });
              } else {
                user = await User.create({
                  twitterId: profile.id,
                  email: profile.emails?.[0]?.value || '',
                  firstName: profile.displayName?.split(' ')[0] || '',
                  lastName: profile.displayName?.split(' ')[1] || '',
                  profilePicture: profile.photos?.[0]?.value || '',
                  isEmailVerified: true,
                });
              }
            }

            return done(null, user);
          } catch (err) {
            logger.error('Twitter OAuth error', err);
            return done(err, null);
          }
        }
      )
    );

    oauthStatus.twitter = true;
    logger.info('✅ Twitter OAuth ENABLED');
  } catch (error) {
    logger.error('Failed to initialize Twitter OAuth:', error);
    logger.warn('⚠️ Twitter OAuth DISABLED (initialization failed)');
  }
} else {
  logger.warn('⚠️ Twitter OAuth DISABLED (env vars missing)');
}

// Instagram OAuth Strategy
const enableInstagramOAuth =
  !!process.env.INSTAGRAM_CLIENT_ID &&
  !!process.env.INSTAGRAM_CLIENT_SECRET;

if (enableInstagramOAuth) {
  try {
    const InstagramStrategy = require('passport-instagram').Strategy;

    passport.use(
      new InstagramStrategy(
        {
          clientID: process.env.INSTAGRAM_CLIENT_ID,
          clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
          callbackURL:
            process.env.INSTAGRAM_CALLBACK_URL ||
            'http://localhost:5000/api/auth/instagram/callback',
        },
        async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
          try {
            let user = await User.findOne({
              where: { instagramId: profile.id },
            });

            if (!user) {
              // Instagram doesn't provide email by default, so we'll need to handle this
              const email = profile.emails?.[0]?.value || `${profile.username}@instagram.placeholder`;
              
              user = await User.findOne({
                where: { email: email },
              });

              if (user && user.email.includes('@instagram.placeholder')) {
                await user.update({ instagramId: profile.id });
              } else if (!user) {
                user = await User.create({
                  instagramId: profile.id,
                  email: email,
                  firstName: profile.displayName?.split(' ')[0] || profile.username || 'Instagram',
                  lastName: profile.displayName?.split(' ')[1] || 'User',
                  profilePicture: profile.photos?.[0]?.value || '',
                  isEmailVerified: false, // Instagram doesn't verify emails
                  credits: 100,
                  badgesCount: 0,
                  totalXP: 0,
                  level: 1
                });
              }
            }

            return done(null, user);
          } catch (err) {
            logger.error('Instagram OAuth error', err);
            return done(err, null);
          }
        }
      )
    );

    oauthStatus.instagram = true;
    logger.info('✅ Instagram OAuth ENABLED');
  } catch (error) {
    logger.error('Failed to initialize Instagram OAuth:', error);
    logger.warn('⚠️ Instagram OAuth DISABLED (initialization failed)');
  }
} else {
  logger.warn('⚠️ Instagram OAuth DISABLED (env vars missing)');
}
*/

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
