import { atom, selector } from 'recoil';

// PDF Cache State
export interface PDFCacheItem {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
  pages?: number;
}

export interface PDFLoadingState {
  isLoading: boolean;
  progress: number;
  error: string | null;
}

// PDF Cache Atom
export const pdfCacheState = atom<Map<string, PDFCacheItem>>({
  key: 'pdfCacheState',
  default: new Map(),
});

// PDF Loading State Atom
export const pdfLoadingState = atom<Map<string, PDFLoadingState>>({
  key: 'pdfLoadingState',
  default: new Map(),
});

// Current PDF Viewer State
export const currentPdfState = atom<{
  url: string | null;
  zoom: number;
  rotation: number;
  currentPage: number;
  totalPages: number;
  isFullscreen: boolean;
}>({
  key: 'currentPdfState',
  default: {
    url: null,
    zoom: 100,
    rotation: 0,
    currentPage: 1,
    totalPages: 0,
    isFullscreen: false,
  },
});

// PDF Cache Selector
export const pdfCacheSelector = selector({
  key: 'pdfCacheSelector',
  get: ({ get }) => {
    const cache = get(pdfCacheState);
    return {
      size: cache.size,
      totalSize: Array.from(cache.values()).reduce((total, item) => total + item.size, 0),
      items: Array.from(cache.entries()),
    };
  },
});

// Cache Management
export const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes
export const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_CACHE_ITEMS = 10;
