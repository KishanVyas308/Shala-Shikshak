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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-indigo-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-indigo-600 font-medium text-base sm:text-lg">લોડ થઈ રહ્યું છે...</p>
          <p className="text-gray-500 text-sm mt-2">કૃપા કરીને થોડી રાહ જુઓ</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="bg-red-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 px-2">વિષય મળ્યો નથી</h1>
          <p className="text-gray-600 mb-4 text-sm sm:text-base px-2">આ વિષય અસ્તિત્વમાં નથી અથવા કાઢી નાખવામાં આવ્યો છે</p>
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
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-5">
          <Link
            to={`/standard/${subject.standardId}`}
            className="inline-flex items-center text-white/80 hover:text-white mb-3 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {subject.standard?.name} માં પાછા જાવ
          </Link>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-2 sm:p-3 flex-shrink-0">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 leading-tight truncate">{subject.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center text-white/80 text-xs sm:text-sm space-y-1 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{subject.chapters?.length || 0} પ્રકરણો</span>
                </div>
                <div className="flex items-center">
                  <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{subject.chapters?.filter(ch => ch.videoUrl).length || 0} વિડિયોઝ</span>
                </div>
                <div className="flex items-center">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{subject.chapters?.filter(ch => ch.textbookPdfUrl || ch.solutionPdfUrl).length || 0} PDF ફાઇલો</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="પ્રકરણ શોધો..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'video' | 'pdf')}
                  className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base flex-1 sm:flex-none"
                >
                  <option value="all">બધું</option>
                  <option value="video">વિડિયો સાથે</option>
                  <option value="pdf">PDF સાથે</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden w-fit">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } transition-colors`}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } transition-colors`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters */}
        {sortedChapters.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
            {searchTerm || filterType !== 'all' ? (
              <>
                <Search className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 px-2">કોઈ પ્રકરણ મળ્યું નથી</h3>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base px-2">આપેલા ફિલ્ટર માટે કોઈ પરિણામ મળ્યું નથી</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm sm:text-base"
                >
                  બધા પ્રકરણો બતાવો
                </button>
              </>
            ) : (
              <>
                <FileText className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 px-2">હજુ કોઈ પ્રકરણ નથી</h3>
                <p className="text-gray-600 text-sm sm:text-base px-2">આ વિષય માટે હજુ પ્રકરણો ઉમેરવામાં આવ્યા નથી</p>
              </>
            )}
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6'
              : 'space-y-3 sm:space-y-4'
          }`}>
            {sortedChapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/chapter/${chapter.id}`}
                className={`block ${
                  viewMode === 'grid'
                    ? 'bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden active:scale-95'
                    : 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 active:scale-95'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 sm:p-6">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-2">
                          <div className="bg-white/20 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold">
                            {chapter.order}
                          </div>
                          <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex space-x-1 sm:space-x-2">
                          {chapter.videoUrl && (
                            <div className="bg-red-500 p-0.5 sm:p-1 rounded">
                              <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                          )}
                          {(chapter.textbookPdfUrl || chapter.solutionPdfUrl) && (
                            <div className="bg-green-500 p-0.5 sm:p-1 rounded">
                              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 lg:p-6">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 leading-tight">{chapter.name}</h3>
                      {chapter.description && (
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{chapter.description}</p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-500">
                          {chapter.videoUrl && (
                            <div className="flex items-center">
                              <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-red-500" />
                              <span className="hidden sm:inline">વિડિયો</span>
                              <span className="sm:hidden">વીડિયો</span>
                            </div>
                          )}
                          {chapter.textbookPdfUrl && (
                            <div className="flex items-center">
                              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-blue-500" />
                              <span className="hidden sm:inline">પાઠ્યપુસ્તક</span>
                              <span className="sm:hidden">પુસ્તક</span>
                            </div>
                          )}
                          {chapter.solutionPdfUrl && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-yellow-500" />
                              ઉકેલ
                            </div>
                          )}
                        </div>
                        <div className="text-indigo-600 text-xs sm:text-sm font-medium self-end sm:self-auto">
                          <span className="hidden sm:inline">અધ્યયન કરો →</span>
                          <span className="sm:hidden">અધ્યયન →</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="bg-indigo-100 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-600 font-bold text-sm sm:text-base">{chapter.order}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{chapter.name}</h3>
                        {chapter.description && (
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{chapter.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4 ml-13 sm:ml-0">
                      <div className="flex space-x-1 sm:space-x-2">
                        {chapter.videoUrl && (
                          <div className="bg-red-100 p-1.5 sm:p-2 rounded-full">
                            <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                          </div>
                        )}
                        {chapter.textbookPdfUrl && (
                          <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                        )}
                        {chapter.solutionPdfUrl && (
                          <div className="bg-yellow-100 p-1.5 sm:p-2 rounded-full">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                          </div>
                        )}
                      </div>
                      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 transform rotate-180 flex-shrink-0" />
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
