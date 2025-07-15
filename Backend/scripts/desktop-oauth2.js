/**
 * Desktop OAuth2 Flow for Google Drive
 * This uses the installed application flow which doesn't require web server
 */

const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

console.log('🖥️  Desktop OAuth2 Flow for Google Drive');
console.log('==========================================\n');

// For desktop applications, we can use a different redirect URI
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob' // Out-of-band flow for desktop apps
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
  prompt: 'consent',
});

console.log('📋 Desktop OAuth2 Steps:');
console.log('1. Open this URL in your browser:');
console.log('   ' + authUrl);
console.log('\n2. Sign in with your Google account');
console.log('3. Allow access to your Google Drive');
console.log('4. Copy the authorization code shown on the success page');
console.log('5. Paste it below when prompted\n');

console.log('💡 Note: This flow should work even if your app is not published\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('🔑 Enter the authorization code: ', async (code) => {
  try {
    console.log('\n⏳ Exchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ Success! Tokens received.');
    console.log('\n📋 Update your .env file with this refresh token:');
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    
    console.log('\n🔧 Token Details:');
    console.log('- Access Token:', tokens.access_token ? '✅ Received' : '❌ Not received');
    console.log('- Refresh Token:', tokens.refresh_token ? '✅ Received' : '❌ Not received');
    console.log('- Scopes:', tokens.scope);
    console.log('- Expires:', new Date(tokens.expiry_date).toLocaleString());
    
    if (!tokens.refresh_token) {
      console.log('\n⚠️  No refresh token received. Try revoking permissions and running again.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('invalid_grant')) {
      console.log('💡 Make sure you copied the authorization code correctly.');
    }
  }
  
  rl.close();
});
