import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

// PDF Cache Item interface
export interface PDFCacheItem {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
  pages?: number;
}

// PDF Loading State interface
export interface PDFLoadingState {
  isLoading: boolean;
  progress: number;
  error: string | null;
}

// PDF Viewer State interface
export interface PDFViewerState {
  url: string | null;
  zoom: number;
  rotation: number;
  currentPage: number;
  totalPages: number;
  isFullscreen: boolean;
}

// Global PDF State interface
interface PDFState {
  cache: Map<string, PDFCacheItem>;
  loadingStates: Map<string, PDFLoadingState>;
  currentPdfState: PDFViewerState;
}

// Action types
type PDFAction = 
  | { type: 'SET_CACHE_ITEM'; payload: { path: string; item: PDFCacheItem } }
  | { type: 'REMOVE_CACHE_ITEM'; payload: string }
  | { type: 'CLEAR_CACHE' }
  | { type: 'SET_LOADING_STATE'; payload: { path: string; state: Partial<PDFLoadingState> } }
  | { type: 'SET_PDF_STATE'; payload: Partial<PDFViewerState> }
  | { type: 'RESET_PDF_STATE' };

// Initial state
const initialState: PDFState = {
  cache: new Map(),
  loadingStates: new Map(),
  currentPdfState: {
    url: null,
    zoom: 100,
    rotation: 0,
    currentPage: 1,
    totalPages: 0,
    isFullscreen: false,
  },
};

// Reducer function
function pdfReducer(state: PDFState, action: PDFAction): PDFState {
  switch (action.type) {
    case 'SET_CACHE_ITEM': {
      const newCache = new Map(state.cache);
      newCache.set(action.payload.path, action.payload.item);
      return { ...state, cache: newCache };
    }
    
    case 'REMOVE_CACHE_ITEM': {
      const newCache = new Map(state.cache);
      newCache.delete(action.payload);
      return { ...state, cache: newCache };
    }
    
    case 'CLEAR_CACHE':
      return { ...state, cache: new Map() };
    
    case 'SET_LOADING_STATE': {
      const newLoadingStates = new Map(state.loadingStates);
      const currentState = newLoadingStates.get(action.payload.path) || { 
        isLoading: false, 
        progress: 0, 
        error: null 
      };
      newLoadingStates.set(action.payload.path, { ...currentState, ...action.payload.state });
      return { ...state, loadingStates: newLoadingStates };
    }
    
    case 'SET_PDF_STATE':
      return { 
        ...state, 
        currentPdfState: { ...state.currentPdfState, ...action.payload } 
      };
    
    case 'RESET_PDF_STATE':
      return { ...state, currentPdfState: initialState.currentPdfState };
    
    default:
      return state;
  }
}

// Context
const PDFContext = createContext<{
  state: PDFState;
  dispatch: React.Dispatch<PDFAction>;
} | null>(null);

// Provider component
export const PDFProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(pdfReducer, initialState);

  return (
    <PDFContext.Provider value={{ state, dispatch }}>
      {children}
    </PDFContext.Provider>
  );
};

// Hook to use PDF context
export const usePDFContext = () => {
  const context = useContext(PDFContext);
  if (!context) {
    throw new Error('usePDFContext must be used within a PDFProvider');
  }
  return context;
};

// Cache management constants
export const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes
export const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_CACHE_ITEMS = 10;
