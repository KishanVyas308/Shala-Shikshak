# PDF to Image API Documentation

## Overview
This API provides secure PDF to image conversion for textbook viewing. PDFs are converted to WebP images page-by-page to prevent direct downloading and enable secure viewing.

## Features
- ✅ PDF to WebP conversion with high quality
- ✅ Secure signed URLs for image access
- ✅ Chapter-based organization
- ✅ Admin-only upload and management
- ✅ Automatic cleanup of old files
- ✅ Progress tracking for conversions
- ✅ Watermarking support
- ✅ Rate limiting for security
- ✅ Image caching and optimization

## API Endpoints

### 1. Upload PDF and Convert to Images

**POST** `/api/upload/chapter/{chapterId}/pdf`

Upload a PDF file and convert it to images for a specific chapter.

**Headers:**
- `Authorization: Bearer <token>` (Admin only)
- `Content-Type: multipart/form-data`

**Parameters:**
- `chapterId` (path) - Chapter ID to associate the PDF with

**Body:**
- `pdf` (file) - PDF file to upload

**Response:**
```json
{
  "message": "PDF upload successful, processing started",
  "chapterId": "chapter-id",
  "filename": "pdf-1234567890.pdf",
  "originalName": "textbook.pdf",
  "size": 1024000,
  "status": "processing"
}
```

### 2. Check Processing Status

**GET** `/api/upload/chapter/{chapterId}/status`

Check the processing status of a chapter's PDF.

**Headers:**
- `Authorization: Bearer <token>` (Admin only)

**Response:**
```json
{
  "chapterId": "chapter-id",
  "chapterName": "Chapter 1: Introduction",
  "pageCount": 25,
  "status": "completed"
}
```

### 3. Get Chapter Pages

**GET** `/api/chapter-pages/chapter/{chapterId}/pages`

Get all page images for a chapter.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `signed` (optional) - Set to "true" to get signed URLs

**Response:**
```json
{
  "chapterId": "chapter-id",
  "chapterName": "Chapter 1: Introduction",
  "subject": "Mathematics",
  "standard": "Class 10",
  "totalPages": 25,
  "pages": [
    {
      "id": "page-id",
      "page": 1,
      "imageUrl": "/uploads/chapters/chapter-id/page-1.webp",
      "width": 794,
      "height": 1123,
      "fileSize": 45000,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 4. Get Specific Page

**GET** `/api/chapter-pages/chapter/{chapterId}/page/{pageNumber}`

Get a specific page image.

**Headers:**
- `Authorization: Bearer <token>`

**Parameters:**
- `chapterId` (path) - Chapter ID
- `pageNumber` (path) - Page number (1-based)

**Query Parameters:**
- `signed` (optional) - Set to "true" to get signed URL

**Response:**
```json
{
  "id": "page-id",
  "chapterId": "chapter-id",
  "page": 1,
  "imageUrl": "/uploads/chapters/chapter-id/page-1.webp",
  "width": 794,
  "height": 1123,
  "fileSize": 45000,
  "createdAt": "2024-01-01T00:00:00Z",
  "chapter": {
    "name": "Chapter 1: Introduction",
    "subject": {
      "name": "Mathematics",
      "standard": {
        "name": "Class 10"
      }
    }
  }
}
```

### 5. Serve Images (Secure)

**GET** `/api/chapter-pages/image/{imagePath}`

Serve image files with signature validation.

**Query Parameters:**
- `token` (required) - Signature token
- `exp` (required) - Expiration timestamp

**Response:**
- Image file (WebP format)
- Proper cache headers
- Security headers

### 6. Delete Chapter Pages

**DELETE** `/api/chapter-pages/chapter/{chapterId}/pages`

Delete all page images for a chapter.

**Headers:**
- `Authorization: Bearer <token>` (Admin only)

**Response:**
```json
{
  "message": "All page images deleted successfully",
  "chapterId": "chapter-id"
}
```

### 7. Get Chapter Statistics

**GET** `/api/chapter-pages/chapter/{chapterId}/stats`

Get detailed statistics for a chapter.

**Headers:**
- `Authorization: Bearer <token>` (Admin only)

**Response:**
```json
{
  "chapterId": "chapter-id",
  "chapterName": "Chapter 1: Introduction",
  "subject": "Mathematics",
  "standard": "Class 10",
  "totalPages": 25,
  "totalSize": 1125000,
  "averageSize": 45000,
  "pages": [
    {
      "page": 1,
      "dimensions": "794x1123",
      "fileSize": 45000,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Security Features

### 1. Signed URLs
- Images are served with signed URLs that expire after 1 hour
- URLs include signature verification to prevent tampering
- Direct access without proper signatures is blocked

### 2. Rate Limiting
- Image requests: 1000 per 15 minutes per IP
- PDF processing: 10 per hour per IP
- Prevents abuse and ensures fair usage

### 3. Access Control
- Admin-only endpoints for upload and management
- User authentication required for all image access
- Chapter-based access control

### 4. Watermarking
- Optional watermarking with user information
- Timestamp-based watermarks
- Configurable opacity and positioning

### 5. File Security
- PDF files are deleted after conversion
- Images stored in secure directories
- No direct file system access

## Best Practices

### 1. Performance Optimization
- WebP format for smaller file sizes
- Optimized compression settings
- Efficient image dimensions
- Proper caching headers

### 2. Security Recommendations
- Always use signed URLs in production
- Implement proper authentication
- Monitor for unusual access patterns
- Regular security audits

### 3. Storage Management
- Regular cleanup of old files
- Monitor disk space usage
- Implement backup strategies
- Consider cloud storage for scale

### 4. Error Handling
- Graceful error responses
- Proper logging for debugging
- User-friendly error messages
- Retry mechanisms for failures

## Configuration

### Environment Variables
```env
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### Image Settings
- Quality: 90% (configurable)
- DPI: 150 (configurable)
- Format: WebP
- Compression: Enabled

### Security Settings
- Signed URL expiry: 1 hour
- Rate limits: Configurable
- Watermark: Optional
- Access logging: Enabled

## Monitoring

### Metrics to Track
- PDF processing time
- Image conversion success rate
- Storage usage
- API response times
- Error rates

### Health Checks
- Database connectivity
- File system access
- PDF processing capability
- Image serving performance

## Troubleshooting

### Common Issues
1. **PDF processing fails**: Check pdf-poppler installation
2. **Images not loading**: Verify signed URL generation
3. **High response times**: Check disk I/O and image sizes
4. **Rate limit errors**: Adjust rate limiting settings

### Debug Endpoints
- `GET /api/health` - System health check
- `GET /api/upload/chapter/{chapterId}/status` - Processing status
- `GET /api/chapter-pages/chapter/{chapterId}/stats` - Chapter statistics

## Future Enhancements

### Planned Features
- [ ] Cloud storage integration (AWS S3, Google Cloud)
- [ ] Advanced watermarking options
- [ ] Image compression optimization
- [ ] Batch processing improvements
- [ ] Analytics dashboard
- [ ] Mobile app integration
- [ ] Offline caching support

### Performance Improvements
- [ ] Image CDN integration
- [ ] Progressive loading
- [ ] Lazy loading optimization
- [ ] Compressed image variants
- [ ] Edge caching

### Security Enhancements
- [ ] Advanced access controls
- [ ] Audit logging
- [ ] DRM-like protections
- [ ] Screenshot detection
- [ ] Forensic watermarking
