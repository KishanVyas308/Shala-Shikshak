import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, Download, ExternalLink, PlayCircle, Star, Clock, Eye, ThumbsUp, Share2, Bookmark } from 'lucide-react';
import { chaptersAPI } from '../services/chapters';

const ChapterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'video' | 'textbook' | 'solution'>('video');

  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapters', id],
    queryFn: () => chaptersAPI.getById(id!),
    enabled: !!id,
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            to={`/subject/${chapter.subjectId}`}
            className="inline-flex items-center text-white/80 hover:text-white mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {chapter.subject?.name} માં પાછા જાવ
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-full p-3 sm:p-4 w-fit">
                <div className="bg-white/20 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold">
                  {chapter.order}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{chapter.name}</h1>
                {chapter.description && (
                  <p className="text-lg sm:text-xl text-white/90 mb-3 sm:mb-4">{chapter.description}</p>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-white/80 text-sm sm:text-base">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span>{chapter.subject?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span>અંદાજિત 30 મિનિટ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4 lg:mt-0">
              <button className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab Navigation */}
        {availableTabs.length > 0 && (
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 mb-6 sm:mb-8 bg-gray-100 p-1 rounded-lg">
            {availableTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'video' | 'textbook' | 'solution')}
                  className={`flex-1 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${tab.color}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Video Tab */}
          {activeTab === 'video' && chapter.videoUrl && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <PlayCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mr-2 sm:mr-3" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">વિડિયો લેક્ચર</h2>
              </div>
              
              <div className="aspect-w-16 aspect-h-9 mb-4 sm:mb-6">
                <iframe
                  src={getYouTubeEmbedUrl(chapter.videoUrl)}
                  title={`${chapter.name} - વિડિયો લેક્ચર`}
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] rounded-lg shadow-md"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center text-gray-600 text-sm sm:text-base">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span>1,234 views</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm sm:text-base">
                    <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span>156 likes</span>
                  </div>
                </div>
                <a
                  href={chapter.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  <ExternalLink className="h-4 w-4 mr-1 sm:mr-2" />
                  YouTube પર જુઓ
                </a>
              </div>
            </div>
          )}

          {/* Textbook Tab */}
          {activeTab === 'textbook' && chapter.textbookPdfUrl && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">પાઠ્યપુસ્તક</h2>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="bg-blue-100 rounded-lg p-2 sm:p-3 w-fit">
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{chapter.name} - પાઠ્યપુસ્તક</h3>
                      <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">સંપૂર્ણ પ્રકરણની સામગ્રી PDF ફોર્મેટમાં</p>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <a
                          href={`http://localhost:5000${chapter.textbookPdfUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                        >
                          <ExternalLink className="h-4 w-4 mr-1 sm:mr-2" />
                          જુઓ
                        </a>
                        <a
                          href={`http://localhost:5000${chapter.textbookPdfUrl}`}
                          download
                          className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base"
                        >
                          <Download className="h-4 w-4 mr-1 sm:mr-2" />
                          ડાઉનલોડ
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={`http://localhost:5000${chapter.textbookPdfUrl}#toolbar=0`}
                  title={`${chapter.name} - પાઠ્યપુસ્તક`}
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[600px]"
                ></iframe>
              </div>
            </div>
          )}

          {/* Solution Tab */}
          {activeTab === 'solution' && chapter.solutionPdfUrl && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mr-2 sm:mr-3" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">ઉકેલ</h2>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="bg-yellow-100 rounded-lg p-2 sm:p-3 w-fit">
                      <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{chapter.name} - ઉકેલ માર્ગદર્શિકા</h3>
                      <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">વિગતવાર ઉકેલો અને સમજૂતીઓ</p>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <a
                          href={`http://localhost:5000${chapter.solutionPdfUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm sm:text-base"
                        >
                          <ExternalLink className="h-4 w-4 mr-1 sm:mr-2" />
                          જુઓ
                        </a>
                        <a
                          href={`http://localhost:5000${chapter.solutionPdfUrl}`}
                          download
                          className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors text-sm sm:text-base"
                        >
                          <Download className="h-4 w-4 mr-1 sm:mr-2" />
                          ડાઉનલોડ
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={`http://localhost:5000${chapter.solutionPdfUrl}#toolbar=0`}
                  title={`${chapter.name} - ઉકેલ`}
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[600px]"
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* No Content Message */}
        {availableTabs.length === 0 && (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-lg mx-4 sm:mx-0">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">કોઈ સામગ્રી ઉપલબ્ધ નથી</h3>
            <p className="text-gray-600 max-w-md mx-auto px-4 text-sm sm:text-base">
              આ પ્રકરણ માટે સામગ્રી ટૂંક સમયમાં ઉપલબ્ધ થશે. કૃપા કરીને પછીથી તપાસો.
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <Link
          to={`/subject/${chapter.subjectId}`}
          className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label={`${chapter.subject?.name} માં પાછા જાવ`}
        >
          <ArrowLeft className="h-7 w-7" />
        </Link>
      </div>
    </div>
  );
};

export default ChapterView;
