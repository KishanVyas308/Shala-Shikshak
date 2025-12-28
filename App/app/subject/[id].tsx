import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subjectsAPI } from '../../services/subjects';
import { storageService } from '../../services/storage';
import { AnalyticsService } from '../../services/analytics';
import { useFontSize } from '../../contexts/FontSizeContext';
import { chapterResourcesAPI } from '../../services/chapterResources';
import Header from '../../components/Header';
import ChapterCard from '../../components/ChapterCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { showInterstitialAd } from '../../utils/showInterstitialAd';
import type { Chapter } from '../../types';

export default function SubjectView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'pdf'>('all');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { getFontSizeClasses, fontSize } = useFontSize();

  const { data: subject, isLoading, error, refetch } = useQuery({
    queryKey: ['subjects', id],
    queryFn: () => subjectsAPI.getById(id!),
    enabled: !!id,
  });

  // Check bookmark status and track view
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (subject) {
        // Track subject view
        await AnalyticsService.trackSubjectView(subject.id);
        
        const bookmarked = await storageService.isSubjectBookmarked(subject.id);
        setIsBookmarked(bookmarked);
      }
    };
    checkBookmarkStatus();
  }, [subject]);

  const handleBookmarkPress = async () => {
    if (subject) {
      await storageService.toggleSubjectBookmark(subject.id);
      setIsBookmarked(!isBookmarked);
    }
  };

  // Handle Initial Ads
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // e.g., show ad every 3rd navigation or based on random chance
      if (Math.random() < 0.20) showInterstitialAd();
    });

    return unsubscribe;
  }, [navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View className="flex-1 bg-secondary-50">
          <Header 
            title="પ્રકરણો"
            subtitle="લોડ થઈ રહ્યું છે..."
            showBack
            onBackPress={() => router.back()}
          />
          <LoadingState message="પ્રકરણો લોડ થઈ રહ્યા છે..." />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !subject) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View className="flex-1 bg-secondary-50">
        <Header 
          title="પ્રકરણો"
          subtitle="ભૂલ"
          showBack
          onBackPress={() => router.back()}
        />
        <ErrorState 
          message="પ્રકરણો લોડ કરવામાં સમસ્યા આવી છે"
          onRetry={() => refetch()} 
        />
        </View>
      </SafeAreaView>
    );
  }

  // Filter chapters
  const filteredChapters = subject.chapters?.filter(chapter => {
    const matchesSearch = chapter.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'video' && chapter.videoUrl) ||
      (filterType === 'pdf' && (chapter.textbookPdfUrl || chapter.solutionPdfUrl));
    return matchesSearch && matchesFilter;
  }) || [];

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    // Sort by order field (ascending: 0, 1, 2, ...)
    return (a.order || 0) - (b.order || 0);
  });

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <View className="flex-1 bg-secondary-50">
      <Header 
        title={subject.name}
        subtitle={subject.standard?.name || 'પ્રકરણો'}
        showBack
        onBackPress={() => router.back()}
        rightAction={{
          icon: isBookmarked ? 'bookmark' : 'bookmark-outline',
          onPress: handleBookmarkPress
        }}
      />
      
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* Chapters List */}
        <View className="pb-6 my-4">
          {sortedChapters.length > 0 ? (
            <>
              {sortedChapters.map((chapter) => (
                <EnhancedChapterCard
                  key={`${chapter.id}-${fontSize}`}
                  chapter={chapter}
                />
              ))}
            </>
          ) : (
            <View className="mx-4 mt-8">
              <View className="bg-white rounded-2xl p-8 items-center">
                <View className="bg-secondary-100 rounded-full p-4 mb-4">
                  <Ionicons name="document-outline" size={48} color="#64748b" />
                </View>
                <Text className={`font-gujarati text-secondary-700 font-semibold text-center mb-2 ${getFontSizeClasses().textLg}`}>
                  કોઈ પ્રકરણ મળ્યું નથી
                </Text>
                <Text className={`font-gujarati text-secondary-500 text-center ${getFontSizeClasses().text}`}>
                  {searchTerm ? 'આ શોધ માટે કોઈ પ્રકરણ મળ્યું નથી' : 'આ વિષય માટે હજુ સુધી કોઈ પ્રકરણ ઉમેરવામાં આવ્યું નથી'}
                </Text>
              </View>
            </View>
          )}
        </View>

        
      </ScrollView>

      </View>
    </SafeAreaView>
  );
}

// Enhanced Chapter Card with Category Buttons
interface EnhancedChapterCardProps {
  chapter: Chapter;
}

