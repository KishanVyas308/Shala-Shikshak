import { useState, useEffect, useCallback } from 'react';
import { usePDFContext } from '../contexts/PDFContext';
import { pdfService } from '../services/pdfService';
import type { PDFLoadingState } from '../contexts/PDFContext';

export const usePDFViewer = (pdfPath: string | null) => {
  const { state, dispatch } = usePDFContext();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get current loading state
  const loadingState = pdfPath ? state.loadingStates.get(pdfPath) : null;
  const isLoading = loadingState?.isLoading || false;
  const progress = loadingState?.progress || 0;

  // Update loading state
  const updateLoadingState = useCallback((path: string, state: Partial<PDFLoadingState>) => {
    dispatch({
      type: 'SET_LOADING_STATE',
      payload: { path, state }
    });
  }, [dispatch]);

  // Load PDF function
  const loadPDF = useCallback(async (path: string) => {
    if (!path) return;

    try {
      // Check cache first
      const cachedItem = state.cache.get(path);
      if (cachedItem) {
        setPdfUrl(cachedItem.url);
        setError(null);
        dispatch({
          type: 'SET_PDF_STATE',
          payload: { url: cachedItem.url }
        });
        return;
      }

      // Set loading state
      updateLoadingState(path, { isLoading: true, progress: 0, error: null });
      setError(null);

      // Load PDF with progress tracking
      const url = await pdfService.getPDF(path, (progress) => {
        updateLoadingState(path, { progress });
      });

      // Update cache state
      const cacheItem = pdfService.getCachedPDFInfo(path);
      if (cacheItem) {
        dispatch({
          type: 'SET_CACHE_ITEM',
          payload: { path, item: cacheItem }
        });
      }

      setPdfUrl(url);
      dispatch({
        type: 'SET_PDF_STATE',
        payload: { url }
      });
      updateLoadingState(path, { isLoading: false, progress: 100, error: null });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load PDF';
      setError(errorMessage);
      updateLoadingState(path, { isLoading: false, progress: 0, error: errorMessage });
    }
  }, [state.cache, dispatch, updateLoadingState]);

  // Load PDF when path changes
  useEffect(() => {
    if (pdfPath) {
      loadPDF(pdfPath);
    } else {
      setPdfUrl(null);
      setError(null);
    }
  }, [pdfPath, loadPDF]);

  // PDF controls
  const zoomIn = useCallback(() => {
    dispatch({
      type: 'SET_PDF_STATE',
      payload: { zoom: Math.min(state.currentPdfState.zoom + 25, 200) }
    });
  }, [dispatch, state.currentPdfState.zoom]);

  const zoomOut = useCallback(() => {
    dispatch({
      type: 'SET_PDF_STATE',
      payload: { zoom: Math.max(state.currentPdfState.zoom - 25, 50) }
    });
  }, [dispatch, state.currentPdfState.zoom]);

  const rotate = useCallback(() => {
    dispatch({
      type: 'SET_PDF_STATE',
      payload: { rotation: (state.currentPdfState.rotation + 90) % 360 }
    });
  }, [dispatch, state.currentPdfState.rotation]);

  const toggleFullscreen = useCallback(() => {
    dispatch({
      type: 'SET_PDF_STATE',
      payload: { isFullscreen: !state.currentPdfState.isFullscreen }
    });
  }, [dispatch, state.currentPdfState.isFullscreen]);

  const prevPage = useCallback(() => {
    dispatch({
      type: 'SET_PDF_STATE',
      payload: { currentPage: Math.max(state.currentPdfState.currentPage - 1, 1) }
    });
  }, [dispatch, state.currentPdfState.currentPage]);

  const nextPage = useCallback(() => {
    dispatch({
      type: 'SET_PDF_STATE',
      payload: { 
        currentPage: Math.min(state.currentPdfState.currentPage + 1, state.currentPdfState.totalPages) 
      }
    });
  }, [dispatch, state.currentPdfState.currentPage, state.currentPdfState.totalPages]);

  const goToPage = useCallback((page: number) => {
    dispatch({
      type: 'SET_PDF_STATE',
      payload: { 
        currentPage: Math.max(1, Math.min(page, state.currentPdfState.totalPages))
      }
    });
  }, [dispatch, state.currentPdfState.totalPages]);

  const setTotalPages = useCallback((total: number) => {
    dispatch({
      type: 'SET_PDF_STATE',
      payload: { totalPages: total }
    });
  }, [dispatch]);

  // Retry loading
  const retry = useCallback(() => {
    if (pdfPath) {
      loadPDF(pdfPath);
    }
  }, [pdfPath, loadPDF]);

  // Preload PDF
  const preload = useCallback((path: string) => {
    pdfService.preloadPDF(path);
  }, []);

  return {
    // PDF data
    pdfUrl,
    isLoading,
    progress,
    error,
    
    // PDF state
    zoom: state.currentPdfState.zoom,
    rotation: state.currentPdfState.rotation,
    currentPage: state.currentPdfState.currentPage,
    totalPages: state.currentPdfState.totalPages,
    isFullscreen: state.currentPdfState.isFullscreen,
    
    // Controls
    zoomIn,
    zoomOut,
    rotate,
    toggleFullscreen,
    prevPage,
    nextPage,
    goToPage,
    setTotalPages,
    
    // Utilities
    retry,
    preload,
  };
};
