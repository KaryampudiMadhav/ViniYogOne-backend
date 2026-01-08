# ViniyogOne API Testing Guide

## 📦 Postman Collection Files

This folder contains Postman collection and environment files for testing the ViniyogOne backend API.

### Files Included:
1. **ViniyogOne-API-Tests.postman_collection.json** - Complete API test collection
2. **ViniyogOne-Local.postman_environment.json** - Local development environment
3. **ViniyogOne-Production.postman_environment.json** - Production environment

---

## 🚀 Quick Start

### Import into Postman:
1. Open Postman
2. Click **Import** button
3. Drag and drop all 3 JSON files
4. Select the appropriate environment (Local or Production)

---

## 📋 Test Flow

### Complete Signup & Login Flow:

#### **Step 1: Send OTP for Signup**
```
POST /api/auth/send-otp
{
  "email": "your-email@example.com",
  "purpose": "signup"
}
```
✅ Check your email for the 6-digit OTP code

#### **Step 2: Verify OTP**
```
POST /api/auth/verify-otp
{
  "email": "your-email@example.com",
  "otp": "123456",
  "purpose": "signup"
}
```

#### **Step 3: Complete Signup**
```
POST /api/auth/signup
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "your-email@example.com",
  "password": "Test@123",
  "otp": "123456"
}
```
✅ You'll receive:
- User profile
- Access token (saved automatically)
- Refresh token (saved automatically)

#### **Step 4: Login (Password Method)**
```
POST /api/auth/login
{
  "email": "your-email@example.com",
  "password": "Test@123"
}
```

#### **Alternative: Login with OTP**
1. Request OTP:
```
POST /api/auth/send-otp
{
  "email": "your-email@example.com",
  "purpose": "login"
}
```

2. Login with OTP:
```
POST /api/auth/login
{
  "email": "your-email@example.com",
  "otp": "123456"
}
```

---

## 🔐 Protected Endpoints

These require the `Authorization: Bearer {{accessToken}}` header (automatically added):

### Get Current User
```
GET /api/auth/me
```

### Get User Streak
```
GET /api/streaks/current
```

### Update Profile
```
PUT /api/users/profile
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

---

## 🔄 Password Reset Flow

#### **Step 1: Request Password Reset**
```
POST /api/auth/forgot-password
{
  "email": "your-email@example.com"
}
```
✅ Check email for OTP

#### **Step 2: Reset Password**
```
POST /api/auth/reset-password
{
  "email": "your-email@example.com",
  "otp": "123456",
  "newPassword": "NewPass@123"
}
```

---

## 📧 Email Verification

### Resend Verification Email
For users who signed up but didn't verify:
```
POST /api/auth/resend-verification
{
  "email": "your-email@example.com"
}
```

---

## 🔑 Token Management

### Refresh Access Token
When your access token expires (15 minutes):
```
POST /api/auth/refresh-token
{
  "refreshToken": "{{refreshToken}}"
}
```

---

## ✅ Test Results

The collection includes automatic tests that verify:
- ✅ Correct HTTP status codes
- ✅ Response structure
- ✅ Token generation
- ✅ Automatic token storage in environment variables

---

## 🌐 Environment Variables

### AWS EC2 Environment (Primary):
- **baseUrl**: `http://13.53.148.81:5000`
- Use "ViniyogOne - AWS EC2" environment

### Local Development (Optional):
- **baseUrl**: `http://localhost:5000`
- Use "ViniyogOne - Development" environment
- Only if running backend locally

### Auto-saved Variables:
- **accessToken**: JWT access token (expires in 15 min)
- **refreshToken**: JWT refresh token (expires in 7 days)

---

## 📝 Password Requirements

All passwords must contain:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

Example: `Test@123`

---

## ⏱️ OTP Information

- **Length**: 6 digits
- **Expiry**: 10 minutes
- **Purposes**: signup, login, reset-password
- Rate limited to prevent abuse

---

## 🎯 OAuth Testing

### Check OAuth Status
```
GET /api/auth/oauth-status
```

Returns which OAuth providers are configured:
- Google
- Facebook
- LinkedIn
- Twitter
- Instagram

---

## 🛠️ Tips

1. **Run in sequence**: Execute requests from top to bottom for best results
2. **Check email**: Real OTPs are sent to your email address
3. **Token auto-save**: Access and refresh tokens are automatically saved
4. **Error messages**: Read response messages for troubleshooting
5. **Rate limiting**: Don't spam requests, there are rate limits

---

## 📊 Gamification Features

After login, check your:
- **Credits**: Starting balance of 100 credits
- **Current Streak**: Login daily to maintain streak
- **Total XP**: Earn 10 XP per daily login
- **Level**: Progress as you earn XP
- **Badges**: Unlock achievements

---

## 🐛 Common Issues

### "Invalid OTP"
- OTP expired (10 min limit)
- Wrong OTP entered
- OTP already used

### "Email already exists"
- User already registered
- Use login instead or different email

### "Unauthorized"
- Access token expired
- Use refresh token endpoint
- Login again

### "Email not verified"
- Complete signup flow with OTP
- Use resend-verification endpoint

---

## 📞 Support

For issues or questions:
- Check the response error messages
- Verify email configuration in backend/.env
- Check backend logs for detailed errors

---

**Happy Testing! 🎉**