const EnhancedChapterCard: React.FC<EnhancedChapterCardProps> = ({ chapter }) => {
  const { getFontSizeClasses } = useFontSize();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [resourceCounts, setResourceCounts] = useState<{
    svadhyay: number;
    svadhyay_pothi: number;
    other: number;
  } | null>(null);

  useEffect(() => {
    checkBookmarkStatus();
    fetchResourceCounts();
  }, [chapter.id]);

  const checkBookmarkStatus = async () => {
    try {
      const bookmarked = await storageService.isChapterBookmarked(chapter.id);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const fetchResourceCounts = async () => {
    try {
      const data = await chapterResourcesAPI.getByChapterGrouped(chapter.id);
      setResourceCounts(data.counts);
    } catch (error) {
      console.error('Error fetching resource counts:', error);
    }
  };

  const handleBookmarkPress = async () => {
    try {
      const newBookmarkStatus = await storageService.toggleChapterBookmark(chapter.id);
      setIsBookmarked(newBookmarkStatus);
    } catch (error) {
      Alert.alert('ભૂલ', 'બુકમાર્ક અપડેટ કરવામાં સમસ્યા આવી');
    }
  };

  const handleCategoryPress = async (categoryType: 'svadhyay' | 'svadhyay_pothi' | 'other') => {
    await AnalyticsService.trackChapterView(chapter.id);
    router.push({
      pathname: `/chapter/${chapter.id}` as any,
      params: { type: categoryType }
    });
  };

  const categories = [
    {
      key: 'svadhyay' as const,
      label: 'સ્વાધ્યાય',
      icon: 'book-outline' as const,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      count: resourceCounts?.svadhyay || 0,
    },
    {
      key: 'svadhyay_pothi' as const,
      label: 'સ્વાધ્યાય પોથી',
      icon: 'library-outline' as const,
      color: '#10B981',
      bgColor: '#ECFDF5',
      count: resourceCounts?.svadhyay_pothi || 0,
    },
    {
      key: 'other' as const,
      label: 'અન્ય',
      icon: 'folder-outline' as const,
      color: '#6B7280',
      bgColor: '#F9FAFB',
      count: resourceCounts?.other || 0,
    },
  ];

  return (
    <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mx-4 mb-3">
      {/* Bookmark indicator */}
      <TouchableOpacity
        onPress={handleBookmarkPress}
        className={`absolute top-3 right-3 z-10 rounded-full p-2 ${isBookmarked ? 'bg-primary-100' : 'bg-gray-100'}`}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={isBookmarked ? "bookmark" : "bookmark-outline"} 
          size={18} 
          color={isBookmarked ? "#16a34a" : "#6b7280"} 
        />
      </TouchableOpacity>

      {/* Left accent bar */}
      <View className="flex-row">
        <View className="w-1 bg-primary-500" />

        <View className="flex-1 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1 mr-3">
              {/* Chapter Name */}
              <Text className={`font-gujarati text-gray-900 font-bold mb-1 ${getFontSizeClasses().textLg}`} numberOfLines={2}>
                {chapter.name}
              </Text>

              {/* Description */}
              {chapter.description && (
                <Text className={`font-gujarati text-gray-600 mb-2 leading-4 ${getFontSizeClasses().text}`} numberOfLines={2}>
                  {chapter.description}
                </Text>
              )}
            </View>
          </View>

          {/* Category Buttons */}
          <View className="flex-row gap-2 flex-wrap">
            {/* Textbook Button */}
            <TouchableOpacity
              onPress={() => {
                // No action for now
              }}
              className="flex-row items-center px-3 py-2 rounded-lg border"
              style={{ 
                backgroundColor: '#FEF3C7',
                borderColor: '#F59E0B40'
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="book" size={14} color="#F59E0B" />
              <Text 
                className={`font-gujarati font-medium ml-1 ${getFontSizeClasses().text}`}
                style={{ color: '#F59E0B' }}
              >
                પુસ્તક
              </Text>
            </TouchableOpacity>

            {/* Resource Category Buttons */}
            {resourceCounts && categories.map((category) => {
              if (category.count === 0) return null;
              
              return (
                <TouchableOpacity
                  key={category.key}
                  onPress={() => handleCategoryPress(category.key)}
                  className="flex-row items-center px-3 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: category.bgColor,
                    borderColor: category.color + '40'
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={category.icon} size={14} color={category.color} />
                  <Text 
                    className={`font-gujarati font-medium ml-1 ${getFontSizeClasses().text}`}
                    style={{ color: category.color }}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Show loading or empty state if no resources */}
          {!resourceCounts && (
            <View className="flex-row items-center justify-center py-2">
              <Ionicons name="hourglass-outline" size={14} color="#9CA3AF" />
              <Text className={`font-gujarati text-gray-500 ml-1 ${getFontSizeClasses().text}`}>
                સંસાધનો લોડ થઈ રહ્યા છે...
              </Text>
            </View>
          )}

          {resourceCounts && (resourceCounts.svadhyay + resourceCounts.svadhyay_pothi + resourceCounts.other) === 0 && (
            <View className="flex-row items-center justify-center py-2 bg-gray-50 rounded-lg">
              <Ionicons name="information-circle-outline" size={14} color="#9CA3AF" />
              <Text className={`font-gujarati text-gray-500 ml-1 ${getFontSizeClasses().text}`}>
                કોઈ સંસાધનો ઉપલબ્ધ નથી
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
