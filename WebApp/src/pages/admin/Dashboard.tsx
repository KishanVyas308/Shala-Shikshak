import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, Video, FileText, BarChart3, Plus } from 'lucide-react';
import { standardsAPI } from '../../services/standards';

const AdminDashboard: React.FC = () => {
  const { data: standards = [] } = useQuery({
    queryKey: ['standards'],
    queryFn: standardsAPI.getAll,
  });

  const standardsArray = Array.isArray(standards) ? standards : [];
  
  const totalSubjects = standardsArray.reduce((acc, standard) => acc + (standard.subjects?.length || 0), 0);
  const totalChapters = standardsArray.reduce((acc, standard) => 
    acc + (standard.subjects?.reduce((subAcc, subject) => subAcc + (subject.chapters?.length || 0), 0) || 0), 0
  );
  const totalVideos = standardsArray.reduce((acc, standard) => 
    acc + (standard.subjects?.reduce((subAcc, subject) => 
      subAcc + (subject.chapters?.filter(chapter => chapter.videoUrl).length || 0), 0) || 0), 0
  );

  const stats = [
    {
      name: 'Total Standards',
      value: standardsArray.length,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/standards'
    },
    {
      name: 'Total Subjects',
      value: totalSubjects,
      icon: BookOpen,
      color: 'bg-green-500',
      link: '/admin/subjects'
    },
    {
      name: 'Total Chapters',
      value: totalChapters,
      icon: FileText,
      color: 'bg-purple-500',
      link: '/admin/chapters'
    },
    {
      name: 'Video Lectures',
      value: totalVideos,
      icon: Video,
      color: 'bg-red-500',
      link: '/admin/chapters'
    },
  ];

  const quickActions = [
    {
      name: 'Add Standard',
      description: 'Create a new standard',
      icon: Plus,
      link: '/admin/standards',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Add Subject',
      description: 'Create a new subject',
      icon: Plus,
      link: '/admin/subjects',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      name: 'Add Chapter',
      description: 'Create a new chapter',
      icon: Plus,
      link: '/admin/chapters',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            Manage your educational platform content
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.link}
              className="relative overflow-hidden rounded-lg bg-white p-3 sm:p-4 lg:p-6 shadow hover:shadow-md transition-shadow active:scale-95"
            >
              <div>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center rounded-md ${stat.color} p-2 sm:p-3`}>
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-2 sm:p-4">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
            <div className="space-y-3 sm:space-y-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.link}
                  className={`flex items-center p-3 sm:p-4 rounded-lg text-white transition-colors ${action.color} active:scale-95`}
                >
                  <action.icon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base">{action.name}</h3>
                    <p className="text-xs sm:text-sm opacity-90 truncate">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Standards */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Recent Standards</h2>
            {standardsArray.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                { standardsArray.slice(0, 5).map((standard) => (
                  <div key={standard.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{standard.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {standard._count?.subjects || 0} subjects
                      </p>
                    </div>
                    <Link
                      to={`/admin/standards`}
                      className="text-indigo-600 hover:text-indigo-500 text-xs sm:text-sm font-medium flex-shrink-0"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
                {standardsArray.length > 5 && (
                  <Link
                    to="/admin/standards"
                    className="block text-center text-indigo-600 hover:text-indigo-500 text-xs sm:text-sm font-medium"
                  >
                    View all standards
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <BookOpen className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base">No standards created yet.</p>
                <Link
                  to="/admin/standards"
                  className="mt-2 text-indigo-600 hover:text-indigo-500 text-xs sm:text-sm font-medium"
                >
                  Create your first standard
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
