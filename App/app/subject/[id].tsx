import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { subjectsAPI } from '../../services/subjects';
import Header from '../../components/Header';
import ChapterCard from '../../components/ChapterCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { LinearGradient } from 'expo-linear-gradient';

export default function SubjectView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'pdf'>('all');

  const { data: subject, isLoading, error, refetch } = useQuery({
    queryKey: ['subjects', id],
    queryFn: () => subjectsAPI.getById(id!),
    enabled: !!id,
  });

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

  const sortedChapters = [...filteredChapters].sort((a, b) => a.order - b.order);

  return (
    <View className="flex-1 bg-secondary-50">
      <Header 
        title={subject.name}
        subtitle={subject.standard?.name || 'પ્રકરણો'}
        showBack
        onBackPress={() => router.back()}
        rightAction={{
          icon: 'search-outline',
          onPress: () => {}
        }}
      />
      
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
        showsVerticalScrollIndicator={false}
      >
       
        
        {/* Search and Filter Section */}
        <View className="m-4">
          {/* Search Bar */}
          <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <View className="flex-row items-center">
              <Ionicons name="search" size={20} color="#64748b" />
              <TextInput
                className="flex-1 ml-3 font-gujarati text-secondary-700"
                placeholder="પ્રકરણ શોધો..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor="#94a3b8"
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                  <Ionicons name="close-circle" size={20} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Filter Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => setFilterType('all')}
              className={`flex-1 py-3 px-4 rounded-xl ${
                filterType === 'all' ? 'bg-primary-500' : 'bg-white'
              }`}
            >
              <Text className={`font-gujarati text-center font-medium ${
                filterType === 'all' ? 'text-white' : 'text-secondary-600'
              }`}>
                બધા
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setFilterType('video')}
              className={`flex-1 py-3 px-4 rounded-xl ${
                filterType === 'video' ? 'bg-danger-500' : 'bg-white'
              }`}
            >
              <Text className={`font-gujarati text-center font-medium ${
                filterType === 'video' ? 'text-white' : 'text-secondary-600'
              }`}>
                વિડિયો
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setFilterType('pdf')}
              className={`flex-1 py-3 px-4 rounded-xl ${
                filterType === 'pdf' ? 'bg-accent-500' : 'bg-white'
              }`}
            >
              <Text className={`font-gujarati text-center font-medium ${
                filterType === 'pdf' ? 'text-white' : 'text-secondary-600'
              }`}>
                PDF
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Statistics Cards */}
        <View className="flex-row mx-4 mb-6 gap-3">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="items-center">
              <Text className="font-gujarati text-2xl font-bold text-primary-600">
                {sortedChapters.length}
              </Text>
              <Text className="font-gujarati text-secondary-600 text-sm">
                પ્રકરણો
              </Text>
            </View>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="items-center">
              <Text className="font-gujarati text-2xl font-bold text-danger-600">
                {sortedChapters.filter(ch => ch.videoUrl).length}
              </Text>
              <Text className="font-gujarati text-secondary-600 text-sm">
                વિડિયો
              </Text>
            </View>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="items-center">
              <Text className="font-gujarati text-2xl font-bold text-accent-600">
                {sortedChapters.filter(ch => ch.textbookPdfUrl || ch.solutionPdfUrl).length}
              </Text>
              <Text className="font-gujarati text-secondary-600 text-sm">
                PDF
              </Text>
            </View>
          </View>
        </View>
        
        {/* Chapters List Header */}
        <View className="mx-4 mb-4">
          <Text className="font-gujarati text-secondary-800 text-lg font-bold">
            પ્રકરણો
          </Text>
          <Text className="font-gujarati text-secondary-600 text-sm mt-1">
            અભ્યાસ કરવા માટે પ્રકરણ પસંદ કરો
          </Text>
        </View>
        
        {/* Chapters List */}
        <View className="pb-6">
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
                order={chapter.order}
                onPress={() => router.push(`/chapter/${chapter.id}`)}
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
