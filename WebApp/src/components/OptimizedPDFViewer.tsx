import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useInView } from 'react-intersection-observer';
import { ZoomIn, ZoomOut, RotateCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker - use unpkg as it's more reliable
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface OptimizedPDFViewerProps {
  src: string;
  title: string;
  type: 'textbook' | 'solution';
}

interface PageComponentProps {
  pageNumber: number;
  zoom: number;
  rotation: number;
  width: number;
  isVisible: boolean;
}

const PageComponent: React.FC<PageComponentProps> = React.memo(({ 
  pageNumber, 
  zoom, 
  rotation, 
  width, 
  isVisible 
}) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
    rootMargin: '50px 0px'
  });

  const shouldRender = isVisible && inView;

  return (
    <div 
      ref={ref} 
      className="flex justify-center mb-4 page-container"
      style={{ minHeight: shouldRender ? 'auto' : '600px' }}
    >
      {shouldRender ? (
        <Page
          pageNumber={pageNumber}
          scale={zoom / 100}
          rotate={rotation}
          width={width}
          loading={
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">પેજ {pageNumber} લોડ થઈ રહ્યું છે...</p>
              </div>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-96 bg-red-50 rounded border-2 border-red-200">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 text-sm">પેજ {pageNumber} લોડ થઈ શકતું નથી</p>
              </div>
            </div>
          }
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      ) : (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded border-2 border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-gray-500 font-semibold">{pageNumber}</span>
            </div>
            <p className="text-gray-500 text-sm">પેજ {pageNumber}</p>
          </div>
        </div>
      )}
    </div>
  );
});

PageComponent.displayName = 'PageComponent';

const OptimizedPDFViewer: React.FC<OptimizedPDFViewerProps> = ({ src, title, type }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStartDistance, setTouchStartDistance] = useState(0);
  const [isGestureEnabled, setIsGestureEnabled] = useState(false);

  // PDF URL
  const pdfUrl = `http://localhost:5000${src}`;

  // Calculate container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(Math.min(rect.width - 40, 800)); // Max 800px, with padding
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Handle document load
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    // Initially load first few pages
    setVisiblePages(new Set([1, 2, 3]));
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setError(error.message);
    setLoading(false);
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 300));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 50));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const resetView = useCallback(() => {
    setZoom(100);
    setRotation(0);
  }, []);

  // Page navigation
  const goToPage = useCallback((pageNum: number) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
      const pageElement = document.querySelector(`[data-page-number="${pageNum}"]`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [numPages]);

  // Touch gesture handling
  const getTouchDistance = useCallback((touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsGestureEnabled(true);
      setTouchStartDistance(getTouchDistance(e.touches));
    }
  }, [getTouchDistance]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isGestureEnabled) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const deltaScale = currentDistance / touchStartDistance;
      
      if (deltaScale > 1.1) {
        handleZoomIn();
        setTouchStartDistance(currentDistance);
      } else if (deltaScale < 0.9) {
        handleZoomOut();
        setTouchStartDistance(currentDistance);
      }
    }
  }, [isGestureEnabled, touchStartDistance, getTouchDistance, handleZoomIn, handleZoomOut]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setIsGestureEnabled(false);
      setTouchStartDistance(0);
    }
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault();
          handleZoomIn();
          break;
        case '-':
          event.preventDefault();
          handleZoomOut();
          break;
        case '0':
          event.preventDefault();
          resetView();
          break;
      }
    }
    
    // Page navigation
    switch (event.key) {
      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        goToPage(currentPage - 1);
        break;
      case 'ArrowDown':
      case 'PageDown':
        event.preventDefault();
        goToPage(currentPage + 1);
        break;
      case 'Home':
        event.preventDefault();
        goToPage(1);
        break;
      case 'End':
        event.preventDefault();
        goToPage(numPages);
        break;
    }
  }, [handleZoomIn, handleZoomOut, resetView, goToPage, currentPage, numPages]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Intersection observer for visible pages
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    const createObserver = (pageNum: number) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setVisiblePages(prev => new Set([...prev, pageNum]));
              setCurrentPage(pageNum);
            }
          });
        },
        { threshold: 0.5 }
      );
      
      const pageElement = document.querySelector(`[data-page-number="${pageNum}"]`);
      if (pageElement) {
        observer.observe(pageElement);
        observers.push(observer);
      }
    };

    // Observe all pages
    for (let i = 1; i <= numPages; i++) {
      setTimeout(() => createObserver(i), i * 100); // Stagger observer creation
    }

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [numPages]);

  // Render pages
  const renderPages = useMemo(() => {
    if (!numPages) return null;

    return Array.from({ length: numPages }, (_, index) => {
      const pageNumber = index + 1;
      const isVisible = visiblePages.has(pageNumber) || 
                       Math.abs(pageNumber - currentPage) <= 2; // Load current page ± 2

      return (
        <div key={pageNumber} data-page-number={pageNumber}>
          <PageComponent
            pageNumber={pageNumber}
            zoom={zoom}
            rotation={rotation}
            width={containerWidth}
            isVisible={isVisible}
          />
        </div>
      );
    });
  }, [numPages, visiblePages, currentPage, zoom, rotation, containerWidth]);

  if (error) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-[70vh] min-h-[500px] flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF લોડ થઈ શકતું નથી</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ફરીથી પ્રયાસ કરો
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 relative">
      {/* Controls */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between flex-wrap gap-2 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-gray-100 rounded-lg">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
              title="ઝૂમ આઉટ (Ctrl + -)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-3 py-2 text-sm font-medium bg-white border-x border-gray-200 min-w-[60px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 300}
              className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
              title="ઝૂમ ઇન (Ctrl + +)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Page Navigation */}
          {numPages > 0 && (
            <div className="flex items-center bg-gray-100 rounded-lg">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                title="પાછલું પેજ"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="px-3 py-2 text-sm font-medium bg-white border-x border-gray-200 min-w-[80px] text-center">
                {currentPage} / {numPages}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= numPages}
                className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                title="આગળું પેજ"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="ફેરવો"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Reset View */}
          <button
            onClick={resetView}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            title="ડિફોલ્ટ વ્યુ (Ctrl + 0)"
          >
            રીસેટ
          </button>
        </div>
      </div>

      {/* Touch Instructions */}
      <div className="bg-blue-50 border-b border-blue-200 px-3 py-2 text-xs text-blue-700">
        <span className="inline-block mr-4">📱 બે આંગળીઓથી ઝૂમ કરો</span>
        <span className="inline-block mr-4">🖱️ Ctrl + માઉસ વ્હીલ</span>
        <span className="inline-block mr-4">⌨️ Arrow keys નેવિગેશન</span>
        <span className="inline-block">📄 {numPages > 0 ? `કુલ ${numPages} પેજ` : ''}</span>
      </div>

      {/* PDF Content */}
      <div
        ref={containerRef}
        className="overflow-auto max-h-[70vh] p-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">PDF લોડ થઈ રહ્યું છે...</p>
              <p className="text-gray-500 text-sm mt-2">{title}</p>
            </div>
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
          error=""
          options={{
            cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
          }}
        >
          {renderPages}
        </Document>

        {/* Gesture Feedback */}
        {isGestureEnabled && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/75 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-20">
            ઝૂમ: {zoom}%
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedPDFViewer;
