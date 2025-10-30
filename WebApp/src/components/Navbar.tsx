import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, Settings, Home, User, Menu, X, Info, Mail, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, admin, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">શાળા શિક્ષક</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>મુખ્ય પૃષ્ઠ</span>
            </Link>

            <Link
              to="/standards"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/standards') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>અભ્યાસ</span>
            </Link>

            <Link
              to="/about"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <Info className="h-4 w-4" />
              <span>અમારા વિશે</span>
            </Link>

            <Link
              to="/contact"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/contact') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>સંપર્ક</span>
            </Link>

            <Link
              to="/privacy"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/privacy') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Privacy Policy</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>એડમિન પેનલ</span>
                </Link>

                <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span>{admin?.name}</span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>લૉગઆઉટ</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>એડમિન લૉગિન</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <Link
                to="/"
                onClick={closeMenu}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>મુખ્ય પૃષ્ઠ</span>
              </Link>

              <Link
                to="/standards"
                onClick={closeMenu}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/standards') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span>અભ્યાસ</span>
              </Link>

              <Link
                to="/about"
                onClick={closeMenu}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/about') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <Info className="h-5 w-5" />
                <span>અમારા વિશે</span>
              </Link>

              <Link
                to="/contact"
                onClick={closeMenu}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/contact') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <Mail className="h-5 w-5" />
                <span>સંપર્ક</span>
              </Link>

              <Link
                to="/privacy"
                onClick={closeMenu}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/privacy') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <Shield className="h-5 w-5" />
                <span>Privacy Policy</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>એડમિન પેનલ</span>
                  </Link>

                  <div className="flex items-center space-x-2 px-3 py-2 text-base text-gray-700 border-t border-gray-200 mt-2 pt-2">
                    <User className="h-5 w-5" />
                    <span>{admin?.name}</span>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>લૉગઆઉટ</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors mt-2"
                >
                  <User className="h-5 w-5" />
                  <span>એડમિન લૉગિન</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
