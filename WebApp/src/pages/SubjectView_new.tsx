import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, FileText, PlayCircle, Search, Filter, Download, Grid, List, Star } from 'lucide-react';
import { subjectsAPI } from '../services/subjects';

const SubjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'pdf'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: subject, isLoading } = useQuery({
    queryKey: ['subjects', id],
    queryFn: () => subjectsAPI.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">લોડ થઈ રહ્યું છે...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">વિષય મળ્યો નથી</h1>
          <p className="text-gray-600 mb-4">આ વિષય અસ્તિત્વમાં નથી અથવા કાઢી નાખવામાં આવ્યો છે</p>
          <Link 
            to="/standards" 
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ધોરણોની યાદીમાં પાછા જાવ
          </Link>
        </div>
      </div>
    );
  }

  // Filter chapters
  const filteredChapters = subject.chapters?.filter(chapter => {
    const matchesSearch = chapter.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'video' && chapter.videoUrl) ||
      (filterType === 'pdf' && (chapter.textbookPdfUrl || chapter.solutionPdfUrl));
    return matchesSearch && matchesFilter;
  }) || [];

  const sortedChapters = [...filteredChapters].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to={`/standard/${subject.standardId}`}
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {subject.standard?.name} માં પાછા જાવ
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-full p-4">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{subject.name}</h1>
              {subject.description && (
                <p className="text-xl text-white/90">{subject.description}</p>
              )}
              <div className="flex items-center space-x-6 mt-4 text-white/80">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  <span>{subject.chapters?.length || 0} પ્રકરણો</span>
                </div>
                <div className="flex items-center">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  <span>{subject.chapters?.filter(ch => ch.videoUrl).length || 0} વિડિયોઝ</span>
                </div>
                <div className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  <span>{subject.chapters?.filter(ch => ch.textbookPdfUrl || ch.solutionPdfUrl).length || 0} PDF ફાઇલો</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="પ્રકરણ શોધો..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'video' | 'pdf')}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">બધું</option>
                  <option value="video">વિડિયો સાથે</option>
                  <option value="pdf">PDF સાથે</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters */}
        {sortedChapters.length === 0 ? (
          <div className="text-center py-16">
            {searchTerm || filterType !== 'all' ? (
              <>
                <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">કોઈ પ્રકરણ મળ્યું નથી</h3>
                <p className="text-gray-600 mb-4">આપેલા ફિલ્ટર માટે કોઈ પરિણામ મળ્યું નથી</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  બધા પ્રકરણો બતાવો
                </button>
              </>
            ) : (
              <>
                <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">હજુ કોઈ પ્રકરણ નથી</h3>
                <p className="text-gray-600">આ વિષય માટે હજુ પ્રકરણો ઉમેરવામાં આવ્યા નથી</p>
              </>
            )}
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }`}>
            {sortedChapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/chapter/${chapter.id}`}
                className={`block ${
                  viewMode === 'grid'
                    ? 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden'
                    : 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-2">
                          <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {chapter.order}
                          </div>
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex space-x-2">
                          {chapter.videoUrl && (
                            <div className="bg-red-500 p-1 rounded">
                              <PlayCircle className="h-4 w-4" />
                            </div>
                          )}
                          {(chapter.textbookPdfUrl || chapter.solutionPdfUrl) && (
                            <div className="bg-green-500 p-1 rounded">
                              <Download className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{chapter.name}</h3>
                      {chapter.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{chapter.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {chapter.videoUrl && (
                            <div className="flex items-center">
                              <PlayCircle className="h-4 w-4 mr-1 text-red-500" />
                              વિડિયો
                            </div>
                          )}
                          {chapter.textbookPdfUrl && (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-1 text-blue-500" />
                              પાઠ્યપુસ્તક
                            </div>
                          )}
                          {chapter.solutionPdfUrl && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              ઉકેલ
                            </div>
                          )}
                        </div>
                        <div className="text-indigo-600 text-sm font-medium">
                          અધ્યયન કરો →
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center">
                        <span className="text-indigo-600 font-bold">{chapter.order}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{chapter.name}</h3>
                        {chapter.description && (
                          <p className="text-gray-600 text-sm mt-1">{chapter.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-2">
                        {chapter.videoUrl && (
                          <div className="bg-red-100 p-2 rounded-full">
                            <PlayCircle className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                        {chapter.textbookPdfUrl && (
                          <div className="bg-blue-100 p-2 rounded-full">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        {chapter.solutionPdfUrl && (
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <Star className="h-4 w-4 text-yellow-600" />
                          </div>
                        )}
                      </div>
                      <ArrowLeft className="h-5 w-5 text-indigo-600 transform rotate-180" />
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectView;
