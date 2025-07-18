/**
 * Utility functions for handling Google Drive URLs
 */

/**
 * Convert Google Drive viewing URL to embedded viewer URL
 * @param url - Google Drive URL
 * @returns Embedded viewer URL
 */
export function getGoogleDriveEmbedUrl(url: string): string {
  if (!url.includes('drive.google.com')) {
    return url;
  }

  // Extract file ID from various Google Drive URL formats
  let fileId: string | null = null;
  
  // Format: https://drive.google.com/file/d/FILE_ID/view
  const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\/view/);
  if (viewMatch) {
    fileId = viewMatch[1];
  }
  
  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    fileId = openMatch[1];
  }
  
  // Format: https://drive.google.com/uc?id=FILE_ID
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) {
    fileId = ucMatch[1];
  }

  if (fileId) {
    // Return embedded viewer URL
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  return url;
}

/**
 * Convert Google Drive URL to direct download URL
 * @param url - Google Drive URL
 * @returns Direct download URL
 */
export function getGoogleDriveDownloadUrl(url: string): string {
  if (!url.includes('drive.google.com')) {
    return url;
  }

  // Extract file ID from various Google Drive URL formats
  let fileId: string | null = null;
  
  const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\/view/);
  if (viewMatch) {
    fileId = viewMatch[1];
  }
  
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    fileId = openMatch[1];
  }

  if (fileId) {
    return `https://drive.google.com/uc?id=${fileId}&export=download`;
  }

  return url;
}

/**
 * Check if URL is a Google Drive URL
 * @param url - URL to check
 * @returns True if it's a Google Drive URL
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

/**
 * Extract file ID from Google Drive URL
 * @param url - Google Drive URL
 * @returns File ID or null if not found
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url.includes('drive.google.com')) {
    return null;
  }

  // Try different URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)\/view/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
