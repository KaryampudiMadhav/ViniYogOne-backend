#!/bin/bash

# ViniyogOne Backend - AWS Deployment Script
# This script automates the deployment process to AWS Elastic Beanstalk

set -e  # Exit on error

echo "🚀 ViniyogOne Backend - AWS Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo -e "${RED}❌ Elastic Beanstalk CLI is not installed. Please install it first.${NC}"
    echo "Install with: pip install awsebcli"
    exit 1
fi

# Build the application
echo -e "${YELLOW}📦 Building application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Deploy to Elastic Beanstalk
echo -e "${YELLOW}🚀 Deploying to AWS Elastic Beanstalk...${NC}"
eb deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment completed successfully${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Check application health
echo -e "${YELLOW}🏥 Checking application health...${NC}"
eb health

# Display deployment information
echo ""
echo -e "${GREEN}=============================================="
echo "✅ Deployment Summary"
echo "=============================================="
echo "Environment: $(eb list | grep '\*' | sed 's/\* //')"
echo "URL: $(eb status | grep 'CNAME' | awk '{print $2}')"
echo "Status: $(eb status | grep 'Status' | awk '{print $2}')"
echo "=============================================="
echo -e "${NC}"

# Optional: Open the application in browser
read -p "Would you like to open the application in your browser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    eb open
fi

echo -e "${GREEN}🎉 Deployment completed!${NC}"
