import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, MapPin, Send } from 'lucide-react';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create email subject and body
    const emailSubject = `Shala Shikshak Contact: ${formData.subject}`;
    const emailBody = `Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from Shala Shikshak Contact Form`;

    // Open Gmail with pre-filled data
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=100xTechs@gmail.com&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open Gmail in a new tab
    window.open(gmailUrl, '_blank');
    
    // Reset form after opening Gmail
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const contactMethods = [
    {
      icon: <Mail className="h-8 w-8" />,
      title: "ઇમેઇલ",
      description: "100xTechs@gmail.com",
      action: "અમને ઇમેઇલ મોકલો",
      link: "mailto:100xTechs@gmail.com",
      color: "bg-blue-500"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "વ્હોટ્સએપ",
      description: "અમારા શિક્ષણ સમુદાયમાં જોડાઓ",
      action: "અમારા એપ અને વેબસાઇટ દ્વારા ઉપલબ્ધ",
      link: "#",
      color: "bg-green-500"
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "વેબસાઇટ",
      description: "https://shalashikshak.in",
      action: "અમારી વેબસાઇટની મુલાકાત લો",
      link: "https://shalashikshak.in",
      color: "bg-purple-500"
    }
  ];

  const faqs = [
    {
      question: "હું અભ્યાસ સામગ્રી કેવી રીતે ઍક્સેસ કરી શકું?",
      answer: "તમે અમારી વેબસાઇટ અથવા મોબાઇલ એપ દ્વારા બધી અભ્યાસ સામગ્રી મફતમાં ઍક્સેસ કરી શકો છો. ફક્ત તમારું ધોરણ અને વિષય પસંદ કરો."
    },
    // {
    //   question: "શું સામગ્રી ઑફલાઇન ઉપલબ્ધ છે?",
    //   answer: "અમારું મોબાઇલ એપ તમને ઑફલાઇન જોવા માટે PDF ડાઉનલોડ કરવાની મંજૂરી આપે છે. જોકે, વિડિયો સામગ્રી માટે ઇન્ટરનેટ કનેક્શનની જરૂર છે."
    // },
    {
      question: "હું વ્હોટ્સએપ ગ્રુપમાં કેવી રીતે જોડાઈ શકું?",
      answer: "વ્હોટ્સએપ ગ્રુપ લિંક્સ અમારા એપ અને વેબસાઇટમાં ઉપલબ્ધ છે. કોઈપણ પૃષ્ઠ પર વ્હોટ્સએપ જોઇન બટન શોધો."
    },
    {
      question: "શું હું ચોક્કસ સામગ્રીની વિનંતી કરી શકું?",
      answer: "હા! કૃપા કરીને ઉપરના સંપર્ક ફોર્મનો ઉપયોગ કરીને 'સામગ્રી વિનંતી' વિષય સાથે તમને જોઈએ તે સામગ્રીનું વર્ણન કરો."
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
                <Mail className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              સંપર્ક કરો
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              અમારી સાથે સંપર્ક કરો - તમારા પ્રશ્નો અને સૂચનાઓ માટે અમે હંમેશા તૈયાર છીએ
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              અમારી સાથે જોડાઓ
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              તમારા પ્રશ્નો અને સહાય માટે અમારી પાસે વિવિધ માર્ગો છે
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${method.color} text-white rounded-xl mb-6 mx-auto`}>
                  {React.cloneElement(method.icon, { className: "h-8 w-8" })}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                {method.link !== "#" ? (
                  <a
                    href={method.link}
                    target={method.link.startsWith('http') ? '_blank' : undefined}
                    rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
                  >
                    {method.action} →
                  </a>
                ) : (
                  <p className="text-green-600 text-sm font-medium">{method.action}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                અમને સંદેશ મોકલો
              </h2>
              <p className="text-lg text-gray-600">
                તમારા પ્રશ્નો અથવા સૂચનાઓ સાથે અમારો સંપર્ક કરો
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    પૂરું નામ *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="તમારું પૂરું નામ"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    ઇમેઇલ સરનામું *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  વિષય *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  <option value="">વિષય પસંદ કરો</option>
                  <option value="technical-support">તકનીકી સહાય</option>
                  <option value="content-request">સામગ્રી વિનંતી</option>
                  <option value="bug-report">બગ રિપોર્ટ</option>
                  <option value="feature-request">નવી સુવિધા વિનંતી</option>
                  <option value="partnership">ભાગીદારી પૂછપરછ</option>
                  <option value="feedback">સામાન્ય પ્રતિસાદ</option>
                  <option value="other">અન્ય</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  સંદેશ *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical transition-colors"
                  placeholder="કૃપા કરીને તમારી પૂછપરછનું વિગતવાર વર્ણન કરો..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
              >
                <Send className="h-5 w-5" />
                <span>Gmail માં મોકલો</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              વારંવાર પૂછાતા પ્રશ્નો
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              સામાન્ય પ્રશ્નોના જવાબો અહીં મળશે
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default ContactUs;
