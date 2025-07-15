const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

console.log('🚀 Google Drive OAuth2 Token Generator');
console.log('=====================================\n');

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // Use the same redirect URI as configured in Google Cloud Console
);

// Generate the auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
  prompt: 'consent', // Force consent to get refresh token
});

console.log('📋 Follow these steps to get your refresh token:\n');
console.log('1. Copy and paste this URL into your browser:');
console.log('   ' + authUrl);
console.log('\n2. Sign in with your Google account');
console.log('3. Allow access to your Google Drive');
console.log('4. You will be redirected to http://localhost:5000/api/auth/google/callback');
console.log('5. Copy the "code" parameter from the URL (everything after "code=")');
console.log('6. Paste it below when prompted\n');
console.log('💡 Note: The redirect page may show an error, but focus on copying the code from the URL\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('🔑 Enter the authorization code: ', async (code) => {
  try {
    console.log('\n⏳ Exchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ Success! Tokens received.');
    console.log('\n📋 Add this line to your .env file:');
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    
    console.log('\n🔧 Token Details:');
    console.log('- Access Token:', tokens.access_token ? '✅ Received' : '❌ Not received');
    console.log('- Refresh Token:', tokens.refresh_token ? '✅ Received' : '❌ Not received');
    console.log('- Scopes:', tokens.scope);
    console.log('- Expires:', new Date(tokens.expiry_date).toLocaleString());
    
    if (!tokens.refresh_token) {
      console.log('\n⚠️  Warning: No refresh token received. This might happen if you\'ve already authorized this app.');
      console.log('   Try revoking app permissions and running this script again.');
    }
    
  } catch (error) {
    console.error('\n❌ Error getting tokens:', error.message);
    if (error.message.includes('invalid_grant')) {
      console.log('💡 Tip: Make sure you copied the authorization code correctly and try again.');
    }
  }
  
  rl.close();
});
