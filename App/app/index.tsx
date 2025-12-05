import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Modal, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { standardsAPI } from '../services/standards';
import { AnalyticsService } from '../services/analytics';
import { useFontSize } from '../contexts/FontSizeContext';
import Header from '../components/Header';
import StandardCard from '../components/StandardCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { FontSizeControls } from '../components/FontSizeControls';
import WhatsAppJoinCard, { fetchActiveLink } from '../components/WhatsAppJoinCard';
import MinimalLoadingBar from '../components/MinimalLoadingBar';

export default function Home() {
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const { getFontSizeClasses, fontSize } = useFontSize();


  const { data: standards = [], isLoading, error, refetch } = useQuery({
    queryKey: ['standards'],
    queryFn: standardsAPI.getAll,
  });

  // Initialize on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Track home page view
        await AnalyticsService.trackHome();

        // Initialize WhatsApp link fetch
        fetchActiveLink();
      } catch (error) {
        console.error('Error initializing home:', error);
      }
    };

    initialize();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View className="flex-1 bg-secondary-50">
          <Header title="શાળા શિક્ષક" subtitle="શૈક્ષણિક પ્લેટફોર્મ" />
          <LoadingState />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View className="flex-1 bg-secondary-50">
          <Header title="શાળા શિક્ષક" subtitle="શૈક્ષણિક પ્લેટફોર્મ" />
          <ErrorState onRetry={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  // Show all standards sorted by order
  const sortedStandards = [...standards].sort((a, b) => a.order - b.order);



  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <View className="flex-1 bg-secondary-50">
        <Header
          title="શાળા શિક્ષક"
          // subtitle="શૈક્ષણિક પ્લેટફોર્મ"
          rightAction={{
            icon: 'settings-outline',
            onPress: () => setIsSettingsModalVisible(true)
          }}
        />

        {/* Loading Bar - Shows when refreshing */}
        <MinimalLoadingBar isVisible={isLoading} />

        <ScrollView
          className="flex-1 b"
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
          }
          showsVerticalScrollIndicator={false}
        >

          {/* Standards List Header */}
          <View className="mx-6 my-4">
            <Text className={`font-gujarati text-secondary-800 font-bold ${getFontSizeClasses().subtitle}`}>
              તમામ ધોરણો
            </Text>
          </View>

          {/* Standards List */}
          <View className="px-4 pb-6">
            <View className="flex-row flex-wrap justify-start">
              {sortedStandards.map((standard) => (
                <StandardCard
                  key={`${standard.id}-${fontSize}`}
                  id={standard.id}
                  name={standard.name}
                  description={standard.description}
                  subjectCount={standard._count?.subjects || 0}
                  order={standard.order}
                  onPress={async () => {
                    await AnalyticsService.trackStandardView(standard.id);


                    router.push(`/standard/${standard.id}`);

                  }}
                />
              ))}
            </View>
          </View>



          {/* Quick Actions */}
          <View className="mx-4 mb-6">
            {/* Bookmarks */}
            <View className="mb-4 p-4 bg-white rounded-lg shadow-md overflow-hidden relative">
              <View className="w-1 bg-primary-600 absolute left-0 top-0 bottom-0 z-30" />
              <TouchableOpacity
                onPress={async () => {
                  await AnalyticsService.trackBookmarks();


                  router.push('/bookmarks');

                }}
                className="flex-row items-center justify-between"
              >
                {/* Decoratives */}
                <View className="absolute -right-12 opacity-10">
                  <View className="w-28 h-28 rounded-full border-2 border-primary-600" />
                </View>

                <View className="flex-1">
                  <Text className={`font-gujarati text-secondary-800 font-bold ${getFontSizeClasses().textLg}`}>
                    મારા બુકમાર્ક્સ
                  </Text>
                  <Text className={`font-gujarati text-secondary-600 mt-0.5 ${getFontSizeClasses().text}`}>
                    તમારા પસંદીદા વિષયો અને પ્રકરણો
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#16a34a" />
              </TouchableOpacity>
            </View>

            {/* Recent Chapters */}
            <View className="p-4 bg-white rounded-lg shadow-md overflow-hidden relative">
              <View className="w-1 bg-orange-600 absolute left-0 top-0 bottom-0 z-30" />
              <TouchableOpacity
                onPress={async () => {
                  // Navigate to recent chapters without ad (quick access)
                  router.push('/recent');
                }}
                className="flex-row items-center justify-between"
              >
                {/* Decoratives */}
                <View className="absolute -right-12 opacity-10">
                  <View className="w-28 h-28 rounded-full border-2 border-orange-600" />
                </View>

                <View className="flex-1">
                  <Text className={`font-gujarati text-secondary-800 font-bold ${getFontSizeClasses().textLg}`}>
                    તાજેતરના પ્રકરણો
                  </Text>
                  <Text className={`font-gujarati text-secondary-600 mt-0.5 ${getFontSizeClasses().text}`}>
                    છેલ્લા 5 જોયેલા પ્રકરણો
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ea580c" />
              </TouchableOpacity>
            </View>
          </View>

          {/* WhatsApp Join Card */}
          <WhatsAppJoinCard />

          {/* Footer */}
          <View className="mx-4 mb-6  p-4 bg-white rounded-xl">
            <Text className={`font-gujarati text-center text-secondary-500 ${getFontSizeClasses().text}`}>
              શિક્ષણ એ જીવનની સૌથી મોટી સંપત્તિ છે
            </Text>
            <Text className={`font-english text-center text-secondary-400 mt-1 ${getFontSizeClasses().text}`}>
              Education is the greatest wealth of life
            </Text>
          </View>

          <View className='flex'>

            <Text className='text-2xl text-secondary-50'>
              test
            </Text>
            <Text className='text-3xl text-secondary-50'>
              test
            </Text>
            <Text className='text-4xl text-secondary-50'>
              test
            </Text>
          </View>
        </ScrollView>

        {/* Settings Modal */}
        <Modal
          visible={isSettingsModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsSettingsModalVisible(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-center items-center px-4"
            activeOpacity={1}
            onPress={() => setIsSettingsModalVisible(false)}
          >
            <TouchableOpacity
              className="bg-white rounded-2xl w-full max-w-sm shadow-xl"
              activeOpacity={1}
              onPress={() => { }}
            >
              {/* Modal Header */}
              <View className="px-6 py-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                  <Text className={`font-gujarati font-bold text-secondary-800 ${getFontSizeClasses().textXl}`}>
                    સેટિંગ્સ
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsSettingsModalVisible(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                  >
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Modal Content */}
              <View className="py-2">
                {/* Font Size Controls */}
                <View className="px-6 py-4">
                  <Text className={`font-gujarati font-semibold text-secondary-800 mb-3 ${getFontSizeClasses().textLg}`}>
                    ફોન્ટ સાઈઝ સેટિંગ્સ
                  </Text>
                  <FontSizeControls />
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>


    </SafeAreaView>
  );
}
