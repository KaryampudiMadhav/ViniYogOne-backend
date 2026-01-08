# ViniyogOne Backend - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (AWS RDS)
- Git

### Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Run migrations
NODE_ENV=production npx sequelize-cli db:migrate

# Build TypeScript
npm run build

# Start server
npm start
```

## 🏗️ Database Setup

### 1. AWS RDS PostgreSQL Configuration
- Enable SSL connections
- Configure security groups to allow EC2 access
- Add inbound rule for port 5432

### 2. Run Migrations
```bash
# Development
npm run migrate

# Production
NODE_ENV=production npx sequelize-cli db:migrate
```

### 3. Migration Order
1. `20260105000001-create-users.js` - Base users table
2. `20260105000002-create-otps.js` - OTP verification
3. `20260105000003-create-achievements.js` - User achievements
4. `20260105000004-create-streak-history.js` - Streak tracking
5. `20260106000001-add-credits-and-badges-to-users.js` - Gamification
6. `20260107000001-add-instagram-to-users.js` - Instagram OAuth

## 🔧 EC2 Deployment

### 1. Connect to EC2
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 2. Install Node.js
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 3. Clone & Setup
```bash
git clone https://github.com/KaryampudiMadhav/ViniYogOne-backend.git
cd ViniYogOne-backend
npm install
```

### 4. Configure Environment
```bash
nano .env
# Add your production variables
```

### 5. Run Migrations
```bash
NODE_ENV=production npx sequelize-cli db:migrate
```

### 6. Build & Start
```bash
npm run build
npm start
```

## 🔄 Process Management with PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/server.js --name viniyogone-api

# Auto-restart on server reboot
pm2 startup
pm2 save

# Monitor
pm2 monit

# Logs
pm2 logs viniyogone-api

# Restart
pm2 restart viniyogone-api
```

## 🔐 Security Checklist

- ✅ SSL enabled for RDS
- ✅ Security groups configured
- ✅ Environment variables secured
- ✅ Helmet middleware enabled
- ✅ Rate limiting implemented
- ✅ JWT authentication
- ✅ CORS configured

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/linkedin` - LinkedIn OAuth

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/achievements` - Get achievements

### Streaks
- `GET /api/streaks/current` - Current streak
- `GET /api/streaks/history` - Streak history
- `POST /api/streaks/activity` - Record activity
- `POST /api/streaks/freeze` - Use streak freeze

### Achievements
- `GET /api/achievements` - All achievements
- `GET /api/achievements/stats` - Achievement stats

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test API
curl http://localhost:5000/api
```

## 📝 Logs

Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check security groups
# Verify RDS endpoint
# Test connection:
psql -h your-rds-endpoint -U postgres -d viniyogone
```

### Migration Errors
```bash
# Check migration status
NODE_ENV=production npx sequelize-cli db:migrate:status

# Rollback if needed
NODE_ENV=production npx sequelize-cli db:migrate:undo
```

### SSL Issues
Ensure `dialectOptions.ssl.require: true` in config/config.js

## 🔄 Updates & Maintenance

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run new migrations
NODE_ENV=production npx sequelize-cli db:migrate

# Rebuild
npm run build

# Restart PM2
pm2 restart viniyogone-api
```

## 📞 Support

For issues, contact the development team or check logs:
```bash
pm2 logs viniyogone-api --lines 100
```
