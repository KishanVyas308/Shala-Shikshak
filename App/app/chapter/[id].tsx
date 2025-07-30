import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, RefreshControl, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chapterResourcesAPI } from '../../services/chapterResources';
import { useFontSize } from '../../contexts/FontSizeContext';
import type { ChapterResource } from '../../types';
import Header from '../../components/Header';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 cards per row with margins

export default function ChapterView() {
  const { id: chapterId } = useLocalSearchParams<{ id: string }>();
  const [selectedType, setSelectedType] = useState<'svadhyay' | 'svadhyay_pothi' | 'other'>('svadhyay');
  const { getFontSizeClasses } = useFontSize();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chapter-resources-grouped', chapterId],
    queryFn: () => chapterResourcesAPI.getByChapterGrouped(chapterId!),
    enabled: !!chapterId,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <Header
          title="પ્રકરણ સંસાધનો"
          showBack
          onBackPress={() => router.back()}
        />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <Header
          title="પ્રકરણ સંસાધનો"
          showBack
          onBackPress={() => router.back()}
        />
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const categories = [
    {
      key: 'svadhyay' as const,
      label: 'સ્વાધ્યાય',
      icon: 'book-outline' as const,
      description: 'સ્વઅધ્યયન સામગ્રી',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      count: data?.counts?.svadhyay || 0,
    },
    {
      key: 'svadhyay_pothi' as const,
      label: 'સ્વાધ્યાય પોથી',
      icon: 'library-outline' as const,
      description: 'અભ્યાસ પુસ્તકો અને માર્ગદર્શિકા',
      color: '#10B981',
      bgColor: '#ECFDF5',
      count: data?.counts?.svadhyay_pothi || 0,
    },
    {
      key: 'other' as const,
      label: 'અન્ય',
      icon: 'folder-outline' as const,
      description: 'વધારાના સંસાધનો',
      color: '#6B7280',
      bgColor: '#F9FAFB',
      count: data?.counts?.other || 0,
    },
  ];

  const currentResources = data?.resources[selectedType] || [];
  const selectedCategory = categories.find(cat => cat.key === selectedType);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Header
        title={data.chapter.name}
        subtitle={`${data.chapter.subject?.standard?.name} • ${data.chapter.subject?.name}`}
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Chapter Info */}
        <View className="mx-4 mt-4 mb-6 p-4 bg-white rounded-xl shadow-sm">
          <Text className="font-gujarati text-lg font-bold text-gray-800 mb-2">
            {data.chapter.name}
          </Text>
          {data.chapter.description && (
            <Text className="font-gujarati text-sm text-gray-600 mb-3">
              {data.chapter.description}
            </Text>
          )}
          <View className="flex-row items-center">
            <View className="flex-row items-center mr-4">
              <Ionicons name="folder-outline" size={16} color="#6B7280" />
              <Text className="font-gujarati text-xs text-gray-500 ml-1">
                કુલ સંસાધનો: {data.counts.total}
              </Text>
            </View>
          </View>
        </View>
       
        {/* Category Selection */}
        <View className="mx-4 my-6">
          <Text className="font-gujarati text-lg font-bold text-gray-800 mb-4">
            સંસાધન પ્રકાર
          </Text>
          <View className="flex-row justify-between">
            {categories.map((category) => {
              const isSelected = selectedType === category.key;
              
              return (
                <TouchableOpacity
                  key={category.key}
                  onPress={() => setSelectedType(category.key)}
                  className={`flex-1 p-4 rounded-xl border-2 mx-1 ${
                    isSelected 
                      ? 'border-primary-300' 
                      : 'border-gray-200'
                  }`}
                  style={{
                    backgroundColor: isSelected ? category.bgColor : '#FFFFFF',
                  }}
                >
                  <View className="items-center">
                    <View 
                      className="w-12 h-12 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <Ionicons 
                        name={category.icon} 
                        size={24} 
                        color={category.color} 
                      />
                    </View>
                    <Text 
                      className="font-gujarati text-sm font-semibold text-center mb-1"
                      style={{ color: isSelected ? category.color : '#374151' }}
                    >
                      {category.label}
                    </Text>
                    <Text 
                      className="font-gujarati text-xs text-center mb-2"
                      style={{ color: isSelected ? category.color + 'CC' : '#6B7280' }}
                    >
                      {category.description}
                    </Text>
                    <View 
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: category.color + '15' }}
                    >
                      <Text 
                        className="font-gujarati text-xs font-bold"
                        style={{ color: category.color }}
                      >
                        {category.count}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Resources Grid */}
        <View className="mx-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons 
                name={selectedCategory?.icon || 'folder-outline'} 
                size={20} 
                color={selectedCategory?.color || '#6B7280'} 
              />
              <Text className="font-gujarati text-lg font-bold text-gray-800 ml-2">
                {selectedCategory?.label} સંસાધનો
              </Text>
            </View>
            <View 
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: selectedCategory?.color + '15' || '#F3F4F6' }}
            >
              <Text 
                className="font-gujarati text-xs font-bold"
                style={{ color: selectedCategory?.color || '#6B7280' }}
              >
                {currentResources.length} આઇટમ
              </Text>
            </View>
          </View>

          {currentResources.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: selectedCategory?.color + '15' || '#F3F4F6' }}
              >
                <Ionicons 
                  name={selectedCategory?.icon || 'folder-outline'} 
                  size={32} 
                  color={selectedCategory?.color || '#6B7280'} 
                />
              </View>
              <Text className="font-gujarati text-lg font-semibold text-gray-800 mb-2">
                કોઈ {selectedCategory?.label.toLowerCase()} સંસાધનો નથી
              </Text>
              <Text className="font-gujarati text-sm text-gray-600 text-center">
                આ કેટેગરી માટે સંસાધનો ઉમેરવામાં આવે ત્યારે તેઓ અહીં દેખાશે.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {currentResources.map((resource, index) => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  width={cardWidth}
                  categoryColor={selectedCategory?.color || '#6B7280'}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ResourceCardProps {
  resource: ChapterResource;
  width: number;
  categoryColor: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, width, categoryColor }) => {
  const isVideo = resource.resourceType === 'video';
  
  const handleResourcePress = async () => {
    try {
      if (resource.resourceType === 'video') {
        // For YouTube videos, always use our PDF viewer (which can handle YouTube via WebView)
        router.push({
          pathname: '/pdf-viewer',
          params: {
            url: resource.url,
            title: resource.title,
          },
        });
      } else {
        // For PDFs, use our PDF viewer
        router.push({
          pathname: '/pdf-viewer',
          params: {
            url: resource.url,
            title: resource.title,
          },
        });
      }
    } catch (error) {
      console.error('Error opening resource:', error);
      Alert.alert('ભૂલ', 'સંસાધન ખોલવામાં સમસ્યા આવી છે');
    }
  };

  return (
    <TouchableOpacity
      onPress={handleResourcePress}
      className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden"
      style={{ width }}
    >
      {/* Resource Type Header */}
      <View 
        className="px-3 py-2 flex-row items-center justify-between"
        style={{ backgroundColor: categoryColor + '10' }}
      >
        <View className="flex-row items-center flex-1">
          <Ionicons 
            name={isVideo ? 'play-circle-outline' : 'document-text-outline'} 
            size={16} 
            color={categoryColor} 
          />
          <Text 
            className="font-gujarati text-xs font-semibold ml-1 flex-1"
            style={{ color: categoryColor }}
            numberOfLines={1}
          >
            {isVideo ? 'વિડિયો' : 'PDF'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={categoryColor + 'AA'} />
      </View>

      {/* Content */}
      <View className="p-3">
        <Text className="font-gujarati text-sm font-bold text-gray-800 mb-2" numberOfLines={2}>
          {resource.title}
        </Text>
        
        {resource.description && (
          <Text className="font-gujarati text-xs text-gray-600 mb-3" numberOfLines={3}>
            {resource.description}
          </Text>
        )}
        
        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text className="font-gujarati text-xs text-gray-500 ml-1">
              {new Date(resource.createdAt).toLocaleDateString('gu-IN')}
            </Text>
          </View>
          {resource.fileName && (
            <View className="flex-row items-center">
              <Ionicons name="download-outline" size={12} color="#9CA3AF" />
              <Text className="font-gujarati text-xs text-gray-500 ml-1">
                ફાઇલ
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
