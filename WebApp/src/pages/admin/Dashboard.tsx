import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, Video, FileText, Plus, TrendingUp, Calendar, Activity, BarChart3 } from 'lucide-react';
import { standardsAPI } from '../../services/standards';
import { AnalyticsService } from '../../services/analytics';

const AdminDashboard: React.FC = () => {
  const { data: standards = [] } = useQuery({
    queryKey: ['standards'],
    queryFn: standardsAPI.getAll,
  });

  const { data: analytics } = useQuery({
    queryKey: ['dashboard-analytics-stats'],
    queryFn: () => AnalyticsService.getSimpleStats(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const standardsArray = Array.isArray(standards) ? standards : [];
  
  const totalSubjects = standardsArray.reduce((acc, standard) => acc + (standard.subjects?.length || 0), 0);
  const totalChapters = standardsArray.reduce((acc, standard) => 
    acc + (standard.subjects?.reduce((subAcc, subject) => subAcc + (subject.chapters?.length || 0), 0) || 0), 0
  );
  const totalResources = standardsArray.reduce((acc, standard) => 
    acc + (standard.subjects?.reduce((subAcc, subject) => 
      subAcc + (subject.chapters?.reduce((chapterAcc, chapter) => 
        chapterAcc + (chapter._count?.resources || 0), 0) || 0), 0) || 0), 0
  );




  const stats = [
    {
      name: 'Standards',
      value: standardsArray.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      link: '/admin/standards',
      trend: '+12%'
    },
    {
      name: 'Subjects',
      value: totalSubjects,
      icon: BookOpen,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      link: '/admin/subjects',
      trend: '+8%'
    },
    {
      name: 'Chapters',
      value: totalChapters,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      link: '/admin/chapters',
      trend: '+15%'
    },
    {
      name: 'Resources',
      value: totalResources,
      icon: Video,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      link: '/admin/chapters',
      trend: '+23%'
    },
  ];

  const quickActions = [
    {
      name: 'Manage Standard',
      description: 'Create a new standard',
      icon: Users,
      link: '/admin/standards',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Manage Subject',
      description: 'Create a new subject',
      icon: BookOpen,
      link: '/admin/subjects',
      color: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      name: 'Manage Chapter',
      description: 'Create a new chapter',
      icon: FileText,
      link: '/admin/chapters',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      name: 'View Analytics',
      description: 'Check site analytics',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      name: 'WhatsApp Management',
      description: 'Manage WhatsApp group links',
      icon: Plus,
      link: '/admin/whatsapp',
      color: 'bg-green-600 hover:bg-green-700'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="mt-2 text-gray-600 text-base sm:text-lg">
                Welcome back! Here's what's happening with your platform.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Activity className="h-4 w-4" />
                <span>Last updated just now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 mb-8 sm:mb-10">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.link}
              className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center justify-center rounded-xl ${stat.bgColor} p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor}`} />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-xs text-emerald-600 font-medium">
                      <TrendingUp className="h-3 w-3" />
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-gray-600 mt-1">{stat.name}</p>
                </div>
                
                {/* Hover effect indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Analytics Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h2>
                <Link
                  to="/admin/analytics"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
              {analytics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Opens</p>
                      <p className="text-2xl font-bold text-blue-600">{analytics.totalOpens}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-600">App Opens</p>
                      <p className="text-2xl font-bold text-green-600">{analytics.appOpens}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Website Opens</p>
                      <p className="text-2xl font-bold text-purple-600">{analytics.webOpens}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-600 mb-3">Recent Activity</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last 24 Hours</span>
                        <span className="text-gray-900 font-medium">{analytics.last24Hours}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last 7 Days</span>
                        <span className="text-gray-900 font-medium">{analytics.last7Days}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last 30 Days</span>
                        <span className="text-gray-900 font-medium">{analytics.last30Days}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm">Analytics loading...</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Quick Actions</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Today</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.name}
                    to={action.link}
                    className={`group relative overflow-hidden rounded-xl text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95 ${action.color}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <action.icon className="h-6 w-6 text-purple-700" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">{action.name}</h3>
                          <p className="text-sm opacity-90 mt-1">{action.description}</p>
                        </div>
                        <div className="ml-4">
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                            <Plus className="h-4 w-4 text-purple-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Standards */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Standards</h2>
              <Link
                to="/admin/standards"
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            {standardsArray.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {standardsArray.slice(0, 4).map((standard, index) => (
                  <div 
                    key={standard.id} 
                    className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-sm"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">
                          {standard.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                          {standard.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {standard._count?.subjects || 0} subjects
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/admin/standards`}
                      className="text-indigo-600 hover:text-indigo-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No standards yet</h3>
                <p className="text-sm text-gray-500 mb-4">Create your first standard to get started.</p>
                <Link
                  to="/admin/standards"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Standard
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
