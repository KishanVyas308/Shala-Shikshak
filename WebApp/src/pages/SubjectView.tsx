import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, FileText, PlayCircle, Download, ArrowRight } from 'lucide-react';
import { subjectsAPI } from '../services/subjects';

interface Chapter {
  id: string;
  name?: string;
  description?: string;
  subjectId: string;
  videoUrl?: string;
  solutionPdfUrl?: string;
  solutionPdfFileName?: string;
  textbookPdfUrl?: string;
  textbookPdfFileName?: string;
  createdAt?: string;
  updatedAt?: string;
}



const SubjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: subject, isLoading, error } = useQuery({
    queryKey: ['subjects', id],
    queryFn: () => subjectsAPI.getById(id!),
    enabled: !!id,
  });

  console.log(JSON.stringify(subject, null, 2)); // Debugging output

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

  if (error || !subject) {
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

  const sortedChapters: Chapter[] = [...(subject.chapters || [])].sort((a, b) => {
    const aDate = new Date(a.createdAt || 0);
    const bDate = new Date(b.createdAt || 0);
    return bDate.getTime() - aDate.getTime(); // Most recent first
  });
  const filteredChapters = sortedChapters.filter(chapter =>
    chapter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chaptersWithVideo = sortedChapters.filter(chapter => chapter.videoUrl).length;
  const chaptersWithPdf = sortedChapters.filter(chapter => chapter.solutionPdfUrl || chapter.textbookPdfUrl).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 sm:py-2 md:py-6 lg:py-8">
        {/* Breadcrumb */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-2xl items-center space-x-1 px-3 my-4 flex">
          <Link
            to="/standards"
            className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors text-sm sm:text-base font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">તમામ ધોરણો</span>
            <span className="sm:hidden">પાછા</span>
          </Link>
          <span className="text-gray-400">/</span>
          {subject.standard && (

            <Link
              to={`/standard/${subject.standard.id}`}
              className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors text-sm sm:text-base font-medium"
            >
              {subject.standard.name}
            </Link>

          )}
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium text-sm sm:text-base truncate">{subject.name}</span>
        </div>



        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-12">
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center transform hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-center">
            <div className="bg-blue-100 rounded-full p-2 sm:p-3 lg:p-4 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">{sortedChapters.length}</h3>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base font-medium">કુલ પ્રકરણો</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center transform hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-center">
            <div className="bg-red-100 rounded-full p-2 sm:p-3 lg:p-4 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
              <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">{chaptersWithVideo}</h3>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base font-medium">વિડિયો લેક્ચર</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center transform hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-center">
            <div className="bg-green-100 rounded-full p-2 sm:p-3 lg:p-4 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
              <Download className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">{chaptersWithPdf}</h3>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base font-medium">PDF સામગ્રી</p>
          </div>
        </div>


        {/* Chapters */}
        {filteredChapters.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16 px-3 sm:px-4">
            <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-900 mb-2 px-2">
              {searchTerm ? 'કોઈ પ્રકરણ મળ્યું નથી' : 'કોઈ પ્રકરણ ઉપલબ્ધ નથી'}
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 px-2 sm:px-4 text-sm sm:text-base max-w-md mx-auto">
              {searchTerm
                ? 'આ શોધ માટે કોઈ પ્રકરણ મળ્યું નથી. કૃપા કરીને બીજા કીવર્ડ સાથે પ્રયાસ કરો.'
                : 'આ વિષય માટે હાલમાં કોઈ પ્રકરણ ઉપલબ્ધ નથી. કૃપા કરીને પછીથી પ્રયાસ કરો.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 active:scale-95"
              >
                શોધ સાફ કરો
              </button>
            )}
          </div>
        ) : (
          <div className={
            "space-y-4 sm:space-y-6"
          }>
            {filteredChapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:hidden z-40">
        <Link
          to={subject.standard ? `/standard/${subject.standard.id}` : '/standards'}
          className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="પાછા જાવ"
        >
          <ArrowLeft className="h-5 w-5 sm:h-7 sm:w-7" />
        </Link>
      </div>
    </div>
  );
};

interface ChapterCardProps {
  chapter: Chapter;
}

const ChapterCard: React.FC<ChapterCardProps> = ({ chapter }) => {
  const hasVideo = !!chapter.videoUrl;
  const hasSolutionPdf = !!chapter.solutionPdfUrl;
  const hasTextbookPdf = !!chapter.textbookPdfUrl;
 

    return (
      <Link
        to={`/chapter/${chapter.id}`}
        className="group bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 sm:hover:-translate-y-1 overflow-hidden active:scale-95 block"
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-grow">
              <div className="flex items-center mb-2">
                
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                  {chapter.name || 'પ્રકરણ'}
                </h3>
              </div>
              {chapter.description && (
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 line-clamp-2">
                  {chapter.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {hasVideo && (
                <div className="flex items-center text-red-600 text-xs sm:text-sm">
                  <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span>વિડિયો</span>
                </div>
              )}
              {hasSolutionPdf && (
                <div className="flex items-center text-green-600 text-xs sm:text-sm">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span>ઉકેલ PDF</span>
                </div>
              )}
              {hasTextbookPdf && (
                <div className="flex items-center text-blue-600 text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span>પુસ્તક PDF</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700 text-xs sm:text-sm lg:text-base">
              <span className="mr-1 sm:mr-2 hidden sm:inline">અધ્યયન કરો</span>
              <span className="mr-1 sm:hidden">અધ્યયન</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </div>
          </div>
        </div>
        
        {/* Gradient border effect */}
        <div className="h-0.5 sm:h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </Link>
    );
  
};

export default SubjectView;