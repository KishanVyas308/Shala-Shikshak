const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob' // Use out-of-band redirect for console apps
);

// Generate the auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
  prompt: 'consent',
});

console.log('🔗 Authorization URL:', authUrl);
console.log('\n📋 Steps to get your refresh token:');
console.log('1. Open the URL above in your browser');
console.log('2. Sign in with your Google account');
console.log('3. Grant permissions');
console.log('4. Copy the authorization code from the page');
console.log('5. Paste it below when prompted');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n🔑 Enter the authorization code: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ Success! Here are your tokens:');
    console.log('📋 Copy this refresh token to your .env file:');
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    
    console.log('\n🔧 Full token information:');
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Scope:', tokens.scope);
    console.log('Token Type:', tokens.token_type);
    console.log('Expiry Date:', new Date(tokens.expiry_date).toISOString());
    
  } catch (error) {
    console.error('❌ Error getting tokens:', error.message);
  }
  
  rl.close();
});
