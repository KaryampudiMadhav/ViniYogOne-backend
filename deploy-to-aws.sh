#!/bin/bash

# Deploy Backend to AWS EC2
# This script uploads the backend code and sets up the environment

SERVER="ec2-user@13.49.183.229"
KEY_PATH="~/Downloads/viniyogone-key.pem"
REMOTE_DIR="/home/ec2-user/backend"

echo "🚀 Deploying ViniyogOne Backend to AWS EC2..."

# Create deployment package (excluding node_modules)
echo "📦 Creating deployment package..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.env' \
  --exclude 'logs' \
  --exclude '.git' \
  -e "ssh -i $KEY_PATH" \
  ./ $SERVER:$REMOTE_DIR/

echo "🔧 Installing dependencies and building on server..."
ssh -i $KEY_PATH $SERVER << 'ENDSSH'
cd /home/ec2-user/backend

# Remove old node_modules and dist
echo "🧹 Cleaning old build..."
rm -rf node_modules dist

# Install dependencies
echo "📥 Installing dependencies..."
npm install --production=false

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Restart the application
echo "♻️  Restarting application..."
pm2 delete viniyogone-backend 2>/dev/null || true
pm2 start dist/server.js --name viniyogone-backend
pm2 save

echo "✅ Deployment completed!"
pm2 status
ENDSSH

echo ""
echo "✅ Backend deployed successfully!"
echo "🌐 API URL: http://13.49.183.229:5000/api"
echo ""
echo "To check logs: ssh -i $KEY_PATH $SERVER 'pm2 logs viniyogone-backend'"
echo "To check status: ssh -i $KEY_PATH $SERVER 'pm2 status'"
