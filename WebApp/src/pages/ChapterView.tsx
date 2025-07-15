import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, ExternalLink, PlayCircle, Star, Clock, Eye, ThumbsUp, Share2, Bookmark, Menu, X } from 'lucide-react';
import { chaptersAPI } from '../services/chapters';
import IframePDFViewer from '../components/IframePDFViewer';

const ChapterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'video' | 'textbook' | 'solution'>('video');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapters', id],
    queryFn: () => chaptersAPI.getById(id!),
    enabled: !!id,
  });

  const availableTabs = React.useMemo(() => {
    if (!chapter) return [];

    return [
      ...(chapter.videoUrl ? [{ id: 'video', label: 'Video Lecture', icon: PlayCircle, color: 'text-red-500' }] : []),
      ...(chapter.textbookPdfUrl ? [{ id: 'textbook', label: 'Textbook', icon: BookOpen, color: 'text-blue-500' }] : []),
      ...(chapter.solutionPdfUrl ? [{ id: 'solution', label: 'Solutions', icon: Star, color: 'text-emerald-500' }] : []),
    ] as const;
  }, [chapter]);

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id as 'video' | 'textbook' | 'solution');
    }
  }, [availableTabs, activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-300 rounded-full animate-spin mx-auto opacity-60" style={{ animationDuration: '2s' }}></div>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Loading Chapter</h3>
          <p className="text-slate-500 mt-1">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Chapter Not Found</h1>
          <p className="text-slate-600 mb-6">The chapter you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/standards"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
           
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Modern Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <Link
                to={`/subject/${chapter.subjectId}`}
                className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
              
              </Link>
              
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {chapter.order}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-slate-900 truncate">
                    {chapter.name}
                  </h1>
                  <p className="text-sm text-slate-500 truncate">
                    {chapter.subject?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <ThumbsUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
       

        {/* Tab Navigation */}
        {availableTabs.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
              <nav className="flex space-x-1">
                {availableTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'video' | 'textbook' | 'solution')}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 mr-2 ${
                        activeTab === tab.id ? 'text-white' : tab.color
                      }`} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Video Content */}
          {activeTab === 'video' && chapter.videoUrl && (
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Video Lecture</h3>
                  <p className="text-sm text-slate-600">Interactive learning experience</p>
                </div>
              </div>
              
              <div className="relative bg-slate-900 rounded-lg overflow-hidden mb-6">
                <div className="aspect-video">
                  <iframe
                    src={chapter.videoUrl}
                    title={`${chapter.name} - Video Lecture`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-slate-600">
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="text-sm">1,234 views</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">156 likes</span>
                  </div>
                </div>
                <a
                  href={chapter.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch on YouTube
                </a>
              </div>
            </div>
          )}

          {/* Textbook Content */}
          {activeTab === 'textbook' && chapter.textbookPdfUrl && (
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Textbook</h3>
                  <p className="text-sm text-slate-600">Interactive PDF viewer</p>
                </div>
              </div>
              
              <div className="h-[600px] lg:h-[700px]">
                <IframePDFViewer
                  pdfUrl={chapter.textbookPdfUrl}
                  title={`${chapter.name} - Textbook`}
                  type="textbook"
                />
              </div>
            </div>
          )}

          {/* Solution Content */}
          {activeTab === 'solution' && chapter.solutionPdfUrl && (
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Solution Guide</h3>
                  <p className="text-sm text-slate-600">Detailed solutions and explanations</p>
                </div>
              </div>
              
              <div className="h-[600px] lg:h-[700px]">
                <IframePDFViewer
                  pdfUrl={chapter.solutionPdfUrl}
                  title={`${chapter.name} - Solution Guide`}
                  type="solution"
                />
              </div>
            </div>
          )}

          {/* No Content Available */}
          {availableTabs.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Content Available</h3>
              <p className="text-slate-600 mb-6">
                Content for this chapter will be available soon. Please check back later.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to={`/subject/${chapter.subjectId}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
            
                </Link>
                <Link
                  to="/standards"
                  className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View All Standards
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChapterView;