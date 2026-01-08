# ViniyogOne Backend - AWS Deployment Script (PowerShell)
# This script automates the deployment process to AWS Elastic Beanstalk

Write-Host "🚀 ViniyogOne Backend - AWS Deployment Script" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Check if AWS CLI is installed
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if EB CLI is installed
if (-not (Get-Command eb -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Elastic Beanstalk CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Install with: pip install awsebcli" -ForegroundColor Yellow
    exit 1
}

# Build the application
Write-Host "📦 Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Deploy to Elastic Beanstalk
Write-Host "🚀 Deploying to AWS Elastic Beanstalk..." -ForegroundColor Yellow
eb deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

# Check application health
Write-Host "🏥 Checking application health..." -ForegroundColor Yellow
eb health

# Display deployment information
Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "✅ Deployment Summary" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

$envList = eb list
$currentEnv = $envList | Where-Object { $_ -match '\*' } | ForEach-Object { $_ -replace '\* ', '' }
Write-Host "Environment: $currentEnv" -ForegroundColor White

$status = eb status
$cname = ($status | Select-String "CNAME").ToString().Split()[-1]
$statusValue = ($status | Select-String "Status").ToString().Split()[-1]

Write-Host "URL: $cname" -ForegroundColor White
Write-Host "Status: $statusValue" -ForegroundColor White
Write-Host "==============================================" -ForegroundColor Green

# Optional: Open the application in browser
$response = Read-Host "Would you like to open the application in your browser? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    eb open
}

Write-Host "🎉 Deployment completed!" -ForegroundColor Green
