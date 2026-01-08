#!/usr/bin/env node

/**
 * ViniyogOne Authentication Testing Script
 * 
 * This script helps you test the authentication endpoints
 * Usage: node test-auth.js
 */

const readline = require('readline');
const axios = require('axios');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api/auth';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.blue}${prompt}${colors.reset}`, resolve);
  });
}

async function testSendOTP() {
  log('\n=== Testing Send OTP ===\n', 'magenta');
  
  const email = await question('Enter email: ');
  const purpose = await question('Enter purpose (signup/login/reset-password): ');

  try {
    const response = await axios.post(`${BASE_URL}/send-otp`, {
      email,
      purpose: purpose || 'signup'
    });

    log('\n✅ Success!', 'green');
    console.log(JSON.stringify(response.data, null, 2));
    return { email, purpose };
  } catch (error) {
    log('\n❌ Error!', 'red');
    console.log(error.response?.data || error.message);
    return null;
  }
}

async function testSignup() {
  log('\n=== Testing Signup ===\n', 'magenta');
  
  const firstName = await question('First Name: ');
  const lastName = await question('Last Name: ');
  const email = await question('Email: ');
  const password = await question('Password: ');
  const otp = await question('OTP (from email): ');

  try {
    const response = await axios.post(`${BASE_URL}/signup`, {
      firstName,
      lastName,
      email,
      password,
      otp
    });

    log('\n✅ Signup Successful!', 'green');
    console.log(JSON.stringify(response.data, null, 2));
    
    log('\n📝 Save these tokens:', 'yellow');
    log(`Access Token: ${response.data.data.token}`, 'yellow');
    log(`Refresh Token: ${response.data.data.refreshToken}`, 'yellow');
    
    return response.data.data;
  } catch (error) {
    log('\n❌ Error!', 'red');
    console.log(JSON.stringify(error.response?.data || error.message, null, 2));
    return null;
  }
}

async function testLogin() {
  log('\n=== Testing Login ===\n', 'magenta');
  
  const email = await question('Email: ');
  const loginMethod = await question('Login with (1) Password or (2) OTP? Enter 1 or 2: ');

  let data = { email };

  if (loginMethod === '1') {
    const password = await question('Password: ');
    data.password = password;
  } else {
    const otp = await question('OTP (from email): ');
    data.otp = otp;
  }

  try {
    const response = await axios.post(`${BASE_URL}/login`, data);

    log('\n✅ Login Successful!', 'green');
    console.log(JSON.stringify(response.data, null, 2));
    
    log('\n📝 Save these tokens:', 'yellow');
    log(`Access Token: ${response.data.data.token}`, 'yellow');
    log(`Refresh Token: ${response.data.data.refreshToken}`, 'yellow');
    
    return response.data.data;
  } catch (error) {
    log('\n❌ Error!', 'red');
    console.log(JSON.stringify(error.response?.data || error.message, null, 2));
    return null;
  }
}

async function testGetProfile() {
  log('\n=== Testing Get Profile ===\n', 'magenta');
  
  const token = await question('Enter JWT Token: ');

  try {
    const response = await axios.get(`${BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    log('\n✅ Success!', 'green');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    log('\n❌ Error!', 'red');
    console.log(JSON.stringify(error.response?.data || error.message, null, 2));
    return null;
  }
}

async function testPasswordReset() {
  log('\n=== Testing Password Reset ===\n', 'magenta');
  
  const email = await question('Email: ');

  // Step 1: Request OTP
  try {
    log('\nStep 1: Requesting password reset OTP...', 'blue');
    await axios.post(`${BASE_URL}/forgot-password`, { email });
    log('✅ OTP sent to email!', 'green');
  } catch (error) {
    log('❌ Failed to send OTP', 'red');
    console.log(error.response?.data || error.message);
    return;
  }

  // Step 2: Reset password
  const otp = await question('OTP (from email): ');
  const newPassword = await question('New Password: ');

  try {
    const response = await axios.post(`${BASE_URL}/reset-password`, {
      email,
      otp,
      newPassword
    });

    log('\n✅ Password Reset Successful!', 'green');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    log('\n❌ Error!', 'red');
    console.log(JSON.stringify(error.response?.data || error.message, null, 2));
  }
}

async function main() {
  log('\n╔═══════════════════════════════════════════╗', 'magenta');
  log('║   ViniyogOne Authentication Tester   ║', 'magenta');
  log('╚═══════════════════════════════════════════╝\n', 'magenta');

  log(`Using API Base URL: ${BASE_URL}\n`, 'blue');

  while (true) {
    log('\n--- Main Menu ---', 'yellow');
    log('1. Send OTP');
    log('2. Test Signup');
    log('3. Test Login');
    log('4. Get User Profile');
    log('5. Test Password Reset');
    log('6. Exit\n');

    const choice = await question('Select an option (1-6): ');

    switch (choice) {
      case '1':
        await testSendOTP();
        break;
      case '2':
        await testSignup();
        break;
      case '3':
        await testLogin();
        break;
      case '4':
        await testGetProfile();
        break;
      case '5':
        await testPasswordReset();
        break;
      case '6':
        log('\n👋 Goodbye!\n', 'green');
        rl.close();
        process.exit(0);
      default:
        log('\n❌ Invalid option. Please try again.', 'red');
    }
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log('\n❌ Unhandled Error:', 'red');
  console.error(error);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  log('\n\n👋 Goodbye!\n', 'green');
  process.exit(0);
});

// Start the script
main().catch((error) => {
  log('\n❌ Fatal Error:', 'red');
  console.error(error);
  process.exit(1);
});
