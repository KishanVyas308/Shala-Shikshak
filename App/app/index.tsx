import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { standardsAPI } from '../services/standards';
import Header from '../components/Header';
import StandardCard from '../components/StandardCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function Home() {
  const { data: standards = [], isLoading, error, refetch } = useQuery({
    queryKey: ['standards'],
    queryFn: standardsAPI.getAll,
  });


  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary-50">
        <Header title="શાળા શિક્ષક" subtitle="શૈક્ષણિક પ્લેટફોર્મ" />
        <LoadingState />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-secondary-50">
        <Header title="શાળા શિક્ષક" subtitle="શૈક્ષણિક પ્લેટફોર્મ" />
        <ErrorState onRetry={() => refetch()} />
      </View>
    );
  }

  const sortedStandards = [...standards].sort((a, b) => a.order - b.order);

  return (
    <View className="flex-1 bg-secondary-50">
      <Header 
        title="શાળા શિક્ષક" 
        subtitle="શૈક્ષણિક પ્લેટફોર્મ"
        rightAction={{
          icon: 'settings-outline',
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
    
        
        {/* Statistics Cards */}
        <View className="flex-row mx-4 my-6 gap-3">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-lg">
            <View className="items-center">
              <Text className="font-gujarati text-2xl font-bold text-primary-600">
                {sortedStandards.length}
              </Text>
              <Text className="font-gujarati text-secondary-600 text-sm">
                ધોરણો
              </Text>
            </View>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-lg">
            <View className="items-center">
              <Text className="font-gujarati text-2xl font-bold text-accent-600">
                {sortedStandards.reduce((acc, std) => acc + (std._count?.subjects || 0), 0)}
              </Text>
              <Text className="font-gujarati text-secondary-600 text-sm">
                વિષયો
              </Text>
            </View>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-lg">
            <View className="items-center">
              <Text className="font-gujarati text-2xl font-bold text-success-600">
              {sortedStandards.reduce((stdAcc, std) => 
                stdAcc + (std.subjects?.reduce((subAcc, subject) => 
                  subAcc + (subject.chapters?.length || 0), 0) || 0), 0)}
              </Text>
              <Text className="font-gujarati text-secondary-600 text-sm">
                પ્રકરણો
              </Text>
            </View>
          </View>
        </View>
        
        {/* Standards List Header */}
        <View className="mx-4 mb-4">
          <Text className="font-gujarati text-secondary-800 text-xl font-bold">
            ધોરણો પસંદ કરો
          </Text>
          <Text className="font-gujarati text-secondary-600 text-sm mt-1">
            તમારા અભ્યાસ માટે યોગ્ય ધોરણ પર ક્લિક કરો
          </Text>
        </View>
        
        {/* Standards List */}
        <View className="pb-6">
          {sortedStandards.map((standard) => (
            <StandardCard
              key={standard.id}
              id={standard.id}
              name={standard.name}
              description={standard.description}
              subjectCount={standard._count?.subjects || 0}
              order={standard.order}
              onPress={() => router.push(`/standard/${standard.id}`)}
            />
          ))}
        </View>
        
        {/* Footer */}
        <View className="mx-4 mb-6 p-4 bg-white rounded-xl">
          <Text className="font-gujarati text-center text-secondary-500 text-sm">
            શિક્ષણ એ જીવનની સૌથી મોટી સંપત્તિ છે
          </Text>
          <Text className="font-english text-center text-secondary-400 text-xs mt-1">
            Education is the greatest wealth of life
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
