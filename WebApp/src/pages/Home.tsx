import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, FileText, PlayCircle, Star, ArrowRight } from 'lucide-react';
import WhatsAppJoinButton from '../components/WhatsAppJoinButton';

const Home: React.FC = () => {
  const features = [
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "વ્યાપક અભ્યાસક્રમ",
      description: "તમામ ધોરણો અને વિષયો માટે સંપૂર્ણ અધ્યયન સામગ્રી",
      color: "bg-blue-500"
    },
    {
      icon: <PlayCircle className="h-8 w-8" />,
      title: "વિડિયો લેક્ચર્સ",
      description: "YouTube પર ઉપલબ્ધ ઉચ્ચ ગુણવત્તાવાળા વિડિયો પાઠો",
      color: "bg-red-500"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "PDF નોટ્સ",
      description: "ડાઉનલોડ કરી શકાય તેવી વિગતવાર અધ્યયન સામગ્રી",
      color: "bg-green-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "સરળ ઉપયોગ",
      description: "વિદ્યાર્થીઓ અને શિક્ષકો બંને માટે સહજ ઇન્ટરફેસ",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-full p-4 sm:p-6">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              શાળા શિક્ષક
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              ગુજરાતી માધ્યમના વિદ્યાર્થીઓ માટે આધુનિક શિક્ષણ પ્લેટફોર્મ
            </p>
            <p className="text-base sm:text-lg text-white/80 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
              તમામ ધોરણો અને વિષયો માટે સંપૂર્ણ અધ્યયન સામગ્રી, વિડિયો લેક્ચર્સ અને PDF નોટ્સ
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                to="/standards"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg text-base sm:text-lg"
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                અધ્યયન શરૂ કરો
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300 text-base sm:text-lg"
              >
                અમારા વિશે જાણો
              </Link>
            </div>
            
            {/* WhatsApp Join Button */}
            <div className="mt-6 sm:mt-8 flex justify-center">
              <WhatsAppJoinButton size="lg" className="shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Study Stats Section - Mobile Optimized */}
      {/* <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-600 mb-1 sm:mb-2">12+</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">ધોરણો</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-1 sm:mb-2">50+</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">વિષયો</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">500+</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">પ્રકરણો</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 mb-1 sm:mb-2">1000+</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">વિદ્યાર્થીઓ</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              અમારી વિશેષતાઓ
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              આધુનિક તકનીકી સાથે પરંપરાગત શિક્ષણને જોડીને બનાવેલ અનોખું પ્લેટફોર્મ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 group cursor-pointer active:scale-95 min-h-[200px] sm:min-h-[220px] flex flex-col"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 ${feature.color} text-white rounded-xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  {React.cloneElement(feature.icon, { className: "h-6 w-6 sm:h-8 sm:w-8" })}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex-shrink-0">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base flex-grow">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-8 sm:p-12">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-300 fill-current" />
                ))}
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
              આજે જ અધ્યયન શરૂ કરો
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed px-2">
              હજારો વિદ્યાર્થીઓ અમારા પ્લેટફોર્મ દ્વારા સફળતા મેળવી રહ્યા છે
            </p>
            <Link
              to="/standards"
              className="inline-flex items-center px-8 sm:px-10 py-3 sm:py-4 bg-white text-indigo-600 font-bold text-lg sm:text-xl rounded-full hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              અધ્યયન શરૂ કરો
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2 sm:ml-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-6 sm:mb-8">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400 mr-2 sm:mr-3" />
              <span className="text-xl sm:text-2xl font-bold">શાળા શિક્ષક</span>
            </div>
            <p className="text-gray-400 mb-6 text-sm sm:text-base px-4 max-w-2xl mx-auto">
              ગુજરાતી માધ્યમના વિદ્યાર્થીઓ માટે આધુનિક શિક્ષણ પ્લેટફોર્મ
            </p>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Navigation Links */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-4 text-indigo-400">મુખ્ય પૃષ્ઠો</h3>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  મુખ્ય પૃષ્ઠ
                </Link>
                <Link to="/standards" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  ધોરણો અને અભ્યાસ
                </Link>
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  અમારા વિશે
                </Link>
              </div>
            </div>

            {/* Support Links */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-indigo-400">સહાય અને માહિતી</h3>
              <div className="space-y-2">
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  સંપર્ક કરો
                </Link>
                <Link to="/privacy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  ગોપનીયતા નીતિ
                </Link>
                <a 
                  href="https://shalashikshak.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-white transition-colors text-sm"
                >
                  આધિકારિક વેબસાઇટ
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-right">
              <h3 className="text-lg font-semibold mb-4 text-indigo-400">સંપર્ક માહિતી</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">
                  <span className="block font-medium text-gray-300">સ્થાપક:</span>
                  પંકજ કપાડિયા
                </p>
                <p className="text-gray-400">
                  <span className="block font-medium text-gray-300">ઇમેઇલ:</span>
                  <a href="mailto:100xTechs@gmail.com" className="hover:text-white transition-colors">
                    100xTechs@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2025 શાળા શિક્ષક. તમામ અધિકારો સુરક્ષિત.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        {/* <Link
          to="/standards"
          className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse hover:animate-none"
          aria-label="અધ્યયન શરૂ કરો"
        >
          <BookOpen className="h-7 w-7" />
        </Link> */}
        {/* <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none transition-opacity duration-300 whitespace-nowrap">
          અધ્યયન શરૂ કરો
        </div> */}
      </div>
    </div>
  );
};

export default Home;
