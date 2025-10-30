import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Settings,
  Video,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { chapterResourcesAPI } from '../services/chapterResources';
import type { ChapterResource } from '../types';

const ChapterResourcesView: React.FC = () => {
  const { id: chapterId } = useParams<{ id: string }>();
  const [selectedType, setSelectedType] = useState<'svadhyay' | 'svadhyay_pothi' | 'other'>('svadhyay');

  const { data, isLoading, error } = useQuery({
    queryKey: ['chapter-resources-grouped', chapterId],
    queryFn: () => chapterResourcesAPI.getByChapterGrouped(chapterId!),
    enabled: !!chapterId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading chapter resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Resources</h2>
          <p className="text-gray-600">Failed to load chapter resources</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chapter Not Found</h2>
          <p className="text-gray-600">The requested chapter could not be found</p>
        </div>
      </div>
    );
  }

  const categories = [
    {
      key: 'svadhyay' as const,
      label: 'Svadhyay',
      icon: BookOpen,
      description: 'Self-study materials',
      color: 'blue',
      count: data?.counts?.svadhyay || 0,
    },
    {
      key: 'svadhyay_pothi' as const,
      label: 'Svadhyay Pothi',
      icon: Users,
      description: 'Study booklets and guides',
      color: 'green',
      count: data?.counts?.svadhyay_pothi || 0,
    },
    {
      key: 'other' as const,
      label: 'Other',
      icon: Settings,
      description: 'Additional resources',
      color: 'gray',
      count: data?.counts?.other || 0,
    },
  ];

  const currentResources = data?.resources[selectedType] || [];
  const selectedCategory = categories.find(cat => cat.key === selectedType);

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap = {
      blue: isSelected 
        ? 'bg-blue-100 border-blue-300 text-blue-800' 
        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: isSelected 
        ? 'bg-green-100 border-green-300 text-green-800' 
        : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      gray: isSelected 
        ? 'bg-gray-100 border-gray-300 text-gray-800' 
        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to={`/chapter/${chapterId}`}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Chapter
              </Link>
              <div className="text-sm text-gray-500">
                {data.chapter.subject.standard.name} • {data.chapter.subject.name}
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            {data.chapter.name} - Resources
          </h1>
          <p className="text-gray-600 mt-2">
            Browse through different types of learning resources
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedType === category.key;
            
            return (
              <button
                key={category.key}
                onClick={() => setSelectedType(category.key)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${getColorClasses(category.color, isSelected)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-8 h-8" />
                  <span className="text-2xl font-bold">{category.count}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{category.label}</h3>
                <p className="text-sm opacity-75">{category.description}</p>
              </button>
            );
          })}
        </div>

        {/* Resources Grid */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedCategory && <selectedCategory.icon className="w-6 h-6" />}
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCategory?.label} Resources
                </h2>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                  {currentResources.length} items
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {currentResources.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {selectedCategory && <selectedCategory.icon className="w-16 h-16 mx-auto" />}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {selectedCategory?.label.toLowerCase()} resources yet
                </h3>
                <p className="text-gray-600">
                  Resources for this category will appear here when they're added.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ResourceCardProps {
  resource: ChapterResource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const isVideo = resource.resourceType === 'video';
  const Icon = isVideo ? Video : FileText;

  const handleResourceClick = () => {
    if (resource.resourceType === 'video') {
      window.open(resource.url, '_blank');
    } else {
      // For PDFs, open in a new tab
      window.open(resource.url, '_blank');
    }
  };

  return (
    <div 
      onClick={handleResourceClick}
      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 hover:border-gray-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${isVideo ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400" />
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {resource.title}
      </h3>
      
      {resource.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {resource.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="capitalize">{resource.resourceType}</span>
        <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default ChapterResourcesView;
