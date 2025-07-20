import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface StandardCardProps {
  id: string;
  name: string;
  description?: string;
  subjectCount: number;
  onPress: () => void;
  order: number;
}

export default function StandardCard({
  name,
  description,
  subjectCount,
  onPress,
  order
}: StandardCardProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const isMediumScreen = width >= 380 && width < 500;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mb-3 flex-1"
      style={{ minWidth: '30%', maxWidth: '33.33%' }}
    >
      <View className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mx-1">
        {/* Accent Bar */}
        <View className="h-1 bg-purple-600" />

        <View className={`${isSmallScreen ? 'p-3' : isMediumScreen ? 'p-4' : 'p-4'} relative flex min-h-[120px] `}>
          {/* Content */}
          <View className="flex flex-col space-y-2 flex-1 ">
            {/* Standard Name */}
            <Text className={`font-gujarati font-bold text-gray-900 ${isSmallScreen ? 'text-base' : 'text-lg'} leading-tight`} numberOfLines={2}>
              {name}
            </Text>

            <View className="flex-1 ">
              {/* Description */}
              {description && (
                <Text className={`font-gujarati text-gray-600 ${isSmallScreen ? 'text-xs' : 'text-sm'} leading-8`} numberOfLines={2}>
                  {description}
                </Text>
              )}
            </View>

            {/* Subject Count */}
            <View className="flex-row items-center mt-auto">
              <Ionicons name="book-outline" size={isSmallScreen ? 14 : 16} color="#7c3aed" />
              <Text className={`font-gujarati text-purple-700 font-medium ml-1 ${isSmallScreen ? 'text-xs' : 'text-sm'}`}>
                {subjectCount} વિષયો
              </Text>
            </View>
          </View>

          {/* Arrow Icon */}
          <View className="absolute top-3 right-3 bg-purple-600 rounded-full p-1.5 shadow-md">
            <Ionicons name="chevron-forward" size={isSmallScreen ? 10 : 12} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}


export function AddStandardCard() {
  return (
    <TouchableOpacity
      onPress={() => router.push("/select-standards")
      }
      activeOpacity={0.9}
      className="mb-3 flex-1"
      style={{ minWidth: '30%', maxWidth: '33.33%' }}
    >
      <View className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mx-1">
        <View className="h-1 bg-purple-600" />
        <View className="p-4 flex items-center justify-center min-h-[120px]">
          <Ionicons name="add-circle-outline" size={40} color="#7c3aed" />
          <Text className="font-gujarati text-purple-700 font-medium mt-2">ધોરણ ઉમેરો</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}