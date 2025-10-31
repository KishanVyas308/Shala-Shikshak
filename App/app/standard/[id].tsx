import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { standardsAPI } from '../../services/standards';
import { AnalyticsService } from '../../services/analytics';
import { useFontSize } from '../../contexts/FontSizeContext';
import Header from '../../components/Header';
import SubjectCard from '../../components/SubjectCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { showInterstitialAd } from '../../utils/showInterstitialAd';

export default function StandardView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getFontSizeClasses, fontSize } = useFontSize();

  // Handle Initial Ads
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // e.g., show ad every 3rd navigation or based on random chance
      if (Math.random() < 0.20) showInterstitialAd();
    });

    return unsubscribe;
  }, [navigation]);

  // Track standard view
  useEffect(() => {
    if (id) {
      AnalyticsService.trackStandardView(id);
    }
  }, [id]);

  const { data: standard, isLoading, error, refetch } = useQuery({
    queryKey: ['standards', id],
    queryFn: () => standardsAPI.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View className="flex-1 bg-secondary-50">
          <Header
            title="વિષયો"
            subtitle="લોડ થઈ રહ્યું છે..."
            showBack
            onBackPress={() => router.back()}
          />
          <LoadingState message="વિષયો લોડ થઈ રહ્યા છે..." />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !standard) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
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
      </SafeAreaView>
    );
  }

  const sortedSubjects = standard.subjects ? [...standard.subjects].sort((a, b) => {
    const aDate = new Date(a.createdAt || 0);
    const bDate = new Date(b.createdAt || 0);
    return bDate.getTime() - aDate.getTime(); // Most recent first
  }) : [];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <View className="flex-1 bg-secondary-50">
        <Header
          title={standard.name}
          subtitle="વિષયો પસંદ કરો"
          showBack
          onBackPress={() => router.back()}
        // rightAction={{
        //   icon: 'bookmark-outline',
        //   onPress: () => {}
        // }}
        />

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
          }
          showsVerticalScrollIndicator={false}
        >

          {/* Subjects List */}
          <View className="px-4 pb-6 my-4">
            {sortedSubjects.length > 0 ? (
              <View className="flex-row flex-wrap justify-start">
                {sortedSubjects.map((subject, index) => (
                  <React.Fragment key={`${subject.id}-${fontSize}`}>
                    <SubjectCard
                      id={subject.id}
                      name={subject.name}
                      description={subject.description}
                      chapterCount={subject.chapters?.length || 0}
                      standardName={standard.name}
                      onPress={async () => {
                        await AnalyticsService.trackSubjectView(subject.id);


                        router.push(`/subject/${subject.id}`);

                      }}
                    />
                  </React.Fragment>
                ))}
              </View>
            ) : (
              <View className="mx-4 mt-8">
                <View className="bg-white rounded-2xl p-8 items-center">
                  <View className="bg-secondary-100 rounded-full p-4 mb-4">
                    <Ionicons name="library-outline" size={48} color="#64748b" />
                  </View>
                  <Text className={`font-gujarati text-secondary-700 font-semibold text-center mb-2 ${getFontSizeClasses().textLg}`}>
                    કોઈ વિષય ઉપલબ્ધ નથી
                  </Text>
                  <Text className={`font-gujarati text-secondary-500 text-center ${getFontSizeClasses().text}`}>
                    આ ધોરણ માટે હજુ સુધી કોઈ વિષય ઉમેરવામાં આવ્યો નથી
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
