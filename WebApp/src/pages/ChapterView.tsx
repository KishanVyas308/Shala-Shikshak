import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, ExternalLink, PlayCircle, Star, Eye, ThumbsUp } from 'lucide-react';
import { chaptersAPI } from '../services/chapters';
import PDFViewer from '../components/PDFViewer';

const ChapterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'video' | 'textbook' | 'solution'>('video');

  const { data: chapter, isLoading, error } = useQuery({
    queryKey: ['chapters', id],
    queryFn: () => chaptersAPI.getById(id!),
    enabled: !!id,
  });

  const availableTabs = React.useMemo(() => {
    if (!chapter) return [];

    return [
      ...(chapter.videoUrl ? [{ id: 'video', label: 'વિડિયો લેક્ચર', icon: PlayCircle, color: 'text-red-500' }] : []),
      ...(chapter.textbookPdfUrl ? [{ id: 'textbook', label: 'પુસ્તક PDF', icon: BookOpen, color: 'text-blue-500' }] : []),
      ...(chapter.solutionPdfUrl ? [{ id: 'solution', label: 'ઉકેલ PDF', icon: Star, color: 'text-emerald-500' }] : []),
    ] as const;
  }, [chapter]);

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id as 'video' | 'textbook' | 'solution');
    }
  }, [availableTabs, activeTab]);

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

  if (error || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">પ્રકરણ મળ્યું નથી</h2>
          <p className="text-gray-600 mb-4">આ પ્રકરણ અસ્તિત્વમાં નથી અથવા કાઢી નાખવામાં આવ્યું છે</p>
          <Link
            to="/standards"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ધોરણોની યાદીમાં પાછા જાવ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Compact Breadcrumb */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-2 my-3 flex items-center space-x-2 overflow-x-auto">
          <Link
            to="/standards"
            className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">તમામ ધોરણો</span>
            <span className="sm:hidden">પાછા</span>
          </Link>
          <span className="text-gray-400">/</span>
          {chapter.subject?.standard && (
            <Link
              to={`/standard/${chapter.subject.standard.id}`}
              className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                {chapter.subject.standard.name}
              </Link>
            
          )}
              <span className="text-gray-400">/</span>
          {chapter.subject && (
            
              <Link
                to={`/subject/${chapter.subject.id}`}
                className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                {chapter.subject.name}
              </Link>
            
          )}
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium text-sm truncate">
            {chapter.name || `પ્રકરણ `}
          </span>
        </div>



        {/* Minimal Tab Navigation */}
        {availableTabs.length > 0 && (
          <div className="mb-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
              <div className="flex space-x-1">
                {availableTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'video' | 'textbook' | 'solution')}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                        }`}
                    >
                      <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${activeTab === tab.id ? 'text-white' : tab.color
                        }`} />
                      <span className="text-xs sm:text-sm font-medium">
                        {tab.id === 'video' ? 'વિડિયો' : tab.id === 'textbook' ? 'પુસ્તક' : 'ઉકેલ'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {/* Video Content */}
          {activeTab === 'video' && chapter.videoUrl && (
            <div className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">વિડિયો લેક્ચર</h3>
                </div>
              </div>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-3">
                <div className="aspect-video">
                  {(() => {
                    // Extract YouTube video ID properly from various formats
                    const extractVideoId = (url: string): string => {
                      // Handle youtu.be format
                      if (url.includes('youtu.be')) {
                        const idMatch = url.match(/youtu\.be\/([^?&]+)/);
                        return idMatch?.[1] || '';
                      }

                      // Handle youtube.com/watch format
                      if (url.includes('youtube.com/watch')) {
                        const urlParams = new URLSearchParams(url.split('?')[1]);
                        return urlParams.get('v') || '';
                      }

                      // Handle youtube.com/embed format
                      if (url.includes('youtube.com/embed')) {
                        const idMatch = url.match(/embed\/([^?&]+)/);
                        return idMatch?.[1] || '';
                      }

                      return '';
                    };

                    const videoId = extractVideoId(chapter.videoUrl);
                    
                    if (!videoId) {
                      return (
                        <div className="flex items-center justify-center h-full bg-gray-800 text-white">
                          <div className="text-center">
                            <p className="mb-4">Invalid YouTube URL</p>
                            <a
                              href={chapter.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Watch on YouTube
                            </a>
                          </div>
                        </div>
                      );
                    }

                    // Create YouTube embed URL with additional parameters
                    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&showinfo=0&modestbranding=1`;

                    return (
                      <div className="relative w-full h-full">
                        <iframe
                          width="560"
                          height="315"
                          src={embedUrl}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                          className="w-full h-full"
                          style={{ border: 'none' }}
                          sandbox="allow-scripts allow-same-origin allow-presentation"
                          onError={() => {
                            console.error('YouTube iframe failed to load');
                          }}
                        ></iframe>
                        
                        {/* Fallback button - shows if iframe fails */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                          <a
                            href={chapter.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors pointer-events-auto"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in YouTube
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              {

                // <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 sm:p-3">
                //   <div className="flex items-center space-x-3">
                //     {/* These would normally be populated from API data */}
                //     <div className="flex items-center text-gray-600 text-xs">
                //       <Eye className="w-3 h-3 mr-1" />
                //       <span>{chapter.views || '—'}</span>
                //     </div>
                //     <div className="flex items-center text-gray-600 text-xs">
                //       <ThumbsUp className="w-3 h-3 mr-1" />
                //       <span>{chapter.likes || '—'}</span>
                //     </div>
                //   </div>
                //   <a
                //     href={chapter.videoUrl}
                //     target="_blank"
                //     rel="noopener noreferrer"
                //     className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                //     >
                //     <ExternalLink className="w-3 h-3 mr-1" />
                //     જુઓ
                //   </a>
                // </div>
              }
            </div>
          )}

          {/* Textbook Content */}
          {activeTab === 'textbook' && chapter.textbookPdfUrl && (
            <div className="p-0">
              <div className="h-[75vh] sm:h-[80vh] md:h-[85vh] rounded-lg overflow-hidden bg-gray-100 relative">

                <div className="w-full h-full">
                  <PDFViewer fileurl={chapter.textbookPdfUrl} />
                </div>

              </div>
            </div>
          )}

          {/* Solution Content */}
          {activeTab === 'solution' && chapter.solutionPdfUrl && (
            <div className="p-0">
              <div className="h-[70vh] sm:h-[80vh] rounded-lg overflow-hidden bg-gray-100">
                <div className="w-full h-full">
                  <PDFViewer fileurl={chapter.solutionPdfUrl} />
                </div>
              </div>
            </div>
          )}

          {/* No Content Available */}
          {availableTabs.length === 0 && (
            <div className="text-center py-8 px-3">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">કોઈ સામગ્રી ઉપલબ્ધ નથી</h3>
              <p className="text-gray-600 mb-4 text-sm max-w-md mx-auto">
                આ પ્રકરણ માટે સામગ્રી ટૂંક સમયમાં ઉપલબ્ધ થશે.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  to={`/subject/${chapter.subjectId}`}
                  className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  વિષયમાં પાછા જાવ
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simple Floating Back Button */}
      <div className="fixed bottom-4 right-4 sm:hidden z-40">
        <Link
          to={chapter.subject ? `/subject/${chapter.subject.id}` : '/standards'}
          className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg active:scale-95 transition-transform"
          aria-label="પાછા જાવ"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default ChapterView;