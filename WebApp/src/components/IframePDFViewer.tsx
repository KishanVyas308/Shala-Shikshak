import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ZoomIn, ZoomOut, AlertCircle, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { pdfService } from '../services/pdfService';

interface IframePDFViewerProps {
  pdfUrl: string;
  title: string;
  type: 'textbook' | 'solution';
}

const IframePDFViewer: React.FC<IframePDFViewerProps> = ({ pdfUrl, title, type }) => {
  const [zoom, setZoom] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isZoomAnimating, setIsZoomAnimating] = useState<boolean>(false);
  const [controlsHideTimer, setControlsHideTimer] = useState<any>(null);
  const [lastInteraction, setLastInteraction] = useState<number>(Date.now());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadingRef = useRef<boolean>(false);
  const lastTouchDistance = useRef<number>(0);
  const isZooming = useRef<boolean>(false);
  const controlsRef = useRef<HTMLDivElement>(null);

  // Load PDF with caching
  const loadPDF = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      const cachedUrl = await pdfService.getPDF(pdfUrl, (progress) => {
        setLoadingProgress(progress);
      });
      
      setPdfBlob(cachedUrl);
      setRetryCount(0);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
      setRetryCount(prev => prev + 1);
      setLoading(false);
    } finally {
      loadingRef.current = false;
    }
  }, [pdfUrl]);

  // Initial load
  useEffect(() => {
    if (pdfUrl) {
      loadPDF();
    }
  }, [pdfUrl, loadPDF]);

  // Retry with exponential backoff
  const handleRetry = useCallback(() => {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    setTimeout(() => {
      loadPDF();
    }, delay);
  }, [loadPDF, retryCount]);

  // Enhanced zoom handlers with smooth animations
  const zoomIn = useCallback(() => {
    setIsZoomAnimating(true);
    setZoom(zoom => Math.min(zoom + 25, 200));
    setLastInteraction(Date.now());
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  const zoomOut = useCallback(() => {
    setIsZoomAnimating(true);
    setZoom(zoom => Math.max(zoom - 25, 50));
    setLastInteraction(Date.now());
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  const resetZoom = useCallback(() => {
    setIsZoomAnimating(true);
    setZoom(100);
    setLastInteraction(Date.now());
    setTimeout(() => setIsZoomAnimating(false), 300);
  }, []);

  // Auto-hide controls in fullscreen
  const resetControlsTimer = useCallback(() => {
    if (controlsHideTimer) {
      clearTimeout(controlsHideTimer);
    }
    
    setShowControls(true);
    
    if (isFullscreen) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsHideTimer(timer);
    }
  }, [controlsHideTimer, isFullscreen]);

  // Handle user interaction to show controls
  const handleInteraction = useCallback(() => {
    setLastInteraction(Date.now());
    resetControlsTimer();
  }, [resetControlsTimer]);

  // Enhanced fullscreen handlers
  const toggleFullscreen = useCallback(() => {
    handleInteraction();
    
    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any)?.msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }, [isFullscreen, handleInteraction]);

  // Listen for fullscreen changes with enhanced UX
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      if (isNowFullscreen) {
        resetControlsTimer();
      } else {
        setShowControls(true);
        if (controlsHideTimer) {
          clearTimeout(controlsHideTimer);
          setControlsHideTimer(null);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [resetControlsTimer, controlsHideTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (controlsHideTimer) {
        clearTimeout(controlsHideTimer);
      }
    };
  }, [controlsHideTimer]);

  // Enhanced touch/trackpad zoom handlers with haptic feedback
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      handleInteraction();
      
      const delta = e.deltaY;
      const zoomStep = e.shiftKey ? 5 : 15; // Finer control with Shift
      
      setIsZoomAnimating(true);
      
      if (delta < 0) {
        setZoom(zoom => Math.min(zoom + zoomStep, 300));
      } else {
        setZoom(zoom => Math.max(zoom - zoomStep, 25));
      }
      
      setTimeout(() => setIsZoomAnimating(false), 200);
    }
  }, [handleInteraction]);

  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    handleInteraction();
    
    if (e.touches.length === 2) {
      e.preventDefault();
      isZooming.current = true;
      lastTouchDistance.current = getTouchDistance(e.touches);
      setIsZoomAnimating(true);
    }
  }, [handleInteraction]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && isZooming.current) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const distanceDiff = currentDistance - lastTouchDistance.current;
      
      // More sensitive touch zoom with smooth animation
      if (Math.abs(distanceDiff) > 5) {
        const zoomStep = Math.abs(distanceDiff) > 20 ? 8 : 4;
        
        if (distanceDiff > 0) {
          setZoom(zoom => Math.min(zoom + zoomStep, 300));
        } else {
          setZoom(zoom => Math.max(zoom - zoomStep, 25));
        }
        lastTouchDistance.current = currentDistance;
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      isZooming.current = false;
      lastTouchDistance.current = 0;
      setTimeout(() => setIsZoomAnimating(false), 200);
    }
  }, []);

  // Enhanced double-tap to zoom with smooth animation
  const lastTap = useRef<number>(0);
  const handleDoubleTouch = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap.current;
      
      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        handleInteraction();
        setIsZoomAnimating(true);
        
        // Haptic feedback for double tap
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        
        // Smart zoom: cycle through 100% → 150% → 200% → 100%
        setZoom(currentZoom => {
          if (currentZoom <= 100) return 150;
          if (currentZoom <= 150) return 200;
          return 100;
        });
        
        setTimeout(() => setIsZoomAnimating(false), 400);
      }
      lastTap.current = currentTime;
    }
  }, [handleInteraction]);

  // Enhanced event listeners with interaction tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse movement to show controls
    const handleMouseMove = () => {
      handleInteraction();
    };

    // Touch and wheel events with enhanced UX
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchstart', handleDoubleTouch, { passive: false });
    container.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchstart', handleDoubleTouch);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleDoubleTouch, handleInteraction]);

  // Enhanced keyboard shortcuts with smooth animations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleInteraction();
      
      if (e.key === 'F11' || (e.key === 'f' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setIsZoomAnimating(true);
        setZoom(zoom => Math.min(zoom + 25, 300));
        setTimeout(() => setIsZoomAnimating(false), 300);
      } else if (e.key === '-') {
        e.preventDefault();
        setIsZoomAnimating(true);
        setZoom(zoom => Math.max(zoom - 25, 25));
        setTimeout(() => setIsZoomAnimating(false), 300);
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsZoomAnimating(true);
        setZoom(100);
        setTimeout(() => setIsZoomAnimating(false), 300);
      } else if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsZoomAnimating(true);
        setZoom(100);
        setTimeout(() => setIsZoomAnimating(false), 300);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, isFullscreen, handleInteraction]);

  // Premium loading state with smooth animations
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 sm:h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg px-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 animate-pulse"></div>
        
        <div className="text-center max-w-sm relative z-10">
          {/* Enhanced loading spinner */}
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 sm:h-16 sm:w-16 border-2 border-blue-400 opacity-20 mx-auto"></div>
          </div>
          
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Loading PDF</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">Preparing your document...</p>
          
          {/* Enhanced progress bar */}
          <div className="w-full max-w-xs bg-white/60 rounded-full h-2 sm:h-3 mb-3 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${loadingProgress}%` }}
            >
              <div className="h-full bg-white/30 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-500 font-medium">{loadingProgress}% complete</p>
          
          {/* Loading tips */}
          <div className="mt-4 text-xs text-gray-400">
            <p className="animate-pulse">💡 Perfect for mobile reading</p>
          </div>
        </div>
      </div>
    );
  }

  // Premium error state with enhanced UX
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 sm:h-96 bg-gradient-to-br from-red-50 to-pink-100 rounded-lg px-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-pink-400/10 animate-pulse"></div>
        
        <div className="text-center max-w-md relative z-10">
          {/* Enhanced error icon */}
          <div className="relative mb-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-full p-4 sm:p-6 mx-auto w-fit shadow-lg">
              <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20 p-4 sm:p-6 mx-auto w-fit"></div>
          </div>
          
          <h3 className="text-lg sm:text-xl font-semibold text-red-800 mb-2">Unable to Load PDF</h3>
          <p className="text-sm sm:text-base text-red-600 mb-6 px-2 leading-relaxed">
            {error}
          </p>
          
          {/* Enhanced retry button */}
          <button
            onClick={handleRetry}
            className="group relative flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:animate-spin" />
            <span className="relative z-10">
              Try Again {retryCount > 0 && `(Attempt ${retryCount + 1})`}
            </span>
          </button>
          
          {/* Error tips */}
          <div className="mt-4 text-xs text-red-400">
            <p>💡 Check your internet connection and try again</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col bg-white shadow-xl overflow-hidden transition-all duration-500 ease-out ${
        isFullscreen 
          ? 'fixed inset-0 z-50 rounded-none bg-black' 
          : 'h-full rounded-lg sm:rounded-xl border border-gray-200 hover:shadow-2xl'
      }`}
      ref={containerRef}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Responsive Header with better mobile layout */}
      <div className={`bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-2 sm:px-4 py-1.5 sm:py-3 transition-all duration-300 ${
        isFullscreen && !showControls ? 'transform -translate-y-full opacity-0 absolute top-0 left-0 right-0 z-10' : 'transform translate-y-0 opacity-100'
      }`} ref={controlsRef}>
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center space-x-1 sm:space-x-3 min-w-0 flex-1">
            <h2 className="text-xs sm:text-lg font-bold truncate bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {title}
            </h2>
            <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full flex-shrink-0 shadow-sm transition-all duration-300 ${
              type === 'textbook' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200'
            }`}>
              {type === 'textbook' ? '📚 પાઠ્યપુસ્તક' : '✅ ઉકેલ'}
            </span>
          </div>
          
          {/* Enhanced Desktop Controls */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={zoomOut}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 transform hover:scale-110 active:scale-95"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              
              <span className="text-sm font-semibold text-gray-700 min-w-[50px] text-center px-2 py-1 bg-gray-50 rounded-md">
                {zoom}%
              </span>
              
              <button
                onClick={zoomIn}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 transform hover:scale-110 active:scale-95"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={resetZoom}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-lg transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
              title="Reset Zoom (Ctrl+0)"
            >
              Reset
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-lg transition-all duration-200 shadow-sm transform hover:scale-110 active:scale-95"
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen (F11)'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Mobile Controls - Optimized for touch */}
          <div className="flex sm:hidden items-center space-x-1">
            <div className="flex items-center space-x-0.5 bg-white rounded-lg p-0.5 shadow-sm">
              <button
                onClick={zoomOut}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 active:scale-95"
                title="Zoom Out"
              >
                <ZoomOut className="h-3 w-3" />
              </button>
              
              <span className="text-xs font-semibold text-gray-700 min-w-[35px] text-center px-1 py-1 bg-gray-50 rounded-md">
                {zoom}%
              </span>
              
              <button
                onClick={zoomIn}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 active:scale-95"
                title="Zoom In"
              >
                <ZoomIn className="h-3 w-3" />
              </button>
            </div>
            
            <button
              onClick={resetZoom}
              className="px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-lg transition-all duration-200 shadow-sm active:scale-95"
              title="Reset Zoom"
            >
              Reset
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-lg transition-all duration-200 shadow-sm active:scale-95"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
        
        {/* Desktop hints - Simplified */}
        <div className="mt-2 text-xs text-gray-500 hidden sm:block">
          <div className="flex items-center justify-between">
            <span>🖱️ Ctrl+Scroll to zoom • ⌨️ +/- keys • 🔄 Ctrl+0 to reset</span>
            <span>📺 F11 for fullscreen</span>
          </div>
        </div>
      </div>

      {/* Responsive PDF Content with mobile optimization */}
      <div className={`flex-1 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden ${
        isFullscreen ? 'bg-black' : ''
      }`} style={{ minHeight: isFullscreen ? '100vh' : '400px' }}>
        {pdfBlob && (
          <div className="absolute inset-0 flex items-center justify-center p-0 sm:p-1">
            <div 
              className={`w-full h-full flex items-center justify-center overflow-auto transition-transform duration-300 ease-out ${
                isZoomAnimating ? 'duration-300' : 'duration-150'
              }`}
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
              }}
            >
              <iframe
                ref={iframeRef}
                src={`${pdfBlob}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0`}
                className={`border-0 shadow-lg rounded-none sm:rounded-md overflow-hidden transition-all duration-300 w-full h-full ${
                  isFullscreen ? 'rounded-none shadow-none' : 'sm:shadow-2xl sm:rounded-lg hover:shadow-3xl'
                }`}
                style={{
                  width: '100%',
                  height: '100%',
                  minWidth: '100%',
                  minHeight: '100%',
                  backgroundColor: 'white',
                }}
                title={title}
                onLoad={() => setLoading(false)}
                onError={() => setError('Failed to display PDF')}
                allow="fullscreen"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        )}
        
        {/* Mobile-optimized fullscreen controls */}
        {isFullscreen && (
          <div className={`absolute bottom-4 right-4 sm:bottom-6 sm:right-6 transition-all duration-300 ${
            showControls ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}>
            <div className="bg-black/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3 shadow-2xl border border-white/20">
              <button
                onClick={zoomOut}
                className="p-2 sm:p-3 text-white hover:text-blue-300 transition-all duration-200 rounded-lg sm:rounded-xl active:bg-white/20 transform active:scale-95"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              <span className="text-white text-sm font-bold min-w-[45px] sm:min-w-[50px] text-center px-2 sm:px-3 py-1 sm:py-2 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                {zoom}%
              </span>
              
              <button
                onClick={zoomIn}
                className="p-2 sm:p-3 text-white hover:text-blue-300 transition-all duration-200 rounded-lg sm:rounded-xl active:bg-white/20 transform active:scale-95"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              <div className="w-px h-6 sm:h-8 bg-white/30"></div>
              
              <button
                onClick={resetZoom}
                className="px-3 sm:px-4 py-1 sm:py-2 text-white hover:text-blue-300 transition-all duration-200 text-sm font-medium rounded-lg sm:rounded-xl active:bg-white/20 transform active:scale-95"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
          </div>
        )}
        
        {/* Zoom indicator */}
        {isZoomAnimating && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-black/80 text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-2xl backdrop-blur-sm animate-pulse">
              {zoom}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IframePDFViewer;
