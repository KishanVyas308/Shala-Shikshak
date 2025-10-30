import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, Target, Heart, GraduationCap, Star, ArrowRight } from 'lucide-react';

const AboutUs: React.FC = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "ગુણવત્તાયુક્ત શિક્ષણ",
      description: "અમે ઉચ્ચ ગુણવત્તાવાળી શિક્ષણ સામગ્રી પ્રદાન કરીએ છીએ જે અભ્યાસક્રમના ધોરણો પૂરા કરે છે",
      color: "bg-blue-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "સહયોગી શિક્ષણ",
      description: "વિદ્યાર્થીઓ અને શિક્ષકો વચ્ચે સહયોગનું વાતાવરણ બનાવીએ છીએ",
      color: "bg-green-500"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "લક્ષ્ય-લક્ષી અભિગમ",
      description: "દરેક વિદ્યાર્થીના અનન્ય શિક્ષણ લક્ષ્યોને ધ્યાનમાં રાખીને સામગ્રી વ્યવસ્થિત કરીએ છીએ",
      color: "bg-purple-500"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "પ્રેમ અને સંવેદના",
      description: "શિક્ષણને આનંદદાયક અને સુલભ બનાવવાની અમારી પ્રતિબદ્ધતા",
      color: "bg-red-500"
    }
  ];

  const values = [
    {
      title: "સુલભતા",
      description: "અમે માનીએ છીએ કે શિક્ષણ દરેક વિદ્યાર્થી માટે મફત અને સુલભ હોવું જોઈએ",
      color: "bg-blue-50 text-blue-900"
    },
    {
      title: "ગુણવત્તા",
      description: "અમે અભ્યાસક્રમના ધોરણોને પૂરા કરતી ઉચ્ચ ગુણવત્તાવાળી શિક્ષણ સામગ્રી પ્રદાન કરવા માટે પ્રતિબદ્ધ છીએ",
      color: "bg-green-50 text-green-900"
    },
    {
      title: "નવાચાર",
      description: "આધુનિક તકનીકનો ઉપયોગ કરીને બહેતર શિક્ષણ અનુભવો બનાવવા માટે સતત નવાચાર કરીએ છીએ",
      color: "bg-purple-50 text-purple-900"
    },
    {
      title: "સમુદાય",
      description: "વિદ્યાર્થીઓ અને શિક્ષકો સહયોગ કરી શકે તેવા સહાયક શિક્ષણ સમુદાયને પ્રોત્સાહન આપીએ છીએ",
      color: "bg-orange-50 text-orange-900"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center text-white/90 hover:text-white transition-colors mb-6 sm:mb-8 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              હોમ પર પાછા જાઓ
            </Link>
            
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-full p-4 sm:p-6">
                <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              અમારા વિશે
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              શાળા શિક્ષક - ગુજરાતી માધ્યમના વિદ્યાર્થીઓ માટે આધુનિક શિક્ષણ પ્લેટફોર્મ
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                અમારું મિશન
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                શાળા શિક્ષક વિદ્યાર્થીઓ, શિક્ષકો અને માતા-પિતાને ગુણવત્તાયુક્ત શિક્ષણ સંસાધનો પ્રદાન કરવા માટે સમર્પિત છે. 
                અમે માનીએ છીએ કે શિક્ષણ દરેક વ્યક્તિ માટે સુલભ હોવું જોઈએ, ભલે તેમનું ભૌગોલિક સ્થાન અથવા આર્થિક પૃષ્ઠભૂમિ ગમે તે હોય.
              </p>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">અમારી દ્રષ્ટિ</h3>
                <p className="text-gray-700">
                  ગુજરાત અને ભારતમાં ગુજરાતી માધ્યમની શિક્ષણ વ્યવસ્થાને ડિજિટલ ક્રાંતિ દ્વારા આધુનિક બનાવવું અને 
                  દરેક વિદ્યાર્થીને ઉત્તમ શિક્ષણની તકો પ્રદાન કરવી.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 transform hover:scale-105 transition-transform duration-300">
                <BookOpen className="h-24 w-24 sm:h-32 sm:w-32 text-white mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              અમારી વિશેષતાઓ
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              શિક્ષણને વધુ અસરકારક અને આનંદદાયક બનાવવા માટેના અમારા મુખ્ય સિદ્ધાંતો
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer min-h-[220px] flex flex-col"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} text-white rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  {React.cloneElement(feature.icon, { className: "h-8 w-8" })}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex-shrink-0">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm flex-grow">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 sm:p-12">
            <div className="text-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                સ્થાપક: પંકજ કપાડિયા
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-6">
                શાળા શિક્ષકની સ્થાપના ગુણવત્તાયુક્ત શિક્ષણને દરેક વિદ્યાર્થી માટે સુલભ બનાવવાના દ્રષ્ટિકોણથી કરવામાં આવી છે. 
                અમારું પ્લેટફોર્મ તકનીકી નિપુણતા અને શિક્ષણ અનુભવને જોડીને એક આકર્ષક શિક્ષણ વાતાવરણ બનાવે છે 
                જે વિદ્યાર્થીઓની શૈક્ષણિક યાત્રામાં મદદ કરે છે.
              </p>
              <div className="flex justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 italic">
                "શિક્ષણ એ સૌથી શક્તિશાળી હથિયાર છે જેનો ઉપયોગ તમે વિશ્વને બદલવા માટે કરી શકો."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              અમારા મૂલ્યો
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              અમારા કામના આધારભૂત સિદ્ધાંતો જે અમને દરરોજ પ્રેરણા આપે છે
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div key={index} className={`${value.color} rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              અમારી શિક્ષણ યાત્રામાં જોડાઓ
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
              અમારા વ્યાપક શિક્ષણ સંસાધનોની શોધ શરૂ કરો અને હજારો વિદ્યાર્થીઓ સાથે તેમની શિક્ષણ યાત્રામાં જોડાઓ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/standards"
                className="inline-flex items-center justify-center bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 text-lg"
              >
                ધોરણો અન્વેષણ કરો
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-300 text-lg"
              >
                સંપર્ક કરો
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
