import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Bell,
  Search,
  User,
  BarChart3,
  MessageSquare
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'ડેશબોર્ડ', href: '/admin', icon: LayoutDashboard, current: location.pathname === '/admin' },
    { name: 'ધોરણો', href: '/admin/standards', icon: GraduationCap, current: location.pathname === '/admin/standards' },
    { name: 'વિષયો', href: '/admin/subjects', icon: BookOpen, current: location.pathname === '/admin/subjects' },
    { name: 'પ્રકરણો', href: '/admin/chapters', icon: FileText, current: location.pathname === '/admin/chapters' },
    { name: 'એનાલિટિક્સ', href: '/admin/analytics', icon: BarChart3, current: location.pathname === '/admin/analytics' },
    { name: 'વ્હોટ્સએપ', href: '/admin/whatsapp', icon: MessageSquare, current: location.pathname === '/admin/whatsapp' },
    { name: 'સેટિંગ્સ', href: '/admin/settings', icon: Settings, current: location.pathname === '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">શાળા શિક્ષક</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${item.current 
                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-4 pb-4">
          <div className="flex h-16 shrink-0 items-center border-b">
            <h1 className="text-xl font-bold text-gray-900">શાળા શિક્ષક</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`
                          flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-semibold leading-6 transition-colors
                          ${item.current 
                            ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-700'
                          }
                        `}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <button className="flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-red-50 hover:text-red-700 w-full transition-colors">
                  <LogOut className="h-5 w-5 shrink-0" />
                  લૉગ આઉટ
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 items-center justify-between">
            {/* Search */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="શોધો..."
                  className="block w-full rounded-lg border-0 bg-gray-50 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button className="p-2.5 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
              </button>

              {/* Profile */}
              <div className="flex items-center gap-x-2">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden text-sm font-semibold text-gray-900 lg:block">એડમિન</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
