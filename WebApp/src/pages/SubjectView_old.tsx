import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, FileText, PlayCircle, Search, Filter, Clock, Star, Download, Grid, List } from 'lucide-react';
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
            <div className="mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {subject.standard?.name}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{subject.name}</h1>
            {subject.description && (
              <p className="text-gray-600 mb-4">{subject.description}</p>
            )}
            <div className="text-sm text-gray-500">
              {subject.chapters?.length || 0} chapters available
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Chapters</h2>
          
          {subject.chapters && subject.chapters.length > 0 ? (
            <div className="space-y-4">
              {subject.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  to={`/chapter/${chapter.id}`}
                  className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-indigo-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium mr-3">
                          {chapter.order}
                        </span>
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                          {chapter.name}
                        </h3>
                      </div>
                      
                      {chapter.description && (
                        <p className="text-gray-600 mb-3 ml-11">{chapter.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 ml-11">
                        {chapter.videoUrl && (
                          <div className="flex items-center text-sm text-green-600">
                            <PlayCircle className="h-4 w-4 mr-1" />
                            <span>Video Available</span>
                          </div>
                        )}
                        {chapter.textbookPdfUrl && (
                          <div className="flex items-center text-sm text-blue-600">
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span>Textbook PDF</span>
                          </div>
                        )}
                        {chapter.solutionPdfUrl && (
                          <div className="flex items-center text-sm text-purple-600">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>Solution PDF</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No chapters available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Chapters for this subject will appear here once they are added.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectView;
