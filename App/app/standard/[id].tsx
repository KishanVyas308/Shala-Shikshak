import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { standardsAPI } from '../../services/standards';
import Header from '../../components/Header';
import SubjectCard from '../../components/SubjectCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { LinearGradient } from 'expo-linear-gradient';

export default function StandardView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: standard, isLoading, error, refetch } = useQuery({
    queryKey: ['standards', id],
    queryFn: () => standardsAPI.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary-50">
        <Header 
          title="વિષયો"
          subtitle="લોડ થઈ રહ્યું છે..."
          showBack
          onBackPress={() => router.back()}
        />
        <LoadingState message="વિષયો લોડ થઈ રહ્યા છે..." />
      </View>
    );
  }

  if (error || !standard) {
    return (
      <View className="flex-1 bg-secondary-50">
        <Header 
          title="વિષયો"
          subtitle="ભૂલ"
          showBack
          onBackPress={() => router.back()}
        />
        <ErrorState 
          message="વિષયો લોડ કરવામાં સમસ્યા આવી છે"
          onRetry={() => refetch()} 
        />
      </View>
    );
  }

  const sortedSubjects = standard.subjects ? [...standard.subjects].sort((a, b) => {
    const aDate = new Date(a.createdAt || 0);
    const bDate = new Date(b.createdAt || 0);
    return bDate.getTime() - aDate.getTime(); // Most recent first
  }) : [];

  return (
    <View className="flex-1 bg-secondary-50">
      <Header 
        title={standard.name}
        subtitle="વિષયો પસંદ કરો"
        showBack
        onBackPress={() => router.back()}
        rightAction={{
          icon: 'information-circle-outline',
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
        
        {/* Quick Stats */}
        <View className="flex-row mx-4 my-6 gap-3">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="items-center">
              <Text className="font-gujarati text-2xl font-bold text-accent-600">
                {sortedSubjects.length}
              </Text>
              <Text className="font-gujarati text-secondary-600 text-sm">
                વિષયો
              </Text>
            </View>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="items-center">
              <Text className="font-gujarati text-2xl font-bold text-success-600">
                {sortedSubjects.reduce((acc, subj) => acc + (subj._count?.chapters || 0), 0)}
                 {sortedSubjects.reduce((acc, subj) => 
                  acc + (subj.chapters?.length || 0), 0) || 0}
              </Text>
              <Text className="font-gujarati text-secondary-600 text-sm">
                પ્રકરણો
              </Text>
            </View>
          </View>
        </View>
        
        {/* Subjects List Header */}
        <View className="mx-4 mb-4">
          <Text className="font-gujarati text-secondary-800 text-lg font-bold">
            વિષયો
          </Text>
          <Text className="font-gujarati text-secondary-600 text-sm mt-1">
            અભ્યાસ કરવા માટે વિષય પસંદ કરો
          </Text>
        </View>
        
        {/* Subjects List */}
        <View className="pb-6">
          {sortedSubjects.length > 0 ? (
            sortedSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                id={subject.id}
                name={subject.name}
                description={subject.description}
                chapterCount={subject.chapters?.length || 0}
                standardName={standard.name}
                onPress={() => router.push(`/subject/${subject.id}`)}
              />
            ))
          ) : (
            <View className="mx-4 mt-8">
              <View className="bg-white rounded-2xl p-8 items-center">
                <View className="bg-secondary-100 rounded-full p-4 mb-4">
                  <Ionicons name="library-outline" size={48} color="#64748b" />
                </View>
                <Text className="font-gujarati text-secondary-700 text-lg font-semibold text-center mb-2">
                  કોઈ વિષય ઉપલબ્ધ નથી
                </Text>
                <Text className="font-gujarati text-secondary-500 text-sm text-center">
                  આ ધોરણ માટે હજુ સુધી કોઈ વિષય ઉમેરવામાં આવ્યો નથી
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
