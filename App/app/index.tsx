import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Modal, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { standardsAPI } from '../services/standards';
import { storageService } from '../services/storage';
import Header from '../components/Header';
import StandardCard, { AddStandardCard } from '../components/StandardCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function Home() {
  const [userStandardIds, setUserStandardIds] = useState<string[]>([]);
  const [isCheckingStandards, setIsCheckingStandards] = useState(true);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  const { data: standards = [], isLoading, error, refetch } = useQuery({
    queryKey: ['standards'],
    queryFn: standardsAPI.getAll,
  });

  // Check for user selected standards on component mount
  useEffect(() => {
    const checkUserStandards = async () => {
      try {
        const hasSelected = await storageService.hasSelectedStandards();
        if (!hasSelected) {
          // No standards selected, redirect to selection screen
          router.replace('./select-standards' as any);
          return;
        }

        // Get user selected standards
        const selectedIds = await storageService.getUserStandards();
        setUserStandardIds(selectedIds);
      } catch (error) {
        console.error('Error checking user standards:', error);
      } finally {
        setIsCheckingStandards(false);
      }
    };

    checkUserStandards();
  }, []);

  // Show loading while checking user standards
  if (isCheckingStandards) {
    return (
      <View className="flex-1 bg-secondary-50">
        <Header title="શાળા શિક્ષક" subtitle="શૈક્ષણિક પ્લેટફોર્મ" />
        <LoadingState />
      </View>
    );
  }


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

  // Filter standards to show only user-selected ones
  const userSelectedStandards = standards.filter(standard =>
    userStandardIds.includes(standard.id)
  );
  const sortedStandards = [...userSelectedStandards].sort((a, b) => a.order - b.order);

  const handleChangeStandards = () => {
    setIsSettingsModalVisible(false);
    router.push('./select-standards' as any);
  };

  return (
    <View className="flex-1 bg-secondary-50">
      <Header
        title="શાળા શિક્ષક"
        // subtitle="શૈક્ષણિક પ્લેટફોર્મ"
        rightAction={{
          icon: 'settings-outline',
          onPress: () => setIsSettingsModalVisible(true)
        }}
      />

      <ScrollView
        className="flex-1 b"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
        showsVerticalScrollIndicator={false}
      >


        {/* Statistics Cards */}
        {/* <View className="flex-row mx-4 my-6 gap-3">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-lg">
            <View className="items-center">
              <Text className="font-gujarati text-2xl font-bold text-primary-600">
                {sortedStandards.length.toString()}
              </Text>
              <Text className="font-gujarati text-secondary-600 text-sm">
                મારા ધોરણો
              </Text>
            </View>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-lg">
            <View className="items-center">
              <Text className="font-gujarati text-2xl font-bold text-accent-600">
                {sortedStandards.reduce((acc, std) => acc + (std._count?.subjects || 0), 0).toString()}
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
                    subAcc + (subject.chapters?.length || 0), 0) || 0), 0).toString()}
              </Text>
              <Text className="font-gujarati text-secondary-600 text-sm">
                પ્રકરણો
              </Text>
            </View>
          </View>
        </View> */}

        {/* Standards List Header */}
        <View className="mx-4 my-4">
          <Text className="font-gujarati text-secondary-800 text-xl font-bold">
            પસંદ કરેલા ધોરણો
          </Text>

        </View>

        {/* Standards List */}
        <View className="px-4 pb-6">
          <View className="flex-row flex-wrap justify-start">
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

            <AddStandardCard />

          </View>
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
                <Text className="font-gujarati text-lg font-bold text-secondary-800">
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
              <TouchableOpacity
                onPress={handleChangeStandards}
                className="flex-row items-center px-6 py-4 active:bg-gray-50"
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-4">
                  <Ionicons name="school-outline" size={20} color="#7C3AED" />
                </View>
                <View className="flex-1">
                  <Text className="font-gujarati text-base font-semibold text-secondary-800">
                    ધોરણ બદલો
                  </Text>
                  <Text className="font-gujarati text-sm text-secondary-600 mt-0.5">
                    તમારા ધોરણો પસંદ કરો અથવા બદલો
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
