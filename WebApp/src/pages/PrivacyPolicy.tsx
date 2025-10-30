import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Cookie, BarChart3, Globe, Users, Lock } from 'lucide-react';


const PrivacyPolicy: React.FC = () => {
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
              Back to Home
            </Link>
            
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-full p-4 sm:p-6">
                <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Your privacy is important to us - we're committed to transparency and data protection
            </p>
            <p className="text-base sm:text-lg text-white/80 mb-4 max-w-2xl mx-auto px-4">
              Effective Date: July 20, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 mb-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-3 mr-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Commitment to Privacy</h2>
                <p className="text-gray-600">Your privacy is important to us</p>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              Shala Shikshak respects your privacy. This app and website are designed to provide educational content 
              (PDFs and YouTube videos) while maintaining your privacy and data security. We are committed to 
              transparency about our data practices.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl shadow-xl p-8 sm:p-12 mb-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Information We Collect</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-900 mb-3">What We DON'T Collect</h3>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-green-600" />
                    No personal information or user registration required
                  </li>
                  <li className="flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-green-600" />
                    No login credentials or account details
                  </li>
                  <li className="flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-green-600" />
                    No sensitive user data storage
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3">Anonymous Analytics Data</h3>
                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-blue-800 mb-2">
                      We collect anonymous usage statistics to improve our service:
                    </p>
                    <ul className="space-y-1 text-blue-800 text-sm">
                      <li>• Page views and popular content (anonymously)</li>
                      <li>• App usage patterns (no personal identification)</li>
                      <li>• Device type and platform (web/mobile)</li>
                      <li>• General geographic region (country/state level only)</li>
                    </ul>
                    <p className="text-blue-700 text-sm mt-2 italic">
                      This data cannot be traced back to individual users and is used solely for improving our educational platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cookies and Tracking */}
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 mb-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 rounded-full p-3 mr-4">
                <Cookie className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Cookies and Tracking</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-orange-900 mb-3">Essential Cookies</h3>
                <p className="text-orange-800">
                  We use essential cookies to ensure our website functions properly. These include:
                </p>
                <ul className="mt-2 space-y-1 text-orange-800 text-sm">
                  <li>• Session management for smooth navigation</li>
                  <li>• User preferences (like font size settings in our app)</li>
                  <li>• Basic functionality cookies</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Analytics Cookies</h3>
                <p className="text-gray-800">
                  We use anonymous analytics cookies to understand how users interact with our platform. 
                  This helps us improve content organization and user experience. No personal data is collected or stored.
                </p>
              </div>
            </div>
          </div>

          {/* Content and External Services */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl p-8 sm:p-12 mb-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Content and External Services</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">PDF Content</h3>
                <p className="text-gray-700">
                  All PDF files displayed in our app are:
                </p>
                <ul className="mt-2 space-y-1 text-gray-700 text-sm ml-4">
                  <li>• Sourced from public domains or used with appropriate rights</li>
                  <li>• Hosted securely on our servers</li>
                  <li>• Used solely for educational purposes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">YouTube Integration</h3>
                <p className="text-gray-700">
                  When you access YouTube videos through our platform:
                </p>
                <ul className="mt-2 space-y-1 text-gray-700 text-sm ml-4">
                  <li>• You are redirected to publicly available YouTube content</li>
                  <li>• YouTube's own privacy policy applies during video viewing</li>
                  <li>• We do not track your YouTube viewing activity</li>
                  <li>• All videos are used for educational purposes only</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">WhatsApp Groups</h3>
                <p className="text-gray-700">
                  Our platform provides links to educational WhatsApp groups:
                </p>
                <ul className="mt-2 space-y-1 text-gray-700 text-sm ml-4">
                  <li>• Joining groups is completely voluntary</li>
                  <li>• We do not have access to your WhatsApp data</li>
                  <li>• WhatsApp's privacy policy applies to group interactions</li>
                  <li>• Groups are moderated for educational content only</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 mb-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Security</h2>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <p className="text-green-800 text-lg">
                Since we collect minimal data, security risks are inherently low. However, we still maintain:
              </p>
              <ul className="mt-4 space-y-2 text-green-800">
                <li className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  Secure hosting infrastructure
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  Regular security updates and monitoring
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  Encrypted data transmission (HTTPS)
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  No external data sharing or selling
                </li>
              </ul>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl shadow-xl p-8 sm:p-12 mb-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 rounded-full p-3 mr-4">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Rights</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-indigo-900 mb-3">Privacy Control</h3>
                <ul className="space-y-2 text-indigo-800">
                  <li>• No account required - complete anonymity</li>
                  <li>• You can clear cookies anytime through your browser</li>
                  <li>• Opt-out of analytics by using browser privacy modes</li>
                  <li>• Uninstall the app anytime with no data retention</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Policy Changes and Contact */}
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 mb-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Changes to This Policy</h2>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, 
                operational, or regulatory reasons. When we make changes, we will update the "Effective Date" at the top of this policy.
              </p>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>Owner:</strong> Pankaj Kapadiya
                  </p>
                  <p className="text-gray-700">
                    <strong>Email:</strong> 100xTechs@gmail.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Website:</strong> https://shalashikshak.in
                  </p>
                </div>
                
                <p className="text-gray-600 text-sm mt-4">
                  If you have any questions or concerns about this Privacy Policy, feel free to contact us 
                  using the information above.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Privacy Summary</h3>
            <p className="text-lg sm:text-xl mb-8 opacity-90 leading-relaxed">
              We respect your privacy by collecting minimal data, using secure practices, 
              and being transparent about our operations.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/30 transition-all duration-300">
                <Lock className="h-10 w-10 mx-auto mb-3" />
                <p className="font-semibold">No Personal Data Collection</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/30 transition-all duration-300">
                <BarChart3 className="h-10 w-10 mx-auto mb-3" />
                <p className="font-semibold">Anonymous Analytics Only</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/30 transition-all duration-300">
                <Shield className="h-10 w-10 mx-auto mb-3" />
                <p className="font-semibold">Secure & Transparent</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
