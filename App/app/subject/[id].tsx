import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { subjectsAPI } from '../../services/subjects';
import { storageService } from '../../services/storage';
import Header from '../../components/Header';
import ChapterCard from '../../components/ChapterCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';

export default function SubjectView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'pdf'>('all');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: subject, isLoading, error, refetch } = useQuery({
    queryKey: ['subjects', id],
    queryFn: () => subjectsAPI.getById(id!),
    enabled: !!id,
  });

  // Check bookmark status
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (subject) {
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary-50">
        <Header 
          title="પ્રકરણો"
          subtitle="લોડ થઈ રહ્યું છે..."
          showBack
          onBackPress={() => router.back()}
        />
        <LoadingState message="પ્રકરણો લોડ થઈ રહ્યા છે..." />
      </View>
    );
  }

  if (error || !subject) {
    return (
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
    const aDate = new Date(a.createdAt || 0);
    const bDate = new Date(b.createdAt || 0);
    return bDate.getTime() - aDate.getTime(); // Most recent first
  });

  return (
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
            sortedChapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                id={chapter.id}
                name={chapter.name}
                description={chapter.description}
                hasVideo={!!chapter.videoUrl}
                hasTextbook={!!chapter.textbookPdfUrl}
                hasSolution={!!chapter.solutionPdfUrl}
                videoUrl={chapter.videoUrl}
                textbookPdfUrl={chapter.textbookPdfUrl}
                solutionPdfUrl={chapter.solutionPdfUrl}
                onPress={() => {}}
              />
            ))
          ) : (
            <View className="mx-4 mt-8">
              <View className="bg-white rounded-2xl p-8 items-center">
                <View className="bg-secondary-100 rounded-full p-4 mb-4">
                  <Ionicons name="document-outline" size={48} color="#64748b" />
                </View>
                <Text className="font-gujarati text-secondary-700 text-lg font-semibold text-center mb-2">
                  કોઈ પ્રકરણ મળ્યું નથી
                </Text>
                <Text className="font-gujarati text-secondary-500 text-sm text-center">
                  {searchTerm ? 'આ શોધ માટે કોઈ પ્રકરણ મળ્યું નથી' : 'આ વિષય માટે હજુ સુધી કોઈ પ્રકરણ ઉમેરવામાં આવ્યું નથી'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
