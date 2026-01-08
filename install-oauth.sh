#!/bin/bash

# Social Authentication Setup Script
echo "Installing required passport strategies for social authentication..."

cd "$(dirname "$0")"

# Install passport strategies
npm install passport-facebook passport-linkedin-oauth2 passport-twitter

echo "✅ All passport strategies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Add your OAuth credentials to .env file"
echo "3. Read SOCIAL_AUTH_SETUP.md for detailed setup instructions"
echo "4. Restart your server"
