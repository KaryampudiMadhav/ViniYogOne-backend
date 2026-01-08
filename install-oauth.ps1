# Social Authentication Setup Script for Windows
Write-Host "Installing required passport strategies for social authentication..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location $PSScriptRoot

# Install passport strategies
npm install passport-facebook passport-linkedin-oauth2 passport-twitter

Write-Host ""
Write-Host "✅ All passport strategies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy .env.example to .env"
Write-Host "2. Add your OAuth credentials to .env file"
Write-Host "3. Read SOCIAL_AUTH_SETUP.md for detailed setup instructions"
Write-Host "4. Restart your server"
