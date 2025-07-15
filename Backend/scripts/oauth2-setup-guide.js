/**
 * Simple Google Drive OAuth2 Setup Guide
 * 
 * Since you're getting access_denied errors, follow these steps:
 * 
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Navigate to APIs & Services > OAuth consent screen
 * 3. Add your email (pankajsir.pdfdb@gmail.com) as a test user
 * 4. Navigate to APIs & Services > Credentials
 * 5. Make sure your OAuth 2.0 Client ID has these redirect URIs:
 *    - http://localhost:5000/api/auth/google/callback
 * 6. Enable the Google Drive API if not already enabled
 * 7. Run the token script again
 */

const { google } = require('googleapis');
require('dotenv').config();

console.log('🔧 Google Drive OAuth2 Setup Helper');
console.log('=====================================\n');

// Check environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI'
];

console.log('📋 Checking environment variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'your-refresh-token-here') {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: Missing or placeholder`);
  }
});

console.log('\n📋 Next steps:');
console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
console.log('2. Navigate to APIs & Services > OAuth consent screen');
console.log('3. Add your email as a test user: pankajsir.pdfdb@gmail.com');
console.log('4. Navigate to APIs & Services > Credentials');
console.log('5. Edit your OAuth 2.0 Client ID and add this redirect URI:');
console.log('   http://localhost:5000/api/auth/google/callback');
console.log('6. Enable Google Drive API if not already enabled');
console.log('7. Run this script again after completing the setup');

console.log('\n🔗 Useful links:');
console.log('- Google Cloud Console: https://console.cloud.google.com/');
console.log('- OAuth consent screen: https://console.cloud.google.com/apis/credentials/consent');
console.log('- Credentials page: https://console.cloud.google.com/apis/credentials');
console.log('- Enable Drive API: https://console.cloud.google.com/apis/library/drive.googleapis.com');

// Generate OAuth URL for testing
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
    prompt: 'consent',
  });

  console.log('\n🔗 Test this OAuth URL after completing the setup:');
  console.log(authUrl);
}
