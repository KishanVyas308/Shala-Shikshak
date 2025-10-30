import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, FileText, Users, ArrowRight } from 'lucide-react';
import { standardsAPI } from '../services/standards';

interface Subject {
  id: string;
  name: string;
  description?: string;
  standardId: string;
  chapters? : Chapter[];
  createdAt: string;
  updatedAt: string;
}

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


const StandardView: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: standard, isLoading, error } = useQuery({
    queryKey: ['standards', id],
    queryFn: () => standardsAPI.getById(id!),
    enabled: !!id,
  });
  console.log(JSON.stringify(standard, null, 2)); // Debugging output
  

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

  if (error || !standard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">ધોરણ મળ્યું નથી</h2>
          <p className="text-gray-600 mb-4">આ ધોરણ અસ્તિત્વમાં નથી અથવા કાઢી નાખવામાં આવ્યું છે</p>
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

  const sortedSubjects = [...(standard.subjects || [])].sort((a, b) => {
    const aDate = new Date(a.createdAt || 0);
    const bDate = new Date(b.createdAt || 0);
    return bDate.getTime() - aDate.getTime(); // Most recent first
  });
  const totalChapters = sortedSubjects.reduce((total, subject) => total + (subject._count?.chapters || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 ">
        {/* Breadcrumb */}
        <div  className=" bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-2xl items-center space-x-1 px-3 lg:px-4 lg:py-4 my-4 flex ">
          <Link
            to="/standards"
            className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors text-sm sm:text-base font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">તમામ ધોરણો</span>
            <span className="sm:hidden">પાછા</span>
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium text-sm sm:text-base truncate">{standard.name}</span>
        </div>

        {sortedSubjects.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16 px-3 sm:px-4">
            <BookOpen className="mx-auto h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-900 mb-2 px-2">કોઈ વિષય ઉપલબ્ધ નથી</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 px-2 sm:px-4 text-sm sm:text-base max-w-md mx-auto">
              આ ધોરણ માટે હાલમાં કોઈ વિષય ઉપલબ્ધ નથી. કૃપા કરીને પછીથી પ્રયાસ કરો.
            </p>
            <Link
              to="/standards"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              ધોરણોની યાદીમાં પાછા જાવ
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-12">
              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center transform hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-center">
                <div className="bg-blue-100 rounded-full p-2 sm:p-3 lg:p-4 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">{sortedSubjects.length}</h3>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base font-medium">કુલ વિષયો</p>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center transform hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-center">
                <div className="bg-green-100 rounded-full p-2 sm:p-3 lg:p-4 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">{totalChapters}</h3>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base font-medium">કુલ પ્રકરણો</p>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-center transform hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-center">
                <div className="bg-purple-100 rounded-full p-2 sm:p-3 lg:p-4 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">500+</h3>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base font-medium">વિદ્યાર્થીઓ</p>
              </div>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {sortedSubjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:hidden z-40">
        <Link
          to="/standards"
          className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="ધોરણોની યાદીમાં પાછા જાવ"
        >
          <ArrowLeft className="h-5 w-5 sm:h-7 sm:w-7" />
        </Link>
      </div>
    </div>
  );
};

interface SubjectCardProps {
  subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  return (
    <Link
      to={`/subject/${subject.id}`}
      className="group bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 sm:hover:-translate-y-1 lg:hover:-translate-y-2 overflow-hidden active:scale-95 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] flex flex-col"
    >
      <div className="p-4 lg:p-8 flex-grow flex flex-col">
        <div className="flex items-center justify-between ">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 group-hover:text-indigo-600 transition-colors flex-shrink-0 leading-tight">
            {subject.name}
          </h3>
          <div className="bg-indigo-50 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 flex-shrink-0">
            <span className="text-xs sm:text-sm font-medium text-indigo-600">નવું</span>
          </div>
        </div>



        {subject.description && (
          <p className="text-gray-600 mb-3 sm:mb-4 lg:mb-6 leading-relaxed line-clamp-3 text-xs sm:text-sm lg:text-base flex-grow">
            {subject.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1 sm:pt-2">
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span>{subject.chapters?.length  || 0} પ્રકરણો</span>

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

export default StandardView;