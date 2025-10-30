import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, ExternalLink, PlayCircle, Star, Users, Settings, FileText, Video } from 'lucide-react';
import { chaptersAPI } from '../services/chapters';
import { chapterResourcesAPI } from '../services/chapterResources';
import PDFViewer from '../components/PDFViewer';
import type { ChapterResource } from '../types';

const ChapterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'svadhyay' | 'svadhyay_pothi' | 'other'>('svadhyay');
  const [selectedResource, setSelectedResource] = useState<ChapterResource | null>(null);

  const { data: chapter, isLoading, error } = useQuery({
    queryKey: ['chapters', id],
    queryFn: () => chaptersAPI.getById(id!),
    enabled: !!id,
  });

  const { data: resourcesData } = useQuery({
    queryKey: ['chapter-resources-grouped', id],
    queryFn: () => chapterResourcesAPI.getByChapterGrouped(id!),
    enabled: !!id,
  });

  const tabs = [
    { id: 'svadhyay', label: 'સ્વાધ્યાય', icon: BookOpen, color: 'text-blue-500' },
    { id: 'svadhyay_pothi', label: 'સ્વાધ્યાય પોથી', icon: Users, color: 'text-green-500' },
    { id: 'other', label: 'અન્ય', icon: Settings, color: 'text-gray-500' },
  ] as const;

  const ResourceCard = ({ resource }: { resource: ChapterResource }) => {
    const isSelected = selectedResource?.id === resource.id;
    
    return (
      <div 
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'border-indigo-500 bg-indigo-50 shadow-md' 
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
        onClick={() => setSelectedResource(resource)}
      >
        <div className="flex items-center space-x-3">
          {resource.resourceType === 'video' ? (
            <Video className="w-5 h-5 text-red-500" />
          ) : (
            <FileText className="w-5 h-5 text-blue-500" />
          )}
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{resource.title}</h3>
            {resource.description && (
              <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {resource.resourceType === 'video' ? 'વિડિયો' : 'PDF'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ResourceViewer = ({ resource }: { resource: ChapterResource }) => {
    if (resource.resourceType === 'video') {
      // Extract YouTube video ID
      const extractVideoId = (url: string): string => {
        if (url.includes('youtu.be')) {
          const idMatch = url.match(/youtu\.be\/([^?&]+)/);
          return idMatch?.[1] || '';
        }
        if (url.includes('youtube.com/watch')) {
          const urlParams = new URLSearchParams(url.split('?')[1]);
          return urlParams.get('v') || '';
        }
        if (url.includes('youtube.com/embed')) {
          const idMatch = url.match(/embed\/([^?&]+)/);
          return idMatch?.[1] || '';
        }
        return '';
      };

      const videoId = extractVideoId(resource.url);
      
      if (!videoId) {
        return (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-center">
              <p className="mb-4 text-gray-600">Invalid video URL</p>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Link
              </a>
            </div>
          </div>
        );
      }

      const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&showinfo=0&modestbranding=1`;

      return (
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title={resource.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-presentation"
            ></iframe>
          </div>
        </div>
      );
    } else if (resource.resourceType === 'pdf') {
      return (
        <div className="h-[70vh] rounded-lg overflow-hidden bg-gray-100">
          <PDFViewer fileurl={resource.url} />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="mb-4 text-gray-600">Unsupported resource type</p>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Link
          </a>
        </div>
      </div>
    );
  };

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

  const currentTabResources = resourcesData?.resources?.[activeTab] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Breadcrumb */}
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
            <>
              <Link
                to={`/standard/${chapter.subject.standard.id}`}
                className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                {chapter.subject.standard.name}
              </Link>
              <span className="text-gray-400">/</span>
            </>
          )}
          {chapter.subject && (
            <>
              <Link
                to={`/subject/${chapter.subject.id}`}
                className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                {chapter.subject.name}
              </Link>
              <span className="text-gray-400">/</span>
            </>
          )}
          <span className="text-gray-600 font-medium text-sm truncate">
            {chapter.name}
          </span>
        </div>

        {/* Chapter Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{chapter.name}</h1>
          {chapter.description && (
            <p className="text-gray-600">{chapter.description}</p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const tabResourceCount = resourcesData?.counts?.[tab.id] || 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedResource(null);
                    }}
                    className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 mr-2 ${
                      activeTab === tab.id ? 'text-white' : tab.color
                    }`} />
                    <span className="text-sm font-medium">
                      {tab.label} ({tabResourceCount})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Resource List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                {tabs.find(t => t.id === activeTab)?.label} સામગ્રી
              </h2>
              
              {currentTabResources.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-600 text-sm">કોઈ સામગ્રી ઉપલબ્ધ નથી</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentTabResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resource Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              {selectedResource ? (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    {selectedResource.resourceType === 'video' ? (
                      <PlayCircle className="w-6 h-6 text-red-500" />
                    ) : (
                      <FileText className="w-6 h-6 text-blue-500" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedResource.title}</h3>
                      {selectedResource.description && (
                        <p className="text-sm text-gray-600">{selectedResource.description}</p>
                      )}
                    </div>
                  </div>
                  <ResourceViewer resource={selectedResource} />
                </div>
              ) : (
                <div className="text-center py-16">
                  <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">સામગ્રી પસંદ કરો</h3>
                  <p className="text-gray-600">
                    ડાબી બાજુથી કોઈ પણ સામગ્રી પસંદ કરો તેને જોવા માટે
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Back Button */}
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
