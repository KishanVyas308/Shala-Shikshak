import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, RotateCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// Set up PDF.js worker - use unpkg as it's more reliable
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface SimplePDFViewerProps {
  src: string;
  title: string;
  type: 'textbook' | 'solution';
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ src, title }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pdfUrl = `http://localhost:5000${src}`;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    setError(error.message);
    setLoading(false);
  }

  const goToPrevPage = () => {
    setPageNumber(page => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(page + 1, numPages));
  };

  const zoomIn = () => {
    setZoom(zoom => Math.min(zoom + 0.25, 3.0));
  };

  const zoomOut = () => {
    setZoom(zoom => Math.max(zoom - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation(rotation => (rotation + 90) % 360);
  };

  const resetView = () => {
    setZoom(1.0);
    setRotation(0);
    setPageNumber(1);
  };

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
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      {/* Controls */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-gray-100 rounded-lg">
            <button
              onClick={zoomOut}
              disabled={zoom <= 0.5}
              className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
              title="ઝૂમ આઉટ"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-3 py-2 text-sm font-medium bg-white border-x border-gray-200 min-w-[70px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoom >= 3.0}
              className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
              title="ઝૂમ ઇન"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Page Navigation */}
          {numPages > 0 && (
            <div className="flex items-center bg-gray-100 rounded-lg">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                title="પાછલું પેજ"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-2 text-sm font-medium bg-white border-x border-gray-200 min-w-[80px] text-center">
                {pageNumber} / {numPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                title="આગળું પેજ"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Rotate */}
          <button
            onClick={rotate}
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
            title="ડિફોલ્ટ વ્યુ"
          >
            રીસેટ
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="overflow-auto max-h-[70vh] p-4 flex justify-center">
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
          <Page
            pageNumber={pageNumber}
            scale={zoom}
            rotate={rotation}
            loading={
              <div className="flex items-center justify-center h-96 bg-gray-100 rounded">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">પેજ લોડ થઈ રહ્યું છે...</p>
                </div>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-96 bg-red-50 rounded border-2 border-red-200">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 text-sm">પેજ લોડ થઈ શકતું નથી</p>
                </div>
              </div>
            }
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};

export default SimplePDFViewer;
