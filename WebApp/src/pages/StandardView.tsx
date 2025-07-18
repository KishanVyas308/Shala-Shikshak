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
      {/* Professional Mobile Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Top Row */}
          <div className="flex items-center justify-between py-3 sm:py-4">
            <Link
              to="/standards"
              className="flex items-center text-white/90 hover:text-white transition-all duration-200 p-1 sm:p-2 -ml-2 rounded-xl hover:bg-white/10 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">પાછા જાવ</span>
            </Link>
            <div className="flex-1 text-center mx-2 sm:mx-4">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{standard.name}</h1>
            </div>
            <div className="w-12 sm:w-16"></div> {/* Spacer for balance */}
          </div>

          {/* Stats Row */}
          <div className="pb-3 sm:pb-4">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm font-medium">{standard.subjects?.length || 0} વિષયો</span>
              </div>
              <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm font-medium">
                  {standard.subjects?.reduce((total, subject) => total + (subject.chapters?.length || 0), 0) || 0} પ્રકરણો
                </span>
              </div>
            </div>
          </div>

          {/* Compact Search Bar */}
          <div className="pb-3 sm:pb-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-3 w-3 sm:h-4 sm:w-4" />
              <input
                type="text"
                placeholder="વિષય શોધો..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 text-white placeholder-white/70 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Compact Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6 sticky top-24 z-30">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Sort Dropdown */}
            <div className="relative flex-1 max-w-36">
              <Filter className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'chapters' | 'recent')}
                className="appearance-none bg-white border border-gray-200 rounded-lg pl-8 sm:pl-10 pr-6 sm:pr-8 py-1.5 sm:py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm cursor-pointer w-full"
              >
                <option value="name">નામ</option>
                <option value="chapters">પ્રકરણો</option>
                <option value="recent">તાજેતરના</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center p-1 sm:p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="Grid view"
              >
                <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center p-1 sm:p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="List view"
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Professional Subject Cards */}
        {sortedSubjects.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            {searchTerm ? (
              <>
                <div className="bg-gray-100 rounded-full p-3 sm:p-4 w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">કોઈ વિષય મળ્યો નથી</h3>
                <p className="text-gray-600 mb-3 sm:mb-4 max-w-sm mx-auto text-sm sm:text-base">"{searchTerm}" માટે કોઈ પરિણામ મળ્યું નથી</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs sm:text-sm"
                >
                  બધા વિષયો બતાવો
                </button>
              </>
            ) : (
              <>
                <div className="bg-gray-100 rounded-full p-3 sm:p-4 w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">હજુ કોઈ વિષય નથી</h3>
                <p className="text-gray-600 max-w-sm mx-auto text-sm sm:text-base">આ ધોરણ માટે હજુ વિષયો ઉમેરવામાં આવ્યા નથી</p>
              </>
            )}
          </div>
        ) : (
          <div className={`${viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
            : 'space-y-3 sm:space-y-4'
            }`}>
            {sortedSubjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className={`group block ${viewMode === 'grid'
                  ? 'bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 overflow-hidden active:scale-95 border border-gray-100'
                  : 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 sm:p-4 active:scale-95 border border-gray-100'
                  }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Card Header with Gradient */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
                      <div className="relative flex items-center justify-between text-white">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-80 font-medium">પ્રકરણો</div>
                          <div className="text-2xl font-bold">{subject.chapters?.length || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2">
                        {subject.name}
                      </h3>

                      {subject.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {subject.description}
                        </p>
                      )}

                      {/* Stats Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>{subject.chapters?.length || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-1" />
                            <span>{subject.chapters?.filter(ch => ch.videoUrl).length || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:text-indigo-700">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">અધ્યયન કરો</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Border Effect */}
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {subject.name}
                      </h3>
                      {subject.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-1">{subject.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          <span>{subject.chapters?.length || 0} પ્રકરણો</span>
                        </div>
                        <div className="flex items-center">
                          <Video className="h-3 w-3 mr-1" />
                          <span>{subject.chapters?.filter(ch => ch.videoUrl).length || 0} વિડિયો</span>
                        </div>
                      </div>
                    </div>
                    <ArrowLeft className="h-5 w-5 text-indigo-600 transform rotate-180 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
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
