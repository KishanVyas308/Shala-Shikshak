import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, ExternalLink, PlayCircle, Star, Clock, Eye, ThumbsUp, Share2, Bookmark, ZoomIn, ZoomOut, RotateCw, Maximize2, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import { chaptersAPI } from '../services/chapters';
import { usePDFViewer } from '../hooks/usePDFViewer';
import '../components/PDFViewer.css';

const ChapterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'video' | 'textbook' | 'solution'>('video');
  
  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapters', id],
    queryFn: () => chaptersAPI.getById(id!),
    enabled: !!id,
  });

  // PDF viewer state for textbook
  const textbookPDF = usePDFViewer(
    activeTab === 'textbook' ? chapter?.textbookPdfUrl || null : null
  );
  
  // PDF viewer state for solution
  const solutionPDF = usePDFViewer(
    activeTab === 'solution' ? chapter?.solutionPdfUrl || null : null
  );

  // Always define availableTabs, even if chapter is not loaded yet
  const availableTabs = React.useMemo(() => {
    if (!chapter) return [];
    
    return [
      ...(chapter.videoUrl ? [{ id: 'video', label: 'વિડિયો લેક્ચર', icon: PlayCircle, color: 'text-red-600' }] : []),
      ...(chapter.textbookPdfUrl ? [{ id: 'textbook', label: 'પાઠ્યપુસ્તક', icon: BookOpen, color: 'text-blue-600' }] : []),
      ...(chapter.solutionPdfUrl ? [{ id: 'solution', label: 'ઉકેલ', icon: Star, color: 'text-yellow-600' }] : []),
    ] as const;
  }, [chapter]);

  // Always call useEffect, but make the logic conditional inside
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id as 'video' | 'textbook' | 'solution');
    }
  }, [availableTabs, activeTab]);

  // Preload PDFs when chapter data is available
  useEffect(() => {
    if (chapter?.textbookPdfUrl && availableTabs.some(tab => tab.id === 'textbook')) {
      textbookPDF.preload(chapter.textbookPdfUrl);
    }
    if (chapter?.solutionPdfUrl && availableTabs.some(tab => tab.id === 'solution')) {
      solutionPDF.preload(chapter.solutionPdfUrl);
    }
  }, [chapter, availableTabs, textbookPDF, solutionPDF]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium text-lg">લોડ થઈ રહ્યું છે...</p>
          <p className="text-gray-500 text-sm mt-2">કૃપા કરીને થોડી રાહ જુઓ</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">પ્રકરણ મળ્યું નથી</h1>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">આ પ્રકરણ અસ્તિત્વમાં નથી અથવા કાઢી નાખવામાં આવ્યું છે</p>
          <Link 
            to="/standards" 
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ધોરણોની યાદીમાં પાછા જાવ
          </Link>
        </div>
      </div>
    );
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  // Enhanced PDF Viewer Component
  const EnhancedPDFViewer: React.FC<{ pdfUrl: string; title: string; type: string }> = ({ pdfUrl, title, type }) => {
    const iconColor = type === 'textbook' ? 'text-blue-600' : 'text-yellow-600';
    const bgColor = type === 'textbook' ? 'bg-blue-50' : 'bg-yellow-50';
    const borderColor = type === 'textbook' ? 'border-blue-200' : 'border-yellow-200';
    const Icon = type === 'textbook' ? BookOpen : Star;
    
    const pdfViewer = type === 'textbook' ? textbookPDF : solutionPDF;
    
    // Initialize PDF loading
    useEffect(() => {
      if (pdfUrl && pdfViewer) {
        // The hook will handle loading automatically
      }
    }, [pdfUrl, pdfViewer]);

    return (
      <div className={`relative ${bgColor} rounded-xl overflow-hidden border ${borderColor} ${pdfViewer?.isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
        {/* PDF Controls Header */}
        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <span className="text-sm font-medium text-gray-700">{title}</span>
            {pdfViewer?.totalPages > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                પૃષ્ઠ {pdfViewer.currentPage} / {pdfViewer.totalPages}
              </span>
            )}
            {pdfViewer?.isLoading && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-xs text-blue-600">{pdfViewer.progress}%</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Page Navigation */}
            <div className="flex items-center space-x-1">
              <button
                onClick={pdfViewer?.prevPage}
                disabled={pdfViewer?.currentPage <= 1}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="પાછલું પાના"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={pdfViewer?.nextPage}
                disabled={pdfViewer?.currentPage >= pdfViewer?.totalPages}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="આગળનું પાના"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
              <button
                onClick={pdfViewer?.zoomOut}
                disabled={pdfViewer?.zoom <= 50}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="નાનું કરો"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs text-gray-600 min-w-[45px] text-center">
                {pdfViewer?.zoom}%
              </span>
              <button
                onClick={pdfViewer?.zoomIn}
                disabled={pdfViewer?.zoom >= 200}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="મોટું કરો"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* Rotate & Fullscreen */}
            <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
              <button
                onClick={pdfViewer?.rotate}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                title="ફેરવો"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                onClick={pdfViewer?.toggleFullscreen}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                title={pdfViewer?.isFullscreen ? 'સામાન્ય દૃશ્ય' : 'પૂર્ણ સ્ક્રીન'}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Retry button */}
            {pdfViewer?.error && (
              <button
                onClick={pdfViewer?.retry}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors border-l border-gray-200 pl-2"
                title="ફરીથી પ્રયાસ કરો"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}

            {/* Close fullscreen */}
            {pdfViewer?.isFullscreen && (
              <button
                onClick={pdfViewer?.toggleFullscreen}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors border-l border-gray-200 pl-2"
                title="બંધ કરો"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* PDF Content Area */}
        <div className={`relative ${pdfViewer?.isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-screen max-h-[600px] lg:max-h-[700px]'}`}>
          {pdfViewer?.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-600">PDF લોડ થઈ રહ્યું છે...</p>
                <div className="mt-2 bg-gray-200 rounded-full h-2 w-48 mx-auto overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${pdfViewer.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{pdfViewer.progress}% પૂર્ણ</p>
              </div>
            </div>
          )}
          
          {pdfViewer?.error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md mx-auto px-4">
                <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF લોડ થઈ શક્યું નથી</h3>
                <p className="text-sm text-gray-600 mb-4">{pdfViewer.error}</p>
                <button
                  onClick={pdfViewer?.retry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  ફરીથી પ્રયાસ કરો
                </button>
              </div>
            </div>
          )}

          {pdfViewer?.pdfUrl && (
            <iframe
              src={pdfViewer.pdfUrl}
              title={title}
              className={`w-full h-full transition-all duration-300 ${pdfViewer.isLoading ? 'opacity-0' : 'opacity-100'}`}
              style={{ 
                transform: `rotate(${pdfViewer.rotation}deg) scale(${pdfViewer.zoom / 100})`,
                transformOrigin: 'center center'
              }}
              frameBorder="0"
              onLoad={() => {
                if (pdfViewer.setTotalPages) {
                  pdfViewer.setTotalPages(10); // This should be dynamically determined
                }
              }}
              // Security attributes
              sandbox="allow-same-origin allow-scripts"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <Link
            to={`/subject/${chapter.subjectId}`}
            className="inline-flex items-center text-white/80 hover:text-white mb-3 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {chapter.subject?.name} માં પાછા જાવ
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-2 sm:p-3 flex-shrink-0">
                <div className="bg-white/20 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold">
                  {chapter.order}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 leading-tight truncate">{chapter.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center text-white/80 text-xs sm:text-sm space-y-1 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="truncate">{chapter.subject?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span>~30 મિનિટ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-1 sm:space-x-2 ml-3">
              <button className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Tab Navigation */}
        {availableTabs.length > 0 && (
          <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-1 mb-4 sm:mb-6 bg-gray-50 p-1 rounded-xl border">
            {availableTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'video' | 'textbook' | 'solution')}
                  className={`flex-1 min-w-0 flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-md border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                  }`}
                >
                  <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 ${tab.color} ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Video Tab */}
          {activeTab === 'video' && chapter.videoUrl && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="bg-red-100 rounded-lg p-2 mr-3">
                  <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">વિડિયો લેક્ચર</h2>
              </div>
              
              <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-xl mb-4 sm:mb-6">
                <iframe
                  src={getYouTubeEmbedUrl(chapter.videoUrl)}
                  title={`${chapter.name} - વિડિયો લેક્ચર`}
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px]"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-0 border">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center text-gray-600 text-sm sm:text-base">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                    <span className="font-medium">1,234 વ્યુ</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm sm:text-base">
                    <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500" />
                    <span className="font-medium">156 લાઇક</span>
                  </div>
                </div>
                <a
                  href={chapter.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  YouTube પર જુઓ
                </a>
              </div>
            </div>
          )}

          {/* Textbook Tab */}
          {activeTab === 'textbook' && chapter.textbookPdfUrl && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="bg-blue-100 rounded-lg p-2 mr-3">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">પાઠ્યપુસ્તક</h2>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="bg-blue-200 rounded-xl p-3 w-fit">
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{chapter.name}</h3>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">સંપૂર્ણ પ્રકરણની સામગ્રી PDF ફોર્મેટમાં</p>
                      <div className="flex items-center text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-md w-fit">
                        <BookOpen className="h-4 w-4 mr-1" />
                        <span>ઇન્ટરેક્ટિવ PDF વ્યુઅર</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced PDF Viewer */}
              <EnhancedPDFViewer
                pdfUrl={chapter.textbookPdfUrl}
                title={`${chapter.name} - પાઠ્યપુસ્તક`}
                type="textbook"
              />
              
              {/* Security Notice */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">સુરક્ષિત PDF વ્યુઅર</p>
                    <p className="text-sm text-blue-700 mt-1">
                      આ PDF સંરક્ષિત છે અને તમે તેને ઝૂમ, રોટેટ અને પૂર્ણ સ્ક્રીનમાં જોઈ શકો છો.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Solution Tab */}
          {activeTab === 'solution' && chapter.solutionPdfUrl && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="bg-yellow-100 rounded-lg p-2 mr-3">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">ઉકેલ માર્ગદર્શિકા</h2>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-yellow-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="bg-yellow-200 rounded-xl p-3 w-fit">
                      <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{chapter.name}</h3>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">વિગતવાર ઉકેલો અને સમજૂતીઓ</p>
                      <div className="flex items-center text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md w-fit">
                        <Star className="h-4 w-4 mr-1" />
                        <span>ઇન્ટરેક્ટિવ PDF વ્યુઅર</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced PDF Viewer */}
              <EnhancedPDFViewer
                pdfUrl={chapter.solutionPdfUrl}
                title={`${chapter.name} - ઉકેલ માર્ગદર્શિકા`}
                type="solution"
              />
              
              {/* Security Notice */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <div className="bg-yellow-100 rounded-full p-1 mr-2 mt-0.5">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">સુરક્ષિત PDF વ્યુઅર</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      આ PDF સંરક્ષિત છે અને તમે તેને ઝૂમ, રોટેટ અને પૂર્ણ સ્ક્રીનમાં જોઈ શકો છો.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* No Content Message */}
        {availableTabs.length === 0 && (
          <div className="text-center py-16 sm:py-20 bg-white rounded-xl shadow-lg mx-2 sm:mx-0 border border-gray-100">
            <div className="max-w-md mx-auto px-4">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">કોઈ સામગ્રી ઉપલબ્ધ નથી</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                આ પ્રકરણ માટે વિડિયો, પાઠ્યપુસ્તક અથવા ઉકેલ ટૂંક સમયમાં ઉપલબ્ધ થશે. 
                <br />કૃપા કરીને પછીથી તપાસો.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to={`/subject/${chapter.subjectId}`}
                  className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  વિષય પર પાછા જાવ
                </Link>
                <Link
                  to="/standards"
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  બધા ધોરણો જુઓ
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-4 right-4 md:hidden z-50">
        <Link
          to={`/subject/${chapter.subjectId}`}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label={`${chapter.subject?.name} માં પાછા જાવ`}
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
};

export default ChapterView;
