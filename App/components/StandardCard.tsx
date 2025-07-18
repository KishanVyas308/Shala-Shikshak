import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
      className={`mx-3 mb-3 ${isSmallScreen ? 'mx-2 mb-2' : ''}`}
    >
      <View className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Accent Bar */}
        <View className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

        <View className={`${isSmallScreen ? 'p-4' : isMediumScreen ? 'p-5' : 'p-6'} relative`}>
          {/* Content */}
          <View className="flex flex-col space-y-3">
            {/* Standard Name */}
            <Text className={`font-bold text-gray-900 ${isSmallScreen ? 'text-lg' : 'text-xl'} leading-tight`}>{name}</Text>

            {/* Description */}
            {description && (
              <Text className={`text-gray-600 ${isSmallScreen ? 'text-sm' : 'text-base'} leading-5`}>{description}</Text>
            )}

            {/* Subject Count */}
            <View className="flex items-center space-x-2">
              <Ionicons name="book-outline" size={isSmallScreen ? 16 : 20} color="#7c3aed" />
              <Text className={`text-purple-700 font-medium ${isSmallScreen ? 'text-sm' : 'text-base'}`}>{subjectCount} વિષયો</Text>
            </View>
          </View>

          {/* Arrow Icon */}
          <View className="absolute top-3 right-3 bg-purple-600 rounded-full p-2 shadow-md">
            <Ionicons name="chevron-forward" size={isSmallScreen ? 18 : 22} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
