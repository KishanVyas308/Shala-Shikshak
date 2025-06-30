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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">લોડ થઈ રહ્યું છે...</p>
        </div>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ધોરણ મળ્યું નથી</h1>
          <p className="text-gray-600 mb-4">આ ધોરણ અસ્તિત્વમાં નથી અથવા કાઢી નાખવામાં આવ્યું છે</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/standards"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            ધોરણોની યાદીમાં પાછા જાવ
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-full p-4">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{standard.name}</h1>
              {standard.description && (
                <p className="text-xl text-white/90">{standard.description}</p>
              )}
              <div className="flex items-center space-x-6 mt-4 text-white/80">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span>{standard.subjects?.length || 0} વિષયો</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="વિષય શોધો..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'chapters' | 'recent')}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="name">નામ પ્રમાણે</option>
                  <option value="chapters">પ્રકરણો પ્રમાણે</option>
                  <option value="recent">તાજેતરના</option>
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

        {/* Subjects */}
        {sortedSubjects.length === 0 ? (
          <div className="text-center py-16">
            {searchTerm ? (
              <>
                <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">કોઈ વિષય મળ્યો નથી</h3>
                <p className="text-gray-600 mb-4">"{searchTerm}" માટે કોઈ પરિણામ મળ્યું નથી</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  બધા વિષયો બતાવો
                </button>
              </>
            ) : (
              <>
                <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">હજુ કોઈ વિષય નથી</h3>
                <p className="text-gray-600">આ ધોરણ માટે હજુ વિષયો ઉમેરવામાં આવ્યા નથી</p>
              </>
            )}
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }`}>
            {sortedSubjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className={`block ${
                  viewMode === 'grid'
                    ? 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden'
                    : 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
                      <div className="flex items-center justify-between text-white">
                        <BookOpen className="h-8 w-8" />
                        <div className="text-right">
                          <div className="text-sm opacity-80">પ્રકરણો</div>
                          <div className="text-2xl font-bold">{subject.chapters?.length || 0}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{subject.name}</h3>
                      {subject.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{subject.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {subject.chapters?.length || 0} પ્રકરણો
                          </div>
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-1" />
                            {subject.chapters?.filter(ch => ch.videoUrl).length || 0} વિડિયો
                          </div>
                        </div>
                        <div className="flex items-center text-indigo-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">અધ્યયન કરો</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-indigo-100 rounded-full p-3">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                        {subject.description && (
                          <p className="text-gray-600 text-sm mt-1">{subject.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {subject.chapters?.length || 0} પ્રકરણો
                      </div>
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-1" />
                        {subject.chapters?.filter(ch => ch.videoUrl).length || 0} વિડિયો
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

export default StandardView;
