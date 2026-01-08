#!/bin/bash

# Quick fix script to run on AWS EC2 server
# This removes corrupted node_modules and rebuilds

echo "🧹 Removing corrupted node_modules..."
rm -rf /home/ec2-user/backend/node_modules
rm -rf /home/ec2-user/backend/dist

echo "📥 Installing dependencies from scratch..."
cd /home/ec2-user/backend
npm install --production=false

echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build completed!"
echo "📦 Starting application..."

# Install PM2 if needed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Restart application
pm2 delete viniyogone-backend 2>/dev/null || true
pm2 start dist/server.js --name viniyogone-backend
pm2 save

echo ""
echo "✅ Application is running!"
pm2 status
