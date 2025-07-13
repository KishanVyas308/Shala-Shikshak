import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, Video, FileText, Search, Filter, Grid, List, TrendingUp } from 'lucide-react';
import { standardsAPI } from '../services/standards';

const StandardView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'chapters' | 'recent'>('name');

  const { data: standard, isLoading } = useQuery({
    queryKey: ['standards', id],
    queryFn: () => standardsAPI.getById(id!),
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

  if (!standard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="bg-red-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 px-2">ધોરણ મળ્યું નથી</h1>
          <p className="text-gray-600 mb-4 text-sm sm:text-base px-2">આ ધોરણ અસ્તિત્વમાં નથી અથવા કાઢી નાખવામાં આવ્યું છે</p>
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

  // Filter and sort subjects
  const filteredSubjects = standard.subjects?.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    switch (sortBy) {
      case 'chapters':
        return (b.chapters?.length || 0) - (a.chapters?.length || 0);
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
          <Link
            to="/standards"
            className="inline-flex items-center text-white/80 hover:text-white mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            ધોરણોની યાદીમાં પાછા જાવ
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-full p-3 sm:p-4 w-fit">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 leading-tight">{standard.name}</h1>
              {standard.description && (
                <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-3 sm:mb-4">{standard.description}</p>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-white/80 text-sm sm:text-base">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span>{standard.subjects?.length || 0} વિષયો</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span>
                    {standard.subjects?.reduce((total, subject) => total + (subject.chapters?.length || 0), 0) || 0} પ્રકરણો
                  </span>
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
                placeholder="વિષય શોધો..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Sort */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'chapters' | 'recent')}
                  className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base flex-1 sm:flex-none"
                >
                  <option value="name">નામ પ્રમાણે</option>
                  <option value="chapters">પ્રકરણો પ્રમાણે</option>
                  <option value="recent">તાજેતરના</option>
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

        {/* Subjects */}
        {sortedSubjects.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
            {searchTerm ? (
              <>
                <Search className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 px-2">કોઈ વિષય મળ્યો નથી</h3>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base px-2">"{searchTerm}" માટે કોઈ પરિણામ મળ્યું નથી</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm sm:text-base"
                >
                  બધા વિષયો બતાવો
                </button>
              </>
            ) : (
              <>
                <BookOpen className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 px-2">હજુ કોઈ વિષય નથી</h3>
                <p className="text-gray-600 text-sm sm:text-base px-2">આ ધોરણ માટે હજુ વિષયો ઉમેરવામાં આવ્યા નથી</p>
              </>
            )}
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6'
              : 'space-y-3 sm:space-y-4'
          }`}>
            {sortedSubjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className={`block ${
                  viewMode === 'grid'
                    ? 'bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden active:scale-95'
                    : 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 active:scale-95'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 sm:p-6">
                      <div className="flex items-center justify-between text-white">
                        <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
                        <div className="text-right">
                          <div className="text-xs sm:text-sm opacity-80">પ્રકરણો</div>
                          <div className="text-lg sm:text-2xl font-bold">{subject.chapters?.length || 0}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 lg:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">{subject.name}</h3>
                      {subject.description && (
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{subject.description}</p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {subject.chapters?.length || 0} પ્રકરણો
                          </div>
                          <div className="flex items-center">
                            <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {subject.chapters?.filter(ch => ch.videoUrl).length || 0} વિડિયો
                          </div>
                        </div>
                        <div className="flex items-center text-indigo-600 self-end sm:self-auto">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="text-xs sm:text-sm font-medium">અધ્યયન કરો</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="bg-indigo-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{subject.name}</h3>
                        {subject.description && (
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{subject.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-500 ml-12 sm:ml-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {subject.chapters?.length || 0} પ્રકરણો
                        </div>
                        <div className="flex items-center">
                          <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {subject.chapters?.filter(ch => ch.videoUrl).length || 0} વિડિયો
                        </div>
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

export default StandardView;
