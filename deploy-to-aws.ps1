# Deploy Backend to AWS EC2
# This script uploads the backend code and sets up the environment

$SERVER = "ec2-user@13.49.183.229"
$KEY_PATH = "$HOME\Downloads\viniyogone-key.pem"
$REMOTE_DIR = "/home/ec2-user/backend"

Write-Host "🚀 Deploying ViniyogOne Backend to AWS EC2..." -ForegroundColor Cyan

# Upload files (excluding node_modules)
Write-Host "📦 Uploading files..." -ForegroundColor Yellow
scp -i $KEY_PATH -r `
  src `
  package.json `
  tsconfig.json `
  "${SERVER}:${REMOTE_DIR}/"

Write-Host "🔧 Installing dependencies and building on server..." -ForegroundColor Yellow

# Execute commands on server
$commands = @"
cd /home/ec2-user/backend
echo '🧹 Cleaning old build...'
rm -rf node_modules dist
echo '📥 Installing dependencies...'
npm install --production=false
echo '🔨 Building TypeScript...'
npm run build
if ! command -v pm2 &> /dev/null; then
    echo '📦 Installing PM2...'
    npm install -g pm2
fi
echo '♻️  Restarting application...'
pm2 delete viniyogone-backend 2>/dev/null || true
pm2 start dist/server.js --name viniyogone-backend
pm2 save
echo '✅ Deployment completed!'
pm2 status
"@

ssh -i $KEY_PATH $SERVER $commands

Write-Host ""
Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
Write-Host "🌐 API URL: http://13.49.183.229:5000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "To check logs: ssh -i $KEY_PATH $SERVER 'pm2 logs viniyogone-backend'" -ForegroundColor Gray
Write-Host "To check status: ssh -i $KEY_PATH $SERVER 'pm2 status'" -ForegroundColor Gray
