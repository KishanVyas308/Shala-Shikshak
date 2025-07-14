import { API_BASE_URL } from '../lib/api';
import type { PDFCacheItem } from '../contexts/PDFContext';
import { CACHE_EXPIRY_TIME, MAX_CACHE_SIZE, MAX_CACHE_ITEMS } from '../contexts/PDFContext';

export class PDFService {
  private static instance: PDFService;
  private cache: Map<string, PDFCacheItem> = new Map();
  private loadingPromises: Map<string, Promise<string>> = new Map();

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  // Clean expired cache items
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > CACHE_EXPIRY_TIME) {
        this.revokeObjectURL(item.url);
        this.cache.delete(key);
      }
    }
  }

  // Clean cache by size
  private cleanCacheBySize(): void {
    const items = Array.from(this.cache.entries());
    let totalSize = items.reduce((sum, [, item]) => sum + item.size, 0);
    
    if (totalSize > MAX_CACHE_SIZE || items.length > MAX_CACHE_ITEMS) {
      // Sort by timestamp (oldest first)
      items.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      while ((totalSize > MAX_CACHE_SIZE || items.length > MAX_CACHE_ITEMS) && items.length > 0) {
        const [key, item] = items.shift()!;
        this.revokeObjectURL(item.url);
        this.cache.delete(key);
        totalSize -= item.size;
      }
    }
  }

  // Revoke object URL to free memory
  private revokeObjectURL(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  // Get PDF with caching and progress tracking
  async getPDF(
    pdfPath: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const fullUrl = `${API_BASE_URL}${pdfPath}`;
    
    // Check cache first
    this.cleanExpiredCache();
    const cached = this.cache.get(pdfPath);
    if (cached) {
      // Update timestamp for LRU
      cached.timestamp = Date.now();
      return cached.url;
    }

    // Check if already loading
    if (this.loadingPromises.has(pdfPath)) {
      return this.loadingPromises.get(pdfPath)!;
    }

    // Start loading
    const loadingPromise = this.loadPDF(fullUrl, pdfPath, onProgress);
    this.loadingPromises.set(pdfPath, loadingPromise);

    try {
      const result = await loadingPromise;
      return result;
    } finally {
      this.loadingPromises.delete(pdfPath);
    }
  }

  private async loadPDF(
    fullUrl: string,
    pdfPath: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
          'Cache-Control': 'public, max-age=3600', // 1 hour browser cache
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const chunks: Uint8Array[] = [];

      // Read chunks with progress tracking
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (onProgress && total > 0) {
          onProgress(Math.round((loaded / total) * 100));
        }
      }

      // Create blob from chunks
      const blob = new Blob(chunks, { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);

      // Cache the PDF
      const cacheItem: PDFCacheItem = {
        url: objectUrl,
        blob,
        timestamp: Date.now(),
        size: blob.size,
      };

      this.cache.set(pdfPath, cacheItem);
      this.cleanCacheBySize();

      return objectUrl;
    } catch (error) {
      console.error('PDF loading error:', error);
      throw error;
    }
  }

  // Get cached PDF info
  getCachedPDFInfo(pdfPath: string): PDFCacheItem | null {
    return this.cache.get(pdfPath) || null;
  }

  // Clear all cache
  clearCache(): void {
    for (const [, item] of this.cache.entries()) {
      this.revokeObjectURL(item.url);
    }
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; totalSize: number; items: number } {
    const items = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      items: items.length,
    };
  }

  // Preload PDF
  async preloadPDF(pdfPath: string): Promise<void> {
    try {
      await this.getPDF(pdfPath);
    } catch (error) {
      console.warn('PDF preload failed:', error);
    }
  }
}

export const pdfService = PDFService.getInstance();
