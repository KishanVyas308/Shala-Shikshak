import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subjectsAPI } from '../services/subjects';
import { chaptersAPI } from '../services/chapters';
import { storageService } from '../services/storage';
import { AnalyticsService } from '../services/analytics';
import { useFontSize } from '../contexts/FontSizeContext';
import { BottomBannerAd, SmartBannerAd } from '../components/OptimizedBannerAd';
import { useInterstitialAd, useAdFrequency } from '../lib/adHooks';
import Header from '../components/Header';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ChapterCard from '@/components/ChapterCard';

export default function BookmarksPage() {
  const [activeTab, setActiveTab] = useState<'subjects' | 'chapters'>('subjects');
  const [bookmarkedSubjects, setBookmarkedSubjects] = useState<string[]>([]);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getFontSizeClasses, fontSize } = useFontSize();
  const { showInterstitialAd } = useInterstitialAd();
  const { shouldShowInterstitialAd, recordInterstitialShown } = useAdFrequency();

  // Load bookmarks and track page view
  useEffect(() => {
    loadBookmarks();
    AnalyticsService.trackBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      const [subjects, chapters] = await Promise.all([
        storageService.getBookmarkedSubjects(),
        storageService.getBookmarkedChapters()
      ]);
      setBookmarkedSubjects(subjects);
      setBookmarkedChapters(chapters);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subject details
  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['bookmarked-subjects', bookmarkedSubjects],
    queryFn: async () => {
      if (bookmarkedSubjects.length === 0) return [];
      const subjectPromises = bookmarkedSubjects.map(id => subjectsAPI.getById(id));
      const results = await Promise.allSettled(subjectPromises);
      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value);
    },
    enabled: bookmarkedSubjects.length > 0
  });

  // Fetch chapter details
  const { data: chapters = [], isLoading: isLoadingChapters } = useQuery({
    queryKey: ['bookmarked-chapters', bookmarkedChapters],
    queryFn: async () => {
      if (bookmarkedChapters.length === 0) return [];
      const chapterPromises = bookmarkedChapters.map(id => chaptersAPI.getById(id));
      const results = await Promise.allSettled(chapterPromises);
      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value);
    },
    enabled: bookmarkedChapters.length > 0
  });

  const handleRemoveSubjectBookmark = async (subjectId: string) => {
    try {
      await storageService.removeSubjectBookmark(subjectId);
      setBookmarkedSubjects(prev => prev.filter(id => id !== subjectId));
    } catch (error) {
      Alert.alert('ભૂલ', 'બુકમાર્ક દૂર કરવામાં સમસ્યા આવી');
    }
  };

  const handleRemoveChapterBookmark = async (chapterId: string) => {
    try {
      await storageService.removeChapterBookmark(chapterId);
      setBookmarkedChapters(prev => prev.filter(id => id !== chapterId));
    } catch (error) {
      Alert.alert('ભૂલ', 'બુકમાર્ક દૂર કરવામાં સમસ્યા આવી');
    }
  };

  useEffect(() => {
    const checkBookmarkStatus = async () => {
        console.log('Checking bookmark status for active tab:', activeTab);
        
      if (activeTab === 'subjects') {
        const subjects = await storageService.getBookmarkedSubjects();
        setBookmarkedSubjects(subjects);
      } else {
        const chapters = await storageService.getBookmarkedChapters();
        setBookmarkedChapters(chapters);
      }
    };
    checkBookmarkStatus();
  }, [activeTab]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View className="flex-1 bg-secondary-50">
          <Header 
            title="બુકમાર્ક્સ"
            subtitle="મારા પસંદીદા અભ્યાસ સામગ્રી"
            showBack
            onBackPress={() => router.back()}
          />
          <LoadingState />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <View className="flex-1 bg-secondary-50">
      <Header 
        title="બુકમાર્ક્સ"
        subtitle="મારા પસંદીદા અભ્યાસ સામગ્રી"
        showBack
        onBackPress={() => router.back()}
      />

      {/* Tab Selector */}
      <View className="mx-4 my-4">
        <View className="bg-white rounded-xl p-2 flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab('subjects')}
            className={`flex-1 py-3 rounded-lg ${activeTab === 'subjects' ? 'bg-primary-600' : 'bg-transparent'}`}
          >
            <Text className={`font-gujarati text-center font-medium ${getFontSizeClasses().text} ${
              activeTab === 'subjects' ? 'text-white' : 'text-gray-600'
            }`}>
              વિષયો ({bookmarkedSubjects.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab('chapters')}
            className={`flex-1 py-3 rounded-lg ${activeTab === 'chapters' ? 'bg-primary-600' : 'bg-transparent'}`}
          >
            <Text className={`font-gujarati text-center font-medium ${getFontSizeClasses().text} ${
              activeTab === 'chapters' ? 'text-white' : 'text-gray-600'
            }`}>
              પ્રકરણો ({bookmarkedChapters.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoadingSubjects || isLoadingChapters} onRefresh={loadBookmarks} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <View className="px-4">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <View key={subject.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                      className="flex-1 mr-3"
                      onPress={() => {
                        // Try to show interstitial ad (with 40% chance and timing rules)
                        if (shouldShowInterstitialAd()) {
                          const adShown = showInterstitialAd(() => {
                            recordInterstitialShown();
                            router.push(`/subject/${subject.id}`);
                          });
                          // If ad wasn't shown due to loading issues, navigate anyway
                          if (!adShown) {
                            router.push(`/subject/${subject.id}`);
                          }
                        } else {
                          router.push(`/subject/${subject.id}`);
                        }
                      }}
                    >
                      <Text className={`font-gujarati text-gray-900 font-bold mb-1 ${getFontSizeClasses().textLg}`}>
                        {subject.name}
                      </Text>
                      <Text className={`font-gujarati text-gray-600 ${getFontSizeClasses().text}`}>
                        {subject.standard?.name} • {subject.chapters?.length || 0} પ્રકરણો
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleRemoveSubjectBookmark(subject.id)}
                      className="bg-red-50 rounded-full p-2"
                    >
                      <Ionicons name="bookmark" size={20} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-white rounded-2xl p-8 items-center mt-8">
                <View className="bg-gray-100 rounded-full p-4 mb-4">
                  <Ionicons name="bookmark-outline" size={48} color="#6b7280" />
                </View>
                <Text className={`font-gujarati text-gray-900 font-bold text-center mb-2 ${getFontSizeClasses().textLg}`}>
                  કોઈ વિષય બુકમાર્ક નથી
                </Text>
                <Text className={`font-gujarati text-gray-600 text-center ${getFontSizeClasses().text}`}>
                  તમે હજુ સુધી કોઈ વિષય બુકમાર્ક કર્યો નથી
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Chapters Tab */}
        {activeTab === 'chapters' && (
          <View>
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <ChapterCard 
                  key={`${chapter.id}-${fontSize}`}
                  id={chapter.id}
                  name={chapter.name}
                  description={chapter.description}
                  hasVideo={!!chapter.videoUrl}
                  hasTextbook={!!chapter.textbookPdfUrl}
                  hasSolution={!!chapter.solutionPdfUrl}
                  videoUrl={chapter.videoUrl}
                  textbookPdfUrl={chapter.textbookPdfUrl}
                  solutionPdfUrl={chapter.solutionPdfUrl}
                  onPress={async () => {
                    await AnalyticsService.trackChapterView(chapter.id);
                    
                    // Try to show interstitial ad (with 40% chance and timing rules)
                    if (shouldShowInterstitialAd()) {
                      const adShown = showInterstitialAd(() => {
                        recordInterstitialShown();
                        router.push(`/chapter/${chapter.id}` as any);
                      });
                      // If ad wasn't shown due to loading issues, navigate anyway
                      if (!adShown) {
                        router.push(`/chapter/${chapter.id}` as any);
                      }
                    } else {
                      router.push(`/chapter/${chapter.id}` as any);
                    }
                  }}
                  handleRemoveChapterBookmark={() => handleRemoveChapterBookmark(chapter.id)}
                />
              ))
            ) : (
              <View className="bg-white rounded-2xl p-8 items-center mt-8">
                <View className="bg-gray-100 rounded-full p-4 mb-4">
                  <Ionicons name="bookmark-outline" size={48} color="#6b7280" />
                </View>
                <Text className={`font-gujarati text-gray-900 font-bold text-center mb-2 ${getFontSizeClasses().textLg}`}>
                  કોઈ પ્રકરણ બુકમાર્ક નથી
                </Text>
                <Text className={`font-gujarati text-gray-600 text-center ${getFontSizeClasses().text}`}>
                  તમે હજુ સુધી કોઈ પ્રકરણ બુકમાર્ક કર્યું નથી
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Mid-content Banner Ad */}
        <SmartBannerAd style={{ marginVertical: 15 }} />

        <View className="h-6" />
      </ScrollView>

      {/* Bottom Banner Ad */}
      <BottomBannerAd />
      </View>
    </SafeAreaView>
  );
}
