const { google } = require('googleapis');
require('dotenv').config();

console.log('🧪 Testing Google Drive OAuth2 Connection');
console.log('==========================================\n');

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set refresh token
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
} else {
  console.log('❌ GOOGLE_REFRESH_TOKEN not found in .env file');
  process.exit(1);
}

const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function testConnection() {
  try {
    console.log('⏳ Testing connection to Google Drive...');
    
    // Test by listing files (limited to 5)
    const response = await drive.files.list({
      pageSize: 5,
      fields: 'nextPageToken, files(id, name, mimeType)',
    });

    console.log('✅ Connection successful!');
    console.log(`📁 Found ${response.data.files.length} files in your Google Drive:`);
    
    response.data.files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name} (${file.mimeType})`);
    });

    // Test folder creation
    console.log('\n⏳ Testing folder creation...');
    const folderMetadata = {
      name: 'Test-Shala-Shikshak-Folder',
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name',
    });

    console.log('✅ Folder created successfully!');
    console.log(`📁 Folder ID: ${folder.data.id}`);
    console.log(`📁 Folder Name: ${folder.data.name}`);

    // Clean up - delete the test folder
    await drive.files.delete({
      fileId: folder.data.id,
    });

    console.log('🗑️  Test folder deleted');
    console.log('\n🎉 All tests passed! OAuth2 is working correctly.');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('💡 Tip: Your refresh token might be expired. Run get-refresh-token.js again.');
    } else if (error.message.includes('insufficient permissions')) {
      console.log('💡 Tip: Make sure you granted the necessary permissions during OAuth2 flow.');
    }
  }
}

testConnection();
