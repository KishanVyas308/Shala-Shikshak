# PDF Compression Feature

## Overview
The backend now includes automatic PDF compression using Ghostscript to reduce file sizes for better performance and storage optimization.

## Requirements
- **Ghostscript** must be installed on the system for PDF compression to work
- Install Ghostscript from: https://www.ghostscript.com/download/gsdnld.html

## How it works

### Automatic Compression
- Files larger than 2MB are automatically compressed by default
- Compression uses the `ebook` quality setting for optimal balance between size and quality
- Original and compressed file sizes are reported in the upload response

### Manual Control
You can control compression behavior by sending a `compress` parameter:
```bash
# Force compression OFF
curl -X POST /api/upload/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "pdf=@your-file.pdf" \
  -F "compress=false"

# Force compression ON (default for files > 2MB)
curl -X POST /api/upload/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "pdf=@your-file.pdf" \
  -F "compress=true"
```

### Response Format
```json
{
  "message": "File uploaded and compressed successfully",
  "fileId": "uuid-here",
  "fileName": "compressed-filename.pdf",
  "originalName": "original-name.pdf",
  "size": "1234567",
  "originalSize": "3456789",
  "compressionRatio": "64%",
  "url": "http://localhost:5000/uploads/compressed-filename.pdf",
  "filePath": "/path/to/compressed-filename.pdf"
}
```

## Status Check
Check if Ghostscript is available:
```bash
curl -X GET /api/upload/compression-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "ghostscriptAvailable": true,
  "compressionEnabled": true,
  "message": "PDF compression is available and enabled"
}
```

## Fallback Behavior
- If Ghostscript is not installed, files upload normally without compression
- If compression fails, the original file is used automatically
- No errors are thrown - the system gracefully falls back to original files

## Compression Settings
Current settings optimize for web viewing:
- Quality: `ebook` (good balance of size vs quality)
- Compatibility: PDF 1.4 (broad compatibility)
- Ghostscript command: `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH`

## Installation on Different Systems

### Windows
1. Download Ghostscript from the official website
2. Install and ensure `gs` is in your PATH
3. Verify with: `gs --version`

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install ghostscript
```

### macOS
```bash
brew install ghostscript
```

### Docker
If running in Docker, add to your Dockerfile:
```dockerfile
RUN apt-get update && apt-get install -y ghostscript
```

## Troubleshooting

### Compression Not Working
1. Check if Ghostscript is installed: `gs --version`
2. Check the compression status endpoint
3. Look at server logs for compression errors

### Large Upload Times
- Compression adds processing time proportional to file size
- Consider increasing upload timeout limits for very large files
- Monitor server resources during compression

### File Size Not Reduced
- Some PDFs are already optimized and may not compress much
- Try different quality settings if needed
- Very simple PDFs (text-only) may not benefit from compression
